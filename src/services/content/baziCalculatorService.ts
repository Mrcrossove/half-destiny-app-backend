import { UserProfile } from '../../models';

const { Solar } = require('lunar-javascript');

const STEM_ELEMENTS: Record<string, string> = {
  '\u7532': '\u6728',
  '\u4e59': '\u6728',
  '\u4e19': '\u706b',
  '\u4e01': '\u706b',
  '\u620a': '\u571f',
  '\u5df1': '\u571f',
  '\u5e9a': '\u91d1',
  '\u8f9b': '\u91d1',
  '\u58ec': '\u6c34',
  '\u7678': '\u6c34'
};

const BRANCH_ELEMENTS: Record<string, string> = {
  '\u5b50': '\u6c34',
  '\u4e11': '\u571f',
  '\u5bc5': '\u6728',
  '\u536f': '\u6728',
  '\u8fb0': '\u571f',
  '\u5df3': '\u706b',
  '\u5348': '\u706b',
  '\u672a': '\u571f',
  '\u7533': '\u91d1',
  '\u9149': '\u91d1',
  '\u620c': '\u571f',
  '\u4ea5': '\u6c34'
};

const HIDDEN_STEMS: Record<string, string[]> = {
  '\u5b50': ['\u7678'],
  '\u4e11': ['\u5df1', '\u8f9b', '\u7678'],
  '\u5bc5': ['\u7532', '\u4e19', '\u620a'],
  '\u536f': ['\u4e59'],
  '\u8fb0': ['\u620a', '\u4e59', '\u7678'],
  '\u5df3': ['\u4e19', '\u5e9a', '\u620a'],
  '\u5348': ['\u4e01', '\u5df1'],
  '\u672a': ['\u5df1', '\u4e01', '\u4e59'],
  '\u7533': ['\u5e9a', '\u58ec', '\u620a'],
  '\u9149': ['\u8f9b'],
  '\u620c': ['\u620a', '\u8f9b', '\u4e01'],
  '\u4ea5': ['\u58ec', '\u7532']
};

const ELEMENT_SUPPORTS: Record<string, string> = {
  '\u6728': '\u6c34',
  '\u706b': '\u6728',
  '\u571f': '\u706b',
  '\u91d1': '\u571f',
  '\u6c34': '\u91d1'
};

const ELEMENT_CONTROLS: Record<string, string> = {
  '\u6728': '\u571f',
  '\u706b': '\u91d1',
  '\u571f': '\u6c34',
  '\u91d1': '\u6728',
  '\u6c34': '\u706b'
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
};

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

function getMonthBranchWeight(monthBranch: string, dayElement: string) {
  const monthElement = BRANCH_ELEMENTS[monthBranch] || '';
  if (!monthElement) return 0;
  if (monthElement === dayElement) return 2.2;
  if (ELEMENT_SUPPORTS[dayElement] === monthElement) return 1.6;
  if (ELEMENT_CONTROLS[monthElement] === dayElement) return -1.8;
  if (ELEMENT_CONTROLS[dayElement] === monthElement) return -1.2;
  return 0;
}

function getElementScore(dayElement: string, targetElement: string, weight: number) {
  if (!targetElement) return 0;
  if (targetElement === dayElement) return 1 * weight;
  if (ELEMENT_SUPPORTS[dayElement] === targetElement) return 0.8 * weight;
  if (ELEMENT_SUPPORTS[targetElement] === dayElement) return -0.7 * weight;
  if (ELEMENT_CONTROLS[dayElement] === targetElement) return -0.8 * weight;
  if (ELEMENT_CONTROLS[targetElement] === dayElement) return -1 * weight;
  return 0;
}

