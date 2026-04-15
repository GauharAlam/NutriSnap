# Fitness and Nutrition Tracking Web App

Full-stack monorepo for a fitness and nutrition tracking platform built with:

- `client`: React + Vite + Tailwind CSS
- `server`: Node.js + Express.js + MongoDB
- `shared`: reusable constants and future cross-layer schemas

## Current Capabilities

- JWT authentication with refresh-token sessions
- goal management with daily macro targets
- meal logging with local image upload
- AI-assisted meal analysis with manual review before save
- daily intake summaries and weekly progress aggregation
- AI diet assistant with OpenAI-backed and fallback modes

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start MongoDB:

```bash
docker compose up -d
```

4. Run client and server:

```bash
npm run dev:all
```

Frontend: [http://localhost:5173](http://localhost:5173)

Backend health route: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Useful Scripts

- `npm run dev:client`
- `npm run dev:server`
- `npm run dev:all`
- `npm run lint`
- `npm run test`
- `npm run build:client`
- `npm run verify`

## Important Notes

- If `OPENAI_API_KEY` is not configured, AI meal analysis and the assistant fall back to heuristic behavior instead of failing.
- Uploaded files are stored locally under `uploads/` for development.
- Production should replace local uploads with object storage such as S3 or Cloudinary.
- CI is configured to run lint, backend tests, and the frontend production build on every push and pull request.

## Docker Compose

- `docker compose up -d` starts MongoDB only for local development.
- `docker compose --profile fullstack up --build` starts MongoDB, the backend API, and the production frontend together.

## Docs

- [Implementation Plan](/Users/gauharalam/Documents/Projects/Gym_App/docs/implementation-plan.md)
- [Deployment Notes](/Users/gauharalam/Documents/Projects/Gym_App/docs/deployment.md)
- [Testing Notes](/Users/gauharalam/Documents/Projects/Gym_App/docs/testing.md)
