import { useState } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    image: "/images/onboarding-workout.png",
    title: "Personalized Workouts",
    description:
      "AI-crafted training plans tailored to your fitness level, goals, and schedule. Every rep counts.",
    accent: "from-neon-blue to-neon-purple",
  },
  {
    image: "/images/onboarding-progress.png",
    title: "Track Your Progress",
    description:
      "Visualize gains with stunning charts, streak badges, and body transformation timelines.",
    accent: "from-neon-purple to-neon-pink",
  },
  {
    image: "/images/onboarding-nutrition.png",
    title: "Nutrition Guidance",
    description:
      "Smart meal plans with macro tracking. Fuel your body with precision for maximum results.",
    accent: "from-neon-green to-neon-teal",
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  function handleNext() {
    if (current < slides.length - 1) {
      setDirection(1);
      setCurrent((c) => c + 1);
    } else {
      finishOnboarding();
    }
  }

  function handleSkip() {
    finishOnboarding();
  }

  function finishOnboarding() {
    localStorage.setItem("fitforge_onboarded", "true");
    navigate("/login", { replace: true });
  }

  function goToSlide(index) {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }

  const slide = slides[current];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-dark-950">
      {/* Skip button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleSkip}
          className="text-sm font-medium text-dark-200 hover:text-white transition-colors px-4 py-2 rounded-full bg-glass-white"
        >
          Skip
        </button>
      </div>

      {/* Image section */}
      <div className="relative flex-1 flex items-center justify-center px-8 pt-16 pb-4 overflow-hidden">
        {/* Background accent glow */}
        <div
          className={`absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br ${slide.accent} opacity-10 blur-3xl transition-all duration-700`}
        />

        <div
          key={current}
          className="relative w-full max-w-xs animate-scale-in"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full rounded-4xl shadow-glass"
            draggable={false}
          />
          {/* Decorative floating dots */}
          <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 animate-float" />
          <div className="absolute -bottom-6 -left-3 w-6 h-6 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 animate-float delay-300" />
        </div>
      </div>

      {/* Content section */}
      <div className="px-8 pb-10 space-y-6">
        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 bg-gradient-to-r from-neon-blue to-neon-purple"
                  : "w-2 bg-dark-500 hover:bg-dark-400"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Text */}
        <div key={`text-${current}`} className="text-center space-y-3 animate-slide-up">
          <h2 className="font-display text-2xl font-bold text-white">
            {slide.title}
          </h2>
          <p className="text-sm leading-relaxed text-dark-200 max-w-sm mx-auto">
            {slide.description}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button onClick={handleNext} className="btn-gradient w-full text-center">
            <span>{current < slides.length - 1 ? "Next" : "Get Started"}</span>
          </button>

          {current > 0 && (
            <button
              onClick={() => goToSlide(current - 1)}
              className="btn-ghost w-full text-center text-sm"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
