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
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
};

// ─── Startup Validation ──────────────────────────────────────────────────────
// Fail fast if critical configuration is missing.

const isProduction = env.nodeEnv === "production";

// Critical — server cannot function without these
if (!process.env.MONGODB_URI) {
  console.warn("⚠️  MONGODB_URI is not set. Falling back to local MongoDB (mongodb://127.0.0.1:27017).");
}

if (isProduction && env.jwtAccessSecret === "dev_access_secret") {
  throw new Error("❌ JWT_ACCESS_SECRET must be set to a strong random value in production.");
}

if (isProduction && env.jwtRefreshSecret === "dev_refresh_secret") {
  throw new Error("❌ JWT_REFRESH_SECRET must be set to a strong random value in production.");
}

if (isProduction && !process.env.MONGODB_URI) {
  throw new Error("❌ MONGODB_URI must be set in production.");
}

// Optional — warn if AI features won't work
if (!env.geminiApiKey && !env.openaiApiKey) {
  console.warn("⚠️  No AI API key configured (GEMINI_API_KEY or OPENAI_API_KEY). AI features will use fallback mode.");
}

// Optional — warn if Cloudinary is not configured
if (!env.cloudinaryCloudName || !env.cloudinaryApiKey) {
  console.warn("⚠️  Cloudinary not configured. Image uploads will use local storage only.");
}
