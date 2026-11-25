import React, { useState, useEffect } from 'react';
import adminService from '../services/admin.service.js';

export const AdminPage = () => {
  const [tab, setTab] = useState('users'); // 'users' | 'logs'
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      if (tab === 'users') {
        const res = await adminService.getUsers();
        setUsers(res.users || []);
      } else {
        const res = await adminService.getLogs(100);
        setLogs(res.logs || []);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los datos del panel de administración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMsg = `¿Confirmas cambiar el rol del usuario a "${newRole}"? Esta acción se auditará como CRITICAL en la bitácora forense.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionSuccess('');
      const res = await adminService.changeRole(userId, newRole);
      setActionSuccess(res.message);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Error al cambiar rol del usuario');
    }
  };

  const getSeverityBadge = (severity) => {
    if (severity === 'CRITICAL') {
      return 'bg-rose-950/80 text-rose-300 border-rose-800';
    }
    if (severity === 'WARN') {
      return 'bg-amber-950/80 text-amber-300 border-amber-800';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <span>Panel de Administración y SecOps</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono">
              RBAC Server Enforced
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestión de privilegios y supervisión de la bitácora inmutable de auditoría forense (RF-07)
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === 'users'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Usuarios y Roles ({users.length})
          </button>
          <button
            onClick={() => setTab('logs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === 'logs'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bitácora de Auditoría (security_logs)
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-300 text-sm">
          ✓ {actionSuccess}
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-900/50 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {tab === 'users' ? (
            /* TAB 1: USERS TABLE */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono uppercase text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5">Usuario</th>
                      <th className="px-5 py-3.5">Rol Actual</th>
                      <th className="px-5 py-3.5">Notas Activas</th>
                      <th className="px-5 py-3.5">Intentos Fallidos</th>
                      <th className="px-5 py-3.5">Estado Bloqueo</th>
                      <th className="px-5 py-3.5 text-right">Acción RBAC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-white">{u.fullName || 'Sin nombre'}</div>
                          <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-semibold text-[10px] uppercase border ${
                              u.role === 'admin'
                                ? 'bg-purple-950 text-purple-300 border-purple-800'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono">
                          {u.notesCount} / 20
                        </td>
                        <td className="px-5 py-3.5 font-mono">
                          <span className={u.failedLoginAttempts > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                            {u.failedLoginAttempts}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {u.isLocked ? (
                            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono text-[10px]">
                              BLOQUEADO
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-mono text-[11px]">Activo</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleChangeRole(u.id, u.role)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-950 hover:text-purple-300 border border-slate-700 text-slate-300 font-medium transition-colors"
                          >
                            {u.role === 'admin' ? 'Degradar a User' : 'Ascender a Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* TAB 2: AUDIT LOGS TABLE */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Mostrando los últimos 100 eventos forenses registrados</span>
                <button
                  onClick={fetchData}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono"
                >
                  ↻ Actualizar Bitácora
                </button>
              </div>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Severidad</th>
                      <th className="px-4 py-3">Evento</th>
                      <th className="px-4 py-3">Usuario</th>
                      <th className="px-4 py-3">IP / Cliente</th>
                      <th className="px-4 py-3">Detalles JSON</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30">
                        <td className="px-4 py-2.5 whitespace-nowrap text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(log.severity)}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-200">
                          {log.eventType}
                        </td>
                        <td className="px-4 py-2.5 truncate max-w-[150px]" title={log.userEmail}>
                          {log.userEmail}
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">
                          {log.ipAddress || '—'}
                        </td>
                        <td className="px-4 py-2.5 text-slate-400 max-w-xs truncate" title={JSON.stringify(log.details)}>
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}
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
