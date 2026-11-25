import React, { useState, useEffect } from 'react';
import client from '../../api/client.js';

export const Footer = () => {
  const [healthStatus, setHealthStatus] = useState({ status: 'checking', time: null });

  const checkHealth = async () => {
    try {
      const res = await client.get('/health');
      if (res?.status === 'ok') {
        setHealthStatus({ status: 'online', time: new Date().toLocaleTimeString() });
      } else {
        setHealthStatus({ status: 'degraded', time: new Date().toLocaleTimeString() });
      }
    } catch {
      setHealthStatus({ status: 'offline', time: new Date().toLocaleTimeString() });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Polling ligero cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950/60 text-xs text-slate-500 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Security specs */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-semibold text-slate-400">SecureVault v1.0</span>
          <span>•</span>
          <span className="text-slate-400">Cifrado de Envoltorio: AES-256-GCM (IV 12B / Tag 16B)</span>
          <span>•</span>
          <span className="text-slate-400">Argon2id (RFC 9106)</span>
        </div>

        {/* Right: Live health check indicator (RF-08) */}
        <div className="flex items-center space-x-3 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800">
          <div className="flex items-center space-x-1.5">
            {healthStatus.status === 'online' && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            {healthStatus.status === 'degraded' && (
              <span className="inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            )}
            {healthStatus.status === 'offline' && (
              <span className="inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            )}
            {healthStatus.status === 'checking' && (
              <span className="inline-flex rounded-full h-2 w-2 bg-slate-500 animate-pulse"></span>
            )}
            <span className="font-mono text-[11px] text-slate-300">
              API /health: <span className="uppercase font-semibold">{healthStatus.status}</span>
            </span>
          </div>

          <button
            onClick={checkHealth}
            title="Refrescar estado de salud"
            className="text-slate-500 hover:text-cyan-400 transition-colors"
          >
            ↻
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
