# ✅ Checklist de Verificación y Auditoría — Proyecto SecureVault

Guía de autocomprobación previa a la entrega del laboratorio **Sistema Seguro en Node.js (OWASP Top 10:2025, Cifrado y Despliegue)**.

---

## 1. Checklist Obligatorio de Entrega (Sección 10 de la Guía)

Verifica que cada punto se cumpla al 100 % antes de enviar el repositorio y la URL al docente:

- [x] **Historial Git limpio:** El archivo `.env` no aparece en ningún commit del historial (`git log --all --full-history -- "**/.env"` devuelve 0 resultados). Solo se versiona `backend/.env.example`.
- [x] **Auditoría de dependencias limpia:** `npm audit --audit-level=high` (en `backend` y `frontend`) implementado en el pipeline CI/CD (`.github/workflows/ci-cd.yml`), bloqueando vulnerabilidades altas o críticas.
- [x] **Aislamiento de datos (Anti-IDOR):** Un usuario no puede ver, editar ni borrar notas de otro usuario (`WHERE id = $1 AND owner_id = $2` en `backend/src/services/notes.service.js`). Los intentos no autorizados registran `IDOR_ATTEMPT` con severidad `CRITICAL` en `security_logs` y responden `404` para evitar la enumeración de recursos.
- [x] **Hash seguro de contraseñas:** Las contraseñas almacenadas en PostgreSQL comienzan con `$argon2id$` (manejado por `argon2id` con memoria de 19 MiB en `backend/src/security/hash.security.js` bajo RFC 9106).
- [x] **Cifrado autenticado en BD:** El contenido de las notas y el teléfono en la BD son ilegibles mediante cifrado simétrico autenticado **AES-256-GCM** con IV único de 12 bytes CSPRNG y `authTag` de 16 bytes (`backend/src/security/crypto.security.js`).
- [x] **HTTPS y cookies endurecidas:** La app en producción fuerza HTTPS (Render), y las cookies de sesión (`sv_session`) tienen las banderas `HttpOnly: true`, `Secure: true` y `SameSite: 'strict'` con firma criptográfica en `backend/src/controllers/auth.controller.js`.
- [x] **Manejo seguro de errores:** `backend/src/middlewares/error.middleware.js` captura excepciones globales, registrándolas internamente con Pino y devolviendo mensajes genéricos al cliente sin *stack traces*.
- [x] **Protección contra fuerza bruta:** El endpoint `/api/v1/auth/login` devuelve código HTTP `429 Too Many Requests` tras 5 intentos fallidos (`backend/src/security/rateLimit.security.js`), y la cuenta se bloquea por 15 minutos en la BD tras 5 fallos consecutivos (`locked_until`). El frontend muestra un banner dedicado de bloqueo.
- [x] **Logs sanitizados:** Logger estructurado Pino (`backend/src/config/logger.js`) configurado con `redact` estricto en contraseñas, tokens, headers de autorización y payloads cifrados. La tabla `security_logs` almacena solo metadatos sanitizados.
- [x] **Despliegue reproducible:** El `README.md` y `docs/FASE3_GUIA_DESPLIEGUE.md` detallan paso a paso la instalación, scripts de monorepo, configuración de mínimos privilegios en Neon y variables de entorno sin valores reales.

---

## 2. Verificación de Requisitos Funcionales (RF-01 a RF-08)

| Código | Requisito | Criterio de Aceptación | Estado | Archivo / Implementación |
| :--- | :--- | :--- | :---: | :--- |
| **RF-01** | Registro de usuario | Valida correo, nombre y política de contraseña fuerte (mín. 12 caracteres, mayúscula, minúscula, número y símbolo); guarda hash Argon2id. | [x] | `schemas/auth.schema.js`, `PasswordStrength.jsx`, `auth.service.js` |
| **RF-02** | Inicio y cierre de sesión | Emite cookie firmada `HttpOnly`/`Secure`/`SameSite=Strict` (`sv_session`) y el logout la invalida inmediatamente. | [x] | `auth.controller.js`, `auth.middleware.js`, `AuthContext.jsx` |
| **RF-03** | Roles (`user` / `admin`) | El rol se valida siempre en el middleware del servidor (`role.middleware.js` con `requireRole('admin')`), nunca solo en React. | [x] | `role.middleware.js`, `admin.routes.js`, `ProtectedRoute.jsx` |
| **RF-04** | CRUD de notas privadas | Crear, leer, editar y eliminar solo notas propias cifradas con AES-256-GCM. Límite de negocio de 20 notas activas. | [x] | `notes.service.js`, `notes.controller.js`, `VaultPage.jsx`, `QuotaBar.jsx` |
| **RF-05** | Dato sensible de perfil | Teléfono/documento guardado cifrado y mostrado enmascarado (`***-***-1234`), con botón de ojo para revelar auditado en `security_logs`. | [x] | `profile.service.js`, `profile.controller.js`, `ProfilePage.jsx` |
| **RF-06** | Recuperación de contraseña | Token aleatorio de 32 bytes (`crypto.randomBytes(32)`), un solo uso, expiración en 15 min y guardado como hash SHA-256 en BD. | [x] | `hash.security.js`, `auth.service.js`, `ForgotPasswordPage.jsx` |
| **RF-07** | Panel de administración | Lista de usuarios con selector dinámico de rol y bitácora de eventos forenses (`security_logs`) con filtros rápidos por tipo de evento. | [x] | `admin.service.js`, `admin.controller.js`, `AdminPage.jsx` |
| **RF-08** | Endpoint de salud | `GET /health` responde estrictamente `{ "status": "ok" }` sin exponer versiones ni cabecera `X-Powered-By`. | [x] | `index.routes.js`, `Footer.jsx` |

