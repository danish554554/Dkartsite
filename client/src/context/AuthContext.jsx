import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('dkart_token'));
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session expired or invalid:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success) {
      localStorage.setItem('dkart_token', res.token);
      setToken(res.token);
      setUser(res.user);
      addToast(`Welcome back, ${res.user.name}!`, 'success');
      return res.user;
    }
  };

  const register = async (name, email, password, phone) => {
    const res = await api.register({ name, email, password, phone });
    if (res.success) {
      localStorage.setItem('dkart_token', res.token);
      setToken(res.token);
      setUser(res.user);
      addToast('Welcome to Dkart! Your account was created.', 'success');
      return res.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('dkart_token');
    setToken(null);
    setUser(null);
    addToast('You have been logged out.', 'info');
  };

  const updateProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    if (res.success) {
      setUser((prev) => ({ ...prev, ...res.user }));
      addToast('Profile updated successfully.', 'success');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
