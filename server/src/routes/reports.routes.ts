import { Router } from 'express';
import { getWeeklyReportHandler } from '../controllers/reports.controller';
import { requireAuth, requireOnboarded } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireOnboarded);

router.get('/weekly', getWeeklyReportHandler);

export default router;
