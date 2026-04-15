import { asyncHandler } from "../../utils/async-handler.js";
import {
  getRefreshClearCookieOptions,
  getRefreshCookieOptions,
} from "../../utils/jwt.js";
import {
  getCurrentUser,
  loginUser,
  logoutSession,
  registerUser,
  refreshSession,
} from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const payload = await registerUser(req.body);
  const { refreshToken, ...responseData } = payload;

  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

  res.status(201).json({
    success: true,
    message: "User registered",
    data: responseData,
  });
});

export const login = asyncHandler(async (req, res) => {
  const payload = await loginUser(req.body);
  const { refreshToken, ...responseData } = payload;

  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: responseData,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const payload = await refreshSession(req.cookies.refreshToken || req.body.refreshToken);
  const { refreshToken, ...responseData } = payload;

  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

  res.status(200).json({
    success: true,
    message: "Session refreshed",
    data: responseData,
  });
});

export const logout = asyncHandler(async (req, res) => {
  await logoutSession(req.cookies.refreshToken || req.body.refreshToken);
  res.clearCookie("refreshToken", getRefreshClearCookieOptions());

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});
