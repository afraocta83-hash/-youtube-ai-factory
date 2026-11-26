import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

export type CharacterAction = "idle" | "walk" | "run" | "surprised" | "point";

export type CharacterRigProps = {
  action?: CharacterAction;
  accent?: string;
  travelAcross?: boolean;
};

/** Reusable frame-deterministic 2D character rig for both the demo and Shorts renderer. */
export const CharacterRig: React.FC<CharacterRigProps> = ({
  action = "idle",
  accent = "#ffb347",
  travelAcross = false,
}) => {
  const frame = useCurrentFrame();
  const cycle = frame % 90;
  const moving = action === "walk" || action === "run";
  const speed = action === "run" ? 2.8 : 7;
  const stride = action === "run" ? 10 : 13;
  const gait = moving ? Math.sin(frame / speed) : 0;
  const bob = Math.sin(frame / (action === "run" ? 2.8 : 7)) * (action === "idle" ? 3 : moving ? 9 : 5);
  const travel = !travelAcross ? 0 : action === "walk"
    ? interpolate(cycle, [0, 89], [-42, 42], { easing: Easing.inOut(Easing.sin) })
    : action === "run"
      ? interpolate(cycle, [0, 89], [-86, 86], { easing: Easing.inOut(Easing.sin) })
      : 0;
  const lean = action === "run" ? 10 : action === "point" ? -3 : 0;
  const leftLeg = moving ? gait * stride : 0;
  const rightLeg = moving ? -gait * stride : 0;
  const leftArm = action === "point" ? 8 : moving ? -gait * (action === "run" ? 36 : 22) : Math.sin(frame / 18) * 3;
  const rightArm = action === "point" ? -62 : moving ? gait * (action === "run" ? 36 : 22) : Math.sin(frame / 18 + 1) * 3;
  const mouthHeight = action === "surprised" ? 22 : 7;
  const eyeScale = action === "surprised" ? 1.35 : 1;
  const blinkScale = Math.sin(frame / 14) > 0.985 ? 0.12 : 1;

  return (
    <svg viewBox="0 0 600 760" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ overflow: "visible" }}>
      <ellipse cx="300" cy="680" rx="112" ry="20" fill="#1b2938" opacity=".14" />
      <g transform={`translate(${travel} ${bob}) rotate(${lean} 300 420)`}>
        <g>
          <path d="M220 420 Q300 390 380 420 L400 610 Q300 650 200 610Z" fill={accent} stroke="#27364a" strokeWidth="12" />
          <path d="M220 445 Q160 470 150 540" fill="none" stroke="#ffd8b5" strokeWidth="30" strokeLinecap="round" transform={`rotate(${leftArm} 220 445)`} />
          <circle cx="150" cy="540" r="16" fill="#ffd8b5" transform={`rotate(${leftArm} 220 445)`} />
          <path d="M378 445 Q440 470 450 540" fill="none" stroke="#ffd8b5" strokeWidth="30" strokeLinecap="round" transform={`rotate(${rightArm} 378 445)`} />
          <circle cx="450" cy="540" r="16" fill="#ffd8b5" transform={`rotate(${rightArm} 378 445)`} />
        </g>
        <path d="M220 590 L220 650 Q220 680 240 680 L265 680 L265 590" fill="#27364a" stroke="#27364a" strokeWidth="12" strokeLinecap="round" transform={`rotate(${leftLeg} 242 590)`} />
        <path d="M335 590 L335 650 Q335 680 355 680 L380 680 L380 590" fill="#27364a" stroke="#27364a" strokeWidth="12" strokeLinecap="round" transform={`rotate(${rightLeg} 358 590)`} />
        <ellipse cx="245" cy="680" rx="25" ry="12" fill="#182338" transform={`rotate(${leftLeg} 242 590)`} />
        <ellipse cx="360" cy="680" rx="25" ry="12" fill="#182338" transform={`rotate(${rightLeg} 358 590)`} />
        <path d="M220 220 Q205 95 300 88 Q395 95 385 220 L370 390 Q300 430 230 390Z" fill="#ffd8b5" stroke="#27364a" strokeWidth="12" />
        <path d="M210 220 Q188 90 300 70 Q412 88 390 220 Q365 165 310 160 Q265 205 210 220Z" fill="#27364a" />
        <g transform={`translate(0 0) scale(1 ${eyeScale * blinkScale})`}>
          <ellipse cx="268" cy="250" rx="12" ry="17" fill="#27364a" />
          <ellipse cx="334" cy="250" rx="12" ry="17" fill="#27364a" />
        </g>
        <ellipse cx="301" cy="322" rx="10" ry={mouthHeight} fill="#a84d58" />
      </g>
    </svg>
  );
};
