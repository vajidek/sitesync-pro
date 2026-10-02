import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { auditRepository } from '../repositories/audit.repository';
import { logger } from '../utils/logger';

export function auditLogger(actionModule: string, actionType: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body: any) {
      res.send = originalSend;
      const result = res.send(body);

      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || 'ANONYMOUS';
        const userEmail = req.user?.email || 'ANONYMOUS';

        auditRepository
          .logAction({
            userId,
            userEmail,
            action: `${actionModule}:${actionType}`,
            module: actionModule,
            ipAddress: (req.ip || req.socket.remoteAddress || '127.0.0.1') as string,
            userAgent: req.headers['user-agent'] || 'Unknown',
            details: JSON.stringify({
              method: req.method,
              url: req.originalUrl,
              params: req.params,
              query: req.query,
            }),
          })
          .catch((err) => {
            logger.error('[AuditMiddleware] Error recording audit log:', err);
          });
      }

      return result;
    };

    next();
  };
}
