# Lerry Animasi — Project Status

Last updated: 2026-11-26
Current stage: Preview build passed; CI showcase passed; live external-service integration and owner-story render remain unverified
Working branch: `experiment/openmontage-video-engine`
Base branch: `main`
Latest reviewed experiment commit: `49f70b983064117de8ff1112732d694ce601cb67`
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
- FreeLLM currently covers storyboard generation only. The render workflow now uses Edge TTS as the primary Indonesian narration engine and Piper as automatic fallback; neither requires a Gemini API key. The render-engine integration is committed but still awaits a successful Actions run and an owner-story render.
- No Production deployment or merge to `main`.

## Current infrastructure — verified
- GitHub repository: https://github.com/afraocta83-hash/-youtube-ai-factory
- Vercel project: `youtube-ai-factory`, linked to the GitHub repository.
- Latest Preview deployment: https://youtube-ai-factory-hgkt9oqf1-afraocta83-9700.vercel.app
- Deployment ID: `dpl_AmhWXgwZtydwZMFnfV8eRjhLEHhU`; state `READY`.
- Latest Preview built from `experiment/openmontage-video-engine`, commit `cdce0b7f0602b20169b36f31aafb7626444e23cf`.
- Vercel build log confirms Next.js compilation, type validation, static generation, serverless function creation and deployment completion.
- Vercel Preview environment metadata confirms:
  - `NEXT_PUBLIC_SUPABASE_URL` exists.
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` exists, scoped to `experiment/openmontage-video-engine`.
  - `GITHUB_ACTIONS_TOKEN` exists as a Sensitive/Secret, scoped to the experiment branch.
  - `GEMINI_API_KEY` is still absent from Preview.
  - `GEMINI_MODEL=gemini-3.8-flash` exists.
- Production metadata has its own Supabase and Gemini variables. Secret values were not copied or exposed.
- Presence of the GitHub token metadata does not prove its contents or Actions write permission; a real authenticated dispatch is still required.
- Supabase project URL: https://ppgkyqqhthfdmvbeihvm.supabase.co
- `supabase/schema.sql` exists, but has not been executed in Supabase. Database table, RLS and private bucket are therefore not yet verified.

## CI and Preview verification
- Core renderer CI: [run #65](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45833196730), successful on its earlier deterministic fixture.
- Edge/Piper engine test: [run #2](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45846870145), successful on 2026-11-26. Both Indonesian audio files were generated, probed, fully decoded by FFmpeg and uploaded as artifact `lerry-indonesian-tts-test` (artifact ID `15131952752`, expires 2026-12-03).
- Latest motion showcase run before CI resilience patch: [run #67](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45846855315), failed because Gemini returned HTTP 502 (temporary high demand) during live storyboard generation. TypeScript and Next.js build had passed; renderer steps were skipped. A follow-up workflow change now permits a clearly labeled offline fixture for renderer-only CI when the live provider is unavailable. The follow-up run is pending verification.
- Passed: dependency audit, TypeScript, Next.js build, QC/storyboard smoke checks, deterministic local audio fixture, Remotion composition checks, five-action showcase render, FFmpeg MP4 validation and artifact upload.
- Run #65's audio fixture is deterministic CI audio. It does not verify current live per-scene Gemini TTS or the dashboard-to-GitHub dispatch path.
- Latest Vercel Preview commit `cdce0b7` compiled successfully, passed type checking and completed deployment; deployment state is `READY`.
- The Preview UI was previously fetched successfully. The latest deployment could not be fetched by the inspection connector because Vercel Authentication returned an SSO redirect; do not claim a full browser/UI acceptance test from this.
- This pass corrected static dashboard labels that previously implied Gemini and YouTube integrations were active. They now show verification/approval-gated states.

## Render pipeline architecture
- `.github/workflows/render-short.yml` accepts a production JSON payload through `workflow_dispatch`.
- TTS runtime installs Edge TTS and Piper in GitHub Actions. Edge voice: `id-ID-ArdiNeural`; Piper fallback model: Indonesian `id_ID-news_tts-medium`. If Edge generation or MP3-to-WAV conversion fails for a scene, the job attempts Piper for that scene. Kokoro is intentionally excluded.
- Dedicated Edge/Piper generation, ffprobe and FFmpeg decode tests passed in Actions run #2. Full production workflow still requires an owner-story render.
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
2. Verify the Edge/Piper TTS test workflow passes and render a user-approved owner story. TTS tests do not prove full dashboard-to-MP4 acceptance.
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
- [ ] Verify Edge/Piper Actions tests, authenticated GitHub Actions dispatch and live per-scene narration.
- [ ] Render and inspect an owner-approved final story.
- [ ] Obtain separate authorization before merge, Production deployment or YouTube publishing.

## Acceptance rule
A feature is not complete because code exists. It is complete only when its workflow ran, output artifact exists, and the artifact passes relevant inspection. `Built ≠ Tested ≠ Accepted ≠ Released`.
