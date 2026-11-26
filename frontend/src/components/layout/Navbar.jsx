import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { FileText, User, LogOut, ShieldAlert, ArrowRight } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white border-b border-mobbin-border transition-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo tipográfico discreto */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-lg bg-mobbin-dark text-white flex items-center justify-center font-bold text-sm tracking-tight font-mono">
            SV
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="text-base font-bold tracking-tight text-mobbin-text font-sans">
              SecureVault
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-mobbin-surface text-mobbin-muted border border-mobbin-border font-mono font-medium">
              AES-256-GCM
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center space-x-1.5 sm:space-x-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/vault"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                  isActive('/vault')
                    ? 'bg-mobbin-surface text-mobbin-text font-semibold border border-mobbin-border'
                    : 'text-mobbin-muted hover:text-mobbin-text hover:bg-mobbin-surface/70 font-medium'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Bóveda</span>
              </Link>

              <Link
                to="/profile"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                  isActive('/profile')
                    ? 'bg-mobbin-surface text-mobbin-text font-semibold border border-mobbin-border'
                    : 'text-mobbin-muted hover:text-mobbin-text hover:bg-mobbin-surface/70 font-medium'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Perfil</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                    isActive('/admin')
                      ? 'bg-mobbin-dark text-white font-semibold'
                      : 'text-mobbin-text font-medium hover:bg-mobbin-surface border border-mobbin-border'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>SecOps</span>
                </Link>
              )}

              <div className="h-5 w-px bg-mobbin-border mx-1.5 hidden sm:block"></div>

              <div className="hidden md:flex flex-col items-end text-xs pr-1">
                <span className="text-mobbin-text font-medium truncate max-w-[140px]">
                  {user.fullName || user.email}
                </span>
                <span className="text-mobbin-muted text-[10px] font-mono capitalize">
                  Rol: {user.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-mobbin-muted hover:text-status-danger hover:bg-status-dangerBg transition-colors"
                title="Cerrar sesión de forma segura"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isActive('/login')
                    ? 'text-mobbin-text font-semibold'
                    : 'text-mobbin-muted hover:text-mobbin-text'
                }`}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-mobbin-dark hover:bg-mobbin-darkHover text-white text-xs sm:text-sm font-medium transition-colors shadow-xs"
              >
                <span>Registrarse</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
