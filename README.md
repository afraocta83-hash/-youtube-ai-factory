# LERRY ANIMASI — Shorts Factory

This repository turns a short owner idea into an Indonesian animated YouTube Shorts production package.

## Production contract
- Owner supplies only a short idea/topic (5-500 characters).
- Groq GPT-OSS 120B creates the story, hook, narration, dialogue, subtitles, 4-6 scene storyboard, visual prompts, sound cues, thumbnail prompt, and YouTube metadata.
- Owner reviews the generated story, scenes, and metadata before approving MP4 rendering.
- After rendering, owner must inspect the actual MP4. Upload/publishing is a separate step and is not automatic.
- Output target: MP4 H.264, 1080x1920, 30 fps, 15-60 seconds.
- Pipeline: Groq idea-to-story → deterministic package QC → explicit owner render approval → Edge TTS (Piper fallback) → Agnes AI 2.5 Flash scene clips → FFmpeg subtitle/audio assembly and MP4 QC → GitHub Actions artifact.
- One Groq request per idea; strict JSON Schema; low reasoning effort; maximum completion budget 4,200 tokens.

## Owner setup
1. Add `GROQ_API_KEY` as the primary hosting Preview secret. Optional `GROQ_API_KEY2` and `GROQ_API_KEY3` act as backups when a key is rejected (HTTP 401/403). Add `OWNER_PASSWORD` as a hosting Preview secret; keep it private.
2. Keep `GITHUB_ACTIONS_TOKEN` as a server-side hosting secret with Actions: write permission.
3. Add `AGNES_API_KEY` as a GitHub repository Actions secret (Settings → Secrets and variables → Actions). Get the free key from https://platform.agnes-ai.com. This key is used only inside the temporary render runner to call the Agnes video engine; it is never sent to the browser or stored in the app database.
4. Open the Preview app and enter a short idea.
5. Inspect the generated story, storyboard, and metadata.
6. Only when satisfied, press **Saya setujui — mulai render MP4**.
7. Open GitHub Actions and download the `lerry-animasi-short` artifact when the render completes.
8. Watch the entire MP4 and inspect audio, subtitles, visuals, and factual accuracy. Upload to YouTube only after your separate approval.

Detailed setup: [docs/GROQ_SETUP.md](docs/GROQ_SETUP.md)

## Free-first architecture
- Groq is the only LLM provider required by the app. One primary key is sufficient; up to two optional backup keys are supported.
- Edge TTS is primary; Piper is the fallback. Neither requires a paid TTS API key.
- Agnes Video Generator (MIT-licensed, free model access) runs temporarily in Docker inside GitHub Actions; FFmpeg assembles generated clips, Indonesian narration and subtitles.
- The last 10 production packages are stored in browser localStorage on the current device. No Supabase/database/OTP setup is required.
- No paid image/video API is integrated. Agnes requires a free Agnes AI API key and its shared free queue may be busy; provider availability and free access can change.

## Current limitations
- Agnes generates each scene as a 4-12 second AI video clip at 720p; the final MP4 is upscaled/cropped to 1080x1920. Character consistency between separately generated shots is not guaranteed.
- Narration is generated with Edge TTS (Piper fallback); subtitles are burned per scene. Phoneme alignment and lip-sync are not implemented.
- Research/fact-check source retrieval is not automatic. Claims in educational/science stories still need manual verification.
- Dashboard-to-GitHub dispatch, Agnes API key, free-queue availability and full MP4 artifact still require a live owner-approved render test.
- YouTube OAuth upload integration is not implemented. Publishing remains manual and separately approval-gated.
