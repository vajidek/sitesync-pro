import { HrmsRepository } from '../repositories/hrms.repository';
import { isDemoSeedAllowed } from '../config/env';

export class HrmsService {
  private repo: HrmsRepository;

  constructor() {
    this.repo = new HrmsRepository();
  }

  // Dashboard & Metrics
  public async getDashboardStats() {
    return this.repo.getHrmsStats();
  }

  // Departments
  public async getAllDepartments() {
    return this.repo.getDepartments();
  }

  public async createDepartment(data: any) {
    return this.repo.createDepartment(data);
  }

  // Designations
  public async getAllDesignations() {
    return this.repo.getDesignations();
  }

  public async createDesignation(data: any) {
    return this.repo.createDesignation(data);
  }

  // Employees
  public async getAllEmployees() {
    return this.repo.getEmployees();
  }

  public async getEmployee(id: string) {
    return this.repo.getEmployeeById(id);
  }

  public async createEmployee(data: any, actor: { userId: string; userName: string }) {
    return this.repo.createEmployee(data, actor);
  }

  public async updateEmployee(id: string, data: any, actor: { userId: string; userName: string }) {
    return this.repo.updateEmployee(id, data, actor);
  }

  // Attendance & Biometrics
  public async getAttendanceRecords(date?: string) {
    return this.repo.getAttendanceRecords(date);
  }

  public async recordAttendance(data: any) {
    return this.repo.recordAttendance(data);
  }

  public async syncEsslBiometrics(deviceId: string, records: any[] = []) {
    if (!deviceId) {
      throw new Error('Biometric device ID is required for synchronization.');
    }

    // Real environments must receive source punches from the configured eSSL integration.
    // Synthetic punches are permitted only when the explicit demo-seed policy is enabled.
    if (records.length === 0 && !isDemoSeedAllowed()) {
      throw new Error('No biometric source records were received. Synthetic attendance punches are disabled outside DEMO mode.');
    }

    const punches = records.length > 0 ? records : [
      { biometricId: 'ESSL-1001', punchType: 'CHECK_IN', timestamp: new Date().toISOString() },
      { biometricId: 'ESSL-1002', punchType: 'CHECK_IN', timestamp: new Date().toISOString() },
      { biometricId: 'ESSL-1003', punchType: 'CHECK_IN', timestamp: new Date().toISOString() },
    ];
    return this.repo.syncEsslBiometric(deviceId, punches);
  }

  // Shifts
  public async getAllShifts() {
    return this.repo.getShifts();
  }

  public async createShift(data: any) {
    return this.repo.createShift(data);
  }

  // Leave Management
  public async getLeaveTypes() {
    return this.repo.getLeaveTypes();
  }

  public async getLeaveApplications() {
    return this.repo.getLeaveApplications();
  }

  public async applyLeave(data: any) {
    return this.repo.applyLeave(data);
  }

  public async reviewLeave(id: string, status: string, remarks: string | undefined, actor: { userId: string; userName: string }) {
    return this.repo.reviewLeave(id, status, remarks, actor);
  }

  // Holidays
  public async getHolidays(year?: number) {
    return this.repo.getHolidays(year);
  }

  // Payroll
  public async getSalaryStructures() {
    return this.repo.getSalaryStructures();
  }

  public async createSalaryStructure(data: any, actor: { userId: string; userName: string }) {
    return this.repo.createSalaryStructure(data, actor);
  }

  public async getPayrollPeriods() {
    return this.repo.getPayrollPeriods();
  }

  public async getPayslips(periodId?: string) {
    return this.repo.getPayslips(periodId);
  }

  public async processPayrollRun(
    periodId: string,
    remarks?: string,
    options?: {
      makerUserId?: string;
      makerUserName?: string;
      currency?: string;
      jurisdiction?: string;
    }
  ) {
    return this.repo.executePayrollRun(periodId, remarks, options);
  }

  // Statutory Rules & Employee Profiles
  public async getStatutoryRules(jurisdiction?: string) {
    return this.repo.getStatutoryRules(jurisdiction);
  }

  public async upsertStatutoryRule(data: any, actor?: string) {
    return this.repo.upsertStatutoryRule(data, actor);
  }

