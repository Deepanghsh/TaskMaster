import React, { createContext, useContext, useState } from "react";
// import toast from 'react-hot-toast';

const TodoContext = createContext(null);

export const TodoProvider = ({ children }) => {
  // DUMMY DATA - Replace with API Call (GET /todos)
  const [todos, setTodos] = useState([]);

  // MODIFIED: Accepts category, dueDate, and priority
  const addTodo = (text, category = 'general', dueDate = '', priority = 'Medium') => {
    // API Call: POST /todos
    if (!text.trim()) return;
    const newTask = { 
        id: Date.now(), 
        text, 
        completed: false, 
        archived: false, 
        category, 
        dueDate, 
        priority 
    };
    setTodos((prev) => [...prev, newTask]);
    // toast.success("Task added!");
  };

  const updateTodo = (id, newText) => {
    // API Call: PUT /todos/:id { text: newText }
    setTodos((prev) =>
        prev.map((todo) =>
            todo.id === id ? { ...todo, text: newText } : todo
        )
    );
  };
    
  const updateTodoField = (id, field, value) => {
    // API Call: PUT /todos/:id { [field]: value }
    setTodos((prev) =>
        prev.map((todo) =>
            todo.id === id ? { ...todo, [field]: value } : todo
        )
    );
  };
    
  const toggleTodo = (id) => {
    // API Call: PUT /todos/:id { completed: !todo.completed }
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
    // toast.success("Task status updated!");
  };

  const deleteTodo = (id) => {
    // API Call: DELETE /todos/:id
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    // toast.success("Task permanently deleted.");
  };

  const archiveTodo = (id) => {
    // API Call: PUT /todos/:id { archived: true }
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, archived: true, completed: true } : todo
      )
    );
    // toast('Task archived!', { icon: '📦' });
  };

  const restoreTodo = (id) => {
    // API Call: PUT /todos/:id { archived: false }
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, archived: false, completed: false } : todo
      )
    );
    // toast.success("Task restored.");
  };


  return (
    <TodoContext.Provider
      value={{ 
          todos, 
          addTodo, 
          toggleTodo, 
          deleteTodo, 
          updateTodo, 
          updateTodoField, 
          archiveTodo, 
          restoreTodo 
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