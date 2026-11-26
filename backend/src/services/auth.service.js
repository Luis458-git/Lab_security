import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import env from '../config/env.js';
import { hashPassword, verifyPassword, generateSecureToken, generateSecureOTP, hashToken } from '../security/hash.security.js';
import { encrypt } from '../security/crypto.security.js';
import { logSecurityEvent } from '../utils/audit.util.js';
import { sendPasswordResetEmail } from './email.service.js';

// Helper para crear máscara de teléfono (***-***-1234)
const maskPhoneNumber = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '***-***-' + digits;
  const lastFour = digits.slice(-4);
  return '***-***-' + lastFour;
};

/**
 * Servicio de Autenticación y Gestión de Identidad (OWASP A07:2025)
 */
export const registerUser = async ({ email, fullName, password, phone }, clientIp, userAgent) => {
  // 1. Verificar si el correo ya está registrado
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rowCount > 0) {
    const error = new Error('El correo electrónico ya se encuentra registrado');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  // 2. Hash irreversible con Argon2id (Parámetros RFC 9106)
  const passwordHash = await hashPassword(password);

  // 3. Cifrado simétrico de datos sensibles (teléfono) con AES-256-GCM
  let phoneEnc = null;
  let phoneIv = null;
  let phoneTag = null;
  let phoneMasked = null;

  if (phone) {
    const encrypted = encrypt(phone);
    phoneEnc = encrypted.ciphertext;
    phoneIv = encrypted.iv;
    phoneTag = encrypted.authTag;
    phoneMasked = maskPhoneNumber(phone);
  }

  // 4. Inserción con rol por defecto 'user' (Previene Privilege Escalation forzado en registro)
  const insertSql = `
    INSERT INTO users (email, full_name, password_hash, phone_number_encrypted, phone_number_iv, phone_number_tag, phone_number_masked, role)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'user')
    RETURNING id, email, full_name, role, phone_number_masked, created_at
  `;
  const insertParams = [email, fullName, passwordHash, phoneEnc, phoneIv, phoneTag, phoneMasked];
  const result = await query(insertSql, insertParams);
  const newUser = result.rows[0];

  // 5. Registro de auditoría
  await logSecurityEvent({
    userId: newUser.id,
    eventType: 'AUTH_REGISTER_SUCCESS',
    severity: 'INFO',
    ipAddress: clientIp,
    userAgent,
    details: { email: newUser.email, role: newUser.role }
  });

  return {
    id: newUser.id,
    email: newUser.email,
    fullName: newUser.full_name,
    role: newUser.role,
    phoneMasked: newUser.phone_number_masked,
    createdAt: newUser.created_at
  };
};

/**
 * Autenticación con verificación Argon2id y bloqueo temporal por fuerza bruta
 */
export const loginUser = async ({ email, password }, clientIp, userAgent) => {
  const userResult = await query(
    'SELECT id, email, full_name, password_hash, role, failed_login_attempts, locked_until FROM users WHERE email = $1',
    [email]
  );

  // Mitigación User Enumeration: Si no existe el usuario, ejecutamos una verificación ficticia
  // para mantener un tiempo de respuesta equivalente
  if (userResult.rowCount === 0) {
    // Hash dummy para consumir tiempo de CPU similar
    await hashPassword('dummyPasswordForConstantTime123!');
    await logSecurityEvent({
      userId: null,
      eventType: 'LOGIN_FAILED',
      severity: 'WARN',
      ipAddress: clientIp,
      userAgent,
      details: { emailAttempted: email, reason: 'USER_NOT_FOUND' }
    });
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const user = userResult.rows[0];

  // Verificar si la cuenta se encuentra bloqueada por exceder intentos
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const remainingMinutes = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / (60 * 1000));
    await logSecurityEvent({
      userId: user.id,
      eventType: 'LOGIN_BLOCKED_ATTEMPT',
      severity: 'WARN',
      ipAddress: clientIp,
      userAgent,
      details: { remainingMinutes }
    });
    const error = new Error(`Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intente en ${remainingMinutes} minutos.`);
    error.statusCode = 423;
    error.code = 'ACCOUNT_LOCKED';
    throw error;
  }

  // Comprobar contraseña con Argon2id
  const isPasswordValid = await verifyPassword(user.password_hash, password);

  if (!isPasswordValid) {
    const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
    let lockUntil = null;

    // Regla de negocio: tras 5 intentos fallidos se bloquea por 15 minutos
    if (newFailedAttempts >= 5) {
      lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await query(
      'UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3',
      [newFailedAttempts, lockUntil, user.id]
    );

    await logSecurityEvent({
      userId: user.id,
      eventType: newFailedAttempts >= 5 ? 'ACCOUNT_LOCKED_5_ATTEMPTS' : 'LOGIN_FAILED',
      severity: newFailedAttempts >= 5 ? 'CRITICAL' : 'WARN',
      ipAddress: clientIp,
      userAgent,
      details: { failedAttempts: newFailedAttempts, locked: !!lockUntil }
    });

    const error = new Error(
      newFailedAttempts >= 5
        ? 'Has excedido el límite de 5 intentos fallidos. Cuenta bloqueada por 15 minutos.'
        : 'Credenciales inválidas'
    );
    error.statusCode = newFailedAttempts >= 5 ? 423 : 401;
    throw error;
  }

  // Login exitoso: restablecer intentos fallidos y bloqueo
  await query(
    'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1',
    [user.id]
  );

  // Generar JWT firmado
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    {
      expiresIn: '24h',
      algorithm: 'HS256'
    }
  );

  await logSecurityEvent({
    userId: user.id,
    eventType: 'LOGIN_SUCCESS',
    severity: 'INFO',
    ipAddress: clientIp,
    userAgent,
    details: { email: user.email, role: user.role }
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    }
  };
};

