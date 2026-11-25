import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { query } from '../config/db.js';
import logger from '../config/logger.js';

/**
 * Middleware de Autenticación de Sesiones Seguras
 * 
 * Lee la cookie firmada HttpOnly 'sv_session', verifica la firma criptográfica JWT,
 * comprueba el estado activo del usuario en la base de datos y adjunta req.user.
 * 
 * Mitigación OWASP A07:2025 - Identification and Authentication Failures
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Extraer token de cookie firmada o estándar
    const token = req.signedCookies?.sv_session || req.cookies?.sv_session;

    if (!token) {
      return res.status(401).json({
        status: 401,
        code: 'UNAUTHORIZED',
        error: 'Sesión no válida o no iniciada'
      });
    }

    // Verificar firma criptográfica del JWT
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (jwtError) {
      logger.warn({ ip: req.ip, error: jwtError.message }, 'Token de sesión inválido o expirado');
      res.clearCookie('sv_session', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        signed: true
      });
      return res.status(401).json({
        status: 401,
        code: 'TOKEN_EXPIRED',
        error: 'La sesión ha expirado o es inválida. Inicie sesión nuevamente.'
      });
    }

    // Validar estado actual del usuario en la base de datos PostgreSQL
    const userRes = await query(
      'SELECT id, email, full_name, role, locked_until FROM users WHERE id = $1',
      [decoded.sub]
    );

    if (userRes.rowCount === 0) {
      res.clearCookie('sv_session');
      return res.status(401).json({
        status: 401,
        code: 'USER_NOT_FOUND',
        error: 'El usuario ya no existe en el sistema'
      });
    }

    const user = userRes.rows[0];

    // Verificar si la cuenta fue bloqueada temporalmente
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({
        status: 423,
        code: 'ACCOUNT_LOCKED',
        error: 'Su cuenta se encuentra temporalmente bloqueada por seguridad. Intente más tarde.'
      });
    }

    // Adjuntar contexto de usuario autenticado
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    };

    next();
  } catch (error) {
    logger.error({ err: error.message }, 'Fallo inesperado en middleware de autenticación');
    next(error);
  }
};

export default requireAuth;
