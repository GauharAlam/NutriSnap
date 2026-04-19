import { logger } from "../config/logger.js";

/**
 * Logs response time for every request.
 * Warns when requests exceed the slow threshold.
 */
export function requestTimer(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${durationMs.toFixed(1)}ms`,
    };

    if (durationMs > 1000) {
      logger.warn("Slow request detected", meta);
    } else if (durationMs > 500) {
      logger.info("Moderate request time", meta);
    }
  });

  next();
}
