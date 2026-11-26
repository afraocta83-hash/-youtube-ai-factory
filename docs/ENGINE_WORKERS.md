# Lerry Animasi — Automated Production Workers

## Operating rule
Owner supplies the final story. The engine is a production crew, not a story writer. The story text is canonical and must be preserved exactly.

## Worker roles
- **Producer/orchestrator (deterministic code):** validates the request and runs the production stages in order. One click generates the storyboard and automatically dispatches the MP4 render.
- **Storyboard + metadata worker (Groq GPT-OSS 120B):** one API call creates 4-6 timed scenes, visual prompts, sound cues, title, description, hashtags and thumbnail prompt.
- **Story-integrity/QC worker (deterministic code):** validates exact owner story, verbatim narration/dialogue/subtitles, scene count, duration, and required fields. No second LLM judge call.
- **Voice worker (Edge TTS):** creates Indonesian narration per scene. Piper runs as fallback if Edge generation or conversion fails.
- **Visual worker (Remotion):** creates vertical 9:16 animation from the current character rig and vector scene backdrops. It consumes the generated visual directions but does not yet generate bespoke AI artwork.
- **Render worker (GitHub Actions):** runs Remotion, FFmpeg, metadata checks, full decode, and artifact upload.
- **YouTube metadata worker (same Groq request):** returns title, description and hashtags; it does not make a separate LLM call.
- **Publisher:** manual owner action only. Never upload or schedule without explicit approval of the final MP4 and metadata.

## Token and cost controls
- One LLM provider key: `GROQ_API_KEY`.
- Default model: `openai/gpt-oss-120b`.
- One model call per story; strict JSON Schema; low reasoning effort; reasoning output disabled; max completion budget 3,200 tokens.
- All mechanical checks are deterministic code.
- Free-first. No paid provider, paid API tier, credits, subscription or ad spend without explicit owner approval.

## Owner access and history
- Owner-only access uses `OWNER_PASSWORD` and a signed HttpOnly SameSite cookie.
- Last 10 storyboards are stored in browser localStorage on the current device.
- No Supabase, database schema, email OTP or service-role key is required.
- Local history does not sync across devices and can be lost when browser data is cleared.

## Current API workers
- `POST /api/auth/login`, `GET /api/auth/session`, `POST /api/auth/logout`: owner session.
- `POST /api/produce`: Groq storyboard and metadata, owner-authenticated.
- `POST /api/quality-check`: deterministic structural preflight.
- `POST /api/render`: owner-authenticated GitHub Actions dispatch.
- TTS generation is executed inside `.github/workflows/render-short.yml` using Edge/Piper; there is no separate paid TTS API endpoint.

## Acceptance boundaries
- No live Groq call is considered passed until a real owner-authenticated story returns valid output.
- No render dispatch is considered passed until the GitHub workflow is actually triggered from the dashboard.
- No MP4 is accepted until its artifact is inspected and passes codec, resolution, FPS, duration, audio and full-decode checks.
- YouTube publishing remains manual.
