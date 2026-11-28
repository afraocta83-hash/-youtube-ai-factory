# Lerry Clipper Worker — VPS 2

This worker polls VPS 1, downloads only owner-authorized sources, transcribes with Faster-Whisper tiny (CPU int8), ranks speech-rich 42-second windows, renders up to five 9:16 MP4s with FFmpeg, adds readable subtitles and modest image/audio correction, extracts thumbnails, and uploads artifacts to Master.

## Environment
- `CLIPPER_MASTER_URL`: HTTPS base URL for VPS 1.
- `CLIPPER_WORKER_TOKEN`: worker-only credential matching VPS 1.
- `CLIPPER_WHISPER_MODEL`: defaults to `tiny`.
- `CLIPPER_MAX_CLIPS`: defaults to 5.
- `CLIPPER_POLL_SECONDS`: defaults to 8.
- `CLIPPER_WORK_DIR`: local temporary disk path.

## Run with Docker
```bash
docker build -t lerry-clipper-worker .
docker run --rm --restart unless-stopped \
  -e CLIPPER_MASTER_URL=https://MASTER_HOST \
  -e CLIPPER_WORKER_TOKEN=REPLACE_WITH_WORKER_SECRET \
  -v lerry-worker-cache:/root/.cache/huggingface \
  -v lerry-worker-work:/app/work \
  lerry-clipper-worker
```

The first run downloads the Whisper tiny model. On 2 GB RAM VPS, keep one worker process and one job at a time; CPU rendering may be slow. Provide adequate free disk space. Do not run this as a public unauthenticated service.

## Important limitations
- Current highlight ranking is a deterministic speech-density heuristic, not semantic AI judgement. It can miss visual-only highlights or select an incomplete thought.
- Vertical framing is centered, not face-aware. Check important subjects are not cropped.
- Visual adjustments are intentionally modest. Captions are sentence-level, not karaoke word-by-word.
- The pipeline must be tested with an authorized source before production use. Platform terms and source rights still apply.
- Worker marks a job completed only after MP4, thumbnail, and metadata uploads succeed. Owner review remains mandatory.
