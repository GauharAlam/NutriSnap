import winston from "winston";
import { env } from "./env.js";

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

/* ─── Pretty console format for development ─── */
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} [${level}] ${stack || message}${metaStr}`;
});

/* ─── Transports ─── */
const transports = [
  new winston.transports.Console({
    format:
      env.nodeEnv === "production"
        ? combine(timestamp(), errors({ stack: true }), json())
        : combine(colorize(), timestamp({ format: "HH:mm:ss" }), errors({ stack: true }), devFormat),
  }),
];

// File transport in production
if (env.nodeEnv === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    })
  );
}

export const logger = winston.createLogger({
  level: env.nodeEnv === "production" ? "info" : "debug",
  defaultMeta: { service: "nutrisnap-api" },
  transports,
  // Don't exit on uncaught exceptions — let the process handler decide
  exitOnError: false,
});

// Stream for Morgan integration
export const morganStream = {
  write: (message) => logger.http(message.trim()),
};
