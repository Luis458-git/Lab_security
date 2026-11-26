import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Lock, Mail, AlertOctagon, ShieldAlert, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, Cpu, KeyRound } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-8rem)] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        
        {/* Columna Izquierda: Tarjeta de Login Glassmorphism Animada */}
        <div className="lg:col-span-6 animate-slide-up">
          <div className="glass-panel rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            {/* Brillo superior decorativo */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Zero-Trust Identity</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Bienvenido a <span className="text-gradient-emerald">SecureVault</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                Desbloquea tu bóveda criptográfica con verificación Argon2id y sesión blindada.
              </p>
            </div>

            {/* Banner Bloqueo por Fuerza Bruta (HTTP 429) */}
            {isRateLimited && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs space-y-1 animate-slide-up shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                  <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                  <span>Protección Anti-Fuerza Bruta (HTTP 429)</span>
                </div>
                <p className="text-amber-200/90 leading-relaxed pt-0.5">
                  {error}
                </p>
              </div>
            )}

            {/* Banner Cuenta Bloqueada (HTTP 423) */}
            {isLocked && !isRateLimited && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs space-y-1 animate-slide-up shadow-[0_0_25px_rgba(244,63,94,0.2)]">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                  <span>Cuenta Temporalmente Bloqueada (HTTP 423)</span>
                </div>
                <p className="text-rose-200/90 leading-relaxed pt-0.5">
                  {error}
                </p>
              </div>
            )}

            {/* Error general */}
            {error && !isRateLimited && !isLocked && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-2.5 animate-slide-up">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    className="input-cyber w-full rounded-xl pl-10 pr-4 py-3 text-sm placeholder-slate-500"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Contraseña Maestra
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input-cyber w-full rounded-xl pl-10 pr-11 py-3 text-sm placeholder-slate-500 font-mono"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-cyber w-full py-3.5 px-5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Descifrando acceso...</span>
                  </>
                ) : (
                  <>
                    <span>Desbloquear Bóveda</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
              ¿Aún no tienes una bóveda personal?{' '}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline ml-1">
                Crear cuenta cifrada →
              </Link>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Showcase Interactivo con Tarjetas Flotantes Animadas */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 animate-slide-up-delay-1">
          <div className="space-y-3 pr-4">
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Privacidad absoluta con <span className="text-gradient-emerald">Cifrado Autenticado</span>.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cada nota confidencial y dato personal se cifra con llaves simétricas de 256 bits y vectores de inicialización únicos antes de tocar el disco.
            </p>
          </div>

          {/* Tarjeta Flotante Principal: Live Cipher Envelope */}
          <div className="glass-card rounded-2xl p-6 animate-float animate-border-glow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Sobre Criptográfico #042</span>
                  <span className="text-[10px] font-mono text-emerald-400">Verificado con GCM AuthTag</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                AES-256-GCM
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Ciphertext en PostgreSQL:</span>
                <span className="text-emerald-400 font-bold">256-bit Key</span>
              </div>
              <div className="bg-slate-950/90 p-3 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-300/90 break-all leading-relaxed shadow-inner">
                f9a1c408e29b7d31a46082c19e...83b410d7e92c
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-[11px] font-mono">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                <span className="block text-[10px] text-slate-400 uppercase">IV (CSPRNG)</span>
                <span className="font-bold text-cyan-300">96 bits únicos</span>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                <span className="block text-[10px] text-slate-400 uppercase">Derivación</span>
                <span className="font-bold text-emerald-300">Argon2id RFC 9106</span>
              </div>
            </div>
          </div>

          {/* Tarjetas Flotantes Secundarias */}
          <div className="grid grid-cols-2 gap-4 animate-float-delayed">
            <div className="glass-card rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Anti-GPU Hashing</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  64 MB de memoria dedicada por intento de login.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Protección IDOR</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Aislamiento estricto por usuario y bitácora forense.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
