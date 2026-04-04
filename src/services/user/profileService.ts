import { User, UserProfile } from '../../models';
import { normalizeStoredPhotoValue, signPhotoUrl } from '../common/ossService';

const GENDER_VALUES = new Set(['', 'male', 'female', 'other']);

export interface ProfilePayload {
  id: string;
  email: string;
  nickname: string;
  gender: string;
  birthday: string;
  age: number | null;
  birthplace: string;
  bio: string;
  avatar: string;
  height: number | null;
  job: string;
  school: string;
  mbti: string;
  constellation: string;
  interests: string[];
  photos: string[];
  profileCompleted: boolean;
}

interface UpdateProfileInput {
  nickname?: unknown;
  gender?: unknown;
  birthday?: unknown;
  birthplace?: unknown;
  bio?: unknown;
  avatar?: unknown;
  height?: unknown;
  job?: unknown;
  school?: unknown;
  mbti?: unknown;
  constellation?: unknown;
  interests?: unknown;
  photos?: unknown;
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

function normalizeTextArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  const result: string[] = [];
  const seen = new Set<string>();
  value.forEach((item) => {
    const text = String(item || '').trim();
    if (!text || seen.has(text)) return;
    seen.add(text);
    result.push(text);
  });
  return result;
}

function mapPhotoArrayForOutput(value: unknown) {
  return normalizeTextArray(value).map((item) => signPhotoUrl(item));
}

function calculateAge(value: Date | string | null) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDelta = now.getMonth() - date.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < date.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
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

function parseHeight(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined;

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || !Number.isInteger(numeric)) {
    throw new Error('height must be an integer');
  }
  if (numeric < 120 || numeric > 250) {
    throw new Error('height must be between 120 and 250');
  }
  return numeric;
}

function parseStringArray(value: unknown, field: string, maxItems: number, maxItemLength: number) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array`);
  }

  const items = normalizeTextArray(value);
  if (items.length > maxItems) {
    throw new Error(`${field} exceeds maximum item count of ${maxItems}`);
  }
  items.forEach((item) => assertLength(item, maxItemLength, `${field} item`));
  return items;
}

export function serializeProfile(user: User, profile: UserProfile | null): ProfilePayload {
  return {
    id: user.id,
    email: user.email || '',
    nickname: profile?.nickname || '',
    gender: profile?.gender || '',
    birthday: formatBirthday(profile?.birth_date || null),
    age: calculateAge(profile?.birth_date || null),
    birthplace: normalizeNullableText(profile?.birthplace),
    bio: normalizeNullableText(profile?.bio),
    avatar: signPhotoUrl(profile?.avatar_url),
    height: profile?.height_cm ?? null,
    job: normalizeNullableText(profile?.job),
    school: normalizeNullableText(profile?.school),
    mbti: normalizeNullableText(profile?.mbti),
    constellation: normalizeNullableText(profile?.constellation),
    interests: normalizeTextArray(profile?.interests || []),
    photos: mapPhotoArrayForOutput(profile?.photos || []),
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
    height_cm: number | null;
    job: string | null;
    school: string | null;
    mbti: string | null;
    constellation: string | null;
    interests: string[];
    photos: string[];
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
    updates.avatar_url = avatar ? normalizeStoredPhotoValue(avatar) : null;
  }

  const height = parseHeight(input.height);
  if (height !== undefined) {
    updates.height_cm = height;
  }

  const job = stringifyOptional(input.job);
  if (job !== undefined) {
    assertLength(job, 120, 'job');
    updates.job = job || null;
  }

  const school = stringifyOptional(input.school);
  if (school !== undefined) {
    assertLength(school, 160, 'school');
    updates.school = school || null;
  }

  const mbti = stringifyOptional(input.mbti);
  if (mbti !== undefined) {
    assertLength(mbti, 16, 'mbti');
    updates.mbti = mbti ? mbti.toUpperCase() : null;
  }

  const constellation = stringifyOptional(input.constellation);
  if (constellation !== undefined) {
    assertLength(constellation, 32, 'constellation');
    updates.constellation = constellation || null;
  }

  const interests = parseStringArray(input.interests, 'interests', 8, 24);
  if (interests !== undefined) {
    updates.interests = interests;
  }

  const photos = parseStringArray(input.photos, 'photos', 9, 500);
  if (photos !== undefined) {
    updates.photos = photos.map((item) => normalizeStoredPhotoValue(item)).filter(Boolean);
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
