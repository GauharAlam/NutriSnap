/**
 * PreviewPage - Renders all protected screens inline for UI showcase.
 * Wraps components in a mock auth context so they render without a real session.
 * Access at /preview
 */
import { AuthContext } from "../features/auth/auth-context";
import { DashboardPage } from "./DashboardPage";
import { WorkoutPlansPage } from "./WorkoutPlansPage";
import { NutritionPage } from "./NutritionPage";
import { ProgressPage } from "./ProgressPage";
import { ProfilePage } from "./ProfilePage";

const mockAuth = {
  user: { name: "Alex Carter", email: "alex@fitforge.com", goalType: "muscle_gain" },
  accessToken: "mock",
  isAuthenticated: true,
  isBootstrapping: false,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
  updateUser: () => {},
};

const screens = [
  { id: "dashboard", label: "Home Dashboard", Component: DashboardPage },
  { id: "workouts", label: "Workout Plans", Component: WorkoutPlansPage },
  { id: "nutrition", label: "Nutrition", Component: NutritionPage },
  { id: "progress", label: "Progress", Component: ProgressPage },
  { id: "profile", label: "Profile", Component: ProfilePage },
];

export function PreviewPage() {
  return (
    <AuthContext.Provider value={mockAuth}>
      <div className="space-y-20 pb-12">
        <div className="text-center pt-10 space-y-2">
          <h1 className="font-display text-3xl font-bold text-gradient">FitForge UI Preview</h1>
          <p className="text-sm text-dark-300">All screens rendered inline with mock data</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {screens.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="chip active text-xs">{s.label}</a>
            ))}
          </div>
        </div>

        {screens.map(({ id, label, Component }) => (
          <section key={id} id={id} className="scroll-mt-6">
            <div className="text-center mb-4">
              <span className="section-label">Screen Preview</span>
              <h2 className="section-title mt-1">{label}</h2>
              <div className="neon-line w-40 mx-auto mt-3" />
            </div>
            <div className="border border-white/5 rounded-3xl overflow-hidden">
              <Component />
            </div>
          </section>
        ))}
      </div>
    </AuthContext.Provider>
  );
}
