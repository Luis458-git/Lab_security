import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PasswordStrength from '../components/security/PasswordStrength.jsx';
import { AlertCircle, CheckCircle2, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      {/* Columna Izquierda: Formulario Editorial Blanco */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 max-w-xl mx-auto w-full animate-slide-up">
        <div className="mb-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F4F5] border border-[#E5E5E5] text-[11px] font-mono text-[#666666] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#141414]"></span>
            <span>Creación de Bóveda Privada</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#141414] mb-2">
            Crear cuenta en SecureVault
          </h1>
          <p className="text-sm text-[#666666]">
            Tus datos personales y notas quedan cifrados con llaves únicas e inaccesibles para terceros.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs space-y-1 animate-slide-up">
            <div className="flex items-center gap-2 font-bold">
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
          <div className="mb-6 p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803d] text-xs font-semibold flex items-center gap-2 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-[#141414] mb-1.5 uppercase tracking-wider">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Luis Méndez"
              className="input-editorial w-full rounded-xl px-4 py-2.5 text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#141414] mb-1.5 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="input-editorial w-full rounded-xl px-4 py-2.5 text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#141414] uppercase tracking-wider">
                Teléfono de Contacto
              </label>
              <span className="text-[10px] font-mono text-[#666666] bg-[#F4F4F5] px-2 py-0.5 rounded-full border border-[#E5E5E5]">
                Cifrado AES-256
              </span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+506 8888-8888 (Opcional)"
              className="input-editorial w-full rounded-xl px-4 py-2.5 text-sm font-mono"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#141414] mb-1.5 uppercase tracking-wider">
              Contraseña Maestra (Mínimo 12 caracteres)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 12 caracteres complejos"
                className="input-editorial w-full rounded-xl pl-4 pr-11 py-2.5 text-sm font-mono"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-[#878787] hover:text-[#141414] transition-colors p-0.5 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-editorial w-full mt-2 py-3.5 px-5 rounded-full text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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

        <div className="mt-7 pt-6 border-t border-[#E5E5E5] text-center text-xs text-[#666666]">
          ¿Ya tienes una cuenta registrada?{' '}
          <Link to="/login" className="text-[#141414] font-bold hover:underline">
            Iniciar sesión →
          </Link>
        </div>
      </div>

      {/* Columna Derecha: Panel Visual Estilo Mobbin con Tarjetas Flotantes */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-[#F4F4F5] border-l border-[#E5E5E5] bg-dot-grid relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-[#666666] tracking-wider uppercase">
            Aislamiento de Cuentas (OWASP A01)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E5E5] text-[11px] font-mono text-[#141414] font-bold shadow-2xs">
            Tenant Isolation
          </span>
        </div>

        <div className="my-auto max-w-md mx-auto w-full space-y-6 animate-slide-up-delay-1">
          <div className="space-y-3">
            <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-[#141414] leading-snug">
              Cero conocimiento. Datos aislados por diseño.
            </h2>
            <p className="text-sm text-[#666666] leading-relaxed">
              Cada cuenta registrada posee un espacio de almacenamiento segregado con verificación criptográfica de autenticidad en cada lectura.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="editorial-card rounded-2xl p-4 bg-white flex items-start gap-3.5 animate-float">
              <div className="w-8 h-8 rounded-full bg-[#141414] text-white flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold">
                01
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#141414] uppercase tracking-wider mb-1">
                  Envelope Encryption (AES-256-GCM)
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Cada texto se cifra con un IV aleatorio único de 12 bytes generado por CSPRNG y etiqueta de integridad GCM.
                </p>
              </div>
            </div>

            <div className="editorial-card rounded-2xl p-4 bg-white flex items-start gap-3.5 animate-float-delayed">
              <div className="w-8 h-8 rounded-full bg-[#141414] text-white flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold">
                02
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#141414] uppercase tracking-wider mb-1">
                  Hashing RFC 9106 (Argon2id)
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Contraseñas protegidas contra ataques por GPU y ASICs con configuración de memoria intensiva (64 MB, 3 iteraciones).
                </p>
              </div>
            </div>

            <div className="editorial-card rounded-2xl p-4 bg-white flex items-start gap-3.5 animate-float">
              <div className="w-8 h-8 rounded-full bg-[#141414] text-white flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold">
                03
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#141414] uppercase tracking-wider mb-1">
                  Auditoría Forense Inmutable
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Cualquier intento de alteración o acceso no autorizado es registrado automáticamente en la bitácora con IP y User-Agent.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#666666] font-mono pt-6 border-t border-[#E5E5E5]">
          <span>RFC 9106 Argon2id</span>
          <span>NIST SP 800-38D</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
