import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { idempotencyRepository, IdempotencyRepository } from '../repositories/idempotency.repository';
import { sendError } from '../utils/response';
import { verifyAccessToken } from '../utils/jwt';

export interface IdempotencyOptions {
  required?: boolean;
  ttlHours?: number;
  lockDurationSec?: number;
}

/**
 * Universal Enterprise Idempotency Middleware for SiteSync Pro ERP.
 */
export function idempotency(options: IdempotencyOptions = {}) {
  const { required = false, ttlHours = 24, lockDurationSec = 60 } = options;

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Idempotency applies exclusively to mutating HTTP verbs
    const method = req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return next();
    }

    const rawHeader =
      req.headers['idempotency-key'] !== undefined
        ? req.headers['idempotency-key']
        : req.headers['x-idempotency-key'];

    if (rawHeader === undefined || rawHeader === null) {
      if (required) {
        return sendError(
          res,
          'Idempotency-Key header is required for this transactional operation.',
          400,
          undefined,
          { requiredHeader: 'Idempotency-Key' }
        );
      }
      return next();
    }

    const rawKey = Array.isArray(rawHeader) ? rawHeader[0] : String(rawHeader);
    const key = rawKey.trim();

    if (key.length === 0 || key.length > 256) {
      return sendError(
        res,
        'Invalid Idempotency-Key format. Must be a non-empty string between 1 and 256 characters.',
        400
      );
    }

    // Resolve user ID from request user or JWT token directly
    let userId = req.user?.id;
    if (!userId && req.headers.authorization?.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const payload = verifyAccessToken(token);
        userId = payload.userId;
      } catch {
        // Unverified token
      }
    }
    if (!userId) {
      userId = 'anonymous';
    }

    // Normalized route path (ignoring query strings and trailing slashes)
    const routePath = (req.originalUrl || req.path || '/').split('?')[0].replace(/\/+$/, '') || '/';
    const requestHash = IdempotencyRepository.hashPayload(req.body);

    try {
      const claim = await idempotencyRepository.claimKey({
        key,
        userId,
        method,
        routePath,
        requestHash,
        lockDurationSec,
        ttlHours,
      });

      if (claim.status === 'MISMATCH_USER') {
        return sendError(
          res,
          'Forbidden: Idempotency key was created by a different authenticated user.',
          403
        );
      }

      if (claim.status === 'MISMATCH_ROUTE') {
        return sendError(
          res,
          `Conflict: Idempotency key '${key}' has already been utilized for a different endpoint (${claim.record.routePath}).`,
          409
        );
      }

      if (claim.status === 'MISMATCH_PAYLOAD') {
        return sendError(
          res,
          `Conflict: Idempotency key '${key}' was already executed with a different request payload. Reusing keys with modified parameters is strictly prohibited.`,
          409
        );
      }

      if (claim.status === 'IN_PROGRESS') {
        return sendError(
          res,
          `Conflict: A concurrent transaction with Idempotency-Key '${key}' is currently being processed. Please retry shortly.`,
          409,
          undefined,
          { inProgress: true, retryAfterSeconds: 2 }
        );
      }

      if (claim.status === 'COMPLETED') {
        // Safe cached response replay
        res.setHeader('X-Idempotent-Replay', 'true');
        res.setHeader('X-Idempotency-Key', key);
        const statusCode = claim.record.statusCode || 200;
        return res.status(statusCode).json(claim.record.responseBody);
      }

      // Claim status is 'CLAIMED' -> Intercept response
      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);
      let isFinalized = false;

      res.json = function (body: any): Response {
        if (!isFinalized) {
          isFinalized = true;
          const statusCode = res.statusCode || 200;
          res.setHeader('X-Idempotency-Key', key);

          if (statusCode >= 200 && statusCode < 300) {
            // Synchronously await completion before finishing HTTP stream
            idempotencyRepository
              .completeKey({
                key,
                userId,
                statusCode,
                responseBody: body,
              })
              .then(() => {
                originalJson(body);
              })
              .catch((err) => {
                console.error('[Idempotency] Error caching response:', err);
                originalJson(body);
              });
            return res;
          } else {
            idempotencyRepository
              .releaseKey(key, userId)
              .then(() => {
                originalJson(body);
              })
              .catch((err) => {
                console.error('[Idempotency] Error releasing failed key:', err);
                originalJson(body);
              });
            return res;
          }
        }
        return originalJson(body);
      };

      res.send = function (body: any): Response {
        if (!isFinalized) {
          isFinalized = true;
          const statusCode = res.statusCode || 200;
          res.setHeader('X-Idempotency-Key', key);

          let parsedBody = body;
          if (typeof body === 'string') {
            try {
              parsedBody = JSON.parse(body);
            } catch {
              parsedBody = { raw: body };
            }
          }

          if (statusCode >= 200 && statusCode < 300) {
            idempotencyRepository
              .completeKey({
                key,
                userId,
                statusCode,
                responseBody: parsedBody,
              })
              .then(() => {
                originalSend(body);
              })
              .catch((err) => {
                console.error('[Idempotency] Error caching send:', err);
                originalSend(body);
              });
            return res;
          } else {
            idempotencyRepository
              .releaseKey(key, userId)
              .then(() => {
                originalSend(body);
              })
              .catch((err) => {
                console.error('[Idempotency] Error releasing failed key:', err);
                originalSend(body);
              });
            return res;
          }
        }
        return originalSend(body);
      };

      next();
    } catch (err: any) {
      console.error('[Idempotency Middleware] Unhandled claim error:', err);
      return sendError(res, `Idempotency verification error: ${err.message}`, 500);
    }
  };
}

export const requireIdempotency = (options: Omit<IdempotencyOptions, 'required'> = {}) =>
  idempotency({ ...options, required: true });
