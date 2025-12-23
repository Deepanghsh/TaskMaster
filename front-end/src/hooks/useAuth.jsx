import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import api from "../services/api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  const updateProfile = async ({ name, email, mobile, dob, gender }) => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // FIXED: Remove /api prefix (api service already adds it)
      const res = await api.put('/auth/profile', 
        { name, email, mobile, dob, gender },
        { headers: { 'x-auth-token': token } }
      );

      // Update local state and storage
      const newUserData = res.data.user;
      context.setUser(newUserData);
      localStorage.setItem("user", JSON.stringify(newUserData));

      return { type: 'success', text: 'Profile updated successfully!' };
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMsg = error.response?.data?.msg || 'Failed to update profile.';
      return { type: 'error', text: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // FIXED: Remove /api prefix
      await api.delete('/auth/account', {
        headers: { 'x-auth-token': token }
      });

      // Logout and clear data
      context.logout();
      return true;
    } catch (error) {
      console.error('Delete account error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // FIXED: Remove /api prefix
      const userRes = await api.get('/auth/export-data', {
        headers: { 'x-auth-token': token }
      });

      // Get all todos
      const todosRes = await api.get('/todos', {
        headers: { 'x-auth-token': token }
      });

      // Combine data
      const exportData = {
        ...userRes.data,
        todos: todosRes.data
      };

      return exportData;
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  };

  const importData = async (data) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Import user data
      if (data.user) {
        // FIXED: Remove /api prefix
        await api.post('/auth/import-data',
          { data },
          { headers: { 'x-auth-token': token } }
        );

        // Refresh user data
        const userRes = await api.get('/auth/user', {
          headers: { 'x-auth-token': token }
        });

        const updatedUser = userRes.data;
        context.setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // Import todos if present
      if (data.todos && Array.isArray(data.todos)) {
        console.log('Todos import:', data.todos.length, 'tasks');
      }

      return { success: true };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...context,
    updateProfile,
    deleteAccount,
    exportData,
    importData,
    isLoading
  };
};