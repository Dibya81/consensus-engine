from fastapi import APIRouter, Depends, Request, BackgroundTasks
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import json
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import get_current_user
from app.core.database import get_db
from app.services.chat_service import chat_service
from app.services.ai_service import ai_service
from app.models import Conversation
from datetime import datetime

router = APIRouter(prefix="/mentor", tags=["mentor"])

class ChatRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None

@router.get("/")
def get_mentor_status():
    return {"status": "mentor api active"}

@router.post("/chat")
async def chat_with_mentor(
    request: ChatRequest, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Streaming consensus pipeline endpoint.
    Sends user query -> Bedrock API. Stores chat history -> Aurora API.
    Updates local Supabase metadata.
    """
    user_uid = current_user.get("uid")
    conversation_id = request.conversation_id
    
    # 1. External Aurora Storage
    if not conversation_id:
        # Create external conversation
        title = request.query[:50] + "..." if len(request.query) > 50 else request.query
        conversation_id = await chat_service.create_conversation(title, user_uid)
        
        # Create local Supabase metadata tracker
        # Fetch internal user_id
        from app.models import User
        user_res = await db.execute(select(User).where(User.firebase_uid == user_uid))
        db_user = user_res.scalar_one_or_none()
        
        if db_user:
            new_conv = Conversation(
                id=conversation_id,
                user_id=db_user.id,
                title=title,
                preview_text=request.query[:100],
                last_message_at=datetime.utcnow(),
                message_count=1
            )
            db.add(new_conv)
            await db.commit()
            
    # Save user message externally
    await chat_service.add_message(conversation_id, "user", request.query)
    
    # Update local metadata
    from app.models import User
    user_res = await db.execute(select(User).where(User.firebase_uid == user_uid))
    db_user = user_res.scalar_one_or_none()
    
    if db_user:
        conv_res = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
        conv = conv_res.scalar_one_or_none()
        if conv:
            conv.last_message_at = datetime.utcnow()
            conv.message_count += 2  # user + upcoming assistant
            conv.preview_text = request.query[:100]
            await db.commit()
    
    # 2. Retrieve recent context
    history = await chat_service.get_history(conversation_id)
    
    # 3. Stream from External Bedrock AI
    async def event_generator():
        full_response = ""
        async for chunk in ai_service.generate_response_stream(request.query, history):
            full_response += chunk # naive accumulation, assumes pure text/sse mix
            yield chunk
            
        # 4. Background save of assistant response to external Aurora
        # Typically extract just the text if it's SSE formatted, but for now save raw
        background_tasks.add_task(chat_service.add_message, conversation_id, "assistant", full_response)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
