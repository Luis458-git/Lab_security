import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AlertCircle, ShieldAlert, ArrowRight, Loader2, Eye, EyeOff, Lock, Check } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2 bg-[#EDF7F2]">
      {/* Columna Izquierda: Formulario en Verde Menta Suave */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 max-w-xl mx-auto w-full animate-slide-up">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C2F5DF] border border-[#03D47C] text-[11px] font-mono font-bold text-[#002E22] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#002E22]"></span>
            <span>Zero-Trust Identity • Argon2id</span>
          </div>
          <h1 className="font-expensify-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#002E22] mb-2">
            ¡Bienvenido! Inicia sesión en tu bóveda.
          </h1>
          <p className="text-sm text-[#3B6E5C]">
            Protección de identidad con Argon2id (64 MB) y sesiones HttpOnly blindadas.
          </p>
        </div>

        {/* Alerta Rate Limit (HTTP 429) */}
        {isRateLimited && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFFBEB] border-2 border-[#F59E0B] text-[#B45309] text-xs space-y-1 animate-slide-up">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Límite de solicitudes excedido (HTTP 429)</span>
            </div>
            <p className="text-[13px] leading-relaxed text-[#78350F]">
              {error}
            </p>
          </div>
        )}

        {/* Alerta Cuenta Bloqueada (HTTP 423) */}
        {isLocked && !isRateLimited && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FEF2F2] border-2 border-[#EF4444] text-[#B91C1C] text-xs space-y-1 animate-slide-up">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Cuenta Bloqueada Temporalmente (HTTP 423)</span>
            </div>
            <p className="text-[13px] leading-relaxed text-[#7F1D1D]">
              {error}
            </p>
          </div>
        )}

        {/* Error Estándar */}
        {error && !isRateLimited && !isLocked && (
          <div className="mb-6 p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs font-bold flex items-center gap-2 animate-slide-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-[#002E22] mb-1.5 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="input-sage w-full rounded-2xl px-4 py-3 text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#002E22] uppercase tracking-wider">
                Contraseña Maestra
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-[#0B533E] hover:text-[#002E22] hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-sage w-full rounded-2xl pl-4 pr-11 py-3 text-sm font-mono"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#3B6E5C] hover:text-[#002E22] transition-colors p-0.5 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-expensify w-full mt-2 py-3.5 px-6 rounded-full text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <span>Desbloquear Bóveda</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#BBE2CE] text-center text-xs text-[#3B6E5C]">
          ¿Aún no tienes una bóveda personal?{' '}
          <Link to="/register" className="text-[#002E22] font-extrabold hover:underline">
            Comenzar gratis →
          </Link>
        </div>
      </div>

      {/* Columna Derecha: Panel Verde Bosque Profundo (#002E22) Estilo Expensify */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-forest-pattern text-white border-l border-[#0B533E] relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#03D47C] tracking-wider uppercase">
            SecureVault — Zero-Trust
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#064232] border border-[#03D47C]/40 text-[11px] font-mono text-[#03D47C] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#03D47C] animate-pulse"></span>
            AES-256-GCM
          </span>
        </div>

        <div className="my-auto max-w-md mx-auto w-full space-y-6 animate-slide-up-delay-1">
          <div className="space-y-3">
            <h2 className="font-expensify-serif text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
              La bóveda <span className="italic text-[#03D47C] font-normal">más segura</span> para tus secretos.
            </h2>
            <p className="text-sm text-[#C2F5DF] leading-relaxed">
              Tus notas se cifran en el servidor con llaves únicas de 256 bits antes de persistir en PostgreSQL. Ni siquiera los administradores pueden leer tu información.
            </p>
          </div>

          {/* Tarjeta Flotante Verde Bosque & Menta */}
          <div className="forest-card rounded-3xl p-6 space-y-4 animate-float">
            <div className="flex items-center justify-between pb-3 border-b border-[#0B533E]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#03D47C] text-[#002E22] flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white">Credenciales de Infraestructura</span>
              </div>
              <span className="text-[10px] font-mono text-[#002E22] bg-[#03D47C] px-2.5 py-0.5 rounded-full font-extrabold">
                PROTEGIDO
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[11px] text-[#C2F5DF]">
                <span>Payload Cifrado:</span>
                <span className="text-[#03D47C] font-bold">128 bytes</span>
              </div>
              <div className="bg-[#002E22] p-3 rounded-xl border border-[#03D47C]/30 text-[11px] text-[#03D47C] break-all leading-relaxed select-all">
                e83f9104cb1a29f8d42018ea37bc...49102c9a
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1 text-[11px] font-mono">
              <div className="bg-[#002E22] p-2.5 rounded-xl border border-[#0B533E]">
                <span className="block text-[10px] text-[#C2F5DF] uppercase">Algoritmo</span>
                <span className="font-bold text-white">AES-256-GCM</span>
              </div>
              <div className="bg-[#002E22] p-2.5 rounded-xl border border-[#0B533E]">
                <span className="block text-[10px] text-[#C2F5DF] uppercase">Derivación</span>
                <span className="font-bold text-[#03D47C]">Argon2id 64MB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#C2F5DF] font-mono pt-6 border-t border-[#0B533E]">
          <span>OWASP Top 10:2025</span>
          <span>NIST SP 800-63B</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
