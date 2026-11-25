import { Router } from 'express';
import profileController from '../controllers/profile.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { updateProfileSchema } from '../schemas/profile.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/', profileController.getProfile);
router.post('/reveal-phone', profileController.revealPhone);
router.put('/', validateBody(updateProfileSchema), profileController.updateProfile);

export default router;
