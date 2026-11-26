# LERRY ANIMASI — Shorts Factory

This repository turns a short owner idea into an Indonesian animated YouTube Shorts production package.

## Production contract
- Owner supplies only a short idea/topic (5-500 characters).
- Groq GPT-OSS 120B creates the story, hook, narration, dialogue, subtitles, 4-6 scene storyboard, visual prompts, sound cues, thumbnail prompt, and YouTube metadata.
- Owner reviews the generated story, scenes, and metadata before approving MP4 rendering.
- After rendering, owner must inspect the actual MP4. Upload/publishing is a separate step and is not automatic.
- Output target: MP4 H.264, 1080x1920, 30 fps, 15-60 seconds.
- Pipeline: Groq idea-to-story → deterministic package QC → explicit owner render approval → Edge TTS (Piper fallback) → local Remotion animation → MP4 QC → thumbnail and YouTube metadata packaging → GitHub Actions artifact.
- One Groq request per idea; strict JSON Schema; low reasoning effort; maximum completion budget 4,200 tokens.

## Owner setup
1. Add `GROQ_API_KEY` as the primary hosting Preview secret. Optional `GROQ_API_KEY2` and `GROQ_API_KEY3` act as backups when a key is rejected (HTTP 401/403).
2. Keep `GITHUB_ACTIONS_TOKEN` as a server-side hosting secret with Actions: write permission.
3. No video-provider API key is required. The current render workflow uses the local Remotion engine.
4. Open the Preview app and enter a short idea.
5. Inspect the generated story, storyboard, and metadata.
6. Only when satisfied, press **Saya setujui — mulai render MP4**.
7. The dashboard checks render progress automatically and offers one download link for the MP4, thumbnail, and YouTube metadata when complete.
8. Watch the entire MP4 and inspect audio, subtitles, visuals, and factual accuracy. Upload to YouTube only after your separate approval.

Detailed setup: [docs/GROQ_SETUP.md](docs/GROQ_SETUP.md)

## Free-first architecture
- Groq is the only LLM provider required by the app. One primary key is sufficient; up to two optional backup keys are supported.
- Edge TTS is primary; Piper is the fallback. Neither requires a paid TTS API key.
- Remotion renders scene animation locally inside GitHub Actions; Edge TTS/Piper creates Indonesian narration and Remotion assembles the vertical MP4. No external video API key is required.
- The last 10 production packages are stored in browser localStorage on the current device. No Supabase/database/OTP setup is required.
- No paid image/video API is integrated. The renderer runs on standard GitHub-hosted CPU runners; public-repository Actions usage is free under GitHub's current policy.

## Current limitations
- The current free renderer uses Remotion scene compositions and a reusable 2D character rig; it does not generate bespoke AI video footage. Character animation and scene visuals are template-driven.
- Narration is generated with Edge TTS (Piper fallback); subtitles are burned per scene. Phoneme alignment and lip-sync are not implemented.
- Research/fact-check source retrieval is not automatic. Claims in educational/science stories still need manual verification.
- The full live dashboard-to-MP4 flow still needs a successful end-to-end run on the deployed Preview. CI smoke tests validate the local Remotion MP4 path.
- YouTube OAuth upload integration is not implemented. Publishing remains manual and separately approval-gated.
