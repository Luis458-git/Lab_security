import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, AlertCircle, ShieldAlert, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Columna Izquierda: Formulario Editorial */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 max-w-xl mx-auto w-full">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-mobbin-surface border border-mobbin-border text-[11px] font-mono text-mobbin-muted mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
            Zero-Trust Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-mobbin-text mb-2">
            Inicia sesión en SecureVault
          </h1>
          <p className="text-sm text-mobbin-muted">
            Protección de identidad con Argon2id y sesiones HttpOnly blindadas.
          </p>
        </div>

        {/* Alerta Rate Limit (HTTP 429) - Estilo sobrio ámbar */}
        {isRateLimited && (
          <div className="mb-6 p-4 rounded-lg bg-status-warningBg border border-status-warningBorder text-status-warning text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Límite de solicitudes excedido (HTTP 429)</span>
            </div>
            <p className="text-[13px] leading-relaxed text-amber-900">
              {error}
            </p>
          </div>
        )}

        {/* Alerta Cuenta Bloqueada (HTTP 423) - Estilo sobrio rojo */}
        {isLocked && !isRateLimited && (
          <div className="mb-6 p-4 rounded-lg bg-status-dangerBg border border-status-dangerBorder text-status-danger text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Cuenta Bloqueada Temporalmente (HTTP 423)</span>
            </div>
            <p className="text-[13px] leading-relaxed text-red-900">
              {error}
            </p>
          </div>
        )}

        {/* Error Estándar */}
        {error && !isRateLimited && !isLocked && (
          <div className="mb-6 p-3.5 rounded-lg bg-status-dangerBg border border-status-dangerBorder text-status-danger text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-mobbin-text mb-1.5 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@ejemplo.com"
                className="w-full bg-white border border-mobbin-border rounded-lg px-3.5 py-2.5 text-sm text-mobbin-text placeholder-mobbin-subtle focus:outline-none focus:border-mobbin-borderActive transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-mobbin-text uppercase tracking-wider">
                Contraseña Maestra
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-mobbin-muted hover:text-mobbin-text transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-mobbin-border rounded-lg px-3.5 py-2.5 text-sm text-mobbin-text placeholder-mobbin-subtle focus:outline-none focus:border-mobbin-borderActive transition-colors font-mono"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-mobbin-dark hover:bg-mobbin-darkHover text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-mobbin-border text-center text-xs text-mobbin-muted">
          ¿Aún no tienes una bóveda personal?{' '}
          <Link to="/register" className="text-mobbin-text font-semibold hover:underline">
            Crear cuenta segura
          </Link>
        </div>
      </div>

      {/* Columna Derecha: Panel Visual Estilo Mobbin */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-mobbin-surface border-l border-mobbin-border bg-dot-grid relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-mobbin-muted tracking-wider uppercase">
            Plataforma de Bóvedas Cifradas
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-mobbin-border text-[11px] font-mono text-status-success font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
            AES-256-GCM
          </span>
        </div>

        {/* Hero Visual Card: Previsualización de Nota Cifrada */}
        <div className="my-auto max-w-md mx-auto w-full space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-mobbin-text leading-snug">
              Privacidad absoluta por diseño. Cifrado de extremo a reposo.
            </h2>
            <p className="text-sm text-mobbin-muted leading-relaxed">
              Tus secretos se cifran en el servidor con llaves únicas de 256 bits antes de persistir en PostgreSQL. Ni siquiera los administradores pueden leer tus notas.
            </p>
          </div>

          {/* Tarjeta estática minimalista de nota cifrada */}
          <div className="bg-white border border-mobbin-border rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-mobbin-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-mobbin-dark"></div>
                <span className="text-xs font-bold text-mobbin-text">Credenciales de Infraestructura</span>
              </div>
              <span className="text-[10px] font-mono text-mobbin-muted bg-mobbin-surface px-2 py-0.5 rounded border border-mobbin-border">
                CONFIDENCIAL
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[11px] text-mobbin-muted">
                <span>Payload Cifrado:</span>
                <span className="text-mobbin-text font-bold">128 bytes</span>
              </div>
              <div className="bg-mobbin-surface p-2.5 rounded-lg border border-mobbin-border text-[11px] text-mobbin-muted break-all leading-relaxed select-all">
                e83f9104cb1a29f8d42018ea37bc...49102c9a
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-mobbin-muted">
              <div className="bg-mobbin-surface p-2 rounded border border-mobbin-border">
                <span className="block text-[10px] text-mobbin-subtle uppercase">Algoritmo</span>
                <span className="font-semibold text-mobbin-text">AES-256-GCM</span>
              </div>
              <div className="bg-mobbin-surface p-2 rounded border border-mobbin-border">
                <span className="block text-[10px] text-mobbin-subtle uppercase">Derivación</span>
                <span className="font-semibold text-mobbin-text">Argon2id RFC 9106</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del panel visual */}
        <div className="flex items-center justify-between text-xs text-mobbin-muted font-mono pt-6 border-t border-mobbin-border">
          <span>OWASP Top 10:2025</span>
          <span>NIST SP 800-63B</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
