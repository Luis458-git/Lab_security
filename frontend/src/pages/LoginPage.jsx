import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Lock, Mail, AlertOctagon, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/vault';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsRateLimited(false);
    setIsLocked(false);

    if (!email || !password) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      if (err.status === 429) {
        setIsRateLimited(true);
        setError(err.message || 'Has superado el número máximo de intentos permitidos. Por favor, espera 15 minutos antes de reintentar.');
      } else if (err.status === 423) {
        setIsLocked(true);
        setError(err.message || 'Cuenta temporalmente bloqueada por 5 intentos fallidos consecutivos.');
      } else {
        setError(err.message || 'Credenciales inválidas');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-vault-card border border-vault-border p-8 rounded-2xl shadow-xl transition-surface">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-vault-surface border border-vault-border rounded-xl flex items-center justify-center text-vault-emerald mb-3">
            <Lock className="w-6 h-6 text-vault-emerald" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Acceso a la Bóveda</h2>
          <p className="mt-1 text-xs text-gray-400">
            Autenticación lenta con Argon2id y cookies de sesión HttpOnly
          </p>
        </div>

        {/* Banner destacado de Bloqueo por Fuerza Bruta (HTTP 429 / 423 - A07) */}
        {isRateLimited && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-vault-amber/80 text-vault-amber text-xs space-y-1 animate-fade-in shadow-lg shadow-amber-950/20">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-200">
              <AlertOctagon className="w-4 h-4 text-vault-amber shrink-0" />
              <span>Bloqueo por Fuerza Bruta (HTTP 429)</span>
            </div>
            <p className="text-amber-300 leading-relaxed pt-0.5">
              {error}
            </p>
          </div>
        )}

        {isLocked && !isRateLimited && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-vault-red/80 text-vault-red text-xs space-y-1 animate-fade-in shadow-lg shadow-rose-950/20">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-200">
              <ShieldAlert className="w-4 h-4 text-vault-red shrink-0" />
              <span>Cuenta Temporalmente Bloqueada (HTTP 423)</span>
            </div>
            <p className="text-rose-300 leading-relaxed pt-0.5">
              {error}
            </p>
          </div>
        )}

        {error && !isRateLimited && !isLocked && (
          <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-vault-red text-xs font-medium flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 shrink-0 text-vault-red" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-correo@ejemplo.com"
                className="w-full bg-vault-bg border border-vault-border rounded-lg pl-10 pr-3.5 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-vault-emerald text-sm transition-colors"
                disabled={loading || isRateLimited}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-gray-300">Contraseña</label>
              <Link
                to="/forgot-password"
                className="text-xs text-vault-emerald hover:text-emerald-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-vault-bg border border-vault-border rounded-lg pl-10 pr-3.5 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-vault-emerald text-sm transition-colors"
                disabled={loading || isRateLimited}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isRateLimited}
            className="w-full py-2.5 px-4 rounded-lg bg-vault-emerald hover:bg-emerald-400 text-vault-bg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-950/40 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando con Argon2id...</span>
              </>
            ) : (
              <>
                <span>Desbloquear Bóveda</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-3 border-t border-vault-border">
          ¿No tienes una cuenta aún?{' '}
          <Link to="/register" className="text-vault-emerald hover:underline font-medium">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
