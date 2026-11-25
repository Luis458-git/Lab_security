import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Shield, Lock, FileText, User, LogOut, ShieldAlert } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-vault-card/90 backdrop-blur-md border-b border-vault-border transition-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-lg bg-vault-surface border border-vault-border flex items-center justify-center text-vault-emerald group-hover:border-vault-emerald transition-colors">
            <Lock className="w-5 h-5 text-vault-emerald" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
              SecureVault
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-vault-emerald border border-emerald-800/40 font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-vault-emerald animate-pulse"></span>
              AES-256-GCM • TLS
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center space-x-2 sm:space-x-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/vault"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isActive('/vault')
                    ? 'bg-vault-surface text-vault-emerald border border-vault-emerald/40'
                    : 'text-gray-300 hover:text-white hover:bg-vault-surface/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Bóveda</span>
              </Link>

              <Link
                to="/profile"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'bg-vault-surface text-vault-emerald border border-vault-emerald/40'
                    : 'text-gray-300 hover:text-white hover:bg-vault-surface/60'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Perfil</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'bg-purple-950/60 text-purple-300 border border-purple-700/60'
                      : 'text-purple-300 hover:text-purple-200 hover:bg-purple-950/30'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  <span>Admin</span>
                </Link>
              )}

              <div className="h-5 w-px bg-vault-border mx-1 hidden sm:block"></div>

              <div className="hidden md:flex flex-col items-end text-xs pr-1">
                <span className="text-gray-200 font-medium truncate max-w-[130px]">
                  {user.fullName || user.email}
                </span>
                <span className="text-gray-500 text-[10px] font-mono capitalize">
                  {user.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-gray-400 hover:text-vault-red hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-colors"
                title="Cerrar sesión de forma segura"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isActive('/login')
                    ? 'text-vault-emerald bg-vault-surface'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-vault-emerald hover:bg-emerald-400 text-vault-bg transition-colors shadow-sm shadow-emerald-900/30"
              >
                Crear Bóveda
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
