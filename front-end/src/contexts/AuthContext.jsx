import React, { createContext, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        errorCode: err.response?.data?.errorCode,
        message: err.response?.data?.msg
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await api.post("/auth/signup", { name, email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        errorCode: err.response?.data?.errorCode,
        message: err.response?.data?.msg
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
