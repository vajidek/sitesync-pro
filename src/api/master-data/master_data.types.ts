// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT (MDM), DATA GOVERNANCE & QUALITY - TYPES
// ============================================================================

export type MasterDomainCode =
  | 'ORGANIZATION'
  | 'PROJECTS'
  | 'SITES'
  | 'CUSTOMERS'
  | 'VENDORS'
  | 'EMPLOYEES'
  | 'MATERIALS'
  | 'ASSETS'
  | 'FLEET_VEHICLES'
  | 'EQUIPMENT'
  | 'WAREHOUSES'
  | 'COST_CENTERS'
  | 'CHART_OF_ACCOUNTS'
  | 'CONTRACTS'
  | 'DOCUMENTS'
  | 'WATER_INFRASTRUCTURE'
  | 'USERS_ROLES';

export type MasterRecordStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'MERGED'
  | 'ARCHIVED';

export type MasterApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED';

export type QualityClassification =
  | 'EXCELLENT'
  | 'GOOD'
  | 'WARNING'
  | 'POOR'
  | 'CRITICAL';

export type QualityDimension =
  | 'COMPLETENESS'
  | 'ACCURACY'
  | 'CONSISTENCY'
  | 'UNIQUENESS'
  | 'VALIDITY'
  | 'TIMELINESS'
  | 'REFERENTIAL';

export type DuplicateStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED_FOR_MERGE'
  | 'KEPT_SEPARATE'
  | 'REJECTED'
  | 'ESCALATED';

export type StewardshipRole =
  | 'DATA_OWNER'
  | 'DATA_STEWARD'
  | 'APPROVER'
  | 'REVIEWER';

export type ChangeRequestStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type IssueStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_REVIEW'
  | 'RESOLVED'
  | 'WONT_FIX';

export type ReconciliationJobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type AIClassificationType =
  | 'DATA-DERIVED'
  | 'CALCULATED'
  | 'RULE-BASED'
  | 'AI-ASSISTED'
  | 'AI-PREDICTED';

export interface MasterDomainSummary {
  id: string;
  domainCode: MasterDomainCode;
  domainName: string;
  sourceModule: string;
  entityType: string;
  description: string;
  dataOwnerRole: string;
  dataStewardUserId?: string;
  dataStewardName?: string;
  qualityTargetScore: number;
  currentAverageQuality: number;
  totalRecordsCount: number;
  activeRecordsCount: number;
  duplicateCandidatesCount: number;
  openIssuesCount: number;
  retentionYears: number;
  isArchivalEnabled: boolean;
  lastReconciledAt?: string;
}

export interface MasterRecordIdentifier {
  id?: string;
  identifierType: 'TAX_ID' | 'VAT_NO' | 'REG_NO' | 'PASSPORT' | 'EMIRATES_ID' | 'SERIAL_NO' | 'SKU' | 'IBAN' | 'EMAIL' | 'PHONE';
  identifierValue: string;
  normalizedValue: string;
  isPrimary: boolean;
  isUniqueInDomain: boolean;
  issuingAuthority?: string;
  validFrom?: string;
  validTo?: string;
}

