# SecureVault — Guía de Despliegue a Producción (Fase 3)
**Proyecto:** SecureVault — Bóveda Web Segura para Notas Privadas y Datos Sensibles  
**Arquitectura DevSecOps:** GitHub Actions (CI/CD) + Neon (PostgreSQL Serverless TLS) + Render (Web Service HTTPS)  
**Estándar de Seguridad:** OWASP Top 10:2025 / NIST SP 800-63B  

---

## 1. Variables de Entorno de Producción

En producción, **nunca** se deben versionar archivos `.env` en el repositorio Git. Las variables deben inyectarse directamente en el panel de secretos de la plataforma de hosting (**Render Environment Variables**) y en **GitHub Secrets** para el pipeline de CI/CD.

### 1.1 Lista Exacta de Variables Requeridas

| Variable de Entorno | Tipo / Formato | Propósito de Seguridad | Ejemplo de Referencia (Sin secretos reales) |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `production` | Activa optimizaciones de Express, flags de cookies `Secure` y desactiva stack traces al cliente. | `production` |
| `PORT` | Numérico | Puerto de escucha asignado por el runtime de Render. | `3000` (Render lo inyecta automáticamente) |
| `DATABASE_URL` | URL PostgreSQL | Cadena de conexión a Neon con TLS mandatorio (`sslmode=require`). | `postgresql://vault_app_user:PASSWORD@ep-xyz-pooler.us-east-2.aws.neon.tech/securevault?sslmode=require` |
| `SESSION_SECRET` | Hexadecimal (64 bytes) | Secreto criptográfico para firma de tokens JWT y firma de cookies `HttpOnly` (`sv_session`). | Generado mediante CSPRNG (ver sección 1.2). |
| `DATA_ENCRYPTION_KEY` | Base64 (32 bytes exactos) | Clave simétrica maestra para el cifrado y descifrado autenticado `AES-256-GCM` de notas y teléfonos. | Generado mediante CSPRNG (ver sección 1.2). |
| `CORS_ORIGIN` | URL HTTPS | Dominio público autorizado para solicitudes CORS y credenciales de cookies. | `https://securevault-app.onrender.com` |

---

### 1.2 Generación de Secretos Criptográficos desde Terminal

Ejecuta los siguientes comandos en tu terminal local para generar claves seguras con entropía de grado militar:

#### Generar `SESSION_SECRET` (64 bytes / 128 caracteres hexadecimales):
```bash
# Opción con OpenSSL:
openssl rand -hex 64

# O alternativamente con Node.js nativo (CSPRNG):
node -e "console.log(require('node:crypto').randomBytes(64).toString('hex'))"
```

#### Generar `DATA_ENCRYPTION_KEY` (Exactamente 32 bytes / 256 bits codificados en Base64):
```bash
# Opción con OpenSSL:
openssl rand -base64 32

# O alternativamente con Node.js nativo:
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

> [!CAUTION]
> Asegúrate de que `DATA_ENCRYPTION_KEY` tenga exactamente 32 bytes al decodificarse. Si tiene una longitud distinta, el validador Zod en `backend/src/config/env.js` abortará el arranque del servidor para prevenir cifrados con longitudes de clave inseguras.

---

## 2. Paso a Paso: Base de Datos en Neon (PostgreSQL con TLS)

### Paso 2.1: Crear Proyecto y Base de Datos
1. Inicia sesión en la consola de [Neon Console](https://console.neon.tech).
2. Crea un nuevo proyecto llamado `securevault`.
3. Selecciona la región más cercana a tu servicio de Render (por ejemplo, `US East (Ohio) - us-east-2`).
4. Selecciona PostgreSQL versión 15 o superior.
5. Copia la cadena de conexión provista con el parámetro obligatorio `?sslmode=require`.

### Paso 2.2: Ejecutar Migración Inicial DDL
1. Dirígete a la pestaña **SQL Editor** en el panel de Neon (o conéctate con `psql`).
2. Abre y copia el contenido completo del archivo [`backend/migrations/001_initial_schema.sql`](file:///c:/Users/Latitude%205490/Desktop/practicas%20de%20progra/practicas%20semana%2012/seguridad/backend/migrations/001_initial_schema.sql).
3. Ejecuta el script. Esto creará:
   - La extensión criptográfica `pgcrypto`.
   - Las tablas `users`, `notes`, `password_resets` y `security_logs`.
   - Las restricciones `CHECK`, índices y triggers automáticos de `updated_at`.

### Paso 2.3: Configurar Usuario con Privilegios Mínimos (Least Privilege)
Para cumplir con las recomendaciones de seguridad defensiva, la aplicación **no debe** conectarse con el rol de superadministrador (`neondb_owner`). Se debe crear un usuario de servicio exclusivo con permisos estrictamente acotados:

Ejecuta el siguiente script en el **SQL Editor** de Neon:

```sql
-- 1. Crear el usuario de aplicación
CREATE ROLE vault_app_user WITH LOGIN PASSWORD 'GENERA_AQUI_UN_PASSWORD_SEGURO';

