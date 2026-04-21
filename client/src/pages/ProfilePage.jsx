import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { useTheme } from "../features/theme/ThemeProvider";
import { apiClient } from "../lib/api/client";

const settingsSections = [
  {
    title: "Preferences",
    items: [
      { icon: "🔔", label: "Push Notifications", type: "toggle", defaultOn: true },
      { icon: "🌙", label: "Dark Mode", type: "toggle", defaultOn: true },
      { icon: "⌚", label: "Smartwatch Sync", type: "toggle", defaultOn: false },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: "🔒", label: "Privacy & Security", type: "link" },
      { icon: "📊", label: "Data & Export", type: "link" },
      { icon: "❓", label: "Help & Support", type: "link" },
    ],
  },
];

const goalPresets = {
  weight_loss: { calories: 1800, protein: 140, carbs: 160, fats: 60, sugar: 35 },
  muscle_gain: { calories: 2600, protein: 170, carbs: 300, fats: 75, sugar: 45 },
  maintenance: { calories: 2200, protein: 150, carbs: 220, fats: 70, sugar: 40 },
};

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [toggles, setToggles] = useState({
    "Push Notifications": true,
    "Smartwatch Sync": false,
  });
  
  const [goalData, setGoalData] = useState(null);
  const [workoutStats, setWorkoutStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [goalRes, workoutRes] = await Promise.all([
          apiClient.get("/goals"),
          apiClient.get("/workouts")
        ]);
        if (goalRes.data.success) setGoalData(goalRes.data.data);
        if (workoutRes.data.success) setWorkoutStats(workoutRes.data.data.stats);
      } catch (err) {
        console.error("Profile data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const firstName = user?.name?.split(" ")[0] || "Athlete";

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  function handleToggle(label) {
    setToggles((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  async function handleGoalChange(type) {
    if (goalData?.goalType === type || isUpdatingGoal) return;
    
    setIsUpdatingGoal(true);
    setError("");
    try {
      const payload = {
        goalType: type,
        dailyTargets: goalPresets[type],
        weeklyWorkoutDays: goalData?.weeklyWorkoutDays || 4,
        notes: goalData?.notes || ""
      };
      
      const { data } = await apiClient.put("/goals", payload);
      if (data.success) {
        setGoalData(data.data);
      }
    } catch {
      setError("Failed to update goal. Try again.");
    } finally {
      setIsUpdatingGoal(false);
    }
  }

  if (loading) {
    return (
      <div className="pt-6 pb-4 space-y-5 animate-pulse px-1">
        <div className="glass-card-static p-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-24 h-24 bg-glass-light rounded-3xl" />
            <div className="h-5 w-36 bg-glass-light rounded-full" />
            <div className="h-3 w-48 bg-glass-light rounded-full" />
          </div>
        </div>
        <div className="h-32 bg-glass-light rounded-2xl" />
        <div className="h-48 bg-glass-light rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="pt-6 pb-4 space-y-5">
      {/* Profile Header */}
      <div className="glass-card-static p-6 text-center animate-slide-up">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-white text-2xl font-bold shadow-neon-blue mx-auto">
            {firstName.charAt(0)}
          </div>
        </div>
        <h2 className="font-display text-lg font-bold text-white mt-3">{user?.name}</h2>
        <p className="text-xs text-dark-300">{user?.email}</p>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          {[
            { label: "Workouts", value: workoutStats?.totalWorkouts || 0 },
            { label: "Active Mins", value: workoutStats?.totalDuration || 0 },
            { label: "Level", value: (workoutStats?.totalWorkouts || 0) > 10 ? "Pro" : "Rookie" },
          ].map((s) => (
            <div key={s.label} className="bg-glass-light rounded-2xl py-3 border border-white/5">
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-dark-400 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center justify-between animate-slide-up">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-300 text-lg ml-2">✕</button>
        </div>
      )}

      {/* Goal Settings */}
      <div className="glass-card-static p-5 space-y-3 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Fitness Goal</p>
          {isUpdatingGoal && <span className="text-[10px] text-neon-blue animate-pulse font-medium">Updating...</span>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "weight_loss", label: "Lose Weight", icon: "🔥" },
            { id: "muscle_gain", label: "Build Muscle", icon: "💪" },
            { id: "maintenance", label: "Stay Fit", icon: "⚡" },
          ].map((goal) => (
            <button
              key={goal.id}
              onClick={() => handleGoalChange(goal.id)}
              disabled={isUpdatingGoal}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-medium transition-all duration-300 active:scale-95 ${
                goalData?.goalType === goal.id
                  ? "border-neon-blue/50 bg-neon-blue/10 text-neon-blue shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                  : "border-white/8 bg-glass-light text-dark-200 hover:border-white/15"
              }`}
            >
              <span className="text-xl">{goal.icon}</span>
              <span>{goal.label}</span>
            </button>
          ))}
        </div>
        {goalData && (
          <div className="pt-2 flex justify-between items-center text-[10px] text-dark-400 border-t border-white/5 mt-2">
            <span>Daily: <b className="text-white">{goalData.dailyTargets?.calories} kcal</b></span>
            <span>Protein: <b className="text-white">{goalData.dailyTargets?.protein}g</b></span>
          </div>
        )}
      </div>

      {/* Settings */}
      {settingsSections.map((section, idx) => (
        <div key={section.title} className="animate-slide-up" style={{ animationDelay: `${(idx + 2) * 100}ms` }}>
          <p className="section-label mb-3">{section.title}</p>
          <div className="glass-card-static overflow-hidden divide-y divide-white/5">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-4 py-3.5">
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1 text-sm text-dark-100">{item.label}</span>
                {item.label === "Dark Mode" ? (
                  <button
                    onClick={toggleTheme}
                    className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-neon-blue to-neon-purple"
                        : "bg-dark-500"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                        theme === "dark" ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                ) : item.type === "toggle" ? (
                  <button
                    onClick={() => handleToggle(item.label)}
                    className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
                      toggles[item.label]
                        ? "bg-gradient-to-r from-neon-blue to-neon-purple"
                        : "bg-dark-500"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                        toggles[item.label] ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-dark-400">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Sign Out */}
      <button
        onClick={handleLogout}
        className="w-full py-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-bold transition-all hover:bg-red-500/15 active:scale-[0.98] animate-slide-up"
      >
        Sign Out
      </button>

      {/* App version */}
      <p className="text-center text-[10px] text-dark-500 pb-4">
        NutriSnap v2.1.0 ⚡
      </p>
    </div>
  );
}
