import { Request, Response } from 'express';
import { ProcurementEnterpriseService } from '../services/procurement_enterprise.service';
import {
  createRfqSchema,
  createPurchaseRequisitionSchema,
  createPurchaseOrderSchema,
  createGoodsReceiptSchema,
} from '../validators/procurement_enterprise.validator';
function requireActor(req: Request, res: Response): { id?: string; name: string } | null {
  const user = (req as any).user;
  const name = String(user?.fullName || user?.name || user?.email || '').trim();
  if (!user || !name) {
    res.status(401).json({ success: false, message: 'Authenticated actor context is required.' });
    return null;
  }
  return { id: user.id, name };
}


export class ProcurementEnterpriseController {
  private service: ProcurementEnterpriseService;

  constructor() {
    this.service = new ProcurementEnterpriseService();
  }

  public getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(error?.name === 'ZodError' ? 400 : 500).json({ success: false, message: error.message });
    }
  };

  // --- Vendors ---
  public getVendors = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, category, status } = req.query;
      const vendors = await this.service.getVendors(
        search as string,
        category as string,
        status as string
      );
      res.status(200).json({ success: true, data: vendors });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public getVendorById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const vendor = await this.service.getVendorById(id);
      if (!vendor) {
        res.status(404).json({ success: false, message: 'Vendor not found' });
        return;
      }
      res.status(200).json({ success: true, data: vendor });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public registerVendor = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const createdBy = actor.name;
      const vendor = await this.service.registerVendor(req.body, createdBy);
      res.status(201).json({ success: true, data: vendor, message: 'Vendor registered successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public updateVendor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const vendor = await this.service.updateVendor(id, req.body);
      res.status(200).json({ success: true, data: vendor, message: 'Vendor updated successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // --- RFQs & Quotations ---
  public getRfqs = async (req: Request, res: Response): Promise<void> => {
    try {
      const rfqs = await this.service.getRfqs();
      res.status(200).json({ success: true, data: rfqs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createRfq = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const createdBy = actor.name;
      const payload = createRfqSchema.parse(req.body);
      const rfq = await this.service.createRfq(payload, createdBy);
      res.status(201).json({ success: true, data: rfq, message: 'RFQ issued successfully' });
    } catch (error: any) {
      res.status(error?.name === 'ZodError' ? 400 : 500).json({ success: false, message: error.message });
    }
  };

  public getQuotations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { rfqId } = req.query;
      const quotes = await this.service.getQuotations(rfqId as string);
      res.status(200).json({ success: true, data: quotes });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public submitQuotation = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const createdBy = actor.name;
      const quote = await this.service.submitQuotation(req.body, createdBy);
      res.status(201).json({ success: true, data: quote, message: 'Vendor quotation submitted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // --- Purchase Requisitions & Orders ---
  public getPurchaseRequisitions = async (req: Request, res: Response): Promise<void> => {
    try {
      const prs = await this.service.getPurchaseRequisitions();
      res.status(200).json({ success: true, data: prs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createPurchaseRequisition = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const createdBy = actor.name;
      const payload = createPurchaseRequisitionSchema.parse(req.body);
      const pr = await this.service.createPurchaseRequisition(payload, createdBy);
      res.status(201).json({ success: true, data: pr, message: 'Purchase requisition created successfully' });
    } catch (error: any) {
      res.status(error?.name === 'ZodError' ? 400 : 500).json({ success: false, message: error.message });
    }
  };

  public updatePurchaseRequisitionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const status = req.body?.status;
      const allowed = ['SUBMITTED', 'HOD_APPROVED', 'FINANCE_APPROVED', 'PO_ISSUED', 'REJECTED'];
      if (!allowed.includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid purchase requisition workflow status.' });
        return;
      }
      const result = await this.service.updatePurchaseRequisitionStatus(
        req.params.id,
        status,
        actor.name,
        req.body?.remarks
      );
      if (!result) {
        res.status(404).json({ success: false, message: 'Purchase requisition not found.' });
        return;
      }
      res.status(200).json({ success: true, data: result, message: `Purchase requisition moved to ${status}` });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getPurchaseOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const pos = await this.service.getPurchaseOrders();
      res.status(200).json({ success: true, data: pos });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public issuePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const createdBy = actor.name;
      const payload = createPurchaseOrderSchema.parse(req.body);
      const po = await this.service.issuePurchaseOrder(payload, createdBy);
      res.status(201).json({ success: true, data: po, message: 'Purchase order issued successfully' });
    } catch (error: any) {
      res.status(error?.name === 'ZodError' ? 400 : 500).json({ success: false, message: error.message });
    }
  };

  // --- Contracts & Variations ---
  public getContracts = async (req: Request, res: Response): Promise<void> => {
    try {
      const contracts = await this.service.getContracts();
      res.status(200).json({ success: true, data: contracts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createContract = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const createdBy = actor.name;
      const contract = await this.service.createContract(req.body, createdBy);
      res.status(201).json({ success: true, data: contract, message: 'Contract registered successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createVariationOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const createdBy = actor.name;
      const vo = await this.service.createVariationOrder(req.body, createdBy);
      res.status(201).json({ success: true, data: vo, message: 'Variation order approved successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // --- Goods Receipts & 3-Way Matching ---
  public getGoodsReceipts = async (req: Request, res: Response): Promise<void> => {
    try {
      const grns = await this.service.getGoodsReceipts();
      res.status(200).json({ success: true, data: grns });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public createGoodsReceipt = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const createdBy = actor.name;
      const payload = createGoodsReceiptSchema.parse(req.body);
      const grn = await this.service.createGoodsReceipt(payload, createdBy);
      res.status(201).json({ success: true, data: grn, message: 'Goods receipt note (GRN) created successfully' });
    } catch (error: any) {
      res.status(error?.name === 'ZodError' ? 400 : 500).json({ success: false, message: error.message });
    }
  };

  public getThreeWayMatches = async (req: Request, res: Response): Promise<void> => {
    try {
      const matches = await this.service.getThreeWayMatches();
      res.status(200).json({ success: true, data: matches });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public reconcileThreeWayMatch = async (req: Request, res: Response): Promise<void> => {
    try {
      const match = await this.service.reconcileThreeWayMatch(req.body);
      res.status(201).json({ success: true, data: match, message: '3-Way reconciliation completed' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // --- Scorecards & Guarantees ---
  public getSupplierScorecards = async (req: Request, res: Response): Promise<void> => {
    try {
      const scorecards = await this.service.getSupplierScorecards();
      res.status(200).json({ success: true, data: scorecards });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public getBankGuarantees = async (req: Request, res: Response): Promise<void> => {
    try {
      const bgs = await this.service.getBankGuarantees();
      res.status(200).json({ success: true, data: bgs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
