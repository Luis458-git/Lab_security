import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ArrowRight,
  Lock,
  ShieldCheck,
  KeyRound,
  Eye,
  FileText,
  Activity,
  Fingerprint,
  Layers,
  Check,
  Terminal,
  Search,
  Sparkles,
  Copy,
  X,
  Maximize2
} from 'lucide-react';

const ONBOARDING_OPTIONS = [
  {
    id: 'personal',
    label: 'Proteger mis notas y claves personales',
    badge: 'Bóveda Personal'
  },
  {
    id: 'devsecops',
    label: 'Gestionar secretos de infraestructura (1-9 devs)',
    badge: 'DevSecOps'
  },
  {
    id: 'enterprise',
    label: 'Auditar accesos forenses y cumplimiento OWASP',
    badge: 'SecOps & Admin'
  }
];

const SCREEN_SHOWCASE = [
  {
    id: 'screen-vault',
    title: 'Bóveda de Notas Cifradas',
    subtitle: 'Envelope Encryption • AES-256-GCM',
    category: 'Cifrado AES-256',
    highlight: 'Highlight • Bóveda',
    route: '/vault',
    metrics: 'IV 96-bit • AuthTag 128-bit',
    description: 'Almacenamiento aislado por propietario con cifrado simétrico autenticado en reposo y descifrado únicamente en memoria.',
    previewType: 'vault'
  },
  {
    id: 'screen-auth',
    title: 'Acceso Split-Screen & Argon2id',
    subtitle: 'RFC 9106 • 64 MB Memory-Hard',
    category: 'Autenticación',
    highlight: 'Highlight • Login',
    route: '/login',
    metrics: 'HttpOnly • SameSite=Strict',
    description: 'Autenticación resistente a ataques por GPU/ASIC con mitigación de enumeración de usuarios en tiempo constante.',
    previewType: 'login'
  },
  {
    id: 'screen-otp',
    title: 'Recuperación por Código OTP (6 Dígitos)',
    subtitle: 'NIST SP 800-63B • SHA-256 Hash',
    category: 'Recuperación OTP',
    highlight: 'Highlight • OTP 6-Digit',
    route: '/forgot-password',
    metrics: 'TTL 10 min • Un solo uso',
    description: 'Despacho de código numérico efímero por SMTP cuyo valor jamás se guarda en texto plano en la base de datos.',
    previewType: 'otp'
  },
  {
    id: 'screen-secops',
    title: 'Bitácora Forense & Centro SecOps',
    subtitle: 'OWASP A09 • Monitoreo en Tiempo Real',
    category: 'Auditoría SecOps',
    highlight: 'SecOps • Telemetría',
    route: '/admin',
    metrics: 'Pino Logger • PostgreSQL',
    description: 'Registro inmutable de eventos críticos, cambios de rol RBAC, bloqueos de fuerza bruta e intentos de acceso cruzado.',
    previewType: 'secops'
  },
  {
    id: 'screen-pii',
    title: 'Protección PII & Enmascaramiento',
    subtitle: 'RF-05 • Auditoría PHONE_REVEALED',
    category: 'Cifrado AES-256',
    highlight: 'PII • Zero-Knowledge',
    route: '/profile',
    metrics: '***-***-5678 • Cifrado',
    description: 'El teléfono confidencial permanece cifrado y enmascarado por defecto; cada revelado exige autorización y deja rastro forense.',
    previewType: 'pii'
  },
  {
    id: 'screen-lockout',
    title: 'Defensa Activa Anti-Fuerza Bruta',
    subtitle: 'HTTP 429 & HTTP 423 Locked',
    category: 'Autenticación',
    highlight: 'OWASP A07 • Lockout',
    route: '/login',
    metrics: '5 Intentos • Bloqueo 15m',
    description: 'Limitación de tasa por IP y bloqueo automático de cuenta durante 15 minutos tras 5 intentos fallidos consecutivos.',
    previewType: 'lockout'
  }
];

const CATEGORIES = ['Todos', 'Cifrado AES-256', 'Autenticación', 'Recuperación OTP', 'Auditoría SecOps'];

