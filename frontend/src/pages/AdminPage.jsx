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
      return 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]';
    }
    if (severity === 'WARN') {
      return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
    }
    return 'bg-[#F0FDF4] text-[#15803d] border-[#BBF7D0]';
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-8 sm:py-10 space-y-6">
      {/* Mobbin Style App Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5] animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[28%] bg-[#141414] text-white flex items-center justify-center shadow-sm shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#141414] tracking-tight">
              Panel de Administración y SecOps
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-0.5">
              Control de Acceso Basado en Roles (RBAC) y Auditoría Forense (RF-07, OWASP A01 y A09)
            </p>
          </div>
        </div>

        {/* Mobbin Segmented Pill Switcher */}
        <div className="inline-flex items-center h-11 p-1 rounded-full bg-[#F4F4F5] border border-[#E5E5E5] self-start sm:self-auto">
          <button
            onClick={() => setTab('users')}
            className={`flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              tab === 'users'
                ? 'bg-[#141414] text-white shadow-2xs'
                : 'text-[#666666] hover:text-[#141414]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Usuarios ({users.length})</span>
          </button>
          <button
            onClick={() => setTab('logs')}
            className={`flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              tab === 'logs'
                ? 'bg-[#141414] text-white shadow-2xs'
                : 'text-[#666666] hover:text-[#141414]'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Bitácora Forense</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-[#15803d] text-xs font-semibold flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B91C1C] text-xs font-semibold flex items-center gap-2 animate-slide-up">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-7 h-7 text-[#141414] animate-spin" />
          <span className="text-xs text-[#666666] font-mono">Consultando datos de administración...</span>
        </div>
      ) : (
        <>
          {tab === 'users' ? (
            <div className="editorial-panel rounded-2xl overflow-hidden bg-white animate-slide-up">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#F7F7F8] text-[#666666] border-b border-[#E5E5E5] font-mono uppercase text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5">Usuario / Correo</th>
                      <th className="px-5 py-3.5">Rol Actual</th>
                      <th className="px-5 py-3.5">Notas Activas</th>
                      <th className="px-5 py-3.5">Intentos Fallidos</th>
                      <th className="px-5 py-3.5">Estado de Bloqueo</th>
                      <th className="px-5 py-3.5 text-right">Asignar Rol (RBAC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5] text-[#141414]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-[#141414]">{u.fullName || 'Sin nombre'}</div>
                          <div className="text-[#666666] font-mono text-[11px]">{u.email}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] uppercase border ${
                              u.role === 'admin'
                                ? 'bg-[#141414] text-white border-[#141414]'
                                : 'bg-[#F4F4F5] text-[#666666] border-[#E5E5E5]'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[#666666]">
                          {u.notesCount} / 20
                        </td>
                        <td className="px-5 py-3.5 font-mono">
                          <span className={u.failedLoginAttempts > 0 ? 'text-[#B45309] font-bold' : 'text-[#878787]'}>
                            {u.failedLoginAttempts}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {u.isLocked ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] font-mono text-[10px] font-bold">
                              BLOQUEADO (15 min)
                            </span>
                          ) : (
                            <span className="text-[#15803d] font-mono text-[11px] flex items-center gap-1.5 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]"></span>
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            disabled={updatingRoleUserId === u.id}
                            className="bg-white border border-[#E5E5E5] text-[#141414] rounded-full px-3 py-1 text-xs font-semibold focus:outline-none focus:border-[#141414] cursor-pointer disabled:opacity-50"
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
            <div className="editorial-panel rounded-2xl overflow-hidden bg-white space-y-4 p-5 animate-slide-up">
              {/* Filter Pill Bar (Mobbin style) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#666666]" />
                  <span className="text-xs font-bold text-[#141414] uppercase tracking-wider">
                    Filtro por Evento:
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {EVENT_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFilter(f)}
                      className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all border cursor-pointer ${
                        selectedFilter === f
                          ? 'bg-[#141414] text-white border-[#141414] font-bold'
                          : 'bg-white text-[#666666] border-[#E5E5E5] hover:border-[#141414] hover:text-[#141414]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  onClick={fetchData}
                  className="btn-editorial-outline flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refrescar</span>
                </button>
              </div>

              {/* Tabla Forense */}
              <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#F7F7F8] text-[#666666] border-b border-[#E5E5E5] sticky top-0 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Severidad</th>
                      <th className="px-4 py-3">Tipo de Evento</th>
                      <th className="px-4 py-3">Usuario</th>
                      <th className="px-4 py-3">IP / Cliente</th>
                      <th className="px-4 py-3">Detalle Forense (JSON)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5] text-[#141414] text-[11px]">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[#878787] italic">
                          No se encontraron eventos coincidentes con el filtro seleccionado ({selectedFilter})
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#FAFAFA] transition-colors">
                          <td className="px-4 py-2.5 whitespace-nowrap text-[#666666]">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(log.severity)}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-bold text-[#141414]">
                            {log.eventType}
                          </td>
                          <td className="px-4 py-2.5 truncate max-w-[150px] text-[#666666]" title={log.userEmail}>
                            {log.userEmail}
                          </td>
                          <td className="px-4 py-2.5 text-[#666666]">
                            {log.ipAddress || '—'}
                          </td>
                          <td className="px-4 py-2.5 text-[#666666] max-w-xs truncate" title={JSON.stringify(log.details)}>
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
