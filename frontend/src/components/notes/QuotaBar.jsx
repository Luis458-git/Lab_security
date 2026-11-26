import React from 'react';
import { Database, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const QuotaBar = ({ count = 0, max = 20 }) => {
  const percent = Math.min((count / max) * 100, 100);
  const isNearLimit = count >= 16 && count < max;
  const isAtLimit = count >= max;

  const getBarColor = () => {
    if (isAtLimit) return 'bg-[#b91c1c]';
    if (isNearLimit) return 'bg-[#b45309]';
    return 'bg-[#141414]';
  };

  const getBadgeStyle = () => {
    if (isAtLimit) return 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]';
    if (isNearLimit) return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
    return 'bg-white text-[#141414] border-[#E5E5E5]';
  };

  return (
    <div className="bg-[#F7F7F8] border border-[#E5E5E5] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#141414] text-white flex items-center justify-center">
            <Database className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-[#141414]">Capacidad de la Bóveda</span>
          <span className={`text-xs px-3 py-0.5 rounded-full font-mono font-semibold border ${getBadgeStyle()}`}>
            {count} / {max} notas
          </span>
        </div>
        <p className="text-xs text-[#666666] mt-2 flex items-center gap-1.5">
          {isAtLimit ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-[#b91c1c] shrink-0" />
              <span className="text-[#b91c1c] font-semibold">Límite alcanzado (A06: Insecure Design). Elimina notas para liberar cuota.</span>
            </>
          ) : isNearLimit ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-[#b45309] shrink-0" />
              <span>Te aproximas a la cuota máxima permitida ({max} notas).</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d] shrink-0" />
              <span>Aislamiento por propietario y cifrado individual AES-256-GCM por cada nota.</span>
            </>
          )}
        </p>
      </div>

      <div className="w-full sm:w-60 flex flex-col gap-1.5">
        <div className="h-2 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 rounded-full ${getBarColor()}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-[#666666]">
          <span>0%</span>
          <span className="font-bold text-[#141414]">{Math.round(percent)}% utilizado</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default QuotaBar;
