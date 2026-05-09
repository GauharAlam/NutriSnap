import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

/* ─── Scroll Reveal Hook ─── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ─── RevealDiv (safe to use in .map) ─── */
function RevealDiv({ children, className = "reveal", style }) {
  const ref = useReveal();
  return <div ref={ref} className={className} style={style}>{children}</div>;
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const startTime = performance.now();
          const numTarget = parseFloat(target);

          function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(numTarget * eased));
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Floating Particle ─── */
function Particle({ size, color, top, left, delay }) {
  return (
    <div
      className="absolute rounded-full animate-float pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        top,
        left,
        animationDelay: `${delay}s`,
        opacity: 0.4,
        filter: "blur(1px)",
      }}
    />
  );
}

/* ─── Phone Mockup Component ─── */
function PhoneMockup({ children, className = "" }) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: 220 }}>
      <div className="relative rounded-[28px] border-2 border-white/10 bg-dark-900 p-2 shadow-[0_0_60px_rgba(0,212,255,0.15)]">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-dark-900 rounded-b-2xl z-20" />
        <div className="rounded-[22px] overflow-hidden bg-dark-950">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Feature Showcase Row ─── */
function FeatureShowcase({ icon, badge, title, description, features, gradient, reverse, mockupContent }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal flex flex-col gap-8 py-12 ${reverse ? "md:flex-row-reverse" : ""}`}>
      {/* Text Side */}
      <div className="flex-1 space-y-5">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${gradient} text-white text-[10px] font-bold uppercase tracking-widest`}>
          <span>{icon}</span>
          {badge}
        </div>
        <h3 className="font-display text-2xl font-bold text-white leading-tight">{title}</h3>
        <p className="text-sm text-dark-200 leading-relaxed">{description}</p>
        <div className="space-y-3 pt-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-neon-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-xs text-dark-300 leading-relaxed">{f}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Mockup Side */}
      <div className="flex-1 flex items-center justify-center">
        <PhoneMockup className="animate-float-slow">
          {mockupContent}
        </PhoneMockup>
      </div>
    </div>
  );
}

