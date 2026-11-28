# Lerry Clipper — implementation plan

## Product direction
This branch is being adapted from the previous animation-first product into a source-video clipping studio. The owner pastes one YouTube URL and confirms they own the source or have permission to download, edit, and publish it. Lerry must not claim to process a source until the Master API acknowledges a queued job.

## Target workflow
1. Owner submits a permitted source URL in `/clipper`.
2. Next.js server proxy forwards the request to VPS Master using server-only `CLIPPER_MASTER_URL` and `CLIPPER_API_TOKEN`.
3. Master validates the request and records a durable job in SQLite.
4. Worker VPS polls the Master over HTTPS using a separate worker credential.
5. Worker obtains an authorized source, transcribes it, ranks candidate moments, and renders 15–60 second vertical clips with FFmpeg.
6. Enhancement: natural exposure/contrast/white-balance correction, moderate sharpening, safe subtitle placement, highlighted keywords, gentle smart zoom, and audio leveling/noise cleanup where practical.
7. QC checks duration, aspect ratio, codec, audio stream, subtitle timing, and decode integrity.
8. Master exposes result links and metadata. Owner reviews every MP4; upload is a separate approval.

## Two VPS split
- Master: FastAPI, SQLite job queue, job state, owner-facing API, metadata, and worker coordination.
- Worker: source acquisition for authorized media only, transcription/highlight analysis, FFmpeg render, thumbnail generation, and QC.
- Do not treat the two VPS as one pooled RAM/CPU machine. Keep concurrency low and transfer job metadata over HTTPS; media files should be transferred or stored using an explicit shared artifact strategy.

## Current implementation in this commit
- Added a mobile-friendly `/clipper` intake/status page.
- Added a server-side proxy route at `/api/clipper/jobs`; secrets never go to browser JavaScript.
- Added explicit rights confirmation and URL validation.
- The page intentionally reports VPS Master as unavailable until runtime secrets are configured. No fake queue, fake progress, or fake clip links.

## Runtime secrets required on the Next.js host
- `CLIPPER_MASTER_URL`: HTTPS base URL for the Master API.
- `CLIPPER_API_TOKEN`: long random server-side token shared only with Master.

## Not yet implemented / not yet verified
- FastAPI Master service and persistent SQLite job queue.
- Separate Worker service, authenticated polling, and artifact transfer.
- Speech transcription and semantic highlight ranking.
- FFmpeg vertical reframing, dynamic subtitle rendering, visual/audio enhancement, thumbnails, and automated QC.
- Real-source end-to-end test and two-VPS deployment.

## Safety and cost rules
- No paid APIs, paid hosting, billing activation, or paid credits are introduced by this branch.
- Only process media the owner owns or is authorized to use. A public URL alone is not proof of reuse rights; respect platform terms and access controls.
- Never auto-publish. MP4 output must be reviewed and separately approved by the owner.
- Keep `main`, Production, and YouTube publishing unchanged without separate approval.
