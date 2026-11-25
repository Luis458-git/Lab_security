import { Router } from 'express';
import authRoutes from './auth.routes.js';
import notesRoutes from './notes.routes.js';
import profileRoutes from './profile.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Endpoint de monitoreo de salud (RF-08)
// Retorna estrictamente { status: 'ok' } sin revelar versiones ni tecnologías del servidor
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Enrutador de la API v1
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/notes', notesRoutes);
router.use('/api/v1/profile', profileRoutes);
router.use('/api/v1/admin', adminRoutes);

export default router;
