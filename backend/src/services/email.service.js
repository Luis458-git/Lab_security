import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../config/logger.js';

/**
 * Servicio de Entrega de Correos Electrónicos (RF-06: Recuperación de Contraseña)
 */
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (env.SMTP_USER && env.SMTP_PASS) {
    const cleanUser = env.SMTP_USER.trim();
    const cleanPass = env.SMTP_PASS.replace(/\s+/g, '');

    // Si es Gmail, usar el preset 'gmail' optimizado de nodemailer
    if (cleanUser.endsWith('@gmail.com') || (env.SMTP_HOST && env.SMTP_HOST.includes('gmail'))) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: cleanUser,
          pass: cleanPass
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000
      });
    } else {
      transporter = nodemailer.createTransport({
        host: env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(env.SMTP_PORT) || 587,
        secure: env.SMTP_SECURE === true || env.SMTP_PORT === 465,
        auth: {
          user: cleanUser,
          pass: cleanPass
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000
      });
    }
  }

  return transporter;
};

/**
 * Envía un correo con el token seguro de restablecimiento de contraseña
 * 
 * @param {string} toEmail - Correo del destinatario
 * @param {string} resetToken - Token de 32 bytes en formato hex
 * @returns {Promise<{ delivered: boolean, previewUrl?: string }>}
 */
