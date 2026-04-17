import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import {
  GuestOnlyRoute,
  ProtectedRoute,
} from "../../features/auth/AuthRouteGuards";
import { SplashScreen } from "../../pages/SplashScreen";
import { LandingPage } from "../../pages/LandingPage";
import { OnboardingPage } from "../../pages/OnboardingPage";
import { LoginPage } from "../../pages/LoginPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { WorkoutPlansPage } from "../../pages/WorkoutPlansPage";
import { ExerciseDetailPage } from "../../pages/ExerciseDetailPage";
import { NutritionPage } from "../../pages/NutritionPage";
import { ProgressPage } from "../../pages/ProgressPage";
import { ProfilePage } from "../../pages/ProfilePage";
import { PreviewPage } from "../../pages/PreviewPage";

export function AppRouter() {
  return (
    <BrowserRouter>
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
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
