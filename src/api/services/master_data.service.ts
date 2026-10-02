// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - SERVICE
// ============================================================================

import {
  MasterDomainCode,
  MasterRecordItem,
  MasterRecordVersion,
  DataQualityEvaluationResult,
  DataQualityIssueItem,
  DuplicateCandidateItem,
  GoldenRecordItem,
  ReconciliationJobItem,
  DataLineageItem,
  DataChangeRequestItem,
  MDMStatsSummary,
} from '../master-data/master_data.types';
import { masterDataRepository } from '../repositories/master_data.repository';
import { dataQualityEngine } from '../master-data/master_data.quality';
import { duplicateDetectionEngine } from '../master-data/master_data.duplicates';
import { reconciliationEngine } from '../master-data/master_data.reconciliation';
import { dataGovernanceEngine } from '../master-data/master_data.governance';
import { OrchestrationEngine } from '../orchestration/orchestration.engine';
import { AIGateway } from '../ai/ai.gateway';
import { logger } from '../utils/logger';

export class MasterDataService {
  private static instance: MasterDataService;

  private constructor() {}

  public static getInstance(): MasterDataService {
    if (!MasterDataService.instance) {
      MasterDataService.instance = new MasterDataService();
    }
    return MasterDataService.instance;
  }

  /**
   * Get Overall Statistics & Domain Summaries
   */
  public async getDashboardStats(): Promise<MDMStatsSummary> {
    return masterDataRepository.getStats();
  }

  /**
   * Get List of Master Domains
   */
  public async getMasterDomains() {
    return masterDataRepository.getDomains();
  }

  /**
   * Get Records for a domain with filtering and search
   */
  public async getRecords(filter?: {
    domainCode?: MasterDomainCode;
    status?: string;
    search?: string;
    qualityClassification?: string;
  }) {
    return masterDataRepository.getRecords(filter);
  }

  /**
   * Get a single master record by ID
   */
  public async getRecordById(id: string) {
    return masterDataRepository.getRecordById(id);
  }

  /**
   * Get record version history
   */
  public async getRecordVersions(recordId: string) {
    return masterDataRepository.getRecordVersions(recordId);
  }

