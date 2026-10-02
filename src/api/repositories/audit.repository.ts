import { db } from '../../db';
import { auditLogs } from '../../db/schema';
import { desc } from 'drizzle-orm';
import { logger } from '../utils/logger';

export interface DbAuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export class AuditRepository {
  async logAction(params: {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    action: string;
    module: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<DbAuditLog> {
    const entry: DbAuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: params.userId ?? undefined,
      userEmail: params.userEmail ?? undefined,
      userRole: params.userRole ?? undefined,
      action: params.action,
      module: params.module,
      details: params.details,
      ipAddress: params.ipAddress ?? undefined,
      userAgent: params.userAgent ?? undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      await db.insert(auditLogs).values({
        id: entry.id,
        userId: entry.userId || 'system',
        userEmail: entry.userEmail ?? null,
        userRole: entry.userRole ?? null,
        action: entry.action,
        module: entry.module,
        details: entry.details,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        createdAt: entry.createdAt,
      });
    } catch (err: any) {
      // Non-fatal legacy audit mirror
    }

    logger.info(`[AUDIT] Action: ${params.action} | User: ${params.userEmail || 'Anonymous'} (${params.userRole || 'Guest'}) | Details: ${params.details}`);
    return entry;
  }

  async getRecentLogs(limit = 50): Promise<DbAuditLog[]> {
    try {
      const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
      return rows.map((r) => ({
        id: r.id,
        userId: r.userId ?? undefined,
        userEmail: r.userEmail ?? undefined,
        userRole: r.userRole ?? undefined,
        action: r.action,
        module: r.module,
        details: r.details,
        ipAddress: r.ipAddress ?? undefined,
        userAgent: r.userAgent ?? undefined,
        createdAt: r.createdAt,
      }));
    } catch (err) {
      logger.error('Failed to fetch audit logs from PostgreSQL:', err);
      return [];
    }
  }
}

export const auditRepository = new AuditRepository();
