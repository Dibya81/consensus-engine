from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import SharedLink, User

router = APIRouter(prefix="/share", tags=["share"])

class ShareRequest(BaseModel):
    item_id: str
    item_type: str

async def get_db_user(db: AsyncSession, firebase_uid: str) -> User:
    user = (await db.execute(select(User).where(User.firebase_uid == firebase_uid))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/")
async def get_shares(
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    try:
        user = await get_db_user(db, current_user.get("uid"))
        links = (await db.execute(
            select(SharedLink).where(SharedLink.user_id == user.id).order_by(SharedLink.created_at.desc())
        )).scalars().all()
        
        return {
            "status": "success",
            "shares": [{
                "id": link.slug,
                "type": link.content_type,
                "title": f"Shared {link.content_type.capitalize()} Object",
                "date": link.created_at.strftime("%b %d, %Y"),
                "views": 0 # Analytics tracked separately or mock for now
            } for link in links]
        }
    except HTTPException:
        return {"status": "success", "shares": []}

@router.post("/")
async def share_item(
    request: ShareRequest, 
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Generate a shareable link and save to DB"""
    user = await get_db_user(db, current_user.get("uid"))
    
    # Check if already shared
    existing = (await db.execute(select(SharedLink).where(
        SharedLink.user_id == user.id, 
        SharedLink.content_id == request.item_id
    ))).scalar_one_or_none()
    
    if existing:
        slug = existing.slug
    else:
        slug = str(uuid.uuid4())[:12]
        new_link = SharedLink(
            slug=slug,
            user_id=user.id,
            content_type=request.item_type,
            content_id=request.item_id,
            created_at=datetime.utcnow()
        )
        db.add(new_link)
        await db.commit()
        
    return {
        "status": "success",
        "url": f"https://consensus.engine/share/{request.item_type}/{slug}",
        "slug": slug
    }

@router.get("/{slug}")
async def get_shared_item(slug: str, db: AsyncSession = Depends(get_db)):
    link = (await db.execute(select(SharedLink).where(SharedLink.slug == slug))).scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Shared link not found")
        
    return {
        "status": "success",
        "item": {
            "type": link.content_type,
            "id": link.content_id
        }
    }
