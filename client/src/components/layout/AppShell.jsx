import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";

const navItems = [
  {
    to: "/home",
    label: "Home",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: "/workouts",
    label: "Workouts",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5h11" />
        <path d="M6.5 17.5h11" />
        <path d="M12 2v20" />
        <rect x="2" y="5" width="4" height="14" rx="1" />
        <rect x="18" y="5" width="4" height="14" rx="1" />
      </svg>
    ),
  },
  {
    to: "/nutrition",
    label: "Nutrition",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    to: "/progress",
    label: "Progress",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    to: "/profile",
    label: "Profile",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const noNavRoutes = ["/", "/onboarding", "/login", "/landing", "/preview", "/coach"];

export function AppShell() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const showBottomNav = !noNavRoutes.includes(location.pathname) && isAuthenticated;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-mesh text-dark-50">
      <main className={`mx-auto max-w-lg px-4 ${showBottomNav ? "pb-24" : ""}`}>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>

      {showBottomNav && (
        <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50">
          <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}

      {/* Floating AI Coach Button */}
      {showBottomNav && location.pathname !== "/coach" && (
        <NavLink
          to="/coach"
          className="fixed bottom-[84px] right-4 w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xl shadow-[0_4px_15px_rgba(0,212,255,0.4)] z-50 hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="animate-pulse">🤖</span>
          <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-neon-green border-2 border-dark-900" />
        </NavLink>
      )}
    </div>
  );
}
