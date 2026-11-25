# LERRY ANIMASI — Shorts Factory

This repository builds owner-authored stories into short vertical cartoon videos.

## Production contract
- Owner supplies the complete story. AI may only break it into scenes and production instructions; it must not invent, rewrite, shorten, or change the plot, dialogue, or ending.
- Output target: MP4 H.264, 1080x1920, 30 fps, 15–60 seconds.
- Pipeline: Gemini storyboard -> structural QC -> Gemini Indonesian TTS -> Remotion cartoon composition -> MP4 artifact.
- No YouTube upload is performed. Owner reviews and approves the MP4 and metadata separately.

## Run a Short
1. Open the Lerry studio and paste the final owner-written story.
2. Generate the production package and inspect the storyboard, dialogue, subtitles and metadata.
3. Use Salin paket JSON.
4. Open GitHub Actions > Render Lerry Shorts Factory.
5. Choose Run workflow, paste the full JSON into production_json, and start.
6. Wait for the job to complete. Download the lerry-animasi-short artifact from the run's Artifacts section.

## Requirements
- GitHub Actions enabled for this repository.
- GEMINI_API_KEY configured in the Vercel production environment for the voice endpoint.
- The Vercel production deployment must contain /api/quality-check and /api/voice.
- Gemini usage is subject to free-tier quotas and availability. This workflow does not enable billing or paid providers.

## Current limitations
- The first renderer uses one consistent, code-drawn cartoon character and scene-specific visual captions/backgrounds. It does not yet generate unique AI artwork for each scene or character reference sheets.
- TTS currently generates one continuous narration track from scene narration/dialogue; it is not per-character dialogue acting or precise word-level lip sync.
- The GitHub Actions workflow is manually started from the Actions page. A server-side GitHub Actions token and job-status/download integration are still needed for one-click rendering from the dashboard.
- Artifact is retained for seven days.
- YouTube publishing is intentionally not automated; no upload occurs without owner approval.
