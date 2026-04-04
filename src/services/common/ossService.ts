import path from 'path';
import OSS from 'ali-oss';
import { env } from '../../config/env';

const IMAGE_MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif'
};

let ossClient: OSS | null = null;

function ensureOssConfig() {
  if (!env.ossBucket || !env.ossRegion || !env.ossEndpoint || !env.ossAccessKeyId || !env.ossAccessKeySecret) {
    throw new Error('OSS is not fully configured');
  }
}

function getOssClient() {
  ensureOssConfig();
  if (!ossClient) {
    ossClient = new OSS({
      bucket: env.ossBucket,
      region: env.ossRegion,
      endpoint: env.ossEndpoint,
      accessKeyId: env.ossAccessKeyId,
      accessKeySecret: env.ossAccessKeySecret
    });
  }
  return ossClient;
}

function buildFileExtension(mimeType: string, originalName: string) {
  const mapped = IMAGE_MIME_EXTENSIONS[mimeType];
  if (mapped) return mapped;

  const ext = path.extname(originalName || '').trim().toLowerCase();
  return ext || '.jpg';
}

export function buildUserPhotoKey(userId: string, mimeType: string, originalName: string) {
  const extension = buildFileExtension(mimeType, originalName);
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `users/${userId}/photos/${timestamp}-${randomPart}${extension}`;
}

export function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

export function normalizeStoredPhotoValue(value: unknown) {
  const text = String(value || '').trim();
  if (!text) return '';

  if (text.startsWith('oss://')) {
    const withoutProtocol = text.slice('oss://'.length);
    const bucketPrefix = `${env.ossBucket}/`;
    return withoutProtocol.startsWith(bucketPrefix) ? withoutProtocol.slice(bucketPrefix.length) : withoutProtocol;
  }

  if (isRemoteUrl(text)) {
    try {
      const url = new URL(text);
      const publicBaseUrl = String(env.ossPublicBaseUrl || '').trim();
      const endpointHost = String(env.ossEndpoint || '').trim().replace(/^https?:\/\//i, '');
      const defaultBucketHost = `${env.ossBucket}.${endpointHost}`;
      const publicHost = publicBaseUrl ? new URL(publicBaseUrl).host : '';

      if (url.host === defaultBucketHost || (publicHost && url.host === publicHost)) {
        return url.pathname.replace(/^\/+/, '');
      }
    } catch {
      return text;
    }

    return text;
  }

  return text.replace(/^\/+/, '');
}

export function isOwnedPhotoKey(userId: string, value: unknown) {
  const key = normalizeStoredPhotoValue(value);
  return key.startsWith(`users/${userId}/photos/`);
}

export function signPhotoUrl(value: unknown) {
  const normalized = normalizeStoredPhotoValue(value);
  if (!normalized) return '';
  if (isRemoteUrl(normalized)) return normalized;

  const client = getOssClient();
  return client.signatureUrl(normalized, { expires: 60 * 60 * 24 * 7 });
}

export async function uploadPhotoToOss(params: {
  userId: string;
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}) {
  const key = buildUserPhotoKey(params.userId, params.mimeType, params.originalName);
  const client = getOssClient();

  await client.put(key, params.buffer, {
    mime: params.mimeType,
    headers: {
      'Content-Type': params.mimeType
    }
  });

  return {
    key,
    url: signPhotoUrl(key)
  };
}
