// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - DATA QUALITY ENGINE
// ============================================================================

import {
  DataQualityRuleDef,
  DataQualityEvaluationResult,
  MasterRecordItem,
  QualityDimension,
  QualityClassification,
  MasterDomainCode,
} from './master_data.types';

export class DataQualityEngine {
  private static instance: DataQualityEngine;
  private rules: Map<string, DataQualityRuleDef> = new Map();

  // Configurable default weights across 7 dimensions
  private dimensionWeights: Record<QualityDimension, number> = {
    COMPLETENESS: 20.0,
    ACCURACY: 20.0,
    CONSISTENCY: 15.0,
    UNIQUENESS: 15.0,
    VALIDITY: 15.0,
    TIMELINESS: 10.0,
    REFERENTIAL: 5.0,
  };

  private constructor() {
    this.seedDefaultRules();
  }

  public static getInstance(): DataQualityEngine {
    if (!DataQualityEngine.instance) {
      DataQualityEngine.instance = new DataQualityEngine();
    }
    return DataQualityEngine.instance;
  }

  private seedDefaultRules() {
    const defaultRules: DataQualityRuleDef[] = [
      // COMPLETENESS
      {
        id: 'rule-comp-001',
        ruleCode: 'RULE_VND_MANDATORY_CONTACT',
        ruleName: 'Vendor Mandatory Contact & Registration',
        domainCode: 'VENDORS',
        dimension: 'COMPLETENESS',
        weightPercentage: 25.0,
        severity: 'HIGH',
        ruleType: 'MANDATORY_FIELD',
        ruleDefinition: { requiredFields: ['email', 'phone', 'contactPerson', 'taxId'] },
        errorMessage: 'Vendor is missing one or more required contact or registration attributes.',
        remediationGuidance: 'Ensure primary email, telephone, contact person, and tax ID are fully populated.',
        isEnabled: true,
      },
      {
        id: 'rule-comp-002',
        ruleCode: 'RULE_EMP_MANDATORY_FIELDS',
        ruleName: 'Employee Mandatory Statutory & Department Details',
        domainCode: 'EMPLOYEES',
        dimension: 'COMPLETENESS',
        weightPercentage: 25.0,
        severity: 'CRITICAL',
        ruleType: 'MANDATORY_FIELD',
        ruleDefinition: { requiredFields: ['department', 'designation', 'email', 'nationalId'] },
        errorMessage: 'Employee record lacks essential department, designation, or statutory ID.',
        remediationGuidance: 'Update HRMS profile with official job title, department assignment, and national identifier.',
        isEnabled: true,
      },
      {
        id: 'rule-comp-003',
        ruleCode: 'RULE_MAT_MANDATORY_SPEC',
        ruleName: 'Material SKU & Technical Specification Completeness',
        domainCode: 'MATERIALS',
        dimension: 'COMPLETENESS',
        weightPercentage: 25.0,
        severity: 'HIGH',
        ruleType: 'MANDATORY_FIELD',
        ruleDefinition: { requiredFields: ['sku', 'uom', 'category', 'specification'] },
        errorMessage: 'Material master record missing standardized SKU code, UOM, or engineering spec.',
        remediationGuidance: 'Provide standard unit of measurement, catalog classification, and technical datasheet references.',
        isEnabled: true,
      },
      {
        id: 'rule-comp-004',
        ruleCode: 'RULE_AST_MANDATORY_LOCATION',
        ruleName: 'Asset Tag & Location Assignment',
        domainCode: 'ASSETS',
        dimension: 'COMPLETENESS',
        weightPercentage: 25.0,
        severity: 'HIGH',
        ruleType: 'MANDATORY_FIELD',
        ruleDefinition: { requiredFields: ['assetTag', 'serialNumber', 'category', 'location'] },
        errorMessage: 'Asset lacks physical asset tag, serial number, or assigned facility location.',
        remediationGuidance: 'Affix physical QR/barcode tag, record manufacturer serial number, and assign GPS/site zone.',
        isEnabled: true,
      },

      // VALIDITY & FORMAT
      {
        id: 'rule-val-001',
        ruleCode: 'RULE_VND_TAX_FORMAT',
        ruleName: 'Vendor Tax/VAT Identification Number Format',
        domainCode: 'VENDORS',
        dimension: 'VALIDITY',
        weightPercentage: 30.0,
        severity: 'CRITICAL',
        ruleType: 'REGEX',
        ruleDefinition: { field: 'taxId', pattern: '^(AE[0-9]{15}|TRN-[0-9]{10,15}|[0-9]{15})$' },
        errorMessage: 'Tax registration number format does not comply with UAE TRN / FTA statutory syntax.',
        remediationGuidance: 'Verify 15-digit FTA Tax Registration Number (TRN) from official vendor tax registration certificate.',
        isEnabled: true,
      },
      {
        id: 'rule-val-002',
        ruleCode: 'RULE_VND_IBAN_FORMAT',
        ruleName: 'Vendor Banking IBAN Format Validation',
        domainCode: 'VENDORS',
        dimension: 'VALIDITY',
        weightPercentage: 30.0,
        severity: 'CRITICAL',
        ruleType: 'REGEX',
        ruleDefinition: { field: 'iban', pattern: '^AE[0-9]{21}$|^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$' },
        errorMessage: 'Vendor IBAN does not conform to ISO 13616 banking standard.',
        remediationGuidance: 'Obtain authorized bank confirmation letter verifying 23-character UAE IBAN syntax.',
        isEnabled: true,
      },
      {
        id: 'rule-val-003',
        ruleCode: 'RULE_EMAIL_SYNTAX',
        ruleName: 'Corporate Email Format Validation',
        domainCode: 'ALL',
        dimension: 'VALIDITY',
        weightPercentage: 20.0,
        severity: 'MEDIUM' as any,
        ruleType: 'REGEX',
        ruleDefinition: { field: 'email', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        errorMessage: 'Email address contains invalid formatting or unsupported characters.',
        remediationGuidance: 'Provide standard RFC 5322 compliant corporate email address.',
        isEnabled: true,
      },

      // CONSISTENCY
      {
        id: 'rule-con-001',
        ruleCode: 'RULE_PRJ_COST_CENTER_LINK',
        ruleName: 'Project to Active Cost Center Consistency',
        domainCode: 'PROJECTS',
        dimension: 'CONSISTENCY',
        weightPercentage: 40.0,
        severity: 'HIGH',
        ruleType: 'CROSS_FIELD',
        ruleDefinition: { fieldA: 'costCenterId', fieldB: 'divisionId' },
        errorMessage: 'Project cost center code is disjoint or contradictory with operational division.',
        remediationGuidance: 'Align general ledger cost center with project charter division hierarchy.',
        isEnabled: true,
      },
      {
        id: 'rule-con-002',
        ruleCode: 'RULE_MAT_UOM_STANDARDIZATION',
        ruleName: 'Material Standardized Engineering Unit of Measure',
        domainCode: 'MATERIALS',
        dimension: 'CONSISTENCY',
        weightPercentage: 35.0,
        severity: 'HIGH',
        ruleType: 'FORMAT',
        ruleDefinition: { field: 'uom', allowedValues: ['EA', 'PCS', 'MTR', 'KG', 'TON', 'SET', 'DRUM', 'BOX', 'SQM', 'CBM', 'LTR'] },
        errorMessage: 'Material uses unapproved non-standard unit of measure.',
        remediationGuidance: 'Map custom unit description to standard ISO engineering metric codes (e.g. MTR, TON, PCS).',
        isEnabled: true,
      },

      // ACCURACY
      {
        id: 'rule-acc-001',
        ruleCode: 'RULE_AST_DEPRECIATION_RANGE',
        ruleName: 'Asset Useful Life & Cost Center Accuracy',
        domainCode: 'ASSETS',
        dimension: 'ACCURACY',
        weightPercentage: 35.0,
        severity: 'HIGH',
        ruleType: 'RANGE',
        ruleDefinition: { field: 'usefulLifeMonths', min: 12, max: 600 },
        errorMessage: 'Asset useful life amortization period is outside realistic capital bounds (1-50 years).',
        remediationGuidance: 'Verify corporate accounting depreciation schedules for machinery and fleet classifications.',
        isEnabled: true,
      },

      // UNIQUENESS
      {
        id: 'rule-unq-001',
        ruleCode: 'RULE_CANONICAL_UNIQUE_IDENTIFIER',
        ruleName: 'Canonical Identifier & Code Uniqueness',
        domainCode: 'ALL',
        dimension: 'UNIQUENESS',
        weightPercentage: 50.0,
        severity: 'CRITICAL',
        ruleType: 'CUSTOM_LOGIC',
        ruleDefinition: { checkType: 'UNIQUE_CODE' },
        errorMessage: 'Master record code conflicts with existing registered canonical entity.',
        remediationGuidance: 'Resolve code collisions using the master numbering sequence generator.',
        isEnabled: true,
      },

      // TIMELINESS
      {
        id: 'rule-time-001',
        ruleCode: 'RULE_MASTER_STALE_VERIFICATION',
        ruleName: 'Master Data Annual Periodic Re-Verification',
        domainCode: 'ALL',
        dimension: 'TIMELINESS',
        weightPercentage: 40.0,
        severity: 'WARNING',
        ruleType: 'RANGE',
        ruleDefinition: { maxAgeDays: 365 },
        errorMessage: 'Master record has not been verified by data steward in over 365 calendar days.',
        remediationGuidance: 'Initiate master data renewal campaign and verify active operational validity with steward.',
        isEnabled: true,
      },

      // REFERENTIAL INTEGRITY
      {
        id: 'rule-ref-001',
        ruleCode: 'RULE_FOREIGN_ENTITY_INTEGRITY',
        ruleName: 'Cross-Module Foreign Key Referential Integrity',
        domainCode: 'ALL',
        dimension: 'REFERENTIAL',
        weightPercentage: 50.0,
        severity: 'CRITICAL',
        ruleType: 'FOREIGN_REF',
        ruleDefinition: { checkForeignKeys: true },
        errorMessage: 'Record references a missing, archived, or non-existent master entity.',
        remediationGuidance: 'Link to an active verified master canonical identifier.',
        isEnabled: true,
      },
    ];

    defaultRules.forEach((rule) => this.rules.set(rule.ruleCode, rule));
  }

  public registerRule(rule: DataQualityRuleDef) {
    this.rules.set(rule.ruleCode, rule);
  }

  public getAllRules(): DataQualityRuleDef[] {
    return Array.from(this.rules.values());
  }

  public getRulesForDomain(domainCode: MasterDomainCode): DataQualityRuleDef[] {
    return Array.from(this.rules.values()).filter(
      (r) => r.isEnabled && (r.domainCode === domainCode || r.domainCode === 'ALL')
    );
  }

  public setDimensionWeights(weights: Partial<Record<QualityDimension, number>>) {
    this.dimensionWeights = { ...this.dimensionWeights, ...weights };
  }

  public getDimensionWeights(): Record<QualityDimension, number> {
    return { ...this.dimensionWeights };
  }

  /**
   * Deterministic evaluation of a master record against all active domain rules
   */
  public evaluateRecord(record: MasterRecordItem): DataQualityEvaluationResult {
    const applicableRules = this.getRulesForDomain(record.domainCode);
    const findings: DataQualityEvaluationResult['findings'] = [];
    const failedRuleCodes: string[] = [];

    // Track dimension passes & totals
    const dimensionBuckets: Record<
      QualityDimension,
      { passed: number; total: number; totalWeight: number; passedWeight: number }
    > = {
      COMPLETENESS: { passed: 0, total: 0, totalWeight: 0, passedWeight: 0 },
      ACCURACY: { passed: 0, total: 0, totalWeight: 0, passedWeight: 0 },
      CONSISTENCY: { passed: 0, total: 0, totalWeight: 0, passedWeight: 0 },
      UNIQUENESS: { passed: 0, total: 0, totalWeight: 0, passedWeight: 0 },
      VALIDITY: { passed: 0, total: 0, totalWeight: 0, passedWeight: 0 },
      TIMELINESS: { passed: 0, total: 0, totalWeight: 0, passedWeight: 0 },
      REFERENTIAL: { passed: 0, total: 0, totalWeight: 0, passedWeight: 0 },
    };

    const payload = record.dataPayload || {};

    applicableRules.forEach((rule) => {
      const bucket = dimensionBuckets[rule.dimension];
      bucket.total++;
      bucket.totalWeight += rule.weightPercentage;

      let rulePassed = true;
      let failureReason = '';

      switch (rule.ruleType) {
        case 'MANDATORY_FIELD': {
          const reqFields: string[] = rule.ruleDefinition.requiredFields || [];
          for (const field of reqFields) {
            const val = payload[field] || (record as any)[field];
            if (val === undefined || val === null || val === '') {
              rulePassed = false;
              failureReason = `Missing mandatory attribute: '${field}'`;
              break;
            }
          }
          break;
        }

        case 'REGEX': {
          const field = rule.ruleDefinition.field;
          const pattern = new RegExp(rule.ruleDefinition.pattern);
          const val = payload[field] || (record as any)[field];
          if (val && typeof val === 'string') {
            if (!pattern.test(val)) {
              rulePassed = false;
              failureReason = `Value '${val}' for '${field}' does not match statutory pattern`;
            }
          }
          break;
        }

        case 'FORMAT': {
          const field = rule.ruleDefinition.field;
          const allowed: string[] = rule.ruleDefinition.allowedValues || [];
          const val = payload[field] || (record as any)[field];
          if (val && allowed.length > 0 && !allowed.includes(String(val).toUpperCase())) {
            rulePassed = false;
            failureReason = `Value '${val}' for '${field}' is not in approved list [${allowed.join(', ')}]`;
          }
          break;
        }

        case 'RANGE': {
          const field = rule.ruleDefinition.field;
          if (rule.ruleDefinition.maxAgeDays) {
            const lastVerified = new Date(record.lastVerifiedAt).getTime();
            const now = Date.now();
            const ageDays = (now - lastVerified) / (1000 * 60 * 60 * 24);
            if (ageDays > rule.ruleDefinition.maxAgeDays) {
              rulePassed = false;
              failureReason = `Record age (${Math.floor(ageDays)} days) exceeds verification window (${rule.ruleDefinition.maxAgeDays} days)`;
            }
          } else if (field) {
            const val = Number(payload[field]);
            if (!isNaN(val)) {
              if (
                (rule.ruleDefinition.min !== undefined && val < rule.ruleDefinition.min) ||
                (rule.ruleDefinition.max !== undefined && val > rule.ruleDefinition.max)
              ) {
                rulePassed = false;
                failureReason = `Value ${val} for '${field}' out of valid range [${rule.ruleDefinition.min} - ${rule.ruleDefinition.max}]`;
              }
            }
          }
          break;
        }

        case 'CROSS_FIELD':
        case 'CUSTOM_LOGIC':
        case 'FOREIGN_REF':
        default:
          // Default valid unless flagged
          break;
      }

      if (rulePassed) {
        bucket.passed++;
        bucket.passedWeight += rule.weightPercentage;
      } else {
        failedRuleCodes.push(rule.ruleCode);
        findings.push({
          ruleCode: rule.ruleCode,
          ruleName: rule.ruleName,
          dimension: rule.dimension,
          severity: rule.severity,
          message: failureReason || rule.errorMessage,
          field: rule.ruleDefinition.field || (rule.ruleDefinition.requiredFields ? rule.ruleDefinition.requiredFields[0] : undefined),
        });
      }
    });

    // Compute dimension scores
    const dimensionScores: Record<QualityDimension, any> = {} as any;
    let weightedScoreAccumulator = 0;
    let totalAssignedWeight = 0;

    const dimensions: QualityDimension[] = [
      'COMPLETENESS',
      'ACCURACY',
      'CONSISTENCY',
      'UNIQUENESS',
      'VALIDITY',
      'TIMELINESS',
      'REFERENTIAL',
    ];

    dimensions.forEach((dim) => {
      const bucket = dimensionBuckets[dim];
      const dimWeight = this.dimensionWeights[dim];
      const rawDimScore =
        bucket.total === 0 ? 100.0 : bucket.totalWeight > 0 ? (bucket.passedWeight / bucket.totalWeight) * 100.0 : 100.0;

      dimensionScores[dim] = {
        dimension: dim,
        weightPercentage: dimWeight,
        score: Math.round(rawDimScore * 10) / 10,
        passedRules: bucket.passed,
        totalRules: bucket.total,
      };

      weightedScoreAccumulator += rawDimScore * (dimWeight / 100.0);
      totalAssignedWeight += dimWeight;
    });

    const overallScore = Math.round((weightedScoreAccumulator / (totalAssignedWeight / 100.0)) * 10) / 10;

    // Classification
    let classification: QualityClassification = 'EXCELLENT';
    if (overallScore >= 95.0) classification = 'EXCELLENT';
    else if (overallScore >= 85.0) classification = 'GOOD';
    else if (overallScore >= 70.0) classification = 'WARNING';
    else if (overallScore >= 50.0) classification = 'POOR';
    else classification = 'CRITICAL';

    return {
      id: `dqr-${record.id}-${Date.now()}`,
      masterRecordId: record.id,
      canonicalId: record.canonicalId,
      domainCode: record.domainCode,
      overallScore,
      classification,
      dimensionScores,
      rulesEvaluatedCount: applicableRules.length,
      rulesPassedCount: applicableRules.length - failedRuleCodes.length,
      rulesFailedCount: failedRuleCodes.length,
      failedRuleCodes,
      evaluationTimestamp: new Date().toISOString(),
      findings,
    };
  }
}

export const dataQualityEngine = DataQualityEngine.getInstance();
