# Lerry Agent Integration

This repository keeps one production application and one production pipeline. Agents are modules in that pipeline, not separate products that the owner must operate.

## Current integrated stages

1. Production Orchestrator — internal pipeline coordinator.
2. Storyboard Agent — existing Groq producer route (`/api/produce`).
3. Narrator Agent — Edge TTS with Piper fallback in GitHub Actions.
4. Visual Agent — Remotion scene compositions and the reusable character rig.
5. Video Agent — Remotion render plus FFmpeg processing.
6. Quality Control Agent — storyboard checks before dispatch and ffprobe/FFmpeg checks after render.
7. Publishing Agent — YouTube Data API v3 OAuth and resumable upload endpoints; each upload requires a separate owner click and defaults to Private.

## Agent status API

`GET /api/agents` returns a safe capability/status manifest. It never returns secrets.

## Langflow

Langflow is an optional storyboard provider/orchestrator and visual workflow editor, not a required runtime dependency. When configured, the producer calls the selected Langflow flow first and validates its JSON output; Groq is used as fallback when configured. This avoids making every render depend on a separately hosted Langflow service.

Optional hosting variables:
- `LANGFLOW_BASE_URL`
- `LANGFLOW_FLOW_ID`
- `LANGFLOW_API_KEY` (if the Langflow deployment requires authentication)

The current production pipeline remains operational without these variables. The live adapter calls `POST /api/v1/run/{FLOW_ID}?stream=false` with the production prompt. The configured flow must return a JSON object matching the Lerry production schema (4-6 scenes, required narration/dialogue/visual fields, metadata). If Langflow is unavailable and Groq keys exist, the producer falls back to Groq.

## YouTube Publishing

OAuth and resumable-upload routes are implemented. Configure these hosting secrets to enable the Publishing Agent:
- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_REDIRECT_URI`

The publishing agent must require an explicit owner approval for each upload. Rendering approval is not upload approval. Never publish automatically after an MP4 render.

## Output contract

- MP4: H.264, 1080x1920, 30 fps, 9:16.
- Narration: Indonesian Edge TTS, Piper fallback.
- QC: media metadata, audio stream, duration, and full decode.
- Owner reviews the actual MP4 before any publishing action.

## Known limitations

- Visuals are currently template-driven Remotion animation, not bespoke AI-generated video footage.
- Langflow invocation is implemented but requires a configured Flow ID and a successful live schema-compatible run.
- YouTube OAuth/upload is not yet implemented.
- A successful deployed end-to-end render must still be demonstrated before calling the whole production system accepted.
