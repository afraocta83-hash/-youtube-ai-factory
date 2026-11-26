# LERRY — CI and MP4 smoke acceptance 2026-11-27

## Verified result
- Build-check run #92 passed on commit 0187d02ead509868a613d9545d1b5012ea7697f7: https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45902067459
- TypeScript passed.
- Next.js production build passed.
- Remotion generated out/lerry-smoke.mp4 (20.011 seconds).
- ffprobe confirmed H.264, 1080x1920, 30 fps, and AAC audio.
- FFmpeg full decode passed.
- The exact MP4 was uploaded as artifact lerry-verified-mp4-smoke (artifact ID 15156587104; 3-day retention) and independently downloaded and re-checked.
- The smoke MP4 uses a generated test tone and fixture scenes. It proves the local renderer and codec pipeline; it is not a finished owner-story Short and does not validate live Groq generation or the dashboard-triggered render flow.
- The optional Promptfoo live Groq evaluation was skipped because GROQ_API_KEY is not available in the GitHub Actions job environment.

## No-cost agent decision
- No additional autonomous coding agent was installed. OpenHands and similar agents require persistent compute and an LLM endpoint; adding them would introduce a hosting/resource dependency and cannot currently be guaranteed at zero new cost.
- Keep existing internal production agents and the existing Remotion/FFmpeg pipeline. Promptfoo and Langfuse remain optional existing integrations; do not add duplicate agent runtimes.

## Remaining acceptance test
- Run the actual owner-approved render-short.yml workflow with a real schema-valid story package, Edge TTS/Piper, and upload-ready artifact. This requires a workflow_dispatch action with GitHub Actions write permission; the currently available GitHub connector in this session does not expose workflow dispatch.
- Live Groq, authenticated dashboard → render dispatch, and actual owner-story MP4 are not yet proven.
- No merge to main, production deployment, or YouTube upload has occurred.

---

# LERRY — Free MP4 and autonomous-agent review 2026-11-27

## New findings and corrective work
- Reviewed free MP4 candidates: Automated Video Generator (MIT, local stock-footage + TTS + Remotion export) and OpenMontage (agentic production system with free/open footage, Piper, Remotion/HyperFrames and FFmpeg paths).
- Kept the existing Lerry Remotion + FFmpeg renderer as the primary production engine. It already matches the locked 2D mascot direction and has a prior verified 1080x1920 H.264/30fps smoke render; replacing it with a stock-footage generator would regress the intended visual identity. OpenMontage's agentic skills remain a reference for future improvements, not a second runtime to install.
- OpenHands is a candidate autonomous engineering agent, but it is a self-hosted agent server, not a free hosted worker. It requires persistent compute and an LLM connection/API key. It cannot be honestly described as installed or running from the current Vercel/GitHub setup without those resources.
- Inspected latest available build-check run #89. It failed at TypeScript before Next build or MP4 smoke render. Exact errors were missing closing parentheses in app/api/render/route.ts and app/api/youtube/upload-session/route.ts around withAgentSpan(...fetch(...)).
- Fixed both syntax errors in commits 91f15b36c9556528bc5f5b4da89521540852a28e and fedc0cd2fda27d1265006f6aca293068148e0161.
- The GitHub connector in this session exposes workflow read/rerun actions but no workflow-dispatch action. The latest branch head was confirmed as fedc0cd2fda27d1265006f6aca293068148e0161; a new post-fix CI run has not yet been observed. Do not mark the fix or complete pipeline as verified until CI and a real owner-approved render pass.

## Free-resource decision
- Primary MP4 path: existing Remotion + FFmpeg + Edge TTS/Piper on GitHub Actions CPU.
- Free alternative for stock-footage videos: itsPremkumar/Automated-Video-Generator; not adopted because its output style and project integration differ from Lerry's locked character-animation workflow.
- Agentic production reference: OpenMontage; reuse only compatible skills/tools incrementally.
- Autonomous coding agent candidate: OpenHands; deployment is blocked on an always-on host/compute and a configured LLM endpoint. No paid plan, GPU, or new API service is authorized.

## Next acceptance gate
1. Run TypeScript and Next production build on the latest branch head.
2. Run Remotion/FFmpeg smoke render and inspect the resulting artifact.
3. Test the actual dashboard → approved render → MP4 artifact path with live owner session.
4. Confirm no hidden paid provider, watermark, or usage-based dependency.
5. Keep main, Production, and YouTube publishing untouched without separate approval.

---

# LERRY — Agent performance add-ons 2026-11-27

