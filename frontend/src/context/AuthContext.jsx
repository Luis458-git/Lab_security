import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificación de sesión segura al iniciar la aplicación (HttpOnly Cookie)
  const verifySession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authService.getMe();
      if (res?.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Advertencia durante logout:', err);
    } finally {
      // Limpieza total del estado de sesión en memoria
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await verifySession();
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
