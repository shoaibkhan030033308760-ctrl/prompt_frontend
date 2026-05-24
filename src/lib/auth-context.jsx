'use client';
// src/lib/auth-context.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { logout as apiLogout } from './api';

const AuthContext = createContext({
  user: null,
  token: null,
  setAuth: () => {},
  clearAuth: () => {},
  isLoggedIn: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const saved = Cookies.get('token');
    const savedUser = localStorage.getItem('user');
    if (saved && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(saved);
      } catch {}
    }
  }, []);

  const setAuth = (u, t) => {
    setUser(u);
    setToken(t);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const clearAuth = async () => {
    try { await apiLogout(); } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    Cookies.remove('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, setAuth, clearAuth, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
