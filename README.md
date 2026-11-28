# LERRY CLIPPER — YouTube Shorts Studio

Lerry has pivoted from story-first animation production to a link-to-clips workflow. The owner pastes a source video URL, confirms the right to use it, and submits one job. Lerry is designed to identify useful moments, create vertical Shorts, enhance captions and picture quality, run QC, and wait for owner review before publication.

## Owner workflow

1. Open the studio and paste a YouTube HTTPS link.
2. Confirm that you own the video or have permission to download, edit, and publish it.
3. Submit once; the Master queue records the job.
4. The Worker analyzes the source, selects candidate moments, and renders vertical clips.
5. Review MP4s, thumbnails, metadata, and QC results.
6. Publish only after a separate owner approval. Lerry does not auto-publish.

Target output: 9:16 vertical, 1080p when the source supports it, 15–60 seconds per clip, H.264 MP4, readable dynamic subtitles, natural visual correction, thumbnail, metadata, and QC report.

## Two-VPS architecture

- **VPS 1 — Master:** FastAPI, persistent SQLite queue, job status, metadata, and worker coordination.
- **VPS 2 — Worker:** authorized source acquisition, transcription/highlight selection, FFmpeg crop/reframe, subtitle rendering, visual/audio enhancement, thumbnail generation, and QC.
- VPS resources are not pooled. The two machines communicate through authenticated HTTPS APIs. Keep render concurrency low on 2 GB RAM machines.

## Current implementation status

Implemented on `experiment/openmontage-video-engine`:
- Mobile-first Clipper intake page is the default home route.
- Server-side Next.js proxy at `/api/clipper/jobs`; Master credentials are not exposed to browser JavaScript.
- YouTube HTTPS URL validation and explicit rights confirmation.
- FastAPI + SQLite Master queue with owner job creation/status endpoints and separate worker claim/update credentials.
- CI now includes Python syntax validation for the Master service.

Not yet implemented or verified:
- VPS deployment and HTTPS connection.
- Worker media-processing pipeline (transcription, highlight ranking, FFmpeg clips, subtitles, enhancement, thumbnails, QC).
- Real-source end-to-end test and final downloadable MP4 artifacts.
- YouTube publishing remains out of scope until owner review and separate approval.

## Runtime configuration

Next.js host secrets:
- `CLIPPER_MASTER_URL`: HTTPS base URL of VPS 1 Master.
- `CLIPPER_API_TOKEN`: long random server-side token shared with Master.

VPS 1 Master environment:
- `CLIPPER_API_TOKEN`: same owner-to-Master token.
- `CLIPPER_WORKER_TOKEN`: a different long random token used only by VPS 2 Worker.
- `CLIPPER_DB_PATH`: persistent SQLite path, e.g. `./data/clipper.sqlite3`.

Master setup: [services/master/README.md](services/master/README.md).
Architecture and acceptance gates: [docs/LERRY_CLIPPER_ARCHITECTURE.md](docs/LERRY_CLIPPER_ARCHITECTURE.md).

## Cost and rights policy

- Free-first only. No paid API, paid hosting, billing activation, or paid credits are added by this branch.
- Only process media the owner owns or is authorized to use. A public URL is not proof of reuse rights; respect platform terms and access controls.
- No automatic upload. Every final MP4 must be reviewed by the owner.
- Do not claim a job is completed until real media output and QC evidence exist.

## Branch safety

All current Clipper work is isolated to `experiment/openmontage-video-engine`. Do not merge to `main`, deploy Production, or publish to YouTube without separate owner approval.
