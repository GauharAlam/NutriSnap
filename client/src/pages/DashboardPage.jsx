import { useEffect, useMemo, useState } from "react";
import { fetchCurrentGoal, saveCurrentGoal } from "../features/goals/goal-api";
import {
  createMealEntry,
  deleteMealEntry,
  fetchMealsForDate,
  uploadMealImage,
} from "../features/meals/meal-api";
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
  const [deletingMealId, setDeletingMealId] = useState("");
  const [mealError, setMealError] = useState("");
  const [mealSuccessMessage, setMealSuccessMessage] = useState("");

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
    const target = goal?.dailyTargets || createEmptySummary();
    const summary = mealsData.summary;

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
  }, [goal, mealsData.summary]);

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
    }));

    setMealPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return file ? URL.createObjectURL(file) : "";
    });

    setMealSuccessMessage("");
  }

  async function handleCreateMeal(event) {
    event.preventDefault();
    setMealError("");
    setMealSuccessMessage("");
    setIsMealSubmitting(true);

    try {
      let imagePayload = null;

      if (mealForm.imageFile) {
        imagePayload = await uploadMealImage(mealForm.imageFile);
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
        source: imagePayload ? "image_upload" : "manual",
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
          This phase makes meal tracking real: users can upload food photos, log meals,
          and compare today&apos;s intake against their saved goals.
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
                  This phase keeps nutrient entry manual so the next phase can focus fully
                  on AI recognition and nutrient estimation.
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
                  Manual entry gives us clean nutrition records now, while image upload
                  readies the app for AI-powered food analysis next.
                </p>
                <button
                  type="submit"
                  disabled={isMealSubmitting}
                  className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isMealSubmitting ? "Logging meal..." : "Log meal"}
                </button>
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
