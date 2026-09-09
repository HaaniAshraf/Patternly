import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import onboardingRoutes from './onboarding.routes';
import entriesRoutes from './entries.routes';
import patternsRoutes from './patterns.routes';
import experimentsRoutes from './experiments.routes';
import insightsRoutes from './insights.routes';
import reportsRoutes from './reports.routes';
import billingRoutes from './billing.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/entries', entriesRoutes);
router.use('/patterns', patternsRoutes);
router.use('/experiments', experimentsRoutes);
router.use('/insights', insightsRoutes);
router.use('/reports', reportsRoutes);
router.use('/billing', billingRoutes);

export default router;
