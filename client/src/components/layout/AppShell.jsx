import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";

export function AppShell() {
  const navigate = useNavigate();
  const { isAuthenticated, isBootstrapping, logout, user } = useAuth();

  const navigation = isAuthenticated
    ? [
        { label: "Overview", to: "/" },
        { label: "Dashboard", to: "/dashboard" },
      ]
    : [
        { label: "Overview", to: "/" },
        { label: "Login", to: "/login" },
      ];

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-grain text-ink">
      <header className="border-b border-ink/10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald/70">
              FitFuel AI
            </p>
            <h1 className="font-serif text-2xl font-semibold">Nutrition with momentum</h1>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <nav className="flex flex-wrap gap-2 rounded-full border border-ink/10 bg-white/80 p-1 shadow-soft">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      isActive ? "bg-ink text-white" : "text-ink/70 hover:bg-ink/5",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {!isBootstrapping && isAuthenticated ? (
              <div className="flex items-center gap-3 self-start rounded-full border border-ink/10 bg-white/80 px-3 py-2 shadow-soft sm:self-auto">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/40">Signed in</p>
                  <p className="text-sm font-semibold">{user?.name}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/90"
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
