import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const serverRoot = path.resolve(__dirname, "..");
export const uploadsRoot = path.join(serverRoot, "..", "uploads");

fs.mkdirSync(uploadsRoot, { recursive: true });
