import { Router } from 'express';
import * as feedbackController from '../controllers/feedbackController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, feedbackController.submitFeedback);

export default router;
