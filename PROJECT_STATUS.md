# Lerry Animasi — Project Status

Last updated: 2026-11-26
Current stage: Preview READY; Edge/Piper engine tests passed; renderer showcase and MP4 QC passed with offline CI fixture; live FreeLLM and owner-story render remain blocked
Working branch: `experiment/openmontage-video-engine`
Base branch: `main`
Latest reviewed code commit: `71e98c54ae5fc53e2a42f2d3bbd2c465e98b65d6`
Main remains isolated; no merge or Production deployment has been made.

## Safety boundary
- All experiment changes remain isolated on `experiment/openmontage-video-engine`.
- No merge to `main`, Production deployment, or YouTube publishing was performed.
- Dashboard/office design was not redesigned; this pass only corrected inaccurate readiness labels.
- No paid image/video provider was enabled.

## FreeLLM integration — code added, service not yet connected

- Added an OpenAI-compatible FreeLLM provider path to `app/api/produce/route.ts`.
- FreeLLM is preferred when `FREELLM_BASE_URL` is configured; Gemini remains a fallback when its key exists.
- Added `FREELLM_BASE_URL`, optional `FREELLM_API_KEY`, and `FREELLM_MODEL=free-smart` to `.env.example`.
- Added `docs/FREELLM_SETUP.md` with deployment and Vercel Preview configuration steps.
- Upstream project reviewed: https://github.com/Devansh-365/freellm (MIT). It is gateway software, not a free shared API key.
- **Not yet connected/tested:** no FreeLLM gateway URL or upstream provider credentials have been configured. The gateway must be deployed separately and supplied with provider credentials the owner controls. No public GitHub secrets were copied.
- FreeLLM currently covers storyboard generation only. The render workflow now uses Edge TTS as the primary Indonesian narration engine and Piper as automatic fallback; neither requires a Gemini API key. Edge/Piper generation tests and the renderer smoke showcase have passed, but an owner-story render remains unverified.
- No Production deployment or merge to `main`.

