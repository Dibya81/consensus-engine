from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Post, User
from app.services.ai_service import ai_service
from datetime import datetime
import json

router = APIRouter(prefix="/community", tags=["community"])

class PostCreate(BaseModel):
    title: str
    content: str
    
class AIReviewRequest(BaseModel):
    query: str

async def get_db_user(db: AsyncSession, firebase_uid: str) -> User:
    user = (await db.execute(select(User).where(User.firebase_uid == firebase_uid))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/")
async def get_feed(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    posts = (await db.execute(select(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit))).scalars().all()
    return {
        "status": "success",
        "posts": [
            {
                "id": p.id,
                "title": p.title,
                "content": p.content,
                "vote_count": p.vote_count,
                "is_verified": p.is_verified,
                "created_at": p.created_at.isoformat()
            } for p in posts
        ]
    }

@router.post("/")
async def create_post(
    post: PostCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    user = await get_db_user(db, current_user.get("uid"))
    new_post = Post(
        user_id=user.id,
        title=post.title,
        content=post.content,
        created_at=datetime.utcnow()
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)
    
    return {"status": "success", "post_id": new_post.id}

@router.post("/moderate")
async def moderate_post(request: AIReviewRequest, current_user: dict = Depends(get_current_user)):
    """Use external Bedrock AI to moderate or fact-check a community post (SSE)"""
    async def event_generator():
        prompt = f"Fact check and moderate this community post: {request.query}"
        async for chunk in ai_service.generate_response_stream(prompt, []):
            yield chunk

    return StreamingResponse(event_generator(), media_type="text/event-stream")
