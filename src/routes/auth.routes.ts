import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/email/register', authController.registerWithEmail);
router.post('/email/login', authController.loginWithEmail);
router.post('/email/forgot-password', authController.forgotPassword);
router.post('/email/reset-password', authController.resetPassword);
router.post('/apple/login', authController.loginWithApple);
router.post('/google/login', authController.loginWithGoogle);
router.post('/session/refresh', authController.refreshSession);
router.post('/session/logout', authController.logout);
router.get('/session/me', authenticate, authController.getCurrentSession);

export default router;
