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
    return 'bg-[#C2F5DF] text-[#002E22] border-[#03D47C]';
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-8 sm:py-10 space-y-6">
      {/* Header Verde Expensify */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#BBE2CE] animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#002E22] text-[#03D47C] flex items-center justify-center shadow-md shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-expensify-serif text-2xl sm:text-3xl font-bold text-[#002E22] tracking-tight">
              Panel de Administración y SecOps
            </h1>
            <p className="text-xs sm:text-sm text-[#3B6E5C] mt-0.5">
              Control de Acceso Basado en Roles (RBAC) y Auditoría Forense (RF-07, OWASP A01 y A09)
            </p>
          </div>
        </div>

        {/* Segmented Pill Switcher en Verde Bosque */}
        <div className="inline-flex items-center h-11 p-1 rounded-full bg-[#002E22] border border-[#0B533E] self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setTab('users')}
            className={`flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              tab === 'users'
                ? 'bg-[#03D47C] text-[#002E22] shadow-2xs'
                : 'text-[#C2F5DF] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Usuarios ({users.length})</span>
          </button>
          <button
            onClick={() => setTab('logs')}
            className={`flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              tab === 'logs'
                ? 'bg-[#03D47C] text-[#002E22] shadow-2xs'
                : 'text-[#C2F5DF] hover:text-white'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Bitácora Forense</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-[#C2F5DF] border border-[#03D47C] rounded-2xl text-[#002E22] text-xs font-bold flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl text-[#B91C1C] text-xs font-bold flex items-center gap-2 animate-slide-up">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#002E22] animate-spin" />
          <span className="text-xs text-[#3B6E5C] font-mono">Consultando datos de administración...</span>
        </div>
      ) : (
        <>
          {tab === 'users' ? (
            <div className="sage-card rounded-2xl overflow-hidden bg-[#F7FCF9] animate-slide-up">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#002E22] text-[#03D47C] border-b border-[#0B533E] font-mono uppercase text-[11px]">
                    <tr>
                      <th className="px-5 py-4">Usuario / Correo</th>
                      <th className="px-5 py-4">Rol Actual</th>
                      <th className="px-5 py-4">Notas Activas</th>
                      <th className="px-5 py-4">Intentos Fallidos</th>
                      <th className="px-5 py-4">Estado de Bloqueo</th>
                      <th className="px-5 py-4 text-right">Asignar Rol (RBAC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BBE2CE] text-[#002E22]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#E1F2EA] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-[#002E22]">{u.fullName || 'Sin nombre'}</div>
                          <div className="text-[#3B6E5C] font-mono text-[11px]">{u.email}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-mono font-extrabold text-[10px] uppercase border ${
                              u.role === 'admin'
                                ? 'bg-[#002E22] text-[#03D47C] border-[#002E22]'
                                : 'bg-[#C2F5DF] text-[#002E22] border-[#03D47C]'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[#3B6E5C] font-bold">
                          {u.notesCount} / 20
                        </td>
                        <td className="px-5 py-3.5 font-mono">
                          <span className={u.failedLoginAttempts > 0 ? 'text-[#B45309] font-extrabold' : 'text-[#3B6E5C]'}>
                            {u.failedLoginAttempts}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {u.isLocked ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] font-mono text-[10px] font-bold">
                              BLOQUEADO (15 min)
                            </span>
                          ) : (
                            <span className="text-[#002E22] font-mono text-[11px] flex items-center gap-1.5 font-bold">
                              <span className="w-2 h-2 rounded-full bg-[#03D47C]"></span>
                              Operativo
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            disabled={updatingRoleUserId === u.id}
                            className="bg-white border border-[#BBE2CE] text-[#002E22] rounded-full px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-[#03D47C] cursor-pointer disabled:opacity-50"
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
            <div className="sage-card rounded-2xl overflow-hidden bg-[#F7FCF9] space-y-4 p-5 animate-slide-up">
              {/* Filter Pill Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#BBE2CE]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#002E22]" />
                  <span className="text-xs font-bold text-[#002E22] uppercase tracking-wider">
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
                          ? 'bg-[#002E22] text-[#03D47C] border-[#002E22] font-extrabold'
                          : 'bg-white text-[#002E22] border-[#BBE2CE] hover:bg-[#C2F5DF]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  onClick={fetchData}
                  className="btn-sage flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refrescar</span>
                </button>
              </div>

              {/* Tabla Forense */}
              <div className="overflow-x-auto max-h-[580px] overflow-y-auto rounded-xl border border-[#BBE2CE]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#002E22] text-[#03D47C] border-b border-[#0B533E] sticky top-0 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Timestamp</th>
                      <th className="px-4 py-3.5">Severidad</th>
                      <th className="px-4 py-3.5">Tipo de Evento</th>
                      <th className="px-4 py-3.5">Usuario</th>
                      <th className="px-4 py-3.5">IP / Cliente</th>
                      <th className="px-4 py-3.5">Detalle Forense (JSON)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BBE2CE] text-[#002E22] text-[11px]">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[#3B6E5C] italic">
                          No se encontraron eventos coincidentes con el filtro seleccionado ({selectedFilter})
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#E1F2EA] transition-colors">
                          <td className="px-4 py-2.5 whitespace-nowrap text-[#3B6E5C]">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(log.severity)}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-extrabold text-[#002E22]">
                            {log.eventType}
                          </td>
                          <td className="px-4 py-2.5 truncate max-w-[150px] text-[#3B6E5C]" title={log.userEmail}>
                            {log.userEmail}
                          </td>
                          <td className="px-4 py-2.5 text-[#0B533E] font-bold">
                            {log.ipAddress || '—'}
                          </td>
                          <td className="px-4 py-2.5 text-[#3B6E5C] max-w-xs truncate" title={JSON.stringify(log.details)}>
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