/* ─── Main Landing Page ─── */
export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    function handleScroll() {
      setScrollY(window.scrollY);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 -mx-4 overflow-x-hidden">

      {/* ════════════════════════════════════════════
          § HERO
      ════════════════════════════════════════════ */}
      <div className="relative min-h-[100vh] flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Hero Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-100"
            style={{
              backgroundImage: "url(/images/landing-hero.png)",
              filter: "brightness(0.25) saturate(1.3)",
              transform: `scale(1.1) translateY(${scrollY * 0.15}px)`,
            }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/50 via-dark-950/70 to-dark-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-purple/5" />

          {/* Orbiting elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
            <div className="animate-orbit">
              <div className="w-2 h-2 rounded-full bg-neon-blue/40" />
            </div>
            <div className="animate-orbit-reverse">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-purple/40" />
            </div>
          </div>

          {/* Floating particles */}
          <Particle size="6px" color="rgba(0,212,255,0.3)" top="15%" left="10%" delay={0} />
          <Particle size="4px" color="rgba(168,85,247,0.3)" top="25%" left="85%" delay={1.5} />
          <Particle size="8px" color="rgba(0,212,255,0.2)" top="60%" left="5%" delay={3} />
          <Particle size="5px" color="rgba(168,85,247,0.25)" top="70%" left="90%" delay={2} />
          <Particle size="3px" color="rgba(0,212,255,0.35)" top="40%" left="50%" delay={4} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-lg text-center space-y-6 px-2">
          {/* Badge */}
          <div className="animate-slide-up-landing">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-neon-blue/20 bg-neon-blue/5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue" />
              </span>
              <span className="text-neon-blue text-[11px] font-bold tracking-[0.2em] uppercase">Powered by AI</span>
            </div>
          </div>

          {/* Title */}
          <div className="animate-slide-up-landing delay-200">
            <h1 className="font-display text-[42px] leading-[1.1] font-bold text-white">
              Snap. Track.
              <br />
              <span className="text-gradient animate-gradient-x bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue">Transform.</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="animate-slide-up-landing delay-300">
            <p className="text-base text-dark-200 leading-relaxed max-w-sm mx-auto">
              The AI-powered fitness companion that turns your phone camera into a
              <span className="text-neon-blue font-medium"> nutrition expert</span> and your workouts into
              <span className="text-neon-purple font-medium"> measurable progress</span>.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-4 animate-slide-up-landing delay-400">
            <Link
              to={isAuthenticated ? "/home" : "/login"}
              className="btn-gradient w-full py-4 text-center shadow-[0_0_30px_rgba(0,212,255,0.2)] animate-pulse-glow text-base font-bold"
            >
              {isAuthenticated ? "Open Dashboard" : "Start Free — No Card Needed"}
            </Link>
            <a
              href="#features"
              className="btn-ghost w-full py-3 text-center text-sm"
            >
              See What's Inside ↓
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 pt-4 animate-fade-in-slow delay-600">
            {[
              { icon: "🔒", text: "Encrypted" },
              { icon: "⚡", text: "Real-time AI" },
              { icon: "📱", text: "Mobile-first" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-1.5 text-[10px] text-dark-400">
                <span>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in-slow delay-800">
          <span className="text-[9px] text-dark-500 uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-neon-blue animate-bounce" />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          § HOW IT WORKS
      ════════════════════════════════════════════ */}
      <div className="relative px-6 py-20" id="features">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />

        <div className="relative z-10 max-w-lg mx-auto">
          {/* Section Header */}
          <div className="text-center space-y-3 mb-12">
            <RevealDiv>
              <p className="text-[10px] text-neon-blue font-bold tracking-[0.3em] uppercase">How it works</p>
              <h2 className="font-display text-3xl font-bold text-white mt-2">
                Three steps to a<br /><span className="text-gradient">better you</span>
              </h2>
            </RevealDiv>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {[
              {
                step: "01",
                icon: "📸",
                title: "Snap Your Meal",
                desc: "Point your camera at any plate. NutriSnap's AI instantly identifies every ingredient, portion size, and nutritional breakdown.",
                color: "from-neon-blue/20 to-neon-teal/20",
                border: "border-neon-blue/20",
              },
              {
                step: "02",
                icon: "💪",
                title: "Follow Smart Plans",
                desc: "Browse expert-crafted workout programs for every goal — fat loss, muscle gain, strength training, yoga, HIIT, and cardio.",
                color: "from-neon-purple/20 to-neon-pink/20",
                border: "border-neon-purple/20",
              },
              {
                step: "03",
                icon: "📊",
                title: "Track & Conquer",
                desc: "Watch your progress unfold with beautiful charts, streak tracking, macro adherence scores, and AI-powered insights.",
                color: "from-neon-green/20 to-neon-teal/20",
                border: "border-neon-green/20",
              },
            ].map((s, i) => (
                <RevealDiv key={s.step} className="reveal" style={{ transitionDelay: `${i * 150}ms` }}>
                  <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${s.color} border ${s.border} p-6`}>
                    {/* Step number watermark */}
                    <span className="absolute -top-4 -right-2 text-[80px] font-bold text-white/[0.03] font-display leading-none select-none">{s.step}</span>
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-dark-900/50 flex items-center justify-center text-3xl flex-shrink-0 backdrop-blur-sm">
                        {s.icon}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-neon-blue font-bold tracking-[0.15em] uppercase">Step {s.step}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">{s.title}</h3>
                        <p className="text-xs text-dark-200 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  </div>
                </RevealDiv>
              ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          § FEATURE SHOWCASES
      ════════════════════════════════════════════ */}
      <div className="relative px-6 py-10 max-w-lg mx-auto">
        {/* Feature 1: AI Meal Scanning */}
        <FeatureShowcase
          icon="📸"
          badge="AI Vision"
          title="Your Camera is Now a Nutritionist"
          description="Simply photograph your meal and our AI identifies every ingredient, estimates calories, protein, carbs, and fats — all in under 3 seconds."
          gradient="from-neon-blue/30 to-neon-teal/30"
          features={[
            "Instant food recognition with AI",
            "Accurate macro breakdown: calories, protein, carbs, fats",
            "Works with any cuisine — Indian, Western, Asian, and more",
            "One-tap meal logging after AI confirmation",
          ]}
          mockupContent={
            <div className="p-3 space-y-2.5" style={{ minHeight: 360 }}>
              <div className="bg-dark-800 rounded-2xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <span className="text-xs font-bold text-white">NutriSnap AI</span>
                </div>
                <div className="h-24 rounded-xl bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 flex items-center justify-center">
                  <span className="text-4xl">🍱</span>
                </div>
                <p className="text-[10px] font-semibold text-white">Grilled Chicken Bowl</p>
                <p className="text-[8px] text-dark-400">Detected: rice, chicken, avocado, vegetables</p>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: "Cal", val: "485", color: "text-neon-orange" },
                  { label: "Pro", val: "38g", color: "text-neon-blue" },
                  { label: "Carb", val: "52g", color: "text-neon-green" },
                  { label: "Fat", val: "14g", color: "text-neon-pink" },
                ].map((m) => (
                  <div key={m.label} className="bg-dark-800 rounded-xl p-2 text-center">
                    <p className={`text-xs font-bold ${m.color}`}>{m.val}</p>
                    <p className="text-[7px] text-dark-500">{m.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-neon-blue/10 rounded-xl p-2.5 border border-neon-blue/20">
                <p className="text-[8px] text-neon-blue font-medium leading-relaxed">
                  💡 Great choice! High protein and balanced macros. This meal fits your muscle gain goal perfectly.
                </p>
              </div>
              <div className="bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl py-2 text-center">
                <span className="text-[10px] font-bold text-white">✓ Confirm & Log</span>
              </div>
            </div>
          }
        />

        {/* Neon separator */}
        <div className="neon-line my-4 opacity-30" />

        {/* Feature 2: Workout Plans */}
        <FeatureShowcase
          icon="🏋️"
          badge="Training"
          title="Expert Workout Programs"
          description="From beginner to advanced, find programs built for real results. Track every set, rep, and rest period with our interactive exercise tracker."
          gradient="from-neon-purple/30 to-neon-pink/30"
          reverse
          features={[
            "6 categories: Fat Loss, Muscle Gain, Strength, Yoga, Cardio, HIIT",
            "Interactive set tracking with tap-to-complete buttons",
            "Built-in rest timer between sets",
            "Automatic workout logging to your progress history",
          ]}
          mockupContent={
            <div className="p-3 space-y-2" style={{ minHeight: 360 }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white">💪 Today's Workout</span>
              </div>
              {[
                { name: "Bench Press", sets: "4×10", icon: "🏋️", done: true },
                { name: "Incline Dumbbell", sets: "3×12", icon: "💪", done: true },
                { name: "Cable Flyes", sets: "3×15", icon: "🔥", done: false },
                { name: "Tricep Pushdown", sets: "3×12", icon: "⚡", done: false },
              ].map((ex, i) => (
                <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${ex.done ? "border-neon-green/20 bg-neon-green/5" : "border-white/5 bg-dark-800"}`}>
                  <span className="text-lg">{ex.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-semibold ${ex.done ? "text-neon-green" : "text-white"}`}>{ex.name}</p>
                    <p className="text-[8px] text-dark-400">{ex.sets}</p>
                  </div>
                  {ex.done && <span className="text-neon-green text-xs">✓</span>}
                </div>
              ))}
              <div className="bg-dark-800 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-dark-400">Rest Timer</p>
                  <p className="text-sm font-bold text-neon-blue font-display">1:30</p>
                </div>
                <div className="bg-neon-blue/10 rounded-lg px-3 py-1.5">
                  <span className="text-[9px] font-bold text-neon-blue">Skip →</span>
                </div>
              </div>
              <div className="mt-1 bg-dark-800 rounded-lg p-1.5">
                <div className="flex justify-between text-[8px] mb-1">
                  <span className="text-dark-400">Progress</span>
                  <span className="text-neon-blue font-semibold">2/4 exercises</span>
                </div>
                <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full" />
                </div>
              </div>
            </div>
          }
        />

        {/* Neon separator */}
        <div className="neon-line my-4 opacity-30" />

        {/* Feature 3: Progress Analytics */}
        <FeatureShowcase
          icon="📊"
          badge="Analytics"
          title="See Your Transformation"
          description="Beautiful charts and metrics that make your progress tangible. Weekly trends, macro adherence, and workout streaks — all in one glance."
          gradient="from-neon-green/30 to-neon-teal/30"
          features={[
            "Weekly calorie and protein trend charts",
            "Daily adherence tracking with color-coded indicators",
            "Overall workout stats: sets, duration, calories burned",
            "Smart nutrition tips based on your actual intake",
          ]}
          mockupContent={
            <div className="p-3 space-y-2.5" style={{ minHeight: 360 }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">📈 This Week</span>
                <span className="text-[8px] text-neon-green font-bold">+12%</span>
              </div>
              {/* Mini chart mockup */}
              <div className="bg-dark-800 rounded-2xl p-3">
                <div className="flex items-end gap-1.5 h-16 justify-between px-1">
                  {[40, 65, 55, 80, 70, 90, 45].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t-md ${i === 5 ? "bg-gradient-to-t from-neon-blue to-neon-purple" : "bg-dark-600"}`}
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[6px] text-dark-500">{["M","T","W","T","F","S","S"][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "Workouts", val: "12", icon: "🏋️", delta: "+3" },
                  { label: "Calories", val: "2.4k", icon: "🔥", delta: "avg" },
                  { label: "Protein", val: "156g", icon: "💪", delta: "avg" },
                  { label: "Streak", val: "5 days", icon: "🔥", delta: "Best!" },
                ].map((s) => (
                  <div key={s.label} className="bg-dark-800 rounded-xl p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{s.icon}</span>
                      <span className="text-[7px] text-neon-green font-semibold">{s.delta}</span>
                    </div>
                    <p className="text-sm font-bold text-white mt-1">{s.val}</p>
                    <p className="text-[7px] text-dark-500">{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Adherence dots */}
              <div className="bg-dark-800 rounded-xl p-2.5">
                <p className="text-[8px] text-dark-400 mb-1.5">Daily Adherence</p>
                <div className="flex gap-1">
                  {[true,true,true,false,true,true,false].map((ok,i) => (
                    <div key={i} className={`flex-1 h-2 rounded-full ${ok ? "bg-neon-green" : "bg-dark-600"}`} />
                  ))}
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* ════════════════════════════════════════════
          § STATS COUNTER
      ════════════════════════════════════════════ */}
      <div className="relative px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-dark-900" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-neon-purple/5 blur-[120px] rounded-full" />

        <div className="relative z-10 max-w-lg mx-auto">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Meals Scanned", value: 50000, suffix: "+", icon: "📸" },
              { label: "Active Users", value: 10000, suffix: "+", icon: "👥" },
              { label: "AI Accuracy", value: 98, suffix: "%", icon: "🎯" },
              { label: "Workouts Done", value: 25000, suffix: "+", icon: "💪" },
            ].map((stat, idx) => (
                <RevealDiv
                  key={stat.label}
                  className="reveal text-center glass-card-static p-5 space-y-2"
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <span className="text-2xl">{stat.icon}</span>
                  <p className="text-2xl font-bold text-gradient font-display">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-[10px] text-dark-400 uppercase tracking-[0.15em]">{stat.label}</p>
                </RevealDiv>
              ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          § TECH STACK / WHY NUTRISNAP
      ════════════════════════════════════════════ */}
      <div className="relative px-6 py-16 max-w-lg mx-auto">
        <div className="text-center space-y-3 mb-10">
          <p className="text-[10px] text-neon-purple font-bold tracking-[0.3em] uppercase">Built Different</p>
          <h2 className="font-display text-2xl font-bold text-white">
            Why NutriSnap?
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              icon: "🧠",
              title: "AI Analysis",
              desc: "State-of-the-art vision model that recognizes 10,000+ foods across any cuisine.",
              glow: "shadow-[0_0_20px_rgba(0,212,255,0.08)]",
            },
            {
              icon: "🔒",
              title: "Bank-Grade Security",
              desc: "JWT authentication, encrypted data, rate limiting, and CORS protection keep your data safe.",
              glow: "shadow-[0_0_20px_rgba(168,85,247,0.08)]",
            },
            {
              icon: "⚡",
              title: "Lightning Fast",
              desc: "React + Vite frontend with optimized MongoDB queries. Sub-second responses, every time.",
              glow: "shadow-[0_0_20px_rgba(16,185,129,0.08)]",
            },
            {
              icon: "🎨",
              title: "Premium Design",
              desc: "Glassmorphism UI, smooth animations, and dark mode — designed to feel like a native app.",
              glow: "shadow-[0_0_20px_rgba(0,212,255,0.08)]",
            },
            {
              icon: "📱",
              title: "PWA Ready",
              desc: "Install on your phone's home screen. Works offline and feels like a native application.",
              glow: "shadow-[0_0_20px_rgba(168,85,247,0.08)]",
            },
            {
              icon: "🌍",
              title: "100% Free",
              desc: "No paywalls, no premium tiers, no credit card. Every feature is free, forever.",
              glow: "shadow-[0_0_20px_rgba(16,185,129,0.08)]",
            },
          ].map((item, idx) => (
              <RevealDiv key={item.title} className="reveal" style={{ transitionDelay: `${idx * 80}ms` }}>
                <div className={`glass-card-static p-5 flex items-start gap-4 ${item.glow} hover:border-white/15 transition-all duration-300`}>
                  <div className="w-12 h-12 rounded-2xl bg-dark-800 flex items-center justify-center text-2xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-dark-300 leading-relaxed mt-1">{item.desc}</p>
                  </div>
                </div>
              </RevealDiv>
            ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          § FINAL CTA
      ════════════════════════════════════════════ */}
      <div className="relative px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-neon-blue/5 blur-[150px] rounded-full" />

        <div className="relative z-10 max-w-lg mx-auto text-center">
          <div className="relative overflow-hidden rounded-[32px] border border-neon-blue/20 bg-gradient-to-br from-neon-blue/10 via-neon-purple/5 to-transparent p-10 space-y-6">
            <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-neon-blue/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-neon-purple/10 blur-3xl" />

            <div className="relative z-10 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(0,212,255,0.3)]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>

              <h2 className="font-display text-2xl font-bold text-white">
                Ready to Transform<br />Your Health?
              </h2>
              <p className="text-sm text-dark-200 max-w-xs mx-auto">
                Join thousands of athletes already tracking smarter with NutriSnap's AI technology.
              </p>

              <Link
                to="/login"
                className="btn-gradient w-full py-4 text-center block text-base font-bold shadow-[0_0_40px_rgba(0,212,255,0.2)] animate-pulse-glow"
              >
                Create Your Free Account
              </Link>

              <p className="text-[10px] text-dark-500">No credit card • No spam • Just results</p>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          § FOOTER
      ════════════════════════════════════════════ */}
      <footer className="relative px-6 py-10 border-t border-white/5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="font-display text-sm font-bold text-white">NutriSnap</span>
          </div>
          <p className="text-center text-[9px] text-dark-500 tracking-[0.25em] uppercase">
            Built with ❤️ using React • Node.js • MongoDB • AI
          </p>
          <p className="text-center text-[9px] text-dark-600 mt-2">
            © 2026 NutriSnap — The Premium AI Fitness Experience
          </p>
        </div>
      </footer>
    </div>
  );
}
