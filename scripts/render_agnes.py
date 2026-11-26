#!/usr/bin/env python3
"""Render LERRY scenes with the free Agnes Video Generator service.

The service runs as a temporary Docker container inside the approved GitHub
Actions render job. No database or persistent third-party server is required.
"""
from __future__ import annotations

import json
import math
import os
import re
import subprocess
import sys
import time
from pathlib import Path

import requests

BASE = os.getenv("AGNES_BASE_URL", "http://127.0.0.1:8765").rstrip("/")
TIMEOUT_SECONDS = int(os.getenv("AGNES_TASK_TIMEOUT_SECONDS", "1500"))
ALLOWED_DURATIONS = (4, 5, 6, 8, 10, 12)


def run(command: list[str], *, check: bool = True) -> subprocess.CompletedProcess:
    result = subprocess.run(command, text=True, capture_output=True)
    if check and result.returncode:
        raise RuntimeError(
            f"Command failed ({result.returncode}): {' '.join(command[:3])}\n"
            f"{(result.stderr or result.stdout)[-3000:]}"
        )
    return result


def request_json(method: str, path: str, **kwargs) -> dict:
    response = requests.request(method, BASE + path, timeout=(15, 60), **kwargs)
    if not response.ok:
        detail = response.text[:1200]
        raise RuntimeError(f"Agnes API {method} {path} returned HTTP {response.status_code}: {detail}")
    return response.json()


def wait_for_service() -> None:
    deadline = time.time() + 180
    last_error = "service not ready"
    while time.time() < deadline:
        try:
            data = request_json("GET", "/api/health")
            if data.get("status") == "healthy":
                print("AGNES_ENGINE_HEALTHY")
                return
            last_error = str(data)
        except Exception as exc:
            last_error = str(exc)
        time.sleep(3)
    raise RuntimeError(f"Agnes video engine did not become healthy: {last_error}")


def choose_duration(scene: dict) -> int:
    requested = max(
        int(scene.get("seconds") or 4),
        math.ceil(float(scene.get("voiceDurationSeconds") or 0)),
    )
    candidates = [value for value in ALLOWED_DURATIONS if value >= requested]
    if not candidates:
        raise RuntimeError(
            f"Scene {scene.get('number')} needs {requested}s of video/audio, "
            "but Agnes Flash supports at most 12s per clip. Shorten its narration."
        )
    return candidates[0]


def create_clip(scene: dict, index: int, title: str, out_path: Path) -> int:
    duration = choose_duration(scene)
    visual = str(scene.get("visual") or "").strip()
    image_prompt = str(scene.get("imagePrompt") or "").strip()
    action = str(scene.get("action") or "idle").strip()
    prompt = (
        "Create a polished family-friendly animated cartoon video, vertical 9:16, "
        "720p, smooth cinematic camera movement, clear readable composition. "
        "This is one shot from the same LERRY ANIMASI story. Keep the main character "
        "design consistent with the story description; do not add text, captions, "
        "logos, watermarks, or UI. "
        f"Story title: {title}. Scene {index + 1}. "
        f"Visual direction: {visual}. Detailed scene prompt: {image_prompt}. "
        f"Character action: {action}. "
        "Use Indonesian cultural context where relevant. Make the action visually "
        "clear and complete within the clip."
    )
    deadline = time.time() + TIMEOUT_SECONDS
    task_id = None
    attempt = 0
    while time.time() < deadline and not task_id:
        attempt += 1
        response = requests.post(
            BASE + "/api/tasks/simple",
            data={
                "prompt": prompt,
                "mode": "t2v",
                "duration": str(duration),
                "video_width": "720",
                "video_height": "1280",
                "video_size": "720P",
            },
            timeout=(15, 90),
        )
        if response.ok:
            payload = response.json()
            task_id = payload.get("task_id")
            if not task_id:
                raise RuntimeError(f"Agnes accepted scene {index + 1} without returning a task ID.")
            print(f"AGNES_TASK_CREATED scene={index + 1} task={task_id} duration={duration}s")
            break
        if response.status_code in (429, 503, 502):
            wait = min(60, max(10, int(response.headers.get("Retry-After", "20"))))
            print(
                f"AGNES_QUEUE_BUSY scene={index + 1} attempt={attempt} "
                f"http={response.status_code}; retry in {wait}s"
            )
            time.sleep(wait)
            continue
        raise RuntimeError(
            f"Agnes could not create scene {index + 1} "
            f"(HTTP {response.status_code}): {response.text[:1200]}"
        )
    if not task_id:
        raise RuntimeError(f"Agnes free queue did not accept scene {index + 1} before timeout.")

    poll_deadline = time.time() + TIMEOUT_SECONDS
    while time.time() < poll_deadline:
        state = request_json("GET", f"/api/tasks/{task_id}")
        status = str(state.get("status", "")).lower()
        message = str(state.get("current_message") or state.get("current_step") or status)
        print(f"AGNES_TASK_PROGRESS scene={index + 1} status={status} message={message[:180]}")
        if status == "completed":
            break
        if status == "failed":
            detail = state.get("error_message") or state.get("error_traceback") or message
            raise RuntimeError(f"Agnes scene {index + 1} failed: {str(detail)[:1800]}")
        time.sleep(12)
    else:
        raise RuntimeError(f"Agnes scene {index + 1} exceeded its render timeout.")

    video = requests.get(BASE + f"/api/video/{task_id}", timeout=(15, 180))
    if not video.ok or len(video.content) < 10_000:
        raise RuntimeError(
            f"Agnes completed scene {index + 1} but MP4 download failed "
            f"(HTTP {video.status_code}, {len(video.content)} bytes)."
        )
    out_path.write_bytes(video.content)
    print(f"AGNES_CLIP_DOWNLOADED scene={index + 1} bytes={len(video.content)} file={out_path}")
    return duration