/**
 * Solicitar restablecimiento de contraseña (RF-06 / NIST SP 800-63B)
 * Genera código OTP criptográfico de 6 dígitos, almacena solo su hash SHA-256 (10 min)
 */
export const requestPasswordReset = async (email, clientIp, userAgent) => {
  const userResult = await query('SELECT id, email, phone_number_masked FROM users WHERE email = $1', [email]);

  let otp = null;

  if (userResult.rowCount > 0) {
    const user = userResult.rows[0];

    // Generar código OTP criptográficamente seguro de 6 dígitos (NIST SP 800-63B)
    otp = generateSecureOTP();
    // Hash irreversible con SHA-256 para persistir en BD sin exponer el OTP
    const tokenHash = hashToken(otp);

    // Expiración estricta a los 10 minutos recomendada para códigos OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidar códigos o tokens previos no usados
    await query('DELETE FROM password_resets WHERE user_id = $1', [user.id]);

    await query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at, used) VALUES ($1, $2, $3, FALSE)',
      [user.id, tokenHash, expiresAt]
    );

    await logSecurityEvent({
      userId: user.id,
      eventType: 'PWD_RESET_REQUESTED',
      severity: 'INFO',
      ipAddress: clientIp,
      userAgent,
      details: { email: user.email }
    });

    // Despachar correo electrónico real vía SMTP con el código OTP
    await sendPasswordResetEmail(user.email, otp, user.phone_number_masked);
  }

  // Respuesta homogénea para mitigar enumeración de correos (OWASP A07)
  // El código OTP NUNCA se expone en la respuesta HTTP: viaja estrictamente por correo
  return {
    message: 'Si el correo electrónico está registrado, recibirás un código OTP de seguridad de 6 dígitos en tu bandeja de entrada.'
  };
};

/**
 * Confirmar restablecimiento de contraseña con código OTP o token de un solo uso
 */
export const resetPasswordWithToken = async ({ token, newPassword }, clientIp, userAgent) => {
  const cleanToken = (token || '').trim();

  // 1. Hashear el código OTP o token recibido con SHA-256
  const tokenHash = hashToken(cleanToken);

  // 2. Buscar registro válido, no usado y no expirado
  const tokenResult = await query(
    'SELECT id, user_id, expires_at, used FROM password_resets WHERE token_hash = $1',
    [tokenHash]
  );

  if (tokenResult.rowCount === 0) {
    await logSecurityEvent({
      userId: null,
      eventType: 'PWD_RESET_FAILED',
      severity: 'WARN',
      ipAddress: clientIp,
      userAgent,
      details: { reason: 'TOKEN_NOT_FOUND' }
    });
    const error = new Error('El código OTP o token de restablecimiento es inválido');
    error.statusCode = 400;
    throw error;
  }

  const resetRecord = tokenResult.rows[0];

  if (resetRecord.used || (resetRecord.expires_at && new Date(resetRecord.expires_at) < new Date())) {
    await logSecurityEvent({
      userId: resetRecord.user_id,
      eventType: 'PWD_RESET_FAILED',
      severity: 'WARN',
      ipAddress: clientIp,
      userAgent,
      details: { reason: resetRecord.used ? 'TOKEN_ALREADY_USED' : 'TOKEN_EXPIRED' }
    });
    const error = new Error('El código OTP ha expirado (10 min) o ya fue utilizado');
    error.statusCode = 400;
    throw error;
  }

  // 3. Generar nuevo hash Argon2id
  const newPasswordHash = await hashPassword(newPassword);

  // 4. Actualizar contraseña del usuario y marcar token como usado en una transacción
  await query('BEGIN');
  try {
    await query(
      'UPDATE users SET password_hash = $1, failed_login_attempts = 0, locked_until = NULL WHERE id = $2',
      [newPasswordHash, resetRecord.user_id]
    );

    await query(
      'UPDATE password_resets SET used = TRUE, used_at = NOW() WHERE id = $1',
      [resetRecord.id]
    );

    await query('COMMIT');
  } catch (txError) {
    await query('ROLLBACK');
    throw txError;
  }

  await logSecurityEvent({
    userId: resetRecord.user_id,
    eventType: 'PWD_RESET_SUCCESS',
    severity: 'INFO',
    ipAddress: clientIp,
    userAgent,
    details: { resetId: resetRecord.id }
  });

  return {
    success: true,
    message: 'Contraseña restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.'
  };
};

export default {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPasswordWithToken
};
