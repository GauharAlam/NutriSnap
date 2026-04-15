import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { uploadsRoot } from "./config/paths.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import assistantRoutes from "./modules/assistant/assistant.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import goalsRoutes from "./modules/goals/goals.routes.js";
import mealsRoutes from "./modules/meals/meals.routes.js";
import progressRoutes from "./modules/progress/progress.routes.js";

export const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadsRoot));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/meals", mealsRoutes);
app.use("/api/v1/goals", goalsRoutes);
app.use("/api/v1/dashboard", progressRoutes);
app.use("/api/v1/assistant", assistantRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
