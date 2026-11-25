# Lerry Animasi — Production Engine Scope

Owner provides only a topic. The engine owns all production development.

## Worker roles
- Producer/orchestrator: creates a production job and coordinates stages.
- Researcher: gathers primary/authoritative sources; records citations and uncertainty.
- Story writer: creates a hook, plot, narration and dialogue.
- Storyboard director: creates timed scenes, camera/action/sound directions.
- Visual designer: creates image prompts and maintains character/style continuity.
- Voice worker: creates narration audio through Gemini TTS.
- Editor/render worker: assembles approved assets into a vertical 9:16 MP4.
- Quality worker: checks structure, factual source traceability, audio, subtitle timing, frame integrity and export.
- YouTube publisher: uploads privately/unlisted only after owner approval, then verifies video ID/status.

## Safety gates
- Free-first; no paid service, paid API tier, credit consumption, ad spend or subscription without explicit owner permission.
- Never publish or schedule without explicit approval of the final render and metadata.
- Upload target is YouTube only, profile @lerry_animasi.
- Do not claim a stage passed unless the actual artifact or API result was checked.
- Historical claims must have traceable sources; label dramatic reconstruction clearly.
- Store secrets only in server environment variables.

## Current API workers
- POST /api/produce — Gemini script and storyboard package.
- POST /api/voice — Gemini text-to-speech; returns WAV audio base64.
- POST /api/quality-check — deterministic structural preflight.
