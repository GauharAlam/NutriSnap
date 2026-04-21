import axios from "axios";
import { clearStoredAccessToken, storeAccessToken } from "../../features/auth/auth-storage";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

export function setAccessTokenHeader(token) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAccessTokenHeader() {
  delete apiClient.defaults.headers.common.Authorization;
}

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401, not a retry, and not during auth endpoints
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/register")
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.data.accessToken;
        
        storeAccessToken(newAccessToken);
        setAccessTokenHeader(newAccessToken);
        
        processQueue(null, newAccessToken);
        
        originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearStoredAccessToken();
        clearAccessTokenHeader();
        // Force logout via auth context or window refresh if refresh token expires natively
        if (window.location.pathname !== "/login" && window.location.pathname !== "/landing" && window.location.pathname !== "/") {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
