/**
 * SiteSync Pro - Production Service Worker
 * Loaded ONLY in Production Mode (`import.meta.env.PROD`).
 * 
 * Features:
 * - Static shell asset pre-caching
 * - Cache-first strategy for static assets
 * - Network-first strategy for API routes with offline JSON fallback
 * - Background sync for offline site logs / field data
 */

const CACHE_NAME = 'sitesync-pro-v1.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. Install Event - Cache initial static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event - Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event - Handles network strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Do not intercept Vite dev server requests, HMR, or source modules
  if (
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.jsx') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.search.includes('import') ||
    url.search.includes('t=') ||
    url.search.includes('v=') ||
    url.pathname.includes('hot-update') ||
    url.protocol.startsWith('chrome')
  ) {
    return;
  }

  // Network-First for API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return new Response(
              JSON.stringify({
                success: false,
                offline: true,
                message: 'Offline mode active: Response served from PWA offline cache',
              }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Cache-First with Network fallback for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch((err) => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html').then((indexMatch) => {
              return indexMatch || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/html' } });
            });
          }
          // Do not return empty string for scripts/resources as it causes SyntaxError: Unexpected EOF
          return Promise.reject(err);
        });
    })
  );
});

// 4. Background Sync - Sync offline field logs when reconnected
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-site-logs' || event.tag === 'sync-offline-queue') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'BACKGROUND_SYNC_TRIGGERED',
            tag: event.tag,
            timestamp: new Date().toISOString(),
          });
        });
      })
    );
  }
});
