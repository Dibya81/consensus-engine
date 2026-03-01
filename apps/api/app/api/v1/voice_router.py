from fastapi import APIRouter, Depends
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from app.core.security import get_current_user
from app.services.ai_service import ai_service
import json

router = APIRouter(prefix="/voice", tags=["voice"])

class VoiceTranscript(BaseModel):
    query: str

@router.post("/process")
async def process_voice(request: VoiceTranscript, current_user: dict = Depends(get_current_user)):
    """Process voice transcript via SSE external Bedrock pipeline"""
    async def event_generator():
        prompt = f"The user said via voice: '{request.query}'. Respond accordingly."
        async for chunk in ai_service.generate_response_stream(prompt, []):
            yield chunk

    return StreamingResponse(event_generator(), media_type="text/event-stream")
