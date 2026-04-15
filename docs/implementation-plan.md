# Implementation Plan

## Architecture Overview

The app is organized as a monorepo with three main packages:

- `client`: React frontend with Tailwind CSS and route-based UI modules
- `server`: Express REST API with MongoDB, JWT auth, and domain modules
- `shared`: constants and cross-layer definitions reused by client and server

## Core Product Modules

1. Authentication
2. Food image upload
3. AI food recognition
4. Nutrient calculation
5. Daily dashboard
6. Fitness goals
7. Weekly progress tracking
8. AI diet assistant

## API Direction

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/meals/analyze-image`
- `POST /api/v1/meals`
- `GET /api/v1/meals`
- `GET /api/v1/goals`
- `POST /api/v1/goals`
- `GET /api/v1/dashboard/daily`
- `GET /api/v1/dashboard/weekly`
- `POST /api/v1/assistant/chat`

## Development Sequence

1. Monorepo setup and frontend/backend shell
2. JWT authentication with protected user sessions
3. Goal model and goal management flows
4. Meal model and manual meal logging
5. Image upload pipeline with cloud storage
6. AI food detection service integration
7. Nutrient estimation and macro summaries
8. Dashboard charts and trend aggregation
9. AI assistant suggestions using recent intake and goals
10. Testing, deployment, and production hardening

## Product Notes

- Keep a human confirmation step after AI food detection so users can adjust items and portions.
- Prefer refresh tokens in httpOnly cookies and short-lived access tokens for frontend API calls.
- Store derived daily summaries so dashboards stay fast as meal history grows.
