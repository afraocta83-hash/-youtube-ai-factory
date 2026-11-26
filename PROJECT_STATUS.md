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
- Studio presentation remains unchanged; the copied production JSON includes the canonical `ownerStory` field for render-time checks.
- QC is checked server-side and again in the render workflow; no new dashboard/office visual components were added.
- Render workflow rejects a package if `script` and `ownerStory` differ.
- CI now includes TypeScript checking and a Next.js production build.

## Current in-progress verification
- Latest known run at this update: [45821849638](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45821849638), for commit `34690ad8944d69ed43a3d90c1e6292b36ce73c61`.
- The latest run is queued/pending. Do not mark the final rig accepted until it completes and its MP4 is inspected.
- TypeScript check, Next.js production build, QC API integration test, Remotion composition check, two MP4 renders, FFmpeg decode checks and artifact upload all passed in run [45823031346](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45823031346).
- The latest artifact [lerry-openmontage-motion-showcase](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45823031346) contains a 15-second motion showcase and a 16-second LerryShort renderer smoke MP4. The LerryShort MP4 is H.264 1080×1920 at 30 fps with an AAC audio stream.
- Visual frame inspection confirmed the one-frame black transitions are fixed. The run pose is improved but remains proof-of-concept, not production art.
- `npm audit --audit-level=moderate` passed after overriding PostCSS to 8.5.33; the resolved tree shows Next.js 15.5.29 using PostCSS 8.5.33.
- A visual review of the earlier rig showed the legs overlapped/one leg was hidden. The limb layering, spacing, hands and blinking were revised afterward and require a fresh artifact review.

## Known gaps — not production-ready yet
1. Scene art is still a reusable SVG character on template backgrounds, not unique illustrated scenes generated from each scene's prompt.
2. Motion rig is a proof of concept. Character design, acting quality, and action-to-story mapping still need visual acceptance.
3. Live TTS has not been tested because the GitHub Actions secret `GEMINI_API_KEY` is missing. Once added, the current workflow generates one combined TTS track; there is no per-scene audio segmentation, lip-sync, or precise subtitle/audio timing.
4. Automated QC checks text/package structure, not actual visual quality, audio clarity, subtitle safe areas, lip-sync, or factual accuracy.
5. The normal dashboard flow still requires manually sending the production JSON to GitHub Actions to render. It is not yet a one-click or unattended factory.
6. The existing Vercel deployment is protected by Vercel Authentication. The render workflow now runs QC locally and calls the stable Gemini 2.5 Flash TTS model directly; it requires the missing GitHub Actions secret `GEMINI_API_KEY`.
7. Supabase storage is optional and not confirmed configured.
8. YouTube publishing remains intentionally manual and approval-gated.

## Next task queue
- [x] Complete latest CI run and fix the observed build/QC/render issues.
- [x] Confirm dependency audit returns zero moderate/high vulnerabilities.
- [ ] Confirm the new QC API smoke test passes and the LerryShort renderer produces a 16-second MP4 with an audio stream.
- [ ] Add `GEMINI_API_KEY` under GitHub repository Settings → Secrets and variables → Actions before a real TTS render; never paste the key into chat.
- [ ] Inspect the latest MP4 at multiple frames; verify walk/run/point/surprised poses and no limb intersections.
- [ ] Add render acceptance checks for duration, dimensions, frame rate, audio stream and file integrity.
- [ ] Build scene-specific visual composition from the story's `imagePrompt`, using free/local assets first.
- [ ] Split narration by scene and align subtitle timing; add audio/lip-sync checks.
- [ ] Connect a reliable dashboard-to-render handoff without exposing credentials in the browser.
- [ ] Run an end-to-end production test with an owner-provided story and review the resulting MP4.
- [ ] Only after acceptance, ask for separate authorization to merge or deploy.

## Acceptance rule
A feature is not complete because code exists. It is complete only when its workflow ran, output artifact exists, and the artifact passes the relevant inspection. `Built ≠ Tested ≠ Accepted ≠ Released`.
