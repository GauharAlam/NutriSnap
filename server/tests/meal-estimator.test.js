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
});

test("inferFoodsFromFilename returns matching foods when hints exist", () => {
  const result = inferFoodsFromFilename("chicken-rice-bowl.jpg");

  assert.ok(result.some((item) => item.name === "grilled chicken"));
  assert.ok(result.some((item) => item.name === "rice"));
});
