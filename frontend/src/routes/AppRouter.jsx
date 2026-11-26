import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from '../components/security/ProtectedRoute.jsx';

import LandingPage from '../pages/LandingPage.jsx';
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-white">
        <div className="w-7 h-7 border-2 border-[#E5E5E5] border-t-[#141414] rounded-full animate-spin"></div>
        <p className="text-xs text-[#666666] font-mono tracking-wider">Inicializando SecureVault...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Página Principal Estilo Mobbin Screen Browser */}
      <Route path="/" element={<LandingPage />} />

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

      {/* Ruta Protegida por Rol Administrador (RF-07, OWASP A01:2025) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback 404 */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default AppRouter;
