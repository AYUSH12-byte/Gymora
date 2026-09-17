import React, { createContext, useContext, useEffect, useState } from "react";

import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load stored user when app starts
  const loadUser = async () => {
    try {
      const storedUser = await authService.getStoredUser();

      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.log("Load user error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Login
  const login = async (email, password, rememberMe = false) => {
    const data = await authService.login(email, password, rememberMe);

    setUser(data.user);

    return data;
  };

  // Register
  const register = async (name, email, password) => {
    return await authService.register(name, email, password);
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.log("Logout error:", error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
