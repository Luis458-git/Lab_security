import helmet from 'helmet';
import cors from 'cors';
import env from '../config/env.js';

/**
 * Middleware de Helmet configurado con directivas estrictas de seguridad web.
 * 
 * Mitigaciones:
 * - OWASP A02:2025 - Sensitive Data Exposure (Previene carga no autorizada y clickjacking)
 * - OWASP A05:2025 - Security Misconfiguration (Oculta tecnologías y restringe orígenes)
 */
export const configureHelmet = () => {
  return helmet({
    // Eliminación deliberada de encabezados que revelan el stack de servidor
    hidePoweredBy: true,

    // Política de Seguridad de Contenido (CSP) estricta
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Permite estilos en línea del SPA (Vite / Tailwind)
        imgSrc: ["'self'", 'data:', 'blob:'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", env.CORS_ORIGIN],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"], // Protección estricta contra Clickjacking
        upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null
      }
    },

    // HTTP Strict Transport Security (HSTS) - Forzar HTTPS durante 1 año
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },

    // Prohibir que la página se incruste en iframes de terceros
    frameguard: {
      action: 'deny'
    },

    // Prohibir que el navegador adivine el MIME-type
    noSniff: true,

    // Mitigar fugas en Referer
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    },

    // Restricción de DNS Prefetching
    dnsPrefetchControl: {
      allow: false
    },

    crossOriginEmbedderPolicy: false
  });
};

/**
 * Configuración de Cross-Origin Resource Sharing (CORS) estricta
 * Permite únicamente el frontend legítimo con credenciales autorizadas.
 */
export const configureCors = () => {
  const allowedOrigins = [env.CORS_ORIGIN];

  return cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (como clientes móviles o server-to-server en desarrollo)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Acceso CORS bloqueado por política de seguridad: origen no autorizado (${origin})`));
      }
    },
    credentials: true, // Requerido para envío y recepción de cookies HttpOnly
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400 // Cache de preflight por 24 horas
  });
};

export default {
  configureHelmet,
  configureCors
};
