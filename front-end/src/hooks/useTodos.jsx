import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import api from "../services/api.js";

const TodoContext = createContext(null);

export const TodoProvider = ({ children }) => {
  const { user } = useAuth(); // Listen to auth changes
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/todos");
      setTodos(res.data);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Error fetching tasks:", err);
      }
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch todos when user logs in/out
  useEffect(() => {
    if (user) {
      fetchTodos();
    } else {
      setTodos([]);
      setLoading(false);
    }
  }, [user, fetchTodos]);

  const addTodo = async (text, category = "general", dueDate = "", priority = "Medium", description = "") => {
    if (!text.trim()) return;
    try {
      const res = await api.post("/todos", { text, category, dueDate, priority, description });
      setTodos((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const updateTodo = async (id, newText) => {
    try {
      const res = await api.put(`/todos/${id}`, { text: newText });
      setTodos((prev) => prev.map((todo) => (todo._id === id ? res.data : todo)));
    } catch (err) {
      console.error("Error updating text:", err);
    }
  };

  const updateTodoField = async (id, field, value) => {
    try {
      const res = await api.put(`/todos/${id}`, { [field]: value });
      setTodos((prev) => prev.map((todo) => (todo._id === id ? res.data : todo)));
    } catch (err) {
      console.error("Error updating field:", err);
    }
  };

  const toggleTodo = async (id) => {
    const todoToToggle = todos.find((t) => t._id === id);
    if (!todoToToggle) return;
    try {
      const isCompleting = !todoToToggle.completed;
      const res = await api.put(`/todos/${id}`, { 
        completed: isCompleting,
        completedAt: isCompleting ? new Date().toISOString() : null 
      });
      setTodos((prev) => prev.map((todo) => (todo._id === id ? res.data : todo)));
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
      const res = await api.put(`/todos/${id}`, { 
        archived: true, 
        completed: true,
        completedAt: new Date().toISOString() 
      });
      setTodos((prev) => prev.map((todo) => (todo._id === id ? res.data : todo)));
    } catch (err) {
      console.error("Error archiving task:", err);
    }
  };

  const restoreTodo = async (id) => {
    try {
      const res = await api.put(`/todos/${id}`, { 
        archived: false, 
        completed: false,
        completedAt: null 
      });
      setTodos((prev) => prev.map((todo) => (todo._id === id ? res.data : todo)));
    } catch (err) {
      console.error("Error restoring task:", err);
    }
  };

  return (
    <TodoContext.Provider value={{ todos, loading, addTodo, toggleTodo, deleteTodo, updateTodo, updateTodoField, archiveTodo, restoreTodo, fetchTodos }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) throw new Error("useTodos must be used within TodoProvider");
  return context;
};