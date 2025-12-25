import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data on mount from sessionStorage
  useEffect(() => {
    const loadUserData = () => {
      try {
        const savedToken = sessionStorage.getItem('auth_token');
        const savedUser = sessionStorage.getItem('auth_user');
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.log('No saved auth data found');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Set up axios interceptor to include token in all requests
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete api.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['x-auth-token'];
    sessionStorage.clear();
    localStorage.clear();
  };

  const login = async (email, password) => {
    try {
      clearAuthData();

      const res = await api.post("/auth/login", { email, password });

      const newToken = res.data.data.token;
      const userData = res.data.data;

      // Save to sessionStorage
      sessionStorage.setItem('auth_token', newToken);
      sessionStorage.setItem('auth_user', JSON.stringify(userData));

      // Update state
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        errorCode: err.response?.data?.errorCode,
        message: err.response?.data?.message || err.response?.data?.msg || 'Login failed'
      };
    }
  };

  const completeLogin = async (email) => {
    try {
      clearAuthData();

      const res = await api.post("/auth/complete-login", { email });

      const newToken = res.data.data.token;
      const userData = res.data.data;

      // Save to sessionStorage
      sessionStorage.setItem('auth_token', newToken);
      sessionStorage.setItem('auth_user', JSON.stringify(userData));

      // Update state
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (err) {
      console.error('Complete login error:', err);
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.msg || 'Login completion failed'
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      clearAuthData();

      const res = await api.post("/auth/register", { name, email, password });

      const newToken = res.data.data.token;
      const userData = res.data.data;

      // Save to sessionStorage
      sessionStorage.setItem('auth_token', newToken);
      sessionStorage.setItem('auth_user', JSON.stringify(userData));

      // Update state
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (err) {
      console.error('Signup error:', err);
      return {
        success: false,
        errorCode: err.response?.data?.errorCode,
        message: err.response?.data?.message || err.response?.data?.msg || 'Signup failed'
      };
    }
  };

  const verifyEmail = async (email) => {
    try {
      clearAuthData();

      const res = await api.post("/auth/verify-email", { email });

      const newToken = res.data.data.token;
      const userData = res.data.data;

      // Save to sessionStorage
      sessionStorage.setItem('auth_token', newToken);
      sessionStorage.setItem('auth_user', JSON.stringify(userData));

      // Update state
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (err) {
      console.error('Verify email error:', err);
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.msg || 'Email verification failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['x-auth-token'];
    
    // Clear sessionStorage
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
  };

  // Helper to update user data (for profile updates)
  const updateUser = (newUserData) => {
    setUser(newUserData);
    // Update sessionStorage
    sessionStorage.setItem('auth_user', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      loading,
      setUser: updateUser, 
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