function resolveBodyStrength(dayPillar: string, monthPillar: string, hourPillar: string, yearPillar: string) {
  const dayElement = STEM_ELEMENTS[dayPillar.charAt(0)] || '';
  const monthBranch = monthPillar.charAt(1) || '';
  let score = 1.2;
  score += getMonthBranchWeight(monthBranch, dayElement);

  const stems = [yearPillar.charAt(0), monthPillar.charAt(0), hourPillar.charAt(0)];
  stems.forEach((stem) => {
    score += getElementScore(dayElement, STEM_ELEMENTS[stem] || '', 0.8);
  });

  const branches = [yearPillar.charAt(1), monthPillar.charAt(1), dayPillar.charAt(1), hourPillar.charAt(1)];
  branches.forEach((branch, index) => {
    score += getElementScore(dayElement, BRANCH_ELEMENTS[branch] || '', index === 1 ? 1.1 : 0.75);
    (HIDDEN_STEMS[branch] || []).forEach((hiddenStem, hiddenIndex) => {
      score += getElementScore(dayElement, STEM_ELEMENTS[hiddenStem] || '', Math.max(0.14, 0.4 - hiddenIndex * 0.08));
    });
  });

  if (score >= 2.4) return '\u8eab\u65fa';
  if (score <= -1.6) return '\u8eab\u5f31';
  return '\u4e2d\u548c';
}

function resolveElementPair(dayElement: string, bodyStrength: string) {
  const support = ELEMENT_SUPPORTS[dayElement] || '';
  const controlTarget = ELEMENT_CONTROLS[dayElement] || '';
  const controlledBy = Object.keys(ELEMENT_CONTROLS).find((key) => ELEMENT_CONTROLS[key] === dayElement) || '';

  if (bodyStrength === '\u8eab\u65fa') {
    return {
      lucky: [controlTarget, controlledBy].filter(Boolean).join('\uff0c'),
      unlucky: [support, dayElement].filter(Boolean).join('\uff0c')
    };
  }

  if (bodyStrength === '\u8eab\u5f31') {
    return {
      lucky: [support, dayElement].filter(Boolean).join('\uff0c'),
      unlucky: [controlTarget, controlledBy].filter(Boolean).join('\uff0c')
    };
  }

  return {
    lucky: [dayElement, support].filter(Boolean).join('\uff0c'),
    unlucky: [controlTarget, controlledBy].filter(Boolean).join('\uff0c')
  };
}

function buildBaziReport(input: CalculatedBazi) {
  return [
    '\u3010\u516b\u5b57\u547d\u76d8\u3011',
    `\u5e74\u67f1\uff1a${input.yearPillar}`,
    `\u6708\u67f1\uff1a${input.monthPillar}`,
    `\u65e5\u67f1\uff1a${input.dayPillar}`,
    `\u65f6\u67f1\uff1a${input.hourPillar}`,
    '',
    `\u65e5\u4e3b\uff1a${input.dayPillar.charAt(0)}\uff08${input.dayElement}\uff09`,
    `\u547d\u5c40\uff1a${input.bodyStrength}`,
    `\u559c\u7528\uff1a${input.luckyElementsText}`,
    `\u5fcc\u795e\uff1a${input.unluckyElementsText}`
  ].join('\n');
}

export function buildWorkflowBaziString(params: {
  gender: string;
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
}) {
  const genderLabel = params.gender === 'female' ? '\u5973\u5609\u5bbe' : '\u7537\u5609\u5bbe';
  return `${genderLabel}\uff1a\u5e74\u67f1\uff1a${params.yearPillar}\uff0c\u6708\u67f1\uff1a${params.monthPillar}\u3002\u65e5\u67f1\uff1a${params.dayPillar}\uff0c\u65f6\u67f1\uff1a${params.hourPillar}`;
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
  const year = birthDate.getUTCFullYear();
  const month = birthDate.getUTCMonth() + 1;
  const day = birthDate.getUTCDate();
  const hour = Number(hourText || 12);
  const minute = Number(minuteText || 0);
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();

  const yearPillar = String(lunar.getYearInGanZhi() || '');
  const monthPillar = String(lunar.getMonthInGanZhi() || '');
  const dayPillar = String(lunar.getDayInGanZhi() || '');
  const hourPillar = String(lunar.getTimeInGanZhi() || '');
  const dayElement = STEM_ELEMENTS[dayPillar.charAt(0)] || '';
  const bodyStrength = resolveBodyStrength(dayPillar, monthPillar, hourPillar, yearPillar);
  const pairs = resolveElementPair(dayElement, bodyStrength);

  const payload: CalculatedBazi = {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayElement,
    bodyStrength,
    luckyElementsText: pairs.lucky,
    unluckyElementsText: pairs.unlucky,
    report: ''
  };
  payload.report = buildBaziReport(payload);
  return payload;
}
