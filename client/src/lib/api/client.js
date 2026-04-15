import axios from "axios";

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
