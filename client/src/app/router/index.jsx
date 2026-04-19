import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import {
  GuestOnlyRoute,
  ProtectedRoute,
} from "../../features/auth/AuthRouteGuards";

/* ─── Lazy-loaded pages (code splitting) ─── */
const SplashScreen = lazy(() =>
  import("../../pages/SplashScreen").then((m) => ({ default: m.SplashScreen }))
);
const LandingPage = lazy(() =>
  import("../../pages/LandingPage").then((m) => ({ default: m.LandingPage }))
);
const OnboardingPage = lazy(() =>
  import("../../pages/OnboardingPage").then((m) => ({ default: m.OnboardingPage }))
);
const LoginPage = lazy(() =>
  import("../../pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() =>
  import("../../pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const WorkoutPlansPage = lazy(() =>
  import("../../pages/WorkoutPlansPage").then((m) => ({ default: m.WorkoutPlansPage }))
);
const ExerciseDetailPage = lazy(() =>
  import("../../pages/ExerciseDetailPage").then((m) => ({ default: m.ExerciseDetailPage }))
);
const NutritionPage = lazy(() =>
  import("../../pages/NutritionPage").then((m) => ({ default: m.NutritionPage }))
);
const ProgressPage = lazy(() =>
  import("../../pages/ProgressPage").then((m) => ({ default: m.ProgressPage }))
);
const ProfilePage = lazy(() =>
  import("../../pages/ProfilePage").then((m) => ({ default: m.ProfilePage }))
);
const PreviewPage = lazy(() =>
  import("../../pages/PreviewPage").then((m) => ({ default: m.PreviewPage }))
);
const NotFoundPage = lazy(() =>
  import("../../pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);
const AiCoachPage = lazy(() =>
  import("../../pages/AiCoachPage").then((m) => ({ default: m.AiCoachPage }))
);

/* ─── Loading Fallback ─── */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-neon-blue/20 border-t-neon-blue animate-spin" />
        <p className="text-xs text-dark-400 tracking-wider uppercase">Loading...</p>
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppShell />}>
            {/* Public routes */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/preview" element={<PreviewPage />} />

            <Route element={<GuestOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/workouts" element={<WorkoutPlansPage />} />
              <Route path="/exercise/:id" element={<ExerciseDetailPage />} />
              <Route path="/nutrition" element={<NutritionPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/coach" element={<AiCoachPage />} />
            </Route>

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
