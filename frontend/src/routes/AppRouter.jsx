import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from '../components/security/ProtectedRoute.jsx';

import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx';
import VaultPage from '../pages/VaultPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import AdminPage from '../pages/AdminPage.jsx';

export const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-9 h-9 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
        <p className="text-xs text-emerald-300/80 font-mono tracking-wider">Inicializando SecureVault...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Redirección inicial */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/vault" : "/login"} replace />}
      />

      {/* Rutas Públicas */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/vault" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/vault" replace /> : <RegisterPage />}
      />
      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      {/* Rutas Protegidas por Autenticación (RF-04, RF-05) */}
      <Route
        path="/vault"
        element={
          <ProtectedRoute>
            <VaultPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Ruta Protegida con RBAC de Administrador en Servidor (RF-07, RF-03) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback de 404 */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default AppRouter;
