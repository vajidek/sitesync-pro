import { Request, Response } from 'express';
import { HrmsService } from '../services/hrms.service';

export class HrmsController {
  private service: HrmsService;

  constructor() {
    this.service = new HrmsService();
  }

  // Dashboard Stats
  public getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Departments
  public getDepartments = async (req: Request, res: Response): Promise<void> => {
    try {
      const depts = await this.service.getAllDepartments();
      res.status(200).json({ success: true, data: depts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const dept = await this.service.createDepartment(req.body);
      res.status(201).json({ success: true, data: dept });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Designations
  public getDesignations = async (req: Request, res: Response): Promise<void> => {
    try {
      const desigs = await this.service.getAllDesignations();
      res.status(200).json({ success: true, data: desigs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createDesignation = async (req: Request, res: Response): Promise<void> => {
    try {
      const desig = await this.service.createDesignation(req.body);
      res.status(201).json({ success: true, data: desig });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Employees
  public getEmployees = async (req: Request, res: Response): Promise<void> => {
    try {
      const employees = await this.service.getAllEmployees();
      res.status(200).json({ success: true, data: employees });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public getEmployeeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const emp = await this.service.getEmployee(id);
      if (!emp) {
        res.status(404).json({ success: false, message: 'Employee not found' });
        return;
      }
      res.status(200).json({ success: true, data: emp });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const emp = await this.service.createEmployee(req.body);
      res.status(201).json({ success: true, data: emp });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public updateEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const emp = await this.service.updateEmployee(id, req.body);
      res.status(200).json({ success: true, data: emp });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Attendance
  public getAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;
      const records = await this.service.getAttendanceRecords(date as string);
      res.status(200).json({ success: true, data: records });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public recordAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
      const rec = await this.service.recordAttendance(req.body);
      res.status(201).json({ success: true, data: rec });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public syncEssl = async (req: Request, res: Response): Promise<void> => {
    try {
      const deviceId = String(req.body?.deviceId || '').trim();
      const records = Array.isArray(req.body?.records) ? req.body.records : [];
      if (!deviceId) {
        res.status(400).json({ success: false, message: 'Biometric device ID is required.' });
        return;
      }
      const result = await this.service.syncEsslBiometrics(deviceId, records);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Shifts
  public getShifts = async (req: Request, res: Response): Promise<void> => {
    try {
      const shifts = await this.service.getAllShifts();
      res.status(200).json({ success: true, data: shifts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createShift = async (req: Request, res: Response): Promise<void> => {
    try {
      const shift = await this.service.createShift(req.body);
      res.status(201).json({ success: true, data: shift });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Leaves
  public getLeaveTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      const types = await this.service.getLeaveTypes();
      res.status(200).json({ success: true, data: types });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public getLeaves = async (req: Request, res: Response): Promise<void> => {
    try {
      const leaves = await this.service.getLeaveApplications();
      res.status(200).json({ success: true, data: leaves });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public applyLeave = async (req: Request, res: Response): Promise<void> => {
    try {
      const leave = await this.service.applyLeave(req.body);
      res.status(201).json({ success: true, data: leave });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public reviewLeave = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;
      const user = (req as any).user;
      const approver = String(user?.name || user?.email || '').trim();
      const approverId = String(user?.id || '').trim();
      if (!approver || !approverId) {
        res.status(401).json({ success: false, message: 'Authenticated leave reviewer identity is required.' });
        return;
      }
      const updated = await this.service.reviewLeave(id, status, remarks, approver, approverId);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Holidays
  public getHolidays = async (req: Request, res: Response): Promise<void> => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : 2026;
      const holidays = await this.service.getHolidays(year);
      res.status(200).json({ success: true, data: holidays });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Payroll
  public getSalaryStructures = async (req: Request, res: Response): Promise<void> => {
    try {
      const structures = await this.service.getSalaryStructures();
      res.status(200).json({ success: true, data: structures });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createSalaryStructure = async (req: Request, res: Response): Promise<void> => {
    try {
      const struct = await this.service.createSalaryStructure(req.body);
      res.status(201).json({ success: true, data: struct });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public getPayrollPeriods = async (req: Request, res: Response): Promise<void> => {
    try {
      const periods = await this.service.getPayrollPeriods();
      res.status(200).json({ success: true, data: periods });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public getPayslips = async (req: Request, res: Response): Promise<void> => {
    try {
      const { periodId } = req.query;
      const payslips = await this.service.getPayslips(periodId as string);
      res.status(200).json({ success: true, data: payslips });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public executePayrollRun = async (req: Request, res: Response): Promise<void> => {
    try {
      const { periodId, remarks, currency, jurisdiction } = req.body;
      const user = (req as any).user;
      const makerUserId = String(user?.id || '').trim();
      const makerUserName = String(user?.name || user?.fullName || user?.email || '').trim();
      if (!makerUserId || !makerUserName) {
        res.status(401).json({ success: false, message: 'Authenticated payroll maker identity is required.' });
        return;
      }
      const runResult = await this.service.processPayrollRun(periodId, remarks, {
        makerUserId,
        makerUserName,
        currency,
        jurisdiction,
      });
      res.status(200).json({ success: true, data: runResult });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Statutory Rules
  public getStatutoryRules = async (req: Request, res: Response): Promise<void> => {
    try {
      const { jurisdiction } = req.query;
      const rules = await this.service.getStatutoryRules(jurisdiction as string);
      res.status(200).json({ success: true, data: rules });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public upsertStatutoryRule = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;
      const actor = String(user?.name || user?.email || '').trim();
      if (!actor) {
        res.status(401).json({ success: false, message: 'Authenticated HR actor identity is required.' });
        return;
      }
      const rule = await this.service.upsertStatutoryRule(req.body, actor);
      res.status(200).json({ success: true, data: rule });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Employee Statutory Profile
  public getEmployeeStatutoryProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const profile = await this.service.getEmployeeStatutoryProfile(employeeId);
      res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public updateEmployeeStatutoryProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const user = (req as any).user;
      const actor = String(user?.name || user?.email || '').trim();
      if (!actor) {
        res.status(401).json({ success: false, message: 'Authenticated HR actor identity is required.' });
        return;
      }
      const updated = await this.service.updateEmployeeStatutoryProfile(employeeId, req.body, actor);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Payroll Runs (Maker-Checker Lifecycle)
  public getPayrollRuns = async (req: Request, res: Response): Promise<void> => {
    try {
      const runs = await this.service.getPayrollRuns();
      res.status(200).json({ success: true, data: runs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public getPayrollRunById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const run = await this.service.getPayrollRunById(id);
      if (!run) {
        res.status(404).json({ success: false, message: 'Payroll run not found' });
        return;
      }
      res.status(200).json({ success: true, data: run });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public submitPayrollForReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const actorId = String(user?.id || '').trim();
      const actorName = String(user?.name || user?.email || '').trim();
      if (!actorId || !actorName) {
        res.status(401).json({ success: false, message: 'Authenticated payroll actor identity is required.' });
        return;
      }
      const updated = await this.service.submitPayrollForReview(id, {
        userId: user.id,
        userName: user.name || user.email,
      });
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public approvePayrollRun = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const user = (req as any).user;
      const actorId = String(user?.id || '').trim();
      const actorName = String(user?.name || user?.email || '').trim();
      if (!actorId || !actorName) {
        res.status(401).json({ success: false, message: 'Authenticated payroll actor identity is required.' });
        return;
      }
      const updated = await this.service.approvePayrollRun(
        id,
        {
          userId: user.id,
          userName: user.name || user.email,
        },
        remarks
      );
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public rejectPayrollRun = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const user = (req as any).user;
      const actorId = String(user?.id || '').trim();
      const actorName = String(user?.name || user?.email || '').trim();
      if (!actorId || !actorName) {
        res.status(401).json({ success: false, message: 'Authenticated payroll actor identity is required.' });
        return;
      }
      const updated = await this.service.rejectPayrollRun(
        id,
        {
          userId: user.id,
          userName: user.name || user.email,
        },
        remarks || 'Rejected by QA Checker for revision'
      );
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public disbursePayrollRun = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { neftBatchReference } = req.body;
      const user = (req as any).user;
      const actorId = String(user?.id || '').trim();
      const actorName = String(user?.name || user?.email || '').trim();
      if (!actorId || !actorName) {
        res.status(401).json({ success: false, message: 'Authenticated payroll disbursement actor is required.' });
        return;
      }
      const updated = await this.service.disbursePayrollRun(
        id,
        {
          userId: actorId,
          userName: actorName,
        },
        neftBatchReference
      );
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public holdPayslip = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      if (!reason) {
        res.status(400).json({ success: false, message: 'A mandatory reason is required to place an employee payroll on hold' });
        return;
      }
      const user = (req as any).user;
      const actorId = String(user?.id || '').trim();
      const actorName = String(user?.name || user?.email || '').trim();
      if (!actorId || !actorName) {
        res.status(401).json({ success: false, message: 'Authenticated payroll actor is required.' });
        return;
      }
      const updated = await this.service.holdPayslip(
        id,
        {
          userId: actorId,
          userName: actorName,
        },
        reason
      );
      res.status(200).json({ success: true, data: updated, message: 'Employee payroll placed on hold successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public unholdPayslip = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      if (!reason) {
        res.status(400).json({ success: false, message: 'A mandatory reason is required to release a payroll hold.' });
        return;
      }
      const user = (req as any).user;
      const actorId = String(user?.id || '').trim();
      const actorName = String(user?.name || user?.email || '').trim();
      if (!actorId || !actorName) {
        res.status(401).json({ success: false, message: 'Authenticated payroll actor is required.' });
        return;
      }
      const updated = await this.service.unholdPayslip(
        id,
        {
          userId: actorId,
          userName: actorName,
        },
        reason
      );
      res.status(200).json({ success: true, data: updated, message: 'Employee payroll hold released successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getRawBiometricPunches = async (req: Request, res: Response): Promise<void> => {
    try {
      const { deviceId, biometricId, employeeId, limit } = req.query;
      const punches = await this.service.getRawBiometricPunches({
        deviceId: deviceId as string,
        biometricId: biometricId as string,
        employeeId: employeeId as string,
        limit: limit ? Number(limit) : 200,
      });
      res.status(200).json({ success: true, count: punches.length, data: punches });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Loans
  public getLoans = async (req: Request, res: Response): Promise<void> => {
    try {
      const loans = await this.service.getLoans();
      res.status(200).json({ success: true, data: loans });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createLoan = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;
      const actorId = String(user?.id || '').trim();
      const actorName = String(user?.name || user?.email || '').trim();
      if (!actorId || !actorName) {
        res.status(401).json({ success: false, message: 'Authenticated loan requester identity is required.' });
        return;
      }

      const loan = await this.service.applyLoan({
        ...req.body,
        userId: actorId,
        createdById: actorId,
        createdBy: actorName,
        employeeName: actorName,
      });
      res.status(201).json({ success: true, data: loan });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public approveLoan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const user = (req as any).user;
      const actorId = String(user?.id || '').trim();
      const actorName = String(user?.name || user?.email || '').trim();
      if (!actorId || !actorName) {
        res.status(401).json({ success: false, message: 'Authenticated loan approver identity is required.' });
        return;
      }
      const loan = await this.service.approveLoan(
        id,
        { userId: actorId, userName: actorName },
        remarks
      );
      res.status(200).json({ success: true, data: loan });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public getLoanRecoveries = async (req: Request, res: Response): Promise<void> => {
    try {
      const { loanId, employeeId, periodId } = req.query;
      const recoveries = await this.service.getLoanRecoveries(
        loanId as string,
        employeeId as string,
        periodId as string
      );
      res.status(200).json({ success: true, data: recoveries });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public simulateLoanRecovery = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, payableDutyDays, grossSalary } = req.body;
      if (!employeeId || payableDutyDays == null) {
        res.status(400).json({ success: false, message: 'Employee ID and payable duty days are required for loan recovery simulation.' });
        return;
      }
      const result = await this.service.simulateLoanRecovery(
        employeeId,
        Number(payableDutyDays),
        grossSalary == null ? undefined : Number(grossSalary)
      );
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Attendance Finalization
  public getAttendanceFinalizations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { periodId, monthYear } = req.query;
      const finalizations = await this.service.getAttendanceFinalizations(
        periodId as string,
        monthYear as string
      );
      res.status(200).json({ success: true, data: finalizations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public finalizeAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { periodId, monthYear, records, remarks } = req.body;
      const user = (req as any).user;
      const actorId = String(user?.id || '').trim();
      const actorName = String(user?.name || user?.email || '').trim();
      if (!actorId || !actorName) {
        res.status(401).json({ success: false, message: 'Authenticated payroll actor identity is required.' });
        return;
      }
      const finalizedBy = String(user?.name || user?.email || '').trim();
      if (!finalizedBy) {
        res.status(401).json({ success: false, message: 'Authenticated attendance finalizer identity is required.' });
        return;
      }
      const result = await this.service.finalizeAttendance({
        periodId,
        monthYear,
        finalizedBy,
        records,
        remarks,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public unlockAttendanceFinalization = async (req: Request, res: Response): Promise<void> => {
    try {
      const { periodId, reason } = req.body;
      const user = (req as any).user;
      const userId = String(user?.id || '').trim();
      const userName = String(user?.name || user?.email || '').trim();
      const unlockReason = String(reason || '').trim();
      if (!userId || !userName) {
        res.status(401).json({ success: false, message: 'Authenticated unlock actor identity is required.' });
        return;
      }
      if (!unlockReason) {
        res.status(400).json({ success: false, message: 'A reason is required to unlock finalized attendance.' });
        return;
      }
      const result = await this.service.unlockAttendanceFinalization(
        periodId,
        { userId, userName },
        unlockReason
      );
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Performance Reviews
  public getPerformanceReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const reviews = await this.service.getPerformanceReviews();
      res.status(200).json({ success: true, data: reviews });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createPerformanceReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const review = await this.service.createPerformanceReview(req.body);
      res.status(201).json({ success: true, data: review });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Recruitment
  public getRecruitments = async (req: Request, res: Response): Promise<void> => {
    try {
      const requisitions = await this.service.getRecruitmentRequisitions();
      res.status(200).json({ success: true, data: requisitions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createRecruitment = async (req: Request, res: Response): Promise<void> => {
    try {
      const requisition = await this.service.createRecruitmentRequisition(req.body);
      res.status(201).json({ success: true, data: requisition });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public getCandidates = async (req: Request, res: Response): Promise<void> => {
    try {
      const candidates = await this.service.getCandidates();
      res.status(200).json({ success: true, data: candidates });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createCandidate = async (req: Request, res: Response): Promise<void> => {
    try {
      const candidate = await this.service.createCandidate(req.body);
      res.status(201).json({ success: true, data: candidate });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Training Programs
  public getTrainingPrograms = async (req: Request, res: Response): Promise<void> => {
    try {
      const programs = await this.service.getTrainingPrograms();
      res.status(200).json({ success: true, data: programs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createTrainingProgram = async (req: Request, res: Response): Promise<void> => {
    try {
      const program = await this.service.createTrainingProgram(req.body);
      res.status(201).json({ success: true, data: program });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Audit Logs
  public getAuditLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const logs = await this.service.getAuditLogs();
      res.status(200).json({ success: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
