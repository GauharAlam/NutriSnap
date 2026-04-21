import axios from 'axios';
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  storeAccessToken,
  storeRefreshToken,
  clearAllTokens,
} from './auth-storage';

// ─── Change this to your server's URL ───
// For physical device testing, use your machine's local IP (e.g. 192.168.x.x)
// For Expo Go on simulator, localhost works.
const BASE_URL = 'http://192.168.1.3:5001/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/* ─── Token Helpers ─── */
export function setAccessTokenHeader(token) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAccessTokenHeader() {
  delete apiClient.defaults.headers.common.Authorization;
}

/* ─── Refresh Queue (prevents parallel refreshes) ─── */
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

/* ─── Response Interceptor — auto-refresh on 401 ─── */
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    const is401 = error.response?.status === 401;
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/register');

    if (is401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getStoredRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        await storeAccessToken(newAccessToken);
        if (newRefreshToken) await storeRefreshToken(newRefreshToken);
        setAccessTokenHeader(newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await clearAllTokens();
        clearAccessTokenHeader();
        // The AuthProvider will detect the cleared tokens and redirect to login
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
