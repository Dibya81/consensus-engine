# 🧠 Consensus Engine — System Design Document

## 1. Design Goals

The primary goal of Consensus Engine is to provide **reliable, verified AI-generated answers** by aggregating outputs from multiple independent models and synthesizing a consensus.

Key objectives:

- Increase trust in AI-generated content
- Reduce hallucinations and incorrect responses
- Provide confidence scoring and transparency
- Maintain low latency through parallel processing
- Ensure modularity for future model integrations
- Support scalability and production deployment

---

## 2. Core Problem

Single-model AI systems can produce:

- Hallucinated facts
- Outdated information
- Overconfident incorrect answers
- Lack of reliability indicators

Users often cannot independently verify correctness.

Consensus Engine addresses this by introducing a validation layer across multiple models.

---

## 3. High-Level Architecture

Client → API Gateway → Orchestrator → Multiple AI Agents → Arbiter → Response



### Components:

- Client Interface (Web UI)
- FastAPI Backend
- Agent Modules
- Consensus Arbiter
- Optional Caching Layer

---

## 4. System Components

### 4.1 API Layer

Handles incoming requests and response formatting.

Responsibilities:

- Input validation
- Routing
- Error handling
- Versioning
- Security checks

---

### 4.2 Orchestrator (Consensus Service)

Central coordination component.

Responsibilities:

- Dispatch queries to multiple agents
- Execute agents in parallel
- Aggregate responses
- Pass results to Arbiter
- Handle timeouts and failures

---

### 4.3 AI Agents

Each agent represents an independent model provider.

Examples:

- GPT Agent
- Gemini Agent

Design Characteristics:

- Modular and interchangeable
- Isolated from orchestration logic
- Support asynchronous execution
- Can be replaced with real APIs without system redesign

---

### 4.4 Arbiter (Consensus Engine Core)

Evaluates responses from agents and produces the final output.

Functions:

- Compare answers for agreement
- Detect contradictions
- Compute confidence score
- Synthesize final answer
- Provide explanation of consensus

Confidence factors include:

- Semantic similarity
- Completeness of responses
- Presence of conflicting information
- Agreement ratio between agents

---

### 4.5 Response Generator

Produces structured output:

{
answer: "...",
confidence_score: 0.92,
confidence_level: "High",
agreement_summary: "...",
sources: [...]
}


---

### 4.6 Caching Layer (Future Enhancement)

A caching system (e.g., Redis) can store previously verified answers to:

- Reduce response latency
- Minimize API costs
- Improve scalability

---

## 5. Concurrency Design

Parallel execution is implemented using asynchronous processing.

Benefits:

- Properties 1.1 and 1.4 both relate to the broadcaster's collection behavior and can be combined into a single property about complete concurrent broadcasting
- Properties 2.2 and 2.3 test opposite sides of the same scoring logic and can be unified into one property about score-consensus correlation
- Properties 3.2, 3.3, and 3.4 all relate to conflict output structure and can be combined into a comprehensive conflict presentation property
- Properties 4.1 and 4.2 both test cache lookup behavior and can be unified
- Properties 5.1 and 5.2 both relate to streaming response metadata and can be combined
- Properties 9.1 and 9.2 both test graceful degradation and can be unified into one resilience property
- Properties 10.2, 10.3, and 10.4 all relate to data privacy and can be consolidated

### Broadcasting Properties

**Property 1: Concurrent Multi-Model Broadcasting**
*For any* query, the Multi_Model_Broadcaster should send the query to at least two LLM providers concurrently via Amazon Bedrock (including Claude Judge and worker models like Llama 3 and Mistral Large), and collect all successful responses for comparison.
**Validates: Requirements 1.1, 1.2, 1.4**

**Property 2: Resilient Broadcasting**
*For any* query where one or more LLM providers fail, the Multi_Model_Broadcaster should continue processing and return results from all successful providers without blocking on failures.
**Validates: Requirements 1.3, 9.1**

### Consensus and Verification Properties

