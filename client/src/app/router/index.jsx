import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import {
  GuestOnlyRoute,
  ProtectedRoute,
} from "../../features/auth/AuthRouteGuards";
import { DashboardPage } from "../../pages/DashboardPage";
import { LandingPage } from "../../pages/LandingPage";
import { LoginPage } from "../../pages/LoginPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<LandingPage />} />
          <Route element={<GuestOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
