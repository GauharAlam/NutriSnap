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
    } catch (err) {
      setError("Failed to update goal");
    } finally {
      setIsUpdatingGoal(false);
    }
  }

  if (loading) {
    return (
      <div className="pt-6 pb-4 space-y-6 animate-pulse px-1">
        <div className="h-48 bg-glass-light rounded-3xl" />
        <div className="h-32 bg-glass-light rounded-2xl" />
        <div className="h-64 bg-glass-light rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="pt-6 pb-4 space-y-6">
      {/* Profile Header */}
      <div className="glass-card-static p-6 text-center animate-slide-up">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-white text-3xl font-bold shadow-neon-blue mx-auto">
            {firstName.charAt(0)}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-dark-700 border border-white/10 flex items-center justify-center text-xs hover:bg-dark-600 transition-colors">
            ✏️
          </button>
        </div>
        <h2 className="font-display text-xl font-bold text-white mt-4">{user?.name}</h2>
        <p className="text-sm text-dark-300">{user?.email}</p>

        {/* Quick stats - REAL DATA */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: "Workouts", value: workoutStats?.totalWorkouts || 0 },
            { label: "Active Mins", value: workoutStats?.totalDuration || 0 },
            { label: "Level", value: (workoutStats?.totalWorkouts || 0) > 10 ? "Pro" : "Rookie" },
          ].map((s) => (
            <div key={s.label} className="bg-glass-white rounded-2xl py-3 border border-white/5">
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-dark-400 uppercase tracking-tighter">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Settings - REAL DATA SYNC */}
      <div className="glass-card-static p-5 space-y-3 animate-slide-up delay-100">
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
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-medium transition-all duration-300 ${
                goalData?.goalType === goal.id
                  ? "border-neon-blue/50 bg-neon-blue/10 text-neon-blue shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                  : "border-white/8 bg-glass-white text-dark-200 hover:border-white/15"
              }`}
            >
              <span className="text-xl">{goal.icon}</span>
              <span>{goal.label}</span>
            </button>
          ))}
        </div>
        {goalData && (
          <div className="pt-2 flex justify-between items-center text-[10px] text-dark-400 border-t border-white/5 mt-2">
            <span>Daily Target: <b className="text-white">{goalData.dailyTargets?.calories} kcal</b></span>
            <span>Protein: <b className="text-white">{goalData.dailyTargets?.protein}g</b></span>
          </div>
        )}
      </div>

      {/* Premium Card */}
      <div className="relative overflow-hidden rounded-3xl border border-neon-purple/30 p-5 animate-slide-up delay-200">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/15 via-neon-blue/10 to-transparent" />
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-neon-purple/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">FitForge Premium</p>
            <p className="text-xs text-dark-300">AI coaching, advanced analytics & more</p>
          </div>
        </div>
        <button className="btn-gradient w-full mt-4 text-sm font-bold">
          Upgrade to Premium
        </button>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section, idx) => (
        <div key={section.title} className={`animate-slide-up delay-${(idx + 3) * 100}`}>
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
        className="w-full py-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-bold transition-all hover:bg-red-500/15 animate-slide-up"
      >
        Sign Out
      </button>

      {/* App version */}
      <p className="text-center text-[10px] text-dark-500 pb-4">
        FitForge v2.1.0 — 100% Database Driven ⚡
      </p>
    </div>
  );
}
