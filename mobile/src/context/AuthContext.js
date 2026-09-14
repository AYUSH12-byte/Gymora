import React, { createContext, useContext, useEffect, useState } from "react";

import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const login = async (email, password) => {
    const data = await authService.login(email, password);

    setUser(data.user);

    return data;
  };

  const register = async (name, email, password) => {
    return await authService.register(name, email, password);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
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
