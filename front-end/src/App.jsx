import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";
import MainLayout from "./layouts/MainLayout.jsx";

import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import Home from "./pages/Home.jsx";
import Upcoming from "./pages/Upcoming.jsx"; 
import CalendarPage from "./pages/Calendar.jsx";
import Categories from "./pages/Categories.jsx";
import Analysis from "./pages/Analysis.jsx";
import Archived from "./pages/Archived.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Prevents redirecting to login while the backend is still verifying the token
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, loading } = useAuth();

  // If the app is checking for an existing session, show nothing or a splash screen
  if (loading) return null; 

  return (
    <BrowserRouter>
      <Routes>
        {/* 🔓 Public routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/" replace /> : <SignUp />} 
        />

        {/* 🔒 Protected Layout Route */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/upcoming" element={<Upcoming />} /> 
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/archived" element={<Archived />} />
            <Route path="/settings" element={<Settings />} />
        </Route>

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}