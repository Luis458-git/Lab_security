import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PasswordStrength from '../components/security/PasswordStrength.jsx';
import { UserPlus, Mail, User, Phone, Lock, CheckCircle2, AlertOctagon, Loader2, ShieldCheck } from 'lucide-react';

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
      setError('La contraseña debe tener al menos 12 caracteres cumpliendo la política de seguridad (RF-01)');
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

      setSuccess('Bóveda personal registrada exitosamente. Redirigiendo al inicio de sesión...');
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
      <div className="max-w-md w-full space-y-6 bg-vault-card border border-vault-border p-8 rounded-2xl shadow-xl transition-surface">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-vault-surface border border-vault-border rounded-xl flex items-center justify-center text-vault-emerald mb-3">
            <UserPlus className="w-6 h-6 text-vault-emerald" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Crear Bóveda Segura</h2>
          <p className="mt-1 text-xs text-gray-400">
            Cifrado de extremo a reposo alineado con OWASP Top 10:2025
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/40 border border-vault-red/60 rounded-xl text-vault-red text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            {issues.length > 0 && (
              <ul className="list-disc list-inside space-y-0.5 pt-1 pl-1">
                {issues.map((iss, i) => (
                  <li key={i}>{iss.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-vault-emerald text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Nombre Completo</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full bg-vault-bg border border-vault-border rounded-lg pl-10 pr-3.5 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-vault-emerald text-sm transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
                className="w-full bg-vault-bg border border-vault-border rounded-lg pl-10 pr-3.5 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-vault-emerald text-sm transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <label className="font-medium text-gray-300">Teléfono Personal (Opcional)</label>
              <span className="text-[10px] text-vault-emerald flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3" />
                Cifrado con AES-256-GCM
              </span>
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full bg-vault-bg border border-vault-border rounded-lg pl-10 pr-3.5 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-vault-emerald text-sm transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Contraseña Maestra</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 12 caracteres complejos"
                className="w-full bg-vault-bg border border-vault-border rounded-lg pl-10 pr-3.5 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-vault-emerald text-sm transition-colors"
                disabled={loading}
              />
            </div>
            <PasswordStrength password={password} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-vault-emerald hover:bg-emerald-400 text-vault-bg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-950/40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando Hashes y Claves...</span>
              </>
            ) : (
              <span>Registrar Bóveda Segura</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-3 border-t border-vault-border">
          ¿Ya tienes cuenta activa?{' '}
          <Link to="/login" className="text-vault-emerald hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
