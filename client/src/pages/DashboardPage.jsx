import { useCallback, useEffect, memo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleProgress } from "../components/ui/CircleProgress";
import { EmptyState, ErrorState } from "../components/ui/StatusState";
import { WaterTracker } from "../components/ui/WaterTracker";
import { useAuth } from "../features/auth/useAuth";
import { useDailyWater } from "../features/water/useDailyWater";
import { apiClient } from "../lib/api/client";

/* ─── Quick Stat Card ─── */
const QuickStat = memo(function QuickStat({ icon, value, label, color }) {
  return (
    <div className="glass-card-sm p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        <div className={`w-2 h-2 rounded-full ${color}`} />
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-dark-300">{label}</p>
    </div>
  );
});

export function DashboardPage() {
  const { user } = useAuth();
  const { waterCount, setWaterCount, totalGlasses } = useDailyWater();
  const [greeting, setGreeting] = useState("Good morning");
  const [dailyProgress, setDailyProgress] = useState(null);
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      apiClient.get("/progress/daily"),
      apiClient.get("/workouts"),
    ]);

    const [progressResult, workoutResult] = results;
    if (progressResult.status === "fulfilled" && progressResult.value.data.success) {
      setDailyProgress(progressResult.value.data.data);
    }
    if (workoutResult.status === "fulfilled" && workoutResult.value.data.success) {
      setWorkoutData(workoutResult.value.data.data);
    }

    if (results.some((result) => result.status === "rejected")) {
      setError("Some dashboard data could not be loaded.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
    fetchData();
  }, [fetchData]);

  const firstName = user?.name?.split(" ")[0] || "Athlete";

  if (loading) {
    return (
      <div className="pt-6 pb-4 space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-glass-light rounded-full" />
            <div className="h-7 w-48 bg-glass-light rounded-full" />
          </div>
          <div className="w-12 h-12 bg-glass-light rounded-2xl" />
        </div>
        <div className="h-44 bg-glass-light rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-28 bg-glass-light rounded-2xl" />
          <div className="h-28 bg-glass-light rounded-2xl" />
          <div className="h-28 bg-glass-light rounded-2xl" />
          <div className="h-28 bg-glass-light rounded-2xl" />
        </div>
      </div>
    );
  }

  const latestWorkout = workoutData?.workouts?.[0] || null;
  const caloriesConsumed = dailyProgress?.summary?.calories || 0;
  const caloriesTarget = dailyProgress?.target?.calories || 2400;

  return (
    <div className="pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold text-dark-300 uppercase tracking-[0.15em]">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <h1 className="font-display text-[22px] font-bold text-white leading-tight">
            {greeting}, <span className="text-gradient">{firstName}</span>
          </h1>
        </div>
        <Link to="/profile" className="relative group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-white font-bold text-base shadow-neon-blue group-hover:scale-105 transition-transform">
            {firstName.charAt(0)}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-neon-green border-2 border-dark-900" />
        </Link>
      </div>

      {error && (
        <ErrorState
          compact
          title="Dashboard partially loaded"
          message={error}
          actionLabel="Refresh"
          onAction={fetchData}
        />
      )}

      {/* Today's Workout Hero Card */}
      <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neon-blue/20 via-neon-purple/10 to-transparent border border-neon-blue/20 p-5">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-neon-blue/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-neon-purple/10 blur-2xl pointer-events-none" />

          {latestWorkout ? (
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-blue/15 text-neon-blue text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
                    Latest Workout
                  </div>
                  <h2 className="font-display text-lg font-bold text-white mt-2 truncate pr-4">
                    {latestWorkout.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-dark-200 mt-1">
                    <span>⏱ {latestWorkout.durationMinutes}m</span>
                    <span>🏋️ {latestWorkout.totalSets} sets</span>
                    <span>🔥 {latestWorkout.caloriesBurned} cal</span>
                  </div>
                </div>
                <CircleProgress value={100} max={100} size={64} strokeWidth={5} color="#00d4ff" />
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
              <div className="text-4xl mb-3">💪</div>
              <h2 className="font-display text-lg font-bold text-white">Ready to train?</h2>
              <p className="text-sm text-dark-200 mt-1 mb-4">Start your first workout session!</p>
              <Link to="/workouts" className="btn-gradient w-full block text-center text-sm">
                <span>Browse Workouts →</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
        <p className="section-label mb-3">Today's Stats</p>
        <div className="grid grid-cols-2 gap-3">
          <QuickStat
            icon="🔥"
            value={caloriesConsumed}
            label="Calories Eaten"
            color="bg-neon-orange"
          />
          <QuickStat
            icon="💪"
            value={workoutData?.stats?.totalSets || 0}
            label="Total Sets"
            color="bg-neon-blue"
          />
          <QuickStat
            icon="🏆"
            value={workoutData?.stats?.totalWorkouts || 0}
            label="Workouts Done"
            color="bg-neon-green"
          />
          <QuickStat
            icon="⏱️"
            value={`${workoutData?.stats?.totalDuration || 0}m`}
            label="Active Time"
            color="bg-neon-purple"
          />
        </div>
      </div>

      {/* Calories + Water Row */}
      <div className="grid grid-cols-5 gap-3 animate-slide-up" style={{ animationDelay: "300ms" }}>
        {/* Calories Circle */}
        <div className="col-span-2 glass-card-static p-4 flex flex-col items-center justify-center text-center">
          <CircleProgress 
            value={caloriesConsumed} 
            max={caloriesTarget} 
            size={85} 
            strokeWidth={6} 
            color="#f97316"
            label="kcal"
          />
          <p className="text-[10px] text-dark-300 mt-2 font-medium">
            {caloriesTarget - caloriesConsumed > 0 ? `${caloriesTarget - caloriesConsumed} left` : "Goal hit! 🎉"}
          </p>
        </div>

        {/* Water Tracker */}
        <div className="col-span-3 glass-card-static p-4">
          <WaterTracker value={waterCount} onChange={setWaterCount} total={totalGlasses} compact />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">Recent Activity</p>
          <Link to="/workouts" className="text-xs text-neon-blue font-medium hover:text-neon-purple transition-colors">
            View All →
          </Link>
        </div>
        <div className="space-y-2">
          {workoutData?.workouts?.slice(0, 3).map((w, i) => (
             <div key={w._id || i} className="glass-card-sm p-4 flex items-center justify-between">
               <div className="flex items-center gap-3 min-w-0">
                 <div className="w-10 h-10 rounded-xl bg-glass-light flex items-center justify-center text-xl flex-shrink-0">
                   {w.category === 'Fat Loss' ? '🔥' : w.category === 'Strength' ? '💪' : '🏋️'}
                 </div>
                 <div className="min-w-0">
                   <p className="text-sm font-semibold text-white truncate">{w.title}</p>
                   <p className="text-[11px] text-dark-300 capitalize">{w.category}</p>
                 </div>
               </div>
               <span className="text-[11px] font-semibold text-neon-blue bg-neon-blue/10 px-3 py-1.5 rounded-full flex-shrink-0 ml-2">
                 {w.durationMinutes}m
               </span>
             </div>
          ))}
          {(!workoutData?.workouts || workoutData.workouts.length === 0) && (
             <EmptyState
               icon="🏃"
               title="No activity yet"
               message="Start a workout and your recent sessions will appear here."
               action={(
                 <Link to="/workouts" className="mt-3 inline-block text-xs font-semibold text-neon-blue hover:underline">
                   Explore Workouts →
                 </Link>
               )}
             />
          )}
        </div>
      </div>

      {/* AI Trainer Widget */}
      <div className="animate-slide-up" style={{ animationDelay: "500ms" }}>
        <div className="glass-card-static p-5 border-neon-purple/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8" />
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Trainer</p>
              <p className="text-[11px] text-dark-300">Personalized insight</p>
            </div>
          </div>
          <div className="bg-glass-light rounded-2xl p-3">
            <p className="text-xs text-dark-100 leading-relaxed">
              {latestWorkout 
                ? `Great job completing ${latestWorkout.title}! You burned ${latestWorkout.caloriesBurned} calories. Keep the momentum going! 💪`
                : `Welcome to NutriSnap! Your AI trainer is ready. Let's start with a workout today! 🚀`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
