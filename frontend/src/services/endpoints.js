import api from "./api";

// Auth endpoints
export const authAPI = {
  signup: (data) => api.post("/api/auth/signup", data),
  login: (email, password) => api.post("/api/auth/login", { email, password }),
  logout: () => api.post("/api/auth/logout"),
  refresh: (refreshToken) => api.post("/api/auth/refresh", { refreshToken }),
  requestVerification: (email) =>
    api.post("/api/auth/request-verification", { email }),
  verifyEmail: (token) => api.post("/api/auth/verify-email", { token }),
  resetPassword: (token, password) =>
    api.post("/api/auth/reset-password", { token, password }),
  requestPasswordReset: (email) =>
    api.post("/api/auth/request-password-reset", { email }),
};

// User endpoints
export const userAPI = {
  getProfile: () => api.get("/api/users/me"),
  updateProfile: (data) => api.put("/api/users/me", data),
  updateLocation: (lat, lng) => api.put("/api/users/me/location", { lat, lng }),
  getNearbyUsers: (lat, lng, maxDistance = 5000, limit = 10) =>
    api.get(`/api/users/nearby`, { params: { lat, lng, maxDistance, limit } }),
  searchUsers: (query, role, limit = 10) =>
    api.get(`/api/users/search`, { params: { query, role, limit } }),
  getUserById: (id) => api.get(`/api/users/${id}`),
};

// Club endpoints
export const clubAPI = {
  createClub: (data) => api.post("/api/clubs", data),
  getClub: (id) => api.get(`/api/clubs/${id}`),
  updateClub: (id, data) => api.put(`/api/clubs/${id}`, data),
  deleteClub: (id) => api.delete(`/api/clubs/${id}`),
  listClubs: (page = 1, limit = 10, category) =>
    api.get("/api/clubs", { params: { page, limit, category } }),
  joinClub: (id) => api.post(`/api/clubs/${id}/join`, {}),
  leaveClub: (id) => api.post(`/api/clubs/${id}/leave`, {}),
  getClubMembers: (id) => api.get(`/api/clubs/${id}/members`),
  updateMemberRole: (clubId, memberId, role) =>
    api.put(`/api/clubs/${clubId}/members/${memberId}`, { role }),
  removeMember: (clubId, memberId) =>
    api.delete(`/api/clubs/${clubId}/members/${memberId}`),
  searchClubs: (query, collegeId, limit = 20) =>
    api.get("/api/clubs/search", { params: { q: query, collegeId, limit } }),
};

// Event endpoints
export const eventAPI = {
  createEvent: (data) => api.post("/api/events", data),
  getEvent: (id) => api.get(`/api/events/${id}`),
  updateEvent: (id, data) => api.put(`/api/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/api/events/${id}`),
  listEvents: (page = 1, limit = 10, filters = {}) =>
    api.get("/api/events", { params: { page, limit, ...filters } }),
  registerForEvent: (id) => api.post(`/api/events/${id}/register`, {}),
  cancelRegistration: (id) =>
    api.post(`/api/events/${id}/cancel-registration`, {}),
  checkIn: (id, qrToken) => api.post(`/api/events/${id}/check-in`, { qrToken }),
  getRegistrations: (eventId) =>
    api.get(`/api/events/${eventId}/registrations`),
  searchEvents: (query, filters = {}) =>
    api.get("/api/events/search", { params: { query, ...filters } }),
};

// Registration endpoints
export const registrationAPI = {
  getMyRegistrations: (page = 1, limit = 10, status) =>
    api.get("/api/registrations/me", { params: { page, limit, status } }),
  getEventRegistrations: (eventId) =>
    api.get(`/api/registrations/event/${eventId}`),
  getRegistration: (id) => api.get(`/api/registrations/${id}`),
  cancelRegistration: (id, reason) =>
    api.post(`/api/registrations/${id}/cancel`, { reason }),
};

// Maps endpoints
export const mapsAPI = {
  geocode: (query) => api.post("/api/maps/geocode", { query }),
  reverseGeocode: (lat, lng) =>
    api.post("/api/maps/reverse-geocode", { lat, lng }),
  getRoute: (startLat, startLng, endLat, endLng) =>
    api.post("/api/maps/route-estimate", {
      startLat,
      startLng,
      endLat,
      endLng,
    }),
  getCacheStats: () => api.get("/api/maps/cache-stats"),
};

// Global search endpoints
export const searchAPI = {
  searchAll: (
    query,
    types = ["clubs", "colleges", "students", "events"],
    limit = 5,
    collegeId
  ) => {
    const typeParam = Array.isArray(types) ? types.join(",") : types;
    return api.get("/api/search", {
      params: {
        q: query,
        types: typeParam,
        limit,
        collegeId,
      },
    });
  },
};

// Export all endpoints as a single object
export const endpoints = {
  authAPI,
  userAPI,
  clubAPI,
  eventAPI,
  registrationAPI,

  mapsAPI,
  searchAPI,
};

export default {
  authAPI,
  userAPI,
  clubAPI,
  eventAPI,
  registrationAPI,
  mapsAPI,
  searchAPI,
};
