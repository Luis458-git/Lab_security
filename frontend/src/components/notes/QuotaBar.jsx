import React from 'react';
import { Database, AlertTriangle, ShieldCheck } from 'lucide-react';

export const QuotaBar = ({ count = 0, max = 20 }) => {
  const percent = Math.min((count / max) * 100, 100);
  const isNearLimit = count >= 16 && count < max;
  const isAtLimit = count >= max;

  const getBarGradient = () => {
    if (isAtLimit) return 'from-rose-500 to-red-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]';
    if (isNearLimit) return 'from-amber-500 to-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
    return 'from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
  };

  const getBadgeStyle = () => {
    if (isAtLimit) return 'bg-rose-950/70 text-rose-300 border-rose-500/40';
    if (isNearLimit) return 'bg-amber-950/70 text-amber-300 border-amber-500/40';
    return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30';
  };

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-white">Capacidad de la Bóveda</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono border ${getBadgeStyle()}`}>
            {count} / {max} notas
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
          {isAtLimit ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
              <span className="text-rose-300 font-medium">Límite alcanzado (A06: Insecure Design). Elimina notas para liberar cuota.</span>
            </>
          ) : isNearLimit ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-200">Te aproximas a la cuota máxima permitida ({max} notas).</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Cada nota se cifra individualmente con AES-256-GCM y vector de inicialización único.</span>
            </>
          )}
        </p>
      </div>

      <div className="w-full sm:w-60 flex flex-col gap-2">
        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/10 p-0.5">
          <div
            className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${getBarGradient()}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>0%</span>
          <span className="text-emerald-400 font-bold">{Math.round(percent)}% utilizado</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default QuotaBar;
