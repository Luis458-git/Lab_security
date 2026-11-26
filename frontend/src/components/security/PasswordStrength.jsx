import React from 'react';
import { Check, X } from 'lucide-react';

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
    if (metCount <= 2) return { text: 'Insegura', color: 'bg-[#b91c1c]', textColor: 'text-[#b91c1c]' };
    if (metCount === 3) return { text: 'Aceptable', color: 'bg-[#b45309]', textColor: 'text-[#b45309]' };
    if (metCount === 4) return { text: 'Fuerte', color: 'bg-[#141414]', textColor: 'text-[#141414]' };
    return { text: 'Robusta (NIST SP 800-63B)', color: 'bg-[#15803d]', textColor: 'text-[#15803d]' };
  };

  const meta = getStrengthMeta();

  if (!password) return null;

  return (
    <div className="mt-2.5 p-3.5 rounded-xl bg-[#F7F7F8] border border-[#E5E5E5] text-xs space-y-2 animate-slide-up">
      <div className="flex items-center justify-between text-[#141414]">
        <span className="font-bold text-[11px] uppercase tracking-wider">
          Robustez de Contraseña:
        </span>
        <span className={`font-bold font-mono text-[11px] ${meta.textColor}`}>
          {meta.text}
        </span>
      </div>

      <div className="h-1.5 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${meta.color}`}
          style={{ width: `${scorePercent}%` }}
        />
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
        {criteria.map((c, i) => (
          <li
            key={i}
            className={`flex items-center gap-1.5 transition-colors ${
              c.met ? 'text-[#141414] font-semibold' : 'text-[#878787]'
            }`}
          >
            {c.met ? (
              <Check className="w-3.5 h-3.5 text-[#15803d] shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-[#878787] shrink-0" />
            )}
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;
