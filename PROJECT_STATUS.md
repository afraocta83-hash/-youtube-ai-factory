# LERRY ANIMASI — Project Status

Last updated: 2026-11-26
Current stage: Groq + local-first implementation committed; automated build and live provider verification pending
Working branch: `experiment/openmontage-video-engine`
Base branch: `main`
Main remains isolated; no merge or Production deployment has been made.

## Safety boundary
- All experiment changes remain isolated on `experiment/openmontage-video-engine`.
- No merge to `main`, Production deployment, or YouTube publishing.
- No paid API, image/video generation provider, paid credits, or subscription was enabled.
- The owner supplies the final story; the AI must not rewrite it.

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
- Supabase has been removed from the runtime path and package dependencies.
- Login uses a signed HttpOnly SameSite cookie; `OWNER_PASSWORD` is the signing secret.
- The last 10 storyboard packages are saved in browser localStorage on the current device only.
- No SQL schema, database, email OTP or Supabase API keys are required.
- Local history does not sync across devices and can be lost when browser data is cleared.

## Automated production workers
- Producer: deterministic request orchestration.
- Storyboard + YouTube metadata: Groq GPT-OSS 120B, one call per story.
- Story-integrity QC: deterministic code; no second LLM judge call.
- Voice: Edge TTS Indonesian Ardi voice, Piper Indonesian fallback.
- Visual composition: Remotion with existing vector backdrops and simple 2D character rig. Generated image prompts are produced, but bespoke AI scene artwork is not yet generated.
- Render: GitHub Actions + Remotion + FFmpeg.
- Research/fact verification: not automated in this free-first version. Source queries may be suggested, but they are not verified sources.
- Publishing: manual only, owner approval required.

## Repository and infrastructure
- GitHub repository: https://github.com/afraocta83-hash/-youtube-ai-factory
- Working branch: `experiment/openmontage-video-engine`.
- Vercel project: `youtube-ai-factory`, linked to the GitHub repository.
- Previously verified Preview: https://youtube-ai-factory-3kizncjqw-afraocta83-9700.vercel.app (commit `71e98c5`, READY before current Groq/Supabase-removal changes).
- Latest current Preview build has not yet been verified.
- `GITHUB_ACTIONS_TOKEN` exists as a Vercel Preview Sensitive/Secret scoped to the experiment branch. Its Actions write permission still requires a real dispatch test.
- `GROQ_API_KEY` and `OWNER_PASSWORD` are not yet configured in Vercel Preview.
- Old Supabase/Gemini variables may still exist in Vercel settings, but the current Preview app no longer reads them.

## Previous verified CI evidence (before current Groq changes)
- Edge/Piper engine test: [run #3](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45847640236), successful. Edge generated a 7.97s Indonesian MP3; Piper generated an 8.25s Indonesian WAV. Both passed ffprobe and FFmpeg decode.
- Renderer showcase: [run #72](https://github.com/afraocta83-hash/-youtube-ai-factory/actions/runs/45848154496), successful. Dependency audit, TypeScript, Next.js build, QC API, offline storyboard fixture, Remotion compositions, showcase and Shorts smoke renders, FFmpeg decode, dimensions/FPS/duration and audio checks passed.
- Run #72 used a deterministic CI audio fixture, not owner-story production narration. It did not prove live LLM generation, authenticated dashboard dispatch or an owner-story MP4.

## Current implementation files
- `app/api/produce/route.ts`: Groq GPT-OSS 120B, strict JSON Schema, one call per story.
- `app/api/auth/*` and `lib/owner-auth.ts`: password-only owner session.
- `app/api/render/route.ts`: validates owner session and dispatches GitHub Actions.
- `app/api/quality-check/route.ts`: deterministic structural QC.
- `.github/workflows/render-short.yml`: Edge TTS primary, Piper fallback, Remotion MP4 render and FFmpeg QC.
- `.github/workflows/openmontage-motion-experiment.yml`: tests owner login and live Groq when GitHub secrets exist; otherwise tests auth rejection and uses a clearly labelled offline renderer fixture.
- `app/studio.tsx`: owner login, one-click storyboard, local history and render dispatch.

## Known limitations
- Visual backdrops are deterministic vectors; generated image prompts are not yet converted into bespoke scene art.
- Character rig is stylized 2D, not production-grade 3D.
- Subtitle timing is estimated; phoneme alignment and lip-sync are not implemented.
- Research/fact-check source retrieval is not automatic. The model's suggested source queries are not proof.
- The dashboard-to-GitHub dispatch and owner-story render need a live test.
- YouTube publishing remains manual and approval-gated.

## Remaining blockers before acceptance
1. Add `GROQ_API_KEY` and `OWNER_PASSWORD` to Vercel Preview as Sensitive/Secret values; never send them in chat.
2. Redeploy Preview and verify owner login plus one live storyboard generated from an owner-approved story.
3. Add the same two values as GitHub Actions secrets only if a live Groq CI test is desired; not required for production render workflow.
4. Test dashboard render dispatch using the existing `GITHUB_ACTIONS_TOKEN`.
5. Render an owner-approved story and inspect Edge/Piper audio, scene timing, MP4 codec, dimensions, duration, full decode and actual visual output.
6. Improve scene artwork, character acting, subtitle timing and research verification only within the free-first constraint.
7. Obtain separate authorization before merge, Production deployment or YouTube publishing.

## Acceptance rule
A feature is not complete because code exists. It is complete only when its workflow ran, output artifact exists, and the artifact passes relevant inspection. `Built ≠ Tested ≠ Accepted ≠ Released`.
