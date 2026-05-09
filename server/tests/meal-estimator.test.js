import test from "node:test";
import assert from "node:assert/strict";
import {
  estimateNutritionFromItems,
  inferFoodsFromFilename,
} from "../src/services/nutrition/meal-estimator.service.js";

test("estimateNutritionFromItems aggregates known foods", () => {
  const result = estimateNutritionFromItems([
    { name: "grilled chicken", portionMultiplier: 1 },
    { name: "rice", portionMultiplier: 1.5 },
  ]);

  assert.equal(result.items.length, 2);
  assert.equal(result.totals.calories, 527.5);
  assert.equal(result.totals.protein, 41);
  assert.equal(result.totals.carbs, 67.5);
  // New fields from expanded catalog
  assert.ok(typeof result.totals.fiber === "number");
  assert.ok(typeof result.totals.sodium === "number");
});

test("inferFoodsFromFilename returns matching foods when hints exist", () => {
  const result = inferFoodsFromFilename("chicken-rice-bowl.jpg");

  assert.ok(result.some((item) => item.name === "grilled chicken"));
  assert.ok(result.some((item) => item.name === "rice"));
});

test("expanded catalog includes Indian foods", () => {
  const result = estimateNutritionFromItems([
    { name: "cottage cheese paneer", portionMultiplier: 1 },
    { name: "roti", portionMultiplier: 1 },
    { name: "dal", portionMultiplier: 1 },
  ]);

  assert.equal(result.items.length, 3);
  assert.equal(result.items[0].matchedFood, "paneer");
  assert.equal(result.items[1].matchedFood, "roti");
  assert.equal(result.items[2].matchedFood, "dal");
  assert.ok(result.totals.calories > 600);
  assert.ok(result.totals.protein > 30);
});

test("expanded catalog includes fast food and snacks", () => {
  const result = estimateNutritionFromItems([
    { name: "samosa", portionMultiplier: 1 },
    { name: "biryani", portionMultiplier: 1 },
  ]);

  assert.equal(result.items[0].matchedFood, "samosa");
  assert.equal(result.items[1].matchedFood, "biryani");
  assert.ok(result.totals.calories > 700);
});

test("unknown foods get fallback estimation", () => {
  const result = estimateNutritionFromItems([
    { name: "something unknown xyz", portionMultiplier: 1 },
  ]);

  assert.equal(result.items[0].matchedFood, "mixed meal");
  assert.ok(result.totals.calories > 0);
});