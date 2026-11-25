import { z } from 'zod';

/**
 * Política robusta de contraseñas (NIST SP 800-63B / OWASP A07:2025):
 * - Mínimo 12 caracteres
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 * - Al menos un número
 * - Al menos un símbolo o carácter especial
 */
const passwordValidation = z
  .string()
  .min(12, 'La contraseña debe tener al menos 12 caracteres')
  .max(128, 'La contraseña no puede exceder 128 caracteres')
  .refine((val) => /[A-Z]/.test(val), {
    message: 'La contraseña debe incluir al menos una letra mayúscula'
  })
  .refine((val) => /[a-z]/.test(val), {
    message: 'La contraseña debe incluir al menos una letra minúscula'
  })
  .refine((val) => /[0-9]/.test(val), {
    message: 'La contraseña debe incluir al menos un número'
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: 'La contraseña debe incluir al menos un carácter especial (@$!%*#?&-_)'
  });

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es requerido' })
    .email('Formato de correo electrónico inválido')
    .max(255, 'El correo no puede superar los 255 caracteres')
    .transform((val) => val.toLowerCase().trim()),
  fullName: z
    .string({ required_error: 'El nombre completo es requerido' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .trim(),
  password: passwordValidation,
  phone: z
    .string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .regex(/^[+0-9\s\-()]+$/, 'Formato de teléfono inválido')
    .optional()
    .nullable()
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es requerido' })
    .email('Formato de correo electrónico inválido')
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(1, 'La contraseña es requerida')
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es requerido' })
    .email('Formato de correo electrónico inválido')
    .transform((val) => val.toLowerCase().trim())
});

export const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: 'El token de recuperación es requerido' })
    .length(64, 'El token debe tener exactamente 64 caracteres hexadecimales')
    .regex(/^[0-9a-fA-F]{64}$/, 'Formato de token hexadecimal inválido'),
  newPassword: passwordValidation
});

export default {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
