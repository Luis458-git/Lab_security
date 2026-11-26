import React, { useState, useEffect } from 'react';
import client from '../../api/client.js';
import { RefreshCw } from 'lucide-react';

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
    <footer className="mt-auto border-t border-[#E5E5E5] bg-[#FAFAFA] text-xs text-[#666666] py-6">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-center sm:text-left font-mono text-[11px]">
          <span className="font-bold text-[#141414] font-sans">SecureVault</span>
          <span>•</span>
          <span>AES-256-GCM</span>
          <span>•</span>
          <span>Argon2id (RFC 9106)</span>
          <span>•</span>
          <span>OWASP Top 10:2025</span>
        </div>

        <div className="flex items-center space-x-2.5 bg-white px-3.5 py-1.5 rounded-full border border-[#E5E5E5]">
          <div className="flex items-center space-x-2">
            {healthStatus === 'online' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-[#15803d]"></span>
                <span className="text-[11px] text-[#666666]">
                  Estado: <strong className="text-[#141414] font-semibold">Operativo</strong>
                </span>
              </>
            )}
            {healthStatus === 'offline' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-[#b91c1c]"></span>
                <span className="text-[11px] text-[#b91c1c] font-semibold">Desconectado</span>
              </>
            )}
            {healthStatus === 'checking' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-[#878787] animate-pulse"></span>
                <span className="text-[11px] text-[#666666]">Comprobando...</span>
              </>
            )}
          </div>
          <button
            onClick={checkHealth}
            className="text-[#878787] hover:text-[#141414] transition-colors p-0.5 rounded cursor-pointer"
            title="Refrescar estado"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
