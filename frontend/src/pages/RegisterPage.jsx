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
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2 bg-[#EDF7F2]">
      {/* Columna Izquierda: Formulario en Verde Menta Suave */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 max-w-xl mx-auto w-full animate-slide-up">
        <div className="mb-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C2F5DF] border border-[#03D47C] text-[11px] font-mono font-bold text-[#002E22] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#002E22]"></span>
            <span>Inicialización de Bóveda Privada</span>
          </div>
          <h1 className="font-expensify-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#002E22] mb-2">
            Crea tu bóveda en SecureVault.
          </h1>
          <p className="text-sm text-[#3B6E5C]">
            Tus datos personales y notas quedan cifrados con llaves únicas e inaccesibles para terceros.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs space-y-1 animate-slide-up">
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
          <div className="mb-6 p-3.5 rounded-2xl bg-[#C2F5DF] border border-[#03D47C] text-[#002E22] text-xs font-bold flex items-center gap-2 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-[#002E22] mb-1.5 uppercase tracking-wider">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Luis Méndez"
              className="input-sage w-full rounded-2xl px-4 py-2.5 text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#002E22] mb-1.5 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="input-sage w-full rounded-2xl px-4 py-2.5 text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#002E22] uppercase tracking-wider">
                Teléfono de Contacto
              </label>
              <span className="text-[10px] font-mono font-bold text-[#002E22] bg-[#C2F5DF] px-2.5 py-0.5 rounded-full border border-[#03D47C]">
                Cifrado AES-256
              </span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+506 8888-8888 (Opcional)"
              className="input-sage w-full rounded-2xl px-4 py-2.5 text-sm font-mono"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#002E22] mb-1.5 uppercase tracking-wider">
              Contraseña Maestra (Mínimo 12 caracteres)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 12 caracteres complejos"
                className="input-sage w-full rounded-2xl pl-4 pr-11 py-2.5 text-sm font-mono"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-[#3B6E5C] hover:text-[#002E22] transition-colors p-0.5 cursor-pointer"
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
            className="btn-expensify w-full mt-2 py-3.5 px-6 rounded-full text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando Hash Argon2id...</span>
              </>
            ) : (
              <>
                <span>Comenzar gratis — Crear Bóveda</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-7 pt-6 border-t border-[#BBE2CE] text-center text-xs text-[#3B6E5C]">
          ¿Ya tienes una cuenta registrada?{' '}
          <Link to="/login" className="text-[#002E22] font-extrabold hover:underline">
            Iniciar sesión →
          </Link>
        </div>
      </div>

      {/* Columna Derecha: Panel Verde Bosque (#002E22) con Tarjetas Flotantes */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-forest-pattern text-white border-l border-[#0B533E] relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#03D47C] tracking-wider uppercase">
            Aislamiento de Cuentas (OWASP A01)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#064232] border border-[#03D47C]/40 text-[11px] font-mono text-[#03D47C] font-bold">
            Tenant Isolation
          </span>
        </div>

        <div className="my-auto max-w-md mx-auto w-full space-y-6 animate-slide-up-delay-1">
          <div className="space-y-3">
            <h2 className="font-expensify-serif text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
              Cero conocimiento. Datos <span className="italic text-[#03D47C] font-normal">blindados</span> por diseño.
            </h2>
            <p className="text-sm text-[#C2F5DF] leading-relaxed">
              Cada cuenta registrada posee un espacio de almacenamiento segregado con verificación criptográfica de autenticidad en cada lectura.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="forest-card rounded-2xl p-4 flex items-start gap-3.5 animate-float">
              <div className="w-8 h-8 rounded-full bg-[#03D47C] text-[#002E22] flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-extrabold">
                01
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Envelope Encryption (AES-256-GCM)
                </h3>
                <p className="text-xs text-[#C2F5DF] leading-relaxed">
                  Cada texto se cifra con un IV aleatorio único de 12 bytes generado por CSPRNG y etiqueta de integridad GCM.
                </p>
              </div>
            </div>

            <div className="forest-card rounded-2xl p-4 flex items-start gap-3.5 animate-float-delayed">
              <div className="w-8 h-8 rounded-full bg-[#03D47C] text-[#002E22] flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-extrabold">
                02
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Hashing RFC 9106 (Argon2id)
                </h3>
                <p className="text-xs text-[#C2F5DF] leading-relaxed">
                  Contraseñas protegidas contra ataques por GPU y ASICs con configuración de memoria intensiva (64 MB, 3 iteraciones).
                </p>
              </div>
            </div>

            <div className="forest-card rounded-2xl p-4 flex items-start gap-3.5 animate-float">
              <div className="w-8 h-8 rounded-full bg-[#03D47C] text-[#002E22] flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-extrabold">
                03
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Auditoría Forense Inmutable
                </h3>
                <p className="text-xs text-[#C2F5DF] leading-relaxed">
                  Cualquier intento de alteración o acceso no autorizado es registrado automáticamente en la bitácora con IP y User-Agent.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#C2F5DF] font-mono pt-6 border-t border-[#0B533E]">
          <span>RFC 9106 Argon2id</span>
          <span>NIST SP 800-38D</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
