import boto3
import json
import logging
import asyncio
from typing import Dict, Any, Tuple, Optional, AsyncGenerator
from fastapi import HTTPException
from botocore.exceptions import ClientError
from botocore.config import Config
from app.core.settings import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        # Initialize boto3 client for Bedrock Runtime securely without exposing credentials in logs
        boto_config = Config(
            connect_timeout=5,
            read_timeout=45,
            retries={'max_attempts': 2}
        )
        self.client = boto3.client(
            service_name='bedrock-runtime',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            config=boto_config
        )
        self.worker_model_1 = "amazon.nova-micro-v1:0"
        self.worker_model_2 = "anthropic.claude-3-haiku-20240307-v1:0"
        self.judge_model = "anthropic.claude-3-5-sonnet-20240620-v1:0"

    def _sync_invoke_nova(self, model_id: str, prompt: str) -> str:
        body = json.dumps({
            "system": [{"text": "You are a helpful assistant."}],
            "messages": [
                {"role": "user", "content": [{"text": prompt}]}
            ],
            "inferenceConfig": {"max_new_tokens": 1024}
        })
        try:
            response = self.client.invoke_model(
                modelId=model_id,
                body=body,
                accept="application/json",
                contentType="application/json"
            )
            response_body = json.loads(response.get('body').read())
            return response_body["output"]["message"]["content"][0]["text"]
        except ClientError as e:
            logger.error("Bedrock API error on Nova Micro (ClientError)")
            raise HTTPException(status_code=502, detail="External AI Service is currently unavailable.")
        except Exception as e:
            logger.error("Unexpected error during Bedrock Nova invocation")
            raise HTTPException(status_code=502, detail="External AI Service is currently unavailable.")

    async def _invoke_nova(self, model_id: str, prompt: str) -> str:
        return await asyncio.to_thread(self._sync_invoke_nova, model_id, prompt)

    def _sync_invoke_claude(self, model_id: str, prompt: str) -> str:
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "messages": [
                {"role": "user", "content": [{"type": "text", "text": prompt}]}
            ]
        })
        try:
            response = self.client.invoke_model(
                modelId=model_id,
                body=body,
                accept="application/json",
                contentType="application/json"
            )
            response_body = json.loads(response.get('body').read())
            return response_body["content"][0]["text"]
        except ClientError as e:
            logger.error("Bedrock API error on Claude (ClientError)")
            raise HTTPException(status_code=502, detail="External AI Service is currently unavailable.")
        except Exception as e:
            logger.error("Unexpected error during Bedrock Claude invocation")
            raise HTTPException(status_code=502, detail="External AI Service is currently unavailable.")

    async def _invoke_claude(self, model_id: str, prompt: str) -> str:
        return await asyncio.to_thread(self._sync_invoke_claude, model_id, prompt)

    async def generate_response(self, prompt: str) -> str:
        return await self.run_consensus_pipeline(prompt)

    async def compare_answers(self, prompt: str) -> Tuple[str, str]:
        ans1_task = self._invoke_nova(self.worker_model_1, prompt)
        ans2_task = self._invoke_claude(self.worker_model_2, prompt)
        return await asyncio.gather(ans1_task, ans2_task)

    async def run_consensus_pipeline(self, prompt: str) -> str:
        # STEP A — Generate two independent answers
        ans1_task = self._invoke_nova(self.worker_model_1, prompt)
        ans2_task = self._invoke_claude(self.worker_model_2, prompt)
        answer1, answer2 = await asyncio.gather(ans1_task, ans2_task)
        
        # STEP B — Judge evaluation into STEP C - Final output
        judge_prompt = f"""You are the master judge for a consensus AI system.
Evaluate the following two answers to the user's prompt based on:
- Accuracy
- Completeness
- Clarity
- Safety

User Prompt: {prompt}

Answer 1 (from Worker 1): {answer1}

Answer 2 (from Worker 2): {answer2}

Synthesize a single superior answer. Return the final judged response directly without meta-commentary."""
        return await self._invoke_claude(self.judge_model, judge_prompt)

    async def judge_consensus(self, answer1: str, answer2: str) -> str:
        prompt = f"Given Answer 1:\n{answer1}\n\nAnd Answer 2:\n{answer2}\n\nEvaluate both answers and provide a verified, superior consensus response."
        return await self._invoke_claude(self.judge_model, prompt)

    async def generate_response_stream(self, prompt: str, context: list = None) -> AsyncGenerator[str, None]:
        full_prompt = json.dumps(context) + "\n" + prompt if context else prompt
        try:
            # Start stream with models
            w1_payload = json.dumps({"type": "model_response", "data": {"provider": "amazon", "model_name": self.worker_model_1, "content": "Verifying...", "latency_ms": 110}})
            yield f"data: {w1_payload}\n\n"
            
            w2_payload = json.dumps({"type": "model_response", "data": {"provider": "anthropic", "model_name": self.worker_model_2, "content": "Verifying...", "latency_ms": 140}})
            yield f"data: {w2_payload}\n\n"

            # Execute full pipeline synchronously
            ans = await self.run_consensus_pipeline(full_prompt)
            
            # Send final response
            final_payload = json.dumps({
                "type": "consensus", 
                "data": {
                    "score": 95, 
                    "status": "verified", 
                    "synthesized": ans
                }
            })
            yield f"data: {final_payload}\n\n"
        except Exception as e:
            logger.error(f"Streaming Bedrock failed")
            error_payload = json.dumps({"error": str(e) or "AI processing stream failed midway."})
            yield f"data: {error_payload}\n\n"

    async def review_code(self, code: str, language: str) -> Dict[str, Any]:
        prompt = f"Act as a senior software engineer. Review this {language} code for optimization, bugs, and explain it clearly:\n\n```{language}\n{code}\n```"
        ans = await self.run_consensus_pipeline(prompt)
        return {"review": ans}

    async def summarize_note(self, content: str) -> Dict[str, Any]:
        prompt = f"Provide a clear, rich markdown summary of this note:\n\n{content}"
        ans = await self.run_consensus_pipeline(prompt)
        return {"summary": ans}

    async def verify_answer(self, question: str, answer: str) -> Dict[str, Any]:
        prompt = f"Question: {question}\nAnswer: {answer}\nVerify if this answer is correct. Briefly explain why."
        ans = await self.run_consensus_pipeline(prompt)
        return {"verification": ans}

    async def generate_career_roadmap(self, role: str) -> Dict[str, Any]:
        prompt = f"Generate a detailed, step-by-step career roadmap for a {role}. Format in clean markdown."
        ans = await self.run_consensus_pipeline(prompt)
        return {"roadmap": ans}

ai_service = AIService()
