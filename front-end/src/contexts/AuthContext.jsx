import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor to include token in all requests
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token set in axios:', token.substring(0, 20) + '...');
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const token = res.data.data.token;
      const userData = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        errorCode: err.response?.data?.errorCode,
        message: err.response?.data?.message || err.response?.data?.msg
      };
    }
  };

  // Complete login after OTP verification
  const completeLogin = async (email) => {
    try {
      const res = await api.post("/auth/complete-login", { email });

      const token = res.data.data.token;
      const userData = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);

      return { success: true };
    } catch (err) {
      console.error('Complete login error:', err);
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.msg
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });

      const token = res.data.data.token;
      const userData = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);

      return { success: true };
    } catch (err) {
      console.error('Signup error:', err);
      return {
        success: false,
        errorCode: err.response?.data?.errorCode,
        message: err.response?.data?.message || err.response?.data?.msg
      };
    }
  };

  // Verify email after OTP verification
  const verifyEmail = async (email) => {
    try {
      const res = await api.post("/auth/verify-email", { email });

      const token = res.data.data.token;
      const userData = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);

      return { success: true };
    } catch (err) {
      console.error('Verify email error:', err);
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.msg
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      setUser, 
      login, 
      completeLogin,
      signup, 
      verifyEmail,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};