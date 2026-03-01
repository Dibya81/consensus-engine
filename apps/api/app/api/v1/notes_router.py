from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Note, User
from app.services.ai_service import ai_service
from datetime import datetime
import json

router = APIRouter(prefix="/notes", tags=["notes"])

class NoteCreate(BaseModel):
    title: str
    content: str
    
class NoteQuery(BaseModel):
    query: str

async def get_db_user(db: AsyncSession, firebase_uid: str) -> User:
    user = (await db.execute(select(User).where(User.firebase_uid == firebase_uid))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/")
async def get_notes(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    user = await get_db_user(db, current_user.get("uid"))
    notes = (await db.execute(select(Note).where(Note.user_id == user.id).order_by(Note.updated_at.desc()).offset(skip).limit(limit))).scalars().all()
    
    return {
        "status": "success",
        "notes": [
            {
                "id": n.id,
                "title": n.title,
                "content": n.content,
                "summary": n.summary,
                "tags": n.tags,
                "updated_at": n.updated_at.isoformat()
            } for n in notes
        ]
    }

@router.post("/")
async def create_note(
    note: NoteCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    user = await get_db_user(db, current_user.get("uid"))
    new_note = Note(
        user_id=user.id,
        title=note.title,
        content=note.content,
        updated_at=datetime.utcnow()
    )
    db.add(new_note)
    await db.commit()
    await db.refresh(new_note)
    
    return {
        "status": "success", 
        "note": {
            "id": new_note.id,
            "title": new_note.title,
            "content": new_note.content
        }
    }

@router.put("/{note_id}")
async def update_note(
    note_id: int,
    note: NoteCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    user = await get_db_user(db, current_user.get("uid"))
    existing_note = (await db.execute(select(Note).where(Note.id == note_id, Note.user_id == user.id))).scalar_one_or_none()
    
    if not existing_note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    existing_note.title = note.title
    existing_note.content = note.content
    existing_note.updated_at = datetime.utcnow()
    
    await db.commit()
    return {"status": "success"}

@router.delete("/{note_id}")
async def delete_note(
    note_id: int,
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    user = await get_db_user(db, current_user.get("uid"))
    existing_note = (await db.execute(select(Note).where(Note.id == note_id, Note.user_id == user.id))).scalar_one_or_none()
    
    if not existing_note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    await db.delete(existing_note)
    await db.commit()
    return {"status": "success"}

@router.post("/generate-summary")
async def generate_note_summary(query: NoteQuery, current_user: dict = Depends(get_current_user)):
    """Generate a summary via external Bedrock AI pipeline (SSE)"""
    async def event_generator():
        prompt = f"Summarize or analyze this note:\n\n{query.query}"
        async for chunk in ai_service.generate_response_stream(prompt, []):
            yield chunk

    return StreamingResponse(event_generator(), media_type="text/event-stream")
