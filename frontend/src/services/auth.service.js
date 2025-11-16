// // Token management utilities
// const ACCESS_TOKEN_KEY = 'collegehub_access_token';
// const REFRESH_TOKEN_KEY = 'collegehub_refresh_token';
// const USER_KEY = 'collegehub_user';

// export const setAccessToken = (token) => {
//   localStorage.setItem(ACCESS_TOKEN_KEY, token);
// };

// export const getAccessToken = () => {
//   return localStorage.getItem(ACCESS_TOKEN_KEY);
// };

// export const setRefreshToken = (token) => {
//   localStorage.setItem(REFRESH_TOKEN_KEY, token);
// };

// export const getRefreshToken = () => {
//   return localStorage.getItem(REFRESH_TOKEN_KEY);
// };

// export const setUser = (user) => {
//   localStorage.setItem(USER_KEY, JSON.stringify(user));
// };

// export const getUser = () => {
//   const user = localStorage.getItem(USER_KEY);
//   return user ? JSON.parse(user) : null;
// };

// export const clearTokens = () => {
//   localStorage.removeItem(ACCESS_TOKEN_KEY);
//   localStorage.removeItem(REFRESH_TOKEN_KEY);
//   localStorage.removeItem(USER_KEY);
// };

// export const isAuthenticated = () => {
//   return !!getAccessToken();
// };

// COOKIE-ONLY AUTH SERVICE
// We store ONLY user info (safe). Tokens remain in HttpOnly cookies.

const USER_KEY = "collegehub_user";

export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearUser = () => {
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => {
  return !!getUser();
};
