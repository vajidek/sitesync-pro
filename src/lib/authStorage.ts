// SiteSync Pro — canonical client authentication storage.
// Authorization remains server-authoritative; this module only stores transport tokens.
// Legacy aliases are migrated once and then removed to avoid multiple competing auth states.

const ACCESS_KEY = 'sitesync.auth.access';
const REFRESH_KEY = 'sitesync.auth.refresh';

const LEGACY_ACCESS_KEYS = [
  'sitesync_jwt_access_token',
  'sitesync_access_token',
  'token',
  'accessToken',
];

const LEGACY_REFRESH_KEYS = [
  'sitesync_jwt_refresh_token',
  'sitesync_refresh_token',
  'refreshToken',
];

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function removeKeys(keys: string[]): void {
  if (!isBrowser()) return;
  for (const key of keys) localStorage.removeItem(key);
}

function migrateFirst(keys: string[], canonicalKey: string): string {
  if (!isBrowser()) return '';
  const canonical = localStorage.getItem(canonicalKey) || '';
  if (canonical) return canonical;

  for (const key of keys) {
    const value = localStorage.getItem(key) || '';
    if (value) {
      localStorage.setItem(canonicalKey, value);
      removeKeys(keys);
      return value;
    }
  }

  return '';
}

export function getStoredAccessToken(): string {
  return migrateFirst(LEGACY_ACCESS_KEYS, ACCESS_KEY);
}

export function getStoredRefreshToken(): string {
  return migrateFirst(LEGACY_REFRESH_KEYS, REFRESH_KEY);
}

export function setStoredAuthTokens(accessToken: string, refreshToken: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  else localStorage.removeItem(REFRESH_KEY);
  removeKeys(LEGACY_ACCESS_KEYS);
  removeKeys(LEGACY_REFRESH_KEYS);
}

export function clearStoredAuthTokens(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  removeKeys(LEGACY_ACCESS_KEYS);
  removeKeys(LEGACY_REFRESH_KEYS);
}
