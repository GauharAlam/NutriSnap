import { useEffect, useMemo, useState } from "react";
import { fetchCurrentGoal, saveCurrentGoal } from "../features/goals/goal-api";
import {
  analyzeMealImage,
  createMealEntry,
  deleteMealEntry,
  estimateMealNutrition,
  fetchMealsForDate,
  uploadMealImage,
} from "../features/meals/meal-api";
import { chatWithAssistant } from "../features/assistant/assistant-api";
import { fetchDailyProgress, fetchWeeklyProgress } from "../features/progress/progress-api";
import { useAuth } from "../features/auth/useAuth";

const goalTypeLabels = {
  weight_loss: "Weight loss",
  muscle_gain: "Muscle gain",
  maintenance: "Maintenance",
};

const goalPresets = {
  weight_loss: {
    calories: 1800,
    protein: 140,
    carbs: 160,
    fats: 60,
    sugar: 35,
  },
  muscle_gain: {
    calories: 2600,
    protein: 170,
    carbs: 300,
    fats: 75,
    sugar: 45,
  },
  maintenance: {
    calories: 2200,
    protein: 150,
    carbs: 220,
    fats: 70,
    sugar: 40,
  },
};

const mealTypeLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

function getLocalDateValue(date = new Date()) {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 10);
}

function getLocalDateTimeValue(date = new Date()) {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 16);
}

function getWeekStart(dateString) {
  const date = dateString ? new Date(`${dateString}T00:00:00`) : new Date();
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return getLocalDateValue(monday);
}

function createEmptySummary() {
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    sugar: 0,
    mealCount: 0,
  };
}

function createInitialMealForm() {
  return {
    title: "",
    mealType: "breakfast",
    foodItems: "",
    notes: "",
    eatenAt: getLocalDateTimeValue(),
    imageFile: null,
    uploadedImage: null,
    nutrition: {
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      sugar: "",
    },
  };
}

function formatMealTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatProgress(current, target) {
  if (!target) {
    return "0%";
  }

  return `${Math.min(999, Math.round((current / target) * 100))}%`;
}

