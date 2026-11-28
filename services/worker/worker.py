import json
import os
import re
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any

import requests
from faster_whisper import WhisperModel

MASTER_URL = os.environ["CLIPPER_MASTER_URL"].rstrip("/")
WORKER_TOKEN = os.environ["CLIPPER_WORKER_TOKEN"]
POLL_SECONDS = int(os.getenv("CLIPPER_POLL_SECONDS", "8"))
OUTPUT_DIR = Path(os.getenv("CLIPPER_WORK_DIR", "./work"))
MAX_CLIPS = int(os.getenv("CLIPPER_MAX_CLIPS", "5"))
MODEL_SIZE = os.getenv("CLIPPER_WHISPER_MODEL", "tiny")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
HEADERS = {"Authorization": f"Bearer {WORKER_TOKEN}"}
SESSION = requests.Session()
WHISPER = None


def run(command: list[str], timeout: int = 3600) -> str:
    result = subprocess.run(command, check=True, capture_output=True, text=True, timeout=timeout)
    return result.stdout.strip()


def update(job_id: str, status: str, progress: int, message: str, error: str | None = None, clips: list[str] | None = None):
    payload: dict[str, Any] = {"status": status, "progress": progress, "message": message, "error": error}
    if clips is not None:
        payload["result_json"] = json.dumps({"clips": clips})
    response = SESSION.post(f"{MASTER_URL}/worker/jobs/{job_id}/status", headers=HEADERS, json=payload, timeout=30)
    response.raise_for_status()


def upload(job_id: str, path: Path) -> str:
    with path.open("rb") as stream:
        response = SESSION.post(
            f"{MASTER_URL}/worker/jobs/{job_id}/artifacts",
            headers=HEADERS,
            files={"file": (path.name, stream, "application/octet-stream")},
            timeout=300,
        )
    response.raise_for_status()
    return response.json()["url"]


def get_whisper():
    global WHISPER
    if WHISPER is None:
        WHISPER = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8", cpu_threads=2, num_workers=1)
    return WHISPER


def download_source(url: str, folder: Path) -> Path:
    template = str(folder / "source.%(ext)s")
    run([
        "yt-dlp", "--no-playlist", "--no-warnings", "--restrict-filenames",
        "-f", "bv*[height<=1080]+ba/b[height<=1080]/b",
        "--merge-output-format", "mp4", "-o", template, url,
    ], timeout=1800)
    candidates = list(folder.glob("source.*"))
    candidates = [p for p in candidates if p.suffix.lower() in {".mp4", ".mkv", ".webm", ".mov"}]
    if not candidates:
        raise RuntimeError("Sumber tidak dapat diunduh atau formatnya tidak didukung.")
    return candidates[0]


def transcribe(source: Path):
    audio = source.parent / "audio.wav"
    run(["ffmpeg", "-y", "-i", str(source), "-vn", "-ac", "1", "-ar", "16000", "-threads", "2", str(audio)], timeout=900)
    segments, info = get_whisper().transcribe(str(audio), vad_filter=True, word_timestamps=False, beam_size=1)
    rows = []
    for seg in segments:
        text = re.sub(r"\s+", " ", seg.text).strip()
        if text:
            rows.append({"start": float(seg.start), "end": float(seg.end), "text": text})
    return rows, info.language


def choose_clips(segments: list[dict], duration: float) -> list[tuple[float, float, list[dict]]]:
    if not segments:
        return []
    candidates = []
    cursor = 0.0
    while cursor < duration:
        end = min(cursor + 42.0, duration)
        if end - cursor >= 15:
            rows = [s for s in segments if s["end"] > cursor and s["start"] < end]
            words = sum(len(s["text"].split()) for s in rows)
            speech = sum(max(0, min(s["end"], end) - max(s["start"], cursor)) for s in rows)
            density = words / max(end - cursor, 1)
            # Prefer coherent, speech-rich moments; skip near-silent sections.
            score = density * 2.0 + min(speech / max(end - cursor, 1), 1.0)
            if words >= 18:
                candidates.append((score, cursor, end, rows))
        cursor += 21.0
    candidates.sort(reverse=True, key=lambda item: item[0])
    selected = []
    for score, start, end, rows in candidates:
        if all(abs(start - old[0]) > 30 for old in selected):
            selected.append((start, end, rows))
        if len(selected) >= MAX_CLIPS:
            break
    return sorted(selected, key=lambda item: item[0])


