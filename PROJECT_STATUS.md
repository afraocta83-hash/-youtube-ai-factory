# LERRY — Delivery update 2026-11-27

Working branch: `experiment/openmontage-video-engine`. `main` remains untouched.

## Changes committed
- Removed the Agnes Docker/video API dependency and its required `AGNES_API_KEY`.
- Render job now uses Edge TTS with Piper fallback, then Remotion + FFmpeg on a standard GitHub Actions CPU runner.
- Render job validates H.264 1080×1920, 30 fps, audio stream, and full decode.
- Added a thumbnail JPG and YouTube metadata JSON to the render artifact.
- Added dashboard polling for workflow status and a direct signed artifact download link.
- Added CI smoke-test coverage for an MP4 with an audio stream.
- README and studio labels disclose that this is a template-driven 2D character animation renderer, not bespoke AI-generated 3D video.

## Current verification and blockers
- The last known successful GitHub Actions run is the earlier run `45887796281`; it tested the previous Agnes container health/build path, not the new Remotion MP4 smoke test.
- The new Remotion smoke test and the live owner-to-artifact flow have not yet been observed passing.
- The latest available Vercel Preview deployment is still commit `c30e8cb6ce8b529ee3700de2c32848591a352285`, not the latest experiment branch commits.
- Vercel rejected a new Preview deployment with HTTP 402 `api-deployments-free-per-day` and `retryAfter=86400`; the free daily deployment quota is exhausted. No paid upgrade was made.
- Vercel Preview environment metadata lists `GROQ_API_KEY`, optional backup keys, and `GITHUB_ACTIONS_TOKEN` as configured names. Secret values were not read, so their validity and GitHub permissions remain unverified.
- No YouTube OAuth uploader exists. The output package is prepared for manual upload; publishing remains separate.
- No merge to `main`, Production deployment, or YouTube upload was performed.

## Resource constraints
- The free path uses GitHub-hosted CPU runners and open-source Remotion/FFmpeg. It can render a deterministic animated MP4 without a paid video API.
- Realistic generative video models such as Wan require a capable GPU (roughly 8–16 GB VRAM depending on model/quantization) and large model storage; standard GitHub-hosted runners do not provide GPU acceleration. They are not installed in this cloud CPU pipeline.
- Intended owner workflow: enter idea, review story/storyboard, approve render, download package. No technical GitHub/hosting setup should be needed once Preview deployment and existing secrets are valid.

# LERRY — Update 2026-11-27

Current working branch: `experiment/openmontage-video-engine`.

- Removed the external Agnes Docker video engine from the approved render workflow.
- The render workflow now creates Indonesian narration with Edge TTS/Piper and renders the video locally with Remotion.
- `AGNES_API_KEY` is no longer required by the current workflow.
- Updated the build check to render and technically validate a local 1080x1920, 30 fps H.264 MP4 smoke artifact.
- This is a template-driven Remotion renderer with the existing 2D character rig, not generated 3D AI footage.
- The branch push should trigger the build-check workflow. A successful build check is not yet proof that the owner-facing live dashboard dispatch works.
- No changes to `main`, no Production deployment, and no YouTube upload.

# LERRY ANIMASI — Project Status

Last updated: 2026-11-27
Current stage: Idea-first flow implemented on the experiment branch; CI run #95 passed; Preview deployment is READY. Live Groq generation and authenticated owner-to-render flow still require a real owner-session test.
Working branch: `experiment/openmontage-video-engine`
Base branch: `main` (untouched; no merge or Production deployment).

