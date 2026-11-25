import React from 'react';

export const QuotaBar = ({ count = 0, max = 20 }) => {
  const percent = Math.min((count / max) * 100, 100);
  const isNearLimit = count >= 16 && count < 20;
  const isAtLimit = count >= max;

  const getBarColor = () => {
    if (isAtLimit) return 'bg-rose-500';
    if (isNearLimit) return 'bg-amber-500';
    return 'bg-cyan-500';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-white">Capacidad de la Bóveda</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {count} / {max} notas
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {isAtLimit
            ? '⚠️ Cuota máxima alcanzada (Límite de negocio A06). Elimina notas para crear nuevas.'
            : isNearLimit
            ? 'Te estás aproximando a la cuota máxima permitida (máx. 20 notas).'
            : 'Cada nota se cifra individualmente con AES-256-GCM antes de persistir.'}
        </p>
      </div>

      <div className="w-full sm:w-48 flex flex-col gap-1.5">
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>0</span>
          <span>{Math.round(percent)}% utilizado</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};

export default QuotaBar;