  public async getEmployeeStatutoryProfile(employeeId: string) {
    return this.repo.getEmployeeStatutoryProfile(employeeId);
  }

  public async updateEmployeeStatutoryProfile(employeeId: string, data: any, actor?: string) {
    return this.repo.updateEmployeeStatutoryProfile(employeeId, data, actor);
  }

  public async getPayrollRuns() {
    return this.repo.getPayrollRuns();
  }

  public async getPayrollRunById(runId: string) {
    return this.repo.getPayrollRunById(runId);
  }

  public async submitPayrollForReview(runId: string, actor: { userId: string; userName: string }) {
    return this.repo.submitPayrollForReview(runId, actor);
  }

  public async approvePayrollRun(runId: string, checker: { userId: string; userName: string }, remarks?: string) {
    return this.repo.approvePayrollRun(runId, checker, remarks);
  }

  public async rejectPayrollRun(runId: string, checker: { userId: string; userName: string }, remarks: string) {
    return this.repo.rejectPayrollRun(runId, checker, remarks);
  }

  public async disbursePayrollRun(runId: string, actor: { userId: string; userName: string }, neftBatchReference?: string) {
    return this.repo.disbursePayrollRun(runId, actor, neftBatchReference);
  }

  public async holdPayslip(payslipId: string, actor: { userId: string; userName: string }, reason: string) {
    return this.repo.holdEmployeePayslip(payslipId, actor, reason);
  }

  public async unholdPayslip(payslipId: string, actor: { userId: string; userName: string }, reason?: string) {
    return this.repo.unholdEmployeePayslip(payslipId, actor, reason);
  }

  public async getRawBiometricPunches(params?: any) {
    return this.repo.getRawBiometricPunches(params);
  }

  // Loans & Advances
  public async getLoans() {
    return this.repo.getLoans();
  }

  public async applyLoan(data: any, actor: { userId: string; userName: string; role?: string }) {
    return this.repo.createLoan(data, actor);
  }

  public async approveLoan(loanId: string, actor: { userId: string; userName: string }, remarks?: string) {
    return this.repo.approveLoan(loanId, actor, remarks);
  }

  public async getLoanRecoveries(loanId?: string, employeeId?: string, periodId?: string) {
    return this.repo.getLoanRecoveries(loanId, employeeId, periodId);
  }

  public async simulateLoanRecovery(employeeId: string, payableDutyDays: number, grossSalary?: number) {
    return this.repo.simulateLoanRecovery(employeeId, payableDutyDays, grossSalary);
  }

  // Attendance Finalization
  public async getAttendanceFinalizations(periodId?: string, monthYear?: string) {
    return this.repo.getAttendanceFinalizations(periodId, monthYear);
  }

  public async finalizeAttendance(data: {
    periodId: string;
    monthYear: string;
    finalizedBy?: string;
    records?: any[];
    remarks?: string;
  }) {
    return this.repo.finalizeAttendanceForPeriod(data);
  }

  public async unlockAttendanceFinalization(periodId: string, actor: { userId: string; userName: string }, reason: string) {
    return this.repo.unlockAttendanceFinalization(periodId, actor, reason);
  }

  // Performance Reviews
  public async getPerformanceReviews() {
    return this.repo.getPerformanceReviews();
  }

  public async createPerformanceReview(data: any) {
    return this.repo.createPerformanceReview(data);
  }

  // Recruitment
  public async getRecruitmentRequisitions() {
    return this.repo.getRecruitmentRequisitions();
  }

  public async createRecruitmentRequisition(data: any) {
    return this.repo.createRecruitmentRequisition(data);
  }

  public async getCandidates() {
    return this.repo.getCandidates();
  }

  public async createCandidate(data: any) {
    return this.repo.createCandidate(data);
  }

  // Training Programs
  public async getTrainingPrograms() {
    return this.repo.getTrainingPrograms();
  }

  public async createTrainingProgram(data: any) {
    return this.repo.createTrainingProgram(data);
  }

  // Audit Logs
  public async getAuditLogs() {
    return this.repo.getAuditLogs();
  }
}
