import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateBMR,
  calculateTDEE,
  calculateMacroTargets,
  computeTargetsFromProfile,
} from "../src/services/nutrition/tdee-calculator.js";

test("calculateBMR returns correct value for male", () => {
  // Mifflin-St Jeor: 10*80 + 6.25*175 - 5*25 + 5 = 800 + 1093.75 - 125 + 5 = 1773.75
  const bmr = calculateBMR({ age: 25, gender: "male", weightKg: 80, heightCm: 175 });
  assert.equal(bmr, 1773.75);
});

test("calculateBMR returns correct value for female", () => {
  // Mifflin-St Jeor: 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
  const bmr = calculateBMR({ age: 30, gender: "female", weightKg: 60, heightCm: 165 });
  assert.equal(bmr, 1320.25);
});

test("calculateBMR returns 0 with missing data", () => {
  assert.equal(calculateBMR({ age: null, gender: "male", weightKg: 80, heightCm: 175 }), 0);
});

test("calculateTDEE applies correct activity multiplier", () => {
  const bmr = 1800;
  assert.equal(calculateTDEE(bmr, "sedentary"), Math.round(1800 * 1.2));
  assert.equal(calculateTDEE(bmr, "active"), Math.round(1800 * 1.725));
});

test("calculateMacroTargets generates sensible macros for weight loss", () => {
  const targets = calculateMacroTargets({ tdee: 2500, trainingGoal: "weight_loss", weightKg: 80 });
  assert.equal(targets.calories, 2000); // TDEE - 500
  assert.equal(targets.protein, 160);   // 2.0g/kg * 80kg
  assert.ok(targets.carbs > 0);
  assert.ok(targets.fats > 0);
  assert.ok(targets.sugar > 0);
});

test("calculateMacroTargets generates sensible macros for muscle gain", () => {
  const targets = calculateMacroTargets({ tdee: 2500, trainingGoal: "muscle_gain", weightKg: 80 });
  assert.equal(targets.calories, 2800); // TDEE + 300
  assert.equal(targets.protein, 144);   // 1.8g/kg * 80kg
});

test("computeTargetsFromProfile returns complete result", () => {
  const result = computeTargetsFromProfile({
    age: 25, gender: "male", weightKg: 80, heightCm: 175,
    activityLevel: "moderate", trainingGoal: "muscle_gain",
  });
  assert.ok(result.bmr > 0);
  assert.ok(result.tdee > 0);
  assert.ok(result.tdee > result.bmr);
  assert.ok(result.targets.calories > 0);
  assert.ok(result.targets.protein > 0);
});
