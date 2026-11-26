import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PasswordStrength from '../components/security/PasswordStrength.jsx';
import { AlertCircle, CheckCircle2, ArrowRight, Loader2, ShieldCheck, Lock } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Columna Izquierda: Formulario Editorial */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 max-w-xl mx-auto w-full">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-mobbin-surface border border-mobbin-border text-[11px] font-mono text-mobbin-muted mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-mobbin-dark"></span>
            Creación de Bóveda Privada
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-mobbin-text mb-2">
            Crear cuenta en SecureVault
          </h1>
          <p className="text-sm text-mobbin-muted">
            Tus datos personales y notas quedan cifrados con llaves únicas e inaccesibles para terceros.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-status-dangerBg border border-status-dangerBorder text-status-danger text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
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
          <div className="mb-6 p-3.5 rounded-lg bg-status-successBg border border-status-successBorder text-status-success text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-mobbin-text mb-1.5 uppercase tracking-wider">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Luis Méndez"
              className="w-full bg-white border border-mobbin-border rounded-lg px-3.5 py-2.5 text-sm text-mobbin-text placeholder-mobbin-subtle focus:outline-none focus:border-mobbin-borderActive transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-mobbin-text mb-1.5 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="w-full bg-white border border-mobbin-border rounded-lg px-3.5 py-2.5 text-sm text-mobbin-text placeholder-mobbin-subtle focus:outline-none focus:border-mobbin-borderActive transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-mobbin-text uppercase tracking-wider">
                Teléfono de Contacto
              </label>
              <span className="text-[11px] font-mono text-mobbin-muted">Cifrado con AES-256</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+506 8888-8888 (Opcional)"
              className="w-full bg-white border border-mobbin-border rounded-lg px-3.5 py-2.5 text-sm text-mobbin-text placeholder-mobbin-subtle focus:outline-none focus:border-mobbin-borderActive transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-mobbin-text mb-1.5 uppercase tracking-wider">
              Contraseña Maestra (Mínimo 12 caracteres)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 12 caracteres complejos"
              className="w-full bg-white border border-mobbin-border rounded-lg px-3.5 py-2.5 text-sm text-mobbin-text placeholder-mobbin-subtle focus:outline-none focus:border-mobbin-borderActive transition-colors font-mono"
              disabled={loading}
            />
            <PasswordStrength password={password} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-mobbin-dark hover:bg-mobbin-darkHover text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generando Hash Argon2id...</span>
              </>
            ) : (
              <>
                <span>Registrar Bóveda Segura</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-mobbin-border text-center text-xs text-mobbin-muted">
          ¿Ya tienes una cuenta registrada?{' '}
          <Link to="/login" className="text-mobbin-text font-semibold hover:underline">
            Iniciar sesión
          </Link>
        </div>
      </div>

      {/* Columna Derecha: Panel Visual Estilo Mobbin */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-mobbin-surface border-l border-mobbin-border bg-dot-grid relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-mobbin-muted tracking-wider uppercase">
            Aislamiento de Cuentas (OWASP A01)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-mobbin-border text-[11px] font-mono text-mobbin-text font-medium">
            Tenant Isolation
          </span>
        </div>

        {/* Feature Highlights */}
        <div className="my-auto max-w-md mx-auto w-full space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-mobbin-text leading-snug">
              Cero conocimiento. Datos aislados por diseño.
            </h2>
            <p className="text-sm text-mobbin-muted leading-relaxed">
              Cada cuenta registrada posee un espacio de almacenamiento segregado. Las consultas se aíslan a nivel de base de datos con verificación estricta de pertenencia.
            </p>
          </div>

          {/* Cards de características criptográficas */}
          <div className="space-y-3">
            <div className="bg-white border border-mobbin-border rounded-xl p-4 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-mobbin-surface border border-mobbin-border flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-mono font-bold text-mobbin-text">01</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-mobbin-text uppercase tracking-wider mb-1">
                  Envelope Encryption (AES-256-GCM)
                </h3>
                <p className="text-xs text-mobbin-muted leading-relaxed">
                  Cada texto se cifra con un IV aleatorio único de 12 bytes generado por CSPRNG y etiqueta de autenticación para detectar manipulación.
                </p>
              </div>
            </div>

            <div className="bg-white border border-mobbin-border rounded-xl p-4 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-mobbin-surface border border-mobbin-border flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-mono font-bold text-mobbin-text">02</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-mobbin-text uppercase tracking-wider mb-1">
                  Hashing RFC 9106 (Argon2id)
                </h3>
                <p className="text-xs text-mobbin-muted leading-relaxed">
                  Contraseñas protegidas contra ataques por GPU y ASICs con configuración de memoria intensiva (64 MB, 3 iteraciones).
                </p>
              </div>
            </div>

            <div className="bg-white border border-mobbin-border rounded-xl p-4 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-mobbin-surface border border-mobbin-border flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-mono font-bold text-mobbin-text">03</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-mobbin-text uppercase tracking-wider mb-1">
                  Auditoría Forense Inmutable
                </h3>
                <p className="text-xs text-mobbin-muted leading-relaxed">
                  Cualquier intento de alteración o acceso no autorizado es registrado automáticamente en la bitácora con IP y User-Agent.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del panel visual */}
        <div className="flex items-center justify-between text-xs text-mobbin-muted font-mono pt-6 border-t border-mobbin-border">
          <span>RFC 9106 Argon2id</span>
          <span>NIST SP 800-38D</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
