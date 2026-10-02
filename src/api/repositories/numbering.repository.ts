import { db, createPool } from '../../db';
import { documentSequences, documentNumberingPolicies, documentAllocations } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';

export type DocumentEntityType =
  | 'PURCHASE_ORDER'
  | 'GOODS_RECEIPT'
  | 'MATERIAL_ISSUE'
  | 'MATERIAL_RETURN'
  | 'MATERIAL_TRANSFER'
  | 'MATERIAL_REQUEST'
  | 'PURCHASE_REQUISITION'
  | 'RFQ'
  | 'QUOTATION'
  | 'CASH_REQUEST'
  | 'CASH_SETTLEMENT'
  | 'RA_BILL'
  | 'PAYMENT'
  | 'QUALITY_NCR'
  | 'RESOURCE_PLAN'
  | 'RESOURCE_ALLOCATION'
  | 'RESOURCE_REQUEST';

export type SequenceScopeType = 'GLOBAL' | 'COMPANY' | 'BRANCH' | 'PROJECT';
export type ResetFrequency = 'NEVER' | 'YEARLY' | 'MONTHLY';

export interface DocumentNumberingPolicy {
  id: string;
  companyId?: string | null;
  entityType: string;
  scopeType: SequenceScopeType;
  prefix: string;
  formatPattern: string; // e.g. '{PREFIX}-{FY}-{SEQ}' or '{PROJECT}-{PREFIX}-{FY}-{SEQ}'
  padLength: number;
  step: number;
  resetFrequency: ResetFrequency;
  fiscalYearStartMonth: number; // 1 = Jan (Calendar), 4 = Apr (Indian/UK)
  allowManualOverride: boolean;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSequenceRecord {
  id: string;
  companyId?: string | null;
  branchId?: string | null;
  projectId?: string | null;
  entityType: string;
  fiscalYear: string;
  scopeType: SequenceScopeType;
  prefix: string;
  formatPattern: string;
  currentSequence: number;
  padLength: number;
  step: number;
  resetFrequency: ResetFrequency;
  lastResetDate?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AllocateNumberParams {
  entityType: DocumentEntityType | string;
  companyId?: string | null;
  branchId?: string | null;
  projectId?: string | null;
  date?: Date | string;
  customPrefix?: string;
  customFormat?: string;
  manualNumber?: string;
  allocatedBy?: string;
  documentId?: string;
  companyCode?: string;
  branchCode?: string;
  projectCode?: string;
}

export interface AllocationResult {
  documentNumber: string;
  sequenceValue: number;
  fiscalYear: string;
  sequenceId: string;
  prefix: string;
  isManualOverride?: boolean;
}

/**
 * Standard System Default Policies
 */
export const DEFAULT_NUMBERING_POLICIES: Record<string, Omit<DocumentNumberingPolicy, 'id' | 'createdAt' | 'updatedAt'>> = {
  PURCHASE_ORDER: {
    entityType: 'PURCHASE_ORDER',
    scopeType: 'COMPANY',
    prefix: 'PO',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Purchase Order numbering policy',
    isActive: true,
  },
  GOODS_RECEIPT: {
    entityType: 'GOODS_RECEIPT',
    scopeType: 'COMPANY',
    prefix: 'GRN',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Goods Receipt Note numbering policy',
    isActive: true,
  },
  MATERIAL_ISSUE: {
    entityType: 'MATERIAL_ISSUE',
    scopeType: 'COMPANY',
    prefix: 'MIV',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Material Issue Voucher numbering policy',
    isActive: true,
  },
  MATERIAL_RETURN: {
    entityType: 'MATERIAL_RETURN',
    scopeType: 'COMPANY',
    prefix: 'RET',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Material Return Note numbering policy',
    isActive: true,
  },
  MATERIAL_TRANSFER: {
    entityType: 'MATERIAL_TRANSFER',
    scopeType: 'COMPANY',
    prefix: 'TRF',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Material Transfer Note numbering policy',
    isActive: true,
  },
  MATERIAL_REQUEST: {
    entityType: 'MATERIAL_REQUEST',
    scopeType: 'COMPANY',
    prefix: 'MR',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Material Request numbering policy',
    isActive: true,
  },
  PURCHASE_REQUISITION: {
    entityType: 'PURCHASE_REQUISITION',
    scopeType: 'COMPANY',
    prefix: 'PR',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Purchase Requisition numbering policy',
    isActive: true,
  },
  RFQ: {
    entityType: 'RFQ',
    scopeType: 'COMPANY',
    prefix: 'RFQ',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Request For Quotation numbering policy',
    isActive: true,
  },
  QUOTATION: {
    entityType: 'QUOTATION',
    scopeType: 'COMPANY',
    prefix: 'QOT',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Vendor Quotation numbering policy',
    isActive: true,
  },
  CASH_REQUEST: {
    entityType: 'CASH_REQUEST',
    scopeType: 'COMPANY',
    prefix: 'CR',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Project Cash Request numbering policy',
    isActive: true,
  },
  CASH_SETTLEMENT: {
    entityType: 'CASH_SETTLEMENT',
    scopeType: 'COMPANY',
    prefix: 'STL',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Cash Request Settlement numbering policy',
    isActive: true,
  },
  RA_BILL: {
    entityType: 'RA_BILL',
    scopeType: 'COMPANY',
    prefix: 'RA',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Running Account Bill numbering policy',
    isActive: true,
  },
  PAYMENT: {
    entityType: 'PAYMENT',
    scopeType: 'COMPANY',
    prefix: 'PAY',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Payment Voucher numbering policy',
    isActive: true,
  },
  QUALITY_NCR: {
    entityType: 'QUALITY_NCR',
    scopeType: 'PROJECT',
    prefix: 'NCR',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Quality Non-Conformance Report numbering policy',
    isActive: true,
  },
  RESOURCE_PLAN: {
    entityType: 'RESOURCE_PLAN',
    scopeType: 'COMPANY',
    prefix: 'PLN',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Resource Plan numbering policy',
    isActive: true,
  },
  RESOURCE_ALLOCATION: {
    entityType: 'RESOURCE_ALLOCATION',
    scopeType: 'COMPANY',
    prefix: 'ALC',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Resource Allocation numbering policy',
    isActive: true,
  },
  RESOURCE_REQUEST: {
    entityType: 'RESOURCE_REQUEST',
    scopeType: 'COMPANY',
    prefix: 'REQ',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: true,
    description: 'Standard Resource Request numbering policy',
    isActive: true,
  },
  CONTRACT: {
    entityType: 'CONTRACT',
    scopeType: 'COMPANY',
    prefix: 'CNT',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: false,
    description: 'Construction/vendor contract numbering policy',
    isActive: true,
  },
  CONTRACT_VARIATION: {
    entityType: 'CONTRACT_VARIATION',
    scopeType: 'COMPANY',
    prefix: 'VO',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: false,
    description: 'Contract variation order numbering policy',
    isActive: true,
  },
  CONTRACT_EXTENSION: {
    entityType: 'CONTRACT_EXTENSION',
    scopeType: 'COMPANY',
    prefix: 'EOT',
    formatPattern: '{PREFIX}-{FY}-{SEQ}',
    padLength: 4,
    step: 1,
    resetFrequency: 'YEARLY',
    fiscalYearStartMonth: 1,
    allowManualOverride: false,
    description: 'Contract extension numbering policy',
    isActive: true,
  },
};

export class NumberingRepository {
  private static isTableEnsured = false;

  /**
   * Ensure database tables and indices exist in PostgreSQL.
   */
  async ensureTables(): Promise<void> {
    if (NumberingRepository.isTableEnsured) return;

    try {
      const pool = createPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS document_sequences (
          id TEXT PRIMARY KEY,
          company_id TEXT,
          branch_id TEXT,
          project_id TEXT,
          entity_type TEXT NOT NULL,
          fiscal_year TEXT NOT NULL,
          scope_type TEXT NOT NULL DEFAULT 'COMPANY',
          prefix TEXT NOT NULL,
          format_pattern TEXT NOT NULL DEFAULT '{PREFIX}-{FY}-{SEQ}',
          current_sequence INTEGER NOT NULL DEFAULT 0,
          pad_length INTEGER NOT NULL DEFAULT 4,
          step INTEGER NOT NULL DEFAULT 1,
          reset_frequency TEXT NOT NULL DEFAULT 'YEARLY',
          last_reset_date TEXT,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS uq_doc_sequences 
          ON document_sequences (
            COALESCE(company_id, '__GLOBAL__'), 
            COALESCE(branch_id, '__GLOBAL__'), 
            COALESCE(project_id, '__GLOBAL__'), 
            entity_type, 
            fiscal_year
          );

        CREATE INDEX IF NOT EXISTS idx_doc_seq_lookup
          ON document_sequences (entity_type, fiscal_year, is_active);

        CREATE TABLE IF NOT EXISTS document_numbering_policies (
          id TEXT PRIMARY KEY,
          company_id TEXT,
          entity_type TEXT NOT NULL,
          scope_type TEXT NOT NULL DEFAULT 'COMPANY',
          prefix TEXT NOT NULL,
          format_pattern TEXT NOT NULL DEFAULT '{PREFIX}-{FY}-{SEQ}',
          pad_length INTEGER NOT NULL DEFAULT 4,
          step INTEGER NOT NULL DEFAULT 1,
          reset_frequency TEXT NOT NULL DEFAULT 'YEARLY',
          fiscal_year_start_month INTEGER NOT NULL DEFAULT 1,
          allow_manual_override BOOLEAN NOT NULL DEFAULT TRUE,
          description TEXT,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS uq_doc_policies
          ON document_numbering_policies (
            COALESCE(company_id, '__GLOBAL__'),
            entity_type
          );

        CREATE TABLE IF NOT EXISTS document_allocations (
          id TEXT PRIMARY KEY,
          sequence_id TEXT,
          entity_type TEXT NOT NULL,
          allocated_number TEXT NOT NULL,
          sequence_value INTEGER NOT NULL,
          company_id TEXT,
          branch_id TEXT,
          project_id TEXT,
          fiscal_year TEXT NOT NULL,
          document_id TEXT,
          allocated_by TEXT,
          created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_doc_alloc_lookup
          ON document_allocations (allocated_number, entity_type);
      `);

      NumberingRepository.isTableEnsured = true;
    } catch (err) {
      console.error('Error ensuring document numbering tables exist:', err);
    }
  }

  /**
   * Helper to resolve fiscal year string.
   */
  resolveFiscalYear(inputDate?: Date | string, startMonth: number = 1, format: string = 'YYYY'): string {
    const d = inputDate ? (typeof inputDate === 'string' ? new Date(inputDate) : inputDate) : new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1 to 12

    if (startMonth === 1 && format !== 'YYYY-YY') {
      // Calendar year e.g. '2026'
      return String(year);
    }

    // Fiscal year offset (e.g. Indian/UK April 1 to March 31)
    if (month >= startMonth) {
      const nextShortYear = String((year + 1) % 100).padStart(2, '0');
      return `${year}-${nextShortYear}`;
    } else {
      const prevYear = year - 1;
      const curShortYear = String(year % 100).padStart(2, '0');
      return `${prevYear}-${curShortYear}`;
    }
  }

  /**
   * Fetch active policy for entity type and optional company.
   */
  async getPolicy(entityType: string, companyId?: string | null): Promise<DocumentNumberingPolicy> {
    await this.ensureTables();

    // 1. Check company-specific policy
    if (companyId) {
      const compRows = await db
        .select()
        .from(documentNumberingPolicies)
        .where(
          and(
            eq(documentNumberingPolicies.companyId, companyId),
            eq(documentNumberingPolicies.entityType, entityType),
            eq(documentNumberingPolicies.isActive, true)
          )
        )
        .limit(1);

      if (compRows.length > 0) {
        return compRows[0] as DocumentNumberingPolicy;
      }
    }

    // 2. Check global configured policy in DB
    const globalRows = await db
      .select()
      .from(documentNumberingPolicies)
      .where(
        and(
          sql`${documentNumberingPolicies.companyId} IS NULL`,
          eq(documentNumberingPolicies.entityType, entityType),
          eq(documentNumberingPolicies.isActive, true)
        )
      )
      .limit(1);

    if (globalRows.length > 0) {
      return globalRows[0] as DocumentNumberingPolicy;
    }

    // 3. Fallback to built-in system default
    const fallback = DEFAULT_NUMBERING_POLICIES[entityType] || {
      entityType,
      scopeType: 'COMPANY',
      prefix: entityType.substring(0, 3).toUpperCase(),
      formatPattern: '{PREFIX}-{FY}-{SEQ}',
      padLength: 4,
      step: 1,
      resetFrequency: 'YEARLY',
      fiscalYearStartMonth: 1,
      allowManualOverride: true,
      description: `Default system numbering policy for ${entityType}`,
      isActive: true,
    };

    const now = new Date().toISOString();
    return {
      id: `pol_default_${entityType.toLowerCase()}`,
      companyId: null,
      ...fallback,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Format document number using pattern and tokens.
   */
  formatDocumentNumber(
    pattern: string,
    tokens: {
      prefix: string;
      fy: string;
      seq: string;
      companyCode?: string;
      branchCode?: string;
      projectCode?: string;
      date?: Date | string;
    }
  ): string {
    const d = tokens.date
      ? typeof tokens.date === 'string'
        ? new Date(tokens.date)
        : tokens.date
      : new Date();

    const yyyy = String(d.getFullYear());
    const yy = yyyy.slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateCompact = `${yyyy}${mm}${dd}`;

    let result = pattern
      .replace(/{PREFIX}/g, tokens.prefix)
      .replace(/{FY}/g, tokens.fy)
      .replace(/{COMPANY}/g, tokens.companyCode || 'CMP')
      .replace(/{BRANCH}/g, tokens.branchCode || 'BRN')
      .replace(/{PROJECT}/g, tokens.projectCode || 'PRJ')
      .replace(/{YYYY}/g, yyyy)
      .replace(/{YY}/g, yy)
      .replace(/{MM}/g, mm)
      .replace(/{DD}/g, dd)
      .replace(/{DATE}/g, dateCompact);

    // Support both {SEQ} and {SEQ:N} (where N is zero-pad length)
    result = result.replace(/{SEQ(?::(\d+))?}/g, (_match, p1) => {
      const len = p1 ? parseInt(p1, 10) : tokens.seq.length;
      return tokens.seq.padStart(len, '0');
    });

    return result;
  }

  /**
   * Concurrency-safe atomic sequence allocation with PostgreSQL row-level lock (FOR UPDATE).
   * Can be executed inside an existing transaction (passed via clientOrTx) or independently.
   */
  async allocateNextNumber(
    params: AllocateNumberParams,
    clientOrTx?: any
  ): Promise<AllocationResult> {
    await this.ensureTables();

    // 1. Check for valid manual override
    if (params.manualNumber && params.manualNumber.trim().length > 0) {
      const policy = await this.getPolicy(params.entityType, params.companyId);
      if (policy.allowManualOverride) {
        return {
          documentNumber: params.manualNumber.trim(),
          sequenceValue: 0,
          fiscalYear: this.resolveFiscalYear(params.date, policy.fiscalYearStartMonth),
          sequenceId: 'manual',
          prefix: policy.prefix,
          isManualOverride: true,
        };
      }
    }

    const policy = await this.getPolicy(params.entityType, params.companyId);
    const fiscalYear = this.resolveFiscalYear(
      params.date,
      policy.fiscalYearStartMonth,
      (policy as any).fiscalYearFormat || 'YYYY'
    );

    // 2. Resolve scope keys based on policy scope type
    let scopedCompanyId: string | null = null;
    let scopedBranchId: string | null = null;
    let scopedProjectId: string | null = null;

    if (policy.scopeType === 'COMPANY') {
      scopedCompanyId = params.companyId || null;
    } else if (policy.scopeType === 'BRANCH') {
      scopedCompanyId = params.companyId || 'cmp-101';
      scopedBranchId = params.branchId || null;
    } else if (policy.scopeType === 'PROJECT') {
      scopedCompanyId = params.companyId || 'cmp-101';
      scopedBranchId = params.branchId || null;
      scopedProjectId = params.projectId || null;
    }

    const prefix = params.customPrefix || policy.prefix;
    const formatPattern = params.customFormat || policy.formatPattern;
    const padLength = policy.padLength || 4;
    const step = policy.step || 1;
    const nowIso = new Date().toISOString();

    // Internal execution function against a connection/client
    const executeAllocation = async (runner: any): Promise<AllocationResult> => {
      // 3. Atomically find or insert sequence row with lock
      const sqlLookup = `
        SELECT id, current_sequence, step, pad_length, format_pattern, prefix
        FROM document_sequences
        WHERE COALESCE(company_id, '__GLOBAL__') = COALESCE($1, '__GLOBAL__')
          AND COALESCE(branch_id, '__GLOBAL__') = COALESCE($2, '__GLOBAL__')
          AND COALESCE(project_id, '__GLOBAL__') = COALESCE($3, '__GLOBAL__')
          AND entity_type = $4
          AND fiscal_year = $5
        FOR UPDATE;
      `;

      const paramsList = [
        scopedCompanyId,
        scopedBranchId,
        scopedProjectId,
        params.entityType,
        fiscalYear,
      ];

      let rows: any[] = [];
      if (typeof runner.query === 'function') {
        const queryRes = await runner.query(sqlLookup, paramsList);
        rows = queryRes.rows;
      } else if (typeof runner.execute === 'function') {
        const queryRes = await runner.execute(
          sql`SELECT id, current_sequence, step, pad_length, format_pattern, prefix
              FROM document_sequences
              WHERE COALESCE(company_id, '__GLOBAL__') = COALESCE(${scopedCompanyId}, '__GLOBAL__')
                AND COALESCE(branch_id, '__GLOBAL__') = COALESCE(${scopedBranchId}, '__GLOBAL__')
                AND COALESCE(project_id, '__GLOBAL__') = COALESCE(${scopedProjectId}, '__GLOBAL__')
                AND entity_type = ${params.entityType}
                AND fiscal_year = ${fiscalYear}
              FOR UPDATE;`
        );
        rows = (queryRes as any).rows || queryRes;
      }

      let sequenceId = '';
      let sequenceValue = 0;

      if (rows && rows.length > 0) {
        const seqRow = rows[0];
        sequenceId = seqRow.id;
        const currentSeq = Number(seqRow.current_sequence || 0);
        sequenceValue = currentSeq + (Number(seqRow.step) || step);

        const updateSql = `
          UPDATE document_sequences
          SET current_sequence = $1, updated_at = $2
          WHERE id = $3;
        `;
        if (typeof runner.query === 'function') {
          await runner.query(updateSql, [sequenceValue, nowIso, sequenceId]);
        } else if (typeof runner.execute === 'function') {
          await runner.execute(
            sql`UPDATE document_sequences SET current_sequence = ${sequenceValue}, updated_at = ${nowIso} WHERE id = ${sequenceId};`
          );
        }
      } else {
        // Create initial sequence record atomically
        sequenceId = `seq_${params.entityType.toLowerCase()}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
        sequenceValue = 1;

        const insertSql = `
          INSERT INTO document_sequences (
            id, company_id, branch_id, project_id, entity_type, fiscal_year,
            scope_type, prefix, format_pattern, current_sequence, pad_length,
            step, reset_frequency, is_active, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
          )
          ON CONFLICT (
            COALESCE(company_id, '__GLOBAL__'),
            COALESCE(branch_id, '__GLOBAL__'),
            COALESCE(project_id, '__GLOBAL__'),
            entity_type,
            fiscal_year
          )
          DO UPDATE SET
            current_sequence = document_sequences.current_sequence + EXCLUDED.step,
            updated_at = EXCLUDED.updated_at
          RETURNING id, current_sequence;
        `;

        const insertParams = [
          sequenceId,
          scopedCompanyId,
          scopedBranchId,
          scopedProjectId,
          params.entityType,
          fiscalYear,
          policy.scopeType,
          prefix,
          formatPattern,
          sequenceValue,
          padLength,
          step,
          policy.resetFrequency,
          true,
          nowIso,
          nowIso,
        ];

        let insertRes: any = null;
        if (typeof runner.query === 'function') {
          insertRes = await runner.query(insertSql, insertParams);
        } else if (typeof runner.execute === 'function') {
          insertRes = await runner.execute(
            sql`INSERT INTO document_sequences (
                  id, company_id, branch_id, project_id, entity_type, fiscal_year,
                  scope_type, prefix, format_pattern, current_sequence, pad_length,
                  step, reset_frequency, is_active, created_at, updated_at
                ) VALUES (
                  ${sequenceId}, ${scopedCompanyId}, ${scopedBranchId}, ${scopedProjectId}, ${params.entityType}, ${fiscalYear},
                  ${policy.scopeType}, ${prefix}, ${formatPattern}, ${sequenceValue}, ${padLength},
                  ${step}, ${policy.resetFrequency}, true, ${nowIso}, ${nowIso}
                )
                ON CONFLICT (
                  COALESCE(company_id, '__GLOBAL__'),
                  COALESCE(branch_id, '__GLOBAL__'),
                  COALESCE(project_id, '__GLOBAL__'),
                  entity_type,
                  fiscal_year
                )
                DO UPDATE SET
                  current_sequence = document_sequences.current_sequence + EXCLUDED.step,
                  updated_at = EXCLUDED.updated_at
                RETURNING id, current_sequence;`
          );
        }

        const insertedRows = insertRes?.rows || insertRes;
        if (insertedRows && insertedRows.length > 0) {
          sequenceId = insertedRows[0].id;
          sequenceValue = Number(insertedRows[0].current_sequence);
        }
      }

      // Format sequence string
      const seqPadded = String(sequenceValue).padStart(padLength, '0');
      const documentNumber = this.formatDocumentNumber(formatPattern, {
        prefix,
        fy: fiscalYear,
        seq: seqPadded,
        companyCode: params.companyCode || params.companyId || undefined,
        branchCode: params.branchCode || params.branchId || undefined,
        projectCode: params.projectCode || params.projectId || undefined,
        date: params.date,
      });

      // Record allocation log
      const allocId = `alloc_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const allocSql = `
        INSERT INTO document_allocations (
          id, sequence_id, entity_type, allocated_number, sequence_value,
          company_id, branch_id, project_id, fiscal_year, document_id,
          allocated_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
      `;
      const allocParams = [
        allocId,
        sequenceId,
        params.entityType,
        documentNumber,
        sequenceValue,
        scopedCompanyId,
        scopedBranchId,
        scopedProjectId,
        fiscalYear,
        params.documentId || null,
        params.allocatedBy || 'SYSTEM',
        nowIso,
      ];

      try {
        if (typeof runner.query === 'function') {
          await runner.query(allocSql, allocParams);
        } else if (typeof runner.execute === 'function') {
          await runner.execute(
            sql`INSERT INTO document_allocations (
                  id, sequence_id, entity_type, allocated_number, sequence_value,
                  company_id, branch_id, project_id, fiscal_year, document_id,
                  allocated_by, created_at
                ) VALUES (
                  ${allocId}, ${sequenceId}, ${params.entityType}, ${documentNumber}, ${sequenceValue},
                  ${scopedCompanyId}, ${scopedBranchId}, ${scopedProjectId}, ${fiscalYear}, ${params.documentId || null},
                  ${params.allocatedBy || 'SYSTEM'}, ${nowIso}
                );`
          );
        }
      } catch (logErr) {
        console.warn('Document allocation log non-fatal error:', logErr);
      }

      return {
        documentNumber,
        sequenceValue,
        fiscalYear,
        sequenceId,
        prefix,
        isManualOverride: false,
      };
    };

    // If client/transaction provided, execute within caller's transaction boundary
    if (clientOrTx) {
      return await executeAllocation(clientOrTx);
    }

    // Otherwise, create dedicated atomic transaction client
    const pool = createPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await executeAllocation(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Preview next document number without incrementing sequence.
   */
  async peekNextNumber(params: AllocateNumberParams): Promise<string> {
    await this.ensureTables();
    const policy = await this.getPolicy(params.entityType, params.companyId);
    const fiscalYear = this.resolveFiscalYear(
      params.date,
      policy.fiscalYearStartMonth,
      (policy as any).fiscalYearFormat || 'YYYY'
    );

    let scopedCompanyId: string | null = null;
    let scopedBranchId: string | null = null;
    let scopedProjectId: string | null = null;

    if (policy.scopeType === 'COMPANY') {
      scopedCompanyId = params.companyId || 'cmp-101';
    } else if (policy.scopeType === 'BRANCH') {
      scopedCompanyId = params.companyId || 'cmp-101';
      scopedBranchId = params.branchId || 'main';
    } else if (policy.scopeType === 'PROJECT') {
      scopedCompanyId = params.companyId || 'cmp-101';
      scopedBranchId = params.branchId || null;
      scopedProjectId = params.projectId || 'PRJ-101';
    }

    const pool = createPool();
    const res = await pool.query(
      `SELECT current_sequence, step, pad_length, format_pattern, prefix
       FROM document_sequences
       WHERE COALESCE(company_id, '__GLOBAL__') = COALESCE($1, '__GLOBAL__')
         AND COALESCE(branch_id, '__GLOBAL__') = COALESCE($2, '__GLOBAL__')
         AND COALESCE(project_id, '__GLOBAL__') = COALESCE($3, '__GLOBAL__')
         AND entity_type = $4
         AND fiscal_year = $5;`,
      [scopedCompanyId, scopedBranchId, scopedProjectId, params.entityType, fiscalYear]
    );

    const prefix = params.customPrefix || policy.prefix;
    const formatPattern = params.customFormat || policy.formatPattern;
    const padLength = policy.padLength || 4;
    const step = policy.step || 1;

    let nextSeq = 1;
    if (res.rows.length > 0) {
      nextSeq = Number(res.rows[0].current_sequence) + (Number(res.rows[0].step) || step);
    }

    const seqPadded = String(nextSeq).padStart(padLength, '0');
    return this.formatDocumentNumber(formatPattern, {
      prefix,
      fy: fiscalYear,
      seq: seqPadded,
      companyCode: params.companyCode || params.companyId || undefined,
      branchCode: params.branchCode || params.branchId || undefined,
      projectCode: params.projectCode || params.projectId || undefined,
      date: params.date,
    });
  }

  /**
   * Set or reset current sequence value for administrative control.
   */
  async setSequence(params: {
    entityType: string;
    fiscalYear: string;
    companyId?: string | null;
    branchId?: string | null;
    projectId?: string | null;
    currentSequence: number;
  }): Promise<void> {
    await this.ensureTables();
    const nowIso = new Date().toISOString();
    const pool = createPool();

    await pool.query(
      `UPDATE document_sequences
       SET current_sequence = $1, updated_at = $2
       WHERE (company_id = $3 OR ($3 IS NULL AND company_id IS NULL))
         AND (branch_id = $4 OR ($4 IS NULL AND branch_id IS NULL))
         AND (project_id = $5 OR ($5 IS NULL AND project_id IS NULL))
         AND entity_type = $6
         AND fiscal_year = $7;`,
      [
        params.currentSequence,
        nowIso,
        params.companyId || null,
        params.branchId || null,
        params.projectId || null,
        params.entityType,
        params.fiscalYear,
      ]
    );
  }

  /**
   * Configure or update a company-specific numbering policy.
   */
  async upsertPolicy(policy: any & { entityType: string }): Promise<DocumentNumberingPolicy> {
    await this.ensureTables();
    const nowIso = new Date().toISOString();
    const id = policy.id || `pol_${policy.entityType.toLowerCase()}_${Date.now()}`;
    const pool = createPool();

    const scopeType = policy.scopeType || policy.scopeLevel || 'COMPANY';
    const padLength = policy.padLength ?? policy.zeroPadLength ?? 4;
    const fiscalYearStartMonth = policy.fiscalYearStartMonth ?? policy.startMonth ?? (policy.fiscalYearFormat === 'YYYY-YY' ? 4 : 1);

    const res = await pool.query(
      `INSERT INTO document_numbering_policies (
        id, company_id, entity_type, scope_type, prefix, format_pattern,
        pad_length, step, reset_frequency, fiscal_year_start_month,
        allow_manual_override, description, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (COALESCE(company_id, '__GLOBAL__'), entity_type)
      DO UPDATE SET
        scope_type = EXCLUDED.scope_type,
        prefix = EXCLUDED.prefix,
        format_pattern = EXCLUDED.format_pattern,
        pad_length = EXCLUDED.pad_length,
        step = EXCLUDED.step,
        reset_frequency = EXCLUDED.reset_frequency,
        fiscal_year_start_month = EXCLUDED.fiscal_year_start_month,
        allow_manual_override = EXCLUDED.allow_manual_override,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active,
        updated_at = EXCLUDED.updated_at
      RETURNING *;`,
      [
        id,
        policy.companyId || null,
        policy.entityType,
        scopeType,
        policy.prefix || policy.entityType.substring(0, 3).toUpperCase(),
        policy.formatPattern || '{PREFIX}-{FY}-{SEQ}',
        padLength,
        policy.step ?? 1,
        policy.resetFrequency || 'YEARLY',
        fiscalYearStartMonth,
        policy.allowManualOverride ?? true,
        policy.description || null,
        policy.isActive ?? true,
        nowIso,
        nowIso,
      ]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      companyId: row.company_id,
      entityType: row.entity_type,
      scopeType: row.scope_type,
      prefix: row.prefix,
      formatPattern: row.format_pattern,
      padLength: row.pad_length,
      step: row.step,
      resetFrequency: row.reset_frequency,
      fiscalYearStartMonth: row.fiscal_year_start_month,
      allowManualOverride: row.allow_manual_override,
      description: row.description,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const numberingRepository = new NumberingRepository();
