import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

export type CharacterAction = "idle" | "walk" | "run" | "surprised" | "point";
export type CharacterRigProps = { action?: CharacterAction; accent?: string; travelAcross?: boolean; speaking?: boolean };

/**
 * Lerry's locked mascot: round white head, no nose, expressive eyes/brows,
 * slim stick body, blue shirt, black limbs/hands/feet and bold outline.
 * Only pose and facial expression may vary between scenes.
 */
export const CharacterRig: React.FC<CharacterRigProps> = ({ action = "idle", accent = "#1677d2", travelAcross = false, speaking = false }) => {
  const frame = useCurrentFrame();
  const cycle = frame % 90;
  const moving = action === "walk" || action === "run";
  const speed = action === "run" ? 2.8 : 7;
  const gait = moving ? Math.sin(frame / speed) : 0;
  const bob = Math.sin(frame / (action === "run" ? 2.8 : 7)) * (action === "idle" ? 2 : moving ? 8 : 4);
  const anticipation = action === "surprised" ? interpolate(frame % 45, [0, 8, 45], [0, -8, 0], { extrapolateRight: "clamp" }) : 0;
  const travel = !travelAcross ? 0 : action === "walk"
    ? interpolate(cycle, [0, 89], [-42, 42], { easing: Easing.inOut(Easing.sin) })
    : action === "run"
      ? interpolate(cycle, [0, 89], [-82, 82], { easing: Easing.inOut(Easing.sin) }) : 0;
  const lean = action === "run" ? 9 : action === "point" ? -3 : action === "walk" ? gait * 3 : 0;
  const leftLeg = moving ? gait * (action === "run" ? 24 : 16) : Math.sin(frame / 28) * 1.2;
  const rightLeg = moving ? -gait * (action === "run" ? 24 : 16) : -Math.sin(frame / 28) * 1.2;
  const leftArm = action === "point" ? 8 : moving ? -gait * (action === "run" ? 32 : 20) : Math.sin(frame / 18) * 4;
  const rightArm = action === "point" ? -58 : moving ? gait * (action === "run" ? 32 : 20) : Math.sin(frame / 18 + 1) * 4;
  const surprised = action === "surprised";
  const blink = Math.sin(frame / 14) > 0.985 ? 0.12 : 1;
  const browTilt = surprised ? -12 : action === "point" ? 5 : 0;
  const mouthOpen = speaking && Math.sin(frame * 0.78) > 0.05;
  const mouthRy = surprised ? 17 : speaking ? (mouthOpen ? 12 : 3) : action === "point" ? 4 : 6;
  const mouthRx = speaking && !mouthOpen ? 9 : surprised ? 13 : 17;

  return (
    <svg viewBox="0 0 600 760" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ overflow: "visible" }}>
      <ellipse cx="300" cy="690" rx="92" ry="17" fill="#111827" opacity=".16" />
      <g transform={`translate(${travel} ${bob + anticipation}) rotate(${lean} 300 420)`}>
        {/* Slim black stick limbs; hands and shoes remain black in every pose. */}
        <path d="M244 420 Q205 466 190 535" fill="none" stroke="#111827" strokeWidth="24" strokeLinecap="round" transform={`rotate(${leftArm} 244 420)`} />
        <path d="M356 420 Q395 466 410 535" fill="none" stroke="#111827" strokeWidth="24" strokeLinecap="round" transform={`rotate(${rightArm} 356 420)`} />
        <circle cx="190" cy="535" r="18" fill="#080b12" transform={`rotate(${leftArm} 244 420)`} />
        <circle cx="410" cy="535" r="18" fill="#080b12" transform={`rotate(${rightArm} 356 420)`} />
        {/* Blue T-shirt, fixed identity color. */}
        <path d="M242 390 Q300 370 358 390 L382 505 Q300 532 218 505Z" fill="#1677d2" stroke="#080b12" strokeWidth="13" strokeLinejoin="round" />
        <path d="M242 405 L218 505 M358 405 L382 505" fill="none" stroke="#080b12" strokeWidth="9" strokeLinecap="round" />
        {/* Narrow legs and black shoes. */}
        <path d="M270 510 L264 650" stroke="#111827" strokeWidth="25" strokeLinecap="round" transform={`rotate(${leftLeg} 270 510)`} />
        <path d="M330 510 L336 650" stroke="#111827" strokeWidth="25" strokeLinecap="round" transform={`rotate(${rightLeg} 330 510)`} />
        <path d="M264 646 Q236 654 230 674 Q250 690 286 680 L286 662" fill="#080b12" stroke="#080b12" strokeWidth="8" strokeLinejoin="round" transform={`rotate(${leftLeg} 270 510)`} />
        <path d="M336 646 Q364 654 370 674 Q350 690 314 680 L314 662" fill="#080b12" stroke="#080b12" strokeWidth="8" strokeLinejoin="round" transform={`rotate(${rightLeg} 330 510)`} />
        {/* Round white head: no nose, no hair, no identity changes. */}
        <g transform={`rotate(${surprised ? -3 : Math.sin(frame / 35) * 1.5} 300 260)`}>
          <circle cx="300" cy="260" r="142" fill="#ffffff" stroke="#080b12" strokeWidth="16" />
          <g transform={`scale(1 ${blink})`}>
            <ellipse cx="253" cy="250" rx={surprised ? 17 : 14} ry={surprised ? 22 : 19} fill="#080b12" />
            <ellipse cx="347" cy="250" rx={surprised ? 17 : 14} ry={surprised ? 22 : 19} fill="#080b12" />
          </g>
          <path d={`M226 210 Q250 ${190 + browTilt} 274 208`} fill="none" stroke="#080b12" strokeWidth="12" strokeLinecap="round" />
          <path d={`M326 208 Q350 ${190 - browTilt} 374 210`} fill="none" stroke="#080b12" strokeWidth="12" strokeLinecap="round" />
          <ellipse cx="300" cy="315" rx={mouthRx} ry={mouthRy} fill="#080b12" />
        </g>
      </g>
    </svg>
  );
};
