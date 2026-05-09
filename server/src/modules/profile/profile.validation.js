import { z } from "zod";
import { validate } from "../../utils/validate.js";

const profileSchema = z.object({
  age: z.number().int().min(13).max(120).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  heightCm: z.number().min(50).max(300).optional(),
  weightKg: z.number().min(20).max(500).optional(),
  activityLevel: z
    .enum(["sedentary", "light", "moderate", "active", "very_active"])
    .optional(),
  trainingGoal: z
    .enum(["weight_loss", "muscle_gain", "maintenance", "recomp"])
    .optional(),
  dietPreference: z
    .enum(["any", "vegetarian", "vegan", "eggetarian", "keto", "paleo"])
    .optional(),
  allergies: z.array(z.string().trim().max(50)).max(20).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  equipmentAccess: z.enum(["home", "gym", "both"]).optional(),
  injuries: z.array(z.string().trim().max(100)).max(10).optional(),
});

export const validateProfilePayload = validate(profileSchema);
