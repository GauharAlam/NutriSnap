import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

function RouteLoader() {
  return (
    <div className="rounded-[2rem] border border-ink/10 bg-white/85 p-10 text-center shadow-soft">
      <p className="text-xs uppercase tracking-[0.35em] text-ink/40">Session</p>
      <h2 className="mt-3 font-serif text-3xl font-semibold">Restoring your workspace</h2>
      <p className="mt-3 text-sm text-ink/60">
        We&apos;re checking your authentication state so the right screen shows up cleanly.
      </p>
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function GuestOnlyRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <RouteLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
