import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import api from '../services/api';

export const CategoryContext = createContext(null);

export const CategoryProvider = ({ children }) => {
  const { user } = useAuth(); // Listen to auth changes
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error("Fetch categories error:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories when user logs in/out
  useEffect(() => {
    if (user) {
      fetchCategories();
    } else {
      setCategories([]);
      setLoading(false);
    }
  }, [user]);

  const addCategory = async (name, color) => {
    try {
      const res = await api.post('/categories', { name, color });
      setCategories((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Add category error:", err);
      alert("Failed to add category. It might already exist.");
    }
  };

  const deleteCategory = async (id) => {
    if (!id) {
      console.error("No ID provided for deletion");
      return;
    }
    
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (err) {
      console.error("Delete category error:", err);
      alert("Failed to delete category");
    }
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, deleteCategory, loading }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within CategoryProvider");
  }
  return context;
};