**Property 3: Consensus Score Correlation**
*For any* pair of responses, if the responses have high semantic similarity (>0.8 embedding cosine similarity), the Consensus_Score should be above 0.7, and if they have low semantic similarity (<0.5), the Consensus_Score should be below 0.7.
**Validates: Requirements 2.2, 2.3**

**Property 4: Verification Status Assignment**
*For any* consensus result, the Judge_Agent should assign a valid Verification_Status (VERIFIED, PARTIAL, CONFLICTED, or SINGLE_SOURCE) based on the consensus score and number of responses.
**Validates: Requirements 2.4**

**Property 5: Semantic Comparison Completeness**
*For any* set of N model responses, the Judge_Agent should perform semantic comparison on all N responses (not just pairwise), considering the overall agreement across all models.
**Validates: Requirements 2.1**

**Property 6: Single Source Degradation**
*For any* query where only one LLM provider successfully responds, the system should return that response with Verification_Status set to SINGLE_SOURCE.
**Validates: Requirements 9.2**

### Conflict Resolution Properties

**Property 7: Conflict Identification and Presentation**
*For any* consensus result with score below 0.7, the Conflict_Resolver should identify specific areas of disagreement, extract each unique perspective with its source LLM provider label, and structure them in the ConflictView format.
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Caching Properties

**Property 8: Semantic Cache Lookup**
*For any* query, the Semantic_Cache should check for semantically similar previous queries using embedding similarity, and return cached results when similarity exceeds the threshold (default 0.9).
**Validates: Requirements 4.1, 4.2**

**Property 9: Cache Storage Round-Trip**
*For any* query and its consensus result, storing them in the Semantic_Cache and then retrieving with the same query should return an equivalent result.
**Validates: Requirements 4.3**

### Streaming Properties

**Property 10: Immediate Response Streaming with Metadata**
*For any* LLM provider response, the Backend_API should stream the response immediately upon receipt, and each streamed response should include the provider identifier and model name.
**Validates: Requirements 5.1, 5.2**

**Property 11: Consensus Completion Event**
*For any* query where all responses have been streamed, the Backend_API should send a final event containing the Consensus_Score and Verification_Status.
**Validates: Requirements 5.4**

### Input Validation Properties

**Property 12: Query Parameter Validation**
*For any* request to the Backend_API, invalid query parameters (empty query, negative max_models, etc.) should be rejected with a 400 status code and descriptive error message, while valid parameters should be accepted.
**Validates: Requirements 6.2, 6.4**

### Error Handling Properties

**Property 13: Retry Logic**
*For any* network error when calling an LLM provider, the system should retry the request up to 2 times before marking it as failed.
**Validates: Requirements 9.4**

**Property 14: Error Logging Completeness**
*For any* error that occurs, the system should log an entry containing at minimum: timestamp, error type, error message, and relevant context (query_id, model_name, etc.).
**Validates: Requirements 9.5**

### Security and Privacy Properties

**Property 15: Data Privacy in Storage**
*For any* query stored in cache or database, the stored representation should not contain personally identifiable information patterns (email addresses, phone numbers, API keys, etc.), and queries should be hashed or sanitized.
**Validates: Requirements 10.2, 10.3, 10.4**

**Property 16: Rate Limiting**
*For any* user or IP address, if they exceed the rate limit threshold (e.g., 100 requests per minute), subsequent requests should be rejected with a 429 status code until the rate limit window resets.
**Validates: Requirements 10.5**

### UI Properties

**Property 17: Verification Status Display**
*For any* query result received by the Frontend_Client, the rendered output should include the Verification_Status value in a visible element.
**Validates: Requirements 7.3**

**Property 18: Loading State Indicators**
*For any* active streaming connection, the Frontend_Client should set and display loading state indicators, and clear them when streaming completes or errors.
**Validates: Requirements 7.5**

## Error Handling

### Error Categories

#### LLM Provider Errors
- **Timeout**: Provider fails to respond within configured timeout (default 10s)
- **API Error**: Provider returns error response (rate limit, invalid request, service unavailable)
- **Network Error**: Connection failure or network interruption

