import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PasswordStrength from '../components/security/PasswordStrength.jsx';
import { UserPlus, Mail, User, Phone, Lock, CheckCircle2, AlertOctagon, Loader2, ShieldCheck, ArrowRight, Eye, EyeOff, Fingerprint, Layers } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-8rem)] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

        {/* Columna Izquierda: Formulario de Registro Animado */}
        <div className="lg:col-span-6 animate-slide-up">
          <div className="glass-panel rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Inicialización de Bóveda</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Crear <span className="text-gradient-emerald">Bóveda Segura</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Tus notas y teléfono se cifran automáticamente antes de guardarse en la nube.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-rose-200 text-xs space-y-1 animate-slide-up">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
                {issues.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 pt-1 pl-1 text-rose-200/90">
                    {issues.map((iss, i) => (
                      <li key={i}>{iss.message}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {success && (
              <div className="mb-5 p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-slide-up shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 animate-bounce" />
                <span>{success}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre Completo</label>
                <div className="relative group">
                  <User className="w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Luis Méndez"
                    className="input-cyber w-full rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-slate-500"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Correo Electrónico</label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    className="input-cyber w-full rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-slate-500"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Teléfono Confidencial (Opcional)
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Cifrado AES-256
                  </span>
                </div>
                <div className="relative group">
                  <Phone className="w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+506 8888-8888"
                    className="input-cyber w-full rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-slate-500 font-mono"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contraseña Maestra
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 12 caracteres complejos"
                    className="input-cyber w-full rounded-xl pl-10 pr-11 py-2.5 text-sm placeholder-slate-500 font-mono"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
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
                className="btn-cyber w-full py-3.5 px-5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando Hash Argon2id...</span>
                  </>
                ) : (
                  <>
                    <span>Inicializar Mi Bóveda</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-slate-400">
              ¿Ya cuentas con una bóveda activa?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline ml-1">
                Iniciar sesión →
              </Link>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Arquitectura Zero-Trust Animada */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-5 animate-slide-up-delay-1">
          <div className="space-y-2.5 pr-4">
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Blindaje criptográfico <span className="text-gradient-emerald">en cada capa</span>.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Diseñado bajo los estándares de seguridad más estrictos de la industria para garantizar confidencialidad e integridad verificable.
            </p>
          </div>

          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5 flex items-start gap-4 animate-float">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  1. Envelope Encryption (AES-256-GCM)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Cada nota y número telefónico se cifra con un Vector de Inicialización (IV) irrepetible de 12 bytes y una etiqueta de integridad de 16 bytes.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-start gap-4 animate-float-delayed">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  2. Hashing Resistente a ASICs (Argon2id)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tu contraseña maestra jamás se almacena ni se transmite en claro. Se deriva mediante Argon2id (RFC 9106) con costo de memoria de 64 MB.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-start gap-4 animate-float">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  3. Telemetría y Auditoría Forense (OWASP A09)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Monitoreo en tiempo real de intentos de acceso cruzado (IDOR), fuerza bruta y revelado de información personal identificable (PII).
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
