# Requirements Document — Consensus Bedrock Engine

## Introduction

The Consensus Bedrock Engine is a multi-agent AI system designed to provide high-quality, verified answers by orchestrating multiple LLMs on AWS Bedrock. The system prioritises cost-efficiency by using small "worker" models (Llama 4 Scout and Ministral 8B) and invoking a "judge" model (Amazon Nova Pro) on every live query — either to compare high-quality responses or to replace low-quality ones. This approach ensures accurate, hallucination-resistant responses while maintaining low operational costs.

## Project Overview

The Consensus Bedrock Engine addresses the challenge of AI hallucinations and inconsistent responses by implementing a cascade pattern with quantitative scoring. Each worker response is evaluated against a 7-metric scoring engine. The Judge model is then invoked to either compare both responses (when at least one scores above the threshold) or provide a definitive corrected answer (when both score below the threshold). Semantic caching eliminates redundant API calls for repeated queries.

## Glossary

| Term | Definition |
|---|---|
| **Consensus_System** | The complete Consensus Bedrock Engine application |
| **Smart_Router** | AWS Lambda function that orchestrates worker agents and scoring logic |
| **Worker_Models** | Small, cost-efficient LLMs (Llama 4 Scout 17B, Ministral 8B 3.0) that generate initial responses |
| **Judge_Model** | Amazon Nova Pro — invoked on every live query for comparison or correction |
| **Scoring_Engine** | 7-metric evaluation system (Confidence, Hallucination, Keyword Match, Length, Repetition, Readability, Specificity) |
| **Semantic_Cache** | Dual-layer caching system: Aurora (primary) and DynamoDB (fallback), keyed by `{username}_{MD5(query)}` |
| **Deep_Dive** | On-demand technical analysis where the Judge compares worker responses in detail |
| **Frontend_Dashboard** | React-based SPA for query submission, score visualisation, and additional learning features |
| **Aurora_DB** | Amazon Aurora PostgreSQL Serverless v2 — primary cache and user data persistence layer |
| **DynamoDB_Cache** | Amazon DynamoDB `semantic_cache` table — fallback cache layer |
| **Weighted_Score** | Aggregate score from 7 metrics (0–1 scale), threshold at 0.75 |
| **IMPROVED_BY_JUDGE** | Response status when both workers score ≤ 0.75; Judge provides definitive answer |
| **COMPARISON** | Response status when at least one worker scores > 0.75; Judge compares both responses |

---

## Requirements

### Requirement 1: Multi-Agent Query Routing

**User Story:** As a user, I want my query to be processed by multiple AI models simultaneously, so that I can receive diverse perspectives and reduce the risk of hallucinations.

#### Acceptance Criteria

1. WHEN a user submits a query, THE Smart_Router SHALL route the query to two Worker_Models concurrently.
2. THE Smart_Router SHALL use Llama 4 Scout 17B as the primary Worker_Model.
3. THE Smart_Router SHALL use Ministral 8B 3.0 as the secondary Worker_Model.
4. WHEN routing queries, THE Smart_Router SHALL use `asyncio.gather` for concurrent invocation.
5. THE Smart_Router SHALL complete worker invocations within 5 seconds under normal load.

---

### Requirement 2: Quantitative Response Scoring

**User Story:** As a system administrator, I want every AI response to be evaluated against objective metrics, so that I can ensure quality and identify when judge correction is needed.

#### Acceptance Criteria

1. WHEN Worker_Models return responses, THE Scoring_Engine SHALL evaluate each response against 7 metrics.
2. THE Scoring_Engine SHALL calculate the Confidence score using the Judge_Model API (Nova Pro).
3. THE Scoring_Engine SHALL calculate the Hallucination score using the Judge_Model API (Nova Pro).
4. THE Scoring_Engine SHALL calculate the Keyword Match score using Python regex locally.
5. THE Scoring_Engine SHALL calculate the Length score using Python locally.
6. THE Scoring_Engine SHALL calculate the Repetition score using Python locally (unique word ratio).
7. THE Scoring_Engine SHALL calculate the Readability score using the Flesch-Kincaid algorithm locally.
8. THE Scoring_Engine SHALL calculate the Specificity score using Python regex locally.
9. THE Scoring_Engine SHALL compute a Weighted_Score by aggregating all 7 metrics using the following weights:

   | Metric | Weight |
   |---|---|
   | Confidence | 30% |
   | Keyword Match | 15% |
   | Repetition Penalty | 15% |
   | Length | 10% |
   | Readability | 10% |
   | Specificity | 10% |
   | Hallucination Defense | 10% |

10. Both workers SHALL be scored concurrently using `asyncio.gather`.

---

### Requirement 3: Adaptive Judge Invocation

