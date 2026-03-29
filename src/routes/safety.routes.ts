import { Router } from 'express';
import * as safetyController from '../controllers/safetyController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/report', authenticate, safetyController.reportUser);
router.post('/block/:targetId', authenticate, safetyController.blockUser);
router.delete('/block/:targetId', authenticate, safetyController.unblockUser);
router.get('/blocks', authenticate, safetyController.getBlocks);

export default router;
