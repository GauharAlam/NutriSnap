import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { CircleProgress } from "../components/ui/CircleProgress";
import { ErrorState, InlineNotice } from "../components/ui/StatusState";
import { WaterTracker } from "../components/ui/WaterTracker";
import { useDailyWater } from "../features/water/useDailyWater";
import { apiClient } from "../lib/api/client";

/* ─── Progress Bar ─── */
function MacroBar({ value, max, color, label, unit = "g" }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-dark-100">{label}</span>
        <span className="text-xs text-dark-300">{value}{unit} / {max}{unit}</span>
      </div>
      <div className="progress-bar">
        <div className={`progress-fill bg-gradient-to-r ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function NutritionPage() {
  const { waterCount, setWaterCount, totalGlasses } = useDailyWater();
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [meals, setMeals] = useState([]);
  const fileInputRef = useRef(null);

  // AI Flow State
  const [goalTargets, setGoalTargets] = useState({ calories: 2400, protein: 170, carbs: 250, fats: 75 });

  // AI Flow State
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [uploadedImagePath, setUploadedImagePath] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const results = await Promise.allSettled([
      apiClient.get("/meals"),
      apiClient.get("/goals"),
      apiClient.get("/workouts"),
    ]);
    const [mealsRes, goalsRes, workoutRes] = results;

    if (mealsRes.status === "fulfilled" && mealsRes.value.data?.success) {
      setMeals(mealsRes.value.data.data.meals || []);
    }
    if (goalsRes.status === "fulfilled" && goalsRes.value.data?.success && goalsRes.value.data.data?.dailyTargets) {
      const t = goalsRes.value.data.data.dailyTargets;
        setGoalTargets({
          calories: t.calories || 2400,
          protein: t.protein || 170,
          carbs: t.carbs || 250,
          fats: t.fats || 75,
        });
    }
    if (workoutRes.status === "fulfilled" && workoutRes.value.data?.success) {
      setCaloriesBurned(workoutRes.value.data.data.stats?.totalCalories || 0);
    }

    if (results.some((result) => result.status === "rejected")) {
      setLoadError("Some nutrition data could not be loaded.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function fetchMeals() {
    try {
      const { data } = await apiClient.get("/meals");
      if (data && data.success) {
        setMeals(data.data.meals || []);
      }
    } catch {
      setActionError("Meal list could not be refreshed.");
    }
  }

  // Derived aggregates
  const totalTarget = goalTargets;
  const totalConsumed = useMemo(() => ({
    calories: meals?.reduce((a, m) => a + (m.nutrition?.calories || 0), 0) || 0,
    protein: meals?.reduce((a, m) => a + (m.nutrition?.protein || 0), 0) || 0,
    carbs: meals?.reduce((a, m) => a + (m.nutrition?.carbs || 0), 0) || 0,
    fats: meals?.reduce((a, m) => a + (m.nutrition?.fats || 0), 0) || 0,
  }), [meals]);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setActionError("");
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      // Upload image
      const { data: uploadRes } = await apiClient.post("/meals/upload-image", formData);
      const { imagePath, imageUrl, originalName } = uploadRes.data;
      setUploadedImagePath(imagePath);
      setUploadedImageUrl(imageUrl);

      setIsUploading(false);
      setIsAnalyzing(true);
      setShowAiModal(true);

      // Analyze image
      const { data: analyzeRes } = await apiClient.post("/meals/analyze-image", {
        imagePath,
        imageUrl,
        originalName,
      });
      setAiAnalysis(analyzeRes.data);
    } catch {
      setActionError("Meal analysis failed. Try a clearer photo or log again.");
      setShowAiModal(false);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function confirmMeal() {
    if (!aiAnalysis) return;

    try {
      if (!aiAnalysis.analysis || !aiAnalysis.nutritionEstimate) {
        throw new Error("Invalid meal analysis");
      }
      const payload = {
        title: aiAnalysis.analysis.title,
        mealType: aiAnalysis.analysis.mealType,
        foodItems: aiAnalysis.analysis.foodItems.map(f => f.name),
        notes: aiAnalysis.analysis.notes,
        eatenAt: new Date().toISOString(),
        imagePath: uploadedImagePath,
        imageUrl: uploadedImageUrl,
        nutrition: {
          calories: aiAnalysis.nutritionEstimate.calories,
          protein: aiAnalysis.nutritionEstimate.protein,
          carbs: aiAnalysis.nutritionEstimate.carbs,
          fats: aiAnalysis.nutritionEstimate.fats,
          sugar: Math.round(aiAnalysis.nutritionEstimate.carbs * 0.2), // Rough estimate for now
        },
        source: "ai_estimated",
      };

      await apiClient.post("/meals", payload);
      setShowAiModal(false);
      setAiAnalysis(null);
      fetchMeals();
    } catch {
      setActionError("Meal could not be saved. Please try again.");
    }
  }

  return (
    <div className="pt-6 pb-4 space-y-6 relative">
      {/* Hidden File Input */}
      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
      {/* Header */}
      <div className="animate-fade-in">
        <p className="section-label">Nutrition</p>
        <h1 className="section-title mt-1">Daily Fuel</h1>
      </div>

      {loadError && (
        <ErrorState
          compact
          title="Nutrition partially loaded"
          message={loadError}
          actionLabel="Refresh"
          onAction={fetchData}
        />
      )}

      {actionError && (
        <InlineNotice tone="danger" onDismiss={() => setActionError("")}>
          {actionError}
        </InlineNotice>
      )}

      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-36 rounded-3xl bg-glass-light" />
          <div className="h-40 rounded-3xl bg-glass-light" />
        </div>
      )}

      {/* Calories Overview */}
      {!loading && <div className="glass-card-static p-5 animate-slide-up delay-100">
        <div className="flex items-center gap-5">
          <CircleProgress
            value={totalConsumed.calories}
            max={totalTarget.calories}
            size={110}
            strokeWidth={8}
            color="#f97316"
            label="kcal"
            mode="value"
          />
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs text-dark-300">Remaining</p>
              <p className="text-2xl font-bold text-white">
                {totalTarget.calories - totalConsumed.calories} <span className="text-sm text-dark-300 font-normal">kcal</span>
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Eaten", value: totalConsumed.calories, color: "text-neon-orange" },
                { label: "Burned", value: caloriesBurned, color: "text-neon-pink" },
                { label: "Net", value: totalConsumed.calories - caloriesBurned, color: "text-neon-green" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-dark-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>}

      {/* Macro Breakdown */}
      {!loading && <div className="glass-card-static p-5 space-y-4 animate-slide-up delay-200">
        <p className="text-sm font-semibold text-white">Macro Tracking</p>
        <MacroBar value={totalConsumed.protein} max={totalTarget.protein} color="from-neon-blue to-neon-purple" label="Protein" />
        <MacroBar value={totalConsumed.carbs} max={totalTarget.carbs} color="from-neon-orange to-yellow-500" label="Carbs" />
        <MacroBar value={totalConsumed.fats} max={totalTarget.fats} color="from-neon-pink to-neon-purple" label="Fats" />
      </div>}

      {/* Water Tracker */}
      {!loading && <div className="animate-slide-up delay-300">
        <WaterTracker value={waterCount} onChange={setWaterCount} total={totalGlasses} />
      </div>}

      {/* Meal Plan */}
      <div className="space-y-3 animate-slide-up delay-400">
        <div className="flex items-center justify-between">
          <p className="section-label">Today's Meals</p>
          <button onClick={() => fileInputRef.current?.click()} className="text-xs btn-primary px-3 py-1.5 flex items-center gap-1">
            {isUploading ? "Uploading..." : "📸 AI Log"}
          </button>
        </div>

        {!loading && meals.length === 0 && (
          <div className="glass-card-static p-6 text-center text-dark-300 text-sm">
            No meals logged today. Snap a photo!
          </div>
        )}

        {meals.map((meal) => (
          <div
            key={meal._id}
            className="glass-card-sm p-4 flex items-center gap-3 relative overflow-hidden"
          >
            {meal.imageUrl && (
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{ backgroundImage: `url(${meal.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(10px)' }}
              />
            )}
            <div className="w-12 h-12 rounded-2xl bg-glass-light flex items-center justify-center text-2xl flex-shrink-0 z-10">
              {meal.mealType === 'breakfast' ? '🥣' : meal.mealType === 'lunch' ? '🥗' : meal.mealType === 'dinner' ? '🥩' : '🍎'}
            </div>
            <div className="flex-1 min-w-0 z-10">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white truncate">{meal.title}</p>
                <span className="w-4 h-4 rounded-full bg-neon-green/20 text-neon-green text-[8px] flex items-center justify-center">✓</span>
              </div>
              <p className="text-xs text-dark-300 capitalize">{meal.mealType}</p>
            </div>
            <div className="text-right flex-shrink-0 z-10">
              <p className="text-sm font-bold text-white">{meal.nutrition.calories}</p>
              <p className="text-[10px] text-dark-400">kcal</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Tips */}
      <div className="glass-card-static p-5 border-neon-green/15 animate-slide-up delay-500">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">🥦</span>
          <p className="text-sm font-semibold text-white">Nutrition Tip</p>
        </div>
        <p className="text-xs text-dark-200 leading-relaxed">
          {totalConsumed.protein < totalTarget.protein
            ? `You're ${totalTarget.protein - totalConsumed.protein}g away from your protein goal. Consider adding a post-workout shake or Greek yogurt to close the gap.`
            : totalConsumed.calories > totalTarget.calories
              ? `You've exceeded your calorie target by ${totalConsumed.calories - totalTarget.calories} kcal. Consider lighter meals for the rest of the day.`
              : `Great job! You're on track with your nutrition goals today. Keep it up! 💪`}
        </p>
      </div>
      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-4 sm:items-center">
          <div className="bg-dark-900 border border-white/10 w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-slide-up relative">
            <button onClick={() => setShowAiModal(false)} className="absolute top-4 right-4 text-dark-300 hover:text-white">✕</button>
            <h2 className="text-lg font-display font-bold text-white mb-4">NutriSnap AI ⚡</h2>
            
            {isAnalyzing ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-neon-blue/20 border-t-neon-blue animate-spin mx-auto" />
                <p className="text-sm text-dark-200">Analyzing your meal...</p>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-4">
                {uploadedImageUrl && (
                  <img src={uploadedImageUrl} alt="Food" className="w-full h-32 object-cover rounded-2xl" />
                )}
                <div>
                  <p className="text-lg font-bold text-white">{aiAnalysis.analysis.title}</p>
                  <p className="text-xs text-dark-300 capitalize">{aiAnalysis.analysis.mealType} • {aiAnalysis.analysis.foodItems.map(f => f.name).join(", ")}</p>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-center bg-dark-800 rounded-2xl p-3">
                  <div>
                    <p className="text-xs text-dark-400">Cal</p>
                    <p className="text-sm font-bold text-neon-orange">{aiAnalysis.nutritionEstimate.calories}</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Pro</p>
                    <p className="text-sm font-bold text-neon-blue">{aiAnalysis.nutritionEstimate.protein}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Carb</p>
                    <p className="text-sm font-bold text-neon-green">{aiAnalysis.nutritionEstimate.carbs}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Fat</p>
                    <p className="text-sm font-bold text-neon-pink">{aiAnalysis.nutritionEstimate.fats}g</p>
                  </div>
                </div>

                <div className="bg-glass-light p-3 rounded-xl">
                  <p className="text-[10px] text-dark-300 leading-relaxed italic border-l-2 border-neon-blue pl-2">{aiAnalysis.analysis.notes}</p>
                </div>

                <button onClick={confirmMeal} className="btn-gradient w-full py-3 text-sm">
                  Confirm & Log Meal
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
