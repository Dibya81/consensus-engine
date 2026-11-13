# Design Document â€” Consensus Bedrock Engine

## 1. System Architecture

The system follows a serverless, event-driven architecture built on AWS. All backend logic runs inside a single high-performance AWS Lambda function. The frontend is a React SPA served via AWS Amplify.

### 1.1 Architecture Diagram

Refer to `images/architecture_diagram.png` for a visual representation of the data flow.

---

## 2. Component Design

### 2.1 Smart Router (AWS Lambda)

The core logic resides in `lambda/lambda_function.py`.

- **Handler**: `lambda_handler`
- **Runtime**: Python 3.11
- **Memory**: 1024 MB
- **Timeout**: 60 seconds
- **Dispatcher**: Concurrently invokes both worker agents using `asyncio.gather`.
- **Scoring Engine**: Implements the 7-metric evaluation logic locally for speed, using external Bedrock API calls only for the Confidence and Hallucination checks (both delegated to Nova Pro).
- **Rate Limiter**: In-memory dictionary (`RATE_LIMIT_STORE`) enforcing 60 requests per minute per client IP. Resets on Lambda cold start and is not shared across concurrent instances.

### 2.2 Data Layer

The system uses a dual-layer caching strategy. Aurora is the primary store; DynamoDB is the fallback.

| Layer | Service | Role | Key Format |
|---|---|---|---|
| Primary | Amazon Aurora PostgreSQL Serverless v2 | Cache + user data persistence | `{username}_{MD5(query)}` |
| Fallback | Amazon DynamoDB (`semantic_cache` table) | Cache fallback | `{username}_{MD5(query)}` |

**Aurora** (`consensus_store` table):
```sql
CREATE TABLE IF NOT EXISTS consensus_store (
    key TEXT PRIMARY KEY,
    value TEXT,
    query_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```
Aurora is accessed via the **RDS Data API** for connectionless execution, eliminating Lambda cold-start connection overhead. Aurora is **not provisioned by the CDK stack** â€” it must be created manually before deployment.

**DynamoDB** (`semantic_cache` table):
- Partition key: `question_hash` (String)
- Also stores user data (notes, chat sessions, etc.) under keys prefixed with `USER_DATA_{username}_{data_type}`
- The table is **not provisioned by the CDK stack** â€” it must be created manually. CDK references it by name using `Table.from_table_name()`.

> **Cache lookup order**: Aurora â†’ DynamoDB â†’ Live Bedrock call. Successful responses are written to both layers.

### 2.3 AI Orchestration (Models)

| Role | Model Name | Model ID | Inference |
|---|---|---|---|
| Worker 1 | Llama 4 Scout 17B | Cross-Region Inference Profile ARN (`us.meta.llama4-scout-17b-instruct-v1:0`) | Cross-region (us-east-1 / us-west-2) |
| Worker 2 | Ministral 8B 3.0 | `mistral.ministral-3-8b-instruct` | Direct (us-east-1) |
| Judge | Amazon Nova Pro | `amazon.nova-pro-v1:0` | Direct (us-east-1) |

> **Deployment note**: The Llama 4 Scout model ID in `lambda_function.py` is set to a private account-specific ARN. Deployers must create their own Cross-Region Inference Profile in the AWS Bedrock console and replace the ARN before deploying.

All models are invoked using the Bedrock Converse API (`bedrock_client.converse`) with:
- `temperature`: 0.2
- `maxTokens`: 1000

---

## 3. Logic Flows

### 3.1 Consensus Pipeline (`action: query`)

```
1. Rate Limit Check
   â””â”€ Exceeded? â†’ HTTP 429

2. Cache Check (Aurora)
   â””â”€ Hit? â†’ Return cached response (skips all Bedrock calls)

3. Cache Check (DynamoDB)
   â””â”€ Hit? â†’ Return cached response (skips all Bedrock calls)

4. Parallel Worker Generation (asyncio.gather)
   â”œâ”€ Llama 4 Scout 17B â†’ response_1
   â””â”€ Ministral 8B 3.0  â†’ response_2

5. Parallel Scoring (asyncio.gather on both responses)
   â”œâ”€ Confidence Score     (Nova Pro â€” API call)
   â”œâ”€ Keyword Match Score  (Python regex â€” local)
   â”œâ”€ Length Score         (Python â€” local)
   â”œâ”€ Repetition Score     (Python â€” local)
   â”œâ”€ Readability Score    (Flesch-Kincaid â€” local)
   â”œâ”€ Specificity Score    (Python regex â€” local)
   â””â”€ Hallucination Score  (Nova Pro â€” API call)
   â†’ Weighted final score per worker (0â€“1)

6. Judge Decision
   â”œâ”€ Both scores â‰¤ 0.75 â†’ IMPROVED_BY_JUDGE
   â”‚   â””â”€ Nova Pro generates definitive answer
   â””â”€ At least one score > 0.75 â†’ COMPARISON
       â””â”€ Nova Pro compares both responses; explains which is better

7. Cache Write
   â”œâ”€ Write to Aurora (primary)
   â””â”€ Write to DynamoDB (fallback)

8. Return JSON response
```

