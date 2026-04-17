import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

const features = [
  {
    title: "AI Meal Scanning",
    description: "Scan any meal with your camera. Our Gemini-powered AI detects food and estimates calories & macros instantly.",
    icon: "📸",
  },
  {
    title: "Smart Progress",
    description: "Visual charts and analytics that track your consistency. See your weekly averages and macro adherence at a glance.",
    icon: "📊",
  },
  {
    title: "Workout Programs",
    description: "Expert-curated workout plans for weight loss, muscle gain, or pure strength. Follow your journey step-by-step.",
    icon: "💪",
  },
  {
    title: "Dynamic Goals",
    description: "Macros that move with you. Choose your objective and let the system automatically recalibrate your daily targets.",
    icon: "🎯",
  },
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-dark-950 -mx-4 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-10 px-6">
        {/* Background Image with Blur/Gradients */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url(/images/landing-hero.png)",
            filter: "brightness(0.3) saturate(1.2)" 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950/40 via-dark-950/80 to-dark-950" />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl text-center space-y-6 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-bold tracking-widest uppercase mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue"></span>
            </span>
            Powered by Gemini AI
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight">
            Master Your <br />
            <span className="text-gradient">Nutrition & Fitness</span>
          </h1>
          
          <p className="text-lg text-dark-200 leading-relaxed max-w-lg mx-auto">
            The ultimate AI-powered companion for tracking meals, workouts, and progress with cinematic precision.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="btn-gradient w-full sm:w-auto px-10 py-4 shadow-neon-blue"
            >
              <span>{isAuthenticated ? "Enter Dashboard" : "Get Started Now"}</span>
            </Link>
            <Link
              to="/preview"
              className="btn-ghost w-full sm:w-auto px-10 py-4"
            >
              Explore Features
            </Link>
          </div>
        </div>
        
        {/* Floating Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white/30" strokeWidth="2">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold text-white">Experience the Future</h2>
          <p className="text-dark-300">Built for athletes who demand precision and beauty.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={feature.title}
              className={`glass-card p-8 space-y-4 animate-slide-up`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-glass-light flex items-center justify-center text-3xl mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-dark-300 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="relative z-10 px-6 py-20 bg-dark-900 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-neon-purple/5 blur-[120px]" />
        
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
          {[
            { label: "Active Users", value: "10k+" },
            { label: "Meals Logged", value: "2M+" },
            { label: "AI Scans", value: "99.9%" },
            { label: "Goal Success", value: "85%" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-3xl font-bold text-gradient">{stat.value}</p>
              <p className="text-[10px] text-dark-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative z-10 px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto glass-card-static p-12 space-y-8 border-neon-purple/20">
          <h2 className="text-3xl font-bold text-white">Ready to Forge Your Future?</h2>
          <p className="text-dark-300">Join thousands of others tracking with pure intelligence.</p>
          <Link
            to="/login"
            className="btn-gradient inline-flex px-12 py-4"
          >
            <span>Create Free Account</span>
          </Link>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="px-6 py-10 border-t border-white/5 text-center">
        <p className="text-[10px] text-dark-500 tracking-[0.3em] uppercase">
          FitForge © 2026 — The Premium AI Fitness Experience
        </p>
      </footer>
    </div>
  );
}