## Added to the existing production branch
- Added Langfuse + OpenTelemetry dependencies and optional Next.js instrumentation. Tracing is enabled only when `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` are present; otherwise it is no-op.
- Added `withAgentSpan` and traced Langflow storyboard calls, Groq fallback calls, storyboard schema validation, pre-render storyboard QC, GitHub Actions render dispatch, and owner-approved YouTube upload-session creation. Story text and credentials are not sent as trace attributes.
- Added Promptfoo configuration with one Groq regression case that checks JSON validity, 4-6 scenes, all required fields, non-empty narration, allowed character actions, and total duration. Existing build-check workflow runs it only when the repository Actions secret `GROQ_API_KEY` is present.
- Added Langfuse readiness to the dashboard agent registry and documented optional configuration in `.env.example` and `docs/AGENT_INTEGRATION.md`.
- Kept Langflow, Edge TTS/Piper, Remotion, FFmpeg, GitHub Actions, QC, and approval-gated YouTube upload as the production pipeline. No second agent runtime or separate worker platform was added.

## Selected vs. deferred
- Selected: Promptfoo (MIT) for regression/evaluation and Langfuse (MIT) for agent observability.
- Deferred: Mastra, LangGraph.js, CrewAI, Agno and Trigger.dev because they duplicate the existing orchestrator or add a separate runtime/hosting footprint.
- Excluded: Flowise because its curated platform directory reports end-of-life on 31 August 2026.

## Verification / deployment
- Static repository changes are committed on `experiment/openmontage-video-engine`; `main` remains untouched.
- No successful CI run has been observed for the newest changes. Earlier push-triggered workflow records were marked failed with no jobs returned; after the workflow condition was corrected, no newer GitHub Actions run appeared in the available run list.
- Latest commit combined status returned a Vercel failure with target URL indicating the build-rate limit requires a plan upgrade. Therefore no Preview deployment or production deployment is claimed.
- Langfuse traces require optional Langfuse keys. Promptfoo's live evaluation requires the GitHub Actions secret `GROQ_API_KEY`; if absent, that CI step is skipped.
- No live Langfuse ingestion, Promptfoo model call, Langflow production flow, YouTube OAuth connection, or real MP4 upload has been performed in this session.

---

# LERRY — Integration follow-up 2026-11-27

The initial integration note below predates the latest additions. Current state:
- Langflow execution adapter is now implemented in `lib/agents/langflow.ts`. When `LANGFLOW_BASE_URL` and `LANGFLOW_FLOW_ID` are set, `/api/produce` invokes the Langflow Flow API first; it validates the result using the existing production schema. Groq is the fallback when Groq keys are configured.
- YouTube OAuth and resumable upload endpoints are implemented. Studio includes connect/status/disconnect and an explicit per-upload approval flow. Default visibility is Private.
- Required YouTube hosting secrets: `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REDIRECT_URI`, `YOUTUBE_TOKEN_ENCRYPTION_KEY`.
- Langflow still needs a configured Flow ID and an actual run that returns the required Lerry JSON schema. YouTube still needs Google Cloud OAuth setup and a live connect/upload test.
- Latest observed build-check run for integration code: [run 45900828863](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45900828863), commit `35ac7d3e063e886066af477bc7f29a73bbb65f6f`; dependency installation was still running at last inspection. Earlier run `45900674970` passed TypeScript and Next.js production build, with Remotion smoke render still running.
- The later Langflow and documentation commits have separate build-check runs; their final results have not yet been observed.
- No Preview deploy, merge to `main`, Production deploy, or YouTube upload has been performed.

---

# LERRY — Unified Agent Integration 2026-11-27

Working branch: `experiment/openmontage-video-engine`; `main` remains untouched.

## Implemented in this change set
- Added a single production agent registry and `GET /api/agents`; the studio now displays each agent's readiness.
- Kept the current Groq → Edge TTS/Piper → Remotion → FFmpeg → QC pipeline as the production backbone. Langflow is optional and is not yet invoked as a live workflow service.
- Added YouTube OAuth connect/callback/status routes, encrypted refresh-token cookie storage, and a resumable upload-session endpoint.
- Added a dashboard publishing panel. Owner must connect YouTube, extract the MP4 from the artifact ZIP, select that MP4, and explicitly approve a separate upload. Upload defaults to Private.
- Added same-origin validation to the upload-session endpoint and documented the required OAuth secrets in `.env.example` and `docs/AGENT_INTEGRATION.md`.

## Verification state
- GitHub Actions build-check was automatically triggered by the commits. Latest observed run: [run 45900674970](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45900674970), commit `9d9d4f3cbfcb4e968928b6c6353946bc793e53a2`; at last inspection, dependency installation was in progress. TypeScript, Next build, and Remotion MP4 smoke test had not yet completed.
- Later commits also triggered build-check runs. The latest commit in this update series adds same-origin validation to the YouTube upload-session route; its CI result must be checked separately.
- No live Google OAuth connection or YouTube upload has been performed. The four YouTube OAuth secrets must be configured in hosting before the publisher can connect.
- No live Langflow flow is connected; it remains optional and the internal pipeline does not depend on it.
- No Preview deployment, merge to `main`, Production deployment, or YouTube publishing was performed.

