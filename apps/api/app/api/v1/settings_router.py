from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])

class SettingsUpdate(BaseModel):
    theme: str
    notifications: bool

@router.get("/")
async def get_settings(current_user=Depends(get_current_user)):
    return {"theme": "dark", "notifications": True}

@router.put("/")
async def update_settings(settings: SettingsUpdate, current_user=Depends(get_current_user)):
    return {"status": "success", "settings": settings.dict()}
