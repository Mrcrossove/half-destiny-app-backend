import { Request, Router } from 'express';
import multer from 'multer';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error('Only jpeg, png, webp, heic, and heif images are allowed'));
      return;
    }
    callback(null, true);
  }
});

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.post('/photos', authenticate, upload.single('file'), userController.uploadPhoto);
router.put('/photos', authenticate, userController.replacePhotos);
router.post('/account/deletion-request', authenticate, userController.requestAccountDeletion);
router.get('/account/deletion-status', authenticate, userController.getAccountDeletionStatus);
router.post('/account/deletion-cancel', authenticate, userController.cancelAccountDeletion);

export default router;
