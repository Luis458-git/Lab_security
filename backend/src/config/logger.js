import pino from 'pino';

// Configuración de Pino Logger con redacción estricta de secretos y PII (OWASP A09:2025)
export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  formatters: {
    level: (label) => ({ level: label.toUpperCase() })
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      // Encabezados HTTP sensibles
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-api-key"]',
      'res.headers["set-cookie"]',

      // Credenciales y secretos
      'password',
      'password_hash',
      'newPassword',
      'confirmPassword',
      'token',
      'token_hash',
      'rawToken',
      'refreshToken',
      'DATA_ENCRYPTION_KEY',
      'JWT_SECRET',
      'COOKIE_SECRET',

      // Cargas útiles y campos de base de datos sensibles
      'phone_number_encrypted',
      'title_encrypted',
      'content_encrypted',
      '*.password',
      '*.password_hash',
      '*.token',
      '*.token_hash',
      '*.phone_number_encrypted',
      '*.content_encrypted'
    ],
    censor: '[REDACTED]'
  }
});

export default logger;
