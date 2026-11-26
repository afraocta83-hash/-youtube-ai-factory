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

## Runtime configuration
- The Preview runtime expects `GROQ_API_KEY` (optional backups: `GROQ_API_KEY2`, `GROQ_API_KEY3`) and server-side `GITHUB_ACTIONS_TOKEN` with Actions read/write permission. These are hosting secrets, never browser values.
- No Agnes or other video-provider API key is required. The current render workflow uses Remotion on GitHub's standard CPU runner.
- Normal use requires no GitHub or hosting dashboard work: enter an idea, review the story and storyboard, approve the render, then download the completed package from the studio.
- The studio checks render progress and packages the MP4, thumbnail, and YouTube metadata. Inspect the complete video before uploading; YouTube publishing remains manual.

Detailed configuration reference: [docs/GROQ_SETUP.md](docs/GROQ_SETUP.md)

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
