import React, { useState, useEffect } from 'react';
import client from '../../api/client.js';
import { RefreshCw } from 'lucide-react';

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
    const interval = setInterval(checkHealth, 45000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="mt-auto border-t border-mobbin-border bg-mobbin-surface text-xs text-mobbin-muted py-6 transition-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Security specs & standards */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-center sm:text-left text-mobbin-muted font-mono text-[11px]">
          <span className="font-semibold text-mobbin-text font-sans">SecureVault Zero-Trust</span>
          <span>•</span>
          <span>Envelope: AES-256-GCM</span>
          <span>•</span>
          <span>Argon2id (RFC 9106)</span>
          <span>•</span>
          <span>OWASP Top 10:2025</span>
        </div>

        {/* Right: Discrete Health status (RF-08) */}
        <div className="flex items-center space-x-2.5 bg-white px-3 py-1.5 rounded-full border border-mobbin-border shadow-xs">
          <div className="flex items-center space-x-2">
            {healthStatus === 'online' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-status-success"></span>
                <span className="text-[11px] text-mobbin-muted font-sans">
                  Sistema: <strong className="text-mobbin-text font-semibold">Operativo</strong>
                </span>
              </>
            )}
            {healthStatus === 'offline' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-status-danger"></span>
                <span className="text-[11px] text-status-danger font-medium font-sans">
                  Desconectado
                </span>
              </>
            )}
            {healthStatus === 'checking' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-mobbin-subtle animate-pulse"></span>
                <span className="text-[11px] text-mobbin-muted font-sans">Comprobando...</span>
              </>
            )}
          </div>
          <button
            onClick={checkHealth}
            className="text-mobbin-muted hover:text-mobbin-text transition-colors p-0.5 rounded cursor-pointer"
            title="Actualizar estado del servidor"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
