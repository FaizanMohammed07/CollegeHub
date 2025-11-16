import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { authAPI } from "../services/endpoints";
import { setUser, clearUser, getUser } from "../services/auth.service";
import api from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => getUser());
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getUser());

  // Verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await api.get("/api/users/me");
        if (res.data?.data) {
          setUser(res.data.data);
          setUserState(res.data.data);
          setIsAuthenticated(true);
        }
      } catch (err) {
        clearUser();
        setUserState(null);
        setIsAuthenticated(false);
      }
    };

    if (isAuthenticated) {
      verifySession();
    }
  }, []);

  // Signup (tokens auto-set in HttpOnly cookies)
  const signup = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.signup(data);
      const userData = response.data?.data?.user;

      setUser(userData);
      setUserState(userData);
      setIsAuthenticated(true);
      toast.success("Signup successful!");
      return userData;
    } catch (error) {
      const message = error.response?.data?.error?.message || "Signup failed";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login (tokens auto-set in HttpOnly cookies)
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const userData = response.data?.data?.user;

      setUser(userData);
      setUserState(userData);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${userData.name}!`);
      return userData;
    } catch (error) {
      const message = error.response?.data?.error?.message || "Login failed";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout (cookies cleared by backend)
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearUser();
      setUserState(null);
      setIsAuthenticated(false);
      setLoading(false);
      toast.success("Logged out successfully");
    }
  }, []);

  // Request password reset
  const requestPasswordReset = useCallback(async (email) => {
    setLoading(true);
    try {
      await authAPI.requestPasswordReset(email);
      toast.success("Reset link sent to your email");
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to send reset link";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (token, password) => {
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      toast.success("Password reset successful!");
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to reset password";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    signup,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