## Current infrastructure — verified
- GitHub repository: https://github.com/afraocta83-hash/-youtube-ai-factory
- Vercel project: `youtube-ai-factory`, linked to the GitHub repository.
- Latest Preview deployment: https://youtube-ai-factory-3kizncjqw-afraocta83-9700.vercel.app
- Deployment ID: `dpl_A3C1U4fjRtqTsWfd2G5c5zoaDtVn`; state `READY`.
- Latest Preview built from `experiment/openmontage-video-engine`, commit `71e98c54ae5fc53e2a42f2d3bbd2c465e98b65d6`.
- Vercel build log confirms Next.js compilation, type validation, static generation, serverless function creation and deployment completion.
- Vercel Preview environment metadata confirms:
  - `NEXT_PUBLIC_SUPABASE_URL` exists.
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` exists, scoped to `experiment/openmontage-video-engine`.
  - `GITHUB_ACTIONS_TOKEN` exists as a Sensitive/Secret, scoped to the experiment branch.
  - `FREELLM_BASE_URL` and `FREELLM_API_KEY` are not configured in Preview, so live storyboard generation is not available.
  - `GEMINI_API_KEY` is absent from Preview. The renderer CI was explicitly changed not to invoke the Gemini fallback.
- Production metadata has its own Supabase and Gemini variables. Secret values were not copied or exposed.
- Presence of the GitHub token metadata does not prove its contents or Actions write permission; a real authenticated dispatch is still required.
- Supabase project URL: https://ppgkyqqhthfdmvbeihvm.supabase.co
- `supabase/schema.sql` exists, but has not been executed in Supabase. Database table, RLS and private bucket are therefore not yet verified.

## CI and Preview verification
- Core renderer CI: [run #65](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45833196730), successful on its earlier deterministic fixture.
- Edge/Piper engine test: [run #3](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45847640236), successful on 2026-11-26. Edge TTS produced a 7.97s Indonesian MP3; Piper produced an 8.25s Indonesian WAV. Both were probed and fully decoded by FFmpeg; artifact `lerry-indonesian-tts-test` (ID `15132143546`, expires 2026-12-03).
- Renderer showcase: [run #72](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45848154496), successful on 2026-11-26. Dependency audit, TypeScript, Next.js build, QC API, offline storyboard fallback, Remotion compositions, both renders, FFmpeg decode, dimensions/FPS/duration and audio level checks all passed. Artifact `lerry-openmontage-motion-showcase` (ID `15133035385`, expires 2026-12-03).
- Run #72 intentionally used an offline fixture because FreeLLM is not configured. It proves renderer/MP4 infrastructure works; it does not prove live AI storyboard generation or owner-story TTS.
- Passed in run #72: dependency audit, TypeScript, Next.js build, QC API acceptance/rejection tests, deterministic CI audio fixture, Remotion composition checks, five-action showcase render, 16-second LerryShort smoke render, FFmpeg MP4 decode, 1080×1920, 30 fps, 15s/16s durations, audio stream and non-silent audio checks.
- The showcase MP4 has no audio by design; the Shorts smoke MP4 has audio. The attached audio is a deterministic CI fixture, not production narration.
- Latest Vercel Preview commit `71e98c5` compiled successfully, passed type checking and completed deployment; deployment state is `READY`.
- The Preview UI was previously fetched successfully. The latest deployment could not be fetched by the inspection connector because Vercel Authentication returned an SSO redirect; do not claim a full browser/UI acceptance test from this.
- This pass corrected static dashboard labels that previously implied Gemini and YouTube integrations were active. They now show verification/approval-gated states.

## Render pipeline architecture
- `.github/workflows/render-short.yml` accepts a production JSON payload through `workflow_dispatch`.
- TTS runtime installs Edge TTS and Piper in GitHub Actions. Edge voice: `id-ID-ArdiNeural`; Piper fallback model: Indonesian `id_ID-news_tts-medium`. If Edge generation or MP3-to-WAV conversion fails for a scene, the job attempts Piper for that scene. Kokoro is intentionally excluded.
- Dedicated Edge/Piper generation, ffprobe and FFmpeg decode tests passed in Actions run #3. Renderer smoke MP4 and FFmpeg QC passed in Actions run #72. Full production `render-short.yml` workflow still requires an owner-story render.
- `.github/workflows/test-tts-engines.yml` tests Edge and Piper audio generation, ffprobe metadata and full FFmpeg decode; it now runs when either TTS workflow or render workflow changes.
- Workflow QC requires exact equality of owner story and script, 4–10 scenes, 15–60 seconds, image prompts, and narration/dialogue/subtitles quoted verbatim from the owner story.
- Workflow generates per-scene WAV files using Edge TTS with Piper fallback, renders with Remotion, then validates H.264 1080×1920, 30 fps, 15–60 seconds, audio stream and full FFmpeg decode.
- Output artifact: `lerry-animasi-short`, retained for 7 days.
- `app/api/render/route.ts` validates a Supabase owner session, reads server-side `GITHUB_ACTIONS_TOKEN`, then dispatches the workflow on the experiment branch.
- `app/api/produce/route.ts` prefers FreeLLM when `FREELLM_BASE_URL` is configured and falls back to Gemini when `GEMINI_API_KEY` exists. If neither is configured, live storyboard generation returns 503. The route preserves exact owner story and rejects invented spoken/subtitle text.
- `src/remotion/SceneBackdrop.tsx` uses deterministic vector backdrops; it does not create unique AI scene artwork.
- `src/remotion/CharacterRig.tsx` is a stylized code-drawn 2D rig, not production-grade 3D character animation.
- Subtitle reveal is estimated from audio duration; phoneme alignment and lip-sync are not implemented.

## Remaining blockers before acceptance
1. Configure a valid FreeLLM gateway and its upstream provider credentials for Preview, or explicitly approve an alternative storyboard provider. The FreeLLM code path is not live until those values are configured.
2. Run the production `render-short.yml` workflow with a user-approved owner story; the isolated engine test and renderer smoke showcase do not prove full dashboard-to-MP4 acceptance.
3. Execute `supabase/schema.sql` in the intended Supabase project, then test email OTP login, RLS, save/read and private storage.
4. Verify `GITHUB_ACTIONS_TOKEN` by a real dispatch using an authenticated owner session. Do not use a fake owner story as final acceptance.
5. Use an owner-supplied final story for the first end-to-end render; inspect narration, timing, visual continuity, codec, dimensions, duration and full MP4 decode.
6. Improve visual specificity, character acting, subtitle timing and QC after owner review.
7. YouTube upload remains manual and approval-gated.

## Next task queue
- [x] Confirm GitHub/Vercel repository connection and READY Preview.
- [x] Confirm CI run #65 passed and uploaded its showcase artifact.
- [x] Register `GITHUB_ACTIONS_TOKEN` as a Preview Secret.
- [x] Add the Supabase publishable key to the experiment Preview environment.
- [x] Redeploy after the Preview key was added.
- [x] Correct misleading static readiness labels in the dashboard.
- [ ] Connect and test the FreeLLM gateway for storyboard generation.
- [ ] Execute Supabase schema and test auth/RLS/storage.
- [x] Verify Edge/Piper TTS Actions tests and renderer showcase/MP4 QC.
- [ ] Verify authenticated GitHub Actions dispatch and live per-scene narration with an owner story.
- [ ] Render and inspect an owner-approved final story.
- [ ] Obtain separate authorization before merge, Production deployment or YouTube publishing.

## Acceptance rule
A feature is not complete because code exists. It is complete only when its workflow ran, output artifact exists, and the artifact passes relevant inspection. `Built ≠ Tested ≠ Accepted ≠ Released`.
