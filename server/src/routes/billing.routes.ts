import { Router } from 'express';
import {
  getBillingStatusHandler,
  createSubscriptionHandler,
  cancelSubscriptionHandler,
  createSubscriptionSchema,
} from '../controllers/billing.controller';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/status', requireAuth, getBillingStatusHandler);
router.post('/create-subscription', requireAuth, validateBody(createSubscriptionSchema), createSubscriptionHandler);
router.post('/cancel', requireAuth, cancelSubscriptionHandler);

export default router;
