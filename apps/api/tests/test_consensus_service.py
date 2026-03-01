import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from hypothesis import given, strategies as st
from hypothesis.stateful import RuleBasedStateMachine, rule, precondition

from app.services.consensus_service import consensus_service
from app.agents.gpt_agent import gpt_agent
from app.agents.gemini_agent import gemini_agent
from app.agents.arbiter import arbiter_agent

@pytest.mark.asyncio
async def test_consensus_service_basic_flow():
    """Basic unit test for the consensus pipeline"""
    
    # We will mock the caching
    with patch('app.services.cache_service.cache_service.get', new_callable=AsyncMock) as mock_cache_get:
        mock_cache_get.return_value = None
        
        result = await consensus_service.execute("What is 2+2?")
        
        assert "responses" in result
        assert len(result["responses"]) == 2
        
        for resp in result["responses"]:
            assert "model" in resp
            assert "content" in resp
            
        assert "consensus_score" in result
        assert "verification_status" in result
        assert "recommendation" in result

# Property-based testing using hypothesis
# We test that no matter the input string (including weird characters), 
# the consensus service pipeline doesn't crash, 
# and returns the required dictionary structure.

@given(st.text())
def test_consensus_service_properties(query):
    """Property test that any text query returns a structured result without crashing"""
    
    # run async code in hypothesis synchronous test
    async def run_pipeline():
        with patch('app.services.cache_service.cache_service.get', new_callable=AsyncMock) as mock_cache_get:
            mock_cache_get.return_value = None
            
            # Short-circuit the agent calls to be extremely fast for hypothesis
            with patch.object(gpt_agent, 'generate', return_value="mock"):
                with patch.object(gemini_agent, 'generate', return_value="mock"):
                    with patch.object(arbiter_agent, 'evaluate', return_value={
                        "score": 0.8,
                        "status": "verified",
                        "synthesized": "mock recommendation",
                        "conflicts": []
                    }):
                        result = await consensus_service.execute(query)
                        return result
                        
    result = asyncio.run(run_pipeline())
    
    # Assertions for properties
    assert isinstance(result, dict)
    assert "responses" in result
    assert "consensus_score" in result
    assert "verification_status" in result
    assert result["verification_status"] in ["verified", "conflicted", "rejected"]
