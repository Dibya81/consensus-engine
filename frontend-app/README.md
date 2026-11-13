# Consensus Bedrock Engine — Frontend

React 19 + Vite 7 single-page application for the Consensus Bedrock Engine.

## Prerequisites

- Node.js 18 or later
- npm (or pnpm / yarn)
- A deployed Consensus Bedrock Engine Lambda Function URL (see root `README.md`)

## Setup

```powershell
# Install dependencies
npm install

# Configure the Lambda URL
# Open src/pages/EnginePage.jsx and update line 17:
# const LAMBDA_URL = "https://<your-lambda-url>.lambda-url.us-east-1.on.aws/";

# Start the development server
npm run dev
# → http://localhost:5173
```

## Available Scripts

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Start Vite dev server with HMR at `localhost:5173` |
| Build | `npm run build` | Production build — output to `build/` |
| Preview | `npm run preview` | Preview the production build locally |
| Lint | `npm run lint` | Run ESLint |

> **Note**: The build output directory is `build/` (not the Vite default `dist/`). Set the **build output directory** to `build` in the AWS Amplify console build settings.

## Routes

| Path | Page | Description |
|---|---|---|
| `/` | `LandingPage` | Username entry — no sign-up required |
| `/chat` | `EnginePage` | Main application shell |
| `/architecture` | `ArchitecturePage` | Architecture overview |
| `/metrics` | `MetricsPage` | Scoring metrics overview |

## Application Tabs (EnginePage)

| Tab | Description |
|---|---|
| **Chat** | Submit queries; view dual-worker responses with consensus scores and Judge analysis |
| **Deep Dive** | On-demand Nova Pro technical comparison of both worker responses |
| **Notes** | Write and save study notes; generate AI analysis or revision flashcards |
| **Code Hub** | Write code with syntax highlighting; get AI review or simulate execution |
| **Career** | Generate structured learning roadmaps with resources |
| **Progress** | View learning activity with AI coaching feedback |
| **Community** | Community view |
| **History** | Browse and restore previous chat sessions |

## Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | 19.2.0 | UI framework |
| `react-dom` | 19.2.0 | DOM rendering |
| `react-router-dom` | 7.13.1 | Client-side routing |
| `framer-motion` | 12.35.0 | Animations and transitions |
| `lucide-react` | 0.577.0 | Icon library |
| `recharts` | 3.8.0 | Charts in Progress tab |
| `react-markdown` | 10.1.0 | Renders Judge / Deep Dive Markdown output |
| `prismjs` | 1.30.0 | Syntax highlighting in Code Hub |
| `react-simple-code-editor` | 0.14.1 | Code editor in Code Hub |

## Deployment (AWS Amplify)

The frontend is deployed via AWS Amplify with automatic CI/CD on push to `main`.

Amplify build settings:
```yaml
frontend:
  buildSpec: |
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - npm install
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: build
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
```

## Notes

- **Voice input** is available via the microphone button in the chat input. Requires Google Chrome (Web Speech API).
- **File attachments** (images and documents) can be added to queries using the attachment button.
- **User sessions** are persisted per username using the backend Lambda API — no local storage is used for session history beyond the username itself.
