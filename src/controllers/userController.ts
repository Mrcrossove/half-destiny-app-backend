import { Response } from 'express';
import {
  cancelDeletionRequest as cancelDeletionRequestService,
  createDeletionRequest,
  getDeletionStatusPayload
} from '../services/user/deletionService';
import { getProfileBundle, getProfilePayload, updateProfile as saveProfile } from '../services/user/profileService';
import { isOwnedPhotoKey, isRemoteUrl, normalizeStoredPhotoValue, uploadPhotoToOss } from '../services/common/ossService';
import type { AuthenticatedRequest } from '../middleware/auth';

type PhotoUploadRequest = AuthenticatedRequest & {
  file?: Express.Multer.File;
};

function parsePhotoSlot(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined;
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 0 || numeric > 8) {
    throw new Error('slot must be an integer between 0 and 8');
  }
  return numeric;
}

function compactPhotoSet(items: string[]) {
  return items.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 9);
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = String(req.user?.id || '').trim();
    const profile = await getProfilePayload(userId);

    if (!profile) {
      return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    return res.json({ success: true, data: profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fetch profile failed';
    return res.status(500).json({ success: false, code: 'PROFILE_FETCH_FAILED', message });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = String(req.user?.id || '').trim();
    const profile = await saveProfile(userId, req.body || {});

    if (!profile) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update profile failed';
    const isValidationError =
      message.includes('maximum length') ||
      message.includes('maximum item count') ||
      message.includes('must be one of') ||
      message.includes('valid date') ||
      message.includes('must be an array') ||
      message.includes('must be an integer') ||
      message.includes('must be between');

    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      code: isValidationError ? 'PROFILE_INVALID_PARAMS' : 'PROFILE_UPDATE_FAILED',
      message
    });
  }
}

export async function uploadPhoto(req: PhotoUploadRequest, res: Response) {
  try {
    const userId = String(req.user?.id || '').trim();
    if (!userId) {
      return res.status(401).json({ success: false, code: 'AUTH_TOKEN_INVALID', message: 'Invalid token' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, code: 'PHOTO_FILE_MISSING', message: 'Photo file is required' });
    }

    const slot = parsePhotoSlot(req.body?.slot);
    const uploaded = await uploadPhotoToOss({
      userId,
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname
    });

    const bundle = await getProfileBundle(userId);
    if (!bundle) {
      return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    const profile = (bundle as { profile?: { avatar_url?: string | null; photos?: string[] | null } }).profile;
    const orderedPhotos = compactPhotoSet([
      String(profile?.avatar_url || '').trim(),
      ...((profile?.photos || []).map((item) => String(item || '').trim()))
    ]);

    if (slot === undefined || slot >= orderedPhotos.length) {
      orderedPhotos.push(uploaded.key);
    } else {
      orderedPhotos[slot] = uploaded.key;
    }

    const nextPhotos = compactPhotoSet(orderedPhotos);
    const nextProfile = await saveProfile(userId, {
      avatar: nextPhotos[0] || '',
      photos: nextPhotos.slice(1)
    });

    return res.json({
      success: true,
      data: {
        key: uploaded.key,
        url: uploaded.url,
        profile: nextProfile
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Photo upload failed';
    const isValidationError =
      message.includes('slot must be') ||
      message.includes('OSS is not fully configured');

    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      code: isValidationError ? 'PHOTO_UPLOAD_INVALID_PARAMS' : 'PHOTO_UPLOAD_FAILED',
      message
    });
  }
}

export async function replacePhotos(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = String(req.user?.id || '').trim();
    const incoming = Array.isArray(req.body?.photos) ? req.body.photos : null;

    if (!incoming) {
      return res.status(400).json({
        success: false,
        code: 'PHOTO_REPLACE_INVALID_PARAMS',
        message: 'photos must be an array'
      });
    }

    const normalizedPhotos = compactPhotoSet(
      incoming.map((item: unknown) => normalizeStoredPhotoValue(item))
    );

    for (const item of normalizedPhotos) {
      if (!item) continue;
      if (isRemoteUrl(item)) continue;
      if (!isOwnedPhotoKey(userId, item)) {
        return res.status(400).json({
          success: false,
          code: 'PHOTO_REPLACE_INVALID_PARAMS',
          message: 'photos must belong to the authenticated user'
        });
      }
    }

    const profile = await saveProfile(userId, {
      avatar: normalizedPhotos[0] || '',
      photos: normalizedPhotos.slice(1)
    });

    return res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Photo replacement failed';
    return res.status(500).json({
      success: false,
      code: 'PHOTO_REPLACE_FAILED',
      message
    });
  }
}

export async function requestAccountDeletion(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = String(req.user?.id || '').trim();
    const reason = String(req.body?.reason || '').trim() || null;
    const row = await createDeletionRequest(userId, reason);
    return res.json({
      success: true,
      data: {
        status: row.status,
        requested_at: row.requested_at,
        scheduled_delete_at: row.scheduled_delete_at,
        cancelled_at: row.cancelled_at,
        completed_at: row.completed_at,
        can_cancel: true
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Create deletion request failed';
    const code =
      message === 'User not found'
        ? 'USER_NOT_FOUND'
        : message === 'A pending deletion request already exists'
          ? 'DELETION_REQUEST_ALREADY_EXISTS'
          : 'DELETION_REQUEST_FAILED';

    return res.status(code === 'DELETION_REQUEST_FAILED' ? 500 : 400).json({
      success: false,
      code,
      message
    });
  }
}

export async function getAccountDeletionStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = String(req.user?.id || '').trim();
    const status = await getDeletionStatusPayload(userId);
    return res.json({
      success: true,
      data: status
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fetch deletion status failed';
    return res.status(500).json({
      success: false,
      code: 'DELETION_STATUS_FAILED',
      message
    });
  }
}

export async function cancelAccountDeletion(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = String(req.user?.id || '').trim();
    const row = await cancelDeletionRequestService(userId);

    if (!row) {
      return res.status(404).json({
        success: false,
        code: 'DELETION_REQUEST_NOT_FOUND',
        message: 'No pending deletion request found'
      });
    }

    return res.json({
      success: true,
      data: {
        status: 'cancelled',
        requested_at: row.requested_at,
        scheduled_delete_at: row.scheduled_delete_at,
        cancelled_at: row.cancelled_at,
        completed_at: row.completed_at,
        can_cancel: false
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cancel deletion failed';
    return res.status(500).json({
      success: false,
      code: 'DELETION_CANCEL_FAILED',
      message
    });
  }
}
