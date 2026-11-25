import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/auth.service.js';
import PasswordStrength from '../components/security/PasswordStrength.jsx';

export const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Si viene ?token=... en la URL
  const initialToken = searchParams.get('token') || '';

  const [step, setStep] = useState(initialToken ? 2 : 1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [devTokenNotice, setDevTokenNotice] = useState('');

  // Paso 1: Solicitar enlace/token
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
      setError(err.message || 'Error al solicitar restablecimiento');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Consumir token y actualizar contraseña
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 12) {
      setError('La nueva contraseña debe tener al menos 12 caracteres y cumplir la política de seguridad');
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
      setError(err.message || 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {step === 1 ? 'Recuperar Contraseña' : 'Nueva Contraseña Maestra'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Token de un solo uso criptográfico con expiración de 15 minutos (SHA-256)
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-emerald-300 text-sm font-medium">
            {success}
          </div>
        )}

        {devTokenNotice && (
          <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-cyan-300 text-xs font-mono break-all">
            <span className="font-bold block text-cyan-200 mb-1">🔑 Token de recuperación (Entorno Laboratorio):</span>
            {devTokenNotice}
          </div>
        )}

        {step === 1 ? (
          <form className="space-y-4" onSubmit={handleRequestReset}>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Correo Electrónico Registrado
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-correo@ejemplo.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm shadow-cyan-500/20"
            >
              {loading ? 'Generando Token Seguro...' : 'Solicitar Enlace de Restablecimiento'}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              >
                ¿Ya tienes un token de 64 caracteres? Ingresar directamente →
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleConfirmReset}>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Token de Recuperación (64 caracteres hexadecimales)
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="64 caracteres hex..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nueva Contraseña
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 12 caracteres complejos"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                disabled={loading}
              />
              <PasswordStrength password={newPassword} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm shadow-cyan-500/20"
            >
              {loading ? 'Validando Token y Hasheando...' : 'Actualizar Contraseña'}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              >
                ← Volver a solicitar token
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800/80">
          <Link to="/login" className="text-cyan-400 hover:underline font-medium">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
