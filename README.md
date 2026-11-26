# LERRY ANIMASI — Shorts Factory

This repository turns owner-authored Indonesian stories into short vertical cartoon videos.

## Production contract
- Owner supplies the complete final story. AI only divides it into scenes and production instructions; it must not invent, rewrite, shorten, or change the plot, dialogue, or ending.
- Output target: MP4 H.264, 1080x1920, 30 fps, 15–60 seconds.
- Pipeline: Groq GPT-OSS 120B storyboard + metadata → deterministic text/story QC → Edge TTS (Piper fallback) → Remotion animation → FFmpeg MP4 QC → GitHub Actions artifact.
- One Groq request per story; strict JSON Schema; low reasoning effort; maximum completion budget 3,200 tokens.
- No YouTube upload is performed. Owner reviews and approves the MP4 and metadata separately.

## Owner setup
1. Add `GROQ_API_KEY` and `OWNER_PASSWORD` as Vercel Preview Secrets. Owner password must be at least 24 characters.
2. Keep `GITHUB_ACTIONS_TOKEN` as a server-side Vercel Secret with Actions: write permission.
3. Open the Preview app, sign in with the owner password, and paste the final story.
4. Generate the storyboard and inspect the locked story, narration, subtitles and metadata.
5. Press **Produksi Shorts otomatis**. Storyboard, TTS and MP4 render are dispatched automatically in one production run.
6. Open GitHub Actions and download the `lerry-animasi-short` artifact when the render completes.
7. Review the MP4 and metadata before publishing manually to YouTube.

Detailed setup: [docs/GROQ_SETUP.md](docs/GROQ_SETUP.md)

## Free-first architecture
- Groq is the only LLM provider key required by the app.
- Edge TTS is primary; Piper is the local fallback. Neither requires a paid TTS API key.
- Remotion and FFmpeg run in GitHub Actions.
- The last 10 storyboards are stored in browser localStorage on the current device. No Supabase/database/OTP setup is required.
- The app does not use paid image/video providers by default.

## Current limitations
- Scene image prompts are generated, but the current Remotion renderer still uses deterministic vector backdrops and a simple 2D character rig. It does not yet create bespoke AI artwork for every scene or full 3D character acting.
- Subtitle timing is estimated from audio duration; phoneme alignment and lip-sync are not implemented.
- Dashboard-to-GitHub render dispatch and artifact handoff still require a live owner-session test with configured secrets.
- YouTube publishing remains manual and requires explicit owner approval.
