import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";

export type ShortScene = {
  number: number;
  seconds: number;
  visual: string;
  narration?: string;
  dialogue?: string;
  subtitle?: string;
};
export type LerryShortProps = { workingTitle: string; scenes: ShortScene[] };

const palette = [
  ["#16213e", "#0f3460", "#f9a826"],
  ["#202040", "#543864", "#ff6363"],
  ["#142850", "#27496d", "#00a8cc"],
  ["#2d4059", "#ea5455", "#f07b3f"],
  ["#283149", "#404b69", "#f73859"]
];

const CartoonCharacter: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 8) * 9;
  const mouth = Math.abs(Math.sin(frame / 3)) * 9 + 3;
  return (
    <svg viewBox="0 0 420 500" width="72%" style={{ overflow: "visible", transform: `translateY(${bob}px)` }}>
      <ellipse cx="210" cy="466" rx="125" ry="22" fill="#000" opacity=".2" />
      <path d="M95 440 Q85 310 150 290 L270 290 Q335 310 325 440Z" fill={accent} stroke="#17172b" strokeWidth="12" />
      <path d="M135 180 Q130 55 210 55 Q300 55 290 190 L275 285 Q210 330 145 280Z" fill="#ffd7b5" stroke="#17172b" strokeWidth="12" />
      <path d="M128 166 Q105 35 218 36 Q315 44 294 170 Q275 111 225 106 Q180 154 128 166Z" fill="#24243a" />
      <ellipse cx="174" cy="190" rx="13" ry="18" fill="#17172b" />
      <ellipse cx="246" cy="190" rx="13" ry="18" fill="#17172b" />
      <path d={`M184 240 Q210 ${250 + mouth} 236 240`} fill="none" stroke="#9b3d4a" strokeWidth="9" strokeLinecap="round" />
      <circle cx="146" cy="225" r="15" fill="#f59a9a" opacity=".6" />
      <circle cx="273" cy="225" r="15" fill="#f59a9a" opacity=".6" />
    </svg>
  );
};

const SceneCard: React.FC<{ scene: ShortScene; index: number; title: string }> = ({ scene, index, title }) => {
  const frame = useCurrentFrame();
  const colors = palette[index % palette.length];
  const opacity = interpolate(frame, [0, 12, Math.max(13, scene.seconds * 30 - 12), scene.seconds * 30], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, scene.seconds * 30], [0.94, 1.04], { extrapolateRight: "clamp" });
  const caption = scene.subtitle || scene.dialogue || scene.narration || "";
  return (
    <AbsoluteFill style={{ background: `linear-gradient(155deg,${colors[0]},${colors[1]})`, opacity, overflow: "hidden", color: "white" }}>
      <div style={{ position: "absolute", top: 82, left: 64, right: 64, fontSize: 34, fontWeight: 800, letterSpacing: 3, opacity: .8 }}>LERRY ANIMASI</div>
      <div style={{ position: "absolute", top: 160, left: 70, right: 70, fontSize: 52, lineHeight: 1.1, fontWeight: 900, textAlign: "center" }}>{title}</div>
      <div style={{ position: "absolute", top: 440, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${scale})` }}>
        <CartoonCharacter accent={colors[2]} />
      </div>
      <div style={{ position: "absolute", bottom: 250, left: 72, right: 72, padding: "30px 28px", borderRadius: 28, background: "rgba(7,12,27,.84)", border: "3px solid rgba(255,255,255,.2)", fontSize: 46, fontWeight: 800, lineHeight: 1.2, textAlign: "center" }}>{caption}</div>
      <div style={{ position: "absolute", bottom: 112, left: 72, right: 72, display: "flex", justifyContent: "space-between", fontSize: 26, opacity: .75 }}>
        <span>SHORTS • 9:16</span><span>{index + 1}</span>
      </div>
    </AbsoluteFill>
  );
};

export const LerryShort: React.FC<LerryShortProps> = ({ workingTitle, scenes }) => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#10152b", fontFamily: "Arial, sans-serif" }}>
      {scenes.map((scene, index) => {
        const from = cursor;
        const duration = Math.max(1, Math.round(scene.seconds * 30));
        cursor += duration;
        return <Sequence key={scene.number || index} from={from} durationInFrames={duration}>
          <SceneCard scene={scene} index={index} title={workingTitle} />
        </Sequence>;
      })}
    </AbsoluteFill>
  );
};
