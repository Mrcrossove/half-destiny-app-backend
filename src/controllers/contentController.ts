import { Response } from 'express';
import { getRecommendationsForUser } from '../services/content/recommendationService';
import {
  getCompatibilityMetaphysics,
  getDayunMetaphysics,
  getLiunianMetaphysics,
  getPersonalMetaphysics
} from '../services/content/metaphysicsService';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function getRecommendations(req: AuthenticatedRequest, res: Response) {
  const userId = String(req.user?.id || '').trim();
  const items = await getRecommendationsForUser(userId);
  return res.json({ success: true, data: items });
}

function toMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Metaphysics service failed';
}

function toStatusCode(message: string) {
  if (
    message.includes('required') ||
    message.includes('incomplete') ||
    message.includes('target')
  ) {
    return 400;
  }
  return 500;
}

export async function getPersonalReport(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = String(req.user?.id || '').trim();
    const data = await getPersonalMetaphysics(userId);
    return res.json({ success: true, data });
  } catch (error) {
    const message = toMessage(error);
    return res.status(toStatusCode(message)).json({ success: false, message });
  }
}

export async function getCompatibilityReport(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = String(req.user?.id || '').trim();
    const body = (req.body || {}) as {
      target_user_id?: string;
      manual_target?: {
        gender?: string;
        yearPillar?: string;
        monthPillar?: string;
        dayPillar?: string;
        hourPillar?: string;
      };
    };
    const data = await getCompatibilityMetaphysics({
      userId,
      targetUserId: String(body.target_user_id || '').trim() || undefined,
      manualTarget: body.manual_target || null
    });
    return res.json({ success: true, data });
  } catch (error) {
    const message = toMessage(error);
    return res.status(toStatusCode(message)).json({ success: false, message });
  }
}

export async function getDayunReport(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = String(req.user?.id || '').trim();
    const data = await getDayunMetaphysics(userId);
    return res.json({ success: true, data });
  } catch (error) {
    const message = toMessage(error);
    return res.status(toStatusCode(message)).json({ success: false, message });
  }
}

export async function getLiunianReport(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = String(req.user?.id || '').trim();
    const data = await getLiunianMetaphysics(userId);
    return res.json({ success: true, data });
  } catch (error) {
    const message = toMessage(error);
    return res.status(toStatusCode(message)).json({ success: false, message });
  }
}
