import {
  Employee,
  DailyAttendanceRecord,
  AttendanceCorrectionRequest,
  ESSLDevice,
  DailyDutyLog,
  LeaveBalance,
  LeaveRequest,
  PayrollRecord,
  LabourWorker,
  LabourAllocation,
  HRNotification,
} from '../../types/hr';
import { db } from '../../db';
import { eq, and, ilike, or, desc, sql } from 'drizzle-orm';
import { pgTable, text, boolean, integer, doublePrecision, jsonb } from 'drizzle-orm/pg-core';
import { auditRepository } from './audit.repository';
import { statutoryEngineService } from '../services/statutoryEngine.service';
import { currencyRepository } from './currency.repository';
import { phase70Loans } from '../../db/schema';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_ESSL_DEVICES,
  INITIAL_CORRECTION_REQUESTS,
  INITIAL_DUTY_LOGS,
  INITIAL_LEAVE_BALANCES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_LABOUR_WORKERS,
  INITIAL_LABOUR_ALLOCATIONS,
  INITIAL_HR_NOTIFICATIONS,
} from '../../data/hrMockData';

// ====================================================
// DRIZZLE TABLE DEFINITIONS FOR HR MODULE
// ====================================================

export const hrEmployeesTable = pgTable('hr_employees', {
  id: text('id').primaryKey(),
  employeeCode: text('employee_code').notNull(),
  photoUrl: text('photo_url'),
  fullName: text('full_name').notNull(),
  mobile: text('mobile'),
  email: text('email'),
  address: text('address'),
  emergencyContact: jsonb('emergency_contact'),
  dateOfBirth: text('date_of_birth'),
  joiningDate: text('joining_date'),
  department: text('department'),
  designation: text('designation'),
  branch: text('branch'),
  role: text('role'),
  reportingManager: text('reporting_manager'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  siteAssignment: text('site_assignment'),
  employmentType: text('employment_type'),
  salaryStructure: jsonb('salary_structure'),
  status: text('status'),
  documents: jsonb('documents'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const hrAttendanceTable = pgTable('hr_attendances', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  employeeCode: text('employee_code'),
  employeeName: text('employee_name'),
  department: text('department'),
  date: text('date').notNull(),
  checkIn: text('check_in'),
  checkOut: text('check_out'),
  shift: text('shift'),
  status: text('status'),
  lateMinutes: integer('late_minutes').default(0),
  earlyExitMinutes: integer('early_exit_minutes').default(0),
  overtimeHours: doublePrecision('overtime_hours').default(0),
  workingHours: doublePrecision('working_hours').default(8),
  locationPunchIn: text('location_punch_in'),
  locationPunchOut: text('location_punch_out'),
  esslDeviceId: text('essl_device_id'),
  isManualEntry: boolean('is_manual_entry').default(true),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const hrEsslDevicesTable = pgTable('hr_essl_devices', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  deviceName: text('device_name').notNull(),
  siteLocation: text('site_location'),
  ipAddress: text('ip_address'),
  port: integer('port'),
  status: text('status'),
  lastSyncTime: text('last_sync_time'),
  totalLogsToday: integer('total_logs_today').default(0),
  createdAt: text('created_at').notNull(),
});

export const hrAttendanceCorrectionsTable = pgTable('hr_attendance_corrections', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  employeeName: text('employee_name'),
  date: text('date'),
  originalCheckIn: text('original_check_in'),
  originalCheckOut: text('original_check_out'),
  requestedCheckIn: text('requested_check_in'),
  requestedCheckOut: text('requested_check_out'),
  reason: text('reason'),
  status: text('status'),
  appliedOn: text('applied_on'),
  reviewedBy: text('reviewed_by'),
  reviewRemarks: text('review_remarks'),
  createdAt: text('created_at').notNull(),
});

export const hrDutyLogsTable = pgTable('hr_duty_logs', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  employeeName: text('employee_name'),
  date: text('date').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  siteName: text('site_name'),
  workDescription: text('work_description'),
  workingHours: doublePrecision('working_hours').default(8),
  equipmentUsed: jsonb('equipment_used'),
  vehicleUsed: jsonb('vehicle_used'),
  materialsUsed: jsonb('materials_used'),
  remarks: text('remarks'),
  photoUrl: text('photo_url'),
  verifiedBy: text('verified_by'),
  approvedBy: text('approved_by'),
  status: text('status'),
  createdAt: text('created_at').notNull(),
});

export const hrLeaveRequestsTable = pgTable('hr_leave_requests', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  employeeName: text('employee_name'),
  leaveCategory: text('leave_category').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalDays: doublePrecision('total_days').notNull(),
  reason: text('reason'),
  status: text('status').notNull(),
  appliedOn: text('applied_on').notNull(),
  approvedBy: text('approved_by'),
  managerRemarks: text('manager_remarks'),
  createdAt: text('created_at').notNull(),
});

export const hrLeaveBalancesTable = pgTable('hr_leave_balances', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id'),
  balances: jsonb('balances').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const hrPayrollsTable = pgTable('hr_payrolls', {
  id: text('id').primaryKey(),
  payrollMonth: text('payroll_month').notNull(),
  employeeId: text('employee_id').notNull(),
  employeeCode: text('employee_code'),
  employeeName: text('employee_name'),
  designation: text('designation'),
  department: text('department'),
  bankAccount: text('bank_account'),
  bankName: text('bank_name'),
  daysInMonth: integer('days_in_month'),
  daysWorked: integer('days_worked'),
  paidLeaves: integer('paid_leaves'),
  unpaidLeaves: integer('unpaid_leaves'),
  overtimeHours: doublePrecision('overtime_hours'),
  basicEarnedUSD: doublePrecision('basic_earned_usd'),
  hraEarnedUSD: doublePrecision('hra_earned_usd'),
  daEarnedUSD: doublePrecision('da_earned_usd'),
  allowancesUSD: doublePrecision('allowances_usd'),
  overtimePayUSD: doublePrecision('overtime_pay_usd'),
  bonusUSD: doublePrecision('bonus_usd'),
  grossSalaryUSD: doublePrecision('gross_salary_usd'),
  pfDeductionUSD: doublePrecision('pf_deduction_usd'),
  esiDeductionUSD: doublePrecision('esi_deduction_usd'),
  taxTdsUSD: doublePrecision('tax_tds_usd'),
  otherDeductionsUSD: doublePrecision('other_deductions_usd'),
  totalDeductionsUSD: doublePrecision('total_deductions_usd'),
  netSalaryUSD: doublePrecision('net_salary_usd'),
  paymentStatus: text('payment_status').notNull(),
  paymentDate: text('payment_date'),
  utrReference: text('utr_reference'),
  createdAt: text('created_at').notNull(),
});

export const hrLabourWorkersTable = pgTable('hr_labour_workers', {
  id: text('id').primaryKey(),
  workerCode: text('worker_code').notNull(),
  fullName: text('full_name').notNull(),
  skillCategory: text('skill_category'),
  contractorName: text('contractor_name'),
  dailyWageRateUSD: doublePrecision('daily_wage_rate_usd'),
  overtimeHourlyRateUSD: doublePrecision('overtime_hourly_rate_usd'),
  assignedProjectId: text('assigned_project_id'),
  assignedProjectName: text('assigned_project_name'),
  assignedSite: text('assigned_site'),
  mobile: text('mobile'),
  status: text('status'),
  createdAt: text('created_at').notNull(),
});

export const hrLabourAllocationsTable = pgTable('hr_labour_allocations', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  siteName: text('site_name'),
  contractorName: text('contractor_name'),
  skilledWorkersCount: integer('skilled_workers_count'),
  unskilledWorkersCount: integer('unskilled_workers_count'),
  regularHours: doublePrecision('regular_hours'),
  overtimeHours: doublePrecision('overtime_hours'),
  totalLaborCostUSD: doublePrecision('total_labor_cost_usd'),
  supervisorIncharge: text('supervisor_incharge'),
  createdAt: text('created_at').notNull(),
});

export const hrNotificationsTable = pgTable('hr_notifications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  timestamp: text('timestamp').notNull(),
  isRead: boolean('is_read').default(false),
  actionUrl: text('action_url'),
  createdAt: text('created_at').notNull(),
});

