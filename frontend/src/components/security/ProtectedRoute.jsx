import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck, Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-vault-emerald animate-spin" />
        <span className="text-xs text-gray-400 font-mono tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-vault-emerald" />
          Verificando sesión criptográfica...
        </span>
      </div>
    );
  }

  // Si no hay sesión válida, redirigir al login preservando ruta de origen
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se exige un rol específico (ej. 'admin') y el usuario no lo tiene, denegar acceso
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/vault" replace />;
  }

  return children;
};

export default ProtectedRoute;
