import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  // Connection event handlers for resilience
  mongoose.connection.on("connected", () => {
    console.log("✅ MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected. Attempting reconnect...");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("🔄 MongoDB reconnected");
  });

  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 10000,    // Fail fast on initial connect
    heartbeatFrequencyMS: 10000,        // Check connection every 10s
    retryWrites: true,
  });
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  console.log("MongoDB disconnected gracefully");
}
