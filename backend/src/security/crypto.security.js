import crypto from 'node:crypto';
import env from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 12 bytes / 96 bits recomendado por NIST SP 800-38D para GCM
const AUTH_TAG_LENGTH = 16; // 16 bytes / 128 bits de etiqueta de autenticación

// Derivar buffer de clave de cifrado simétrico validada (32 bytes)
const getEncryptionKey = () => Buffer.from(env.DATA_ENCRYPTION_KEY, 'base64');

/**
 * Cifra un texto plano usando AES-256-GCM con un IV único de 12 bytes (CSPRNG)
 * y una etiqueta de autenticación de 16 bytes.
 * 
 * Mitigación OWASP A04:2025 - Cryptographic Failures
 * 
 * @param {string} plaintext - Texto plano a cifrar
 * @returns {{ ciphertext: string, iv: string, authTag: string }} Payload cifrado en formato hexadecimal
 */
export const encrypt = (plaintext) => {
  if (typeof plaintext !== 'string') {
    throw new TypeError('El valor a cifrar debe ser una cadena de texto (string)');
  }

  const key = getEncryptionKey();
  // Vector de Inicialización aleatorio e impredecible (CSPRNG)
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH
  });

  const encryptedBuffer = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encryptedBuffer.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

/**
 * Descifra un payload cifrado con AES-256-GCM verificando su autenticidad e integridad.
 * Lanza un error de seguridad si el ciphertext, el IV o el authTag fueron manipulados.
 * 
 * @param {{ ciphertext: string, iv: string, authTag: string }} encryptedPayload
 * @returns {string} Texto plano original descifrado
 */
export const decrypt = ({ ciphertext, iv, authTag }) => {
  if (!ciphertext || !iv || !authTag) {
    throw new Error('El payload a descifrar debe incluir ciphertext, iv y authTag en formato hexadecimal');
  }

  const key = getEncryptionKey();
  const ivBuffer = Buffer.from(iv, 'hex');
  const authTagBuffer = Buffer.from(authTag, 'hex');
  const ciphertextBuffer = Buffer.from(ciphertext, 'hex');

  if (ivBuffer.length !== IV_LENGTH) {
    throw new Error(`Longitud de IV inválida: se esperaban ${IV_LENGTH} bytes`);
  }

  if (authTagBuffer.length !== AUTH_TAG_LENGTH) {
    throw new Error(`Longitud de AuthTag inválida: se esperaban ${AUTH_TAG_LENGTH} bytes`);
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer, {
    authTagLength: AUTH_TAG_LENGTH
  });

  // Establecer la etiqueta de autenticación antes de invocar final()
  decipher.setAuthTag(authTagBuffer);

  try {
    const decryptedBuffer = Buffer.concat([
      decipher.update(ciphertextBuffer),
      decipher.final()
    ]);
    return decryptedBuffer.toString('utf8');
  } catch (error) {
    // Si la etiqueta no coincide, el nodo crypto arroja excepción de autenticación
    throw new Error('Fallo de integridad criptográfica: datos manipulados, clave errónea o etiqueta corrupta');
  }
};

/**
 * Empaqueta un objeto cifrado en un formato serializado seguro: iv:authTag:ciphertext
 * @param {{ ciphertext: string, iv: string, authTag: string }} payload
 * @returns {string}
 */
export const packEncrypted = ({ ciphertext, iv, authTag }) => {
  return `${iv}:${authTag}:${ciphertext}`;
};

/**
 * Desempaqueta un string iv:authTag:ciphertext a su objeto estructurado
 * @param {string} packedString
 * @returns {{ ciphertext: string, iv: string, authTag: string }}
 */
export const unpackEncrypted = (packedString) => {
  if (!packedString || typeof packedString !== 'string') {
    throw new Error('String empaquetado inválido');
  }
  const parts = packedString.split(':');
  if (parts.length !== 3) {
    throw new Error('Formato cifrado inválido. Se esperaba iv:authTag:ciphertext');
  }
  return {
    iv: parts[0],
    authTag: parts[1],
    ciphertext: parts[2]
  };
};

/**
 * Helper para descifrar directamente una cadena compactada iv:authTag:ciphertext
 * @param {string} packedString
 * @returns {string}
 */
export const decryptPacked = (packedString) => {
  const unpacked = unpackEncrypted(packedString);
  return decrypt(unpacked);
};

export default {
  encrypt,
  decrypt,
  packEncrypted,
  unpackEncrypted,
  decryptPacked
};
