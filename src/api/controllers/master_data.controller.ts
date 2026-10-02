// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - CONTROLLER
// ============================================================================

import { Request, Response } from 'express';
import { masterDataService } from '../services/master_data.service';
import {
  CreateMasterRecordSchema,
  UpdateMasterRecordSchema,
  DuplicateResolutionSchema,
  TriggerReconciliationSchema,
  CreateChangeRequestSchema,
  ReviewChangeRequestSchema,
  PlaceLegalHoldSchema,
  ReleaseLegalHoldSchema,
} from '../validators/master_data.validator';
import { sendSuccess, sendError } from '../utils/response';
import { logger } from '../utils/logger';

export class MasterDataController {
  public async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await masterDataService.getDashboardStats();
      return sendSuccess(res, stats, 'MDM dashboard stats retrieved successfully');
    } catch (err: any) {
      logger.error('[MDM] getDashboardStats error:', err);
      return sendError(res, err.message || 'Failed to retrieve MDM statistics', 500);
    }
  }

  public async getDomains(req: Request, res: Response) {
    try {
      const domains = await masterDataService.getMasterDomains();
      return sendSuccess(res, domains, 'Master domains retrieved successfully');
    } catch (err: any) {
      logger.error('[MDM] getDomains error:', err);
      return sendError(res, err.message || 'Failed to retrieve master domains', 500);
    }
  }

  public async getRecords(req: Request, res: Response) {
    try {
      const { domainCode, status, search, qualityClassification } = req.query;
      const records = await masterDataService.getRecords({
        domainCode: domainCode as any,
        status: status as string,
        search: search as string,
        qualityClassification: qualityClassification as string,
      });
      return sendSuccess(res, records, `Retrieved ${records.length} master records`);
    } catch (err: any) {
      logger.error('[MDM] getRecords error:', err);
      return sendError(res, err.message || 'Failed to retrieve master records', 500);
    }
  }

  public async getRecordById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const record = await masterDataService.getRecordById(id);
      if (!record) {
        return sendError(res, `Master record '${id}' not found`, 404);
      }
      return sendSuccess(res, record, 'Master record retrieved successfully');
    } catch (err: any) {
      logger.error('[MDM] getRecordById error:', err);
      return sendError(res, err.message || 'Failed to retrieve master record', 500);
    }
  }

  public async getRecordVersions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const versions = await masterDataService.getRecordVersions(id);
      return sendSuccess(res, versions, 'Record versions retrieved successfully');
    } catch (err: any) {
      logger.error('[MDM] getRecordVersions error:', err);
      return sendError(res, err.message || 'Failed to retrieve record versions', 500);
    }
  }

  public async createRecord(req: Request, res: Response) {
    try {
      const validatedData = CreateMasterRecordSchema.parse(req.body);
      const user = {
        id: (req as any).user?.id || 'usr-admin',
        name: (req as any).user?.name || (req as any).user?.username || 'Enterprise Admin',
        role: (req as any).user?.role || 'ADMIN',
        ip: req.ip,
      };

      const record = await masterDataService.createRecord({
        recordData: validatedData,
        user,
      });
      return sendSuccess(res, record, 'Master record created successfully', 201);
    } catch (err: any) {
      logger.error('[MDM] createRecord error:', err);
      return sendError(res, err.message || 'Failed to create master record', 400);
    }
  }

  public async updateRecord(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = UpdateMasterRecordSchema.parse(req.body);
      const user = {
        id: (req as any).user?.id || 'usr-admin',
        name: (req as any).user?.name || (req as any).user?.username || 'Enterprise Admin',
        role: (req as any).user?.role || 'ADMIN',
        ip: req.ip,
      };

      const record = await masterDataService.updateRecord({
        recordId: id,
        updates: validatedData,
        user,
      });
      return sendSuccess(res, record, 'Master record updated successfully');
    } catch (err: any) {
      logger.error('[MDM] updateRecord error:', err);
      return sendError(res, err.message || 'Failed to update master record', 400);
    }
  }

  public async scanRecordQuality(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await masterDataService.scanRecordQuality(id);
      return sendSuccess(res, result, 'Quality scan completed successfully');
    } catch (err: any) {
      logger.error('[MDM] scanRecordQuality error:', err);
      return sendError(res, err.message || 'Failed to scan quality', 500);
    }
  }

  public async scanDomainQuality(req: Request, res: Response) {
    try {
      const { domainCode } = req.params;
      const result = await masterDataService.scanDomainQuality(domainCode as any);
      return sendSuccess(res, result, `Quality scan completed for domain ${domainCode}`);
    } catch (err: any) {
      logger.error('[MDM] scanDomainQuality error:', err);
      return sendError(res, err.message || 'Failed to scan domain quality', 500);
    }
  }

  public async getDuplicateCandidates(req: Request, res: Response) {
    try {
      const { domainCode } = req.query;
      const candidates = await masterDataService.getDuplicateCandidates(domainCode as any);
      return sendSuccess(res, candidates, 'Duplicate candidates retrieved successfully');
    } catch (err: any) {
      logger.error('[MDM] getDuplicateCandidates error:', err);
      return sendError(res, err.message || 'Failed to retrieve duplicate candidates', 500);
    }
  }

  public async resolveDuplicate(req: Request, res: Response) {
    try {
      const validatedData = DuplicateResolutionSchema.parse(req.body);
      const user = {
        id: (req as any).user?.id || 'usr-admin',
        name: (req as any).user?.name || (req as any).user?.username || 'Enterprise Admin',
        role: (req as any).user?.role || 'ADMIN',
        ip: req.ip,
      };

      const result = await masterDataService.resolveDuplicate({
        candidateId: validatedData.candidateId,
        resolution: validatedData.resolution,
        primaryRecordId: validatedData.primaryRecordId,
        secondaryRecordIds: validatedData.secondaryRecordIds,
        notes: validatedData.notes,
        user,
      });

      return sendSuccess(res, result, 'Duplicate resolution applied successfully');
    } catch (err: any) {
      logger.error('[MDM] resolveDuplicate error:', err);
      return sendError(res, err.message || 'Failed to resolve duplicate', 400);
    }
  }

  public async triggerReconciliation(req: Request, res: Response) {
    try {
      const validatedData = TriggerReconciliationSchema.parse(req.body);
      const user = {
        id: (req as any).user?.id || 'usr-admin',
        name: (req as any).user?.name || (req as any).user?.username || 'Enterprise Admin',
        role: (req as any).user?.role || 'ADMIN',
        ip: req.ip,
      };

      const job = await masterDataService.triggerReconciliation({
        domainCode: validatedData.domainCode,
        triggerType: validatedData.triggerType,
        user,
      });

      return sendSuccess(res, job, 'Reconciliation job executed successfully');
    } catch (err: any) {
      logger.error('[MDM] triggerReconciliation error:', err);
      return sendError(res, err.message || 'Failed to trigger reconciliation', 400);
    }
  }

  public async getReconciliationJobs(req: Request, res: Response) {
    try {
      const { domainCode } = req.query;
      const jobs = await masterDataService.getReconciliationJobs(domainCode as any);
      return sendSuccess(res, jobs, 'Reconciliation jobs retrieved successfully');
    } catch (err: any) {
      logger.error('[MDM] getReconciliationJobs error:', err);
      return sendError(res, err.message || 'Failed to retrieve reconciliation jobs', 500);
    }
  }

  public async getLineage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const lineage = await masterDataService.getLineage(id);
      if (!lineage) {
        return sendError(res, `Lineage not available for record '${id}'`, 404);
      }
      return sendSuccess(res, lineage, 'Data lineage retrieved successfully');
    } catch (err: any) {
      logger.error('[MDM] getLineage error:', err);
      return sendError(res, err.message || 'Failed to retrieve lineage', 500);
    }
  }

  public async getQualityIssues(req: Request, res: Response) {
    try {
      const { domainCode, status } = req.query;
      const issues = await masterDataService.getQualityIssues(domainCode as any, status as string);
      return sendSuccess(res, issues, 'Quality issues retrieved successfully');
    } catch (err: any) {
      logger.error('[MDM] getQualityIssues error:', err);
      return sendError(res, err.message || 'Failed to retrieve quality issues', 500);
    }
  }

  public async resolveQualityIssue(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { resolutionNotes } = req.body;
      const user = {
        id: (req as any).user?.id || 'usr-admin',
        name: (req as any).user?.name || (req as any).user?.username || 'Enterprise Admin',
        role: (req as any).user?.role || 'ADMIN',
        ip: req.ip,
      };

      const issue = await masterDataService.resolveQualityIssue({
        issueId: id,
        resolutionNotes: resolutionNotes || 'Resolved by data steward',
        user,
      });

      return sendSuccess(res, issue, 'Quality issue resolved successfully');
    } catch (err: any) {
      logger.error('[MDM] resolveQualityIssue error:', err);
      return sendError(res, err.message || 'Failed to resolve quality issue', 400);
    }
  }

  public async getChangeRequests(req: Request, res: Response) {
    try {
      const { domainCode, status } = req.query;
      const list = await masterDataService.getChangeRequests(domainCode as any, status as string);
      return sendSuccess(res, list, 'Change requests retrieved successfully');
    } catch (err: any) {
      logger.error('[MDM] getChangeRequests error:', err);
      return sendError(res, err.message || 'Failed to retrieve change requests', 500);
    }
  }

  public async createChangeRequest(req: Request, res: Response) {
    try {
      const validatedData = CreateChangeRequestSchema.parse(req.body);
      const user = {
        id: (req as any).user?.id || 'usr-admin',
        name: (req as any).user?.name || (req as any).user?.username || 'Enterprise Admin',
        role: (req as any).user?.role || 'ADMIN',
      };

      const result = await masterDataService.createChangeRequest({
        ...validatedData,
        user,
      });

      return sendSuccess(res, result, 'Master change request submitted for approval', 201);
    } catch (err: any) {
      logger.error('[MDM] createChangeRequest error:', err);
      return sendError(res, err.message || 'Failed to create change request', 400);
    }
  }

  public async reviewChangeRequest(req: Request, res: Response) {
    try {
      const validatedData = ReviewChangeRequestSchema.parse(req.body);
      const user = {
        id: (req as any).user?.id || 'usr-admin',
        name: (req as any).user?.name || (req as any).user?.username || 'Enterprise Admin',
        role: (req as any).user?.role || 'ADMIN',
        ip: req.ip,
      };

      const result = await masterDataService.reviewChangeRequest({
        ...validatedData,
        user,
      });

      return sendSuccess(res, result, `Change request ${validatedData.action.toLowerCase()}ed successfully`);
    } catch (err: any) {
      logger.error('[MDM] reviewChangeRequest error:', err);
      return sendError(res, err.message || 'Failed to review change request', 400);
    }
  }

  public async getStewards(req: Request, res: Response) {
    try {
      const stewards = await masterDataService.getStewards();
      return sendSuccess(res, stewards, 'Data stewards retrieved successfully');
    } catch (err: any) {
      logger.error('[MDM] getStewards error:', err);
      return sendError(res, err.message || 'Failed to retrieve stewards', 500);
    }
  }

  public async getRetentionPolicies(req: Request, res: Response) {
    try {
      const policies = await masterDataService.getRetentionPolicies();
      return sendSuccess(res, policies, 'Retention policies retrieved successfully');
    } catch (err: any) {
      logger.error('[MDM] getRetentionPolicies error:', err);
      return sendError(res, err.message || 'Failed to retrieve retention policies', 500);
    }
  }

  public async getLegalHolds(req: Request, res: Response) {
    try {
      const holds = await masterDataService.getLegalHolds();
      return sendSuccess(res, holds, 'Legal holds retrieved successfully');
    } catch (err: any) {
      logger.error('[MDM] getLegalHolds error:', err);
      return sendError(res, err.message || 'Failed to retrieve legal holds', 500);
    }
  }

  public async placeLegalHold(req: Request, res: Response) {
    try {
      const validatedData = PlaceLegalHoldSchema.parse(req.body);
      const user = {
        id: (req as any).user?.id || 'usr-admin',
        name: (req as any).user?.name || (req as any).user?.username || 'Enterprise Admin',
        role: (req as any).user?.role || 'ADMIN',
        ip: req.ip,
      };

      const hold = await masterDataService.placeLegalHold({
        ...validatedData,
        user,
      });

      return sendSuccess(res, hold, 'Legal hold placed successfully', 201);
    } catch (err: any) {
      logger.error('[MDM] placeLegalHold error:', err);
      return sendError(res, err.message || 'Failed to place legal hold', 400);
    }
  }

  public async releaseLegalHold(req: Request, res: Response) {
    try {
      const validatedData = ReleaseLegalHoldSchema.parse(req.body);
      const user = {
        id: (req as any).user?.id || 'usr-admin',
        name: (req as any).user?.name || (req as any).user?.username || 'Enterprise Admin',
        role: (req as any).user?.role || 'ADMIN',
        ip: req.ip,
      };

      const result = await masterDataService.releaseLegalHold({
        ...validatedData,
        user,
      });

      return sendSuccess(res, result, 'Legal hold released successfully');
    } catch (err: any) {
      logger.error('[MDM] releaseLegalHold error:', err);
      return sendError(res, err.message || 'Failed to release legal hold', 400);
    }
  }

  public async getAuditLogs(req: Request, res: Response) {
    try {
      const { domainCode, canonicalId, limit } = req.query;
      const logs = await masterDataService.getAuditLogs({
        domainCode: domainCode as any,
        canonicalId: canonicalId as string,
        limit: limit ? Number(limit) : 100,
      });
      return sendSuccess(res, logs, 'Audit logs retrieved successfully');
    } catch (err: any) {
      logger.error('[MDM] getAuditLogs error:', err);
      return sendError(res, err.message || 'Failed to retrieve audit logs', 500);
    }
  }

  public async getAIAssistedExplanation(req: Request, res: Response) {
    try {
      const { contextType, dataPayload } = req.body;
      const user = {
        id: (req as any).user?.id || 'usr-admin',
        role: (req as any).user?.role || 'ADMIN',
      };

      const result = await masterDataService.getAIAssistedExplanation({
        contextType: contextType || 'DUPLICATE_PAIR',
        dataPayload: dataPayload || {},
        user,
      });

      return sendSuccess(res, result, 'AI explanation generated successfully');
    } catch (err: any) {
      logger.error('[MDM] getAIAssistedExplanation error:', err);
      return sendError(res, err.message || 'Failed to generate explanation', 500);
    }
  }
}

export const masterDataController = new MasterDataController();
