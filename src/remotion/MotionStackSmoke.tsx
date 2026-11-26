import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Lottie } from "@remotion/lottie";
import { ThreeCanvas } from "@remotion/three";

const lottieFixture = {
  v: "5.9.6",
  fr: 30,
  ip: 0,
  op: 60,
  w: 160,
  h: 320,
  nm: "Lerry Lottie Smoke",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 1, nm: "Blue vector block",
      sr: 1, ks: {
        o: {a: 0, k: 100}, r: {a: 0, k: 0},
        p: {a: 0, k: [80, 160, 0]}, a: {a: 0, k: [0, 0, 0]},
        s: {a: 0, k: [100, 100, 100]}
      },
      ao: 0, sw: 84, sh: 84, sc: "#1677d2",
      ip: 0, op: 60, st: 0, bm: 0
    }
  ]
};

const ThreeProbe: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <ThreeCanvas width={320} height={360} camera={{position: [0, 0, 4]}}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 4, 5]} intensity={2} />
      <mesh rotation={[frame / 30, frame / 20, 0]}>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial color="#f4a261" />
      </mesh>
    </ThreeCanvas>
  );
};

export const MotionStackSmoke: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: "#f4f1ea", flexDirection: "row"}}>
      <div style={{width: "50%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
        <Lottie animationData={lottieFixture as any} style={{width: 320, height: 360}} />
      </div>
      <div style={{width: "50%", height: "100%"}}>
        <ThreeProbe />
      </div>
    </AbsoluteFill>
  );
};
