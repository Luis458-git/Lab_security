import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(150, 'El nombre no puede exceder 150 caracteres')
      .trim()
      .optional(),
    phone: z
      .string()
      .min(7, 'El teléfono debe tener al menos 7 dígitos')
      .max(20, 'El teléfono no puede exceder 20 caracteres')
      .regex(/^[+0-9\s\-()]+$/, 'Formato de teléfono inválido')
      .optional()
      .nullable()
  })
  .refine((data) => data.fullName !== undefined || data.phone !== undefined, {
    message: 'Debe proporcionar al menos un campo para actualizar (nombre o teléfono)'
  });

export default {
  updateProfileSchema
};
