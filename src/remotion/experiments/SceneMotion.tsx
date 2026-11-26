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
 * Isolated, deterministic character rig experiment.
 * Limbs are articulated around shoulder/hip pivots; all motion is frame-driven.
 */
export const SceneMotion: React.FC<SceneMotionProps> = ({
  action = "idle",
  accent = "#ffb347",
  background = "#dff3ff",
  caption = "Uji gerak karakter",
}) => {
  const frame = useCurrentFrame();
  const cycle = frame % 90;
  const moving = action === "walk" || action === "run";
  const speed = action === "run" ? 2.8 : 7;
  const stride = action === "run" ? 38 : 24;
  const gait = moving ? Math.sin(frame / speed) : 0;
  const bob = Math.sin(frame / (action === "run" ? 2.8 : 7)) * (action === "idle" ? 3 : moving ? 9 : 5);
  const travel = action === "walk"
    ? interpolate(cycle, [0, 89], [-42, 42], { easing: Easing.inOut(Easing.sin) })
    : action === "run"
      ? interpolate(cycle, [0, 89], [-86, 86], { easing: Easing.inOut(Easing.sin) })
      : 0;
  const lean = action === "run" ? 10 : action === "point" ? -3 : 0;
  const leftLeg = moving ? gait * stride : 0;
  const rightLeg = moving ? -gait * stride : 0;
  const leftArm = action === "point" ? 8 : moving ? -gait * (action === "run" ? 48 : 30) : Math.sin(frame / 18) * 3;
  const rightArm = action === "point" ? -62 : moving ? gait * (action === "run" ? 48 : 30) : Math.sin(frame / 18 + 1) * 3;
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
          <g>
            <path d="M220 420 Q300 390 380 420 L400 610 Q300 650 200 610Z" fill={accent} stroke="#27364a" strokeWidth="12" />
            <path d="M220 445 Q160 470 150 540" fill="none" stroke="#ffd8b5" strokeWidth="30" strokeLinecap="round" transform={`rotate(${leftArm} 220 445)`} />
            <path d="M378 445 Q440 470 450 540" fill="none" stroke="#ffd8b5" strokeWidth="30" strokeLinecap="round" transform={`rotate(${rightArm} 378 445)`} />
          </g>
          <path d="M220 585 L205 660 Q202 680 224 682 L270 682 L282 620" fill="#27364a" stroke="#27364a" strokeWidth="12" strokeLinecap="round" transform={`rotate(${leftLeg} 245 590)`} />
          <path d="M320 620 L330 660 Q334 682 356 682 L394 682 Q412 678 400 656 L380 585" fill="#27364a" stroke="#27364a" strokeWidth="12" strokeLinecap="round" transform={`rotate(${rightLeg} 355 590)`} />
          <path d="M220 220 Q205 95 300 88 Q395 95 385 220 L370 390 Q300 430 230 390Z" fill="#ffd8b5" stroke="#27364a" strokeWidth="12" />
          <path d="M210 220 Q188 90 300 70 Q412 88 390 220 Q365 165 310 160 Q265 205 210 220Z" fill="#27364a" />
          <g transform={`translate(0 0) scale(1 ${eyeScale})`}>
            <ellipse cx="268" cy="250" rx="12" ry="17" fill="#27364a" />
            <ellipse cx="334" cy="250" rx="12" ry="17" fill="#27364a" />
          </g>
          <ellipse cx="301" cy="322" rx="10" ry={mouthHeight} fill="#a84d58" />
        </g>
      </svg>
      <div style={{ position: "absolute", bottom: 64, left: 54, right: 54, textAlign: "center", color: "#20334a", fontSize: 28, fontWeight: 700 }}>
        ACTION: {action.toUpperCase()} • REMOTION FRAME {frame}
      </div>
    </AbsoluteFill>
  );
};
