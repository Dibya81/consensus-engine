import logging
import sys
from app.core.settings import settings

def setup_cloudwatch_logging():
    """
    Setup logging. In a production AWS environment, this can attach 
    a Watchtower handler or output structured JSON logs for the CloudWatch Agent.
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Clear existing handlers
    if logger.hasHandlers():
        logger.handlers.clear()
        
    handler = logging.StreamHandler(sys.stdout)
    
    # Structured format suitable for CloudWatch
    formatter = logging.Formatter(
        '{"time": "%(asctime)s", "name": "%(name)s", "level": "%(levelname)s", "message": "%(message)s"}'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    logger.info("CloudWatch structured logging initialized.")
    return logger

logger = setup_cloudwatch_logging()
