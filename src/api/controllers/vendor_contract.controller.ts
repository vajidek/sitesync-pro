import { Request, Response } from 'express';
import { VendorContractService } from '../services/vendor_contract.service';
import { 
  createVendorSchema, updateVendorStatusSchema, rateVendorSchema, blacklistVendorSchema,
  createContractSchema, approveContractSchema, createContractVariationSchema, createContractPaymentSchema, createContractExtensionSchema, createContractClaimSchema, updateContractClaimStatusSchema, linkContractChangeEvidenceSchema
} from '../validators/vendor_contract.validator';

const service = new VendorContractService();

export class VendorContractController {
  // ==========================================
  // VENDOR CONTROLLER METHODS
  // ==========================================

  async getVendors(req: Request, res: Response) {
    try {
      const { search, category, status, avlStatus, classification } = req.query;
      const vendors = await service.getAllVendors({
        search: search as string,
        category: category as string,
        status: status as string,
        avlStatus: avlStatus as string,
        classification: classification as string
      });
      return res.status(200).json({ success: true, count: vendors.length, data: vendors });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getVendorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vendor = await service.getVendorById(id);
      return res.status(200).json({ success: true, data: vendor });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  async createVendor(req: Request, res: Response) {
    try {
      const validated = createVendorSchema.parse(req.body);
      const user = (req as any).user;
      const createdBy = user?.name || user?.email || 'Admin User';
      const vendor = await service.registerVendor(validated, createdBy);
      return res.status(201).json({ success: true, message: 'Vendor registered successfully', data: vendor });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || 'Validation error', error });
    }
  }

  async updateVendorStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const updatedBy = user?.name || user?.email || 'Admin User';
      const updated = await service.updateVendorStatus(id, req.body, updatedBy);
      return res.status(200).json({ success: true, message: 'Vendor status updated successfully', data: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async rateVendor(req: Request, res: Response) {
    try {
      const validated = rateVendorSchema.parse(req.body);
      const user = (req as any).user;
      const evaluatorName = user?.name || 'Senior Procurement Auditor';
      const rating = await service.rateVendor(validated, evaluatorName);
      return res.status(201).json({ success: true, message: 'Vendor evaluation & rating submitted', data: rating });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || 'Validation error' });
    }
  }

