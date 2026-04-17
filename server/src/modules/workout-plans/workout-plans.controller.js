import { WorkoutPlan } from "../../models/workout-plan.model.js";

/**
 * Get all workout plans
 * GET /api/v1/workout-plans
 */
export async function getAllWorkoutPlans(req, res, next) {
  try {
    const filters = {};
    if (req.query.category && req.query.category !== "All") {
      filters.category = req.query.category;
    }
    if (req.query.search) {
      filters.title = { $regex: req.query.search, $options: "i" };
    }

    const plans = await WorkoutPlan.find(filters).select("-exercises").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific workout plan by slug/id
 * GET /api/v1/workout-plans/:slug
 */
export async function getWorkoutPlanBySlug(req, res, next) {
  try {
    const plan = await WorkoutPlan.findOne({ slug: req.params.slug });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
}
