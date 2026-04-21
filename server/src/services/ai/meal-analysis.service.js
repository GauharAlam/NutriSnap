import fs from "fs/promises";
import path from "path";
import { env } from "../../config/env.js";
import { uploadsRoot } from "../../config/paths.js";
import { AppError } from "../../utils/app-error.js";
import {
  estimateNutritionFromItems,
  inferFoodsFromFilename,
} from "../nutrition/meal-estimator.service.js";

function resolveUploadPath(imagePath) {
  if (!imagePath || typeof imagePath !== "string") {
    throw new AppError("imagePath is required for analysis", 400);
  }

  const relativePath = imagePath.replace(/^\/+/, "");
  const absolutePath = path.resolve(uploadsRoot, "..", relativePath);

  if (!absolutePath.startsWith(path.resolve(uploadsRoot))) {
    throw new AppError("Image path is invalid", 400);
  }

  return absolutePath;
}

function guessMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "image/jpeg";
  }
}

function sanitizeAiResult(result = {}, fallbackMealType = "snack") {
  const supportedMealTypes = ["breakfast", "lunch", "dinner", "snack"];
  const safeMealType = supportedMealTypes.includes(result.mealType)
    ? result.mealType
    : fallbackMealType;

  const safeFoodItems = Array.isArray(result.foodItems)
    ? result.foodItems
        .filter((item) => item && typeof item.name === "string")
        .map((item) => ({
          name: item.name.trim(),
          portionMultiplier: Number(item.portionMultiplier) || 1,
        }))
        .filter((item) => item.name)
    : [];

  const safeNutrition = {
    calories: Number(result.nutritionEstimate?.calories) || 0,
    protein: Number(result.nutritionEstimate?.protein) || 0,
    carbs: Number(result.nutritionEstimate?.carbs) || 0,
    fats: Number(result.nutritionEstimate?.fats) || 0,
  };

  return {
    title: typeof result.title === "string" && result.title.trim() ? result.title.trim() : "AI meal suggestion",
    mealType: safeMealType,
    foodItems: safeFoodItems,
    nutritionEstimate: safeNutrition,
    notes:
      typeof result.notes === "string" && result.notes.trim()
        ? result.notes.trim()
        : "Review the AI suggestion before saving this meal.",
    confidence:
      typeof result.confidence === "string" && result.confidence.trim()
        ? result.confidence.trim()
        : "medium",
  };
}

function extractJson(text = "") {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);

  if (fencedMatch) {
    return fencedMatch[1];
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  return objectMatch ? objectMatch[0] : text;
}

async function callOpenAiMealAnalysis({ imagePath, mealTypeHint, originalName }) {
  const absolutePath = resolveUploadPath(imagePath);
  const fileBuffer = await fs.readFile(absolutePath);
  const base64 = fileBuffer.toString("base64");
  const mimeType = guessMimeType(absolutePath);
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const prompt = [
    "Analyze this food image for a fitness and nutrition tracker.",
    "Return JSON only with these keys: title, mealType, foodItems, notes, confidence, nutritionEstimate.",
    'mealType must be one of "breakfast", "lunch", "dinner", "snack".',
    "foodItems must be an array of objects with keys name and portionMultiplier.",
    "portionMultiplier should be a number where 1 is a normal serving, 0.5 is half, 1.5 is larger, etc.",
    "nutritionEstimate must be an object with keys calories, protein, carbs, fats as numbers.",
    "Keep 2 to 5 food items maximum.",
    "Use the image first, and use filename or meal type hint only as a weak secondary signal.",
    `Filename hint: ${originalName || "unknown"}.`,
    `Meal type hint: ${mealTypeHint || "unknown"}.`,
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: env.openaiModel,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(`OpenAI image analysis failed: ${errorText}`, 502);
  }

  const data = await response.json();
  const outputText = data.choices[0]?.message?.content || "";
  const parsed = JSON.parse(extractJson(outputText));

  return sanitizeAiResult(parsed, mealTypeHint || "snack");
}

async function callGeminiMealAnalysis({ imagePath, mealTypeHint, originalName }) {
  const absolutePath = resolveUploadPath(imagePath);
  const fileBuffer = await fs.readFile(absolutePath);
  const base64 = fileBuffer.toString("base64");
  const mimeType = guessMimeType(absolutePath);

  const prompt = [
    "Analyze this food image for a fitness and nutrition tracker.",
    "Return JSON only with these keys: title, mealType, foodItems, notes, confidence, nutritionEstimate.",
    'mealType must be one of "breakfast", "lunch", "dinner", "snack".',
    "foodItems must be an array of objects with keys name and portionMultiplier.",
    "portionMultiplier should be a number where 1 is a normal serving, 0.5 is half, 1.5 is larger, etc.",
    "nutritionEstimate must be an object with keys calories, protein, carbs, fats as numbers.",
    "Keep 2 to 5 food items maximum.",
    "Use the image first, and use filename or meal type hint only as a weak secondary signal.",
    `Filename hint: ${originalName || "unknown"}.`,
    `Meal type hint: ${mealTypeHint || "unknown"}.`,
  ].join(" ");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(`Gemini image analysis failed: ${errorText}`, 502);
  }

  const data = await response.json();
  const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = JSON.parse(extractJson(outputText));

  return sanitizeAiResult(parsed, mealTypeHint || "snack");
}

function buildFallbackAnalysis({ mealTypeHint, originalName }) {
  const inferredFoodItems = inferFoodsFromFilename(originalName);
  const fallbackMealType = mealTypeHint || "snack";
  const localNutrition = estimateNutritionFromItems(inferredFoodItems).totals;

  return {
    title:
      fallbackMealType === "breakfast"
        ? "Balanced breakfast bowl"
        : fallbackMealType === "lunch"
          ? "Balanced lunch plate"
          : fallbackMealType === "dinner"
            ? "Balanced dinner plate"
            : "Mixed snack plate",
    mealType: fallbackMealType,
    foodItems: inferredFoodItems,
    nutritionEstimate: localNutrition,
    notes:
      "AI fallback used because no live model analysis was available. Please review the suggested foods and nutrients before saving.",
    confidence: "low",
  };
}

export async function analyzeMealImageWithAi(payload) {
  let analysis;
  let source = "fallback_estimator";

  try {
    if (env.geminiApiKey) {
      analysis = await callGeminiMealAnalysis(payload);
      source = "gemini_ai";
    } else if (env.openaiApiKey) {
      analysis = await callOpenAiMealAnalysis(payload);
      source = "openai_ai";
    } else {
      analysis = buildFallbackAnalysis(payload);
    }
  } catch (error) {
    console.error("AI Analysis Error:", error);
    analysis = buildFallbackAnalysis(payload);
    analysis.notes = `${analysis.notes} Live analysis error: ${error.message}`;
    source = "fallback_after_error";
  }

  const nutritionEstimate = analysis.nutritionEstimate && analysis.nutritionEstimate.calories > 0 
    ? analysis.nutritionEstimate 
    : estimateNutritionFromItems(analysis.foodItems).totals;

  return {
    analysis,
    nutritionEstimate,
    source,
  };
}
