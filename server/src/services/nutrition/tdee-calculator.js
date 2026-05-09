/**
 * TDEE Calculator Service
 *
 * Implements the Mifflin-St Jeor equation for BMR (most accurate for general
 * population) and multiplies by an activity factor to get Total Daily Energy
 * Expenditure.  Macro targets are derived from TDEE based on the user's
 * training goal.
 */

// ─── Activity Multipliers (Harris-Benedict revised) ─────────────────────────
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,       // desk job, little exercise
  light: 1.375,         // 1-3 days/week light exercise
  moderate: 1.55,       // 3-5 days/week moderate exercise
  active: 1.725,        // 6-7 days/week hard exercise
  very_active: 1.9,     // twice a day, athletes
};

// ─── Protein targets per kg of body weight ──────────────────────────────────
const PROTEIN_PER_KG = {
  weight_loss: 2.0,
  muscle_gain: 1.8,
  maintenance: 1.6,
  recomp: 2.2,
};

// ─── Calorie adjustments from maintenance ───────────────────────────────────
const CALORIE_OFFSET = {
  weight_loss: -500,    // ~0.5 kg/week loss
  muscle_gain: 300,     // lean bulk
  maintenance: 0,
  recomp: 0,            // eat at maintenance, recompose via training
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor.
 *
 * @param {{ age: number, gender: string, weightKg: number, heightCm: number }} params
 * @returns {number} BMR in kcal/day
 */
export function calculateBMR({ age, gender, weightKg, heightCm }) {
  if (!age || !weightKg || !heightCm) return 0;

  // Mifflin-St Jeor
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "female" ? base - 161 : base + 5;
}

/**
 * Calculate Total Daily Energy Expenditure.
 *
 * @param {number} bmr - Basal metabolic rate
 * @param {string} activityLevel - one of sedentary|light|moderate|active|very_active
 * @returns {number} TDEE in kcal/day (rounded)
 */
export function calculateTDEE(bmr, activityLevel = "moderate") {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
  return Math.round(bmr * multiplier);
}

/**
 * Derive daily macro targets from TDEE and training goal.
 *
 * Returns { calories, protein, carbs, fats, sugar }.
 * Protein is set per-kg, fat at 25-30% of calories, carbs fill the rest.
 *
 * @param {{ tdee: number, trainingGoal: string, weightKg: number }} params
 * @returns {{ calories: number, protein: number, carbs: number, fats: number, sugar: number }}
 */
export function calculateMacroTargets({ tdee, trainingGoal = "maintenance", weightKg = 70 }) {
  const offset = CALORIE_OFFSET[trainingGoal] ?? 0;
  const calories = Math.round(tdee + offset);

  // Protein: g/kg body weight
  const proteinPerKg = PROTEIN_PER_KG[trainingGoal] ?? 1.6;
  const protein = Math.round(proteinPerKg * weightKg);

  // Fat: 25% of total calories (9 kcal/g)
  const fatCalories = calories * 0.25;
  const fats = Math.round(fatCalories / 9);

  // Carbs: remaining calories (4 kcal/g)
  const proteinCalories = protein * 4;
  const carbCalories = Math.max(0, calories - proteinCalories - fatCalories);
  const carbs = Math.round(carbCalories / 4);

  // Sugar: ~10% of carbs as a soft cap
  const sugar = Math.round(carbs * 0.1);

  return { calories, protein, carbs, fats, sugar };
}

/**
 * All-in-one: from user profile to daily targets.
 *
 * @param {{ age: number, gender: string, weightKg: number, heightCm: number, activityLevel: string, trainingGoal: string }} profile
 * @returns {{ bmr: number, tdee: number, targets: { calories: number, protein: number, carbs: number, fats: number, sugar: number } }}
 */
export function computeTargetsFromProfile(profile) {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const targets = calculateMacroTargets({
    tdee,
    trainingGoal: profile.trainingGoal || "maintenance",
    weightKg: profile.weightKg || 70,
  });

  return { bmr, tdee, targets };
}
