# NutriSnap: Architecture & Workflow Documentation

This document provides a deep dive into the technical architecture and core product workflows of NutriSnap.

## 🏛️ System Architecture

NutriSnap follows a **Modular Monorepo** architecture, separating concerns across three distinct layers while sharing critical domain logic.

### High-Level Component Map
- **Client Layer (React)**: Handles the UI/UX using Tailwind CSS, manages state via Context API/Hooks, and communicates with the backend via a structured API client.
- **Server Layer (Node.js/Express)**: Provides the RESTful API, handles authentication/authorization, and executes business logic across Nutrition, Workout, and Profile modules.
- **Service Layer**: Specialized internal services for AI Vision integration, PR detection, TDEE calculations, and volume analytics.
- **Data Layer (MongoDB)**: Persists user data, meal logs, workout history, and exercise definitions.

---

## 🔄 Core Product Workflows

### 1. AI-Powered Nutrition Workflow
The nutrition flow is designed for speed and accuracy, using a "Human-in-the-loop" pattern.

1.  **Capture**: User uploads a meal image via the mobile-responsive client.
2.  **Analysis**: The server forwards the image to the **AI Vision Service** (OpenAI).
3.  **Estimation**: AI returns a list of detected food items, portions, and estimated macros.
4.  **Review**: The user is presented with a "Review & Edit" screen to confirm or adjust detected values.
5.  **Persistence**: Confirmed data is saved to MongoDB and instantly updates the **Daily Dashboard**.

### 2. Workout & PR Detection Pipeline
NutriSnap proactively monitors performance during workout logging.

1.  **Logging**: User enters sets (reps, weight, RPE). The system automatically flags "Warmup" vs "Working" sets.
2.  **Post-Processing**: Upon saving, the **PR Tracker Service** triggers.
3.  **Historical Comparison**: The service compares the current session against all historical data for that specific exercise.
4.  **PR Detection**:
    *   **Max Weight**: New highest weight for 1+ reps.
    *   **Max Volume**: New highest (Weight × Reps) for a single set.
5.  **Notification**: PRs are flagged in the database and highlighted in the UI with status indicators.

### 3. Intelligent AI Coaching Loop
The coaching assistant provides proactive, context-aware advice.

1.  **Data Aggregation**: The **Daily Coach Service** gathers the user's current goal, remaining macros, recent workouts, and physical metrics.
2.  **Context Construction**: A system prompt is dynamically generated, including:
    *   Current physical stats (Weight, Height, Age).
    *   Daily calorie/macro delta.
    *   Last workout performance.
3.  **AI Generation**: OpenAI generates a personalized, action-oriented response (e.g., "You're 30g short on protein today, try adding a Greek yogurt snack after your pull session").
4.  **Delivery**: Advice is displayed on the main dashboard for immediate action.

---

## 💾 Data Modeling

### Key Entity Relationships

- **User**: Root entity containing profile metrics (age, gender, weight, height).
- **Goal**: Links to User, stores current TDEE and daily macro targets.
- **Meal**: Logs food items, images, and nutrient breakdown.
- **Workout**: Collections of Exercises, which contain multiple Sets.
- **Exercise**: Reference data (instructions, muscle groups) + user-specific PR history.

---

## 🛡️ Security & Scalability

- **Auth Strategy**: Dual-token system. Access tokens (short-lived) in memory/header, Refresh tokens (long-lived) in `httpOnly` secure cookies.
- **Rate Limiting**: Express middleware protects AI endpoints to manage API costs and prevent abuse.
- **Performance**: Derived daily summaries are calculated to ensure the dashboard remains performant even with years of logging history.
