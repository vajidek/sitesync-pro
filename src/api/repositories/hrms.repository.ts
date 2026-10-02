import { db } from '../../db/index';
import { sql, eq, desc, and, or } from 'drizzle-orm';
import { enterpriseAuditRepository } from './enterprise_audit.repository';
import {
  phase70Departments,
  phase70Designations,
  phase70EmployeeMaster,
  phase70EmployeeDocuments,
  phase70EmployeeBankAccounts,
  phase70SalaryStructures,
  phase70SalaryComponents,
  phase70PayrollPeriods,
  phase70PayrollRuns,
  phase70PaySlips,
  phase70Attendance,
  phase70ShiftMaster,
  phase70ShiftRoster,
  phase70LeaveTypes,
  phase70LeaveRequests,
  phase70Holidays,
  phase70Overtime,
  phase70Loans,
  phase70SalaryAdvances,
  phase70ExpenseClaims,
  phase70TravelClaims,
  phase70TrainingPrograms,
  phase70TrainingAttendance,
  phase70EmployeeSkills,
  phase70PerformanceReviews,
  phase70Kpi,
  phase70Kra,
  phase70Promotions,
  phase70Transfers,
  phase70DisciplinaryActions,
  phase70ExitManagement,
  phase70FullFinalSettlement,
  phase70Bonus,
  phase70Gratuity,
  phase70PfEsiPt,
  phase70TaxDeductions,
  phase70EmployeeAssets,
  phase70Recruitment,
  phase70JobOpenings,
  phase70Candidates,
  phase70Interviews,
  phase70OfferLetters,
  phase70Onboarding,
  phase70HrNotifications,
  phase70HrAuditLogs,
  hrStatutoryRules,
  hrEmployeeStatutoryProfiles,
  hrPayrollRuns,
  hrAuditTrail,
  hrBiometricRawPunches,
} from '../../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { numberingService } from '../services/numbering.service';
import { createHash } from 'node:crypto';
import { statutoryEngineService } from '../services/statutoryEngine.service';
import { currencyRepository } from './currency.repository';
import { workflowPolicyEngine } from '../services/workflowPolicyEngine.service';
import { workflowHistory } from '../../db/schema';
import { financeRepository } from './finance.repository';
import { isDemoSeedAllowed } from '../config/env';

export class HrmsRepository {
  private static isTablesEnsured = false;

  public async ensureHrmsTablesExist(): Promise<void> {
    if (HrmsRepository.isTablesEnsured) return;

    try {
      await db.execute(sql`
        ALTER TABLE phase70_payroll_periods ADD COLUMN IF NOT EXISTS processed_at TEXT;
        ALTER TABLE phase70_payroll_periods ADD COLUMN IF NOT EXISTS approved_by TEXT;
        ALTER TABLE phase70_pay_slips ADD COLUMN IF NOT EXISTS da_aed DOUBLE PRECISION DEFAULT 0;
        ALTER TABLE phase70_pay_slips ADD COLUMN IF NOT EXISTS pt_deduction_aed DOUBLE PRECISION DEFAULT 0;
        ALTER TABLE phase70_pay_slips ADD COLUMN IF NOT EXISTS tds_deduction_aed DOUBLE PRECISION DEFAULT 0;
        ALTER TABLE phase70_pay_slips ADD COLUMN IF NOT EXISTS is_hold BOOLEAN DEFAULT false;
        ALTER TABLE phase70_pay_slips ADD COLUMN IF NOT EXISTS hold_reason TEXT;
        ALTER TABLE phase70_pay_slips ADD COLUMN IF NOT EXISTS held_by TEXT;
        ALTER TABLE phase70_pay_slips ADD COLUMN IF NOT EXISTS held_at TEXT;
        ALTER TABLE phase70_pay_slips ADD COLUMN IF NOT EXISTS unheld_reason TEXT;
        ALTER TABLE phase70_loans ADD COLUMN IF NOT EXISTS repayment_method TEXT DEFAULT 'PER_DUTY_DAY';
        ALTER TABLE phase70_loans ADD COLUMN IF NOT EXISTS repayment_rate DOUBLE PRECISION DEFAULT 1000;
        ALTER TABLE phase70_loans ADD COLUMN IF NOT EXISTS repayment_frequency TEXT DEFAULT 'PER_DUTY_DAY';
        ALTER TABLE phase70_loans ADD COLUMN IF NOT EXISTS total_recovered_aed DOUBLE PRECISION DEFAULT 0;
        ALTER TABLE phase70_loans ADD COLUMN IF NOT EXISTS opening_balance_aed DOUBLE PRECISION DEFAULT 0;
        ALTER TABLE phase70_loans ADD COLUMN IF NOT EXISTS requested_amount_aed DOUBLE PRECISION DEFAULT 0;
        ALTER TABLE phase70_loans ADD COLUMN IF NOT EXISTS approved_by TEXT;
        ALTER TABLE phase70_loans ADD COLUMN IF NOT EXISTS approved_at TEXT;
        ALTER TABLE phase70_loans ADD COLUMN IF NOT EXISTS audit_trail JSONB;

        CREATE TABLE IF NOT EXISTS hr_attendance_finalizations (
          id TEXT PRIMARY KEY,
          period_id TEXT NOT NULL,
          month_year TEXT NOT NULL,
          employee_id TEXT NOT NULL,
          employee_code TEXT NOT NULL,
          employee_name TEXT NOT NULL,
          department TEXT,
          wage_type TEXT NOT NULL DEFAULT 'MONTHLY',
          daily_wage_rate DOUBLE PRECISION DEFAULT 0,
          hourly_wage_rate DOUBLE PRECISION DEFAULT 0,
          total_days_in_month INTEGER NOT NULL DEFAULT 31,
          present_days DOUBLE PRECISION NOT NULL DEFAULT 0,
          half_days INTEGER NOT NULL DEFAULT 0,
          paid_leave_days DOUBLE PRECISION NOT NULL DEFAULT 0,
          unpaid_leave_days DOUBLE PRECISION NOT NULL DEFAULT 0,
          weekly_offs INTEGER NOT NULL DEFAULT 4,
          holidays INTEGER NOT NULL DEFAULT 0,
          payable_duty_days DOUBLE PRECISION NOT NULL DEFAULT 0,
          absent_days DOUBLE PRECISION NOT NULL DEFAULT 0,
          overtime_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
          total_duty_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'FINALIZED',
          finalized_by TEXT NOT NULL DEFAULT 'HR Supervisor',
          finalized_at TEXT NOT NULL,
          lock_hash TEXT,
          remarks TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS hr_loan_recoveries (
          id TEXT PRIMARY KEY,
          loan_id TEXT NOT NULL,
          loan_code TEXT NOT NULL,
          employee_id TEXT NOT NULL,
          employee_code TEXT NOT NULL,
          payroll_run_id TEXT NOT NULL,
          period_id TEXT NOT NULL,
          month_year TEXT NOT NULL,
          payable_duty_days DOUBLE PRECISION NOT NULL DEFAULT 0,
          repayment_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
          calculated_installment DOUBLE PRECISION NOT NULL DEFAULT 0,
          opening_outstanding DOUBLE PRECISION NOT NULL DEFAULT 0,
          recovered_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
          closing_outstanding DOUBLE PRECISION NOT NULL DEFAULT 0,
          deduction_type TEXT NOT NULL DEFAULT 'PER_DUTY_DAY_PAYROLL',
          transaction_reference TEXT,
          actor TEXT,
          timestamp TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        ALTER TABLE hr_biometric_raw_punches ADD COLUMN IF NOT EXISTS source_fingerprint TEXT;
        CREATE TABLE IF NOT EXISTS hr_biometric_raw_punches (
          id TEXT PRIMARY KEY,
          device_id TEXT NOT NULL,
          biometric_id TEXT NOT NULL,
          employee_id TEXT,
          employee_code TEXT,
          employee_name TEXT,
          raw_timestamp TEXT NOT NULL,
          punch_type TEXT NOT NULL DEFAULT 'CHECK_IN',
          verification_mode TEXT NOT NULL DEFAULT 'FINGERPRINT',
          raw_payload TEXT,
          source_fingerprint TEXT,
          is_processed BOOLEAN NOT NULL DEFAULT false,
          created_at TEXT NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS uq_hr_biometric_raw_source_fingerprint
          ON hr_biometric_raw_punches(source_fingerprint);
      `);
      // Synthetic employees, salary structures, attendance and payroll fixtures are DEMO-only.
      // UAT/PRODUCTION must begin from controlled HR master provisioning.
      if (isDemoSeedAllowed()) {
        await this.seedInitialHRMSDataIfEmpty();
      }
      HrmsRepository.isTablesEnsured = true;
    } catch (error) {
      console.error('Error ensuring HRMS tables exist:', error);
    }
  }

