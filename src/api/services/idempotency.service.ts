import { idempotencyRepository, IdempotencyRepository, ClaimResult, IdempotencyRecord } from '../repositories/idempotency.repository';

export interface IdempotencyContext {
  key: string;
  userId: string;
  method: string;
  routePath: string;
  requestPayload: any;
  lockDurationSec?: number;
  ttlHours?: number;
}

export class IdempotencyService {
  /**
   * Evaluates or claims an idempotency key.
   */
  async evaluateKey(ctx: IdempotencyContext): Promise<ClaimResult> {
    const requestHash = IdempotencyRepository.hashPayload(ctx.requestPayload);
    return await idempotencyRepository.claimKey({
      key: ctx.key,
      userId: ctx.userId,
      method: ctx.method,
      routePath: ctx.routePath,
      requestHash,
      lockDurationSec: ctx.lockDurationSec,
      ttlHours: ctx.ttlHours,
    });
  }

  /**
   * Finalizes the response storage for a completed operation.
   */
  async recordSuccess(
    key: string,
    userId: string,
    statusCode: number,
    responseBody: any,
    responseHeaders?: any
  ): Promise<void> {
    await idempotencyRepository.completeKey({
      key,
      userId,
      statusCode,
      responseBody,
      responseHeaders,
    });
  }

  /**
   * Releases or marks a key as failed when an operation rolls back.
   */
  async recordFailure(key: string, userId: string, errorMessage?: string): Promise<void> {
    await idempotencyRepository.releaseKey(key, userId);
  }

  /**
   * Cleanup expired keys.
   */
  async purgeExpired(): Promise<number> {
    return await idempotencyRepository.cleanupExpired();
  }
}

export const idempotencyService = new IdempotencyService();
