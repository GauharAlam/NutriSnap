# NutriSnap: AI-Powered Fitness & Nutrition Ecosystem

NutriSnap is a comprehensive full-stack platform designed to bridge the gap between nutrition tracking, workout analytics, and AI-driven personalized coaching. Built with a modern tech stack, it provides a seamless experience for managing your health journey.

- **`client`**: React + Vite + Tailwind CSS (with specialized UI components)
- **`server`**: Node.js + Express.js + MongoDB (Mongoose)
- **`shared`**: Reusable constants and cross-layer schemas

## 🚀 Key Capabilities

### 🥗 AI-Powered Nutrition
- **Vision-Based Logging**: Analyze meals instantly from photos using OpenAI's vision models for calorie and macro estimation.
- **Dynamic Macro Targeting**: Automated TDEE calculation using the Mifflin-St Jeor equation, adapting to your weight, activity level, and goals.
- **Smart Meal Templates**: Curated library of healthy meals (Vegetarian, Vegan, Non-Veg) categorized by budget, timing, and diet type.
- **Granular Tracking**: Real-time monitoring of protein, carbs, fats, and even sugar intake against daily limits.

### 🏋️ Comprehensive Workout Ecosystem
- **Intelligent Logging**: Record sets, reps, weight, and RPE with automated detection of warmup vs. working sets.
- **Pre-built Training Plans**: Access curated workout routines (Full Body, Push/Pull/Legs) with detailed instructions.
- **Performance Analytics**: Interactive visualizations of training volume trends to ensure consistent progressive overload.
- **Automated PR Tracking**: Instant detection and flagging of Personal Records for max weight and total volume (Weight × Reps).
- **Exercise Library**: A pre-seeded database of standard movements with instructions and targeted muscle groups.

### 🤖 Proactive AI Coaching
- **Context-Aware Advice**: Personalized coaching based on your goals, recent nutrition intake, and workout performance.
- **Upgraded System Prompts**: Action-oriented, science-backed personas designed to keep you motivated and on track.
- **Robust Fallbacks**: Intelligent heuristic-based advice system that works even when AI APIs are unreachable.

### 💧 Health & Wellness Utilities
- **Visual Hydration Tracker**: Interactive daily water intake monitor with progress visualizations.
- **Profile Management**: Granular control over your physical metrics and training objectives (Weight Loss, Lean Bulk, etc.).
- **Enhanced Security**: Secure JWT-based auth with refresh-token rotation and graceful session expiration handling.

## 🛠️ Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Copy environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Start MongoDB**:
   ```bash
   docker compose up -d
   ```

4. **Seed the database (Optional but Recommended)**:
   ```bash
   node server/src/scripts/seed-exercises.js
   node server/src/scripts/seed-foods.js
   node server/src/scripts/seed-plans.js
   ```

5. **Run client and server**:
   ```bash
   npm run dev:all
   ```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend health route: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## 📊 Useful Scripts

- `npm run dev:all`: Start both frontend and backend concurrently.
- `npm run verify`: Run linting, backend tests, and build validation.
- `npm run test`: Execute the backend test suite (includes tests for Auth, Meals, Workouts, and Analytics).
- `npm run build:client`: Create a production-ready frontend bundle.

## 📝 Important Notes

- **AI Fallbacks**: If `OPENAI_API_KEY` is not configured, the AI assistant and meal analysis fall back to smart heuristic behavior.
- **Storage**: Uploaded files are stored locally under `server/uploads/` during development.
- **CI/CD**: Configured via GitHub Actions to run linting and tests on every push.

## 📂 Documentation

- [Implementation Plan](docs/implementation-plan.md)
- [Architecture & Workflow](docs/architecture.md)
- [Deployment Notes](docs/deployment.md)
- [Testing Notes](docs/testing.md)

