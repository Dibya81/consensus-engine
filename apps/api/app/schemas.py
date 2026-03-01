"""Pydantic schemas used across the consensus pipeline."""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime


class VerificationStatus(str, Enum):
    VERIFIED = "verified"           # consensus_score >= 0.7
    PARTIAL = "partial"             # 0.4 <= consensus_score < 0.7
    CONFLICTED = "conflicted"       # consensus_score < 0.4
    SINGLE_SOURCE = "single_source" # only one model responded


class ModelResponse(BaseModel):
    model_name: str
    provider: str
    content: str
    timestamp: datetime = None
    latency_ms: int = 0
    metadata: Dict[str, Any] = {}

    def __init__(self, **data):
        if data.get("timestamp") is None:
            data["timestamp"] = datetime.utcnow()
        super().__init__(**data)


class Conflict(BaseModel):
    area: str
    perspectives: List[Dict[str, str]]  # [{model_name, viewpoint, reasoning}]


class ConsensusResult(BaseModel):
    consensus_score: float
    verification_status: VerificationStatus
    synthesized_content: str = ""
    agreements: List[str] = []
    conflicts: List[Conflict] = []
    recommendation: str = ""
    responses: List[ModelResponse] = []
    judge_reasoning: str = ""


class QueryRequest(BaseModel):
    query: str
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    max_models: int = 3
    conversation_id: Optional[str] = None
