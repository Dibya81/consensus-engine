import logging
import time
from typing import Callable
from fastapi import Request

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%dT%H:%M:%S%z'
)

logger = logging.getLogger("consensus-gateway")

def log_api_call(service: str, endpoint: str, duration_ms: float, success: bool, error: str = None):
    """Structured logging for external AWS APIs."""
    status_str = "SUCCESS" if success else f"FAILED: {error}"
    logger.info(f"[EXTERNAL_API] {service} -> {endpoint} | {duration_ms:.2f}ms | {status_str}")

async def logging_middleware(request: Request, call_next: Callable):
    start_time = time.time()
    try:
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000
        logger.info(f"[HTTP] {request.method} {request.url.path} | {response.status_code} | {duration_ms:.2f}ms")
        return response
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        logger.error(f"[HTTP ERROR] {request.method} {request.url.path} | 500 | {duration_ms:.2f}ms | {str(e)}")
        raise e
