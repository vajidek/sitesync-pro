// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - REPOSITORY
// ============================================================================

import {
  MasterDomainCode,
  MasterDomainSummary,
  MasterRecordItem,
  MasterRecordVersion,
  DataQualityEvaluationResult,
  DataQualityIssueItem,
  DuplicateCandidateItem,
  GoldenRecordItem,
  ReconciliationJobItem,
  DataLineageItem,
  DataStewardItem,
  DataChangeRequestItem,
  RetentionPolicyItem,
  LegalHoldItem,
  GovernanceAuditLogItem,
  MDMStatsSummary,
} from '../master-data/master_data.types';
import { masterDataRegistry } from '../master-data/master_data.registry';
import { dataQualityEngine } from '../master-data/master_data.quality';
import { duplicateDetectionEngine } from '../master-data/master_data.duplicates';
import { dataGovernanceEngine } from '../master-data/master_data.governance';
import { dataLineageEngine } from '../master-data/master_data.lineage';
import { masterDataAuditSentinel } from '../master-data/master_data.audit';

export class MasterDataRepository {
  private static instance: MasterDataRepository;

  private qualityIssues: Map<string, DataQualityIssueItem> = new Map();
  private duplicateCandidates: Map<string, DuplicateCandidateItem> = new Map();
  private goldenRecords: Map<string, GoldenRecordItem> = new Map();
  private reconciliationJobs: Map<string, ReconciliationJobItem> = new Map();
  private changeRequests: Map<string, DataChangeRequestItem> = new Map();

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): MasterDataRepository {
    if (!MasterDataRepository.instance) {
      MasterDataRepository.instance = new MasterDataRepository();
    }
    return MasterDataRepository.instance;
  }

  private seedInitialData() {
    // 1. Initial Quality Issues
    const initialIssues: DataQualityIssueItem[] = [
      {
        id: 'iss-001',
        issueCode: 'DQI-2026-001',
        issueType: 'MISSING_IBAN_CONFIRMATION',
        title: 'Vendor Bank Account IBAN Letter Pending Verification',
        description: 'Vendor MDM-VND-002 (Gulf Steel FZC) lacks validated bank authority confirmation for AED disbursements.',
        domainCode: 'VENDORS',
        canonicalId: 'MDM-VND-002',
        severity: 'HIGH',
        status: 'OPEN',
        assignedToUserId: 'usr-proc-01',
        assignedToName: 'Sarah Jenkins',
        detectedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        detectedBy: 'Automated Quality Scanner',
        aiRemediationSuggestion: 'Request official stamped bank letter from Gulf Steel FZC confirming UAE IBAN matching Trade License.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'iss-002',
        issueCode: 'DQI-2026-002',
        issueType: 'UOM_NON_STANDARD',
        title: 'Material SKU Non-Standard Unit of Measure',
        description: 'Material master record MAT-042 listed with unit "LENGTH" instead of standard "MTR".',
        domainCode: 'MATERIALS',
        canonicalId: 'MDM-MAT-001',
        severity: 'WARNING',
        status: 'OPEN',
        assignedToUserId: 'usr-inv-01',
        assignedToName: 'Ali Hassan',
        detectedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        detectedBy: 'Quality Rule Engine',
        aiRemediationSuggestion: 'Standardize unit of measure mapping from LENGTH to ISO engineering code MTR.',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    initialIssues.forEach((i) => this.qualityIssues.set(i.id, i));

    // 2. Initial Duplicate Candidates
    const rec1 = masterDataRegistry.getRecordByCanonicalId('MDM-VND-001');
    const rec2 = masterDataRegistry.getRecordByCanonicalId('MDM-VND-002');
    if (rec1 && rec2) {
      const dup = duplicateDetectionEngine.evaluatePair(rec1, rec2);
      if (dup) {
        this.duplicateCandidates.set(dup.id, dup);
      }
    }

    // 3. Initial Change Requests
    const initialChangeReq: DataChangeRequestItem = {
      id: 'mcr-001',
      requestCode: 'MCR-2026-0012',
      masterRecordId: 'rec-vnd-001',
      canonicalId: 'MDM-VND-001',
      domainCode: 'VENDORS',
      requestType: 'UPDATE_ATTRIBUTES',
      reason: 'Updated credit facility from 60 days to 90 days following commercial agreement.',
      currentValue: { creditTermsDays: 60 },
      proposedValue: { creditTermsDays: 90 },
      changedFields: ['creditTermsDays'],
      status: 'PENDING_APPROVAL',
      submittedByUserId: 'usr-proc-01',
      submittedByUserName: 'Sarah Jenkins',
      submittedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.changeRequests.set(initialChangeReq.id, initialChangeReq);
  }

  // Registry Accessors
  public getDomains(): MasterDomainSummary[] {
    return masterDataRegistry.getAllDomains();
  }

  public getDomain(domainCode: MasterDomainCode): MasterDomainSummary | undefined {
    return masterDataRegistry.getDomain(domainCode);
  }

  public getRecords(filter?: {
    domainCode?: MasterDomainCode;
    status?: string;
    search?: string;
    qualityClassification?: string;
  }): MasterRecordItem[] {
    return masterDataRegistry.getRecords(filter);
  }

  public getRecordById(id: string): MasterRecordItem | undefined {
    return masterDataRegistry.getRecordById(id);
  }

  public getRecordByCanonicalId(canonicalId: string): MasterRecordItem | undefined {
    return masterDataRegistry.getRecordByCanonicalId(canonicalId);
  }

  public getRecordVersions(recordId: string): MasterRecordVersion[] {
    return masterDataRegistry.getRecordVersions(recordId);
  }

  public saveRecord(record: MasterRecordItem): MasterRecordItem {
    return masterDataRegistry.saveRecord(record);
  }

  public addVersion(recordId: string, version: MasterRecordVersion) {
    masterDataRegistry.addVersion(recordId, version);
  }

  public generateCanonicalId(domainCode: MasterDomainCode): string {
    return masterDataRegistry.generateCanonicalId(domainCode);
  }

  public getStats(): MDMStatsSummary {
    return masterDataRegistry.getMDMStatsSummary();
  }

  // Quality Issues
  public getQualityIssues(filter?: { domainCode?: MasterDomainCode; status?: string }): DataQualityIssueItem[] {
    let list = Array.from(this.qualityIssues.values());
    if (filter?.domainCode) {
      list = list.filter((i) => i.domainCode === filter.domainCode);
    }
    if (filter?.status) {
      list = list.filter((i) => i.status === filter.status);
    }
    return list;
  }

  public saveQualityIssue(issue: DataQualityIssueItem): DataQualityIssueItem {
    this.qualityIssues.set(issue.id, issue);
    return issue;
  }

  public getQualityIssueById(id: string): DataQualityIssueItem | undefined {
    return this.qualityIssues.get(id);
  }

  // Duplicate Candidates
  public getDuplicateCandidates(filter?: { domainCode?: MasterDomainCode; status?: string }): DuplicateCandidateItem[] {
    let list = Array.from(this.duplicateCandidates.values());
    if (filter?.domainCode) {
      list = list.filter((d) => d.domainCode === filter.domainCode);
    }
    if (filter?.status) {
      list = list.filter((d) => d.status === filter.status);
    }
    return list;
  }

  public getDuplicateCandidateById(id: string): DuplicateCandidateItem | undefined {
    return this.duplicateCandidates.get(id);
  }

  public saveDuplicateCandidate(dup: DuplicateCandidateItem): DuplicateCandidateItem {
    this.duplicateCandidates.set(dup.id, dup);
    return dup;
  }

  // Golden Records
  public getGoldenRecords(domainCode?: MasterDomainCode): GoldenRecordItem[] {
    let list = Array.from(this.goldenRecords.values());
    if (domainCode) {
      list = list.filter((g) => g.domainCode === domainCode);
    }
    return list;
  }

  public saveGoldenRecord(golden: GoldenRecordItem): GoldenRecordItem {
    this.goldenRecords.set(golden.id, golden);
    return golden;
  }

  // Reconciliation Jobs
  public getReconciliationJobs(domainCode?: MasterDomainCode): ReconciliationJobItem[] {
    let list = Array.from(this.reconciliationJobs.values());
    if (domainCode) {
      list = list.filter((j) => j.domainCode === domainCode);
    }
    return list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  public saveReconciliationJob(job: ReconciliationJobItem): ReconciliationJobItem {
    this.reconciliationJobs.set(job.id, job);
    return job;
  }

  // Change Requests
  public getChangeRequests(filter?: { domainCode?: MasterDomainCode; status?: string }): DataChangeRequestItem[] {
    let list = Array.from(this.changeRequests.values());
    if (filter?.domainCode) {
      list = list.filter((r) => r.domainCode === filter.domainCode);
    }
    if (filter?.status) {
      list = list.filter((r) => r.status === filter.status);
    }
    return list;
  }

  public getChangeRequestById(id: string): DataChangeRequestItem | undefined {
    return this.changeRequests.get(id);
  }

  public saveChangeRequest(req: DataChangeRequestItem): DataChangeRequestItem {
    this.changeRequests.set(req.id, req);
    return req;
  }

  // Governance & Retention
  public getStewards(): DataStewardItem[] {
    return dataGovernanceEngine.getStewards();
  }

  public getRetentionPolicies(): RetentionPolicyItem[] {
    return dataGovernanceEngine.getRetentionPolicies();
  }

  public getLegalHolds(): LegalHoldItem[] {
    return dataGovernanceEngine.getLegalHolds();
  }

  public addLegalHold(hold: LegalHoldItem) {
    dataGovernanceEngine.addLegalHold(hold);
  }

  public releaseLegalHold(holdCode: string, reason: string, userId: string, userName: string) {
    return dataGovernanceEngine.releaseLegalHold(holdCode, reason, userId, userName);
  }

  // Lineage
  public getLineageForRecord(recordId: string): DataLineageItem | null {
    const record = masterDataRegistry.getRecordById(recordId);
    if (!record) return null;
    return dataLineageEngine.generateLineageForRecord(record);
  }

  // Audit Logs
  public getAuditLogs(filter?: { domainCode?: MasterDomainCode; canonicalId?: string; limit?: number }) {
    return masterDataAuditSentinel.getLogs(filter);
  }

  public logAudit(params: Parameters<typeof masterDataAuditSentinel.logEvent>[0]) {
    return masterDataAuditSentinel.logEvent(params);
  }
}

export const masterDataRepository = MasterDataRepository.getInstance();
