from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from pathlib import Path
import asyncio
from app.services.avatar.piper_service import generate_speech

from app.services.avatar.avatar_job_service import (
    create_avatar_job,
    get_avatar_job,
)

router = APIRouter(
    prefix="/api/ai-assistant/avatar",
    tags=["AI Avatar"],
)


class AvatarRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)

@router.post("/speak")
async def speak_response(request: AvatarRequest):
    text = request.text.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty",
        )

    loop = asyncio.get_running_loop()

    try:
        audio_path = await loop.run_in_executor(
            None,
            generate_speech,
            text,
        )

        return FileResponse(
            audio_path,
            media_type="audio/wav",
            filename="smart-foodcourt-response.wav",
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

@router.post("/generate")
async def generate_avatar(request: AvatarRequest):
    text = request.text.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty",
        )

    return create_avatar_job(text)


@router.get("/status/{job_id}")
async def avatar_status(job_id: str):
    job = get_avatar_job(job_id)

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Avatar job not found",
        )

    return {
        "job_id": job_id,
        "status": job["status"],
        "audio_ready": job["audio_ready"],
        "video_ready": job["video_ready"],
        "error": job["error"],
        "audio_url": (
            f"/api/ai-assistant/avatar/audio/{job_id}"
            if job["audio_ready"] else None
        ),
        "video_url": (
            f"/api/ai-assistant/avatar/video/{job_id}"
            if job["video_ready"] else None
        ),
    }


@router.get("/audio/{job_id}")
async def get_avatar_audio(job_id: str):
    job = get_avatar_job(job_id)

    if not job or not job["audio_ready"]:
        raise HTTPException(status_code=404, detail="Audio not ready")

    audio_path = Path(job["audio_path"])

    if not audio_path.is_file():
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(audio_path, media_type="audio/wav")


@router.get("/video/{job_id}")
async def get_avatar_video(job_id: str):
    job = get_avatar_job(job_id)

    if not job or not job["video_ready"]:
        raise HTTPException(status_code=404, detail="Video not ready")

    video_path = Path(job["video_path"])

    if not video_path.is_file():
        raise HTTPException(status_code=404, detail="Video file not found")

    return FileResponse(video_path, media_type="video/mp4")