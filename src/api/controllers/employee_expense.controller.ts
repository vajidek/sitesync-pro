import { Request, Response } from 'express';
import { employeeExpenseRepository } from '../repositories/employee_expense.repository';
import { AuthenticatedRequest } from '../types/auth';
function getAuth(req: Request): AuthenticatedRequest['user'] | null {
  return (req as AuthenticatedRequest).user || null;
}

function hasPermission(user: NonNullable<AuthenticatedRequest['user']>, permissions: string[]): boolean {
  return user.role === 'ADMIN' || permissions.some((permission) => (user.permissions || []).includes(permission));
}

function canReviewExpense(user: NonNullable<AuthenticatedRequest['user']>): boolean {
  return ['ADMIN', 'MANAGER', 'INCHARGE'].includes(user.role) || hasPermission(user, ['expenses:approve', 'expenses:manage', 'finance:expense:approve']);
}

function canFinanceExpense(user: NonNullable<AuthenticatedRequest['user']>): boolean {
  return user.role === 'ADMIN' || hasPermission(user, ['expenses:verify', 'expenses:pay', 'expenses:manage', 'finance:manage']);
}

function isPrivilegedViewer(user: NonNullable<AuthenticatedRequest['user']>): boolean {
  return user.role === 'ADMIN' || user.role === 'MANAGER' || hasPermission(user, ['expenses:manage', 'finance:manage']);
}


export class EmployeeExpenseController {
  public async getExpenseClaims(req: Request, res: Response): Promise<void> {
    try {
      const user = getAuth(req);
      if (!user) {
        res.status(401).json({ success: false, error: 'Authenticated user context is required' });
        return;
      }

      const { employeeId: requestedEmployeeId, projectId, status, category } = req.query;
      const employeeId = isPrivilegedViewer(user) ? (requestedEmployeeId as string) : user.id;
      const claims = await employeeExpenseRepository.getExpenseClaims({
        employeeId,
        projectId: isPrivilegedViewer(user) ? (projectId as string) : undefined,
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
      const user = getAuth(req);
      const claim = await employeeExpenseRepository.getExpenseClaimById(req.params.id);
      if (!claim) {
        res.status(404).json({ success: false, error: 'Expense claim not found' });
        return;
      }
      if (!user || (!isPrivilegedViewer(user) && claim.employeeId !== user.id)) {
        res.status(403).json({ success: false, error: 'You do not have access to this expense claim' });
        return;
      }
      res.json({ success: true, data: claim });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createExpenseClaim(req: Request, res: Response): Promise<void> {
    try {
      const user = getAuth(req);
      if (!user) {
        res.status(401).json({ success: false, error: 'Authenticated user context is required' });
        return;
      }

      if (req.body?.projectId && user.assignedProjectId && user.role !== 'ADMIN' && user.role !== 'MANAGER' && req.body.projectId !== user.assignedProjectId) {
        res.status(403).json({ success: false, error: 'Project context is outside the authenticated user scope' });
        return;
      }

      const claim = await employeeExpenseRepository.createExpenseClaim({
        ...req.body,
        employeeId: user.id,
        employeeName: user.name,
        department: user.department || req.body?.department,
        projectId: req.body?.projectId || user.assignedProjectId,
        projectName: req.body?.projectName || user.assignedProjectName,
      });
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
      const user = getAuth(req);
      if (!user || !canReviewExpense(user)) {
        res.status(403).json({ success: false, error: 'Insufficient permission to approve expense claims' });
        return;
      }
      const claim = await employeeExpenseRepository.getExpenseClaimById(req.params.id);
      if (claim && claim.employeeId === user.id) {
        res.status(403).json({ success: false, error: 'Maker-checker rule: the claimant cannot approve their own expense' });
        return;
      }
      const updated = await employeeExpenseRepository.approveByManager(req.params.id, {
        id: user.id,
        name: user.name,
        role: user.role,
        remarks: req.body?.remarks,
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
      const user = getAuth(req);
      if (!user || !canFinanceExpense(user)) {
        res.status(403).json({ success: false, error: 'Insufficient permission for finance verification' });
        return;
      }
      const claim = await employeeExpenseRepository.getExpenseClaimById(req.params.id);
      if (claim && claim.employeeId === user.id) {
        res.status(403).json({ success: false, error: 'Maker-checker rule: the claimant cannot finance-verify their own expense' });
        return;
      }
      const updated = await employeeExpenseRepository.verifyByFinance(req.params.id, {
        ...req.body,
        verifierId: user.id,
        verifierName: user.name,
      });
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
      const user = getAuth(req);
      if (!user || !canFinanceExpense(user)) {
        res.status(403).json({ success: false, error: 'Insufficient permission to disburse expense payments' });
        return;
      }
      const claim = await employeeExpenseRepository.getExpenseClaimById(req.params.id);
      if (claim && claim.employeeId === user.id) {
        res.status(403).json({ success: false, error: 'Maker-checker rule: the claimant cannot pay their own expense' });
        return;
      }
      const updated = await employeeExpenseRepository.disbursePayment(req.params.id, {
        ...req.body,
        paidById: user.id,
        paidByName: user.name,
      });
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
      const user = getAuth(req);
      if (!user || !canReviewExpense(user)) {
        res.status(403).json({ success: false, error: 'Insufficient permission to review expense claims' });
        return;
      }
      const claim = await employeeExpenseRepository.getExpenseClaimById(req.params.id);
      if (claim && claim.employeeId === user.id) {
        res.status(403).json({ success: false, error: 'Maker-checker rule: the claimant cannot reject their own expense' });
        return;
      }
      const updated = await employeeExpenseRepository.rejectClaim(req.params.id, {
        id: user.id,
        name: user.name,
        reason: req.body?.reason,
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
      const user = getAuth(req);
      if (!user || !canReviewExpense(user)) {
        res.status(403).json({ success: false, error: 'Insufficient permission to request clarification' });
        return;
      }
      const claim = await employeeExpenseRepository.getExpenseClaimById(req.params.id);
      if (claim && claim.employeeId === user.id) {
        res.status(403).json({ success: false, error: 'Maker-checker rule: the claimant cannot request clarification on their own claim' });
        return;
      }
      const question = String(req.body?.question || '').trim();
      if (!question) {
        res.status(400).json({ success: false, error: 'Clarification question is required' });
        return;
      }
      const updated = await employeeExpenseRepository.requestClarification(req.params.id, {
        id: user.id,
        name: user.name,
        question,
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
