import { Request, Response } from 'express';
import { hrService } from '../services/hr.service';
import { logger } from '../utils/logger';

export class HrController {
  async getEmployees(req: Request, res: Response) {
    try {
      const { department, status, projectId, search } = req.query;
      const result = await hrService.getEmployees({
        department: department as string,
        status: status as string,
        projectId: projectId as string,
        search: search as string,
      });

      return res.json({
        success: true,
        count: result.length,
        data: result,
      });
    } catch (err: any) {
      logger.error(`Error fetching employees: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Server error listing employees' });
    }
  }

  async getEmployeeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const emp = await hrService.getEmployeeById(id);
      if (!emp) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      return res.json({ success: true, data: emp });
    } catch (err: any) {
      logger.error(`Error fetching employee ${req.params.id}: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to fetch employee' });
    }
  }

  async createEmployee(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const newEmp = await hrService.createEmployee(req.body, user);
      logger.info(`[HR API] Created new employee ${newEmp.employeeCode} - ${newEmp.fullName}`);

      return res.status(201).json({
        success: true,
        message: 'Employee registered successfully',
        data: newEmp,
      });
    } catch (err: any) {
      logger.error(`Error creating employee: ${err.message}`);
      return res.status(400).json({ success: false, message: err.message || 'Failed to create employee' });
    }
  }

