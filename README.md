
# ForgeOS AI

**Elite AI Life Operating System** — your intelligent personal OS for fitness, AWS certification, driving mastery, and adaptive shift scheduling.

## Live Application

**[https://forgeos-ai.wmintelliops.com](https://forgeos-ai.wmintelliops.com)**

## Features

- **ForgeOS Fitness** — 6 workout modules with animated SVG exercise demos, muscle targeting, and fitness radar tracking
- **ForgeOS Drive** — Driving skill tracker (Traffic, Highway, Parking, Clutch, City) with expandable coaching tips
- **ForgeOS DevOps** — AWS DevOps Pro certification progress tracker with weekly study analytics
- **ForgeOS Focus (Shift Engine)** — Adaptive daily schedule for General Shift (10 AM–7 PM) and Evening Shift (3 PM–1 AM), including commute timings
- **AI Coach** — Claude-powered chat assistant for AWS, fitness, driving, and productivity
- **Dashboard** — Unified stats: calories, study hours, AWS progress, streak counter, charts
- **Dark / Light Mode** — Toggle between dark glassmorphism and clean light theme (persisted in localStorage)
- **Mobile-First** — Responsive layout with bottom tab navigation on mobile, full sidebar on desktop

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS 3, Framer Motion, Recharts |
| AI Backend | AWS Lambda (Python 3.12), AWS Bedrock (Claude Haiku 4.5) |
| Infrastructure | AWS SAM, CloudFormation, S3, CloudFront, API Gateway, Route53, ACM |
| Region | ap-south-1 (Mumbai) |

## Deploy Backend

```bash
cd forgeos-ai-infra
sam build
sam deploy --guided
```

## Deploy Frontend

```bash
cd forgeos-ai-frontend
npm install
npm run build
# Static export goes to /out — sync to S3 + invalidate CloudFront
```

## Local Development

```bash
cd forgeos-ai-frontend
npm install
# Set NEXT_PUBLIC_API_URL in .env.local
npm run dev
# Open http://localhost:3000
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API Gateway invoke URL (e.g. `https://xxx.execute-api.ap-south-1.amazonaws.com/Prod`) |
