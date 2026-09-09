import { Router } from 'express';
import {
  listExperimentsHandler,
  getExperimentHandler,
  createExperimentHandler,
  startExperimentHandler,
  cancelExperimentHandler,
  completeExperimentHandler,
  createExperimentSchema,
} from '../controllers/experiments.controller';
import { validateBody } from '../middleware/validate';
import { requireAuth, requireOnboarded } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireOnboarded);

router.get('/', listExperimentsHandler);
router.get('/:id', getExperimentHandler);
router.post('/', validateBody(createExperimentSchema), createExperimentHandler);
router.post('/:id/start', startExperimentHandler);
router.post('/:id/cancel', cancelExperimentHandler);
router.post('/:id/complete', completeExperimentHandler);

export default router;
