import { randomBytes } from 'node:crypto';

const nodeEnv = process.env.NODE_ENV || 'development';
const appEnvironment = (process.env.APP_ENVIRONMENT || (nodeEnv === 'production' ? 'PRODUCTION' : 'DEMO')).toUpperCase();
const isLockedEnvironment = appEnvironment === 'UAT' || appEnvironment === 'PRODUCTION' || nodeEnv === 'production';

function resolveSecret(name: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string {
  const configured = process.env[name]?.trim();
  if (configured) return configured;

  if (isLockedEnvironment) {
    throw new Error(
      `FATAL SECURITY CONFIGURATION ERROR: ${name} must be supplied explicitly in UAT/PRODUCTION. Refusing to start with an insecure fallback secret.`
    );
  }

  // Development/demo fallback is intentionally process-local and random.
  // It is not suitable for shared environments and is regenerated on restart.
  return randomBytes(48).toString('hex');
}

export const ENV = {
  NODE_ENV: nodeEnv,
  APP_ENVIRONMENT: appEnvironment,
  PORT: Number(process.env.PORT || 3000),
  ALLOWED_ORIGINS: (process.env.APP_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  JWT_SECRET: resolveSecret('JWT_SECRET'),
  JWT_REFRESH_SECRET: resolveSecret('JWT_REFRESH_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  APP_NAME: 'SiteSync Pro',
  DEVELOPER: 'Abdul Vajid EK',
};

/**
 * Demo seed data is an explicit environment capability.
 * Never generate fake business/identity transactions in UAT or PRODUCTION.
 */
export function isDemoSeedAllowed(): boolean {
  if (ENV.APP_ENVIRONMENT === 'PRODUCTION' || ENV.APP_ENVIRONMENT === 'UAT') {
    return false;
  }

  if (ENV.NODE_ENV === 'production') {
    return process.env.ENABLE_DEMO_SEED === 'true';
  }

  return process.env.ENABLE_DEMO_SEED === 'false' ? false : true;
}
