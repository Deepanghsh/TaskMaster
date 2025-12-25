import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api.js";
import { useAuth } from "../hooks/useAuth";

const TodoContext = createContext(null);

export const TodoProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    try {
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

  useEffect(() => {
    if (user && token) {
      setLoading(true);
      fetchTodos();
    } else {
      setTodos([]);
      setLoading(false);
    }
  }, [user, token, fetchTodos]);

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
      setTodos((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const updateTodoField = async (id, field, value) => {
    try {
      const res = await api.put(`/todos/${id}`, { [field]: value });
      setTodos((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error("Error updating field:", err);
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find((t) => t._id === id);
    if (!todo) return;
    try {
      const isCompleting = !todo.completed;
      const res = await api.put(`/todos/${id}`, {
        completed: isCompleting,
        completedAt: isCompleting ? new Date().toISOString() : null 
      });
      setTodos((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error("Error toggling todo:", err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  const archiveTodo = async (id) => {
    try {
      const res = await api.put(`/todos/${id}`, {
        archived: true,
        completed: true,
        completedAt: new Date().toISOString() 
      });
      setTodos((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error("Error archiving todo:", err);
    }
  };

  const restoreTodo = async (id) => {
    try {
      const res = await api.put(`/todos/${id}`, {
        archived: false,
        completed: false,
        completedAt: null 
      });
      setTodos((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error("Error restoring todo:", err);
    }
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        loading,
        fetchTodos,
        addTodo,
        updateTodo,
        updateTodoField,
        toggleTodo,
        deleteTodo,
        archiveTodo,
        restoreTodo,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) throw new Error("useTodos must be used within TodoProvider");
  return context;
};