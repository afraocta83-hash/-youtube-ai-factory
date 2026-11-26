# GitHub Motion Stack — Lerry Animasi

This is the project-specific adoption plan for the five tools shown in the owner's reference image. It keeps the existing Next.js + Remotion renderer as the single MP4 pipeline.

## Decision

| Reference | Role in Lerry | Adopt now? | Reason |
|---|---|---:|---|
| [LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill) | Art-direction rules: timing, easing, staging, anticipation, follow-through, secondary/ambient motion, choreography and motion QC | Yes — as production guidance | Framework-agnostic MIT skill; improves decisions before rendering and adds no runtime package |
| [GSAP](https://github.com/greensock/GSAP) | Complex imperative timelines and interactive web motion | No extra dependency for the current renderer | Remotion already owns the frame clock and scene timeline. A second clock can create nondeterministic renders and duplicate functionality. Translate useful timeline ideas into Remotion frame-based interpolation |
| [three.js](https://github.com/mrdoob/three.js) | Optional 3D props, environments or special explainer shots | Optional, isolated only | Full 3D library, not a replacement for the locked 2D mascot. Keep it out of the default bundle/render path until a story requires 3D |
| [LottieFiles/lottie-web](https://github.com/airbnb/lottie-web) | Playback of authored After Effects/Lottie JSON assets | Optional, asset-driven | Useful for reusable vector effects only when a suitable JSON asset exists and its license is checked. Do not make every scene depend on Lottie |
| [ManimCommunity/manim](https://github.com/ManimCommunity/manim) | Precise mathematical/scientific diagrams and equation animations | Optional, scene-type-specific | Excellent for STEM explainers, but Python + rendering dependencies make it too heavy for every Short. Use only for a diagram scene, export a clip, then composite it in Remotion |

## Lerry production rules derived from motion-design-skill

Use the playful motion personality for the 2D mascot, but keep it readable and restrained:

1. Decide emotional intent and the scene's visual message before animating.
2. Each scene has a setup, one readable primary action, and a resolution/settle.
3. Use eased movement, not linear movement, for character and camera travel. Use linear only for continuous progress indicators.
4. Keep the hero action dominant. Secondary movement (hands, clothing, props, shadow) supports it; ambient background movement stays subtle.
5. Use anticipation before a large action and follow-through after it. Do not animate every element at once.
6. Keep important movement within roughly one-third of the frame before a new key pose/direction.
7. Use consistent motion personality and easing across the whole Short.
8. Reserve a brief settled beat before a scene cut. Prefer a purposeful hard cut over fading the entire frame to black.

## Implementation mapping to the current code

- src/remotion/CharacterRig.tsx: the one locked mascot rig. Keep its head, face, proportions, blue shirt, black limbs/hands/shoes and identity fixed. Animate only pose, expression and action.
- src/remotion/SceneBackdrop.tsx: deterministic vector environments and story props. Add parallax/ambient motion only when it helps the story; avoid random layout changes so rerenders remain identical.
- src/remotion/Short.tsx: Remotion owns scene sequencing, audio timing, camera movement, captions and transitions. All animation values must be derived from useCurrentFrame() and deterministic interpolation.
- app/api/produce/route.ts: AI may choose a semantic action and describe visual staging, but may not change the owner's story, narration or dialogue. Validate action values against the actual rig.
- .github/workflows/render-short.yml: keep the single render path, then verify MP4 dimensions, fps, audio, duration, subtitles and final frames.

## Scene action contract

The storyboard may use only the supported character actions: idle, walk, run, surprised, point. An action outside that list must be normalized or rejected before rendering; it must never silently change the mascot design.

Suggested optional future scene types (not yet implemented):
- vector: default Remotion/SVG scene.
- lottie: only when a licensed Lottie JSON asset is explicitly attached to the scene.
- threeD: only when a story requires a 3D shot and a dedicated Remotion-compatible component exists.
- diagram: only when a scientific/mathematical diagram is materially clearer as a Manim render.

Do not emit these optional types from the storyboard API until their renderers, validation, assets and QC tests exist.

## Free-first and licensing notes

- The motion-design skill repository declares MIT. Preserve attribution/license when redistributing copied files; this document summarizes principles and links upstream rather than vendoring the full skill.
- The three.js repository declares MIT.
- Check the exact license and redistribution terms of every Lottie JSON asset, font, sound, model or image. A free player does not make the animation assets free.
- Manim Community is community-maintained and dual-licensed under its project/community licenses; review both license files before redistributing source or binaries.
- GSAP licensing is version/product-specific. Verify current terms for the exact package and use case before adding it; this plan does not install it.
- Do not add paid APIs, hosted render credits, proprietary assets or new secrets as part of this adoption.

## Acceptance checks before enabling any optional renderer

1. Existing vector/Remotion pipeline still builds without the optional tool installed.
2. One fixture scene renders deterministically twice with matching frame count and no black/blank frames.
3. Mascot identity matches the locked character specification in every frame.
4. Scene audio, subtitles and total runtime remain synchronized.
5. Optional assets are licensed and bundled locally; CI does not depend on a fragile remote URL at render time.
6. MP4 QC passes at 1080x1920, 30 fps, H.264/AAC, 9:16, and 15–60 seconds.

## Upstream repositories

- https://github.com/LottieFiles/motion-design-skill
- https://github.com/greensock/GSAP
- https://github.com/mrdoob/three.js
- https://github.com/airbnb/lottie-web
- https://github.com/ManimCommunity/manim