### 3.2 Deep Dive Analysis (`action: JUDGE_DEEP_DIVE`)

Triggered by the user clicking "Deep Dive" on a comparison result. The frontend sends both worker response texts back to the Lambda along with the original query. Nova Pro performs a detailed technical breakdown and provides a Judge's Recommendation in Markdown.

```
1. Receive: query, llama_content, ministral_content
2. Nova Pro: detailed side-by-side comparison with correctness analysis
3. Return: Markdown-formatted analysis
```

Deep dive results are written to both Aurora and DynamoDB cache under the same key as the original query (`{username}_{MD5(query)}`). A subsequent identical query may return the cached deep dive result rather than generating a fresh `COMPARISON` response. This is a known side-effect of `JUDGE_DEEP_DIVE` sharing a cache branch with the `query` action in `lambda_handler`.

### 3.3 Notes Analysis (`action: ANALYZE_DATA`, `data_type: notes`)

Two sub-modes controlled by the `mode` field:

| Mode | Behaviour |
|---|---|
| `analyze` | Both workers analyse the notes; responses are scored and sorted by consensus score |
| `flashcards` | Nova Pro generates a JSON array of `{"q": "...", "a": "..."}` flashcard objects |

### 3.4 Code Execution Simulation (`action: EXECUTE_CODE`)

Nova Pro acts as a strict compiler and runtime for the specified `language`. It returns only the raw console output or error traceback â€” no prose.

### 3.5 Career Roadmap Generation (`action: GENERATE_CAREER_ROADMAP`)

Llama 4 Scout generates a structured JSON roadmap for a given `topic`, including:
- Description, required skills, learning modules, and resource URLs.

Returns a parsed JSON object. Falls back to a default skeleton if JSON parsing fails.

### 3.6 User Data Persistence (`GET_USER_DATA`, `SAVE_USER_DATA`, `DELETE_USER_DATA`)

User data (chat sessions, notes, etc.) is keyed as `USER_DATA_{username}_{data_type}` and stored in both Aurora and DynamoDB.

> **Known limitation â€” `DELETE_USER_DATA`**: The Aurora deletion path calls `aurora.get_connection()`, which is not implemented in the `AuroraDB` class. Aurora records are **not deleted**. Data is deleted from DynamoDB only. This is a known implementation gap; Aurora records persist until overwritten by a subsequent save.

### 3.7 Adaptive Throttling

```python
retry_config = Config(retries={'max_attempts': 5, 'mode': 'adaptive'})
bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1', config=retry_config)
```

Botocore's `adaptive` retry mode automatically backs off with exponential jitter on HTTP 429 (Bedrock rate limit) responses. No manual retry handling is required.

---

## 4. Infrastructure (AWS CDK)

Defined in `consensus_bedrock_backend/consensus_bedrock_stack.py`.

### 4.1 Resources Provisioned by CDK

| Resource | Configuration |
|---|---|
| AWS Lambda Function | Python 3.11, 1024 MB memory, 60 s timeout |
| Lambda Function URL | Auth type: NONE; CORS: `*`, POST only |
| IAM Policy â€” Bedrock | `bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream` on `*` |
| IAM Policy â€” Aurora | `rds-data:ExecuteStatement`, `rds-data:BatchExecuteStatement`, `secretsmanager:GetSecretValue` |
| IAM Policy â€” DynamoDB | Read/write grant on `semantic_cache` table |
| CloudFormation Output | `ConsensusAPIEndpoint` â€” the Lambda Function URL |

### 4.2 Resources NOT Provisioned by CDK (Manual Pre-requisites)

