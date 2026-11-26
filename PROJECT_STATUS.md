# Lerry Animasi — Project Status

Last updated: 2026-11-26
Current stage: end-to-end synthetic smoke passed; visual/audio acceptance and product integration remain
Working branch: `experiment/openmontage-video-engine`
Base branch: `main`
Branch comparison at update: 69 commits ahead, 0 behind
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

## Known gaps — not production-ready yet
1. Scene art is still template/vector scenery selected by simple keywords. The `imagePrompt` does not yet generate unique scene illustrations, props, or consistent character reference sheets.
2. The character is a simple code-drawn rig. Actions exist, but acting, body mechanics, expressions and scene interaction are not production-grade.
3. TTS currently produces one combined narration track. It is not split per scene or per character; the 16.58-second smoke narration does not fill the 30-second test video.
4. Subtitle timing is scene-based/static, not aligned to spoken words. No lip-sync is implemented.
5. QC validates package structure and text integrity; it does not yet judge visual continuity, subtitle safe areas, narration clarity, lip-sync, factual accuracy or copyright.
6. The dashboard still requires manual transfer of the production JSON to GitHub Actions. It is not a one-click or unattended factory.
7. The end-to-end test used a synthetic test story, not a final story supplied and approved by the owner.
8. Supabase storage/configuration is not confirmed.
9. The Vercel deployment and protected dashboard were not revalidated in this run.
10. YouTube publishing remains manual and approval-gated.

## Next task queue
- [x] Confirm current Gemini TTS model and generate real audio.
- [x] Run live storyboard generation and verify exact owner-story preservation.
- [x] Enforce ownerStory in structural QC and test negative cases.
- [x] Render the generated storyboard with its real narration audio.
- [x] Verify MP4 codec, dimensions, frame rate, duration, audio stream, non-silence and full decode.
- [ ] Improve scene-specific free/local vector illustration so the visual category matches each scene more accurately.
- [ ] Improve rig acting and add scene interaction/props; obtain owner visual acceptance.
- [ ] Split narration per scene and align subtitle timing; add audio/lip-sync checks.
- [ ] Run an end-to-end test using an owner-provided final story and review the MP4 with the owner.
- [ ] Verify Supabase storage and the protected Vercel dashboard separately.
- [ ] Implement secure dashboard-to-render handoff without exposing credentials in the browser.
- [ ] Only after acceptance, ask for separate authorization to merge or deploy.

## Acceptance rule
A feature is not complete because code exists. It is complete only when its workflow ran, output artifact exists, and the artifact passes the relevant inspection. `Built ≠ Tested ≠ Accepted ≠ Released`.
