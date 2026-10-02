import { hrRepository } from '../repositories/hr.repository';
import {
  Employee,
  DailyAttendanceRecord,
  ESSLDevice,
  DailyDutyLog,
  LeaveRequest,
  PayrollRecord,
  LabourWorker,
  LabourAllocation,
  HRNotification,
} from '../../types/hr';

export class HrService {
  async getEmployees(filters: { department?: string; status?: string; projectId?: string; search?: string }): Promise<Employee[]> {
    return await hrRepository.getEmployees(filters);
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    return await hrRepository.getEmployeeById(id);
  }

  async createEmployee(data: Partial<Employee>, currentUser?: { id?: string; email?: string; role?: string }): Promise<Employee> {
    return await hrRepository.createEmployee(data, currentUser);
  }

  async updateEmployee(id: string, updates: Partial<Employee>, currentUser?: { id?: string; email?: string; role?: string }): Promise<Employee | null> {
    return await hrRepository.updateEmployee(id, updates, currentUser);
  }

  async deleteEmployee(id: string, currentUser?: { id?: string; email?: string; role?: string }): Promise<boolean> {
    return await hrRepository.deleteEmployee(id, currentUser);
  }

  async restoreEmployee(id: string, currentUser?: { id?: string; email?: string; role?: string }): Promise<boolean> {
    return await hrRepository.restoreEmployee(id, currentUser);
  }

  async bulkImportEmployees(list: Partial<Employee>[], currentUser?: { id?: string; email?: string; role?: string }): Promise<{ importedCount: number; errors: string[] }> {
    return await hrRepository.bulkImportEmployees(list, currentUser);
  }

  async getReportingHierarchyTree(): Promise<any[]> {
    return await hrRepository.getReportingHierarchyTree();
  }

  async getAttendance(filters: { date?: string; department?: string; employeeId?: string }): Promise<{ records: DailyAttendanceRecord[]; devices: ESSLDevice[] }> {
    return await hrRepository.getAttendance(filters);
  }

  async punchAttendance(data: { employeeId: string; type: string; location?: string; remarks?: string }) {
    return await hrRepository.punchAttendance(data);
  }

  async syncEssl(deviceId?: string) {
    return await hrRepository.syncEssl(deviceId);
  }

  async getDutyLogs(): Promise<DailyDutyLog[]> {
    return await hrRepository.getDutyLogs();
  }

  async createDutyLog(data: Partial<DailyDutyLog>): Promise<DailyDutyLog> {
    return await hrRepository.createDutyLog(data);
  }

  async verifyDutyLog(id: string, updates: { status?: string; verifiedBy?: string; approvedBy?: string }): Promise<DailyDutyLog | null> {
    return await hrRepository.verifyDutyLog(id, updates);
  }

  async getLeaves(): Promise<{ requests: LeaveRequest[]; balances: any }> {
    return await hrRepository.getLeaves();
  }

  async createLeave(data: Partial<LeaveRequest>): Promise<LeaveRequest> {
    return await hrRepository.createLeave(data);
  }

  async approveLeave(id: string, updates: { action: string; approvedBy?: string; remarks?: string }): Promise<LeaveRequest | null> {
    return await hrRepository.approveLeave(id, updates);
  }

  async getPayroll(): Promise<PayrollRecord[]> {
    return await hrRepository.getPayroll();
  }

  async generatePayroll(monthYear?: string): Promise<PayrollRecord[]> {
    return await hrRepository.generatePayroll(monthYear);
  }

  async getLabour(): Promise<{ workers: LabourWorker[]; allocations: LabourAllocation[] }> {
    return await hrRepository.getLabour();
  }

  async createLabourAllocation(data: Partial<LabourAllocation>): Promise<LabourAllocation> {
    return await hrRepository.createLabourAllocation(data);
  }

  async getNotifications(): Promise<HRNotification[]> {
    return await hrRepository.getNotifications();
  }
}

export const hrService = new HrService();