// ====================================================
// TABLE INITIALIZATION & SEEDING
// ====================================================

let isHrSeeded = false;

export async function ensureHrSeeded() {
  if (isHrSeeded) return;

  try {
    // Seed employees if empty
    const existingEmps = await db.select().from(hrEmployeesTable).limit(1);
    if (existingEmps.length === 0) {
      const now = new Date().toISOString();
      for (const emp of INITIAL_EMPLOYEES) {
        await db.insert(hrEmployeesTable).values({
          id: emp.id,
          employeeCode: emp.employeeCode,
          photoUrl: emp.photoUrl || null,
          fullName: emp.fullName,
          mobile: emp.mobile || null,
          email: emp.email || null,
          address: emp.address || null,
          emergencyContact: emp.emergencyContact || null,
          dateOfBirth: emp.dateOfBirth || null,
          joiningDate: emp.joiningDate || null,
          department: emp.department || null,
          designation: emp.designation || null,
          branch: emp.branch || null,
          role: emp.role || null,
          reportingManager: emp.reportingManager || null,
          projectId: emp.projectId || null,
          projectName: emp.projectName || null,
          siteAssignment: emp.siteAssignment || null,
          employmentType: emp.employmentType || null,
          salaryStructure: emp.salaryStructure || null,
          status: emp.status || 'ACTIVE',
          documents: emp.documents || [],
          createdAt: now,
          updatedAt: now,
        } as any).onConflictDoNothing();
      }
    }

    // Seed attendance if empty
    const existingAtt = await db.select().from(hrAttendanceTable).limit(1);
    if (existingAtt.length === 0) {
      const now = new Date().toISOString();
      for (const att of INITIAL_ATTENDANCE_RECORDS) {
        await db.insert(hrAttendanceTable).values({
          id: att.id,
          employeeId: att.employeeId,
          employeeCode: att.employeeCode,
          employeeName: att.employeeName,
          department: att.department,
          date: att.date,
          checkIn: att.checkIn || null,
          checkOut: att.checkOut || null,
          shift: att.shift,
          status: att.status,
          lateMinutes: att.lateMinutes,
          earlyExitMinutes: att.earlyExitMinutes,
          overtimeHours: att.overtimeHours,
          workingHours: att.workingHours,
          locationPunchIn: att.locationPunchIn || null,
          locationPunchOut: att.locationPunchOut || null,
          esslDeviceId: att.esslDeviceId || null,
          isManualEntry: att.isManualEntry,
          remarks: att.remarks || null,
          createdAt: now,
          updatedAt: now,
        } as any).onConflictDoNothing();
      }
    }

    // Seed ESSL devices if empty
    const existingDevices = await db.select().from(hrEsslDevicesTable).limit(1);
    if (existingDevices.length === 0) {
      const now = new Date().toISOString();
      for (const dev of INITIAL_ESSL_DEVICES) {
        await db.insert(hrEsslDevicesTable).values({
          id: dev.id,
          deviceId: dev.deviceId,
          deviceName: dev.deviceName,
          siteLocation: dev.siteLocation || null,
          ipAddress: dev.ipAddress || null,
          port: dev.port || null,
          status: dev.status,
          lastSyncTime: dev.lastSyncTime || null,
          totalLogsToday: dev.totalLogsToday,
          createdAt: now,
        } as any).onConflictDoNothing();
      }
    }

    // Seed duty logs if empty
    const existingLogs = await db.select().from(hrDutyLogsTable).limit(1);
    if (existingLogs.length === 0) {
      const now = new Date().toISOString();
      for (const log of INITIAL_DUTY_LOGS) {
        await db.insert(hrDutyLogsTable).values({
          id: log.id,
          employeeId: log.employeeId,
          employeeName: log.employeeName,
          date: log.date,
          projectId: log.projectId,
          projectName: log.projectName,
          siteName: log.siteName,
          workDescription: log.workDescription,
          workingHours: log.workingHours,
          equipmentUsed: log.equipmentUsed || [],
          vehicleUsed: log.vehicleUsed || [],
          materialsUsed: log.materialsUsed || [],
          remarks: log.remarks || null,
          photoUrl: log.photoUrl || null,
          verifiedBy: log.verifiedBy || null,
          approvedBy: log.approvedBy || null,
          status: log.status,
          createdAt: now,
        } as any).onConflictDoNothing();
      }
    }

    // Seed leave balances if empty
    const existingBalances = await db.select().from(hrLeaveBalancesTable).limit(1);
    if (existingBalances.length === 0) {
      const now = new Date().toISOString();
      await db.insert(hrLeaveBalancesTable).values({
        id: 'global-balances',
        employeeId: null,
        balances: INITIAL_LEAVE_BALANCES,
        updatedAt: now,
      } as any).onConflictDoNothing();
    }

    // Seed leave requests if empty
    const existingLeaves = await db.select().from(hrLeaveRequestsTable).limit(1);
    if (existingLeaves.length === 0) {
      const now = new Date().toISOString();
      for (const lve of INITIAL_LEAVE_REQUESTS) {
        await db.insert(hrLeaveRequestsTable).values({
          id: lve.id,
          employeeId: lve.employeeId,
          employeeName: lve.employeeName,
          leaveCategory: lve.leaveCategory,
          startDate: lve.startDate,
          endDate: lve.endDate,
          totalDays: lve.totalDays,
          reason: lve.reason || null,
          status: lve.status,
          appliedOn: lve.appliedOn,
          approvedBy: lve.approvedBy || null,
          managerRemarks: lve.managerRemarks || null,
          createdAt: now,
        } as any).onConflictDoNothing();
      }
    }

    // Seed payroll if empty
    const existingPayroll = await db.select().from(hrPayrollsTable).limit(1);
    if (existingPayroll.length === 0) {
      const now = new Date().toISOString();
      for (const pay of INITIAL_PAYROLL_RECORDS) {
        await db.insert(hrPayrollsTable).values({
          id: pay.id,
          payrollMonth: pay.payrollMonth,
          employeeId: pay.employeeId,
          employeeCode: pay.employeeCode,
          employeeName: pay.employeeName,
          designation: pay.designation,
          department: pay.department,
          bankAccount: pay.bankAccount,
          bankName: pay.bankName,
          daysInMonth: pay.daysInMonth,
          daysWorked: pay.daysWorked,
          paidLeaves: pay.paidLeaves,
          unpaidLeaves: pay.unpaidLeaves,
          overtimeHours: pay.overtimeHours,
          basicEarnedUSD: pay.basicEarnedUSD,
          hraEarnedUSD: pay.hraEarnedUSD,
          daEarnedUSD: pay.daEarnedUSD,
          allowancesUSD: pay.allowancesUSD,
          overtimePayUSD: pay.overtimePayUSD,
          bonusUSD: pay.bonusUSD,
          grossSalaryUSD: pay.grossSalaryUSD,
          pfDeductionUSD: pay.pfDeductionUSD,
          esiDeductionUSD: pay.esiDeductionUSD,
          taxTdsUSD: pay.taxTdsUSD,
          otherDeductionsUSD: pay.otherDeductionsUSD,
          totalDeductionsUSD: pay.totalDeductionsUSD,
          netSalaryUSD: pay.netSalaryUSD,
          paymentStatus: pay.paymentStatus,
          paymentDate: pay.paymentDate || null,
          utrReference: pay.utrReference || null,
          createdAt: now,
        } as any).onConflictDoNothing();
      }
    }

    // Seed labour workers if empty
    const existingWorkers = await db.select().from(hrLabourWorkersTable).limit(1);
    if (existingWorkers.length === 0) {
      const now = new Date().toISOString();
      for (const w of INITIAL_LABOUR_WORKERS) {
        await db.insert(hrLabourWorkersTable).values({
          id: w.id,
          workerCode: w.workerCode,
          fullName: w.fullName,
          skillCategory: w.skillCategory,
          contractorName: w.contractorName || null,
          dailyWageRateUSD: w.dailyWageRateUSD,
          overtimeHourlyRateUSD: w.overtimeHourlyRateUSD,
          assignedProjectId: w.assignedProjectId,
          assignedProjectName: w.assignedProjectName,
          assignedSite: w.assignedSite,
          mobile: w.mobile,
          status: w.status,
          createdAt: now,
        } as any).onConflictDoNothing();
      }
    }

    // Seed labour allocations if empty
    const existingAlloc = await db.select().from(hrLabourAllocationsTable).limit(1);
    if (existingAlloc.length === 0) {
      const now = new Date().toISOString();
      for (const a of INITIAL_LABOUR_ALLOCATIONS) {
        await db.insert(hrLabourAllocationsTable).values({
          id: a.id,
          date: a.date,
          projectId: a.projectId,
          projectName: a.projectName,
          siteName: a.siteName,
          contractorName: a.contractorName || null,
          skilledWorkersCount: a.skilledWorkersCount,
          unskilledWorkersCount: a.unskilledWorkersCount,
          regularHours: a.regularHours,
          overtimeHours: a.overtimeHours,
          totalLaborCostUSD: a.totalLaborCostUSD,
          supervisorIncharge: a.supervisorIncharge,
          createdAt: now,
        } as any).onConflictDoNothing();
      }
    }

    // Seed notifications if empty
    const existingNotifs = await db.select().from(hrNotificationsTable).limit(1);
    if (existingNotifs.length === 0) {
      const now = new Date().toISOString();
      for (const n of INITIAL_HR_NOTIFICATIONS) {
        await db.insert(hrNotificationsTable).values({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          timestamp: n.timestamp,
          isRead: n.isRead,
          actionUrl: n.actionUrl || null,
          createdAt: now,
        } as any).onConflictDoNothing();
      }
    }

    isHrSeeded = true;
  } catch (err: any) {
    console.error('Error in ensureHrSeeded:', err);
  }
}