export function DashboardPage() {
  const { user, updateUser } = useAuth();
  const [goal, setGoal] = useState(null);
  const [goalForm, setGoalForm] = useState(null);
  const [isGoalLoading, setIsGoalLoading] = useState(true);
  const [isGoalSaving, setIsGoalSaving] = useState(false);
  const [goalError, setGoalError] = useState("");
  const [goalSuccessMessage, setGoalSuccessMessage] = useState("");

  const [selectedDate, setSelectedDate] = useState(getLocalDateValue());
  const [mealsData, setMealsData] = useState({
    date: getLocalDateValue(),
    meals: [],
    summary: createEmptySummary(),
  });
  const [mealForm, setMealForm] = useState(() => createInitialMealForm());
  const [mealPreviewUrl, setMealPreviewUrl] = useState("");
  const [isMealsLoading, setIsMealsLoading] = useState(true);
  const [isMealSubmitting, setIsMealSubmitting] = useState(false);
  const [isMealAnalyzing, setIsMealAnalyzing] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState("");
  const [mealError, setMealError] = useState("");
  const [mealSuccessMessage, setMealSuccessMessage] = useState("");
  const [analysisSummary, setAnalysisSummary] = useState(null);
  const [reviewFoodItems, setReviewFoodItems] = useState([]);
  const [isEstimatingNutrition, setIsEstimatingNutrition] = useState(false);

  const [dailyProgress, setDailyProgress] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState(null);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState("");

  const [assistantPrompt, setAssistantPrompt] = useState("How can I improve my meals today?");
  const [assistantReply, setAssistantReply] = useState(null);
  const [assistantError, setAssistantError] = useState("");
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadGoal() {
      try {
        const data = await fetchCurrentGoal();

        if (!isMounted) {
          return;
        }

        setGoal(data);
        setGoalForm({
          goalType: data.goalType,
          dailyTargets: data.dailyTargets,
          currentWeight: data.currentWeight ?? "",
          targetWeight: data.targetWeight ?? "",
          weeklyWorkoutDays: data.weeklyWorkoutDays ?? 4,
          notes: data.notes ?? "",
        });
      } catch (loadError) {
        if (isMounted) {
          setGoalError(loadError?.response?.data?.message || "Unable to load your goal right now");
        }
      } finally {
        if (isMounted) {
          setIsGoalLoading(false);
        }
      }
    }

    loadGoal();

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadMeals(dateValue, options = {}) {
    if (!options.silent) {
      setIsMealsLoading(true);
    }

    try {
      const data = await fetchMealsForDate(dateValue);
      setMealsData(data);

      if (!options.preserveMessages) {
        setMealError("");
      }
    } catch (loadError) {
      setMealError(loadError?.response?.data?.message || "Unable to load meals right now");
    } finally {
      if (!options.silent) {
        setIsMealsLoading(false);
      }
    }
  }

  useEffect(() => {
    loadMeals(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    let isMounted = true;

    async function loadProgress() {
      setIsProgressLoading(true);

      try {
        const [daily, weekly] = await Promise.all([
          fetchDailyProgress(selectedDate),
          fetchWeeklyProgress(getWeekStart(selectedDate)),
        ]);

        if (!isMounted) {
          return;
        }

        setDailyProgress(daily);
        setWeeklyProgress(weekly);
        setProgressError("");
      } catch (error) {
        if (isMounted) {
          setProgressError(error?.response?.data?.message || "Unable to load dashboard progress");
        }
      } finally {
        if (isMounted) {
          setIsProgressLoading(false);
        }
      }
    }

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  useEffect(() => {
    return () => {
      if (mealPreviewUrl) {
        URL.revokeObjectURL(mealPreviewUrl);
      }
    };
  }, [mealPreviewUrl]);

  const targetCards = useMemo(() => {
    if (!goal) {
      return [];
    }

    return [
      {
        title: "Calories",
        value: `${goal.dailyTargets.calories}`,
        meta: "daily energy target",
      },
      {
        title: "Protein",
        value: `${goal.dailyTargets.protein}g`,
        meta: "muscle support target",
      },
      {
        title: "Carbs",
        value: `${goal.dailyTargets.carbs}g`,
        meta: "fuel and recovery target",
      },
      {
        title: "Fats",
        value: `${goal.dailyTargets.fats}g`,
        meta: `${goal.dailyTargets.sugar}g sugar cap`,
      },
    ];
  }, [goal]);

  const intakeCards = useMemo(() => {
    const target = dailyProgress?.target || goal?.dailyTargets || createEmptySummary();
    const summary = dailyProgress?.summary || mealsData.summary;

    return [
      {
        title: "Consumed Calories",
        value: `${summary.calories}`,
        meta: `${formatProgress(summary.calories, target.calories)} of daily target`,
      },
      {
        title: "Protein Logged",
        value: `${summary.protein}g`,
        meta: `${formatProgress(summary.protein, target.protein)} of protein target`,
      },
      {
        title: "Carbs Logged",
        value: `${summary.carbs}g`,
        meta: `${formatProgress(summary.carbs, target.carbs)} of carbs target`,
      },
      {
        title: "Meals Today",
        value: `${summary.mealCount}`,
        meta: `${summary.sugar}g sugar tracked so far`,
      },
    ];
  }, [dailyProgress, goal, mealsData.summary]);

  function handleGoalTypeChange(event) {
    const { value } = event.target;

    setGoalForm((current) => ({
      ...current,
      goalType: value,
      dailyTargets: goalPresets[value],
    }));
    setGoalSuccessMessage("");
  }

  function handleGoalNumericChange(event) {
    const { name, value } = event.target;

    setGoalForm((current) => ({
      ...current,
      [name]: value,
    }));
    setGoalSuccessMessage("");
  }

  function handleGoalTargetChange(event) {
    const { name, value } = event.target;

    setGoalForm((current) => ({
      ...current,
      dailyTargets: {
        ...current.dailyTargets,
        [name]: value,
      },
    }));
    setGoalSuccessMessage("");
  }

  function handleGoalNotesChange(event) {
    const { value } = event.target;

    setGoalForm((current) => ({
      ...current,
      notes: value,
    }));
    setGoalSuccessMessage("");
  }

  async function handleSaveGoal(event) {
    event.preventDefault();
    setGoalError("");
    setGoalSuccessMessage("");
    setIsGoalSaving(true);

    try {
      const payload = {
        goalType: goalForm.goalType,
        dailyTargets: {
          calories: Number(goalForm.dailyTargets.calories),
          protein: Number(goalForm.dailyTargets.protein),
          carbs: Number(goalForm.dailyTargets.carbs),
          fats: Number(goalForm.dailyTargets.fats),
          sugar: Number(goalForm.dailyTargets.sugar),
        },
        currentWeight: goalForm.currentWeight === "" ? null : Number(goalForm.currentWeight),
        targetWeight: goalForm.targetWeight === "" ? null : Number(goalForm.targetWeight),
        weeklyWorkoutDays: Number(goalForm.weeklyWorkoutDays),
        notes: goalForm.notes.trim(),
      };

      const savedGoal = await saveCurrentGoal(payload);

      setGoal(savedGoal);
      setGoalForm({
        goalType: savedGoal.goalType,
        dailyTargets: savedGoal.dailyTargets,
        currentWeight: savedGoal.currentWeight ?? "",
        targetWeight: savedGoal.targetWeight ?? "",
        weeklyWorkoutDays: savedGoal.weeklyWorkoutDays,
        notes: savedGoal.notes ?? "",
      });
      updateUser({ goalType: savedGoal.user.goalType });
      setGoalSuccessMessage("Goal preferences saved");
    } catch (saveError) {
      setGoalError(saveError?.response?.data?.message || "Unable to save your goal right now");
    } finally {
      setIsGoalSaving(false);
    }
  }

  function handleMealFieldChange(event) {
    const { name, value } = event.target;

    setMealForm((current) => ({
      ...current,
      [name]: value,
    }));
    setMealSuccessMessage("");
  }

  function handleMealNutritionChange(event) {
    const { name, value } = event.target;

    setMealForm((current) => ({
      ...current,
      nutrition: {
        ...current.nutrition,
        [name]: value,
      },
    }));
    setMealSuccessMessage("");
  }

  function handleMealImageChange(event) {
    const file = event.target.files?.[0] || null;

    setMealForm((current) => ({
      ...current,
      imageFile: file,
      uploadedImage: null,
    }));

    setMealPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return file ? URL.createObjectURL(file) : "";
    });

    setMealSuccessMessage("");
    setAnalysisSummary(null);
    setReviewFoodItems([]);
  }

  async function ensureUploadedMealImage() {
    if (mealForm.uploadedImage) {
      return mealForm.uploadedImage;
    }

    if (!mealForm.imageFile) {
      throw new Error("Please choose a meal image first");
    }

    const uploaded = await uploadMealImage(mealForm.imageFile);

    setMealForm((current) => ({
      ...current,
      uploadedImage: uploaded,
    }));

    return uploaded;
  }

  async function handleAnalyzeMeal() {
    setMealError("");
    setMealSuccessMessage("");
    setIsMealAnalyzing(true);

    try {
      const uploaded = await ensureUploadedMealImage();
      const result = await analyzeMealImage({
        imagePath: uploaded.imagePath,
        imageUrl: uploaded.imageUrl,
        originalName: uploaded.originalName,
        mealTypeHint: mealForm.mealType,
      });

      setMealForm((current) => ({
        ...current,
        title: current.title || result.analysis.title,
        mealType: result.analysis.mealType || current.mealType,
        foodItems: result.analysis.foodItems.map((item) => item.name).join(", "),
        notes: current.notes || result.analysis.notes,
        uploadedImage: uploaded,
        nutrition: {
          calories: String(result.nutritionEstimate.totals.calories),
          protein: String(result.nutritionEstimate.totals.protein),
          carbs: String(result.nutritionEstimate.totals.carbs),
          fats: String(result.nutritionEstimate.totals.fats),
          sugar: String(result.nutritionEstimate.totals.sugar),
        },
      }));
      setAnalysisSummary(result);
      setReviewFoodItems(
        result.analysis.foodItems.map((item) => ({
          name: item.name,
          portionMultiplier: item.portionMultiplier,
        }))
      );
      setMealSuccessMessage("AI suggestions loaded. Review and adjust anything before saving.");
    } catch (analysisError) {
      setMealError(
        analysisError?.response?.data?.message ||
          analysisError.message ||
          "Unable to analyze this image right now"
      );
    } finally {
      setIsMealAnalyzing(false);
    }
  }

  function handleReviewItemChange(index, field, value) {
    setReviewFoodItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
    setMealSuccessMessage("");
  }

  function handleAddReviewItem() {
    setReviewFoodItems((current) => [...current, { name: "", portionMultiplier: 1 }]);
    setMealSuccessMessage("");
  }

  function handleRemoveReviewItem(index) {
    setReviewFoodItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setMealSuccessMessage("");
  }

  async function handleRecalculateEstimate() {
    setMealError("");
    setMealSuccessMessage("");
    setIsEstimatingNutrition(true);

    try {
      const sanitizedItems = reviewFoodItems
        .map((item) => ({
          name: item.name.trim(),
          portionMultiplier: Number(item.portionMultiplier) || 1,
        }))
        .filter((item) => item.name);

      const result = await estimateMealNutrition(sanitizedItems);

      setReviewFoodItems(sanitizedItems);
      setMealForm((current) => ({
        ...current,
        foodItems: sanitizedItems.map((item) => item.name).join(", "),
        nutrition: {
          calories: String(result.totals.calories),
          protein: String(result.totals.protein),
          carbs: String(result.totals.carbs),
          fats: String(result.totals.fats),
          sugar: String(result.totals.sugar),
        },
      }));
      setAnalysisSummary((current) =>
        current
          ? {
              ...current,
              nutritionEstimate: result,
              analysis: {
                ...current.analysis,
                foodItems: sanitizedItems,
              },
            }
          : current
      );
      setMealSuccessMessage("Nutrition estimate recalculated from your reviewed items.");
    } catch (error) {
      setMealError(error?.response?.data?.message || "Unable to recalculate nutrition");
    } finally {
      setIsEstimatingNutrition(false);
    }
  }

  async function handleCreateMeal(event) {
    event.preventDefault();
    setMealError("");
    setMealSuccessMessage("");
    setIsMealSubmitting(true);

    try {
      let imagePayload = mealForm.uploadedImage;

      if (!imagePayload && mealForm.imageFile) {
        imagePayload = await ensureUploadedMealImage();
      }

      const payload = {
        title: mealForm.title,
        mealType: mealForm.mealType,
        foodItems: mealForm.foodItems
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        notes: mealForm.notes,
        eatenAt: new Date(mealForm.eatenAt).toISOString(),
        imageUrl: imagePayload?.imageUrl || "",
        imagePath: imagePayload?.imagePath || "",
        nutrition: {
          calories: Number(mealForm.nutrition.calories),
          protein: Number(mealForm.nutrition.protein),
          carbs: Number(mealForm.nutrition.carbs),
          fats: Number(mealForm.nutrition.fats),
          sugar: Number(mealForm.nutrition.sugar),
        },
        source: analysisSummary ? "ai_estimated" : imagePayload ? "image_upload" : "manual",
      };

      await createMealEntry(payload);

      const nextDate = mealForm.eatenAt.slice(0, 10);

      setMealForm(createInitialMealForm());
      setMealPreviewUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }

        return "";
      });
      setAnalysisSummary(null);
      setReviewFoodItems([]);
      setMealSuccessMessage("Meal logged successfully");

      if (nextDate !== selectedDate) {
        setSelectedDate(nextDate);
      } else {
        await loadMeals(selectedDate, { silent: true, preserveMessages: true });
      }
    } catch (saveError) {
      setMealError(saveError?.response?.data?.message || "Unable to log your meal right now");
    } finally {
      setIsMealSubmitting(false);
    }
  }

  async function handleAssistantSubmit(event) {
    event.preventDefault();
    setAssistantError("");
    setIsAssistantLoading(true);

    try {
      const response = await chatWithAssistant(assistantPrompt);
      setAssistantReply(response);
    } catch (error) {
      setAssistantError(error?.response?.data?.message || "Unable to reach the assistant right now");
    } finally {
      setIsAssistantLoading(false);
    }
  }

  async function handleDeleteMeal(mealId) {
    setMealError("");
    setMealSuccessMessage("");
    setDeletingMealId(mealId);

    try {
      await deleteMealEntry(mealId);
      await loadMeals(selectedDate, { silent: true, preserveMessages: true });
      setMealSuccessMessage("Meal deleted");
    } catch (deleteError) {
      setMealError(deleteError?.response?.data?.message || "Unable to delete that meal");
    } finally {
      setDeletingMealId("");
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Dashboard</p>
          <h2 className="font-serif text-4xl font-semibold">Daily nutrition pulse</h2>
          <p className="mt-3 text-sm text-emerald">
            Signed in as {user?.name} with a{" "}
            {goalTypeLabels[user?.goalType || "maintenance"]?.toLowerCase()} plan.
          </p>
        </div>
        <p className="max-w-xl text-sm text-ink/65">
          The dashboard now combines goal targets, real meal logs, weekly progress, and
          AI guidance into one daily operating view.
        </p>
      </div>

      <article className="rounded-[1.75rem] border border-ink/10 bg-white/88 p-6 shadow-soft">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Account Session</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-ink/50">Name</p>
            <p className="mt-1 font-semibold">{user?.name}</p>
          </div>
          <div>
            <p className="text-sm text-ink/50">Email</p>
            <p className="mt-1 font-semibold">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-ink/50">Goal</p>
            <p className="mt-1 font-semibold capitalize">
              {goalTypeLabels[user?.goalType || "maintenance"]}
            </p>
          </div>
        </div>
      </article>

      {isGoalLoading ? (
        <article className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-soft">
          <p className="text-sm text-ink/60">Loading your goal settings...</p>
        </article>
      ) : !goalForm ? (
        <article className="rounded-[1.75rem] border border-coral/20 bg-white/90 p-6 shadow-soft">
          <p className="text-sm text-ink/75">
            {goalError || "We couldn't load your goal settings right now."}
          </p>
        </article>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Daily Targets</p>
                <h3 className="mt-2 font-serif text-3xl font-semibold">
                  Goal benchmarks for the day
                </h3>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {targetCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-5 shadow-soft"
                >
                  <p className="text-sm text-ink/55">{card.title}</p>
                  <p className="mt-3 text-3xl font-semibold">{card.value}</p>
                  <p className="mt-2 text-sm text-emerald">{card.meta}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Today&apos;s Intake</p>
              <h3 className="mt-2 font-serif text-3xl font-semibold">
                Logged nutrition against your targets
              </h3>
            </div>

            {progressError ? (
              <div className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-ink/75">
                {progressError}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {intakeCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-5 shadow-soft"
                >
                  <p className="text-sm text-ink/55">{card.title}</p>
                  <p className="mt-3 text-3xl font-semibold">{card.value}</p>
                  <p className="mt-2 text-sm text-coral">{card.meta}</p>
                </article>
              ))}
            </div>

            {!isProgressLoading && dailyProgress ? (
              <article className="rounded-[1.5rem] border border-ink/10 bg-white/85 p-5 shadow-soft">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/40">Daily Progress</p>
                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  {[
                    ["Calories remaining", dailyProgress.comparison.caloriesRemaining],
                    ["Protein remaining", `${dailyProgress.comparison.proteinRemaining}g`],
                    ["Carbs remaining", `${dailyProgress.comparison.carbsRemaining}g`],
                    ["Fats remaining", `${dailyProgress.comparison.fatsRemaining}g`],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-sm text-ink/50">{label}</p>
                      <p className="mt-1 text-xl font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-[1.75rem] border border-ink/10 bg-white/88 p-6 shadow-soft">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Weekly Progress</p>
                  <h3 className="mt-2 font-serif text-3xl font-semibold">
                    Consistency across the week
                  </h3>
                </div>
                {!isProgressLoading && weeklyProgress ? (
                  <div className="rounded-full bg-sand px-4 py-2 text-sm font-medium text-ink/70">
                    {weeklyProgress.adherenceDays} aligned day(s)
                  </div>
                ) : null}
              </div>

              {isProgressLoading ? (
                <div className="mt-6 text-sm text-ink/60">Loading weekly progress...</div>
              ) : weeklyProgress ? (
                <>
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {[
                      ["Average calories", weeklyProgress.averages.calories],
                      ["Average protein", `${weeklyProgress.averages.protein}g`],
                      ["Average meals", weeklyProgress.averages.mealCount],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-ink/10 bg-sand px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.15em] text-ink/45">{label}</p>
                        <p className="mt-2 text-2xl font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    {weeklyProgress.days.map((day) => {
                      const percentage = Math.max(0, Math.min(100, day.comparison.caloriesProgress));

                      return (
                        <div key={day.date} className="rounded-2xl border border-ink/10 bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">{day.date}</p>
                              <p className="text-xs text-ink/50">
                                {day.summary.calories} kcal and {day.summary.protein}g protein
                              </p>
                            </div>
                            <p className="text-sm font-medium text-ink/60">
                              {day.comparison.caloriesProgress}% of calorie target
                            </p>
                          </div>
                          <div className="mt-3 h-3 overflow-hidden rounded-full bg-mist">
                            <div
                              className="h-full rounded-full bg-emerald transition"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </article>

            <form
              onSubmit={handleAssistantSubmit}
              className="rounded-[1.75rem] border border-ink/10 bg-white/88 p-6 shadow-soft"
            >
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-ink/40">AI Coach</p>
                <h3 className="font-serif text-3xl font-semibold">
                  Ask for diet improvements based on your logs
                </h3>
                <p className="text-sm text-ink/60">
                  The assistant uses your goal, today&apos;s intake, weekly averages, and recent
                  meals to give practical next-step advice.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "How can I improve my meals today?",
                  "What should I eat next to hit protein?",
                  "How can I reduce sugar this week?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setAssistantPrompt(prompt)}
                    className="rounded-full border border-ink/10 bg-sand px-4 py-2 text-sm text-ink/70 transition hover:bg-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <label className="mt-6 block space-y-2">
                <span className="text-sm font-medium text-ink/70">Your message</span>
                <textarea
                  rows="4"
                  value={assistantPrompt}
                  onChange={(event) => setAssistantPrompt(event.target.value)}
                  className="w-full rounded-3xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                />
              </label>

              {assistantError ? (
                <div className="mt-5 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-ink/75">
                  {assistantError}
                </div>
              ) : null}

              <div className="mt-6 flex items-center justify-between gap-3">
                <p className="max-w-xl text-sm text-ink/55">
                  Suggestions are coaching guidance, not medical advice.
                </p>
                <button
                  type="submit"
                  disabled={isAssistantLoading}
                  className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isAssistantLoading ? "Thinking..." : "Ask assistant"}
                </button>
              </div>

              {assistantReply ? (
                <div className="mt-6 rounded-[1.5rem] border border-ink/10 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/40">Assistant Reply</p>
                    <span className="rounded-full bg-mist px-3 py-2 text-xs font-medium text-ink/55">
                      {assistantReply.source.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-ink/75">
                    {assistantReply.reply}
                  </p>
                </div>
              ) : null}
            </form>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <form
              onSubmit={handleSaveGoal}
              className="rounded-[1.75rem] border border-ink/10 bg-white/88 p-6 shadow-soft"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Goal Settings</p>
                  <h3 className="mt-2 font-serif text-3xl font-semibold">
                    Tune the targets your dashboard tracks against
                  </h3>
                </div>
                {goal?.isDraft ? (
                  <span className="rounded-full bg-sand px-4 py-2 text-sm font-medium text-ink/70">
                    Using recommended defaults
                  </span>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink/70">Goal type</span>
                  <select
                    value={goalForm.goalType}
                    onChange={handleGoalTypeChange}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                  >
                    {Object.entries(goalTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink/70">Weekly workout days</span>
                  <input
                    min="0"
                    max="14"
                    type="number"
                    name="weeklyWorkoutDays"
                    value={goalForm.weeklyWorkoutDays}
                    onChange={handleGoalNumericChange}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                  />
                </label>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["calories", "Calories"],
                  ["protein", "Protein (g)"],
                  ["carbs", "Carbs (g)"],
                  ["fats", "Fats (g)"],
                  ["sugar", "Sugar (g)"],
                ].map(([name, label]) => (
                  <label key={name} className="space-y-2">
                    <span className="text-sm font-medium text-ink/70">{label}</span>
                    <input
                      min="0"
                      type="number"
                      name={name}
                      value={goalForm.dailyTargets[name]}
                      onChange={handleGoalTargetChange}
                      className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink/70">Current weight (kg)</span>
                  <input
                    min="0"
                    step="0.1"
                    type="number"
                    name="currentWeight"
                    value={goalForm.currentWeight}
                    onChange={handleGoalNumericChange}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink/70">Target weight (kg)</span>
                  <input
                    min="0"
                    step="0.1"
                    type="number"
                    name="targetWeight"
                    value={goalForm.targetWeight}
                    onChange={handleGoalNumericChange}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                  />
                </label>
              </div>

              <label className="mt-6 block space-y-2">
                <span className="text-sm font-medium text-ink/70">Notes</span>
                <textarea
                  rows="4"
                  value={goalForm.notes}
                  onChange={handleGoalNotesChange}
                  className="w-full rounded-3xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                  placeholder="Examples: keep sugar lower on weekdays, prioritize protein at lunch, or focus on consistency."
                />
              </label>

              {goalError ? (
                <div className="mt-5 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-ink/75">
                  {goalError}
                </div>
              ) : null}

              {goalSuccessMessage ? (
                <div className="mt-5 rounded-2xl border border-emerald/20 bg-mint px-4 py-3 text-sm text-emerald">
                  {goalSuccessMessage}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-xl text-sm text-ink/55">
                  These values become the baseline for daily summaries, meal comparisons,
                  and the upcoming AI recommendation layer.
                </p>
                <button
                  type="submit"
                  disabled={isGoalSaving}
                  className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isGoalSaving ? "Saving goal..." : "Save goal settings"}
                </button>
              </div>
            </form>

            <article className="rounded-[1.75rem] border border-ink/10 bg-white/88 p-6 shadow-soft">
              <p className="text-xs uppercase tracking-[0.3em] text-ink/40">How This Helps</p>
              <div className="mt-5 space-y-4">
                {[
                  "Meal logging now feeds directly into daily intake summaries instead of demo placeholders.",
                  "Uploaded food images are stored and attached to meals, ready for the next AI analysis phase.",
                  "Goal notes and tracked meals will later help the assistant give more personal diet suggestions.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-ink/10 bg-sand px-4 py-4 text-sm text-ink/75"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <form
              onSubmit={handleCreateMeal}
              className="rounded-[1.75rem] border border-ink/10 bg-white/88 p-6 shadow-soft"
            >
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Meal Logger</p>
                <h3 className="font-serif text-3xl font-semibold">
                  Upload a meal photo and log nutrition
                </h3>
                <p className="text-sm text-ink/60">
                  Upload a meal image, let AI suggest the foods and nutrients, then review
                  the result before saving the final log.
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink/70">Meal title</span>
                  <input
                    required
                    name="title"
                    value={mealForm.title}
                    onChange={handleMealFieldChange}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                    placeholder="Grilled chicken rice bowl"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink/70">Meal type</span>
                  <select
                    name="mealType"
                    value={mealForm.mealType}
                    onChange={handleMealFieldChange}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                  >
                    {Object.entries(mealTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink/70">Food items</span>
                  <input
                    name="foodItems"
                    value={mealForm.foodItems}
                    onChange={handleMealFieldChange}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                    placeholder="Chicken, rice, avocado, greens"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink/70">Eaten at</span>
                  <input
                    required
                    type="datetime-local"
                    name="eatenAt"
                    value={mealForm.eatenAt}
                    onChange={handleMealFieldChange}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                  />
                </label>
              </div>

              <div className="mt-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink/70">Meal image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMealImageChange}
                    className="w-full rounded-2xl border border-dashed border-ink/15 bg-mist px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />
                </label>
              </div>

              {mealPreviewUrl ? (
                <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-sand">
                  <img src={mealPreviewUrl} alt="Meal preview" className="h-56 w-full object-cover" />
                </div>
              ) : null}

              {analysisSummary ? (
                <div className="mt-4 rounded-[1.5rem] border border-emerald/20 bg-mint p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald/80">
                        AI Suggestion
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {analysisSummary.analysis.title}
                      </p>
                      <p className="mt-1 text-sm text-ink/70">
                        Confidence: {analysisSummary.analysis.confidence}. Source:{" "}
                        {analysisSummary.source.replaceAll("_", " ")}.
                      </p>
                    </div>
                    <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-ink/70">
                      {analysisSummary.analysis.foodItems.length} detected item(s)
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysisSummary.nutritionEstimate.items.map((item) => (
                      <span
                        key={`${item.name}-${item.matchedFood}`}
                        className="rounded-full border border-ink/10 bg-white/85 px-3 py-2 text-sm text-ink/75"
                      >
                        {item.name} x{item.portionMultiplier}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {reviewFoodItems.length > 0 ? (
                <div className="mt-4 rounded-[1.5rem] border border-ink/10 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-ink/40">AI Review</p>
                      <p className="mt-1 text-sm text-ink/60">
                        Edit detected foods and portion multipliers, then recalculate nutrients.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddReviewItem}
                      className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink hover:text-white"
                    >
                      Add item
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {reviewFoodItems.map((item, index) => (
                      <div
                        key={`${index}-${item.name}`}
                        className="grid gap-3 rounded-2xl border border-ink/10 bg-mist p-4 md:grid-cols-[1fr_180px_auto]"
                      >
                        <input
                          value={item.name}
                          onChange={(event) => handleReviewItemChange(index, "name", event.target.value)}
                          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald"
                          placeholder="Food item"
                        />
                        <input
                          min="0.25"
                          step="0.25"
                          type="number"
                          value={item.portionMultiplier}
                          onChange={(event) =>
                            handleReviewItemChange(index, "portionMultiplier", event.target.value)
                          }
                          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald"
                          placeholder="Portion"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveReviewItem(index)}
                          className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink hover:text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleRecalculateEstimate}
                      disabled={isEstimatingNutrition}
                      className="rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isEstimatingNutrition ? "Recalculating..." : "Recalculate estimate"}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["calories", "Calories"],
                  ["protein", "Protein (g)"],
                  ["carbs", "Carbs (g)"],
                  ["fats", "Fats (g)"],
                  ["sugar", "Sugar (g)"],
                ].map(([name, label]) => (
                  <label key={name} className="space-y-2">
                    <span className="text-sm font-medium text-ink/70">{label}</span>
                    <input
                      required
                      min="0"
                      type="number"
                      name={name}
                      value={mealForm.nutrition[name]}
                      onChange={handleMealNutritionChange}
                      className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                    />
                  </label>
                ))}
              </div>

              <label className="mt-6 block space-y-2">
                <span className="text-sm font-medium text-ink/70">Notes</span>
                <textarea
                  rows="4"
                  name="notes"
                  value={mealForm.notes}
                  onChange={handleMealFieldChange}
                  className="w-full rounded-3xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                  placeholder="Portion notes, ingredients, or context for this meal."
                />
              </label>

              {mealError ? (
                <div className="mt-5 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-ink/75">
                  {mealError}
                </div>
              ) : null}

              {mealSuccessMessage ? (
                <div className="mt-5 rounded-2xl border border-emerald/20 bg-mint px-4 py-3 text-sm text-emerald">
                  {mealSuccessMessage}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-xl text-sm text-ink/55">
                  You can still override every AI-filled field before saving, which keeps
                  the log accurate even when image recognition is imperfect.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleAnalyzeMeal}
                    disabled={isMealAnalyzing || (!mealForm.imageFile && !mealForm.uploadedImage)}
                    className="rounded-full border border-ink/10 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isMealAnalyzing ? "Analyzing image..." : "Analyze with AI"}
                  </button>
                  <button
                    type="submit"
                    disabled={isMealSubmitting}
                    className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isMealSubmitting ? "Logging meal..." : "Log meal"}
                  </button>
                </div>
              </div>
            </form>

            <div className="rounded-[1.75rem] border border-ink/10 bg-white/88 p-6 shadow-soft">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Logged Meals</p>
                  <h3 className="mt-2 font-serif text-3xl font-semibold">
                    Meals for {mealsData.date}
                  </h3>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink/70">Date</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                  />
                </label>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-ink/10 bg-sand px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Meals</p>
                  <p className="mt-2 text-2xl font-semibold">{mealsData.summary.mealCount}</p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-sand px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Calories</p>
                  <p className="mt-2 text-2xl font-semibold">{mealsData.summary.calories}</p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-sand px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Protein</p>
                  <p className="mt-2 text-2xl font-semibold">{mealsData.summary.protein}g</p>
                </div>
              </div>

              {isMealsLoading ? (
                <div className="mt-6 rounded-2xl border border-ink/10 bg-white/70 px-4 py-6 text-sm text-ink/60">
                  Loading meals for this date...
                </div>
              ) : mealsData.meals.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-ink/15 bg-white/70 px-4 py-6 text-sm text-ink/60">
                  No meals logged yet for this date. Start with the meal logger on the left.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {mealsData.meals.map((meal) => (
                    <article
                      key={meal.id}
                      className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white"
                    >
                      {meal.imageUrl ? (
                        <img
                          src={meal.imageUrl}
                          alt={meal.title}
                          className="h-44 w-full object-cover"
                        />
                      ) : null}

                      <div className="p-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                              {mealTypeLabels[meal.mealType]}
                            </p>
                            <h4 className="mt-2 text-xl font-semibold">{meal.title}</h4>
                            <p className="mt-2 text-sm text-ink/55">
                              Logged at {formatMealTime(meal.eatenAt)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteMeal(meal.id)}
                            disabled={deletingMealId === meal.id}
                            className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingMealId === meal.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>

                        {meal.foodItems.length > 0 ? (
                          <p className="mt-4 text-sm text-ink/70">
                            Foods: {meal.foodItems.join(", ")}
                          </p>
                        ) : null}

                        {meal.notes ? (
                          <p className="mt-3 text-sm leading-6 text-ink/60">{meal.notes}</p>
                        ) : null}

                        <div className="mt-5 grid gap-3 sm:grid-cols-5">
                          {[
                            ["Calories", meal.nutrition.calories],
                            ["Protein", `${meal.nutrition.protein}g`],
                            ["Carbs", `${meal.nutrition.carbs}g`],
                            ["Fats", `${meal.nutrition.fats}g`],
                            ["Sugar", `${meal.nutrition.sugar}g`],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded-2xl border border-ink/10 bg-mist px-3 py-3"
                            >
                              <p className="text-xs uppercase tracking-[0.15em] text-ink/40">
                                {label}
                              </p>
                              <p className="mt-2 font-semibold">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </section>
  );
}
