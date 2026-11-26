import React from 'react';
import { Database, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const QuotaBar = ({ count = 0, max = 20 }) => {
  const percent = Math.min((count / max) * 100, 100);
  const isNearLimit = count >= 16 && count < max;
  const isAtLimit = count >= max;

  const getBarColor = () => {
    if (isAtLimit) return 'bg-[#b91c1c]';
    if (isNearLimit) return 'bg-[#b45309]';
    return 'bg-[#03D47C]';
  };

  return (
    <div className="bg-[#002E22] text-white border border-[#0B533E] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md animate-slide-up">
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[#03D47C] text-[#002E22] flex items-center justify-center font-bold">
            <Database className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-white">Capacidad de la Bóveda</span>
          <span className="text-xs px-3 py-0.5 rounded-full font-mono font-extrabold bg-[#064232] text-[#03D47C] border border-[#03D47C]/40">
            {count} / {max} notas
          </span>
        </div>
        <p className="text-xs text-[#C2F5DF] mt-2 flex items-center gap-1.5">
          {isAtLimit ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-rose-300 font-semibold">Límite alcanzado (A06: Insecure Design). Elimina notas para liberar cuota.</span>
            </>
          ) : isNearLimit ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-200">Te aproximas a la cuota máxima permitida ({max} notas).</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#03D47C] shrink-0" />
              <span>Aislamiento por propietario y cifrado individual AES-256-GCM por cada nota.</span>
            </>
          )}
        </p>
      </div>

      <div className="w-full sm:w-64 flex flex-col gap-1.5">
        <div className="h-2.5 w-full bg-[#064232] rounded-full overflow-hidden border border-[#0B533E]">
          <div
            className={`h-full transition-all duration-700 rounded-full ${getBarColor()}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-[#C2F5DF]">
          <span>0%</span>
          <span className="font-bold text-[#03D47C]">{Math.round(percent)}% utilizado</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default QuotaBar;
