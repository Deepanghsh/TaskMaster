import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";
import { NotificationProvider } from "./hooks/useNotifications.jsx";
import MainLayout from "./layouts/MainLayout.jsx";

import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import OTPVerification from "./pages/OTPVerification.jsx";
import Home from "./pages/Home.jsx";
import Upcoming from "./pages/Upcoming.jsx"; 
import CompletedTasks from "./pages/CompletedTasks.jsx"; // ✅ ADDED
import CalendarPage from "./pages/Calendar.jsx";
import Categories from "./pages/Categories.jsx";
import Analysis from "./pages/Analysis.jsx";
import Archived from "./pages/Archived.jsx";
import Settings from "./pages/Settings.jsx";
import NotificationSettings from "./pages/NotificationSettings.jsx";
import NotFound from "./pages/NotFound.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

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

  if (loading) return null; 

  return (
    <BrowserRouter>
      {/* Wrap NotificationProvider inside BrowserRouter and only around protected routes */}
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/" replace /> : <SignUp />} 
        />
        <Route 
          path="/verify-otp" 
          element={user ? <Navigate to="/" replace /> : <OTPVerification />} 
        />

        {/* Protected Routes with NotificationProvider */}
        <Route element={
          <ProtectedRoute>
            <NotificationProvider>
              <MainLayout />
            </NotificationProvider>
          </ProtectedRoute>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/upcoming" element={<Upcoming />} /> 
          <Route path="/completed" element={<CompletedTasks />} /> {/* ✅ ADDED */}
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/archived" element={<Archived />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notification-settings" element={<NotificationSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}