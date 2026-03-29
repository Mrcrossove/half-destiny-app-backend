import { Router } from 'express';
import * as contentController from '../controllers/contentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/recommendations', authenticate, contentController.getRecommendations);
router.post('/bazi/personal', authenticate, contentController.getPersonalReport);
router.post('/bazi/compatibility', authenticate, contentController.getCompatibilityReport);
router.post('/bazi/dayun', authenticate, contentController.getDayunReport);
router.post('/bazi/liunian', authenticate, contentController.getLiunianReport);

export default router;
