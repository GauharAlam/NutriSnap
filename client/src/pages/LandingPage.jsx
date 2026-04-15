import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

const platformHighlights = [
  "Upload meal photos and extract estimated nutrition in seconds.",
  "Track calories, protein, carbs, fats, and sugar across the day.",
  "Align meals to goals like weight loss, muscle gain, or maintenance.",
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-8">
        <div className="inline-flex rounded-full border border-emerald/20 bg-white/80 px-4 py-2 text-sm text-emerald shadow-soft">
          AI meal analysis plus progress tracking
        </div>

        <div className="space-y-4">
          <h2 className="max-w-3xl font-serif text-5xl font-semibold leading-tight">
            A calmer, smarter way to stay consistent with food and fitness.
          </h2>
          <p className="max-w-2xl text-lg text-ink/70">
            FitFuel AI helps users log meals from images, measure nutrition against
            goals, and get practical diet suggestions from an AI coach.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            {isAuthenticated ? "Open dashboard" : "Start your account"}
          </Link>
          <a
            href="#product-highlights"
            className="rounded-full border border-ink/10 bg-white/80 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Explore features
          </a>
        </div>

        <div id="product-highlights" className="grid gap-4 sm:grid-cols-3">
          {platformHighlights.map((item) => (
            <article
              key={item}
              className="rounded-3xl border border-ink/10 bg-white/75 p-5 shadow-soft"
            >
              <p className="text-sm leading-6 text-ink/75">{item}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-ink/10 bg-white/80 p-6 shadow-soft">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-ink/40">
            Product Modules
          </p>
          <div className="grid gap-4">
            {[
              ["Food Vision", "Detect items from uploaded images"],
              ["Nutrition Engine", "Estimate calories and macros by meal"],
              ["Goals", "Set target intake for your fitness phase"],
              ["AI Coach", "Get improvement suggestions from recent habits"],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl bg-sand p-4 ring-1 ring-ink/5"
              >
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-ink/65">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
