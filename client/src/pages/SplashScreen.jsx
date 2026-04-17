import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2000);
    const t4 = setTimeout(() => {
      const seen = localStorage.getItem("fitforge_onboarded");
      navigate(seen ? "/login" : "/landing", { replace: true });
    }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[3000ms]"
        style={{
          backgroundImage: "url(/images/splash-bg.png)",
          transform: phase >= 1 ? "scale(1.05)" : "scale(1.15)",
          filter: "brightness(0.35)",
        }}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent" />

      {/* Radial glow */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full transition-opacity duration-1000"
        style={{
          background: "radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)",
          opacity: phase >= 2 ? 1 : 0,
        }}
      />

      {/* Logo */}
      <div
        className="relative z-10 flex flex-col items-center transition-all duration-700"
        style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)",
        }}
      >
        {/* Logo icon */}
        <div className="mb-6 relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-neon-blue">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          {/* Glow ring */}
          <div
            className="absolute -inset-3 rounded-[2rem] border border-neon-blue/30 transition-opacity duration-1000"
            style={{ opacity: phase >= 2 ? 1 : 0 }}
          />
        </div>

        <h1 className="font-display text-4xl font-bold tracking-tight text-white">
          Fit<span className="text-gradient">Forge</span>
        </h1>
      </div>

      {/* Tagline */}
      <p
        className="relative z-10 mt-6 text-lg font-medium tracking-widest text-dark-200 uppercase transition-all duration-700"
        style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(10px)",
        }}
      >
        Push Beyond Limits
      </p>

      {/* Loading indicator */}
      <div
        className="relative z-10 mt-10 flex items-center gap-2 transition-all duration-500"
        style={{ opacity: phase >= 3 ? 1 : 0 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-bounce-subtle" />
        <div className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-bounce-subtle delay-200" />
        <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-bounce-subtle delay-400" />
      </div>

      {/* Bottom fade line */}
      <div
        className="absolute bottom-16 w-48 neon-line transition-opacity duration-700"
        style={{ opacity: phase >= 3 ? 0.5 : 0 }}
      />
    </div>
  );
}
