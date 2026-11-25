import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

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
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      if (err.status === 429) {
        setIsRateLimited(true);
        setError(err.message || 'Límite de tasa excedido. Por seguridad, espera 15 minutos.');
      } else if (err.status === 423) {
        setIsLocked(true);
        setError(err.message || 'Cuenta temporalmente bloqueada por 5 intentos fallidos.');
      } else {
        setError(err.message || 'Credenciales inválidas');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Acceso a la Bóveda</h2>
          <p className="mt-1 text-sm text-slate-400">
            Autenticación protegida con Argon2id y cookies HttpOnly
          </p>
        </div>

        {error && (
          <div
            className={`p-4 rounded-xl text-sm font-medium border ${
              isRateLimited
                ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                : isLocked
                ? 'bg-rose-950/50 border-rose-800 text-rose-300'
                : 'bg-rose-950/30 border-rose-900/40 text-rose-300'
            }`}
          >
            <div className="flex items-start space-x-2.5">
              <span className="text-lg">{isRateLimited ? '⏳' : isLocked ? '🔒' : '⚠️'}</span>
              <div>
                <p className="font-semibold">
                  {isRateLimited ? 'Alerta HTTP 429 (Rate Limit)' : isLocked ? 'Cuenta Bloqueada (HTTP 423)' : 'Error de Autenticación'}
                </p>
                <p className="text-xs mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu-correo@ejemplo.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
              disabled={loading || isRateLimited}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Contraseña</label>
              <Link
                to="/forgot-password"
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
              disabled={loading || isRateLimited}
            />
          </div>

          <button
            type="submit"
            disabled={loading || isRateLimited}
            className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-cyan-500/20"
          >
            {loading ? 'Verificando credenciales...' : 'Desbloquear Bóveda'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800/80">
          ¿No tienes una cuenta aún?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-medium">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
