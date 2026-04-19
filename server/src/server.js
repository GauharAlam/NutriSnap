import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { app } from "./app.js";

async function bootstrap() {
  try {
    await connectDatabase();

    const server = app.listen(env.port, () => {
      console.log(`🚀 API listening on port ${env.port} [${env.nodeEnv}]`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n⏳ Received ${signal}. Shutting down gracefully...`);

      server.close(async () => {
        console.log("🛑 HTTP server closed");
        await disconnectDatabase();
        process.exit(0);
      });

      // Force exit if graceful shutdown takes too long
      setTimeout(() => {
        console.error("❌ Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Handle unhandled rejections
    process.on("unhandledRejection", (err) => {
      console.error("❌ Unhandled rejection:", err);
      shutdown("unhandledRejection");
    });

  } catch (error) {
    console.error("Failed to bootstrap server", error);
    process.exit(1);
  }
}

bootstrap();