  async blacklistVendor(req: Request, res: Response) {
    try {
      const validated = blacklistVendorSchema.parse(req.body);
      const user = (req as any).user;
      const blacklistedBy = user?.name || 'Head of Procurement';
      const result = await service.blacklistVendor(validated, blacklistedBy);
      return res.status(201).json({ success: true, message: 'Vendor blacklisted successfully', data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await service.getVendorCategories();
      return res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==========================================
  // CONTRACT CONTROLLER METHODS
  // ==========================================

  async getContracts(req: Request, res: Response) {
    try {
      const { search, contractType, status, vendorId, projectId } = req.query;
      const contracts = await service.getAllContracts({
        search: search as string,
        contractType: contractType as string,
        status: status as string,
        vendorId: vendorId as string,
        projectId: projectId as string
      });
      return res.status(200).json({ success: true, count: contracts.length, data: contracts });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getContractById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contract = await service.getContractById(id);
      return res.status(200).json({ success: true, data: contract });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  async createContract(req: Request, res: Response) {
    try {
      const validated = createContractSchema.parse(req.body);
      const user = (req as any).user;
      const createdBy = String(user?.name || user?.email || '').trim();
      if (!createdBy) throw new Error('Authenticated creator identity is required.');
      const contract = await service.createContract(validated, createdBy);
      return res.status(201).json({ success: true, message: 'Contract created successfully', data: contract });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || 'Validation error', error });
    }
  }

  async updateContractStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const user = (req as any).user;
      const updatedBy = String(user?.name || user?.email || '').trim();
      if (!updatedBy) throw new Error('Authenticated actor identity is required.');
      if (!status) throw new Error('Contract status is required.');
      const updated = await service.updateContractStatus(id, status, updatedBy, notes);
      return res.status(200).json({ success: true, message: `Contract status changed to ${status}`, data: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async addMilestone(req: Request, res: Response) {
    try {
      const milestone = await service.addContractMilestone(req.body);
      return res.status(201).json({ success: true, message: 'Contract milestone added', data: milestone });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async addVariation(req: Request, res: Response) {
    try {
      const validated = createContractVariationSchema.parse(req.body);
      const user = (req as any).user;
      const createdBy = String(user?.name || user?.email || '').trim();
      if (!createdBy) throw new Error('Authenticated creator identity is required.');
      const variation = await service.addContractVariation(validated, createdBy);
      return res.status(201).json({ success: true, message: 'Contract variation order added', data: variation });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async addPayment(req: Request, res: Response) {
    try {
      const validated = createContractPaymentSchema.parse(req.body);
      const user = (req as any).user;
      const certifiedBy = String(user?.name || user?.email || '').trim();
      if (!certifiedBy) throw new Error('Authenticated certifier identity is required.');
      const payment = await service.addContractPayment(validated, certifiedBy);
      return res.status(201).json({ success: true, message: 'Interim payment certificate generated', data: payment });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async addExtension(req: Request, res: Response) {
    try {
      const validated = createContractExtensionSchema.parse(req.body);
      const user = (req as any).user;
      const actor = String(user?.name || user?.email || '').trim();
      if (!actor) throw new Error('Authenticated actor identity is required.');
      const extension = await service.addContractExtension(validated, actor);
      return res.status(201).json({ success: true, message: 'Contract extension granted', data: extension });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async approveVariation(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const actor = String(user?.name || user?.email || '').trim();
      if (!actor) throw new Error('Authenticated approver identity is required.');
      const status = req.body?.action === 'REJECT' ? 'REJECTED' : 'APPROVED';
      const result = await service.updateContractVariationStatus(req.params.id, status, actor, req.body?.comments);
      if (!result) return res.status(404).json({ success: false, message: 'Contract variation not found' });
      return res.status(200).json({ success: true, message: `Contract variation ${status.toLowerCase()} successfully`, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async decideExtension(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const actor = String(user?.name || user?.email || '').trim();
      if (!actor) throw new Error('Authenticated approver identity is required.');
      const status = req.body?.action === 'REJECT' ? 'REJECTED' : 'APPROVED';
      const result = await service.updateContractExtensionStatus(req.params.id, status, actor, req.body?.comments);
      if (!result) return res.status(404).json({ success: false, message: 'Contract extension request not found' });
      return res.status(200).json({ success: true, message: `Contract extension ${status.toLowerCase()} successfully`, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getClaims(req: Request, res: Response) {
    try {
      const claims = await service.getContractClaims({
        contractId: req.query.contractId as string,
        projectId: req.query.projectId as string,
        status: req.query.status as string,
      });
      return res.status(200).json({ success: true, count: claims.length, data: claims });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createClaim(req: Request, res: Response) {
    try {
      const validated = createContractClaimSchema.parse(req.body);
      const user = (req as any).user;
      const createdBy = String(user?.name || user?.email || '').trim();
      if (!createdBy) throw new Error('Authenticated claim creator identity is required.');
      const claim = await service.createContractClaim(validated, createdBy);
      return res.status(201).json({ success: true, message: 'Contract claim created successfully', data: claim });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateClaimStatus(req: Request, res: Response) {
    try {
      const validated = updateContractClaimStatusSchema.parse(req.body);
      const user = (req as any).user;
      const actor = String(user?.name || user?.email || '').trim();
      if (!actor) throw new Error('Authenticated claim workflow actor identity is required.');
      const claim = await service.updateContractClaimStatus(req.params.id, validated.status, actor, {
        approvedAmount: validated.approvedAmount,
        approvedDays: validated.approvedDays,
        rejectionReason: validated.rejectionReason,
      });
      if (!claim) return res.status(404).json({ success: false, message: 'Contract claim not found' });
      return res.status(200).json({ success: true, data: claim });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getChangeEvidence(req: Request, res: Response) {
    try {
      const entityType = req.query.entityType as 'VARIATION' | 'EXTENSION' | 'CLAIM';
      const entityId = String(req.query.entityId || '').trim();
      if (!['VARIATION', 'EXTENSION', 'CLAIM'].includes(entityType) || !entityId) throw new Error('Entity type and entity ID are required.');
      const evidence = await service.getContractChangeEvidence(entityType, entityId);
      return res.status(200).json({ success: true, count: evidence.length, data: evidence });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async linkChangeEvidence(req: Request, res: Response) {
    try {
      const validated = linkContractChangeEvidenceSchema.parse(req.body);
      const user = (req as any).user;
      const createdBy = String(user?.name || user?.email || '').trim();
      if (!createdBy) throw new Error('Authenticated evidence actor identity is required.');
      const evidence = await service.linkContractChangeEvidence(validated, createdBy);
      return res.status(201).json({ success: true, data: evidence });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await service.getDashboardStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
