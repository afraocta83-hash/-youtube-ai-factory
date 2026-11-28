import json
import os
import shutil
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Header, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, HttpUrl

DB_PATH = Path(os.getenv("CLIPPER_DB_PATH", "./data/clipper.sqlite3"))
ARTIFACT_DIR = Path(os.getenv("CLIPPER_ARTIFACT_DIR", "./artifacts"))
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
MASTER_TOKEN = os.getenv("CLIPPER_API_TOKEN", "")
WORKER_TOKEN = os.getenv("CLIPPER_WORKER_TOKEN", "")
PUBLIC_URL = os.getenv("CLIPPER_PUBLIC_URL", "").rstrip("/")
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Lerry Clipper Master", version="0.1.0")


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def connect():
    db = sqlite3.connect(DB_PATH, timeout=20)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA journal_mode=WAL")
    db.execute("""CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY, source_url TEXT NOT NULL, status TEXT NOT NULL,
        progress INTEGER NOT NULL DEFAULT 0, message TEXT NOT NULL,
        rights_confirmed INTEGER NOT NULL, created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL, error TEXT, result_json TEXT
    )""")
    return db


def authorize(value: Optional[str], expected: str):
    if not expected:
        raise HTTPException(status_code=503, detail="Server credential is not configured")
    if value != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="Unauthorized")


def public_job(row):
    artifacts = json.loads(row["result_json"]).get("clips", []) if row["result_json"] else []
    clips = [{key: (f"{PUBLIC_URL}{value}" if PUBLIC_URL and isinstance(value, str) and value.startswith("/") else value) for key, value in item.items()} for item in artifacts if isinstance(item, dict)]
    return {
        "id": row["id"], "status": row["status"], "progress": row["progress"],
        "message": row["message"], "error": row["error"], "clips": clips
    }


class CreateJob(BaseModel):
    source_url: HttpUrl
    rights_confirmed: bool


class WorkerUpdate(BaseModel):
    status: str
    progress: int = 0
    message: str
    error: Optional[str] = None
    result_json: Optional[str] = None


@app.on_event("startup")
def startup():
    db = connect()
    db.close()


@app.get("/health")
def health():
    return {"ok": True, "service": "lerry-clipper-master"}


@app.post("/jobs", status_code=202)
def create_job(payload: CreateJob, authorization: Optional[str] = Header(default=None)):
    authorize(authorization, MASTER_TOKEN)
    host = payload.source_url.host.lower().rstrip(".")
    allowed = host in {"youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"}
    if payload.source_url.scheme != "https" or not allowed:
        raise HTTPException(status_code=400, detail="Only HTTPS YouTube URLs are supported in this first release")
    if not payload.rights_confirmed:
        raise HTTPException(status_code=400, detail="Rights confirmation is required")
    job_id = str(uuid.uuid4())
    stamp = now()
    db = connect()
    try:
        db.execute(
            "INSERT INTO jobs (id,source_url,status,progress,message,rights_confirmed,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",
            (job_id, str(payload.source_url), "queued", 0, "Link diterima. Menunggu Worker VPS.", 1, stamp, stamp)
        )
        db.commit()
        row = db.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone()
        return {"ok": True, "job": public_job(row)}
    finally:
        db.close()


@app.get("/jobs/{job_id}")
def get_job(job_id: str, authorization: Optional[str] = Header(default=None)):
    authorize(authorization, MASTER_TOKEN)
    db = connect()
    try:
        row = db.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"ok": True, "job": public_job(row)}
    finally:
        db.close()


@app.post("/worker/jobs/claim")
def claim_job(authorization: Optional[str] = Header(default=None)):
    authorize(authorization, WORKER_TOKEN)
    db = connect()
    try:
        db.execute("BEGIN IMMEDIATE")
        row = db.execute("SELECT * FROM jobs WHERE status='queued' ORDER BY created_at LIMIT 1").fetchone()
        if row is None:
            db.commit()
            return {"job": None}
        stamp = now()
        db.execute("UPDATE jobs SET status='processing',progress=1,message=?,updated_at=? WHERE id=?",
                   ("Worker mengambil job. Pemeriksaan sumber dimulai.", stamp, row["id"]))
        db.commit()
        updated = db.execute("SELECT * FROM jobs WHERE id=?", (row["id"],)).fetchone()
        return {"job": {**public_job(updated), "source_url": updated["source_url"]}}
    finally:
        db.close()


@app.post("/worker/jobs/{job_id}/status")
def update_job(job_id: str, payload: WorkerUpdate, authorization: Optional[str] = Header(default=None)):
    authorize(authorization, WORKER_TOKEN)
    allowed = {"processing", "review", "completed", "failed"}
    if payload.status not in allowed or not 0 <= payload.progress <= 100:
        raise HTTPException(status_code=400, detail="Invalid worker status")
    db = connect()
    try:
        cur = db.execute(
            "UPDATE jobs SET status=?,progress=?,message=?,error=?,result_json=?,updated_at=? WHERE id=?",
            (payload.status, payload.progress, payload.message, payload.error, payload.result_json, now(), job_id)
        )
        db.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"ok": True}
    finally:
        db.close()


@app.post("/worker/jobs/{job_id}/artifacts")
async def upload_artifact(
    job_id: str,
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(default=None)
):
    authorize(authorization, WORKER_TOKEN)
    safe_name = Path(file.filename or "artifact.mp4").name
    if not safe_name or len(safe_name) > 180 or any(ch not in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-" for ch in safe_name):
        raise HTTPException(status_code=400, detail="Invalid artifact filename")
    if Path(safe_name).suffix.lower() not in {".mp4", ".jpg", ".jpeg", ".png", ".json", ".srt", ".txt"}:
        raise HTTPException(status_code=400, detail="Artifact type is not allowed")
    db = connect()
    try:
        row = db.execute("SELECT id FROM jobs WHERE id=?", (job_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Job not found")
    finally:
        db.close()
    target_dir = ARTIFACT_DIR / job_id
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / safe_name
    size = 0
    try:
        with target.open("wb") as output:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > 500 * 1024 * 1024:
                    output.close()
                    target.unlink(missing_ok=True)
                    raise HTTPException(status_code=413, detail="Artifact exceeds 500 MB limit")
                output.write(chunk)
    finally:
        await file.close()
    return {"ok": True, "name": safe_name, "size": size, "url": f"/artifacts/{job_id}/{safe_name}"}


app.mount("/artifacts", StaticFiles(directory=str(ARTIFACT_DIR)), name="artifacts")
