import { QueryTypes } from 'sequelize';
import { sequelize } from '../../config/database';
import { UserProfile } from '../../models';
import {
  buildCompactBaziString,
  buildWorkflowBaziString,
  calculateBaziFromProfile
} from './baziCalculatorService';
import {
  extractWorkflowPayload,
  runCompatibilityWorkflow,
  runDayunWorkflow,
  runPersonalWorkflow
} from './metaphysicsWorkflowService';

type CacheRow = {
  id: string;
  user_id: string;
  request_type: string;
  cache_key: string;
  response_payload: Record<string, unknown> | null;
  response_text: string;
  created_at: string;
  updated_at: string;
};

type ManualTargetInput = {
  gender?: string;
  yearPillar?: string;
  monthPillar?: string;
  dayPillar?: string;
  hourPillar?: string;
};

function normalizeText(value: unknown) {
  return String(value || '').trim();
}

async function loadProfile(userId: string) {
  return UserProfile.findOne({ where: { user_id: userId } });
}

async function ensureCalculatedProfile(profile: UserProfile) {
  const calculated = calculateBaziFromProfile(profile);
  const nextCurrentLuckPillar = normalizeText(profile.current_luck_pillar) || String((calculated as any).monthPillar || '');
  await profile.update({
    year_pillar: calculated.yearPillar,
    month_pillar: calculated.monthPillar,
    day_pillar: calculated.dayPillar,
    hour_pillar: calculated.hourPillar,
    day_element: calculated.dayElement,
    body_strength: calculated.bodyStrength,
    bazi_report: calculated.report,
    current_luck_pillar: nextCurrentLuckPillar,
    last_bazi_calculated_at: new Date()
  });
  return {
    ...calculated,
    currentLuckPillar: nextCurrentLuckPillar
  };
}

async function readCache(userId: string, requestType: string, cacheKey: string) {
  const rows = await sequelize.query<CacheRow>(
    `
      SELECT *
      FROM murron_cache
      WHERE user_id = :userId
        AND request_type = :requestType
        AND cache_key = :cacheKey
      ORDER BY created_at DESC
      LIMIT 1
    `,
    {
      type: QueryTypes.SELECT,
      replacements: { userId, requestType, cacheKey }
    }
  );
  return rows[0] || null;
}

async function writeCache(params: {
  userId: string;
  requestType: string;
  cacheKey: string;
  responsePayload: Record<string, unknown> | null;
  responseText: string;
}) {
  await sequelize.query(
    `
      INSERT INTO murron_cache (user_id, request_type, cache_key, response_payload, response_text)
      VALUES (:userId, :requestType, :cacheKey, CAST(:responsePayload AS JSONB), :responseText)
    `,
    {
      replacements: {
        userId: params.userId,
        requestType: params.requestType,
        cacheKey: params.cacheKey,
        responsePayload: params.responsePayload ? JSON.stringify(params.responsePayload) : null,
        responseText: params.responseText
      }
    }
  );
}

function buildPublicBaziBundle(profile: UserProfile, calculated: Awaited<ReturnType<typeof ensureCalculatedProfile>>) {
  return {
    yearPillar: calculated.yearPillar,
    monthPillar: calculated.monthPillar,
    dayPillar: calculated.dayPillar,
    hourPillar: calculated.hourPillar,
    dayElement: calculated.dayElement,
    bodyStrength: calculated.bodyStrength,
    luckyElementsText: calculated.luckyElementsText,
    unluckyElementsText: calculated.unluckyElementsText,
    report: calculated.report,
    birthTime: normalizeText(profile.birth_time),
    birthplace: normalizeText(profile.birthplace),
    currentLuckPillar: calculated.currentLuckPillar
  };
}

function requireMetaphysicsProfile(profile: UserProfile | null) {
  if (!profile) throw new Error('profile not found');
  if (!profile.birth_date) throw new Error('birth_date is required');
  if (!normalizeText(profile.birth_time)) throw new Error('birth_time is required');
  if (!normalizeText(profile.birthplace)) throw new Error('birthplace is required');
  return profile;
}

export async function getPersonalMetaphysics(userId: string) {
  const profile = requireMetaphysicsProfile(await loadProfile(userId));
  const calculated = await ensureCalculatedProfile(profile);
  const workflowBazi = buildWorkflowBaziString({
    gender: profile.gender,
    yearPillar: calculated.yearPillar,
    monthPillar: calculated.monthPillar,
    dayPillar: calculated.dayPillar,
    hourPillar: calculated.hourPillar
  });
  const cacheKey = workflowBazi;
  const cached = await readCache(userId, 'personal', cacheKey);
  if (cached) {
    return {
      ...(cached.response_payload || {}),
      personal_payload: cached.response_payload || null,
      fullText: cached.response_text,
      bazi: buildPublicBaziBundle(profile, calculated),
      cached: true
    };
  }

  const response = await runPersonalWorkflow({ userId, bazi: workflowBazi });
  const { payload, fullText } = extractWorkflowPayload(response);
  await writeCache({
    userId,
    requestType: 'personal',
    cacheKey,
    responsePayload: payload,
    responseText: fullText
  });

  return {
    ...(payload || {}),
    personal_payload: payload,
    fullText,
    bazi: buildPublicBaziBundle(profile, calculated),
    cached: false
  };
}

