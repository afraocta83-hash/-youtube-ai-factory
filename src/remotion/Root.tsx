import React from "react";
import { Composition } from "remotion";
import { LerryShort, LerryShortProps } from "./Short";

const defaultProps: LerryShortProps = {
  workingTitle: "Lerry Animasi",
  scenes: [
    { number: 1, seconds: 5, visual: "Adegan pembuka", narration: "", dialogue: "", subtitle: "Cerita dimulai..." },
    { number: 2, seconds: 5, visual: "Adegan berikutnya", narration: "", dialogue: "", subtitle: "Lanjutkan ceritanya." },
    { number: 3, seconds: 5, visual: "Adegan penutup", narration: "", dialogue: "", subtitle: "Tamat." }
  ]
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="LerryShort"
    component={LerryShort}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={450}
    defaultProps={defaultProps}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.max(450, Math.min(1800, props.scenes.reduce((n, s) => n + Math.max(1, s.seconds), 0) * 30))
    })}
  />
);
