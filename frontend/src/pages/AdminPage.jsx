import React, { useState, useEffect } from 'react';
import adminService from '../services/admin.service.js';
import { Users, ScrollText, ShieldAlert, RefreshCw, Filter, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

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

  const filteredLogs = logs.filter((log) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'BRUTE_FORCE_BLOCKED') {
      return log.eventType.includes('LOCKED') || log.eventType.includes('BLOCKED');
    }
    return log.eventType === selectedFilter;
  });

  const getSeverityBadge = (severity) => {
    if (severity === 'CRITICAL') {
      return 'bg-status-dangerBg text-status-danger border-status-dangerBorder';
    }
    if (severity === 'WARN') {
      return 'bg-status-warningBg text-status-warning border-status-warningBorder';
    }
    return 'bg-status-successBg text-status-success border-status-successBorder';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-mobbin-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mobbin-surface border border-mobbin-border text-[11px] font-mono text-mobbin-muted mb-2">
            <span>RBAC & Forensic Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-mobbin-text tracking-tight font-sans">
            Panel de Administración y SecOps
          </h1>
          <p className="text-xs sm:text-sm text-mobbin-muted mt-1">
            Control de Acceso Basado en Roles (RBAC en Servidor) y Auditoría Forense (RF-07, OWASP A01 y A09).
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-mobbin-surface border border-mobbin-border rounded-lg p-1 text-xs self-start sm:self-auto">
          <button
            onClick={() => setTab('users')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              tab === 'users'
                ? 'bg-white text-mobbin-text font-bold shadow-xs'
                : 'text-mobbin-muted hover:text-mobbin-text'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Usuarios ({users.length})</span>
          </button>
          <button
            onClick={() => setTab('logs')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              tab === 'logs'
                ? 'bg-white text-mobbin-text font-bold shadow-xs'
                : 'text-mobbin-muted hover:text-mobbin-text'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Bitácora Forense (Logs)</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-status-successBg border border-status-successBorder rounded-lg text-status-success text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-status-dangerBg border border-status-dangerBorder rounded-lg text-status-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-7 h-7 text-mobbin-dark animate-spin" />
          <span className="text-xs text-mobbin-muted font-mono">Consultando datos de administración...</span>
        </div>
      ) : (
        <>
          {tab === 'users' ? (
            /* TAB 1: GESTIÓN DE USUARIOS */
            <div className="bg-white border border-mobbin-border rounded-xl overflow-hidden shadow-xs transition-surface">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-mobbin-surface text-mobbin-muted border-b border-mobbin-border font-mono uppercase text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5">Usuario / Correo</th>
                      <th className="px-5 py-3.5">Rol Actual</th>
                      <th className="px-5 py-3.5">Notas Activas</th>
                      <th className="px-5 py-3.5">Intentos Fallidos</th>
                      <th className="px-5 py-3.5">Estado de Bloqueo</th>
                      <th className="px-5 py-3.5 text-right">Asignar Rol (RBAC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mobbin-border text-mobbin-text">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-mobbin-surface/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-mobbin-text">{u.fullName || 'Sin nombre'}</div>
                          <div className="text-mobbin-muted font-mono text-[11px]">{u.email}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-mono font-semibold text-[10px] uppercase border ${
                              u.role === 'admin'
                                ? 'bg-mobbin-dark text-white border-mobbin-dark'
                                : 'bg-mobbin-surface text-mobbin-muted border-mobbin-border'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-mobbin-muted">
                          {u.notesCount} / 20
                        </td>
                        <td className="px-5 py-3.5 font-mono">
                          <span className={u.failedLoginAttempts > 0 ? 'text-status-warning font-bold' : 'text-mobbin-muted'}>
                            {u.failedLoginAttempts}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {u.isLocked ? (
                            <span className="px-2 py-0.5 rounded-full bg-status-dangerBg text-status-danger border border-status-dangerBorder font-mono text-[10px] font-semibold">
                              BLOQUEADO (15 min)
                            </span>
                          ) : (
                            <span className="text-status-success font-mono text-[11px] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            disabled={updatingRoleUserId === u.id}
                            className="bg-white border border-mobbin-border text-mobbin-text rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-mobbin-borderActive cursor-pointer disabled:opacity-50"
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
            /* TAB 2: AUDIT LOGS */
            <div className="bg-white border border-mobbin-border rounded-xl overflow-hidden shadow-xs space-y-4 p-5 transition-surface">
              {/* Header de Bitácora y Filtros */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-mobbin-border">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-mobbin-muted" />
                  <span className="text-xs font-semibold text-mobbin-text uppercase tracking-wider">
                    Filtro Rápido:
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {EVENT_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFilter(f)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors border cursor-pointer ${
                        selectedFilter === f
                          ? 'bg-mobbin-dark text-white border-mobbin-dark font-bold'
                          : 'bg-white text-mobbin-muted border-mobbin-border hover:text-mobbin-text hover:bg-mobbin-surface'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  onClick={fetchData}
                  className="flex items-center gap-1.5 px-3 py-1 bg-mobbin-surface hover:bg-mobbin-surfaceHover text-mobbin-text border border-mobbin-border rounded-md text-xs font-mono transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refrescar</span>
                </button>
              </div>

              {/* Tabla de Logs */}
              <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-mobbin-surface text-mobbin-muted border-b border-mobbin-border sticky top-0 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Severidad</th>
                      <th className="px-4 py-3">Tipo de Evento</th>
                      <th className="px-4 py-3">Usuario</th>
                      <th className="px-4 py-3">IP / Cliente</th>
                      <th className="px-4 py-3">Detalle Forense (JSON)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mobbin-border text-mobbin-text text-[11px]">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-mobbin-muted italic">
                          No se encontraron eventos coincidentes con el filtro seleccionado ({selectedFilter})
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-mobbin-surface/50 transition-colors">
                          <td className="px-4 py-2.5 whitespace-nowrap text-mobbin-muted">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(log.severity)}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-bold text-mobbin-text">
                            {log.eventType}
                          </td>
                          <td className="px-4 py-2.5 truncate max-w-[150px] text-mobbin-muted" title={log.userEmail}>
                            {log.userEmail}
                          </td>
                          <td className="px-4 py-2.5 text-mobbin-muted">
                            {log.ipAddress || '—'}
                          </td>
                          <td className="px-4 py-2.5 text-mobbin-muted max-w-xs truncate" title={JSON.stringify(log.details)}>
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
