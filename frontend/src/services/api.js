import axios from "axios";
import { clearUser } from "./auth.service";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies automatically
});

const REFRESH_ENDPOINT = "/api/auth/refresh";
let refreshPromise = null;

api.interceptors.request.use(
  (config) => config,
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // If refresh endpoint itself failed or we already retried, bail out
    if (original._retry || original.url?.includes(REFRESH_ENDPOINT)) {
      clearUser();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api.post(REFRESH_ENDPOINT).finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;
      return api(original);
    } catch (refreshError) {
      clearUser();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }
);

export default api;
