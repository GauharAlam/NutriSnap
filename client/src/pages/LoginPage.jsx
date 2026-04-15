import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

const goalOptions = [
  { value: "weight_loss", label: "Weight loss" },
  { value: "muscle_gain", label: "Muscle gain" },
  { value: "maintenance", label: "Maintenance" },
];

const socialProof = [
  "AI meal analysis with human review before save",
  "Goal-aware calorie and macro tracking",
  "Session-based dashboard ready for protected routes",
];

const loginInitialState = {
  email: "",
  password: "",
};

const registerInitialState = {
  name: "",
  email: "",
  password: "",
  goalType: "maintenance",
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isBootstrapping, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(loginInitialState);
  const [registerForm, setRegisterForm] = useState(registerInitialState);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = useMemo(
    () => location.state?.from?.pathname || "/dashboard",
    [location.state]
  );

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isBootstrapping, navigate, redirectTo]);

  function handleLoginChange(event) {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  }

  function handleRegisterChange(event) {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login(loginForm);
      } else {
        await register(registerForm);
      }

      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeForm = mode === "login" ? loginForm : registerForm;

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[2rem] border border-ink/10 bg-white/80 p-8 shadow-soft">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Phase 2</p>
          <h2 className="font-serif text-4xl font-semibold">
            Account access that flows into the tracking experience
          </h2>
          <p className="text-sm leading-6 text-ink/65">
            This screen now supports registration and sign-in against the backend JWT
            API, then forwards authenticated users into the protected dashboard.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {socialProof.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-ink/10 bg-sand px-4 py-4 text-sm text-ink/75"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-ink/10 bg-white/88 p-8 shadow-soft">
        <div className="flex rounded-full border border-ink/10 bg-mist p-1">
          {[
            ["login", "Sign in"],
            ["register", "Create account"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value);
                setError("");
              }}
              className={[
                "flex-1 rounded-full px-4 py-3 text-sm font-semibold transition",
                mode === value ? "bg-ink text-white" : "text-ink/65 hover:bg-white",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Details</p>
            <h3 className="font-serif text-3xl font-semibold">
              {mode === "login" ? "Welcome back" : "Start with your goal"}
            </h3>
            <p className="text-sm text-ink/60">
              {mode === "login"
                ? "Use your email and password to reopen your dashboard."
                : "Create a new account and attach it to a starting fitness goal."}
            </p>
          </div>

          {mode === "register" ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink/75">Full name</span>
              <input
                required
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
                placeholder="Alex Carter"
              />
            </label>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink/75">Email</span>
            <input
              required
              type="email"
              name="email"
              value={activeForm.email}
              onChange={mode === "login" ? handleLoginChange : handleRegisterChange}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink/75">Password</span>
            <input
              required
              minLength={8}
              type="password"
              name="password"
              value={activeForm.password}
              onChange={mode === "login" ? handleLoginChange : handleRegisterChange}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
              placeholder="At least 8 characters"
            />
          </label>

          {mode === "register" ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink/75">Primary goal</span>
              <select
                name="goalType"
                value={registerForm.goalType}
                onChange={handleRegisterChange}
                className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-emerald"
              >
                {goalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-ink/75">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? "Submitting..."
              : mode === "login"
                ? "Sign in to dashboard"
                : "Create account"}
          </button>
        </form>
      </div>
    </section>
  );
}
