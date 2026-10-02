import { getAuthToken } from './safeFetch';

/**
 * Universal API Fetch Interceptor for SiteSync Pro ERP.
 * Automatically injects the active Bearer token into all outgoing /api requests
 * so that all UI components, buttons, and forms authenticate seamlessly with the backend.
 */
export function setupFetchInterceptor() {
  if (typeof window === 'undefined') return;

  // Prevent double-wrapping
  if ((window as any).__sitesync_fetch_intercepted) return;
  (window as any).__sitesync_fetch_intercepted = true;

  try {
    const originalFetch = window.fetch.bind(window);

    const interceptedFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const token = getAuthToken();

      // Determine url string
      const urlString =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.toString()
          : input.url;

      // Only intercept local API requests
      const isApiRequest =
        urlString.startsWith('/api') ||
        urlString.startsWith('http://localhost:3000/api') ||
        urlString.includes('/api/');

      if (isApiRequest && token) {
        if (typeof input === 'string' || input instanceof URL) {
          const headers = new Headers(init?.headers || {});
          if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
          }
          return originalFetch(input, { ...init, headers });
        } else if (input instanceof Request) {
          const headers = new Headers(input.headers);
          if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
          }
          const newReq = new Request(input, { headers });
          return originalFetch(newReq, init);
        }
      }

      return originalFetch(input, init);
    };

    // Use Object.defineProperty to avoid "Cannot set property fetch of #<Window> which has only a getter"
    try {
      Object.defineProperty(window, 'fetch', {
        value: interceptedFetch,
        writable: true,
        configurable: true,
      });
      (window as any).__sitesync_fetch_intercepted = true;
    } catch {
      // Prototype fallback
      try {
        const proto = Object.getPrototypeOf(window);
        if (proto) {
          Object.defineProperty(proto, 'fetch', {
            value: interceptedFetch,
            writable: true,
            configurable: true,
          });
          (window as any).__sitesync_fetch_intercepted = true;
        }
      } catch {
        // Last resort try direct assignment, ignore if not allowed
        try {
          (window as any).fetch = interceptedFetch;
          (window as any).__sitesync_fetch_intercepted = true;
        } catch {
          // Sandboxed environment prevents monkey-patching fetch; safeFetchJson handles tokens explicitly
        }
      }
    }
  } catch (err) {
    console.warn('Could not initialize fetch interceptor:', err);
  }
}
