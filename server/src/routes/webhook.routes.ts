import { Router, raw } from 'express';
import { webhookHandler } from '../controllers/billing.controller';

const router = Router();

// Raw body is required to verify the Razorpay HMAC signature, so this route must
// be mounted before the app's global express.json() body parser.
router.post('/webhook', raw({ type: '*/*' }), webhookHandler);

export default router;
