import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchCurrentUser,
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
  logoutUser as apiLogoutUser,
} from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: Check for active session cookie on app mount
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login handler
  const login = useCallback(async ({ email, password, rememberMe = false }) => {
    const loggedInUser = await apiLoginUser({ email, password, rememberMe });
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  // Registration handler
  const register = useCallback(async ({ fullName, email, phone, password }) => {
    const newUser = await apiRegisterUser({ fullName, email, phone, password });
    setUser(newUser);
    return newUser;
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await apiLogoutUser();
    } finally {
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

