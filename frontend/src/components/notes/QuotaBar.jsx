import React from 'react';
import { Database, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const QuotaBar = ({ count = 0, max = 20 }) => {
  const percent = Math.min((count / max) * 100, 100);
  const isNearLimit = count >= 16 && count < max;
  const isAtLimit = count >= max;

  const getBarColor = () => {
    if (isAtLimit) return 'bg-status-danger';
    if (isNearLimit) return 'bg-status-warning';
    return 'bg-mobbin-dark';
  };

  const getBadgeStyle = () => {
    if (isAtLimit) return 'bg-status-dangerBg text-status-danger border-status-dangerBorder';
    if (isNearLimit) return 'bg-status-warningBg text-status-warning border-status-warningBorder';
    return 'bg-white text-mobbin-text border-mobbin-border';
  };

  return (
    <div className="bg-mobbin-surface border border-mobbin-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-surface">
      <div>
        <div className="flex items-center space-x-2.5">
          <Database className="w-4 h-4 text-mobbin-text" />
          <span className="text-sm font-bold text-mobbin-text">Capacidad de la Bóveda</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono border ${getBadgeStyle()}`}>
            {count} / {max} notas utilizadas
          </span>
        </div>
        <p className="text-xs text-mobbin-muted mt-1.5 flex items-center gap-1.5">
          {isAtLimit ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-status-danger shrink-0" />
              <span className="text-status-danger font-medium">Límite alcanzado (A06: Insecure Design). Elimina notas para liberar cuota.</span>
            </>
          ) : isNearLimit ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-status-warning shrink-0" />
              <span>Te aproximas a la cuota máxima permitida ({max} notas).</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
              <span>Aislamiento por usuario y cifrado individual AES-256-GCM por cada nota.</span>
            </>
          )}
        </p>
      </div>

      <div className="w-full sm:w-56 flex flex-col gap-1.5">
        <div className="h-2 w-full bg-mobbin-border rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-mobbin-muted">
          <span>0</span>
          <span>{Math.round(percent)}% utilizado</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};

export default QuotaBar;
