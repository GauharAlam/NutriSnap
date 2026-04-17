import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/api/client";

const categories = [
  {
    id: "fat-loss",
    name: "Fat Loss",
    icon: "🔥",
    workouts: 12,
    gradient: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/20",
    badge: "Popular",
    description: "High-intensity programs to shred fat fast",
  },
  {
    id: "muscle-gain",
    name: "Muscle Gain",
    icon: "💪",
    workouts: 15,
    gradient: "from-neon-blue/20 to-neon-purple/20",
    border: "border-neon-blue/20",
    badge: "Pro",
    description: "Hypertrophy-focused training for mass",
  },
  {
    id: "strength",
    name: "Strength",
    icon: "🏋️",
    workouts: 10,
    gradient: "from-neon-purple/20 to-pink-500/20",
    border: "border-neon-purple/20",
    badge: null,
    description: "Compound lifts for raw power",
  },
  {
    id: "yoga",
    name: "Yoga",
    icon: "🧘",
    workouts: 8,
    gradient: "from-neon-green/20 to-neon-teal/20",
    border: "border-neon-green/20",
    badge: "New",
    description: "Flexibility, balance, and mindfulness",
  },
  {
    id: "cardio",
    name: "Cardio",
    icon: "🏃",
    workouts: 9,
    gradient: "from-neon-teal/20 to-cyan-500/20",
    border: "border-neon-teal/20",
    badge: null,
    description: "Endurance and heart health boosters",
  },
  {
    id: "hiit",
    name: "HIIT",
    icon: "⚡",
    workouts: 7,
    gradient: "from-yellow-500/20 to-orange-500/20",
    border: "border-yellow-500/20",
    badge: "Trending",
    description: "Maximum results in minimum time",
  },
];

const filters = ["All", "Fat Loss", "Muscle Gain", "Strength", "Yoga", "Cardio", "HIIT"];

const difficultyColors = {
  Beginner: "text-neon-green bg-neon-green/10",
  Intermediate: "text-neon-blue bg-neon-blue/10",
  Advanced: "text-neon-purple bg-neon-purple/10",
};

const categoryToGradient = {
  "Fat Loss": "🔥",
  "Muscle Gain": "💪",
  "Strength": "🏋️",
  "Yoga": "🧘",
  "Cardio": "🏃",
  "HIIT": "⚡",
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
        if (data && data.success) {
          setWorkoutPlans(data.data);
        }
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
    const matchesFilter =
      activeFilter === "All" || plan.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pt-6 pb-4 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <p className="section-label">Explore</p>
        <h1 className="section-title mt-1">Workout Plans</h1>
      </div>

      {/* Search */}
      <div className="relative animate-slide-up delay-100">
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
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 animate-slide-up delay-200">
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
      <div className="animate-slide-up delay-200">
        <p className="section-label mb-3">Categories</p>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.name)}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.gradient} border ${cat.border} p-3 text-center transition-all duration-300 hover:scale-[1.03]`}
            >
              {cat.badge && (
                <span className="absolute top-1.5 right-1.5 text-[8px] font-bold text-neon-blue bg-neon-blue/15 px-1.5 py-0.5 rounded-full">
                  {cat.badge}
                </span>
              )}
              <span className="text-2xl block mb-1">{cat.icon}</span>
              <p className="text-xs font-semibold text-white">{cat.name}</p>
              <p className="text-[10px] text-dark-300">{cat.workouts} plans</p>
            </button>
          ))}
        </div>
      </div>

      {/* Workout Plan Cards */}
      <div className="space-y-3 animate-slide-up delay-300">
        <p className="section-label">{activeFilter === "All" ? "All Plans" : activeFilter}</p>
        {loading ? (
          <div className="glass-card-static p-8 text-center text-dark-300 text-sm animate-pulse">Loading plans...</div>
        ) : filteredPlans.length === 0 ? (
          <div className="glass-card-static p-8 text-center">
            <p className="text-dark-300 text-sm">No workouts found</p>
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <Link
              key={plan.slug}
              to={`/exercise/${plan.slug}`}
              className="glass-card-sm p-4 flex items-center gap-4 block"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-blue/15 to-neon-purple/15 flex items-center justify-center text-2xl flex-shrink-0">
                {categoryToGradient[plan.category] || "🔥"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{plan.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-dark-300">
                  <span>⏱ {plan.duration}</span>
                  <span>•</span>
                  <span>🔥 {plan.calories}</span>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${difficultyColors[plan.difficulty]}`}>
                {plan.difficulty}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
