import React from "react";
import { AbsoluteFill } from "remotion";
import { CharacterRig, type CharacterAction } from "../CharacterRig";
export type { CharacterAction } from "../CharacterRig";

export type SceneMotionProps = {
  action?: CharacterAction;
  accent?: string;
  background?: string;
  caption?: string;
};

/** Visual showcase wrapper for the same rig used by the production Shorts renderer. */
export const SceneMotion: React.FC<SceneMotionProps> = ({
  action = "idle",
  accent = "#ffb347",
  background = "#dff3ff",
  caption = "Uji gerak karakter",
}) => (
  <AbsoluteFill style={{ background, overflow: "hidden", fontFamily: "Arial, sans-serif" }}>
    <div style={{ position: "absolute", top: 64, left: 54, right: 54, textAlign: "center", fontSize: 46, fontWeight: 800, color: "#20334a" }}>
      {caption}
    </div>
    <div style={{ position: "absolute", width: "78%", height: "72%", left: "11%", top: "18%" }}>
      <CharacterRig action={action} accent={accent} travelAcross />
    </div>
    <div style={{ position: "absolute", bottom: 64, left: 54, right: 54, textAlign: "center", color: "#20334a", fontSize: 28, fontWeight: 700 }}>
      ACTION: {action.toUpperCase()}
    </div>
  </AbsoluteFill>
);
