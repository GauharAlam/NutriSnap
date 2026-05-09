import { useCallback, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ErrorState } from "../components/ui/StatusState";
import { apiClient } from "../lib/api/client";

export function ExerciseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPlan = useCallback(async function fetchPlan() {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiClient.get(`/workout-plans/${id}`);
      if (data && data.success) {
        setExercise(data.data);
      } else {
        setError("Workout plan could not be found.");
      }
    } catch {
      setError("Workout plan could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const [activeExercise, setActiveExercise] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const intervalRef = useRef(null);

  const currentEx = exercise?.exercises?.[activeExercise];

  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((s) => {
          if (s <= 1) {
            setIsTimerRunning(false);
            clearInterval(intervalRef.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isTimerRunning, timerSeconds]);

  function startRestTimer() {
    if (!currentEx?.rest) return;
    setTimerSeconds(currentEx.rest);
    setIsTimerRunning(true);
  }

  function toggleSet(exIdx, setIdx) {
    const key = `${exIdx}-${setIdx}`;
    setCompletedSets((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const totalSets = exercise?.exercises?.reduce((a, e) => a + e.sets, 0) || 0;
  const doneSets = Object.values(completedSets).filter(Boolean).length;
  const isComplete = doneSets === totalSets && totalSets > 0;

  async function handleComplete() {
    if (!isComplete || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      await apiClient.post("/workouts", {
        title: exercise.title,
        category: exercise.category,
        durationMinutes: parseInt(exercise.duration) || 45,
        caloriesBurned: exercise.calories,
        totalSets: doneSets
      });
      navigate("/progress");
    } catch {
      setError("Workout could not be logged. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="pt-20 text-center animate-pulse">
        <p className="text-dark-300">Loading workout...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="pt-20">
        <ErrorState
          title="Workout unavailable"
          message={error || "This workout is no longer available."}
          actionLabel="Retry"
          onAction={fetchPlan}
        />
        <button onClick={() => navigate(-1)} className="btn-ghost mt-4 w-full">Go Back</button>
      </div>
    );
  }

  return (
      <div className="pt-4 pb-4 space-y-5">
      {error && (
        <ErrorState compact title="Action needed" message={error} actionLabel="Dismiss" onAction={() => setError("")} />
      )}

      {/* Back + Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-glass-white border border-white/8 flex items-center justify-center text-dark-100 hover:bg-glass-light transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-xs text-dark-300 font-medium">{exercise.category}</p>
          <h1 className="font-display text-xl font-bold text-white truncate">{exercise.title}</h1>
        </div>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neon-blue/15 via-neon-purple/10 to-transparent border border-neon-blue/15 p-5 animate-slide-up">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-neon-blue/8 blur-3xl" />

        <div className="relative z-10 space-y-4">
          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-dark-200">
            <span className="flex items-center gap-1">⏱ {exercise.duration}</span>
            <span className="flex items-center gap-1">🔥 {exercise.calories} cal</span>
            <span className={`font-semibold px-2 py-0.5 rounded-full ${
              exercise.difficulty === "Beginner" ? "text-neon-green bg-neon-green/10" :
              exercise.difficulty === "Intermediate" ? "text-neon-blue bg-neon-blue/10" :
              "text-neon-purple bg-neon-purple/10"
            }`}>{exercise.difficulty}</span>
          </div>

          {/* Muscle tags */}
          <div className="flex gap-2">
            {exercise.muscles.map((m) => (
              <span key={m} className="chip text-xs py-1 px-3">{m}</span>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-dark-200 leading-relaxed">{exercise.description}</p>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-dark-300">Overall Progress</span>
              <span className="text-neon-blue font-semibold">{doneSets}/{totalSets} sets</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill bg-gradient-to-r from-neon-blue to-neon-purple" style={{ width: totalSets ? `${(doneSets / totalSets) * 100}%` : "0%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Rest Timer */}
      {(isTimerRunning || timerSeconds > 0) && (
        <div className="glass-card-static p-4 flex items-center justify-between animate-scale-in">
          <div>
            <p className="text-xs text-dark-300">Rest Timer</p>
            <p className="text-2xl font-bold text-neon-blue font-display">
              {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, "0")}
            </p>
          </div>
          <button
            onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }}
            className="btn-ghost text-xs py-2 px-4"
          >
            Skip
          </button>
        </div>
      )}

      {/* Exercise List */}
      <div className="space-y-3">
        <p className="section-label">Exercises ({exercise.exercises.length})</p>
        {exercise.exercises.map((ex, exIdx) => (
          <div
            key={exIdx}
            className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
              activeExercise === exIdx
                ? "border-neon-blue/30 bg-gradient-to-br from-neon-blue/8 to-transparent"
                : "border-white/6 bg-glass-white"
            }`}
          >
            {/* Exercise header */}
            <button
              onClick={() => setActiveExercise(exIdx)}
              className="w-full p-4 flex items-center gap-3 text-left"
            >
              <span className="text-2xl w-10 text-center flex-shrink-0">{ex.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{ex.name}</p>
                <p className="text-xs text-dark-300">
                  {ex.sets} sets × {ex.reps || "Failure"} reps • {ex.rest}s rest
                </p>
              </div>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`text-dark-300 transition-transform duration-300 ${activeExercise === exIdx ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Expanded content */}
            {activeExercise === exIdx && (
              <div className="px-4 pb-4 space-y-4 animate-slide-down">
                {/* Instructions */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-dark-200 uppercase tracking-wider">Instructions</p>
                  {ex.instructions.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-neon-blue/15 text-neon-blue text-[10px] flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-dark-200 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Set tracking */}
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: ex.sets }).map((_, setIdx) => {
                    const key = `${exIdx}-${setIdx}`;
                    const done = completedSets[key];
                    return (
                      <button
                        key={setIdx}
                        onClick={() => toggleSet(exIdx, setIdx)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all duration-300 ${
                          done
                            ? "bg-neon-green/20 text-neon-green border border-neon-green/30"
                            : "bg-glass-white text-dark-200 border border-white/8 hover:border-neon-blue/30"
                        }`}
                      >
                        {done ? "✓" : `S${setIdx + 1}`}
                      </button>
                    );
                  })}
                </div>

                {/* Rest Timer Button */}
                <button
                  onClick={startRestTimer}
                  className="btn-ghost w-full text-sm py-3 flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Start {ex.rest}s Rest Timer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Start/Complete Workout Button */}
      <button 
        onClick={isComplete ? handleComplete : undefined}
        disabled={isSubmitting || !isComplete}
        className={`w-full text-center sticky bottom-20 z-30 transition-all duration-300 disabled:cursor-not-allowed ${isComplete ? 'btn-gradient animate-pulse-glow' : 'glass-card-static py-4 text-dark-200'}`}
      >
        <span>
          {isSubmitting ? "Logging..." :
           isComplete ? "Complete Session 🎉" :
           doneSets > 0 ? `Continue (${doneSets}/${totalSets} sets)` : 
           "Start Workout 🚀"}
        </span>
      </button>
    </div>
  );
}
