import { UserProfile } from '../../models';

const { Solar } = require('lunar-javascript');

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const STEM_ELEMENTS: Record<string, string> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水'
};

const BRANCH_ELEMENTS: Record<string, string> = {
  子: '水',
  丑: '土',
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水'
};

const STEM_YIN_YANG: Record<string, string> = {
  甲: '阳',
  乙: '阴',
  丙: '阳',
  丁: '阴',
  戊: '阳',
  己: '阴',
  庚: '阳',
  辛: '阴',
  壬: '阳',
  癸: '阴'
};

const HIDDEN_STEMS: Record<string, string[]> = {
  子: ['癸'],
  丑: ['己', '辛', '癸'],
  寅: ['甲', '丙', '戊'],
  卯: ['乙'],
  辰: ['戊', '乙', '癸'],
  巳: ['丙', '庚', '戊'],
  午: ['丁', '己'],
  未: ['己', '丁', '乙'],
  申: ['庚', '壬', '戊'],
  酉: ['辛'],
  戌: ['戊', '辛', '丁'],
  亥: ['壬', '甲']
};

export type CalculatedBazi = {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  dayElement: string;
  bodyStrength: string;
  luckyElementsText: string;
  unluckyElementsText: string;
  report: string;
  currentLuckPillar: string;
};

function normalizeGender(value: string | null | undefined) {
  return value === 'female' ? 'female' : 'male';
}

function padTime(value: string) {
  const normalized = String(value || '').trim();
  if (!normalized) return '12:00';
  if (/^\d{1,2}$/.test(normalized)) return `${normalized.padStart(2, '0')}:00`;
  if (/^\d{1,2}:\d{1,2}$/.test(normalized)) {
    const [hour, minute] = normalized.split(':');
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }
  return '12:00';
}

