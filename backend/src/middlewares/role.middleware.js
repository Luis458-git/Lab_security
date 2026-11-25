import { logSecurityEvent } from '../utils/audit.util.js';

/**
 * Middleware de Control de Acceso Basado en Roles (RBAC en Servidor)
 * 
 * Cumplimiento: RF-03 / OWASP A01:2025 (Broken Access Control) y A09:2025 (Security Logging)
 * 
 * @param {string|string[]} roles - Rol o array de roles requeridos (ej. 'admin')
 */
export const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 401,
        code: 'UNAUTHORIZED',
        error: 'Autenticación requerida'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Registro inmutable de intento no autorizado (A09)
      await logSecurityEvent({
        userId: req.user.id,
        eventType: 'ACCESS_DENIED',
        severity: 'WARN',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: {
          attemptedPath: req.originalUrl,
          requiredRoles: allowedRoles,
          userRole: req.user.role
        }
      });

      return res.status(403).json({
        status: 403,
        code: 'FORBIDDEN',
        error: 'Acceso denegado: no cuentas con los privilegios requeridos para este recurso'
      });
    }

    next();
  };
};

export default requireRole;
