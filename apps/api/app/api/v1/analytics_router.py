from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Note, CodeSnippet, Query, Roadmap

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary")
async def get_analytics_summary(
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    # Fetch user ID from DB
    user = (await db.execute(select(User).where(User.firebase_uid == current_user.get("uid")))).scalar_one_or_none()
    if not user:
        return {"status": "error", "message": "User not found"}

    # Total Queries
    queries_count = (await db.execute(select(func.count(Query.id)).where(Query.user_id == user.id))).scalar() or 0
    
    # Notes Created
    notes_count = (await db.execute(select(func.count(Note.id)).where(Note.user_id == user.id))).scalar() or 0
    
    # Code Reviewed (Snippets saved)
    code_count = (await db.execute(select(func.count(CodeSnippet.id)).where(CodeSnippet.user_id == user.id))).scalar() or 0
    
    # Topics Studied (Roadmaps or unique tags)
    topics_count = (await db.execute(select(func.count(Roadmap.id)).where(Roadmap.user_id == user.id))).scalar() or 0

    return {
        "status": "success",
        "data": {
            "total_queries": queries_count,
            "notes_created": notes_count,
            "code_reviewed": code_count,
            "topics_studied": topics_count
        }
    }
