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
      const res = await api.put('/auth/me', { name, email, mobile, dob, gender });
      
      const updatedUser = res.data.data;
      context.setUser(updatedUser);
      
      return { type: 'success', text: 'Profile updated successfully!' };
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update profile.';
      return { type: 'error', text: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      await api.delete('/auth/me');
      
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
      const userRes = await api.get('/auth/me');
      const todosRes = await api.get('/todos');
      const categoriesRes = await api.get('/categories');
      
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        user: userRes.data.data || userRes.data,
        todos: todosRes.data,
        categories: categoriesRes.data
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
      // Import todos if present
      if (data.todos && Array.isArray(data.todos)) {
        for (const todo of data.todos) {
          try {
            await api.post('/todos', {
              text: todo.text,
              category: todo.category || 'general',
              dueDate: todo.dueDate || '',
              priority: todo.priority || 'Medium',
              description: todo.description || '',
              completed: todo.completed || false,
              archived: todo.archived || false
            });
          } catch (err) {
            console.log('Error importing todo:', todo.text, err);
          }
        }
      }
      
      // Import categories if present
      if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
          try {
            await api.post('/categories', {
              name: category.name,
              color: category.color
            });
          } catch (err) {
            // Ignore duplicate category errors
            console.log('Category already exists or error:', category.name);
          }
        }
      }
      
      // Refresh user data
      const userRes = await api.get('/auth/me');
      const updatedUser = userRes.data.data || userRes.data;
      context.setUser(updatedUser);
      
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