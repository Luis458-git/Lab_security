import React, { useState, useEffect } from 'react';
import client from '../../api/client.js';
import { Activity, ShieldCheck, RefreshCw } from 'lucide-react';

export const Footer = () => {
  const [healthStatus, setHealthStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
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
    const interval = setInterval(checkHealth, 45000); // Chequeo periódico discreto
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="mt-auto border-t border-vault-border bg-vault-bg/80 text-xs text-gray-500 py-5 transition-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Security specs & standards */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-center sm:text-left">
          <span className="font-semibold text-gray-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-vault-emerald" />
            SecureVault AppSec
          </span>
          <span>•</span>
          <span className="text-gray-400 font-mono text-[11px]">Envelope: AES-256-GCM</span>
          <span>•</span>
          <span className="text-gray-400 font-mono text-[11px]">Argon2id (RFC 9106)</span>
          <span>•</span>
          <span className="text-gray-400 font-mono text-[11px]">OWASP Top 10:2025</span>
        </div>

        {/* Right: Discrete Health status (RF-08) */}
        <div className="flex items-center space-x-2.5 bg-vault-card px-3 py-1.5 rounded-full border border-vault-border">
          <div className="flex items-center space-x-2">
            {healthStatus === 'online' && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vault-emerald opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-vault-emerald"></span>
                </span>
                <span className="text-[11px] font-medium text-gray-300 font-sans">
                  Estado del sistema: <span className="text-vault-emerald font-semibold">Operativo</span>
                </span>
              </>
            )}

            {healthStatus === 'offline' && (
              <>
                <span className="inline-flex rounded-full h-2 w-2 bg-vault-red"></span>
                <span className="text-[11px] font-medium text-gray-300 font-sans">
                  Estado del sistema: <span className="text-vault-red font-semibold">Sin conexión</span>
                </span>
              </>
            )}

            {healthStatus === 'checking' && (
              <>
                <span className="inline-flex rounded-full h-2 w-2 bg-gray-500 animate-pulse"></span>
                <span className="text-[11px] text-gray-400 font-sans">
                  Verificando salud...
                </span>
              </>
            )}
          </div>

          <button
            onClick={checkHealth}
            disabled={isRefreshing}
            title="Refrescar estado de salud"
            className="text-gray-500 hover:text-vault-emerald transition-colors p-0.5"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-vault-emerald' : ''}`} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
