# LERRY ANIMASI — Shorts Factory

This repository turns a short owner idea into an Indonesian animated YouTube Shorts production package.

## Production contract
- Owner supplies only a short idea/topic (5-500 characters).
- Groq GPT-OSS 120B creates the story, hook, narration, dialogue, subtitles, 4-6 scene storyboard, visual prompts, sound cues, thumbnail prompt, and YouTube metadata.
- Owner reviews the generated story, scenes, and metadata before approving MP4 rendering.
- After rendering, owner must inspect the actual MP4. Upload/publishing is a separate step and is not automatic.
- Output target: MP4 H.264, 1080x1920, 30 fps, 15-60 seconds.
- Pipeline: Groq idea-to-story → deterministic package QC → explicit owner render approval → Edge TTS (Piper fallback) → Remotion animation → FFmpeg MP4 QC → GitHub Actions artifact.
- One Groq request per idea; strict JSON Schema; low reasoning effort; maximum completion budget 4,200 tokens.

## Owner setup
1. Add `GROQ_API_KEY` as the primary Vercel Preview Secret. Optional `GROQ_API_KEY2` and `GROQ_API_KEY3` act as backups when a key is rejected (HTTP 401/403). Add `OWNER_PASSWORD` as a Vercel Preview Secret; keep it private.
2. Keep `GITHUB_ACTIONS_TOKEN` as a server-side Vercel Secret with Actions: write permission.
3. Open the Preview app and sign in with the owner password.
4. Enter a short idea, generate the story and storyboard, then inspect all scenes and metadata.
5. Only when satisfied, press **Saya setujui — mulai render MP4**.
6. Open GitHub Actions and download the `lerry-animasi-short` artifact when the render completes.
7. Watch the entire MP4 and inspect audio, subtitles, visuals, and factual accuracy. Upload to YouTube only after your separate approval.

Detailed setup: [docs/GROQ_SETUP.md](docs/GROQ_SETUP.md)

## Free-first architecture
- Groq is the only LLM provider required by the app. One primary key is sufficient; up to two optional backup keys are supported.
- Edge TTS is primary; Piper is the fallback. Neither requires a paid TTS API key.
- Remotion and FFmpeg run in GitHub Actions.
- The last 10 production packages are stored in browser localStorage on the current device. No Supabase/database/OTP setup is required.
- The app does not use paid image/video providers by default.

## Current limitations
- Scene image prompts are generated, but the current Remotion renderer still uses deterministic vector backdrops and a simple 2D character rig. It does not yet create bespoke AI artwork for every scene or full 3D character acting.
- Subtitle timing is estimated; phoneme alignment and lip-sync are not implemented.
- Research/fact-check source retrieval is not automatic. Claims in educational/science stories still need manual verification.
- Dashboard-to-GitHub render dispatch and artifact handoff need a live owner-session test with configured secrets.
- YouTube OAuth upload integration is not implemented. Publishing remains manual and separately approval-gated.