**User Story:** As a user, I want poor-quality or hallucinated responses to be corrected automatically, and high-quality responses to be compared objectively, so that I always receive the best possible answer.

#### Acceptance Criteria

1. WHEN both Worker_Models produce a Weighted_Score ≤ 0.75, THE Smart_Router SHALL invoke the Judge_Model to generate a definitive corrected answer (status: `IMPROVED_BY_JUDGE`).
2. WHEN at least one Worker_Model produces a Weighted_Score > 0.75, THE Smart_Router SHALL invoke the Judge_Model to compare both responses and explain which is better (status: `COMPARISON`).
3. THE Judge_Model SHALL always be invoked for live (non-cached) queries.
4. WHEN a response is served from cache, all Bedrock API calls INCLUDING the Judge SHALL be skipped.
5. WHEN Judge_Model is invoked, THE Smart_Router SHALL use Amazon Nova Pro (`amazon.nova-pro-v1:0`).

---

### Requirement 4: Semantic Caching

**User Story:** As a user, I want repeated queries to return instantly, so that I don't wait for responses to be regenerated.

#### Acceptance Criteria

1. WHEN a query is submitted, THE Semantic_Cache SHALL compute an MD5 hash of the query text combined with the username.
2. WHEN checking cache, THE Semantic_Cache SHALL first query Aurora using the hash as a primary key.
3. WHEN Aurora returns a cache hit with a valid (non-error) response, THE Semantic_Cache SHALL return it within 100 ms.
4. WHEN Aurora misses, THE Semantic_Cache SHALL query DynamoDB using the same key as the partition key (`question_hash`).
5. WHEN DynamoDB returns a cache hit with a valid response, THE Semantic_Cache SHALL return it within 50 ms.
6. WHEN both layers miss, THE Semantic_Cache SHALL proceed with live worker model invocation.
7. WHEN a new response is successfully generated, THE Semantic_Cache SHALL write it to both Aurora and DynamoDB.
8. WHEN a cached entry contains an error response, THE Semantic_Cache SHALL skip it and fall through to the next layer or a live call.

> **Implementation note**: No automatic TTL is currently enforced on cached entries in either Aurora or DynamoDB. Items persist indefinitely unless manually deleted.

---

### Requirement 5: Real-Time User Interface

**User Story:** As a user, I want an intuitive dashboard to submit queries and view detailed AI score breakdowns, so that I can understand how my answer was generated and validated.

#### Acceptance Criteria

1. THE Frontend_Dashboard SHALL be implemented using the React framework (React 19) and built with Vite.
2. WHEN a user visits the application, THE Frontend_Dashboard SHALL display a username entry screen before granting access.
3. WHEN results are received, THE Frontend_Dashboard SHALL display both worker responses with their individual metric scores.
4. WHEN displaying scores, THE Frontend_Dashboard SHALL show the Weighted_Score for each worker prominently.
5. THE Frontend_Dashboard SHALL indicate whether the Judge_Model was invoked and show the Judge's explanation.
6. THE Frontend_Dashboard SHALL provide a loading indicator during query processing.
7. THE Frontend_Dashboard SHALL support dark mode.
8. THE Frontend_Dashboard SHALL be responsive and functional on mobile devices.

---

### Requirement 6: Deep Dive Analysis

**User Story:** As a developer, I want to request a detailed technical comparison of worker responses, so that I can understand the reasoning differences and make informed decisions.

#### Acceptance Criteria

1. WHEN viewing a `COMPARISON` result, THE Frontend_Dashboard SHALL provide a "Deep Dive" button.
2. WHEN Deep Dive is requested, THE Smart_Router SHALL invoke the Judge_Model to perform a detailed technical comparison of both worker responses.
3. WHEN Judge_Model analyses responses, THE Smart_Router SHALL request identification of what is correct or incorrect in each, plus a definitive recommendation.
4. WHEN Deep Dive completes, THE Frontend_Dashboard SHALL display the analysis as formatted Markdown.
5. Deep Dive results SHALL NOT be cached.

---

### Requirement 7: Learning Features

**User Story:** As a student, I want tools to manage study notes, generate flashcards, track my progress, and explore career roadmaps, so that I can use the system as a comprehensive learning platform.

#### Acceptance Criteria

1. THE Frontend_Dashboard SHALL provide a Notes tab where users can write and save study notes.
2. WHEN a user requests flashcard generation, THE Consensus_System SHALL use Nova Pro to generate a JSON array of question-answer flashcard pairs from the note content.
3. WHEN a user requests notes analysis, THE Consensus_System SHALL run the notes through both Worker_Models and return the higher-scoring analysis.
4. THE Frontend_Dashboard SHALL provide a Career tab where users can generate structured learning roadmaps for a given topic.
5. WHEN a career roadmap is requested, THE Smart_Router SHALL use Llama 4 Scout to generate a JSON object containing a description, required skills, learning modules, and resource URLs.
6. THE Frontend_Dashboard SHALL provide a Progress tab displaying learning activity metrics with AI coaching feedback from Nova Pro.
7. User notes and progress data SHALL be persisted per username across sessions.

