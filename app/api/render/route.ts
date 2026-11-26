import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;
const OWNER=process.env.GITHUB_REPOSITORY_OWNER||"afraocta83-hash";
const REPO=process.env.GITHUB_REPOSITORY_NAME||"-youtube-ai-factory";
const WORKFLOW=process.env.GITHUB_RENDER_WORKFLOW||"render-short.yml";
const BRANCH=process.env.GITHUB_RENDER_BRANCH||"experiment/openmontage-video-engine";

const recentDispatches = new Map<string, number>();

export async function GET(request:Request){
  const token=process.env.GITHUB_ACTIONS_TOKEN;
  if(!token) return NextResponse.json({error:"Token GitHub Actions belum tersedia di server."},{status:503});
  const since=Number(new URL(request.url).searchParams.get("since")||0);
  if(!Number.isFinite(since)||since<=0) return NextResponse.json({error:"Parameter waktu render tidak valid."},{status:400});
  const headers={Authorization:`Bearer ${token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"};
  try{
    const runsResponse=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/runs?branch=${encodeURIComponent(BRANCH)}&event=workflow_dispatch&per_page=10`,{headers,cache:"no-store",signal:AbortSignal.timeout(10000)});
    if(!runsResponse.ok) return NextResponse.json({error:`Tidak dapat membaca status render GitHub (${runsResponse.status}).`},{status:502});
    const runs=await runsResponse.json();
    const run=(runs.workflow_runs||[]).find((item:any)=>new Date(item.created_at).getTime()>=since-60000);
    if(!run) return NextResponse.json({state:"queued",message:"Menunggu GitHub Actions memulai render."});
    const result:any={state:run.status==="completed"?(run.conclusion==="success"?"success":"failed"):"running",status:run.status,conclusion:run.conclusion,runUrl:run.html_url,runId:run.id};
    if(run.status==="completed"&&run.conclusion==="success"){
      const artifactsResponse=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/runs/${run.id}/artifacts`,{headers,cache:"no-store",signal:AbortSignal.timeout(10000)});
      if(artifactsResponse.ok){
        const payload=await artifactsResponse.json();
        const artifact=(payload.artifacts||[]).find((item:any)=>item.name==="lerry-animasi-short"&&!item.expired);
        if(artifact){
          const download=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/artifacts/${artifact.id}/zip`,{headers,redirect:"manual",signal:AbortSignal.timeout(10000)});
          const url=download.headers.get("location");
          if(url) result.downloadUrl=url;
        }
      }
    }
    return NextResponse.json(result);
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Gagal membaca status render."},{status:502});}
}

export async function POST(request:Request){
  const origin = request.headers.get("origin");
  if (origin) {
    try { if (new URL(origin).host !== new URL(request.url).host) return NextResponse.json({error:"Origin tidak diizinkan."},{status:403}); }
    catch { return NextResponse.json({error:"Origin tidak valid."},{status:403}); }
  }
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  for (const [key, stamp] of recentDispatches) if (now - stamp > 10 * 60 * 1000) recentDispatches.delete(key);
  const last = recentDispatches.get(ip);
  if (last && now - last < 60 * 1000) return NextResponse.json({error:"Tunggu 1 menit sebelum mengirim render berikutnya."},{status:429});
  const token=process.env.GITHUB_ACTIONS_TOKEN;
  if(!token) return NextResponse.json({error:"GITHUB_ACTIONS_TOKEN belum dipasang sebagai environment variable rahasia server-side pada hosting Preview."},{status:503});
  try{
    const body=await request.json(),p=body?.production;
    if(!p||typeof p!=="object"||typeof p.ownerStory!=="string"||p.ownerStory!==p.script||!Array.isArray(p.scenes)||p.scenes.length<4||p.scenes.length>6)
      return NextResponse.json({error:"Paket produksi tidak valid."},{status:400});
    const story=p.ownerStory;
    if(story.trim().length<80) return NextResponse.json({error:"Cerita hasil AI terlalu pendek."},{status:400});
    let total=0;
    for(const [i,s] of p.scenes.entries()){
      const seconds=Number(s?.seconds);
      if(!Number.isInteger(seconds)||seconds<4||seconds>12) return NextResponse.json({error:`Durasi adegan ${i+1} tidak valid.`},{status:400});
      total+=seconds;
      if(typeof s?.imagePrompt!=="string"||s.imagePrompt.trim().length<25) return NextResponse.json({error:`Prompt visual adegan ${i+1} belum valid.`},{status:400});
      if(!String(s?.narration||s?.dialogue||"").trim()) return NextResponse.json({error:`Narasi/dialog adegan ${i+1} kosong.`},{status:400});
    }
    if(total<20||total>60) return NextResponse.json({error:"Durasi video harus 20-60 detik."},{status:400});
    const productionJson=JSON.stringify(p);
    if(Buffer.byteLength(productionJson,"utf8")>60000) return NextResponse.json({error:"Paket produksi melebihi batas 60 KB GitHub Actions."},{status:413});
    const response=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,{
      method:"POST",headers:{Authorization:`Bearer ${token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json"},
      body:JSON.stringify({ref:BRANCH,inputs:{production_json:productionJson}}),signal:AbortSignal.timeout(12000)
    });
    if(!response.ok){
      const detail=await response.text();
      const accepted=response.headers.get("x-accepted-github-permissions");
      const requestId=response.headers.get("x-github-request-id");
      if(response.status===403){
        return NextResponse.json({error:"GitHub menolak token (403). Untuk Fine-grained PAT, aktifkan Repository permissions > Actions: Read and write dan pastikan akses repo -youtube-ai-factory diberikan. Simpan token baru sebagai GITHUB_ACTIONS_TOKEN pada environment Preview untuk branch experiment/openmontage-video-engine, lalu redeploy Preview. "+(accepted?"Izin yang diminta GitHub: "+accepted+". ":"")+(requestId?"Request ID: "+requestId+". ":"")+detail.slice(0,250)},{status:403});
      }
      return NextResponse.json({error:`GitHub menolak job render (${response.status}). Periksa akses repo, branch, dan workflow. ${detail.slice(0,400)}`},{status:response.status===404?502:response.status});
    }
    recentDispatches.set(ip, now);
    return NextResponse.json({ok:true,branch:BRANCH,workflow:WORKFLOW,message:"Render berhasil dikirim setelah persetujuan pengguna."});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Tidak dapat memulai render."},{status:500});}
}
