# ✅ Checklist de Verificación y Auditoría — Proyecto SecureVault

Guía de autocomprobación previa a la entrega del laboratorio **Sistema Seguro en Node.js (OWASP Top 10:2025, Cifrado y Despliegue)**[cite: 1].

---

## 1. Checklist Obligatorio de Entrega (Sección 10 de la Guía)

Verifica que cada punto se cumpla al 100 % antes de enviar el repositorio y la URL al docente[cite: 9]:

- [ ] **Historial Git limpio:** El archivo `.env` no aparece en ningún commit del historial (`git log --all --full-history -- "**/.env"`)[cite: 9].
- [ ] **Auditoría de dependencias limpia:** `npm audit` (en `backend` y `frontend`) no reporta vulnerabilidades altas ni críticas[cite: 10].
- [ ] **Aislamiento de datos (Anti-IDOR):** Un usuario no puede ver, editar ni borrar notas de otro usuario (`WHERE id = $1 AND owner_id = $2` devuelve `404`/`403`)[cite: 3, 10].
- [ ] **Hash seguro de contraseñas:** Las contraseñas almacenadas en PostgreSQL comienzan con `$argon2id$` (o `$2b$`)[cite: 10].
- [ ] **Cifrado autenticado en BD:** El contenido de las notas y el teléfono sensible en la BD son ilegibles (formato base64 `iv.tag.ciphertext` con IV único de 12 bytes)[cite: 4, 5, 10].
- [ ] **HTTPS y cookies endurecidas:** La app en producción responde solo por HTTPS (HTTP redirige a HTTPS) y las cookies de sesión tienen las banderas `HttpOnly`, `Secure` y `SameSite`[cite: 6, 10].
- [ ] **Manejo seguro de errores:** Los errores (ej. JSON malformado o fallo interno) muestran un mensaje genérico al cliente; el *stack trace* queda solo en los logs internos[cite: 4, 10].
- [ ] **Protección contra fuerza bruta:** El login devuelve código HTTP `429 Too Many Requests` después de varios intentos fallidos[cite: 4, 10].
- [ ] **Logs sanitizados:** Los logs JSON (Pino) y la bitácora del panel admin no contienen contraseñas, tokens ni datos cifrados en texto plano[cite: 4, 10].
- [ ] **Despliegue reproducible:** El `README.md` explica los pasos de instalación y despliegue, e incluye los nombres (sin valores) de las variables de entorno requeridas[cite: 6, 9, 10].

---

## 2. Verificación de Requisitos Funcionales (RF-01 a RF-08)[cite: 2]

| Código | Requisito | Criterio de Aceptación | Estado |
| :--- | :--- | :--- | :---: |
| **RF-01** | Registro de usuario | Valida correo, nombre y política de contraseña fuerte; guarda hash Argon2id[cite: 2, 4]. | [ ] |
| **RF-02** | Inicio y cierre de sesión | Emite cookie `HttpOnly`/`Secure`/`SameSite` (o JWT corto) y el logout la invalida[cite: 2]. | [ ] |
| **RF-03** | Roles (`user` / `admin`) | El rol se valida siempre en el middleware del servidor, nunca solo en React[cite: 2]. | [ ] |
| **RF-04** | CRUD de notas privadas | Crear, leer, editar y eliminar solo notas propias cifradas con AES-256-GCM[cite: 2, 4]. | [ ] |
| **RF-05** | Dato sensible de perfil | Teléfono/documento guardado cifrado y mostrado enmascarado (`***-***-1234`)[cite: 2]. | [ ] |
| **RF-06** | Recuperación de contraseña | Token aleatorio (`crypto.randomBytes(32)`), un solo uso, con expiración y guardado como hash SHA-256[cite: 2, 4]. | [ ] |
| **RF-07** | Panel de administración | Lista de usuarios (con cambio de rol) y bitácora de eventos de seguridad[cite: 2]. | [ ] |
| **RF-08** | Endpoint de salud | `GET /health` responde `{ "status": "ok" }` sin exponer versiones ni datos internos[cite: 2]. | [ ] |

---

## 3. Auditoría OWASP Top 10:2025 (Evidencias para el Informe)[cite: 3]

- [ ] **A01 Broken Access Control (incluye SSRF):** Captura/prueba de que Usuario A no accede a notas de Usuario B (`404`/`403`) ni a `/api/v1/admin/*`[cite: 3].
- [ ] **A02 Security Misconfiguration:** Reporte de [securityheaders.com](https://securityheaders.com) con **calificación A o superior** (`Helmet` + CSP + sin `X-Powered-By`)[cite: 3].
- [ ] **A03 Software Supply Chain Failures:** `package-lock.json` subido a GitHub, `npm ci` en CI/CD y salida limpia de `npm audit`[cite: 3].
- [ ] **A04 Cryptographic Failures:** Captura de tablas en Neon mostrando `$argon2id$` y `iv.tag.data` + reporte de [Qualys SSL Labs](https://www.ssllabs.com/ssltest/)[cite: 3, 4].
- [ ] **A05 Injection (incluye XSS):** Prueba de inyección `' OR 1=1 --` rechazada y nota con `<script>alert(1)</script>` renderizada como texto plano[cite: 3].
- [ ] **A06 Insecure Design:** Diagrama de flujo de datos, tabla de amenazas STRIDE y límites de negocio activos (máx. 20 notas / 2000 caracteres)[cite: 4].
- [ ] **A07 Authentication Failures:** Captura del bloqueo `HTTP 429` al intentar fuerza bruta en `/api/v1/auth/login`[cite: 4].
- [ ] **A08 Software or Data Integrity Failures:** Archivo `.github/workflows/ci-cd.yml` ejecutando auditoría/pruebas antes del deploy y verificación de `authTag` en GCM[cite: 4].
- [ ] **A09 Security Logging and Alerting Failures:** Muestra de logs estructurados en JSON y captura de la bitácora en el panel Admin[cite: 4].
- [ ] **A10 Mishandling of Exceptional Conditions:** Prueba forzando un error (ej. payload malformado) devolviendo mensaje genérico sin detalles internos[cite: 4].

---

## 4. Entregables Finales y Rúbrica (100 pts + 10 Extra)[cite: 9]

- [ ] **Fase 0 — Deep Research (10 pts):** Documento de 2 a 4 páginas con las 10 preguntas, tabla comparativa de 3 plataformas y mínimo 6 fuentes citadas[cite: 7, 9].
- [ ] **Funcionalidad en Producción (10 pts):** Todos los requisitos RF-01 a RF-08 operando en la URL pública[cite: 9].
- [ ] **OWASP Top 10:2025 (30 pts):** Las 10 categorías documentadas con mitigación y evidencia verificable[cite: 9].
- [ ] **Hash y Cifrado (20 pts):** Algoritmos correctos, llaves en gestor de secretos de Render y análisis de pérdida/rotación de llaves incluido en el informe[cite: 5, 9].
- [ ] **Despliegue a Producción (20 pts):** HTTPS activo, `trust proxy` configurado, BD protegida en Neon, CI/CD y reinicio automático[cite: 6, 9].
- [ ] **Informe y Demostración (10 pts):** Informe final con riesgos residuales + demo en vivo (o video) de 10 minutos mostrando al menos 3 ataques bloqueados[cite: 9].
- [ ] **Credenciales de prueba:** Usuario normal y usuario administrador enviados al docente por canal privado (nunca en el `README.md`)[cite: 6].
- [ ] *(Opcional)* **Bonificación (+10 pts):** MFA con TOTP, versionado de llaves para rotación, Docker con usuario no-root, `gitleaks` en CI o alertas externas[cite: 9].