| Resource | Why Manual |
|---|---|
| Aurora Serverless v2 Cluster | Stateful resource â€” managed separately to prevent accidental deletion |
| AWS Secrets Manager Secret | Holds Aurora credentials â€” created alongside the cluster |
| DynamoDB `semantic_cache` table | Referenced by name in CDK; must exist before deploy |
| Cross-Region Inference Profile | Account-specific Bedrock configuration |
| AWS Amplify App | Frontend CI/CD â€” configured manually in the Amplify console |

### 4.3 Lambda Environment Variables

The CDK stack passes these environment variables to the Lambda function at deploy time:

| Variable | Source |
|---|---|
| `DB_CLUSTER_ARN` | `os.getenv("DB_CLUSTER_ARN")` from `.env` |
| `DB_SECRET_ARN` | `os.getenv("DB_SECRET_ARN")` from `.env` |
| `DB_NAME` | `os.getenv("DB_NAME", "postgres")` |
| `DB_HOST` | `os.getenv("DB_HOST")` (passed to Lambda; not used by `lambda_function.py`) |
| `DB_PORT` | `os.getenv("DB_PORT", "5432")` (passed to Lambda; not used by `lambda_function.py`) |

---

## 5. Frontend Architecture

The frontend is a React 19 SPA built with Vite 7.

### 5.1 Routes

| Path | Component | Purpose |
|---|---|---|
| `/` | `LandingPage` | Username entry â€” stored in `localStorage` |
| `/chat` | `EnginePage` | Main application shell |
| `/architecture` | `ArchitecturePage` | Architecture information page |
| `/metrics` | `MetricsPage` | Scoring metrics information page |

### 5.2 EnginePage Tabs

| Tab | Component | Backend Action |
|---|---|---|
| Chat | (inline in EnginePage) | `query`, `JUDGE_DEEP_DIVE` |
| Notes | `NotesView` | `GET_USER_DATA`, `SAVE_USER_DATA`, `ANALYZE_DATA` (notes) |
| Code Hub | `CodeHubView` | `EXECUTE_CODE`, `ANALYZE_DATA` (code_hub) |
| Progress | `ProgressView` | `GET_USER_DATA`, `ANALYZE_DATA` (progress) |
| Career | `CareerView` | `GENERATE_CAREER_ROADMAP` |
| Community | `CommunityView` | â€” |
| History | (popup) | `GET_USER_DATA`, `SAVE_USER_DATA` |

### 5.3 Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | 19.2.0 | UI framework |
| `react-router-dom` | 7.13.1 | Client-side routing |
| `framer-motion` | 12.35.0 | Animations |
| `lucide-react` | 0.577.0 | Icons |
| `recharts` | 3.8.0 | Progress charts |
| `react-markdown` | 10.1.0 | Render judge/deep dive Markdown |
| `prismjs` | 1.30.0 | Syntax highlighting in Code Hub |
| `react-simple-code-editor` | 0.14.1 | Code editor in Code Hub |

### 5.4 Lambda URL Configuration

The Lambda Function URL is hardcoded in `frontend-app/src/pages/EnginePage.jsx`:
```js
const LAMBDA_URL = "https://<id>.lambda-url.us-east-1.on.aws/";
```
This value must be updated manually after each `cdk deploy`.

### 5.5 Build Configuration

Vite outputs the production build to `frontend-app/build/` (not the default `dist/`). Set the **build output directory** to `build` in the AWS Amplify console build settings.

---

## 6. Known Limitations and Implementation Gaps

| Area | Limitation |
|---|---|
| **Rate limiting** | In-memory only. Resets on Lambda cold start; not shared across concurrent Lambda instances. |
| **Cache TTL** | No TTL is enforced on Aurora or DynamoDB cache entries. Items persist indefinitely unless overwritten. |
| **`DELETE_USER_DATA`** | Aurora deletion path is broken (`get_connection()` not implemented). DynamoDB deletion works. |
| **Cross-region inference** | Only Llama 4 Scout uses cross-region routing. Ministral 8B and Nova Pro use direct model IDs. |
| **Hardcoded ARN** | Llama 4 Scout ARN is account-specific. Must be replaced for new deployments. |
| **Lambda URL** | Hardcoded in frontend source. Must be updated manually after deploy. |
| **Voice input** | Relies on `webkitSpeechRecognition` â€” Chrome only. |
