import { Router } from 'express';
import { listPatterns, getPattern, analyzePatterns, dismissPattern } from '../controllers/patterns.controller';
import { requireAuth, requireOnboarded } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireOnboarded);

router.get('/', listPatterns);
router.get('/:id', getPattern);
router.post('/analyze', analyzePatterns);
router.post('/:id/dismiss', dismissPattern);

export default router;
