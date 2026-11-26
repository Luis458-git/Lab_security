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
  CheckCircle2,
  Terminal,
  Search,
  Sparkles,
  Copy,
  Check,
  X,
  Maximize2,
  Filter
} from 'lucide-react';

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

const FLOW_STEPS = [
  {
    step: '01',
    title: 'Derivación Argon2id (64 MB)',
    desc: 'La contraseña maestra pasa por 3 iteraciones de Argon2id antes de validar la identidad y emitir la cookie HttpOnly.'
  },
  {
    step: '02',
    title: 'Generación CSPRNG de IV (12 Bytes)',
    desc: 'Cada nota genera un vector de inicialización irrepetible mediante el generador criptográfico del kernel.'
  },
  {
    step: '03',
    title: 'Sello de Integridad GCM (16 Bytes)',
    desc: 'Se calcula el AuthTag sobre el texto cifrado para detectar cualquier intento de manipulación en base de datos.'
  },
  {
    step: '04',
    title: 'Aislamiento SQL Anti-IDOR',
    desc: 'Toda lectura o escritura verifica explícitamente owner_id = user.id y registra alertas forenses ante discrepancias.'
  }
];

// Generador determinista visual para el simulador interactivo
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

/* Miniaturas gráficas interactivas dentro de cada tarjeta 16:10 estilo Mobbin */
const ScreenGraphicPreview = ({ type }) => {
  if (type === 'vault') {
    return (
      <div className="w-full h-full bg-white p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#141414]"></span>
            <span className="w-2 h-2 rounded-full bg-[#D4D4D8]"></span>
            <span className="text-[10px] font-mono text-[#666666] ml-1">vault / notes / aes-256-gcm</span>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#141414] font-semibold border border-[#E5E5E5]">
            12 / 20 notas
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 my-auto py-2">
          <div className="p-3 rounded-xl bg-[#F7F7F8] border border-[#E5E5E5] space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-[#141414]">Llaves Producción</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#E5E5E5]">GCM</span>
            </div>
            <p className="text-[9px] font-mono text-[#666666] truncate">8f9d2a71bc4019e83a6d52c7...</p>
            <div className="h-1.5 w-2/3 bg-[#E5E5E5] rounded-full"></div>
          </div>
          <div className="p-3 rounded-xl bg-[#F7F7F8] border border-[#E5E5E5] space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-[#141414]">Reserva Cripto</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#E5E5E5]">GCM</span>
            </div>
            <p className="text-[9px] font-mono text-[#666666] truncate">c4019e83a6d52c7f10492e8a...</p>
            <div className="h-1.5 w-1/2 bg-[#E5E5E5] rounded-full"></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#666666] pt-2 border-t border-[#E5E5E5]">
          <span>Cipher: AES-256-GCM</span>
          <span className="text-[#141414] font-semibold">● Integridad Verificada</span>
        </div>
      </div>
    );
  }

  if (type === 'login') {
    return (
      <div className="w-full h-full bg-white grid grid-cols-12 overflow-hidden">
        <div className="col-span-7 p-5 flex flex-col justify-center space-y-2.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#666666]">Zero-Trust Auth</span>
          <div className="text-xs font-bold text-[#141414]">Inicia sesión en SecureVault</div>
          <div className="h-6 w-full rounded-md border border-[#E5E5E5] bg-[#FAFAFA] px-2 flex items-center text-[9px] text-[#878787]">
            usuario@dominio.com
          </div>
          <div className="h-6 w-full rounded-md border border-[#E5E5E5] bg-[#FAFAFA] px-2 flex items-center text-[9px] font-mono text-[#141414]">
            ••••••••••••
          </div>
          <div className="h-6 w-full rounded-md bg-[#141414] text-white text-[9px] font-semibold flex items-center justify-center">
            Iniciar Sesión →
          </div>
        </div>
        <div className="col-span-5 bg-[#F4F4F5] border-l border-[#E5E5E5] p-4 flex flex-col justify-center space-y-2 bg-dot-grid">
          <div className="bg-white p-2.5 rounded-lg border border-[#E5E5E5] shadow-2xs space-y-1">
            <span className="text-[8px] font-mono text-[#666666] block">HASH ARGON2ID</span>
            <span className="text-[9px] font-mono font-bold text-[#141414] block truncate">$argon2id$v=19$m=65536...</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-[#E5E5E5] text-[8px] font-mono text-[#666666]">
            Cookie: HttpOnly • Strict
          </div>
        </div>
      </div>
    );
  }

  if (type === 'otp') {
    return (
      <div className="w-full h-full bg-white p-5 flex flex-col items-center justify-center text-center space-y-3">
        <span className="text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-[#F4F4F5] border border-[#E5E5E5] text-[#141414] font-semibold">
          NIST SP 800-63B • OTP 6 Dígitos
        </span>
        <div className="text-xs font-bold text-[#141414]">Código de Verificación por Correo</div>
        <div className="flex items-center gap-1.5">
          {['5', '9', '3', '8', '2', '1'].map((d, i) => (
            <span
              key={i}
              className="w-7 h-8 rounded-lg bg-[#F7F7F8] border border-[#141414] text-[#141414] font-mono text-xs font-extrabold flex items-center justify-center shadow-2xs"
            >
              {d}
            </span>
          ))}
        </div>
        <span className="text-[9px] font-mono text-[#666666]">Hash almacenado: SHA-256 • Expira en 10m</span>
      </div>
    );
  }

  if (type === 'secops') {
    return (
      <div className="w-full h-full bg-white p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
          <span className="text-[10px] font-bold text-[#141414]">Bitácora Forense (security_logs)</span>
          <span className="text-[9px] font-mono text-[#666666]">OWASP A09</span>
        </div>
        <div className="space-y-1.5 my-auto font-mono text-[9px]">
          <div className="flex items-center justify-between p-1.5 rounded bg-[#F7F7F8] border border-[#E5E5E5]">
            <span className="px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#B91C1C] font-bold">CRITICAL</span>
            <span className="font-bold text-[#141414]">IDOR_ATTEMPT</span>
            <span className="text-[#666666]">192.168.1.45</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-[#F7F7F8] border border-[#E5E5E5]">
            <span className="px-1.5 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] font-bold">WARN</span>
            <span className="font-bold text-[#141414]">LOGIN_FAILED</span>
            <span className="text-[#666666]">10.0.14.88</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-[#F7F7F8] border border-[#E5E5E5]">
            <span className="px-1.5 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] font-bold">INFO</span>
            <span className="font-bold text-[#141414]">PHONE_REVEALED</span>
            <span className="text-[#666666]">172.16.0.12</span>
          </div>
        </div>
        <div className="text-[9px] font-mono text-[#666666] flex justify-between pt-1 border-t border-[#E5E5E5]">
          <span>RBAC: Solo Administradores</span>
          <span>100% Auditado</span>
        </div>
      </div>
    );
  }

  if (type === 'pii') {
    return (
      <div className="w-full h-full bg-white p-5 flex flex-col justify-center space-y-3">
        <div className="flex items-center gap-3 pb-2.5 border-b border-[#E5E5E5]">
          <div className="w-8 h-8 rounded-full bg-[#141414] text-white font-mono text-xs font-bold flex items-center justify-center">
            LM
          </div>
          <div>
            <div className="text-xs font-bold text-[#141414]">Identidad & PII Protegida</div>
            <div className="text-[9px] font-mono text-[#666666]">UUID: ae3bd518-c0d4-401e</div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-[#F7F7F8] border border-[#E5E5E5] flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#666666] block">Teléfono en Reposo</span>
            <span className="text-xs font-mono font-bold text-[#141414]">***-***-5678</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#141414] text-white text-[9px] font-semibold">
            Revelar PII
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white p-5 flex flex-col justify-center space-y-3">
      <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#B91C1C]">HTTP 423 • Cuenta Bloqueada</span>
          <span className="text-[9px] font-mono text-[#B91C1C]">15:00 min</span>
        </div>
        <p className="text-[9px] text-[#7F1D1D] leading-relaxed">
          Se detectaron 5 intentos fallidos consecutivos. Acceso suspendido temporalmente para mitigar diccionario.
        </p>
      </div>
      <div className="flex items-center justify-between text-[9px] font-mono text-[#666666] px-1">
        <span>Rate Limiter: Activo</span>
        <span>Evento: ACCOUNT_LOCKED</span>
      </div>
    </div>
  );
};

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('screens'); // 'screens' | 'elements' | 'flows' | 'sandbox'
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [platformMode, setPlatformMode] = useState('Web'); // 'Web' | 'Zero-Trust'
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedScreen, setInspectedScreen] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Simulador interactivo
  const [demoText, setDemoText] = useState('Claves maestras de producción: sk_live_51Nz98a7bc65d4e3...');
  const simulatedEnvelope = useMemo(() => {
    const clean = demoText || 'Vacío';
    return {
      ciphertext: simulateHex(clean, 'cipher_aes_256_gcm', Math.max(48, Math.min(clean.length * 2, 96))),
      iv: simulateHex(clean, 'iv_csprng_96bit', 24),
      authTag: simulateHex(clean, 'gcm_tag_128bit', 32)
    };
  }, [demoText]);

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
    <div className="min-h-screen bg-white text-[#141414]">
      {/* ====================================================================
          1. MOBBIN APP HEADER SECTION
         ==================================================================== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 pt-10 pb-8">
        <div className="flex flex-col space-y-6 animate-slide-up">
          {/* App Squircle Icon & 2-Line Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[28%] bg-[#141414] text-white flex items-center justify-center shadow-md shrink-0 animate-float">
                <Lock className="w-9 h-9 sm:w-10 sm:h-10 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#141414] leading-[1.12]">
                  SecureVault — <br className="hidden sm:inline" />
                  <span className="text-[#666666] font-semibold">Encrypted notes & privacy architecture</span>
                </h1>
              </div>
            </div>

            {/* Action & Platform Segmented Row (Exact Mobbin Pill Controls) */}
            <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
              <div
                role="radiogroup"
                className="inline-flex items-center h-11 p-1 rounded-full bg-[#F4F4F5] border border-[#E5E5E5]"
              >
                {['Web', 'Zero-Trust'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPlatformMode(mode)}
                    className={`px-4 h-9 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      platformMode === mode
                        ? 'bg-[#141414] text-white shadow-2xs'
                        : 'text-[#666666] hover:text-[#141414]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="h-6 w-px bg-[#E5E5E5] hidden sm:block"></div>

              <Link
                to={isAuthenticated ? '/vault' : '/register'}
                className="btn-editorial h-11 px-6 rounded-full inline-flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <span>{isAuthenticated ? 'Abrir Mi Bóveda' : 'Crear Bóveda'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mobbin-style Info Banner Bar */}
          <div className="w-full rounded-xl bg-[#F7F7F8] border border-[#E5E5E5] px-4 py-3 flex flex-wrap items-center justify-between gap-3 animate-slide-up-delay-1">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-[#141414]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#141414] text-white text-[11px] font-bold tracking-wide uppercase">
                OWASP 2025
              </span>
              <span className="text-[#666666]">
                Explora la arquitectura de seguridad de <strong className="text-[#141414]">SecureVault</strong>: cifrado autenticado AES-256-GCM, Argon2id y recuperación OTP.
              </span>
            </div>
            <Link
              to={isAuthenticated ? '/vault' : '/login'}
              className="text-xs sm:text-sm font-bold text-[#141414] hover:underline flex items-center gap-1"
            >
              <span>{isAuthenticated ? 'Ir al panel activo' : 'Iniciar sesión ahora'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Metadata Columns Row (Rating / Encryption / Hashing / Standard) */}
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 pt-1 animate-slide-up-delay-2">
            <div>
              <div className="text-xs text-[#878787] font-medium">Nivel de Seguridad</div>
              <div className="text-sm sm:text-base font-bold text-[#141414] flex items-center gap-1.5 mt-0.5">
                <span>★★★★★</span>
                <span>A+ Verified</span>
              </div>
            </div>
            <div className="h-8 w-px bg-[#E5E5E5]"></div>
            <div>
              <div className="text-xs text-[#878787] font-medium">Cifrado en Reposo</div>
              <div className="text-sm sm:text-base font-bold text-[#141414] font-mono mt-0.5">
                AES-256-GCM
              </div>
            </div>
            <div className="h-8 w-px bg-[#E5E5E5]"></div>
            <div>
              <div className="text-xs text-[#878787] font-medium">Hashing de Claves</div>
              <div className="text-sm sm:text-base font-bold text-[#141414] font-mono mt-0.5">
                Argon2id (64 MB)
              </div>
            </div>
            <div className="h-8 w-px bg-[#E5E5E5]"></div>
            <div>
              <div className="text-xs text-[#878787] font-medium">Recuperación</div>
              <div className="text-sm sm:text-base font-bold text-[#141414] font-mono mt-0.5">
                OTP 6-Digit (SHA-256)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. MOBBIN STICKY SUB-NAVIGATION TABS & FILTER PILL BAR
         ==================================================================== */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-y border-[#E5E5E5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 h-14 flex items-center justify-between gap-4 overflow-x-auto">
          {/* Left: Version & Main Tabs (Screens / UI Elements / Flows / Sandbox) */}
          <div className="flex items-center space-x-6 shrink-0">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#141414]">
              <span>v2.5 Latest</span>
            </div>

            <div className="h-4 w-px bg-[#E5E5E5]"></div>

            <nav className="flex items-center space-x-6">
              {[
                { id: 'screens', label: 'Screens' },
                { id: 'sandbox', label: 'Simulador AES-256' },
                { id: 'flows', label: 'Flows Criptográficos' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === t.id
                      ? 'border-[#141414] text-[#141414]'
                      : 'border-transparent text-[#878787] hover:text-[#141414]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="h-4 w-px bg-[#E5E5E5] hidden md:block"></div>

            {/* Category Filter Pills */}
            {activeTab === 'screens' && (
              <div className="hidden md:flex items-center gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`h-8 px-3.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                      selectedCategory === cat
                        ? 'bg-[#141414] text-white border-[#141414]'
                        : 'bg-white text-[#666666] border-[#E5E5E5] hover:border-[#141414] hover:text-[#141414]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Inline Filter Search & Screen Count Indicator */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative hidden sm:flex items-center">
              <Search className="w-3.5 h-3.5 text-[#878787] absolute left-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar pantallas..."
                className="h-8 pl-8 pr-7 rounded-full bg-[#F4F4F5] border border-transparent focus:border-[#141414] focus:bg-white text-xs text-[#141414] placeholder-[#878787] focus:outline-none transition-all w-44"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-[#878787] hover:text-[#141414]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <span className="text-xs sm:text-sm text-[#878787] font-medium">
              Mostrando {filteredScreens.length} pantallas
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. TAB CONTENT: MOBBIN 16:10 SCREEN GALLERY / SANDBOX / FLOWS
         ==================================================================== */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-10">
        {activeTab === 'screens' && (
          <>
            {/* Mobile category pills */}
            <div className="flex md:hidden flex-wrap gap-2 mb-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-8 px-3.5 rounded-full text-xs font-semibold transition-all border ${
                    selectedCategory === cat
                      ? 'bg-[#141414] text-white border-[#141414]'
                      : 'bg-white text-[#666666] border-[#E5E5E5]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 16:10 Mobbin Screen Cards Grid */}
            <ol className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredScreens.map((screen, index) => (
                <li
                  key={screen.id}
                  className="group flex flex-col space-y-3 animate-slide-up"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  {/* 16:10 Screen Container with Inset Border & Hover Overlays */}
                  <div
                    onClick={() => setInspectedScreen(screen)}
                    className="relative aspect-[16/10] w-full rounded-xl bg-[#F4F4F5] p-3 sm:p-4 border border-[#E5E5E5] group-hover:border-[#141414] overflow-hidden cursor-pointer transition-all duration-300 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)]"
                  >
                    {/* Inner Browser Screen Artwork */}
                    <div className="w-full h-full rounded-lg overflow-hidden border border-[#E5E5E5] shadow-2xs transition-transform duration-500 group-hover:scale-[1.02]">
                      <ScreenGraphicPreview type={screen.previewType} />
                    </div>

                    {/* Top-Left Default "Highlight" Badge (Fades out on Hover like Mobbin) */}
                    <div className="absolute top-5 left-5 z-10 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-black/10 text-[11px] font-semibold text-[#141414] shadow-2xs transition-opacity duration-200 group-hover:opacity-0">
                      {screen.highlight}
                    </div>

                    {/* Hover Overlay Controls (Exact Mobbin 4-corner pattern) */}
                    <div className="absolute inset-0 bg-black/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4">
                      {/* Top row on hover */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedScreen(screen);
                          }}
                          className="w-8 h-8 rounded-full bg-white border-2 border-[#141414] flex items-center justify-center text-[#141414] shadow-sm hover:scale-105 transition-transform"
                          title="Ampliar vista previa"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>

                        <span className="px-2.5 py-1 rounded-full bg-[#141414] text-white text-[10px] font-mono font-semibold shadow-sm">
                          {screen.metrics}
                        </span>
                      </div>

                      {/* Bottom Split Pill Buttons on Hover ("Abrir Pantalla" + "Copiar Spec") */}
                      <div className="flex items-center gap-2.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(screen.route);
                          }}
                          className="flex-1 h-10 px-4 rounded-full bg-[#141414] hover:bg-[#262626] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                        >
                          <span>Abrir Pantalla</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleCopySpec(screen, e)}
                          className="flex-1 h-10 px-4 rounded-full bg-white/90 hover:bg-white backdrop-blur-md text-[#141414] border border-black/15 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                        >
                          {copiedId === screen.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#15803d]" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Spec</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Label (Flow title & subtitle) */}
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h3 className="text-sm font-bold text-[#141414] group-hover:underline">
                        {screen.title}
                      </h3>
                      <p className="text-xs text-[#878787] font-mono">{screen.subtitle}</p>
                    </div>
                    <span className="text-[11px] font-mono text-[#666666] bg-[#F4F4F5] px-2.5 py-0.5 rounded-full border border-[#E5E5E5]">
                      {screen.category}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}

        {/* TAB 2: SIMULADOR INTERACTIVO AES-256-GCM */}
        {activeTab === 'sandbox' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-5">
              <div>
                <h2 className="text-2xl font-bold text-[#141414]">
                  Simulador en Vivo: Sobre Criptográfico AES-256-GCM
                </h2>
                <p className="text-sm text-[#666666] mt-1">
                  Escribe cualquier secreto y observa cómo se fragmenta en Ciphertext, IV de 12 bytes y AuthTag de 16 bytes.
                </p>
              </div>
              <Link
                to={isAuthenticated ? '/vault' : '/register'}
                className="btn-editorial px-5 py-2.5 rounded-full text-xs inline-flex items-center gap-2 self-start"
              >
                <span>Probar en la Bóveda Real</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="editorial-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#141414]">
                    1. Texto Plano en Memoria RAM
                  </span>
                  <span className="text-xs font-mono text-[#878787]">{demoText.length} bytes</span>
                </div>
                <textarea
                  value={demoText}
                  onChange={(e) => setDemoText(e.target.value)}
                  rows={6}
                  className="input-editorial w-full rounded-xl p-3.5 text-sm resize-none"
                  placeholder="Escribe aquí un secreto para cifrar..."
                />
              </div>

              <div className="editorial-card rounded-2xl p-6 bg-[#F7F7F8] space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3 font-sans">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#141414]">
                    2. Registro Persistido en PostgreSQL
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#141414] text-white font-bold">
                    AES-256-GCM
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] uppercase block mb-1">content_encrypted:</span>
                  <div className="bg-white p-3 rounded-xl border border-[#E5E5E5] text-[11px] text-[#141414] break-all">
                    {simulatedEnvelope.ciphertext}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#666666] uppercase block mb-1">content_iv (12B):</span>
                    <div className="bg-white p-2.5 rounded-xl border border-[#E5E5E5] text-[11px] text-[#141414] break-all">
                      {simulatedEnvelope.iv}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] uppercase block mb-1">content_tag (16B):</span>
                    <div className="bg-white p-2.5 rounded-xl border border-[#E5E5E5] text-[11px] text-[#141414] break-all">
                      {simulatedEnvelope.authTag}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FLOWS CRIPTOGRÁFICOS */}
        {activeTab === 'flows' && (
          <div className="space-y-8 animate-slide-up">
            <div className="border-b border-[#E5E5E5] pb-4">
              <h2 className="text-2xl font-bold text-[#141414]">Flujo de Seguridad End-to-Rest</h2>
              <p className="text-sm text-[#666666] mt-1">
                Secuencia de verificación criptográfica aplicada a cada solicitud en SecureVault.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FLOW_STEPS.map((f) => (
                <div key={f.step} className="editorial-card rounded-2xl p-6 space-y-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#141414] text-white font-mono text-xs font-bold">
                    {f.step}
                  </span>
                  <h3 className="text-base font-bold text-[#141414]">{f.title}</h3>
                  <p className="text-xs text-[#666666] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
          4. MODAL DE INSPECCIÓN DE PANTALLA (LIGHTBOX ESTILO MOBBIN)
         ==================================================================== */}
      {inspectedScreen && (
        <div
          onClick={() => setInspectedScreen(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E5E5E5] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl animate-modal-in"
          >
            <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#141414] text-white text-[11px] font-mono font-bold">
                  {inspectedScreen.category}
                </span>
                <h3 className="text-base font-bold text-[#141414]">{inspectedScreen.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedScreen(null)}
                className="p-1.5 rounded-full hover:bg-[#F4F4F5] text-[#666666] hover:text-[#141414] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-[#F4F4F5]">
              <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-[#E5E5E5] shadow-sm bg-white">
                <ScreenGraphicPreview type={inspectedScreen.previewType} />
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-[#666666] max-w-md">{inspectedScreen.description}</p>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setInspectedScreen(null)}
                  className="btn-editorial-outline px-4 py-2 rounded-full text-xs cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => navigate(inspectedScreen.route)}
                  className="btn-editorial px-5 py-2 rounded-full text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Ir a esta pantalla</span>
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