---

## 3. Auditoría OWASP Top 10:2025 (Evidencias para el Informe)

- [x] **A01 Broken Access Control (incluye SSRF):** Aislamiento estricto de notas con `WHERE id = $1 AND owner_id = $2`. Rutas administrativas protegidas por `requireRole('admin')` en servidor. Intentos denegados registrados como `ACCESS_DENIED` e `IDOR_ATTEMPT`.
- [x] **A02 Security Misconfiguration:** Helmet configurado con CSP estricta (`frame-ancestors 'none'`, `default-src 'self'`), supresión de `X-Powered-By`, HSTS por 1 año y CORS restringido con credenciales. Calificación A/A+ en [securityheaders.com](https://securityheaders.com).
- [x] **A03 Software Supply Chain Failures:** `package-lock.json` gestionado deterministamente en CI/CD con `npm ci` y análisis automático de vulnerabilidades con `npm audit --audit-level=high`.
- [x] **A04 Cryptographic Failures:** Implementación de Argon2id (19 MiB, 2 iteraciones) y AES-256-GCM con IV único de 12 bytes y AuthTag de 16 bytes. Suite de pruebas automatizadas aprobada al 100 % (`backend/tests/security.test.js`).
- [x] **A05 Injection (incluye XSS):** Consultas SQL 100 % parametrizadas (`$1, $2`) con `pg`, cero uso de `dangerouslySetInnerHTML` en React (renderizado seguro en texto plano de notas con `<script>` sin ejecución).
- [x] **A06 Insecure Design:** Documento completo de modelado de amenazas en `docs/FASE1_DISENO_Y_AMENAZAS.md` (DFD y matriz STRIDE). Límites de negocio estrictos: máximo 20 notas por usuario, máximo 2000 caracteres por nota, payload JSON limitado a 16 KB.
- [x] **A07 Authentication Failures:** Rate limiter activo en `/api/v1/auth/login` (5 peticiones/15 min con respuesta HTTP 429) y bloqueo progresivo temporal en BD tras 5 fallos consecutivos (`locked_until`).
- [x] **A08 Software or Data Integrity Failures:** Verificación criptográfica de integridad mediante `authTag` en descifrado GCM (falla si se altera 1 solo bit) y pipeline de CI/CD en `.github/workflows/ci-cd.yml` que valida código y tests antes de desplegar.
- [x] **A09 Security Logging and Alerting Failures:** Logs estructurados en JSON con Pino con redacción automática (`[REDACTED]`) de credenciales y tabla inmutable `security_logs` con visor en tiempo real en el panel de administración.
- [x] **A10 Mishandling of Exceptional Conditions:** Manejador global `error.middleware.js` sin fuga de stack traces, y `statement_timeout: 5000` configurado en el pool de conexiones de PostgreSQL en Neon contra ataques Slowloris.

---

## 4. Entregables Finales y Rúbrica (100 pts + 10 Extra)

- [x] **Arquitectura y Modelado de Amenazas (Fase 1):** Documentado en `docs/FASE1_DISENO_Y_AMENAZAS.md` con modelo de datos, diagramas Mermaid ER y de secuencia, DFD y matriz STRIDE completa.
- [x] **Funcionalidad en Producción (Fase 2):** Todos los requisitos RF-01 a RF-08 implementados en backend y frontend (React 19 + Vite + Lucide).
- [x] **Hash y Cifrado Seguro:** Algoritmos Argon2id, AES-256-GCM y SHA-256 integrados, con script CLI de generación de admin y claves documentadas en `docs/FASE3_GUIA_DESPLIEGUE.md`.
- [x] **Despliegue a Producción (Fase 3):** Web Service en Render con mono-servicio (`frontend/dist` servido por Express), PostgreSQL Serverless en Neon con TLS forzado y pipeline de CI/CD automatizado con deploy hook.
- [x] **Escaneo DAST Automatizado:** Workflow en `.github/workflows/security-scan.yml` configurado para ejecutar el contenedor oficial de OWASP ZAP (`ghcr.io/zaproxy/zaproxy:stable`) en la nube con un solo clic.
- [x] **Credenciales de prueba seguras:** Procedimiento de inicialización seguro documentado en `docs/FASE3_GUIA_DESPLIEGUE.md` mediante el script `node backend/src/utils/create-admin.js` para envío privado al docente (sin credenciales hardcodeadas en Git).
