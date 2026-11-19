import asyncio
import uuid

from app.services.avatar.piper_service import generate_speech
from app.services.avatar.sadtalker_service import generate_avatar_video


avatar_jobs = {}


async def process_avatar_job(job_id: str, text: str):
    avatar_jobs[job_id]["status"] = "processing"

    loop = asyncio.get_running_loop()

    try:
        # Generate voice using Piper
        audio_path = await loop.run_in_executor(
            None, generate_speech, text
        )

        avatar_jobs[job_id]["audio_path"] = audio_path
        avatar_jobs[job_id]["audio_ready"] = True

        # Generate synchronized video using SadTalker
        video_path = await loop.run_in_executor(
            None, generate_avatar_video, audio_path
        )

        avatar_jobs[job_id]["video_path"] = video_path
        avatar_jobs[job_id]["video_ready"] = True
        avatar_jobs[job_id]["status"] = "completed"

    except Exception as error:
        avatar_jobs[job_id]["status"] = "failed"
        avatar_jobs[job_id]["error"] = str(error)


def create_avatar_job(text: str):
    job_id = str(uuid.uuid4())

    avatar_jobs[job_id] = {
        "status": "pending",
        "audio_ready": False,
        "video_ready": False,
        "audio_path": None,
        "video_path": None,
        "error": None,
    }

    asyncio.create_task(process_avatar_job(job_id, text))

    return {
        "job_id": job_id,
        "status": "pending",
    }


def get_avatar_job(job_id: str):
    return avatar_jobs.get(job_id)