---

### Requirement 8: Code Hub

**User Story:** As a developer, I want to write, review, and test code within the application, so that I can validate AI-generated code without leaving the platform.

#### Acceptance Criteria

1. THE Frontend_Dashboard SHALL provide a Code Hub tab with a syntax-highlighted code editor.
2. WHEN a user requests AI code review, THE Smart_Router SHALL use Nova Pro to provide bug analysis and optimisation suggestions.
3. WHEN a user requests code execution simulation, THE Smart_Router SHALL use Nova Pro acting as a compiler/runtime to return the expected console output or error traceback.
4. THE Code Hub SHALL support multiple programming languages.

---

### Requirement 9: Relational Data Persistence

**User Story:** As a system administrator, I want persistent storage for user data, so that users can access their history across sessions.

#### Acceptance Criteria

1. THE Consensus_System SHALL use Amazon Aurora PostgreSQL Serverless v2 as the primary persistence layer.
2. THE Aurora_DB SHALL be accessed using the RDS Data API for connectionless execution.
3. THE Aurora_DB `consensus_store` table SHALL store query cache entries and all user data records.
4. User data records SHALL be keyed as `USER_DATA_{username}_{data_type}`.
5. THE DynamoDB_Cache SHALL serve as a fallback when Aurora is unavailable or slow.

> **Pre-deployment requirement**: The Aurora cluster, Secrets Manager secret, and DynamoDB `semantic_cache` table must be created manually before running `cdk deploy`. The CDK stack provisions IAM access to these resources but does not create them.

---

### Requirement 10: Performance and Latency

**User Story:** As a user, I want fast response times so that I can get answers quickly.

#### Acceptance Criteria

1. WHEN a cached query is requested, THE Consensus_System SHALL return results within 100 ms.
2. WHEN processing live multi-agent queries, THE Consensus_System SHALL complete within 60 seconds (Lambda timeout).
3. WHEN worker models are invoked, THE Smart_Router SHALL use concurrent execution (`asyncio.gather`) to minimise latency.
4. THE Frontend_Dashboard SHALL display a loading indicator for the full duration of a live query.

---

### Requirement 11: High Availability

**User Story:** As a system administrator, I want the system to remain available even during regional model outages, so that users experience minimal disruption.

#### Acceptance Criteria

1. THE Consensus_System SHALL use a Cross-Region Inference Profile for the Llama 4 Scout Worker_Model, enabling automatic failover between `us-east-1` and `us-west-2`.
2. WHEN a regional Llama endpoint is overloaded, AWS SHALL silently re-route the request to the alternate region.
3. THE Consensus_System SHALL use botocore `adaptive` retry mode with up to 5 attempts to handle Bedrock rate limits automatically.
4. WHEN all Worker_Models return errors, THE Smart_Router SHALL return a structured error response with an error message.

> **Implementation note**: Cross-region inference currently applies to Llama 4 Scout only. Ministral 8B and Nova Pro use direct model IDs in `us-east-1`.

---

### Requirement 12: Cost Control and Efficiency

**User Story:** As a budget-conscious administrator, I want to minimise AI inference costs so that the system remains economically sustainable at scale.

#### Acceptance Criteria

1. THE Consensus_System SHALL use small Worker_Models (Llama 4 Scout 17B, Ministral 8B 3.0) for initial response generation.
2. THE Consensus_System SHALL cache responses aggressively in Aurora and DynamoDB to reduce redundant Bedrock API calls.
3. WHEN a cache hit occurs, THE Consensus_System SHALL return the cached response without invoking any Bedrock models.
4. THE estimated cost per query SHALL remain below $0.0001 for cached queries and below $0.001 for live queries under normal conditions.

---

### Requirement 13: Rate Limiting and Abuse Prevention

**User Story:** As a system administrator, I want to prevent API abuse so that the system remains available for legitimate users.

#### Acceptance Criteria

1. THE Consensus_System SHALL enforce a rate limit of 60 requests per minute per client IP address.
2. WHEN the rate limit is exceeded, THE Smart_Router SHALL return HTTP 429 with an error message.
3. Rate limit counters SHALL reset every 60 seconds per client.

> **Implementation note**: Rate limit state is stored in an in-memory dictionary (`RATE_LIMIT_STORE`) within the Lambda process. It resets on Lambda cold start and is not shared across concurrent Lambda instances. For production use, DynamoDB-backed rate limiting is recommended.

---

### Requirement 14: Error Handling and Resilience

