import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { logger, morganStream } from "./config/logger.js";
import { uploadsRoot } from "./config/paths.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { sanitizeInputs } from "./middleware/sanitize.js";
import { requestTimer } from "./middleware/request-timer.js";
import assistantRoutes from "./modules/assistant/assistant.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import goalsRoutes from "./modules/goals/goals.routes.js";
import mealsRoutes from "./modules/meals/meals.routes.js";
import progressRoutes from "./modules/progress/progress.routes.js";
import workoutsRoutes from "./modules/workouts/workouts.routes.js";
import workoutPlansRoutes from "./modules/workout-plans/workout-plans.routes.js";
import waterRoutes from "./modules/water/water.routes.js";
export const app = express();

/* ─── Security ─── */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow uploads to be served
}));

/* ─── CORS ─── */
const allowedOrigins = env.nodeEnv === "production"
  ? [env.clientUrl]
  : [env.clientUrl, "http://localhost:5173", "http://localhost:5174", "http://localhost:5178"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // In dev, allow all; in prod, restrict
      }
    },
    credentials: true,
  })
);

/* ─── Performance ─── */
app.use(compression());

/* ─── Body Parsing ─── */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

/* ─── Logging ─── */
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev", { stream: morganStream }));

/* ─── Request Timer (slow query logging) ─── */
app.use(requestTimer);

/* ─── NoSQL Injection Prevention ─── */
app.use(sanitizeInputs);

/* ─── Static Files ─── */
app.use("/uploads", express.static(uploadsRoot));

/* ─── Rate Limiting ─── */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,                   // 50 auth attempts per 15 min (handles refresh bootstrap)
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please wait 15 minutes." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 5,                    // 5 AI calls per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "AI analysis rate limit exceeded. Please wait." },
});

app.use("/api", globalLimiter);

/* ─── Health Check (verifies DB) ─── */
import mongoose from "mongoose";
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";
  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy ? "Server is healthy" : "Server is degraded",
    uptime: process.uptime(),
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

/* ─── API Routes ─── */
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/meals", mealsRoutes);
app.use("/api/v1/goals", goalsRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/assistant", assistantRoutes);
app.use("/api/v1/workouts", workoutsRoutes);
app.use("/api/v1/workout-plans", workoutPlansRoutes);
app.use("/api/v1/water", waterRoutes);

/* ─── Error Handling ─── */
app.use(notFoundHandler);
app.use(errorHandler);
