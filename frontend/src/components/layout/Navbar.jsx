import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

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
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center space-x-1.5">
              <span>SecureVault</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                AES-256-GCM
              </span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/vault"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/vault')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Mi Bóveda
              </Link>

              <Link
                to="/profile"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Perfil
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/admin')
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                      : 'text-purple-300 hover:text-purple-200 hover:bg-purple-950/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                  <span>Admin</span>
                </Link>
              )}

              <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block"></div>

              <div className="hidden sm:flex flex-col items-end text-xs">
                <span className="text-slate-200 font-medium truncate max-w-[130px]">
                  {user.fullName || user.email}
                </span>
                <span className="text-slate-500 text-[10px] font-mono capitalize">
                  {user.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 transition-colors"
                title="Cerrar sesión de forma segura"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/login')
                    ? 'text-cyan-400 bg-slate-800'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold shadow-sm shadow-cyan-500/20 transition-colors"
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
