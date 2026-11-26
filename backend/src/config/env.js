import { z } from 'zod';
import dotenv from 'dotenv';

// Cargar variables desde .env si existe
dotenv.config();

// Si SESSION_SECRET está definido, usarlo como valor por defecto para JWT_SECRET y COOKIE_SECRET
if (process.env.SESSION_SECRET) {
  process.env.JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  process.env.COOKIE_SECRET = process.env.COOKIE_SECRET || process.env.SESSION_SECRET;
}

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL debe ser una URL de PostgreSQL válida' }),
  DATA_ENCRYPTION_KEY: z.string().refine((val) => {
    try {
      const buf = Buffer.from(val, 'base64');
      // Debe decodificar a exactamente 32 bytes (256 bits) para AES-256
      return buf.length === 32 && buf.toString('base64') === val.trim();
    } catch {
      return false;
    }
  }, {
    message: 'DATA_ENCRYPTION_KEY debe ser una clave Base64 válida de exactamente 32 bytes (256 bits)'
  }),
  SESSION_SECRET: z.string().min(32, { message: 'SESSION_SECRET debe tener al menos 32 caracteres (recomendado 64 bytes)' }).optional(),
  JWT_SECRET: z.string().min(32, { message: 'JWT_SECRET debe tener al menos 32 caracteres para resistencia criptográfica' }),
  COOKIE_SECRET: z.string().min(32, { message: 'COOKIE_SECRET debe tener al menos 32 caracteres' }),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  SMTP_HOST: z.string().default('smtp.gmail.com').optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587).optional(),
  SMTP_SECURE: z.coerce.boolean().default(false).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('"SecureVault Security" <no-reply@securevault.com>').optional(),
  APP_URL: z.string().default('https://securevault-adn6.onrender.com').optional()
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ [ERROR FATAL DE SEGURIDAD] Variables de entorno inválidas o faltantes:');
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  return Object.freeze(result.data);
};

export const env = parseEnv();
export default env;
