import { procurementRepository, ProcurementRepository } from '../repositories/procurement.repository';
import {
  Vendor,
  RFQ,
  VendorQuotation,
  PurchaseRequisition,
  PurchaseOrder,
  GoodsReceiptNote,
  SubcontractWorkOrder,
  WOVariationOrder,
  BOQItem,
  MeasurementEntry,
  TenderRecord,
  MaterialRequest,
  RABillRecord,
  BillableMeasurementEntry,
} from '../../types/procurement';

export class ProcurementService {
  constructor(private repo: ProcurementRepository = procurementRepository) {}

  // --- VENDORS ---
  async getVendors(params: {
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    return this.repo.getVendors(params);
  }

  async createVendor(data: Partial<Vendor>): Promise<Vendor> {
    return this.repo.createVendor(data);
  }

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | null> {
    return this.repo.updateVendor(id, updates);
  }

  async deleteVendor(id: string): Promise<boolean> {
    return this.repo.deleteVendor(id);
  }

  // --- RFQS ---
  async getRfqs(filters: { status?: string; projectId?: string; search?: string }): Promise<RFQ[]> {
    return this.repo.getRfqs(filters);
  }

  async createRfq(data: Partial<RFQ>): Promise<RFQ> {
    return this.repo.createRfq(data);
  }

  // --- QUOTATIONS ---
  async getQuotations(filters: { rfqId?: string; vendorId?: string }): Promise<VendorQuotation[]> {
    return this.repo.getQuotations(filters);
  }

  async createQuotation(data: Partial<VendorQuotation>): Promise<VendorQuotation> {
    return this.repo.createQuotation(data);
  }

  async getComparativeStatement(rfqId: string) {
    return this.repo.getComparativeStatement(rfqId);
  }

  // --- REQUISITIONS ---
  async getRequisitions(filters: { status?: string; projectId?: string; search?: string }): Promise<PurchaseRequisition[]> {
    return this.repo.getRequisitions(filters);
  }

  async createRequisition(data: Partial<PurchaseRequisition>): Promise<PurchaseRequisition> {
    return this.repo.createRequisition(data);
  }

  async updateRequisitionStatus(id: string, updates: { status: string; verifiedByName?: string; approvedByName?: string }) {
    return this.repo.updateRequisitionStatus(id, updates);
  }

  // --- PURCHASE ORDERS ---
  async getPurchaseOrders(filters: { status?: string; vendorId?: string; projectId?: string; search?: string }): Promise<PurchaseOrder[]> {
    return this.repo.getPurchaseOrders(filters);
  }

  async createPurchaseOrder(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    return this.repo.createPurchaseOrder(data);
  }

  // --- GRN ---
  async getGrns(filters: { poId?: string; projectId?: string }): Promise<GoodsReceiptNote[]> {
    return this.repo.getGrns(filters);
  }

  async createGrn(data: Partial<GoodsReceiptNote>): Promise<GoodsReceiptNote> {
    return this.repo.createGrn(data);
  }

  // --- WORK ORDERS ---
  async getWorkOrders(filters: { category?: string; status?: string; projectId?: string }): Promise<SubcontractWorkOrder[]> {
    return this.repo.getWorkOrders(filters);
  }

  async createWorkOrder(data: Partial<SubcontractWorkOrder>): Promise<SubcontractWorkOrder> {
    return this.repo.createWorkOrder(data);
  }

  async addVariationOrder(id: string, variationData: Partial<WOVariationOrder>): Promise<SubcontractWorkOrder | null> {
    return this.repo.addVariationOrder(id, variationData);
  }

  // --- BOQ ---
  async getBoqItems(filters: { projectId?: string; category?: string }): Promise<BOQItem[]> {
    return this.repo.getBoqItems(filters);
  }

  async createBoqItem(data: Partial<BOQItem>): Promise<BOQItem> {
    return this.repo.createBoqItem(data);
  }

  // --- MEASUREMENT BOOKS ---
  async getMeasurementEntries(filters: { projectId?: string; boqItemId?: string }): Promise<MeasurementEntry[]> {
    return this.repo.getMeasurementEntries(filters);
  }

  async getBillableMeasurementEntries(filters: { projectId?: string; workOrderId?: string; boqItemId?: string }): Promise<BillableMeasurementEntry[]> {
    return this.repo.getBillableMeasurementEntries(filters);
  }

  async createMeasurementEntry(data: Partial<MeasurementEntry>): Promise<MeasurementEntry> {
    return this.repo.createMeasurementEntry(data);
  }

  async updateMeasurementStatus(id: string, updates: { status: string; verifiedByName?: string; approvedByName?: string }) {
    return this.repo.updateMeasurementStatus(id, updates);
  }

  // --- TENDERS ---
  async getTenders(filters: { tenderStatus?: string; search?: string }): Promise<TenderRecord[]> {
    return this.repo.getTenders(filters);
  }

  async createTender(data: Partial<TenderRecord>): Promise<TenderRecord> {
    return this.repo.createTender(data);
  }

  // --- COST CONTROL & DASHBOARD REPORTS ---
  async getCostControls() {
    return this.repo.getCostControls();
  }

  async getDashboardReports() {
    return this.repo.getDashboardReports();
  }

  // --- MATERIAL REQUESTS & APPROVAL ENGINE ---
  async getMaterialRequests(filters?: { status?: string; priority?: string; projectId?: string; requestedByUserId?: string; search?: string }) {
    return this.repo.getMaterialRequests(filters);
  }

  async getMaterialRequestById(id: string) {
    return this.repo.getMaterialRequestById(id);
  }

  async createMaterialRequest(data: Partial<MaterialRequest>, user?: any) {
    return this.repo.createMaterialRequest(data, user);
  }

  async processMaterialRequestAction(id: string, action: 'APPROVE' | 'REJECT' | 'SEND_BACK' | 'CLARIFICATION_REQUESTED' | 'CANCEL', user: any, remarks: string) {
    return this.repo.processMaterialRequestAction(id, action, user, remarks);
  }

  async recordMaterialReceipt(id: string, receiptData: any, user: any) {
    return this.repo.recordMaterialReceipt(id, receiptData, user);
  }

  async addMaterialRequestAttachment(id: string, attachment: any, user: any) {
    return this.repo.addMaterialRequestAttachment(id, attachment, user);
  }

  // --- WORKFLOW CONFIGURATIONS ---
  async getWorkflowConfigs() {
    return this.repo.getWorkflowConfigs();
  }

  async getWorkflowConfigByProjectId(projectId: string) {
    return this.repo.getWorkflowConfigByProjectId(projectId);
  }

  async saveWorkflowConfig(config: any) {
    return this.repo.saveWorkflowConfig(config);
  }

  // --- NOTIFICATIONS & AUDIT LOGS ---
  async getNotifications(userId?: string) {
    return this.repo.getNotifications(userId);
  }

  async markNotificationRead(id: string) {
    return this.repo.markNotificationRead(id);
  }

  async getAuditLogs(entityId?: string) {
    return this.repo.getAuditLogs(entityId);
  }

  // --- STOCK TRANSACTIONS & MATERIAL LEDGER ---
  async getStockTransactions(projectId?: string) {
    return this.repo.getStockTransactions(projectId);
  }

  async getMaterialLedger(projectId?: string) {
    return this.repo.getMaterialLedger(projectId);
  }

  // ====================================================
  // PHASE 56: ENTERPRISE PROCUREMENT SERVICE METHODS
  // ====================================================

  // --- PURCHASE REQUISITIONS ---
  async createPhase56PR(data: any) {
    return this.repo.createPhase56PR(data);
  }

  async getPhase56PRs(filters: { search?: string; status?: string; projectId?: string }) {
    return this.repo.getPhase56PRs(filters);
  }

  async getPhase56PRById(id: string) {
    return this.repo.getPhase56PRById(id);
  }

  async approvePhase56PR(prId: string, approverId: string, approverName: string, action: 'APPROVE' | 'REJECT', comments?: string) {
    return this.repo.approvePhase56PR(prId, approverId, approverName, action, comments);
  }

  async softDeletePR(id: string) {
    return this.repo.softDeletePR(id);
  }

  // --- RFQS ---
  async createPhase56RFQ(data: any) {
    return this.repo.createPhase56RFQ(data);
  }

  async getPhase56RFQs(filters: { search?: string; status?: string; projectId?: string }) {
    return this.repo.getPhase56RFQs(filters);
  }

  async getPhase56RFQById(id: string) {
    return this.repo.getPhase56RFQById(id);
  }

  async softDeleteRFQ(id: string) {
    return this.repo.softDeleteRFQ(id);
  }

  // --- VENDOR QUOTATIONS ---
  async createPhase56VendorQuotation(data: any) {
    return this.repo.createPhase56VendorQuotation(data);
  }

  async getPhase56VendorQuotations(filters: { rfqId?: string; vendorId?: string }) {
    return this.repo.getPhase56VendorQuotations(filters);
  }

  async getPhase56VendorQuotationById(id: string) {
    return this.repo.getPhase56VendorQuotationById(id);
  }

  // --- EVALUATIONS ---
  async createTechnicalEvaluation(data: any) {
    return this.repo.createTechnicalEvaluation(data);
  }

  async getTechnicalEvaluations(rfqId?: string) {
    return this.repo.getTechnicalEvaluations(rfqId);
  }

  async createCommercialEvaluation(data: any) {
    return this.repo.createCommercialEvaluation(data);
  }

  async getCommercialEvaluations(rfqId?: string) {
    return this.repo.getCommercialEvaluations(rfqId);
  }

  // --- COMPARATIVE STATEMENTS ---
  async createComparativeStatement(data: any) {
    return this.repo.createComparativeStatement(data);
  }

  async getComparativeStatements(rfqId?: string) {
    return this.repo.getComparativeStatements(rfqId);
  }

  async approveComparativeStatement(id: string, approverName: string) {
    return this.repo.approveComparativeStatement(id, approverName);
  }

  async generatePoFromComparativeStatement(csId: string, options?: { user?: any; companyId?: string; idempotencyKey?: string }) {
    return this.repo.generatePoFromComparativeStatement(csId, options);
  }

  // --- PURCHASE ORDERS ---
  async createPhase56PO(data: any) {
    return this.repo.createPhase56PO(data);
  }

  async getPhase56POs(filters: { search?: string; status?: string; vendorId?: string; projectId?: string }) {
    return this.repo.getPhase56POs(filters);
  }

  async getPhase56POById(id: string) {
    return this.repo.getPhase56POById(id);
  }

  async revisePO(data: { poId: string; reasonForRevision: string; revisedBy: string; newTotalAmount: number; changesSummary?: string }) {
    return this.repo.revisePO(data);
  }

  // --- DELIVERY SCHEDULES ---
  async createDeliverySchedule(data: any) {
    return this.repo.createDeliverySchedule(data);
  }

  async getDeliverySchedules(poId?: string) {
    return this.repo.getDeliverySchedules(poId);
  }

  async updateDeliveryScheduleStatus(id: string, status: string, deliveredQty?: number) {
    return this.repo.updateDeliveryScheduleStatus(id, status, deliveredQty);
  }

  // --- VENDOR PERFORMANCE ---
  async createVendorPerformance(data: any) {
    return this.repo.createVendorPerformance(data);
  }

  async getVendorPerformances(vendorId?: string) {
    return this.repo.getVendorPerformances(vendorId);
  }

  // --- BUDGET ALLOCATIONS ---
  async createBudgetAllocation(data: any) {
    return this.repo.createBudgetAllocation(data);
  }

  async getBudgetAllocations(projectId?: string) {
    return this.repo.getBudgetAllocations(projectId);
  }

  // --- LOGS ---
  async getProcurementLogs(entityId?: string) {
    return this.repo.getProcurementLogs(entityId);
  }

  // --- RUNNING ACCOUNT (RA) BILLING ---
  async getRABills(filters: { projectId?: string; workOrderId?: string; status?: string; search?: string }): Promise<RABillRecord[]> {
    return this.repo.getRABills(filters);
  }

  async getRABillById(id: string): Promise<RABillRecord | null> {
    return this.repo.getRABillById(id);
  }

  async createRABill(data: Partial<RABillRecord>): Promise<RABillRecord> {
    return this.repo.createRABill(data);
  }

  async updateRABillStatus(
    id: string,
    updates: {
      status: string;
      qsVerifier?: string;
      siteEngineer?: string;
      projectDirector?: string;
      financeApprover?: string;
      paymentReferenceNumber?: string;
      paymentDisbursedDate?: string;
      remarks?: string;
    }
  ): Promise<RABillRecord | null> {
    return this.repo.updateRABillStatus(id, updates);
  }

  async deleteRABill(id: string): Promise<boolean> {
    return this.repo.deleteRABill(id);
  }
}

export const procurementService = new ProcurementService();
