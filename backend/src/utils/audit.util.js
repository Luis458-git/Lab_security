import { query } from '../config/db.js';
import logger from '../config/logger.js';

/**
 * Registra un evento de seguridad tanto en la bitácora estructurada de Pino (JSON)
 * como en la tabla `security_logs` de la base de datos PostgreSQL.
 * 
 * Mitigación OWASP A09:2025 - Security Logging and Monitoring Failures
 * 
 * @param {Object} params
 * @param {string|null} [params.userId=null] - UUID del usuario (si aplica)
 * @param {string} params.eventType - Tipo de evento (ej. 'AUTH_LOGIN_SUCCESS', 'AUTH_LOGIN_FAILED')
 * @param {'INFO'|'WARN'|'CRITICAL'} [params.severity='INFO'] - Nivel de severidad
 * @param {string|null} [params.ipAddress=null] - Dirección IP del cliente
 * @param {string|null} [params.userAgent=null] - User-Agent de la petición
 * @param {Object} [params.details={}] - Metadatos contextuales (sin secretos ni contraseñas)
 * @returns {Promise<void>}
 */
export const logSecurityEvent = async ({
  userId = null,
  eventType,
  severity = 'INFO',
  ipAddress = null,
  userAgent = null,
  details = {}
}) => {
  const timestamp = new Date().toISOString();

  // 1. Registro estructurado inmediato en Pino Logger
  const logPayload = {
    auditEvent: true,
    userId,
    eventType,
    severity,
    ipAddress,
    userAgent,
    details,
    timestamp
  };

  if (severity === 'CRITICAL') {
    logger.error(logPayload, `[AUDIT CRITICAL] Evento de Seguridad: ${eventType}`);
  } else if (severity === 'WARN') {
    logger.warn(logPayload, `[AUDIT WARN] Evento de Seguridad: ${eventType}`);
  } else {
    logger.info(logPayload, `[AUDIT INFO] Evento de Seguridad: ${eventType}`);
  }

  // 2. Persistencia en la tabla security_logs
  try {
    const sql = `
      INSERT INTO security_logs (user_id, event_type, severity, ip_address, user_agent, details)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    // Validación y sanitización estricta de UUID para PostgreSQL
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const sanitizedUserId = (typeof userId === 'string' && uuidRegex.test(userId.trim()))
      ? userId.trim()
      : null;

    const params = [
      sanitizedUserId,
      eventType,
      severity,
      ipAddress ? String(ipAddress).slice(0, 45) : null,
      userAgent ? String(userAgent).slice(0, 500) : null,
      JSON.stringify(details || {})
    ];

    await query(sql, params);
  } catch (error) {
    // Si la base de datos está caída o la inserción falla, no rompemos el flujo del usuario
    // pero aseguramos que el error de auditoría quede plasmado en el log del proceso
    logger.error({
      err: error.message,
      eventType,
      userId
    }, 'Fallo crítico al persistir evento de auditoría en la tabla security_logs');
  }
};

export default {
  logSecurityEvent
};
