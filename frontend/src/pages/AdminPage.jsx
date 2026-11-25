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
  const [tab, setTab] = useState('users'); // 'users' | 'logs'
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

  // Filtrado de eventos de seguridad
  const filteredLogs = logs.filter((log) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'BRUTE_FORCE_BLOCKED') {
      return log.eventType.includes('LOCKED') || log.eventType.includes('BLOCKED');
    }
    return log.eventType === selectedFilter;
  });

  const getSeverityBadge = (severity) => {
    if (severity === 'CRITICAL') {
      return 'bg-rose-950/70 text-vault-red border-vault-red/50';
    }
    if (severity === 'WARN') {
      return 'bg-amber-950/70 text-vault-amber border-vault-amber/50';
    }
    return 'bg-vault-surface text-gray-300 border-vault-border';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5 font-sans">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            <span>Panel de Administración y SecOps</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Control de Acceso Basado en Roles (RBAC en Servidor) y Auditoría Forense (RF-07, OWASP A01 y A09)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-vault-card border border-vault-border rounded-xl p-1 text-xs">
          <button
            onClick={() => setTab('users')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === 'users'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios ({users.length})</span>
          </button>
          <button
            onClick={() => setTab('logs')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === 'logs'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ScrollText className="w-4 h-4" />
            <span>Bitácora Forense (Logs)</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-vault-emerald text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-vault-red/60 rounded-xl text-vault-red text-xs flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span className="text-xs text-gray-400 font-mono">Consultando datos de administración...</span>
        </div>
      ) : (
        <>
          {tab === 'users' ? (
            /* TAB 1: GESTIÓN DE USUARIOS CON SELECTOR DE ROL */
            <div className="bg-vault-card border border-vault-border rounded-2xl overflow-hidden shadow-xl transition-surface">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-vault-bg text-gray-400 border-b border-vault-border font-mono uppercase text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5">Usuario / Correo</th>
                      <th className="px-5 py-3.5">Rol Actual</th>
                      <th className="px-5 py-3.5">Notas Activas</th>
                      <th className="px-5 py-3.5">Intentos Fallidos</th>
                      <th className="px-5 py-3.5">Estado de Bloqueo</th>
                      <th className="px-5 py-3.5 text-right">Asignar Rol (RBAC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vault-border/80 text-gray-300">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-vault-surface/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-white">{u.fullName || 'Sin nombre'}</div>
                          <div className="text-gray-500 font-mono text-[11px]">{u.email}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-mono font-semibold text-[10px] uppercase border ${
                              u.role === 'admin'
                                ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                                : 'bg-vault-surface text-gray-300 border-vault-border'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-gray-400">
                          {u.notesCount} / 20
                        </td>
                        <td className="px-5 py-3.5 font-mono">
                          <span className={u.failedLoginAttempts > 0 ? 'text-vault-amber font-bold' : 'text-gray-500'}>
                            {u.failedLoginAttempts}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {u.isLocked ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-950 text-vault-red border border-rose-800 font-mono text-[10px] font-semibold">
                              BLOQUEADO (15 min)
                            </span>
                          ) : (
                            <span className="text-vault-emerald font-mono text-[11px] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-vault-emerald"></span>
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {/* Selector de rol en tiempo real */}
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            disabled={updatingRoleUserId === u.id}
                            className="bg-vault-bg border border-vault-border text-gray-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-purple-500 cursor-pointer disabled:opacity-50"
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
            /* TAB 2: AUDIT LOGS CON FILTROS RÁPIDOS */
            <div className="bg-vault-card border border-vault-border rounded-2xl overflow-hidden shadow-xl space-y-4 p-4 transition-surface">
              {/* Header de Bitácora y Filtros */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-vault-border">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-gray-300">Filtro Rápido por Evento:</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {EVENT_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFilter(f)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors border ${
                        selectedFilter === f
                          ? 'bg-purple-950 text-purple-300 border-purple-700/80 font-bold'
                          : 'bg-vault-bg text-gray-400 border-vault-border hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  onClick={fetchData}
                  className="flex items-center gap-1.5 px-3 py-1 bg-vault-surface hover:bg-vault-border text-gray-300 rounded-lg text-xs font-mono transition-colors self-start sm:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refrescar</span>
                </button>
              </div>

              {/* Tabla de Logs */}
              <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-vault-bg text-gray-400 border-b border-vault-border sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Severidad</th>
                      <th className="px-4 py-3">Tipo de Evento</th>
                      <th className="px-4 py-3">Usuario</th>
                      <th className="px-4 py-3">IP / Cliente</th>
                      <th className="px-4 py-3">Detalle Forense (JSON)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vault-border/60 text-gray-300 text-[11px]">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">
                          No se encontraron eventos coincidentes con el filtro seleccionado ({selectedFilter})
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-vault-surface/40 transition-colors">
                          <td className="px-4 py-2.5 whitespace-nowrap text-gray-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(log.severity)}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-bold text-white">
                            {log.eventType}
                          </td>
                          <td className="px-4 py-2.5 truncate max-w-[150px] text-gray-300" title={log.userEmail}>
                            {log.userEmail}
                          </td>
                          <td className="px-4 py-2.5 text-gray-400">
                            {log.ipAddress || '—'}
                          </td>
                          <td className="px-4 py-2.5 text-gray-400 max-w-xs truncate" title={JSON.stringify(log.details)}>
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
