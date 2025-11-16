import axios from "axios";

const api = axios.create({
  baseURL: "/api/super-admin",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("superAdminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  me: () => api.get("/auth/me"),
};

export const dashboardAPI = {
  overview: () => api.get("/dashboard/overview"),
};

export const collegeAPI = {
  list: () => api.get("/colleges"),
  detail: (id) => api.get(`/colleges/${id}`),
};

export const clubAPI = {
  list: () => api.get("/clubs"),
};

export const verificationAPI = {
  list: () => api.get("/verification"),
};

export const eventAPI = {
  list: (filter) => api.get("/events", { params: { filter } }),
};

export const userAPI = {
  list: () => api.get("/users"),
};

export const reportAPI = {
  list: () => api.get("/reports"),
};

export const analyticsAPI = {
  platform: () => api.get("/analytics/platform"),
};

export const settingsAPI = {
  list: () => api.get("/settings"),
};

export default api;
