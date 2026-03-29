import { Response } from 'express';
import { PRODUCTS } from '../utils/products';
import { listEntitlements } from '../services/billing/entitlementService';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function getProducts(_req: AuthenticatedRequest, res: Response) {
  return res.json({ success: true, data: PRODUCTS });
}

export async function verifyApplePurchase(req: AuthenticatedRequest, res: Response) {
  return res.status(501).json({
    success: false,
    code: 'NOT_IMPLEMENTED',
    message: 'Apple purchase verification is not implemented yet',
    draft_request: req.body
  });
}

export async function verifyGooglePurchase(req: AuthenticatedRequest, res: Response) {
  return res.status(501).json({
    success: false,
    code: 'NOT_IMPLEMENTED',
    message: 'Google purchase verification is not implemented yet',
    draft_request: req.body
  });
}

export async function restorePurchases(req: AuthenticatedRequest, res: Response) {
  return res.status(501).json({
    success: false,
    code: 'NOT_IMPLEMENTED',
    message: 'Purchase restore is not implemented yet',
    draft_request: req.body
  });
}

export async function getMyEntitlements(req: AuthenticatedRequest, res: Response) {
  const userId = String(req.user?.id || '').trim();
  const items = await listEntitlements(userId);
  return res.json({
    success: true,
    data: {
      vip_active: items.some((item) => item.product_key === 'vip_monthly' || item.product_key === 'vip_yearly'),
      products: items
    }
  });
}