const simulateHex = (input, salt, len) => {
  const str = (input || 'SecureVault') + salt;
  let hex = '';
  let h = 0x811c9dc5;
  for (let i = 0; i < len; i++) {
    const c = str.charCodeAt(i % str.length);
    h ^= c + i * 31;
    h = Math.imul(h, 0x01000193);
    hex += ((h >>> 0) & 0xff).toString(16).padStart(2, '0');
  }
  return hex.slice(0, len);
};

/* Miniaturas gráficas con la paleta verde de Expensify */
const ScreenGraphicPreview = ({ type }) => {
  if (type === 'vault') {
    return (
      <div className="w-full h-full bg-[#F2FAF6] p-5 flex flex-col justify-between text-[#002E22]">
        <div className="flex items-center justify-between border-b border-[#BBE2CE] pb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#03D47C]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#002E22]"></span>
            <span className="text-[10px] font-mono text-[#3B6E5C] ml-1">vault://aes-256-gcm</span>
          </div>
          <span className="text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-[#C2F5DF] text-[#002E22] font-bold">
            12 / 20 notas
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 my-auto py-2">
          <div className="p-3 rounded-xl bg-white border border-[#BBE2CE] space-y-1.5 shadow-2xs">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-[#002E22]">Llaves Producción</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#C2F5DF] text-[#002E22] font-bold">GCM</span>
            </div>
            <p className="text-[9px] font-mono text-[#3B6E5C] truncate">8f9d2a71bc4019e83a6d52c7...</p>
            <div className="h-1.5 w-2/3 bg-[#03D47C] rounded-full"></div>
          </div>
          <div className="p-3 rounded-xl bg-[#002E22] text-white space-y-1.5 shadow-2xs">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-white">Reserva Cripto</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#03D47C] text-[#002E22] font-bold">256B</span>
            </div>
            <p className="text-[9px] font-mono text-[#C2F5DF] truncate">c4019e83a6d52c7f10492e8a...</p>
            <div className="h-1.5 w-1/2 bg-[#03D47C] rounded-full"></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#3B6E5C] pt-2 border-t border-[#BBE2CE]">
          <span>Cipher: AES-256-GCM</span>
          <span className="text-[#002E22] font-bold">● Integridad Verificada</span>
        </div>
      </div>
    );
  }

  if (type === 'login') {
    return (
      <div className="w-full h-full bg-[#F2FAF6] grid grid-cols-12 overflow-hidden">
        <div className="col-span-7 p-5 flex flex-col justify-center space-y-2">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#0B533E] font-bold">Zero-Trust Auth</span>
          <div className="text-xs font-bold text-[#002E22] font-expensify-serif">Bienvenido a SecureVault</div>
          <div className="h-6 w-full rounded-full border border-[#BBE2CE] bg-white px-2.5 flex items-center text-[9px] text-[#3B6E5C]">
            usuario@dominio.com
          </div>
          <div className="h-6 w-full rounded-full border border-[#BBE2CE] bg-white px-2.5 flex items-center text-[9px] font-mono text-[#002E22]">
            ••••••••••••
          </div>
          <div className="h-6 w-full rounded-full bg-[#03D47C] text-[#002E22] text-[9px] font-bold flex items-center justify-center">
            Desbloquear Bóveda →
          </div>
        </div>
        <div className="col-span-5 bg-[#002E22] p-4 flex flex-col justify-center space-y-2 text-white">
          <div className="bg-[#064232] p-2.5 rounded-xl border border-[#03D47C]/30 space-y-1">
            <span className="text-[8px] font-mono text-[#03D47C] block">HASH ARGON2ID</span>
            <span className="text-[9px] font-mono font-bold text-white block truncate">$argon2id$v=19$m=65536...</span>
          </div>
          <div className="bg-[#064232] p-2 rounded-xl border border-[#03D47C]/20 text-[8px] font-mono text-[#C2F5DF]">
            Cookie: HttpOnly • Strict
          </div>
        </div>
      </div>
    );
  }

  if (type === 'otp') {
    return (
      <div className="w-full h-full bg-[#002E22] p-5 flex flex-col items-center justify-center text-center space-y-3 text-white">
        <span className="text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-[#064232] border border-[#03D47C]/40 text-[#03D47C] font-bold">
          NIST SP 800-63B • OTP 6 Dígitos
        </span>
        <div className="text-xs font-bold text-white font-expensify-serif">Código de Verificación por Correo</div>
        <div className="flex items-center gap-1.5">
          {['5', '9', '3', '8', '2', '1'].map((d, i) => (
            <span
              key={i}
              className="w-7 h-8 rounded-lg bg-[#064232] border-2 border-[#03D47C] text-[#03D47C] font-mono text-xs font-extrabold flex items-center justify-center"
            >
              {d}
            </span>
          ))}
        </div>
        <span className="text-[9px] font-mono text-[#C2F5DF]">Hash almacenado: SHA-256 • Expira en 10m</span>
      </div>
    );
  }

  if (type === 'secops') {
    return (
      <div className="w-full h-full bg-[#F2FAF6] p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#BBE2CE] pb-2">
          <span className="text-[10px] font-bold text-[#002E22]">Bitácora Forense (security_logs)</span>
          <span className="text-[9px] font-mono text-[#0B533E] font-bold">OWASP A09</span>
        </div>
        <div className="space-y-1.5 my-auto font-mono text-[9px]">
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-[#BBE2CE]">
            <span className="px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#B91C1C] font-bold">CRITICAL</span>
            <span className="font-bold text-[#002E22]">IDOR_ATTEMPT</span>
            <span className="text-[#3B6E5C]">192.168.1.45</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-[#BBE2CE]">
            <span className="px-1.5 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] font-bold">WARN</span>
            <span className="font-bold text-[#002E22]">LOGIN_FAILED</span>
            <span className="text-[#3B6E5C]">10.0.14.88</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#C2F5DF]/60 border border-[#03D47C]">
            <span className="px-1.5 py-0.5 rounded bg-[#002E22] text-[#03D47C] font-bold">INFO</span>
            <span className="font-bold text-[#002E22]">PHONE_REVEALED</span>
            <span className="text-[#002E22]">172.16.0.12</span>
          </div>
        </div>
        <div className="text-[9px] font-mono text-[#3B6E5C] flex justify-between pt-1 border-t border-[#BBE2CE]">
          <span>RBAC: Solo Administradores</span>
          <span className="text-[#002E22] font-bold">100% Auditado</span>
        </div>
      </div>
    );
  }

  if (type === 'pii') {
    return (
      <div className="w-full h-full bg-[#F2FAF6] p-5 flex flex-col justify-center space-y-3">
        <div className="flex items-center gap-3 pb-2.5 border-b border-[#BBE2CE]">
          <div className="w-8 h-8 rounded-full bg-[#03D47C] text-[#002E22] font-mono text-xs font-extrabold flex items-center justify-center">
            LM
          </div>
          <div>
            <div className="text-xs font-bold text-[#002E22]">Identidad & PII Protegida</div>
            <div className="text-[9px] font-mono text-[#3B6E5C]">UUID: ae3bd518-c0d4-401e</div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-[#C2F5DF] border border-[#03D47C] flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#002E22] font-semibold block">Teléfono en Reposo</span>
            <span className="text-xs font-mono font-extrabold text-[#002E22]">***-***-5678</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#002E22] text-[#03D47C] text-[9px] font-bold">
            Revelar PII
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#002E22] p-5 flex flex-col justify-center space-y-3">
      <div className="p-3.5 rounded-xl bg-[#064232] border border-[#03D47C]/40 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#03D47C]">HTTP 423 • Protección Activa</span>
          <span className="text-[9px] font-mono text-[#C2F5DF]">15:00 min</span>
        </div>
        <p className="text-[9px] text-white/90 leading-relaxed">
          Bloqueo automático tras 5 intentos fallidos consecutivos para neutralizar ataques de fuerza bruta.
        </p>
      </div>
      <div className="flex items-center justify-between text-[9px] font-mono text-[#C2F5DF] px-1">
        <span>Rate Limiter: Activo</span>
        <span>Evento: ACCOUNT_LOCKED</span>
      </div>
    </div>
  );
};

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedGoal, setSelectedGoal] = useState('personal');
  const [quickEmail, setQuickEmail] = useState('');
  const [heroShowCrypto, setHeroShowCrypto] = useState(false);

  const [activeTab, setActiveTab] = useState('screens');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedScreen, setInspectedScreen] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [demoText, setDemoText] = useState('Claves maestras de producción: sk_live_51Nz98a7bc65d4e3...');
  const simulatedEnvelope = useMemo(() => {
    const clean = demoText || 'Vacío';
    return {
      ciphertext: simulateHex(clean, 'cipher_aes_256_gcm', Math.max(48, Math.min(clean.length * 2, 96))),
      iv: simulateHex(clean, 'iv_csprng_96bit', 24),
      authTag: simulateHex(clean, 'gcm_tag_128bit', 32)
    };
  }, [demoText]);

  const handleHeroStart = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/vault');
    } else {
      navigate('/register');
    }
  };

  const filteredScreens = SCREEN_SHOWCASE.filter((s) => {
    const matchesCategory = selectedCategory === 'Todos' || s.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.subtitle.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleCopySpec = (screen, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${screen.title} — ${screen.subtitle} (${screen.metrics})`);
    setCopiedId(screen.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="min-h-screen bg-[#EDF7F2] text-[#002E22]">
      {/* ====================================================================
          1. BARRA SUPERIOR DE ANUNCIO (ESTILO EXPENSIFY CONCIERGE BANNER)
         ==================================================================== */}
      <div className="bg-[#064232] border-b border-[#0B533E] text-white px-4 py-2.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2.5 text-center">
          <span className="px-2 py-0.5 rounded-full bg-[#03D47C] text-[#002E22] font-extrabold text-[10px] uppercase tracking-wider">
            Zero-Trust
          </span>
          <span className="text-[#C2F5DF]">
            Motor criptográfico <strong className="text-white">AES-256-GCM + Argon2id</strong> activo para proteger notas confidenciales y auditar accesos.
          </span>
          <Link
            to={isAuthenticated ? '/vault' : '/register'}
            className="text-[#03D47C] font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>Explorar ahora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ====================================================================
          2. HERO PRINCIPAL VERDE BOSQUE (#002E22) ESTILO EXPENSIFY WEB
         ==================================================================== */}
      <section className="bg-forest-pattern text-white pt-12 pb-16 sm:pt-16 sm:pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Columna Izquierda: Titular Serif, Checklist, Radio Cards y Pill Input+CTA */}
            <div className="lg:col-span-6 space-y-7">
              <div className="space-y-4 animate-slide-up">
                <h1 className="font-expensify-serif text-4xl sm:text-5xl xl:text-[56px] font-bold tracking-tight text-white leading-[1.08]">
                  La forma <span className="italic text-[#03D47C] font-normal">más segura</span>
                  <br />
                  de cifrar tus notas.
                </h1>

                {/* Checklist con chulos verde esmeralda (#03D47C) */}
                <ul className="space-y-2.5 pt-2 text-sm sm:text-base text-[#E2F8EE]">
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#03D47C]/20 border border-[#03D47C] flex items-center justify-center text-[#03D47C] shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span>Todo cifrado en tiempo real con <strong>AES-256-GCM</strong>.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#03D47C]/20 border border-[#03D47C] flex items-center justify-center text-[#03D47C] shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span>Contraseñas blindadas con <strong>Argon2id (64 MB)</strong> y código OTP.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#03D47C]/20 border border-[#03D47C] flex items-center justify-center text-[#03D47C] shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span>Aislamiento <strong>Anti-IDOR</strong> y bitácora forense integrada.</span>
                  </li>
                </ul>
              </div>

              {/* Tarjetas de Selección Interactivas ("Quiero:") estilo Expensify */}
              <div className="space-y-3 animate-slide-up-delay-1">
                <p className="text-xs font-bold uppercase tracking-wider text-[#03D47C]">
                  Quiero utilizar SecureVault para:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ONBOARDING_OPTIONS.map((opt) => {
                    const isSelected = selectedGoal === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedGoal(opt.id)}
                        className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#0B533E] border-[#03D47C] shadow-[0_0_25px_rgba(3,212,124,0.22)] -translate-y-0.5'
                            : 'bg-[#064232]/70 border-white/15 hover:border-[#03D47C]/60 hover:bg-[#064232]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-[#03D47C]' : 'border-white/40'
                            }`}
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-[#03D47C]"></span>}
                          </span>
                          <span className="text-[10px] font-mono text-[#C2F5DF]">{opt.badge}</span>
                        </div>
                        <span className="text-xs font-semibold text-white leading-snug">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Barra Combinada Pill Blanca Input + Botón Verde Esmeralda (#03D47C) */}
              <form onSubmit={handleHeroStart} className="animate-slide-up-delay-2">
                <div className="p-1.5 pl-5 rounded-full bg-white shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <input
                    type="email"
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    placeholder="Ingresa tu correo electrónico o usuario..."
                    className="bg-transparent text-sm text-[#002E22] placeholder-[#639281] focus:outline-none flex-1 py-2.5 sm:py-0"
                  />
                  <button
                    type="submit"
                    className="btn-expensify px-7 py-3.5 rounded-full text-sm inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <span>{isAuthenticated ? 'Abrir Mi Bóveda' : 'Comenzar gratis'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Columna Derecha: Estrellas de Confianza + Mockups Superpuestos Flotantes */}
            <div className="lg:col-span-6 space-y-4 animate-slide-up-delay-1">
              {/* Sello de estrellas arriba a la derecha */}
              <div className="flex items-center justify-start lg:justify-end gap-2.5 text-xs text-[#C2F5DF]">
                <span className="text-[#03D47C] text-sm tracking-widest">★★★★★</span>
                <span className="font-semibold text-white">OWASP Top 10:2025</span>
                <span>•</span>
                <span>NIST SP 800-63B Verified</span>
              </div>

              {/* Contenedor de Mockups Superpuestos */}
              <div className="relative pt-2 pb-10">
                {/* Tarjeta grande de escritorio (Fondo Verde Menta / Alabastro Cálido) */}
                <div className="rounded-3xl bg-[#F2FAF6] text-[#002E22] p-5 sm:p-6 shadow-2xl border-2 border-[#03D47C]/40 animate-float">
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#BBE2CE]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#03D47C] text-[#002E22] font-extrabold text-xs flex items-center justify-center">
                        SV
                      </div>
                      <span className="text-xs font-bold text-[#002E22]">Bóveda Cifrada • Vista Rápida</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHeroShowCrypto(!heroShowCrypto)}
                      className="px-3 py-1 rounded-full bg-[#002E22] text-[#03D47C] text-[11px] font-mono font-bold hover:bg-[#064232] transition-colors cursor-pointer"
                    >
                      {heroShowCrypto ? 'Ver Texto Plano' : 'Ver Sobre AES-256'}
                    </button>
                  </div>

                  {!heroShowCrypto ? (
                    <div className="space-y-2.5">
                      {[
                        { title: 'Llaves Maestras AWS & Neon DB', tag: 'AES-256-GCM', time: 'Hace 2m', amount: '256-bit' },
                        { title: 'Certificados TLS & Tokens JWT', tag: 'Argon2id', time: 'Hace 14m', amount: 'Protegido' },
                        { title: 'Respaldo de Semillas Criptográficas', tag: 'Zero-Trust', time: 'Hace 1h', amount: 'Verificado' }
                      ].map((row, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white border border-[#BBE2CE] flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#C2F5DF] text-[#002E22] flex items-center justify-center">
                              <Lock className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#002E22]">{row.title}</div>
                              <div className="text-[10px] text-[#3B6E5C] font-mono">{row.time} • Propietario verificado</div>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-[#C2F5DF] text-[#002E22] font-mono text-[10px] font-bold">
                            {row.tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#002E22] text-white font-mono text-[11px] space-y-2.5 animate-slide-up">
                      <div className="flex justify-between text-[#03D47C]">
                        <span>content_encrypted (PostgreSQL):</span>
                        <span>GCM-TAG OK</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#064232] text-[#C2F5DF] break-all">
                        e83f9104cb1a29f8d42018ea37bc94a10f28e71c49102c9a...
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-lg bg-[#064232]">
                          <span className="text-[9px] text-[#03D47C] block">IV (12 Bytes)</span>
                          <span>9f81c204a71b3e90</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#064232]">
                          <span className="text-[9px] text-[#03D47C] block">AuthTag (16 Bytes)</span>
                          <span>4c9018ea72b3d10f</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tarjeta Flotante Superpuesta Inferior Izquierda (Estilo Tarjeta Virtual Verde Expensify) */}
                <div className="hidden sm:flex items-center justify-between gap-4 rounded-2xl bg-[#064232] border-2 border-[#03D47C] p-4 text-white shadow-2xl max-w-xs -mt-8 ml-4 relative z-20 animate-float-delayed">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#03D47C] block font-bold">
                      Llave Criptográfica Activa
                    </span>
                    <div className="text-sm font-bold text-white font-mono">•••• •••• •••• 256B</div>
                    <span className="text-[10px] text-[#C2F5DF] block">Envelope AES-256-GCM • TLS 1.3</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#03D47C] text-[#002E22] flex items-center justify-center font-extrabold text-xs font-mono shrink-0">
                    GCM
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ====================================================================
          3. FRANJA DE CONFIANZA VERDE ESMERALDA OSCURO (#0B533E)
         ==================================================================== */}
      <div className="bg-[#0B533E] border-y border-[#03D47C]/25 py-5 px-4 text-center">
        <p className="font-expensify-serif text-base sm:text-xl text-white tracking-tight">
          Arquitectura diseñada bajo los estándares <span className="italic text-[#03D47C]">OWASP Top 10:2025</span>,{' '}
          <span className="italic text-[#03D47C]">RFC 9106 Argon2id</span> y{' '}
          <span className="italic text-[#03D47C]">NIST SP 800-63B</span>.
        </p>
      </div>

      {/* ====================================================================
          4. SUB-NAVEGACIÓN Y GALERÍA DE PANTALLAS EN TONOS VERDE MENTA Y BOSQUE
         ==================================================================== */}
      <div className="sticky top-16 z-30 bg-[#E3F3EB]/95 backdrop-blur-md border-b border-[#BBE2CE]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 h-14 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center space-x-6 shrink-0">
            <nav className="flex items-center space-x-6">
              {[
                { id: 'screens', label: 'Galería de Pantallas (6)' },
                { id: 'sandbox', label: 'Simulador AES-256 en Vivo' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === t.id
                      ? 'border-[#002E22] text-[#002E22]'
                      : 'border-transparent text-[#3B6E5C] hover:text-[#002E22]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="h-4 w-px bg-[#BBE2CE] hidden md:block"></div>

            {activeTab === 'screens' && (
              <div className="hidden md:flex items-center gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`h-8 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      selectedCategory === cat
                        ? 'bg-[#002E22] text-[#03D47C] border-[#002E22]'
                        : 'bg-[#F7FCF9] text-[#002E22] border-[#BBE2CE] hover:bg-[#C2F5DF]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative hidden sm:flex items-center">
              <Search className="w-3.5 h-3.5 text-[#3B6E5C] absolute left-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar módulos..."
                className="h-8 pl-8 pr-7 rounded-full bg-white border border-[#BBE2CE] focus:border-[#03D47C] text-xs text-[#002E22] placeholder-[#639281] focus:outline-none w-44"
              />
            </div>
            <span className="text-xs font-bold text-[#0B533E]">
              {filteredScreens.length} módulos activos
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          5. GALERÍA INTERACTIVA 16:10 Y SIMULADOR EN VERDE MENTA / BOSQUE
         ==================================================================== */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-12">
        {activeTab === 'screens' ? (
          <ol className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {filteredScreens.map((screen, index) => (
              <li
                key={screen.id}
                className="group flex flex-col space-y-3 animate-slide-up"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div
                  onClick={() => setInspectedScreen(screen)}
                  className="relative aspect-[16/10] w-full rounded-2xl bg-[#DDF2E8] p-3.5 border-2 border-[#BBE2CE] group-hover:border-[#03D47C] overflow-hidden cursor-pointer transition-all duration-300 group-hover:shadow-[0_20px_40px_-15px_rgba(0,46,34,0.22)]"
                >
                  <div className="w-full h-full rounded-xl overflow-hidden border border-[#BBE2CE] shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
                    <ScreenGraphicPreview type={screen.previewType} />
                  </div>

                  {/* Badge superior izquierdo */}
                  <div className="absolute top-5 left-5 z-10 px-3 py-1 rounded-full bg-[#002E22]/90 backdrop-blur-md text-[11px] font-bold text-[#03D47C] shadow-sm transition-opacity duration-200 group-hover:opacity-0">
                    {screen.highlight}
                  </div>

                  {/* Controles Hover Estilo Mobbin en Verde Expensify */}
                  <div className="absolute inset-0 bg-[#002E22]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedScreen(screen);
                        }}
                        className="w-9 h-9 rounded-full bg-[#03D47C] text-[#002E22] flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                        title="Ampliar vista previa"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>

                      <span className="px-3 py-1 rounded-full bg-[#002E22] text-[#03D47C] text-[10px] font-mono font-bold shadow-md">
                        {screen.metrics}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(screen.route);
                        }}
                        className="flex-1 h-10 px-4 rounded-full bg-[#03D47C] hover:bg-[#02B86B] text-[#002E22] text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                      >
                        <span>Abrir Módulo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleCopySpec(screen, e)}
                        className="flex-1 h-10 px-4 rounded-full bg-[#002E22]/90 hover:bg-[#002E22] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                      >
                        {copiedId === screen.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#03D47C]" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#03D47C]" />
                            <span>Copiar Spec</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-sm font-bold text-[#002E22] group-hover:text-[#0B533E]">
                      {screen.title}
                    </h3>
                    <p className="text-xs text-[#3B6E5C] font-mono">{screen.subtitle}</p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#002E22] bg-[#C2F5DF] px-3 py-0.5 rounded-full border border-[#03D47C]/40">
                    {screen.category}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          /* SIMULADOR INTERACTIVO EN VIVO */
          <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="sage-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#BBE2CE] pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#002E22]">
                    1. Texto Plano en Memoria RAM
                  </span>
                  <span className="text-xs font-mono text-[#3B6E5C]">{demoText.length} bytes</span>
                </div>
                <textarea
                  value={demoText}
                  onChange={(e) => setDemoText(e.target.value)}
                  rows={6}
                  className="input-sage w-full rounded-xl p-3.5 text-sm resize-none"
                  placeholder="Escribe aquí un secreto para cifrar..."
                />
              </div>

              <div className="rounded-2xl p-6 bg-[#002E22] text-white space-y-4 font-mono text-xs shadow-xl">
                <div className="flex items-center justify-between border-b border-[#0B533E] pb-3 font-sans">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#03D47C]">
                    2. Sobre Cifrado en PostgreSQL
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#03D47C] text-[#002E22] font-extrabold">
                    AES-256-GCM
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#C2F5DF] uppercase block mb-1">content_encrypted:</span>
                  <div className="bg-[#064232] p-3 rounded-xl border border-[#03D47C]/30 text-[11px] text-[#03D47C] break-all">
                    {simulatedEnvelope.ciphertext}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#C2F5DF] uppercase block mb-1">content_iv (12B):</span>
                    <div className="bg-[#064232] p-2.5 rounded-xl border border-[#03D47C]/30 text-[11px] text-white break-all">
                      {simulatedEnvelope.iv}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#C2F5DF] uppercase block mb-1">content_tag (16B):</span>
                    <div className="bg-[#064232] p-2.5 rounded-xl border border-[#03D47C]/30 text-[11px] text-white break-all">
                      {simulatedEnvelope.authTag}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL LIGHTBOX */}
      {inspectedScreen && (
        <div
          onClick={() => setInspectedScreen(null)}
          className="fixed inset-0 z-50 bg-[#002E22]/75 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F7FCF9] border-2 border-[#03D47C] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl animate-modal-in"
          >
            <div className="px-6 py-4 bg-[#002E22] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-0.5 rounded-full bg-[#03D47C] text-[#002E22] text-[11px] font-mono font-extrabold">
                  {inspectedScreen.category}
                </span>
                <h3 className="text-base font-bold text-white">{inspectedScreen.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedScreen(null)}
                className="p-1.5 rounded-full hover:bg-[#064232] text-[#C2F5DF] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-[#DDF2E8]">
              <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden border border-[#BBE2CE] shadow-md bg-white">
                <ScreenGraphicPreview type={inspectedScreen.previewType} />
              </div>
            </div>

            <div className="px-6 py-4 bg-[#F7FCF9] border-t border-[#BBE2CE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-[#3B6E5C] max-w-md">{inspectedScreen.description}</p>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setInspectedScreen(null)}
                  className="btn-sage px-4 py-2 rounded-full text-xs cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => navigate(inspectedScreen.route)}
                  className="btn-expensify px-5 py-2 rounded-full text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Abrir este módulo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
