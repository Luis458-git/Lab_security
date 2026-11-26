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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F4F4F5] bg-dot-grid">
      <div className="max-w-md w-full space-y-6 editorial-panel bg-white p-8 sm:p-10 rounded-2xl animate-slide-up">
        {/* Step Pill Indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-1.5 w-10 rounded-full transition-all duration-300 ${step === 1 ? 'bg-[#141414]' : 'bg-[#D4D4D8]'}`}></div>
          <div className={`h-1.5 w-10 rounded-full transition-all duration-300 ${step === 2 ? 'bg-[#141414]' : 'bg-[#E5E5E5]'}`}></div>
        </div>

        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-[28%] bg-[#141414] text-white flex items-center justify-center mb-3 shadow-sm animate-float">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#141414]">
            {step === 1 ? 'Recuperar Contraseña' : 'Validar Código OTP'}
          </h1>
          <p className="mt-1.5 text-xs text-[#666666]">
            {step === 1
              ? 'Se enviará un código de verificación seguro de 6 dígitos a tu correo'
              : 'Ingresa el código OTP de 6 dígitos que enviamos a tu bandeja de entrada'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B91C1C] text-xs font-semibold flex items-center gap-2 animate-slide-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-[#15803d] text-xs font-semibold flex items-center gap-2 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {step === 1 ? (
          <form className="space-y-4" onSubmit={handleRequestReset}>
            <div>
              <label className="block text-xs font-bold text-[#141414] mb-1.5 uppercase tracking-wider">
                Correo Electrónico Registrado
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-correo@ejemplo.com"
                className="input-editorial w-full rounded-xl px-4 py-3 text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-editorial w-full py-3.5 px-5 rounded-full text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
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
                className="text-xs font-semibold text-[#666666] hover:text-[#141414] transition-colors cursor-pointer"
              >
                ¿Ya recibiste el código? Ingresar código →
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4 animate-slide-up" onSubmit={handleConfirmReset}>
            <div className="p-3.5 bg-[#F7F7F8] border border-[#E5E5E5] rounded-xl text-xs flex items-start gap-2.5 text-[#141414]">
              <Inbox className="w-4 h-4 text-[#141414] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#141414]">Revisa tu bandeja de entrada</p>
                <p className="text-[11px] text-[#666666] mt-0.5">
                  El código expira en 10 minutos y es de un solo uso.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#141414] mb-1.5 uppercase tracking-wider">
                Código OTP Recibido (6 dígitos)
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="482910"
                maxLength={64}
                className="input-editorial w-full rounded-xl px-4 py-3 text-[#141414] text-lg font-mono font-extrabold tracking-[0.35em] text-center"
                disabled={loading}
                autoComplete="one-time-code"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#141414] mb-1.5 uppercase tracking-wider">
                Nueva Contraseña Maestra
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 12 caracteres complejos"
                className="input-editorial w-full rounded-xl px-4 py-3 text-sm font-mono"
                disabled={loading}
              />
              <PasswordStrength password={newPassword} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-editorial w-full py-3.5 px-5 rounded-full text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
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
                className="text-xs font-semibold text-[#666666] hover:text-[#141414] transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Solicitar otro código</span>
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-[#666666] pt-4 border-t border-[#E5E5E5]">
          <Link to="/login" className="text-[#141414] font-bold hover:underline">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
