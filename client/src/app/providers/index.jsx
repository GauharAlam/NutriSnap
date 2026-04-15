import { AuthProvider } from "../../features/auth/AuthProvider";

export function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
