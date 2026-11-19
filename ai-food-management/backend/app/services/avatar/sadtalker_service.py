import subprocess
import uuid
from pathlib import Path


SADTALKER_DIR = Path(r"D:\SmartFoodCourt-Avatar\SadTalker")

PYTHON_EXE = Path(
    r"D:\SmartFoodCourt-Avatar\sadtalker-venv\Scripts\python.exe"
)

SOURCE_IMAGE = (
    SADTALKER_DIR
    / "examples"
    / "source_image"
    / "male_ai_assistant.png"
)

VIDEO_DIR = Path(
    r"D:\project\ai-food-management\backend\generated\avatar"
)


def generate_avatar_video(audio_path: str) -> str:
    audio_file = Path(audio_path)

    if not audio_file.exists():
        raise FileNotFoundError(f"Audio not found: {audio_file}")

    if not SOURCE_IMAGE.exists():
        raise FileNotFoundError("Male avatar image not found")

    VIDEO_DIR.mkdir(parents=True, exist_ok=True)

    job_id = uuid.uuid4().hex
    result_dir = VIDEO_DIR / job_id
    result_dir.mkdir(parents=True, exist_ok=True)

    command = [
        str(PYTHON_EXE),
        "inference.py",
        "--driven_audio", str(audio_file),
        "--source_image", str(SOURCE_IMAGE),
        "--result_dir", str(result_dir),
        "--still",
        "--preprocess", "crop",
    ]

    subprocess.run(
        command,
        cwd=str(SADTALKER_DIR),
        capture_output=True,
        text=True,
        timeout=3600,
        check=True,
    )

    videos = list(result_dir.rglob("*.mp4"))

    if not videos:
        raise RuntimeError("SadTalker did not generate a video")

    final_video = VIDEO_DIR / f"{job_id}.mp4"
    videos[0].replace(final_video)

    return str(final_video)