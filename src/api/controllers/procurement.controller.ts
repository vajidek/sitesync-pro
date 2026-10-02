import { Request, Response } from 'express';
import { procurementService, ProcurementService } from '../services/procurement.service';
import { logger } from '../utils/logger';
import {
  createPrSchema,
  approvePrSchema,
  createRfqSchema,
  createVendorQuotationSchema,
  createTechnicalEvaluationSchema,
  createCommercialEvaluationSchema,
  createComparativeStatementSchema,
  createPoSchema,
  revisePoSchema,
  createDeliveryScheduleSchema,
  createVendorPerformanceSchema,
  createBudgetAllocationSchema,
} from '../validators/procurement.validator';

export class ProcurementController {
  constructor(private service: ProcurementService = procurementService) {}

  // --- VENDORS ---
  getVendors = async (req: Request, res: Response) => {
    try {
      const { category, status, search, page = '1', limit = '50', sortBy = 'name', sortOrder = 'asc' } = req.query;
      const result = await this.service.getVendors({
        category: category as string,
        status: status as string,
        search: search as string,
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as string,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (err: any) {
      logger.error(`Error listing vendors: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch vendors list' });
    }
  };

  createVendor = async (req: Request, res: Response) => {
    try {
      const vendor = await this.service.createVendor(req.body);
      logger.info(`[Procurement Controller] Registered new vendor ${vendor.vendorCode} - ${vendor.name}`);
      res.status(201).json({
        success: true,
        message: 'Vendor profile created successfully',
        data: vendor,
      });
    } catch (err: any) {
      logger.error(`Error creating vendor: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to create vendor' });
    }
  };

  updateVendor = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await this.service.updateVendor(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Vendor not found' });
      }
      logger.info(`[Procurement Controller] Updated vendor ${id}`);
      res.json({
        success: true,
        message: 'Vendor profile updated successfully',
        data: updated,
      });
    } catch (err: any) {
      logger.error(`Error updating vendor: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to update vendor' });
    }
  };

  deleteVendor = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.deleteVendor(id);
      res.json({ success: true, message: 'Vendor deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete vendor' });
    }
  };

  // --- RFQS ---
  getRfqs = async (req: Request, res: Response) => {
    try {
      const { status, projectId, search } = req.query;
      const rfqs = await this.service.getRfqs({
        status: status as string,
        projectId: projectId as string,
        search: search as string,
      });

      res.json({
        success: true,
        count: rfqs.length,
        data: rfqs,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch RFQs' });
    }
  };

  createRfq = async (req: Request, res: Response) => {
    try {
      const rfq = await this.service.createRfq(req.body);
      logger.info(`[Procurement Controller] Created RFQ ${rfq.rfqCode}`);
      res.status(201).json({
        success: true,
        message: 'RFQ created and dispatched to vendors',
        data: rfq,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create RFQ' });
    }
  };

  // --- QUOTATIONS ---
  getQuotations = async (req: Request, res: Response) => {
    try {
      const { rfqId, vendorId } = req.query;
      const quotations = await this.service.getQuotations({
        rfqId: rfqId as string,
        vendorId: vendorId as string,
      });

      res.json({
        success: true,
        count: quotations.length,
        data: quotations,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch quotations' });
    }
  };

  createQuotation = async (req: Request, res: Response) => {
    try {
      const quotation = await this.service.createQuotation(req.body);
      logger.info(`[Procurement Controller] Logged Vendor Quotation ${quotation.quotationNo} from ${quotation.vendorName}`);
      res.status(201).json({
        success: true,
        message: 'Quotation submitted successfully',
        data: quotation,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to submit quotation' });
    }
  };

  getComparativeStatement = async (req: Request, res: Response) => {
    try {
      const rfqId = req.params.rfqId || (req.query.rfqId as string);
      if (!rfqId) {
        return res.status(400).json({ success: false, message: 'rfqId is required' });
      }
      const cs = await this.service.getComparativeStatement(rfqId);
      res.json({
        success: true,
        data: cs,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to generate comparative statement' });
    }
  };

  // --- REQUISITIONS ---
  getRequisitions = async (req: Request, res: Response) => {
    try {
      const { status, projectId, search } = req.query;
      const prs = await this.service.getRequisitions({
        status: status as string,
        projectId: projectId as string,
        search: search as string,
      });

      res.json({
        success: true,
        count: prs.length,
        data: prs,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch Purchase Requisitions' });
    }
  };

  createRequisition = async (req: Request, res: Response) => {
    try {
      const pr = await this.service.createRequisition(req.body);
      logger.info(`[Procurement Controller] Created Purchase Requisition ${pr.prNumber}`);
      res.status(201).json({
        success: true,
        message: 'Purchase Requisition submitted to store & project management',
        data: pr,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to submit requisition' });
    }
  };

  updateRequisitionStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, verifiedByName, approvedByName, verifiedBy, approvedBy } = req.body;
      const updated = await this.service.updateRequisitionStatus(id, {
        status,
        verifiedByName: verifiedByName || verifiedBy,
        approvedByName: approvedByName || approvedBy,
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Requisition not found' });
      }

      logger.info(`[Procurement Controller] Requisition ${updated.prNumber} workflow updated to ${status}`);
      res.json({
        success: true,
        message: `Purchase Requisition status changed to ${status}`,
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update requisition status' });
    }
  };

  // --- PURCHASE ORDERS ---
  getPurchaseOrders = async (req: Request, res: Response) => {
    try {
      const { status, vendorId, projectId, search } = req.query;
      const pos = await this.service.getPurchaseOrders({
        status: status as string,
        vendorId: vendorId as string,
        projectId: projectId as string,
        search: search as string,
      });

      res.json({
        success: true,
        count: pos.length,
        data: pos,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch Purchase Orders' });
    }
  };

  createPurchaseOrder = async (req: Request, res: Response) => {
    try {
      const po = await this.service.createPurchaseOrder(req.body);
      logger.info(`[Procurement Controller] Created Purchase Order ${po.poNumber} for ${po.vendorName}`);
      res.status(201).json({
        success: true,
        message: 'Purchase Order generated and approved',
        data: po,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to generate Purchase Order' });
    }
  };

  // --- GRN ---
  getGrns = async (req: Request, res: Response) => {
    try {
      const { poId, projectId } = req.query;
      const grns = await this.service.getGrns({
        poId: poId as string,
        projectId: projectId as string,
      });

      res.json({
        success: true,
        count: grns.length,
        data: grns,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch GRN entries' });
    }
  };

  createGrn = async (req: Request, res: Response) => {
    try {
      const grn = await this.service.createGrn(req.body);
      logger.info(`[Procurement Controller] Registered GRN ${grn.grnNumber} for PO ${grn.poNumber}`);
      res.status(201).json({
        success: true,
        message: `GRN ${grn.grnNumber} created. Store inventory stock successfully incremented!`,
        data: grn,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to record GRN' });
    }
  };

  // --- WORK ORDERS ---
  getWorkOrders = async (req: Request, res: Response) => {
    try {
      const { category, status, projectId } = req.query;
      const wos = await this.service.getWorkOrders({
        category: category as string,
        status: status as string,
        projectId: projectId as string,
      });

      res.json({
        success: true,
        count: wos.length,
        data: wos,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch Subcontract Work Orders' });
    }
  };

  createWorkOrder = async (req: Request, res: Response) => {
    try {
      const wo = await this.service.createWorkOrder(req.body);
      logger.info(`[Procurement Controller] Created Subcontract Work Order ${wo.woNumber}`);
      res.status(201).json({
        success: true,
        message: 'Work Order issued to contractor',
        data: wo,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create Work Order' });
    }
  };

  addVariationOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await this.service.addVariationOrder(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Work Order not found' });
      }

      res.json({
        success: true,
        message: `Variation Order added to Work Order ${updated.woNumber}`,
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to add Variation Order' });
    }
  };

  // --- BOQ ---
  getBoqItems = async (req: Request, res: Response) => {
    try {
      const { projectId, category } = req.query;
      const boqs = await this.service.getBoqItems({
        projectId: projectId as string,
        category: category as string,
      });

      res.json({
        success: true,
        count: boqs.length,
        data: boqs,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch BOQ items' });
    }
  };

  createBoqItem = async (req: Request, res: Response) => {
    try {
      const boq = await this.service.createBoqItem(req.body);
      logger.info(`[Procurement Controller] Created BOQ Item ${boq.itemCode}`);
      res.status(201).json({
        success: true,
        message: 'BOQ Item added to project schedule',
        data: boq,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create BOQ item' });
    }
  };

  // --- MEASUREMENT BOOKS ---
  getMeasurementEntries = async (req: Request, res: Response) => {
    try {
      const { projectId, boqItemId } = req.query;
      const mbs = await this.service.getMeasurementEntries({
        projectId: projectId as string,
        boqItemId: boqItemId as string,
      });

      res.json({
        success: true,
        count: mbs.length,
        data: mbs,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch Measurement Book records' });
    }
  };

  getBillableMeasurements = async (req: Request, res: Response) => {
    try {
      const workOrderId = req.params.workOrderId || (req.query.workOrderId as string);
      const projectId = req.query.projectId as string;
      const boqItemId = req.query.boqItemId as string;

      const measurements = await this.service.getBillableMeasurementEntries({
        workOrderId,
        projectId,
        boqItemId,
      });

      res.json({
        success: true,
        count: measurements.length,
        data: measurements,
      });
    } catch (err: any) {
      logger.error(`[Procurement Controller] Failed to fetch billable measurements: ${err.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch billable measurement entries',
      });
    }
  };

  createMeasurementEntry = async (req: Request, res: Response) => {
    try {
      const mb = await this.service.createMeasurementEntry(req.body);
      logger.info(`[Procurement Controller] Measurement Book entry ${mb.mbNumber} logged. Updated BOQ Executed Qty.`);
      res.status(201).json({
        success: true,
        message: 'Measurement Book entry approved and BOQ executed progress synchronized!',
        data: mb,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to record Measurement Book entry' });
    }
  };

  updateMeasurementStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, verifiedByName, approvedByName, verifiedBy, approvedBy } = req.body;
      const updated = await this.service.updateMeasurementStatus(id, {
        status,
        verifiedByName: verifiedByName || verifiedBy,
        approvedByName: approvedByName || approvedBy,
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Measurement record not found' });
      }

      res.json({
        success: true,
        message: `Measurement Book entry status changed to ${status}`,
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update measurement status' });
    }
  };

  // --- TENDERS ---
  getTenders = async (req: Request, res: Response) => {
    try {
      const { tenderStatus, search } = req.query;
      const tenders = await this.service.getTenders({
        tenderStatus: tenderStatus as string,
        search: search as string,
      });

      res.json({
        success: true,
        count: tenders.length,
        data: tenders,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch tenders' });
    }
  };

  createTender = async (req: Request, res: Response) => {
    try {
      const tender = await this.service.createTender(req.body);
      logger.info(`[Procurement Controller] Registered Tender ${tender.tenderNo}`);
      res.status(201).json({
        success: true,
        message: 'Tender record registered in Tender Portal',
        data: tender,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to register tender' });
    }
  };

  // --- COST CONTROL & DASHBOARD REPORTS ---
  getCostControls = async (req: Request, res: Response) => {
    try {
      const controls = await this.service.getCostControls();
      res.json({
        success: true,
        count: controls.length,
        data: controls,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch Cost Control stats' });
    }
  };

  getDashboardReports = async (req: Request, res: Response) => {
    try {
      const report = await this.service.getDashboardReports();
      res.json({
        success: true,
        ...report,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to compile Procurement Dashboard reports' });
    }
  };

  // --- MATERIAL REQUESTS & APPROVAL ENGINE ---
  getMaterialRequests = async (req: Request, res: Response) => {
    try {
      const { status, priority, projectId, requestedByUserId, search } = req.query;
      const requests = await this.service.getMaterialRequests({
        status: status as string,
        priority: priority as string,
        projectId: projectId as string,
        requestedByUserId: requestedByUserId as string,
        search: search as string,
      });

      res.json({
        success: true,
        count: requests.length,
        data: requests,
      });
    } catch (err: any) {
      logger.error(`Error fetching Material Requests: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch Material Requests' });
    }
  };

  getMaterialRequestById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const request = await this.service.getMaterialRequestById(id);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Material Request not found' });
      }
      res.json({
        success: true,
        data: request,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch Material Request details' });
    }
  };

  createMaterialRequest = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const request = await this.service.createMaterialRequest(req.body, user);
      logger.info(`[Procurement Controller] Created Material Request ${request.requestNo} by ${request.requestedByUserName}`);
      res.status(201).json({
        success: true,
        message: 'Material Request submitted successfully',
        data: request,
      });
    } catch (err: any) {
      logger.error(`Error creating Material Request: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to submit Material Request' });
    }
  };

  processMaterialRequestAction = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { action, remarks } = req.body;
      const user = (req as any).user;

      if (!action) {
        return res.status(400).json({ success: false, message: 'Action is required' });
      }

      const updated = await this.service.processMaterialRequestAction(id, action, user, remarks);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Material Request not found' });
      }

      logger.info(`[Procurement Controller] Processed action ${action} on Material Request ${updated.requestNo} by ${user?.name || user?.email}`);
      res.json({
        success: true,
        message: `Material Request ${action.toLowerCase()} processed successfully`,
        data: updated,
      });
    } catch (err: any) {
      logger.error(`Error processing Material Request action: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to process workflow action' });
    }
  };

  recordMaterialReceipt = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const updated = await this.service.recordMaterialReceipt(id, req.body, user);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Material Request not found' });
      }

      logger.info(`[Procurement Controller] Recorded delivery receipt for Material Request ${updated.requestNo}`);
      res.json({
        success: true,
        message: 'Material delivery receipt recorded and store stock updated',
        data: updated,
      });
    } catch (err: any) {
      logger.error(`Error recording Material Receipt: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to record material receipt' });
    }
  };

  addMaterialRequestAttachment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const updated = await this.service.addMaterialRequestAttachment(id, req.body, user);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Material Request not found' });
      }

      res.json({
        success: true,
        message: 'Attachment uploaded and permanently recorded',
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to upload attachment' });
    }
  };

  // --- WORKFLOW CONFIGURATIONS ---
  getWorkflowConfigs = async (req: Request, res: Response) => {
    try {
      const configs = await this.service.getWorkflowConfigs();
      res.json({ success: true, data: configs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch workflow configs' });
    }
  };

  getWorkflowConfigByProjectId = async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const config = await this.service.getWorkflowConfigByProjectId(projectId);
      res.json({ success: true, data: config });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch project workflow config' });
    }
  };

  saveWorkflowConfig = async (req: Request, res: Response) => {
    try {
      const saved = await this.service.saveWorkflowConfig(req.body);
      res.json({ success: true, message: 'Workflow configuration updated', data: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to save workflow config' });
    }
  };

  // --- NOTIFICATIONS & AUDIT LOGS ---
  getNotifications = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const notifs = await this.service.getNotifications(user?.id);
      res.json({ success: true, count: notifs.length, data: notifs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
  };

  markNotificationRead = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await this.service.markNotificationRead(id);
      res.json({ success, message: success ? 'Notification marked as read' : 'Notification not found' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
    }
  };

  getAuditLogs = async (req: Request, res: Response) => {
    try {
      const { entityId } = req.query;
      const logs = await this.service.getAuditLogs(entityId as string);
      res.json({ success: true, count: logs.length, data: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
    }
  };

  // --- STOCK TRANSACTIONS & MATERIAL LEDGER ---
  getStockTransactions = async (req: Request, res: Response) => {
    try {
      const { projectId } = req.query;
      const txs = await this.service.getStockTransactions(projectId as string);
      res.json({ success: true, count: txs.length, data: txs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch stock transactions' });
    }
  };

  getMaterialLedger = async (req: Request, res: Response) => {
    try {
      const { projectId } = req.query;
      const ledger = await this.service.getMaterialLedger(projectId as string);
      res.json({ success: true, count: ledger.length, data: ledger });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch material ledger' });
    }
  };

  // ====================================================
  // PHASE 56: ENTERPRISE PROCUREMENT CONTROLLER METHODS
  // ====================================================

  // --- PURCHASE REQUISITIONS (PR) ---
  createPhase56PR = async (req: Request, res: Response) => {
    try {
      const validated = createPrSchema.parse(req.body);
      const pr = await this.service.createPhase56PR(validated);
      res.status(201).json({ success: true, message: 'Purchase Requisition created successfully', data: pr });
    } catch (err: any) {
      logger.error(`Error creating PR: ${err.message}`);
      res.status(400).json({ success: false, message: err.message || 'Validation or creation error' });
    }
  };

  getPhase56PRs = async (req: Request, res: Response) => {
    try {
      const { status, projectId, search } = req.query;
      const prs = await this.service.getPhase56PRs({
        status: status as string,
        projectId: projectId as string,
        search: search as string,
      });
      res.json({ success: true, count: prs.length, data: prs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch Purchase Requisitions' });
    }
  };

  getPhase56PRById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const pr = await this.service.getPhase56PRById(id);
      if (!pr) return res.status(404).json({ success: false, message: 'Purchase Requisition not found' });
      res.json({ success: true, data: pr });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch Purchase Requisition' });
    }
  };

  approvePhase56PR = async (req: Request, res: Response) => {
    try {
      const validated = approvePrSchema.parse(req.body);
      const pr = await this.service.approvePhase56PR(
        validated.prId,
        validated.approverId,
        validated.approverName,
        validated.action,
        validated.comments
      );
      res.json({ success: true, message: `PR ${validated.action.toLowerCase()}d successfully`, data: pr });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Approval processing failed' });
    }
  };

  deletePhase56PR = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.softDeletePR(id);
      res.json({ success: true, message: 'Purchase Requisition deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete Purchase Requisition' });
    }
  };

  // --- REQUEST FOR QUOTATIONS (RFQ) ---
  createPhase56RFQ = async (req: Request, res: Response) => {
    try {
      const validated = createRfqSchema.parse(req.body);
      const rfq = await this.service.createPhase56RFQ(validated);
      res.status(201).json({ success: true, message: 'RFQ generated successfully', data: rfq });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'RFQ creation error' });
    }
  };

  getPhase56RFQs = async (req: Request, res: Response) => {
    try {
      const { status, projectId, search } = req.query;
      const rfqs = await this.service.getPhase56RFQs({
        status: status as string,
        projectId: projectId as string,
        search: search as string,
      });
      res.json({ success: true, count: rfqs.length, data: rfqs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch RFQs' });
    }
  };

  getPhase56RFQById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const rfq = await this.service.getPhase56RFQById(id);
      if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found' });
      res.json({ success: true, data: rfq });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch RFQ' });
    }
  };

  deletePhase56RFQ = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.softDeleteRFQ(id);
      res.json({ success: true, message: 'RFQ deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete RFQ' });
    }
  };

  // --- VENDOR QUOTATIONS ---
  createPhase56VendorQuotation = async (req: Request, res: Response) => {
    try {
      const validated = createVendorQuotationSchema.parse(req.body);
      const quotation = await this.service.createPhase56VendorQuotation(validated);
      res.status(201).json({ success: true, message: 'Vendor quotation submitted successfully', data: quotation });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Vendor quotation creation error' });
    }
  };

  getPhase56VendorQuotations = async (req: Request, res: Response) => {
    try {
      const { rfqId, vendorId } = req.query;
      const quotations = await this.service.getPhase56VendorQuotations({
        rfqId: rfqId as string,
        vendorId: vendorId as string,
      });
      res.json({ success: true, count: quotations.length, data: quotations });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch vendor quotations' });
    }
  };

  // --- TECHNICAL & COMMERCIAL EVALUATIONS ---
  createTechnicalEvaluation = async (req: Request, res: Response) => {
    try {
      const validated = createTechnicalEvaluationSchema.parse(req.body);
      const evalRecord = await this.service.createTechnicalEvaluation(validated);
      res.status(201).json({ success: true, message: 'Technical evaluation recorded', data: evalRecord });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Technical evaluation error' });
    }
  };

  getTechnicalEvaluations = async (req: Request, res: Response) => {
    try {
      const { rfqId } = req.query;
      const records = await this.service.getTechnicalEvaluations(rfqId as string);
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch technical evaluations' });
    }
  };

  createCommercialEvaluation = async (req: Request, res: Response) => {
    try {
      const validated = createCommercialEvaluationSchema.parse(req.body);
      const evalRecord = await this.service.createCommercialEvaluation(validated);
      res.status(201).json({ success: true, message: 'Commercial evaluation recorded', data: evalRecord });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Commercial evaluation error' });
    }
  };

  getCommercialEvaluations = async (req: Request, res: Response) => {
    try {
      const { rfqId } = req.query;
      const records = await this.service.getCommercialEvaluations(rfqId as string);
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch commercial evaluations' });
    }
  };

  // --- COMPARATIVE STATEMENTS ---
  createComparativeStatement = async (req: Request, res: Response) => {
    try {
      const validated = createComparativeStatementSchema.parse(req.body);
      const statement = await this.service.createComparativeStatement(validated);
      res.status(201).json({ success: true, message: 'Comparative statement created', data: statement });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Comparative statement creation error' });
    }
  };

  getComparativeStatements = async (req: Request, res: Response) => {
    try {
      const { rfqId } = req.query;
      const statements = await this.service.getComparativeStatements(rfqId as string);
      res.json({ success: true, count: statements.length, data: statements });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch comparative statements' });
    }
  };

  approveComparativeStatement = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { approverName } = req.body;
      const approved = await this.service.approveComparativeStatement(id, approverName || 'Procurement Manager');
      res.json({ success: true, message: 'Comparative statement approved', data: approved });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Comparative statement approval failed' });
    }
  };

  generatePoFromComparativeStatement = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user || { id: 'usr-admin', name: 'Procurement Manager', role: 'ADMIN' };
      const idempotencyKey = (req.headers['idempotency-key'] || req.headers['x-idempotency-key']) as string | undefined;

      const po = await this.service.generatePoFromComparativeStatement(id, {
        user,
        companyId: req.body?.companyId || 'cmp-101',
        idempotencyKey,
      });

      logger.info(`[Procurement Controller] PO ${po.poNumber} successfully generated from Comparative Statement ${id}`);
      res.status(201).json({
        success: true,
        message: `Purchase Order ${po.poNumber} successfully generated from Approved Comparative Statement`,
        data: po,
      });
    } catch (err: any) {
      logger.error(`[Procurement Controller] Failed to generate PO from CS: ${err.message}`);
      const isConflict = err.message?.includes('already exists') || err.message?.includes('Conflict:') || err.message?.includes('already been generated');
      const isNotFound = err.message?.includes('not found');
      const isBadRequest = err.message?.includes('not APPROVED') || err.message?.includes('no billable line items') || err.message?.includes('does not specify');

      const statusCode = isConflict ? 409 : isNotFound ? 404 : isBadRequest ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: err.message || 'Failed to generate Purchase Order from Comparative Statement',
      });
    }
  };

  // --- PURCHASE ORDERS (PO) ---
  createPhase56PO = async (req: Request, res: Response) => {
    try {
      const validated = createPoSchema.parse(req.body);
      const po = await this.service.createPhase56PO(validated);
      res.status(201).json({ success: true, message: 'Purchase Order created successfully', data: po });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'PO creation error' });
    }
  };

  getPhase56POs = async (req: Request, res: Response) => {
    try {
      const { status, vendorId, projectId, search } = req.query;
      const pos = await this.service.getPhase56POs({
        status: status as string,
        vendorId: vendorId as string,
        projectId: projectId as string,
        search: search as string,
      });
      res.json({ success: true, count: pos.length, data: pos });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch Purchase Orders' });
    }
  };

  getPhase56POById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const po = await this.service.getPhase56POById(id);
      if (!po) return res.status(404).json({ success: false, message: 'Purchase Order not found' });
      res.json({ success: true, data: po });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch Purchase Order' });
    }
  };

  revisePO = async (req: Request, res: Response) => {
    try {
      const validated = revisePoSchema.parse(req.body);
      const updated = await this.service.revisePO(validated);
      res.json({ success: true, message: 'Purchase Order revised successfully', data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'PO revision error' });
    }
  };

  // --- DELIVERY SCHEDULES ---
  createDeliverySchedule = async (req: Request, res: Response) => {
    try {
      const validated = createDeliveryScheduleSchema.parse(req.body);
      const schedule = await this.service.createDeliverySchedule(validated);
      res.status(201).json({ success: true, message: 'Delivery schedule created', data: schedule });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Delivery schedule error' });
    }
  };

  getDeliverySchedules = async (req: Request, res: Response) => {
    try {
      const { poId } = req.query;
      const schedules = await this.service.getDeliverySchedules(poId as string);
      res.json({ success: true, count: schedules.length, data: schedules });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch delivery schedules' });
    }
  };

  updateDeliveryScheduleStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, deliveredQty } = req.body;
      const updated = await this.service.updateDeliveryScheduleStatus(id, status, deliveredQty);
      res.json({ success: true, message: 'Delivery schedule updated', data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update delivery schedule' });
    }
  };

