import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.post('/photos', authenticate, userController.uploadPhoto);
router.put('/photos', authenticate, userController.replacePhotos);
router.post('/account/deletion-request', authenticate, userController.requestAccountDeletion);
router.get('/account/deletion-status', authenticate, userController.getAccountDeletionStatus);
router.post('/account/deletion-cancel', authenticate, userController.cancelAccountDeletion);

export default router;
