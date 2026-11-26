import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Shield, FileText, User, LogOut, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#060913]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo con efecto glow */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.45)] transition-all duration-300">
            <Shield className="w-5 h-5 text-emerald-400 group-hover:rotate-6 transition-transform duration-300" />
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="text-lg font-extrabold tracking-tight text-white font-sans group-hover:text-emerald-300 transition-colors">
              Secure<span className="text-gradient-emerald">Vault</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-mono font-medium shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              AES-256-GCM
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center space-x-2 sm:space-x-2.5">
          {isAuthenticated ? (
            <>
              <Link
                to="/vault"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive('/vault')
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Bóveda</span>
              </Link>

              <Link
                to="/profile"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive('/profile')
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Perfil</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive('/admin')
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 border border-cyan-500/20'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  <span>SecOps</span>
                </Link>
              )}

              <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block"></div>

              <div className="hidden md:flex flex-col items-end text-xs pr-1">
                <span className="text-slate-200 font-semibold truncate max-w-[140px]">
                  {user.fullName || user.email}
                </span>
                <span className="text-emerald-400/80 text-[10px] font-mono uppercase tracking-wider">
                  {user.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all duration-200 cursor-pointer"
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
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive('/login')
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="btn-cyber inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Crear Bóveda</span>
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
