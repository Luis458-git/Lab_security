import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import env from './config/env.js';
import { configureHelmet, configureCors, configurePermissionsPolicy } from './security/helmet.security.js';
import { apiRateLimiter } from './security/rateLimit.security.js';
import routes from './routes/index.routes.js';
import errorHandler from './middlewares/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuración de Proxy reverso para Render / Cloudflare
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Ocultar deliberadamente la cabecera X-Powered-By
app.disable('x-powered-by');

// Cabeceras de seguridad estrictas (Helmet + CSP)
app.use(configureHelmet());

// Política de permisos estricta del navegador (A+ en SecurityHeaders)
app.use(configurePermissionsPolicy());

// CORS restringido con soporte de credenciales seguras
app.use(configureCors());

// Límite de tamaño estricto de cuerpo JSON a 16 KB (Mitigación DoS - OWASP A06 / A10)
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));

// Parser de cookies firmadas con secreto criptográfico
app.use(cookieParser(env.COOKIE_SECRET));

// Limitador general de peticiones API
app.use('/api', apiRateLimiter);

// Enrutador de la aplicación (/health y /api/v1/*)
app.use(routes);

// Servir frontend compilado de React (frontend/dist)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Cualquier ruta que NO empiece por /api ni /health devuelve index.html (React Router)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    code: 'ROUTE_NOT_FOUND',
    error: 'El recurso solicitado no fue encontrado'
  });
});

// Manejador global de excepciones sin fugas de stack traces
app.use(errorHandler);

export default app;
