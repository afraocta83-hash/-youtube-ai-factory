# Lerry Animasi — Project Status

Last updated: 2026-11-26
Current stage: experiment preview deployed; CI render pipeline passes; external-service and owner-story acceptance remain
Working branch: `experiment/openmontage-video-engine`
Base branch: `main`
Branch comparison at last verified audit: 83 commits ahead, 0 behind
Main HEAD at last verified audit: `db295ed51181d8ff969fe2ebea96891b4394cb45`
Experiment HEAD: `d6f085fa2ddc820475fd43af90cb66183ddbacb4`

## Safety boundary
- All experiment changes remain isolated on `experiment/openmontage-video-engine`.
- `main` has not been merged or changed by this work.
- Dashboard and office visuals were not redesigned.
- No YouTube upload or publishing was performed.
- No paid image/video provider was enabled.
- No Production deployment was performed.

## Current infrastructure — verified
- GitHub repository: https://github.com/afraocta83-hash/-youtube-ai-factory
- Vercel project: `youtube-ai-factory`, linked to the GitHub repository.
- Preview deployment: https://youtube-ai-factory-1mywv0k4b-afraocta83-9700.vercel.app
- Preview deployment ID: `dpl_7FoFwPVUSsSbTBhQUmp4MjNemCfB`; state `READY`.
- Preview was built from `experiment/openmontage-video-engine`, commit `d6f085fa2ddc820475fd43af90cb66183ddbacb4`.
- Vercel environment metadata confirms `GITHUB_ACTIONS_TOKEN` is configured as a Secret for both Preview (branch-scoped to the experiment branch) and Production. Its value is hidden; token validity and Actions permission have not yet been tested by a real dispatch.
- Preview has `NEXT_PUBLIC_SUPABASE_URL`.
- Preview is missing `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `GEMINI_API_KEY`.
- Production has metadata entries for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `GEMINI_API_KEY`; secret values were not inspected.
- `GEMINI_MODEL=gemini-3.8-flash` is configured for Preview and Production.
- Supabase project URL: https://ppgkyqqhthfdmvbeihvm.supabase.co
- Supabase schema file exists at `supabase/schema.sql`; execution in Supabase SQL Editor, RLS behavior, private bucket and storage operations are not verified.

## CI verification
- Latest workflow run: [run #65](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45833196730).
- Run #65 completed successfully on commit `d6f085fa2ddc820475fd43af90cb66183ddbacb4`.
- Passed: checkout, Node setup, dependency installation/audit, TypeScript, Next.js build, QC and storyboard smoke tests, deterministic local audio fixture, Remotion composition checks, five-action motion showcase render, FFmpeg installation, MP4 validation and artifact upload.
- Important limitation: run #65 uses a deterministic local PCM audio fixture for CI. It does not prove live per-scene Gemini TTS is working in the current render workflow.
- Earlier live TTS/storyboard testing and an earlier rendered MP4 are recorded in prior project history; the latest multi-scene TTS workflow still needs a fresh live run and artifact inspection.
- Motion showcase artifact from earlier run: `lerry-openmontage-motion-showcase`, ID `15122602232`, expires 2026-12-03. Its vector environments and 2D rig are proof-of-concept, not final animation quality.

## Render pipeline architecture
- `.github/workflows/render-short.yml` accepts a production JSON payload through `workflow_dispatch`.
- Workflow QC requires the owner story and script to match exactly, 4–10 scenes, 15–60 seconds, image prompts, and narration/dialogue/subtitles quoted verbatim from the owner's story.
- Workflow requests per-scene Indonesian narration from Gemini TTS using `GEMINI_API_KEY`, writes scene WAV files, renders with Remotion and validates H.264 1080×1920, 30 fps, 15–60 seconds, audio stream and full FFmpeg decode.
- Output artifact name: `lerry-animasi-short`, retained for 7 days.
- `app/api/render/route.ts` validates a Supabase owner session, reads the server-side `GITHUB_ACTIONS_TOKEN`, and dispatches the workflow on the experiment branch.
- `app/api/produce/route.ts` generates storyboard/metadata while preserving the exact owner story and rejecting invented spoken/subtitle text.
- `src/remotion/SceneBackdrop.tsx` uses deterministic vector backdrops (library, treasure/chest, nature, room, city and fallback); it does not yet generate unique AI scene artwork.
- `src/remotion/CharacterRig.tsx` is a stylized code-drawn 2D character rig with secondary motion, blinking, anticipation and walk/run travel; it is not full 3D animation or production-grade acting.
- Subtitle reveal is estimated from audio duration, not phoneme-level forced alignment. Lip-sync is not implemented.

## Remaining blockers
1. Add the Supabase publishable key to the Preview environment. It is a browser-safe public key, unlike server secrets.
2. Decide whether to add a Gemini API key to Preview. Do not copy or expose a Production secret automatically; confirm the intended key and free/paid usage constraints first.
3. Verify the GitHub repository Actions secret `GEMINI_API_KEY` exists and is usable by the live render workflow. The CI fixture run does not prove this.
4. Execute `supabase/schema.sql` in the intended Supabase project, then test owner login, RLS, save/read and private storage.
5. Redeploy Preview after required environment variables are configured; existing deployments do not automatically receive newly added environment values.
6. Run a real dispatch from the Preview dashboard with a final story supplied and approved by the owner. Verify GitHub accepts the token and workflow dispatch, then inspect the MP4 artifact.
7. Improve scene-specific visuals, character acting, subtitle timing and visual QC after the first owner-approved end-to-end render.
8. YouTube publishing remains manual and approval-gated.

## Next task queue
- [x] Verify Vercel Git integration and a READY Preview deployment.
- [x] Verify latest CI run #65 and its MP4 showcase pipeline.
- [x] Register `GITHUB_ACTIONS_TOKEN` as a Secret in Preview and Production metadata.
- [x] Update this status file to match the current infrastructure and known blockers.
- [ ] Configure the missing Preview Supabase publishable key.
- [ ] Complete Supabase SQL/auth/storage setup.
- [ ] Verify GitHub Actions token by a real, owner-approved dispatch.
- [ ] Verify live per-scene TTS and inspect the resulting Shorts MP4.
- [ ] Obtain owner acceptance before any merge, Production deployment or YouTube publishing.

## Acceptance rule
A feature is not complete because code exists. It is complete only when its workflow ran, output artifact exists, and the artifact passes the relevant inspection. `Built ≠ Tested ≠ Accepted ≠ Released`.
