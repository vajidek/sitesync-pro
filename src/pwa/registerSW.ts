/**
 * SiteSync Pro - PWA Service Worker Registration Manager
 * Controlled by the `VITE_PWA_ENABLE` environment variable.
 * 
 * Rules:
 * - `VITE_PWA_ENABLE=true`: Registers `/sw.js`
 * - `VITE_PWA_ENABLE=false`: Does NOT register `/sw.js` (unregisters existing workers)
 * - Missing / Undefined: Defaults to `false`
 */

export function isPwaEnabled(): boolean {
  const envVal = import.meta.env.VITE_PWA_ENABLE;
  if (envVal === undefined || envVal === null || envVal === '') {
    return false; // Default to false if missing
  }
  return String(envVal).trim().toLowerCase() === 'true';
}

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const enabled = isPwaEnabled();

  if (enabled) {
    // VITE_PWA_ENABLE is true -> Register Service Worker
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA SW] Service Worker registered successfully (VITE_PWA_ENABLE=true):', registration.scope);
        })
        .catch((error) => {
          console.error('[PWA SW] Service Worker registration failed:', error);
        });
    });
  } else {
    // VITE_PWA_ENABLE is false or missing -> Do NOT register Service Worker
    // Unregister any active registrations & clear caches for clean state
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('[PWA SW] Unregistered active Service Worker because VITE_PWA_ENABLE is false or missing');
        });
      }
    });

    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        for (const cacheName of cacheNames) {
          caches.delete(cacheName);
        }
      });
    }

    console.log('[PWA SW] Service Worker registration disabled (VITE_PWA_ENABLE is false or missing)');
  }
}