**User Story:** As a user, I want the system to handle errors gracefully so that I receive useful feedback even when things go wrong.

#### Acceptance Criteria

1. WHEN a Worker_Model returns an error response, THE Smart_Router SHALL detect it and return a structured error.
2. WHEN both Worker_Models fail, THE Smart_Router SHALL return an `ERROR` status response.
3. WHEN Judge_Model fails, THE Smart_Router SHALL propagate the error to the frontend with a human-readable message.
4. THE Smart_Router SHALL use botocore adaptive retry mode to handle Bedrock rate limits before surfacing an error.
5. WHEN errors occur, THE Consensus_System SHALL log error context to AWS CloudWatch via Lambda's standard stdout logging.
6. THE Frontend_Dashboard SHALL detect error responses and prevent them from being persisted to the user's session cache.

---

### Requirement 15: Infrastructure as Code

**User Story:** As a DevOps engineer, I want the infrastructure defined as code, so that I can reproduce and version the system reliably.

#### Acceptance Criteria

1. THE Consensus_System backend infrastructure SHALL be defined using AWS CDK (Python).
2. THE CDK stack SHALL provision the Lambda function, IAM roles, Lambda Function URL, and DynamoDB table access grants.
3. THE CDK stack SHALL use least-privilege IAM policies for all resources.
4. THE CDK stack SHALL configure a Lambda Function URL with CORS for direct HTTPS access from the frontend.
5. THE CDK stack SHALL output the Lambda Function URL as a CloudFormation output (`ConsensusAPIEndpoint`).

> **Pre-deployment requirement**: The CDK stack does **not** provision the Aurora Serverless v2 cluster, Secrets Manager secret, DynamoDB table, or Amplify app. These must be created manually before running `cdk deploy`. See the README for the full pre-deployment checklist.

---

### Requirement 16: File and Multimodal Input

**User Story:** As a user, I want to attach images and documents to my queries, so that I can ask questions about files alongside text.

#### Acceptance Criteria

1. THE Frontend_Dashboard SHALL allow users to attach image files and documents to a query.
2. WHEN files are attached, THE Frontend_Dashboard SHALL encode them as base64 and include them in the Lambda request payload.
3. WHEN attachments are present, THE Smart_Router SHALL pass them to both Worker_Models using the Bedrock Converse API multimodal content format.
4. THE Smart_Router SHALL support `image` and `document` attachment types.

---

### Requirement 17: Voice Input

**User Story:** As a user, I want to speak my query instead of typing, so that I can interact with the system hands-free.

#### Acceptance Criteria

1. THE Frontend_Dashboard SHALL provide a voice input button that activates microphone recording.
2. THE Frontend_Dashboard SHALL use the browser's Web Speech API for speech-to-text transcription.
3. WHEN the user stops speaking for 5 seconds, THE Frontend_Dashboard SHALL automatically stop recording and submit the transcribed query.
4. THE Frontend_Dashboard SHALL display a visual indicator while recording is active.

> **Implementation note**: The Web Speech API (`webkitSpeechRecognition`) is currently supported only in Google Chrome.

---

## Implementation Status Summary

| Requirement | Status | Notes |
|---|---|---|
| 1 — Multi-Agent Routing | ✅ Implemented | `asyncio.gather` confirmed in source |
| 2 — 7-Metric Scoring | ✅ Implemented | All 7 metrics and weights confirmed |
| 3 — Adaptive Judge Invocation | ✅ Implemented | Judge always invoked for live queries |
| 4 — Semantic Caching | ✅ Implemented | No TTL currently enforced |
| 5 — Real-Time UI | ✅ Implemented | React 19 + Vite |
| 6 — Deep Dive Analysis | ✅ Implemented | `JUDGE_DEEP_DIVE` action |
| 7 — Learning Features | ✅ Implemented | Notes, Flashcards, Career, Progress |
| 8 — Code Hub | ✅ Implemented | `EXECUTE_CODE` + `ANALYZE_DATA` |
| 9 — Relational Persistence | ✅ Implemented | Aurora + DynamoDB dual-layer |
| 10 — Performance | ✅ Implemented | Concurrent processing |
| 11 — High Availability | ⚠️ Partial | Cross-region for Llama only |
| 12 — Cost Control | ✅ Implemented | Caching eliminates redundant calls |
| 13 — Rate Limiting | ⚠️ Partial | In-memory only; not persistent |
| 14 — Error Handling | ✅ Implemented | Adaptive retry + CloudWatch logs |
| 15 — Infrastructure as Code | ⚠️ Partial | CDK does not provision Aurora/DynamoDB |
| 16 — Multimodal Input | ✅ Implemented | Base64 image + document attachments |
| 17 — Voice Input | ✅ Implemented | Chrome only (Web Speech API) |
