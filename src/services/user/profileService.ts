import { User, UserProfile } from '../../models';

const GENDER_VALUES = new Set(['', 'male', 'female', 'other']);

export interface ProfilePayload {
  id: string;
  email: string;
  nickname: string;
  gender: string;
  birthday: string;
  birthplace: string;
  bio: string;
  avatar: string;
  profileCompleted: boolean;
}

interface UpdateProfileInput {
  nickname?: unknown;
  gender?: unknown;
  birthday?: unknown;
  birthplace?: unknown;
  bio?: unknown;
  avatar?: unknown;
}

function stringifyOptional(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }
  return String(value).trim();
}

function formatBirthday(value: Date | string | null) {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function normalizeNullableText(value: string | null | undefined) {
  return value || '';
}

function computeProfileCompleted(profile: UserProfile) {
  return Boolean(
    profile.nickname &&
      profile.gender &&
      profile.birth_date &&
      profile.birthplace
  );
}

function assertLength(value: string, max: number, field: string) {
  if (value.length > max) {
    throw new Error(`${field} exceeds maximum length of ${max}`);
  }
}

function parseBirthday(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('birthday must be a valid date');
  }
  return date;
}

export function serializeProfile(user: User, profile: UserProfile | null): ProfilePayload {
  return {
    id: user.id,
    email: user.email || '',
    nickname: profile?.nickname || '',
    gender: profile?.gender || '',
    birthday: formatBirthday(profile?.birth_date || null),
    birthplace: normalizeNullableText(profile?.birthplace),
    bio: normalizeNullableText(profile?.bio),
    avatar: normalizeNullableText(profile?.avatar_url),
    profileCompleted: Boolean(profile?.profile_completed)
  };
}

export async function getProfileBundle(userId: string) {
  return User.findByPk(userId, {
    include: [{ model: UserProfile, as: 'profile' }]
  });
}

export async function getProfilePayload(userId: string) {
  const user = await getProfileBundle(userId);
  if (!user) {
    return null;
  }

  const profile = (user as User & { profile?: UserProfile | null }).profile || null;
  return serializeProfile(user, profile);
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await getProfileBundle(userId);
  if (!user) {
    return null;
  }

  const profile = (user as User & { profile?: UserProfile | null }).profile;
  if (!profile) {
    throw new Error('Profile record not found');
  }

  const updates: Partial<{
    nickname: string;
    gender: string;
    birth_date: Date | null;
    birthplace: string | null;
    bio: string | null;
    avatar_url: string | null;
    profile_completed: boolean;
  }> = {};

  const nickname = stringifyOptional(input.nickname);
  if (nickname !== undefined) {
    assertLength(nickname, 50, 'nickname');
    updates.nickname = nickname;
  }

  const gender = stringifyOptional(input.gender);
  if (gender !== undefined) {
    if (!GENDER_VALUES.has(gender)) {
      throw new Error('gender must be one of: male, female, other, empty');
    }
    updates.gender = gender;
  }

  const birthday = stringifyOptional(input.birthday);
  if (birthday !== undefined) {
    updates.birth_date = parseBirthday(birthday);
  }

  const birthplace = stringifyOptional(input.birthplace);
  if (birthplace !== undefined) {
    assertLength(birthplace, 120, 'birthplace');
    updates.birthplace = birthplace || null;
  }

  const bio = stringifyOptional(input.bio);
  if (bio !== undefined) {
    assertLength(bio, 500, 'bio');
    updates.bio = bio || null;
  }

  const avatar = stringifyOptional(input.avatar);
  if (avatar !== undefined) {
    assertLength(avatar, 500, 'avatar');
    updates.avatar_url = avatar || null;
  }

  if (Object.keys(updates).length > 0) {
    await profile.update(updates);
  }

  const refreshedProfile = await UserProfile.findOne({ where: { user_id: userId } });
  if (!refreshedProfile) {
    throw new Error('Profile record not found after update');
  }

  const profileCompleted = computeProfileCompleted(refreshedProfile);
  if (refreshedProfile.profile_completed !== profileCompleted) {
    await refreshedProfile.update({ profile_completed: profileCompleted });
  }

  return serializeProfile(user, refreshedProfile);
}
