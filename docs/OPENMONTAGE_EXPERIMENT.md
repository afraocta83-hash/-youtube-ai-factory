# OpenMontage Engine Experiment

Status: isolated proof of concept; production renderer and dashboard are unchanged.

## Scope
- Branch: `experiment/openmontage-video-engine`
- Base: `main`
- Target: improve scene-level character motion before integrating it into Lerry Shorts.
- No paid image/video provider is enabled.
- No YouTube publishing or upload is performed.

## First experiment
`src/remotion/experiments/SceneMotion.tsx` adds a deterministic, frame-driven SVG character rig with five action states:
- idle
- walk
- run
- surprised
- point

The component uses Remotion frame timing rather than wall-clock animation, so renders remain reproducible. It is intentionally isolated and is not yet connected to `LerryShort`.

## Current limitations
- Character is still a vector rig, not a generated scene illustration.
- Action is selected by a production field; it is not inferred from story text yet.
- No character identity/voice registry yet.
- No per-scene audio segmentation or lip-sync yet.
- This is not evidence that the full OpenMontage runtime can run on Vercel.

## Acceptance gates before integration
1. Render a 15-60 second 9:16 MP4 with at least four scenes.
2. Demonstrate at least three distinct action states in one render.
3. Confirm scene timing and subtitles remain aligned.
4. Confirm owner story/script is preserved byte-for-byte.
5. Run visual and audio QC and retain the MP4 as a workflow artifact.
6. Only then consider wiring the rig into the production composition.

## Next engineering step
Create a dedicated experiment composition that renders all five action states, then validate the Remotion build in GitHub Actions. Keep `main` untouched until the owner reviews the artifact.
