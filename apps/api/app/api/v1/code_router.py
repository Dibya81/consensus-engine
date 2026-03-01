from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import CodeSnippet, User
from app.services.ai_service import ai_service
from datetime import datetime
import asyncio

router = APIRouter(prefix="/code", tags=["code"])

class CodeExecutionRequest(BaseModel):
    language: str
    code: str

class CodeReviewRequest(BaseModel):
    query: str

async def get_db_user(db: AsyncSession, firebase_uid: str) -> User:
    user = (await db.execute(select(User).where(User.firebase_uid == firebase_uid))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/")
async def get_recent_snippets(
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    user = await get_db_user(db, current_user.get("uid"))
    snippets = (await db.execute(select(CodeSnippet).where(CodeSnippet.user_id == user.id).order_by(CodeSnippet.updated_at.desc()))).scalars().all()
    
    return {
        "status": "success",
        "snippets": [
            {
                "id": s.id,
                "title": s.title,
                "language": s.language,
                "code": s.code,
                "updated_at": s.updated_at.isoformat()
            } for s in snippets
        ]
    }

import subprocess
import tempfile
import os
import time

def run_local_code(language: str, code: str):
    start_time = time.time()
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            if language == "python":
                file_path = os.path.join(temp_dir, "main.py")
                with open(file_path, "w") as f:
                    f.write(code)
                result = subprocess.run(["python3", "-u", file_path], capture_output=True, text=True, timeout=5)
                
            elif language == "java":
                file_path = os.path.join(temp_dir, "Main.java")
                with open(file_path, "w") as f:
                    f.write(code)
                comp_result = subprocess.run(["javac", file_path], capture_output=True, text=True, timeout=5)
                if comp_result.returncode != 0:
                    return {"stdout": "", "stderr": comp_result.stderr, "exit_code": comp_result.returncode, "time_ms": int((time.time() - start_time) * 1000)}
                result = subprocess.run(["java", "-cp", temp_dir, "Main"], capture_output=True, text=True, timeout=5)
                
            elif language == "c":
                file_path = os.path.join(temp_dir, "main.c")
                out_path = os.path.join(temp_dir, "main")
                with open(file_path, "w") as f:
                    f.write(code)
                comp_result = subprocess.run(["gcc", file_path, "-o", out_path], capture_output=True, text=True, timeout=5)
                if comp_result.returncode != 0:
                    return {"stdout": "", "stderr": comp_result.stderr, "exit_code": comp_result.returncode, "time_ms": int((time.time() - start_time) * 1000)}
                result = subprocess.run([out_path], capture_output=True, text=True, timeout=5)
            else:
                return {"stdout": "", "stderr": f"Unsupported language: {language}", "exit_code": 1, "time_ms": 0}

            return {
                "stdout": result.stdout,
                "stderr": result.stderr,
                "exit_code": result.returncode,
                "time_ms": int((time.time() - start_time) * 1000)
            }
    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "Execution Timed Out (5s limit)", "exit_code": 124, "time_ms": 5000}
    except Exception as e:
        return {"stdout": "", "stderr": f"Internal Runner Error: {str(e)}", "exit_code": 1, "time_ms": int((time.time() - start_time) * 1000)}

@router.post("/execute")
async def execute_code(
    request: CodeExecutionRequest, 
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    user = await get_db_user(db, current_user.get("uid"))
    
    snippet = CodeSnippet(
        user_id=user.id,
        title=f"{request.language.capitalize()} snippet",
        language=request.language,
        code=request.code,
        updated_at=datetime.utcnow()
    )
    db.add(snippet)
    await db.commit()
    
    # Execute Local Runner
    exec_result = await asyncio.to_thread(run_local_code, request.language, request.code)
    
    return {
        "status": "success",
        "output": exec_result["stdout"] if exec_result["stdout"] else exec_result["stderr"],
        "exit_code": exec_result["exit_code"],
        "time_ms": exec_result["time_ms"]
    }

@router.post("/review")
async def review_code(request: CodeReviewRequest, current_user: dict = Depends(get_current_user)):
    """AI code review using external Bedrock Pipeline (SSE)"""
    async def event_generator():
        prompt = f"Review this code for bugs and improvements:\n```\n{request.query}\n```"
        async for chunk in ai_service.generate_response_stream(prompt, []):
            yield chunk

    return StreamingResponse(event_generator(), media_type="text/event-stream")
