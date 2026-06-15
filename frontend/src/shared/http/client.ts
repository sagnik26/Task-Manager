import axios from "axios";

import { useAuthStore } from "@/modules/auth/context/auth.store";

/**
 * Axios instance for TaskFlow API.
 *
 * - `VITE_API_URL` defaults to `/api` (nginx or Vercel proxy to backend).
 * - `withCredentials: true` so the HttpOnly auth cookie is sent automatically.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
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

