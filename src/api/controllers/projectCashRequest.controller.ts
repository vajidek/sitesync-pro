import { Request, Response } from 'express';
import { projectCashRequestRepository } from '../repositories/projectCashRequest.repository';

export class ProjectCashRequestController {
  async getAll(req: Request, res: Response) {
    try {
      const { projectId, employeeId, status, category, search } = req.query as any;
      const data = await projectCashRequestRepository.getAll({
        projectId,
        employeeId,
        status,
        category,
        search,
      });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch cash requests' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await projectCashRequestRepository.getById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: 'Cash request not found' });
      const settlements = await projectCashRequestRepository.getSettlementsForRequest(req.params.id);
      res.json({ success: true, data: { ...data, settlements } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch cash request' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const body = {
        ...req.body,
        employeeId: req.body.employeeId || user?.id || 'emp-curr-01',
        employeeName: req.body.employeeName || user?.username || 'Current Engineer',
      };
      const created = await projectCashRequestRepository.create(body);
      res.status(201).json({ success: true, data: created, message: 'Project cash request submitted successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to create cash request' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const updated = await projectCashRequestRepository.update(req.params.id, req.body);
      res.json({ success: true, data: updated, message: 'Cash request updated successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to update cash request' });
    }
  }

  async reviewByIncharge(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { remarks, approved } = req.body;
      const updated = await projectCashRequestRepository.reviewByIncharge(req.params.id, {
        inchargeId: user?.id || 'incharge-01',
        inchargeName: user?.username || 'Project Incharge',
        remarks,
        approved: approved !== false,
      });
      res.json({ success: true, data: updated, message: approved !== false ? 'Request recommended to Project Director' : 'Request rejected by Incharge' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to review cash request' });
    }
  }

  async approveByDirector(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { approvedAmount, remarks, approved } = req.body;
      const updated = await projectCashRequestRepository.approveByDirector(req.params.id, {
        directorId: user?.id || 'director-01',
        directorName: user?.username || 'Project Director',
        approvedAmount: Number(approvedAmount) || undefined,
        remarks,
        approved: approved !== false,
      });
      res.json({ success: true, data: updated, message: approved !== false ? 'Request approved by Project Director. Forwarded to Finance for payout.' : 'Request rejected by Project Director' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to approve cash request' });
    }
  }

  async disburseByFinance(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { paymentMethod, paymentReference, disbursedAmount, remarks } = req.body;
      const updated = await projectCashRequestRepository.disburseByFinance(req.params.id, {
        financeId: user?.id || 'fin-01',
        financeName: user?.username || 'Finance Lead',
        paymentMethod: paymentMethod || 'BANK_TRANSFER',
        paymentReference: paymentReference || `PAY-${Date.now()}`,
        disbursedAmount: Number(disbursedAmount) || Number(req.body.amount) || 0,
        remarks,
      });
      res.json({ success: true, data: updated, message: 'Cash disbursed successfully. Imprest wallet funded.' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to disburse funds' });
    }
  }

  async submitSettlement(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { totalExpenseAmount, unspentCashReturned, voucherItems, invoicesAndReceipts } = req.body;
      const settlement = await projectCashRequestRepository.submitSettlement(req.params.id, {
        employeeId: user?.id || 'emp-curr-01',
        employeeName: user?.username || 'Current Engineer',
        totalExpenseAmount: Number(totalExpenseAmount) || 0,
        unspentCashReturned: Number(unspentCashReturned) || 0,
        voucherItems: voucherItems || [],
        invoicesAndReceipts: invoicesAndReceipts || [],
      });
      res.status(201).json({ success: true, data: settlement, message: 'Settlement and expense vouchers submitted for audit' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to submit settlement' });
    }
  }

  async auditSettlement(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { remarks, approved } = req.body;
      const result = await projectCashRequestRepository.auditSettlement(req.params.settlementId, {
        auditorId: user?.id || 'auditor-01',
        auditorName: user?.username || 'Internal Auditor',
        remarks: remarks || '',
        approved: approved !== false,
      });
      res.json({ success: true, ...result, message: approved !== false ? 'Settlement verified & closed' : 'Settlement rejected' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to audit settlement' });
    }
  }
}

export const projectCashRequestController = new ProjectCashRequestController();
