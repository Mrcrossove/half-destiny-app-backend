import { Router } from 'express';
import * as billingController from '../controllers/billingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/products', billingController.getProducts);
router.post('/apple/verify', authenticate, billingController.verifyApplePurchase);
router.post('/google/verify', authenticate, billingController.verifyGooglePurchase);
router.post('/restore', authenticate, billingController.restorePurchases);
router.get('/entitlements/me', authenticate, billingController.getMyEntitlements);

export default router;