  private async seedInitialHRMSDataIfEmpty(): Promise<void> {
    try {
      const existingDepts = await db.select().from(phase70Departments).limit(1);
      if (existingDepts.length > 0) return;

      const now = new Date().toISOString();

      // 1. Seed Departments
      const depts = [
        { id: 'dept-eng', code: 'DEP-ENG', name: 'Engineering & Construction', headOfDepartment: 'Eng. Tariq Al-Nuaimi', budgetAed: 12500000, location: 'Abu Dhabi Site 1', isActive: true, createdAt: now, updatedAt: now },
        { id: 'dept-pm', code: 'DEP-PM', name: 'Project Management Office', headOfDepartment: 'Sarah Jenkins', budgetAed: 8400000, location: 'Head Office', isActive: true, createdAt: now, updatedAt: now },
        { id: 'dept-hse', code: 'DEP-HSE', name: 'Health, Safety & Environment', headOfDepartment: 'Capt. Rashid Mansoor', budgetAed: 3500000, location: 'All Sites', isActive: true, createdAt: now, updatedAt: now },
        { id: 'dept-proc', code: 'DEP-PROC', name: 'Procurement & Supply Chain', headOfDepartment: 'David Miller', budgetAed: 6200000, location: 'Head Office', isActive: true, createdAt: now, updatedAt: now },
        { id: 'dept-fin', code: 'DEP-FIN', name: 'Finance & Accounts', headOfDepartment: 'Fatima Al-Zahra', budgetAed: 4800000, location: 'Head Office', isActive: true, createdAt: now, updatedAt: now },
        { id: 'dept-hr', code: 'DEP-HR', name: 'Human Resources & Admin', headOfDepartment: 'Zayd Al-Hashemi', budgetAed: 3900000, location: 'Head Office', isActive: true, createdAt: now, updatedAt: now },
      ];
      for (const d of depts) {
        await db.insert(phase70Departments).values(d).onConflictDoNothing();
      }

      // 2. Seed Designations
      const designations = [
        { id: 'desig-pm', code: 'DES-PM', title: 'Senior Project Manager', departmentId: 'dept-pm', gradeLevel: 'L6', minSalary: 28000, maxSalary: 45000, isActive: true, createdAt: now, updatedAt: now },
        { id: 'desig-site-eng', code: 'DES-SE', title: 'Senior Site Civil Engineer', departmentId: 'dept-eng', gradeLevel: 'L4', minSalary: 16000, maxSalary: 26000, isActive: true, createdAt: now, updatedAt: now },
        { id: 'desig-hse-off', code: 'DES-HSE', title: 'Lead HSE Safety Officer', departmentId: 'dept-hse', gradeLevel: 'L3', minSalary: 12000, maxSalary: 20000, isActive: true, createdAt: now, updatedAt: now },
        { id: 'desig-proc-lead', code: 'DES-PL', title: 'Procurement Contracts Specialist', departmentId: 'dept-proc', gradeLevel: 'L4', minSalary: 15000, maxSalary: 24000, isActive: true, createdAt: now, updatedAt: now },
        { id: 'desig-fin-analyst', code: 'DES-FA', title: 'Senior Financial Analyst', departmentId: 'dept-fin', gradeLevel: 'L4', minSalary: 17000, maxSalary: 28000, isActive: true, createdAt: now, updatedAt: now },
        { id: 'desig-bim-eng', code: 'DES-BIM', title: 'Lead BIM Architect & Modeler', departmentId: 'dept-eng', gradeLevel: 'L4', minSalary: 18000, maxSalary: 30000, isActive: true, createdAt: now, updatedAt: now },
      ];
      for (const des of designations) {
        await db.insert(phase70Designations).values(des).onConflictDoNothing();
      }

      // 3. Seed Salary Structures
      const salaryStructures = [
        { id: 'sal-l6', structureCode: 'SAL-EXEC-L6', title: 'Executive Project Leadership (L6)', grade: 'L6', baseMonthlyAed: 22000, hraAed: 8000, conveyanceAed: 3000, medicalAed: 2000, specialAllowanceAed: 3000, siteAllowanceAed: 2000, otRatePerHour: 0, pfApplicable: true, effectiveFrom: '2026-01-01', createdAt: now, updatedAt: now },
        { id: 'sal-l4', structureCode: 'SAL-ENG-L4', title: 'Senior Engineering & Specialist (L4)', grade: 'L4', baseMonthlyAed: 12000, hraAed: 4500, conveyanceAed: 2000, medicalAed: 1000, specialAllowanceAed: 1500, siteAllowanceAed: 2000, otRatePerHour: 85, pfApplicable: true, effectiveFrom: '2026-01-01', createdAt: now, updatedAt: now },
        { id: 'sal-l3', structureCode: 'SAL-SITE-L3', title: 'Site Operations & Officer (L3)', grade: 'L3', baseMonthlyAed: 8500, hraAed: 3000, conveyanceAed: 1500, medicalAed: 1000, specialAllowanceAed: 1000, siteAllowanceAed: 1500, otRatePerHour: 60, pfApplicable: true, effectiveFrom: '2026-01-01', createdAt: now, updatedAt: now },
      ];
      for (const s of salaryStructures) {
        await db.insert(phase70SalaryStructures).values(s).onConflictDoNothing();
      }

      // 4. Seed Employees
      const employees = [
        { id: 'emp-001', employeeCode: 'EMP-2026-0101', firstName: 'Ahmed', lastName: 'Al-Mansoor', email: 'ahmed.mansoor@sitesync.pro', phone: '+971 50 123 4567', gender: 'MALE', dateOfBirth: '1984-06-15', visaStatus: 'EMPLOYMENT_RESIDENCE', joiningDate: '2022-03-01', departmentId: 'dept-pm', designationId: 'desig-pm', employmentType: 'FULL_TIME', workLocation: 'Abu Dhabi HQ', employmentStatus: 'ACTIVE', biometricId: 'ESSL-1001', grade: 'L6', noticePeriodDays: 60, createdAt: now, updatedAt: now },
        { id: 'emp-002', employeeCode: 'EMP-2026-0102', firstName: 'Elena', lastName: 'Rostova', email: 'elena.rostova@sitesync.pro', phone: '+971 52 987 6543', gender: 'FEMALE', dateOfBirth: '1990-11-22', visaStatus: 'EMPLOYMENT_RESIDENCE', joiningDate: '2023-01-15', departmentId: 'dept-eng', designationId: 'desig-site-eng', employmentType: 'FULL_TIME', workLocation: 'Site Alpha - Al Reem', employmentStatus: 'ACTIVE', biometricId: 'ESSL-1002', grade: 'L4', noticePeriodDays: 30, createdAt: now, updatedAt: now },
        { id: 'emp-003', employeeCode: 'EMP-2026-0103', firstName: 'Kareem', lastName: 'Nader', email: 'kareem.nader@sitesync.pro', phone: '+971 55 456 7890', gender: 'MALE', dateOfBirth: '1992-04-18', visaStatus: 'EMPLOYMENT_RESIDENCE', joiningDate: '2023-06-10', departmentId: 'dept-hse', designationId: 'desig-hse-off', employmentType: 'FULL_TIME', workLocation: 'Site Beta - Yas Island', employmentStatus: 'ACTIVE', biometricId: 'ESSL-1003', grade: 'L3', noticePeriodDays: 30, createdAt: now, updatedAt: now },
        { id: 'emp-004', employeeCode: 'EMP-2026-0104', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@sitesync.pro', phone: '+971 56 333 4444', gender: 'FEMALE', dateOfBirth: '1991-08-09', visaStatus: 'EMPLOYMENT_RESIDENCE', joiningDate: '2023-09-01', departmentId: 'dept-eng', designationId: 'desig-bim-eng', employmentType: 'FULL_TIME', workLocation: 'Abu Dhabi HQ', employmentStatus: 'ACTIVE', biometricId: 'ESSL-1004', grade: 'L4', noticePeriodDays: 30, createdAt: now, updatedAt: now },
        { id: 'emp-005', employeeCode: 'EMP-2026-0105', firstName: 'Marcus', lastName: 'Vance', email: 'marcus.vance@sitesync.pro', phone: '+971 54 777 8888', gender: 'MALE', dateOfBirth: '1987-12-05', visaStatus: 'EMPLOYMENT_RESIDENCE', joiningDate: '2024-02-01', departmentId: 'dept-proc', designationId: 'desig-proc-lead', employmentType: 'FULL_TIME', workLocation: 'Head Office', employmentStatus: 'ACTIVE', biometricId: 'ESSL-1005', grade: 'L4', noticePeriodDays: 30, createdAt: now, updatedAt: now },
      ];
      for (const emp of employees) {
        await db.insert(phase70EmployeeMaster).values(emp).onConflictDoNothing();
      }

      // 5. Seed Shifts
      const shifts = [
        { id: 'shift-gen', shiftCode: 'SFT-GEN', shiftName: 'General HQ Shift (08:00 - 17:00)', startTime: '08:00', endTime: '17:00', gracePeriodMinutes: 15, breakDurationMinutes: 60, totalShiftHours: 8, isNightShift: false, colorTag: '#3B82F6', isActive: true, createdAt: now, updatedAt: now },
        { id: 'shift-site-morn', shiftCode: 'SFT-SITE-M', shiftName: 'Site Morning Shift (06:30 - 15:00)', startTime: '06:30', endTime: '15:00', gracePeriodMinutes: 15, breakDurationMinutes: 30, totalShiftHours: 8, isNightShift: false, colorTag: '#F59E0B', isActive: true, createdAt: now, updatedAt: now },
        { id: 'shift-site-eve', shiftCode: 'SFT-SITE-E', shiftName: 'Site Night Concrete Pour (18:00 - 02:30)', startTime: '18:00', endTime: '02:30', gracePeriodMinutes: 15, breakDurationMinutes: 30, totalShiftHours: 8, isNightShift: true, colorTag: '#8B5CF6', isActive: true, createdAt: now, updatedAt: now },
      ];
      for (const sft of shifts) {
        await db.insert(phase70ShiftMaster).values(sft).onConflictDoNothing();
      }

      // 6. Seed Leave Types
      const leaveTypes = [
        { id: 'lt-annual', typeCode: 'LT-ANNUAL', name: 'Annual Paid Leave (UAE Labor Law)', annualQuotaDays: 30, isCarryForward: true, maxCarryForwardDays: 15, isEncashable: true, requiresMedicalCert: false, isPaid: true, colorCode: '#10B981', isActive: true, createdAt: now, updatedAt: now },
        { id: 'lt-sick', typeCode: 'LT-SICK', name: 'Certified Sick Leave', annualQuotaDays: 15, isCarryForward: false, maxCarryForwardDays: 0, isEncashable: false, requiresMedicalCert: true, isPaid: true, colorCode: '#EF4444', isActive: true, createdAt: now, updatedAt: now },
        { id: 'lt-maternity', typeCode: 'LT-MATERNITY', name: 'Maternity / Parental Leave', annualQuotaDays: 60, isCarryForward: false, maxCarryForwardDays: 0, isEncashable: false, requiresMedicalCert: true, isPaid: true, colorCode: '#EC4899', isActive: true, createdAt: now, updatedAt: now },
        { id: 'lt-emerg', typeCode: 'LT-EMERG', name: 'Emergency / Compassionate Leave', annualQuotaDays: 5, isCarryForward: false, maxCarryForwardDays: 0, isEncashable: false, requiresMedicalCert: false, isPaid: true, colorCode: '#6366F1', isActive: true, createdAt: now, updatedAt: now },
      ];
      for (const lt of leaveTypes) {
        await db.insert(phase70LeaveTypes).values(lt).onConflictDoNothing();
      }

      // 7. Seed Payroll Period & Payslips for Aug 2026
      const payrollPeriod = {
        id: 'pp-2026-08',
        periodCode: 'PAY-2026-08',
        monthYear: '2026-08',
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        totalWorkingDays: 31,
        cutoffDate: '2026-08-25',
        status: 'PROCESSED',
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(phase70PayrollPeriods).values(payrollPeriod).onConflictDoNothing();

      const payslips = [
        {
          id: 'ps-2026-08-001',
          slipNumber: 'PS-2026-08-0101',
          payrollRunId: 'prun-2026-08',
          periodId: 'pp-2026-08',
          employeeId: 'emp-001',
          employeeCode: 'EMP-2026-0101',
          employeeName: 'Ahmad Al-Mansoor',
          department: 'Executive Management',
          designation: 'Project Director',
          basicSalaryAed: 22000,
          hraAed: 8000,
          daAed: 0,
          allowancesAed: 10000,
          overtimeHours: 0,
          overtimeAmountAed: 0,
          bonusAed: 0,
          grossEarningsAed: 40000,
          pfDeductionAed: 2000,
          esiDeductionAed: 0,
          ptDeductionAed: 0,
          tdsDeductionAed: 0,
          loanEmiAed: 0,
          advanceDeductionAed: 0,
          totalDeductionsAed: 2000,
          netSalaryAed: 38000,
          paymentMode: 'WPS_DIRECT_TRANSFER',
          paymentStatus: 'PAID',
          paymentReference: 'WPS-20260831-001',
          disbursementDate: '2026-08-31',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'ps-2026-08-002',
          slipNumber: 'PS-2026-08-0102',
          payrollRunId: 'prun-2026-08',
          periodId: 'pp-2026-08',
          employeeId: 'emp-002',
          employeeCode: 'EMP-2026-0102',
          employeeName: 'Elena Rostova',
          department: 'Site Engineering',
          designation: 'Senior Site Engineer',
          basicSalaryAed: 12000,
          hraAed: 4500,
          daAed: 0,
          allowancesAed: 6500,
          overtimeHours: 12,
          overtimeAmountAed: 1020,
          bonusAed: 0,
          grossEarningsAed: 24020,
          pfDeductionAed: 1200,
          esiDeductionAed: 0,
          ptDeductionAed: 0,
          tdsDeductionAed: 0,
          loanEmiAed: 1500,
          advanceDeductionAed: 0,
          totalDeductionsAed: 2700,
          netSalaryAed: 21320,
          paymentMode: 'WPS_DIRECT_TRANSFER',
          paymentStatus: 'PAID',
          paymentReference: 'WPS-20260831-002',
          disbursementDate: '2026-08-31',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'ps-2026-08-003',
          slipNumber: 'PS-2026-08-0103',
          payrollRunId: 'prun-2026-08',
          periodId: 'pp-2026-08',
          employeeId: 'emp-003',
          employeeCode: 'EMP-2026-0103',
          employeeName: 'Kareem Nader',
          department: 'HSE & Compliance',
          designation: 'Senior HSE Officer',
          basicSalaryAed: 8500,
          hraAed: 3000,
          daAed: 0,
          allowancesAed: 5000,
          overtimeHours: 8,
          overtimeAmountAed: 480,
          bonusAed: 0,
          grossEarningsAed: 16980,
          pfDeductionAed: 850,
          esiDeductionAed: 0,
          ptDeductionAed: 0,
          tdsDeductionAed: 0,
          loanEmiAed: 0,
          advanceDeductionAed: 0,
          totalDeductionsAed: 850,
          netSalaryAed: 16130,
          paymentMode: 'WPS_DIRECT_TRANSFER',
          paymentStatus: 'PAID',
          paymentReference: 'WPS-20260831-003',
          disbursementDate: '2026-08-31',
          createdAt: now,
          updatedAt: now,
        },
      ];
      for (const ps of payslips) {
        await db.insert(phase70PaySlips).values(ps).onConflictDoNothing();
      }

      // 8. Seed Attendance Records for Today
      const todayStr = '2026-08-14';
      const attendances = [
        { id: 'att-001', employeeId: 'emp-001', employeeCode: 'EMP-2026-0101', attendanceDate: todayStr, shiftId: 'shift-gen', inTime: '07:55', outTime: '17:15', totalHours: 8.33, lateMinutes: 0, earlyExitMinutes: 0, overtimeHours: 0.33, status: 'PRESENT', punchSource: 'BIOMETRIC_ESSL', deviceId: 'ESSL-DX-901', createdAt: now, updatedAt: now },
        { id: 'att-002', employeeId: 'emp-002', employeeCode: 'EMP-2026-0102', attendanceDate: todayStr, shiftId: 'shift-site-morn', inTime: '06:25', outTime: '15:10', totalHours: 8.75, lateMinutes: 0, earlyExitMinutes: 0, overtimeHours: 0.75, status: 'PRESENT', punchSource: 'BIOMETRIC_ESSL', deviceId: 'ESSL-DX-SITE-A', createdAt: now, updatedAt: now },
        { id: 'att-003', employeeId: 'emp-003', employeeCode: 'EMP-2026-0103', attendanceDate: todayStr, shiftId: 'shift-site-morn', inTime: '06:28', outTime: '15:05', totalHours: 8.6, lateMinutes: 0, earlyExitMinutes: 0, overtimeHours: 0.6, status: 'PRESENT', punchSource: 'BIOMETRIC_ESSL', deviceId: 'ESSL-DX-SITE-B', createdAt: now, updatedAt: now },
        { id: 'att-004', employeeId: 'emp-004', employeeCode: 'EMP-2026-0104', attendanceDate: todayStr, shiftId: 'shift-gen', inTime: '08:02', outTime: '17:05', totalHours: 8.05, lateMinutes: 2, earlyExitMinutes: 0, overtimeHours: 0, status: 'PRESENT', punchSource: 'BIOMETRIC_ESSL', deviceId: 'ESSL-DX-901', createdAt: now, updatedAt: now },
        { id: 'att-005', employeeId: 'emp-005', employeeCode: 'EMP-2026-0105', attendanceDate: todayStr, shiftId: 'shift-gen', inTime: '07:58', outTime: '17:00', totalHours: 8.0, lateMinutes: 0, earlyExitMinutes: 0, overtimeHours: 0, status: 'PRESENT', punchSource: 'BIOMETRIC_ESSL', deviceId: 'ESSL-DX-901', createdAt: now, updatedAt: now },
      ];
      for (const att of attendances) {
        await db.insert(phase70Attendance).values(att).onConflictDoNothing();
      }

      // 9. Seed UAE 2026 Holidays
      const holidays = [
        { id: 'hol-1', holidayName: "New Year's Day", holidayDate: '2026-01-01', dayOfWeek: 'Thursday', holidayType: 'NATIONAL', year: 2026, createdAt: now, updatedAt: now },
        { id: 'hol-2', holidayName: 'Eid Al Fitr (Day 1)', holidayDate: '2026-03-20', dayOfWeek: 'Friday', holidayType: 'RELIGIOUS', year: 2026, createdAt: now, updatedAt: now },
        { id: 'hol-3', holidayName: 'Eid Al Fitr (Day 2)', holidayDate: '2026-03-21', dayOfWeek: 'Saturday', holidayType: 'RELIGIOUS', year: 2026, createdAt: now, updatedAt: now },
        { id: 'hol-4', holidayName: 'Eid Al Fitr (Day 3)', holidayDate: '2026-03-22', dayOfWeek: 'Sunday', holidayType: 'RELIGIOUS', year: 2026, createdAt: now, updatedAt: now },
        { id: 'hol-5', holidayName: 'Arafat Day', holidayDate: '2026-05-27', dayOfWeek: 'Wednesday', holidayType: 'RELIGIOUS', year: 2026, createdAt: now, updatedAt: now },
        { id: 'hol-6', holidayName: 'Eid Al Adha (Day 1)', holidayDate: '2026-05-28', dayOfWeek: 'Thursday', holidayType: 'RELIGIOUS', year: 2026, createdAt: now, updatedAt: now },
        { id: 'hol-7', holidayName: 'Islamic New Year', holidayDate: '2026-06-16', dayOfWeek: 'Tuesday', holidayType: 'RELIGIOUS', year: 2026, createdAt: now, updatedAt: now },
        { id: 'hol-8', holidayName: 'Commemoration Day', holidayDate: '2026-11-30', dayOfWeek: 'Monday', holidayType: 'NATIONAL', year: 2026, createdAt: now, updatedAt: now },
        { id: 'hol-9', holidayName: 'UAE National Day (55th)', holidayDate: '2026-12-02', dayOfWeek: 'Wednesday', holidayType: 'NATIONAL', year: 2026, createdAt: now, updatedAt: now },
        { id: 'hol-10', holidayName: 'UAE National Day Holiday', holidayDate: '2026-12-03', dayOfWeek: 'Thursday', holidayType: 'NATIONAL', year: 2026, createdAt: now, updatedAt: now },
      ];
      for (const h of holidays) {
        await db.insert(phase70Holidays).values(h).onConflictDoNothing();
      }

      // 10. Seed Recruitment Requisition & Candidate
      const req = {
        id: 'req-001',
        requisitionCode: 'REQ-2026-0081',
        positionTitle: 'Senior Geotechnical Engineer',
        departmentId: 'dept-eng',
        vacanciesCount: 2,
        experienceYearsRequired: 6,
        minQualification: 'M.Sc. Geotechnical / Civil Engineering',
        targetHiringDate: '2026-09-30',
        salaryBudgetAed: 24000,
        priority: 'HIGH',
        status: 'OPEN',
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(phase70Recruitment).values(req).onConflictDoNothing();

      const candidate = {
        id: 'cand-001',
        candidateCode: 'CAN-2026-0412',
        jobOpeningId: 'req-001',
        fullName: 'Omar Farooq',
        email: 'omar.farooq.geo@gmail.com',
        phone: '+971 58 111 2233',
        currentCompany: 'Apex Geotech Consultants',
        currentDesignation: 'Geotech Specialist',
        totalExperienceYears: 7.5,
        noticePeriodDays: 30,
        currentCtcAed: 20000,
        expectedCtcAed: 24000,
        sourceChannel: 'LINKEDIN',
        status: 'SHORTLISTED',
        rating: 4.8,
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(phase70Candidates).values(candidate).onConflictDoNothing();

      // 11. Seed Performance Review
      const review = {
        id: 'rev-001',
        reviewCode: 'REV-2026-0101',
        employeeId: 'emp-001',
        reviewerId: 'emp-exec-ceo',
        reviewPeriod: 'ANNUAL_2026',
        reviewYear: 2026,
        selfRating: 4.6,
        managerRating: 4.8,
        committeeRating: 4.7,
        finalScore: 4.7,
        performanceTier: 'OUTSTANDING',
        strengths: 'Exceptional cross-functional delivery on Al Reem Tower milestone with zero safety escalations.',
        developmentAreas: 'Explore advanced AI automated scheduling workflows for multi-site deployment.',
        recommendedSalaryHikePercent: 12.0,
        recommendedPromotion: false,
        status: 'FINALIZED',
        reviewDate: '2026-08-01',
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(phase70PerformanceReviews).values(review).onConflictDoNothing();

      // 12. Seed Training Program
      const training = {
        id: 'train-001',
        programCode: 'TRN-2026-001',
        title: 'NEBOSH & Advanced UAE Construction Safety Standards',
        trainerName: 'Eng. Hamdan Al-Zaabi',
        category: 'SAFETY_HSE',
        startDate: '2026-08-20',
        endDate: '2026-08-22',
        durationHours: 16,
        venueOrLink: 'Tower B - Training Hall 3',
        maxParticipants: 35,
        costPerHeadAed: 1200,
        status: 'SCHEDULED',
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(phase70TrainingPrograms).values(training).onConflictDoNothing();

      console.log('Successfully seeded Phase 70 HRMS & Payroll data.');
    } catch (e) {
      console.error('Error seeding initial HRMS data:', e);
    }
  }

  // ===================== CRUD OPERATIONS =====================

  // 1. Departments
  public async getDepartments(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(phase70Departments).where(eq(phase70Departments.isDeleted, false));
  }

  public async createDepartment(data: any): Promise<any> {
    await this.ensureHrmsTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const [dept] = await db.insert(phase70Departments).values({
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return dept;
  }

  // 2. Designations
  public async getDesignations(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(phase70Designations).where(eq(phase70Designations.isDeleted, false));
  }

  public async createDesignation(data: any): Promise<any> {
    await this.ensureHrmsTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const [desig] = await db.insert(phase70Designations).values({
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return desig;
  }

  // 3. Employees
  public async getEmployees(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(phase70EmployeeMaster).where(eq(phase70EmployeeMaster.isDeleted, false)).orderBy(desc(phase70EmployeeMaster.createdAt));
  }

  public async getEmployeeById(id: string): Promise<any | null> {
    await this.ensureHrmsTablesExist();
    const [emp] = await db.select().from(phase70EmployeeMaster).where(eq(phase70EmployeeMaster.id, id));
    return emp || null;
  }

  public async createEmployee(data: any, actor: { userId: string; userName: string }): Promise<any> {
    await this.ensureHrmsTablesExist();
    const actorId = String(actor?.userId || '').trim();
    const actorName = String(actor?.userName || '').trim();
    if (!actorId || !actorName) throw new Error('Authenticated HR actor identity is required.');

    const required = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'joiningDate', 'departmentId', 'designationId', 'workLocation'];
    for (const field of required) {
      if (!String(data?.[field] || '').trim()) throw new Error(`${field} is required for employee onboarding.`);
    }
    const normalizedEmail = String(data.email).trim().toLowerCase();
    const duplicate = await db.select({ id: phase70EmployeeMaster.id })
      .from(phase70EmployeeMaster)
      .where(or(eq(phase70EmployeeMaster.email, normalizedEmail), eq(phase70EmployeeMaster.phone, String(data.phone).trim())))
      .limit(1);
    if (duplicate.length) throw new Error('Employee email or phone is already registered.');

    if (!data?.companyId && !isDemoSeedAllowed()) {
      throw new Error('Company context is required for employee master numbering outside DEMO mode.');
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const code = String(data.employeeCode || '').trim() || await numberingService.generateEmployeeNumber({
      companyId: data.companyId || null,
      branchId: data.branchId || null,
      date: data.joiningDate || now,
      allocatedBy: actorName,
    });

    const [emp] = await db.insert(phase70EmployeeMaster).values({
      id,
      firstName: String(data.firstName).trim(),
      lastName: String(data.lastName).trim(),
      email: normalizedEmail,
      phone: String(data.phone).trim(),
      gender: String(data.gender || 'OTHER').trim().toUpperCase(),
      dateOfBirth: String(data.dateOfBirth).trim(),
      nationalId: data.nationalId || null,
      passportNumber: data.passportNumber || null,
      visaStatus: data.visaStatus || 'EMPLOYMENT_RESIDENCE',
      joiningDate: String(data.joiningDate).trim(),
      departmentId: String(data.departmentId).trim(),
      designationId: String(data.designationId).trim(),
      reportingManagerId: data.reportingManagerId || null,
      employmentType: data.employmentType || 'FULL_TIME',
      workLocation: String(data.workLocation).trim(),
      projectId: data.projectId || null,
      employmentStatus: data.employmentStatus || 'ACTIVE',
      biometricId: data.biometricId || null,
      grade: String(data.grade || '').trim() || 'UNASSIGNED',
      noticePeriodDays: Number.isFinite(Number(data.noticePeriodDays)) ? Number(data.noticePeriodDays) : 30,
      probationEndDate: data.probationEndDate || null,
      createdAt: now,
      updatedAt: now,
      createdBy: actorName,
      updatedBy: actorName,
      employeeCode: code,
      isDeleted: false,
    }).returning();
    if (!emp) throw new Error('Employee onboarding failed.');

    await this.recordAuditLog({
      actionType: 'EMPLOYEE_ONBOARD',
      entityType: 'EMPLOYEE',
      entityId: id,
      referenceNumber: code,
      performedBy: actorName,
      detailsJson: JSON.stringify({ actorId, name: `${data.firstName} ${data.lastName}`, departmentId: data.departmentId, designationId: data.designationId }),
    });
    return emp;
  }

  public async updateEmployee(id: string, data: any, actor: { userId: string; userName: string }): Promise<any> {
    await this.ensureHrmsTablesExist();
    const actorId = String(actor?.userId || '').trim();
    const actorName = String(actor?.userName || '').trim();
    if (!actorId || !actorName) throw new Error('Authenticated HR actor identity is required.');
    const [existing] = await db.select().from(phase70EmployeeMaster).where(eq(phase70EmployeeMaster.id, id)).limit(1);
    if (!existing || existing.isDeleted) return null;

    const allowed: Record<string, any> = {};
    const fields = ['firstName','lastName','email','phone','gender','dateOfBirth','nationalId','passportNumber','visaStatus','joiningDate','departmentId','designationId','reportingManagerId','employmentType','workLocation','projectId','employmentStatus','biometricId','grade','noticePeriodDays','probationEndDate'];
    for (const field of fields) if (data[field] !== undefined) allowed[field] = data[field];
    if (allowed.email) allowed.email = String(allowed.email).trim().toLowerCase();
    if (allowed.phone) allowed.phone = String(allowed.phone).trim();
    if (allowed.noticePeriodDays !== undefined) {
      const notice = Number(allowed.noticePeriodDays);
      if (!Number.isFinite(notice) || notice < 0) throw new Error('Notice period days must be a non-negative number.');
      allowed.noticePeriodDays = notice;
    }

    const [updated] = await db.update(phase70EmployeeMaster)
      .set({ ...allowed, updatedAt: new Date().toISOString(), updatedBy: actorName })
      .where(eq(phase70EmployeeMaster.id, id))
      .returning();
    if (!updated) return null;
    await this.recordAuditLog({
      actionType: 'EMPLOYEE_MASTER_UPDATE',
      entityType: 'EMPLOYEE',
      entityId: id,
      referenceNumber: updated.employeeCode,
      performedBy: actorName,
      detailsJson: JSON.stringify({ actorId, changedFields: Object.keys(allowed) }),
    });
    return updated;
  }
  // 4. Attendance
  public async getAttendanceRecords(date?: string): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    if (date) {
      return db.select().from(phase70Attendance)
        .where(eq(phase70Attendance.attendanceDate, date))
        .orderBy(desc(phase70Attendance.createdAt));
    }
    return db.select().from(phase70Attendance).orderBy(desc(phase70Attendance.createdAt)).limit(100);
  }

  public async recordAttendance(data: any): Promise<any> {
    await this.ensureHrmsTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Compute total hours if inTime & outTime are provided
    let totalHours = data.totalHours || 0;
    if (data.inTime && data.outTime && !totalHours) {
      const [inH, inM] = data.inTime.split(':').map(Number);
      const [outH, outM] = data.outTime.split(':').map(Number);
      let diff = (outH * 60 + outM) - (inH * 60 + inM);
      if (diff < 0) diff += 24 * 60; // Overnight
      totalHours = parseFloat((diff / 60).toFixed(2));
    }

    const employeeId = String(data.employeeId || '').trim();
    const employeeCode = String(data.employeeCode || '').trim();
    const attendanceDate = String(data.attendanceDate || '').trim();
    const recordedById = String(data.recordedById || '').trim();
    const recordedByName = String(data.recordedByName || '').trim();

    if (!employeeId || !employeeCode || !attendanceDate || !recordedById || !recordedByName) {
      throw new Error('Employee, attendance date and authenticated recording actor are required.');
    }

    const [employee] = await db.select({ id: phase70EmployeeMaster.id, employeeCode: phase70EmployeeMaster.employeeCode, isDeleted: phase70EmployeeMaster.isDeleted })
      .from(phase70EmployeeMaster)
      .where(eq(phase70EmployeeMaster.id, employeeId))
      .limit(1);
    if (!employee || employee.isDeleted || employee.employeeCode !== employeeCode) {
      throw new Error('Attendance employee context could not be verified.');
    }

    const [rec] = await db.insert(phase70Attendance).values({
      id,
      employeeId,
      employeeCode,
      attendanceDate,
      shiftId: data.shiftId || null,
      inTime: data.inTime || null,
      outTime: data.outTime || null,
      totalHours,
      lateMinutes: Number(data.lateMinutes || 0),
      earlyExitMinutes: Number(data.earlyExitMinutes || 0),
      overtimeHours: Number(data.overtimeHours || 0),
      status: data.status || 'PRESENT',
      punchSource: data.punchSource || 'MANUAL_ENTRY',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      deviceId: data.deviceId || null,
      actionTaken: data.actionTaken || 'MANUAL_ATTENDANCE_ENTRY',
      payloadSent: data.payloadSent || null,
      rawResponse: data.rawResponse || null,
      statusCode: data.statusCode || null,
      executionDurationMs: data.executionDurationMs ?? null,
      isVerified: false,
      verifiedBy: null,
      remarks: data.remarks || null,
      createdAt: now,
      updatedAt: now,
      createdBy: recordedByName,
    }).returning();
    return rec;
  }

  public async verifyAttendanceRecord(
    attendanceId: string,
    actor: { userId: string; userName: string },
    decision: 'VERIFY' | 'REJECT',
    reason: string
  ): Promise<any | null> {
    await this.ensureHrmsTablesExist();
    const id = String(attendanceId || '').trim();
    const actorId = String(actor?.userId || '').trim();
    const actorName = String(actor?.userName || '').trim();
    const verificationReason = String(reason || '').trim();
    if (!id || !actorId || !actorName) throw new Error('Attendance record and authenticated verifier identity are required.');
    if (!verificationReason) throw new Error('A reason is mandatory for attendance verification/rejection.');

    return await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(phase70Attendance).where(eq(phase70Attendance.id, id)).limit(1);
      if (!existing) return null;
      if (String(existing.createdBy || '').trim().toLowerCase() === actorName.toLowerCase()) {
        throw new Error('Maker-checker violation: attendance creator cannot verify or reject the same attendance record.');
      }
      if (existing.isVerified) {
        throw new Error('Attendance record is already verified and cannot be re-verified without an explicit revision workflow.');
      }

      const nextStatus = decision === 'VERIFY' ? existing.status : 'REJECTED';
      const [updated] = await tx.update(phase70Attendance).set({
        isVerified: decision === 'VERIFY',
        verifiedBy: actorName,
        status: nextStatus,
        remarks: [existing.remarks, `[Verification] ${verificationReason}`].filter(Boolean).join(' | '),
        updatedAt: new Date().toISOString(),
      } as any).where(eq(phase70Attendance.id, id)).returning();
      if (!updated) return null;

      await this.recordAuditLog({
        actionType: decision === 'VERIFY' ? 'ATTENDANCE_VERIFIED' : 'ATTENDANCE_REJECTED',
        entityType: 'ATTENDANCE_RECORD',
        entityId: id,
        referenceNumber: existing.employeeCode + ':' + existing.attendanceDate,
        performedBy: actorName,
        detailsJson: JSON.stringify({ actorId, employeeId: existing.employeeId, employeeCode: existing.employeeCode, attendanceDate: existing.attendanceDate, decision, reason: verificationReason }),
      }, tx);

      return updated;
    });
  }
  public async syncEsslBiometric(deviceId: string, punches: any[]): Promise<any> {
    await this.ensureHrmsTablesExist();
    const now = new Date().toISOString();
    const results = [];

    // Preload employees for fast biometricId resolution
    const employees = await this.getEmployees();
    const empMap = new Map<string, any>();
    for (const emp of employees) {
      if (emp.biometricId) empMap.set(emp.biometricId, emp);
      if (emp.employeeCode) empMap.set(emp.employeeCode, emp);
    }

    for (const p of punches) {
      const id = uuidv4();
      const matchedEmp = empMap.get(p.biometricId) || empMap.get(p.employeeCode);
      const rawTimestamp = p.timestamp || p.punchTimestamp || now;
      const punchType = (p.punchType || p.type || 'CHECK_IN').toUpperCase();
      const verificationMode = (p.verificationMode || p.authMode || 'FINGERPRINT').toUpperCase();
      const biometricId = String(p.biometricId || 'UNKNOWN').trim();
      const sourceFingerprint = createHash('sha256')
        .update([deviceId, biometricId, rawTimestamp, punchType, verificationMode].join('|'))
        .digest('hex');

      // 1. IMMUTABLE RAW BIOMETRIC PUNCH PERSISTENCE (Append-only + idempotent)
      await db.insert(hrBiometricRawPunches).values({
        id,
        deviceId,
        biometricId,
        employeeId: matchedEmp?.id || p.employeeId || null,
        employeeCode: matchedEmp?.employeeCode || p.employeeCode || null,
        employeeName: matchedEmp ? `${matchedEmp.firstName || ''} ${matchedEmp.lastName || ''}`.trim() : p.employeeName || null,
        rawTimestamp,
        punchType,
        verificationMode,
        rawPayload: JSON.stringify(p),
        sourceFingerprint,
        isProcessed: false,
        createdAt: now,
      }).onConflictDoNothing({ target: hrBiometricRawPunches.sourceFingerprint });

      const log = {
        id,
        deviceId,
        biometricId: p.biometricId,
        employeeCode: matchedEmp?.employeeCode,
        punchTimestamp: rawTimestamp,
        punchType,
        verificationMode,
      };

      await db.insert(phase70HrAuditLogs).values({
        id: `audit-${id}`,
        actionType: 'BIOMETRIC_PUNCH_RAW_SYNC',
        entityType: 'ATTENDANCE_PUNCH',
        entityId: id,
        referenceNumber: deviceId,
        performedBy: 'ESSL_INTEGRATION',
        detailsJson: JSON.stringify(log),
        timestamp: now,
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();
      results.push(log);
    }

    return { deviceId, processedCount: results.length, timestamp: now };
  }

  public async getRawBiometricPunches(params: { deviceId?: string; biometricId?: string; employeeId?: string; limit?: number } = {}): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    try {
      let query = sql`SELECT * FROM hr_biometric_raw_punches ORDER BY raw_timestamp DESC LIMIT ${params.limit || 200}`;
      if (params.deviceId) {
        query = sql`SELECT * FROM hr_biometric_raw_punches WHERE device_id = ${params.deviceId} ORDER BY raw_timestamp DESC LIMIT ${params.limit || 200}`;
      } else if (params.biometricId) {
        query = sql`SELECT * FROM hr_biometric_raw_punches WHERE biometric_id = ${params.biometricId} ORDER BY raw_timestamp DESC LIMIT ${params.limit || 200}`;
      } else if (params.employeeId) {
        query = sql`SELECT * FROM hr_biometric_raw_punches WHERE employee_id = ${params.employeeId} ORDER BY raw_timestamp DESC LIMIT ${params.limit || 200}`;
      }
      const res = await db.execute(query);
      return res?.rows || [];
    } catch (e) {
      console.warn('Raw biometric punches query error:', e);
      return [];
    }
  }

  // 5. Shifts & Rosters
  public async getShifts(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(phase70ShiftMaster).where(eq(phase70ShiftMaster.isDeleted, false));
  }

  public async createShift(data: any): Promise<any> {
    await this.ensureHrmsTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const [shift] = await db.insert(phase70ShiftMaster).values({
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return shift;
  }

  // 6. Leave Applications & Types
  public async getLeaveTypes(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(phase70LeaveTypes).where(eq(phase70LeaveTypes.isDeleted, false));
  }

  public async getLeaveApplications(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(phase70LeaveRequests).where(eq(phase70LeaveRequests.isDeleted, false)).orderBy(desc(phase70LeaveRequests.createdAt));
  }

  public async applyLeave(data: any): Promise<any> {
    await this.ensureHrmsTablesExist();
    const employeeId = String(data?.employeeId || '').trim();
    const leaveTypeId = String(data?.leaveTypeId || '').trim();
    const startDate = String(data?.startDate || '').trim();
    const endDate = String(data?.endDate || '').trim();
    const reason = String(data?.reason || '').trim();
    const actorId = String(data?.requestedByUserId || data?.userId || '').trim();
    const actorName = String(data?.requestedByUserName || data?.userName || '').trim();
    if (!data?.companyId && !isDemoSeedAllowed()) throw new Error('Company context is required for leave request numbering outside DEMO mode.');
    if (!employeeId || !leaveTypeId || !startDate || !endDate || !reason || !actorId || !actorName) throw new Error('Employee, leave type, dates, reason and authenticated requester identity are required.');
    if (new Date(startDate) > new Date(endDate)) throw new Error('Leave end date cannot be before start date.');

    const [employee] = await db.select().from(phase70EmployeeMaster).where(and(eq(phase70EmployeeMaster.id, employeeId), eq(phase70EmployeeMaster.isDeleted, false))).limit(1);
    if (!employee) throw new Error('Leave requester is not an active employee.');
    const [leaveType] = await db.select().from(phase70LeaveTypes).where(and(eq(phase70LeaveTypes.id, leaveTypeId), eq(phase70LeaveTypes.isDeleted, false))).limit(1);
    if (!leaveType) throw new Error('Selected leave type is not configured.');

    const requestedDays = Number(data?.totalDays);
    if (!Number.isFinite(requestedDays) || requestedDays <= 0) throw new Error('Leave duration must be greater than zero.');

    const requestNumber = await numberingService.generateLeaveRequestNumber({
      companyId: data?.companyId || null,
      date: startDate,
      allocatedBy: actorName,
    });
    const [duplicate] = await db.select({ id: phase70LeaveRequests.id }).from(phase70LeaveRequests).where(eq(phase70LeaveRequests.requestNumber, requestNumber)).limit(1);
    if (duplicate) throw new Error(`Leave request number ${requestNumber} already exists.`);

    const id = uuidv4();
    const now = new Date().toISOString();
    const [app] = await db.insert(phase70LeaveRequests).values({
      id, requestNumber, employeeId: employee.id, leaveTypeId: leaveType.id, startDate, endDate, totalDays: requestedDays, reason,
      contactDuringLeave: data?.contactDuringLeave || null, attachmentUrl: data?.attachmentUrl || null, status: 'PENDING',
      approvedBy: null, approvalRemarks: null, reviewedAt: null, createdAt: now, updatedAt: now, createdBy: actorName, updatedBy: actorName, deletedAt: null, isDeleted: false,
    }).returning();
    await this.recordAuditLog({
      actionType: 'LEAVE_REQUEST_CREATED', entityType: 'LEAVE_REQUEST', entityId: id, referenceNumber: requestNumber, performedBy: actorName,
      detailsJson: JSON.stringify({ actorId, employeeId: employee.id, leaveTypeId: leaveType.id, startDate, endDate, totalDays: requestedDays }),
    });
    return app;
  },



  // 7. Holidays
  public async getHolidays(year: number = 2026): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(phase70Holidays).where(eq(phase70Holidays.year, year)).orderBy(phase70Holidays.holidayDate);
  }

  // 8. Payroll & Salary Structures
  public async getSalaryStructures(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(phase70SalaryStructures).where(eq(phase70SalaryStructures.isDeleted, false));
  }

  public async createSalaryStructure(data: any, actor: { userId: string; userName: string }): Promise<any> {
    await this.ensureHrmsTablesExist();
    const actorId = String(actor?.userId || '').trim();
    const actorName = String(actor?.userName || '').trim();
    const structureCode = String(data?.structureCode || '').trim();
    const title = String(data?.title || '').trim();
    const effectiveFrom = String(data?.effectiveFrom || '').trim();
    if (!actorId || !actorName) throw new Error('Authenticated payroll/HR actor identity is required.');
    if (!structureCode || !title || !effectiveFrom) throw new Error('Salary structure code, title and effective-from date are required.');
    const moneyFields = ['baseMonthlyAed','hraAed','conveyanceAed','medicalAed','specialAllowanceAed','siteAllowanceAed','otRatePerHour'];
    for (const field of moneyFields) { const value = Number(data?.[field] ?? 0); if (!Number.isFinite(value) || value < 0) throw new Error(`${field} must be a valid non-negative number.`); }
    const [duplicate] = await db.select({ id: phase70SalaryStructures.id }).from(phase70SalaryStructures).where(eq(phase70SalaryStructures.structureCode, structureCode)).limit(1);
    if (duplicate) throw new Error(`Salary structure ${structureCode} already exists.`);
    const id = uuidv4();
    const now = new Date().toISOString();
    const [struct] = await db.insert(phase70SalaryStructures).values({
      id, structureCode, title, grade: String(data?.grade || '').trim() || 'UNASSIGNED', baseMonthlyAed: Number(data?.baseMonthlyAed || 0),
      hraAed: Number(data?.hraAed || 0), conveyanceAed: Number(data?.conveyanceAed || 0), medicalAed: Number(data?.medicalAed || 0),
      specialAllowanceAed: Number(data?.specialAllowanceAed || 0), siteAllowanceAed: Number(data?.siteAllowanceAed || 0), otRatePerHour: Number(data?.otRatePerHour || 0),
      pfApplicable: Boolean(data?.pfApplicable), esiApplicable: Boolean(data?.esiApplicable), ptApplicable: Boolean(data?.ptApplicable),
      status: String(data?.status || 'ACTIVE').trim().toUpperCase(), effectiveFrom, createdAt: now, updatedAt: now, createdBy: actorName, updatedBy: actorName, isDeleted: false, deletedAt: null,
    }).returning();
    await this.recordAuditLog({ actionType: 'SALARY_STRUCTURE_CREATED', entityType: 'SALARY_STRUCTURE', entityId: id, referenceNumber: structureCode, performedBy: actorName, detailsJson: JSON.stringify({ actorId, title, effectiveFrom }) });
    return struct;
  }



  public async getPayrollPeriods(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(phase70PayrollPeriods).where(eq(phase70PayrollPeriods.isDeleted, false)).orderBy(desc(phase70PayrollPeriods.monthYear));
  }

  public async getPayslips(periodId?: string): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    if (periodId) {
      return db.select().from(phase70PaySlips).where(eq(phase70PaySlips.periodId, periodId));
    }
    return db.select().from(phase70PaySlips).orderBy(desc(phase70PaySlips.createdAt)).limit(100);
  }

  public async executePayrollRun(
    periodId: string,
    remarks?: string,
    options: {
      makerUserId?: string;
      makerUserName?: string;
      currency?: string;
      jurisdiction?: string;
    } = {}
  ): Promise<any> {
    await this.ensureHrmsTablesExist();
    await statutoryEngineService.ensureStatutoryRulesSeeded();

    if (!periodId?.trim()) throw new Error('Payroll period is required.');
    if (!options.makerUserId?.trim() || !options.makerUserName?.trim()) {
      throw new Error('Authenticated payroll maker identity is required.');
    }

    const now = new Date().toISOString();
    const periodRows = await db.select().from(phase70PayrollPeriods).where(eq(phase70PayrollPeriods.id, periodId)).limit(1);

    if (periodRows.length === 0) {
      if (!isDemoSeedAllowed()) {
        throw new Error(`Payroll period ${periodId} is not configured. Create/open the payroll period before running payroll.`);
      }
      throw new Error(`Demo payroll period ${periodId} is not available. Configure the demo period before running payroll.`);
    }

    const period = periodRows[0];
    if (period.status && !['OPEN', 'REOPENED', 'CALCULATION'].includes(period.status)) {
      throw new Error(`Payroll period ${period.monthYear} is not open for calculation. Current status: ${period.status}`);
    }

    const payrollMonth = String(period.monthYear || '').trim();
    if (!/^\d{4}-\d{2}$/.test(payrollMonth)) throw new Error('Payroll period month must use YYYY-MM format.');

    const jurisdiction = String(options.jurisdiction || '').trim().toUpperCase();
    const currency = String(options.currency || '').trim().toUpperCase();
    if (!jurisdiction || !currency) {
      throw new Error('Payroll jurisdiction and transaction currency must be configured for the payroll run.');
    }

    let exchangeRateToInr = 1;
    if (currency !== 'INR') {
      const rateInfo = await currencyRepository.getLatestRate(currency, 'INR', payrollMonth);
      if (!rateInfo || !Number.isFinite(rateInfo.rate) || rateInfo.rate <= 0) {
        throw new Error(`No active ${currency}/INR exchange rate is configured for payroll period ${payrollMonth}.`);
      }
      exchangeRateToInr = rateInfo.rate;
    }

    // Fetch active statutory rules dynamically
    const activeRules = await statutoryEngineService.getStatutoryRules(jurisdiction);

    // Fetch all active direct company employees (excluding subcontract workforce and inactive/terminated staff)
    const allEmployees = await this.getEmployees();
    const employees = allEmployees.filter((emp: any) => {
      const type = (emp.employmentType || '').toUpperCase();
      const status = (emp.employmentStatus || '').toUpperCase();
      const isSubcontract = type === 'SUBCONTRACT_LABOUR' || type === 'SUBCONTRACTOR_WORKER' || type === 'LABOUR_SUPPLIER' || type === 'THIRD_PARTY_LABOUR';
      const isInactive = status === 'TERMINATED' || status === 'RESIGNED' || status === 'INACTIVE';
      return !isSubcontract && !isInactive;
    });
    const payslipsCreated = [];

    // Check for finalized attendance records for this period/month
    const finalizationRows = await db.execute(sql`
      SELECT * FROM hr_attendance_finalizations WHERE period_id = ${periodId} OR month_year = ${payrollMonth}
    `);
    const finalizedAttendanceMap = new Map<string, any>();
    if (finalizationRows?.rows) {
      (finalizationRows.rows as any[]).forEach((f) => {
        if (String(f.status || '').toUpperCase() === 'FINALIZED') {
          finalizedAttendanceMap.set(f.employee_id, f);
        }
      });
    }

    const missingFinalization = employees.filter((emp: any) => !finalizedAttendanceMap.has(emp.id));
    if (missingFinalization.length > 0) {
      const sample = missingFinalization.slice(0, 10).map((emp: any) => emp.employeeCode || emp.id).join(', ');
      throw new Error(`Payroll cannot be calculated because finalized attendance is missing for ${missingFinalization.length} employee(s): ${sample}`);
    }

    // Fetch active loans for automatic recovery
    const allLoans = await db.select().from(phase70Loans).where(and(eq(phase70Loans.isDeleted, false), eq(phase70Loans.status, 'ACTIVE')));

    // IDEMPOTENCY SAFEGUARD: If recalculating an existing un-disbursed run for this period, rollback previous recoveries
    try {
      const existingRecoveries = await db.execute(sql`
        SELECT * FROM hr_loan_recoveries WHERE period_id = ${periodId}
      `);
      if (existingRecoveries?.rows && existingRecoveries.rows.length > 0) {
        for (const rec of existingRecoveries.rows as any[]) {
          await db.execute(sql`
            UPDATE phase70_loans 
            SET outstanding_balance_aed = outstanding_balance_aed + ${Number(rec.recovered_amount || 0)},
                total_repaid_aed = GREATEST(0, total_repaid_aed - ${Number(rec.recovered_amount || 0)}),
                status = 'ACTIVE',
                updated_at = ${now}
            WHERE id = ${rec.loan_id}
          `);
        }
        await db.execute(sql`DELETE FROM hr_loan_recoveries WHERE period_id = ${periodId}`);
      }
      await db.delete(phase70PaySlips).where(eq(phase70PaySlips.payrollRunId, `prun-${periodId}`));
    } catch (cleanErr: any) {
      throw new Error(`Payroll recalculation cleanup failed for period ${periodId}: ${cleanErr?.message || cleanErr}`);
    }

    // Refresh loan balances after any idempotency rollback
    const refreshedLoans = await db.select().from(phase70Loans).where(and(eq(phase70Loans.isDeleted, false), eq(phase70Loans.status, 'ACTIVE')));

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let totalEmployerPf = 0;
    let totalEmployerEsi = 0;
    let totalGratuityAccrual = 0;
    let totalTds = 0;
    let totalPt = 0;

    for (const emp of employees) {
      const id = uuidv4();
      const payslipNumber = `PS-${payrollMonth.replace('-', '')}-${uuidv4().slice(0, 8).toUpperCase()}`;

      // Fetch employee statutory profile
      const statutoryProfile = await statutoryEngineService.getEmployeeStatutoryProfile(emp.id, emp.employeeCode);

      // Attendance values MUST come from finalized attendance; no synthetic duty/OT defaults.
      const attRecord = finalizedAttendanceMap.get(emp.id);
      if (!attRecord) throw new Error(`Finalized attendance is missing for employee ${emp.employeeCode || emp.id}.`);
      const payableDutyDays = Number(attRecord.payable_duty_days);
      const overtimeHours = Number(attRecord.overtime_hours || 0);
      const wageType = attRecord.wage_type || (emp as any).wageType || ((emp as any).dailyWageRate != null || (emp as any).dailyWageRateUSD != null ? 'DAILY_WAGE' : 'MONTHLY');
      const dailyWageRate = Number(attRecord.daily_wage_rate ?? (emp as any).dailyWageRate ?? ((emp as any).dailyWageRateUSD != null ? (emp as any).dailyWageRateUSD * exchangeRateToInr : 0));
      const lopDays = Number(attRecord.unpaid_leave_days ?? attRecord.absent_days ?? 0);
      const totalDaysInMonth = Number(attRecord.total_days_in_month);
      if (!Number.isFinite(payableDutyDays) || payableDutyDays < 0 || !Number.isFinite(overtimeHours) || overtimeHours < 0 || !Number.isFinite(totalDaysInMonth) || totalDaysInMonth <= 0) {
        throw new Error(`Finalized attendance values are invalid for employee ${emp.employeeCode || emp.id}.`);
      }

      // Evaluate loan recovery for active loans
      const empLoans = refreshedLoans.filter((l: any) => l.employeeId === emp.id && (l.outstandingBalanceAed || l.balanceOutstandingAed || 0) > 0);
      let totalLoanRecovery = 0;

      for (const loan of empLoans) {
        const anyLoan = loan as any;
        let calculatedInstallment = 0;
        const method = anyLoan.repaymentMethod || 'PER_DUTY_DAY';
        if (method === 'PER_DUTY_DAY' || method === 'PER_DAY' || method === 'PER_WORKING_DAY') {
          const rate = Number(anyLoan.repaymentRate);
          if (!Number.isFinite(rate) || rate < 0) throw new Error(`Invalid repayment rate for loan ${anyLoan.loanCode || anyLoan.id}.`);
          calculatedInstallment = payableDutyDays * rate;
        } else if (method === 'PERCENTAGE_OF_SALARY') {
          const baseGross = Number(emp.salaryINR ?? (emp as any).baseSalary);
          const percentage = Number(anyLoan.repaymentRate);
          if (!Number.isFinite(baseGross) || baseGross <= 0 || !Number.isFinite(percentage) || percentage < 0) throw new Error(`Salary basis / repayment percentage is not configured for loan ${anyLoan.loanCode || anyLoan.id}.`);
          calculatedInstallment = (baseGross * percentage) / 100;
        } else {
          // Monthly or Fixed Installment
          const monthlyEmi = Number(anyLoan.monthlyEmiAed);
          if (Number.isFinite(monthlyEmi) && monthlyEmi > 0) calculatedInstallment = monthlyEmi;
          else {
            const totalRepayable = Number(anyLoan.totalRepayableAed);
            const tenureMonths = Number(anyLoan.tenureMonths);
            if (!Number.isFinite(totalRepayable) || totalRepayable <= 0 || !Number.isFinite(tenureMonths) || tenureMonths <= 0) throw new Error(`Loan installment configuration is incomplete for ${anyLoan.loanCode || anyLoan.id}.`);
            calculatedInstallment = totalRepayable / tenureMonths;
          }
        }

        // CRITICAL BUSINESS RULE: Recovery = MIN(calculated installment, outstanding balance)
        const openingBal = anyLoan.outstandingBalanceAed ?? anyLoan.balanceOutstandingAed ?? 0;
        const actualDeduction = Math.min(calculatedInstallment, openingBal);
        const closingBal = Math.max(0, openingBal - actualDeduction);

        totalLoanRecovery += actualDeduction;

        // Record in hr_loan_recoveries ledger
        try {
          await db.execute(sql`
            INSERT INTO hr_loan_recoveries (
              id, loan_id, loan_code, employee_id, employee_code, payroll_run_id, period_id, month_year,
              payable_duty_days, repayment_rate, calculated_installment, opening_outstanding, recovered_amount,
              closing_outstanding, deduction_type, transaction_reference, actor, timestamp, created_at
            ) VALUES (
              ${uuidv4()}, ${loan.id}, ${loan.loanCode}, ${emp.id}, ${emp.employeeCode || `EMP-${emp.id}`},
              ${`prun-${periodId}`}, ${periodId}, ${payrollMonth}, ${payableDutyDays}, ${anyLoan.repaymentRate},
              ${calculatedInstallment}, ${openingBal}, ${actualDeduction}, ${closingBal},
              ${anyLoan.repaymentMethod || 'PER_DUTY_DAY'}, ${`REC-${payrollMonth}-${loan.loanCode}`},
              ${options.makerUserName}, ${now}, ${now}
            )
          `);

          // Update loan balance
          const isFullyClosed = closingBal <= 0;
          await db.update(phase70Loans).set({
            outstandingBalanceAed: closingBal,
            totalRepaidAed: (anyLoan.totalRepaidAed || anyLoan.totalRecoveredAed || 0) + actualDeduction,
            status: isFullyClosed ? 'CLOSED' : 'ACTIVE',
            updatedAt: now,
          }).where(eq(phase70Loans.id, loan.id));
        } catch (loanRecErr: any) {
          throw new Error(`Loan recovery posting failed for ${anyLoan.loanCode || anyLoan.id}: ${loanRecErr?.message || loanRecErr}`);
        }
      }

      // Dynamically compute statutory payroll with attendance-driven duty days and wage model
      const calc = await statutoryEngineService.computeEmployeePayroll(emp, statutoryProfile, activeRules, {
        payrollMonth,
        transactionCurrency: currency,
        exchangeRateToInr,
        overtimeHours,
        loanEmi: totalLoanRecovery,
        payableDutyDays,
        totalDaysInMonth,
        lopDays,
        wageType: wageType as any,
        dailyWageRate,
      });

      totalGross += calc.grossEarnings;
      totalDeductions += calc.totalEmployeeDeductions;
      totalNet += calc.netPayable;
      totalEmployerPf += calc.totalEmployerPf;
      totalEmployerEsi += calc.employerEsi;
      totalGratuityAccrual += calc.gratuityAccrual;
      totalTds += calc.tdsIncomeTax;
      totalPt += calc.professionalTax;

      const [ps] = await db.insert(phase70PaySlips).values({
        id,
        slipNumber: payslipNumber,
        payrollRunId: `prun-${periodId}`,
        periodId: periodId,
        employeeId: emp.id,
        employeeCode: emp.employeeCode || `EMP-${emp.id}`,
        employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee',
        department: emp.departmentId || 'Engineering',
        designation: emp.designationId || 'Engineer',
        basicSalaryAed: calc.basic,
        hraAed: calc.hra,
        daAed: calc.da,
        allowancesAed: calc.specialAllowance + calc.siteAllowance + calc.conveyance,
        overtimeHours,
        overtimeAmountAed: calc.overtimeAmount,
        bonusAed: calc.bonusAmount,
        grossEarningsAed: calc.grossEarnings,
        pfDeductionAed: calc.employeePf + calc.employeeVpf,
        esiDeductionAed: calc.employeeEsi,
        ptDeductionAed: calc.professionalTax,
        tdsDeductionAed: calc.tdsIncomeTax,
        loanEmiAed: calc.loanEmi,
        advanceDeductionAed: calc.advanceRecovery,
        totalDeductionsAed: calc.totalEmployeeDeductions,
        netSalaryAed: calc.netPayable,
        paymentMode: statutoryProfile.paymentMode || 'NEFT_RTGS',
        paymentStatus: 'CALCULATED',
        paymentReference: null,
        disbursementDate: null,
        createdAt: now,
        updatedAt: now,
      }).returning();

      payslipsCreated.push({
        ...ps,
        statutoryBreakdown: calc,
      });
    }

    // Upsert or register in hrPayrollRuns governance table
    const runNumber = `PRUN-${payrollMonth.replace('-', '')}-${String(payslipsCreated.length).padStart(3, '0')}`;
    const [governanceRun] = await db.insert(hrPayrollRuns).values({
      id: `prun-${periodId}`,
      runNumber,
      payrollMonth,
      jurisdiction,
      currency,
      exchangeRateToInr,
      totalEmployees: employees.length,
      totalGrossPay: totalGross,
      totalDeductions: totalDeductions,
      totalNetPay: totalNet,
      totalEmployerPf,
      totalEmployerEsi,
      totalGratuityAccrual,
      totalTds,
      totalPt,
      status: 'CALCULATED',
      makerUserId: options.makerUserId,
      makerUserName: options.makerUserName,
      makerTimestamp: now,
      isLocked: false,
      auditTrail: [
        {
          action: 'PAYROLL_CALCULATED_DYNAMIC',
          timestamp: now,
          actor: options.makerUserName,
          remarks: remarks || 'Calculated via Configurable Statutory Engine',
        },
      ],
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: hrPayrollRuns.id,
      set: {
        totalGrossPay: totalGross,
        totalDeductions: totalDeductions,
        totalNetPay: totalNet,
        totalEmployerPf,
        totalEmployerEsi,
        totalGratuityAccrual,
        totalTds,
        totalPt,
        status: 'CALCULATED',
        makerUserId: options.makerUserId,
        makerUserName: options.makerUserName,
        makerTimestamp: now,
        isLocked: false,
        lockHash: null,
        disbursedAt: null,
        checkerUserId: null,
        checkerUserName: null,
        checkerTimestamp: null,
        checkerRemarks: null,
        updatedAt: now,
      },
    }).returning();

    // Update legacy phase70 period status
    await db.update(phase70PayrollPeriods).set({ status: 'PROCESSED', updatedAt: now }).where(eq(phase70PayrollPeriods.id, periodId));

    // Audit log
    await this.recordAuditLog({
      actionType: 'PAYROLL_CALCULATED',
      entityType: 'PAYROLL_PERIOD',
      entityId: periodId,
      referenceNumber: governanceRun.runNumber,
      performedBy: options.makerUserName,
      detailsJson: JSON.stringify({
        count: payslipsCreated.length,
        totalGross,
        totalNet,
        currency,
        statutoryRulesApplied: activeRules.length,
        remarks,
      }),
    });

    return {
      periodId,
      runId: governanceRun.id,
      runNumber: governanceRun.runNumber,
      generatedPayslips: payslipsCreated.length,
      currency,
      exchangeRateToInr,
      totalGrossPay: totalGross,
      totalNetPay: totalNet,
      totalEmployerPf,
      totalEmployerEsi,
      totalGratuityAccrual,
      totalTds,
      totalPt,
      status: 'CALCULATED',
      maker: {
        userId: governanceRun.makerUserId,
        userName: governanceRun.makerUserName,
        timestamp: governanceRun.makerTimestamp,
      },
    };
  }

  // --- STATUTORY GOVERNANCE & MAKER-CHECKER WORKFLOW METHODS ---

  public async getStatutoryRules(jurisdiction?: string): Promise<any[]> {
    return statutoryEngineService.getStatutoryRules(jurisdiction);
  }

  public async upsertStatutoryRule(data: any, actor?: string): Promise<any> {
    return statutoryEngineService.upsertStatutoryRule(data, actor);
  }

  public async getEmployeeStatutoryProfile(employeeId: string): Promise<any> {
    return statutoryEngineService.getEmployeeStatutoryProfile(employeeId);
  }

  public async updateEmployeeStatutoryProfile(employeeId: string, data: any, actor?: string): Promise<any> {
    return statutoryEngineService.updateEmployeeStatutoryProfile(employeeId, data, actor);
  }

  public async getPayrollRuns(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(hrPayrollRuns).orderBy(desc(hrPayrollRuns.createdAt));
  }

  public async getPayrollRunById(runId: string): Promise<any> {
    await this.ensureHrmsTablesExist();
    const rows = await db.select().from(hrPayrollRuns).where(eq(hrPayrollRuns.id, runId)).limit(1);
    if (rows.length === 0) return null;
    const payslips = await db.select().from(phase70PaySlips).where(eq(phase70PaySlips.payrollRunId, runId));
    return {
      ...rows[0],
      payslips,
    };
  }

  public async submitPayrollForReview(runId: string, actor: { userId: string; userName: string }): Promise<any> {
    await this.ensureHrmsTablesExist();
    const runRows = await db.select().from(hrPayrollRuns).where(eq(hrPayrollRuns.id, runId)).limit(1);
    if (runRows.length === 0) throw new Error(`Payroll run ${runId} not found`);
    const run = runRows[0];
    if (run.isLocked) throw new Error(`Payroll run ${runId} is locked and cannot be modified`);

    const now = new Date().toISOString();
    const [updated] = await db.update(hrPayrollRuns).set({
      status: 'SUBMITTED_FOR_REVIEW',
      makerUserId: actor.userId,
      makerUserName: actor.userName,
      makerTimestamp: now,
      updatedAt: now,
    }).where(eq(hrPayrollRuns.id, runId)).returning();

    await this.recordAuditLog({
      actionType: 'PAYROLL_SUBMITTED_FOR_REVIEW',
      entityType: 'PAYROLL_RUN',
      entityId: runId,
      referenceNumber: run.runNumber,
      performedBy: actor.userName,
      detailsJson: JSON.stringify({ status: 'SUBMITTED_FOR_REVIEW' }),
    });

    return updated;
  }

  public async approvePayrollRun(
    runId: string,
    checker: { userId: string; userName: string },
    remarks?: string
  ): Promise<any> {
    await this.ensureHrmsTablesExist();
    const runRows = await db.select().from(hrPayrollRuns).where(eq(hrPayrollRuns.id, runId)).limit(1);
    if (runRows.length === 0) throw new Error(`Payroll run ${runId} not found`);
    const run = runRows[0];

    if (run.isLocked) throw new Error(`Payroll run ${runId} is already locked`);

    // Dynamic Policy Engine Eligibility & Separation of Duties Evaluation
    const evaluation = await workflowPolicyEngine.evaluateEligibility({
      user: checker,
      entityType: 'PAYROLL',
      action: 'APPROVE',
      instance: run,
    });

    if (!evaluation.isEligible) {
      throw new Error(`Maker-Checker Violation: ${evaluation.reason}`);
    }

    const now = new Date().toISOString();
    const payslips = await db.select().from(phase70PaySlips).where(eq(phase70PaySlips.payrollRunId, runId));
    const lockHash = statutoryEngineService.generateLockHash(runId, run.payrollMonth, payslips);

    const [updated] = await db.update(hrPayrollRuns).set({
      status: 'APPROVED',
      checkerUserId: checker.userId,
      checkerUserName: checker.userName,
      checkerTimestamp: now,
      checkerRemarks: remarks || 'Verified and approved with statutory compliance.',
      isLocked: false,
      lockHash,
      updatedAt: now,
    }).where(eq(hrPayrollRuns.id, runId)).returning();

    // Update payslips status to APPROVED
    await db.update(phase70PaySlips).set({
      paymentStatus: 'APPROVED',
      updatedAt: now,
    }).where(eq(phase70PaySlips.payrollRunId, runId));

    // Record Workflow History Audit
    await db.insert(workflowHistory).values({
      id: `hist-pay-appr-${Date.now()}`,
      workflowCode: evaluation.workflowCode,
      entityType: 'PAYROLL_RUN',
      entityId: runId,
      fromState: run.status,
      toState: 'APPROVED',
      actionTaken: 'APPROVED',
      performedByUserId: checker.userId,
      performedByUserName: checker.userName,
      performedByUserRole: 'CHECKER',
      comments: remarks || `Approved by checker under Workflow Policy Version ${evaluation.workflowVersion}. Lock hash: ${lockHash}`,
      timestamp: now,
    });

    await this.recordAuditLog({
      actionType: 'PAYROLL_APPROVED_BY_CHECKER',
      entityType: 'PAYROLL_RUN',
      entityId: runId,
      referenceNumber: run.runNumber,
      performedBy: checker.userName,
      detailsJson: JSON.stringify({ remarks, lockHash }),
    });

    return updated;
  }

  public async holdEmployeePayslip(
    payslipId: string,
    actor: { userId: string; userName: string; role?: string },
    reason: string
  ): Promise<any> {
    await this.ensureHrmsTablesExist();
    const now = new Date().toISOString();

    const [slip] = await db.select().from(phase70PaySlips).where(eq(phase70PaySlips.id, payslipId)).limit(1);
    if (!slip) throw new Error(`Payslip ${payslipId} not found`);

    const [updated] = await db.update(phase70PaySlips).set({
      isHold: true,
      holdReason: reason || 'Placed on HOLD pending verification',
      heldBy: actor.userName,
      heldAt: now,
      paymentStatus: 'ON_HOLD',
      updatedAt: now,
    }).where(eq(phase70PaySlips.id, payslipId)).returning();

    await this.recordAuditLog({
      actionType: 'PAYSLIP_PLACED_ON_HOLD',
      entityType: 'PAYSLIP',
      entityId: payslipId,
      referenceNumber: slip.slipNumber,
      performedBy: actor.userName,
      detailsJson: JSON.stringify({
        employeeId: slip.employeeId,
        employeeCode: slip.employeeCode,
        employeeName: slip.employeeName,
        netSalary: slip.netSalaryAed,
        reason,
      }),
    });

    return updated;
  }

  public async unholdEmployeePayslip(
    payslipId: string,
    actor: { userId: string; userName: string; role?: string },
    reason?: string
  ): Promise<any> {
    await this.ensureHrmsTablesExist();
    const now = new Date().toISOString();

    const [slip] = await db.select().from(phase70PaySlips).where(eq(phase70PaySlips.id, payslipId)).limit(1);
    if (!slip) throw new Error(`Payslip ${payslipId} not found`);

    const [updated] = await db.update(phase70PaySlips).set({
      isHold: false,
      unheldReason: reason || 'Hold released by Payroll Officer',
      paymentStatus: 'APPROVED',
      updatedAt: now,
    }).where(eq(phase70PaySlips.id, payslipId)).returning();

    await this.recordAuditLog({
      actionType: 'PAYSLIP_HOLD_RELEASED',
      entityType: 'PAYSLIP',
      entityId: payslipId,
      referenceNumber: slip.slipNumber,
      performedBy: actor.userName,
      detailsJson: JSON.stringify({
        employeeId: slip.employeeId,
        employeeCode: slip.employeeCode,
        employeeName: slip.employeeName,
        releaseReason: reason,
      }),
    });

    return updated;
  }

  public async disbursePayrollRun(
    runId: string,
    actor: { userId: string; userName: string },
    neftBatchReference?: string
  ): Promise<any> {
    await this.ensureHrmsTablesExist();

    if (!actor?.userId?.trim() || !actor?.userName?.trim()) {
      throw new Error('Authenticated payroll disburser identity is required.');
    }

    const runRows = await db.select().from(hrPayrollRuns).where(eq(hrPayrollRuns.id, runId)).limit(1);
    if (runRows.length === 0) throw new Error(`Payroll run ${runId} not found`);
    const run = runRows[0];
    if (run.status !== 'APPROVED') throw new Error(`Payroll run ${run.runNumber} must be APPROVED before disbursement. Current status: ${run.status}`);
    if (run.isLocked) throw new Error(`Payroll run ${run.runNumber} is already locked.`);

    const providedReference = String(neftBatchReference || '').trim();
    const neftRef = providedReference || (isDemoSeedAllowed() ? `DEMO-NEFT-${Date.now()}` : '');
    if (!neftRef) throw new Error('Actual bank/NEFT batch reference is required for payroll disbursement outside DEMO mode.');

    const payslips = await db.select().from(phase70PaySlips).where(eq(phase70PaySlips.payrollRunId, runId));
    if (payslips.length === 0) throw new Error(`Payroll run ${run.runNumber} contains no payslips.`);

    const eligiblePayslips = payslips.filter((p: any) => !p.isHold && p.paymentStatus !== 'ON_HOLD');
    const heldPayslips = payslips.filter((p: any) => p.isHold || p.paymentStatus === 'ON_HOLD');
    if (eligiblePayslips.length === 0) throw new Error('Cannot disburse payroll run: all payslips are currently on hold.');

    const isFullDisbursement = heldPayslips.length === 0;
    const finalRunStatus = isFullDisbursement ? 'DISBURSED' : 'PARTIALLY_DISBURSED';
    const lockHash = run.lockHash || statutoryEngineService.generateLockHash(runId, run.payrollMonth, payslips);
    const disbursedTotal = eligiblePayslips.reduce((sum: number, p: any) => sum + Number(p.netSalaryAed || 0), 0);
    const heldTotal = heldPayslips.reduce((sum: number, p: any) => sum + Number(p.netSalaryAed || 0), 0);
    if (disbursedTotal <= 0) throw new Error('Disbursement amount must be greater than zero.');

    const totalGross = eligiblePayslips.reduce((sum: number, p: any) => sum + Number(p.grossSalaryAed || p.netSalaryAed || 0), 0);
    const totalDeductions = Math.max(0, totalGross - disbursedTotal);
    const journalLines: any[] = [
      { accountCode: '5030', accountName: 'Direct Site Labor & Wages', debitAmount: totalGross, creditAmount: 0, lineDescription: `Payroll disbursement gross labor for run ${run.runNumber}` },
      { accountCode: '1010', accountName: 'Cash & Bank Operating', debitAmount: 0, creditAmount: disbursedTotal, lineDescription: `Net salary transfer via bank batch ${neftRef}` },
    ];
    if (totalDeductions > 0) journalLines.push({
      accountCode: '2030', accountName: 'Statutory Taxes & Social Security Payable', debitAmount: 0, creditAmount: totalDeductions,
      lineDescription: `Statutory deductions withheld on run ${run.runNumber}`,
    });

    const now = new Date().toISOString();
    const updated = await db.transaction(async (tx) => {
      const currentRows = await tx.select().from(hrPayrollRuns).where(eq(hrPayrollRuns.id, runId)).limit(1);
      if (!currentRows.length) throw new Error(`Payroll run ${runId} disappeared during disbursement.`);
      if (currentRows[0].status !== 'APPROVED') throw new Error(`Payroll run ${run.runNumber} changed state during disbursement.`);

      const duplicateRef = await tx.execute(sql`
        SELECT COUNT(*)::int AS count FROM hr_payroll_runs
        WHERE neft_batch_reference = ${neftRef} AND id <> ${runId} AND neft_batch_reference IS NOT NULL
      `);
      if (Number((duplicateRef.rows?.[0] as any)?.count || 0) > 0) throw new Error(`Duplicate payroll payment reference '${neftRef}'.`);

      await financeRepository.createJournalEntry({
        voucherType: 'PAYROLL_JOURNAL',
        postingDate: new Date().toISOString().split('T')[0],
        referenceNumber: `${run.runNumber}:${neftRef}`,
        narration: `Payroll disbursement journal for ${run.payrollMonth} (${neftRef})`,
        postedBy: actor.userName,
        createdBy: actor.userName,
      }, journalLines, tx);

      const [updatedRun] = await tx.update(hrPayrollRuns).set({
        status: finalRunStatus,
        isLocked: isFullDisbursement,
        lockHash,
        disbursedAt: now,
        neftBatchReference: neftRef,
        updatedAt: now,
      }).where(eq(hrPayrollRuns.id, runId)).returning();
      if (!updatedRun) throw new Error('Payroll run update failed after finance posting.');

      for (const payslip of eligiblePayslips) {
        await tx.update(phase70PaySlips).set({
          paymentStatus: 'PAID',
          paymentReference: neftRef,
          disbursementDate: now.split('T')[0],
          updatedAt: now,
        }).where(eq(phase70PaySlips.id, payslip.id));
      }

      await this.recordAuditLog({
        actionType: isFullDisbursement ? 'PAYROLL_DISBURSED_AND_LOCKED' : 'PAYROLL_PARTIALLY_DISBURSED',
        entityType: 'PAYROLL_RUN',
        entityId: runId,
        referenceNumber: run.runNumber,
        performedBy: actor.userName,
        detailsJson: JSON.stringify({
          neftBatchReference: neftRef, lockHash, disbursedEmployeeCount: eligiblePayslips.length,
          disbursedTotalAmount: disbursedTotal, heldEmployeeCount: heldPayslips.length, heldTotalAmount: heldTotal, status: finalRunStatus,
        }),
      }, tx);

      return updatedRun;
    });

    return {
      ...updated,
      disbursedEmployeeCount: eligiblePayslips.length,
      disbursedTotalAmount: disbursedTotal,
      heldEmployeeCount: heldPayslips.length,
      heldTotalAmount: heldTotal,
    };
  }
  // 8.5 Attendance Finalization System
  public async getAttendanceFinalizations(periodId?: string, monthYear?: string): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    try {
      let query = sql`SELECT * FROM hr_attendance_finalizations`;
      if (periodId && monthYear) {
        query = sql`SELECT * FROM hr_attendance_finalizations WHERE period_id = ${periodId} OR month_year = ${monthYear} ORDER BY employee_code ASC`;
      } else if (periodId) {
        query = sql`SELECT * FROM hr_attendance_finalizations WHERE period_id = ${periodId} ORDER BY employee_code ASC`;
      } else if (monthYear) {
        query = sql`SELECT * FROM hr_attendance_finalizations WHERE month_year = ${monthYear} ORDER BY employee_code ASC`;
      } else {
        query = sql`SELECT * FROM hr_attendance_finalizations ORDER BY created_at DESC LIMIT 100`;
      }
      const res = await db.execute(query);
      const rows = res?.rows || [];

      // Synthetic attendance finalization is DEMO-only.
      if (rows.length === 0 && isDemoSeedAllowed() && (monthYear === '2026-08' || periodId === 'pp-2026-08' || !monthYear)) {
        return this.seedDefaultAttendanceFinalization('pp-2026-08', '2026-08');
      }

      return rows as any[];
    } catch (e) {
      console.warn('Attendance finalizations fetch error:', e);
      return [];
    }
  }

  private async seedDefaultAttendanceFinalization(periodId: string, monthYear: string): Promise<any[]> {
    const employees = await this.getEmployees();
    const now = new Date().toISOString();
    const records = [];

    for (const emp of employees) {
      const id = `fin-${periodId}-${emp.id}`;
      const isSite = emp.id === 'emp-002' || emp.id === 'emp-003';
      const presentDays = isSite ? 22 : 24;
      const halfDays = isSite ? 2 : 0;
      const paidLeaves = 2;
      const weeklyOffs = 4;
      const holidays = 1;
      const payableDutyDays = presentDays + paidLeaves + (halfDays * 0.5) + weeklyOffs + holidays;
      const otHours = emp.id === 'emp-002' ? 12 : emp.id === 'emp-003' ? 8 : 0;
      const lockHash = statutoryEngineService.generateLockHash(`att-${periodId}`, monthYear, [{ empId: emp.id, payableDutyDays, otHours }]);

      try {
        await db.execute(sql`
          INSERT INTO hr_attendance_finalizations (
            id, period_id, month_year, employee_id, employee_code, employee_name, department,
            wage_type, daily_wage_rate, hourly_wage_rate, total_days_in_month, present_days, half_days,
            paid_leave_days, unpaid_leave_days, weekly_offs, holidays, payable_duty_days, absent_days,
            overtime_hours, total_duty_hours, status, finalized_by, finalized_at, lock_hash, remarks,
            created_at, updated_at
          ) VALUES (
            ${id}, ${periodId}, ${monthYear}, ${emp.id}, ${emp.employeeCode || `EMP-${emp.id}`},
            ${`${emp.firstName || ''} ${emp.lastName || ''}`.trim()}, ${emp.departmentId || 'Engineering'},
            'MONTHLY', 0, 0, 31, ${presentDays}, ${halfDays}, ${paidLeaves}, 0, ${weeklyOffs}, ${holidays},
            ${payableDutyDays}, 0, ${otHours}, ${payableDutyDays * 8 + otHours}, 'FINALIZED',
            'HR Operations Lead', ${now}, ${lockHash}, 'Standard monthly biometric reconciliation approved',
            ${now}, ${now}
          ) ON CONFLICT (id) DO NOTHING
        `);
      } catch (err) {
        console.warn('Finalization seed notice:', err);
      }

      records.push({
        id,
        period_id: periodId,
        month_year: monthYear,
        employee_id: emp.id,
        employee_code: emp.employeeCode || `EMP-${emp.id}`,
        employee_name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        department: emp.departmentId,
        wage_type: 'MONTHLY',
        total_days_in_month: 31,
        present_days: presentDays,
        half_days: halfDays,
        paid_leave_days: paidLeaves,
        unpaid_leave_days: 0,
        weekly_offs: weeklyOffs,
        holidays: holidays,
        payable_duty_days: payableDutyDays,
        absent_days: 0,
        overtime_hours: otHours,
        total_duty_hours: payableDutyDays * 8 + otHours,
        status: 'FINALIZED',
        finalized_by: 'HR Operations Lead',
        finalized_at: now,
        lock_hash: lockHash,
        remarks: 'Standard monthly biometric reconciliation approved',
        created_at: now,
        updated_at: now,
      });
    }

    return records;
  }

  public async finalizeAttendanceForPeriod(data: {
    periodId: string;
    monthYear: string;
    finalizedBy?: string;
    records?: any[];
    remarks?: string;
  }): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    const now = new Date().toISOString();
    const periodId = String(data.periodId || '').trim();
    const monthYear = String(data.monthYear || '').trim();
    const finalizedBy = String(data.finalizedBy || '').trim();

    if (!periodId || !/^\d{4}-\d{2}$/.test(monthYear) || !finalizedBy) {
      throw new Error('Attendance period, valid YYYY-MM month and authenticated finalizer identity are required.');
    }

    const existingFinalized = await db.execute(sql`
      SELECT COUNT(*)::int AS count FROM hr_attendance_finalizations
      WHERE (period_id = ${periodId} OR month_year = ${monthYear}) AND status = 'FINALIZED'
    `);
    if (Number((existingFinalized.rows?.[0] as any)?.count || 0) > 0) {
      throw new Error(`Attendance period ${monthYear} is already finalized. Unlock it through the controlled revision workflow before re-finalizing.`);
    }

    let employeeSnapshots: any[] | undefined;
    if (isDemoSeedAllowed() && Array.isArray(data.records) && data.records.length > 0) {
      // DEMO compatibility only: supplied fixture snapshots are accepted in DEMO mode.
      employeeSnapshots = data.records;
    } else if (isDemoSeedAllowed() && (!data.records || data.records.length === 0)) {
      const employees = await this.getEmployees();
      employeeSnapshots = employees.map((emp) => ({
        employeeId: emp.id, employeeCode: emp.employeeCode, employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        department: emp.departmentId, wageType: emp.wageType || 'MONTHLY', dailyWageRate: Number(emp.dailyWageRate || 0), hourlyWageRate: Number(emp.hourlyWageRate || 0),
        totalDaysInMonth: 31, presentDays: 0, halfDays: 0, paidLeaveDays: 0, unpaidLeaveDays: 0, weeklyOffs: 0, holidays: 0, payableDutyDays: 0, absentDays: 0, overtimeHours: 0, totalDutyHours: 0,
        remarks: data.remarks || 'DEMO attendance finalization',
      }));
    } else {
      // PRODUCTION / UAT: derive the payroll snapshot exclusively from verified attendance and approved leave records.
      const employees = (await this.getEmployees()).filter((emp: any) => {
        const type = String(emp.employmentType || '').toUpperCase();
        const status = String(emp.employmentStatus || '').toUpperCase();
        const subcontract = ['SUBCONTRACT_LABOUR', 'SUBCONTRACTOR_WORKER', 'LABOUR_SUPPLIER', 'THIRD_PARTY_LABOUR'].includes(type);
        return !subcontract && !['TERMINATED', 'RESIGNED', 'INACTIVE'].includes(status);
      });

      const verifiedRows = await db.select().from(phase70Attendance).where(sql`${phase70Attendance.attendanceDate} LIKE ${monthYear + '-%'}`);
      const monthRows = verifiedRows.filter((row: any) => row.isVerified === true && String(row.status || '').toUpperCase() !== 'REJECTED');
      const approvedLeaves = await db.select().from(phase70LeaveRequests).where(and(eq(phase70LeaveRequests.status, 'APPROVED'), eq(phase70LeaveRequests.isDeleted, false)));

      const year = Number(monthYear.slice(0, 4));
      const monthIndex = Number(monthYear.slice(5, 7)) - 1;
      const totalDaysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
      const monthStart = new Date(Date.UTC(year, monthIndex, 1));
      const monthEndExclusive = new Date(Date.UTC(year, monthIndex + 1, 1));

      const overlapDays = (startDate: string, endDate: string): number => {
        const start = new Date(`${startDate}T00:00:00Z`);
        const end = new Date(`${endDate}T00:00:00Z`);
        const from = new Date(Math.max(start.getTime(), monthStart.getTime()));
        const to = new Date(Math.min(end.getTime(), monthEndExclusive.getTime() - 86400000));
        if (to < from) return 0;
        return Math.floor((to.getTime() - from.getTime()) / 86400000) + 1;
      };

      employeeSnapshots = [];
      const missing: string[] = [];

      for (const emp of employees as any[]) {
        const rows = monthRows.filter((row: any) => row.employeeId === emp.id);
        const byDate = new Map<string, any[]>();
        for (const row of rows) {
          const key = String(row.attendanceDate);
          const list = byDate.get(key) || [];
          list.push(row);
          byDate.set(key, list);
        }

        let presentDays = 0;
        let halfDays = 0;
        let absentDays = 0;
        let weeklyOffs = 0;
        let holidays = 0;
        let overtimeHours = 0;
        let totalDutyHours = 0;

        for (const dayRows of byDate.values()) {
          const row = dayRows.sort((a, b) => Number(b.totalHours || 0) - Number(a.totalHours || 0))[0];
          const status = String(row.status || '').toUpperCase();
          if (status === 'HALF_DAY' || status === 'HALFDAY') halfDays += 1;
          else if (status === 'ABSENT') absentDays += 1;
          else if (status === 'WEEK_OFF' || status === 'WEEKLY_OFF') weeklyOffs += 1;
          else if (status === 'HOLIDAY') holidays += 1;
          else if (status === 'PRESENT' || status === 'VERIFIED' || status === 'WORKED') presentDays += 1;

          overtimeHours += Number(dayRows.reduce((sum, item) => sum + Number(item.overtimeHours || 0), 0));
          totalDutyHours += Number(dayRows.reduce((sum, item) => sum + Number(item.totalHours || 0), 0));
        }

        const paidLeaveDays = approvedLeaves
          .filter((leave: any) => leave.employeeId === emp.id)
          .reduce((sum: number, leave: any) => sum + overlapDays(String(leave.startDate), String(leave.endDate)), 0);

        const verifiedCoverage = presentDays + halfDays + absentDays + weeklyOffs + holidays;
        if (verifiedCoverage === 0 && paidLeaveDays === 0) {
          missing.push(emp.employeeCode || emp.id);
          continue;
        }

        const payableDutyDays = presentDays + (halfDays * 0.5) + paidLeaveDays + weeklyOffs + holidays;
        employeeSnapshots.push({
          employeeId: emp.id,
          employeeCode: emp.employeeCode,
          employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
          department: emp.departmentId,
          wageType: emp.wageType || ((String(emp.employmentType || '').toUpperCase() === 'DAILY_WAGE') ? 'DAILY_WAGE' : 'MONTHLY'),
          dailyWageRate: Number(emp.dailyWageRate || 0),
          hourlyWageRate: Number(emp.hourlyWageRate || 0),
          totalDaysInMonth,
          presentDays,
          halfDays,
          paidLeaveDays,
          unpaidLeaveDays: absentDays,
          weeklyOffs,
          holidays,
          payableDutyDays,
          absentDays,
          overtimeHours: Number(overtimeHours.toFixed(2)),
          totalDutyHours: Number(totalDutyHours.toFixed(2)),
          remarks: data.remarks || 'Server-derived from verified attendance and approved leave records',
        });
      }

      if (missing.length > 0) {
        throw new Error(`Attendance finalization blocked. No verified attendance/approved leave coverage exists for employee(s): ${missing.slice(0, 20).join(', ')}`);
      }
      if (employeeSnapshots.length === 0) throw new Error('No eligible employee attendance records are available for finalization.');
    }

    const savedRecords: any[] = [];
    await db.transaction(async (tx) => {
      for (const rec of employeeSnapshots || []) {
        const employeeId = String(rec.employeeId || '').trim();
        if (!employeeId) throw new Error('Finalization snapshot contains an employee without a valid employeeId.');

        const id = `fin-${periodId}-${employeeId}`;
        const payableDutyDays = Number(rec.payableDutyDays || 0);
        const overtimeHours = Number(rec.overtimeHours || 0);
        const totalDutyHours = Number(rec.totalDutyHours || 0);
        if (!Number.isFinite(payableDutyDays) || payableDutyDays < 0 || !Number.isFinite(overtimeHours) || overtimeHours < 0 || !Number.isFinite(totalDutyHours) || totalDutyHours < 0) {
          throw new Error(`Invalid finalized attendance values for employee ${employeeId}.`);
        }

        const lockHash = statutoryEngineService.generateLockHash(`att-${periodId}`, monthYear, [rec]);
        await tx.execute(sql`
          INSERT INTO hr_attendance_finalizations (
            id, period_id, month_year, employee_id, employee_code, employee_name, department, wage_type, daily_wage_rate, hourly_wage_rate,
            total_days_in_month, present_days, half_days, paid_leave_days, unpaid_leave_days, weekly_offs, holidays, payable_duty_days, absent_days,
            overtime_hours, total_duty_hours, status, finalized_by, finalized_at, lock_hash, remarks, created_at, updated_at
          ) VALUES (
            ${id}, ${periodId}, ${monthYear}, ${employeeId}, ${rec.employeeCode}, ${rec.employeeName}, ${rec.department || null}, ${rec.wageType || 'MONTHLY'},
            ${Number(rec.dailyWageRate || 0)}, ${Number(rec.hourlyWageRate || 0)}, ${Number(rec.totalDaysInMonth || 0)}, ${Number(rec.presentDays || 0)},
            ${Number(rec.halfDays || 0)}, ${Number(rec.paidLeaveDays || 0)}, ${Number(rec.unpaidLeaveDays || 0)}, ${Number(rec.weeklyOffs || 0)}, ${Number(rec.holidays || 0)},
            ${payableDutyDays}, ${Number(rec.absentDays || 0)}, ${overtimeHours}, ${totalDutyHours}, 'FINALIZED', ${finalizedBy}, ${now}, ${lockHash},
            ${String(rec.remarks || data.remarks || 'Finalized attendance locked for payroll')}, ${now}, ${now}
          ) ON CONFLICT (id) DO UPDATE SET
            present_days = EXCLUDED.present_days, half_days = EXCLUDED.half_days, paid_leave_days = EXCLUDED.paid_leave_days,
            unpaid_leave_days = EXCLUDED.unpaid_leave_days, weekly_offs = EXCLUDED.weekly_offs, holidays = EXCLUDED.holidays,
            payable_duty_days = EXCLUDED.payable_duty_days, absent_days = EXCLUDED.absent_days, overtime_hours = EXCLUDED.overtime_hours,
            total_duty_hours = EXCLUDED.total_duty_hours, status = 'FINALIZED', finalized_by = EXCLUDED.finalized_by, finalized_at = EXCLUDED.finalized_at,
            lock_hash = EXCLUDED.lock_hash, remarks = EXCLUDED.remarks, updated_at = EXCLUDED.updated_at
        `);

        savedRecords.push({
          id, period_id: periodId, month_year: monthYear, employee_id: employeeId, employee_code: rec.employeeCode, employee_name: rec.employeeName,
          department: rec.department, wage_type: rec.wageType || 'MONTHLY', daily_wage_rate: Number(rec.dailyWageRate || 0), hourly_wage_rate: Number(rec.hourlyWageRate || 0),
          total_days_in_month: Number(rec.totalDaysInMonth || 0), present_days: Number(rec.presentDays || 0), half_days: Number(rec.halfDays || 0),
          paid_leave_days: Number(rec.paidLeaveDays || 0), unpaid_leave_days: Number(rec.unpaidLeaveDays || 0), weekly_offs: Number(rec.weeklyOffs || 0),
          holidays: Number(rec.holidays || 0), payable_duty_days: payableDutyDays, absent_days: Number(rec.absentDays || 0), overtime_hours: overtimeHours,
          total_duty_hours: totalDutyHours, status: 'FINALIZED', finalized_by: finalizedBy, finalized_at: now, lock_hash: lockHash, remarks: rec.remarks || data.remarks || '',
        });
      }

      await this.recordAuditLog({
        actionType: 'ATTENDANCE_FINALIZED_AND_LOCKED',
        entityType: 'ATTENDANCE_PERIOD',
        entityId: periodId,
        referenceNumber: `ATT-FIN-${monthYear}`,
        performedBy: finalizedBy,
        detailsJson: JSON.stringify({ monthYear, employeeCount: savedRecords.length, source: isDemoSeedAllowed() && Array.isArray(data.records) && data.records.length ? 'DEMO_SNAPSHOT' : 'SERVER_VERIFIED_ATTENDANCE', status: 'FINALIZED' }),
      }, tx);
    });

    return savedRecords;
  }
  public async unlockAttendanceFinalization(periodId: string, actor: { userId: string; userName: string }, reason: string): Promise<any> {
    await this.ensureHrmsTablesExist();
    const now = new Date().toISOString();

    await db.execute(sql`
      UPDATE hr_attendance_finalizations
      SET status = 'UNLOCKED_FOR_REVISION', updated_at = ${now}, remarks = ${`Unlocked by ${actor.userName}: ${reason}`}
      WHERE period_id = ${periodId}
    `);

    await this.recordAuditLog({
      actionType: 'ATTENDANCE_FINALIZATION_UNLOCKED',
      entityType: 'ATTENDANCE_PERIOD',
      entityId: periodId,
      referenceNumber: `ATT-UNLOCK-${periodId}`,
      performedBy: actor.userName,
      detailsJson: JSON.stringify({ reason, actor }),
    });

    return { success: true, message: `Attendance for period ${periodId} unlocked for correction.` };
  }

  // 9. Loans & Advances
  public async getLoans(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    const loans = await db.select().from(phase70Loans).where(eq(phase70Loans.isDeleted, false));
    if (loans.length === 0 && isDemoSeedAllowed()) {      // Seed default initial loan for demo and verification
      const now = new Date().toISOString();
      const initialLoans = [
        {
          id: 'loan-001',
          loanCode: 'LOAN-2026-001',
          employeeId: 'emp-002',
          employeeCode: 'EMP-2026-0102',
          employeeName: 'Elena Rostova',
          loanType: 'EQUIPMENT_ADVANCE',
          principalAmountAed: 60000,
          requestedAmountAed: 60000,
          openingBalanceAed: 60000,
          interestRate: 0,
          totalRepayableAed: 60000,
          monthlyEmiAed: 22000,
          balanceOutstandingAed: 60000,
          totalRecoveredAed: 0,
          repaymentMethod: 'PER_DUTY_DAY',
          repaymentRate: 1000,
          repaymentFrequency: 'PER_DUTY_DAY',
          tenureMonths: 3,
          purpose: 'High-precision Site Surveying Kit & GNSS Station equipment purchase',
          disbursementDate: '2026-08-01',
          status: 'ACTIVE',
          approvedBy: 'Finance Director (Fatima Al-Zahra)',
          approvedAt: '2026-08-01T10:00:00Z',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'loan-002',
          loanCode: 'LOAN-2026-002',
          employeeId: 'emp-005',
          employeeCode: 'EMP-2026-0105',
          employeeName: 'Marcus Vance',
          loanType: 'PERSONAL_EMERGENCY',
          principalAmountAed: 24000,
          requestedAmountAed: 24000,
          openingBalanceAed: 24000,
          interestRate: 0,
          totalRepayableAed: 24000,
          monthlyEmiAed: 2000,
          balanceOutstandingAed: 18000,
          totalRecoveredAed: 6000,
          repaymentMethod: 'MONTHLY',
          repaymentRate: 2000,
          repaymentFrequency: 'MONTHLY',
          tenureMonths: 12,
          purpose: 'Family Medical Relocation Support',
          disbursementDate: '2026-05-15',
          status: 'ACTIVE',
          approvedBy: 'HR Director (Zayd Al-Hashemi)',
          approvedAt: '2026-05-15T14:30:00Z',
          createdAt: now,
          updatedAt: now,
        },
      ];
      for (const l of initialLoans) {
        await db.insert(phase70Loans).values(l).onConflictDoNothing();
      }
      return initialLoans;
    }
    return loans;
  }

  public async createLoan(data: any, actor: { userId: string; userName: string }): Promise<any> {
    await this.ensureHrmsTablesExist();

    const actorId = String(actor?.userId || '').trim();
    const actorName = String(actor?.userName || '').trim();
    const employeeId = String(data?.employeeId || '').trim();
    const principal = Number(data?.principalAmountAed);
    const tenureMonths = Number(data?.tenureMonths);
    const interestRate = Number(data?.interestRate || 0);
    const repaymentMethod = String(data?.repaymentMethod || '').trim();
    const repaymentFrequency = String(data?.repaymentFrequency || repaymentMethod).trim();
    const repaymentRateInput = data?.repaymentRate;
    if (!actorId || !actorName) throw new Error('Authenticated loan requester identity is required.');
    if (!employeeId) throw new Error('Loan beneficiary employee is required.');

    const [employee] = await db.select().from(phase70EmployeeMaster)
      .where(and(eq(phase70EmployeeMaster.id, employeeId), eq(phase70EmployeeMaster.isDeleted, false)))
      .limit(1);
    if (!employee) throw new Error('Loan beneficiary must be an active employee in the employee master.');
    if (!isDemoSeedAllowed() && !data?.companyId) throw new Error('Company context is required for employee loan requests outside DEMO mode.');

    if (!Number.isFinite(principal) || principal <= 0) throw new Error('Loan principal must be greater than zero.');
    if (!Number.isFinite(tenureMonths) || tenureMonths <= 0) throw new Error('Loan tenure must be greater than zero.');
    if (!Number.isFinite(interestRate) || interestRate < 0) throw new Error('Interest rate must be a valid non-negative number.');
    if (!repaymentMethod) throw new Error('Repayment method is required.');

    const interest = (principal * interestRate) / 100;
    const totalRepayable = principal + interest;
    const emi = parseFloat((totalRepayable / tenureMonths).toFixed(2));
    const repaymentRate = repaymentRateInput == null ? emi : Number(repaymentRateInput);
    if (!Number.isFinite(repaymentRate) || repaymentRate <= 0) throw new Error('Repayment rate must be greater than zero.');

    const policy = await workflowPolicyEngine.getWorkflowConfig('LOAN');
    const initialStatus = policy.approvalRequired ? 'PENDING' : 'ACTIVE';
    const loanCode = String(data?.loanCode || '').trim() || await numberingService.generateLoanNumber({
      companyId: data?.companyId || null,
      branchId: data?.branchId || null,
      date: data?.requestDate || new Date().toISOString(),
      allocatedBy: actorName,
    });
    const [duplicate] = await db.select({ id: phase70Loans.id }).from(phase70Loans).where(eq(phase70Loans.loanCode, loanCode)).limit(1);
    if (duplicate) throw new Error(`Loan number ${loanCode} already exists.`);

    const id = uuidv4();
    const now = new Date().toISOString();
    const [loan] = await db.insert(phase70Loans).values({
      id, loanCode, employeeId: employee.id, employeeCode: employee.employeeCode, employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
      loanType: data.loanType, principalAmountAed: principal, requestedAmountAed: principal, openingBalanceAed: totalRepayable, interestRate,
      totalRepayableAed: totalRepayable, monthlyEmiAed: emi, balanceOutstandingAed: totalRepayable, totalRecoveredAed: 0,
      repaymentMethod, repaymentRate, repaymentFrequency, tenureMonths, purpose: String(data.purpose || '').trim(), disbursementDate: data.disbursementDate || null,
      status: initialStatus, createdAt: now, updatedAt: now, createdBy: actorName, updatedBy: actorName,
    }).returning();
    if (!loan) throw new Error('Loan request creation failed.');

    await db.insert(workflowHistory).values({
      id: `hist-loan-${Date.now()}-${uuidv4().slice(0, 6)}`, workflowCode: policy.workflowCode, entityType: 'LOAN', entityId: id,
      fromState: 'DRAFT', toState: initialStatus, actionTaken: 'SUBMIT', performedByUserId: actorId, performedByUserName: actorName,
      performedByUserRole: String(actor?.role || 'EMPLOYEE'), comments: `Loan request created under Workflow Policy Version ${policy.version}.`, timestamp: now,
    });

    await this.recordAuditLog({
      actionType: 'LOAN_REQUEST_CREATED', entityType: 'LOAN', entityId: id, referenceNumber: loanCode, performedBy: actorName,
      detailsJson: JSON.stringify({ actorId, employeeId: employee.id, principal, repaymentMethod, repaymentRate, repaymentFrequency, totalRepayable, status: initialStatus }),
    });
    return loan;
  }
  public async approveLoan(loanId: string, actor: { userId: string; userName: string; role?: string }, remarks?: string): Promise<any> {
    await this.ensureHrmsTablesExist();
    const now = new Date().toISOString();

    const [existingLoan] = await db.select().from(phase70Loans).where(eq(phase70Loans.id, loanId)).limit(1);
    if (!existingLoan) throw new Error(`Loan request with ID ${loanId} not found.`);

    // 1. Evaluate Dynamic Workflow Governance Policy & Separation of Duties
    const evaluation = await workflowPolicyEngine.evaluateEligibility({
      user: actor,
      entityType: 'LOAN',
      action: 'APPROVE',
      instance: existingLoan,
    });

    if (!evaluation.isEligible) {
      throw new Error(`Workflow Governance Restriction: ${evaluation.reason}`);
    }

    const [loan] = await db.update(phase70Loans).set({
      status: 'ACTIVE',
      approvedBy: actor.userName,
      updatedAt: now,
    }).where(eq(phase70Loans.id, loanId)).returning();

    // Log Workflow History Audit
    await db.insert(workflowHistory).values({
      id: `hist-loan-appr-${Date.now()}`,
      workflowCode: evaluation.workflowCode,
      entityType: 'LOAN',
      entityId: loanId,
      fromState: existingLoan.status,
      toState: 'ACTIVE',
      actionTaken: 'APPROVED',
      performedByUserId: actor.userId,
      performedByUserName: actor.userName,
      performedByUserRole: actor.role || 'APPROVER',
      comments: remarks || `Approved under Workflow Policy Version ${evaluation.workflowVersion}.`,
      timestamp: now,
    });

    await this.recordAuditLog({
      actionType: 'LOAN_APPROVED',
      entityType: 'LOAN',
      entityId: loanId,
      referenceNumber: loan?.loanCode || loanId,
      performedBy: actor.userName,
      detailsJson: JSON.stringify({ remarks, status: 'ACTIVE', policyVersion: evaluation.workflowVersion }),
    });

    return loan;
  }

  public async getLoanRecoveries(loanId?: string, employeeId?: string, periodId?: string): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    try {
      let query = sql`SELECT * FROM hr_loan_recoveries ORDER BY timestamp DESC`;
      if (loanId) {
        query = sql`SELECT * FROM hr_loan_recoveries WHERE loan_id = ${loanId} ORDER BY timestamp DESC`;
      } else if (employeeId) {
        query = sql`SELECT * FROM hr_loan_recoveries WHERE employee_id = ${employeeId} ORDER BY timestamp DESC`;
      } else if (periodId) {
        query = sql`SELECT * FROM hr_loan_recoveries WHERE period_id = ${periodId} ORDER BY timestamp DESC`;
      }
      const res = await db.execute(query);
      return res?.rows || [];
    } catch (e) {
      console.warn('Loan recoveries query error:', e);
      return [];
    }
  }

  public async simulateLoanRecovery(employeeId: string, payableDutyDays: number, grossSalary: number): Promise<any> {
    await this.ensureHrmsTablesExist();
    const loans = await db.select().from(phase70Loans).where(and(
      eq(phase70Loans.employeeId, employeeId),
      eq(phase70Loans.isDeleted, false),
      eq(phase70Loans.status, 'ACTIVE')
    ));

    const simulations = loans.map((loan) => {
      const anyLoan = loan as any;
      let calculatedInstallment = 0;
      const method = anyLoan.repaymentMethod || 'PER_DUTY_DAY';
      if (method === 'PER_DUTY_DAY' || method === 'PER_DAY' || method === 'PER_WORKING_DAY') {
        const rate = Number(anyLoan.repaymentRate);
        if (!Number.isFinite(rate) || rate < 0) throw new Error(`Loan repayment rate is not configured for ${anyLoan.loanCode || anyLoan.id}.`);
        calculatedInstallment = payableDutyDays * rate;
      } else if (method === 'PERCENTAGE_OF_SALARY') {
        const percentage = Number(anyLoan.repaymentRate);
        if (!Number.isFinite(grossSalary) || grossSalary < 0 || !Number.isFinite(percentage) || percentage < 0) throw new Error(`Salary basis / repayment percentage is not configured for ${anyLoan.loanCode || anyLoan.id}.`);
        calculatedInstallment = (grossSalary * percentage) / 100;
      } else {
        const monthlyEmi = Number(anyLoan.monthlyEmiAed);
        if (Number.isFinite(monthlyEmi) && monthlyEmi > 0) calculatedInstallment = monthlyEmi;
        else {
          const totalRepayable = Number(anyLoan.totalRepayableAed);
          const tenureMonths = Number(anyLoan.tenureMonths);
          if (!Number.isFinite(totalRepayable) || totalRepayable <= 0 || !Number.isFinite(tenureMonths) || tenureMonths <= 0) throw new Error(`Loan installment configuration is incomplete for ${anyLoan.loanCode || anyLoan.id}.`);
          calculatedInstallment = totalRepayable / tenureMonths;
        }
      }

      const openingBalance = anyLoan.outstandingBalanceAed ?? anyLoan.balanceOutstandingAed ?? 0;
      const actualDeduction = Math.min(calculatedInstallment, openingBalance);
      const closingBalance = Math.max(0, openingBalance - actualDeduction);
      const isFullyRepaid = closingBalance <= 0;

      return {
        loanId: loan.id,
        loanCode: loan.loanCode,
        repaymentMethod: method,
        repaymentRate: Number(anyLoan.repaymentRate),
        payableDutyDays,
        openingBalance,
        calculatedInstallment,
        actualDeduction,
        closingBalance,
        isFullyRepaid,
        ruleApplied: 'Recovery = MIN(Calculated Installment, Outstanding Balance)',
      };
    });

    const totalDeduction = simulations.reduce((sum, s) => sum + s.actualDeduction, 0);
    return {
      employeeId,
      payableDutyDays,
      grossSalary,
      simulations,
      totalLoanDeduction: totalDeduction,
    };
  }

  // 10. Performance Reviews & Appraisals
  public async getPerformanceReviews(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(phase70PerformanceReviews).where(eq(phase70PerformanceReviews.isDeleted, false)).orderBy(desc(phase70PerformanceReviews.createdAt));
  }

  public async createPerformanceReview(data: any): Promise<any> {
    await this.ensureHrmsTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const reviewCode = `REV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalScore = parseFloat(((data.selfRating + data.managerRating + data.committeeRating) / 3).toFixed(2));

    const [review] = await db.insert(phase70PerformanceReviews).values({
      id,
      reviewCode,
      ...data,
      finalScore,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return review;
  }

  // 11. Recruitment & Candidates
  public async getRecruitmentRequisitions(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(phase70Recruitment).where(eq(phase70Recruitment.isDeleted, false));
  }

  public async createRecruitmentRequisition(data: any): Promise<any> {
    await this.ensureHrmsTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const code = `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const [req] = await db.insert(phase70Recruitment).values({
      id,
      requisitionCode: code,
      ...data,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    }).returning();
    return req;
  }

  public async getCandidates(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(phase70Candidates).where(eq(phase70Candidates.isDeleted, false));
  }

  public async createCandidate(data: any): Promise<any> {
    await this.ensureHrmsTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const code = `CAN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const [cand] = await db.insert(phase70Candidates).values({
      id,
      candidateCode: code,
      ...data,
      status: 'SHORTLISTED',
      createdAt: now,
      updatedAt: now,
    }).returning();
    return cand;
  }

  // 12. Training Programs
  public async getTrainingPrograms(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(phase70TrainingPrograms).where(eq(phase70TrainingPrograms.isDeleted, false));
  }

  public async createTrainingProgram(data: any): Promise<any> {
    await this.ensureHrmsTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const code = `TRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const [trn] = await db.insert(phase70TrainingPrograms).values({
      id,
      programCode: code,
      ...data,
      status: 'SCHEDULED',
      createdAt: now,
      updatedAt: now,
    }).returning();
    return trn;
  }

  // 13. HRMS Analytics & Metric Aggregation
  public async getHrmsStats(): Promise<any> {
    await this.ensureHrmsTablesExist();
    const employees = await this.getEmployees();
    const departments = await this.getDepartments();
    const leaveApps = await this.getLeaveApplications();
    const payslips = await this.getPayslips();
    const recruitment = await this.getRecruitmentRequisitions();
    const loans = await this.getLoans();

    const activeEmployees = employees.filter((e) => e.employmentStatus === 'ACTIVE').length;
    const pendingLeaves = leaveApps.filter((l) => l.status === 'PENDING').length;
    const openVacancies = recruitment.reduce((acc, r) => acc + (r.vacanciesCount || 1), 0);
    const totalMonthlyPayrollAed = payslips.reduce((acc, p) => acc + (p.grossEarningsAed || 0), 0);
    const totalLoanDisbursedAed = loans.reduce((acc, l) => acc + (l.principalAmountAed || 0), 0);

    return {
      totalEmployees: employees.length,
      activeEmployees,
      departmentsCount: departments.length,
      pendingLeaveRequests: pendingLeaves,
      openJobVacancies: openVacancies,
      totalMonthlyPayrollAed,
      totalLoanDisbursedAed,
      attendanceRatePercent: 97.4,
      retentionRatePercent: 96.8,
    };
  }

  // 13. Audit Logging
  public async recordAuditLog(data: {
    actionType: string;
    entityType: string;
    entityId: string;
    referenceNumber: string;
    performedBy: string;
    detailsJson?: string;
  }, externalTx?: any): Promise<any> {
    const id = uuidv4();
    const now = new Date().toISOString();
    try {
      const tx = externalTx || db;
      const [log] = await tx.insert(phase70HrAuditLogs).values({
        id,
        actionType: data.actionType,
        entityType: data.entityType,
        entityId: data.entityId,
        referenceNumber: data.referenceNumber,
        performedBy: data.performedBy,
        detailsJson: data.detailsJson,
        timestamp: now,
        createdAt: now,
        updatedAt: now,
      }).returning();

      // Dual-write to Enterprise Audit Events SSoT
      await enterpriseAuditRepository.logEvent({
        userName: data.performedBy,
        actionType: data.actionType as any,
        entityType: data.entityType,
        entityId: data.entityId,
        entityNumber: data.referenceNumber,
        metadata: data.detailsJson ? JSON.parse(data.detailsJson) : undefined,
        reason: `HR audit log recorded for ${data.entityType} ${data.referenceNumber}`,
      }).catch(err => console.error('Failed to dual-write to enterprise audit events:', err));

      return log;
    } catch (e) {
      console.error('Failed to write HR audit log:', e);
      return null;
    }
  }

  public async getAuditLogs(): Promise<any[]> {
    await this.ensureHrmsTablesExist();
    return db.select().from(phase70HrAuditLogs).orderBy(desc(phase70HrAuditLogs.timestamp)).limit(100);
  }
}

export const hrmsRepository = new HrmsRepository();

