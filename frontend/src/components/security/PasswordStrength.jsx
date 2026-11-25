import React from 'react';

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
    if (metCount <= 2) return { text: 'Débil', color: 'bg-rose-500', textClass: 'text-rose-400' };
    if (metCount === 3) return { text: 'Aceptable', color: 'bg-amber-500', textClass: 'text-amber-400' };
    if (metCount === 4) return { text: 'Fuerte', color: 'bg-cyan-500', textClass: 'text-cyan-400' };
    return { text: 'Muy Fuerte (NIST SP 800-63B)', color: 'bg-emerald-500', textClass: 'text-emerald-400' };
  };

  const meta = getStrengthMeta();

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2 text-xs">
      <div className="flex items-center justify-between text-slate-400">
        <span>Robustez de Contraseña:</span>
        <span className={`font-semibold ${meta.textClass}`}>{meta.text}</span>
      </div>

      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${meta.color}`}
          style={{ width: `${scorePercent}%` }}
        />
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
        {criteria.map((c, i) => (
          <li key={i} className={`flex items-center space-x-1.5 ${c.met ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="font-mono text-sm">{c.met ? '✓' : '•'}</span>
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;
