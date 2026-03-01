"""Main API router — assembles all sub-routers."""
from fastapi import APIRouter
from app.api.v1.auth_router import router as auth_router
from app.api.v1.mentor_router import router as mentor_router
from app.api.v1.notes_router import router as notes_router
from app.api.v1.code_router import router as code_router
from app.api.v1.community_router import router as community_router
from app.api.v1.progress_router import router as progress_router
from app.api.v1.voice_router import router as voice_router
from app.api.v1.career_router import router as career_router
from app.api.v1.share_router import router as share_router
from app.api.v1.settings_router import router as settings_router
from app.api.v1.analytics_router import router as analytics_router

router = APIRouter(prefix="/api/v1")

router.include_router(auth_router)
router.include_router(mentor_router)
router.include_router(notes_router)
router.include_router(code_router)
router.include_router(community_router)
router.include_router(progress_router)
router.include_router(voice_router)
router.include_router(career_router)
router.include_router(share_router)
router.include_router(settings_router)
router.include_router(analytics_router)
