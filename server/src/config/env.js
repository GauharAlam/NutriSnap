import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  serverUrl: process.env.SERVER_URL || `http://localhost:${Number(process.env.PORT || 5000)}`,
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fitness_nutrition_app",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
};