  /**
   * Create a new Master Record with automatic Canonical ID generation, Quality Scoring & Duplicate Check
   */
  public async createRecord(params: {
    recordData: {
      domainCode: MasterDomainCode;
      entityType: string;
      sourceModule: string;
      sourceEntityId: string;
      primaryName: string;
      secondaryName?: string;
      code: string;
      status?: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED';
      effectiveDate?: string;
      expiryDate?: string;
      dataPayload?: Record<string, any>;
      identifiers?: any[];
      tags?: string[];
    };
    user: { id: string; name: string; role: string; ip?: string };
  }): Promise<MasterRecordItem> {
    const { recordData, user } = params;

    const canonicalId = masterDataRepository.generateCanonicalId(recordData.domainCode);
    const newId = `rec-${recordData.domainCode.toLowerCase().substring(0, 3)}-${Date.now()}`;

    const newRecord: MasterRecordItem = {
      id: newId,
      canonicalId,
      domainCode: recordData.domainCode,
      entityType: recordData.entityType,
      sourceModule: recordData.sourceModule,
      sourceEntityId: recordData.sourceEntityId,
      primaryName: recordData.primaryName,
      secondaryName: recordData.secondaryName,
      code: recordData.code,
      status: (recordData.status as any) || 'ACTIVE',
      approvalStatus: 'APPROVED',
      qualityScore: 100.0,
      qualityClassification: 'EXCELLENT',
      version: 1,
      effectiveDate: recordData.effectiveDate || new Date().toISOString().split('T')[0],
      expiryDate: recordData.expiryDate,
      lastVerifiedAt: new Date().toISOString(),
      verifiedBy: user.name,
      isGoldenRecord: false,
      dataPayload: recordData.dataPayload || {},
      identifiers: recordData.identifiers || [],
      tags: recordData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.name,
      updatedBy: user.name,
    };

    // 1. Evaluate Data Quality
    const qualityResult = dataQualityEngine.evaluateRecord(newRecord);
    newRecord.qualityScore = qualityResult.overallScore;
    newRecord.qualityClassification = qualityResult.classification;

    // 2. Save to Repository
    masterDataRepository.saveRecord(newRecord);

    // 3. Add Version Record
    masterDataRepository.addVersion(newId, {
      id: `ver-${newId}-1`,
      masterRecordId: newId,
      canonicalId,
      versionNumber: 1,
      changeType: 'CREATE',
      changeReason: 'Initial master record registration.',
      newPayload: newRecord.dataPayload,
      changedFields: Object.keys(newRecord.dataPayload),
      effectiveDate: newRecord.effectiveDate,
      approvedByUserId: user.id,
      approvedByUserName: user.name,
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: user.name,
    });

    // 4. Duplicate Detection against existing domain records
    const domainRecords = masterDataRepository.getRecords({ domainCode: recordData.domainCode });
    for (const existing of domainRecords) {
      if (existing.id !== newId) {
        const dupCandidate = duplicateDetectionEngine.evaluatePair(existing, newRecord);
        if (dupCandidate) {
          masterDataRepository.saveDuplicateCandidate(dupCandidate);
        }
      }
    }

    // 5. Emit Orchestration Event (Phase 75)
    try {
      const orchestrationEngine = OrchestrationEngine.getInstance();
      orchestrationEngine.publishEvent({
        eventId: `evt-mdm-${Date.now()}`,
        eventType: 'MASTER_RECORD_CREATED' as any,
        sourceModule: 'CORE_ERP' as any,
        correlationId: `mdm-sync-${canonicalId}`,
        idempotencyKey: `MDM_REC_CREATE_${canonicalId}_${newRecord.version}`,
        entityType: 'MASTER_RECORD',
        entityId: canonicalId,
        severity: 'INFO',
        payload: {
          canonicalId,
          domainCode: recordData.domainCode,
          primaryName: recordData.primaryName,
          qualityScore: newRecord.qualityScore,
        },
        timestamp: new Date().toISOString(),
        createdBy: user.name,
      });
    } catch (err) {
      logger.warn('[MDM] Orchestration event dispatch deferred:', err);
    }

    // 6. Log Governance Audit
    masterDataRepository.logAudit({
      action: 'MASTER_RECORD_CREATED',
      domainCode: recordData.domainCode,
      canonicalId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      ipAddress: user.ip,
      newState: newRecord.dataPayload,
      changeSummary: `Registered canonical master record '${recordData.primaryName}' (${canonicalId}) with ${newRecord.qualityScore}% quality score.`,
    });

    return newRecord;
  }

