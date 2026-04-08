import { env } from '../../config/env';

type WorkflowType = 'personal' | 'compatibility' | 'dayun';

function resolveWorkflowConfig(type: WorkflowType) {
  if (type === 'dayun') {
    return {
      url: env.dayunApiUrl,
      key: env.dayunApiKey,
      missingKeyName: 'DAYUN_API_KEY'
    };
  }

  if (type === 'compatibility') {
    return {
      url: env.compatibilityApiUrl,
      key: env.compatibilityApiKey,
      missingKeyName: 'COMPATIBILITY_API_KEY'
    };
  }

  return {
    url: env.murronApiUrl,
    key: env.murronApiKey,
    missingKeyName: 'MURRON_API_KEY'
  };
}

async function callWorkflow(params: {
  type: WorkflowType;
  inputs: Record<string, unknown>;
  userId: string;
}) {
  const workflow = resolveWorkflowConfig(params.type);
  if (!workflow.key) {
    throw new Error(`${workflow.missingKeyName} is not configured`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.murronTimeoutMs);

  try {
    const response = await fetch(workflow.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${workflow.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: params.inputs,
        response_mode: 'blocking',
        user: params.userId || 'system'
      }),
      signal: controller.signal
    });

    const json = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      throw new Error(String((json as { message?: string }).message || `workflow request failed: ${response.status}`));
    }
    return json;
  } finally {
    clearTimeout(timer);
  }
}

export function tryParseWorkflowJson(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value !== 'string') return null;

  const cleaned = value
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function extractWorkflowPayload(response: Record<string, unknown>) {
  const data = (response.data || {}) as Record<string, unknown>;
  const outputs = (data.outputs || response.outputs || {}) as Record<string, unknown>;
  const candidate = outputs.res || outputs.json || outputs.result || outputs.text || response;
  const payload = tryParseWorkflowJson(candidate);
  const fullText = typeof candidate === 'string' ? candidate : JSON.stringify(payload || candidate);
  return { payload, fullText };
}

export async function runPersonalWorkflow(params: {
  userId: string;
  bazi: string;
}) {
  return callWorkflow({
    type: 'personal',
    userId: params.userId,
    inputs: {
      bazi: params.bazi,
      current_date: env.murronCurrentDate
    }
  });
}

export async function runCompatibilityWorkflow(params: {
  userId: string;
  bazi: string;
  targetBazi: string;
}) {
  return callWorkflow({
    type: 'compatibility',
    userId: params.userId,
    inputs: {
      bazi: params.bazi,
      target_bazi: params.targetBazi,
      current_date: env.murronCurrentDate
    }
  });
}

export async function runDayunWorkflow(params: {
  userId: string;
  bazi: string;
  currentLuckPillar: string;
  gender: string;
}) {
  return callWorkflow({
    type: 'dayun',
    userId: params.userId,
    inputs: {
      bazi: params.bazi,
      current_luck_pillar: params.currentLuckPillar,
      gender: params.gender === 'female' ? '\u5973' : '\u7537'
    }
  });
}
