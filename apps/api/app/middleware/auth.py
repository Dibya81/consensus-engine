from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import get_settings

settings = get_settings()
security = HTTPBearer()

async def get_current_user(request: Request):
    """
    Dependency to verify JWT token and extract user information.
    Currently a mock implementation for testing backend pipelines.
    Will integrate real Firebase validation logic later in Phase 1.
    """
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"id": "test-user-id", "role": "user"}

def verify_token(token: str):
    # Mock token verification
    pass
