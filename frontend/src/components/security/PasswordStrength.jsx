import React from 'react';
import { Check, X, ShieldCheck, Shield } from 'lucide-react';

export const PasswordStrength = ({ password = '' }) => {
  const criteria = [
    { label: 'Mínimo 12 caracteres', met: password.length >= 12 },
    { label: 'Al menos una mayúscula (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Al menos una minúscula (a-z)', met: /[a-z]/.test(password) },
    { label: 'Al menos un número (0-9)', met: /[0-9]/.test(password) },
    { label: 'Al menos un símbolo (@$!%*#?&-_)', met: /[^A-Za-z0-9]/.test(password) }
  ];

  const metCount = criteria.filter((c) => c.met).length;
  const scorePercent = (metCount / criteria.length) * 100;

  const getStrengthMeta = () => {
    if (metCount <= 2) return { text: 'Débil', color: 'from-rose-500 to-red-500', textColor: 'text-rose-400' };
    if (metCount === 3) return { text: 'Aceptable', color: 'from-amber-500 to-yellow-400', textColor: 'text-amber-400' };
    if (metCount === 4) return { text: 'Fuerte', color: 'from-emerald-500 to-teal-400', textColor: 'text-emerald-400' };
    return { text: 'Blindada (NIST SP 800-63B)', color: 'from-emerald-400 via-teal-400 to-cyan-400', textColor: 'text-emerald-300' };
  };

  const meta = getStrengthMeta();

  if (!password) return null;

  return (
    <div className="mt-3 p-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs space-y-2.5 animate-slide-up">
      <div className="flex items-center justify-between text-slate-300">
        <span className="flex items-center gap-1.5 font-semibold">
          {metCount === 5 ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 animate-bounce" />
          ) : (
            <Shield className="w-4 h-4 text-slate-400" />
          )}
          Entropía de Contraseña:
        </span>
        <span className={`font-bold font-mono text-[11px] ${meta.textColor}`}>
          {meta.text}
        </span>
      </div>

      {/* Animated Progress Bar */}
      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full bg-gradient-to-r ${meta.color} transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]`}
          style={{ width: `${scorePercent}%` }}
        />
      </div>

      {/* Checklist */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
        {criteria.map((c, i) => (
          <li
            key={i}
            className={`flex items-center gap-1.5 transition-all duration-300 ${
              c.met ? 'text-emerald-400 font-medium translate-x-0.5' : 'text-slate-500'
            }`}
          >
            {c.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            )}
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;
