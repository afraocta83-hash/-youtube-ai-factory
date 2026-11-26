import { NextResponse } from "next/server";
import { isOwnerRequest } from "../../../lib/owner-auth";

export const runtime = "nodejs";
export const maxDuration = 15;
const OWNER=process.env.GITHUB_REPOSITORY_OWNER||"afraocta83-hash";
const REPO=process.env.GITHUB_REPOSITORY_NAME||"-youtube-ai-factory";
const WORKFLOW=process.env.GITHUB_RENDER_WORKFLOW||"render-short.yml";
const BRANCH=process.env.GITHUB_RENDER_BRANCH||"experiment/openmontage-video-engine";

export async function POST(request:Request){
  if(!isOwnerRequest(request)) return NextResponse.json({error:"Login owner diperlukan sebelum mengirim render."},{status:401});
  const token=process.env.GITHUB_ACTIONS_TOKEN;
  if(!token) return NextResponse.json({error:"GITHUB_ACTIONS_TOKEN belum dipasang sebagai Secret server-side di Vercel Preview."},{status:503});
  try{
    const body=await request.json(),p=body?.production;
    if(!p||typeof p!=="object"||typeof p.ownerStory!=="string"||p.ownerStory!==p.script||!Array.isArray(p.scenes)||p.scenes.length<4||p.scenes.length>6)
      return NextResponse.json({error:"Paket produksi tidak valid."},{status:400});
    const story=p.ownerStory;
    if(story.trim().length<80) return NextResponse.json({error:"Cerita hasil AI terlalu pendek."},{status:400});
    let total=0;
    for(const [i,s] of p.scenes.entries()){
      const seconds=Number(s?.seconds);
      if(!Number.isInteger(seconds)||seconds<2||seconds>20) return NextResponse.json({error:`Durasi adegan ${i+1} tidak valid.`},{status:400});
      total+=seconds;
      if(typeof s?.imagePrompt!=="string"||s.imagePrompt.trim().length<25) return NextResponse.json({error:`Prompt visual adegan ${i+1} belum valid.`},{status:400});
      if(!String(s?.narration||s?.dialogue||"").trim()) return NextResponse.json({error:`Narasi/dialog adegan ${i+1} kosong.`},{status:400});
    }
    if(total<15||total>60) return NextResponse.json({error:"Durasi video harus 15-60 detik."},{status:400});
    const productionJson=JSON.stringify(p);
    if(Buffer.byteLength(productionJson,"utf8")>60000) return NextResponse.json({error:"Paket produksi melebihi batas 60 KB GitHub Actions."},{status:413});
    const response=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,{
      method:"POST",headers:{Authorization:`Bearer ${token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json"},
      body:JSON.stringify({ref:BRANCH,inputs:{production_json:productionJson}}),signal:AbortSignal.timeout(12000)
    });
    if(!response.ok){const detail=await response.text();return NextResponse.json({error:`GitHub menolak job render (${response.status}). Periksa izin token dan nama workflow. ${detail.slice(0,400)}`},{status:response.status===404?502:response.status});}
    return NextResponse.json({ok:true,branch:BRANCH,workflow:WORKFLOW,message:"Render berhasil dikirim setelah persetujuan owner."});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Tidak dapat memulai render."},{status:500});}
}
