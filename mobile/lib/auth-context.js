import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  storeAccessToken,
  storeRefreshToken,
  clearAllTokens,
} from './auth-storage';
import { apiClient, setAccessTokenHeader, clearAccessTokenHeader } from './api';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  /* ─── Bootstrap: try to restore session on app start ─── */
  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        // 1. Try stored access token
        const storedAccess = await getStoredAccessToken();
        if (storedAccess) {
          setAccessTokenHeader(storedAccess);
          try {
            const res = await apiClient.get('/auth/me');
            if (mounted) setUser(res.data.data);
            return; // success
          } catch {
            clearAccessTokenHeader();
          }
        }

        // 2. Try refresh token
        const storedRefresh = await getStoredRefreshToken();
        if (storedRefresh) {
          try {
            const res = await apiClient.post('/auth/refresh', {
              refreshToken: storedRefresh,
            });
            const { accessToken, refreshToken: newRefresh, user: userData } = res.data.data;
            await storeAccessToken(accessToken);
            if (newRefresh) await storeRefreshToken(newRefresh);
            setAccessTokenHeader(accessToken);
            if (mounted) setUser(userData);
            return;
          } catch {
            // refresh failed
          }
        }

        // 3. No valid session
        if (mounted) {
          setUser(null);
          await clearAllTokens();
          clearAccessTokenHeader();
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsBootstrapping(false);
      }
    }

    bootstrap();
    return () => { mounted = false; };
  }, []);

  /* ─── Login ─── */
  const login = useCallback(async (credentials) => {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      const { accessToken, refreshToken, user: userData } = res.data.data;
      await storeAccessToken(accessToken);
      if (refreshToken) await storeRefreshToken(refreshToken);
      setAccessTokenHeader(accessToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to sign in right now'));
    }
  }, []);

  /* ─── Register ─── */
  const register = useCallback(async (credentials) => {
    try {
      const res = await apiClient.post('/auth/register', credentials);
      const { accessToken, refreshToken, user: userData } = res.data.data;
      await storeAccessToken(accessToken);
      if (refreshToken) await storeRefreshToken(refreshToken);
      setAccessTokenHeader(accessToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to create account right now'));
    }
  }, []);

  /* ─── Logout ─── */
  const logout = useCallback(async () => {
    try {
      const rt = await getStoredRefreshToken();
      await apiClient.post('/auth/logout', { refreshToken: rt });
    } catch { /* ignore */ }
    setUser(null);
    await clearAllTokens();
    clearAccessTokenHeader();
  }, []);

  /* ─── Update user locally ─── */
  const updateUser = useCallback((partial) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isBootstrapping,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