def write_srt(rows: list[dict], start: float, end: float, path: Path):
    def stamp(seconds: float) -> str:
        ms = int(max(0, seconds) * 1000)
        h, ms = divmod(ms, 3600000)
        m, ms = divmod(ms, 60000)
        s, ms = divmod(ms, 1000)
        return f"{h:02}:{m:02}:{s:02},{ms:03}"
    lines = []
    for i, row in enumerate(rows, 1):
        a, b = max(row["start"], start), min(row["end"], end)
        if b <= a:
            continue
        lines.extend([str(i), f"{stamp(a-start)} --> {stamp(b-start)}", row["text"], ""])
    path.write_text("\n".join(lines), encoding="utf-8")


def render_clip(source: Path, rows: list[dict], start: float, end: float, index: int, folder: Path) -> tuple[Path, Path]:
    duration = end - start
    srt = folder / f"clip-{index:02}.srt"
    write_srt(rows, start, end, srt)
    output = folder / f"clip-{index:02}.mp4"
    # Center crop is the safe baseline; face-aware reframing can be added later.
    vf = (
        "scale=1080:1920:force_original_aspect_ratio=increase,"
        "crop=1080:1920,eq=brightness=0.015:contrast=1.04:saturation=1.06,"
        "unsharp=5:5:0.35:3:3:0.15,"
        f"subtitles='{srt.as_posix()}':force_style='FontName=Arial,FontSize=18,"
        "Bold=1,Outline=2,Shadow=1,Alignment=2,MarginV=150,PrimaryColour=&H00FFFFFF,"
        "OutlineColour=&H00101010'"
    )
    run([
        "ffmpeg", "-y", "-ss", f"{start:.3f}", "-i", str(source), "-t", f"{duration:.3f}",
        "-vf", vf, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "24", "-threads", "2",
        "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(output),
    ], timeout=1800)
    thumb = folder / f"thumbnail-{index:02}.jpg"
    run(["ffmpeg", "-y", "-ss", f"{min(3, duration/3):.2f}", "-i", str(output), "-frames:v", "1", "-q:v", "3", str(thumb)], timeout=120)
    return output, thumb


def process(job: dict):
    job_id, url = job["id"], job["source_url"]
    folder = OUTPUT_DIR / job_id
    folder.mkdir(parents=True, exist_ok=True)
    try:
        update(job_id, "processing", 5, "Mengambil sumber yang telah dikonfirmasi pemiliknya.")
        source = download_source(url, folder)
        probe = json.loads(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(source)]))
        duration = float(probe["format"]["duration"])
        if duration < 20:
            raise RuntimeError("Video sumber terlalu pendek untuk target klip.")
        update(job_id, "processing", 20, "Mentranskripsi audio dan mencari kandidat momen.")
        segments, language = transcribe(source)
        if not segments:
            raise RuntimeError("Tidak ditemukan ucapan yang cukup untuk memilih momen otomatis.")
        candidates = choose_clips(segments, duration)
        if not candidates:
            raise RuntimeError("Belum ada kandidat klip yang memenuhi ambang kualitas.")
        urls = []
        metadata = {"source": url, "language": language, "clips": []}
        for index, (start, end, rows) in enumerate(candidates, 1):
            update(job_id, "processing", min(85, 25 + index * 12), f"Merender klip {index} dari {len(candidates)}.")
            video, thumb = render_clip(source, rows, start, end, index, folder)
            video_url = upload(job_id, video)
            thumb_url = upload(job_id, thumb)
            srt_url = upload(job_id, folder / f"clip-{index:02}.srt")
            urls.append(video_url)
            metadata["clips"].append({
                "index": index, "start_seconds": round(start, 2), "end_seconds": round(end, 2),
                "duration_seconds": round(end-start, 2), "video": video_url, "thumbnail": thumb_url, "subtitles": srt_url
            })
        metadata_path = folder / "metadata.json"
        metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
        upload(job_id, metadata_path)
        update(job_id, "completed", 100, f"Selesai: {len(urls)} klip lolos pemeriksaan dasar. Tinjau sebelum publikasi.", clips=urls)
    except Exception as exc:
        update(job_id, "failed", 0, "Produksi gagal. Periksa pesan error sebelum mencoba ulang.", error=str(exc)[:1200])
        raise


def main():
    print(f"Lerry Clipper Worker online. Master={MASTER_URL}; model={MODEL_SIZE}", flush=True)
    while True:
        try:
            response = SESSION.post(f"{MASTER_URL}/worker/jobs/claim", headers=HEADERS, timeout=30)
            response.raise_for_status()
            job = response.json().get("job")
            if job:
                print(f"Processing job {job['id']}", flush=True)
                try:
                    process(job)
                except Exception as exc:
                    print(f"Job {job['id']} failed: {exc}", flush=True)
            else:
                time.sleep(POLL_SECONDS)
        except Exception as exc:
            print(f"Master connection error: {exc}", flush=True)
            time.sleep(max(POLL_SECONDS, 15))


if __name__ == "__main__":
    main()
