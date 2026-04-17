import { AuthProvider } from "../../features/auth/AuthProvider";
import { ThemeProvider } from "../../features/theme/ThemeProvider";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
