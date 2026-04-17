import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { apiClient } from "../lib/api/client";

/* ─── SVG Circle Progress ─── */
function CircleProgress({ value, max, size = 100, strokeWidth = 8, color = "#00d4ff" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="stat-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white">{Math.round(pct * 100)}%</span>
        <span className="text-[10px] text-dark-300">of {max}</span>
      </div>
    </div>
  );
}

/* ─── Progress Bar ─── */
function ProgressBar({ value, max, color = "from-neon-blue to-neon-purple", label, unit = "" }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-dark-200">{label}</span>
        <span className="text-dark-100 font-semibold">{value}{unit} / {max}{unit}</span>
      </div>
      <div className="progress-bar">
        <div className={`progress-fill bg-gradient-to-r ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ─── Water Drop ─── */
function WaterDrop({ filled, onClick }) {
  return (
    <button onClick={onClick} className="transition-all duration-300 hover:scale-110">
      <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
        <path
          d="M14 2C14 2 2 14 2 21a12 12 0 0 0 24 0C26 14 14 2 14 2z"
          fill={filled ? "url(#waterGrad)" : "rgba(255,255,255,0.06)"}
          stroke={filled ? "#00d4ff" : "rgba(255,255,255,0.12)"}
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient id="waterGrad" x1="14" y1="2" x2="14" y2="33" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00d4ff" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
    </button>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [waterCount, setWaterCount] = useState(5);
  const [greeting, setGreeting] = useState("Good morning");
  const [dailyProgress, setDailyProgress] = useState(null);
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    async function fetchData() {
      try {
        const [progressRes, workoutRes] = await Promise.all([
          apiClient.get("/progress/daily"),
          apiClient.get("/workouts")
        ]);
        
        if (progressRes.data.success) setDailyProgress(progressRes.data.data);
        if (workoutRes.data.success) setWorkoutData(workoutRes.data.data);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const firstName = user?.name?.split(" ")[0] || "Athlete";

  // If loading, show skeletons
  if (loading) {
    return (
      <div className="pt-6 pb-4 space-y-6 animate-pulse">
        <div className="h-16 bg-glass-light rounded-2xl mx-1"></div>
        <div className="h-48 bg-glass-light rounded-3xl mx-1"></div>
        <div className="grid grid-cols-2 gap-3 mx-1">
          <div className="h-24 bg-glass-light rounded-2xl"></div>
          <div className="h-24 bg-glass-light rounded-2xl"></div>
          <div className="h-24 bg-glass-light rounded-2xl"></div>
          <div className="h-24 bg-glass-light rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const latestWorkout = workoutData?.workouts?.[0] || null;

  return (
    <div className="pt-6 pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-dark-300 uppercase tracking-widest">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <h1 className="font-display text-2xl font-bold text-white">
            {greeting}, <span className="text-gradient">{firstName}</span>
          </h1>
        </div>
        <Link to="/profile" className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-white font-bold text-lg shadow-neon-blue">
            {firstName.charAt(0)}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-neon-green border-2 border-dark-900" />
        </Link>
      </div>

      {/* Today's Workout Card */}
      <div className="animate-slide-up delay-100">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neon-blue/20 via-neon-purple/10 to-transparent border border-neon-blue/20 p-5">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-neon-blue/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-neon-purple/10 blur-2xl pointer-events-none" />

          {latestWorkout ? (
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-blue/15 text-neon-blue text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
                    Latest Workout
                  </div>
                  <h2 className="font-display text-xl font-bold text-white mt-2">
                    {latestWorkout.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-dark-200 mt-1">
                    <span>⏱ {latestWorkout.durationMinutes}m</span>
                    <span>🏋️ {latestWorkout.totalSets} sets</span>
                    <span>🔥 {latestWorkout.caloriesBurned} cal</span>
                  </div>
                </div>
                <CircleProgress value={100} max={100} size={70} strokeWidth={6} color="#00d4ff" />
              </div>

              {/* Progress bar */}
              <div className="mt-4 progress-bar">
                <div
                  className="progress-fill bg-gradient-to-r from-neon-blue to-neon-purple"
                  style={{ width: `100%` }}
                />
              </div>

              <Link
                to="/workouts"
                className="mt-4 btn-gradient w-full block text-center text-sm"
              >
                <span>Continue Training →</span>
              </Link>
            </div>
          ) : (
            <div className="relative z-10 text-center py-4">
              <h2 className="font-display text-xl font-bold text-white">No workouts yet</h2>
              <p className="text-sm text-dark-200 mt-1 mb-4">Time to crush your first session!</p>
              <Link to="/workouts" className="btn-gradient w-full block text-center text-sm">
                <span>Start a Workout →</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="animate-slide-up delay-200">
        <p className="section-label mb-3">Your Progress Stats</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Calories Logged", value: dailyProgress?.summary?.calories || 0, target: dailyProgress?.target?.calories || 2400, icon: "🔥", color: "from-neon-orange to-neon-pink" },
            { label: "Total Sets", value: workoutData?.stats?.totalSets || 0, target: "N/A", icon: "💪", color: "from-neon-blue to-neon-purple" },
            { label: "Workouts", value: workoutData?.stats?.totalWorkouts || 0, target: "Goal", icon: "🏆", color: "from-neon-green to-neon-teal" },
            { label: "Active Mins", value: workoutData?.stats?.totalDuration || 0, target: "Total", icon: "⏱️", color: "from-neon-purple to-neon-pink" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card-sm p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">{stat.icon}</span>
                <span className="text-[10px] font-medium text-dark-300">
                  {stat.target !== "N/A" && stat.target !== "Total" && stat.target !== "Goal" ? stat.target : ""}
                </span>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-dark-300">{stat.label}</p>
              <div className="progress-bar !h-1.5">
                <div
                  className={`progress-fill bg-gradient-to-r ${stat.color} !h-1.5`}
                  style={{ width: stat.target !== "N/A" && stat.target !== "Total" && stat.target !== "Goal" ? `${Math.min((stat.value / stat.target) * 100, 100)}%` : '100%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calories & Water Row */}
      <div className="grid grid-cols-5 gap-3 animate-slide-up delay-300">
        {/* Calories Circle */}
        <div className="col-span-2 glass-card-static p-4 flex flex-col items-center justify-center text-center">
          <CircleProgress 
            value={dailyProgress?.summary?.calories || 0} 
            max={dailyProgress?.target?.calories || 2400} 
            size={90} 
            strokeWidth={7} 
            color="#f97316" 
          />
          <p className="text-xs text-dark-300 mt-2">Calories</p>
        </div>

        {/* Water Tracker */}
        <div className="col-span-3 glass-card-static p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-white">Water Intake</p>
              <p className="text-xs text-dark-300">{waterCount} of 8 glasses</p>
            </div>
            <span className="text-2xl">💧</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <WaterDrop key={i} filled={i < waterCount} onClick={() => setWaterCount(i + 1)} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Exercises / Workouts */}
      <div className="animate-slide-up delay-400">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">Recent Activity</p>
          <Link to="/workouts" className="text-xs text-neon-blue font-medium">Log Training</Link>
        </div>
        <div className="space-y-2">
          {workoutData?.workouts?.slice(0, 3).map((w, i) => (
             <div key={w._id || i} className="glass-card-sm p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <span className="text-2xl">{w.category === 'Fat Loss' ? '🔥' : w.category === 'Strength' ? '💪' : '🏋️'}</span>
                 <div>
                   <p className="text-sm font-semibold text-white">{w.title}</p>
                   <p className="text-xs text-dark-300 capitalize">{w.category}</p>
                 </div>
               </div>
               <span className="text-xs font-medium text-neon-blue bg-neon-blue/10 px-3 py-1 rounded-full">
                 {w.durationMinutes}m
               </span>
             </div>
          ))}
          {(!workoutData?.workouts || workoutData.workouts.length === 0) && (
             <p className="text-xs text-dark-300 text-center py-4 bg-glass-light rounded-2xl">No recent activity. Start sweating!</p>
          )}
        </div>
      </div>

      {/* AI Trainer Widget */}
      <div className="animate-slide-up delay-500">
        <div className="glass-card-static p-5 border-neon-purple/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8" />
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Personal Trainer</p>
              <p className="text-xs text-dark-300">Get personalized advice</p>
            </div>
          </div>
          <div className="bg-glass-white rounded-2xl p-3 mb-3">
            <p className="text-xs text-dark-100 leading-relaxed">
              {latestWorkout ? `"Amazing job on completing ${latestWorkout.title}! You've burned ${latestWorkout.caloriesBurned} calories. Stay hydrated and rest well today!"` : `"Welcome to NutriSnap! Your personal AI trainer is here. Let's start by knocking out your first workout today! 💪"`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
