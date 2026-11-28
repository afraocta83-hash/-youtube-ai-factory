# LERRY CLIPPER — YouTube Shorts Studio

Lerry is a link-to-clips studio. The owner pastes a source video URL, confirms the right to use it, and submits one job. Lerry analyzes the source, selects moments, renders vertical Shorts, enhances captions and picture quality, runs technical QC, and waits for owner review before publication.

## Owner workflow

1. Paste a YouTube HTTPS link.
2. Confirm ownership or permission to download, edit, and publish the source.
3. Submit once; VPS 1 Master records the job.
4. VPS 2 Worker transcribes, selects speech-rich candidate moments, and renders vertical clips.
5. Review MP4s, thumbnails, subtitles, metadata, and QC report.
6. Publish only after a separate owner approval. Lerry does not auto-publish.

Target output: 9:16 vertical, 1080p, 15–60 seconds per clip, H.264 MP4, sentence-level subtitles, natural visual correction, thumbnail, metadata, and QC report.

## Two-VPS architecture

- **VPS 1 — Master:** FastAPI, persistent SQLite queue, job status, metadata, artifact storage, and worker coordination.
- **VPS 2 — Worker:** authorized source acquisition, Faster-Whisper tiny transcription, highlight heuristic, FFmpeg crop/reframe, subtitle rendering, modest visual/audio enhancement, thumbnail generation, and QC.
- VPS resources are not pooled. The two machines communicate through authenticated HTTPS APIs. Keep concurrency at one job on 2 GB RAM.

## Implemented in this branch

- Mobile-first Clipper intake page is the default home route.
- Server-side Next.js proxy for job intake/status; Master credentials are not exposed to browser JavaScript.
- YouTube HTTPS URL validation and explicit rights confirmation.
- FastAPI + SQLite Master queue with separate owner and worker credentials.
- Worker service with yt-dlp source acquisition for authorized videos, Faster-Whisper tiny CPU/int8 transcription, speech-density window ranking, FFmpeg vertical render, sentence-level subtitles, modest brightness/contrast/saturation/sharpening, audio loudness normalization, thumbnails, FFprobe checks, and full decode validation.
- Master artifact upload and authenticated retrieval; dashboard exposes MP4, thumbnail, subtitle, metadata, and QC report links.
- Dockerfiles for Master and Worker, plus a persistent Master Compose template.
- CI syntax check covers both Python services; the existing pipeline also checks TypeScript, Next.js build, and Remotion MP4 smoke render.

## Not yet verified

- Neither VPS has been deployed or connected.
- Next.js host still needs server-side CLIPPER_MASTER_URL and CLIPPER_API_TOKEN.
- VPS 1 needs CLIPPER_API_TOKEN, a separate CLIPPER_WORKER_TOKEN, HTTPS reverse proxy, and persistent disk.
- VPS 2 needs CLIPPER_MASTER_URL and the same CLIPPER_WORKER_TOKEN.
- No real source has yet been processed by a deployed two-VPS system. No finished user MP4 is claimed.

## Runtime configuration

Next.js host secrets:
- CLIPPER_MASTER_URL: HTTPS base URL of VPS 1 Master.
- CLIPPER_API_TOKEN: long random server-side token shared with Master.

VPS 1 Master:
- CLIPPER_API_TOKEN: owner-to-Master credential.
- CLIPPER_WORKER_TOKEN: different worker-only credential.
- CLIPPER_DB_PATH: persistent SQLite path.
- CLIPPER_ARTIFACT_DIR: persistent artifact directory.

VPS 2 Worker:
- CLIPPER_MASTER_URL: HTTPS base URL of VPS 1.
- CLIPPER_WORKER_TOKEN: same worker-only credential as VPS 1.
- Optional CLIPPER_WHISPER_MODEL, CLIPPER_MAX_CLIPS, and CLIPPER_POLL_SECONDS.

Setup guides:
- [Master deployment](services/master/README.md)
- [Worker deployment](services/worker/README.md)
- [Two-VPS architecture](docs/LERRY_CLIPPER_ARCHITECTURE.md)

## Cost, safety, and quality boundaries

- Free-first. This branch adds no paid API or paid media service.
- Only process sources the owner owns or is authorized to download, edit, and publish. A public URL alone does not grant reuse rights; respect platform terms and access controls.
- Highlight selection is currently a speech-density heuristic, not semantic AI judgment. It may miss visual-only moments or cut a thought mid-context.
- Reframing is center-crop, not face-aware. Captions are sentence-level, not karaoke word-by-word.
- QC verifies technical output, not editorial accuracy or copyright status. Owner must watch and approve every clip.
- No automatic publishing. Production publishing is not changed by this branch.

## Branch safety

All Clipper work is isolated to experiment/openmontage-video-engine. Do not merge to main, deploy Production, or publish to YouTube without separate owner approval.
