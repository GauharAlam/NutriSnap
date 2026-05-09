import { useEffect, useState } from "react";
import {
  apiClient,
  clearAccessTokenHeader,
  setAccessTokenHeader,
} from "../../lib/api/client";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  storeAccessToken,
} from "./auth-storage";
import { AuthContext } from "./auth-context";

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => getStoredAccessToken());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    if (accessToken) {
      setAccessTokenHeader(accessToken);
      storeAccessToken(accessToken);
      return;
    }

    clearAccessTokenHeader();
    clearStoredAccessToken();
  }, [accessToken]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const storedToken = getStoredAccessToken();

      if (storedToken) {
        setAccessTokenHeader(storedToken);

        try {
          const response = await apiClient.get("/auth/me");

          if (!isMounted) {
            return;
          }

          setAccessToken(storedToken);
          setUser(response.data.data);
          setIsBootstrapping(false);
          return;
        } catch {
          clearAccessTokenHeader();
          clearStoredAccessToken();
        }
      }

      try {
        const response = await apiClient.post("/auth/refresh");

        if (!isMounted) {
          return;
        }

        setAccessToken(response.data.data.accessToken);
        setUser(response.data.data.user);
      } catch {
        if (!isMounted) {
          return;
        }

        setAccessToken(null);
        setUser(null);
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      setAccessToken(null);
      setUser(null);
    }

    window.addEventListener("nutrisnap:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("nutrisnap:session-expired", handleSessionExpired);
    };
  }, []);

  async function register(credentials) {
    try {
      const response = await apiClient.post("/auth/register", credentials);
      setAccessToken(response.data.data.accessToken);
      setUser(response.data.data.user);
      return response.data.data.user;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to create account right now"));
    }
  }

  async function login(credentials) {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      setAccessToken(response.data.data.accessToken);
      setUser(response.data.data.user);
      return response.data.data.user;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to sign in right now"));
    }
  }

  async function logout() {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  function updateUser(partialUser) {
    setUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            ...partialUser,
          }
        : currentUser
    );
  }

  const value = {
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken),
    isBootstrapping,
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
