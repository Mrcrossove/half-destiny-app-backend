import { Response } from 'express';
import { getBaziPlaceholder } from '../services/content/baziService';
import { getRecommendationsForUser } from '../services/content/recommendationService';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function getRecommendations(req: AuthenticatedRequest, res: Response) {
  const userId = String(req.user?.id || '').trim();
  const items = await getRecommendationsForUser(userId);
  return res.json({ success: true, data: items });
}

export async function getPersonalReport(_req: AuthenticatedRequest, res: Response) {
  return res.json({ success: true, data: await getBaziPlaceholder('personal') });
}

export async function getCompatibilityReport(_req: AuthenticatedRequest, res: Response) {
  return res.json({ success: true, data: await getBaziPlaceholder('compatibility') });
}

export async function getDayunReport(_req: AuthenticatedRequest, res: Response) {
  return res.json({ success: true, data: await getBaziPlaceholder('dayun') });
}

export async function getLiunianReport(_req: AuthenticatedRequest, res: Response) {
  return res.json({ success: true, data: await getBaziPlaceholder('liunian') });
}
