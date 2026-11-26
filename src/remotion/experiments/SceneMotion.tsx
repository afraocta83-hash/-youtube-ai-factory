import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

export type CharacterAction = "idle" | "walk" | "run" | "surprised" | "point";

export type SceneMotionProps = {
  action?: CharacterAction;
  accent?: string;
  background?: string;
  caption?: string;
};

/**
 * Isolated OpenMontage-inspired rig experiment.
 * Frame-driven transforms keep rendering deterministic in Remotion.
 * This is a reusable character-motion proof of concept, not yet wired
 * into the production Short composition.
 */
export const SceneMotion: React.FC<SceneMotionProps> = ({
  action = "idle",
  accent = "#ffb347",
  background = "#dff3ff",
  caption = "Uji gerak karakter",
}) => {
  const frame = useCurrentFrame();
  const cycle = frame % 90;
  const bob = Math.sin(frame / (action === "run" ? 2.8 : 7)) * (action === "idle" ? 3 : 7);
  const travel = action === "walk"
    ? interpolate(cycle, [0, 89], [-34, 34], { easing: Easing.inOut(Easing.sin) })
    : action === "run"
      ? interpolate(cycle, [0, 89], [-78, 78], { easing: Easing.inOut(Easing.sin) })
      : 0;
  const lean = action === "run" ? 12 : action === "point" ? -4 : 0;
  const armAngle = action === "point" ? -48 : action === "run" ? Math.sin(frame / 3) * 32 : action === "walk" ? Math.sin(frame / 7) * 24 : 0;
  const mouthHeight = action === "surprised" ? 22 : 7;
  const eyeScale = action === "surprised" ? 1.35 : 1;

  return (
    <AbsoluteFill style={{ background, overflow: "hidden", fontFamily: "Arial, sans-serif" }}>
      <div style={{ position: "absolute", top: 64, left: 54, right: 54, textAlign: "center", fontSize: 46, fontWeight: 800, color: "#20334a" }}>
        {caption}
      </div>
      <svg viewBox="0 0 600 760" style={{ position: "absolute", width: "78%", height: "72%", left: "11%", top: "18%" }}>
        <ellipse cx="300" cy="680" rx="112" ry="20" fill="#1b2938" opacity=".14" />
        <g transform={`translate(${travel} ${bob}) rotate(${lean} 300 420)`}>
          <path d="M220 420 Q300 390 380 420 L400 610 Q300 650 200 610Z" fill={accent} stroke="#27364a" strokeWidth="12" />
          <path d="M220 585 L205 660 Q202 680 224 682 L270 682 L282 620 M320 620 L330 660 Q334 682 356 682 L394 682 Q412 678 400 656 L380 585" fill="#27364a" stroke="#27364a" strokeWidth="12" strokeLinecap="round" />
          <path d="M215 220 Q205 95 300 88 Q395 95 385 220 L370 390 Q300 430 230 390Z" fill="#ffd8b5" stroke="#27364a" strokeWidth="12" />
          <path d="M210 220 Q188 90 300 70 Q412 88 390 220 Q365 165 310 160 Q265 205 210 220Z" fill="#27364a" />
          <g transform={`translate(0 0) scale(1 ${eyeScale})`}>
            <ellipse cx="268" cy="250" rx="12" ry="17" fill="#27364a" />
            <ellipse cx="334" cy="250" rx="12" ry="17" fill="#27364a" />
          </g>
          <ellipse cx="301" cy="322" rx="10" ry={mouthHeight} fill="#a84d58" />
          <path d="M222 445 Q160 470 150 540" fill="none" stroke="#ffd8b5" strokeWidth="30" strokeLinecap="round" />
          <path d="M378 445 Q440 470 450 540" fill="none" stroke="#ffd8b5" strokeWidth="30" strokeLinecap="round" transform={`rotate(${armAngle} 378 445)`} />
        </g>
      </svg>
      <div style={{ position: "absolute", bottom: 64, left: 54, right: 54, textAlign: "center", color: "#20334a", fontSize: 28, fontWeight: 700 }}>
        ACTION: {action.toUpperCase()} • REMOTION FRAME {frame}
      </div>
    </AbsoluteFill>
  );
};
