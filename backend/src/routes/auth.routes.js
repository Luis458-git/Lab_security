import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { loginRateLimiter, passwordResetRateLimiter } from '../security/rateLimit.security.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../schemas/auth.schema.js';

const router = Router();

// Registro con validación Zod estricta
router.post(
  '/register',
  validateBody(registerSchema),
  authController.register
);

// Inicio de sesión protegido por Rate Limiter (5 intentos/15 min) y cookie HttpOnly
router.post(
  '/login',
  loginRateLimiter,
  validateBody(loginSchema),
  authController.login
);

// Cierre de sesión y limpieza de cookie
router.post(
  '/logout',
  authController.logout
);

// Consulta de sesión activa
router.get(
  '/me',
  requireAuth,
  authController.getSessionUser
);

// Solicitud de restablecimiento de contraseña protegida por rate limiter (3 peticiones/hora)
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);

// Confirmación de nueva contraseña con token de un solo uso
router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

export default router;
