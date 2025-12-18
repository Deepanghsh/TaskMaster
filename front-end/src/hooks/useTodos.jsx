import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api.js";

const TodoContext = createContext(null);

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Wrapped in useCallback to prevent unnecessary re-renders in components
  const fetchTodos = useCallback(async () => {
    try {
      const res = await api.get("/todos");
      setTodos(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTodo = async (text, category = 'general', dueDate = '', priority = 'Medium', description = '') => {
    if (!text.trim()) return;
    try {
      const res = await api.post("/todos", { text, category, dueDate, priority, description });
      // Functional update to ensure we use the latest state
      setTodos((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const updateTodo = async (id, newText) => {
    try {
      const res = await api.put(`/todos/${id}`, { text: newText });
      setTodos((prev) => prev.map((todo) => todo._id === id ? res.data : todo));
    } catch (err) {
      console.error("Error updating text:", err);
    }
  };

  const updateTodoField = async (id, field, value) => {
    try {
      const res = await api.put(`/todos/${id}`, { [field]: value });
      setTodos((prev) => prev.map((todo) => todo._id === id ? res.data : todo));
    } catch (err) {
      console.error("Error updating field:", err);
    }
  };

  const toggleTodo = async (id) => {
    const todoToToggle = todos.find(t => t._id === id);
    if (!todoToToggle) return;
    try {
      const res = await api.put(`/todos/${id}`, { completed: !todoToToggle.completed });
      setTodos((prev) => prev.map((todo) => todo._id === id ? res.data : todo));
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const archiveTodo = async (id) => {
    try {
      const res = await api.put(`/todos/${id}`, { archived: true, completed: true });
      setTodos((prev) => prev.map((todo) => todo._id === id ? res.data : todo));
    } catch (err) {
      console.error("Error archiving task:", err);
    }
  };

  const restoreTodo = async (id) => {
    try {
      const res = await api.put(`/todos/${id}`, { archived: false, completed: false });
      setTodos((prev) => prev.map((todo) => todo._id === id ? res.data : todo));
    } catch (err) {
      console.error("Error restoring task:", err);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return (
    <TodoContext.Provider
      value={{
        todos,
        loading,
        addTodo,
        toggleTodo,
        deleteTodo,
        updateTodo,
        updateTodoField,
        archiveTodo,
        restoreTodo,
        fetchTodos
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodos must be used within TodoProvider");
  }
  return context;
};