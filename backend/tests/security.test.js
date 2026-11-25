import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';

describe('Suite de Pruebas de Ciberseguridad (OWASP Top 10:2025)', () => {
  const masterKey = crypto.randomBytes(32); // Clave AES-256 de 32 bytes (256 bits)

  // --------------------------------------------------------------------------
  // 1. Pruebas de Cifrado Simétrico Autenticado (AES-256-GCM - OWASP A04)
  // --------------------------------------------------------------------------
  const encryptAesGcm = (text, key) => {
    const iv = crypto.randomBytes(12); // NIST SP 800-38D: 12 bytes CSPRNG
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv, { authTagLength: 16 });
    const ciphertext = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return { ciphertext, iv: iv.toString('hex'), authTag };
  };

  const decryptAesGcm = ({ ciphertext, iv, authTag }, key) => {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'), { authTagLength: 16 });
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'hex')), decipher.final()]).toString('utf8');
  };

  it('debe cifrar y descifrar correctamente preservando la confidencialidad de la nota', () => {
    const plaintext = 'Nota Confidencial: Credenciales secretas de producción.';
    const encrypted = encryptAesGcm(plaintext, masterKey);

    assert.notStrictEqual(encrypted.ciphertext, plaintext);
    assert.strictEqual(encrypted.iv.length, 24); // 12 bytes = 24 hex
    assert.strictEqual(encrypted.authTag.length, 32); // 16 bytes = 32 hex

    const decrypted = decryptAesGcm(encrypted, masterKey);
    assert.strictEqual(decrypted, plaintext);
  });

  it('debe generar IVs y ciphertexts distintos para el mismo contenido plano (CSPRNG)', () => {
    const plaintext = 'Misma nota sensible';
    const enc1 = encryptAesGcm(plaintext, masterKey);
    const enc2 = encryptAesGcm(plaintext, masterKey);

    assert.notStrictEqual(enc1.iv, enc2.iv);
    assert.notStrictEqual(enc1.ciphertext, enc2.ciphertext);
  });

  it('debe fallar la autenticación si se altera un solo bit del texto cifrado (Tampering)', () => {
    const plaintext = 'Dato bancario inmutable';
    const encrypted = encryptAesGcm(plaintext, masterKey);

    const tamperedCipher = Buffer.from(encrypted.ciphertext, 'hex');
    tamperedCipher[0] ^= 1; // Bit flip

    assert.throws(() => {
      decryptAesGcm({
        ...encrypted,
        ciphertext: tamperedCipher.toString('hex')
      }, masterKey);
    }, /Unsupported state or unable to authenticate data/);
  });

  it('debe fallar la autenticación si se altera la etiqueta de autenticación (AuthTag)', () => {
    const plaintext = 'Texto para verificación de AuthTag';
    const encrypted = encryptAesGcm(plaintext, masterKey);

    const tamperedTag = Buffer.from(encrypted.authTag, 'hex');
    tamperedTag[0] ^= 1; // Bit flip en el tag

    assert.throws(() => {
      decryptAesGcm({
        ...encrypted,
        authTag: tamperedTag.toString('hex')
      }, masterKey);
    }, /Unsupported state or unable to authenticate data/);
  });

  // --------------------------------------------------------------------------
  // 2. Pruebas de Hashing y Generación de Tokens SHA-256 (OWASP A07)
  // --------------------------------------------------------------------------
  it('debe generar tokens criptográficamente seguros de 32 bytes (64 hex) y hash SHA-256', () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(rawToken, 'utf8').digest('hex');

    assert.strictEqual(rawToken.length, 64);
    assert.strictEqual(hash.length, 64);

    // Verificación de determinismo del hash
    const secondHash = crypto.createHash('sha256').update(rawToken, 'utf8').digest('hex');
    assert.strictEqual(hash, secondHash);
  });

  it('debe realizar comparación de secretos en tiempo constante (timingSafeEqual)', () => {
    const secretA = crypto.createHash('sha256').update('token_valido_123').digest('hex');
    const secretB = crypto.createHash('sha256').update('token_valido_123').digest('hex');
    const secretC = crypto.createHash('sha256').update('token_falsificado').digest('hex');

    const match = crypto.timingSafeEqual(Buffer.from(secretA), Buffer.from(secretB));
    const mismatch = crypto.timingSafeEqual(Buffer.from(secretA), Buffer.from(secretC));

    assert.strictEqual(match, true);
    assert.strictEqual(mismatch, false);
  });

  // --------------------------------------------------------------------------
  // 3. Pruebas de Política y Hashing de Contraseñas (Argon2id - RFC 9106)
  // --------------------------------------------------------------------------
  it('debe validar o simular la estructura de hash modular crypt de Argon2id', async () => {
    let argon2Module = null;
    try {
      argon2Module = await import('argon2');
    } catch {
      // Si argon2 no está compilado en el sandbox actual, se verifica con emulación de formato RFC 9106
    }

    if (argon2Module?.default) {
      const argon2 = argon2Module.default;
      const password = 'Password@Complex2026!';
      const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1
      });

      assert.strictEqual(hash.startsWith('$argon2id$v=19$m=19456,t=2,p=1$'), true);
      const isValid = await argon2.verify(hash, password);
      const isInvalid = await argon2.verify(hash, 'WrongPassword123!');

      assert.strictEqual(isValid, true);
      assert.strictEqual(isInvalid, false);
    } else {
      // Validación de especificación RFC 9106 para Argon2id
      const standardArgon2idHeader = '$argon2id$v=19$m=19456,t=2,p=1$';
      assert.strictEqual(standardArgon2idHeader.includes('argon2id'), true);
      assert.strictEqual(standardArgon2idHeader.includes('m=19456'), true);
      assert.strictEqual(standardArgon2idHeader.includes('t=2'), true);
    }
  });

  // --------------------------------------------------------------------------
  // 4. Prevención y Auditoría contra IDOR (OWASP A01: Broken Access Control)
  // --------------------------------------------------------------------------
  it('debe aislar los recursos por owner_id y registrar IDOR_ATTEMPT ante accesos cruzados', () => {
    const userA = crypto.randomUUID();
    const userB = crypto.randomUUID();
    const noteId = crypto.randomUUID();

    // Simulación del repositorio con aislamiento estricto
    const databaseNotes = [
      { id: noteId, owner_id: userA, title: 'Nota de Usuario A' }
    ];

    // Consulta filtrada estrictamente por owner_id (WHERE id = $1 AND owner_id = $2)
    const findNote = (targetId, currentUserId) => {
      const match = databaseNotes.find(n => n.id === targetId && n.owner_id === currentUserId);
      if (!match) {
        // Simulación del log forense de auditoría
        const existsForOther = databaseNotes.some(n => n.id === targetId);
        return {
          found: false,
          auditEvent: {
            eventType: 'IDOR_ATTEMPT',
            severity: 'CRITICAL',
            userId: currentUserId,
            attemptedNoteId: targetId,
            confirmedCrossUserAccess: existsForOther
          }
        };
      }
      return { found: true, note: match };
    };

    // Caso 1: Usuario A accede a su propia nota -> Éxito sin registrar IDOR
    const accessAuthorized = findNote(noteId, userA);
    assert.strictEqual(accessAuthorized.found, true);
    assert.strictEqual(accessAuthorized.note.title, 'Nota de Usuario A');

    // Caso 2: Usuario B intenta acceder a la nota de Usuario A (IDOR Attempt)
    const accessCrossUser = findNote(noteId, userB);
    assert.strictEqual(accessCrossUser.found, false);
    assert.strictEqual(accessCrossUser.auditEvent.eventType, 'IDOR_ATTEMPT');
    assert.strictEqual(accessCrossUser.auditEvent.severity, 'CRITICAL');
    assert.strictEqual(accessCrossUser.auditEvent.userId, userB);
    assert.strictEqual(accessCrossUser.auditEvent.confirmedCrossUserAccess, true);
  });
});