## Latest implementation and verification
- Producer accepts a 5-500 character idea and asks Groq GPT-OSS 120B to create the story, hook, dialogue, narration, 4-6 scene storyboard, visual prompts, sound cues, thumbnail prompt and YouTube metadata. The result is saved as the generated story, not an owner-supplied script.
- Dashboard no longer dispatches render automatically. Owner reviews the generated story, scenes and metadata, then separately presses **Saya setujui — mulai render MP4**.
- Before dispatch, dashboard calls deterministic structural QC. GitHub render workflow validates the package, runs Edge TTS with Piper fallback, renders Remotion MP4 and runs FFmpeg/ffprobe technical checks.
- After MP4 render, owner must watch and inspect the artifact. YouTube upload is still manual; OAuth upload integration is not implemented.
- CI run #95: [successful](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45871656913). TypeScript, Next build, updated QC smoke tests, Remotion compositions, MP4 rendering, FFmpeg decode, 1080×1920 H.264, 30 fps, 16-second Short smoke render, audio stream and non-silent audio passed.
- CI run #95 did **not** test live Groq: GitHub Actions secrets `GROQ_API_KEY` and `OWNER_PASSWORD` are empty in that separate CI environment, so the workflow used an explicitly labelled offline fixture. This is not evidence of live AI generation.
- Preview deployment READY: `dpl_AGBdape5C66Xprmq3hNGkLqspcFd`, commit `717d5fadc28654b5e3dd5805e90d73a787754ab1`, URL https://youtube-ai-factory-39m57ffmb-afraocta83-9700.vercel.app. Homepage HTTP 200; `/api/auth/session` HTTP 200 and correctly reports unauthenticated when no owner cookie is present. Runtime error/warning logs: none found for the checked 30-minute window.
- Vercel Preview environment metadata lists `OWNER_PASSWORD`, `GROQ_API_KEY`, `GROQ_API_KEY2`, `GROQ_API_KEY3`, and `GITHUB_ACTIONS_TOKEN` for the experiment branch. Their secret values and provider/token permissions were not exposed or validated.
- Current renderer limitation: scene prompts are used with existing vector backdrops and a basic 2D character rig. Bespoke AI artwork per scene, full 3D animation, phoneme-aligned subtitles/lip-sync, automated fact research and YouTube OAuth upload are not implemented.
- Run #94 failed because the old smoke test still asserted the previous owner-authored-story QC contract. The CI tests were updated for idea-first behavior; run #95 then passed.
- No merge to `main`, Production deployment, or YouTube publishing has occurred.

# LERRY ANIMASI — Project Status

