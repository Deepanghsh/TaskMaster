import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; 
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CategoryProvider } from './hooks/useCategories';
import { TodoProvider } from './hooks/useTodos';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 1. AuthProvider must be near the top as many components rely on user state */}
    <AuthProvider>
      {/* 2. ThemeProvider manages dark/light mode for global styling */}
      <ThemeProvider>
        {/* 3. CategoryProvider provides the list of task categories */}
        <CategoryProvider>
          {/* 4. TodoProvider manages the main list of tasks (To-Dos) */}
          <TodoProvider>
            {/* 5. App contains the routing and UI elements */}
            <App />
          </TodoProvider>
        </CategoryProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);