// ====================================================
// REPOSITORY CLASS & METHODS
// ====================================================

export class HrRepository {
  // --- EMPLOYEE METHODS ---
  async getEmployees(filters: { department?: string; status?: string; projectId?: string; search?: string }): Promise<Employee[]> {
    await ensureHrSeeded();
    let rows = await db.select().from(hrEmployeesTable).orderBy(desc(hrEmployeesTable.createdAt));
    let result = rows as unknown as Employee[];

    if (filters.department && filters.department !== 'ALL') {
      result = result.filter((e) => e.department && e.department.toLowerCase() === filters.department!.toLowerCase());
    }
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((e) => e.status === filters.status);
    }
    if (filters.projectId && filters.projectId !== 'ALL') {
      result = result.filter((e) => e.projectId === filters.projectId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          (e.fullName && e.fullName.toLowerCase().includes(q)) ||
          (e.employeeCode && e.employeeCode.toLowerCase().includes(q)) ||
          (e.designation && e.designation.toLowerCase().includes(q)) ||
          (e.email && e.email.toLowerCase().includes(q))
      );
    }
    return result;
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    await ensureHrSeeded();
    const rows = await db.select().from(hrEmployeesTable).where(eq(hrEmployeesTable.id, id)).limit(1);
    if (rows.length === 0) return null;
    return rows[0] as unknown as Employee;
  }

  async createEmployee(data: Partial<Employee>, currentUser?: { id?: string; email?: string; role?: string }): Promise<Employee> {
    await ensureHrSeeded();
    const allEmps = (await db.select().from(hrEmployeesTable)) as unknown as Employee[];
    
    // Validations: Duplicate Code, Email, Mobile
    if (data.employeeCode && allEmps.some(e => e.employeeCode.toLowerCase() === data.employeeCode!.toLowerCase())) {
      throw new Error(`Duplicate Employee Code: '${data.employeeCode}' already exists.`);
    }
    if (data.email && allEmps.some(e => e.email.toLowerCase() === data.email!.toLowerCase())) {
      throw new Error(`Duplicate Email: '${data.email}' is already registered.`);
    }
    if (data.mobile && allEmps.some(e => e.mobile && e.mobile.replace(/\s+/g, '') === data.mobile!.replace(/\s+/g, ''))) {
      throw new Error(`Duplicate Mobile Number: '${data.mobile}' is already registered.`);
    }

    const newId = data.id || `emp_${Date.now()}`;
    const newCode = data.employeeCode || `EMP-SSP-${String(allEmps.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newEmp: Employee = {
      id: newId,
      employeeCode: newCode,
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      fullName: data.fullName || 'New Employee',
      gender: data.gender || 'MALE',
      mobile: data.mobile || '',
      email: data.email || '',
      address: data.address || '',
      emergencyContact: data.emergencyContact || { name: '', relationship: '', phone: '' },
      dateOfBirth: data.dateOfBirth || '1992-01-01',
      joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
      department: data.department || ('Accounts & HR' as any),
      designation: data.designation || 'Staff',
      branch: data.branch || 'Kochi HQ',
      company: data.company || 'SiteSync Infrastructure Group',
      role: data.role || 'STAFF',
      reportingManager: data.reportingManager || '',
      reportingManagerId: data.reportingManagerId || '',
      hierarchyLevel: data.hierarchyLevel || 2,
      approvalLevel: data.approvalLevel || 1,
      directReportsCount: 0,
      projectId: data.projectId,
      projectName: data.projectName,
      siteAssignment: data.siteAssignment,
      employmentType: data.employmentType || ('FULL_TIME' as any),
      salaryStructure: data.salaryStructure || {
        basicUSD: 2000,
        hraUSD: 800,
        daUSD: 300,
        specialAllowanceUSD: 300,
        foodAllowanceUSD: 100,
        travelAllowanceUSD: 100,
        overtimeHourlyRateUSD: 20,
        pfDeductionUSD: 240,
        esiDeductionUSD: 60,
        professionalTaxUSD: 40,
      },
      salaryINR: data.salaryINR || 75000,
      status: data.status || 'ACTIVE',
      documents: data.documents || [],
      isDeleted: false,
    };

    await db.insert(hrEmployeesTable).values({
      id: newEmp.id,
      employeeCode: newEmp.employeeCode,
      photoUrl: newEmp.photoUrl || null,
      fullName: newEmp.fullName,
      mobile: newEmp.mobile || null,
      email: newEmp.email || null,
      address: newEmp.address || null,
      emergencyContact: newEmp.emergencyContact,
      dateOfBirth: newEmp.dateOfBirth || null,
      joiningDate: newEmp.joiningDate || null,
      department: newEmp.department || null,
      designation: newEmp.designation || null,
      branch: newEmp.branch || null,
      role: newEmp.role || null,
      reportingManager: newEmp.reportingManager || null,
      projectId: newEmp.projectId || null,
      projectName: newEmp.projectName || null,
      siteAssignment: newEmp.siteAssignment || null,
      employmentType: newEmp.employmentType || null,
      salaryStructure: newEmp.salaryStructure,
      status: newEmp.status,
      documents: newEmp.documents,
      createdAt: now,
      updatedAt: now,
    } as any);

    await auditRepository.logAction({
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      userRole: currentUser?.role || 'HR_MANAGER',
      action: 'CREATE_EMPLOYEE',
      module: 'HR_MASTER',
      details: `Registered employee [${newEmp.employeeCode}] ${newEmp.fullName} (${newEmp.designation}, ${newEmp.department})`,
    });

    return newEmp;
  }

  async updateEmployee(id: string, updates: Partial<Employee>, currentUser?: { id?: string; email?: string; role?: string }): Promise<Employee | null> {
    await ensureHrSeeded();
    const rows = await db.select().from(hrEmployeesTable).where(eq(hrEmployeesTable.id, id)).limit(1);
    if (rows.length === 0) return null;

    const allEmps = (await db.select().from(hrEmployeesTable)) as unknown as Employee[];
    const existing = rows[0] as unknown as Employee;

    // Check Circular Reporting Hierarchy
    if (updates.reportingManagerId || updates.reportingManager) {
      const targetMgrId = updates.reportingManagerId || updates.reportingManager;
      if (targetMgrId === id || targetMgrId === existing.employeeCode) {
        throw new Error(`Circular Reporting Loop: Employee cannot report to themselves.`);
      }
      let current: string | undefined = targetMgrId;
      const visited = new Set<string>();
      while (current) {
        if (current === id || current === existing.employeeCode) {
          throw new Error(`Circular Reporting Hierarchy Detected: Assigning this manager creates a loop.`);
        }
        if (visited.has(current)) break;
        visited.add(current);
        const parent = allEmps.find(e => e.id === current || e.employeeCode === current);
        current = parent?.reportingManagerId || parent?.reportingManager;
      }
    }

    const now = new Date().toISOString();
    const updated: Employee = {
      ...existing,
      ...updates,
      salaryStructure: updates.salaryStructure ? { ...existing.salaryStructure, ...updates.salaryStructure } : existing.salaryStructure,
      emergencyContact: updates.emergencyContact ? { ...existing.emergencyContact, ...updates.emergencyContact } : existing.emergencyContact,
      documents: updates.documents || existing.documents,
    };

    await db.update(hrEmployeesTable)
      .set({
        photoUrl: updated.photoUrl || null,
        fullName: updated.fullName,
        mobile: updated.mobile || null,
        email: updated.email || null,
        address: updated.address || null,
        emergencyContact: updated.emergencyContact,
        dateOfBirth: updated.dateOfBirth || null,
        joiningDate: updated.joiningDate || null,
        department: updated.department || null,
        designation: updated.designation || null,
        branch: updated.branch || null,
        role: updated.role || null,
        reportingManager: updated.reportingManager || null,
        projectId: updated.projectId || null,
        projectName: updated.projectName || null,
        siteAssignment: updated.siteAssignment || null,
        employmentType: updated.employmentType || null,
        salaryStructure: updated.salaryStructure,
        status: updated.status,
        documents: updated.documents,
        updatedAt: now,
      } as any)
      .where(eq(hrEmployeesTable.id, id));

    await auditRepository.logAction({
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      userRole: currentUser?.role || 'HR_MANAGER',
      action: 'UPDATE_EMPLOYEE',
      module: 'HR_MASTER',
      details: `Updated employee profile [${updated.employeeCode}] ${updated.fullName}`,
    });

    return updated;
  }

  async deleteEmployee(id: string, currentUser?: { id?: string; email?: string; role?: string }): Promise<boolean> {
    await ensureHrSeeded();
    const rows = await db.select().from(hrEmployeesTable).where(eq(hrEmployeesTable.id, id)).limit(1);
    if (rows.length === 0) return false;
    const emp = rows[0] as unknown as Employee;

    await db.update(hrEmployeesTable)
      .set({ status: 'TERMINATED', updatedAt: new Date().toISOString() } as any)
      .where(eq(hrEmployeesTable.id, id));

    await auditRepository.logAction({
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      userRole: currentUser?.role || 'HR_ADMIN',
      action: 'DEACTIVATE_EMPLOYEE',
      module: 'HR_MASTER',
      details: `Deactivated / Terminated employee [${emp.employeeCode}] ${emp.fullName}`,
    });

    return true;
  }

  async restoreEmployee(id: string, currentUser?: { id?: string; email?: string; role?: string }): Promise<boolean> {
    await ensureHrSeeded();
    const rows = await db.select().from(hrEmployeesTable).where(eq(hrEmployeesTable.id, id)).limit(1);
    if (rows.length === 0) return false;
    const emp = rows[0] as unknown as Employee;

    await db.update(hrEmployeesTable)
      .set({ status: 'ACTIVE', updatedAt: new Date().toISOString() } as any)
      .where(eq(hrEmployeesTable.id, id));

    await auditRepository.logAction({
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      userRole: currentUser?.role || 'HR_ADMIN',
      action: 'RESTORE_EMPLOYEE',
      module: 'HR_MASTER',
      details: `Restored / Reactivated employee [${emp.employeeCode}] ${emp.fullName}`,
    });

    return true;
  }

  async bulkImportEmployees(list: Partial<Employee>[], currentUser?: { id?: string; email?: string; role?: string }): Promise<{ importedCount: number; errors: string[] }> {
    await ensureHrSeeded();
    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < list.length; i++) {
      try {
        await this.createEmployee(list[i], currentUser);
        importedCount++;
      } catch (err: any) {
        errors.push(`Row ${i + 1} (${list[i].fullName || 'Unknown'}): ${err.message}`);
      }
    }

    await auditRepository.logAction({
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      userRole: currentUser?.role || 'HR_MANAGER',
      action: 'BULK_IMPORT_EMPLOYEES',
      module: 'HR_MASTER',
      details: `Bulk imported ${importedCount} employees with ${errors.length} errors`,
    });

    return { importedCount, errors };
  }

  async getReportingHierarchyTree(): Promise<any[]> {
    await ensureHrSeeded();
    const emps = (await db.select().from(hrEmployeesTable)) as unknown as Employee[];
    
    // Map employees into hierarchical tree node
    const nodeMap = new Map<string, any>();
    emps.forEach(e => {
      nodeMap.set(e.id, {
        id: e.id,
        employeeCode: e.employeeCode,
        fullName: e.fullName,
        designation: e.designation,
        department: e.department,
        photoUrl: e.photoUrl,
        reportingManager: e.reportingManager,
        children: []
      });
    });

    const rootNodes: any[] = [];
    emps.forEach(e => {
      const node = nodeMap.get(e.id);
      const parent = emps.find(p => p.id === e.reportingManagerId || p.fullName === e.reportingManager);
      if (parent && nodeMap.has(parent.id)) {
        nodeMap.get(parent.id).children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  // --- ATTENDANCE METHODS ---
  async getAttendance(filters: { date?: string; department?: string; employeeId?: string }): Promise<{ records: DailyAttendanceRecord[]; devices: ESSLDevice[] }> {
    await ensureHrSeeded();
    const allRecords = (await db.select().from(hrAttendanceTable).orderBy(desc(hrAttendanceTable.createdAt))) as unknown as DailyAttendanceRecord[];
    const devices = (await db.select().from(hrEsslDevicesTable)) as unknown as ESSLDevice[];

    let filtered = allRecords;
    if (filters.date) {
      filtered = filtered.filter((a) => a.date === filters.date);
    }
    if (filters.department) {
      filtered = filtered.filter((a) => a.department && a.department.toLowerCase() === filters.department!.toLowerCase());
    }
    if (filters.employeeId) {
      filtered = filtered.filter((a) => a.employeeId === filters.employeeId);
    }

    return { records: filtered, devices };
  }

  async punchAttendance(data: { employeeId: string; type: string; location?: string; remarks?: string }): Promise<{ message: string; data: DailyAttendanceRecord } | null> {
    await ensureHrSeeded();
    const empRows = await db.select().from(hrEmployeesTable).where(eq(hrEmployeesTable.id, data.employeeId)).limit(1);
    if (empRows.length === 0) return null;
    const emp = empRows[0] as unknown as Employee;

    const todayStr = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toTimeString().split(' ')[0].slice(0, 5);
    const now = new Date().toISOString();

    const existingRows = await db.select().from(hrAttendanceTable)
      .where(and(eq(hrAttendanceTable.employeeId, data.employeeId), eq(hrAttendanceTable.date, todayStr)))
      .limit(1);

    let record: DailyAttendanceRecord;

    if (existingRows.length > 0) {
      const existing = existingRows[0] as unknown as DailyAttendanceRecord;
      if (data.type === 'CHECK_OUT') {
        record = {
          ...existing,
          checkOut: timeNow,
          locationPunchOut: data.location || 'Manual Mobile Web Punch',
          remarks: data.remarks || existing.remarks,
        };
      } else {
        record = {
          ...existing,
          checkIn: timeNow,
          locationPunchIn: data.location || 'Manual Mobile Web Punch',
        };
      }
      await db.update(hrAttendanceTable)
        .set({
          checkIn: record.checkIn || null,
          checkOut: record.checkOut || null,
          locationPunchIn: record.locationPunchIn || null,
          locationPunchOut: record.locationPunchOut || null,
          remarks: record.remarks || null,
          updatedAt: now,
        } as any)
        .where(eq(hrAttendanceTable.id, record.id));
    } else {
      record = {
        id: `att_${Date.now()}`,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        department: emp.department,
        date: todayStr,
        checkIn: timeNow,
        shift: 'DAY_SHIFT',
        status: 'PRESENT',
        lateMinutes: 0,
        earlyExitMinutes: 0,
        overtimeHours: 0,
        workingHours: 8.0,
        locationPunchIn: data.location || 'Manual Mobile Web Punch',
        isManualEntry: true,
        remarks: data.remarks || 'Web punch',
      };

      await db.insert(hrAttendanceTable).values({
        id: record.id,
        employeeId: record.employeeId,
        employeeCode: record.employeeCode,
        employeeName: record.employeeName,
        department: record.department,
        date: record.date,
        checkIn: record.checkIn || null,
        checkOut: record.checkOut || null,
        shift: record.shift,
        status: record.status,
        lateMinutes: record.lateMinutes,
        earlyExitMinutes: record.earlyExitMinutes,
        overtimeHours: record.overtimeHours,
        workingHours: record.workingHours,
        locationPunchIn: record.locationPunchIn || null,
        locationPunchOut: record.locationPunchOut || null,
        esslDeviceId: record.esslDeviceId || null,
        isManualEntry: record.isManualEntry,
        remarks: record.remarks || null,
        createdAt: now,
        updatedAt: now,
      } as any);
    }

    return {
      message: `Punch ${data.type} registered for ${emp.fullName} at ${timeNow}`,
      data: record,
    };
  }

  async syncEssl(deviceId?: string): Promise<{ message: string; devices: ESSLDevice[] }> {
    await ensureHrSeeded();
    const devices = (await db.select().from(hrEsslDevicesTable)) as unknown as ESSLDevice[];
    const syncTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (deviceId) {
      const dev = devices.find((d) => d.deviceId === deviceId);
      if (dev) {
        dev.lastSyncTime = syncTime;
        dev.totalLogsToday = (dev.totalLogsToday || 0) + 5;
        await db.update(hrEsslDevicesTable)
          .set({ lastSyncTime: syncTime, totalLogsToday: dev.totalLogsToday } as any)
          .where(eq(hrEsslDevicesTable.id, dev.id));
      }
    } else {
      for (const dev of devices) {
        dev.lastSyncTime = syncTime;
        dev.totalLogsToday = (dev.totalLogsToday || 0) + 5;
        await db.update(hrEsslDevicesTable)
          .set({ lastSyncTime: syncTime, totalLogsToday: dev.totalLogsToday } as any)
          .where(eq(hrEsslDevicesTable.id, dev.id));
      }
    }

    const updatedDevices = (await db.select().from(hrEsslDevicesTable)) as unknown as ESSLDevice[];
    return {
      message: `ESSL Biometric Device [${deviceId || 'All Devices'}] synced successfully. Synced 5 new time logs.`,
      devices: updatedDevices,
    };
  }

  // --- DUTY LOG METHODS ---
  async getDutyLogs(): Promise<DailyDutyLog[]> {
    await ensureHrSeeded();
    const rows = await db.select().from(hrDutyLogsTable).orderBy(desc(hrDutyLogsTable.createdAt));
    return rows as unknown as DailyDutyLog[];
  }

  async createDutyLog(data: Partial<DailyDutyLog>): Promise<DailyDutyLog> {
    await ensureHrSeeded();
    const now = new Date().toISOString();
    const newLog: DailyDutyLog = {
      id: `duty_${Date.now()}`,
      employeeId: data.employeeId || 'emp_101',
      employeeName: data.employeeName || 'Staff Member',
      date: new Date().toISOString().split('T')[0],
      projectId: data.projectId || 'prj_01',
      projectName: data.projectName || 'General Construction',
      siteName: data.siteName || 'Main Site',
      workDescription: data.workDescription || 'Daily site activity',
      workingHours: data.workingHours || 8,
      equipmentUsed: data.equipmentUsed || [],
      vehicleUsed: data.vehicleUsed || [],
      materialsUsed: data.materialsUsed || [],
      remarks: data.remarks || '',
      photoUrl: data.photoUrl || '',
      verifiedBy: data.verifiedBy,
      approvedBy: data.approvedBy,
      status: 'SUBMITTED',
    };

    await db.insert(hrDutyLogsTable).values({
      id: newLog.id,
      employeeId: newLog.employeeId,
      employeeName: newLog.employeeName,
      date: newLog.date,
      projectId: newLog.projectId,
      projectName: newLog.projectName,
      siteName: newLog.siteName,
      workDescription: newLog.workDescription,
      workingHours: newLog.workingHours,
      equipmentUsed: newLog.equipmentUsed,
      vehicleUsed: newLog.vehicleUsed,
      materialsUsed: newLog.materialsUsed,
      remarks: newLog.remarks || null,
      photoUrl: newLog.photoUrl || null,
      verifiedBy: newLog.verifiedBy || null,
      approvedBy: newLog.approvedBy || null,
      status: newLog.status,
      createdAt: now,
    } as any);

    return newLog;
  }

  async verifyDutyLog(id: string, updates: { status?: string; verifiedBy?: string; approvedBy?: string }): Promise<DailyDutyLog | null> {
    await ensureHrSeeded();
    const rows = await db.select().from(hrDutyLogsTable).where(eq(hrDutyLogsTable.id, id)).limit(1);
    if (rows.length === 0) return null;

    const existing = rows[0] as unknown as DailyDutyLog;
    const updated: DailyDutyLog = {
      ...existing,
      status: (updates.status as any) || existing.status,
      verifiedBy: updates.verifiedBy || existing.verifiedBy,
      approvedBy: updates.approvedBy || existing.approvedBy,
    };

    await db.update(hrDutyLogsTable)
      .set({
        status: updated.status,
        verifiedBy: updated.verifiedBy || null,
        approvedBy: updated.approvedBy || null,
      } as any)
      .where(eq(hrDutyLogsTable.id, id));

    return updated;
  }

  // --- LEAVE METHODS ---
  async getLeaves(): Promise<{ requests: LeaveRequest[]; balances: any }> {
    await ensureHrSeeded();
    const requests = (await db.select().from(hrLeaveRequestsTable).orderBy(desc(hrLeaveRequestsTable.createdAt))) as unknown as LeaveRequest[];
    const balanceRows = await db.select().from(hrLeaveBalancesTable).limit(1);
    const balances = balanceRows.length > 0 ? (balanceRows[0].balances as any) : INITIAL_LEAVE_BALANCES;

    return { requests, balances };
  }

  async createLeave(data: Partial<LeaveRequest>): Promise<LeaveRequest> {
    await ensureHrSeeded();
    const now = new Date().toISOString();
    const newReq: LeaveRequest = {
      id: `lve_${Date.now()}`,
      employeeId: data.employeeId || 'emp_101',
      employeeName: data.employeeName || 'Staff Member',
      leaveCategory: data.leaveCategory || 'CASUAL',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date().toISOString().split('T')[0],
      totalDays: data.totalDays || 1,
      reason: data.reason || '',
      status: 'PENDING',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    await db.insert(hrLeaveRequestsTable).values({
      id: newReq.id,
      employeeId: newReq.employeeId,
      employeeName: newReq.employeeName,
      leaveCategory: newReq.leaveCategory,
      startDate: newReq.startDate,
      endDate: newReq.endDate,
      totalDays: newReq.totalDays,
      reason: newReq.reason || null,
      status: newReq.status,
      appliedOn: newReq.appliedOn,
      createdAt: now,
    } as any);

    // Create HR Notification
    await db.insert(hrNotificationsTable).values({
      id: `notif_${Date.now()}`,
      title: 'New Leave Request',
      message: `${newReq.employeeName} applied for ${newReq.totalDays} days ${newReq.leaveCategory} leave.`,
      type: 'LEAVE_PENDING',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isRead: false,
      createdAt: now,
    } as any);

    return newReq;
  }

  async approveLeave(id: string, updates: { action: string; approvedBy?: string; remarks?: string }): Promise<LeaveRequest | null> {
    await ensureHrSeeded();
    const rows = await db.select().from(hrLeaveRequestsTable).where(eq(hrLeaveRequestsTable.id, id)).limit(1);
    if (rows.length === 0) return null;

    const existing = rows[0] as unknown as LeaveRequest;
    const updated: LeaveRequest = {
      ...existing,
      status: (updates.action as any) || existing.status,
      approvedBy: updates.approvedBy || 'HR Admin',
      managerRemarks: updates.remarks || existing.managerRemarks,
    };

    await db.update(hrLeaveRequestsTable)
      .set({
        status: updated.status,
        approvedBy: updated.approvedBy || null,
        managerRemarks: updated.managerRemarks || null,
      } as any)
      .where(eq(hrLeaveRequestsTable.id, id));

    return updated;
  }

  // --- PAYROLL METHODS ---
  async getPayroll(): Promise<PayrollRecord[]> {
    await ensureHrSeeded();
    const rows = await db.select().from(hrPayrollsTable).orderBy(desc(hrPayrollsTable.createdAt));
    return rows as unknown as PayrollRecord[];
  }

  async generatePayroll(monthYear?: string): Promise<PayrollRecord[]> {
    await ensureHrSeeded();
    await statutoryEngineService.ensureStatutoryRulesSeeded();
    const emps = (await db.select().from(hrEmployeesTable)) as unknown as Employee[];
    const month = monthYear || '2026-08';
    const now = new Date().toISOString();
    const newGenerated: PayrollRecord[] = [];

    // Fetch active statutory rules
    const activeRules = await statutoryEngineService.getStatutoryRules('INDIA');

    // Fetch attendance finalization snapshot if available
    const finalizationRows = await db.execute(sql`
      SELECT * FROM hr_attendance_finalizations WHERE month_year = ${month}
    `);
    const finalizedMap = new Map<string, any>();
    if (finalizationRows?.rows) {
      (finalizationRows.rows as any[]).forEach((f) => finalizedMap.set(f.employee_id, f));
    }

    // Fetch active loans
    const allLoans = await db.select().from(phase70Loans).where(and(eq(phase70Loans.isDeleted, false), eq(phase70Loans.status, 'ACTIVE')));

    for (const emp of emps) {
      // Fetch or seed employee statutory profile
      const profile = await statutoryEngineService.getEmployeeStatutoryProfile(emp.id, emp.employeeCode);

      const attRecord = finalizedMap.get(emp.id);
      const payableDutyDays = attRecord?.payable_duty_days ?? 26;
      const overtimeHours = attRecord?.overtime_hours ?? 8;
      const lopDays = attRecord?.unpaid_leave_days || 0;
      const totalDaysInMonth = attRecord?.total_days_in_month || 31;

      // Evaluate loan recovery
      const empLoans = allLoans.filter((l: any) => l.employeeId === emp.id && (l.outstandingBalanceAed || l.balanceOutstandingAed || 0) > 0);
      let totalLoanRecovery = 0;
      for (const loan of empLoans) {
        const anyLoan = loan as any;
        const rate = anyLoan.repaymentRate || 1000;
        const calculated = (anyLoan.repaymentMethod === 'PER_DUTY_DAY' || !anyLoan.repaymentMethod) ? (payableDutyDays * rate) : (anyLoan.monthlyEmiAed || 1000);
        const opening = anyLoan.outstandingBalanceAed ?? anyLoan.balanceOutstandingAed ?? 0;
        const actualDeduction = Math.min(calculated, opening);
        totalLoanRecovery += (actualDeduction / 84.20); // convert to USD for legacy model
      }

      // Compute dynamic statutory payroll
      const calc = await statutoryEngineService.computeEmployeePayroll(emp, profile, activeRules, {
        payrollMonth: month,
        transactionCurrency: 'USD',
        exchangeRateToInr: 84.20,
        overtimeHours,
        bonusUSD: 200,
        loanEmi: Math.round(totalLoanRecovery),
        payableDutyDays,
        totalDaysInMonth,
        lopDays,
      });

      const record: PayrollRecord = {
        id: `pay_${Date.now()}_${emp.id}`,
        payrollMonth: month,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        designation: emp.designation,
        department: emp.department,
        bankAccount: profile.bankAccountNumber || `HDFC-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        bankName: profile.bankName || 'HDFC Bank Corporate',
        daysInMonth: totalDaysInMonth,
        daysWorked: payableDutyDays,
        paidLeaves: 2,
        unpaidLeaves: lopDays,
        overtimeHours: overtimeHours,
        basicEarnedUSD: calc.basic,
        hraEarnedUSD: calc.hra,
        daEarnedUSD: calc.da,
        allowancesUSD: calc.specialAllowance + calc.siteAllowance + calc.conveyance,
        overtimePayUSD: calc.overtimeAmount,
        bonusUSD: calc.bonusAmount,
        grossSalaryUSD: calc.grossEarnings,
        pfDeductionUSD: calc.employeePf,
        esiDeductionUSD: calc.employeeEsi,
        taxTdsUSD: calc.tdsIncomeTax,
        otherDeductionsUSD: calc.loanEmi + calc.advanceRecovery,
        totalDeductionsUSD: calc.totalEmployeeDeductions,
        netSalaryUSD: calc.netPayable,
        paymentStatus: 'GENERATED',
        currency: 'USD',
        exchangeRateToInr: 84.20,
        grossINR: calc.grossEarningsINR,
        netINR: calc.netPayableINR,
        employeeVpfUSD: calc.employeeVpf,
        professionalTaxUSD: calc.professionalTax,
        employerPfUSD: calc.totalEmployerPf,
        employerEsiUSD: calc.employerEsi,
        gratuityAccrualUSD: calc.gratuityAccrual,
        statutoryDetails: calc.statutoryDetails,
      };

      await db.insert(hrPayrollsTable).values({
        id: record.id,
        payrollMonth: record.payrollMonth,
        employeeId: record.employeeId,
        employeeCode: record.employeeCode,
        employeeName: record.employeeName,
        designation: record.designation,
        department: record.department,
        bankAccount: record.bankAccount,
        bankName: record.bankName,
        daysInMonth: record.daysInMonth,
        daysWorked: record.daysWorked,
        paidLeaves: record.paidLeaves,
        unpaidLeaves: record.unpaidLeaves,
        overtimeHours: record.overtimeHours,
        basicEarnedUSD: record.basicEarnedUSD,
        hraEarnedUSD: record.hraEarnedUSD,
        daEarnedUSD: record.daEarnedUSD,
        allowancesUSD: record.allowancesUSD,
        overtimePayUSD: record.overtimePayUSD,
        bonusUSD: record.bonusUSD,
        grossSalaryUSD: record.grossSalaryUSD,
        pfDeductionUSD: record.pfDeductionUSD,
        esiDeductionUSD: record.esiDeductionUSD,
        taxTdsUSD: record.taxTdsUSD,
        otherDeductionsUSD: record.otherDeductionsUSD,
        totalDeductionsUSD: record.totalDeductionsUSD,
        netSalaryUSD: record.netSalaryUSD,
        paymentStatus: record.paymentStatus,
        createdAt: now,
      } as any).onConflictDoNothing();

      newGenerated.push(record);
    }

    return newGenerated;
  }

  // --- LABOUR METHODS ---
  async getLabour(): Promise<{ workers: LabourWorker[]; allocations: LabourAllocation[] }> {
    await ensureHrSeeded();
    const workers = (await db.select().from(hrLabourWorkersTable).orderBy(desc(hrLabourWorkersTable.createdAt))) as unknown as LabourWorker[];
    const allocations = (await db.select().from(hrLabourAllocationsTable).orderBy(desc(hrLabourAllocationsTable.createdAt))) as unknown as LabourAllocation[];

    return { workers, allocations };
  }

  async createLabourAllocation(data: Partial<LabourAllocation>): Promise<LabourAllocation> {
    await ensureHrSeeded();
    const now = new Date().toISOString();
    const newAlloc: LabourAllocation = {
      id: `alloc_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      projectId: data.projectId || 'prj_01',
      projectName: data.projectName || 'General Site',
      siteName: data.siteName || 'Main Pier',
      contractorName: data.contractorName,
      skilledWorkersCount: data.skilledWorkersCount || 0,
      unskilledWorkersCount: data.unskilledWorkersCount || 0,
      regularHours: data.regularHours || 8,
      overtimeHours: data.overtimeHours || 0,
      totalLaborCostUSD: data.totalLaborCostUSD || 0,
      supervisorIncharge: data.supervisorIncharge || 'Site Supervisor',
    };

    await db.insert(hrLabourAllocationsTable).values({
      id: newAlloc.id,
      date: newAlloc.date,
      projectId: newAlloc.projectId,
      projectName: newAlloc.projectName,
      siteName: newAlloc.siteName,
      contractorName: newAlloc.contractorName || null,
      skilledWorkersCount: newAlloc.skilledWorkersCount,
      unskilledWorkersCount: newAlloc.unskilledWorkersCount,
      regularHours: newAlloc.regularHours,
      overtimeHours: newAlloc.overtimeHours,
      totalLaborCostUSD: newAlloc.totalLaborCostUSD,
      supervisorIncharge: newAlloc.supervisorIncharge,
      createdAt: now,
    } as any);

    return newAlloc;
  }

  // --- NOTIFICATION METHODS ---
  async getNotifications(): Promise<HRNotification[]> {
    await ensureHrSeeded();
    const rows = await db.select().from(hrNotificationsTable).orderBy(desc(hrNotificationsTable.createdAt));
    return rows as unknown as HRNotification[];
  }
}

export const hrRepository = new HrRepository();
