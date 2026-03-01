from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import UserProgress, User
from app.services.ai_service import ai_service
import json

router = APIRouter(prefix="/progress", tags=["progress"])

class GoalRequest(BaseModel):
    query: str

async def get_db_user(db: AsyncSession, firebase_uid: str) -> User:
    user = (await db.execute(select(User).where(User.firebase_uid == firebase_uid))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/")
async def get_progress(
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    user = await get_db_user(db, current_user.get("uid"))
    progress = (await db.execute(select(UserProgress).where(UserProgress.user_id == user.id))).scalar_one_or_none()
    
    if not progress:
        # Auto-create if not exists
        progress = UserProgress(user_id=user.id)
        db.add(progress)
        await db.commit()
        await db.refresh(progress)

    return {
        "level": max(1, progress.total_xp // 1000), 
        "xp": progress.total_xp, 
        "achievements": [],
        "longest_streak_days": progress.longest_streak_days
    }

@router.post("/roadmap")
async def generate_roadmap(request: GoalRequest, current_user: dict = Depends(get_current_user)):
    """Generate a learning roadmap via external Bedrock AI pipeline (SSE)"""
    async def event_generator():
        prompt = f"Create a step-by-step learning roadmap for: {request.query}"
        async for chunk in ai_service.generate_response_stream(prompt, []):
            yield chunk

    return StreamingResponse(event_generator(), media_type="text/event-stream")
