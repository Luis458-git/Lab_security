import { query } from '../config/db.js';
import { encrypt, decrypt } from '../security/crypto.security.js';
import { logSecurityEvent } from '../utils/audit.util.js';

const maskPhoneNumber = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '***-***-' + digits;
  const lastFour = digits.slice(-4);
  return '***-***-' + lastFour;
};

/**
 * Obtener información de perfil con datos sensibles enmascarados (RF-05)
 */
export const getProfile = async (userId) => {
  const result = await query(
    `SELECT id, email, full_name, role, phone_number_masked, phone_number_encrypted IS NOT NULL AS has_phone, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (result.rowCount === 0) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const user = result.rows[0];

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    phoneMasked: user.phone_number_masked,
    hasPhone: user.has_phone,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
};

/**
 * Revelar dato sensible (teléfono) mediante descifrado AES-256-GCM y auditoría de acceso
 */
export const revealPhone = async (userId, clientIp, userAgent) => {
  const result = await query(
    `SELECT phone_number_encrypted, phone_number_iv, phone_number_tag
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (result.rowCount === 0) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const user = result.rows[0];

  if (!user.phone_number_encrypted) {
    return { phone: null };
  }

  // Descifrado seguro AES-256-GCM
  const phone = decrypt({
    ciphertext: user.phone_number_encrypted,
    iv: user.phone_number_iv,
    authTag: user.phone_number_tag
  });

  // Registro de auditoría por acceso a PII en texto plano (OWASP A09)
  await logSecurityEvent({
    userId,
    eventType: 'PHONE_REVEALED',
    severity: 'INFO',
    ipAddress: clientIp,
    userAgent,
    details: { reason: 'USER_EXPLICIT_REVEAL_REQUEST' }
  });

  return { phone };
};

/**
 * Actualizar perfil con cifrado del nuevo teléfono
 */
export const updateProfile = async (userId, { fullName, phone }, clientIp, userAgent) => {
  let updateFields = [];
  let params = [];
  let paramIndex = 1;

  if (fullName !== undefined) {
    updateFields.push(`full_name = $${paramIndex++}`);
    params.push(fullName);
  }

  if (phone !== undefined) {
    if (phone === null || phone.trim() === '') {
      updateFields.push(`phone_number_encrypted = NULL`);
      updateFields.push(`phone_number_iv = NULL`);
      updateFields.push(`phone_number_tag = NULL`);
      updateFields.push(`phone_number_masked = NULL`);
    } else {
      const encrypted = encrypt(phone);
      const masked = maskPhoneNumber(phone);

      updateFields.push(`phone_number_encrypted = $${paramIndex++}`);
      params.push(encrypted.ciphertext);

      updateFields.push(`phone_number_iv = $${paramIndex++}`);
      params.push(encrypted.iv);

      updateFields.push(`phone_number_tag = $${paramIndex++}`);
      params.push(encrypted.authTag);

      updateFields.push(`phone_number_masked = $${paramIndex++}`);
      params.push(masked);
    }
  }

  if (updateFields.length === 0) {
    const error = new Error('No se enviaron datos para actualizar');
    error.statusCode = 400;
    throw error;
  }

  updateFields.push(`updated_at = NOW()`);
  params.push(userId);

  const sql = `
    UPDATE users
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, email, full_name, role, phone_number_masked, phone_number_encrypted IS NOT NULL AS has_phone, updated_at
  `;

  const result = await query(sql, params);
  const updatedUser = result.rows[0];

  await logSecurityEvent({
    userId,
    eventType: 'PROFILE_UPDATED',
    severity: 'INFO',
    ipAddress: clientIp,
    userAgent,
    details: { updatedFields: Object.keys({ fullName, phone }).filter(k => ({ fullName, phone })[k] !== undefined) }
  });

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    fullName: updatedUser.full_name,
    role: updatedUser.role,
    phoneMasked: updatedUser.phone_number_masked,
    hasPhone: updatedUser.has_phone,
    updatedAt: updatedUser.updated_at
  };
};

export default {
  getProfile,
  revealPhone,
  updateProfile
};
