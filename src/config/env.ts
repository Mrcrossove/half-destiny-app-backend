import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3020),
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'Half Destiny',
  appScheme: process.env.APP_SCHEME || 'banhe',
  jwtSecret: process.env.JWT_SECRET || 'replace_with_secure_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  refreshTokenExpiresDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30),
  dbHost: process.env.DB_HOST || '127.0.0.1',
  dbPort: Number(process.env.DB_PORT || 5432),
  dbName: process.env.DB_NAME || 'half_destiny_app',
  dbUser: process.env.DB_USER || 'postgres',
  dbPassword: process.env.DB_PASSWORD || '',
  dbLogging: String(process.env.DB_LOGGING || 'false').toLowerCase() === 'true',
  allowedOrigins: process.env.ALLOWED_ORIGINS || '*',
  supportEmail: process.env.SUPPORT_EMAIL || '17586710715@163.com',
  legalEmail: process.env.LEGAL_EMAIL || 'admin@halfdestiny.com',
  ossBucket: process.env.OSS_BUCKET || '',
  ossRegion: process.env.OSS_REGION || '',
  ossEndpoint: process.env.OSS_ENDPOINT || '',
  ossAccessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
  ossAccessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
  ossPublicBaseUrl: process.env.OSS_PUBLIC_BASE_URL || '',
  appleBundleId: process.env.APPLE_BUNDLE_ID || 'com.halfdestiny.app',
  appleSharedSecret: process.env.APPLE_SHARED_SECRET || '',
  googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID || '',
  googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID || '',
  googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID || ''
} as const;
