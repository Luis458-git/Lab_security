import { Router } from 'express';
import adminController from '../controllers/admin.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// Todas las rutas de administración exigen autenticación y rol 'admin' verificado en servidor
router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/users', adminController.getUsers);
router.patch('/users/:userId/role', adminController.changeRole);
router.get('/logs', adminController.getSecurityLogs);

export default router;
