// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - GOVERNANCE, RETENTION & CHANGE CONTROL
// ============================================================================

import {
  MasterDomainCode,
  DataStewardItem,
  DataChangeRequestItem,
  RetentionPolicyItem,
  LegalHoldItem,
  MasterRecordItem,
} from './master_data.types';

export class DataGovernanceEngine {
  private static instance: DataGovernanceEngine;

  private stewards: Map<string, DataStewardItem> = new Map();
  private retentionPolicies: Map<string, RetentionPolicyItem> = new Map();
  private legalHolds: Map<string, LegalHoldItem> = new Map();

  private constructor() {
    this.seedDefaultPolicies();
    this.seedDefaultStewards();
  }

  public static getInstance(): DataGovernanceEngine {
    if (!DataGovernanceEngine.instance) {
      DataGovernanceEngine.instance = new DataGovernanceEngine();
    }
    return DataGovernanceEngine.instance;
  }

  private seedDefaultPolicies() {
    const policies: RetentionPolicyItem[] = [
      {
        id: 'ret-vnd-01',
        policyCode: 'RET-VND-FIN-07Y',
        policyName: 'Vendor & Statutory Commercial Ledger Retention (7 Years)',
        domainCode: 'VENDORS',
        retentionPeriodMonths: 84,
        statutoryBasis: 'Commercial Companies Law & FTA Federal Tax Procedure Law No. 7',
        requiresLegalHoldCheck: true,
        actionOnExpiry: 'ARCHIVE_READONLY',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ret-emp-01',
        policyCode: 'RET-EMP-HR-10Y',
        policyName: 'Employee Personnel, Statutory & Payroll Records (10 Years)',
        domainCode: 'EMPLOYEES',
        retentionPeriodMonths: 120,
        statutoryBasis: 'Federal Decree-Law No. 33 on Regulation of Labour Relations & MOHRE Regulations',
        requiresLegalHoldCheck: true,
        actionOnExpiry: 'ARCHIVE_READONLY',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ret-prj-01',
        policyCode: 'RET-PRJ-ENG-15Y',
        policyName: 'Engineering As-Built & Water Infrastructure Project Assets (15 Years)',
        domainCode: 'PROJECTS',
        retentionPeriodMonths: 180,
        statutoryBasis: 'Civil Code Decennial Liability & Engineering Infrastructure Mandates',
        requiresLegalHoldCheck: true,
        actionOnExpiry: 'ARCHIVE_READONLY',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ret-ast-01',
        policyCode: 'RET-AST-EAM-10Y',
        policyName: 'Capital Asset & Heavy Machinery Maintenance History (10 Years)',
        domainCode: 'ASSETS',
        retentionPeriodMonths: 120,
        statutoryBasis: 'Corporate Fixed Asset Accounting & Insurance Warranties',
        requiresLegalHoldCheck: true,
        actionOnExpiry: 'ARCHIVE_READONLY',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ret-mat-01',
        policyCode: 'RET-MAT-INV-05Y',
        policyName: 'Material SKU & Mechanical Store Movements (5 Years)',
        domainCode: 'MATERIALS',
        retentionPeriodMonths: 60,
        statutoryBasis: 'Inventory Auditing & Supply Chain Standards',
        requiresLegalHoldCheck: true,
        actionOnExpiry: 'ARCHIVE_READONLY',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    policies.forEach((p) => this.retentionPolicies.set(p.policyCode, p));
  }

  private seedDefaultStewards() {
    const stewards: DataStewardItem[] = [
      {
        id: 'stew-vnd-01',
        domainCode: 'VENDORS',
        userId: 'usr-proc-01',
        userName: 'Procurement Director (Sarah Jenkins)',
        userRole: 'PROCUREMENT_OFFICER',
        stewardshipRole: 'DATA_OWNER',
        assignedAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: 'stew-emp-01',
        domainCode: 'EMPLOYEES',
        userId: 'usr-hr-01',
        userName: 'HR Operations Lead (Fatima Al-Mansoor)',
        userRole: 'HR_MANAGER',
        stewardshipRole: 'DATA_OWNER',
        assignedAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: 'stew-ast-01',
        domainCode: 'ASSETS',
        userId: 'usr-eam-01',
        userName: 'Chief Plant Engineer (Vikram Rao)',
        userRole: 'MAINTENANCE_SUPERVISOR',
        stewardshipRole: 'DATA_STEWARD',
        assignedAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: 'stew-prj-01',
        domainCode: 'PROJECTS',
        userId: 'usr-pm-01',
        userName: 'Head of Project Controls (David Chen)',
        userRole: 'PROJECT_MANAGER',
        stewardshipRole: 'DATA_OWNER',
        assignedAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: 'stew-mat-01',
        domainCode: 'MATERIALS',
        userId: 'usr-inv-01',
        userName: 'Central Warehouse Custodian (Ali Hassan)',
        userRole: 'INVENTORY_MANAGER',
        stewardshipRole: 'DATA_STEWARD',
        assignedAt: new Date().toISOString(),
        isActive: true,
      },
    ];

    stewards.forEach((s) => this.stewards.set(s.id, s));
  }

  public getRetentionPolicies(): RetentionPolicyItem[] {
    return Array.from(this.retentionPolicies.values());
  }

  public getStewards(): DataStewardItem[] {
    return Array.from(this.stewards.values());
  }

  public getStewardsForDomain(domainCode: MasterDomainCode): DataStewardItem[] {
    return Array.from(this.stewards.values()).filter((s) => s.domainCode === domainCode && s.isActive);
  }

  public getLegalHolds(): LegalHoldItem[] {
    return Array.from(this.legalHolds.values());
  }

  public addLegalHold(hold: LegalHoldItem) {
    this.legalHolds.set(hold.holdCode, hold);
  }

  public releaseLegalHold(holdCode: string, releaseReason: string, userId: string, userName: string): boolean {
    const hold = this.legalHolds.get(holdCode);
    if (!hold) return false;
    hold.status = 'RELEASED';
    hold.releasedAt = new Date().toISOString();
    hold.releaseReason = releaseReason;
    hold.releasedByUserId = userId;
    hold.releasedByUserName = userName;
    return true;
  }

  /**
   * Check if a master entity is under active legal hold
   */
  public isEntityUnderLegalHold(record: MasterRecordItem): { isHold: boolean; hold?: LegalHoldItem } {
    for (const hold of this.legalHolds.values()) {
      if (hold.status === 'ACTIVE') {
        if (hold.isGlobalForDomain && hold.domainCode === record.domainCode) {
          return { isHold: true, hold };
        }
        if (hold.targetCanonicalId === record.canonicalId || hold.targetEntityId === record.id) {
          return { isHold: true, hold };
        }
      }
    }
    return { isHold: false };
  }
}

export const dataGovernanceEngine = DataGovernanceEngine.getInstance();
