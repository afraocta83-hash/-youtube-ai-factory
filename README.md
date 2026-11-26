# LERRY ANIMASI — Shorts Factory

This repository turns a short owner idea into an Indonesian animated YouTube Shorts production package.

## Production contract
- Owner supplies only a short idea/topic (5-500 characters).
- Groq GPT-OSS 120B creates the story, hook, narration, dialogue, subtitles, 4-6 scene storyboard, visual prompts, sound cues, thumbnail prompt, and YouTube metadata.
- Owner reviews the generated story, scenes, and metadata before approving MP4 rendering.
- After rendering, owner must inspect the actual MP4. Upload is a separate action and requires a second explicit owner approval.
- Output target: MP4 H.264, 1080x1920, 30 fps, 15-60 seconds.
- Pipeline: Groq idea-to-story → deterministic package QC → explicit owner render approval → Edge TTS (Piper fallback) → local Remotion animation → MP4 QC → thumbnail and YouTube metadata packaging → GitHub Actions artifact.
- One Groq request per idea; strict JSON Schema; low reasoning effort; maximum completion budget 4,200 tokens.

## Runtime configuration
- The Preview runtime expects `GROQ_API_KEY` (optional backups: `GROQ_API_KEY2`, `GROQ_API_KEY3`) and server-side `GITHUB_ACTIONS_TOKEN` with Actions read/write permission. These are hosting secrets, never browser values.
- No Agnes or other video-provider API key is required. The current render workflow uses Remotion on GitHub's standard CPU runner.
- Normal use requires no GitHub or hosting dashboard work: enter an idea, review the story and storyboard, approve the render, then download the completed package from the studio.
- The studio checks render progress and packages the MP4, thumbnail, and YouTube metadata. Inspect the complete video, connect YouTube OAuth, select the extracted MP4, and explicitly approve upload. Upload defaults to Private.

Detailed configuration reference: [docs/GROQ_SETUP.md](docs/GROQ_SETUP.md)

## Free-first architecture
- Groq is the only LLM provider required by the app. One primary key is sufficient; up to two optional backup keys are supported.
- Edge TTS is primary; Piper is the fallback. Neither requires a paid TTS API key.
- Remotion renders scene animation locally inside GitHub Actions; Edge TTS/Piper creates Indonesian narration and Remotion assembles the vertical MP4. No external video API key is required.
- The last 10 production packages are stored in browser localStorage on the current device. No Supabase/database/OTP setup is required.
- No paid image/video API is integrated. The renderer runs on standard GitHub-hosted CPU runners; public-repository Actions usage is free under GitHub's current policy.

## Agent performance add-ons

Two lightweight capabilities extend the existing Lerry pipeline without replacing its production engines:

- **Promptfoo (MIT):** one-case, optional CI regression evaluation for storyboard JSON, required narration, scene count, durations, and character action values. It runs only when the `GROQ_API_KEY` Actions secret is configured.
- **Langfuse + OpenTelemetry (MIT):** optional traces for storyboard provider calls, schema validation, storyboard QC, render dispatch, and YouTube upload-session creation. Enable with `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY`; use the free Cloud tier or self-host.

Mastra, LangGraph.js, CrewAI, Agno, and Trigger.dev are not added because they would duplicate the existing Langflow/Lerry orchestration or introduce extra runtimes/hosting. See [Agent Integration](docs/AGENT_INTEGRATION.md).

## Unified agent team

The production studio exposes the integrated agent roster at `GET /api/agents` and displays each agent's readiness in the dashboard. The team is coordinated by the existing Lerry pipeline; no separate app or database is required.

- Production Orchestrator: internal pipeline control.
- Storyboard Agent: Groq producer.
- Narrator Agent: Edge TTS with Piper fallback.
- Visual Agent: Remotion scene compositions and reusable character rig.
- Video Agent: Remotion + FFmpeg on GitHub Actions.
- Quality Control Agent: deterministic storyboard checks plus MP4/ffprobe/decode validation.
- Publishing Agent: YouTube OAuth + resumable upload session; each upload requires a second explicit owner approval and defaults to Private.

Langflow can act as the optional storyboard provider: when configured, Lerry invokes its Flow API and validates the returned production JSON; Groq is the fallback when configured. The core pipeline remains usable without a separately hosted Langflow service. YouTube publishing uses a separate OAuth connection and explicit owner approval for every upload; render approval is not upload approval. Langflow's live storyboard adapter is implemented but requires a configured Flow ID and a successful schema-compatible test.

See [docs/AGENT_INTEGRATION.md](docs/AGENT_INTEGRATION.md) for the integration boundary and remaining work.

## Current limitations
- The current free renderer uses Remotion scene compositions and a reusable 2D character rig; it does not generate bespoke AI video footage. Character animation and scene visuals are template-driven.
- Narration is generated with Edge TTS (Piper fallback); subtitles are burned per scene. Phoneme alignment and lip-sync are not implemented.
- Research/fact-check source retrieval is not automatic. Claims in educational/science stories still need manual verification.
- The full live dashboard-to-MP4 flow still needs a successful end-to-end run on the deployed Preview. CI smoke tests validate the local Remotion MP4 path.
- YouTube OAuth upload requires Google Cloud OAuth credentials and a successful live test. Langflow's live flow adapter is not implemented.
