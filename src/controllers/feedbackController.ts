import { Response } from 'express';
import { Feedback } from '../models';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function submitFeedback(req: AuthenticatedRequest, res: Response) {
  const userId = String(req.user?.id || '').trim();
  const content = String(req.body?.content || '').trim();
  const type = String(req.body?.type || 'suggestion').trim();
  const contact = String(req.body?.contact || '').trim() || null;

  if (!content) {
    return res.status(400).json({ success: false, code: 'FEEDBACK_EMPTY', message: 'Feedback content is required' });
  }

  const row = await Feedback.create({
    user_id: userId,
    content,
    type,
    contact
  });

  return res.json({ success: true, data: row });
}