export const sendPasswordResetEmail = async (toEmail, otpCode, maskedPhone = null) => {
  const resetUrl = `${env.APP_URL || 'https://securevault-adn6.onrender.com'}/forgot-password?otp=${otpCode}&email=${encodeURIComponent(toEmail)}`;

  // Dividir dígitos individuales para renderizar cajas estilo fintech / vault
  const digits = String(otpCode).split('');
  const digitBoxesHtml = digits
    .map(
      (d) =>
        `<span style="display: inline-block; width: 44px; height: 52px; line-height: 52px; text-align: center; background-color: #0d1527; border: 1.5px solid #10b981; color: #34d399; font-size: 26px; font-weight: 800; font-family: 'Courier New', Consolas, monospace; border-radius: 10px; margin: 0 4px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.18);">${d}</span>`
    )
    .join('');

  const mailOptions = {
    from: env.SMTP_FROM || '"SecureVault Security" <no-reply@securevault.com>',
    to: toEmail,
    subject: `🔐 Tu Código de Seguridad OTP: ${otpCode} — SecureVault`,
    text: `Tu código de verificación OTP para restablecer tu contraseña en SecureVault es:\n\n${otpCode}\n\nEste código expira en 10 minutos y es de un solo uso.\n\nTambién puedes acceder directamente al enlace seguro:\n${resetUrl}\n\nSi no realizaste esta solicitud, ignora este mensaje.`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña - SecureVault</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #07090e; padding: 40px 15px;">
          <tr>
            <td align="center">
              
              <!-- Contenedor Principal Bóveda -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.65);">
                
                <!-- Barra superior con gradiente cyber emerald -->
                <tr>
                  <td style="height: 4px; background: linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%);"></td>
                </tr>

                <!-- Encabezado con Icono y Logo -->
                <tr>
                  <td style="padding: 36px 36px 20px 36px; text-align: center;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                      <tr>
                        <td align="center" style="background: radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(15,23,42,0) 70%); padding: 10px;">
                          <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; text-align: center; background-color: #064e3b; border: 1.5px solid #10b981; border-radius: 14px; box-shadow: 0 6px 18px rgba(16, 185, 129, 0.28);">
                            <span style="font-size: 26px;">🛡️</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 14px 0 4px 0;">SecureVault</h1>
                    <div style="display: inline-block; background-color: #064e3b; color: #34d399; font-size: 10px; font-weight: 700; letter-spacing: 1.8px; padding: 3px 10px; border-radius: 20px; border: 1px solid #059669; text-transform: uppercase;">
                      Zero-Trust Authentication
                    </div>
                  </td>
                </tr>

                <!-- Cuerpo del Mensaje -->
                <tr>
                  <td style="padding: 10px 36px 24px 36px; text-align: center;">
                    <h2 style="color: #f8fafc; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">Recuperación de Contraseña Maestra</h2>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
                      Recibimos una solicitud para restablecer las credenciales de tu bóveda asociada a <span style="color: #f1f5f9; font-weight: 600;">${toEmail}</span>${maskedPhone ? ` con verificación telefónica al <span style="color: #f1f5f9; font-weight: 600;">${maskedPhone}</span>` : ''}.
                    </p>
                  </td>
                </tr>

                <!-- Sección Código OTP (Digi-Boxes) -->
                <tr>
                  <td style="padding: 0 36px;">
                    <div style="background-color: #080c14; border: 1px solid #1e293b; border-radius: 14px; padding: 26px 16px; text-align: center;">
                      <p style="color: #64748b; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px 0; font-family: monospace;">
                        Tu Código OTP de Seguridad
                      </p>
                      
                      <!-- Bloques de dígitos numéricos -->
                      <div style="margin: 0 auto; text-align: center;">
                        ${digitBoxesHtml}
                      </div>

                      <p style="color: #94a3b8; font-size: 12px; margin: 18px 0 0 0; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        ⏱️ Válido durante <strong style="color: #10b981;">10 minutos</strong> • Un solo uso
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Botón de Acción Principal -->
                <tr>
                  <td style="padding: 28px 36px 12px 36px; text-align: center;">
                    <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: #022c22; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35); transition: background 0.2s ease;">
                      Ingresar Código Automáticamente →
                    </a>
                    <p style="color: #64748b; font-size: 11px; margin: 12px 0 0 0;">
                      O puedes copiar los 6 dígitos manualmente en la pantalla de restablecimiento.
                    </p>
                  </td>
                </tr>

                <!-- Tarjeta de Aviso de Seguridad / Forense -->
                <tr>
                  <td style="padding: 16px 36px 32px 36px;">
                    <div style="background-color: #0c1322; border-left: 3px solid #10b981; border-radius: 0 8px 8px 0; padding: 12px 14px;">
                      <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0;">
                        🔒 <strong style="color: #cbd5e1;">Aviso de Protección Zero-Trust:</strong> Si tú no solicitaste este código, tu cuenta sigue totalmente segura. Ningún dato de tus notas cifradas ha sido revelado.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Línea Divisoria -->
                <tr>
                  <td style="padding: 0 36px;">
                    <div style="border-top: 1px solid #1e293b;"></div>
                  </td>
                </tr>

                <!-- Footer / Cumplimiento Normativo -->
                <tr>
                  <td style="padding: 24px 36px 30px 36px; text-align: center;">
                    <p style="color: #64748b; font-size: 11px; margin: 0 0 6px 0;">
                      SecureVault — Bóveda Cifrada de Extremo a Extremo
                    </p>
                    <p style="color: #475569; font-size: 10px; margin: 0; font-family: monospace;">
                      Cifrado AES-256-GCM • Hashes Argon2id • Cumplimiento NIST SP 800-63B & OWASP A07
                    </p>
                  </td>
                </tr>

              </table>
              <!-- Fin Contenedor Principal -->

            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  const client = getTransporter();

  if (client) {
    try {
      const info = await client.sendMail(mailOptions);
      logger.info({ to: toEmail, messageId: info.messageId }, 'Correo de recuperación de contraseña enviado exitosamente vía SMTP');
      return { delivered: true };
    } catch (err) {
      logger.error({ err: err.message, to: toEmail }, 'Fallo al despachar correo de recuperación por SMTP');
      return { delivered: false, error: err.message };
    }
  } else {
    logger.warn(
      { to: toEmail, resetUrl, otpCode },
      '⚠️ SMTP no configurado: el código OTP y enlace fueron generados y emitidos en consola'
    );
    return { delivered: false, simulated: true };
  }
};

export default {
  sendPasswordResetEmail
};