-- 2. Conceder conexión a la base de datos
GRANT CONNECT ON DATABASE securevault TO vault_app_user;

-- 3. Conceder uso del esquema público
GRANT USAGE ON SCHEMA public TO vault_app_user;

-- 4. Conceder exclusivamente operaciones DML necesarias sobre las tablas existentes
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO vault_app_user;

-- 5. Conceder uso sobre secuencias (si se creasen)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO vault_app_user;

-- 6. Garantizar que futuras tablas creadas por migraciones otorguen los mismos permisos
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO vault_app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT USAGE, SELECT ON SEQUENCES TO vault_app_user;
```

> [!NOTE]
> La nueva cadena `DATABASE_URL` para Render se construirá con este usuario:  
> `postgresql://vault_app_user:GENERA_AQUI_UN_PASSWORD_SEGURO@ep-xyz-pooler.us-east-2.aws.neon.tech/securevault?sslmode=require`

---

## 3. Paso a Paso: Despliegue en Render (Web Service con HTTPS)

Render alojará la aplicación completa (Frontend compilado servido estáticamente por Express + API Backend con TLS y reverse proxy).

### Paso 3.1: Crear el Web Service en Render
1. Ve a [Render Dashboard](https://dashboard.render.com).
2. Haz clic en **New +** > **Web Service**.
3. Conecta tu repositorio de GitHub que contiene **SecureVault**.
4. Configura los siguientes parámetros exactos:
   - **Name:** `securevault-app` (o el nombre de tu preferencia)
   - **Region:** La misma región elegida en Neon (ej. `Ohio (US East)`)
   - **Branch:** `main`
   - **Root Directory:** *(dejar en blanco, se ejecuta desde la raíz del monorepo)*
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm run build
     ```
     *(Este comando ejecuta el script raíz: `npm ci --prefix frontend && npm run build --prefix frontend && npm ci --prefix backend`, compilando el SPA React y preparando el backend)*
   - **Start Command:**
     ```bash
     npm start
     ```
     *(Ejecuta `node backend/src/server.js`)*
   - **Instance Type:** `Free`

### Paso 3.2: Configurar las Variables de Entorno en Render
En la sección **Environment Variables** de Render, añade los siguientes pares clave-valor:

1. `NODE_ENV` = `production`
2. `DATABASE_URL` = `postgresql://vault_app_user:PASSWORD@ep-xyz-pooler.us-east-2.aws.neon.tech/securevault?sslmode=require`
3. `SESSION_SECRET` = *(tu clave de 64 bytes hex generada previamente)*
4. `DATA_ENCRYPTION_KEY` = *(tu clave de 32 bytes base64 generada previamente)*
5. `CORS_ORIGIN` = `https://securevault-app.onrender.com` *(reemplazar por la URL asignada por Render a tu servicio)*
6. `LOG_LEVEL` = `info`

### Paso 3.3: Configurar Despliegue Continuo con Deploy Hook
1. En el panel de tu Web Service en Render, ve a **Settings** > **Deploy Hook**.
2. Copia la URL del Deploy Hook (formato: `https://api.render.com/deploy/srv-xxxxxx?key=yyyyyy`).
3. En tu repositorio de GitHub, ve a **Settings** > **Secrets and variables** > **Actions**.
4. Crea un nuevo secreto de repositorio llamado:
   - **Nombre:** `RENDER_DEPLOY_HOOK_URL`
   - **Valor:** *(la URL de Deploy Hook copiada de Render)*
5. Con esto, cada vez que el pipeline `.github/workflows/ci-cd.yml` pase exitosamente todas las auditorías de seguridad y pruebas unitarias en `main`, disparará el despliegue automático en Render.

---

## 4. Paso a Paso: Creación del Usuario Administrador Inicial

Para acceder a las funcionalidades de administración (`/admin`, cambio de roles RBAC y consulta de `security_logs`), se debe inicializar al menos un usuario con el rol `admin`.

### Método A: Utilizando el Script Seguro de Seed (Recomendado)
Desde tu terminal local (configurando temporalmente las variables o apuntando a la base de datos de Neon):

```bash
# En Windows PowerShell:
$env:DATABASE_URL = "postgresql://vault_app_user:PASSWORD@ep-xyz.neon.tech/securevault?sslmode=require"
$env:DATA_ENCRYPTION_KEY = "TU_CLAVE_BASE64_DE_32_BYTES=="
$env:SESSION_SECRET = "TU_SESSION_SECRET_HEX_64_BYTES"
node backend/src/utils/create-admin.js admin@securevault.local "AdminVault2026!#" "Administrador Principal" "+52 55 1234 5678"

# En Linux/macOS:
DATABASE_URL="..." DATA_ENCRYPTION_KEY="..." node backend/src/utils/create-admin.js admin@securevault.local "AdminVault2026!#" "Administrador Principal" "+52 55 1234 5678"
```

El script:
1. Valida si el usuario ya existe; si existe, lo eleva a `role = 'admin'`.
2. Computa un hash **Argon2id** de acuerdo con el estándar RFC 9106.
3. Cifra el número telefónico de contacto con **AES-256-GCM** y genera su máscara `***-***-5678`.
4. Persiste el usuario con rol `admin` en PostgreSQL.

---

### Método B: Inserción Directa Vía SQL en Neon
Si prefieres crearlo directamente desde el **SQL Editor** de Neon, puedes registrarte primero normalmente a través de la interfaz web (`/register`) y luego ejecutar:

```sql
-- Elevar al usuario registrado al rol 'admin'
UPDATE users 
SET role = 'admin', updated_at = NOW() 
WHERE email = 'tu_correo_registrado@ejemplo.com';
```

O para verificar el estado de los administradores existentes:

```sql
SELECT id, email, full_name, role, failed_login_attempts, created_at 
FROM users 
WHERE role = 'admin';
```

---

## 5. Verificación de Seguridad Post-Despliegue

Una vez completado el despliegue, verifica los siguientes puntos clave:

1. **Verificación de Health Check (RF-08):**
   ```bash
   curl -i https://securevault-app.onrender.com/health
   ```
   *Respuesta esperada:* `HTTP/1.1 200 OK` con cuerpo `{"status":"ok"}` y sin cabecera `X-Powered-By`.

2. **Verificación de Cabeceras de Seguridad (Helmet):**
   ```bash
   curl -I https://securevault-app.onrender.com/
   ```
   *Deben estar presentes:*
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Content-Security-Policy` restrictiva.

3. **Verificación de Cookie Segura:**
   Al iniciar sesión en `/login`, inspecciona las cookies en las DevTools del navegador:
   - Nombre: `sv_session`
   - Atributos activos: `HttpOnly: true`, `Secure: true`, `SameSite: Strict`.
