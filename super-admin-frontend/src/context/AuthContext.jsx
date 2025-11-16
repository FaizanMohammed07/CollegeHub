import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../services/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() =>
    localStorage.getItem("superAdminToken")
  );
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    authAPI
      .me()
      .then((res) => setProfile(res.data.data))
      .catch(() => {
        setToken(null);
        localStorage.removeItem("superAdminToken");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const authToken = response.data.data.token;
    localStorage.setItem("superAdminToken", authToken);
    setToken(authToken);
    setProfile(response.data.data.profile);
  };

  const logout = () => {
    localStorage.removeItem("superAdminToken");
    setToken(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ token, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
