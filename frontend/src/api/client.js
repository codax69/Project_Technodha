import axios from "axios";
import { getCookie, setCookie, removeCookie } from "../utils/cookies";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getCookie("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      const refreshToken = getCookie("refresh_token");
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = res.data.access;
          setCookie("access_token", newAccessToken, 30 / (24 * 60));
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          removeCookie("access_token");
          removeCookie("refresh_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);
