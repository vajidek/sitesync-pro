export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'sitesync-pro-enterprise-jwt-access-secret-2026-key',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'sitesync-pro-enterprise-jwt-refresh-secret-2026-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  APP_NAME: 'SiteSync Pro',
  DEVELOPER: 'Abdul Vajid EK',
};

/**
 * Enterprise Production Isolation Guard:
 * Returns true only in development/sandbox environments or when explicitly enabled.
 * Strictly prevents automated generation of fake employees, fake projects, fake POs,
 * or fake transactions in UAT and PRODUCTION modes.
 */
export function isDemoSeedAllowed(): boolean {
  if (process.env.APP_ENVIRONMENT === 'PRODUCTION' || process.env.APP_ENVIRONMENT === 'UAT') {
    return false;
  }
  if (process.env.NODE_ENV === 'production') {
    return process.env.ENABLE_DEMO_SEED === 'true';
  }
  return true;
}
