import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Audio, staticFile } from "remotion";
import { CharacterRig, type CharacterAction } from "./CharacterRig";
import { SceneBackdrop } from "./SceneBackdrop";

export type ShortScene = {
  number: number;
  seconds: number;
  visual: string;
  imagePrompt?: string;
  narration?: string;
  dialogue?: string;
  subtitle?: string;
  action?: CharacterAction;
  voiceFile?: string;
  voiceDurationSeconds?: number;
};
export type LerryShortProps = { workingTitle: string; scenes: ShortScene[]; voiceFile?: string };

const palette = [
  ["#16213e", "#0f3460", "#f9a826"], ["#202040", "#543864", "#ff6363"],
  ["#142850", "#27496d", "#00a8cc"], ["#2d4059", "#ea5455", "#f07b3f"],
  ["#283149", "#404b69", "#f73859"]
];

const SceneCard: React.FC<{ scene: ShortScene; index: number; title: string }> = ({ scene, index, title }) => {
  const frame = useCurrentFrame();
  const colors = palette[index % palette.length];
  const scale = interpolate(frame, [0, scene.seconds * 30], [0.94, 1.04], { extrapolateRight: "clamp" });
  // Scene-level subtitle stays visible for its matching narration segment.
  // Do not simulate word timing without word-level timestamps from the TTS engine.
  const syncedCaption = (scene.subtitle || scene.dialogue || scene.narration || "").trim();
  return (
    <AbsoluteFill style={{ background: colors[0], overflow: "hidden", color: "white" }}>
      <SceneBackdrop description={[scene.visual, scene.imagePrompt].filter(Boolean).join(" " ) || "Adegan cerita"} index={index} />
      <div style={{ position: "absolute", top: 82, left: 64, right: 64, fontSize: 34, fontWeight: 800, letterSpacing: 3, opacity: .8 }}>LERRY ANIMASI</div>
      <div style={{ position: "absolute", top: 160, left: 70, right: 70, fontSize: 52, lineHeight: 1.1, fontWeight: 900, textAlign: "center" }}>{title}</div>
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, height: 900, display: "flex", justifyContent: "center", transform: `scale(${scale})` }}>
        <div style={{ width: "78%", height: "100%" }}><CharacterRig action={scene.action || "idle"} accent={colors[2]} travelAcross /></div>
      </div>
      <div style={{ position: "absolute", bottom: 250, left: 72, right: 72, minHeight: 120, padding: "30px 28px", borderRadius: 28, background: "rgba(7,12,27,.84)", border: "3px solid rgba(255,255,255,.2)", fontSize: 46, fontWeight: 800, lineHeight: 1.2, textAlign: "center" }}>{syncedCaption}</div>
      <div style={{ position: "absolute", bottom: 112, left: 72, right: 72, display: "flex", justifyContent: "space-between", fontSize: 26, opacity: .75 }}><span>SHORTS • 9:16</span><span>{index + 1}</span></div>
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
          {scene.voiceFile ? <Audio src={staticFile(scene.voiceFile)} volume={1} /> : null}
          <SceneCard scene={scene} index={index} title={workingTitle} />
        </Sequence>;
      })}
    </AbsoluteFill>
  );
};
