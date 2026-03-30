import { Op } from 'sequelize';
import { User, UserBlock, UserProfile } from '../../models';

const MAX_RECOMMENDATIONS = 20;

type RecommendationItem = {
  id: string;
  nickname: string;
  gender: string;
  birthday: string;
  birthplace: string;
  bio: string;
  avatar: string;
  profileCompleted: boolean;
  score: number;
  source: string;
  summary: string;
};

type UserWithProfile = User & {
  profile?: UserProfile | null;
};

function formatBirthday(value: Date | string | null | undefined) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function normalizeText(value: unknown) {
  return String(value || '').trim();
}

function calculateAge(value: Date | string | null | undefined) {
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

function buildSummary(profile: UserProfile | null) {
  const bio = normalizeText(profile?.bio);
  if (bio) return bio;

  const nickname = normalizeText(profile?.nickname);
  const birthplace = normalizeText(profile?.birthplace);
  if (nickname && birthplace) return `${nickname} from ${birthplace}`;
  if (birthplace) return `Lives around ${birthplace}`;
  if (nickname) return `${nickname} is ready to connect`;
  return 'Profile ready for discovery';
}

function resolvePreferredGender(gender: string) {
  if (gender === 'male') return 'female';
  if (gender === 'female') return 'male';
  return '';
}

function calculateScore(params: {
  currentProfile: UserProfile;
  candidateProfile: UserProfile;
  preferredGender: string;
}) {
  const { currentProfile, candidateProfile, preferredGender } = params;
  let score = 0;

  if (preferredGender && candidateProfile.gender === preferredGender) {
    score += 100;
  }

  if (normalizeText(candidateProfile.avatar_url)) score += 20;
  if (normalizeText(candidateProfile.bio)) score += 10;

  const currentBirthplace = normalizeText(currentProfile.birthplace).toLowerCase();
  const candidateBirthplace = normalizeText(candidateProfile.birthplace).toLowerCase();
  if (currentBirthplace && candidateBirthplace && currentBirthplace === candidateBirthplace) {
    score += 15;
  }

  const currentAge = calculateAge(currentProfile.birth_date);
  const candidateAge = calculateAge(candidateProfile.birth_date);
  if (currentAge !== null && candidateAge !== null) {
    const gap = Math.abs(currentAge - candidateAge);
    if (gap <= 2) score += 20;
    else if (gap <= 5) score += 10;
    else if (gap <= 10) score += 5;
  }

  return score;
}

function serializeRecommendation(params: {
  candidate: UserWithProfile;
  candidateProfile: UserProfile;
  score: number;
  source: string;
}): RecommendationItem {
  const { candidate, candidateProfile, score, source } = params;

  return {
    id: String(candidate.id),
    nickname: normalizeText(candidateProfile.nickname) || normalizeText(candidate.email) || 'User',
    gender: normalizeText(candidateProfile.gender),
    birthday: formatBirthday(candidateProfile.birth_date),
    birthplace: normalizeText(candidateProfile.birthplace),
    bio: normalizeText(candidateProfile.bio),
    avatar: normalizeText(candidateProfile.avatar_url),
    profileCompleted: Boolean(candidateProfile.profile_completed),
    score,
    source,
    summary: buildSummary(candidateProfile)
  };
}

async function getBlockedUserIds(userId: string) {
  const rows = await UserBlock.findAll({
    where: {
      [Op.or]: [
        { user_id: userId },
        { target_user_id: userId }
      ]
    }
  });

  const blockedIds = new Set<string>([userId]);
  rows.forEach((row) => {
    const sourceUserId = String(row.user_id || '');
    const targetUserId = String(row.target_user_id || '');
    if (sourceUserId && sourceUserId !== userId) blockedIds.add(sourceUserId);
    if (targetUserId && targetUserId !== userId) blockedIds.add(targetUserId);
  });
  return Array.from(blockedIds);
}

async function loadCandidatePool(params: {
  excludedIds: string[];
  preferredGender: string;
}) {
  const { excludedIds, preferredGender } = params;

  const baseInclude = {
    model: UserProfile,
    as: 'profile',
    required: true,
    where: {
      profile_completed: true
    }
  } as const;

  const baseWhere = {
    status: 'active',
    id: { [Op.notIn]: excludedIds }
  } as const;

  const preferredCandidates = preferredGender
    ? ((await User.findAll({
        where: baseWhere,
        include: [
          {
            ...baseInclude,
            where: {
              ...baseInclude.where,
              gender: preferredGender
            }
          }
        ],
        limit: MAX_RECOMMENDATIONS,
        order: [
          [{ model: UserProfile, as: 'profile' }, 'updated_at', 'DESC'],
          ['created_at', 'DESC']
        ]
      })) as UserWithProfile[])
    : [];

  if (preferredCandidates.length >= MAX_RECOMMENDATIONS || !preferredGender) {
    return {
      source: preferredGender ? 'gender_preferred' : 'all_completed',
      candidates: preferredCandidates
    };
  }

  const preferredIds = new Set(preferredCandidates.map((candidate) => String(candidate.id)));
  const fallbackCandidates = (await User.findAll({
    where: baseWhere,
    include: [baseInclude],
    limit: MAX_RECOMMENDATIONS * 2,
    order: [
      [{ model: UserProfile, as: 'profile' }, 'updated_at', 'DESC'],
      ['created_at', 'DESC']
    ]
  })) as UserWithProfile[];

  return {
    source: preferredCandidates.length > 0 ? 'gender_preferred_plus_fallback' : 'fallback_all',
    candidates: [
      ...preferredCandidates,
      ...fallbackCandidates.filter((candidate) => !preferredIds.has(String(candidate.id)))
    ].slice(0, MAX_RECOMMENDATIONS)
  };
}

export async function getRecommendationsForUser(userId: string) {
  const currentUser = (await User.findByPk(userId, {
    include: [{ model: UserProfile, as: 'profile' }]
  })) as UserWithProfile | null;

  if (!currentUser || currentUser.status !== 'active') {
    return [];
  }

  const currentProfile = currentUser.profile || null;
  if (!currentProfile || !currentProfile.profile_completed) {
    return [];
  }

  const preferredGender = resolvePreferredGender(normalizeText(currentProfile.gender));
  const excludedIds = await getBlockedUserIds(userId);
  const { source, candidates } = await loadCandidatePool({
    excludedIds,
    preferredGender
  });

  return candidates
    .map((candidate) => {
      const candidateProfile = candidate.profile || null;
      if (!candidateProfile) return null;

      const score = calculateScore({
        currentProfile,
        candidateProfile,
        preferredGender
      });

      return {
        item: serializeRecommendation({
          candidate,
          candidateProfile,
          score,
          source
        }),
        updatedAt: candidateProfile.updated_at ? new Date(candidateProfile.updated_at).getTime() : 0,
        createdAt: candidate.created_at ? new Date(candidate.created_at).getTime() : 0
      };
    })
    .filter((entry): entry is { item: RecommendationItem; updatedAt: number; createdAt: number } => Boolean(entry))
    .sort((a, b) => {
      if (b.item.score !== a.item.score) return b.item.score - a.item.score;
      if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt;
      return b.createdAt - a.createdAt;
    })
    .slice(0, MAX_RECOMMENDATIONS)
    .map((entry) => entry.item);
}
