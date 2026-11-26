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
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(env.SMTP_PORT) || 587,
      secure: env.SMTP_SECURE === true || env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });
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
export const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetUrl = `${env.APP_URL || 'https://securevault-adn6.onrender.com'}/forgot-password?token=${resetToken}`;

  const mailOptions = {
    from: env.SMTP_FROM || '"SecureVault Security" <no-reply@securevault.com>',
    to: toEmail,
    subject: '🔐 SecureVault: Restablecimiento de Contraseña Maestra',
    text: `Has solicitado restablecer tu contraseña en SecureVault.\n\nPara completar el proceso, ingresa al siguiente enlace seguro (expira en 15 minutos):\n${resetUrl}\n\nO utiliza directamente tu Token de Seguridad:\n${resetToken}\n\nSi no realizaste esta solicitud, puedes ignorar este mensaje de forma segura.`,
    html: `
      <div style="background-color: #090d16; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; line-height: 1.6;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #064e3b; padding: 12px; border-radius: 12px; border: 1px solid #059669; margin-bottom: 12px;">
              <span style="font-size: 28px;">🔐</span>
            </div>
            <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">SecureVault</h1>
            <p style="color: #10b981; font-size: 12px; font-family: monospace; margin: 4px 0 0 0;">RESTAURACIÓN DE ACCESO SEGURO</p>
          </div>

          <p style="color: #e5e7eb; font-size: 15px;">Hola,</p>
          <p style="color: #9ca3af; font-size: 14px;">
            Recibimos una solicitud para restablecer la contraseña maestra asociada a tu cuenta en <strong>${toEmail}</strong>.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: #090d16; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
              Restablecer mi Contraseña
            </a>
          </div>

          <div style="background-color: #090d16; border: 1px solid #1f2937; border-radius: 8px; padding: 16px; margin-top: 24px;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0 0 8px 0; text-transform: uppercase; font-family: monospace;">Token de Seguridad Manual:</p>
            <p style="font-family: monospace; font-size: 12px; color: #34d399; word-break: break-all; margin: 0; background-color: #1f2937; padding: 8px 12px; border-radius: 6px;">
              ${resetToken}
            </p>
          </div>

          <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
            ⏳ Por tu seguridad, este enlace y token expirarán estrictamente en <strong>15 minutos</strong> y solo pueden utilizarse una única vez.
          </p>

          <hr style="border: none; border-top: 1px solid #1f2937; margin: 24px 0;" />

          <p style="color: #4b5563; font-size: 11px; text-align: center; margin: 0;">
            Si tú no solicitaste este cambio, ignora este correo. Ninguna persona puede acceder a tu bóveda sin tu nueva contraseña.
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
      { to: toEmail, resetUrl, resetToken },
      '⚠️ SMTP no configurado: el enlace de restablecimiento fue generado y emitido en consola'
    );
    return { delivered: false, simulated: true };
  }
};

export default {
  sendPasswordResetEmail
};
