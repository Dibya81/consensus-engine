import base64
import json
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth
from .settings import settings

logger = logging.getLogger(__name__)

security = HTTPBearer()

def _init_firebase():
    if not firebase_admin._apps:
        try:
            if settings.FIREBASE_CREDENTIALS:
                try:
                    decoded = base64.b64decode(settings.FIREBASE_CREDENTIALS).decode('utf-8')
                    cert_dict = json.loads(decoded)
                except ValueError:
                    cert_dict = json.loads(settings.FIREBASE_CREDENTIALS)
                    
                cred = credentials.Certificate(cert_dict)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin initialized successfully.")
            elif settings.FIREBASE_PROJECT_ID:
                firebase_admin.initialize_app(options={'projectId': settings.FIREBASE_PROJECT_ID})
                logger.info(f"Firebase Admin initialized with project ID: {settings.FIREBASE_PROJECT_ID}")
            else:
                logger.warning("No Firebase credentials provided. Authentication will fail.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin: {e}")

_init_firebase()

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifies Firebase ID token and returns the decoded token payload.
    """
    token = creds.credentials
    
    # Strict JSON Web Token (JWT) enforcement via Firebase Admin
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
