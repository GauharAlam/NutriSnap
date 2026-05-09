import fs from "fs";
import path from "path";
import multer from "multer";
import { AppError } from "../utils/app-error.js";
import { uploadsRoot } from "../config/paths.js";

const mealsUploadDir = path.join(uploadsRoot, "meals");
fs.mkdirSync(mealsUploadDir, { recursive: true });

const progressUploadDir = path.join(uploadsRoot, "progress");
fs.mkdirSync(progressUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mealsUploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, safeName);
  },
});

const progressStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, progressUploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeName = `${Date.now()}-progress-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, safeName);
  },
});

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError("Only image uploads are supported", 400));
  }

  const ext = path.extname(file.originalname || "").toLowerCase();
  if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new AppError(`File extension '${ext}' is not allowed. Accepted: ${[...ALLOWED_EXTENSIONS].join(", ")}`, 400));
  }

  cb(null, true);
}

export const mealImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const progressPhotoUpload = multer({
  storage: progressStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for progress photos
  },
});
