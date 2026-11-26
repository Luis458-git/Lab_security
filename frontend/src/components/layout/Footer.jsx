import React, { useState, useEffect } from 'react';
import client from '../../api/client.js';
import { ShieldCheck, RefreshCw } from 'lucide-react';

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
    <footer className="mt-auto border-t border-white/10 bg-[#060913]/80 backdrop-blur-md text-xs text-slate-400 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Security specs */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-center sm:text-left">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            SecureVault Zero-Trust
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-mono text-[11px]">AES-256-GCM</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-mono text-[11px]">Argon2id (RFC 9106)</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-mono text-[11px]">OWASP Top 10:2025</span>
        </div>

        {/* Right: Animated Health Status */}
        <div className="flex items-center space-x-2.5 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-white/10 shadow-inner">
          <div className="flex items-center space-x-2">
            {healthStatus === 'online' && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="text-[11px] font-medium text-slate-300">
                  Cluster: <span className="text-emerald-400 font-bold">Operativo</span>
                </span>
              </>
            )}
            {healthStatus === 'offline' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-[11px] text-rose-400 font-semibold">
                  Sin conexión
                </span>
              </>
            )}
            {healthStatus === 'checking' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-[11px] text-slate-400">Verificando...</span>
              </>
            )}
          </div>
          <button
            onClick={checkHealth}
            className="text-slate-400 hover:text-emerald-400 transition-colors p-0.5 rounded cursor-pointer"
            title="Refrescar telemetría"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
