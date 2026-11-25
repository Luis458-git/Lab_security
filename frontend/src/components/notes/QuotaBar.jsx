import React from 'react';
import { Database, AlertTriangle, ShieldCheck } from 'lucide-react';

export const QuotaBar = ({ count = 0, max = 20 }) => {
  const percent = Math.min((count / max) * 100, 100);
  const isNearLimit = count >= 16 && count < max;
  const isAtLimit = count >= max;

  const getBarColor = () => {
    if (isAtLimit) return 'bg-vault-red';
    if (isNearLimit) return 'bg-vault-amber';
    return 'bg-vault-emerald';
  };

  const getBadgeStyle = () => {
    if (isAtLimit) return 'bg-rose-950/60 text-vault-red border-rose-900/50';
    if (isNearLimit) return 'bg-amber-950/60 text-vault-amber border-amber-900/50';
    return 'bg-emerald-950/60 text-vault-emerald border-emerald-900/50';
  };

  return (
    <div className="bg-vault-card border border-vault-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-surface">
      <div>
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-vault-emerald" />
          <span className="text-sm font-semibold text-white">Capacidad de la Bóveda</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono border ${getBadgeStyle()}`}>
            {count} / {max} notas utilizadas
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
          {isAtLimit ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-vault-red shrink-0" />
              <span className="text-vault-red font-medium">Límite alcanzado (A06: Insecure Design). Elimina notas para liberar cuota.</span>
            </>
          ) : isNearLimit ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-vault-amber shrink-0" />
              <span>Te aproximas a la cuota máxima permitida ({max} notas).</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-vault-emerald shrink-0" />
              <span>Cada nota se cifra individualmente con AES-256-GCM y clave única.</span>
            </>
          )}
        </p>
      </div>

      <div className="w-full sm:w-52 flex flex-col gap-1.5">
        <div className="h-2 w-full bg-vault-surface rounded-full overflow-hidden border border-vault-border">
          <div
            className={`h-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-gray-500">
          <span>0</span>
          <span>{Math.round(percent)}% utilizado</span>
          <span>{max} máx</span>
        </div>
      </div>
    </div>
  );
};

export default QuotaBar;
