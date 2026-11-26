import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/auth.service.js';
import PasswordStrength from '../components/security/PasswordStrength.jsx';
import { ShieldCheck, Mail, Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Hash, Inbox } from 'lucide-react';

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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-mobbin-surface bg-dot-grid">
      <div className="max-w-md w-full space-y-6 bg-white border border-mobbin-border p-8 sm:p-10 rounded-2xl shadow-xs transition-surface">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mobbin-surface border border-mobbin-border text-[11px] font-mono text-mobbin-muted mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
            NIST SP 800-63B OTP
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-mobbin-text">
            {step === 1 ? 'Recuperar Contraseña' : 'Validar Código OTP'}
          </h1>
          <p className="mt-1.5 text-xs text-mobbin-muted">
            {step === 1
              ? 'Se enviará un código de verificación seguro de 6 dígitos a tu correo'
              : 'Ingresa el código OTP de 6 dígitos que enviamos a tu bandeja de entrada'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-status-dangerBg border border-status-dangerBorder rounded-lg text-status-danger text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-status-successBg border border-status-successBorder rounded-lg text-status-success text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {step === 1 ? (
          <form className="space-y-4" onSubmit={handleRequestReset}>
            <div>
              <label className="block text-xs font-semibold text-mobbin-text mb-1.5 uppercase tracking-wider">
                Correo Electrónico Registrado
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-correo@ejemplo.com"
                className="w-full bg-white border border-mobbin-border rounded-lg px-3.5 py-2.5 text-sm text-mobbin-text placeholder-mobbin-subtle focus:outline-none focus:border-mobbin-borderActive transition-colors"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-mobbin-dark hover:bg-mobbin-darkHover text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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
                className="text-xs text-mobbin-muted hover:text-mobbin-text transition-colors"
              >
                ¿Ya recibiste el código? Ingresar código →
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleConfirmReset}>
            <div className="p-3 bg-mobbin-surface border border-mobbin-border rounded-lg text-xs flex items-start gap-2.5 text-mobbin-text">
              <Inbox className="w-4 h-4 text-mobbin-text shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-mobbin-text">Revisa tu bandeja de entrada</p>
                <p className="text-[11px] text-mobbin-muted mt-0.5">
                  El código expira en 10 minutos y es de un solo uso.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-mobbin-text mb-1.5 uppercase tracking-wider">
                Código OTP Recibido (6 dígitos)
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ej: 482910"
                maxLength={64}
                className="w-full bg-white border border-mobbin-border rounded-lg px-3.5 py-2.5 text-mobbin-text text-lg font-mono font-bold tracking-widest text-center focus:outline-none focus:border-mobbin-borderActive transition-colors"
                disabled={loading}
                autoComplete="one-time-code"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mobbin-text mb-1.5 uppercase tracking-wider">
                Nueva Contraseña Maestra
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 12 caracteres complejos"
                className="w-full bg-white border border-mobbin-border rounded-lg px-3.5 py-2.5 text-sm text-mobbin-text placeholder-mobbin-subtle focus:outline-none focus:border-mobbin-borderActive transition-colors font-mono"
                disabled={loading}
              />
              <PasswordStrength password={newPassword} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-mobbin-dark hover:bg-mobbin-darkHover text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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
                className="text-xs text-mobbin-muted hover:text-mobbin-text transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Solicitar otro código</span>
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-mobbin-muted pt-3 border-t border-mobbin-border">
          <Link to="/login" className="text-mobbin-text font-semibold hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
