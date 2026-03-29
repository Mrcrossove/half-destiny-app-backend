import crypto from 'crypto';
import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';
import { env } from '../../config/env';
import { RefreshToken, UserProfile } from '../../models';
import type { BindStatus, SessionResult, SessionUser } from '../../types/auth';

function resolveJwtExpiresIn(): NonNullable<SignOptions['expiresIn']> {
  return env.jwtExpiresIn as NonNullable<SignOptions['expiresIn']>;
}

function buildAccessToken(user: SessionUser) {
  const secret: Secret = env.jwtSecret;
  const options: SignOptions = {
    expiresIn: resolveJwtExpiresIn()
  };

  return jwt.sign({ id: user.id, email: user.email || '' }, secret, options);
}

function resolveExpiresInSeconds() {
  if (typeof env.jwtExpiresIn === 'number') {
    return env.jwtExpiresIn;
  }

  const rawValue = String(env.jwtExpiresIn).trim();
  const matched = rawValue.match(/^(\d+)([smhd])?$/i);
  if (!matched) {
    return 7200;
  }

  const amount = Number(matched[1]);
  const unit = (matched[2] || 's').toLowerCase();
  const multiplier = unit === 'd' ? 86400 : unit === 'h' ? 3600 : unit === 'm' ? 60 : 1;
  return amount * multiplier;
}

function buildRefreshTokenValue() {
  return crypto.randomBytes(32).toString('hex');
}

export function buildSessionUser(user: {
  id: string;
  email?: string;
  status?: string;
  provider?: string;
}): SessionUser {
  return {
    id: user.id,
    email: user.email || '',
    status: user.status || 'active',
    provider: user.provider || 'email'
  };
}

export function buildBindStatus(user: { email?: string; password_hash?: string; provider?: string }): BindStatus {
  return {
    email_bound: !!user.email,
    password_set: !!user.password_hash,
    apple_bound: user.provider === 'apple',
    google_bound: user.provider === 'google'
  };
}

export async function issueSession(
  user: SessionUser,
  profile?: Record<string, unknown>,
  bindStatus?: BindStatus
): Promise<SessionResult> {
  const accessToken = buildAccessToken(user);
  const refreshTokenValue = buildRefreshTokenValue();
  const expiresAt = new Date(Date.now() + env.refreshTokenExpiresDays * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    user_id: user.id,
    token: refreshTokenValue,
    expires_at: expiresAt
  });

  return {
    access_token: accessToken,
    refresh_token: refreshTokenValue,
    expires_in: resolveExpiresInSeconds(),
    user,
    profile,
    bind_status: bindStatus
  };
}

export async function revokeRefreshToken(token: string) {
  const record = await RefreshToken.findOne({ where: { token } });
  if (!record) return;
  await record.update({ revoked_at: new Date() });
}

export async function getActiveRefreshToken(token: string) {
  const record = await RefreshToken.findOne({ where: { token } });
  if (!record) return null;
  if (record.revoked_at) return null;
  if (new Date(record.expires_at).getTime() <= Date.now()) return null;
  return record;
}

export async function rotateRefreshSession(
  token: string,
  user: SessionUser,
  profile?: Record<string, unknown>,
  bindStatus?: BindStatus
) {
  const existing = await getActiveRefreshToken(token);
  if (!existing) {
    throw new Error('Refresh token expired or invalid');
  }

  await existing.update({ revoked_at: new Date() });
  return issueSession(user, profile, bindStatus);
}

export async function buildSessionSnapshot(
  user: SessionUser,
  profile?: Record<string, unknown>,
  bindStatus?: BindStatus
): Promise<SessionResult> {
  return {
    access_token: buildAccessToken(user),
    refresh_token: '',
    expires_in: resolveExpiresInSeconds(),
    user,
    profile,
    bind_status: bindStatus
  };
}

export async function buildProfilePayload(userId: string) {
  const profile = await UserProfile.findOne({ where: { user_id: userId } });
  if (!profile) return null;
  return {
    id: profile.id,
    nickname: profile.nickname,
    gender: profile.gender,
    birth_date: profile.birth_date,
    birthplace: profile.birthplace,
    bio: profile.bio,
    avatar_url: profile.avatar_url,
    profile_completed: profile.profile_completed
  };
}