export async function getLiunianMetaphysics(userId: string) {
  const personal = await getPersonalMetaphysics(userId);
  return {
    ...(personal.personal_payload || {}),
    annual_payload: (personal.personal_payload as Record<string, unknown> | null)?.chapter_4_annual_fortune || null,
    fullText: personal.fullText,
    bazi: personal.bazi,
    cached: personal.cached
  };
}

export async function getDayunMetaphysics(userId: string) {
  const profile = requireMetaphysicsProfile(await loadProfile(userId));
  const calculated = await ensureCalculatedProfile(profile);
  if (!normalizeText(calculated.currentLuckPillar)) {
    throw new Error('current_luck_pillar is required');
  }

  const compactBazi = buildCompactBaziString({
    yearPillar: calculated.yearPillar,
    monthPillar: calculated.monthPillar,
    dayPillar: calculated.dayPillar,
    hourPillar: calculated.hourPillar
  });
  const cacheKey = `${compactBazi}||${calculated.currentLuckPillar}||${profile.gender}`;
  const cached = await readCache(userId, 'dayun', cacheKey);
  if (cached) {
    return {
      dayun_payload: cached.response_payload || null,
      fullText: cached.response_text,
      bazi: buildPublicBaziBundle(profile, calculated),
      current_luck_pillar: calculated.currentLuckPillar,
      gender: profile.gender,
      cached: true
    };
  }

  const response = await runDayunWorkflow({
    userId,
    bazi: compactBazi,
    currentLuckPillar: calculated.currentLuckPillar,
    gender: profile.gender
  });
  const { payload, fullText } = extractWorkflowPayload(response);
  await writeCache({
    userId,
    requestType: 'dayun',
    cacheKey,
    responsePayload: payload,
    responseText: fullText
  });

  return {
    dayun_payload: payload,
    fullText,
    bazi: buildPublicBaziBundle(profile, calculated),
    current_luck_pillar: calculated.currentLuckPillar,
    gender: profile.gender,
    cached: false
  };
}

function buildManualTargetBazi(input: ManualTargetInput) {
  const gender = normalizeText(input.gender) === 'female' ? 'female' : 'male';
  const yearPillar = normalizeText(input.yearPillar);
  const monthPillar = normalizeText(input.monthPillar);
  const dayPillar = normalizeText(input.dayPillar);
  const hourPillar = normalizeText(input.hourPillar);
  if (!yearPillar || !monthPillar || !dayPillar || !hourPillar) {
    throw new Error('manual target pillars are incomplete');
  }
  return buildWorkflowBaziString({ gender, yearPillar, monthPillar, dayPillar, hourPillar });
}

export async function getCompatibilityMetaphysics(params: {
  userId: string;
  targetUserId?: string;
  manualTarget?: ManualTargetInput | null;
}) {
  const profile = requireMetaphysicsProfile(await loadProfile(params.userId));
  const calculated = await ensureCalculatedProfile(profile);
  const myBazi = buildWorkflowBaziString({
    gender: profile.gender,
    yearPillar: calculated.yearPillar,
    monthPillar: calculated.monthPillar,
    dayPillar: calculated.dayPillar,
    hourPillar: calculated.hourPillar
  });

  let targetBazi = '';
  let targetProfile: Record<string, unknown> | null = null;
  if (params.targetUserId) {
    const target = requireMetaphysicsProfile(await loadProfile(params.targetUserId));
    const targetCalculated = await ensureCalculatedProfile(target);
    targetBazi = buildWorkflowBaziString({
      gender: target.gender,
      yearPillar: targetCalculated.yearPillar,
      monthPillar: targetCalculated.monthPillar,
      dayPillar: targetCalculated.dayPillar,
      hourPillar: targetCalculated.hourPillar
    });
    targetProfile = {
      mode: 'user',
      userId: params.targetUserId,
      gender: target.gender,
      dayPillar: targetCalculated.dayPillar
    };
  } else if (params.manualTarget) {
    targetBazi = buildManualTargetBazi(params.manualTarget);
    targetProfile = {
      mode: 'manual',
      gender: normalizeText(params.manualTarget.gender) || 'male',
      yearPillar: normalizeText(params.manualTarget.yearPillar),
      monthPillar: normalizeText(params.manualTarget.monthPillar),
      dayPillar: normalizeText(params.manualTarget.dayPillar),
      hourPillar: normalizeText(params.manualTarget.hourPillar)
    };
  } else {
    throw new Error('compatibility target is required');
  }

  const cacheKey = `${myBazi}||${targetBazi}`;
  const cached = await readCache(params.userId, 'compatibility', cacheKey);
  if (cached) {
    return {
      ...(cached.response_payload || {}),
      compatibility_payload: cached.response_payload || null,
      fullText: cached.response_text,
      bazi: buildPublicBaziBundle(profile, calculated),
      target_profile: targetProfile,
      cached: true
    };
  }

  const response = await runCompatibilityWorkflow({
    userId: params.userId,
    bazi: myBazi,
    targetBazi
  });
  const { payload, fullText } = extractWorkflowPayload(response);
  await writeCache({
    userId: params.userId,
    requestType: 'compatibility',
    cacheKey,
    responsePayload: payload,
    responseText: fullText
  });

  return {
    ...(payload || {}),
    compatibility_payload: payload,
    fullText,
    bazi: buildPublicBaziBundle(profile, calculated),
    target_profile: targetProfile,
    cached: false
  };
}