Last updated: 2026-11-26
Current stage: Groq primary/backup key fallback deployed to Preview; CI renderer run #88 passed; live owner login, live Groq generation, and dashboard-to-render acceptance still pending
Working branch: `experiment/openmontage-video-engine`
Base branch: `main`
Latest functional commits: `875a6cad9da019bde3a05dd03841304af2e530c3` (Groq key fallback) and `9c036cd45aa4faf4231800f7dcd0e20683f3b17f` (homepage status copy). Setup documentation commits: `615c1d3be28ee639608c370fda1f61b55c90a7e8` and `a6c1aa9bd01d85b5a361401f3875a44ddab5a6b1`.
Latest full renderer verification before this change: [run #85](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45851262617)
Latest renderer verification of the Groq fallback code: [run #88](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45862675017) — completed successfully. It passed TypeScript, Next.js build, QC tests, Remotion, MP4 render, FFmpeg decode, and artifact upload. Live Groq/login remained skipped because the separate GitHub Actions secrets were empty.
Latest verified Preview: https://youtube-ai-factory-47r2iw54f-afraocta83-9700.vercel.app — deployment `dpl_7jmjM3cNc32eviQtV8gPfD8MZnkf`, READY, built from `a6c1aa9`.
Main remains isolated; no merge or Production deployment has been made.

## Safety boundary
- All experiment changes remain isolated on `experiment/openmontage-video-engine`.
- No merge to `main`, Production deployment, or YouTube publishing.
- No paid API, image/video generation provider, paid credits, or subscription was enabled.
- Owner supplies a short idea; AI creates the story. Owner reviews before render and inspects the MP4 before any upload.

## Selected LLM and token controls
- Provider: Groq API, OpenAI-compatible endpoint.
- Model: `openai/gpt-oss-120b`.
- One LLM request per idea; strict JSON Schema; `reasoning_effort=low`; reasoning output disabled; maximum completion budget 3,200 tokens.
- Server-side deterministic QC validates generated story length, scene count, durations, narration/dialogue, visual prompts and metadata.
- Groq's documented baseline for GPT-OSS 120B: 30 RPM, 1,000 RPD, 8,000 TPM and 200,000 TPD; actual quotas may vary by account and change over time.
- Vercel Preview environment metadata lists GROQ_API_KEY and backups; secret values and a live generation request remain unverified.
- Vercel Preview environment metadata lists OWNER_PASSWORD; live owner login remains unverified until tested with the owner's password.
- Existing `GITHUB_ACTIONS_TOKEN` is present as a server-side Sensitive/Secret for Preview branch `experiment/openmontage-video-engine`; its Actions:write permission and live dispatch have not been proven.

## Supabase removal
- Supabase has been removed from the runtime path, package dependencies and setup docs.
- Login uses a signed HttpOnly SameSite cookie; `OWNER_PASSWORD` is the signing secret.
- The last 10 storyboard packages are saved in browser localStorage on the current device only.
- No SQL schema, database, email OTP or Supabase API keys are required.
- Local history does not sync across devices and can be lost when browser data is cleared.
- A legacy Supabase publishable key may remain in Vercel settings but is unused by the current app.

## Automated production workers
- Producer: accepts idea and creates a reviewable story/storyboard draft. Render dispatch occurs only after explicit owner approval.
- Story + storyboard + YouTube metadata: Groq GPT-OSS 120B, one call per idea.
- Structural story QC: deterministic code; no second LLM judge call.
- Voice: Edge TTS Indonesian Ardi voice, Piper Indonesian fallback.
- Visual composition: Remotion uses generated visual prompts to select scene backdrops, with existing vector art and a simple 2D character rig. Bespoke AI images per scene are not generated yet.
- Render: GitHub Actions + Remotion + FFmpeg.
- Research/fact verification: not automated in this free-first version. The model can suggest search queries and claims to check, but those suggestions are not verified sources.
- Publishing: manual only, owner approval required.

## Repository and infrastructure
- GitHub repository: https://github.com/afraocta83-hash/-youtube-ai-factory (public).
- Working branch: `experiment/openmontage-video-engine`, 136 commits ahead and 0 behind `main` at last compare.
- Vercel project: `youtube-ai-factory`, linked to the GitHub repository.
- Latest Preview for the login-throttling code commit: https://youtube-ai-factory-p3879p550-afraocta83-9700.vercel.app
- Deployment ID: `dpl_CUDV6kU8YaDis842e73u27NjoEMK`, state READY, built from `b7fc2ab`.
- Vercel Preview environment metadata (listed without decrypting values) confirms `GITHUB_ACTIONS_TOKEN` exists as Sensitive/Secret scoped to the experiment branch.
- `GROQ_API_KEY` and `OWNER_PASSWORD` are not present in the listed Vercel Preview environment variables.
- A legacy `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` variable is still present but unused by the current runtime. It is public by design and is not treated as a secret.

## CI and Preview verification
- Latest full renderer run before login-throttling change: [run #85](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45851262617), successful on 2026-11-26.
- Run #85 passed dependency audit, TypeScript, Next.js build, unauthenticated API rejection, QC acceptance/rejection tests, Remotion compositions, two MP4 renders, FFmpeg decode, 1080×1920, 30 fps, 15s showcase and 16s Shorts smoke output, audio stream and non-silent audio check (-28 dB).
- Run #85 artifact: `lerry-openmontage-motion-showcase` (ID `15132863861`, expires 2026-12-03).
- Run #85 deliberately used an offline fixture because `GROQ_API_KEY` and `OWNER_PASSWORD` are not configured in GitHub Actions. It proves renderer and security preflight work, not live AI generation.
- Latest Edge/Piper engine run: [run #4](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45851073085), successful. Both Indonesian TTS engines generated and verified audio. Artifact `lerry-indonesian-tts-test` (ID `15134057074`, expires 2026-12-03).
- Login throttling commit `b7fc2ab`: run #87 passed.\n- Groq fallback commit `875a6cad`: run #88 passed dependency audit, TypeScript, Next.js build, QC acceptance/rejection, Remotion compositions, two MP4 renders, FFmpeg decode, H.264 1080×1920 30fps output, audio stream, non-silent audio (-28 dB), and artifact upload. The 15-second motion showcase and 16-second Short smoke render were verified.\n- Run #88 explicitly skipped live Groq and owner login because GitHub Actions `GROQ_API_KEY` and `OWNER_PASSWORD` secrets were empty; it used an offline fixture. The Vercel Preview secrets are separate.
- The CI fixture audio is deterministic test audio, not actual production narration.

## Security hardening
- Owner login now applies best-effort per-instance throttling: five failed attempts per IP within a 15-minute window return HTTP 429 with Retry-After.
- The limiter uses Vercel's `x-real-ip` header, avoids trusting client-supplied `X-Forwarded-For`, and bounds its in-memory map.
- This is a low-cost friction layer, not a globally shared rate limiter. Serverless instances may have independent memory; a distributed limiter would require an external shared store, which is intentionally not added under the free/no-extra-service constraint.

## Current implementation files
- `app/api/produce/route.ts`: Groq GPT-OSS 120B, strict JSON Schema, one call per story.
- `app/api/auth/*` and `lib/owner-auth.ts`: password-only owner session.
- `app/api/auth/login/route.ts`: owner login with best-effort throttling.
- `app/api/render/route.ts`: validates owner session and dispatches GitHub Actions.
- `app/api/quality-check/route.ts`: deterministic structural QC.
- `.github/workflows/render-short.yml`: Edge TTS primary, Piper fallback, scene audio duration fit, Remotion MP4 render and FFmpeg QC.
- `.github/workflows/openmontage-motion-experiment.yml`: tests owner authentication and live Groq when GitHub secrets exist; otherwise tests unauthenticated rejection and uses a clearly labelled offline renderer fixture.
- `app/studio.tsx`: owner login, one-click storyboard + render dispatch, local history and render retry.
- Gemini TTS and research routes have been removed from the runtime path.

## Known limitations
- Visual backdrops are deterministic vectors; generated image prompts guide scene selection but are not converted into bespoke AI artwork.
- Character rig is stylized 2D, not production-grade 3D.
- Subtitle timing is estimated; phoneme alignment and lip-sync are not implemented.
- Research/fact-check source retrieval is not automatic. Suggested search queries are not proof.
- Live Groq generation and authenticated dashboard-to-GitHub dispatch still need a successful owner login and a real idea submission. Vercel Preview secrets are present by metadata, but their values and provider permissions remain unverified. GitHub Actions CI secrets are separately absent.
- Login throttling is best-effort per runtime instance, not globally coordinated.
- YouTube publishing remains manual and approval-gated.

## Remaining blockers before acceptance
1. Add `GROQ_API_KEY` as a Sensitive/Secret in Vercel Preview for branch `experiment/openmontage-video-engine`; never send it in chat.
2. Set `OWNER_PASSWORD` as a Sensitive/Secret (minimum 24 characters); keep it private.
3. Redeploy Preview and verify owner login plus one live storyboard generated from an owner-approved story.
4. Test dashboard render dispatch using the existing `GITHUB_ACTIONS_TOKEN`; verify Actions:write without exposing the token.
5. Render an owner-approved story and inspect actual Edge/Piper narration, scene timing, MP4 codec, dimensions, duration, full decode and visual output.
6. Improve bespoke scene artwork, character acting, subtitle timing and research verification only within the free-first constraint.
7. Obtain separate authorization before merge, Production deployment or YouTube publishing.

## Acceptance rule
A feature is not complete because code exists. It is complete only when its workflow ran, output artifact exists, and the artifact passes relevant inspection. Offline CI fixtures prove renderer mechanics only; they do not prove live LLM or real narration.
