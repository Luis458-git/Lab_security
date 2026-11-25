import rateLimit from 'express-rate-limit';
import logger from '../config/logger.js';

/**
 * Limitador estricto para inicio de sesión contra ataques de fuerza bruta y credential stuffing.
 * 
 * Mitigación OWASP A07:2025 - Identification and Authentication Failures
 * Límite: Máximo 5 intentos por ventana de 15 minutos por dirección IP.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos permitidos
  standardHeaders: true, // Incluye cabeceras RateLimit-* (RFC draft)
  legacyHeaders: false, // Deshabilita cabeceras X-RateLimit-*
  skipSuccessfulRequests: false,
  handler: (req, res, next, options) => {
    logger.warn({
      ip: req.ip,
      path: req.originalUrl,
      headers: req.headers['user-agent']
    }, 'Alerta de Seguridad: Límite de tasa excedido en inicio de sesión (HTTP 429)');

    res.status(429).json({
      status: 429,
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      error: 'Has superado el número máximo de intentos permitidos. Por favor, espera 15 minutos antes de reintentar.'
    });
  }
});

/**
 * Limitador para solicitudes de recuperación de contraseña (Forgot Password)
 * Evita ataques de denegación de servicio por spam de correos y saturación de la base de datos.
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo 3 solicitudes por IP por hora
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ ip: req.ip, path: req.originalUrl }, 'Límite de tasa excedido en solicitud de recuperación de contraseña');
    res.status(429).json({
      status: 429,
      code: 'TOO_MANY_RESET_REQUESTS',
      error: 'Demasiadas solicitudes de recuperación de contraseña. Intenta más tarde.'
    });
  }
});

/**
 * Limitador global para peticiones a la API general (Protección contra DoS y Scrapers)
 * Límite: 100 peticiones por ventana de 15 minutos.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      error: 'Demasiadas peticiones desde esta IP. Por favor disminuye la velocidad.'
    });
  }
});

export default {
  loginRateLimiter,
  passwordResetRateLimiter,
  apiRateLimiter
};
