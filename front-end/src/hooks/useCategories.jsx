import React, { createContext, useContext, useState } from "react";
// import toast from 'react-hot-toast';

const CategoryContext = createContext(null);

export const CategoryProvider = ({ children }) => {
  // DUMMY DATA - Replace with API Call (GET /categories)
  const [categories, setCategories] = useState([
    { id: 'default-1', name: 'general', color: '#6366f1' }, 
    { id: 'default-2', name: 'design', color: '#f97316' }, 
    { id: 'default-3', name: 'dev', color: '#10b981' },
  ]);

  const addCategory = (name, color = '#6366f1') => {
    // API Call: POST /categories
    const newCategory = { id: Date.now(), name, color };
    setCategories((prev) => [...prev, newCategory]);
    // toast.success(`Category '${name}' added.`);
  };

  const deleteCategory = (id) => {
    // API Call: DELETE /categories/:id
    if (id.startsWith('default-')) {
        // toast.error("Cannot delete default categories.");
        return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    // toast.success("Category deleted.");
  };

  return (
    <CategoryContext.Provider
      value={{ categories, addCategory, deleteCategory }}
    >
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