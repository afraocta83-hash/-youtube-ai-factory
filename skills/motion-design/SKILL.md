---
name: motion-design
description: Applies emotionally-driven motion design principles: intent, visual narrative, timing, easing, choreography and motion QC.
license: MIT
metadata:
  author: LottieFiles
  version: "1.0.0"
---

# Motion Design Skill (LottieFiles)

Installed from the upstream LottieFiles motion-design-skill repository. This project copy keeps the core checklist and principles relevant to Lerry's rendered cartoons.

## Lerry motion profile
- Primary archetype: **Playful** for the mascot; keep brand motion consistent between scenes.
- Every scene has setup, one readable hero action, and resolution/settle.
- Three layers: primary character action, secondary supporting movement, subtle ambient background movement.
- Use eased interpolation for spatial movement; linear only for progress or mechanical constant-speed motion.
- Use anticipation before large actions and follow-through after them.
- Keep one hero motion per moment; limit simultaneous secondary movement.
- Respect the one-third-screen rule: break long travel into intermediate key poses.
- Leave a short settled beat before scene cuts.
- Use deterministic frame-based values in Remotion; no wall-clock timers, random values or independent animation clocks.

## 8-step checklist
1. Identify the emotion the viewer should feel.
2. Choose the motion personality.
3. Select the primary property (position, scale, rotation, opacity).
4. Choose duration based on size and distance.
5. Choose directional easing: ease-out entrance, ease-in exit, ease-in-out on-screen, sine for ambient loops.
6. Identify the hero element.
7. Add restrained secondary and ambient layers.
8. Check staging, readability, reduced-motion needs and performance.

## Three pillars
- Emotional intent drives timing and amplitude.
- Visual narrative follows setup → action → resolution.
- Motion craft uses easing, arcs, anticipation, follow-through and secondary motion.

## Motion personality
- Playful: 150–300 ms, ease-out-back/bouncy, moderate overshoot; suitable for Lerry's mascot.
- Premium: 350–600 ms, restrained curves, no overshoot.
- Corporate: 200–400 ms, predictable and functional.
- Energetic: 100–250 ms, fast and bold; use sparingly.

## Easing rules
- Entrances: decelerate (ease-out).
- Exits: accelerate (ease-in).
- On-screen movement: ease-in-out.
- Ambient loops: sine-based seamless cycles.
- Do not use linear easing for organic character movement.

## Choreography
- Lead with the hero; supporting elements are subtler.
- Keep related elements spatially consistent.
- Use counter-motion sparingly for depth.
- Stagger secondary reactions instead of starting everything simultaneously.
- Avoid more than 2–3 prominent moving elements at once.

## Quality checklist
- Readable at normal playback speed.
- Clear primary action; supporting motion does not distract.
- Motion matches the emotional intent and mascot personality.
- No abrupt pose changes without anticipation or settle where needed.
- No long unbroken travel across more than one-third of the frame.
- No unnecessary continuous animation that competes with narration/subtitles.
- Deterministic render: same frame produces same image.

Upstream: https://github.com/LottieFiles/motion-design-skill
License: MIT; retain copyright and license notices when redistributing upstream-derived content.