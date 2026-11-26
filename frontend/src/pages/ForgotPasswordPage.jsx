import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/auth.service.js';
import PasswordStrength from '../components/security/PasswordStrength.jsx';
import { ShieldCheck, Mail, Lock, ArrowLeft, Loader2, AlertOctagon, CheckCircle2, Hash, Inbox, Sparkles } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlOtp = searchParams.get('otp') || searchParams.get('token') || '';
  const urlEmail = searchParams.get('email') || '';

  const [step, setStep] = useState(urlOtp ? 2 : 1);
  const [email, setEmail] = useState(urlEmail);
  const [token, setToken] = useState(urlOtp);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Paso 1: Solicitar código OTP al correo
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      setSuccess(res.message || 'Código enviado. Revisa tu bandeja de entrada o carpeta de spam.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Validar código OTP recibido por correo y actualizar contraseña
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 12) {
      setError('La nueva contraseña debe tener al menos 12 caracteres cumpliendo la política NIST SP 800-63B');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword({
        token: token.trim(),
        newPassword
      });

      setSuccess(res.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl space-y-6 animate-slide-up relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 1 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]' : 'bg-emerald-500/40'}`}></div>
          <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 2 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]' : 'bg-white/10'}`}></div>
        </div>

        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_25px_rgba(16,185,129,0.25)] animate-float">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            {step === 1 ? 'Recuperar Contraseña' : 'Verificar Código OTP'}
          </h1>
          <p className="mt-1.5 text-xs text-slate-400">
            {step === 1
              ? 'Enviaremos un código criptográfico de 6 dígitos a tu correo electrónico'
              : 'Ingresa los 6 dígitos recibidos en tu bandeja de entrada (expira en 10 min)'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2.5 animate-slide-up">
            <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-medium flex items-center gap-2.5 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {step === 1 ? (
          <form className="space-y-4" onSubmit={handleRequestReset}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Correo Electrónico Registrado
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu-correo@ejemplo.com"
                  className="input-cyber w-full rounded-xl pl-10 pr-4 py-3 text-sm placeholder-slate-500"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-cyber w-full py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Despachando código OTP...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enviar Código a Mi Correo</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                ¿Ya recibiste el código de 6 dígitos? Ingresar código →
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4 animate-slide-up" onSubmit={handleConfirmReset}>
            <div className="p-3.5 bg-slate-900/90 border border-emerald-500/30 rounded-xl text-xs flex items-start gap-3 text-slate-300">
              <Inbox className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Revisa tu bandeja de entrada</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Busca el correo de <strong>SecureVault Security</strong>. El código es válido por 10 minutos.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Código OTP de Seguridad (6 dígitos)
              </label>
              <div className="relative group">
                <Hash className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="482910"
                  maxLength={64}
                  className="input-cyber w-full rounded-xl pl-10 pr-4 py-3 text-emerald-300 text-lg font-mono font-extrabold tracking-[0.35em] text-center"
                  disabled={loading}
                  autoComplete="one-time-code"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Nueva Contraseña Maestra
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 12 caracteres complejos"
                  className="input-cyber w-full rounded-xl pl-10 pr-4 py-3 text-sm placeholder-slate-500 font-mono"
                  disabled={loading}
                />
              </div>
              <PasswordStrength password={newPassword} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-cyber w-full py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando y Actualizando...</span>
                </>
              ) : (
                <span>Confirmar y Cambiar Contraseña</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>¿No te llegó? Solicitar un nuevo código</span>
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-white/10">
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
