# Tiger Track

AI-powered job leveling tool by Tiger Data. Analyzes job descriptions against the Tiger Data Level Guide to recommend the appropriate level (P1-P6, M1-M6, VP, SVP).

## Features

- **Level a Role** — Paste a job description and get an AI-powered level recommendation with dimension-by-dimension breakdown
- **Level Requirements Lookup** — Browse and download requirements for any level
- **AI Assistant** — Chat interface for leveling questions and career progression guidance

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

## API Endpoints

- `POST /api/level` — Analyze a job description and return level recommendation
- `POST /api/chat` — AI assistant for leveling questions

## Tech Stack

Next.js 16 | React 19 | TypeScript | Tailwind CSS 4 | Claude API
