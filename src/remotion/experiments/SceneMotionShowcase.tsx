import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SceneMotion, CharacterAction } from "./SceneMotion";

const actions: CharacterAction[] = ["idle", "walk", "run", "surprised", "point"];

export const SceneMotionShowcase: React.FC = () => (
  <AbsoluteFill>
    {actions.map((action, index) => (
      <Sequence key={action} from={index * 90} durationInFrames={90}>
        <SceneMotion
          action={action}
          accent={index % 2 === 0 ? "#ffb347" : "#70c1b3"}
          background={index % 2 === 0 ? "#e8f5ff" : "#fff0df"}
          caption={`Uji gerakan ${index + 1} dari 5`}
        />
      </Sequence>
    ))}
  </AbsoluteFill>
);