export interface MasterRecordItem {
  id: string;
  canonicalId: string;
  domainCode: MasterDomainCode;
  entityType: string;
  sourceModule: string;
  sourceEntityId: string;
  primaryName: string;
  secondaryName?: string;
  code: string;
  status: MasterRecordStatus;
  approvalStatus: MasterApprovalStatus;
  qualityScore: number;
  qualityClassification: QualityClassification;
  version: number;
  effectiveDate: string;
  expiryDate?: string;
  lastVerifiedAt: string;
  verifiedBy: string;
  isGoldenRecord: boolean;
  goldenRecordId?: string;
  mergedIntoId?: string;
  mergedAt?: string;
  dataPayload: Record<string, any>;
  identifiers: MasterRecordIdentifier[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface MasterRecordVersion {
  id: string;
  masterRecordId: string;
  canonicalId: string;
  versionNumber: number;
  changeType: 'CREATE' | 'UPDATE' | 'MERGE' | 'STATUS_CHANGE' | 'ROLLBACK';
  changeReason: string;
  previousPayload?: Record<string, any>;
  newPayload: Record<string, any>;
  changedFields: string[];
  effectiveDate: string;
  expiryDate?: string;
  approvedByUserId?: string;
  approvedByUserName?: string;
  approvedAt?: string;
  createdAt: string;
  createdBy: string;
}

export interface QualityDimensionScore {
  dimension: QualityDimension;
  weightPercentage: number;
  score: number;
  passedRules: number;
  totalRules: number;
}

export interface DataQualityEvaluationResult {
  id: string;
  masterRecordId: string;
  canonicalId: string;
  domainCode: MasterDomainCode;
  overallScore: number;
  classification: QualityClassification;
  dimensionScores: Record<QualityDimension, QualityDimensionScore>;
  rulesEvaluatedCount: number;
  rulesPassedCount: number;
  rulesFailedCount: number;
  failedRuleCodes: string[];
  evaluationTimestamp: string;
  findings: Array<{
    ruleCode: string;
    ruleName: string;
    dimension: QualityDimension;
    severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
    message: string;
    field?: string;
  }>;
}

export interface DataQualityRuleDef {
  id: string;
  ruleCode: string;
  ruleName: string;
  domainCode: MasterDomainCode | 'ALL';
  dimension: QualityDimension;
  weightPercentage: number;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  ruleType: 'REGEX' | 'FORMAT' | 'MANDATORY_FIELD' | 'CROSS_FIELD' | 'FOREIGN_REF' | 'RANGE' | 'CUSTOM_LOGIC';
  ruleDefinition: Record<string, any>;
  errorMessage: string;
  remediationGuidance: string;
  isEnabled: boolean;
}

export interface DataQualityIssueItem {
  id: string;
  issueCode: string;
  issueType: string;
  title: string;
  description: string;
  domainCode: MasterDomainCode;
  masterRecordId?: string;
  canonicalId?: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  status: IssueStatus;
  assignedToUserId?: string;
  assignedToName?: string;
  detectedAt: string;
  detectedBy: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedByUserId?: string;
  resolvedByUserName?: string;
  aiRemediationSuggestion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DuplicateCandidateItem {
  id: string;
  domainCode: MasterDomainCode;
  candidateARecordId: string;
  candidateACanonicalId: string;
  candidateAName: string;
  candidateBRecordId: string;
  candidateBCanonicalId: string;
  candidateBName: string;
  similarityScore: number; // 0.0 to 1.0
  detectionReason: string;
  matchingFields: Array<{
    field: string;
    valueA: any;
    valueB: any;
    matchType: 'EXACT' | 'NORMALIZED' | 'FUZZY' | 'IDENTIFIER';
  }>;
  status: DuplicateStatus;
  reviewedByUserId?: string;
  reviewedByUserName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  aiAssistedExplanation?: string;
  aiClassification: AIClassificationType;
  createdAt: string;
  updatedAt: string;
}

export interface GoldenRecordItem {
  id: string;
  goldenCanonicalId: string;
  domainCode: MasterDomainCode;
  primaryName: string;
  consolidatedPayload: Record<string, any>;
  sourceRecordIds: string[];
  primarySourceRecordId: string;
  survivorshipRulesApplied: Array<{
    field: string;
    sourceRecordId: string;
    sourceCanonicalId: string;
    chosenValue: any;
    ruleType: 'MOST_RECENT' | 'PRIMARY_SOURCE' | 'HIGHEST_QUALITY' | 'MANUAL_OVERRIDE';
  }>;
  confidenceScore: number;
  status: 'ACTIVE' | 'SUPERSEDED' | 'INACTIVE';
  approvedByUserId: string;
  approvedByUserName: string;
  approvedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationJobItem {
  id: string;
  jobCode: string;
  jobName: string;
  domainCode: MasterDomainCode;
  participatingModules: string[];
  status: ReconciliationJobStatus;
  triggerType: 'MANUAL' | 'SCHEDULED' | 'EVENT_DRIVEN';
  startTime: string;
  endTime?: string;
  recordsScannedCount: number;
  issuesFoundCount: number;
  issuesResolvedCount: number;
  orphanRecordsCount: number;
  conflictsCount: number;
  summaryReport: {
    scannedEntities: number;
    moduleBreakdown: Record<string, { total: number; reconciled: number; discrepancies: number }>;
    orphans: Array<{ module: string; entityId: string; reason: string }>;
    conflicts: Array<{ canonicalId: string; field: string; values: Record<string, any>; severity: string }>;
  };
  executedByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LineageNode {
  id: string;
  label: string;
  category: 'SOURCE' | 'MASTER' | 'CONSUMING_MODULE' | 'TRANSACTION' | 'REPORT' | 'AI_ANALYTICS';
  module: string;
  entityCount?: number;
  description?: string;
  details?: Record<string, any>;
}

export interface LineageEdge {
  id: string;
  from: string;
  to: string;
  relationship: string;
  flowDirection: 'FORWARD' | 'BIDIRECTIONAL';
  activeVolume?: string;
}

export interface DataLineageItem {
  id: string;
  masterRecordId: string;
  canonicalId: string;
  domainCode: MasterDomainCode;
  sourceModule: string;
  sourceSystem: string;
  consumingModules: string[];
  transactionEntities: Array<{ module: string; entityType: string; count: number; lastActivity: string }>;
  reportsDependent: string[];
  aiAnalyticsFeeds: string[];
  lineageGraph: {
    nodes: LineageNode[];
    edges: LineageEdge[];
  };
  lastLineageMappedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataStewardItem {
  id: string;
  domainCode: MasterDomainCode;
  userId: string;
  userName: string;
  userRole: string;
  stewardshipRole: StewardshipRole;
  assignedAt: string;
  isActive: boolean;
}

export interface DataChangeRequestItem {
  id: string;
  requestCode: string;
  masterRecordId: string;
  canonicalId: string;
  domainCode: MasterDomainCode;
  requestType: 'UPDATE_ATTRIBUTES' | 'BANK_ACCOUNT_CHANGE' | 'MERGE_REQUEST' | 'STATUS_CHANGE' | 'RETIREMENT';
  reason: string;
  currentValue: Record<string, any>;
  proposedValue: Record<string, any>;
  changedFields: string[];
  status: ChangeRequestStatus;
  workflowTaskId?: string;
  submittedByUserId: string;
  submittedByUserName: string;
  submittedAt: string;
  approvedByUserId?: string;
  approvedByUserName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RetentionPolicyItem {
  id: string;
  policyCode: string;
  policyName: string;
  domainCode: MasterDomainCode;
  retentionPeriodMonths: number;
  statutoryBasis: string;
  requiresLegalHoldCheck: boolean;
  actionOnExpiry: 'ARCHIVE_READONLY' | 'NOTIFY_STEWARD' | 'SOFT_DELETE_ELIGIBLE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LegalHoldItem {
  id: string;
  holdCode: string;
  title: string;
  reason: string;
  domainCode: MasterDomainCode;
  targetEntityId?: string;
  targetCanonicalId?: string;
  isGlobalForDomain: boolean;
  status: 'ACTIVE' | 'RELEASED' | 'EXPIRED';
  placedByUserId: string;
  placedByUserName: string;
  placedAt: string;
  releasedByUserId?: string;
  releasedByUserName?: string;
  releasedAt?: string;
  releaseReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GovernanceAuditLogItem {
  id: string;
  action: string;
  domainCode: MasterDomainCode;
  canonicalId: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  changeSummary: string;
  timestamp: string;
}

export interface MDMStatsSummary {
  totalMasterRecords: number;
  activeMasterRecords: number;
  domainsMonitored: number;
  averageQualityScore: number;
  duplicateCandidatesCount: number;
  openQualityIssuesCount: number;
  reconciliationFailuresCount: number;
  pendingChangeApprovalsCount: number;
  staleRecordsCount: number;
  orphanRecordsCount: number;
  goldenRecordsCount: number;
  legalHoldsActiveCount: number;
  governanceComplianceScore: number;
  domainScorecards: Array<{
    domainCode: MasterDomainCode;
    domainName: string;
    qualityScore: number;
    targetScore: number;
    recordsCount: number;
    duplicateCount: number;
    openIssuesCount: number;
    status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'POOR' | 'CRITICAL';
  }>;
  qualityDimensionAverages: Record<QualityDimension, number>;
}