**Handling Strategy:**
- Log error with full context (provider, query_id, error details)
- Retry up to 2 times with exponential backoff (1s, 2s)
- Continue processing with other providers
- If all providers fail, return 503 Service Unavailable with error details

#### Cache Errors
- **Redis Connection Error**: Cannot connect to Redis instance
- **Cache Miss**: No semantically similar query found

**Handling Strategy:**
- On connection error: Log warning, bypass cache, proceed with LLM queries
- On cache miss: Normal flow, proceed with LLM queries
- Never block user requests due to cache failures

#### Validation Errors
- **Invalid Query**: Empty query, query exceeds max length
- **Invalid Parameters**: Negative values, unsupported options

**Handling Strategy:**
- Return 400 Bad Request immediately
- Include specific validation error message
- Do not process invalid requests

#### Database Errors
- **Connection Error**: Cannot connect to PostgreSQL
- **Write Error**: Failed to persist query history

**Handling Strategy:**
- Log error with full context
- Continue processing user request (history is non-critical)
- Return successful response to user even if history write fails
- Implement retry queue for failed writes

### Error Response Format

```json
{
  "error": {
    "code": "LLM_PROVIDER_FAILURE",
    "message": "All LLM providers failed to respond",
    "details": {
      "gemini": "Timeout after 10s",
      "gpt4": "Rate limit exceeded"
    },
    "query_id": "uuid",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Testing Strategy

### Dual Testing Approach

Consensus requires both unit testing and property-based testing for comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and integration points
- **Property Tests**: Verify universal properties across randomized inputs

Together, these approaches ensure both concrete correctness (unit tests catch specific bugs) and general correctness (property tests verify behavior across all inputs).

### Property-Based Testing Configuration

**Library Selection:**
- **Python Backend**: Use `hypothesis` library for property-based testing
- **TypeScript Frontend**: Use `fast-check` library for property-based testing

**Test Configuration:**
- Each property test MUST run minimum 100 iterations
- Each test MUST include a comment tag referencing the design property
- Tag format: `# Feature: consensus, Property {number}: {property_text}`

**Example Property Test (Python):**
```python
from hypothesis import given, strategies as st

# Feature: consensus, Property 3: Consensus Score Correlation
@given(
    response1=st.text(min_size=50),
    response2=st.text(min_size=50)
)
def test_consensus_score_correlation(response1, response2):
    """
    For any pair of responses, consensus score should correlate
    with semantic similarity
    """
    judge = ConsensusJudge()
    similarity = judge.calculate_similarity(response1, response2)
    result = judge.evaluate([
        ModelResponse(content=response1, model_name="model1"),
        ModelResponse(content=response2, model_name="model2")
    ])
    
    if similarity > 0.8:
        assert result.consensus_score > 0.7
    elif similarity < 0.5:
        assert result.consensus_score < 0.7
```

### Unit Testing Focus Areas

Unit tests should focus on:

1. **Specific Examples**: Test known query-response pairs
2. **Edge Cases**: Empty responses, single-word queries, very long responses
3. **Integration Points**: API endpoint contracts, database schema validation
4. **Error Conditions**: Specific error scenarios (timeout, invalid JSON, etc.)

**Example Unit Test:**
```python
def test_empty_query_rejection():
    """Test that empty queries are rejected with 400 status"""
    response = client.post("/api/v1/ask", json={"query": ""})
    assert response.status_code == 400
    assert "query" in response.json()["error"]["message"].lower()
```

### Test Coverage Goals

- **Backend**: Minimum 80% code coverage
- **Critical Paths**: 100% coverage for consensus logic, caching, error handling
- **Property Tests**: All 18 correctness properties implemented
- **Integration Tests**: All API endpoints tested with realistic scenarios

### Testing Pyramid

```
    /\
   /  \     E2E Tests (5%)
  /____\    - Full user flows
 /      \   Integration Tests (15%)
/________\  - API contracts, DB operations
           Unit + Property Tests (80%)
           - Business logic, utilities
```