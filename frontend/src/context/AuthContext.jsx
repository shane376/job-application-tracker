import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(localStorage.getItem('access_token') && user);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH_ME);
      setUser(response.data);
    } catch (_error) {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_LOGIN, credentials);
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    await fetchCurrentUser();
  };

  const register = async (payload) => {
    await apiClient.post(API_ENDPOINTS.AUTH_REGISTER, payload);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
    }),
    [user, isLoading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
