
import subprocess
import uuid
from pathlib import Path

PIPER_PYTHON = Path(
    r"D:\SmartFoodCourt-Avatar\piper-venv\Scripts\python.exe"
)

PIPER_MODEL = Path(
    r"D:\SmartFoodCourt-Avatar\voice-models\en_US-ryan-medium.onnx"
)

AUDIO_DIR = Path(
    r"D:\SmartFoodCourt-Avatar\voice-models\generated"
)

PIPER_SCRIPT = Path(
    r"D:\SmartFoodCourt-Avatar\piper-venv\Scripts\piper.exe"
)


def generate_speech(text: str) -> str:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    output_file = AUDIO_DIR / f"{uuid.uuid4().hex}.wav"

    command = [
        str(PIPER_SCRIPT),
        "--model", str(PIPER_MODEL),
        "--output_file", str(output_file),
    ]

    result = subprocess.run(
        command,
        input=text,
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
        timeout=120,
        check=False,
    )

    if result.returncode != 0:
        raise RuntimeError(
            result.stderr or "Piper audio generation failed"
        )

    if not output_file.exists():
        raise RuntimeError("Piper did not create the audio file")

    return str(output_file)
