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
    if (metCount <= 2) return { text: 'Insegura', color: 'bg-status-danger', textColor: 'text-status-danger' };
    if (metCount === 3) return { text: 'Aceptable', color: 'bg-status-warning', textColor: 'text-status-warning' };
    if (metCount === 4) return { text: 'Fuerte', color: 'bg-mobbin-dark', textColor: 'text-mobbin-text' };
    return { text: 'Robusta (NIST SP 800-63B)', color: 'bg-status-success', textColor: 'text-status-success' };
  };

  const meta = getStrengthMeta();

  if (!password) return null;

  return (
    <div className="mt-2.5 p-3 rounded-lg bg-mobbin-surface border border-mobbin-border text-xs space-y-2">
      <div className="flex items-center justify-between text-mobbin-text">
        <span className="font-semibold text-[11px] uppercase tracking-wider">
          Robustez de Contraseña (RF-01):
        </span>
        <span className={`font-semibold font-mono text-[11px] ${meta.textColor}`}>
          {meta.text}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-mobbin-border rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${meta.color}`}
          style={{ width: `${scorePercent}%` }}
        />
      </div>

      {/* Checklist */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
        {criteria.map((c, i) => (
          <li
            key={i}
            className={`flex items-center gap-1.5 transition-colors ${
              c.met ? 'text-status-success font-medium' : 'text-mobbin-muted'
            }`}
          >
            {c.met ? (
              <Check className="w-3.5 h-3.5 text-status-success shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-mobbin-subtle shrink-0" />
            )}
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;
