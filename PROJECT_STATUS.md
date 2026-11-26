# Lerry Animasi — Project Status

Last updated: 2026-11-26
Current stage: visual/audio/dashboard integration implemented on experiment branch; verification and external service setup remain
Working branch: `experiment/openmontage-video-engine`
Base branch: `main`
Branch comparison at update: 76 commits ahead, 0 behind
Main HEAD at update: `db295ed51181d8ff969fe2ebea96891b4394cb45`

## Safety boundary
- All experiment changes remain isolated on `experiment/openmontage-video-engine`.
- `main` remains at the recorded base commit; no merge was performed.
- Dashboard and office visuals were not redesigned.
- No YouTube upload or publishing was performed.
- No paid image/video provider was enabled.
- No production Vercel deployment was performed.

## Confirmed working — latest end-to-end run
- Full workflow passed in [run 45830819113](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45830819113), commit `a33e2bc979656b60c81d7fe335fbc14faf771a34`.
- Dependency audit passed with zero vulnerabilities; TypeScript, Next.js production build, Remotion composition listing, QC, rendering, FFmpeg verification and artifact upload all passed.
- Live storyboard generation through `/api/produce` succeeded using `gemini-3.5-flash-lite`: 4 scenes, 30 seconds total, with `script` and `ownerStory` preserved exactly.
- QC negative tests passed: changed owner story, missing owner story and invented subtitle are rejected.
- Live TTS succeeded using `gemini-3.8-flash-tts`; the response was a valid 24 kHz mono PCM WAV.
- The generated storyboard package was saved and rendered with its generated narration audio; the final LerryShort MP4 is H.264, 1080×1920, 30 fps, 30.016 seconds, AAC audio, and passed full FFmpeg decode.
- The final MP4 soundtrack is non-silent (mean volume approximately -21.8 dB); the generated narration file is 16.58 seconds, shorter than the 30-second video.
- The motion showcase is H.264, 1080×1920, 30 fps, 15 seconds and passed FFmpeg decode.
- Artifact: `lerry-openmontage-motion-showcase`, ID `15122602232`, expires 2026-12-03.
- The artifact was downloaded and inspected at multiple frames. The character rig and backgrounds render, but some vector backdrop categories do not match the story scene precisely. Visual quality remains proof-of-concept.
- The QC endpoint now requires `ownerStory`; a missing source story can no longer pass merely as a warning.
- The TTS integration was migrated from the unavailable `gemini-2.5-flash-tts` Developer API target to `gemini-3.8-flash-tts`. Storyboard generation uses `gemini-3.5-flash-lite` to reduce capacity pressure.

## Changes added after run #54 — awaiting fresh CI verification\n- `SceneBackdrop.tsx` now has deterministic free vector environments for library, treasure/chest, nature, room, city and fallback scenes; these are more scene-specific but remain vector illustrations, not unique generated artwork.\n- `CharacterRig.tsx` adds breathing, secondary motion, head tilt, blinking, anticipation and stronger walk/run travel. Still a stylized 2D rig, not full character acting or lip-sync.\n- `Short.tsx` now supports per-scene audio files and progressive word reveal based on measured audio duration. This is approximate word timing, not phoneme-level forced alignment.\n- `render-short.yml` now requests TTS per scene, writes separate WAV assets and passes each scene's audio duration to Remotion. The render still needs a new workflow run to validate the new multi-request path.\n- Dashboard now includes a Render MP4 button and `/api/render` securely dispatches the GitHub Actions workflow server-side. It requires `GITHUB_ACTIONS_TOKEN` in Vercel with Actions: write; it is not configured or verified yet.\n- Existing Supabase panel, browser client and `supabase/schema.sql` are present. Vercel production has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` metadata, but preview variables and actual database/schema/storage execution have not been verified.\n- Vercel team lookup shows the `youtube-ai-factory` project exists, but no Git-linked projects are registered for the team/repository. The experiment branch has no Vercel preview deployment. No project linking or production deployment was done.\n\n## Known gaps — not production-ready yet
1. Scene art is still template/vector scenery selected by simple keywords. The `imagePrompt` does not yet generate unique scene illustrations, props, or consistent character reference sheets.
2. The character is a simple code-drawn rig. Actions exist, but acting, body mechanics, expressions and scene interaction are not production-grade.
3. Per-scene TTS has now been implemented in the workflow but has not passed a fresh CI run; duration fit and audio quality still need artifact inspection.
4. Subtitle reveal is now estimated from each scene WAV duration; true word/phoneme alignment and lip-sync remain unimplemented.
5. QC validates package structure and text integrity; it does not yet judge visual continuity, subtitle safe areas, narration clarity, lip-sync, factual accuracy or copyright.
6. A dashboard dispatch API/button has been added, but it is not operational until the GitHub Actions token is configured and the deployed dashboard is verified.
7. The end-to-end test used a synthetic test story, not a final story supplied and approved by the owner.
8. Supabase client, auth panel, RLS schema and private bucket definition exist; actual SQL execution, bucket policies and live save/restore remain unverified.
9. Vercel project exists but has no Git repository connection; experiment preview deployment is unavailable until project linking is resolved. Production env variables are present but not copied to Preview.
10. YouTube publishing remains manual and approval-gated.

## Next task queue
- [x] Confirm current Gemini TTS model and generate real audio.
- [x] Run live storyboard generation and verify exact owner-story preservation.
- [x] Enforce ownerStory in structural QC and test negative cases.
- [x] Render the generated storyboard with its real narration audio.
- [x] Verify MP4 codec, dimensions, frame rate, duration, audio stream, non-silence and full decode.
- [x] Add deterministic scene-specific vector environments for library, treasure, nature, room and city; [ ] inspect rendered frames and refine mismatches.
- [x] Improve rig secondary motion, blinking, anticipation and travel; [ ] add hand-held props and scene interaction; obtain owner visual acceptance.
- [x] Implement per-scene narration WAVs and approximate duration-based subtitle reveal; [ ] pass CI and inspect word timing/audio; [ ] implement true forced alignment/lip-sync.
- [ ] Run an end-to-end test using an owner-provided final story and review the MP4 with the owner.
- [ ] Execute Supabase schema and test login/save/read/storage; verify Vercel Preview environment separately.
- [x] Add server-side GitHub Actions dispatch endpoint and dashboard render button; [ ] configure `GITHUB_ACTIONS_TOKEN` on Vercel and test dispatch.
- [ ] Only after acceptance, ask for separate authorization to merge or deploy.

## Acceptance rule
A feature is not complete because code exists. It is complete only when its workflow ran, output artifact exists, and the artifact passes the relevant inspection. `Built ≠ Tested ≠ Accepted ≠ Released`.