## Required runtime configuration for YouTube
- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_REDIRECT_URI` (exact callback: `https://YOUR-DOMAIN/api/youtube/callback`)
- `YOUTUBE_TOKEN_ENCRYPTION_KEY` (32 random bytes encoded as 64 hex characters)

Keep all values as server-side hosting secrets. Never commit real credentials.

---

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


---

# LERRY — End-to-end production repair 2026-11-27

Working branch: `fix/lerry-end-to-end-production`. No changes to `main`, production deployment, or YouTube publishing.

## Implemented
- Restored the locked Lerry mascot design in `src/remotion/CharacterRig.tsx`: round white head, no nose/hair, expressive eyes and brows, slim body, blue shirt, black limbs/hands/shoes, bold outline.
- Aligned Groq storyboard art direction with the actual 2D SVG/vector renderer. Removed the contradictory 3D/photorealistic art direction. Added workshop, school, space and vehicle scene elements.
- Improved title contrast and scene-level subtitles. Subtitles remain visible for the matching scene; no false word-by-word timing is simulated without word timestamps.
- Made the owner story the source of truth: input is 80–3000 characters; AI must return the exact story and narration must be exact, ordered excerpts. Subtitles must be excerpts from the matching narration. The API rejects rewritten story or paraphrased narration.
- Strengthened pre-render QC for story lock, ordered narration, subtitles, actions, duration and visual prompts.
- Extended `.github/workflows/render-short.yml` to generate representative mid-scene frames, a contact sheet, thumbnail, YouTube metadata, MP4 metadata and `production-qc.json`. Artifact includes the MP4 and inspection materials.
- Added a non-production car-story fixture. Pushes on this isolated repair branch run the actual TTS → Remotion → FFmpeg → QC workflow and upload an artifact named `lerry-e2e-fixture`. This does not publish or deploy anything.

## Verified evidence
- E2E package-to-MP4 run #13: https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45904174744
- Artifact ID: `15157720882`; artifact name `lerry-e2e-fixture`; retained by GitHub until 2026-12-03.
- Edge TTS succeeded for all four scenes; per-scene durations were 4.18s, 4.25s, 3.60s and 4.73s.
- Remotion render, MP4 metadata checks, full FFmpeg decode, frame extraction, contact sheet, thumbnail, YouTube metadata and QC report all passed.
- Independently downloaded and inspected MP4: H.264, AAC, 1080x1920, yuv420p, 30 fps, 20.011 seconds; full decode passed.
- Build-check run #96: https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45903650829 — TypeScript, Next.js production build and Remotion smoke render passed.
- Build-check run for owner-story API and pre-render QC commit: https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45904342657 — passed.
- E2E render for the owner-story API/QC commit: https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45904342569 — passed.
- Exact-story E2E run #22: https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45904641904 — passed story lock, ordered verbatim narration, subtitle excerpts, Edge TTS, Remotion render, MP4 validation, full decode, frame sheet, metadata and QC.
- Final thumbnail-cleanup E2E run #25: https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45905286518 — passed the complete workflow including clean frame-based thumbnail generation, QC report and artifact upload.
- Final build-check run #116: https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45905286512 — TypeScript, Next.js production build and Remotion smoke render passed. Promptfoo live model evaluation was skipped because the GitHub Actions Groq secret is not configured.
- Final E2E artifact ID: `15157887255`, name `lerry-e2e-fixture`, size 2.83 MB, retained until 2026-12-03 22:32 UTC. The downloaded MP4 was independently inspected: H.264/AAC, 1080x1920, yuv420p, 30 fps, 31.019 seconds; full FFmpeg decode passed. The thumbnail was opened and visually checked; it is a clean representative frame without duplicate text overlays.
- Per-scene Edge TTS durations: 5.33s, 4.42s, 7.49s and 11.74s. The renderer expanded scene lengths to 6s, 5s, 8s and 12s respectively, avoiding clipped narration.

## Still not proven
- Live Groq/ Langflow request from the deployed studio through the owner-story validator. GitHub Actions has no `GROQ_API_KEY` secret, so Promptfoo's optional live model evaluation is skipped. The workflow fixture proves the production package-to-MP4 leg, not a live LLM response.
- Live dashboard `POST /api/render` → GitHub `workflow_dispatch` with the hosting `GITHUB_ACTIONS_TOKEN`. The GitHub connector does not expose workflow dispatch, and no live Preview dispatch was observed.
- Actual owner-authored story render and owner visual/audio acceptance.
- YouTube OAuth and upload. Publishing remains separate and requires owner approval.
- Bespoke AI image generation per scene and automatic external fact verification are not implemented. Current free-first visuals are deterministic 2D vector compositions.

## Cost and release boundary
- No new agent server, paid API, GPU, paid hosting, Supabase, or external rendering service was added.
- The fixture workflow uses GitHub Actions and free Edge TTS; Piper remains the fallback.
- `main`, production deployment and YouTube publishing remain untouched.
