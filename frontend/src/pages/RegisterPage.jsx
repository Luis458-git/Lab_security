import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PasswordStrength from '../components/security/PasswordStrength.jsx';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [issues, setIssues] = useState([]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIssues([]);
    setSuccess('');

    if (password.length < 12) {
      setError('La contraseña debe tener al menos 12 caracteres cumpliendo la política de seguridad');
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        fullName,
        password,
        phone: phone.trim() ? phone.trim() : null
      });

      setSuccess('Cuenta creada exitosamente. Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err) {
      setError(err.message || 'Error al procesar el registro');
      if (err.issues && Array.isArray(err.issues)) {
        setIssues(err.issues);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Crear Bóveda Personal</h2>
          <p className="mt-1 text-sm text-slate-400">
            Cifrado de extremo a reposo con estándares OWASP Top 10:2025
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-xl text-rose-300 text-sm">
            <p className="font-semibold">{error}</p>
            {issues.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-xs space-y-0.5">
                {issues.map((iss, i) => (
                  <li key={i}>{iss.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-emerald-300 text-sm font-medium">
            {success}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan Pérez"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@ejemplo.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Teléfono de Contacto <span className="text-slate-500 font-normal">(Opcional, cifrado con AES-256-GCM)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+52 55 1234 5678"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña Maestra</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 12 caracteres complejos"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
              disabled={loading}
            />
            <PasswordStrength password={password} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-cyan-500/20"
          >
            {loading ? 'Inicializando Criptografía...' : 'Registrar Bóveda Segura'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800/80">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline font-medium">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
