from fastapi import APIRouter, Depends
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from app.core.security import get_current_user
from app.services.ai_service import ai_service
import json

router = APIRouter(prefix="/career", tags=["career"])

class CareerQuery(BaseModel):
    query: str

@router.post("/advice")
async def get_career_advice(request: CareerQuery, current_user: dict = Depends(get_current_user)):
    """Get verified career advice from external Bedrock pipeline (SSE)"""
    async def event_generator():
        prompt = f"Career Query: {request.query}"
        async for chunk in ai_service.generate_response_stream(prompt, []):
            yield chunk

    return StreamingResponse(event_generator(), media_type="text/event-stream")
