-- ============================================================================
-- SECUREVAULT: Migración Inicial de Base de Datos (001_initial_schema.sql)
-- Cumplimiento: OWASP Top 10:2025 / PostgreSQL 15+ (Neon Serverless)
-- ============================================================================

-- Habilitar extensión criptográfica para generación de UUIDs seguros v4
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Función de ayuda para actualizar marcas de tiempo 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. TABLA: users
-- Contiene las credenciales y datos de perfil sensible del usuario.
-- La contraseña se almacena con Argon2id. El teléfono sensible se almacena
-- cifrado con AES-256-GCM y enmascarado para vista pública.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    phone_number_encrypted TEXT,
    phone_number_iv VARCHAR(32),
    phone_number_tag VARCHAR(32),
    phone_number_masked VARCHAR(30),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    failed_login_attempts INT NOT NULL DEFAULT 0 CHECK (failed_login_attempts >= 0),
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger de actualización de updated_at para users
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices de búsqueda para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ----------------------------------------------------------------------------
-- 2. TABLA: notes
-- Bóveda privada de notas. Título y contenido se almacenan cifrados con
-- AES-256-GCM usando claves/IVs únicos por nota.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title_encrypted TEXT NOT NULL,
    title_iv VARCHAR(32) NOT NULL,
    title_tag VARCHAR(32) NOT NULL,
    content_encrypted TEXT NOT NULL,
    content_iv VARCHAR(32) NOT NULL,
    content_tag VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_content_encrypted_length CHECK (length(content_encrypted) <= 16384)
);

-- Trigger de actualización de updated_at para notes
DROP TRIGGER IF EXISTS trg_notes_updated_at ON notes;
CREATE TRIGGER trg_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices para búsqueda de notas por propietario (Aislamiento Multi-inquilino)
CREATE INDEX IF NOT EXISTS idx_notes_owner_id ON notes(owner_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- ----------------------------------------------------------------------------
-- 3. TABLA: password_resets
-- Gestión de recuperación de contraseñas mediante tokens seguros de un solo uso
-- que expiran en 15 minutos. El token se almacena como hash SHA-256 irreversible.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para validación rápida de tokens de restablecimiento
CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);

-- ----------------------------------------------------------------------------
-- 4. TABLA: security_logs
-- Bitácora inmutable de auditoría forense para eventos de seguridad.
-- user_id usa ON DELETE SET NULL para preservar evidencia de auditoría
-- incluso si la cuenta es dada de baja.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARN', 'CRITICAL')),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas y monitoreo de seguridad
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at DESC);
