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
- Latest known run at this update: [45821069302](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45821069302), for commit `388c553e8644c16e70455bc8f5f84d98cb81a517`.
- The run was still installing dependencies when last checked. Do not mark the latest changes accepted until the run completes successfully.
- Earlier runs failed at TypeScript check because literal escaped newline characters were accidentally inserted into `app/studio.tsx`. That source was corrected in a later commit; the new run is intended to verify the correction.

## Known gaps — not production-ready yet
1. Scene art is still a reusable SVG character on template backgrounds, not unique illustrated scenes generated from each scene's prompt.
2. Motion rig is a proof of concept. Character design, acting quality, and action-to-story mapping still need visual acceptance.
3. Voice is currently one combined TTS track; no per-scene audio segmentation, lip-sync, or precise subtitle/audio timing.
4. Automated QC checks text/package structure, not actual visual quality, audio clarity, subtitle safe areas, lip-sync, or factual accuracy.
5. The normal dashboard flow still requires manually sending the production JSON to GitHub Actions to render. It is not yet a one-click or unattended factory.
6. The render workflow calls the configured Vercel API URL; deployment and environment secrets must be verified before a real production render.
7. Supabase storage is optional and not confirmed configured.
8. YouTube publishing remains intentionally manual and approval-gated.

## Next task queue
- [ ] Complete latest CI run and fix any new failures.
- [ ] Inspect the latest MP4 at multiple frames; verify walk/run/point/surprised poses and no limb intersections.
- [ ] Add render acceptance checks for duration, dimensions, frame rate, audio stream and file integrity.
- [ ] Build scene-specific visual composition from the story's `imagePrompt`, using free/local assets first.
- [ ] Split narration by scene and align subtitle timing; add audio/lip-sync checks.
- [ ] Connect a reliable dashboard-to-render handoff without exposing credentials in the browser.
- [ ] Run an end-to-end production test with an owner-provided story and review the resulting MP4.
- [ ] Only after acceptance, ask for separate authorization to merge or deploy.

## Acceptance rule
A feature is not complete because code exists. It is complete only when its workflow ran, output artifact exists, and the artifact passes the relevant inspection. `Built ≠ Tested ≠ Accepted ≠ Released`.
