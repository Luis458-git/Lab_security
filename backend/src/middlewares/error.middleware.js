import logger from '../config/logger.js';

/**
 * Manejador global de errores de Express (OWASP A10:2025 - Security Misconfiguration / Information Disclosure)
 * 
 * - Registra la traza detallada y el contexto en Pino Logger interno.
 * - Devuelve al cliente una respuesta genérica y segura SIN stack traces ni datos internos.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  // Registro del error completo con metadatos contextuales para el equipo de desarrollo/SecOps
  logger.error({
    err: {
      message: err.message,
      name: err.name,
      stack: err.stack
    },
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || null
  }, 'Excepción capturada por el manejador global de errores');

  // En caso de error de sintaxis JSON provocado por el body-parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 400,
      code: 'INVALID_JSON_PAYLOAD',
      error: 'El cuerpo de la petición contiene formato JSON inválido'
    });
  }

  // Respuesta al cliente segura y estandarizada
  const clientResponse = {
    status: statusCode,
    code: err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR'),
    error: statusCode >= 500
      ? 'Ocurrió un error inesperado al procesar la solicitud. Nuestro equipo ha sido notificado.'
      : err.message
  };

  res.status(statusCode).json(clientResponse);
};

export default errorHandler;
