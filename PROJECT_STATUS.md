# LERRY ANIMASI — Project Status

Last updated: 2026-11-26
Current stage: Groq + local-first architecture implemented; renderer CI and Preview build verified; live Groq story test pending
Working branch: `experiment/openmontage-video-engine`
Base branch: `main`
Latest fully CI-reviewed code commit: `b826bffbb1f0e356179b5249d333b62201612e13`
Latest branch HEAD: `00e73cdc4a779634a8a045bfdc6a8550f85a73c2` (UI wording correction; new Preview build pending)
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
- `GROQ_API_KEY` is not yet configured in Vercel Preview. Live storyboard generation is therefore not verified.
- One additional owner credential is needed: `OWNER_PASSWORD` (minimum 24 characters). This is a password, not an API key.
- Existing `GITHUB_ACTIONS_TOKEN` remains a server-side Secret for render dispatch.

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
- Working branch: `experiment/openmontage-video-engine`, 133 commits ahead and 0 behind `main` at last compare.
- Vercel project: `youtube-ai-factory`, linked to the GitHub repository.
- Latest verified Preview: https://youtube-ai-factory-1sbentpkt-afraocta83-9700.vercel.app
- Deployment ID: `dpl_7YDcaiNZnnoBWy4mb8GN3u6mFWRG`, state READY, built from `b826bff`.
- Latest branch HEAD `00e73cd` changes only labels for unverified research notes; its Preview redeployment is pending.
- Vercel Preview environment metadata confirms `GITHUB_ACTIONS_TOKEN` exists as a Sensitive/Secret scoped to the experiment branch.
- `GROQ_API_KEY` and `OWNER_PASSWORD` are not yet configured in Vercel Preview.
- Existing GitHub token presence does not prove Actions write permission; a real dashboard dispatch remains required.

## CI and Preview verification
- Latest full renderer run: [run #85](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45851262617), successful on 2026-11-26.
- Run #85 passed dependency audit, TypeScript, Next.js build, unauthenticated API rejection, QC acceptance/rejection tests, Remotion compositions, two MP4 renders, FFmpeg decode, 1080×1920, 30 fps, 15s showcase and 16s Shorts smoke output, audio stream and non-silent audio check (-28 dB).
- Run #85 artifact: `lerry-openmontage-motion-showcase` (ID `15132863861`, expires 2026-12-03).
- Run #85 deliberately used an offline fixture because `GROQ_API_KEY` and `OWNER_PASSWORD` are not configured in GitHub Actions. It proves renderer and security preflight work, not live AI generation.
- Latest Edge/Piper engine run: [run #4](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45851073085), successful. Both Indonesian TTS engines generated and verified audio. Artifact `lerry-indonesian-tts-test` (ID `15134057074`, expires 2026-12-03).
- Earlier renderer run #72 also passed. The current run #85 includes the Groq/auth/local-history changes and automatic render dispatch UI.
- The CI fixture audio is deterministic test audio, not actual production narration.

## Current implementation files
- `app/api/produce/route.ts`: Groq GPT-OSS 120B, strict JSON Schema, one call per story.
- `app/api/auth/*` and `lib/owner-auth.ts`: password-only owner session.
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
- YouTube publishing remains manual and approval-gated.

## Remaining blockers before acceptance
1. Add `GROQ_API_KEY` and `OWNER_PASSWORD` to Vercel Preview as Sensitive/Secret values; never send them in chat.
2. Redeploy Preview and verify owner login plus one live storyboard generated from an owner-approved story.
3. Add the same two values as GitHub Actions secrets only if a live Groq CI test is desired; not required for production render workflow.
4. Test dashboard render dispatch using the existing `GITHUB_ACTIONS_TOKEN`.
5. Render an owner-approved story and inspect actual Edge/Piper narration, scene timing, MP4 codec, dimensions, duration, full decode and visual output.
6. Improve bespoke scene artwork, character acting, subtitle timing and research verification only within the free-first constraint.
7. Obtain separate authorization before merge, Production deployment or YouTube publishing.

## Acceptance rule
A feature is not complete because code exists. It is complete only when its workflow ran, output artifact exists, and the artifact passes relevant inspection. `Built ≠ Tested ≠ Accepted ≠ Released`.
