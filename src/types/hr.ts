export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'SUBCONTRACT' | 'DAILY_WAGE';
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED';

export interface EmployeeDocument {
  id: string;
  title: string;
  documentType: 'ID_PROOF' | 'PASSPORT' | 'CONTRACT' | 'SAFETY_PASS' | 'CERTIFICATION';
  documentNumber: string;
  expiryDate?: string;
  fileUrl?: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
}

export interface SalaryStructure {
  basicUSD: number;
  hraUSD: number; // House Rent Allowance
  daUSD: number;  // Dearness Allowance
  specialAllowanceUSD: number;
  foodAllowanceUSD: number;
  travelAllowanceUSD: number;
  overtimeHourlyRateUSD: number;
  pfDeductionUSD: number; // Provident Fund
  esiDeductionUSD: number; // Employee State Insurance
  professionalTaxUSD: number;
}

export type HierarchyRoleLevel = 
  | 'WORKER'
  | 'SUPERVISOR'
  | 'SITE_ENGINEER'
  | 'SITE_INCHARGE'
  | 'PROJECT_MANAGER'
  | 'MANAGER'
  | 'GENERAL_MANAGER'
  | 'COMPANY_ADMIN'
  | 'SUPER_ADMIN';

export interface Employee {
  id: string;
  employeeCode: string;
  photoUrl?: string;
  fullName: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  mobile: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  dateOfBirth: string;
  joiningDate: string;
  company?: string;
  companyId?: string;
  branch: string;
  branchId?: string;
  department: 'Executive' | 'Project Management' | 'Mechanical Engineering' | 'Field Operations' | 'Civil & Structural' | 'HSE & Safety' | 'Store & Logistics' | 'Accounts & HR' | string;
  departmentId?: string;
  designation: string;
  designationId?: string;
  role: string;
  reportingManager: string;
  reportingManagerId?: string;
  hierarchyLevel?: number; // 1 to 9
  approvalLevel?: number; // 1 to 5
  directReportsCount?: number;
  hierarchyRole?: HierarchyRoleLevel;
  projectId?: string;
  projectName?: string;
  siteAssignment?: string;
  employmentType: EmploymentType;
  salaryStructure: SalaryStructure;
  salaryINR?: number; // ₹ INR Base Salary
  status: EmployeeStatus;
  documents: EmployeeDocument[];
  isDeleted?: boolean;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE_ENTRY' | 'EARLY_EXIT' | 'HOLIDAY' | 'WEEKLY_OFF' | 'ON_LEAVE';
export type ShiftType = 'DAY_SHIFT' | 'NIGHT_SHIFT' | 'OVERTIME_SHIFT';

export interface DailyAttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  shift: ShiftType;
  status: AttendanceStatus;
  lateMinutes: number;
  earlyExitMinutes: number;
  overtimeHours: number;
  workingHours: number;
  locationPunchIn?: string;
  locationPunchOut?: string;
  esslDeviceId?: string;
  isManualEntry: boolean;
  remarks?: string;
}

export interface AttendanceCorrectionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  originalCheckIn?: string;
  originalCheckOut?: string;
  requestedCheckIn: string;
  requestedCheckOut: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedOn: string;
  reviewedBy?: string;
  reviewRemarks?: string;
}

export interface ESSLDevice {
  id: string;
  deviceId: string;
  deviceName: string;
  siteLocation: string;
  ipAddress: string;
  port: number;
  status: 'ONLINE' | 'OFFLINE';
  lastSyncTime: string;
  totalLogsToday: number;
}

export interface DailyDutyLog {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  projectId: string;
  projectName: string;
  siteName: string;
  workDescription: string;
  workingHours: number;
  equipmentUsed?: string[]; // IDs or names of machinery
  vehicleUsed?: string[]; // IDs or names of vehicles
  materialsUsed?: { itemName: string; quantity: number; unit: string }[];
  remarks?: string;
  photoUrl?: string;
  verifiedBy?: string; // Site Incharge
  approvedBy?: string; // Project Manager
  status: 'SUBMITTED' | 'VERIFIED' | 'APPROVED';
}

export type LeaveCategory = 'CASUAL' | 'SICK' | 'ANNUAL' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY';

export interface LeaveBalance {
  casualLeave: { total: number; taken: number; remaining: number };
  sickLeave: { total: number; taken: number; remaining: number };
  annualLeave: { total: number; taken: number; remaining: number };
  emergencyLeave: { total: number; taken: number; remaining: number };
  maternityPaternity: { total: number; taken: number; remaining: number };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveCategory: LeaveCategory;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedOn: string;
  approvedBy?: string;
  managerRemarks?: string;
}

export interface PayrollRecord {
  id: string;
  payrollMonth: string; // YYYY-MM
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  bankAccount: string;
  bankName: string;
  daysInMonth: number;
  daysWorked: number;
  paidLeaves: number;
  unpaidLeaves: number;
  overtimeHours: number;
  basicEarnedUSD: number;
  hraEarnedUSD: number;
  daEarnedUSD: number;
  allowancesUSD: number;
  overtimePayUSD: number;
  bonusUSD: number;
  grossSalaryUSD: number;
  pfDeductionUSD: number;
  esiDeductionUSD: number;
  taxTdsUSD: number;
  otherDeductionsUSD: number;
  totalDeductionsUSD: number;
  netSalaryUSD: number;
  paymentStatus: 'GENERATED' | 'PROCESSING' | 'PAID' | 'HOLD' | 'SUBMITTED_FOR_REVIEW' | 'VERIFIED' | 'APPROVED' | 'DISBURSED' | 'LOCKED';
  paymentDate?: string;
  utrReference?: string;
  // Multi-Currency & Indian Statutory Fields (P2.11)
  currency?: string;
  exchangeRateToInr?: number;
  grossINR?: number;
  netINR?: number;
  employeeVpfUSD?: number;
  professionalTaxUSD?: number;
  employerPfUSD?: number;
  employerEsiUSD?: number;
  gratuityAccrualUSD?: number;
  statutoryDetails?: {
    uan?: string;
    pfNumber?: string;
    pfOptOut?: boolean;
    esiNumber?: string;
    esiApplicable?: boolean;
    panNumber?: string;
    taxRegime?: 'NEW_REGIME' | 'OLD_REGIME';
    ptState?: string;
    gratuityEligible?: boolean;
    statutoryRuleVersions?: Record<string, number>;
  };
  makerUserId?: string;
  makerUserName?: string;
  checkerUserId?: string;
  checkerUserName?: string;
  isLocked?: boolean;
  lockHash?: string;
}

export interface LabourWorker {
  id: string;
  workerCode: string;
  fullName: string;
  skillCategory: 'Skilled Mason' | 'Structural Welder' | 'Pipe Fitter' | 'Rigging Operator' | 'Unskilled Helper' | 'Electrician';
  contractorName?: string;
  dailyWageRateUSD: number;
  overtimeHourlyRateUSD: number;
  assignedProjectId: string;
  assignedProjectName: string;
  assignedSite: string;
  mobile: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface LabourAllocation {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  siteName: string;
  contractorName?: string;
  skilledWorkersCount: number;
  unskilledWorkersCount: number;
  regularHours: number;
  overtimeHours: number;
  totalLaborCostUSD: number;
  supervisorIncharge: string;
}

export interface HRNotification {
  id: string;
  title: string;
  message: string;
  type: 'BIRTHDAY' | 'DOCUMENT_EXPIRY' | 'LEAVE_PENDING' | 'ATTENDANCE_MISSING' | 'PAYROLL_GENERATED';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}
