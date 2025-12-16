import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  const updateProfile = async ({ name, email, password, mobile, dob, gender }) => {
      setIsLoading(true);

      // 1. SECURITY CHECK (Simulated)
      if (password !== '1234') { 
          setIsLoading(false);
          return { type: 'error', text: 'Incorrect password. Changes were not saved.' };
      }

      try {
          // API Call: PUT /profile (Simulated)
          await new Promise(resolve => setTimeout(resolve, 800)); 
          
          const newUserData = { ...context.user, name, email, mobile, dob, gender }; 
          context.setUser(newUserData); 
          localStorage.setItem("user", JSON.stringify(newUserData));
          
          return { type: 'success', text: 'Profile updated successfully!' };
      } catch (error) {
          return { type: 'error', text: 'Failed to update profile.' };
      } finally {
          setIsLoading(false);
      }
  };

  const deleteAccount = async () => {
      setIsLoading(true);
      try {
          // API Call: DELETE /account (Simulated)
          await new Promise(resolve => setTimeout(resolve, 1500));
          context.logout();
          return true;
      } catch (error) {
          return false;
      } finally {
          setIsLoading(false);
      }
  };
  
  return { 
      ...context, 
      updateProfile, 
      deleteAccount, 
      isLoading 
  };
};