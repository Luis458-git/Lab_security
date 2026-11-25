import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/auth.service.js';
import PasswordStrength from '../components/security/PasswordStrength.jsx';
import { KeyRound, Mail, Lock, Copy, Check, ArrowLeft, Loader2, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialToken = searchParams.get('token') || '';

  const [step, setStep] = useState(initialToken ? 2 : 1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [devTokenNotice, setDevTokenNotice] = useState('');
  const [copied, setCopied] = useState(false);

  // Paso 1: Solicitar token
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      setSuccess(res.message);
      if (res.devToken) {
        setDevTokenNotice(res.devToken);
        setToken(res.devToken);
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Aplicar token y actualizar contraseña
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 12) {
      setError('La nueva contraseña debe tener al menos 12 caracteres cumpliendo la política de seguridad');
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

  const handleCopyDevToken = () => {
    navigator.clipboard.writeText(devTokenNotice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-vault-card border border-vault-border p-8 rounded-2xl shadow-xl transition-surface">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-vault-surface border border-vault-border rounded-xl flex items-center justify-center text-vault-emerald mb-3">
            <KeyRound className="w-6 h-6 text-vault-emerald" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
            {step === 1 ? 'Recuperación Segura' : 'Restablecer Contraseña'}
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            Token efímero de un solo uso hasheado con SHA-256 (Expiración: 15 min - RF-06)
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/40 border border-vault-red/60 rounded-xl text-vault-red text-xs flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-vault-emerald text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Cuadro destacado para copiar el token de desarrollo/laboratorio */}
        {devTokenNotice && (
          <div className="p-3.5 bg-vault-surface border border-vault-emerald/50 rounded-xl text-xs space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-vault-emerald font-semibold">
              <span>Token de laboratorio detectado:</span>
              <button
                type="button"
                onClick={handleCopyDevToken}
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-vault-emerald border border-emerald-800 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-vault-emerald" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copiado' : 'Copiar Token'}</span>
              </button>
            </div>
            <div className="bg-vault-bg p-2 rounded border border-vault-border text-[11px] font-mono text-gray-300 break-all select-all">
              {devTokenNotice}
            </div>
          </div>
        )}

        {step === 1 ? (
          <form className="space-y-4" onSubmit={handleRequestReset}>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Correo Electrónico Registrado
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
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-vault-emerald hover:bg-emerald-400 text-vault-bg font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm shadow-emerald-950/40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando Token Criptográfico...</span>
                </>
              ) : (
                <span>Solicitar Token de Recuperación</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-gray-400 hover:text-vault-emerald transition-colors"
              >
                ¿Ya cuentas con el token de 64 caracteres? Continuar al Paso 2 →
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleConfirmReset}>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Token de Recuperación (64 caracteres hex)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="64 caracteres hexadecimales..."
                  className="w-full bg-vault-bg border border-vault-border rounded-lg pl-10 pr-3.5 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-vault-emerald text-xs font-mono transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Nueva Contraseña Maestra
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 12 caracteres complejos"
                  className="w-full bg-vault-bg border border-vault-border rounded-lg pl-10 pr-3.5 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-vault-emerald text-sm transition-colors"
                  disabled={loading}
                />
              </div>
              <PasswordStrength password={newPassword} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-vault-emerald hover:bg-emerald-400 text-vault-bg font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm shadow-emerald-950/40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando Token y Hasheando...</span>
                </>
              ) : (
                <span>Actualizar Contraseña y Consumir Token</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-gray-400 hover:text-vault-emerald transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Paso 1</span>
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-gray-500 pt-3 border-t border-vault-border">
          <Link to="/login" className="text-vault-emerald hover:underline font-medium">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
