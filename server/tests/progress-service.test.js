import test from "node:test";
import assert from "node:assert/strict";
import { progressHelpers } from "../src/modules/progress/progress.service.js";

test("sumMeals totals macro values and meal count", () => {
  const summary = progressHelpers.sumMeals([
    {
      nutrition: { calories: 400, protein: 30, carbs: 35, fats: 12, sugar: 6 },
    },
    {
      nutrition: { calories: 300, protein: 20, carbs: 20, fats: 10, sugar: 4 },
    },
  ]);

  assert.deepEqual(summary, {
    calories: 700,
    protein: 50,
    carbs: 55,
    fats: 22,
    sugar: 10,
    mealCount: 2,
  });
});

test("buildComparison computes remaining targets and progress", () => {
  const comparison = progressHelpers.buildComparison(
    { calories: 1200, protein: 70, carbs: 100, fats: 30, sugar: 12, mealCount: 2 },
    { calories: 2000, protein: 140, carbs: 220, fats: 60, sugar: 35 }
  );

  assert.equal(comparison.caloriesRemaining, 800);
  assert.equal(comparison.proteinRemaining, 70);
  assert.equal(comparison.caloriesProgress, 60);
  assert.equal(comparison.proteinProgress, 50);
});
