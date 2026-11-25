import { Router } from 'express';
import notesController from '../controllers/notes.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody, validateParams } from '../middlewares/validate.middleware.js';
import { createNoteSchema, updateNoteSchema, noteIdParamSchema } from '../schemas/notes.schema.js';

const router = Router();

// Todas las rutas de notas requieren autenticación previa
router.use(requireAuth);

router.get('/', notesController.getNotes);

router.get(
  '/:id',
  validateParams(noteIdParamSchema),
  notesController.getNote
);

router.post(
  '/',
  validateBody(createNoteSchema),
  notesController.createNote
);

router.put(
  '/:id',
  validateParams(noteIdParamSchema),
  validateBody(updateNoteSchema),
  notesController.updateNote
);

router.delete(
  '/:id',
  validateParams(noteIdParamSchema),
  notesController.deleteNote
);

export default router;
