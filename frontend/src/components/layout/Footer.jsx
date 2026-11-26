import React, { useState, useEffect } from 'react';
import client from '../../api/client.js';
import { RefreshCw, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  const [healthStatus, setHealthStatus] = useState('checking');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkHealth = async () => {
    setIsRefreshing(true);
    try {
      const res = await client.get('/health');
      if (res?.status === 'ok') {
        setHealthStatus('online');
      } else {
        setHealthStatus('offline');
      }
    } catch {
      setHealthStatus('offline');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 45000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="mt-auto border-t border-[#0B533E] bg-[#002E22] text-xs text-[#C2F5DF] py-6">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-center sm:text-left font-mono text-[11px]">
          <span className="font-bold text-white font-sans flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#03D47C]" />
            SecureVault
          </span>
          <span className="text-[#03D47C]">•</span>
          <span>AES-256-GCM</span>
          <span className="text-[#03D47C]">•</span>
          <span>Argon2id (RFC 9106)</span>
          <span className="text-[#03D47C]">•</span>
          <span>OWASP Top 10:2025</span>
        </div>

        <div className="flex items-center space-x-2.5 bg-[#064232] px-3.5 py-1.5 rounded-full border border-[#03D47C]/30">
          <div className="flex items-center space-x-2">
            {healthStatus === 'online' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-[#03D47C] animate-pulse"></span>
                <span className="text-[11px] text-[#C2F5DF]">
                  Sistema: <strong className="text-[#03D47C] font-bold">Operativo</strong>
                </span>
              </>
            )}
            {healthStatus === 'offline' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-rose-400"></span>
                <span className="text-[11px] text-rose-300 font-semibold">Desconectado</span>
              </>
            )}
            {healthStatus === 'checking' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-[#C2F5DF] animate-pulse"></span>
                <span className="text-[11px] text-[#C2F5DF]">Comprobando...</span>
              </>
            )}
          </div>
          <button
            onClick={checkHealth}
            className="text-[#C2F5DF] hover:text-[#03D47C] transition-colors p-0.5 rounded cursor-pointer"
            title="Refrescar estado"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#03D47C]' : ''}`} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
