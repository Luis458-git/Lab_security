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

  const mailOptions = {
    from: env.SMTP_FROM || '"SecureVault Security" <no-reply@securevault.com>',
    to: toEmail,
    subject: `🔐 Tu Código OTP de Recuperación: ${otpCode} — SecureVault`,
    text: `Tu código de verificación OTP para restablecer tu contraseña en SecureVault es:\n\n${otpCode}\n\nEste código expira en 10 minutos y es de un solo uso.\n\nTambién puedes acceder directamente al enlace seguro:\n${resetUrl}\n\nSi no realizaste esta solicitud, ignora este mensaje.`,
    html: `
      <div style="background-color: #090d16; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; line-height: 1.6;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #064e3b; padding: 12px; border-radius: 12px; border: 1px solid #059669; margin-bottom: 12px;">
              <span style="font-size: 28px;">🛡️</span>
            </div>
            <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">SecureVault</h1>
            <p style="color: #10b981; font-size: 11px; font-family: monospace; letter-spacing: 2px; margin: 4px 0 0 0;">CÓDIGO DE RECUPERACIÓN OTP (NIST SP 800-63B)</p>
          </div>

          <p style="color: #e5e7eb; font-size: 14px;">Hola,</p>
          <p style="color: #9ca3af; font-size: 14px;">
            Recibimos una solicitud para restablecer la contraseña maestra de tu bóveda asociada a <strong>${toEmail}</strong>${maskedPhone ? ` y teléfono registrado <strong>${maskedPhone}</strong>` : ''}.
          </p>

          <div style="background-color: #090d16; border: 2px dashed #10b981; border-radius: 12px; padding: 24px 16px; text-align: center; margin: 26px 0;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0 0 12px 0; text-transform: uppercase; font-family: monospace; letter-spacing: 1.5px;">Tu Código OTP de Seguridad:</p>
            <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #10b981; background-color: #111827; display: inline-block; padding: 10px 24px; border-radius: 8px; border: 1px solid #064e3b;">
              ${otpCode}
            </div>
            <p style="color: #6b7280; font-size: 11px; margin: 12px 0 0 0; font-family: monospace;">Válido durante 10 minutos • Un solo uso</p>
          </div>

          <div style="text-align: center; margin: 24px 0 16px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: #090d16; font-weight: 600; font-size: 13px; text-decoration: none; padding: 10px 24px; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
              Aplicar Código Automáticamente
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #1f2937; margin: 24px 0;" />

          <p style="color: #4b5563; font-size: 11px; text-align: center; margin: 0;">
            Si tú no solicitaste este código, tu cuenta sigue estando protegida. Nadie puede acceder sin tu nueva contraseña.
          </p>
        </div>
      </div>
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
