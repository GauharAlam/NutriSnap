import bcrypt from "bcryptjs";
import { RefreshToken } from "../../models/refresh-token.model.js";
import { User } from "../../models/user.model.js";
import { AppError } from "../../utils/app-error.js";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";

function formatAuthResponse(user, accessToken) {
  return {
    accessToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      goalType: user.goalType,
      profile: user.profile || {},
      createdAt: user.createdAt,
    },
  };
}

async function persistRefreshToken(userId, rawToken, expiresAt) {
  await RefreshToken.create({
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt,
  });
}

export async function registerUser(payload) {
  const existingUser = await User.findOne({ email: payload.email.toLowerCase() });

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);

  const userData = {
    name: payload.name.trim(),
    email: payload.email.toLowerCase(),
    passwordHash,
    goalType: payload.goalType || "maintenance",
  };

  // Accept optional profile data during registration
  if (payload.profile) {
    userData.profile = payload.profile;
    // Sync goalType from profile.trainingGoal if provided
    if (payload.profile.trainingGoal) {
      userData.goalType = payload.profile.trainingGoal;
    }
  }

  const user = await User.create(userData);

  const accessToken = signAccessToken(user);
  const refreshTokenPayload = signRefreshToken(user);

  await persistRefreshToken(user._id, refreshTokenPayload.token, refreshTokenPayload.expiresAt);

  return {
    ...formatAuthResponse(user, accessToken),
    refreshToken: refreshTokenPayload.token,
  };
}

export async function loginUser(payload) {
  const user = await User.findOne({ email: payload.email.toLowerCase() });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = signAccessToken(user);
  const refreshTokenPayload = signRefreshToken(user);

  await persistRefreshToken(user._id, refreshTokenPayload.token, refreshTokenPayload.expiresAt);

  return {
    ...formatAuthResponse(user, accessToken),
    refreshToken: refreshTokenPayload.token,
  };
}

export async function refreshSession(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch (error) {
    throw new AppError("Refresh token is invalid or expired", 401);
  }

  const storedToken = await RefreshToken.findOne({
    tokenHash: hashToken(rawRefreshToken),
    userId: decoded.sub,
  });

  if (!storedToken) {
    throw new AppError("Refresh token is invalid or expired", 401);
  }

  const user = await User.findById(decoded.sub);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await RefreshToken.deleteOne({ _id: storedToken._id });

  const accessToken = signAccessToken(user);
  const refreshTokenPayload = signRefreshToken(user);

  await persistRefreshToken(user._id, refreshTokenPayload.token, refreshTokenPayload.expiresAt);

  return {
    ...formatAuthResponse(user, accessToken),
    refreshToken: refreshTokenPayload.token,
  };
}

export async function logoutSession(rawRefreshToken) {
  if (!rawRefreshToken) {
    return;
  }

  await RefreshToken.deleteOne({
    tokenHash: hashToken(rawRefreshToken),
  });
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId).select("-passwordHash");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    goalType: user.goalType,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
