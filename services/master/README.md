# Lerry Clipper Master

Small FastAPI + SQLite job coordinator for VPS 1. No paid service or external database is required.

## Run
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export CLIPPER_API_TOKEN='use-a-long-random-secret'
export CLIPPER_WORKER_TOKEN='use-a-different-long-random-secret'
export CLIPPER_DB_PATH='./data/clipper.sqlite3'
uvicorn main:app --host 0.0.0.0 --port 8000
```

Place the service behind HTTPS before exposing it publicly. Configure the same `CLIPPER_API_TOKEN` on the Next.js host and Master. Give only the Worker the separate `CLIPPER_WORKER_TOKEN`.

## Endpoints
- `GET /health` — liveness check.
- `POST /jobs` — authenticated owner request; creates a durable SQLite job.
- `GET /jobs/{id}` — authenticated owner status.
- `POST /worker/jobs/claim` — authenticated Worker claims one queued job.
- `POST /worker/jobs/{id}/status` — Worker updates progress and result state.

The queue is persistent, but it does not itself download or edit media. The Worker pipeline (authorized source acquisition, transcription, highlight ranking, FFmpeg render and QC) is the next implementation milestone. Do not report a job as completed until real MP4 artifacts and QC evidence exist.
