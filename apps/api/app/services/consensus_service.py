import asyncio
from app.agents.gemini_agent import GeminiAgent
from app.agents.gpt_agent import GPTAgent
from app.agents.arbiter import Arbiter
from app.services.cache_service import cache_service

class ConsensusService:
    def __init__(self):
        self.gemini = GeminiAgent()
        self.gpt = GPTAgent()
        self.arbiter = Arbiter()
        self.cache = cache_service
        
    async def execute(self, query: str, context: dict = None) -> dict:
        # Check cache
        cached = await self.cache.get(query)
        if cached:
            return cached
            
        # Broadcast to workers
        responses = await asyncio.gather(
            self.gemini.generate(query, context),
            self.gpt.generate(query, context)
        )
        
        # Judge consensus
        consensus = await self.arbiter.evaluate(responses)
        
        # Synthesize final
        final_result = {
            "query": query,
            "responses": [r.dict() if hasattr(r, "dict") else r for r in responses],
            "verification_status": consensus.verification_status.value,
            "consensus_score": consensus.consensus_score,
            "recommendation": consensus.recommendation,
            "conflicts": [c.dict() if hasattr(c, "dict") else c for c in consensus.conflicts]
        }
        
        # Cache and return
        await self.cache.set(query, final_result)
        return final_result

consensus_service = ConsensusService()
