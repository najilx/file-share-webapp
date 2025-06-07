// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error('Failed to parse stored user:', err);
      setUser(null);
    }
  }, []);

  // Login with JWT
  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post('login/', { email, password });

      const { access, refresh, user: userData } = res.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      navigate('/files');
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message);
      throw err;
    }
  };

  // Logout (frontend-only for now)
  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      // Optional: Call backend to blacklist refresh token
      await axiosInstance.post('logout/', { refresh: refreshToken });
    } catch (err) {
      console.warn('Logout API call failed (ignored):', err.response?.data || err.message);
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
