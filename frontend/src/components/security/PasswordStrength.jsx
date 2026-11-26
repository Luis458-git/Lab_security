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
    if (metCount === 4) return { text: 'Fuerte', color: 'bg-[#0B533E]', textColor: 'text-[#0B533E]' };
    return { text: 'Blindada (NIST SP 800-63B)', color: 'bg-[#03D47C]', textColor: 'text-[#002E22]' };
  };

  const meta = getStrengthMeta();

  if (!password) return null;

  return (
    <div className="mt-2.5 p-3.5 rounded-2xl bg-[#E1F2EA] border border-[#BBE2CE] text-xs space-y-2 animate-slide-up">
      <div className="flex items-center justify-between text-[#002E22]">
        <span className="font-bold text-[11px] uppercase tracking-wider">
          Robustez de Contraseña:
        </span>
        <span className={`font-extrabold font-mono text-[11px] ${meta.textColor}`}>
          {meta.text}
        </span>
      </div>

      <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-[#BBE2CE]">
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
              c.met ? 'text-[#002E22] font-bold' : 'text-[#639281]'
            }`}
          >
            {c.met ? (
              <Check className="w-3.5 h-3.5 text-[#002E22] shrink-0 stroke-[2.5]" />
            ) : (
              <X className="w-3.5 h-3.5 text-[#639281] shrink-0" />
            )}
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;
