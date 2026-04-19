import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/api/client";

const categories = [
  { id: "fat-loss", name: "Fat Loss", icon: "🔥", gradient: "from-orange-500/20 to-red-500/20", border: "border-orange-500/20", badge: "Popular" },
  { id: "muscle-gain", name: "Muscle Gain", icon: "💪", gradient: "from-neon-blue/20 to-neon-purple/20", border: "border-neon-blue/20", badge: "Pro" },
  { id: "strength", name: "Strength", icon: "🏋️", gradient: "from-neon-purple/20 to-pink-500/20", border: "border-neon-purple/20" },
  { id: "yoga", name: "Yoga", icon: "🧘", gradient: "from-neon-green/20 to-neon-teal/20", border: "border-neon-green/20", badge: "New" },
  { id: "cardio", name: "Cardio", icon: "🏃", gradient: "from-neon-teal/20 to-cyan-500/20", border: "border-neon-teal/20" },
  { id: "hiit", name: "HIIT", icon: "⚡", gradient: "from-yellow-500/20 to-orange-500/20", border: "border-yellow-500/20", badge: "Trending" },
];

const filters = ["All", "Fat Loss", "Muscle Gain", "Strength", "Yoga", "Cardio", "HIIT"];

const difficultyColors = {
  Beginner: "text-neon-green bg-neon-green/10",
  Intermediate: "text-neon-blue bg-neon-blue/10",
  Advanced: "text-neon-purple bg-neon-purple/10",
};

const categoryIcons = {
  "Fat Loss": "🔥", "Muscle Gain": "💪", "Strength": "🏋️",
  "Yoga": "🧘", "Cardio": "🏃", "HIIT": "⚡",
};

export function WorkoutPlansPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data } = await apiClient.get("/workout-plans");
        if (data?.success) setWorkoutPlans(data.data);
      } catch (err) {
        console.error("Failed to load plans:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const filteredPlans = workoutPlans.filter((plan) => {
    const matchesSearch = plan.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "All" || plan.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="animate-fade-in">
        <p className="section-label">Explore</p>
        <h1 className="section-title mt-1">Workout Plans</h1>
      </div>

      {/* Search */}
      <div className="relative animate-slide-up" style={{ animationDelay: "100ms" }}>
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-300" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search workouts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-glass pl-11"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-300 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 animate-slide-up" style={{ animationDelay: "150ms" }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`chip ${activeFilter === f ? "active" : ""}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Category Cards */}
      <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
        <p className="section-label mb-3">Categories</p>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(activeFilter === cat.name ? "All" : cat.name)}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.gradient} border ${cat.border} p-3 text-center transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] ${
                activeFilter === cat.name ? "ring-1 ring-neon-blue/40 shadow-[0_0_15px_rgba(0,212,255,0.15)]" : ""
              }`}
            >
              {cat.badge && (
                <span className="absolute top-1.5 right-1.5 text-[8px] font-bold text-neon-blue bg-neon-blue/15 px-1.5 py-0.5 rounded-full">
                  {cat.badge}
                </span>
              )}
              <span className="text-2xl block mb-1">{cat.icon}</span>
              <p className="text-xs font-semibold text-white">{cat.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Workout Plan Cards */}
      <div className="space-y-2.5 animate-slide-up" style={{ animationDelay: "300ms" }}>
        <p className="section-label">{activeFilter === "All" ? "All Plans" : activeFilter}</p>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="glass-card-sm p-4 animate-pulse flex gap-4">
                <div className="w-14 h-14 bg-glass-light rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-glass-light rounded-full" />
                  <div className="h-3 w-1/2 bg-glass-light rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="glass-card-static p-10 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm font-semibold text-white mb-1">No workouts found</p>
            <p className="text-xs text-dark-300">
              {search ? "Try a different search term" : "No plans in this category yet"}
            </p>
            {(search || activeFilter !== "All") && (
              <button
                onClick={() => { setSearch(""); setActiveFilter("All"); }}
                className="mt-3 text-xs text-neon-blue font-semibold hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <Link
              key={plan.slug}
              to={`/exercise/${plan.slug}`}
              className="glass-card-sm p-4 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-blue/15 to-neon-purple/15 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                {categoryIcons[plan.category] || "🔥"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate group-hover:text-neon-blue transition-colors">{plan.title}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-dark-300">
                  <span>⏱ {plan.duration}</span>
                  <span className="text-dark-400">•</span>
                  <span>🔥 {plan.calories}</span>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${difficultyColors[plan.difficulty] || "text-dark-200 bg-glass-light"}`}>
                {plan.difficulty}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
