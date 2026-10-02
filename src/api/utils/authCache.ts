import { UserRole } from '../../types';

export interface AuthContext {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roleId: string;
  roleName?: string;
  department: string;
  phone: string;
  avatarUrl?: string;
  assignedProjectId?: string;
  assignedProjectName?: string;
  isActive: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  accountStatus: string;
  isLocked: boolean;
  permissions: string[];
  cachedAt: number;
  expiresAt: number;
}

interface CacheEntry {
  context: AuthContext;
  expiresAt: number;
}

export class AuthCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxEntries: number;
  private readonly ttlMs: number;

  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private invalidations = 0;

  constructor(maxEntries = 5000, ttlSeconds = 30) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlSeconds * 1000;
  }

  get(userId: string): AuthContext | null {
    const entry = this.cache.get(userId);
    if (!entry) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(userId);
      this.misses++;
      return null;
    }

    // Refresh LRU order (delete & re-insert)
    this.cache.delete(userId);
    this.cache.set(userId, entry);

    this.hits++;
    return entry.context;
  }

  set(userId: string, context: AuthContext): void {
    const now = Date.now();
    const expiresAt = now + this.ttlMs;

    // Enforce max capacity limit (LRU eviction)
    if (this.cache.size >= this.maxEntries && !this.cache.has(userId)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.evictions++;
      }
    }

    this.cache.set(userId, {
      context: {
        ...context,
        cachedAt: now,
        expiresAt,
      },
      expiresAt,
    });
  }

  invalidateUser(userId: string): boolean {
    const existed = this.cache.delete(userId);
    if (existed) {
      this.invalidations++;
    }
    return existed;
  }

  invalidateRole(roleIdOrCode: string): number {
    let count = 0;
    for (const [userId, entry] of this.cache.entries()) {
      if (entry.context.roleId === roleIdOrCode || entry.context.role === roleIdOrCode) {
        this.cache.delete(userId);
        this.invalidations++;
        count++;
      }
    }
    return count;
  }

  clearAll(): void {
    const count = this.cache.size;
    this.cache.clear();
    this.invalidations += count;
  }

  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      invalidations: this.invalidations,
      size: this.cache.size,
      maxEntries: this.maxEntries,
      ttlSeconds: this.ttlMs / 1000,
    };
  }
}

export const authCache = new AuthCache(5000, 30);
