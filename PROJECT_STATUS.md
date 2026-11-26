# Lerry Animasi — Project Status

Last updated: 2026-11-26
Current stage: isolated engine experiment / integration hardening
Working branch: `experiment/openmontage-video-engine`
Base branch: `main`

## Safety boundary
- `main` is unchanged by this experiment.
- Dashboard and office visuals are not being redesigned.
- No YouTube upload or publishing is performed.
- No paid image/video provider is enabled.
- No production merge or Vercel deployment has been authorized.

## Confirmed working
- Remotion can render a 1080×1920, 30 fps, 15-second H.264 MP4 in GitHub Actions.
- FFmpeg/ffprobe verification and artifact upload succeeded in run [45819903887](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45819903887).
- A second render with the first articulated rig succeeded in run [45820510692](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45820510692); its MP4 was inspected.
- TypeScript check, Next.js build, Remotion composition listing, render, MP4 verification and artifact upload all passed together in run [45820602185](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45820602185).
- Story generation API now restores the exact owner story as canonical `script` and carries it as `ownerStory`.
- Generated narration/dialogue/subtitle lines must be exact excerpts of the owner's story or the generation is rejected.
- Studio calls the QC endpoint and displays story-integrity/QC results.
- Render workflow rejects a package if `script` and `ownerStory` differ.
- CI now includes TypeScript checking and a Next.js production build.

## Current in-progress verification
- Latest known run at this update: [45821849638](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45821849638), for commit `34690ad8944d69ed43a3d90c1e6292b36ce73c61`.
- The latest run is queued/pending. Do not mark the final rig accepted until it completes and its MP4 is inspected.
- TypeScript check and Next.js production build passed in run [45821069302](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45821069302).
- A visual review of the earlier rig showed the legs overlapped/one leg was hidden. The limb layering, spacing, hands and blinking were revised afterward and require a fresh artifact review.

## Known gaps — not production-ready yet
1. Scene art is still a reusable SVG character on template backgrounds, not unique illustrated scenes generated from each scene's prompt.
2. Motion rig is a proof of concept. Character design, acting quality, and action-to-story mapping still need visual acceptance.
3. Voice is currently one combined TTS track; no per-scene audio segmentation, lip-sync, or precise subtitle/audio timing.
4. Automated QC checks text/package structure, not actual visual quality, audio clarity, subtitle safe areas, lip-sync, or factual accuracy.
5. The normal dashboard flow still requires manually sending the production JSON to GitHub Actions to render. It is not yet a one-click or unattended factory.
6. The existing Vercel deployment is protected by Vercel Authentication. The render workflow was changed to run QC locally and call Gemini TTS directly, so it now requires a GitHub Actions secret named `GEMINI_API_KEY`; the existence of that secret has not been verified.
7. Supabase storage is optional and not confirmed configured.
8. YouTube publishing remains intentionally manual and approval-gated.

## Next task queue
- [ ] Complete latest CI run and fix any new failures.
- [ ] Confirm `GEMINI_API_KEY` is configured as a GitHub Actions secret before a real TTS render; never paste it into chat.
- [ ] Inspect the latest MP4 at multiple frames; verify walk/run/point/surprised poses and no limb intersections.
- [ ] Add render acceptance checks for duration, dimensions, frame rate, audio stream and file integrity.
- [ ] Build scene-specific visual composition from the story's `imagePrompt`, using free/local assets first.
- [ ] Split narration by scene and align subtitle timing; add audio/lip-sync checks.
- [ ] Connect a reliable dashboard-to-render handoff without exposing credentials in the browser.
- [ ] Run an end-to-end production test with an owner-provided story and review the resulting MP4.
- [ ] Only after acceptance, ask for separate authorization to merge or deploy.

## Acceptance rule
A feature is not complete because code exists. It is complete only when its workflow ran, output artifact exists, and the artifact passes the relevant inspection. `Built ≠ Tested ≠ Accepted ≠ Released`.
