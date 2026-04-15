import { User } from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return next(new AppError("Authorization token is required", 401));
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub).select("_id email name goalType");

    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      goalType: user.goalType,
    };

    next();
  } catch (error) {
    next(new AppError("Invalid or expired access token", 401));
  }
}
