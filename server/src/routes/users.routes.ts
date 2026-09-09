import { Router } from 'express';
import { getMe, updateMe, updateMeSchema, exportUserData, deleteAccount } from '../controllers/users.controller';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, validateBody(updateMeSchema), updateMe);
router.get('/me/export', requireAuth, exportUserData);
router.delete('/me', requireAuth, deleteAccount);

export default router;
