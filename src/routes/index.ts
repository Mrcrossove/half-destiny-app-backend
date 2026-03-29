import { Router } from 'express';
import authRoutes from './auth.routes';
import billingRoutes from './billing.routes';
import contentRoutes from './content.routes';
import feedbackRoutes from './feedback.routes';
import legalRoutes from './legal.routes';
import safetyRoutes from './safety.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/billing', billingRoutes);
router.use('/content', contentRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/legal', legalRoutes);
router.use('/safety', safetyRoutes);
router.use('/user', userRoutes);

export default router;
