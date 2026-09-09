import { Router } from 'express';
import { completeOnboarding, onboardingSchema } from '../controllers/onboarding.controller';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, validateBody(onboardingSchema), completeOnboarding);

export default router;
