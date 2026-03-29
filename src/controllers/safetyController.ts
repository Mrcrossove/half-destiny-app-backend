import { Response } from 'express';
import { Report, UserBlock } from '../models';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function reportUser(req: AuthenticatedRequest, res: Response) {
  const userId = String(req.user?.id || '').trim();
  const targetUserId = String(req.body?.target_user_id || '').trim();
  const reason = String(req.body?.reason || '').trim();
  const detail = String(req.body?.detail || '').trim() || null;

  if (!targetUserId || !reason) {
    return res.status(400).json({ success: false, code: 'REPORT_INVALID', message: 'target_user_id and reason are required' });
  }

  const row = await Report.create({
    user_id: userId,
    target_user_id: targetUserId,
    reason,
    detail
  });

  return res.json({ success: true, data: row });
}

export async function blockUser(req: AuthenticatedRequest, res: Response) {
  const userId = String(req.user?.id || '').trim();
  const targetUserId = String(req.params.targetId || '').trim();

  const [row] = await UserBlock.findOrCreate({
    where: { user_id: userId, target_user_id: targetUserId },
    defaults: { user_id: userId, target_user_id: targetUserId }
  });

  return res.json({ success: true, data: row });
}

export async function unblockUser(req: AuthenticatedRequest, res: Response) {
  const userId = String(req.user?.id || '').trim();
  const targetUserId = String(req.params.targetId || '').trim();

  await UserBlock.destroy({
    where: { user_id: userId, target_user_id: targetUserId }
  });

  return res.json({ success: true, data: { ok: true } });
}

export async function getBlocks(req: AuthenticatedRequest, res: Response) {
  const userId = String(req.user?.id || '').trim();
  const rows = await UserBlock.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']]
  });
  return res.json({ success: true, data: rows });
}
