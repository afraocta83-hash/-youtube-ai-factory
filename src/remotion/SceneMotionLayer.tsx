import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Lottie } from "@remotion/lottie";
import { ThreeCanvas } from "@remotion/three";

export type SceneMotionType = "none" | "lottie" | "three";

const accentAnimation = {
  v: "5.9.6", fr: 30, ip: 0, op: 60, w: 160, h: 160,
  nm: "Lerry Accent Motion", ddd: 0, assets: [],
  layers: [{
    ddd: 0, ind: 1, ty: 1, nm: "Accent tile", sr: 1,
    ks: {
      o: { a: 0, k: 92 }, r: { a: 1, k: [
        { t: 0, s: [0], e: [45], i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] } },
        { t: 30, s: [45], e: [90], i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] } },
        { t: 59, s: [90], e: [0] }
      ] },
      p: { a: 0, k: [80, 80, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] }
    },
    ao: 0, sw: 78, sh: 78, sc: "#f4a261", ip: 0, op: 60, st: 0, bm: 0
  }]
};

const ThreeAccent: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <ThreeCanvas width={340} height={340} camera={{ position: [0, 0, 4] }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 4, 5]} intensity={2} />
      <mesh rotation={[frame / 35, frame / 24, frame / 55]}>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshStandardMaterial color="#f4a261" roughness={0.35} metalness={0.12} />
      </mesh>
    </ThreeCanvas>
  );
};

/** Optional decorative layer for a scene. The mascot remains the original 2D CharacterRig. */
export const SceneMotionLayer: React.FC<{ type?: SceneMotionType }> = ({ type = "none" }) => {
  if (type === "none") return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", alignItems: "flex-end", justifyContent: "center", paddingRight: 54, opacity: 0.88 }}>
      {type === "lottie"
        ? <Lottie animationData={accentAnimation as any} style={{ width: 340, height: 340 }} />
        : <ThreeAccent />}
    </AbsoluteFill>
  );
};