function getResourceElement(element: string) {
  const map: Record<string, string> = { 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' };
  return map[element] || '';
}

function getOutputElement(element: string) {
  const map: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  return map[element] || '';
}

function getWealthElement(element: string) {
  const map: Record<string, string> = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' };
  return map[element] || '';
}

function getOfficerElement(element: string) {
  const map: Record<string, string> = { 木: '金', 火: '水', 土: '木', 金: '火', 水: '土' };
  return map[element] || '';
}

function scoreElementRelation(dayElement: string, targetElement: string, weight: number) {
  if (!targetElement) return 0;
  if (targetElement === dayElement) return 1.0 * weight;
  if (targetElement === getResourceElement(dayElement)) return 0.85 * weight;
  if (targetElement === getOutputElement(dayElement)) return -0.65 * weight;
  if (targetElement === getWealthElement(dayElement)) return -0.85 * weight;
  if (targetElement === getOfficerElement(dayElement)) return -1.0 * weight;
  return 0;
}

function resolveStrengthAndElements(
  dayStem: string,
  monthBranch: string,
  allStems: string[],
  allBranches: string[]
) {
  const dayElement = STEM_ELEMENTS[dayStem] || '';
  if (!dayElement) {
    return {
      dayElement: '',
      bodyStrength: '中和',
      luckyElementsText: '',
      unluckyElementsText: ''
    };
  }

  let score = 1.2;
  score += scoreElementRelation(dayElement, BRANCH_ELEMENTS[monthBranch] || '', 1.6);

  allStems.forEach((stem, index) => {
    if (!stem || index === 2) return;
    score += scoreElementRelation(dayElement, STEM_ELEMENTS[stem] || '', 1);
  });

  allBranches.forEach((branch, index) => {
    if (!branch) return;
    score += scoreElementRelation(dayElement, BRANCH_ELEMENTS[branch] || '', index === 1 ? 1.2 : 0.9);
    const hidden = HIDDEN_STEMS[branch] || [];
    hidden.forEach((stem, hiddenIndex) => {
      const hiddenWeight = (index === 1 ? 0.5 : 0.35) - hiddenIndex * 0.08;
      score += scoreElementRelation(dayElement, STEM_ELEMENTS[stem] || '', Math.max(hiddenWeight, 0.15));
    });
    if (hidden.includes(dayStem)) {
      score += index === 2 ? 0.8 : 0.45;
    }
  });

  let bodyStrength = '中和';
  if (score >= 2.4) bodyStrength = '身旺';
  else if (score <= -1.6) bodyStrength = '身弱';

  const resourceElement = getResourceElement(dayElement);
  const wealthElement = getWealthElement(dayElement);
  const officerElement = getOfficerElement(dayElement);

  if (bodyStrength === '身旺') {
    return {
      dayElement,
      bodyStrength,
      luckyElementsText: [wealthElement, officerElement].filter(Boolean).join('，'),
      unluckyElementsText: [resourceElement, dayElement].filter(Boolean).join('，')
    };
  }

  if (bodyStrength === '身弱') {
    return {
      dayElement,
      bodyStrength,
      luckyElementsText: [resourceElement, dayElement].filter(Boolean).join('，'),
      unluckyElementsText: [wealthElement, officerElement].filter(Boolean).join('，')
    };
  }

  return {
    dayElement,
    bodyStrength,
    luckyElementsText: [dayElement, resourceElement].filter(Boolean).join('，'),
    unluckyElementsText: [wealthElement, officerElement].filter(Boolean).join('，')
  };
}

function getDayun(monthStem: string, monthBranch: string, gender: string) {
  const isMale = gender === 'male';
  const forward =
    (isMale && ['甲', '丙', '戊', '庚', '壬'].includes(monthStem)) ||
    (!isMale && ['乙', '丁', '己', '辛', '癸'].includes(monthStem));

  let stemIndex = TIANGAN.indexOf(monthStem);
  let branchIndex = DIZHI.indexOf(monthBranch);
  const result: string[] = [];

  for (let i = 0; i < 8; i += 1) {
    stemIndex = forward ? (stemIndex + 1) % 10 : (stemIndex - 1 + 10) % 10;
    branchIndex = forward ? (branchIndex + 1) % 12 : (branchIndex - 1 + 12) % 12;
    result.push(`${TIANGAN[stemIndex]}${DIZHI[branchIndex]}`);
  }

  return result;
}

function buildBaziReport(input: CalculatedBazi, gender: string) {
  const dayStem = input.dayPillar.charAt(0);
  const dayYinYang = STEM_YIN_YANG[dayStem] || '';
  const decadeLines = getDayun(input.monthPillar.charAt(0), input.monthPillar.charAt(1), gender)
    .slice(0, 4)
    .map((item, index) => `${8 + index * 10}-${17 + index * 10}岁：${item}`);

  return [
    '【八字命盘】',
    '',
    `年柱：${input.yearPillar}`,
    `月柱：${input.monthPillar}`,
    `日柱：${input.dayPillar}`,
    `时柱：${input.hourPillar}`,
    '',
    '【五行】',
    `日主：${dayStem}（${dayYinYang}${input.dayElement}）`,
    `命局：${input.bodyStrength}`,
    `喜用：${input.luckyElementsText}`,
    `忌神：${input.unluckyElementsText}`,
    '',
    '【大运】',
    ...decadeLines
  ].join('\n');
}

export function buildWorkflowBaziString(params: {
  gender: string;
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
}) {
  const genderLabel = normalizeGender(params.gender) === 'female' ? '女嘉宾' : '男嘉宾';
  return `${genderLabel}：年柱：${params.yearPillar}，月柱：${params.monthPillar}。日柱：${params.dayPillar}，时柱：${params.hourPillar}`;
}

export function buildCompactBaziString(params: {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
}) {
  return `${params.yearPillar}${params.monthPillar}${params.dayPillar}${params.hourPillar}`;
}

export function calculateBaziFromProfile(profile: UserProfile): CalculatedBazi {
  if (!profile.birth_date) {
    throw new Error('birth_date is required for metaphysics analysis');
  }

  const birthDate = new Date(profile.birth_date);
  if (Number.isNaN(birthDate.getTime())) {
    throw new Error('birth_date is invalid');
  }

  const [hourText, minuteText] = padTime(profile.birth_time || '').split(':');
  const solar = Solar.fromYmdHms(
    birthDate.getUTCFullYear(),
    birthDate.getUTCMonth() + 1,
    birthDate.getUTCDate(),
    Number(hourText || 12),
    Number(minuteText || 0),
    0
  );
  const lunar = solar.getLunar();

  const yearPillar = String(lunar.getYearInGanZhi() || '');
  const monthPillar = String(lunar.getMonthInGanZhi() || '');
  const dayPillar = String(lunar.getDayInGanZhi() || '');
  const hourPillar = String(lunar.getTimeInGanZhi() || '');

  const resolved = resolveStrengthAndElements(
    dayPillar.charAt(0),
    monthPillar.charAt(1),
    [yearPillar.charAt(0), monthPillar.charAt(0), dayPillar.charAt(0), hourPillar.charAt(0)],
    [yearPillar.charAt(1), monthPillar.charAt(1), dayPillar.charAt(1), hourPillar.charAt(1)]
  );
  const dayun = getDayun(monthPillar.charAt(0), monthPillar.charAt(1), normalizeGender(profile.gender));

  const payload: CalculatedBazi = {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayElement: resolved.dayElement,
    bodyStrength: resolved.bodyStrength,
    luckyElementsText: resolved.luckyElementsText,
    unluckyElementsText: resolved.unluckyElementsText,
    report: '',
    currentLuckPillar: dayun[0] || ''
  };

  payload.report = buildBaziReport(payload, normalizeGender(profile.gender));
  return payload;
}