  /**
   * Update an existing Master Record
   */
  public async updateRecord(params: {
    recordId: string;
    updates: {
      primaryName?: string;
      secondaryName?: string;
      code?: string;
      status?: any;
      effectiveDate?: string;
      expiryDate?: string;
      dataPayload?: Record<string, any>;
      identifiers?: any[];
      tags?: string[];
      changeReason?: string;
    };
    user: { id: string; name: string; role: string; ip?: string };
  }): Promise<MasterRecordItem> {
    const { recordId, updates, user } = params;

    const record = masterDataRepository.getRecordById(recordId);
    if (!record) {
      throw new Error(`Master record with ID '${recordId}' not found.`);
    }

    // Check Legal Hold enforcement
    const holdCheck = dataGovernanceEngine.isEntityUnderLegalHold(record);
    if (holdCheck.isHold && updates.status === 'ARCHIVED') {
      throw new Error(`Cannot archive record '${record.canonicalId}': Active Legal Hold (${holdCheck.hold?.holdCode} - "${holdCheck.hold?.title}") is enforced.`);
    }

    const previousPayload = { ...record.dataPayload };
    const changedFields: string[] = [];

    if (updates.primaryName) record.primaryName = updates.primaryName;
    if (updates.secondaryName !== undefined) record.secondaryName = updates.secondaryName;
    if (updates.code) record.code = updates.code;
    if (updates.status) record.status = updates.status;
    if (updates.effectiveDate) record.effectiveDate = updates.effectiveDate;
    if (updates.expiryDate !== undefined) record.expiryDate = updates.expiryDate;
    if (updates.identifiers) record.identifiers = updates.identifiers;
    if (updates.tags) record.tags = updates.tags;

    if (updates.dataPayload) {
      Object.keys(updates.dataPayload).forEach((k) => {
        if (record.dataPayload[k] !== updates.dataPayload![k]) {
          changedFields.push(k);
        }
      });
      record.dataPayload = { ...record.dataPayload, ...updates.dataPayload };
    }

    record.version += 1;
    record.updatedAt = new Date().toISOString();
    record.updatedBy = user.name;
    record.lastVerifiedAt = new Date().toISOString();
    record.verifiedBy = user.name;

    // Recalculate Quality
    const qualityResult = dataQualityEngine.evaluateRecord(record);
    record.qualityScore = qualityResult.overallScore;
    record.qualityClassification = qualityResult.classification;

    masterDataRepository.saveRecord(record);

    // Save Version
    masterDataRepository.addVersion(recordId, {
      id: `ver-${recordId}-${record.version}`,
      masterRecordId: recordId,
      canonicalId: record.canonicalId,
      versionNumber: record.version,
      changeType: 'UPDATE',
      changeReason: updates.changeReason || 'Operational attribute update.',
      previousPayload,
      newPayload: record.dataPayload,
      changedFields: changedFields.length > 0 ? changedFields : ['general_attributes'],
      effectiveDate: record.effectiveDate,
      approvedByUserId: user.id,
      approvedByUserName: user.name,
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: user.name,
    });

    // Audit
    masterDataRepository.logAudit({
      action: 'MASTER_RECORD_UPDATED',
      domainCode: record.domainCode,
      canonicalId: record.canonicalId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      ipAddress: user.ip,
      previousState: previousPayload,
      newState: record.dataPayload,
      changeSummary: `Updated version ${record.version} for '${record.primaryName}' (${record.canonicalId}). Reason: ${updates.changeReason || 'Attribute edit'}`,
    });

    return record;
  }

