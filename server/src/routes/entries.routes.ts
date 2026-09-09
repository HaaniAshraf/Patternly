import { Router } from 'express';
import {
  listEntries,
  getTodayEntry,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  createEntrySchema,
  updateEntrySchema,
} from '../controllers/entries.controller';
import { validateBody } from '../middleware/validate';
import { requireAuth, requireOnboarded } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireOnboarded);

router.get('/', listEntries);
router.get('/today', getTodayEntry);
router.get('/:id', getEntry);
router.post('/', validateBody(createEntrySchema), createEntry);
router.put('/:id', validateBody(updateEntrySchema), updateEntry);
router.delete('/:id', deleteEntry);

export default router;
