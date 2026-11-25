import { query } from '../config/db.js';
import { logSecurityEvent } from '../utils/audit.util.js';

/**
 * Servicio de Administración del Sistema (RF-07 / OWASP A01:2025 y A09:2025)
 */

/**
 * Obtener lista completa de usuarios con métricas de uso y estado de bloqueo
 */
export const getAllUsers = async () => {
  const sql = `
    SELECT u.id, u.email, u.full_name, u.role, u.failed_login_attempts, u.locked_until,
           u.created_at, u.updated_at,
           (SELECT COUNT(*)::int FROM notes WHERE owner_id = u.id) AS notes_count
    FROM users u
    ORDER BY u.created_at DESC
  `;

  const result = await query(sql);
  return result.rows.map((user) => ({
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    failedLoginAttempts: user.failed_login_attempts,
    isLocked: user.locked_until ? new Date(user.locked_until) > new Date() : false,
    lockedUntil: user.locked_until,
    notesCount: user.notes_count,
    createdAt: user.created_at
  }));
};

/**
 * Cambiar rol de un usuario con auditoría de severidad CRITICAL
 */
export const changeUserRole = async (adminUserId, targetUserId, newRole, clientIp, userAgent) => {
  if (!['user', 'admin'].includes(newRole)) {
    const error = new Error('Rol especificado inválido. Debe ser "user" o "admin"');
    error.statusCode = 400;
    throw error;
  }

  // Verificar existencia del usuario objetivo
  const targetCheck = await query('SELECT id, email, role FROM users WHERE id = $1', [targetUserId]);
  if (targetCheck.rowCount === 0) {
    const error = new Error('Usuario objetivo no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const targetUser = targetCheck.rows[0];

  // Prevenir degradación del propio administrador si es el único
  if (adminUserId === targetUserId && newRole !== 'admin') {
    const adminCountRes = await query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'");
    if (adminCountRes.rows[0].count <= 1) {
      const error = new Error('Operación prohibida: no puedes revocar tu propio rol de administrador si eres el único');
      error.statusCode = 400;
      throw error;
    }
  }

  const previousRole = targetUser.role;

  // Actualizar rol en la base de datos
  await query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2', [newRole, targetUserId]);

  // Auditoría crítica de cambio de privilegio (OWASP A01 & A09)
  await logSecurityEvent({
    userId: adminUserId,
    eventType: 'ROLE_CHANGED',
    severity: 'CRITICAL',
    ipAddress: clientIp,
    userAgent,
    details: {
      targetUserId,
      targetEmail: targetUser.email,
      previousRole,
      newRole,
      changedByAdminId: adminUserId
    }
  });

  return {
    success: true,
    message: `Rol del usuario ${targetUser.email} actualizado exitosamente a ${newRole}`,
    user: {
      id: targetUser.id,
      email: targetUser.email,
      role: newRole
    }
  };
};

/**
 * Consultar los eventos de seguridad de la bitácora forense (con soporte de filtro opcional)
 */
export const getSecurityLogs = async (limit = 100, eventType = null) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 200);
  const conditions = [];
  const params = [];

  // Filtro opcional por tipo de evento (ej. 'IDOR_ATTEMPT')
  if (eventType && typeof eventType === 'string' && eventType !== 'ALL') {
    params.push(eventType.trim());
    conditions.push(`s.event_type = $${params.length}`);
  }

  params.push(safeLimit);
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT s.id, s.user_id, s.event_type, s.severity, s.ip_address, s.user_agent, s.details, s.created_at,
           u.email AS user_email
    FROM security_logs s
    LEFT JOIN users u ON s.user_id = u.id
    ${whereClause}
    ORDER BY s.created_at DESC
    LIMIT $${params.length}
  `;

  const result = await query(sql, params);

  return result.rows.map((log) => ({
    id: log.id,
    userId: log.user_id,
    userEmail: log.user_email || 'Anónimo / Sistema',
    eventType: log.event_type,
    severity: log.severity,
    ipAddress: log.ip_address,
    userAgent: log.user_agent,
    details: log.details,
    createdAt: log.created_at
  }));
};

export default {
  getAllUsers,
  changeUserRole,
  getSecurityLogs
};
