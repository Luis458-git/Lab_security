import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Search, LogOut, ArrowRight } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] h-16 flex items-center">
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-14 flex items-center justify-between gap-4">
        {/* Left: Geometric Brand Mark & Primary Text Links (Mobbin Pattern) */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-[26%] bg-[#141414] text-white flex items-center justify-center font-extrabold text-xs tracking-tighter group-hover:scale-105 transition-transform">
              SV
            </div>
            <span className="text-base font-bold tracking-tight text-[#141414]">
              SecureVault
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-5">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                isActive('/') ? 'text-[#141414]' : 'text-[#878787] hover:text-[#141414]'
              }`}
            >
              Explorar
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/vault"
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/vault') ? 'text-[#141414]' : 'text-[#878787] hover:text-[#141414]'
                  }`}
                >
                  Bóveda
                </Link>
                <Link
                  to="/profile"
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/profile') ? 'text-[#141414]' : 'text-[#878787] hover:text-[#141414]'
                  }`}
                >
                  Perfil PII
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`text-sm font-semibold transition-colors ${
                      isActive('/admin') ? 'text-[#141414]' : 'text-[#878787] hover:text-[#141414]'
                    }`}
                  >
                    SecOps
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Center: Mobbin Pill Search Trigger */}
        <div
          onClick={() => navigate(isAuthenticated ? '/vault' : '/')}
          className="hidden lg:flex items-center w-80 xl:w-96 h-10 px-4 rounded-full bg-[#F4F4F5] hover:bg-[#EFEFF1] border border-transparent hover:border-[#E5E5E5] text-xs text-[#878787] cursor-pointer transition-all"
        >
          <Search className="w-3.5 h-3.5 mr-2.5 text-[#878787]" />
          <span>Buscar en pantallas y notas cifradas...</span>
          <span className="ml-auto text-[10px] font-mono bg-white px-2 py-0.5 rounded-full border border-[#E5E5E5] text-[#666666]">
            AES-256
          </span>
        </div>

        {/* Right: Pill Buttons & User Avatar */}
        <div className="flex items-center space-x-2.5">
          {isAuthenticated ? (
            <>
              <Link
                to="/vault"
                className={`md:hidden px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isActive('/vault') ? 'bg-[#141414] text-white' : 'bg-[#F4F4F5] text-[#141414]'
                }`}
              >
                Bóveda
              </Link>

              <Link
                to="/profile"
                className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-[#F4F4F5] hover:bg-[#EFEFF1] border border-[#E5E5E5] transition-colors"
                title="Ver perfil de seguridad"
              >
                <div className="w-6 h-6 rounded-full bg-[#141414] text-white text-[11px] font-bold flex items-center justify-center font-mono">
                  {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-[#141414] truncate max-w-[120px]">
                  {user.fullName || user.email}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="h-9 px-3.5 rounded-full bg-white hover:bg-[#FEF2F2] text-[#666666] hover:text-[#B91C1C] border border-[#E5E5E5] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="h-9 px-4 rounded-full text-xs sm:text-sm font-semibold text-[#666666] hover:text-[#141414] flex items-center transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="btn-editorial h-9 px-4 rounded-full text-xs sm:text-sm inline-flex items-center gap-1.5"
              >
                <span>Crear Bóveda</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