  // --- VENDOR PERFORMANCE ---
  createVendorPerformance = async (req: Request, res: Response) => {
    try {
      const validated = createVendorPerformanceSchema.parse(req.body);
      const perf = await this.service.createVendorPerformance(validated);
      res.status(201).json({ success: true, message: 'Vendor performance record created', data: perf });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Vendor performance error' });
    }
  };

  getVendorPerformances = async (req: Request, res: Response) => {
    try {
      const { vendorId } = req.query;
      const records = await this.service.getVendorPerformances(vendorId as string);
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch vendor performance' });
    }
  };

  // --- BUDGET ALLOCATIONS ---
  createBudgetAllocation = async (req: Request, res: Response) => {
    try {
      const validated = createBudgetAllocationSchema.parse(req.body);
      const budget = await this.service.createBudgetAllocation(validated);
      res.status(201).json({ success: true, message: 'Budget allocation created', data: budget });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Budget allocation error' });
    }
  };

  getBudgetAllocations = async (req: Request, res: Response) => {
    try {
      const { projectId } = req.query;
      const budgets = await this.service.getBudgetAllocations(projectId as string);
      res.json({ success: true, count: budgets.length, data: budgets });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch budget allocations' });
    }
  };

  // --- LOGS ---
  getProcurementLogs = async (req: Request, res: Response) => {
    try {
      const { entityId } = req.query;
      const logs = await this.service.getProcurementLogs(entityId as string);
      res.json({ success: true, count: logs.length, data: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch procurement logs' });
    }
  };

  // ====================================================
  // PHASE 77 / P2.0: RUNNING ACCOUNT (RA) BILLING ENDPOINTS
  // ====================================================
  getRABills = async (req: Request, res: Response) => {
    try {
      const { projectId, workOrderId, status, search } = req.query;
      const bills = await this.service.getRABills({
        projectId: projectId as string,
        workOrderId: workOrderId as string,
        status: status as string,
        search: search as string,
      });

      res.json({
        success: true,
        count: bills.length,
        data: bills,
      });
    } catch (err: any) {
      logger.error(`Error fetching RA bills: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch Contractor RA Bills' });
    }
  };

  getRABillById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const bill = await this.service.getRABillById(id);
      if (!bill) {
        return res.status(404).json({ success: false, message: 'RA Bill not found' });
      }

      res.json({
        success: true,
        data: bill,
      });
    } catch (err: any) {
      logger.error(`Error fetching RA bill by id: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to retrieve RA Bill' });
    }
  };

  createRABill = async (req: Request, res: Response) => {
    try {
      const bill = await this.service.createRABill(req.body);
      logger.info(`[Procurement Controller] Created Contractor RA Bill ${bill.billNumber} for ${bill.contractorName}`);
      res.status(201).json({
        success: true,
        message: `RA Bill ${bill.billNumber} created & submitted for technical scrutiny.`,
        data: bill,
      });
    } catch (err: any) {
      logger.error(`Error creating RA Bill: ${err.message}`);
      res.status(400).json({ success: false, message: err.message || 'Failed to generate Contractor RA Bill' });
    }
  };

  updateRABillStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await this.service.updateRABillStatus(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'RA Bill not found' });
      }

      logger.info(`[Procurement Controller] Updated status of RA Bill ${updated.billNumber} to ${updated.status}`);
      res.json({
        success: true,
        message: `RA Bill status updated to ${updated.status}`,
        data: updated,
      });
    } catch (err: any) {
      logger.error(`Error updating RA Bill status: ${err.message}`);
      res.status(400).json({ success: false, message: err.message || 'Failed to update RA Bill status' });
    }
  };

  deleteRABill = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.deleteRABill(id);
      res.json({ success: true, message: 'RA Bill record deleted successfully' });
    } catch (err: any) {
      logger.error(`Error deleting RA Bill: ${err.message}`);
      res.status(400).json({ success: false, message: err.message || 'Failed to delete RA Bill' });
    }
  };
}

export const procurementController = new ProcurementController();

