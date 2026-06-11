import axios from "axios";

import { useAuthStore } from "../../store";

/**
 * Axios instance for TaskFlow API.
 *
 * - `baseURL: "/api"` so the frontend nginx can reverse-proxy to the backend in Docker.
 * - `withCredentials: true` so the HttpOnly auth cookie is sent automatically.
 */
export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined;
    if (status === 401) {
      useAuthStore.getState().clear();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

