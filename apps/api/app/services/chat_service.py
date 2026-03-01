import httpx
import asyncio
from typing import Dict, Any, List
import logging
from fastapi import HTTPException
from app.core.settings import settings
from app.core.logging import log_api_call

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.base_url = settings.EXTERNAL_AURORA_API_URL
        self.headers = {"Authorization": f"Bearer {settings.EXTERNAL_AURORA_API_KEY}"}
        # Strict timeout to avoid gateway hanging
        self.timeout = httpx.Timeout(10.0, connect=5.0) 
        
    async def _request_with_retry(self, method: str, endpoint: str, payload: dict = None, retries: int = 3) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(retries):
            start_time = asyncio.get_event_loop().time()
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    if method == "GET":
                        response = await client.get(url, headers=self.headers)
                    elif method == "POST":
                        response = await client.post(url, headers=self.headers, json=payload)
                    elif method == "DELETE":
                        response = await client.delete(url, headers=self.headers)
                    else:
                        raise ValueError(f"Unsupported method {method}")
                        
                    response.raise_for_status()
                    duration = (asyncio.get_event_loop().time() - start_time) * 1000
                    log_api_call("AuroraChat", endpoint, duration, True)
                    return response.json()
                    
            except httpx.HTTPError as e:
                duration = (asyncio.get_event_loop().time() - start_time) * 1000
                log_api_call("AuroraChat", endpoint, duration, False, str(e))
                logger.warning(f"Aurora {endpoint} failed attempt {attempt + 1}/{retries}: {e}")
                
                if attempt == retries - 1:
                    logger.error(f"Aurora service exhausted retries for {endpoint}")
                    raise HTTPException(status_code=502, detail="Upstream chat service is currently unavailable.")
                    
                await asyncio.sleep(2 ** attempt) # Exponential backoff
                
        return {}

    async def create_conversation(self, title: str, user_id: str) -> str:
        res = await self._request_with_retry("POST", "/chat/create", {"title": title, "user_id": user_id})
        return res.get("conversation_id")
        
    async def add_message(self, conversation_id: str, role: str, content: str) -> None:
        await self._request_with_retry("POST", "/chat/message", {
            "conversation_id": conversation_id,
            "role": role,
            "content": content
        })
        
    async def get_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        res = await self._request_with_retry("GET", f"/chat/history/{conversation_id}")
        return res.get("messages", [])
        
    async def delete_conversation(self, conversation_id: str) -> None:
        await self._request_with_retry("DELETE", f"/chat/{conversation_id}")

chat_service = ChatService()
