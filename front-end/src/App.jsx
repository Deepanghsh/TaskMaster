import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import MainLayout from "./layouts/MainLayout";


import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Upcoming from "./pages/Upcoming"; 
import CalendarPage from "./pages/Calendar";
import Categories from "./pages/Categories";
import Analysis from "./pages/Analysis";
import Archived from "./pages/Archived";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";


function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 Public routes */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignUp />} />

        {/* 🔒 Protected Layout Route (Modular Approach) */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/upcoming" element={<Upcoming />} /> 
            <Route path="/calendar" element={<CalendarPage />} /> {/* Using CalendarPage component */}
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