# LERRY ANIMASI — Project Status

Last updated: 2026-11-26
Current stage: free-first Groq/local-first pipeline implemented; renderer CI previously verified; owner login throttling added; live Groq and owner-session render acceptance pending
Working branch: `experiment/openmontage-video-engine`
Base branch: `main`
Latest functional code commit: `b7fc2ab0dfba0afdcb017b9c8527e3e9255f60a9` (best-effort owner login throttling)
Latest full renderer verification before this change: [run #85](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45851262617)
Latest verification of login-throttling change: [run #87](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45853996339) — in progress at time of this report; TypeScript, Next.js build, API/QC smoke tests and Remotion composition verification passed; MP4 render and FFmpeg checks still running.
Preview for functional code commit: https://youtube-ai-factory-p3879p550-afraocta83-9700.vercel.app — deployment `dpl_CUDV6kU8YaDis842e73u27NjoEMK`, READY.
Main remains isolated; no merge or Production deployment has been made.

## Safety boundary
- All experiment changes remain isolated on `experiment/openmontage-video-engine`.
- No merge to `main`, Production deployment, or YouTube publishing.
- No paid API, image/video generation provider, paid credits, or subscription was enabled.
- Owner supplies the final story; AI must not rewrite it.

## Selected LLM and token controls
- Provider: Groq API, OpenAI-compatible endpoint.
- Model: `openai/gpt-oss-120b`.
- One LLM request per story; strict JSON Schema; `reasoning_effort=low`; reasoning output disabled; maximum completion budget 3,200 tokens.
- Server-side deterministic validation preserves the owner story and rejects invented narration, dialogue, subtitles or hook text.
- Groq's documented baseline for GPT-OSS 120B: 30 RPM, 1,000 RPD, 8,000 TPM and 200,000 TPD; actual quotas may vary by account and change over time.
- `GROQ_API_KEY` is not configured in Vercel Preview. Live storyboard generation is therefore not verified.
- `OWNER_PASSWORD` is not configured in Vercel Preview. Owner login is therefore not activated.
- Existing `GITHUB_ACTIONS_TOKEN` is present as a server-side Sensitive/Secret for Preview branch `experiment/openmontage-video-engine`; its Actions:write permission and live dispatch have not been proven.

## Supabase removal
- Supabase has been removed from the runtime path, package dependencies and setup docs.
- Login uses a signed HttpOnly SameSite cookie; `OWNER_PASSWORD` is the signing secret.
- The last 10 storyboard packages are saved in browser localStorage on the current device only.
- No SQL schema, database, email OTP or Supabase API keys are required.
- Local history does not sync across devices and can be lost when browser data is cleared.
- A legacy Supabase publishable key may remain in Vercel settings but is unused by the current app.

## Automated production workers
- Producer: deterministic request orchestration. One click creates storyboard and automatically dispatches MP4 render.
- Storyboard + YouTube metadata: Groq GPT-OSS 120B, one call per story.
- Story-integrity QC: deterministic code; no second LLM judge call.
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
- Login throttling commit `b7fc2ab`: run #87 is in progress. At last check, dependency audit, TypeScript, Next.js build, API/QC smoke tests, deterministic audio fixture and Remotion composition verification passed; the render and FFmpeg checks had not yet completed.
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
- Live Groq generation and authenticated dashboard-to-GitHub dispatch still need account secrets and a real owner story.
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