  async updateEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const updated = await hrService.updateEmployee(id, req.body, user);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      logger.info(`[HR API] Updated employee profile ${id}`);
      return res.json({
        success: true,
        message: 'Employee updated successfully',
        data: updated,
      });
    } catch (err: any) {
      logger.error(`Error updating employee: ${err.message}`);
      return res.status(400).json({ success: false, message: err.message || 'Failed to update employee' });
    }
  }

  async deleteEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const success = await hrService.deleteEmployee(id, user);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      return res.json({ success: true, message: 'Employee deactivated successfully' });
    } catch (err: any) {
      logger.error(`Error deleting employee: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to delete employee' });
    }
  }

  async restoreEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const success = await hrService.restoreEmployee(id, user);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      return res.json({ success: true, message: 'Employee restored successfully' });
    } catch (err: any) {
      logger.error(`Error restoring employee: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to restore employee' });
    }
  }

  async bulkImportEmployees(req: Request, res: Response) {
    try {
      const list = req.body.employees || [];
      const user = (req as any).user;
      const result = await hrService.bulkImportEmployees(list, user);
      return res.json({ success: true, ...result });
    } catch (err: any) {
      logger.error(`Error bulk importing employees: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to bulk import employees' });
    }
  }

  async getReportingHierarchyTree(req: Request, res: Response) {
    try {
      const tree = await hrService.getReportingHierarchyTree();
      return res.json({ success: true, data: tree });
    } catch (err: any) {
      logger.error(`Error building hierarchy tree: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to build hierarchy tree' });
    }
  }

  async getAttendance(req: Request, res: Response) {
    try {
      const { date, department, employeeId } = req.query;
      const result = await hrService.getAttendance({
        date: date as string,
        department: department as string,
        employeeId: employeeId as string,
      });

      return res.json({
        success: true,
        count: result.records.length,
        data: result.records,
        esslDevices: result.devices,
      });
    } catch (err: any) {
      logger.error(`Error fetching attendance: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
    }
  }

  async punchAttendance(req: Request, res: Response) {
    try {
      const { employeeId, type, location, remarks } = req.body;
      const result = await hrService.punchAttendance({ employeeId, type, location, remarks });

      if (!result) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      return res.json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (err: any) {
      logger.error(`Error punching attendance: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to punch attendance' });
    }
  }

  async syncEssl(req: Request, res: Response) {
    try {
      const { deviceId } = req.body;
      const result = await hrService.syncEssl(deviceId);

      return res.json({
        success: true,
        message: result.message,
        devices: result.devices,
      });
    } catch (err: any) {
      logger.error(`Error syncing ESSL: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to sync ESSL devices' });
    }
  }

  async getDutyLogs(req: Request, res: Response) {
    try {
      const result = await hrService.getDutyLogs();
      return res.json({
        success: true,
        count: result.length,
        data: result,
      });
    } catch (err: any) {
      logger.error(`Error fetching duty logs: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to fetch duty logs' });
    }
  }

  async createDutyLog(req: Request, res: Response) {
    try {
      const newLog = await hrService.createDutyLog(req.body);
      logger.info(`[HR API] Submitted new Duty Log by ${newLog.employeeName}`);

      return res.status(201).json({
        success: true,
        message: 'Daily duty log submitted successfully',
        data: newLog,
      });
    } catch (err: any) {
      logger.error(`Error submitting duty log: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to submit duty log' });
    }
  }

  async verifyDutyLog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, verifiedBy, approvedBy } = req.body;
      const updated = await hrService.verifyDutyLog(id, { status, verifiedBy, approvedBy });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Duty log not found' });
      }

      return res.json({
        success: true,
        message: `Duty log updated to ${updated.status}`,
        data: updated,
      });
    } catch (err: any) {
      logger.error(`Error verifying duty log: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to verify duty log' });
    }
  }

  async getLeaves(req: Request, res: Response) {
    try {
      const result = await hrService.getLeaves();
      return res.json({
        success: true,
        requests: result.requests,
        balances: result.balances,
      });
    } catch (err: any) {
      logger.error(`Error fetching leave data: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to fetch leave data' });
    }
  }

  async createLeave(req: Request, res: Response) {
    try {
      const newReq = await hrService.createLeave(req.body);
      return res.status(201).json({
        success: true,
        message: 'Leave application submitted to reporting manager.',
        data: newReq,
      });
    } catch (err: any) {
      logger.error(`Error applying leave: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to apply leave' });
    }
  }

  async approveLeave(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { action, approvedBy, remarks } = req.body;
      const updated = await hrService.approveLeave(id, { action, approvedBy, remarks });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Leave request not found' });
      }

      return res.json({
        success: true,
        message: `Leave request has been ${action.toLowerCase()}`,
        data: updated,
      });
    } catch (err: any) {
      logger.error(`Error approving leave: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to update leave request' });
    }
  }

  async getPayroll(req: Request, res: Response) {
    try {
      const result = await hrService.getPayroll();
      return res.json({
        success: true,
        count: result.length,
        data: result,
      });
    } catch (err: any) {
      logger.error(`Error fetching payroll records: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to fetch payroll records' });
    }
  }

  async generatePayroll(req: Request, res: Response) {
    try {
      const { monthYear } = req.body;
      const newGenerated = await hrService.generatePayroll(monthYear);

      return res.json({
        success: true,
        message: `Payroll for ${monthYear || '2026-08'} generated successfully for ${newGenerated.length} employees.`,
        data: newGenerated,
      });
    } catch (err: any) {
      logger.error(`Error generating payroll: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to generate payroll' });
    }
  }

  async getLabour(req: Request, res: Response) {
    try {
      const result = await hrService.getLabour();
      return res.json({
        success: true,
        workers: result.workers,
        allocations: result.allocations,
      });
    } catch (err: any) {
      logger.error(`Error fetching labour data: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to fetch labour data' });
    }
  }

  async createLabourAllocation(req: Request, res: Response) {
    try {
      const newAlloc = await hrService.createLabourAllocation(req.body);
      return res.status(201).json({
        success: true,
        message: 'Labour allocation logged successfully',
        data: newAlloc,
      });
    } catch (err: any) {
      logger.error(`Error logging labour allocation: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to log labour allocation' });
    }
  }

  async getNotifications(req: Request, res: Response) {
    try {
      const result = await hrService.getNotifications();
      return res.json({
        success: true,
        count: result.length,
        data: result,
      });
    } catch (err: any) {
      logger.error(`Error fetching HR notifications: ${err.message}`);
      return res.status(500).json({ success: false, message: 'Failed to fetch HR notifications' });
    }
  }
}

export const hrController = new HrController();
