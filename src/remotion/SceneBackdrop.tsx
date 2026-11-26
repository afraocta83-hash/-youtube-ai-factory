import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

type SceneBackdropProps = { description: string; index: number };

/** Deterministic, no-cost scene art: category-specific locations plus story props. */
export const SceneBackdrop: React.FC<SceneBackdropProps> = ({ description, index }) => {
  const frame = useCurrentFrame();
  const text = description.toLowerCase();
  const kind =
    /perpustakaan|perpustakaan|rak buku|buku|ruang baca/.test(text) ? "library" :
    /peti|kotak|harta|foto|album|kunci/.test(text) ? "treasure" :
    /taman|pohon|hutan|kebun|bunga|rumput|sungai|pantai|gunung/.test(text) ? "nature" :
    /rumah|kamar|loteng|dapur|ruang|sekolah|kantor|gedung/.test(text) ? "room" :
    /jalan|kota|mobil|kendaraan|pasar|toko/.test(text) ? "city" : "dream";
  const drift = interpolate(frame % 240, [0, 239], [-10, 10]);
  const palettes = [
    ["#b8e0d2", "#f1faee", "#39795b"],
    ["#bde0fe", "#ffc8dd", "#6d597a"],
    ["#caffbf", "#fdffb6", "#588157"],
    ["#cde7f0", "#f7d6bf", "#52796f"],
    ["#f6bd60", "#f7ede2", "#8d5524"],
  ];
  const colors = palettes[index % palettes.length];
  return (
    <svg viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id={`scene-bg-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors[0]} /><stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill={`url(#scene-bg-${index})`} />
      <circle cx={kind === "city" ? 860 : 180} cy="300" r="100" fill="#fff4c2" opacity=".8" />
      {kind === "nature" && <>
        <path d="M0 1120 Q240 940 480 1110 T1080 1060 V1920 H0Z" fill={colors[2]} opacity=".5" />
        {[140,340,760,930].map((x,i)=><g key={i} transform={`translate(${x+drift*(i%2?1:-1)} 0)`}><path d="M0 1050 V1430" stroke="#795548" strokeWidth="42"/><circle cx="0" cy="1000" r={120+(i%2)*25} fill={i%2?"#4f9d69":"#72b77b"}/></g>)}
        <path d="M0 1630 Q280 1510 520 1660 T1080 1580 V1920 H0Z" fill="#e9c46a" opacity=".55" />
      </>}
      {kind === "room" && <>
        <path d="M100 500 H980 V1460 H100Z" fill="#fff8ed" opacity=".62" stroke="#fff" strokeWidth="18"/>
        <path d="M140 560 H480 V920 H140Z" fill="#8ecae6" opacity=".8" stroke="#fff" strokeWidth="24"/>
        <path d="M0 1480 H1080 V1920 H0Z" fill="#b08968" opacity=".45"/>
        <path d="M600 1080 H900 V1490 H600Z" fill="#9c6644" opacity=".7"/>
      </>}
      {kind === "library" && <>
        <path d="M0 1480 H1080 V1920 H0Z" fill="#9c6644" opacity=".45"/>
        {[90,370,650,900].map((x,i)=><g key={i}><rect x={x} y="520" width="190" height="900" rx="14" fill="#7f5539" stroke="#fff1d6" strokeWidth="18"/>{[0,1,2,3,4].map((n)=><g key={n}><rect x={x+18} y={570+n*150} width="65" height="105" rx="8" fill={["#e76f51","#457b9d","#e9c46a","#6a994e","#9d4edd"][(i+n)%5]}/><rect x={x+95} y={570+n*150} width="75" height="105" rx="8" fill={["#457b9d","#e9c46a","#6a994e","#9d4edd","#e76f51"][(i+n)%5]}/></g>)}</g>)}
        <rect x="390" y="1260" width="300" height="150" rx="24" fill="#c08a5b" stroke="#70452b" strokeWidth="16"/>
      </>}
      {kind === "treasure" && <>
        <path d="M0 1480 H1080 V1920 H0Z" fill="#b08968" opacity=".45"/>
        <ellipse cx="540" cy="1450" rx="280" ry="70" fill="#70452b" opacity=".25"/>
        <rect x="350" y="1050" width="380" height="300" rx="36" fill="#9c6644" stroke="#633b24" strokeWidth="24"/>
        <path d="M350 1130 Q540 870 730 1130" fill="#c08a5b" stroke="#633b24" strokeWidth="24"/>
        <rect x="500" y="1120" width="80" height="110" rx="16" fill="#f4d35e" stroke="#8d6e00" strokeWidth="12"/>
        <rect x="455" y="1180" width="170" height="120" rx="10" fill="#f8edcf" stroke="#70452b" strokeWidth="12"/>
        <circle cx="540" cy="1230" r="32" fill="#d4a373"/>
      </>}
      {kind === "city" && <>
        {[70,250,460,680,880].map((x,i)=><g key={i}><rect x={x} y={790-i%2*160} width="150" height={760+i%2*160} rx="16" fill={i%2?"#6c7a89":"#8d99ae"} opacity=".72"/>{Array.from({length:5},(_,j)=><rect key={j} x={x+25} y={850+j*115-i%2*160} width="30" height="48" fill="#fff3b0" opacity=".8"/>)}</g>)}
        <path d="M0 1540 H1080 V1920 H0Z" fill="#495867" opacity=".65"/>
      </>}
      {kind === "dream" && <>
        <circle cx="260" cy="900" r="260" fill="#fff" opacity=".2"/><circle cx="850" cy="1200" r="360" fill="#fff" opacity=".18"/>
        <path d="M0 1450 Q260 1180 520 1450 T1080 1380 V1920 H0Z" fill={colors[2]} opacity=".35"/>
        {Array.from({length:18},(_,i)=><circle key={i} cx={(i*173+70)%1080} cy={(i*293+180)%1350} r={5+(i%4)*3} fill="#fff" opacity=".7"/>)}
      </>}
    </svg>
  );
};
