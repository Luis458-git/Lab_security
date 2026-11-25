import { query } from '../config/db.js';
import { hashPassword } from '../security/hash.security.js';
import { encrypt } from '../security/crypto.security.js';
import logger from '../config/logger.js';

/**
 * Script de Inicialización de Usuario Administrador (Seed de Seguridad)
 * Uso:
 *   node backend/src/utils/create-admin.js <email> <password> <fullName> [phone]
 * Ejemplo:
 *   node backend/src/utils/create-admin.js admin@securevault.local "AdminVault2026!#" "Administrador Principal" "+525500000000"
 */

const maskPhoneNumber = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '***-***-' + digits;
  return '***-***-' + digits.slice(-4);
};

const run = async () => {
  const args = process.argv.slice(2);
  const email = (args[0] || 'admin@securevault.local').toLowerCase().trim();
  const password = args[1] || 'Admin@SecureVault2026!';
  const fullName = args[2] || 'Administrador SecureVault';
  const phone = args[3] || '+1 555-0199';

  console.log('🔒 [SECUREVAULT SEED] Inicializando creación de Administrador...');
  console.log(`- Correo: ${email}`);
  console.log(`- Nombre: ${fullName}`);

  try {
    // 1. Verificar si ya existe
    const exists = await query('SELECT id, role FROM users WHERE email = $1', [email]);
    if (exists.rowCount > 0) {
      if (exists.rows[0].role !== 'admin') {
        await query("UPDATE users SET role = 'admin' WHERE id = $1", [exists.rows[0].id]);
        console.log(`✅ Usuario existente actualizado a rol "admin" con éxito.`);
      } else {
        console.log(`ℹ️ El usuario administrador ya existe en la base de datos.`);
      }
      process.exit(0);
    }

    // 2. Hashear con Argon2id
    console.log('⏳ Computando hash Argon2id (memoryCost: 19456 KiB, timeCost: 2)...');
    const passwordHash = await hashPassword(password);

    // 3. Cifrar teléfono con AES-256-GCM
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

    // 4. Insertar con rol 'admin'
    const sql = `
      INSERT INTO users (email, full_name, password_hash, phone_number_encrypted, phone_number_iv, phone_number_tag, phone_number_masked, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'admin')
      RETURNING id, email, full_name, role, created_at
    `;
    const res = await query(sql, [email, fullName, passwordHash, phoneEnc, phoneIv, phoneTag, phoneMasked]);
    const admin = res.rows[0];

    console.log('✅ [ADMINISTRADOR CREADO EXITOSAMENTE]');
    console.log(`- ID: ${admin.id}`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Rol: ${admin.role}`);
    console.log(`- Creado: ${admin.created_at}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal al crear administrador:', error.message);
    process.exit(1);
  }
};

run();
