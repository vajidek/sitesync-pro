import { Request, Response } from 'express';
import { projectCashRequestRepository } from '../repositories/projectCashRequest.repository';


function getActor(req: Request, res: Response): { id: string; name: string; role: string } | null {
  const user = (req as any).user;
  const id = String(user?.id || user?.userId || '').trim();
  const name = String(user?.name || user?.fullName || user?.username || user?.email || '').trim();
  const role = String(user?.role || '').trim().toUpperCase();
  if (!id || !name) {
    res.status(401).json({ success: false, message: 'Authenticated finance actor context is required.' });
    return null;
  }
  return { id, name, role };
}

export class ProjectCashRequestController {
  async getAll(req: Request, res: Response) {
    try {
      const actor = getActor(req, res);
      if (!actor) return;

      const requestedProjectId = String((req.query as any).projectId || '').trim();
      const requestedEmployeeId = String((req.query as any).employeeId || '').trim();
      const assignedProjectId = String((req as any).user?.assignedProjectId || '').trim();
      const privileged = ['ADMIN', 'MANAGER'].includes(actor.role);
      const projectScoped = ['INCHARGE', 'SUPERVISOR'].includes(actor.role);

      const projectId = privileged
        ? (requestedProjectId || undefined)
        : projectScoped
          ? (assignedProjectId || requestedProjectId || undefined)
          : undefined;

      const employeeId = privileged
        ? (requestedEmployeeId || undefined)
        : projectScoped
          ? undefined
          : actor.id;

      const data = await projectCashRequestRepository.getAll({
        projectId,
        employeeId,
        status: (req.query as any).status,
        category: (req.query as any).category,
        search: (req.query as any).search,
      });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch cash requests' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const actor = getActor(req, res);
      if (!actor) return;

      const data = await projectCashRequestRepository.getById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: 'Cash request not found' });

      const assignedProjectId = String((req as any).user?.assignedProjectId || '').trim();
      const privileged = ['ADMIN', 'MANAGER'].includes(actor.role);
      const projectScoped = ['INCHARGE', 'SUPERVISOR'].includes(actor.role);
      const visible = privileged
        || data.employeeId === actor.id
        || (projectScoped && assignedProjectId && data.projectId === assignedProjectId);

      if (!visible) {
        res.status(403).json({ success: false, message: 'You do not have access to this cash request.' });
        return;
      }

      const settlements = await projectCashRequestRepository.getSettlementsForRequest(req.params.id);
      res.json({ success: true, data: { ...data, settlements } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch cash request' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const actor = getActor(req, res);
      if (!actor) return;
      const privileged = ['ADMIN', 'MANAGER'].includes(actor.role);
      const body = {
        ...req.body,
        employeeId: privileged && req.body?.employeeId ? req.body.employeeId : actor.id,
        employeeName: privileged && req.body?.employeeName ? req.body.employeeName : actor.name,
        createdBy: actor.id,
        createdByName: actor.name,
      };
      const created = await projectCashRequestRepository.create(body);
      res.status(201).json({ success: true, data: created, message: 'Project cash request submitted successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to create cash request' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const actor = getActor(req, res);
      if (!actor) return;
      const existing = await projectCashRequestRepository.getById(req.params.id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Cash request not found' });
        return;
      }
      const privileged = ['ADMIN', 'MANAGER'].includes(actor.role);
      if (!privileged && existing.employeeId !== actor.id) {
        res.status(403).json({ success: false, message: 'You can update only your own cash request.' });
        return;
      }
      if (!['DRAFT', 'SUBMITTED', 'REJECTED'].includes(String(existing.status || '').toUpperCase())) {
        res.status(409).json({ success: false, message: 'This cash request is locked at its current workflow stage.' });
        return;
      }
      const updated = await projectCashRequestRepository.update(req.params.id, {
        ...req.body,
        employeeId: existing.employeeId,
        employeeName: existing.employeeName,
      });
      res.json({ success: true, data: updated, message: 'Cash request updated successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to update cash request' });
    }
  }

  async reviewByIncharge(req: Request, res: Response) {
    try {
      const actor = getActor(req, res);
      if (!actor) return;
      const { remarks, approved } = req.body;
      const updated = await projectCashRequestRepository.reviewByIncharge(req.params.id, {
        inchargeId: actor.id,
        inchargeName: actor.name,
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
      const actor = getActor(req, res);
      if (!actor) return;
      const { approvedAmount, remarks, approved } = req.body;
      const updated = await projectCashRequestRepository.approveByDirector(req.params.id, {
        directorId: actor.id,
        directorName: actor.name,
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
      const actor = getActor(req, res);
      if (!actor) return;
      const { paymentMethod, paymentReference, disbursedAmount, remarks } = req.body;
      if (!String(paymentMethod || '').trim() || !String(paymentReference || '').trim()) {
        res.status(400).json({ success: false, message: 'Payment method and payment reference are required.' });
        return;
      }
      const updated = await projectCashRequestRepository.disburseByFinance(req.params.id, {
        financeId: actor.id,
        financeName: actor.name,
        paymentMethod: String(paymentMethod).trim(),
        paymentReference: String(paymentReference).trim(),
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
      const actor = getActor(req, res);
      if (!actor) return;
      const { totalExpenseAmount, unspentCashReturned, voucherItems, invoicesAndReceipts } = req.body;
      const settlement = await projectCashRequestRepository.submitSettlement(req.params.id, {
        employeeId: actor.id,
        employeeName: actor.name,
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
      const actor = getActor(req, res);
      if (!actor) return;
      const { remarks, approved } = req.body;
      const result = await projectCashRequestRepository.auditSettlement(req.params.settlementId, {
        auditorId: actor.id,
        auditorName: actor.name,
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
