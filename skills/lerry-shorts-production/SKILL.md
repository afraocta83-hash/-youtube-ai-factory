---
name: lerry-shorts-production
description: Produce Indonesian animated YouTube Shorts from the owner's locked final story. AI creates storyboard directions and metadata without rewriting plot or narration.
---

# LERRY ANIMASI — Shorts Production Skill

## Non-negotiable project rules

- This project makes YouTube Shorts only: vertical 9:16, 1080x1920, 30 fps, 15–60 seconds.
- The owner supplies the final story. AI must not write or rewrite the plot. It only splits the exact story into scenes, sets duration/actions, adds visual directions, extracts exact narration/subtitle excerpts, and prepares metadata.
- Keep the generated plot, dialogue, narration and subtitles internally consistent. Avoid unsupported facts and protected characters/works.
- Never upload or schedule to YouTube. The owner must inspect the MP4 and explicitly approve any publishing step.
- Free-first. Do not add paid providers, billing, credits, subscriptions or new API keys without explicit owner approval.
- Work inside the existing Next.js + Remotion project. Do not replace the renderer or introduce a second video engine.
- Preserve existing user changes. Read files before editing; do not overwrite unrelated dashboard or office work.

## Production pipeline

1. **Story lock**
   - Store the original owner story verbatim in `production.script`.
   - Use it as the sole source for spoken dialogue and narration.
   - Any proposed adaptation must be shown to the owner for approval; never silently rewrite it.

2. **Storyboard**
   - Use the Groq GPT-OSS 120B endpoint once to divide the owner-provided story into 4–6 scenes. Require the story field to match the owner input exactly; each narration and subtitle must be a verbatim excerpt in original order. Request strict JSON Schema, low reasoning effort, and cap completion tokens at 4,200.
   - Total scene duration must be 15–60 seconds.
   - Each scene needs: purpose, visual direction, camera/motion direction, narration/dialogue quoted verbatim from the owner story, subtitle aligned with each scene, sound cue and image prompt.
   - Do not add facts. Mark visual interpretation separately from story facts.
   - Check that every scene follows the original story order.

3. **Visual assets**
   - Keep one approved character design/reference across scenes.
   - Every scene should have a distinct composition that illustrates that scene; do not repeat one static character card with only a different caption and call it finished animation.
   - Prefer user-owned assets, existing project assets and free/licensed sources.
   - Do not call paid image/video APIs by default. If no free generation route is configured, clearly label image generation as pending and use the current renderer fallback without claiming scene artwork exists.
   - Keep text, captions and important faces inside platform-safe areas. Do not bake captions into generated images.

4. **Voice and sound**
   - Use Edge TTS with the Indonesian Ardi voice as the primary engine and Piper Indonesian voice as automatic fallback. Do not require a Groq key or paid TTS service.
   - Preserve the approved words. Do not let TTS improvise or paraphrase.
   - Prefer per-scene audio files and measure actual durations before setting Remotion scene lengths. If only one continuous audio track is supported, validate that the audio and scene timing do not drift.
   - Music and sound effects must be licensed or generated through an explicitly approved free route. Silence is preferable to unlicensed music.

5. **Remotion composition**
   - Use the existing Remotion composition and official Remotion APIs.
   - Use frame-based deterministic animation; avoid CSS transitions/animations that do not render reliably.
   - Use smooth entrances/exits, scene-specific movement and consistent character proportions.
   - Keep subtitle typography readable on a phone and avoid YouTube UI safe zones.
   - Calculate total frames from validated scene durations; never rely on a fixed placeholder duration.

6. **Pre-render quality gate**
   - Run structural QC before rendering: generated story present, 4–6 scenes, 15–60 seconds, narration/dialogue presence, valid visual prompts, title/description, and no unsupported factual claims. Require explicit owner approval before render dispatch.
   - Render still frames for the opening, middle of each scene, scene cuts and ending.
   - Inspect the stills for blank frames, missing assets, text overflow, safe-area violations, character inconsistency, visual repetition and abrupt transitions.
   - Stop the full render on critical issues. Record warnings; do not mark a warning as passed.

7. **MP4 render and verification**
   - Render H.264 MP4, 1080x1920, 30 fps, yuv420p and AAC audio.
   - Verify the output exists and is non-empty; inspect duration, resolution, frame rate, codec and audio stream with ffprobe.
   - Inspect the actual MP4 or representative extracted frames before reporting success.
   - Save a QC report with pass/fail, warnings and unresolved limitations.

8. **Owner handoff**
   - Provide the MP4 artifact, cover image, storyboard and QC report.
   - Clearly distinguish implemented, tested and pending capabilities.
   - Wait for explicit owner approval before any YouTube publishing action.

## Skills and references to consult

Use the official Remotion skills as the source of truth for Remotion APIs:
- https://github.com/remotion-dev/skills — `remotion-best-practices`, `remotion-markup`, `remotion-render`, `remotion-captions`, `remotion-multimedia`, and `remotion-docs`.
- https://github.com/DojoCodingLabs/remotion-superpowers — adapt only the `create-short`, `add-captions`, and `review-video` workflow ideas. Do not import its paid-provider integrations by default.
- https://github.com/howznguyen/shorts-kit — use as a reference for fact ledgers, linting, scene still sheets, safe-area checks and final encoding. Do not replace this project's pipeline with the full repository.

## Explicit exclusions

Do not add MuJoCo, OpenCut, Lastbook, TwelveLabs, KIE, Replicate, ElevenLabs, HeyGen or paid music/video generation to the default runtime. Re-evaluate only if the owner explicitly requests the capability and approves its cost, license and integration.
