import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { User, UserProfile } from '../models';
import {
  buildBindStatus,
  buildProfilePayload,
  buildSessionSnapshot,
  buildSessionUser,
  getActiveRefreshToken,
  issueSession,
  revokeRefreshToken,
  rotateRefreshSession
} from '../services/auth/sessionService';
import { registerPasswordUser } from '../services/auth/passwordAuthService';
import { verifyPassword } from '../utils/password';

function normalizeEmail(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isUserAvailable(status: string) {
  return status === 'active';
}

export async function registerWithEmail(req: Request, res: Response) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    const confirmPassword = String(req.body?.confirmPassword || req.body?.confirm_password || '');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_INVALID_PARAMS',
        message: 'Email and password are required'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_EMAIL_INVALID',
        message: 'Email format is invalid'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_PASSWORD_WEAK',
        message: 'Password must be at least 8 characters'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_PASSWORD_MISMATCH',
        message: 'Passwords do not match'
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        code: 'AUTH_USER_EXISTS',
        message: 'This email is already registered'
      });
    }

    const user = await registerPasswordUser({ email, password });
    const profile = await buildProfilePayload(user.id);
    const session = await issueSession(
      buildSessionUser(user),
      profile || undefined,
      buildBindStatus(user)
    );

    return res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Register failed';
    return res.status(500).json({ success: false, code: 'AUTH_REGISTER_FAILED', message });
  }
}

export async function loginWithEmail(req: Request, res: Response) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_INVALID_PARAMS',
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email }]
      }
    });

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    if (!isUserAvailable(user.status)) {
      return res.status(403).json({
        success: false,
        code: 'AUTH_USER_DISABLED',
        message: 'This account is not available'
      });
    }

    const profile = await buildProfilePayload(user.id);
    const session = await issueSession(
      buildSessionUser(user),
      profile || undefined,
      buildBindStatus(user)
    );

    return res.json({
      success: true,
      data: session
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return res.status(500).json({ success: false, code: 'AUTH_LOGIN_FAILED', message });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  return res.status(501).json({
    success: false,
    code: 'NOT_IMPLEMENTED',
    message: 'Forgot password is not implemented yet',
    draft_request: req.body
  });
}

export async function resetPassword(req: Request, res: Response) {
  return res.status(501).json({
    success: false,
    code: 'NOT_IMPLEMENTED',
    message: 'Reset password is not implemented yet',
    draft_request: req.body
  });
}

export async function loginWithApple(req: Request, res: Response) {
  return res.status(501).json({
    success: false,
    code: 'NOT_IMPLEMENTED',
    message: 'Apple login is not implemented yet',
    draft_request: req.body
  });
}

export async function loginWithGoogle(req: Request, res: Response) {
  return res.status(501).json({
    success: false,
    code: 'NOT_IMPLEMENTED',
    message: 'Google login is not implemented yet',
    draft_request: req.body
  });
}

export async function refreshSession(req: Request, res: Response) {
  try {
    const refreshToken = String(req.body?.refresh_token || '').trim();

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_INVALID_PARAMS',
        message: 'refresh_token is required'
      });
    }

    const refreshRecord = await getActiveRefreshToken(refreshToken);
    if (!refreshRecord) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_REFRESH_EXPIRED',
        message: 'Refresh token expired or invalid'
      });
    }

    const user = await User.findByPk(refreshRecord.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    if (!isUserAvailable(user.status)) {
      await revokeRefreshToken(refreshToken);
      return res.status(403).json({
        success: false,
        code: 'AUTH_USER_DISABLED',
        message: 'This account is not available'
      });
    }

    const profile = await buildProfilePayload(user.id);
    const session = await rotateRefreshSession(
      refreshToken,
      buildSessionUser(user),
      profile || undefined,
      buildBindStatus(user)
    );

    return res.json({
      success: true,
      data: session
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Refresh failed';
    return res.status(500).json({ success: false, code: 'AUTH_REFRESH_FAILED', message });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const refreshToken = String(req.body?.refresh_token || '');
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    return res.json({ success: true, data: { ok: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    return res.status(500).json({ success: false, code: 'AUTH_LOGOUT_FAILED', message });
  }
}

export async function getCurrentSession(req: Request & { user?: { id: string } }, res: Response) {
  try {
    const userId = String(req.user?.id || '').trim();
    if (!userId) {
      return res.status(401).json({ success: false, code: 'AUTH_TOKEN_INVALID', message: 'Unauthorized' });
    }

    const user = await User.findByPk(userId, {
      include: [{ model: UserProfile, as: 'profile' }]
    });
    if (!user) {
      return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    if (!isUserAvailable(user.status)) {
      return res.status(403).json({
        success: false,
        code: 'AUTH_USER_DISABLED',
        message: 'This account is not available'
      });
    }

    const profile = await buildProfilePayload(user.id);
    const snapshot = await buildSessionSnapshot(
      buildSessionUser(user),
      profile || undefined,
      buildBindStatus(user)
    );

    return res.json({
      success: true,
      data: snapshot
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fetch session failed';
    return res.status(500).json({ success: false, code: 'AUTH_SESSION_FAILED', message });
  }
}
