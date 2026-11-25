import { query } from '../config/db.js';
import { encrypt, decrypt } from '../security/crypto.security.js';
import { logSecurityEvent } from '../utils/audit.util.js';

const MAX_NOTES_PER_USER = 20;

/**
 * Servicio de Bóveda de Notas Seguras (OWASP A01:2025, A04:2025, A06:2025)
 */

/**
 * Obtener todas las notas del usuario autenticado (con descifrado AES-256-GCM)
 */
export const getUserNotes = async (userId) => {
  const result = await query(
    `SELECT id, title_encrypted, title_iv, title_tag, content_encrypted, content_iv, content_tag, created_at, updated_at
     FROM notes
     WHERE owner_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  const notes = result.rows.map((row) => {
    // Descifrado seguro en tiempo de ejecución
    const title = decrypt({
      ciphertext: row.title_encrypted,
      iv: row.title_iv,
      authTag: row.title_tag
    });

    const content = decrypt({
      ciphertext: row.content_encrypted,
      iv: row.content_iv,
      authTag: row.content_tag
    });

    return {
      id: row.id,
      title,
      content,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  });

  return {
    notes,
    count: notes.length,
    quotaMax: MAX_NOTES_PER_USER
  };
};

/**
 * Obtener una nota puntual por su ID verificando propiedad contra IDOR
 */
export const getNoteById = async (userId, noteId, clientIp, userAgent) => {
  // 1. Buscar la nota por su ID global
  const noteCheck = await query('SELECT * FROM notes WHERE id = $1', [noteId]);

  if (noteCheck.rowCount === 0) {
    const error = new Error('Nota no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const note = noteCheck.rows[0];

  // 2. Control estricto de propiedad (Mitigación IDOR A01:2025)
  if (note.owner_id !== userId) {
    // Registrar intento malicioso de acceso a recurso ajeno
    await logSecurityEvent({
      userId,
      eventType: 'IDOR_ATTEMPT',
      severity: 'CRITICAL',
      ipAddress: clientIp,
      userAgent,
      details: {
        attemptedNoteId: noteId,
        actualOwnerId: note.owner_id,
        action: 'GET'
      }
    });

    // Se responde 404 para evitar revelar la existencia de la nota ajena
    const error = new Error('Nota no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const title = decrypt({
    ciphertext: note.title_encrypted,
    iv: note.title_iv,
    authTag: note.title_tag
  });

  const content = decrypt({
    ciphertext: note.content_encrypted,
    iv: note.content_iv,
    authTag: note.content_tag
  });

  return {
    id: note.id,
    title,
    content,
    createdAt: note.created_at,
    updatedAt: note.updated_at
  };
};

/**
 * Crear una nueva nota con cifrado AES-256-GCM y validación de cuota máxima de 20 notas
 */
export const createNote = async (userId, { title, content }, clientIp, userAgent) => {
  // 1. Verificar límite de negocio (Límite de 20 notas por usuario - A06)
  const countResult = await query(
    'SELECT COUNT(*)::int AS count FROM notes WHERE owner_id = $1',
    [userId]
  );
  const currentCount = countResult.rows[0].count;

  if (currentCount >= MAX_NOTES_PER_USER) {
    await logSecurityEvent({
      userId,
      eventType: 'QUOTA_EXCEEDED_NOTE_CREATION',
      severity: 'WARN',
      ipAddress: clientIp,
      userAgent,
      details: { currentCount, maxQuota: MAX_NOTES_PER_USER }
    });

    const error = new Error(`Has alcanzado la cuota máxima permitida de ${MAX_NOTES_PER_USER} notas en tu bóveda.`);
    error.statusCode = 403;
    error.code = 'QUOTA_EXCEEDED';
    throw error;
  }

  // 2. Cifrar título y contenido con AES-256-GCM (IVs y AuthTags independientes de 12 y 16 bytes)
  const encTitle = encrypt(title);
  const encContent = encrypt(content);

  const insertSql = `
    INSERT INTO notes (
      owner_id,
      title_encrypted, title_iv, title_tag,
      content_encrypted, content_iv, content_tag
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, created_at, updated_at
  `;

  const params = [
    userId,
    encTitle.ciphertext, encTitle.iv, encTitle.authTag,
    encContent.ciphertext, encContent.iv, encContent.authTag
  ];

  const result = await query(insertSql, params);
  const createdNote = result.rows[0];

  await logSecurityEvent({
    userId,
    eventType: 'NOTE_CREATED',
    severity: 'INFO',
    ipAddress: clientIp,
    userAgent,
    details: { noteId: createdNote.id }
  });

  return {
    id: createdNote.id,
    title,
    content,
    createdAt: createdNote.created_at,
    updatedAt: createdNote.updated_at
  };
};

/**
 * Actualizar una nota existente con verificación IDOR
 */
export const updateNote = async (userId, noteId, { title, content }, clientIp, userAgent) => {
  const noteCheck = await query('SELECT * FROM notes WHERE id = $1', [noteId]);

  if (noteCheck.rowCount === 0) {
    const error = new Error('Nota no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const existingNote = noteCheck.rows[0];

  // Verificación estricta de propiedad
  if (existingNote.owner_id !== userId) {
    await logSecurityEvent({
      userId,
      eventType: 'IDOR_ATTEMPT',
      severity: 'CRITICAL',
      ipAddress: clientIp,
      userAgent,
      details: { attemptedNoteId: noteId, actualOwnerId: existingNote.owner_id, action: 'UPDATE' }
    });

    const error = new Error('Nota no encontrada');
    error.statusCode = 404;
    throw error;
  }

  // Preparar valores cifrados nuevos o mantener existentes
  let newTitleEnc = existingNote.title_encrypted;
  let newTitleIv = existingNote.title_iv;
  let newTitleTag = existingNote.title_tag;
  let finalTitle = null;

  if (title !== undefined) {
    finalTitle = title;
    const enc = encrypt(title);
    newTitleEnc = enc.ciphertext;
    newTitleIv = enc.iv;
    newTitleTag = enc.authTag;
  } else {
    finalTitle = decrypt({
      ciphertext: existingNote.title_encrypted,
      iv: existingNote.title_iv,
      authTag: existingNote.title_tag
    });
  }

  let newContentEnc = existingNote.content_encrypted;
  let newContentIv = existingNote.content_iv;
  let newContentTag = existingNote.content_tag;
  let finalContent = null;

  if (content !== undefined) {
    finalContent = content;
    const enc = encrypt(content);
    newContentEnc = enc.ciphertext;
    newContentIv = enc.iv;
    newContentTag = enc.authTag;
  } else {
    finalContent = decrypt({
      ciphertext: existingNote.content_encrypted,
      iv: existingNote.content_iv,
      authTag: existingNote.content_tag
    });
  }

  const updateSql = `
    UPDATE notes
    SET title_encrypted = $1, title_iv = $2, title_tag = $3,
        content_encrypted = $4, content_iv = $5, content_tag = $6,
        updated_at = NOW()
    WHERE id = $7 AND owner_id = $8
    RETURNING id, updated_at
  `;

  const updateRes = await query(updateSql, [
    newTitleEnc, newTitleIv, newTitleTag,
    newContentEnc, newContentIv, newContentTag,
    noteId, userId
  ]);

  await logSecurityEvent({
    userId,
    eventType: 'NOTE_UPDATED',
    severity: 'INFO',
    ipAddress: clientIp,
    userAgent,
    details: { noteId }
  });

  return {
    id: noteId,
    title: finalTitle,
    content: finalContent,
    updatedAt: updateRes.rows[0].updated_at
  };
};

/**
 * Eliminar una nota con verificación IDOR
 */
export const deleteNote = async (userId, noteId, clientIp, userAgent) => {
  const noteCheck = await query('SELECT * FROM notes WHERE id = $1', [noteId]);

  if (noteCheck.rowCount === 0) {
    const error = new Error('Nota no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const existingNote = noteCheck.rows[0];

  // Control estricto de propiedad
  if (existingNote.owner_id !== userId) {
    await logSecurityEvent({
      userId,
      eventType: 'IDOR_ATTEMPT',
      severity: 'CRITICAL',
      ipAddress: clientIp,
      userAgent,
      details: { attemptedNoteId: noteId, actualOwnerId: existingNote.owner_id, action: 'DELETE' }
    });

    const error = new Error('Nota no encontrada');
    error.statusCode = 404;
    throw error;
  }

  await query('DELETE FROM notes WHERE id = $1 AND owner_id = $2', [noteId, userId]);

  await logSecurityEvent({
    userId,
    eventType: 'NOTE_DELETED',
    severity: 'INFO',
    ipAddress: clientIp,
    userAgent,
    details: { noteId }
  });

  return {
    success: true,
    message: 'Nota eliminada permanentemente de la bóveda'
  };
};

export default {
  getUserNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
};