def write_srt(path: Path, text: str, duration: int) -> None:
    def stamp(seconds: float) -> str:
        millis = int(round(seconds * 1000))
        hours, millis = divmod(millis, 3_600_000)
        minutes, millis = divmod(millis, 60_000)
        seconds_i, millis = divmod(millis, 1000)
        return f"{hours:02}:{minutes:02}:{seconds_i:02},{millis:03}"

    safe_text = re.sub(r"\s+", " ", text or "").strip()
    safe_text = safe_text.replace("-->", "—>")
    path.write_text(
        f"1\n{stamp(0)} --> {stamp(max(1, duration - 0.15))}\n{safe_text or ' '}\n",
        encoding="utf-8",
    )


def prepare_scene(
    source: Path, destination: Path, scene: dict, index: int, duration: int, out_dir: Path
) -> None:
    voice_name = str(scene.get("voiceFile") or "").strip()
    voice = Path("public") / voice_name if voice_name else None
    if not voice or not voice.is_file():
        raise RuntimeError(f"Indonesian narration WAV missing for scene {index + 1}: {voice_name}")
    subtitle = out_dir / f"scene-{index + 1:02}.srt"
    write_srt(subtitle, str(scene.get("subtitle") or scene.get("narration") or ""), duration)
    vf = (
        "scale=1080:1920:force_original_aspect_ratio=increase,"
        "crop=1080:1920,fps=30,"
        f"subtitles='{subtitle.as_posix()}':"
        "force_style='FontName=Arial,FontSize=22,PrimaryColour=&H00FFFFFF,"
        "OutlineColour=&H00000000,BorderStyle=1,Outline=3,Shadow=0,"
        "Alignment=2,MarginV=150'"
    )
    run([
        "ffmpeg", "-y", "-v", "error",
        "-i", str(source), "-i", str(voice),
        "-vf", vf,
        "-map", "0:v:0", "-map", "1:a:0",
        "-af", "apad",
        "-t", str(duration),
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
        "-pix_fmt", "yuv420p", "-r", "30",
        "-c:a", "aac", "-b:a", "160k",
        "-movflags", "+faststart",
        str(destination),
    ])
    print(f"AGNES_SCENE_COMPOSED scene={index + 1} duration={duration}s")


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/render_agnes.py production.json")
    if not os.getenv("AGNES_API_KEY"):
        raise RuntimeError("GitHub Actions secret AGNES_API_KEY is missing.")
    production_path = Path(sys.argv[1])
    production = json.loads(production_path.read_text(encoding="utf-8"))
    scenes = production.get("scenes") or []
    if not 4 <= len(scenes) <= 6:
        raise RuntimeError("LERRY production must contain 4-6 scenes.")

    wait_for_service()
    out_dir = Path("out")
    out_dir.mkdir(parents=True, exist_ok=True)
    prepared: list[Path] = []
    total_duration = 0
    for index, scene in enumerate(scenes):
        raw = out_dir / f"agnes-raw-{index + 1:02}.mp4"
        composed = out_dir / f"scene-{index + 1:02}.mp4"
        duration = create_clip(scene, index, production.get("workingTitle", "LERRY ANIMASI"), raw)
        prepare_scene(raw, composed, scene, index, duration, out_dir)
        prepared.append(composed)
        total_duration += duration
    if not 15 <= total_duration <= 60:
        raise RuntimeError(
            f"Final duration after Agnes clip alignment is {total_duration}s; "
            "LERRY Shorts must be 15-60s. Shorten/revise the storyboard."
        )

    concat_file = out_dir / "concat.txt"
    concat_file.write_text(
        "".join(f"file '{path.resolve().as_posix()}'\n" for path in prepared),
        encoding="utf-8",
    )
    final = out_dir / "lerry-animasi-short.mp4"
    run([
        "ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
        "-i", str(concat_file), "-c", "copy", "-movflags", "+faststart", str(final),
    ])
    if not final.is_file() or final.stat().st_size < 100_000:
        raise RuntimeError("Final LERRY MP4 is missing or unexpectedly small.")
    print(f"LERRY_AGNES_RENDER_COMPLETE file={final} bytes={final.stat().st_size} duration={total_duration}s")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"LERRY_AGNES_RENDER_FAILED: {exc}", file=sys.stderr)
        raise
