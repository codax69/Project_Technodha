import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { setCookie, getCookie, removeCookie } from '../utils/cookies';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => getCookie('access_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getCookie('access_token');
      if (storedToken) {
        try {
          const res = await apiClient.get('/auth/me/');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (e) {
          removeCookie('access_token');
          removeCookie('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = (access, refresh, userData) => {
    setCookie('access_token', access, 30 / (24 * 60)); // 30 minutes
    setCookie('refresh_token', refresh, 10); // 10 days
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(access);
    setUser(userData);
  };

  const logout = async () => {
    const refresh = getCookie('refresh_token');
    if (refresh) {
      try {
        await apiClient.post('/auth/logout/', { refresh });
      } catch (e) {
        // Continue clearing cookies
      }
    }
    removeCookie('access_token');
    removeCookie('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, isAdmin, isCustomer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