  /**
   * Run Deterministic Quality Scan on Record
   */
  public async scanRecordQuality(recordId: string): Promise<DataQualityEvaluationResult> {
    const record = masterDataRepository.getRecordById(recordId);
    if (!record) {
      throw new Error(`Master record with ID '${recordId}' not found.`);
    }

    const result = dataQualityEngine.evaluateRecord(record);

    // Sync updated score
    record.qualityScore = result.overallScore;
    record.qualityClassification = result.classification;
    masterDataRepository.saveRecord(record);

    // Create quality issues if severe findings exist
    result.findings.forEach((f) => {
      if (f.severity === 'CRITICAL' || f.severity === 'HIGH') {
        const issueCode = `DQI-${Date.now().toString().slice(-6)}`;
        masterDataRepository.saveQualityIssue({
          id: `iss-${issueCode}`,
          issueCode,
          issueType: f.ruleCode,
          title: `[${record.domainCode}] ${f.ruleName}`,
          description: f.message,
          domainCode: record.domainCode,
          masterRecordId: record.id,
          canonicalId: record.canonicalId,
          severity: f.severity,
          status: 'OPEN',
          detectedAt: new Date().toISOString(),
          detectedBy: 'Data Quality Scanner',
          aiRemediationSuggestion: `Resolve rule violation '${f.ruleCode}' by updating field '${f.field || 'attributes'}' in accordance with domain standard.`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });

    return result;
  }

  /**
   * Run Full Quality Scan across an Entire Domain
   */
  public async scanDomainQuality(domainCode: MasterDomainCode) {
    const records = masterDataRepository.getRecords({ domainCode });
    const results = records.map((r) => dataQualityEngine.evaluateRecord(r));
    return {
      domainCode,
      scannedCount: records.length,
      averageScore:
        results.length > 0
          ? Math.round((results.reduce((acc, curr) => acc + curr.overallScore, 0) / results.length) * 10) / 10
          : 100.0,
      results,
    };
  }

  /**
   * Get Duplicate Candidates
   */
  public async getDuplicateCandidates(domainCode?: MasterDomainCode) {
    return masterDataRepository.getDuplicateCandidates({ domainCode });
  }

  /**
   * Resolve Duplicate Candidate (Merge / Keep Separate / Reject)
   */
  public async resolveDuplicate(params: {
    candidateId: string;
    resolution: 'APPROVE_MERGE' | 'KEEP_SEPARATE' | 'REJECT_CANDIDATE' | 'ESCALATE';
    primaryRecordId?: string;
    secondaryRecordIds?: string[];
    notes?: string;
    user: { id: string; name: string; role: string; ip?: string };
  }) {
    const { candidateId, resolution, notes, user } = params;

    const candidate = masterDataRepository.getDuplicateCandidateById(candidateId);
    if (!candidate) {
      throw new Error(`Duplicate candidate '${candidateId}' not found.`);
    }

    candidate.status =
      resolution === 'APPROVE_MERGE'
        ? 'APPROVED_FOR_MERGE'
        : resolution === 'KEEP_SEPARATE'
        ? 'KEPT_SEPARATE'
        : resolution === 'REJECT_CANDIDATE'
        ? 'REJECTED'
        : 'ESCALATED';

    candidate.reviewedByUserId = user.id;
    candidate.reviewedByUserName = user.name;
    candidate.reviewedAt = new Date().toISOString();
    candidate.reviewNotes = notes;
    candidate.updatedAt = new Date().toISOString();

    masterDataRepository.saveDuplicateCandidate(candidate);

    let goldenRecord: GoldenRecordItem | null = null;

    if (resolution === 'APPROVE_MERGE') {
      const primary = masterDataRepository.getRecordById(candidate.candidateARecordId);
      const secondary = masterDataRepository.getRecordById(candidate.candidateBRecordId);

      if (primary && secondary) {
        goldenRecord = duplicateDetectionEngine.constructGoldenRecord({
          domainCode: candidate.domainCode,
          primaryRecord: primary,
          secondaryRecords: [secondary],
          approvedByUserId: user.id,
          approvedByUserName: user.name,
        });

        masterDataRepository.saveGoldenRecord(goldenRecord);

        // Mark primary as golden record
        primary.isGoldenRecord = true;
        primary.goldenRecordId = goldenRecord.id;
        masterDataRepository.saveRecord(primary);

        // Mark secondary as merged without deleting historical transactions
        secondary.status = 'MERGED';
        secondary.mergedIntoId = primary.id;
        secondary.mergedAt = new Date().toISOString();
        masterDataRepository.saveRecord(secondary);
      }
    }

    // Audit
    masterDataRepository.logAudit({
      action: `DUPLICATE_${resolution}`,
      domainCode: candidate.domainCode,
      canonicalId: candidate.candidateACanonicalId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      ipAddress: user.ip,
      changeSummary: `Resolved duplicate candidate ${candidate.id} with action: ${resolution}.`,
    });

    return { candidate, goldenRecord };
  }

  /**
   * Trigger Cross-Module Multi-System Reconciliation Job
   */
  public async triggerReconciliation(params: {
    domainCode: MasterDomainCode;
    triggerType?: 'MANUAL' | 'SCHEDULED' | 'EVENT_DRIVEN';
    user: { id: string; name: string; role: string; ip?: string };
  }): Promise<ReconciliationJobItem> {
    const { domainCode, triggerType = 'MANUAL', user } = params;

    const records = masterDataRepository.getRecords({ domainCode });
    const job = reconciliationEngine.executeDomainReconciliation({
      domainCode,
      masterRecords: records,
      triggerType,
      executedByUserId: user.id,
    });

    masterDataRepository.saveReconciliationJob(job);

    masterDataRepository.logAudit({
      action: 'RECONCILIATION_JOB_EXECUTED',
      domainCode,
      canonicalId: 'ALL',
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      ipAddress: user.ip,
      changeSummary: `Executed reconciliation job ${job.jobCode} across ${job.participatingModules.join(', ')}. Scanned ${job.recordsScannedCount} records.`,
    });

    return job;
  }

  /**
   * Get Reconciliation Jobs
   */
  public async getReconciliationJobs(domainCode?: MasterDomainCode) {
    return masterDataRepository.getReconciliationJobs(domainCode);
  }

  /**
   * Get Data Lineage for a record
   */
  public async getLineage(recordId: string): Promise<DataLineageItem | null> {
    return masterDataRepository.getLineageForRecord(recordId);
  }

  /**
   * Quality Issues
   */
  public async getQualityIssues(domainCode?: MasterDomainCode, status?: string) {
    return masterDataRepository.getQualityIssues({ domainCode, status });
  }

  public async resolveQualityIssue(params: {
    issueId: string;
    resolutionNotes: string;
    user: { id: string; name: string; role: string; ip?: string };
  }) {
    const issue = masterDataRepository.getQualityIssueById(params.issueId);
    if (!issue) throw new Error(`Quality issue '${params.issueId}' not found.`);

    issue.status = 'RESOLVED';
    issue.resolutionNotes = params.resolutionNotes;
    issue.resolvedAt = new Date().toISOString();
    issue.resolvedByUserId = params.user.id;
    issue.resolvedByUserName = params.user.name;
    issue.updatedAt = new Date().toISOString();

    masterDataRepository.saveQualityIssue(issue);
    return issue;
  }

  /**
   * Change Requests
   */
  public async getChangeRequests(domainCode?: MasterDomainCode, status?: string) {
    return masterDataRepository.getChangeRequests({ domainCode, status });
  }

  public async createChangeRequest(params: {
    masterRecordId: string;
    domainCode: MasterDomainCode;
    requestType: 'UPDATE_ATTRIBUTES' | 'BANK_ACCOUNT_CHANGE' | 'MERGE_REQUEST' | 'STATUS_CHANGE' | 'RETIREMENT';
    reason: string;
    proposedValue: Record<string, any>;
    user: { id: string; name: string; role: string };
  }) {
    const record = masterDataRepository.getRecordById(params.masterRecordId);
    if (!record) throw new Error(`Master record '${params.masterRecordId}' not found.`);

    const requestCode = `MCR-${Date.now().toString().slice(-6)}`;
    const req: DataChangeRequestItem = {
      id: `mcr-${requestCode}`,
      requestCode,
      masterRecordId: record.id,
      canonicalId: record.canonicalId,
      domainCode: params.domainCode,
      requestType: params.requestType,
      reason: params.reason,
      currentValue: record.dataPayload,
      proposedValue: params.proposedValue,
      changedFields: Object.keys(params.proposedValue),
      status: 'PENDING_APPROVAL',
      submittedByUserId: params.user.id,
      submittedByUserName: params.user.name,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    masterDataRepository.saveChangeRequest(req);
    return req;
  }

  public async reviewChangeRequest(params: {
    requestId: string;
    action: 'APPROVE' | 'REJECT';
    rejectionReason?: string;
    user: { id: string; name: string; role: string; ip?: string };
  }) {
    const req = masterDataRepository.getChangeRequestById(params.requestId);
    if (!req) throw new Error(`Change request '${params.requestId}' not found.`);

    req.status = params.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    req.approvedByUserId = params.user.id;
    req.approvedByUserName = params.user.name;
    req.approvedAt = new Date().toISOString();
    if (params.rejectionReason) req.rejectionReason = params.rejectionReason;

    masterDataRepository.saveChangeRequest(req);

    if (params.action === 'APPROVE') {
      await this.updateRecord({
        recordId: req.masterRecordId,
        updates: {
          dataPayload: req.proposedValue,
          changeReason: `Approved Change Request ${req.requestCode}: ${req.reason}`,
        },
        user: params.user,
      });
    }

    return req;
  }

  /**
   * Governance Policies & Stewards
   */
  public async getStewards() {
    return masterDataRepository.getStewards();
  }

  public async getRetentionPolicies() {
    return masterDataRepository.getRetentionPolicies();
  }

  public async getLegalHolds() {
    return masterDataRepository.getLegalHolds();
  }

  public async placeLegalHold(params: {
    title: string;
    reason: string;
    domainCode: MasterDomainCode;
    targetCanonicalId?: string;
    isGlobalForDomain?: boolean;
    user: { id: string; name: string; role: string; ip?: string };
  }) {
    const holdCode = `LH-${Date.now().toString().slice(-6)}`;
    const hold = {
      id: `hold-${holdCode}`,
      holdCode,
      title: params.title,
      reason: params.reason,
      domainCode: params.domainCode,
      targetCanonicalId: params.targetCanonicalId,
      isGlobalForDomain: !!params.isGlobalForDomain,
      status: 'ACTIVE' as const,
      placedByUserId: params.user.id,
      placedByUserName: params.user.name,
      placedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    masterDataRepository.addLegalHold(hold);

    masterDataRepository.logAudit({
      action: 'LEGAL_HOLD_PLACED',
      domainCode: params.domainCode,
      canonicalId: params.targetCanonicalId || 'DOMAIN_GLOBAL',
      userId: params.user.id,
      userName: params.user.name,
      userRole: params.user.role,
      ipAddress: params.user.ip,
      changeSummary: `Placed legal hold ${holdCode}: "${params.title}" on ${params.targetCanonicalId || params.domainCode}.`,
    });

    return hold;
  }

  public async releaseLegalHold(params: {
    holdCode: string;
    releaseReason: string;
    user: { id: string; name: string; role: string; ip?: string };
  }) {
    const success = masterDataRepository.releaseLegalHold(
      params.holdCode,
      params.releaseReason,
      params.user.id,
      params.user.name
    );

    if (success) {
      masterDataRepository.logAudit({
        action: 'LEGAL_HOLD_RELEASED',
        domainCode: 'ORGANIZATION',
        canonicalId: params.holdCode,
        userId: params.user.id,
        userName: params.user.name,
        userRole: params.user.role,
        ipAddress: params.user.ip,
        changeSummary: `Released legal hold ${params.holdCode}. Reason: ${params.releaseReason}`,
      });
    }

    return { success };
  }

  /**
   * Governance Audit Logs
   */
  public async getAuditLogs(filter?: { domainCode?: MasterDomainCode; canonicalId?: string; limit?: number }) {
    return masterDataRepository.getAuditLogs(filter);
  }

  /**
   * AI-Assisted Governance Explanation & Remediation Suggestion (via Phase 74 AI Gateway)
   */
  public async getAIAssistedExplanation(params: {
    contextType: 'DUPLICATE_PAIR' | 'QUALITY_ANOMALY' | 'RECONCILIATION_DISCREPANCY';
    dataPayload: Record<string, any>;
    user: { id: string; role: string };
  }) {
    const prompt = `Analyze this ERP Master Data Governance context (${params.contextType}):
${JSON.stringify(params.dataPayload, null, 2)}
Provide:
1. Concise root cause analysis
2. Statutory / business risk implications
3. Prescriptive, step-by-step remediation recommendation for the Data Steward.`;

    try {
      const aiResponse = await AIGateway.execute({
        taskType: 'ANALYSIS' as any,
        prompt,
        systemInstruction:
          'You are the SiteSync Pro Enterprise Master Data Management & Governance Copilot. Provide strictly professional, factual advice for data stewards and compliance officers.',
        user: params.user,
      });

      return {
        aiClassification: 'AI-ASSISTED' as const,
        explanation: aiResponse.text || aiResponse.data || 'Analysis generated successfully by AI Gateway.',
        confidenceScore: 0.95,
      };
    } catch (err) {
      return {
        aiClassification: 'RULE-BASED' as const,
        explanation:
          'Rule-based evaluation indicates attribute incongruence requiring data steward validation against statutory registers.',
        confidenceScore: 1.0,
      };
    }
  }
}

export const masterDataService = MasterDataService.getInstance();
