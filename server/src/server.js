import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}

import { app } from "./app.js";
import { setupCronJobs } from "./jobs/daily-coach.job.js";

async function bootstrap() {
  try {
    await connectDatabase();

    const server = app.listen(env.port, () => {
      logger.info(`🚀 API listening on port ${env.port} [${env.nodeEnv}]`);
    });

    // Start background jobs
    setupCronJobs();

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      logger.info(`⏳ Received ${signal}. Shutting down gracefully...`);

      server.close(async () => {
        logger.info("🛑 HTTP server closed");
        await disconnectDatabase();
        process.exit(0);
      });

      // Force exit if graceful shutdown takes too long
      setTimeout(() => {
        logger.error("❌ Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Handle unhandled rejections
    process.on("unhandledRejection", (err) => {
      logger.error("❌ Unhandled rejection", { error: err.message, stack: err.stack });
      shutdown("unhandledRejection");
    });

  } catch (error) {
    logger.error("Failed to bootstrap server", { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

bootstrap();

