import argon2 from 'argon2';
import crypto from 'node:crypto';

/**
 * Parámetros de Argon2id ajustados a las recomendaciones de OWASP y RFC 9106:
 * - Tipo: Argon2id (híbrido resistente a ataques por canal lateral y GPU/ASIC)
 * - Memoria: 19456 KiB (~19 MiB)
 * - Iteraciones de tiempo: 2
 * - Paralelismo: 1 hilo
 */
const ARGON2_CONFIG = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1
};

/**
 * Genera un hash irreversible de alta resistencia de una contraseña usando Argon2id.
 * Mitigación OWASP A07:2025 y A04:2025.
 * 
 * @param {string} plainPassword - Contraseña en texto plano
 * @returns {Promise<string>} Hash codificado en formato estándar modular crypt ($argon2id$...)
 */
export const hashPassword = async (plainPassword) => {
  if (typeof plainPassword !== 'string' || !plainPassword) {
    throw new TypeError('La contraseña a hashear debe ser una cadena no vacía');
  }
  return argon2.hash(plainPassword, ARGON2_CONFIG);
};

/**
 * Verifica una contraseña en texto plano contra un hash Argon2id en tiempo constante.
 * 
 * @param {string} hash - Hash almacenado
 * @param {string} plainPassword - Contraseña proporcionada por el usuario
 * @returns {Promise<boolean>} true si coincide, false en caso contrario
 */
export const verifyPassword = async (hash, plainPassword) => {
  if (!hash || !plainPassword) {
    return false;
  }
  try {
    return await argon2.verify(hash, plainPassword);
  } catch (error) {
    return false;
  }
};

/**
 * Genera un código OTP numérico criptográficamente seguro de 6 dígitos (CSPRNG).
 * Cumple con NIST SP 800-63B para autenticación de un solo uso.
 * 
 * @returns {string} Código numérico de 6 dígitos (ej. "482019")
 */
export const generateSecureOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Genera un token aleatorio criptográficamente seguro (CSPRNG) para flujos
 * de un solo uso como restablecimiento de contraseña.
 * 
 * @param {number} bytes - Longitud en bytes (por defecto 32 bytes / 256 bits)
 * @returns {string} Token hexadecimal
 */
export const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Genera un hash SHA-256 irreversible de un token temporal.
 * Los tokens en texto plano nunca se persisten en la base de datos para prevenir
 * secuestro de cuentas en caso de filtración de datos en reposo.
 * 
 * @param {string} token - Token en texto plano
 * @returns {string} Hash SHA-256 en formato hexadecimal de 64 caracteres
 */
export const hashToken = (token) => {
  if (typeof token !== 'string' || !token) {
    throw new TypeError('El token debe ser una cadena no vacía');
  }
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
};

/**
 * Comparación segura de cadenas en tiempo constante (mitigación contra Timing Attacks)
 * @param {string} a - Cadena A
 * @param {string} b - Cadena B
 * @returns {boolean}
 */
export const safeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
};

export default {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateSecureOTP,
  hashToken,
  safeCompare
};
