import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/auth.service.js';
import PasswordStrength from '../components/security/PasswordStrength.jsx';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Inbox, Lock } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-forest-pattern">
      {/* Modal de Recuperación Estilo Expensify Onboarding */}
      <div className="max-w-md w-full space-y-6 bg-[#F7FCF9] border-2 border-[#03D47C] p-8 sm:p-10 rounded-3xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-center gap-2">
          <div className={`h-2 w-12 rounded-full transition-all duration-300 ${step === 1 ? 'bg-[#03D47C]' : 'bg-[#BBE2CE]'}`}></div>
          <div className={`h-2 w-12 rounded-full transition-all duration-300 ${step === 2 ? 'bg-[#03D47C]' : 'bg-[#DDF2E8]'}`}></div>
        </div>

        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#002E22] text-[#03D47C] flex items-center justify-center mb-3 shadow-md animate-float">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-expensify-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#002E22]">
            {step === 1 ? 'Recuperar Contraseña' : 'Validar Código OTP'}
          </h1>
          <p className="mt-1.5 text-xs text-[#3B6E5C]">
            {step === 1
              ? 'Se enviará un código de verificación seguro de 6 dígitos a tu correo'
              : 'Ingresa el código OTP de 6 dígitos que enviamos a tu bandeja de entrada'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B91C1C] text-xs font-bold flex items-center gap-2 animate-slide-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-[#C2F5DF] border border-[#03D47C] rounded-xl text-[#002E22] text-xs font-bold flex items-center gap-2 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {step === 1 ? (
          <form className="space-y-4" onSubmit={handleRequestReset}>
            <div>
              <label className="block text-xs font-bold text-[#002E22] mb-1.5 uppercase tracking-wider">
                Correo Electrónico Registrado
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-correo@ejemplo.com"
                className="input-sage w-full rounded-2xl px-4 py-3 text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-expensify w-full py-3.5 px-5 rounded-full text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando código...</span>
                </>
              ) : (
                <span>Enviar Código a Mi Correo</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-[#0B533E] hover:text-[#002E22] transition-colors cursor-pointer"
              >
                ¿Ya recibiste el código? Ingresar código →
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4 animate-slide-up" onSubmit={handleConfirmReset}>
            <div className="p-3.5 bg-[#C2F5DF]/60 border border-[#03D47C] rounded-2xl text-xs flex items-start gap-2.5 text-[#002E22]">
              <Inbox className="w-4 h-4 text-[#002E22] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#002E22]">Revisa tu bandeja de entrada</p>
                <p className="text-[11px] text-[#0B533E] mt-0.5">
                  El código expira en 10 minutos y es de un solo uso.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#002E22] mb-1.5 uppercase tracking-wider">
                Código OTP Recibido (6 dígitos)
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="482910"
                maxLength={64}
                className="input-sage w-full rounded-2xl px-4 py-3 text-[#002E22] text-lg font-mono font-extrabold tracking-[0.35em] text-center"
                disabled={loading}
                autoComplete="one-time-code"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#002E22] mb-1.5 uppercase tracking-wider">
                Nueva Contraseña Maestra
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 12 caracteres complejos"
                className="input-sage w-full rounded-2xl px-4 py-3 text-sm font-mono"
                disabled={loading}
              />
              <PasswordStrength password={newPassword} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-expensify w-full py-3.5 px-5 rounded-full text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando y Cambiando...</span>
                </>
              ) : (
                <span>Confirmar y Cambiar Contraseña</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[#0B533E] hover:text-[#002E22] transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Solicitar otro código</span>
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-[#3B6E5C] pt-4 border-t border-[#BBE2CE]">
          <Link to="/login" className="text-[#002E22] font-extrabold hover:underline">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
