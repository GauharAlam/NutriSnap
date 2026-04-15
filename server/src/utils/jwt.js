import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_DAYS = 7;

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
    },
    env.jwtAccessSecret,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

export function signRefreshToken(user) {
  const token = jwt.sign(
    {
      sub: user._id.toString(),
    },
    env.jwtRefreshSecret,
    { expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d` }
  );

  return {
    token,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth",
  };
}

export function getRefreshClearCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    path: "/api/v1/auth",
  };
}
