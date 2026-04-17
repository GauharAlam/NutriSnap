import { useEffect, useRef, useState } from "react";
import { apiClient } from "../lib/api/client";

/* ─── Mini Line Chart ─── */
function MiniChart({ data, color = "#00d4ff", height = 80 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const max = Math.max(...data, 1); // Avoid div by zero
    const min = Math.min(...data, 0); // floor to 0
    const MathMaxMinDiff = max - min;
    const range = MathMaxMinDiff === 0 ? 1 : MathMaxMinDiff;
    const padding = 10;

    const points = data.map((v, i) => ({
      x: padding + (i / Math.max(data.length - 1, 1)) * (w - padding * 2),
      y: padding + (1 - (v - min) / range) * (h - padding * 2),
    }));

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, color + "30");
    gradient.addColorStop(1, color + "00");

    ctx.beginPath();
    ctx.moveTo(points[0].x, h);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const cp1x = (points[i - 1].x + points[i].x) / 2;
      const cp1y = points[i - 1].y;
      const cp2x = cp1x;
      const cp2y = points[i].y;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dot at last point
    if (points.length > 0) {
      const last = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(last.x, last.y, 7, 0, Math.PI * 2);
      ctx.strokeStyle = color + "40";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [data, color]);

  return <canvas ref={canvasRef} className="w-full" style={{ height }} />;
}

export function ProgressPage() {
  const [weeklyData, setWeeklyData] = useState(null);
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0,
    totalDuration: 0,
    totalCalories: 0,
    totalSets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [progressRes, workoutRes] = await Promise.all([
          apiClient.get("/progress/weekly"),
          apiClient.get("/workouts")
        ]);
        
        if (progressRes.data && progressRes.data.success) {
          setWeeklyData(progressRes.data.data);
        }
        if (workoutRes.data && workoutRes.data.success) {
          setWorkoutStats(workoutRes.data.data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch progress stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading || !weeklyData) {
    return (
      <div className="pt-6 pb-4 space-y-6 animate-pulse">
         <div className="h-40 bg-glass-light rounded-3xl mx-1" />
         <div className="h-32 bg-glass-light rounded-2xl mx-1" />
         <div className="grid grid-cols-2 gap-3 mx-1">
          <div className="h-24 bg-glass-light rounded-2xl"></div>
          <div className="h-24 bg-glass-light rounded-2xl"></div>
         </div>
      </div>
    );
  }

  // Derive charts
  const { days, averages, totals } = weeklyData;
  const calorieArray = days.map(d => d.summary.calories);
  const proteinArray = days.map(d => d.summary.protein);
  
  // Quick Streak calc
  const loggedDays = days.filter(d => d.summary.calories > 0).length;
  // Simplified weekly visual boxes
  const weeklyVisuals = days.map(d => {
     const dateObj = new Date(d.date);
     const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
     const isActive = d.summary.calories > 0;
     const isOptimized = d.summary.calories > (weeklyData.target.calories * 0.8) && d.summary.calories < (weeklyData.target.calories * 1.2);
     return {
       day: dayName,
       active: isActive,
       color: isActive ? (isOptimized ? "bg-neon-green" : "bg-neon-orange") : "bg-dark-600"
     }
  });

  return (
    <div className="pt-6 pb-4 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <p className="section-label">Analytics</p>
        <h1 className="section-title mt-1">Your Progress</h1>
      </div>

      {/* Week Pulse Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neon-orange/20 via-neon-pink/10 to-transparent border border-neon-orange/20 p-5 animate-slide-up delay-100">
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-neon-orange/10 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs text-dark-300 font-medium">Weekly Adherence</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold text-white font-display">{weeklyData.adherenceDays || loggedDays}</span>
              <span className="text-sm text-dark-300">/ 7 days</span>
            </div>
            <p className="text-xs text-dark-400 mt-1">{loggedDays} days logged this week</p>
          </div>
          <div className="text-5xl animate-bounce-subtle">📈</div>
        </div>
        {/* Weekly dots */}
        <div className="flex gap-1.5 mt-4">
          {weeklyVisuals.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-2 rounded-full ${day.color}`} />
              <span className="text-[9px] text-dark-400">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calorie Intake Chart */}
      <div className="glass-card-static p-5 space-y-3 animate-slide-up delay-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Calorie Trend</p>
            <p className="text-xs text-dark-300">This week</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-neon-orange">{averages.calories || 0}</p>
            <p className="text-[10px] text-dark-300">avg/day</p>
          </div>
        </div>
        <MiniChart data={calorieArray.length > 0 ? calorieArray : [0]} color="#f97316" height={80} />
      </div>

      {/* Protein Intake Trend */}
      <div className="glass-card-static p-5 space-y-3 animate-slide-up delay-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Protein Intake Trend</p>
            <p className="text-xs text-dark-300">This week</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-neon-blue">{averages.protein || 0}g</p>
            <p className="text-[10px] text-neon-blue">avg/day</p>
          </div>
        </div>
        <MiniChart data={proteinArray.length > 0 ? proteinArray : [0]} color="#00d4ff" height={80} />
      </div>

      {/* Weekly Totals Dashboard */}
      <div className="animate-slide-up delay-300">
        <p className="section-label mb-3">Overall Activity summary</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Workouts", value: workoutStats.totalWorkouts || "0", icon: "🏋️", delta: "Since signup", deltaColor: "text-neon-green" },
            { label: "Total Calories", value: workoutStats.totalCalories || totals.calories || "0", icon: "🔥", delta: "Burned", deltaColor: "text-neon-orange" },
            { label: "Total Minutes", value: `${workoutStats.totalDuration}m`, icon: "⏱", delta: "Trained", deltaColor: "text-neon-purple" },
            { label: "Total Sets", value: workoutStats.totalSets || "0", icon: "💪", delta: "Completed", deltaColor: "text-neon-teal" },
          ].map((card) => (
            <div key={card.label} className="glass-card-sm p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">{card.icon}</span>
              </div>
              <p className="text-xl font-bold text-white">{card.value}</p>
              <p className="text-xs text-dark-300">{card.label}</p>
              <p className={`text-[10px] font-medium ${card.deltaColor}`}>{card.delta}</p>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
