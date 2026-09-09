import { Router } from 'express';
import { listInsights, getInsight } from '../controllers/insights.controller';
import { requireAuth, requireOnboarded } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireOnboarded);

router.get('/', listInsights);
router.get('/:id', getInsight);

export default router;
