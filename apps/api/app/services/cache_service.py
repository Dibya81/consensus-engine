import json
import logging
import redis.asyncio as redis
from app.core.settings import settings

logger = logging.getLogger(__name__)

class SemanticCache:
    def __init__(self):
        self.redis_client = None

    async def connect(self):
        if not self.redis_client:
            self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            try:
                await self.redis_client.ping()
                logger.info("Connected to Redis semantic cache")
            except Exception as e:
                logger.error(f"Redis connection failed: {e}")
                self.redis_client = None

    async def disconnect(self):
        if self.redis_client:
            await self.redis_client.aclose()

    async def get(self, query: str):
        if not self.redis_client:
            return None
        # Simplified semantic cache key (in a real app, generate embedding and search)
        cache_key = f"semantic_cache:{hash(query)}"
        try:
            cached_data = await self.redis_client.get(cache_key)
            if cached_data:
                logger.info(f"Cache hit for query: {query[:50]}...")
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Cache get error: {e}")
        return None

    async def set(self, query: str, result: dict, ttl_seconds: int = 3600):
        if not self.redis_client:
            return
        
        cache_key = f"semantic_cache:{hash(query)}"
        try:
            await self.redis_client.setex(
                cache_key,
                ttl_seconds,
                json.dumps(result)
            )
            logger.info(f"Cached result for query: {query[:50]}...")
        except Exception as e:
            logger.error(f"Cache set error: {e}")

cache_service = SemanticCache()
