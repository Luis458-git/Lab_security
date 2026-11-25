import { z } from 'zod';

/**
 * Esquema para creación de notas con límites estrictos de negocio (OWASP A06:2025)
 * - Título: 1 a 150 caracteres
 * - Contenido: 1 a 2000 caracteres (regla de cuota máxima de negocio)
 */
export const createNoteSchema = z.object({
  title: z
    .string({ required_error: 'El título de la nota es requerido' })
    .min(1, 'El título no puede estar vacío')
    .max(150, 'El título no puede superar los 150 caracteres')
    .trim(),
  content: z
    .string({ required_error: 'El contenido de la nota es requerido' })
    .min(1, 'El contenido no puede estar vacío')
    .max(2000, 'El contenido no puede superar los 2000 caracteres (límite de negocio por nota)')
    .trim()
});

export const updateNoteSchema = z
  .object({
    title: z
      .string()
      .min(1, 'El título no puede estar vacío')
      .max(150, 'El título no puede superar los 150 caracteres')
      .trim()
      .optional(),
    content: z
      .string()
      .min(1, 'El contenido no puede estar vacío')
      .max(2000, 'El contenido no puede superar los 2000 caracteres (límite de negocio por nota)')
      .trim()
      .optional()
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: 'Debe proporcionar al menos un campo para actualizar (título o contenido)'
  });

export const noteIdParamSchema = z.object({
  id: z.string().uuid('El ID de la nota debe ser un UUID válido')
});

export default {
  createNoteSchema,
  updateNoteSchema,
  noteIdParamSchema
};
