import { Request, Response } from 'express';
import { employeeExpenseRepository } from '../repositories/employee_expense.repository';

export class EmployeeExpenseController {
  public async getExpenseClaims(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, projectId, status, category } = req.query;
      const claims = await employeeExpenseRepository.getExpenseClaims({
        employeeId: employeeId as string,
        projectId: projectId as string,
        status: status as string,
        category: category as string,
      });
      res.json({ success: true, data: claims });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getExpenseClaimById(req: Request, res: Response): Promise<void> {
    try {
      const claim = await employeeExpenseRepository.getExpenseClaimById(req.params.id);
      if (!claim) {
        res.status(404).json({ success: false, error: 'Expense claim not found' });
        return;
      }
      res.json({ success: true, data: claim });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createExpenseClaim(req: Request, res: Response): Promise<void> {
    try {
      const claim = await employeeExpenseRepository.createExpenseClaim(req.body);
      res.status(201).json({ success: true, data: claim, message: 'Expense claim created successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async checkDuplicate(req: Request, res: Response): Promise<void> {
    try {
      const result = employeeExpenseRepository.checkDuplicateClaim(req.body);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async approveByManager(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { approverId, approverName, role, remarks } = req.body;
      const updated = await employeeExpenseRepository.approveByManager(id, {
        id: approverId || 'emp-mgr-01',
        name: approverName || 'Site Manager',
        role: role || 'SITE_MANAGER',
        remarks,
      });
      if (!updated) {
        res.status(404).json({ success: false, error: 'Expense claim not found' });
        return;
      }
      res.json({ success: true, data: updated, message: 'Expense claim approved by manager' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async verifyByFinance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await employeeExpenseRepository.verifyByFinance(id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Expense claim not found' });
        return;
      }
      res.json({ success: true, data: updated, message: 'Finance verification and classification completed' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async disbursePayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await employeeExpenseRepository.disbursePayment(id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Expense claim not found' });
        return;
      }
      res.json({ success: true, data: updated, message: 'Payment disbursed and General Ledger Journal posted' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async rejectClaim(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId, userName, reason } = req.body;
      const updated = await employeeExpenseRepository.rejectClaim(id, {
        id: userId || 'reviewer',
        name: userName || 'Reviewer',
        reason: reason || 'Non-compliant expense',
      });
      if (!updated) {
        res.status(404).json({ success: false, error: 'Expense claim not found' });
        return;
      }
      res.json({ success: true, data: updated, message: 'Expense claim rejected' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async requestClarification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId, userName, question } = req.body;
      const updated = await employeeExpenseRepository.requestClarification(id, {
        id: userId || 'fin-officer',
        name: userName || 'Finance Officer',
        question: question || 'Please provide GST invoice copy',
      });
      if (!updated) {
        res.status(404).json({ success: false, error: 'Expense claim not found' });
        return;
      }
      res.json({ success: true, data: updated, message: 'Clarification requested' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Categories
  public async getCategories(_req: Request, res: Response): Promise<void> {
    try {
      const categories = employeeExpenseRepository.getCategories();
      res.json({ success: true, data: categories });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async addCategory(req: Request, res: Response): Promise<void> {
    try {
      const cat = employeeExpenseRepository.addCategory(req.body);
      res.status(201).json({ success: true, data: cat });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // Advances
  public async getCashAdvances(req: Request, res: Response): Promise<void> {
    try {
      const advances = await employeeExpenseRepository.getCashAdvances(req.query.employeeId as string);
      res.json({ success: true, data: advances });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createCashAdvance(req: Request, res: Response): Promise<void> {
    try {
      const adv = await employeeExpenseRepository.createCashAdvance(req.body);
      res.status(201).json({ success: true, data: adv, message: 'Cash advance requested successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async disburseCashAdvance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { paymentRef, amount } = req.body;
      const adv = await employeeExpenseRepository.disburseCashAdvance(id, paymentRef, amount);
      if (!adv) {
        res.status(404).json({ success: false, error: 'Advance not found' });
        return;
      }
      res.json({ success: true, data: adv, message: 'Cash advance disbursed' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async settleCashAdvance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adv = await employeeExpenseRepository.settleCashAdvance(id, req.body);
      if (!adv) {
        res.status(404).json({ success: false, error: 'Advance not found' });
        return;
      }
      res.json({ success: true, data: adv, message: 'Cash advance settlement calculated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Petty Cash
  public async getPettyCashRegisters(_req: Request, res: Response): Promise<void> {
    try {
      const regs = await employeeExpenseRepository.getPettyCashRegisters();
      res.json({ success: true, data: regs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getPettyCashVouchers(req: Request, res: Response): Promise<void> {
    try {
      const vouchers = await employeeExpenseRepository.getPettyCashVouchers(req.query.registerId as string);
      res.json({ success: true, data: vouchers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createPettyCashVoucher(req: Request, res: Response): Promise<void> {
    try {
      const voucher = await employeeExpenseRepository.createPettyCashVoucher(req.body);
      res.status(201).json({ success: true, data: voucher, message: 'Petty cash voucher posted' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async reconcilePettyCash(req: Request, res: Response): Promise<void> {
    try {
      const { registerId, physicalCashCount, reconciledBy, remarks } = req.body;
      const reg = await employeeExpenseRepository.reconcilePettyCashRegister(
        registerId,
        Number(physicalCashCount),
        reconciledBy || 'Site Auditor',
        remarks
      );
      if (!reg) {
        res.status(404).json({ success: false, error: 'Petty cash register not found' });
        return;
      }
      res.json({ success: true, data: reg, message: 'Petty cash reconciliation recorded' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Reports
  public async getExpenseReports(_req: Request, res: Response): Promise<void> {
    try {
      const reports = await employeeExpenseRepository.getExpenseReports();
      res.json({ success: true, data: reports });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const employeeExpenseController = new EmployeeExpenseController();
