import { db } from '../../db';
import { hrStatutoryRules, hrEmployeeStatutoryProfiles, hrPayrollRuns, hrAuditTrail } from '../../db/schema';
import { eq, and, desc, sql, lte, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface EpfParameters {
  employeeRate: number; // 0.12 (12%)
  employerRate: number; // 0.12 (12%)
  wageCeilingINR: number; // 15000
  epsRate: number; // 0.0833 (8.33% capped at wage ceiling)
  epfDiffRate: number; // 0.0367 (3.67%)
  adminChargesRate: number; // 0.005 (0.5%)
  edliRate: number; // 0.005 (0.5%)
  allowVpf: boolean;
  optOutAllowedAboveCeiling: boolean;
}

export interface EsicParameters {
  wageCeilingINR: number; // 21000
  disabilityWageCeilingINR: number; // 25000
  employeeRate: number; // 0.0075 (0.75%)
  employerRate: number; // 0.0325 (3.25%)
}

export interface ProfessionalTaxSlab {
  minGross: number;
  maxGross: number;
  monthlyTax: number;
  februaryTax?: number;
}

export interface ProfessionalTaxParameters {
  stateCode: string;
  stateName: string;
  slabs: ProfessionalTaxSlab[];
}

export interface TdsParameters {
  regime: 'NEW_REGIME' | 'OLD_REGIME';
  standardDeductionINR: number; // 75000 for New Regime, 50000 for Old Regime
  rebate87ALimitINR: number; // 700000 for New Regime, 500000 for Old Regime
  cessRate: number; // 0.04 (4%)
  slabs: { minIncome: number; maxIncome: number; rate: number }[];
}

export interface GratuityParameters {
  tenureYearsThreshold: number; // 5 years
  statutoryCapINR: number; // 2000000 (₹20 Lakhs)
  formulaDays: number; // 15
  monthWorkingDays: number; // 26
  monthlyAccrualRate: number; // (15 / 26) / 12
}

export interface StatutoryCalculationResult {
  jurisdiction: 'INDIA' | 'UAE' | 'GLOBAL';
  payrollCurrency: string;
  exchangeRateToInr: number;
  
  // Earnings (in Transaction Currency)
  basic: number;
  hra: number;
  da: number;
  specialAllowance: number;
  siteAllowance: number;
  conveyance: number;
  overtimeAmount: number;
  bonusAmount: number;
  grossEarnings: number;
  grossEarningsINR: number;

  // Employee Statutory Deductions
  employeePf: number;
  employeeVpf: number;
  employeeEsi: number;
  professionalTax: number;
  tdsIncomeTax: number;
  loanEmi: number;
  advanceRecovery: number;
  totalEmployeeDeductions: number;

  // Net Pay
  netPayable: number;
  netPayableINR: number;

  // Employer Statutory Contributions
  employerEpf: number;
  employerEps: number;
  epfAdminCharges: number;
  edliCharges: number;
  totalEmployerPf: number;
  employerEsi: number;
  gratuityAccrual: number;
  totalEmployerCost: number;

  // Statutory Metadata
  statutoryDetails: {
    uan?: string;
    pfNumber?: string;
    pfOptOut?: boolean;
    esiNumber?: string;
    esiApplicable?: boolean;
    panNumber?: string;
    taxRegime?: 'NEW_REGIME' | 'OLD_REGIME';
    ptState?: string;
    gratuityEligible?: boolean;
    tenureYears?: number;
    statutoryRuleVersions: Record<string, number>;
  };
}

export class StatutoryEngineService {
  private static isRulesSeeded = false;

  /**
   * Seed standard, comprehensive statutory rules if missing
   */
  public async ensureStatutoryRulesSeeded(): Promise<void> {
    if (StatutoryEngineService.isRulesSeeded) return;

    try {
      // 1. Ensure DDL tables exist
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hr_statutory_rules (
          id TEXT PRIMARY KEY,
          rule_code TEXT NOT NULL UNIQUE,
          jurisdiction TEXT NOT NULL DEFAULT 'INDIA',
          rule_type TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          effective_from TEXT NOT NULL,
          effective_to TEXT,
          parameters JSONB NOT NULL,
          version INTEGER NOT NULL DEFAULT 1,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_by TEXT NOT NULL DEFAULT 'System Administrator',
          updated_by TEXT NOT NULL DEFAULT 'System Administrator',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hr_employee_statutory_profiles (
          id TEXT PRIMARY KEY,
          employee_id TEXT NOT NULL UNIQUE,
          employee_code TEXT NOT NULL,
          statutory_jurisdiction TEXT NOT NULL DEFAULT 'INDIA',
          uan_number TEXT,
          pf_number TEXT,
          pf_opt_out BOOLEAN NOT NULL DEFAULT false,
          vpf_percentage DOUBLE PRECISION NOT NULL DEFAULT 0,
          esi_number TEXT,
          esi_applicable BOOLEAN NOT NULL DEFAULT true,
          pan_number TEXT,
          tax_regime TEXT NOT NULL DEFAULT 'NEW_REGIME',
          pt_state TEXT NOT NULL DEFAULT 'KL',
          gratuity_enrolled BOOLEAN NOT NULL DEFAULT true,
          gratuity_accrued_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
          bank_account_number TEXT,
          bank_ifsc_code TEXT,
          bank_name TEXT,
          branch_name TEXT,
          payment_mode TEXT NOT NULL DEFAULT 'NEFT_RTGS',
          custom_deductions JSONB,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hr_payroll_runs (
          id TEXT PRIMARY KEY,
          run_number TEXT NOT NULL UNIQUE,
          payroll_month TEXT NOT NULL,
          jurisdiction TEXT NOT NULL DEFAULT 'INDIA',
          currency TEXT NOT NULL DEFAULT 'INR',
          exchange_rate_to_inr DOUBLE PRECISION NOT NULL DEFAULT 1.0,
          total_employees INTEGER NOT NULL DEFAULT 0,
          total_gross_pay DOUBLE PRECISION NOT NULL DEFAULT 0,
          total_deductions DOUBLE PRECISION NOT NULL DEFAULT 0,
          total_net_pay DOUBLE PRECISION NOT NULL DEFAULT 0,
          total_employer_pf DOUBLE PRECISION NOT NULL DEFAULT 0,
          total_employer_esi DOUBLE PRECISION NOT NULL DEFAULT 0,
          total_gratuity_accrual DOUBLE PRECISION NOT NULL DEFAULT 0,
          total_tds DOUBLE PRECISION NOT NULL DEFAULT 0,
          total_pt DOUBLE PRECISION NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'DRAFT',
          maker_user_id TEXT,
          maker_user_name TEXT,
          maker_timestamp TEXT,
          checker_user_id TEXT,
          checker_user_name TEXT,
          checker_timestamp TEXT,
          checker_remarks TEXT,
          is_locked BOOLEAN NOT NULL DEFAULT false,
          lock_hash TEXT,
          disbursed_at TEXT,
          neft_batch_reference TEXT,
          audit_trail JSONB,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hr_audit_trail (
          id TEXT PRIMARY KEY,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          user_id TEXT,
          user_name TEXT,
          user_role TEXT,
          details JSONB,
          previous_state JSONB,
          new_state JSONB,
          ip_address TEXT,
          timestamp TEXT NOT NULL
        );
      `);

      const existing = await db.select().from(hrStatutoryRules).limit(1);
      if (existing.length > 0) {
        StatutoryEngineService.isRulesSeeded = true;
        return;
      }

      const now = new Date().toISOString();
      const initialRules = [
        // 1. EPFO / Indian Provident Fund Standard 2026
        {
          id: 'rule-in-epf-2026',
          ruleCode: 'IN-EPF-2026',
          jurisdiction: 'INDIA',
          ruleType: 'EPF',
          title: 'Employees\' Provident Fund (EPFO) Rules 2026',
          description: '12% Employee Contribution, 8.33% EPS, 3.67% EPF, 0.5% Admin, 0.5% EDLI with ₹15,000 statutory wage ceiling.',
          effectiveFrom: '2026-01-01',
          effectiveTo: null,
          parameters: {
            employeeRate: 0.12,
            employerRate: 0.12,
            wageCeilingINR: 15000,
            epsRate: 0.0833,
            epfDiffRate: 0.0367,
            adminChargesRate: 0.005,
            edliRate: 0.005,
            allowVpf: true,
            optOutAllowedAboveCeiling: true,
          } as EpfParameters,
          version: 1,
          isActive: true,
          createdBy: 'Statutory Governance Engine',
          updatedBy: 'Statutory Governance Engine',
          createdAt: now,
          updatedAt: now,
        },

        // 2. ESIC / Employees' State Insurance Standard 2026
        {
          id: 'rule-in-esic-2026',
          ruleCode: 'IN-ESIC-2026',
          jurisdiction: 'INDIA',
          ruleType: 'ESIC',
          title: 'Employees\' State Insurance (ESIC) Rules 2026',
          description: '0.75% Employee, 3.25% Employer contribution for employees with gross wages <= ₹21,000 per month (₹25,000 for PwD).',
          effectiveFrom: '2026-01-01',
          effectiveTo: null,
          parameters: {
            wageCeilingINR: 21000,
            disabilityWageCeilingINR: 25000,
            employeeRate: 0.0075,
            employerRate: 0.0325,
          } as EsicParameters,
          version: 1,
          isActive: true,
          createdBy: 'Statutory Governance Engine',
          updatedBy: 'Statutory Governance Engine',
          createdAt: now,
          updatedAt: now,
        },

        // 3. Professional Tax - Maharashtra (MH)
        {
          id: 'rule-in-pt-mh-2026',
          ruleCode: 'IN-PT-MH-2026',
          jurisdiction: 'INDIA',
          ruleType: 'PROFESSIONAL_TAX',
          title: 'Maharashtra Professional Tax Slabs 2026',
          description: 'Monthly PT deduction for Maharashtra jurisdiction: <= ₹7,500: ₹0, ₹7,501-10,000: ₹175, > ₹10,000: ₹200 (₹300 in Feb).',
          effectiveFrom: '2026-01-01',
          effectiveTo: null,
          parameters: {
            stateCode: 'MH',
            stateName: 'Maharashtra',
            slabs: [
              { minGross: 0, maxGross: 7500, monthlyTax: 0 },
              { minGross: 7501, maxGross: 10000, monthlyTax: 175 },
              { minGross: 10001, maxGross: 99999999, monthlyTax: 200, februaryTax: 300 },
            ],
          } as ProfessionalTaxParameters,
          version: 1,
          isActive: true,
          createdBy: 'Statutory Governance Engine',
          updatedBy: 'Statutory Governance Engine',
          createdAt: now,
          updatedAt: now,
        },

        // 4. Professional Tax - Karnataka (KA)
        {
          id: 'rule-in-pt-ka-2026',
          ruleCode: 'IN-PT-KA-2026',
          jurisdiction: 'INDIA',
          ruleType: 'PROFESSIONAL_TAX',
          title: 'Karnataka Professional Tax Slabs 2026',
          description: 'Monthly PT deduction for Karnataka: < ₹15,000: ₹0, >= ₹15,000: ₹200.',
          effectiveFrom: '2026-01-01',
          effectiveTo: null,
          parameters: {
            stateCode: 'KA',
            stateName: 'Karnataka',
            slabs: [
              { minGross: 0, maxGross: 14999, monthlyTax: 0 },
              { minGross: 15000, maxGross: 99999999, monthlyTax: 200 },
            ],
          } as ProfessionalTaxParameters,
          version: 1,
          isActive: true,
          createdBy: 'Statutory Governance Engine',
          updatedBy: 'Statutory Governance Engine',
          createdAt: now,
          updatedAt: now,
        },

        // 5. Professional Tax - Kerala (KL)
        {
          id: 'rule-in-pt-kl-2026',
          ruleCode: 'IN-PT-KL-2026',
          jurisdiction: 'INDIA',
          ruleType: 'PROFESSIONAL_TAX',
          title: 'Kerala Professional Tax Slabs 2026',
          description: 'Monthly PT deduction for Kerala: slabs up to ₹208/mo (₹1,250 half-yearly).',
          effectiveFrom: '2026-01-01',
          effectiveTo: null,
          parameters: {
            stateCode: 'KL',
            stateName: 'Kerala',
            slabs: [
              { minGross: 0, maxGross: 11999, monthlyTax: 0 },
              { minGross: 12000, maxGross: 17999, monthlyTax: 100 },
              { minGross: 18000, maxGross: 29999, monthlyTax: 150 },
              { minGross: 30000, maxGross: 99999999, monthlyTax: 208 },
            ],
          } as ProfessionalTaxParameters,
          version: 1,
          isActive: true,
          createdBy: 'Statutory Governance Engine',
          updatedBy: 'Statutory Governance Engine',
          createdAt: now,
          updatedAt: now,
        },

        // 6. TDS - New Tax Regime (Section 115BAC) FY 2026-27
        {
          id: 'rule-in-tds-new-2026',
          ruleCode: 'IN-TDS-NEW-2026',
          jurisdiction: 'INDIA',
          ruleType: 'TDS',
          title: 'Income Tax TDS - New Tax Regime (Sec 115BAC) 2026',
          description: 'Default regime with ₹75,000 standard deduction, Sec 87A rebate up to ₹7,00,000, and updated progressive slabs.',
          effectiveFrom: '2026-04-01',
          effectiveTo: null,
          parameters: {
            regime: 'NEW_REGIME',
            standardDeductionINR: 75000,
            rebate87ALimitINR: 700000,
            cessRate: 0.04,
            slabs: [
              { minIncome: 0, maxIncome: 300000, rate: 0.0 },
              { minIncome: 300001, maxIncome: 700000, rate: 0.05 },
              { minIncome: 700001, maxIncome: 1000000, rate: 0.10 },
              { minIncome: 1000001, maxIncome: 1200000, rate: 0.15 },
              { minIncome: 1200001, maxIncome: 1500000, rate: 0.20 },
              { minIncome: 1500001, maxIncome: 99999999, rate: 0.30 },
            ],
          } as TdsParameters,
          version: 1,
          isActive: true,
          createdBy: 'Statutory Governance Engine',
          updatedBy: 'Statutory Governance Engine',
          createdAt: now,
          updatedAt: now,
        },

        // 7. TDS - Old Tax Regime FY 2026-27
        {
          id: 'rule-in-tds-old-2026',
          ruleCode: 'IN-TDS-OLD-2026',
          jurisdiction: 'INDIA',
          ruleType: 'TDS',
          title: 'Income Tax TDS - Old Tax Regime 2026',
          description: 'Traditional regime with ₹50,000 standard deduction, 80C/80D/HRA deductions, and 5%/20%/30% tax brackets.',
          effectiveFrom: '2026-04-01',
          effectiveTo: null,
          parameters: {
            regime: 'OLD_REGIME',
            standardDeductionINR: 50000,
            rebate87ALimitINR: 500000,
            cessRate: 0.04,
            slabs: [
              { minIncome: 0, maxIncome: 250000, rate: 0.0 },
              { minIncome: 250001, maxIncome: 500000, rate: 0.05 },
              { minIncome: 500001, maxIncome: 1000000, rate: 0.20 },
              { minIncome: 1000001, maxIncome: 99999999, rate: 0.30 },
            ],
          } as TdsParameters,
          version: 1,
          isActive: true,
          createdBy: 'Statutory Governance Engine',
          updatedBy: 'Statutory Governance Engine',
          createdAt: now,
          updatedAt: now,
        },

        // 8. Gratuity - Payment of Gratuity Act 1972
        {
          id: 'rule-in-gratuity-1972',
          ruleCode: 'IN-GRATUITY-1972',
          jurisdiction: 'INDIA',
          ruleType: 'GRATUITY',
          title: 'Payment of Gratuity Act 1972 (India)',
          description: 'Statutory formula: (15 * Basic * Service Years) / 26. Accrual provision: 4.81% of basic salary monthly. Cap: ₹20 Lakhs.',
          effectiveFrom: '2026-01-01',
          effectiveTo: null,
          parameters: {
            tenureYearsThreshold: 5,
            statutoryCapINR: 2000000,
            formulaDays: 15,
            monthWorkingDays: 26,
            monthlyAccrualRate: (15 / 26) / 12, // approx 4.8077% of basic
          } as GratuityParameters,
          version: 1,
          isActive: true,
          createdBy: 'Statutory Governance Engine',
          updatedBy: 'Statutory Governance Engine',
          createdAt: now,
          updatedAt: now,
        },

        // 9. UAE WPS SIF & End-of-Service Gratuity
        {
          id: 'rule-uae-wps-2026',
          ruleCode: 'UAE-WPS-2026',
          jurisdiction: 'UAE',
          ruleType: 'WPS',
          title: 'UAE Wages Protection System (WPS) & End of Service Rules 2026',
          description: 'MOHRE compliant SIF direct file dispatch with 21/30 days basic End of Service Gratuity accrual.',
          effectiveFrom: '2026-01-01',
          effectiveTo: null,
          parameters: {
            employerWpsRoutingCode: 'WPS-MOHRE-DXB-901',
            gratuityFirst5YearsDaysPerYear: 21,
            gratuityAfter5YearsDaysPerYear: 30,
            gratuityMaxCapYears: 2,
          },
          version: 1,
          isActive: true,
          createdBy: 'Statutory Governance Engine',
          updatedBy: 'Statutory Governance Engine',
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const r of initialRules) {
        await db.insert(hrStatutoryRules).values(r as any).onConflictDoNothing();
      }
      StatutoryEngineService.isRulesSeeded = true;
    } catch (err) {
      console.warn('ensureStatutoryRulesSeeded note:', err);
    }
  }

  /**
   * Get all active statutory rules
   */
  public async getStatutoryRules(jurisdiction?: string): Promise<any[]> {
    await this.ensureStatutoryRulesSeeded();
    if (jurisdiction) {
      return db.select().from(hrStatutoryRules).where(and(eq(hrStatutoryRules.jurisdiction, jurisdiction), eq(hrStatutoryRules.isActive, true))).orderBy(desc(hrStatutoryRules.updatedAt));
    }
    return db.select().from(hrStatutoryRules).where(eq(hrStatutoryRules.isActive, true)).orderBy(desc(hrStatutoryRules.updatedAt));
  }

  /**
   * Update or create a statutory rule with versioning and audit
   */
  public async upsertStatutoryRule(data: any, actor: string = 'System Administrator'): Promise<any> {
    await this.ensureStatutoryRulesSeeded();
    const now = new Date().toISOString();

    if (data.id) {
      const existing = await db.select().from(hrStatutoryRules).where(eq(hrStatutoryRules.id, data.id)).limit(1);
      if (existing.length > 0) {
        const nextVersion = (existing[0].version || 1) + 1;
        const [updated] = await db.update(hrStatutoryRules).set({
          title: data.title || existing[0].title,
          description: data.description || existing[0].description,
          effectiveFrom: data.effectiveFrom || existing[0].effectiveFrom,
          effectiveTo: data.effectiveTo || existing[0].effectiveTo,
          parameters: data.parameters || existing[0].parameters,
          version: nextVersion,
          isActive: data.isActive !== undefined ? data.isActive : existing[0].isActive,
          updatedBy: actor,
          updatedAt: now,
        }).where(eq(hrStatutoryRules.id, data.id)).returning();

        // Audit Trail
        await db.insert(hrAuditTrail).values({
          id: `audit-${uuidv4()}`,
          action: 'UPDATE_STATUTORY_RULE',
          entityType: 'STATUTORY_RULE',
          entityId: data.id,
          userId: actor,
          userName: actor,
          details: { ruleCode: updated.ruleCode, version: nextVersion, parameters: updated.parameters },
          previousState: existing[0],
          newState: updated,
          timestamp: now,
        });

        return updated;
      }
    }

    const id = `rule-${uuidv4()}`;
    const [newRule] = await db.insert(hrStatutoryRules).values({
      id,
      ruleCode: data.ruleCode || `RULE-${Date.now()}`,
      jurisdiction: data.jurisdiction || 'INDIA',
      ruleType: data.ruleType || 'EPF',
      title: data.title || 'Custom Statutory Rule',
      description: data.description || '',
      effectiveFrom: data.effectiveFrom || now.split('T')[0],
      effectiveTo: data.effectiveTo || null,
      parameters: data.parameters || {},
      version: 1,
      isActive: true,
      createdBy: actor,
      updatedBy: actor,
      createdAt: now,
      updatedAt: now,
    }).returning();

    // Audit Trail
    await db.insert(hrAuditTrail).values({
      id: `audit-${uuidv4()}`,
      action: 'CREATE_STATUTORY_RULE',
      entityType: 'STATUTORY_RULE',
      entityId: id,
      userId: actor,
      userName: actor,
      details: { newRule },
      timestamp: now,
    });

    return newRule;
  }

  /**
   * Get employee statutory profile or create a default if not present
   */
  public async getEmployeeStatutoryProfile(employeeId: string, employeeCode?: string): Promise<any> {
    await this.ensureStatutoryRulesSeeded();
    const rows = await db.select().from(hrEmployeeStatutoryProfiles).where(eq(hrEmployeeStatutoryProfiles.employeeId, employeeId)).limit(1);
    if (rows.length > 0) return rows[0];

    // Seed default employee profile
    const now = new Date().toISOString();
    const [profile] = await db.insert(hrEmployeeStatutoryProfiles).values({
      id: `sp-${uuidv4()}`,
      employeeId,
      employeeCode: employeeCode || `EMP-${employeeId.slice(0, 6)}`,
      statutoryJurisdiction: 'INDIA',
      uanNumber: `101${Math.floor(100000000 + Math.random() * 900000000)}`,
      pfNumber: `KR/TVM/0018920/000/${Math.floor(1000 + Math.random() * 9000)}`,
      pfOptOut: false,
      vpfPercentage: 0,
      esiNumber: `54${Math.floor(10000000 + Math.random() * 90000000)}`,
      esiApplicable: true,
      panNumber: `ABCDE${Math.floor(1000 + Math.random() * 9000)}F`,
      taxRegime: 'NEW_REGIME',
      ptState: 'KL',
      gratuityEnrolled: true,
      gratuityAccruedAmount: 0,
      bankAccountNumber: `HDFC${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      bankIfscCode: 'HDFC0000540',
      bankName: 'HDFC Bank Kerala Corporate',
      branchName: 'MG Road, Ernakulam, Kochi',
      paymentMode: 'NEFT_RTGS',
      createdAt: now,
      updatedAt: now,
    }).returning();

    return profile;
  }

  /**
   * Update Employee Statutory Profile
   */
  public async updateEmployeeStatutoryProfile(employeeId: string, data: any, actor: string = 'HR Admin'): Promise<any> {
    await this.ensureStatutoryRulesSeeded();
    const existing = await this.getEmployeeStatutoryProfile(employeeId);
    const now = new Date().toISOString();

    const [updated] = await db.update(hrEmployeeStatutoryProfiles).set({
      statutoryJurisdiction: data.statutoryJurisdiction || existing.statutoryJurisdiction,
      uanNumber: data.uanNumber !== undefined ? data.uanNumber : existing.uanNumber,
      pfNumber: data.pfNumber !== undefined ? data.pfNumber : existing.pfNumber,
      pfOptOut: data.pfOptOut !== undefined ? data.pfOptOut : existing.pfOptOut,
      vpfPercentage: data.vpfPercentage !== undefined ? Number(data.vpfPercentage) : existing.vpfPercentage,
      esiNumber: data.esiNumber !== undefined ? data.esiNumber : existing.esiNumber,
      esiApplicable: data.esiApplicable !== undefined ? data.esiApplicable : existing.esiApplicable,
      panNumber: data.panNumber !== undefined ? data.panNumber : existing.panNumber,
      taxRegime: data.taxRegime || existing.taxRegime,
      ptState: data.ptState || existing.ptState,
      gratuityEnrolled: data.gratuityEnrolled !== undefined ? data.gratuityEnrolled : existing.gratuityEnrolled,
      bankAccountNumber: data.bankAccountNumber || existing.bankAccountNumber,
      bankIfscCode: data.bankIfscCode || existing.bankIfscCode,
      bankName: data.bankName || existing.bankName,
      branchName: data.branchName || existing.branchName,
      paymentMode: data.paymentMode || existing.paymentMode,
      updatedAt: now,
    }).where(eq(hrEmployeeStatutoryProfiles.employeeId, employeeId)).returning();

    // Audit log
    await db.insert(hrAuditTrail).values({
      id: `audit-${uuidv4()}`,
      action: 'UPDATE_EMPLOYEE_STATUTORY_PROFILE',
      entityType: 'EMPLOYEE_STATUTORY',
      entityId: employeeId,
      userId: actor,
      userName: actor,
      details: { before: existing, after: updated },
      timestamp: now,
    });

    return updated;
  }

  /**
   * Main Dynamic Calculation Engine
   * Evaluates employee gross earnings and applies statutory rules according to jurisdiction
   */
  public async computeEmployeePayroll(
    employee: any,
    profile: any,
    activeRules: any[],
    options: {
      payrollMonth?: string;
      transactionCurrency?: string;
      exchangeRateToInr?: number;
      overtimeHours?: number;
      bonusUSD?: number;
      loanEmi?: number;
      advanceRecovery?: number;
      payableDutyDays?: number;
      totalDaysInMonth?: number;
      lopDays?: number;
      wageType?: 'MONTHLY' | 'DAILY_WAGE' | 'DUTY_BASED' | 'HOURLY';
      dailyWageRate?: number;
      hourlyWageRate?: number;
    } = {}
  ): Promise<StatutoryCalculationResult> {
    const jurisdiction = (profile.statutoryJurisdiction || 'INDIA') as 'INDIA' | 'UAE' | 'GLOBAL';
    const payrollCurrency = String(options.transactionCurrency || (jurisdiction === 'INDIA' ? 'INR' : jurisdiction === 'UAE' ? 'AED' : 'USD')).trim().toUpperCase();
    const payrollMonth = String(options.payrollMonth || '').trim();
    if (!payrollMonth) throw new Error('Payroll month is required for statutory calculation.');
    const exchangeRateToInr = payrollCurrency === 'INR' ? 1 : Number(options.exchangeRateToInr);
    if (!Number.isFinite(exchangeRateToInr) || exchangeRateToInr <= 0) throw new Error(`A valid ${payrollCurrency}/INR exchange rate is required for statutory calculation.`);
    const isFebruary = payrollMonth.endsWith('-02');

    // Determine Base Salary Components
    const s = employee.salaryStructure || {};
    const baseInrCandidate = employee.salaryINR ?? (employee.baseSalary != null ? Number(employee.baseSalary) * (payrollCurrency === 'INR' ? 1 : exchangeRateToInr) : null);
    const baseInr = Number(baseInrCandidate);
    if (!Number.isFinite(baseInr) || baseInr <= 0) throw new Error(`Salary master data is missing for employee ${employee.employeeCode || employee.id}.`);
    const wageType = options.wageType || employee.wageType || (employee.dailyWageRate != null || employee.dailyWageRateUSD != null ? 'DAILY_WAGE' : 'MONTHLY');
    
    // Scale components based on currency
    let basic = 0;
    let hra = 0;
    let da = 0;
    let specialAllowance = 0;
    let siteAllowance = 0;
    let conveyance = 0;

    const stdDays = Number(options.totalDaysInMonth);
    if (!Number.isFinite(stdDays) || stdDays <= 0) throw new Error('Configured payroll working-day basis is required.');
    const payableDutyDays = options.payableDutyDays !== undefined 
      ? options.payableDutyDays 
      : (options.lopDays !== undefined ? Math.max(0, stdDays - options.lopDays) : stdDays);

    if (wageType === 'DAILY_WAGE' || wageType === 'DUTY_BASED') {
      // Direct duty-driven daily wage calculation: payable_duty_days * dailyWageRate
      const dailyRate = Number(options.dailyWageRate ?? employee.dailyWageRate ?? (employee.dailyWageRateUSD != null ? Number(employee.dailyWageRateUSD) * (payrollCurrency === 'INR' ? exchangeRateToInr : 1) : NaN));
      if (!Number.isFinite(dailyRate) || dailyRate < 0) throw new Error(`Daily wage rate is not configured for employee ${employee.employeeCode || employee.id}.`);
      basic = Math.round(payableDutyDays * dailyRate);
      hra = 0;
      da = 0;
      specialAllowance = 0;
      siteAllowance = Math.round(payableDutyDays * (employee.siteAllowancePerDay || 0));
      conveyance = 0;
    } else {
      // Monthly salaried structure with attendance-driven LOP / payable duty days proration
      const prorationFactor = Math.min(1.0, Math.max(0, payableDutyDays / stdDays));

      if (payrollCurrency === 'INR') {
        const fullBasic = s.basicUSD != null ? Number(s.basicUSD) * exchangeRateToInr : NaN;
        const fullHra = s.hraUSD != null ? Number(s.hraUSD) * exchangeRateToInr : 0;
        const fullDa = s.daUSD != null ? Number(s.daUSD) * exchangeRateToInr : 0;
        const fullSpecial = s.specialAllowanceUSD != null ? Number(s.specialAllowanceUSD) * exchangeRateToInr : 0;
        const fullSite = (s.siteAllowanceUSD != null ? Number(s.siteAllowanceUSD) : 0) * exchangeRateToInr;
        const fullConveyance = s.travelAllowanceUSD != null ? Number(s.travelAllowanceUSD) * exchangeRateToInr : 0;
        if (!Number.isFinite(fullBasic) || fullBasic <= 0) throw new Error(`Basic salary component is not configured for employee ${employee.employeeCode || employee.id}.`);

        basic = Math.round(fullBasic * prorationFactor);
        hra = Math.round(fullHra * prorationFactor);
        da = Math.round(fullDa * prorationFactor);
        specialAllowance = Math.round(fullSpecial * prorationFactor);
        siteAllowance = Math.round(fullSite * prorationFactor);
        conveyance = Math.round(fullConveyance * prorationFactor);
      } else {
        const fullBasic = s.basicUSD != null ? Number(s.basicUSD) : NaN;
        const fullHra = s.hraUSD != null ? Number(s.hraUSD) : 0;
        const fullDa = s.daUSD != null ? Number(s.daUSD) : 0;
        const fullSpecial = s.specialAllowanceUSD != null ? Number(s.specialAllowanceUSD) : 0;
        const fullSite = s.siteAllowanceUSD != null ? Number(s.siteAllowanceUSD) : 0;
        const fullConveyance = s.travelAllowanceUSD != null ? Number(s.travelAllowanceUSD) : 0;
        if (!Number.isFinite(fullBasic) || fullBasic <= 0) throw new Error(`Basic salary component is not configured for employee ${employee.employeeCode || employee.id}.`);

        basic = Math.round(fullBasic * prorationFactor);
        hra = Math.round(fullHra * prorationFactor);
        da = Math.round(fullDa * prorationFactor);
        specialAllowance = Math.round(fullSpecial * prorationFactor);
        siteAllowance = Math.round(fullSite * prorationFactor);
        conveyance = Math.round(fullConveyance * prorationFactor);
      }
    }

    const overtimeHours = Number(options.overtimeHours || 0);
    const overtimeRateConfigured = s.overtimeHourlyRateUSD != null ? Number(s.overtimeHourlyRateUSD) : Number(options.hourlyWageRate || 0);
    if (overtimeHours > 0 && (!Number.isFinite(overtimeRateConfigured) || overtimeRateConfigured <= 0)) throw new Error(`Overtime hourly rate is not configured for employee ${employee.employeeCode || employee.id}.`);
    const overtimeHourlyRate = overtimeRateConfigured * (payrollCurrency === 'INR' ? exchangeRateToInr : 1);
    const overtimeAmount = overtimeHours * overtimeHourlyRate;
    const bonusAmount = Number(options.bonusUSD || 0) * (payrollCurrency === 'INR' ? exchangeRateToInr : 1);

    const grossEarnings = Math.round(basic + hra + da + specialAllowance + siteAllowance + conveyance + overtimeAmount + bonusAmount);
    const grossEarningsINR = Math.round(grossEarnings * (payrollCurrency === 'INR' ? 1 : exchangeRateToInr));

    // Resolve Applicable Rules from rule table
    const targetStateCode = (profile.ptState === 'KERALA' ? 'KL' : profile.ptState === 'MAHARASHTRA' ? 'MH' : profile.ptState === 'KARNATAKA' ? 'KA' : (profile.ptState || 'KL')).toUpperCase();
    const epfRule = activeRules.find((r) => r.ruleType === 'EPF' && r.jurisdiction === jurisdiction) || activeRules.find((r) => r.ruleType === 'EPF');
    const esicRule = activeRules.find((r) => r.ruleType === 'ESIC' && r.jurisdiction === jurisdiction) || activeRules.find((r) => r.ruleType === 'ESIC');
    const ptRule = activeRules.find((r) => r.ruleType === 'PROFESSIONAL_TAX' && r.parameters?.stateCode === targetStateCode) ||
      activeRules.find((r) => r.ruleType === 'PROFESSIONAL_TAX' && r.parameters?.stateCode === 'KL') ||
      activeRules.find((r) => r.ruleType === 'PROFESSIONAL_TAX');
    const tdsRule = activeRules.find((r) => r.ruleType === 'TDS' && r.parameters?.regime === (profile.taxRegime || 'NEW_REGIME'));
    const gratuityRule = activeRules.find((r) => r.ruleType === 'GRATUITY');

    // Rule parameter extraction with safe defaults
    const epfParams: EpfParameters = epfRule?.parameters || {
      employeeRate: 0.12,
      employerRate: 0.12,
      wageCeilingINR: 15000,
      epsRate: 0.0833,
      epfDiffRate: 0.0367,
      adminChargesRate: 0.005,
      edliRate: 0.005,
      allowVpf: true,
      optOutAllowedAboveCeiling: true,
    };

    const esicParams: EsicParameters = esicRule?.parameters || {
      wageCeilingINR: 21000,
      disabilityWageCeilingINR: 25000,
      employeeRate: 0.0075,
      employerRate: 0.0325,
    };

    const gratuityParams: GratuityParameters = gratuityRule?.parameters || {
      tenureYearsThreshold: 5,
      statutoryCapINR: 2000000,
      formulaDays: 15,
      monthWorkingDays: 26,
      monthlyAccrualRate: 0.048077,
    };

    let employeePf = 0;
    let employeeVpf = 0;
    let employeeEsi = 0;
    let professionalTax = 0;
    let tdsIncomeTax = 0;
    let employerEpf = 0;
    let employerEps = 0;
    let epfAdminCharges = 0;
    let edliCharges = 0;
    let employerEsi = 0;
    let gratuityAccrual = 0;

    const pfWageBase = basic + da;
    const pfWageBaseINR = pfWageBase * (payrollCurrency === 'INR' ? 1 : exchangeRateToInr);

    if (jurisdiction === 'INDIA') {
      // 1. EPFO / PF Calculation
      if (!profile.pfOptOut) {
        // Can be on actual basic or capped wage ceiling if applicable
        employeePf = Math.round(pfWageBase * epfParams.employeeRate);
        
        if (profile.vpfPercentage && profile.vpfPercentage > 0) {
          employeeVpf = Math.round(pfWageBase * (profile.vpfPercentage / 100));
        }

        // Employer EPS (8.33% capped at ₹15,000 ceiling: max ₹1,250)
        const epsCappedWageINR = Math.min(pfWageBaseINR, epfParams.wageCeilingINR);
        const epsCappedWageTx = epsCappedWageINR / (payrollCurrency === 'INR' ? 1 : exchangeRateToInr);
        employerEps = Math.round(epsCappedWageTx * epfParams.epsRate);
        
        // Employer EPF difference (3.67% or remainder of 12% total)
        employerEpf = Math.round(employeePf - employerEps);
        
        // Admin & EDLI
        epfAdminCharges = Math.round(epsCappedWageTx * epfParams.adminChargesRate);
        edliCharges = Math.round(epsCappedWageTx * epfParams.edliRate);
      }

      // 2. ESIC Calculation (Eligible only if monthly gross <= ₹21,000 INR)
      if (profile.esiApplicable && grossEarningsINR <= esicParams.wageCeilingINR) {
        employeeEsi = Math.round(grossEarnings * esicParams.employeeRate);
        employerEsi = Math.round(grossEarnings * esicParams.employerRate);
      }

      // 3. Professional Tax (State Slab Aware)
      if (ptRule?.parameters?.slabs) {
        const slabs: ProfessionalTaxSlab[] = ptRule.parameters.slabs;
        const applicableSlab = slabs.find((sl) => grossEarningsINR >= sl.minGross && grossEarningsINR <= sl.maxGross);
        if (applicableSlab) {
          const ptInr = isFebruary && applicableSlab.februaryTax ? applicableSlab.februaryTax : applicableSlab.monthlyTax;
          professionalTax = Math.round(ptInr / (payrollCurrency === 'INR' ? 1 : exchangeRateToInr));
        }
      } else {
        // Standard Maharashtra default fallback
        professionalTax = grossEarningsINR > 10000 ? (isFebruary ? 300 : 200) : grossEarningsINR > 7500 ? 175 : 0;
      }

      // 4. Section 192 TDS Income Tax Projection
      const annualizedGrossINR = grossEarningsINR * 12;
      const stdDedINR = tdsRule?.parameters?.standardDeductionINR || 75000;
      const taxableAnnualINR = Math.max(0, annualizedGrossINR - stdDedINR);
      
      let annualTaxINR = 0;
      if (tdsRule?.parameters?.slabs) {
        const slabs: { minIncome: number; maxIncome: number; rate: number }[] = tdsRule.parameters.slabs;
        for (const slab of slabs) {
          if (taxableAnnualINR > slab.minIncome) {
            const taxableInThisSlab = Math.min(taxableAnnualINR, slab.maxIncome) - slab.minIncome;
            annualTaxINR += taxableInThisSlab * slab.rate;
          }
        }
      } else {
        // New Regime fallback
        if (taxableAnnualINR > 1500000) annualTaxINR = 150000 + (taxableAnnualINR - 1500000) * 0.30;
        else if (taxableAnnualINR > 1200000) annualTaxINR = 90000 + (taxableAnnualINR - 1200000) * 0.20;
        else if (taxableAnnualINR > 1000000) annualTaxINR = 60000 + (taxableAnnualINR - 1000000) * 0.15;
        else if (taxableAnnualINR > 700000) annualTaxINR = 20000 + (taxableAnnualINR - 700000) * 0.10;
        else if (taxableAnnualINR > 300000) annualTaxINR = (taxableAnnualINR - 300000) * 0.05;
      }

      // Sec 87A Rebate if applicable
      const rebateLimit = tdsRule?.parameters?.rebate87ALimitINR || 700000;
      if (taxableAnnualINR <= rebateLimit) {
        annualTaxINR = 0;
      } else {
        // Add 4% Cess
        annualTaxINR = annualTaxINR * 1.04;
      }

      const monthlyTdsINR = Math.round(annualTaxINR / 12);
      tdsIncomeTax = Math.round(monthlyTdsINR / (payrollCurrency === 'INR' ? 1 : exchangeRateToInr));

      // 5. Gratuity Accrual Provision (Payment of Gratuity Act 1972)
      if (profile.gratuityEnrolled) {
        gratuityAccrual = Math.round(basic * gratuityParams.monthlyAccrualRate);
      }

    } else if (jurisdiction === 'UAE') {
      // UAE WPS & Labor Law EOSG
      employeePf = Math.round(basic * 0.05); // General provident fund if enrolled
      gratuityAccrual = Math.round((basic * 21) / 365); // 21 days basic / year
    } else {
      // Global profile
      employeePf = Math.round(basic * 0.08);
      tdsIncomeTax = Math.round(grossEarnings * 0.05);
    }

    const loanEmi = options.loanEmi || 0;
    const advanceRecovery = options.advanceRecovery || 0;

    const totalEmployeeDeductions = employeePf + employeeVpf + employeeEsi + professionalTax + tdsIncomeTax + loanEmi + advanceRecovery;
    const netPayable = grossEarnings - totalEmployeeDeductions;
    const netPayableINR = Math.round(netPayable * (payrollCurrency === 'INR' ? 1 : exchangeRateToInr));

    const totalEmployerPf = employerEpf + employerEps + epfAdminCharges + edliCharges;
    const totalEmployerCost = grossEarnings + totalEmployerPf + employerEsi + gratuityAccrual;

    return {
      jurisdiction,
      payrollCurrency,
      exchangeRateToInr,
      basic,
      hra,
      da,
      specialAllowance,
      siteAllowance,
      conveyance,
      overtimeAmount,
      bonusAmount,
      grossEarnings,
      grossEarningsINR,
      employeePf,
      employeeVpf,
      employeeEsi,
      professionalTax,
      tdsIncomeTax,
      loanEmi,
      advanceRecovery,
      totalEmployeeDeductions,
      netPayable,
      netPayableINR,
      employerEpf,
      employerEps,
      epfAdminCharges,
      edliCharges,
      totalEmployerPf,
      employerEsi,
      gratuityAccrual,
      totalEmployerCost,
      statutoryDetails: {
        uan: profile.uanNumber,
        pfNumber: profile.pfNumber,
        pfOptOut: profile.pfOptOut,
        esiNumber: profile.esiNumber,
        esiApplicable: profile.esiApplicable,
        panNumber: profile.panNumber,
        taxRegime: profile.taxRegime,
        ptState: profile.ptState,
        gratuityEligible: profile.gratuityEnrolled,
        statutoryRuleVersions: {
          epf: epfRule?.version || 1,
          esic: esicRule?.version || 1,
          pt: ptRule?.version || 1,
          tds: tdsRule?.version || 1,
          gratuity: gratuityRule?.version || 1,
        },
      },
    };
  }

  /**
   * Generates a cryptographic checksum for a set of payslip records to lock the payroll run
   */
  public generateLockHash(runId: string, month: string, payslips: any[]): string {
    const payload = JSON.stringify({
      runId,
      month,
      count: payslips.length,
      netTotals: payslips.reduce((acc, p) => acc + (p.netSalaryAed || p.netSalaryUSD || p.netPayableAed || 0), 0),
      grossTotals: payslips.reduce((acc, p) => acc + (p.grossEarningsAed || p.grossSalaryUSD || 0), 0),
    });
    return crypto.createHash('sha256').update(payload).digest('hex');
  }
}

export const statutoryEngineService = new StatutoryEngineService();
