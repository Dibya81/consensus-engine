from fastapi import Request, HTTPException, status
import time
from app.core.settings import settings
import redis.asyncio as redis
import logging

logger = logging.getLogger(__name__)

class RedisRateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.redis_client = None

    async def connect(self):
        if not self.redis_client:
            self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def is_allowed(self, client_id: str) -> bool:
        if not self.redis_client:
            await self.connect()
            
        if not self.redis_client:
            return True # Fail open if no redis
            
        key = f"rate_limit:{client_id}"
        current_time = int(time.time())
        window_start = current_time - 60
        
        try:
            # Clean up old requests
            await self.redis_client.zremrangebyscore(key, 0, window_start)
            # Count current requests in window
            count = await self.redis_client.zcard(key)
            
            if count >= self.requests_per_minute:
                return False
                
            # Add new request
            await self.redis_client.zadd(key, {str(current_time): current_time})
            await self.redis_client.expire(key, 60)
            return True
        except Exception as e:
            logger.error(f"Rate limiter error: {e}")
            return True # Fail open

limiter = RedisRateLimiter()

async def rate_limit(request: Request):
    client_id = request.client.host if request.client else "unknown"
    allowed = await limiter.is_allowed(client_id)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Try again later."
        )
