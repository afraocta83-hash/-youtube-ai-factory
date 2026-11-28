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


## Docker deployment on VPS 1

Copy `services/docker-compose.master.yml` to the parent `services` folder on VPS 1, and create a local `.env` file (never commit it):
```env
CLIPPER_API_TOKEN=generate-a-long-random-secret
CLIPPER_WORKER_TOKEN=generate-a-different-long-random-secret
CLIPPER_PUBLIC_URL=https://your-master-domain.example
```

Build from the repository root:
```bash
docker compose -f services/docker-compose.master.yml --env-file services/.env up -d --build
docker compose -f services/docker-compose.master.yml logs -f
```

Put a TLS reverse proxy in front of localhost port 8000 before connecting the public dashboard. Keep the SQLite and artifact volume persistent and backed up. Never expose the worker credential to the browser. The example binds port 8000 to localhost only; it is not a complete HTTPS setup.
