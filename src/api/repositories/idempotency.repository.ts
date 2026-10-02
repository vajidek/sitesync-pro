import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../db';
import { idempotencyKeys } from '../../db/schema';
import crypto from 'crypto';

export interface IdempotencyRecord {
  id: string;
  key: string;
  userId: string;
  method: string;
  routePath: string;
  requestHash: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  statusCode?: number | null;
  responseBody?: any;
  responseHeaders?: any;
  createdAt: string;
  completedAt?: string | null;
  lockedUntil: string;
  expiresAt: string;
  replayCount: number;
}

export type ClaimResult =
  | { status: 'CLAIMED'; record: IdempotencyRecord }
  | { status: 'COMPLETED'; record: IdempotencyRecord }
  | { status: 'IN_PROGRESS'; record: IdempotencyRecord }
  | { status: 'MISMATCH_PAYLOAD'; record: IdempotencyRecord }
  | { status: 'MISMATCH_ROUTE'; record: IdempotencyRecord }
  | { status: 'MISMATCH_USER'; record: IdempotencyRecord };

export class IdempotencyRepository {
  private static isTableEnsured = false;

  async ensureTable(): Promise<void> {
    if (IdempotencyRepository.isTableEnsured) return;
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS idempotency_keys (
          id TEXT PRIMARY KEY,
          key TEXT NOT NULL,
          user_id TEXT NOT NULL,
          method TEXT NOT NULL,
          route_path TEXT NOT NULL,
          request_hash TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
          status_code INTEGER,
          response_body JSONB,
          response_headers JSONB,
          created_at TEXT NOT NULL,
          completed_at TEXT,
          locked_until TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          replay_count INTEGER NOT NULL DEFAULT 0
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_idempotency_keys_key_user 
          ON idempotency_keys (key, user_id);

        CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires 
          ON idempotency_keys (expires_at);
      `);
      IdempotencyRepository.isTableEnsured = true;
    } catch (err) {
      console.error('Error ensuring idempotency_keys table exists:', err);
    }
  }

  /**
   * Compute deterministic SHA-256 hash of a payload object or string.
   */
  static hashPayload(payload: any): string {
    if (payload === undefined || payload === null) {
      return crypto.createHash('sha256').update('').digest('hex');
    }
    if (typeof payload === 'string') {
      return crypto.createHash('sha256').update(payload.trim()).digest('hex');
    }
    // Normalize object by sorting keys recursively
    const normalize = (obj: any): any => {
      if (obj === null || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map(normalize);
      return Object.keys(obj)
        .sort()
        .reduce((result: Record<string, any>, k) => {
          result[k] = normalize(obj[k]);
          return result;
        }, {});
    };
    const normalizedJson = JSON.stringify(normalize(payload));
    return crypto.createHash('sha256').update(normalizedJson).digest('hex');
  }

  /**
   * Atomically claim or lookup an idempotency key.
   */
  async claimKey(params: {
    key: string;
    userId: string;
    method: string;
    routePath: string;
    requestHash: string;
    lockDurationSec?: number;
    ttlHours?: number;
  }): Promise<ClaimResult> {
    await this.ensureTable();
    const {
      key,
      userId,
      method,
      routePath,
      requestHash,
      lockDurationSec = 60,
      ttlHours = 24,
    } = params;

    const now = new Date();
    const nowIso = now.toISOString();
    const lockedUntil = new Date(now.getTime() + lockDurationSec * 1000).toISOString();
    const expiresAt = new Date(now.getTime() + ttlHours * 3600 * 1000).toISOString();

    // Check existing key across all users first to detect cross-user collision
    const existingKeyRows = await db
      .select()
      .from(idempotencyKeys)
      .where(eq(idempotencyKeys.key, key))
      .limit(1);

    if (existingKeyRows.length > 0) {
      const existing = existingKeyRows[0] as IdempotencyRecord;

      // Security check: Key belongs to a different user
      if (existing.userId !== userId) {
        return { status: 'MISMATCH_USER', record: existing };
      }

      // Route check
      if (existing.routePath !== routePath) {
        return { status: 'MISMATCH_ROUTE', record: existing };
      }

      // Payload check
      if (existing.requestHash !== requestHash) {
        return { status: 'MISMATCH_PAYLOAD', record: existing };
      }

      // Check if completed
      if (existing.status === 'COMPLETED') {
        // Increment replay count asynchronously
        await this.incrementReplayCount(key, userId);
        return { status: 'COMPLETED', record: existing };
      }

      // Check if in progress with valid active lock
      if (existing.status === 'IN_PROGRESS') {
        const lockExpiration = new Date(existing.lockedUntil).getTime();
        if (lockExpiration > now.getTime()) {
          // Lock is still active, another request is processing
          return { status: 'IN_PROGRESS', record: existing };
        }
      }

      // If status is FAILED or lock has expired, reclaim the record
      const updated = await db
        .update(idempotencyKeys)
        .set({
          status: 'IN_PROGRESS',
          method,
          routePath,
          requestHash,
          lockedUntil,
          expiresAt,
        })
        .where(and(eq(idempotencyKeys.key, key), eq(idempotencyKeys.userId, userId)))
        .returning();

      return { status: 'CLAIMED', record: updated[0] as IdempotencyRecord };
    }

    // No existing key: create new in-progress claim
    const id = `idem_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const newRecord: IdempotencyRecord = {
      id,
      key,
      userId,
      method,
      routePath,
      requestHash,
      status: 'IN_PROGRESS',
      statusCode: null,
      responseBody: null,
      responseHeaders: null,
      createdAt: nowIso,
      completedAt: null,
      lockedUntil,
      expiresAt,
      replayCount: 0,
    };

    try {
      await db.insert(idempotencyKeys).values(newRecord);
      return { status: 'CLAIMED', record: newRecord };
    } catch (insertErr: any) {
      // Handle concurrent race-condition insert
      const reQuery = await db
        .select()
        .from(idempotencyKeys)
        .where(eq(idempotencyKeys.key, key))
        .limit(1);

      if (reQuery.length > 0) {
        const raceExisting = reQuery[0] as IdempotencyRecord;
        if (raceExisting.userId !== userId) {
          return { status: 'MISMATCH_USER', record: raceExisting };
        }
        if (raceExisting.routePath !== routePath) {
          return { status: 'MISMATCH_ROUTE', record: raceExisting };
        }
        if (raceExisting.requestHash !== requestHash) {
          return { status: 'MISMATCH_PAYLOAD', record: raceExisting };
        }
        if (raceExisting.status === 'COMPLETED') {
          await this.incrementReplayCount(key, userId);
          return { status: 'COMPLETED', record: raceExisting };
        }
        return { status: 'IN_PROGRESS', record: raceExisting };
      }
      throw insertErr;
    }
  }

  /**
   * Finalize and cache the completed response.
   */
  async completeKey(params: {
    key: string;
    userId: string;
    statusCode: number;
    responseBody: any;
    responseHeaders?: any;
  }): Promise<void> {
    await this.ensureTable();
    const nowIso = new Date().toISOString();
    await db
      .update(idempotencyKeys)
      .set({
        status: 'COMPLETED',
        statusCode: params.statusCode,
        responseBody: params.responseBody,
        responseHeaders: params.responseHeaders || null,
        completedAt: nowIso,
      })
      .where(
        and(
          eq(idempotencyKeys.key, params.key),
          eq(idempotencyKeys.userId, params.userId)
        )
      );
  }

  /**
   * Mark key as FAILED or release lock on failure.
   */
  async failKey(key: string, userId: string, errorDetails?: string): Promise<void> {
    await this.ensureTable();
    await db
      .update(idempotencyKeys)
      .set({
        status: 'FAILED',
        responseBody: { error: errorDetails || 'Operation failed during execution' },
        completedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(idempotencyKeys.key, key),
          eq(idempotencyKeys.userId, userId)
        )
      );
  }

  /**
   * Release key completely to allow immediate retry after rollback.
   */
  async releaseKey(key: string, userId: string): Promise<void> {
    await this.ensureTable();
    await db
      .delete(idempotencyKeys)
      .where(
        and(
          eq(idempotencyKeys.key, key),
          eq(idempotencyKeys.userId, userId)
        )
      );
  }

  /**
   * Increment replay counter for observability.
   */
  async incrementReplayCount(key: string, userId: string): Promise<void> {
    try {
      await db
        .update(idempotencyKeys)
        .set({
          replayCount: sql`${idempotencyKeys.replayCount} + 1`,
        })
        .where(
          and(
            eq(idempotencyKeys.key, key),
            eq(idempotencyKeys.userId, userId)
          )
        );
    } catch {
      // Non-critical telemetry update
    }
  }

  /**
   * Purge expired idempotency keys past TTL.
   */
  async cleanupExpired(): Promise<number> {
    await this.ensureTable();
    const nowIso = new Date().toISOString();
    const res = await db
      .delete(idempotencyKeys)
      .where(sql`${idempotencyKeys.expiresAt} < ${nowIso}`);
    return (res as any)?.rowCount || 0;
  }
}

export const idempotencyRepository = new IdempotencyRepository();
