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
    <header className="sticky top-0 z-40 bg-[#002E22] border-b border-[#0B533E] h-16 flex items-center shadow-md">
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-14 flex items-center justify-between gap-4">
        {/* Left: Expensify-style Bright Green Circle Logo & Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-full bg-[#03D47C] text-[#002E22] flex items-center justify-center font-extrabold text-sm tracking-tighter group-hover:scale-105 transition-transform shadow-sm">
              SV
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              SecureVault
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                isActive('/')
                  ? 'bg-[#0B533E] text-[#03D47C]'
                  : 'text-[#C2F5DF] hover:text-white hover:bg-[#064232]'
              }`}
            >
              Inicio
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/vault"
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    isActive('/vault')
                      ? 'bg-[#0B533E] text-[#03D47C]'
                      : 'text-[#C2F5DF] hover:text-white hover:bg-[#064232]'
                  }`}
                >
                  Bóveda
                </Link>
                <Link
                  to="/profile"
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    isActive('/profile')
                      ? 'bg-[#0B533E] text-[#03D47C]'
                      : 'text-[#C2F5DF] hover:text-white hover:bg-[#064232]'
                  }`}
                >
                  Perfil PII
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                      isActive('/admin')
                        ? 'bg-[#03D47C] text-[#002E22]'
                        : 'text-[#03D47C] hover:bg-[#064232]'
                    }`}
                  >
                    SecOps
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Center: Pill Search Trigger in Deep Forest Green */}
        <div
          onClick={() => navigate(isAuthenticated ? '/vault' : '/')}
          className="hidden lg:flex items-center w-80 xl:w-96 h-10 px-4 rounded-full bg-[#064232] hover:bg-[#0B533E] border border-[#03D47C]/25 text-xs text-[#C2F5DF] cursor-pointer transition-all"
        >
          <Search className="w-3.5 h-3.5 mr-2.5 text-[#03D47C]" />
          <span>Buscar en bóveda y módulos...</span>
          <span className="ml-auto text-[10px] font-mono bg-[#002E22] px-2.5 py-0.5 rounded-full text-[#03D47C] font-bold">
            AES-256
          </span>
        </div>

        {/* Right: Expensify Pill Buttons */}
        <div className="flex items-center space-x-2.5">
          {isAuthenticated ? (
            <>
              <Link
                to="/vault"
                className={`md:hidden px-3 py-1.5 rounded-full text-xs font-bold ${
                  isActive('/vault') ? 'bg-[#03D47C] text-[#002E22]' : 'bg-[#064232] text-[#03D47C]'
                }`}
              >
                Bóveda
              </Link>

              <Link
                to="/profile"
                className="flex items-center gap-2 pl-1.5 pr-3.5 py-1 rounded-full bg-[#064232] hover:bg-[#0B533E] border border-[#03D47C]/30 transition-colors"
                title="Ver perfil de seguridad"
              >
                <div className="w-6 h-6 rounded-full bg-[#03D47C] text-[#002E22] text-[11px] font-extrabold flex items-center justify-center font-mono">
                  {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-white truncate max-w-[120px]">
                  {user.fullName || user.email}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="h-9 px-3.5 rounded-full bg-[#064232] hover:bg-rose-950 text-[#C2F5DF] hover:text-rose-300 border border-[#0B533E] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
                className="h-9 px-4 rounded-full bg-[#0B533E] hover:bg-[#0e6b50] text-[#03D47C] text-xs sm:text-sm font-bold flex items-center transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="btn-expensify h-9 px-4 rounded-full text-xs sm:text-sm inline-flex items-center gap-1.5"
              >
                <span>Comenzar Gratis</span>
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
