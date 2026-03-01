from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/")
def get_auth_status():
    return {"status": "auth api active"}

@router.post("/login")
async def login(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Called by the frontend after Firebase Sign-In.
    The request header must contain: Authorization: Bearer <firebase_id_token>
    We verify the token and upsert the user into the primary Supabase database.
    """
    uid = current_user.get("uid")
    email = current_user.get("email", "")
    name = current_user.get("name", "")
    picture = current_user.get("picture", "")

    if not uid:
        raise HTTPException(status_code=400, detail="Invalid token payload: missing uid")

    query = select(User).where(User.firebase_uid == uid)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            firebase_uid=uid,
            email=email,
            display_name=name,
            avatar_url=picture
        )
        db.add(user)
    else:
        user.email = email
        user.display_name = name
        user.avatar_url = picture
        
    await db.commit()
    await db.refresh(user)

    return {
        "status": "success",
        "user": {
            "id": user.id,
            "uid": user.firebase_uid,
            "email": user.email,
            "name": user.display_name
        }
    }

@router.get("/me")
async def get_me(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Return authenticated user info."""
    uid = current_user.get("uid")
    query = select(User).where(User.firebase_uid == uid)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found in database.")
        
    return {
        "id": user.id,
        "uid": user.firebase_uid,
        "email": user.email,
        "name": user.display_name,
        "avatar_url": user.avatar_url
    }
