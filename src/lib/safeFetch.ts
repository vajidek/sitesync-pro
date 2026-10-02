/**
 * Safe JSON parser and authenticated fetch utility for ERP APIs.
 * Prevents `SyntaxError: Unexpected EOF` and ensures all requests carry JWT authentication.
 */

import { getStoredAccessToken } from './authStorage';

export function getAuthToken(): string {
  return getStoredAccessToken();
}

export async function safeJson<T = any>(res: Response): Promise<T | null> {
  try {
    const text = await res.text();
    if (!text || !text.trim()) {
      return null;
    }
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function safeFetchJson<T = any>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const token = getAuthToken();
    const headers = new Headers(init?.headers || {});
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const res = await fetch(url, { ...init, headers });
    if (!res.ok) {
      return null;
    }
    return await safeJson<T>(res);
  } catch {
    return null;
  }
}
