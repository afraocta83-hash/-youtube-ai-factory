import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

type SceneBackdropProps = { description: string; index: number };

/** Lightweight deterministic vector scenery. It adds scene context without paid image APIs. */
export const SceneBackdrop: React.FC<SceneBackdropProps> = ({ description, index }) => {
  const frame = useCurrentFrame();
  const text = description.toLowerCase();
  const kind = /taman|pohon|hutan|kebun|bunga|rumput|sungai|pantai|gunung/.test(text)
    ? "nature"
    : /rumah|kamar|loteng|dapur|ruang|sekolah|kantor|gedung/.test(text)
      ? "room"
      : /jalan|kota|mobil|kendaraan|pasar|toko/.test(text)
        ? "city"
        : "dream";
  const drift = interpolate(frame % 180, [0, 179], [-8, 8]);
  const palettes = [
    ["#a8e6cf", "#dcedc1", "#4b8f67"],
    ["#bde0fe", "#ffc8dd", "#6d597a"],
    ["#caffbf", "#fdffb6", "#588157"],
    ["#cde7f0", "#f7d6bf", "#52796f"],
  ];
  const colors = palettes[index % palettes.length];
  return (
    <svg viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id={`scene-bg-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill={`url(#scene-bg-${index})`} />
      <circle cx={kind === "city" ? 860 : 180} cy="300" r="100" fill="#fff4c2" opacity=".8" />
      {kind === "nature" && <>
        <path d="M0 1120 Q240 940 480 1110 T1080 1060 V1920 H0Z" fill={colors[2]} opacity=".5" />
        <path d="M0 1370 Q280 1200 560 1390 T1080 1320 V1920 H0Z" fill="#39795b" opacity=".55" />
        {[140,340,760,930].map((x,i)=><g key={i} transform={`translate(${x+drift*(i%2?1:-1)} 0)`}><path d="M0 1050 V1430" stroke="#795548" strokeWidth="42"/><circle cx="0" cy="1000" r={120+(i%2)*25} fill={i%2?"#4f9d69":"#72b77b"}/><circle cx="-55" cy="940" r="54" fill="#a8d5a2"/></g>)}
        <path d="M0 1630 Q280 1510 520 1660 T1080 1580 V1920 H0Z" fill="#e9c46a" opacity=".55" />
      </>}
      {kind === "room" && <>
        <path d="M100 500 H980 V1460 H100Z" fill="#fff8ed" opacity=".62" stroke="#fff" strokeWidth="18"/>
        <path d="M140 560 H480 V920 H140Z" fill="#8ecae6" opacity=".8" stroke="#fff" strokeWidth="24"/>
        <path d="M0 1480 H1080 V1920 H0Z" fill="#b08968" opacity=".45"/>
        <path d="M600 1080 H900 V1490 H600Z" fill="#9c6644" opacity=".7"/>
      </>}
      {kind === "city" && <>
        {[70,250,460,680,880].map((x,i)=><g key={i}><rect x={x} y={790-i%2*160} width="150" height={760+i%2*160} rx="16" fill={i%2?"#6c7a89":"#8d99ae"} opacity=".72"/>{Array.from({length:5},(_,j)=><rect key={j} x={x+25} y={850+j*115-i%2*160} width="30" height="48" fill="#fff3b0" opacity=".8"/>)}</g>)}
        <path d="M0 1540 H1080 V1920 H0Z" fill="#495867" opacity=".65"/>
      </>}
      {kind === "dream" && <>
        <circle cx="260" cy="900" r="260" fill="#fff" opacity=".2"/>
        <circle cx="850" cy="1200" r="360" fill="#fff" opacity=".18"/>
        <path d="M0 1450 Q260 1180 520 1450 T1080 1380 V1920 H0Z" fill={colors[2]} opacity=".35"/>
        {Array.from({length:18},(_,i)=><circle key={i} cx={(i*173+70)%1080} cy={(i*293+180)%1350} r={5+(i%4)*3} fill="#fff" opacity=".7"/>)}
      </>}
    </svg>
  );
};
