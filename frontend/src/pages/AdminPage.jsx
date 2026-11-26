import React, { useState, useEffect } from 'react';
import adminService from '../services/admin.service.js';
import { Users, ScrollText, ShieldAlert, RefreshCw, Filter, Loader2, AlertOctagon, CheckCircle2 } from 'lucide-react';

const EVENT_FILTERS = [
  'ALL',
  'LOGIN_FAILED',
  'BRUTE_FORCE_BLOCKED',
  'IDOR_ATTEMPT',
  'ACCESS_DENIED',
  'ROLE_CHANGED'
];

export const AdminPage = () => {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      if (tab === 'users') {
        const res = await adminService.getUsers();
        setUsers(res.users || []);
      } else {
        const res = await adminService.getSecurityLogs(100);
        setLogs(res.logs || []);
      }
    } catch (err) {
      setError(err.message || 'Error al obtener datos administrativos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`¿Confirmas cambiar el rol del usuario a "${newRole}"? Esta acción se auditará con severidad CRITICAL.`)) {
      return;
    }

    setUpdatingRoleUserId(userId);
    setActionSuccess('');
    setError('');

    try {
      const res = await adminService.updateUserRole(userId, newRole);
      setActionSuccess(res.message || `Rol actualizado exitosamente a ${newRole}`);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Error al actualizar el rol');
    } finally {
      setUpdatingRoleUserId(null);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'BRUTE_FORCE_BLOCKED') {
      return log.eventType.includes('LOCKED') || log.eventType.includes('BLOCKED');
    }
    return log.eventType === selectedFilter;
  });

  const getSeverityBadge = (severity) => {
    if (severity === 'CRITICAL') {
      return 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
    }
    if (severity === 'WARN') {
      return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
    }
    return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SecOps & Forensic Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Centro de <span className="text-gradient-emerald">SecOps y Auditoría</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Control de Acceso Basado en Roles (RBAC) y Bitácora Forense Inmutable (OWASP A01 y A09).
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex glass-panel rounded-2xl p-1.5 text-xs self-start sm:self-auto">
          <button
            onClick={() => setTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              tab === 'users'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios ({users.length})</span>
          </button>
          <button
            onClick={() => setTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              tab === 'logs'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ScrollText className="w-4 h-4" />
            <span>Bitácora Forense (Logs)</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-medium flex items-center gap-2.5 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-rose-300 text-xs flex items-center gap-2.5 animate-slide-up">
          <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-9 h-9 text-cyan-400 animate-spin" />
          <span className="text-xs text-cyan-300/80 font-mono">Consultando telemetría de seguridad...</span>
        </div>
      ) : (
        <>
          {tab === 'users' ? (
            <div className="glass-panel rounded-3xl overflow-hidden animate-slide-up">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-white/10 font-mono uppercase text-[11px]">
                    <tr>
                      <th className="px-5 py-4">Usuario / Correo</th>
                      <th className="px-5 py-4">Rol Actual</th>
                      <th className="px-5 py-4">Notas Activas</th>
                      <th className="px-5 py-4">Intentos Fallidos</th>
                      <th className="px-5 py-4">Estado de Cuenta</th>
                      <th className="px-5 py-4 text-right">Asignar Rol (RBAC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-slate-300">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-white">{u.fullName || 'Sin nombre'}</div>
                          <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] uppercase border ${
                              u.role === 'admin'
                                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                                : 'bg-slate-900 text-slate-300 border-white/10'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-300">
                          {u.notesCount} / 20
                        </td>
                        <td className="px-5 py-4 font-mono">
                          <span className={u.failedLoginAttempts > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                            {u.failedLoginAttempts}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {u.isLocked ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/50 font-mono text-[10px] font-bold">
                              BLOQUEADO (15 min)
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              Operativo
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            disabled={updatingRoleUserId === u.id}
                            className="input-cyber rounded-xl px-3 py-1.5 text-xs cursor-pointer disabled:opacity-50"
                          >
                            <option value="user">Usuario (user)</option>
                            <option value="admin">Administrador (admin)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl overflow-hidden space-y-4 p-5 animate-slide-up">
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Filtro por Evento:</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {EVENT_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-mono transition-all border cursor-pointer ${
                        selectedFilter === f
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                          : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  onClick={fetchData}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 rounded-xl text-xs font-mono transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Refrescar</span>
                </button>
              </div>

              {/* Tabla de Logs */}
              <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950/90 text-slate-400 border-b border-white/10 sticky top-0 text-[11px] uppercase">
                    <tr>
                      <th className="px-4 py-3.5">Timestamp</th>
                      <th className="px-4 py-3.5">Severidad</th>
                      <th className="px-4 py-3.5">Tipo de Evento</th>
                      <th className="px-4 py-3.5">Usuario</th>
                      <th className="px-4 py-3.5">IP / Cliente</th>
                      <th className="px-4 py-3.5">Detalle Forense (JSON)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-slate-300 text-[11px]">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-slate-500 italic">
                          No se encontraron eventos coincidentes con el filtro seleccionado ({selectedFilter})
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(log.severity)}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-white">
                            {log.eventType}
                          </td>
                          <td className="px-4 py-3 truncate max-w-[150px] text-slate-300" title={log.userEmail}>
                            {log.userEmail}
                          </td>
                          <td className="px-4 py-3 text-cyan-300/90">
                            {log.ipAddress || '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-400 max-w-xs truncate" title={JSON.stringify(log.details)}>
                            {JSON.stringify(log.details)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPage;
