import { Response, NextFunction } from 'express';
import { auditRepository } from '../repositories/audit.repository';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types/auth';

export class AuditController {
  async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const logs = await auditRepository.getRecentLogs(100);
      return sendSuccess(res, logs, 'Security audit logs retrieved successfully.');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve audit logs', 500);
    }
  }
}

export const auditController = new AuditController();
