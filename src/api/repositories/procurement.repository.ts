import {
  Vendor,
  RFQ,
  VendorQuotation,
  PurchaseRequisition,
  PurchaseOrder,
  POStatus,
  GoodsReceiptNote,
  SubcontractWorkOrder,
  WOVariationOrder,
  BOQItem,
  MeasurementEntry,
  TenderRecord,
  ProjectCostControl,
  MaterialRequest,
  MaterialRequestAttachment,
  ProcurementWorkflowConfig,
  ProcurementWorkflowStep,
  InAppNotification,
  ProcurementAuditLog,
  MaterialStockTransaction,
  MaterialLedgerEntry,
  RABillRecord,
  RABillStatus,
  RABillAuditEntry,
  BillableMeasurementEntry,
} from '../../types/procurement';
import { db } from '../../db';
import { eq, and, ilike, or, desc, sql } from 'drizzle-orm';
import { numberingService } from '../services/numbering.service';
import {
  purchaseRequisitions,
  purchaseRequisitionItems,
  requestForQuotations,
  rfqItems,
  rfqVendors,
  vendorQuotations,
  vendorQuotationItems,
  technicalEvaluations,
  commercialEvaluations,
  comparativeStatements,
  purchaseOrders as schemaPurchaseOrders,
  purchaseOrderItems,
  purchaseOrderRevisions,
  purchaseOrderApprovals,
  deliverySchedules,
  vendorPerformance,
  procurementLogs,
  budgetAllocations,
  procurementComments,
  procurementDocuments,
  procurementVendorsTable,
  procurementRfqsTable,
  procurementQuotationsTable,
  procurementRequisitionsTable,
  procurementPurchaseOrdersTable,
  procurementGrnsTable,
  procurementWorkOrdersTable,
  procurementBoqItemsTable,
  procurementMeasurementEntriesTable,
  procurementTendersTable,
  procurementCostControlsTable,
  procurementMaterialRequestsTable,
  procurementRaBillsTable,
  materials,
  stockTransactions,
} from '../../db/schema';
import { legacyProcurementTelemetry } from '../telemetry/legacy_procurement.telemetry';
import { legacyProcurementAdapter } from '../services/legacy_procurement_adapter';
import { INITIAL_RA_BILLS } from '../../data/procurementMockData';
import { enterpriseAuditRepository } from './enterprise_audit.repository';
import { universalWorkflowBindingService } from '../services/universal_workflow_binding.service';

// Re-export table definitions for any module importing from repository
export {
  procurementVendorsTable,
  procurementRfqsTable,
  procurementQuotationsTable,
  procurementRequisitionsTable,
  procurementPurchaseOrdersTable,
  procurementGrnsTable,
  procurementWorkOrdersTable,
  procurementBoqItemsTable,
  procurementMeasurementEntriesTable,
  procurementTendersTable,
  procurementCostControlsTable,
  procurementMaterialRequestsTable,
  procurementRaBillsTable,
};

// ====================================================
// DATABASE SAFETY: ZERO-DML INITIALIZATION
// ====================================================

/**
 * Production runtime MUST NOT execute automatic seed INSERTs or mutations.
 * ensureProcurementSeeded is a zero-DML no-op function for complete production database safety.
 */
export async function ensureProcurementSeeded(): Promise<void> {
  // STRICT ZERO-DML NO-OP in production runtime.
  return;
}

/**
 * Explicit development-only utility for on-demand local seeding.
 * Strictly prohibited in production environments.
 */
export async function seedProcurementDevData(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Database seeding is strictly prohibited in production runtime.');
  }

  // Developer on-demand seeding
  try {
    const existingBills = await db.select().from(procurementRaBillsTable).limit(1);
    if (existingBills.length === 0) {
      const now = new Date().toISOString();
      for (const bill of INITIAL_RA_BILLS) {
        await db.insert(procurementRaBillsTable).values({
          id: bill.id,
          billNumber: bill.billNumber,
          workOrderId: bill.workOrderId || null,
          workOrderNumber: bill.workOrderNumber || null,
          projectId: bill.projectId,
          projectName: bill.projectName,
          contractorName: bill.contractorName,
          contractorCode: bill.contractorCode,
          billDate: bill.billDate,
          billingPeriodStart: bill.billingPeriodStart,
          billingPeriodEnd: bill.billingPeriodEnd,
          billType: bill.billType,
          sequenceNumber: bill.sequenceNumber,
          isFinalBill: bill.isFinalBill,
          status: bill.status,
          items: bill.items || [],
          financials: bill.financials || {},
          contractorRepresentative: bill.contractorRepresentative,
          qsVerifier: bill.qsVerifier || null,
          siteEngineer: bill.siteEngineer || null,
          projectDirector: bill.projectDirector || null,
          financeApprover: bill.financeApprover || null,
          paymentReferenceNumber: bill.paymentReferenceNumber || null,
          paymentDisbursedDate: bill.paymentDisbursedDate || null,
          remarks: bill.remarks,
          attachments: bill.attachments || [],
          createdAt: bill.createdAt || now,
          updatedAt: bill.updatedAt || now,
        } as any).onConflictDoNothing();
      }
    }
  } catch (err: any) {
    console.error('[Procurement Dev Seeding Error]', err);
  }
}

// ====================================================
// REPOSITORY CLASS & METHODS
// ====================================================

// --- MEMORY STORES FOR PHASE 46.1 PATTERNS ---
let memoryWorkflows: ProcurementWorkflowConfig[] = [
  {
    id: 'wf_prj_01',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    workflowName: 'Standard Water Piping Approval Matrix',
    steps: [
      { stepOrder: 1, role: 'INCHARGE', label: 'Site Incharge Approval', isRequired: true },
      { stepOrder: 2, role: 'QA', label: 'QA / Tech Spec Review', isRequired: true },
      { stepOrder: 3, role: 'MANAGER', label: 'Project Manager Authorization', isRequired: true },
      { stepOrder: 4, role: 'STORE', label: 'Store Yard Receipt', isRequired: true }
    ],
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'wf_prj_02',
    projectId: 'prj_02',
    projectName: 'High-Speed Rail Viaduct Segment B',
    workflowName: 'Express Rail Infrastructure Workflow',
    steps: [
      { stepOrder: 1, role: 'INCHARGE', label: 'Site Incharge Review', isRequired: true },
      { stepOrder: 2, role: 'MANAGER', label: 'Project Manager Approval', isRequired: true },
      { stepOrder: 3, role: 'STORE', label: 'Store Yard Receipt', isRequired: true }
    ],
    isActive: true,
    updatedAt: new Date().toISOString()
  }
];

let memoryNotifications: InAppNotification[] = [
  {
    id: 'notif_1',
    recipientUserId: 'usr_incharge_01',
    recipientRole: 'INCHARGE',
    title: 'New Material Request Awaiting Approval',
    message: 'Material Request MR-20260808-001 for Peruvannamuzhi WTP is awaiting your site incharge review.',
    type: 'APPROVAL_PENDING',
    referenceId: 'mr_01',
    referenceNo: 'MR-20260808-001',
    isRead: false,
    createdAt: new Date().toISOString()
  }
];

let memoryAuditLogs: ProcurementAuditLog[] = [
  {
    id: 'aud_1',
    entityType: 'MATERIAL_REQUEST',
    entityId: 'mr_01',
    action: 'MATERIAL_REQUEST_SUBMITTED',
    actorId: 'usr_supervisor_01',
    actorName: 'Siddharth Nair',
    actorRole: 'SUPERVISOR',
    remarks: 'Material Request submitted for valve station installation.',
    timestamp: new Date().toISOString()
  }
];

let memoryStockTransactions: MaterialStockTransaction[] = [
  {
    id: 'stx_1',
    materialRequestId: 'mr_02',
    requestNo: 'MR-20260807-002',
    projectId: 'prj_02',
    projectName: 'High-Speed Rail Viaduct Segment B',
    storeId: 'str_02',
    storeName: 'Surat Pier 42 Project Yard Store',
    itemDescription: 'OPC 53 Grade Cement Bags (50kg)',
    transactionType: 'IN_RECEIPT',
    quantity: 300,
    unit: 'Bags',
    deliveryNoteNo: 'DN-2026-0899',
    performedBy: 'Ramesh Kumar (Store Keeper)',
    timestamp: new Date().toISOString()
  }
];

let memoryMaterialLedger: MaterialLedgerEntry[] = [
  {
    id: 'mle_1',
    materialRequestId: 'mr_02',
    requestNo: 'MR-20260807-002',
    projectId: 'prj_02',
    itemDescription: 'OPC 53 Grade Cement Bags (50kg)',
    stage: 'RECEIVED',
    requestedQty: 500,
    approvedQty: 500,
    receivedQty: 300,
    balanceQty: 200,
    unit: 'Bags',
    updatedAt: new Date().toISOString()
  }
];

export class ProcurementRepository {

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
    await ensureProcurementSeeded();
    const all = (await db.select().from(procurementVendorsTable)) as unknown as Vendor[];

    let filtered = all.filter((v) => {
      let matches = true;
      if (params.category && params.category !== 'ALL') {
        matches = matches && v.category === params.category;
      }
      if (params.status && params.status !== 'ALL') {
        matches = matches && v.status === params.status;
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        matches =
          matches &&
          (v.name.toLowerCase().includes(q) ||
            v.vendorCode.toLowerCase().includes(q) ||
            (v.gstin && v.gstin.toLowerCase().includes(q)) ||
            (v.pan && v.pan.toLowerCase().includes(q)));
      }
      return matches;
    });

    const sortBy = params.sortBy || 'name';
    const sortOrder = params.sortOrder || 'asc';
    filtered.sort((a: any, b: any) => {
      const valA = a[sortBy] || '';
      const valB = b[sortBy] || '';
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const page = params.page || 1;
    const limit = params.limit || 50;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const data = filtered.slice(startIndex, startIndex + limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async createVendor(data: Partial<Vendor>): Promise<Vendor> {
    await ensureProcurementSeeded();
    const allVendors = await db.select().from(procurementVendorsTable);
    const newId = `vnd_${Date.now()}`;
    const newCode = `VND-2026-${String(allVendors.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];

    const newVendor: Vendor = {
      id: newId,
      vendorCode: newCode,
      name: data.name || 'New Vendor',
      category: data.category || ('Civil & Structural Materials' as any),
      gstin: data.gstin || '',
      pan: data.pan || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      pincode: data.pincode || '',
      contactPersons: data.contactPersons || [],
      bankDetails: data.bankDetails || { bankName: '', accountNumber: '', ifscCode: '', branchName: '' },
      paymentTerms: data.paymentTerms || 'Net 30 Days',
      creditPeriodDays: data.creditPeriodDays || 30,
      rating: data.rating || 5.0,
      status: data.status || 'Approved',
      documents: data.documents || [],
      performance: data.performance || {
        totalOrders: 0,
        onTimeDeliveryRate: 100.0,
        qualityComplianceRate: 100.0,
        lastEvaluatedDate: now,
        remarks: 'Newly onboarded vendor.',
      },
      createdAt: now,
    };

    await db.insert(procurementVendorsTable).values({
      id: newVendor.id,
      vendorCode: newVendor.vendorCode,
      name: newVendor.name,
      category: newVendor.category,
      gstin: newVendor.gstin,
      pan: newVendor.pan,
      address: newVendor.address,
      city: newVendor.city,
      state: newVendor.state,
      pincode: newVendor.pincode,
      contactPersons: newVendor.contactPersons,
      bankDetails: newVendor.bankDetails,
      paymentTerms: newVendor.paymentTerms,
      creditPeriodDays: newVendor.creditPeriodDays,
      rating: newVendor.rating,
      status: newVendor.status,
      documents: newVendor.documents,
      performance: newVendor.performance,
      createdAt: newVendor.createdAt,
    } as any);

    return newVendor;
  }

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | null> {
    await ensureProcurementSeeded();
    const rows = await db.select().from(procurementVendorsTable).where(eq(procurementVendorsTable.id, id)).limit(1);
    if (rows.length === 0) return null;

    const existing = rows[0] as unknown as Vendor;
    const updated: Vendor = { ...existing, ...updates };

    await db.update(procurementVendorsTable)
      .set({
        name: updated.name,
        category: updated.category,
        gstin: updated.gstin,
        pan: updated.pan,
        address: updated.address,
        city: updated.city,
        state: updated.state,
        pincode: updated.pincode,
        contactPersons: updated.contactPersons,
        bankDetails: updated.bankDetails,
        paymentTerms: updated.paymentTerms,
        creditPeriodDays: updated.creditPeriodDays,
        rating: updated.rating,
        status: updated.status,
        documents: updated.documents,
        performance: updated.performance,
      } as any)
      .where(eq(procurementVendorsTable.id, id));

    return updated;
  }

  async deleteVendor(id: string): Promise<boolean> {
    await ensureProcurementSeeded();
    const res = await db.delete(procurementVendorsTable).where(eq(procurementVendorsTable.id, id));
    return true;
  }

  // --- RFQS ---
  async getRfqs(filters: { status?: string; projectId?: string; search?: string }): Promise<RFQ[]> {
    await ensureProcurementSeeded();
    const rows = (await db.select().from(procurementRfqsTable).orderBy(desc(procurementRfqsTable.createdAt))) as unknown as RFQ[];
    let result = rows;

    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters.projectId) {
      result = result.filter((r) => r.projectId === filters.projectId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((r) => r.rfqCode.toLowerCase().includes(q) || r.title.toLowerCase().includes(q));
    }
    return result;
  }

  async createRfq(data: Partial<RFQ>): Promise<RFQ> {
    await ensureProcurementSeeded();
    const all = await db.select().from(procurementRfqsTable);
    const newId = `rfq_${Date.now()}`;
    const newCode = `RFQ-2026-${String(all.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];

    const newRfq: RFQ = {
      id: newId,
      rfqCode: newCode,
      title: data.title || 'New Material Enquiry',
      projectId: data.projectId || 'prj_01',
      projectName: data.projectName || 'General Site',
      invitedVendorIds: data.invitedVendorIds || [],
      invitedVendorNames: data.invitedVendorNames || [],
      dueDate: data.dueDate || now,
      items: data.items || [],
      status: 'Published',
      approvalStatus: 'Approved for Release',
      attachments: data.attachments || [],
      createdDate: now,
      createdByName: data.createdByName || 'Procurement Executive',
    };

    await db.insert(procurementRfqsTable).values({
      id: newRfq.id,
      rfqCode: newRfq.rfqCode,
      title: newRfq.title,
      projectId: newRfq.projectId,
      projectName: newRfq.projectName,
      invitedVendorIds: newRfq.invitedVendorIds,
      invitedVendorNames: newRfq.invitedVendorNames,
      dueDate: newRfq.dueDate,
      items: newRfq.items,
      status: newRfq.status,
      approvalStatus: newRfq.approvalStatus,
      attachments: newRfq.attachments,
      createdDate: newRfq.createdDate,
      createdByName: newRfq.createdByName,
      createdAt: now,
    } as any);

    return newRfq;
  }

  // --- QUOTATIONS ---
  async getQuotations(filters: { rfqId?: string; vendorId?: string }): Promise<VendorQuotation[]> {
    await ensureProcurementSeeded();
    let rows = (await db.select().from(procurementQuotationsTable).orderBy(desc(procurementQuotationsTable.createdAt))) as unknown as VendorQuotation[];

    if (filters.rfqId) {
      rows = rows.filter((q) => q.rfqId === filters.rfqId);
    }
    if (filters.vendorId) {
      rows = rows.filter((q) => q.vendorId === filters.vendorId);
    }

    return rows;
  }

  async createQuotation(data: Partial<VendorQuotation>): Promise<VendorQuotation> {
    await ensureProcurementSeeded();
    const all = await db.select().from(procurementQuotationsTable);
    const newId = `qte_${Date.now()}`;
    const newNo = `QT-2026-${String(all.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];

    const newQuotation: VendorQuotation = {
      id: newId,
      quotationNo: newNo,
      rfqId: data.rfqId || 'rfq_01',
      vendorId: data.vendorId || 'vnd_01',
      vendorName: data.vendorName || 'Vendor Company',
      submittedDate: now,
      items: data.items || [],
      subtotalUSD: data.subtotalUSD || 0,
      taxUSD: data.taxUSD || 0,
      freightUSD: data.freightUSD || 0,
      netTotalUSD: data.netTotalUSD || 0,
      leadTimeDays: data.leadTimeDays || 7,
      warrantyMonths: data.warrantyMonths || 12,
      deliverySchedule: data.deliverySchedule || 'Immediate delivery upon PO',
      technicalCompliance: data.technicalCompliance || 'Compliant',
      technicalRemarks: data.technicalRemarks || 'Meets specs',
      commercialCompliance: data.commercialCompliance || 'Fully Accepted',
      commercialRemarks: data.commercialRemarks || 'Standard terms accepted',
      isL1Bidder: false,
    };

    await db.insert(procurementQuotationsTable).values({
      id: newQuotation.id,
      quotationNo: newQuotation.quotationNo,
      rfqId: newQuotation.rfqId,
      vendorId: newQuotation.vendorId,
      vendorName: newQuotation.vendorName,
      submittedDate: newQuotation.submittedDate,
      items: newQuotation.items,
      subtotalUSD: newQuotation.subtotalUSD,
      taxUSD: newQuotation.taxUSD,
      freightUSD: newQuotation.freightUSD,
      netTotalUSD: newQuotation.netTotalUSD,
      leadTimeDays: newQuotation.leadTimeDays,
      warrantyMonths: newQuotation.warrantyMonths,
      deliverySchedule: newQuotation.deliverySchedule,
      technicalCompliance: newQuotation.technicalCompliance,
      technicalRemarks: newQuotation.technicalRemarks,
      commercialCompliance: newQuotation.commercialCompliance,
      commercialRemarks: newQuotation.commercialRemarks,
      isL1Bidder: false,
      createdAt: now,
    } as any);

    // Recalculate L1 bidder status for all quotations under this RFQ
    const rfqQuotes = await db
      .select()
      .from(procurementQuotationsTable)
      .where(eq(procurementQuotationsTable.rfqId, newQuotation.rfqId));

    if (rfqQuotes.length > 0) {
      const lowestAmount = Math.min(...rfqQuotes.map((q) => Number(q.netTotalUSD)));
      for (const q of rfqQuotes) {
        const isL1 = Number(q.netTotalUSD) === lowestAmount;
        await db
          .update(procurementQuotationsTable)
          .set({ isL1Bidder: isL1 } as any)
          .where(eq(procurementQuotationsTable.id, q.id));
      }
    }

    // Return updated quotation object
    return {
      ...newQuotation,
      isL1Bidder: rfqQuotes.length > 0 ? newQuotation.netTotalUSD === Math.min(...rfqQuotes.map((q) => Number(q.netTotalUSD))) : true,
    };
  }

  async getComparativeStatement(rfqId: string) {
    await ensureProcurementSeeded();
    const rfqRows = await db.select().from(procurementRfqsTable).where(eq(procurementRfqsTable.id, rfqId)).limit(1);
    const rfq = rfqRows[0] as unknown as RFQ;

    const quotes = (await db
      .select()
      .from(procurementQuotationsTable)
      .where(eq(procurementQuotationsTable.rfqId, rfqId))) as unknown as VendorQuotation[];

    const lowestQuote = quotes.length > 0 ? quotes.reduce((min, q) => (q.netTotalUSD < min.netTotalUSD ? q : min), quotes[0]) : null;

    return {
      rfq,
      totalQuotesReceived: quotes.length,
      l1Bidder: lowestQuote ? { vendorId: lowestQuote.vendorId, vendorName: lowestQuote.vendorName, amountUSD: lowestQuote.netTotalUSD } : null,
      quotations: quotes,
    };
  }

  // --- PURCHASE REQUISITIONS (TRANSACTION WORKFLOW #1) ---
  async getRequisitions(filters: { status?: string; projectId?: string; search?: string }): Promise<PurchaseRequisition[]> {
    await ensureProcurementSeeded();
    let rows = (await db.select().from(procurementRequisitionsTable).orderBy(desc(procurementRequisitionsTable.createdAt))) as unknown as PurchaseRequisition[];

    if (filters.status && filters.status !== 'ALL') {
      rows = rows.filter((pr) => pr.status === filters.status);
    }
    if (filters.projectId) {
      rows = rows.filter((pr) => pr.projectId === filters.projectId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      rows = rows.filter((pr) => pr.prNumber.toLowerCase().includes(q) || (pr.projectName && pr.projectName.toLowerCase().includes(q)));
    }

    return rows;
  }

  async createRequisition(data: Partial<PurchaseRequisition>): Promise<PurchaseRequisition> {
    await ensureProcurementSeeded();
    const all = await db.select().from(procurementRequisitionsTable);
    const newId = `pr_${Date.now()}`;
    const newNumber = `PR-2026-${String(all.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];

    const newPr: PurchaseRequisition = {
      id: newId,
      prNumber: newNumber,
      projectId: data.projectId || 'prj_01',
      projectName: data.projectName || 'General Construction',
      siteName: data.siteName || 'Main Pier',
      requestedByName: data.requestedByName || 'Site Engineer',
      department: data.department || 'Civil & Structural',
      urgency: data.urgency || 'Normal',
      status: 'Submitted',
      createdDate: now,
      requiredByDate: data.requiredByDate || now,
      budgetAllocatedUSD: data.budgetAllocatedUSD || 5000,
      items: data.items || [],
      remarks: data.remarks || 'Site requisition for ongoing works',
    };

    await db.insert(procurementRequisitionsTable).values({
      id: newPr.id,
      prNumber: newPr.prNumber,
      projectId: newPr.projectId,
      projectName: newPr.projectName,
      siteName: newPr.siteName,
      requestedByName: newPr.requestedByName,
      department: newPr.department,
      urgency: newPr.urgency,
      status: newPr.status,
      createdDate: newPr.createdDate,
      requiredByDate: newPr.requiredByDate,
      budgetAllocatedUSD: newPr.budgetAllocatedUSD,
      items: newPr.items,
      remarks: newPr.remarks,
      createdAt: now,
    } as any);

    return newPr;
  }

  /**
   * TRANSACTION WORKFLOW #1: Purchase Requisition -> Approval
   * Executes inside an atomic database transaction.
   */
  async updateRequisitionStatus(id: string, updates: { status: string; verifiedByName?: string; approvedByName?: string }) {
    await ensureProcurementSeeded();

    return await db.transaction(async (tx) => {
      const rows = await tx.select().from(procurementRequisitionsTable).where(eq(procurementRequisitionsTable.id, id)).limit(1);
      if (rows.length === 0) return null;

      const existing = rows[0] as unknown as PurchaseRequisition;
      const vName = updates.verifiedByName || existing.verifiedByName;
      const aName = updates.approvedByName || existing.approvedByName;

      await tx
        .update(procurementRequisitionsTable)
        .set({
          status: updates.status,
          verifiedByName: vName || null,
          approvedByName: aName || null,
        } as any)
        .where(eq(procurementRequisitionsTable.id, id));

      return {
        ...existing,
        status: updates.status as any,
        verifiedByName: vName,
        approvedByName: aName,
      };
    });
  }

  // --- PURCHASE ORDERS (TRANSACTION WORKFLOW #2) ---
  async getPurchaseOrders(filters: { status?: string; vendorId?: string; projectId?: string; search?: string }): Promise<PurchaseOrder[]> {
    await ensureProcurementSeeded();
    let rows = (await db.select().from(procurementPurchaseOrdersTable).orderBy(desc(procurementPurchaseOrdersTable.createdAt))) as unknown as PurchaseOrder[];
    const allGrns = (await db.select().from(procurementGrnsTable)) as unknown as GoodsReceiptNote[];

    rows = rows.map((po) => {
      const grnsForPo = allGrns.filter((g) => g.poId === po.id || g.poNumber === po.poNumber);
      return this.enrichPOWithItemQuantities(po, grnsForPo);
    });

    if (filters.status && filters.status !== 'ALL') {
      rows = rows.filter((po) => po.status === filters.status);
    }
    if (filters.vendorId) {
      rows = rows.filter((po) => po.vendorId === filters.vendorId);
    }
    if (filters.projectId) {
      rows = rows.filter((po) => po.projectId === filters.projectId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      rows = rows.filter(
        (po) =>
          po.poNumber.toLowerCase().includes(q) ||
          po.vendorName.toLowerCase().includes(q) ||
          po.projectName.toLowerCase().includes(q)
      );
    }

    return rows;
  }

  enrichPOWithItemQuantities(po: PurchaseOrder, grnsForPo: GoodsReceiptNote[]): PurchaseOrder {
    const items = (po.items || []).map((item) => {
      let receivedQty = 0;
      let acceptedQty = 0;
      let rejectedQty = 0;
      let returnedQty = 0;

      for (const grn of grnsForPo) {
        if (Array.isArray(grn.items)) {
          for (const gi of grn.items) {
            if (
              (gi.poItemId && gi.poItemId === item.id) ||
              (gi.itemCode && gi.itemCode === item.itemCode) ||
              (gi.description && gi.description === item.description)
            ) {
              receivedQty += Number(gi.receivedQty || 0);
              acceptedQty += Number(gi.acceptedQty ?? gi.receivedQty ?? 0);
              rejectedQty += Number(gi.rejectedQty || 0);
              returnedQty += Number(gi.returnedQty || 0);
            }
          }
        }
      }

      const finalReceived = receivedQty > 0 ? receivedQty : Number(item.receivedQuantity || 0);
      const finalAccepted = acceptedQty > 0 ? acceptedQty : Number(item.acceptedQuantity || finalReceived);
      const finalRejected = rejectedQty > 0 ? rejectedQty : Number(item.rejectedQuantity || 0);
      const finalReturned = returnedQty > 0 ? returnedQty : Number(item.returnedQuantity || 0);
      const ordered = Number(item.quantity || 0);
      const balance = Math.max(0, ordered - finalAccepted);

      return {
        ...item,
        quantity: ordered,
        receivedQuantity: finalReceived,
        acceptedQuantity: finalAccepted,
        rejectedQuantity: finalRejected,
        returnedQuantity: finalReturned,
        balanceQuantity: balance,
      };
    });

    return {
      ...po,
      items,
    };
  }

  /**
   * TRANSACTION WORKFLOW #2: Purchase Order -> Vendor Assignment & Cost Control Update
   * Executes inside an atomic database transaction.
   */
  async createPurchaseOrder(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    await ensureProcurementSeeded();
    const newId = `po_${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];
    const newPoNumber = data.poNumber || (await numberingService.generatePurchaseOrderNumber({
      companyId: 'cmp-101',
      projectId: data.projectId || 'prj_01',
      date: data.poDate || now,
    }));

    const newPo: PurchaseOrder = {
      id: newId,
      poNumber: newPoNumber,
      prId: data.prId,
      rfqId: data.rfqId,
      vendorId: data.vendorId || 'vnd_01',
      vendorName: data.vendorName || 'Larsen Steel Ltd',
      vendorCode: data.vendorCode || 'VND-2026-001',
      vendorGstin: data.vendorGstin || '27AAACL1234H1Z5',
      projectId: data.projectId || 'prj_01',
      projectName: data.projectName || 'Metro Line 4',
      siteAddress: data.siteAddress || 'Site Pier 3',
      poDate: now,
      deliveryDueDate: data.deliveryDueDate || now,
      paymentTerms: data.paymentTerms || 'Net 30 Days',
      freightTerms: data.freightTerms || 'FOR Destination',
      subtotalUSD: data.subtotalUSD || 1000,
      discountUSD: data.discountUSD || 0,
      gstUSD: data.gstUSD || 180,
      freightUSD: data.freightUSD || 50,
      netAmountUSD: data.netAmountUSD || 1230,
      status: 'Issued',
      approvalStatus: 'Approved',
      items: data.items || [],
      termsAndConditions: data.termsAndConditions || 'Standard construction supply terms apply.',
      issuedByName: data.issuedByName || 'Procurement Manager',
      approvedByName: data.approvedByName || 'Project Director',
    };

    return await db.transaction(async (tx) => {
      // 1. Insert Purchase Order
      await tx.insert(procurementPurchaseOrdersTable).values({
        id: newPo.id,
        poNumber: newPo.poNumber,
        prId: newPo.prId || null,
        rfqId: newPo.rfqId || null,
        vendorId: newPo.vendorId,
        vendorName: newPo.vendorName,
        vendorCode: newPo.vendorCode,
        vendorGstin: newPo.vendorGstin,
        projectId: newPo.projectId,
        projectName: newPo.projectName,
        siteAddress: newPo.siteAddress,
        poDate: newPo.poDate,
        deliveryDueDate: newPo.deliveryDueDate,
        paymentTerms: newPo.paymentTerms,
        freightTerms: newPo.freightTerms,
        subtotalUSD: newPo.subtotalUSD,
        discountUSD: newPo.discountUSD,
        gstUSD: newPo.gstUSD,
        freightUSD: newPo.freightUSD,
        netAmountUSD: newPo.netAmountUSD,
        status: newPo.status,
        approvalStatus: newPo.approvalStatus,
        items: newPo.items,
        termsAndConditions: newPo.termsAndConditions,
        issuedByName: newPo.issuedByName,
        approvedByName: newPo.approvedByName || null,
        createdAt: now,
      } as any);

      // 2. Update Cost Control committed PO total for project atomically
      const costRows = await tx
        .select()
        .from(procurementCostControlsTable)
        .where(eq(procurementCostControlsTable.projectId, newPo.projectId))
        .limit(1);

      if (costRows.length > 0) {
        const c = costRows[0];
        const newCommitted = (c.committedPOUSD || 0) + newPo.netAmountUSD;
        const newRemaining = (c.totalBudgetUSD || 0) - ((c.totalSpentUSD || 0) + newCommitted);
        await tx
          .update(procurementCostControlsTable)
          .set({
            committedPOUSD: newCommitted,
            remainingBudgetUSD: newRemaining,
            costVarianceUSD: newRemaining,
          } as any)
          .where(eq(procurementCostControlsTable.id, c.id));
      }

      return newPo;
    });
  }

  // --- GOODS RECEIPT NOTES (TRANSACTION WORKFLOW #3) ---
  async getGrns(filters: { poId?: string; projectId?: string }): Promise<GoodsReceiptNote[]> {
    await ensureProcurementSeeded();
    let rows = (await db.select().from(procurementGrnsTable).orderBy(desc(procurementGrnsTable.createdAt))) as unknown as GoodsReceiptNote[];

    if (filters.poId) {
      rows = rows.filter((g) => g.poId === filters.poId);
    }
    if (filters.projectId) {
      rows = rows.filter((g) => g.projectId === filters.projectId);
    }

    return rows;
  }

  /**
   * TRANSACTION WORKFLOW #3: Goods Receipt Note -> Item-Aware PO Partial Receipt -> Stock & Ledger Update
   * Executes inside an atomic database transaction.
   */
  async createGrn(data: Partial<GoodsReceiptNote>): Promise<GoodsReceiptNote> {
    await ensureProcurementSeeded();
    const newId = `grn_${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];
    const newGrnNumber = data.grnNumber || (await numberingService.generateGoodsReceiptNumber({
      companyId: 'cmp-101',
      projectId: data.projectId || 'prj_01',
      date: data.receivedDate || now,
    }));

    const targetPoId = data.poId || 'po_01';
    const targetPoNumber = data.poNumber || 'PO-2026-001';

    const newGrn: GoodsReceiptNote = {
      id: newId,
      grnNumber: newGrnNumber,
      poId: targetPoId,
      poNumber: targetPoNumber,
      vendorId: data.vendorId || 'vnd_01',
      vendorName: data.vendorName || 'Larsen Steel Ltd',
      projectId: data.projectId || 'prj_01',
      projectName: data.projectName || 'Metro Line 4',
      warehouseName: data.warehouseName || 'Main Central Warehouse',
      receivedDate: data.receivedDate || now,
      challanNo: data.challanNo || 'CH-10029',
      challanDate: data.challanDate || now,
      inspectedByName: data.inspectedByName || 'Store Manager',
      qualityStatus: data.qualityStatus || 'Passed',
      items: data.items || [],
      stockUpdated: true,
      remarks: data.remarks || 'Goods received and inspected at site store.',
    };

    return await db.transaction(async (tx) => {
      // 1. Look up linked PO from DB inside transaction
      let poRecord: PurchaseOrder | null = null;
      if (newGrn.poId) {
        const poRows = await tx
          .select()
          .from(procurementPurchaseOrdersTable)
          .where(eq(procurementPurchaseOrdersTable.id, newGrn.poId))
          .limit(1);
        if (poRows[0]) poRecord = poRows[0] as unknown as PurchaseOrder;
      }
      if (!poRecord && newGrn.poNumber) {
        const poRows = await tx
          .select()
          .from(procurementPurchaseOrdersTable)
          .where(eq(procurementPurchaseOrdersTable.poNumber, newGrn.poNumber))
          .limit(1);
        if (poRows[0]) poRecord = poRows[0] as unknown as PurchaseOrder;
      }

      // If PO exists, validate against previously received quantities to enforce over-receipt protection
      if (poRecord) {
        const existingGrns = (await tx
          .select()
          .from(procurementGrnsTable)
          .where(
            or(
              eq(procurementGrnsTable.poId, poRecord.id),
              eq(procurementGrnsTable.poNumber, poRecord.poNumber)
            )
          )) as unknown as GoodsReceiptNote[];

        const currentPoWithBalances = this.enrichPOWithItemQuantities(poRecord, existingGrns);

        for (const gi of newGrn.items || []) {
          const matchedPoItem = currentPoWithBalances.items.find(
            (pi) =>
              (gi.poItemId && pi.id === gi.poItemId) ||
              (gi.itemCode && pi.itemCode === gi.itemCode) ||
              (gi.description && pi.description === gi.description)
          );

          if (matchedPoItem) {
            const thisAcceptedQty = Number(gi.acceptedQty ?? gi.receivedQty ?? 0);
            const remainingBalance = matchedPoItem.balanceQuantity ?? Math.max(0, matchedPoItem.quantity - (matchedPoItem.acceptedQuantity || 0));

            // Hard check: accepted quantity cannot exceed remaining PO balance
            if (thisAcceptedQty > remainingBalance) {
              throw new Error(
                `Over-receipt protection violation: Attempted to accept ${thisAcceptedQty} ${gi.unit || 'units'} for item '${gi.itemCode || gi.description}', but remaining PO balance is only ${remainingBalance} ${gi.unit || 'units'}. Over-receipt is blocked.`
              );
            }
          }
        }
      }

      // 2. Insert GRN record
      await tx.insert(procurementGrnsTable).values({
        id: newGrn.id,
        grnNumber: newGrn.grnNumber,
        poId: newGrn.poId,
        poNumber: newGrn.poNumber,
        vendorId: newGrn.vendorId,
        vendorName: newGrn.vendorName,
        projectId: newGrn.projectId,
        projectName: newGrn.projectName,
        warehouseName: newGrn.warehouseName,
        receivedDate: newGrn.receivedDate,
        challanNo: newGrn.challanNo,
        challanDate: newGrn.challanDate,
        inspectedByName: newGrn.inspectedByName,
        qualityStatus: newGrn.qualityStatus,
        items: newGrn.items,
        stockUpdated: true,
        remarks: newGrn.remarks,
        createdAt: now,
      } as any);

      // 3. Atomically update Store Stock for accepted quantities
      for (const gi of newGrn.items || []) {
        const acceptedQty = Number(gi.acceptedQty ?? gi.receivedQty ?? 0);
        if (acceptedQty > 0) {
          const matRows = await tx
            .select()
            .from(materials)
            .where(
              or(
                eq(materials.itemCode, gi.itemCode || ''),
                eq(materials.name, gi.description || '')
              )
            )
            .limit(1);

          if (matRows[0]) {
            const mat = matRows[0];
            const newStock = (mat.currentStock || 0) + acceptedQty;
            await tx
              .update(materials)
              .set({ currentStock: newStock, updatedAt: new Date().toISOString() } as any)
              .where(eq(materials.id, mat.id));

            await tx.insert(stockTransactions).values({
              id: `stx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              transactionCode: newGrn.grnNumber,
              transactionType: 'GOODS_RECEIPT',
              materialId: mat.id,
              materialName: mat.name,
              materialCode: mat.itemCode,
              warehouseId: 'wh-001',
              warehouseName: newGrn.warehouseName,
              quantity: acceptedQty,
              unitPrice: mat.unitPrice || 0,
              totalValue: acceptedQty * (mat.unitPrice || 0),
              projectId: newGrn.projectId,
              projectName: newGrn.projectName,
              referenceDoc: `${newGrn.poNumber} / ${newGrn.grnNumber}`,
              notes: `GRN Inward: ${newGrn.grnNumber} against PO ${newGrn.poNumber}`,
              receivedByName: newGrn.inspectedByName || 'Store Manager',
              status: 'COMPLETED',
              transactionDate: newGrn.receivedDate,
              createdAt: new Date().toISOString(),
            } as any);
          }
        }
      }

      // 4. Update linked PO items and progressive status ('Partially Received' vs 'Completed')
      if (poRecord) {
        const allGrnsForPo = [
          ...((await tx
            .select()
            .from(procurementGrnsTable)
            .where(
              or(
                eq(procurementGrnsTable.poId, poRecord.id),
                eq(procurementGrnsTable.poNumber, poRecord.poNumber)
              )
            )) as unknown as GoodsReceiptNote[]),
        ];

        const updatedPo = this.enrichPOWithItemQuantities(poRecord, allGrnsForPo);

        let allItemsFullyReceived = true;
        let anyItemReceived = false;

        for (const item of updatedPo.items) {
          const balance = item.balanceQuantity ?? Math.max(0, item.quantity - (item.acceptedQuantity || 0));
          const accepted = item.acceptedQuantity ?? 0;
          if (balance > 0) {
            allItemsFullyReceived = false;
          }
          if (accepted > 0) {
            anyItemReceived = true;
          }
        }

        let newStatus: POStatus = poRecord.status;
        if (allItemsFullyReceived && updatedPo.items.length > 0) {
          newStatus = 'Completed';
        } else if (anyItemReceived) {
          newStatus = 'Partially Received';
        }

        await tx
          .update(procurementPurchaseOrdersTable)
          .set({
            items: updatedPo.items,
            status: newStatus,
          } as any)
          .where(eq(procurementPurchaseOrdersTable.id, poRecord.id));
      }

      // 5. Procurement audit trail
      await tx.insert(procurementLogs).values({
        id: `plog_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        entityType: 'GRN',
        entityId: newGrn.id,
        entityNumber: newGrn.grnNumber,
        actionType: 'CREATE',
        performedBy: newGrn.inspectedByName || 'Store Manager',
        details: `Created GRN ${newGrn.grnNumber} against PO ${newGrn.poNumber} with ${newGrn.items?.length || 0} items.`,
        createdAt: now,
        updatedAt: now,
      } as any);

      return newGrn;
    });
  }

  // --- SUBCONTRACT WORK ORDERS & VARIATION ORDERS (TRANSACTION WORKFLOW #5) ---
  async getWorkOrders(filters: { category?: string; status?: string; projectId?: string }): Promise<SubcontractWorkOrder[]> {
    await ensureProcurementSeeded();
    let rows = (await db.select().from(procurementWorkOrdersTable).orderBy(desc(procurementWorkOrdersTable.createdAt))) as unknown as SubcontractWorkOrder[];

    if (filters.category && filters.category !== 'ALL') {
      rows = rows.filter((w) => w.category === filters.category);
    }
    if (filters.status && filters.status !== 'ALL') {
      rows = rows.filter((w) => w.status === filters.status);
    }
    if (filters.projectId) {
      rows = rows.filter((w) => w.projectId === filters.projectId);
    }

    return rows;
  }

  async createWorkOrder(data: Partial<SubcontractWorkOrder>): Promise<SubcontractWorkOrder> {
    await ensureProcurementSeeded();
    const allWOs = await db.select().from(procurementWorkOrdersTable);
    const newId = `wo_${Date.now()}`;
    const newWoNumber = `WO-2026-${String(allWOs.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];

    const newWo: SubcontractWorkOrder = {
      id: newId,
      woNumber: newWoNumber,
      title: data.title || 'Subcontract Works',
      category: data.category || ('Civil Work Order' as any),
      projectId: data.projectId || 'prj_01',
      projectName: data.projectName || 'General Site',
      contractorName: data.contractorName || 'Prime Subcontractor Ltd',
      contractorCode: data.contractorCode || 'CNT-01',
      startDate: data.startDate || now,
      targetCompletionDate: data.targetCompletionDate || now,
      contractValueUSD: data.contractValueUSD || 10000,
      revisedValueUSD: data.contractValueUSD || 10000,
      executedValueUSD: 0,
      status: 'Under Execution',
      scopeOfWork: data.scopeOfWork || 'General civil subcontracting work.',
      attachments: data.attachments || [],
      variations: [],
    };

    await db.insert(procurementWorkOrdersTable).values({
      id: newWo.id,
      woNumber: newWo.woNumber,
      title: newWo.title,
      category: newWo.category,
      projectId: newWo.projectId,
      projectName: newWo.projectName,
      contractorName: newWo.contractorName,
      contractorCode: newWo.contractorCode,
      startDate: newWo.startDate,
      targetCompletionDate: newWo.targetCompletionDate,
      contractValueUSD: newWo.contractValueUSD,
      revisedValueUSD: newWo.revisedValueUSD,
      executedValueUSD: newWo.executedValueUSD,
      status: newWo.status,
      scopeOfWork: newWo.scopeOfWork,
      attachments: newWo.attachments,
      variations: newWo.variations,
      createdAt: now,
    } as any);

    return newWo;
  }

  /**
   * TRANSACTION WORKFLOW #5: Variation Order -> Project Cost Update
   * Executes inside an atomic database transaction.
   */
  async addVariationOrder(id: string, variationData: Partial<WOVariationOrder>): Promise<SubcontractWorkOrder | null> {
    await ensureProcurementSeeded();

    return await db.transaction(async (tx) => {
      const rows = await tx.select().from(procurementWorkOrdersTable).where(eq(procurementWorkOrdersTable.id, id)).limit(1);
      if (rows.length === 0) return null;

      const wo = rows[0] as unknown as SubcontractWorkOrder;
      const variations = (wo.variations || []) as WOVariationOrder[];
      const now = new Date().toISOString().split('T')[0];

      const newVar: WOVariationOrder = {
        id: `var_${Date.now()}`,
        variationCode: `VO-${String(variations.length + 1).padStart(2, '0')}`,
        title: variationData.title || 'Scope Variation',
        description: variationData.description || 'Additional site works requested by client.',
        amountChangeUSD: variationData.amountChangeUSD || 0,
        status: 'Approved',
        approvedDate: now,
      };

      const updatedVariations = [...variations, newVar];
      const newRevisedValue = wo.revisedValueUSD + newVar.amountChangeUSD;

      // 1. Update Work Order in transaction
      await tx
        .update(procurementWorkOrdersTable)
        .set({
          variations: updatedVariations,
          revisedValueUSD: newRevisedValue,
        } as any)
        .where(eq(procurementWorkOrdersTable.id, id));

      // 2. Update Project Cost Control in transaction atomically
      const costRows = await tx
        .select()
        .from(procurementCostControlsTable)
        .where(eq(procurementCostControlsTable.projectId, wo.projectId))
        .limit(1);

      if (costRows.length > 0) {
        const c = costRows[0];
        const newTotalSpent = (c.totalSpentUSD || 0) + newVar.amountChangeUSD;
        const newRemaining = (c.totalBudgetUSD || 0) - (newTotalSpent + (c.committedPOUSD || 0));
        await tx
          .update(procurementCostControlsTable)
          .set({
            totalSpentUSD: newTotalSpent,
            remainingBudgetUSD: newRemaining,
            costVarianceUSD: newRemaining,
          } as any)
          .where(eq(procurementCostControlsTable.id, c.id));
      }

      return {
        ...wo,
        variations: updatedVariations,
        revisedValueUSD: newRevisedValue,
      };
    });
  }

  // --- BOQ ITEMS ---
  async getBoqItems(filters: { projectId?: string; category?: string }): Promise<BOQItem[]> {
    await ensureProcurementSeeded();
    let rows = (await db.select().from(procurementBoqItemsTable).orderBy(desc(procurementBoqItemsTable.createdAt))) as unknown as BOQItem[];

    if (filters.projectId) {
      rows = rows.filter((b) => b.projectId === filters.projectId);
    }
    if (filters.category && filters.category !== 'ALL') {
      rows = rows.filter((b) => b.category === filters.category);
    }

    return rows;
  }

  async createBoqItem(data: Partial<BOQItem>): Promise<BOQItem> {
    await ensureProcurementSeeded();
    const newId = `boq_${Date.now()}`;
    const qty = Number(data.quantity || 0);
    const rate = Number(data.rateUSD || 0);
    const now = new Date().toISOString().split('T')[0];

    const newBoq: BOQItem = {
      id: newId,
      itemCode: data.itemCode || `BOQ-ITEM-${Date.now().toString().slice(-4)}`,
      projectId: data.projectId || 'prj_01',
      projectName: data.projectName || 'General Project',
      category: data.category || ('Civil & Foundation' as any),
      description: data.description || 'Description of works',
      unit: data.unit || 'SQM',
      quantity: qty,
      rateUSD: rate,
      sanctionedAmountUSD: qty * rate,
      executedQuantity: 0,
      balanceQuantity: qty,
      variationQuantity: 0,
      runningQuantity: 0,
      executedAmountUSD: 0,
      progressPercent: 0,
    };

    await db.insert(procurementBoqItemsTable).values({
      id: newBoq.id,
      itemCode: newBoq.itemCode,
      projectId: newBoq.projectId,
      projectName: newBoq.projectName,
      category: newBoq.category,
      description: newBoq.description,
      unit: newBoq.unit,
      quantity: newBoq.quantity,
      rateUSD: newBoq.rateUSD,
      sanctionedAmountUSD: newBoq.sanctionedAmountUSD,
      executedQuantity: newBoq.executedQuantity,
      balanceQuantity: newBoq.balanceQuantity,
      variationQuantity: newBoq.variationQuantity,
      runningQuantity: newBoq.runningQuantity,
      executedAmountUSD: newBoq.executedAmountUSD,
      progressPercent: newBoq.progressPercent,
      createdAt: now,
    } as any);

    return newBoq;
  }

  // --- MEASUREMENT BOOKS (TRANSACTION WORKFLOW #4) ---
  async getMeasurementEntries(filters: { projectId?: string; boqItemId?: string }): Promise<MeasurementEntry[]> {
    await ensureProcurementSeeded();
    let rows = (await db.select().from(procurementMeasurementEntriesTable).orderBy(desc(procurementMeasurementEntriesTable.createdAt))) as unknown as MeasurementEntry[];

    if (filters.projectId) {
      rows = rows.filter((m) => m.projectId === filters.projectId);
    }
    if (filters.boqItemId) {
      rows = rows.filter((m) => m.boqItemId === filters.boqItemId);
    }

    return rows;
  }

  /**
   * PHASE 6A: APPROVED MEASUREMENT BOOK -> RA BILL (Billable Measurements Retrieval)
   * Fetches approved MB records, calculates previously billed quantity across historical RA Bills,
   * and returns only entries with remainingBillableQty > 0.
   */
  async getBillableMeasurementEntries(filters: {
    projectId?: string;
    workOrderId?: string;
    boqItemId?: string;
  }): Promise<BillableMeasurementEntry[]> {
    await ensureProcurementSeeded();

    let mbRows = (await db
      .select()
      .from(procurementMeasurementEntriesTable)
      .orderBy(desc(procurementMeasurementEntriesTable.createdAt))) as unknown as MeasurementEntry[];

    if (filters.projectId) {
      mbRows = mbRows.filter((m) => m.projectId === filters.projectId);
    }
    if (filters.boqItemId) {
      mbRows = mbRows.filter((m) => m.boqItemId === filters.boqItemId);
    }

    const approvedStatuses = [
      'Approved',
      'Approved by Project Manager',
      'Verified',
      'Verified by Site Incharge',
      'Certified',
      'APPROVED',
    ];

    // Filter only eligible approved measurements
    const eligibleMbs = mbRows.filter(
      (m) =>
        approvedStatuses.includes(m.status) &&
        m.status !== 'Draft' &&
        m.status !== 'Rejected'
    );

    // Query all active RA bills to calculate historical billed quantities
    const allBills = (await db
      .select()
      .from(procurementRaBillsTable)) as unknown as RABillRecord[];

    const activeBills = allBills.filter(
      (b) => b.status !== 'Rejected' && (b as any).status !== 'Cancelled'
    );

    const billableEntries: BillableMeasurementEntry[] = [];

    for (const mb of eligibleMbs) {
      const approvedQty = Number(mb.quantity || mb.calculatedQuantity || 0);
      if (approvedQty <= 0) continue;

      let previouslyBilled = 0;
      for (const bill of activeBills) {
        if (!Array.isArray(bill.items)) continue;
        for (const it of bill.items) {
          const isMatch =
            it.measurementEntryId === mb.id ||
            it.measurementEntryIds?.includes(mb.id) ||
            (it.mbReference && it.mbReference.trim() === mb.mbNumber?.trim());

          if (isMatch) {
            previouslyBilled += Number(it.currentMeasuredQty || 0);
          }
        }
      }

      previouslyBilled = Math.round(previouslyBilled * 1000) / 1000;
      const remainingQty = Math.max(0, Math.round((approvedQty - previouslyBilled) * 1000) / 1000);

      if (remainingQty > 0) {
        const rate =
          mb.valuationUSD && approvedQty > 0
            ? Math.round((mb.valuationUSD / approvedQty) * 100) / 100
            : 100;

        billableEntries.push({
          id: mb.id,
          mbNumber: mb.mbNumber,
          entryDate: mb.entryDate,
          measurementDate: mb.measurementDate || mb.entryDate,
          projectId: mb.projectId,
          projectName: mb.projectName,
          boqItemId: mb.boqItemId,
          boqItemCode: mb.boqItemCode,
          boqDescription: mb.boqDescription,
          contractorName: mb.contractorName,
          locationChainage: mb.locationChainage || mb.chainageLocation,
          approvedQuantity: approvedQty,
          unit: mb.unit || 'CUM',
          rateUSD: rate,
          previouslyBilledQty: previouslyBilled,
          remainingBillableQty: remainingQty,
          status: mb.status,
        });
      }
    }

    return billableEntries;
  }

  /**
   * TRANSACTION WORKFLOW #4: Measurement Book -> BOQ Update
   * Executes inside an atomic database transaction.
   */
  async createMeasurementEntry(data: Partial<MeasurementEntry>): Promise<MeasurementEntry> {
    await ensureProcurementSeeded();
    const allMBs = await db.select().from(procurementMeasurementEntriesTable);
    const newId = `mb_${Date.now()}`;
    const newMbNo = `MB-2026-${String(allMBs.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];

    const calcQty = data.calculatedQuantity || data.quantity || 10;

    const newMb: MeasurementEntry = {
      id: newId,
      mbNumber: newMbNo,
      entryDate: now,
      measurementDate: now,
      projectId: data.projectId || 'prj_01',
      projectName: data.projectName || 'General Site',
      boqItemId: data.boqItemId || 'boq_01',
      boqItemCode: data.boqItemCode || 'BOQ-CV-01',
      boqDescription: data.boqDescription || 'Site Measurement Works',
      contractorName: data.contractorName || 'Main Contractor',
      chainageLocation: data.chainageLocation || 'Ch 0+000 to Ch 0+100',
      locationChainage: data.locationChainage || 'Ch 0+000 to Ch 0+100',
      lengthMeters: data.lengthMeters || 10,
      breadthMeters: data.breadthMeters || 1,
      depthMeters: data.depthMeters || 1,
      heightMeters: data.heightMeters || 1,
      calculatedQuantity: calcQty,
      quantity: calcQty,
      unit: data.unit || 'CUM',
      valuationUSD: data.valuationUSD || calcQty * 100,
      status: 'Approved by Project Manager',
      recordedByName: data.recordedByName || 'Junior Site Engineer',
      verifiedByName: data.verifiedByName || 'Site Manager',
      approvedByName: data.approvedByName || 'Project Manager',
      remarks: data.remarks || 'Site measurement verified and recorded.',
    };

    return await db.transaction(async (tx) => {
      // 1. Insert Measurement Book record
      await tx.insert(procurementMeasurementEntriesTable).values({
        id: newMb.id,
        mbNumber: newMb.mbNumber,
        entryDate: newMb.entryDate,
        measurementDate: newMb.measurementDate,
        projectId: newMb.projectId,
        projectName: newMb.projectName,
        boqItemId: newMb.boqItemId,
        boqItemCode: newMb.boqItemCode,
        boqDescription: newMb.boqDescription,
        contractorName: newMb.contractorName,
        chainageLocation: newMb.chainageLocation,
        locationChainage: newMb.locationChainage,
        lengthMeters: newMb.lengthMeters,
        breadthMeters: newMb.breadthMeters,
        depthMeters: newMb.depthMeters,
        heightMeters: newMb.heightMeters,
        calculatedQuantity: newMb.calculatedQuantity,
        quantity: newMb.quantity,
        unit: newMb.unit,
        valuationUSD: newMb.valuationUSD,
        status: newMb.status,
        recordedByName: newMb.recordedByName,
        verifiedByName: newMb.verifiedByName,
        approvedByName: newMb.approvedByName,
        remarks: newMb.remarks,
        createdAt: now,
      } as any);

      // 2. Synchronize & update linked BOQ item executed quantity atomically
      const boqRows = await tx
        .select()
        .from(procurementBoqItemsTable)
        .where(eq(procurementBoqItemsTable.id, newMb.boqItemId))
        .limit(1);

      if (boqRows.length > 0) {
        const b = boqRows[0] as unknown as BOQItem;
        const newExecutedQty = b.executedQuantity + calcQty;
        const newRunningQty = newExecutedQty;
        const newBalanceQty = Math.max(0, b.quantity - newExecutedQty);
        const newVariationQty = newExecutedQty > b.quantity ? newExecutedQty - b.quantity : 0;
        const newExecutedAmountUSD = newExecutedQty * b.rateUSD;
        const newProgressPercent = Math.min(100, Number(((newExecutedQty / b.quantity) * 100).toFixed(1)));

        await tx
          .update(procurementBoqItemsTable)
          .set({
            executedQuantity: newExecutedQty,
            runningQuantity: newRunningQty,
            balanceQuantity: newBalanceQty,
            variationQuantity: newVariationQty,
            executedAmountUSD: newExecutedAmountUSD,
            progressPercent: newProgressPercent,
          } as any)
          .where(eq(procurementBoqItemsTable.id, b.id));
      }

      return newMb;
    });
  }

  async updateMeasurementStatus(id: string, updates: { status: string; verifiedByName?: string; approvedByName?: string }) {
    await ensureProcurementSeeded();
    const rows = await db.select().from(procurementMeasurementEntriesTable).where(eq(procurementMeasurementEntriesTable.id, id)).limit(1);
    if (rows.length === 0) return null;

    const existing = rows[0] as unknown as MeasurementEntry;
    const vName = updates.verifiedByName || existing.verifiedByName;
    const aName = updates.approvedByName || existing.approvedByName;

    await db
      .update(procurementMeasurementEntriesTable)
      .set({
        status: updates.status,
        verifiedByName: vName || null,
        approvedByName: aName || null,
      } as any)
      .where(eq(procurementMeasurementEntriesTable.id, id));

    return {
      ...existing,
      status: updates.status as any,
      verifiedByName: vName,
      approvedByName: aName,
    };
  }

  // --- TENDERS ---
  async getTenders(filters: { tenderStatus?: string; search?: string }): Promise<TenderRecord[]> {
    await ensureProcurementSeeded();
    let rows = (await db.select().from(procurementTendersTable).orderBy(desc(procurementTendersTable.createdAt))) as unknown as TenderRecord[];

    if (filters.tenderStatus && filters.tenderStatus !== 'ALL') {
      rows = rows.filter((t) => (t.tenderStatus || t.status) === filters.tenderStatus);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      rows = rows.filter(
        (t) =>
          (t.tenderNo && t.tenderNo.toLowerCase().includes(q)) ||
          t.title.toLowerCase().includes(q) ||
          (t.clientAuthority && t.clientAuthority.toLowerCase().includes(q))
      );
    }

    return rows;
  }

  async createTender(data: Partial<TenderRecord>): Promise<TenderRecord> {
    await ensureProcurementSeeded();
    const all = await db.select().from(procurementTendersTable);
    const newId = `tnd_${Date.now()}`;
    const newTenderNo = data.tenderNo || data.tenderNumber || `TND-2026-${String(all.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];

    const newTender: TenderRecord = {
      id: newId,
      tenderNo: newTenderNo,
      tenderNumber: newTenderNo,
      title: data.title || 'New Infrastructure Tender',
      clientAuthority: data.clientAuthority || 'Public Works Dept',
      authorityName: data.clientAuthority || 'Public Works Dept',
      category: data.category || 'Civil & Infra',
      estimatedValueUSD: data.estimatedValueUSD || 500000,
      emdAmountUSD: data.emdAmountUSD || 10000,
      emdInstrument: data.emdInstrument || 'Bank Guarantee',
      publishDate: now,
      submissionDueDate: data.submissionDueDate || now,
      eligibilityCriteria: data.eligibilityCriteria || 'Class 1 Contractor License',
      tenderStatus: 'Bidding Open',
      status: 'Bidding Open',
      isAwarded: false,
      technicalBidSubmitted: true,
      financialBidSubmitted: false,
      quotedAmountUSD: data.quotedAmountUSD || 480000,
    };

    await db.insert(procurementTendersTable).values({
      id: newTender.id,
      tenderNo: newTender.tenderNo,
      tenderNumber: newTender.tenderNumber,
      title: newTender.title,
      clientAuthority: newTender.clientAuthority,
      authorityName: newTender.authorityName,
      category: newTender.category,
      estimatedValueUSD: newTender.estimatedValueUSD,
      emdAmountUSD: newTender.emdAmountUSD,
      emdInstrument: newTender.emdInstrument,
      publishDate: newTender.publishDate,
      submissionDueDate: newTender.submissionDueDate,
      eligibilityCriteria: newTender.eligibilityCriteria,
      tenderStatus: newTender.tenderStatus,
      status: newTender.status,
      isAwarded: newTender.isAwarded,
      technicalBidSubmitted: newTender.technicalBidSubmitted,
      financialBidSubmitted: newTender.financialBidSubmitted,
      quotedAmountUSD: newTender.quotedAmountUSD,
      createdAt: now,
    } as any);

    return newTender;
  }

  // --- PROJECT COST CONTROL & DASHBOARD REPORTS ---
  async getCostControls(): Promise<ProjectCostControl[]> {
    await ensureProcurementSeeded();
    const rows = await db.select().from(procurementCostControlsTable);
    return rows as unknown as ProjectCostControl[];
  }

  async getDashboardReports() {
    await ensureProcurementSeeded();
    const vendors = (await db.select().from(procurementVendorsTable)) as unknown as Vendor[];
    const rfqs = (await db.select().from(procurementRfqsTable)) as unknown as RFQ[];
    const requisitions = (await db.select().from(procurementRequisitionsTable)) as unknown as PurchaseRequisition[];
    const purchaseOrders = (await db.select().from(procurementPurchaseOrdersTable)) as unknown as PurchaseOrder[];

    const totalVendors = vendors.length;
    const approvedVendors = vendors.filter((v) => v.status === 'Approved').length;
    const activeRFQs = rfqs.filter((r) => r.status === 'Under Evaluation' || r.status === 'Published').length;
    const pendingPRs = requisitions.filter((pr) => pr.status === 'Submitted').length;
    const openPOs = purchaseOrders.filter((po) => po.status === 'Issued' || po.status === 'Partially Received').length;
    const totalPOValueUSD = purchaseOrders.reduce((sum, po) => sum + (po.netAmountUSD || 0), 0);

    return {
      kpis: {
        totalVendors,
        approvedVendors,
        activeRFQs,
        pendingPRs,
        openPOs,
        totalPOValueUSD,
      },
      recentPOs: purchaseOrders.slice(0, 5),
      recentRequisitions: requisitions.slice(0, 5),
      topVendors: vendors.slice(0, 5),
    };
  }

  // --- WORKFLOW CONFIGURATIONS ---
  async getWorkflowConfigs(): Promise<ProcurementWorkflowConfig[]> {

    return memoryWorkflows;
  }

  async getWorkflowConfigByProjectId(projectId: string): Promise<ProcurementWorkflowConfig> {
    const found = memoryWorkflows.find(w => w.projectId === projectId && w.isActive);
    if (found) return found;
    return {
      id: `wf_default_${projectId}`,
      projectId,
      projectName: 'Project Custom Workflow',
      workflowName: 'Standard 4-Tier Approval Hierarchy',
      steps: [
        { stepOrder: 1, role: 'INCHARGE', label: 'Site Incharge Approval', isRequired: true },
        { stepOrder: 2, role: 'QA', label: 'QA / Quality Inspection', isRequired: true },
        { stepOrder: 3, role: 'MANAGER', label: 'Project Manager Approval', isRequired: true },
        { stepOrder: 4, role: 'STORE', label: 'Store Keeper Receipt', isRequired: true }
      ],
      isActive: true,
      updatedAt: new Date().toISOString()
    };
  }

  async saveWorkflowConfig(config: Partial<ProcurementWorkflowConfig>): Promise<ProcurementWorkflowConfig> {
    const now = new Date().toISOString();
    const existingIdx = memoryWorkflows.findIndex(w => w.id === config.id || w.projectId === config.projectId);
    const saved: ProcurementWorkflowConfig = {
      id: config.id || `wf_${Date.now()}`,
      projectId: config.projectId || 'prj_01',
      projectName: config.projectName || 'Infrastructure Project',
      workflowName: config.workflowName || 'Custom Project Workflow',
      steps: config.steps || [
        { stepOrder: 1, role: 'INCHARGE', label: 'Site Incharge Approval', isRequired: true },
        { stepOrder: 2, role: 'MANAGER', label: 'Project Manager Approval', isRequired: true },
        { stepOrder: 3, role: 'STORE', label: 'Store Receipt', isRequired: true }
      ],
      isActive: config.isActive !== undefined ? config.isActive : true,
      updatedAt: now
    };

    if (existingIdx >= 0) {
      memoryWorkflows[existingIdx] = saved;
    } else {
      memoryWorkflows.push(saved);
    }

    await this.createAuditLog({
      entityType: 'WORKFLOW_CONFIG',
      entityId: saved.id,
      action: 'WORKFLOW_CONFIG_SAVED',
      actorId: 'usr_admin',
      actorName: 'System Admin',
      actorRole: 'ADMIN',
      remarks: `Updated workflow configuration for project ${saved.projectName}`
    });

    return saved;
  }

  // --- NOTIFICATIONS & AUDIT LOGS ---
  async getNotifications(userId?: string): Promise<InAppNotification[]> {
    if (!userId) return memoryNotifications;
    return memoryNotifications.filter(n => n.recipientUserId === userId || !n.recipientUserId);
  }

  async createNotification(notif: Partial<InAppNotification>): Promise<InAppNotification> {
    const newNotif: InAppNotification = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      recipientUserId: notif.recipientUserId || 'usr_all',
      recipientRole: notif.recipientRole,
      title: notif.title || 'System Notification',
      message: notif.message || '',
      type: notif.type || 'NEW_REQUEST',
      referenceId: notif.referenceId || '',
      referenceNo: notif.referenceNo || '',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    memoryNotifications.unshift(newNotif);
    return newNotif;
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const target = memoryNotifications.find(n => n.id === id);
    if (target) {
      target.isRead = true;
      return true;
    }
    return false;
  }

  async getAuditLogs(entityId?: string): Promise<ProcurementAuditLog[]> {
    if (!entityId) return memoryAuditLogs;
    return memoryAuditLogs.filter(a => a.entityId === entityId);
  }

  async createAuditLog(log: Partial<ProcurementAuditLog>): Promise<ProcurementAuditLog> {
    const newLog: ProcurementAuditLog = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      entityType: log.entityType || 'MATERIAL_REQUEST',
      entityId: log.entityId || 'mr_gen',
      action: log.action || 'ACTION_RECORDED',
      actorId: log.actorId || 'usr_system',
      actorName: log.actorName || 'System',
      actorRole: log.actorRole || 'SYSTEM',
      remarks: log.remarks || '',
      metadataJson: log.metadataJson,
      timestamp: new Date().toISOString()
    };
    memoryAuditLogs.unshift(newLog);
    return newLog;
  }

  // --- STOCK TRANSACTIONS & MATERIAL LEDGER ---
  async getStockTransactions(projectId?: string): Promise<MaterialStockTransaction[]> {
    if (!projectId) return memoryStockTransactions;
    return memoryStockTransactions.filter(s => s.projectId === projectId);
  }

  async getMaterialLedger(projectId?: string): Promise<MaterialLedgerEntry[]> {
    if (!projectId) return memoryMaterialLedger;
    return memoryMaterialLedger.filter(l => l.projectId === projectId);
  }

  // --- MATERIAL REQUESTS & APPROVAL ENGINE ---
  async getMaterialRequests(filters?: { status?: string; priority?: string; projectId?: string; requestedByUserId?: string; search?: string }): Promise<MaterialRequest[]> {
    await ensureProcurementSeeded();
    const rows = await db.select().from(procurementMaterialRequestsTable);
    let list = rows as unknown as MaterialRequest[];

    if (filters) {
      if (filters.status && filters.status !== 'ALL') {
        list = list.filter(m => m.status === filters.status);
      }
      if (filters.priority && filters.priority !== 'ALL') {
        list = list.filter(m => m.priority === filters.priority);
      }
      if (filters.projectId) {
        list = list.filter(m => m.projectId === filters.projectId);
      }
      if (filters.requestedByUserId) {
        list = list.filter(m => m.requestedByUserId === filters.requestedByUserId);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(m => 
          m.requestNo.toLowerCase().includes(q) ||
          m.projectName.toLowerCase().includes(q) ||
          m.requestedByUserName.toLowerCase().includes(q) ||
          (m.items && m.items.some(i => i.itemDescription.toLowerCase().includes(q)))
        );
      }
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getMaterialRequestById(id: string): Promise<MaterialRequest | null> {
    await ensureProcurementSeeded();
    const rows = await db.select().from(procurementMaterialRequestsTable).where(eq(procurementMaterialRequestsTable.id, id));
    if (rows.length === 0) return null;
    return rows[0] as unknown as MaterialRequest;
  }

  async addMaterialRequestAttachment(id: string, attachment: Partial<MaterialRequestAttachment>, user: any): Promise<MaterialRequest | null> {
    const existing = await this.getMaterialRequestById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const newAttach: MaterialRequestAttachment = {
      id: `att_${Date.now()}`,
      name: attachment.name || 'Specification Document.pdf',
      fileType: attachment.fileType || 'PDF',
      fileUrl: attachment.fileUrl || 'https://example.com/docs/attachment.pdf',
      sizeBytes: attachment.sizeBytes || 1024 * 512,
      uploadedByUserId: user?.id || 'usr_current',
      uploadedByUserName: user?.name || 'Authorized User',
      uploadedAt: now
    };

    const updatedAttachments = [...(existing.attachments || []), newAttach];

    await db.update(procurementMaterialRequestsTable)
      .set({
        attachments: updatedAttachments as any,
        updatedAt: now
      })
      .where(eq(procurementMaterialRequestsTable.id, id));

    await this.createAuditLog({
      entityType: 'MATERIAL_REQUEST',
      entityId: id,
      action: 'ATTACHMENT_ADDED',
      actorId: user?.id || 'usr_current',
      actorName: user?.name || 'User',
      actorRole: user?.role || 'USER',
      remarks: `Added document attachment: ${newAttach.name}`
    });

    return this.getMaterialRequestById(id);
  }

  async createMaterialRequest(data: Partial<MaterialRequest>, user?: any): Promise<MaterialRequest> {
    await ensureProcurementSeeded();
    const now = new Date().toISOString();
    const requestNo = data.requestNo || (await numberingService.generateMaterialRequestNumber({
      companyId: 'cmp-101',
      projectId: data.projectId || 'prj_01',
      date: data.requiredDate || now,
    }));

    // Look up project workflow configuration dynamically
    const projectId = data.projectId || 'prj_01';
    const wfConfig = await this.getWorkflowConfigByProjectId(projectId);
    const workflowSteps = wfConfig.steps;

    const userRole = (user?.role || 'SUPERVISOR').toUpperCase();
    let initialStepIndex = 0;
    
    // Find matching step based on requester role/hierarchy
    if (userRole === 'INCHARGE') {
      initialStepIndex = Math.min(1, workflowSteps.length - 1);
    } else if (userRole === 'MANAGER' || userRole === 'ADMIN') {
      initialStepIndex = workflowSteps.length - 1;
    }

    const firstStep = workflowSteps[initialStepIndex] || workflowSteps[0];
    let initialStatus: any = `Pending ${firstStep.role === 'INCHARGE' ? 'Incharge' : firstStep.role === 'QA' ? 'QA' : 'Manager'}`;
    let initialApproverRole = firstStep.role;
    let initialApproverName = firstStep.label;

    if (userRole === 'MANAGER' || userRole === 'ADMIN') {
      initialStatus = 'Approved';
      initialApproverRole = 'STORE';
      initialApproverName = 'Store Incharge';
    }

    const itemsFormatted = (data.items || []).map((item, idx) => ({
      ...item,
      id: item.id || `mri_${Date.now()}_${idx}`,
      slNo: idx + 1,
      receivedQuantity: item.receivedQuantity || 0
    }));

    const initialHistory = [{
      id: `aph_${Date.now()}`,
      step: 'Initiation',
      actorId: user?.id || 'usr_current',
      actorName: user?.name || data.requestedByUserName || 'Requester',
      actorRole: userRole,
      action: 'Submitted',
      remarks: data.remarks || 'Material request submitted for dynamic workflow approval.',
      timestamp: now
    }];

    const newRequest: MaterialRequest = {
      id: `mr_${Date.now()}`,
      requestNo,
      requestDate: data.requestDate || now.split('T')[0],
      requestedByUserId: user?.id || data.requestedByUserId || 'usr_current',
      requestedByUserName: user?.name || data.requestedByUserName || 'Site Engineer',
      reportsToUserId: user?.reportsToUserId || 'usr_mgr_01',
      reportsToUserName: user?.reportsToUserName || 'Anand Varma (Project Incharge)',
      employeeId: data.employeeId || 'EMP-1004',
      designation: data.designation || 'Site Supervisor',
      department: data.department || 'Site Engineering',
      company: data.company || 'SiteSync Infrastructure Pvt Ltd',
      branch: data.branch || 'Zone 1 Branch',
      projectId,
      projectName: data.projectName || wfConfig.projectName || 'Infrastructure Project',
      siteName: data.siteName || 'Site Location A',
      unloadingPoint: data.unloadingPoint || 'Yard 1',
      contactNumber: data.contactNumber || '+91 98765 43210',
      requiredDate: data.requiredDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: data.priority || 'Normal',
      remarks: data.remarks || '',
      status: initialStatus,
      currentApproverRole: initialApproverRole,
      currentApproverName: initialApproverName,
      currentStepIndex: initialStepIndex,
      workflowSteps,
      items: itemsFormatted as any,
      approvalHistory: initialHistory as any,
      receipts: [],
      attachments: data.attachments || [],
      createdAt: now,
      updatedAt: now
    };

    await db.insert(procurementMaterialRequestsTable).values({
      id: newRequest.id,
      requestNo: newRequest.requestNo,
      requestDate: newRequest.requestDate,
      requestedByUserId: newRequest.requestedByUserId,
      requestedByUserName: newRequest.requestedByUserName,
      employeeId: newRequest.employeeId,
      designation: newRequest.designation,
      department: newRequest.department,
      company: newRequest.company,
      branch: newRequest.branch,
      projectId: newRequest.projectId,
      projectName: newRequest.projectName,
      siteName: newRequest.siteName,
      unloadingPoint: newRequest.unloadingPoint,
      contactNumber: newRequest.contactNumber,
      requiredDate: newRequest.requiredDate,
      priority: newRequest.priority,
      remarks: newRequest.remarks,
      status: newRequest.status,
      currentApproverRole: newRequest.currentApproverRole,
      currentApproverId: newRequest.currentApproverId,
      currentApproverName: newRequest.currentApproverName,
      items: newRequest.items as any,
      approvalHistory: newRequest.approvalHistory as any,
      receipts: newRequest.receipts as any,
      attachments: newRequest.attachments as any,
      createdAt: now,
      updatedAt: now,
    } as any);

    // Create Notification
    await this.createNotification({
      recipientRole: initialApproverRole,
      title: `New Request ${requestNo} Awaiting Approval`,
      message: `Material Request ${requestNo} for ${newRequest.projectName} submitted by ${newRequest.requestedByUserName} requires your action.`,
      type: 'APPROVAL_PENDING',
      referenceId: newRequest.id,
      referenceNo: requestNo
    });

    // Create Audit Log
    await this.createAuditLog({
      entityType: 'MATERIAL_REQUEST',
      entityId: newRequest.id,
      action: 'REQUEST_CREATED',
      actorId: user?.id || 'usr_current',
      actorName: user?.name || newRequest.requestedByUserName,
      actorRole: userRole,
      remarks: `Submitted ${requestNo} with ${newRequest.items.length} material items.`
    });

    // Create Material Ledger Entries
    for (const item of newRequest.items) {
      memoryMaterialLedger.unshift({
        id: `mle_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        materialRequestId: newRequest.id,
        requestNo,
        projectId,
        itemDescription: item.itemDescription,
        stage: 'REQUESTED',
        requestedQty: item.quantity,
        approvedQty: 0,
        receivedQty: 0,
        balanceQty: item.quantity,
        unit: item.unit,
        updatedAt: now
      });
    }

    return newRequest;
  }

  async processMaterialRequestAction(
    id: string,
    action: 'APPROVE' | 'REJECT' | 'SEND_BACK' | 'CLARIFICATION_REQUESTED' | 'CANCEL',
    user: any,
    remarks: string
  ): Promise<MaterialRequest | null> {
    await ensureProcurementSeeded();
    const existing = await this.getMaterialRequestById(id);
    if (!existing) return null;

    // Requirement 3: Approval Remarks MUST be mandatory
    if (!remarks || !remarks.trim()) {
      throw new Error('Mandatory approval remarks are required to perform this action.');
    }

    const now = new Date().toISOString();
    let newStatus = existing.status;
    let nextApproverRole = existing.currentApproverRole;
    let nextApproverName = existing.currentApproverName;
    let mappedAction: any = 'Approved';

    // Dynamic workflow steps calculation
    const steps = existing.workflowSteps || (await this.getWorkflowConfigByProjectId(existing.projectId)).steps;
    const currentStepIdx = existing.currentStepIndex !== undefined ? existing.currentStepIndex : 0;
    let newStepIdx = currentStepIdx;

    if (action === 'APPROVE') {
      mappedAction = 'Approved';
      newStepIdx = currentStepIdx + 1;

      if (newStepIdx < steps.length) {
        const nextStep = steps[newStepIdx];
        if (nextStep.role === 'STORE') {
          newStatus = 'Approved';
          nextApproverRole = 'STORE';
          nextApproverName = 'Store Keeper / Yard Incharge';
        } else {
          newStatus = `Pending ${nextStep.role === 'INCHARGE' ? 'Incharge' : nextStep.role === 'QA' ? 'QA' : 'Manager'}` as any;
          nextApproverRole = nextStep.role;
          nextApproverName = nextStep.label;
        }
      } else {
        newStatus = 'Approved';
        nextApproverRole = 'STORE';
        nextApproverName = 'Store Keeper / Yard Incharge';
      }
    } else if (action === 'REJECT') {
      mappedAction = 'Rejected';
      newStatus = 'Rejected';
      nextApproverRole = 'NONE';
      nextApproverName = '';
    } else if (action === 'SEND_BACK') {
      mappedAction = 'Sent Back';
      newStatus = 'Draft';
      nextApproverRole = 'SUPERVISOR';
      nextApproverName = existing.requestedByUserName;
    } else if (action === 'CLARIFICATION_REQUESTED') {
      mappedAction = 'Clarification Requested';
      newStatus = 'Clarification Requested';
      nextApproverRole = 'SUPERVISOR';
      nextApproverName = existing.requestedByUserName;
    } else if (action === 'CANCEL') {
      mappedAction = 'Cancelled';
      newStatus = 'Cancelled';
      nextApproverRole = 'NONE';
      nextApproverName = '';
    }

    const historyEntry = {
      id: `aph_${Date.now()}`,
      step: existing.status,
      actorId: user?.id || 'usr_approver',
      actorName: user?.name || 'Authorized Approver',
      actorRole: user?.role || 'APPROVER',
      action: mappedAction,
      remarks: remarks.trim(),
      timestamp: now
    };

    const updatedHistory = [...(existing.approvalHistory || []), historyEntry];

    await db.update(procurementMaterialRequestsTable)
      .set({
        status: newStatus,
        currentApproverRole: nextApproverRole,
        currentApproverName: nextApproverName,
        currentStepIndex: newStepIdx,
        approvalHistory: updatedHistory as any,
        updatedAt: now
      } as any)
      .where(eq(procurementMaterialRequestsTable.id, id));

    // Create Notification
    await this.createNotification({
      recipientUserId: existing.requestedByUserId,
      title: `Request ${existing.requestNo} ${mappedAction}`,
      message: `Material Request ${existing.requestNo} was ${mappedAction.toLowerCase()} by ${user?.name || 'Approver'}. Remarks: "${remarks.trim()}"`,
      type: action === 'APPROVE' ? (newStatus === 'Approved' ? 'APPROVED' : 'APPROVAL_PENDING') : action === 'REJECT' ? 'REJECTED' : 'CLARIFICATION',
      referenceId: existing.id,
      referenceNo: existing.requestNo
    });

    // Create Audit Log
    await this.createAuditLog({
      entityType: 'MATERIAL_REQUEST',
      entityId: existing.id,
      action: `ACTION_${mappedAction.toUpperCase().replace(/\s+/g, '_')}`,
      actorId: user?.id || 'usr_approver',
      actorName: user?.name || 'Approver',
      actorRole: user?.role || 'APPROVER',
      remarks: `Processed action ${mappedAction} on ${existing.requestNo}. Remarks: ${remarks.trim()}`
    });

    // Update Material Ledger Entries
    if (action === 'APPROVE' && newStatus === 'Approved') {
      for (const item of existing.items) {
        const ledgerItem = memoryMaterialLedger.find(l => l.materialRequestId === existing.id && l.itemDescription === item.itemDescription);
        if (ledgerItem) {
          ledgerItem.stage = 'APPROVED';
          ledgerItem.approvedQty = item.quantity;
          ledgerItem.updatedAt = now;
        }
      }
    }

    return this.getMaterialRequestById(id);
  }

  async recordMaterialReceipt(id: string, receiptData: any, user: any): Promise<MaterialRequest | null> {
    await ensureProcurementSeeded();
    const existing = await this.getMaterialRequestById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updatedItems = (existing.items || []).map(item => {
      const match = (receiptData.items || []).find((ri: any) => ri.itemId === item.id);
      if (match) {
        return {
          ...item,
          receivedQuantity: (item.receivedQuantity || 0) + Number(match.receivedQty || 0)
        };
      }
      return item;
    });

    const isFullyReceived = updatedItems.every(i => i.receivedQuantity >= i.quantity);
    const newStatus = isFullyReceived ? 'Completed' : 'Partially Received';

    const newReceiptRecord = {
      id: `mrr_${Date.now()}`,
      receivedDate: receiptData.receivedDate || now.split('T')[0],
      deliveryProjectId: receiptData.deliveryProjectId || existing.projectId,
      deliveryProjectName: receiptData.deliveryProjectName || existing.projectName,
      storeId: receiptData.storeId || 'str_default',
      storeName: receiptData.storeName || 'Project Site Store Yard',
      receiverName: receiptData.receiverName || user?.name || 'Store Keeper',
      vehicleNumber: receiptData.vehicleNumber || 'N/A',
      deliveryNoteNumber: receiptData.deliveryNoteNumber || `DN-${Date.now().toString().slice(-6)}`,
      items: receiptData.items || [],
      remarks: receiptData.remarks || '',
      createdAt: now
    };

    const updatedReceipts = [...(existing.receipts || []), newReceiptRecord];

    const historyEntry = {
      id: `aph_${Date.now()}`,
      step: 'Material Receipt',
      actorId: user?.id || 'usr_store',
      actorName: user?.name || 'Store Keeper',
      actorRole: user?.role || 'STORE',
      action: 'Receipt Recorded' as const,
      remarks: `Material delivery recorded via DN #${newReceiptRecord.deliveryNoteNumber}`,
      timestamp: now
    };

    const updatedHistory = [...(existing.approvalHistory || []), historyEntry];

    await db.update(procurementMaterialRequestsTable)
      .set({
        status: newStatus,
        items: updatedItems as any,
        receipts: updatedReceipts as any,
        approvalHistory: updatedHistory as any,
        updatedAt: now
      })
      .where(eq(procurementMaterialRequestsTable.id, id));

    // Requirement 7: Project Store Integration - Create Stock Transactions & Update Stock Ledger
    for (const recItem of (receiptData.items || [])) {
      const qty = Number(recItem.receivedQty || 0);
      if (qty > 0) {
        memoryStockTransactions.unshift({
          id: `stx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          materialRequestId: existing.id,
          requestNo: existing.requestNo,
          projectId: existing.projectId,
          projectName: existing.projectName,
          storeId: newReceiptRecord.storeId,
          storeName: newReceiptRecord.storeName,
          materialId: recItem.itemId,
          itemDescription: recItem.itemDescription,
          transactionType: 'IN_RECEIPT',
          quantity: qty,
          unit: recItem.unit || 'Nos',
          deliveryNoteNo: newReceiptRecord.deliveryNoteNumber,
          performedBy: newReceiptRecord.receiverName,
          timestamp: now
        });

        // Update Material Ledger Entry
        const ledgerItem = memoryMaterialLedger.find(l => l.materialRequestId === existing.id && l.itemDescription === recItem.itemDescription);
        if (ledgerItem) {
          ledgerItem.receivedQty = (ledgerItem.receivedQty || 0) + qty;
          ledgerItem.balanceQty = Math.max(0, ledgerItem.approvedQty - ledgerItem.receivedQty);
          ledgerItem.stage = ledgerItem.balanceQty === 0 ? 'STORE_STOCKED' : 'RECEIVED';
          ledgerItem.updatedAt = now;
        } else {
          memoryMaterialLedger.unshift({
            id: `mle_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            materialRequestId: existing.id,
            requestNo: existing.requestNo,
            projectId: existing.projectId,
            itemDescription: recItem.itemDescription,
            stage: 'RECEIVED',
            requestedQty: qty,
            approvedQty: qty,
            receivedQty: qty,
            balanceQty: 0,
            unit: recItem.unit || 'Nos',
            updatedAt: now
          });
        }
      }
    }

    // Create Notification
    await this.createNotification({
      recipientUserId: existing.requestedByUserId,
      title: `Materials Received for ${existing.requestNo}`,
      message: `Store received material shipment under Delivery Note #${newReceiptRecord.deliveryNoteNumber}. Status: ${newStatus}`,
      type: 'MATERIAL_RECEIVED',
      referenceId: existing.id,
      referenceNo: existing.requestNo
    });

    // Create Audit Log
    await this.createAuditLog({
      entityType: 'STORE_RECEIPT',
      entityId: existing.id,
      action: 'STORE_RECEIPT_RECORDED',
      actorId: user?.id || 'usr_store',
      actorName: user?.name || 'Store Keeper',
      actorRole: user?.role || 'STORE',
      remarks: `Recorded material receipt for ${existing.requestNo} via Delivery Note #${newReceiptRecord.deliveryNoteNumber}`
    });

    return this.getMaterialRequestById(id);
  }

  // ====================================================
  // PHASE 56: ENTERPRISE PROCUREMENT REPOSITORY METHODS
  // ====================================================

  // --- PURCHASE REQUISITIONS (PR) ---
  async createPhase56PR(data: any) {
    const now = new Date().toISOString();
    const prId = `pr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const prNumber = data.prNumber || (await numberingService.generatePurchaseRequisitionNumber({
      companyId: 'cmp-101',
      projectId: data.projectId || null,
      date: data.requiredDate || now,
    }));

    // Check duplicate PR Number
    const existingPr = await db.select().from(purchaseRequisitions).where(eq(purchaseRequisitions.prNumber, prNumber)).limit(1);
    if (existingPr.length > 0) {
      throw new Error(`PR Number ${prNumber} already exists`);
    }

    const prRecord = {
      id: prId,
      prNumber,
      projectId: data.projectId || null,
      projectName: data.projectName || null,
      wbsCode: data.wbsCode || null,
      department: data.department || 'Procurement',
      requestedBy: data.requestedBy,
      requiredDate: data.requiredDate || null,
      priority: data.priority || 'MEDIUM',
      totalAmount: data.totalAmount || 0,
      currency: data.currency || 'AED',
      status: 'SUBMITTED',
      approvalStep: 'Manager Review',
      currentApprover: 'Department Manager',
      notes: data.notes || null,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: data.requestedBy,
      updatedBy: data.requestedBy,
    };

    await db.insert(purchaseRequisitions).values(prRecord);

    const items = data.items || [];
    for (const item of items) {
      const itemId = `pri-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await db.insert(purchaseRequisitionItems).values({
        id: itemId,
        prId,
        materialId: item.materialId || null,
        materialCode: item.materialCode,
        materialName: item.materialName,
        quantity: item.quantity,
        unit: item.unit || 'PCS',
        estimatedUnitPrice: item.estimatedUnitPrice || 0,
        estimatedTotalPrice: (item.quantity || 0) * (item.estimatedUnitPrice || 0),
        specification: item.specification || null,
        requiredDate: item.requiredDate || null,
        boqRef: item.boqRef || null,
        remarks: item.remarks || null,
        createdAt: now,
      });
    }

    // Log
    await db.insert(procurementLogs).values({
      id: `plog-${Date.now()}`,
      entityType: 'PR',
      entityId: prId,
      entityNumber: prNumber,
      actionType: 'CREATE',
      performedBy: data.requestedBy,
      details: `Created PR #${prNumber} with ${items.length} items`,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    return this.getPhase56PRById(prId);
  }

  async getPhase56PRs(filters: { search?: string; status?: string; projectId?: string }) {
    const prs = await db.select().from(purchaseRequisitions).where(eq(purchaseRequisitions.isDeleted, false));
    let filtered = prs;
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.projectId) {
      filtered = filtered.filter(p => p.projectId === filters.projectId);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.prNumber.toLowerCase().includes(term) ||
        (p.projectName && p.projectName.toLowerCase().includes(term)) ||
        p.requestedBy.toLowerCase().includes(term)
      );
    }
    return filtered;
  }

  async getPhase56PRById(id: string) {
    const prs = await db.select().from(purchaseRequisitions).where(and(eq(purchaseRequisitions.id, id), eq(purchaseRequisitions.isDeleted, false))).limit(1);
    if (prs.length === 0) return null;
    const pr = prs[0];
    const items = await db.select().from(purchaseRequisitionItems).where(eq(purchaseRequisitionItems.prId, id));
    return { ...pr, items };
  }

  async approvePhase56PR(prId: string, approverId: string, approverName: string, action: 'APPROVE' | 'REJECT', comments?: string) {
    const now = new Date().toISOString();
    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    await db.update(purchaseRequisitions)
      .set({
        status: newStatus,
        approvalStep: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        currentApprover: null,
        updatedAt: now,
        updatedBy: approverName,
      })
      .where(eq(purchaseRequisitions.id, prId));

    await db.insert(purchaseOrderApprovals).values({
      id: `poa-${Date.now()}`,
      prId,
      entityType: 'PR',
      entityNumber: prId,
      step: 1,
      approverRole: 'MANAGER',
      approverId,
      approverName,
      status: newStatus,
      comments: comments || null,
      actionDate: now,
      createdAt: now,
    });

    await db.insert(procurementLogs).values({
      id: `plog-${Date.now()}`,
      entityType: 'PR',
      entityId: prId,
      entityNumber: prId,
      actionType: action === 'APPROVE' ? 'APPROVE' : 'REJECT',
      performedBy: approverName,
      details: `${action} PR status to ${newStatus}. Comments: ${comments || 'None'}`,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    return this.getPhase56PRById(prId);
  }

  async softDeletePR(id: string) {
    const now = new Date().toISOString();
    await db.update(purchaseRequisitions)
      .set({ isDeleted: true, deletedAt: now, updatedAt: now })
      .where(eq(purchaseRequisitions.id, id));
    return true;
  }

  // --- REQUEST FOR QUOTATIONS (RFQ) ---
  async createPhase56RFQ(data: any) {
    const now = new Date().toISOString();
    const rfqId = `rfq-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(requestForQuotations);
    const rfqCount = Number(countRes[0]?.count || 0) + 1;
    const rfqNumber = data.rfqNumber || `RFQ-2026-${String(rfqCount).padStart(4, '0')}`;

    const rfqRecord = {
      id: rfqId,
      rfqNumber,
      prId: data.prId || null,
      prNumber: data.prNumber || null,
      title: data.title,
      projectId: data.projectId || null,
      projectName: data.projectName || null,
      issuedDate: now,
      submissionDeadline: data.submissionDeadline,
      issuedBy: data.issuedBy,
      status: 'ISSUED',
      termsAndConditions: data.termsAndConditions || null,
      notes: data.notes || null,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: data.issuedBy,
      updatedBy: data.issuedBy,
    };

    await db.insert(requestForQuotations).values(rfqRecord);

    const items = data.items || [];
    for (const item of items) {
      await db.insert(rfqItems).values({
        id: `rfqi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        rfqId,
        prItemId: item.prItemId || null,
        materialId: item.materialId || null,
        materialCode: item.materialCode,
        materialName: item.materialName,
        quantity: item.quantity,
        unit: item.unit || 'PCS',
        specification: item.specification || null,
        createdAt: now,
      });
    }

    const vendorIds = data.vendorIds || [];
    for (const vendorId of vendorIds) {
      await db.insert(rfqVendors).values({
        id: `rfqv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        rfqId,
        vendorId,
        vendorName: `Vendor ${vendorId}`,
        status: 'INVITED',
        invitedAt: now,
      });
    }

    await db.insert(procurementLogs).values({
      id: `plog-${Date.now()}`,
      entityType: 'RFQ',
      entityId: rfqId,
      entityNumber: rfqNumber,
      actionType: 'CREATE',
      performedBy: data.issuedBy,
      details: `Generated RFQ #${rfqNumber}`,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    return this.getPhase56RFQById(rfqId);
  }

  async getPhase56RFQs(filters: { search?: string; status?: string; projectId?: string }) {
    const rfqs = await db.select().from(requestForQuotations).where(eq(requestForQuotations.isDeleted, false));
    let filtered = rfqs;
    if (filters.status) filtered = filtered.filter(r => r.status === filters.status);
    if (filters.projectId) filtered = filtered.filter(r => r.projectId === filters.projectId);
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(r => r.rfqNumber.toLowerCase().includes(term) || r.title.toLowerCase().includes(term));
    }
    return filtered;
  }

  async getPhase56RFQById(id: string) {
    const rfqs = await db.select().from(requestForQuotations).where(and(eq(requestForQuotations.id, id), eq(requestForQuotations.isDeleted, false))).limit(1);
    if (rfqs.length === 0) return null;
    const rfq = rfqs[0];
    const items = await db.select().from(rfqItems).where(eq(rfqItems.rfqId, id));
    const vendors = await db.select().from(rfqVendors).where(eq(rfqVendors.rfqId, id));
    return { ...rfq, items, vendors };
  }

  async softDeleteRFQ(id: string) {
    const now = new Date().toISOString();
    await db.update(requestForQuotations)
      .set({ isDeleted: true, deletedAt: now, updatedAt: now })
      .where(eq(requestForQuotations.id, id));
    return true;
  }

  // --- VENDOR QUOTATIONS ---
  async createPhase56VendorQuotation(data: any) {
    const now = new Date().toISOString();
    const qId = `vq-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const quotationNumber = data.quotationNumber || (await numberingService.generateQuotationNumber({
      companyId: 'cmp-101',
      projectId: data.projectId || null,
      date: data.quotationDate || now,
    }));

    const record = {
      id: qId,
      quotationNumber,
      rfqId: data.rfqId,
      rfqNumber: data.rfqNumber,
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      quotationDate: data.quotationDate || now,
      validUntil: data.validUntil || null,
      paymentTerms: data.paymentTerms || null,
      deliveryLeadTimeDays: data.deliveryLeadTimeDays || 0,
      subtotal: data.subtotal || 0,
      taxAmount: data.taxAmount || 0,
      discountAmount: data.discountAmount || 0,
      totalAmount: data.totalAmount || 0,
      currency: data.currency || 'AED',
      status: 'SUBMITTED',
      technicalScore: 0,
      commercialScore: 0,
      overallScore: 0,
      notes: data.notes || null,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: data.vendorName,
      updatedBy: data.vendorName,
    };

    await db.insert(vendorQuotations).values(record);

    const items = data.items || [];
    for (const item of items) {
      await db.insert(vendorQuotationItems).values({
        id: `vqi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        quotationId: qId,
        rfqItemId: item.rfqItemId || null,
        materialId: item.materialId || null,
        materialCode: item.materialCode,
        materialName: item.materialName,
        offeredQuantity: item.offeredQuantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        brandModel: item.brandModel || null,
        countryOfOrigin: item.countryOfOrigin || null,
        complianceRemarks: item.complianceRemarks || null,
        createdAt: now,
      });
    }

    return this.getPhase56VendorQuotationById(qId);
  }

  async getPhase56VendorQuotations(filters: { rfqId?: string; vendorId?: string }) {
    let query = db.select().from(vendorQuotations).where(eq(vendorQuotations.isDeleted, false));
    const quotes = await query;
    let filtered = quotes;
    if (filters.rfqId) filtered = filtered.filter(q => q.rfqId === filters.rfqId);
    if (filters.vendorId) filtered = filtered.filter(q => q.vendorId === filters.vendorId);
    return filtered;
  }

  async getPhase56VendorQuotationById(id: string) {
    const quotes = await db.select().from(vendorQuotations).where(and(eq(vendorQuotations.id, id), eq(vendorQuotations.isDeleted, false))).limit(1);
    if (quotes.length === 0) return null;
    const quote = quotes[0];
    const items = await db.select().from(vendorQuotationItems).where(eq(vendorQuotationItems.quotationId, id));
    return { ...quote, items };
  }

  // --- TECHNICAL & COMMERCIAL EVALUATIONS ---
  async createTechnicalEvaluation(data: any) {
    const now = new Date().toISOString();
    const id = `te-${Date.now()}`;
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(technicalEvaluations);
    const count = Number(countRes[0]?.count || 0) + 1;
    const evaluationNumber = `TE-2026-${String(count).padStart(4, '0')}`;

    const overallTechnicalScore = ((data.specificationComplianceScore || 0) + (data.qualityScore || 0) + (data.deliveryLeadTimeScore || 0)) / 3;

    const record = {
      id,
      evaluationNumber,
      rfqId: data.rfqId,
      quotationId: data.quotationId,
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      evaluatorId: data.evaluatorId,
      evaluatorName: data.evaluatorName,
      evaluationDate: now,
      specificationComplianceScore: data.specificationComplianceScore || 0,
      qualityScore: data.qualityScore || 0,
      deliveryLeadTimeScore: data.deliveryLeadTimeScore || 0,
      overallTechnicalScore,
      recommendation: data.recommendation || 'QUALIFIED',
      remarks: data.remarks || null,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: data.evaluatorName,
      updatedBy: data.evaluatorName,
    };

    await db.insert(technicalEvaluations).values(record);

    // Update vendor quotation technical score
    await db.update(vendorQuotations)
      .set({ technicalScore: overallTechnicalScore, updatedAt: now })
      .where(eq(vendorQuotations.id, data.quotationId));

    return record;
  }

  async getTechnicalEvaluations(rfqId?: string) {
    const records = await db.select().from(technicalEvaluations).where(eq(technicalEvaluations.isDeleted, false));
    if (rfqId) return records.filter(r => r.rfqId === rfqId);
    return records;
  }

  async createCommercialEvaluation(data: any) {
    const now = new Date().toISOString();
    const id = `ce-${Date.now()}`;
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(commercialEvaluations);
    const count = Number(countRes[0]?.count || 0) + 1;
    const evaluationNumber = `CE-2026-${String(count).padStart(4, '0')}`;

    const overallCommercialScore = ((data.unitPriceScore || 0) + (data.paymentTermsScore || 0) + (data.totalValueScore || 0)) / 3;

    const record = {
      id,
      evaluationNumber,
      rfqId: data.rfqId,
      quotationId: data.quotationId,
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      evaluatorId: data.evaluatorId,
      evaluatorName: data.evaluatorName,
      evaluationDate: now,
      unitPriceScore: data.unitPriceScore || 0,
      paymentTermsScore: data.paymentTermsScore || 0,
      totalValueScore: data.totalValueScore || 0,
      overallCommercialScore,
      recommendation: data.recommendation || 'QUALIFIED',
      remarks: data.remarks || null,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: data.evaluatorName,
      updatedBy: data.evaluatorName,
    };

    await db.insert(commercialEvaluations).values(record);

    // Update vendor quotation commercial score
    await db.update(vendorQuotations)
      .set({ commercialScore: overallCommercialScore, updatedAt: now })
      .where(eq(vendorQuotations.id, data.quotationId));

    return record;
  }

  async getCommercialEvaluations(rfqId?: string) {
    const records = await db.select().from(commercialEvaluations).where(eq(commercialEvaluations.isDeleted, false));
    if (rfqId) return records.filter(r => r.rfqId === rfqId);
    return records;
  }

  // --- COMPARATIVE STATEMENTS ---
  async createComparativeStatement(data: any) {
    const now = new Date().toISOString();
    const id = `cs-${Date.now()}`;
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(comparativeStatements);
    const count = Number(countRes[0]?.count || 0) + 1;
    const statementNumber = `CS-2026-${String(count).padStart(4, '0')}`;

    const record = {
      id,
      statementNumber,
      rfqId: data.rfqId,
      rfqNumber: data.rfqNumber,
      projectId: data.projectId || null,
      projectName: data.projectName || null,
      preparedBy: data.preparedBy,
      preparedDate: now,
      recommendedVendorId: data.recommendedVendorId || null,
      recommendedVendorName: data.recommendedVendorName || null,
      recommendedQuotationId: data.recommendedQuotationId || null,
      justification: data.justification || null,
      status: 'SUBMITTED',
      approvedBy: null,
      approvedAt: null,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: data.preparedBy,
      updatedBy: data.preparedBy,
    };

    await db.insert(comparativeStatements).values(record);
    return record;
  }

  async getComparativeStatements(rfqId?: string) {
    const records = await db.select().from(comparativeStatements).where(eq(comparativeStatements.isDeleted, false));
    if (rfqId) return records.filter(r => r.rfqId === rfqId);
    return records;
  }

  async approveComparativeStatement(id: string, approverName: string) {
    const now = new Date().toISOString();
    await db.update(comparativeStatements)
      .set({ status: 'APPROVED', approvedBy: approverName, approvedAt: now, updatedAt: now })
      .where(eq(comparativeStatements.id, id));
    
    const records = await db.select().from(comparativeStatements).where(eq(comparativeStatements.id, id)).limit(1);
    return records[0] || null;
  }

  /**
   * PHASE 6A: APPROVED COMPARATIVE STATEMENT (CS) -> PURCHASE ORDER (PO)
   * Enforces strict approval gate, duplicate PO check, server-side data derivation from winning quotation,
   * numberingService integration, transaction safety, and enterprise audit.
   */
  async generatePoFromComparativeStatement(
    csId: string,
    options?: { user?: any; companyId?: string; idempotencyKey?: string }
  ) {
    await ensureProcurementSeeded();

    // 1. Fetch CS and verify it exists
    const csRows = await db
      .select()
      .from(comparativeStatements)
      .where(and(eq(comparativeStatements.id, csId), eq(comparativeStatements.isDeleted, false)))
      .limit(1);

    if (csRows.length === 0) {
      throw new Error(`Comparative Statement not found: ${csId}`);
    }

    const cs = csRows[0];

    // 2. Strict Approval Gate
    if (cs.status !== 'APPROVED') {
      throw new Error(
        `Comparative Statement ${cs.statementNumber || csId} is not APPROVED. Current status is '${cs.status}'. Only APPROVED statements can be converted to Purchase Orders.`
      );
    }

    if (!cs.recommendedQuotationId) {
      throw new Error(
        `Comparative Statement ${cs.statementNumber} does not specify an approved/recommended winning quotation.`
      );
    }

    // 3. Concurrency-Safe Duplicate Check
    // Check if PO already exists referencing this winning quotation, or referencing this CS in notes
    const existingPOs = await db
      .select()
      .from(schemaPurchaseOrders)
      .where(
        and(
          eq(schemaPurchaseOrders.quotationId, cs.recommendedQuotationId),
          eq(schemaPurchaseOrders.isDeleted, false)
        )
      )
      .limit(1);

    if (existingPOs.length > 0) {
      throw new Error(
        `Conflict: Purchase Order ${existingPOs[0].poNumber} has already been generated for winning quotation ${cs.recommendedQuotationId} under Comparative Statement ${cs.statementNumber}.`
      );
    }

    const existingByNotes = await db
      .select()
      .from(schemaPurchaseOrders)
      .where(
        and(
          ilike(schemaPurchaseOrders.notes, `%${cs.statementNumber}%`),
          eq(schemaPurchaseOrders.isDeleted, false)
        )
      )
      .limit(1);

    if (existingByNotes.length > 0) {
      throw new Error(
        `Conflict: Purchase Order ${existingByNotes[0].poNumber} has already been generated for Comparative Statement ${cs.statementNumber}.`
      );
    }

    // 4. Fetch Authoritative Quotation & Items
    let winningQuote: any = await this.getPhase56VendorQuotationById(cs.recommendedQuotationId);
    let quoteItems: any[] = winningQuote?.items || [];

    // If not found in Phase 56 table, check legacy quotation table
    if (!winningQuote) {
      const legacyQuote = (
        await db
          .select()
          .from(procurementQuotationsTable)
          .where(eq(procurementQuotationsTable.id, cs.recommendedQuotationId))
          .limit(1)
      )[0] as unknown as VendorQuotation;

      if (legacyQuote) {
        winningQuote = {
          id: legacyQuote.id,
          quotationNumber: legacyQuote.quotationNo,
          rfqId: legacyQuote.rfqId,
          rfqNumber: cs.rfqNumber,
          vendorId: legacyQuote.vendorId,
          vendorName: legacyQuote.vendorName,
          quotationDate: legacyQuote.submittedDate,
          paymentTerms: 'Net 30 Days from GRN clearance',
          deliveryLeadTimeDays: legacyQuote.leadTimeDays || 14,
          subtotal: legacyQuote.subtotalUSD || 0,
          taxAmount: legacyQuote.taxUSD || 0,
          discountAmount: 0,
          totalAmount: legacyQuote.netTotalUSD || (legacyQuote.subtotalUSD + legacyQuote.taxUSD + (legacyQuote.freightUSD || 0)),
          currency: 'USD',
          status: 'ACCEPTED',
        };
        quoteItems = (legacyQuote.items || []).map((it: any) => ({
          materialId: null,
          materialCode: it.itemCode || 'MAT-GEN',
          materialName: it.description || 'Procured Item',
          offeredQuantity: it.quantity || 1,
          unitPrice: it.unitRateUSD || 0,
          totalPrice: it.totalAmountUSD || ((it.quantity || 1) * (it.unitRateUSD || 0)),
          unit: it.unit || 'PCS',
          complianceRemarks: 'Verified against comparative statement'
        }));
      }
    }

    if (!winningQuote) {
      throw new Error(
        `Winning quotation record ${cs.recommendedQuotationId} referenced by Comparative Statement ${cs.statementNumber} was not found in the database.`
      );
    }

    if (quoteItems.length === 0) {
      throw new Error(
        `Winning quotation ${winningQuote.quotationNumber || cs.recommendedQuotationId} contains no billable line items.`
      );
    }

    // 5. Generate authoritatively derived PO
    const now = new Date().toISOString();
    const poDate = now.split('T')[0];
    const companyId = options?.companyId || 'cmp-101';
    const projectId = cs.projectId || winningQuote.projectId || null;

    const poNumber = await numberingService.generatePurchaseOrderNumber({
      companyId,
      projectId,
      date: now,
    });

    const subtotal = Number(winningQuote.subtotal || 0);
    const taxAmount = Number(winningQuote.taxAmount || 0);
    const discountAmount = Number(winningQuote.discountAmount || 0);
    const totalAmount = Number(winningQuote.totalAmount || (subtotal + taxAmount - discountAmount));
    const currency = winningQuote.currency || 'AED';

    // Calculate expected delivery date from lead time
    const leadDays = winningQuote.deliveryLeadTimeDays || 14;
    const expectedDelivery = new Date(Date.now() + leadDays * 86400000).toISOString().split('T')[0];

    const poId = `po-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const poRecord = {
      id: poId,
      poNumber,
      prId: null,
      prNumber: null,
      rfqId: cs.rfqId,
      quotationId: cs.recommendedQuotationId,
      vendorId: cs.recommendedVendorId || winningQuote.vendorId,
      vendorName: cs.recommendedVendorName || winningQuote.vendorName,
      projectId,
      projectName: cs.projectName || winningQuote.projectName || 'General Project',
      warehouseId: null,
      warehouseName: null,
      poDate,
      expectedDeliveryDate: expectedDelivery,
      paymentTerms: winningQuote.paymentTerms || 'Net 30 Days from GRN clearance',
      incoterms: 'DDP',
      currency,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      revisedAmount: totalAmount,
      revisionCount: 0,
      status: 'APPROVED',
      issuedBy: options?.user?.name || options?.user?.email || cs.approvedBy || 'Procurement Manager',
      approvedBy: cs.approvedBy || 'Operations Director',
      notes: `Generated from Approved Comparative Statement: ${cs.statementNumber} (RFQ: ${cs.rfqNumber || cs.rfqId})`,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: options?.user?.id || 'System',
      updatedBy: options?.user?.id || 'System',
    };

    // Execute atomic creation inside transaction
    await db.transaction(async (tx) => {
      // 1. Insert Purchase Order
      await tx.insert(schemaPurchaseOrders).values(poRecord);

      // 2. Insert PO Items
      for (const item of quoteItems) {
        const orderedQty = Number(item.offeredQuantity || item.orderedQty || item.quantity || 1);
        const unitPrice = Number(item.unitPrice || 0);
        const totalPrice = Number(item.totalPrice || (orderedQty * unitPrice));

        await tx.insert(purchaseOrderItems).values({
          id: `poi-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          poId,
          materialId: item.materialId || null,
          materialCode: item.materialCode || 'MAT-GEN',
          materialName: item.materialName || 'General Item',
          orderedQty,
          unitPrice,
          totalPrice,
          receivedQty: 0,
          outstandingQty: orderedQty,
          unit: item.unit || 'PCS',
          specification: item.specification || item.complianceRemarks || null,
          boqRef: item.boqRef || null,
          remarks: item.brandModel ? `Brand/Model: ${item.brandModel}` : (item.remarks || null),
          createdAt: now,
        });
      }

      // 3. Insert Procurement Log
      await tx.insert(procurementLogs).values({
        id: `log-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        entityType: 'PURCHASE_ORDER',
        entityId: poId,
        entityNumber: poNumber,
        actionType: 'CREATE',
        performedBy: options?.user?.name || 'Procurement Manager',
        details: `Generated Purchase Order ${poNumber} from Approved Comparative Statement ${cs.statementNumber} (Winning Quote: ${winningQuote.quotationNumber || cs.recommendedQuotationId}, Vendor: ${poRecord.vendorName}, Amount: ${currency} ${totalAmount.toLocaleString()})`,
        isActive: true,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        createdBy: options?.user?.id || 'usr-system',
        updatedBy: options?.user?.id || 'usr-system',
      });
    });

    // 4. Enterprise Audit Trail
    try {
      await enterpriseAuditRepository.logEvent({
        userName: options?.user?.name || 'Procurement Manager',
        userRole: options?.user?.role || 'MANAGER',
        actionType: 'CREATE',
        entityType: 'PURCHASE_ORDER',
        entityId: poId,
        entityNumber: poNumber,
        fromState: 'DRAFT',
        toState: 'APPROVED',
        diffJson: {
          sourceCsId: cs.id,
          sourceCsNumber: cs.statementNumber,
          winningQuotationId: cs.recommendedQuotationId,
          vendorId: poRecord.vendorId,
          vendorName: poRecord.vendorName,
          totalAmount,
          currency,
        },
        metadata: {
          sourceCsId: cs.id,
          sourceCsNumber: cs.statementNumber,
          rfqId: cs.rfqId,
          quotationId: cs.recommendedQuotationId,
          idempotencyKey: options?.idempotencyKey || null,
          projectId: projectId || null,
        },
        reason: `PO generated from Approved Comparative Statement ${cs.statementNumber}`,
      });
    } catch (auditErr) {
      console.warn('[Enterprise Audit] Warning logging CS -> PO event:', auditErr);
    }

    // 5. Universal Workflow Binding
    try {
      await universalWorkflowBindingService.bindOperationalTransaction({
        entityType: 'PURCHASE_ORDER',
        entityId: poId,
        entityNumber: poNumber,
        title: `Purchase Order ${poNumber} - ${poRecord.vendorName}`,
        amount: totalAmount,
        currency,
        projectId: projectId || undefined,
        requester: {
          id: options?.user?.id || 'usr-system',
          name: options?.user?.name || 'Procurement Specialist',
          role: options?.user?.role || 'BUYER',
          email: options?.user?.email || 'procurement@sitesyncpro.com',
        },
        idempotencyKey: options?.idempotencyKey,
      });
    } catch (wfErr) {
      console.warn('[Workflow Binding] Warning binding PO workflow:', wfErr);
    }

    // Return the created PO with its items
    const poItemsRes = await db
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.poId, poId));

    return {
      ...poRecord,
      items: poItemsRes,
    };
  }

  // --- PURCHASE ORDERS (PO) ---
  async createPhase56PO(data: any) {
    const now = new Date().toISOString();
    const poId = `po-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const poNumber = data.poNumber || (await numberingService.generatePurchaseOrderNumber({
      companyId: 'cmp-101',
      projectId: data.projectId || null,
      date: data.poDate || now,
    }));

    // Check duplicate PO number
    const existing = await db.select().from(schemaPurchaseOrders).where(eq(schemaPurchaseOrders.poNumber, poNumber)).limit(1);
    if (existing.length > 0) {
      throw new Error(`PO Number ${poNumber} already exists`);
    }

    const subtotal = data.subtotal || data.totalAmount || 0;
    const taxAmount = data.taxAmount || 0;
    const discountAmount = data.discountAmount || 0;
    const totalAmount = data.totalAmount || (subtotal + taxAmount - discountAmount);

    const poRecord = {
      id: poId,
      poNumber,
      prId: data.prId || null,
      prNumber: data.prNumber || null,
      rfqId: data.rfqId || null,
      quotationId: data.quotationId || null,
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      projectId: data.projectId || null,
      projectName: data.projectName || null,
      warehouseId: data.warehouseId || null,
      warehouseName: data.warehouseName || null,
      poDate: data.poDate || now,
      expectedDeliveryDate: data.expectedDeliveryDate || null,
      paymentTerms: data.paymentTerms || 'Net 30',
      incoterms: data.incoterms || 'DDP',
      currency: data.currency || 'AED',
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      revisedAmount: totalAmount,
      revisionCount: 0,
      status: 'APPROVED',
      issuedBy: data.issuedBy || 'Procurement Manager',
      approvedBy: data.approvedBy || 'Operations Director',
      notes: data.notes || null,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: data.issuedBy || 'System',
      updatedBy: data.issuedBy || 'System',
    };

    await db.insert(schemaPurchaseOrders).values(poRecord);

    const items = data.items || [];
    for (const item of items) {
      const orderedQty = item.orderedQty || item.quantity || 1;
      const unitPrice = item.unitPrice || 0;
      const totalPrice = item.totalPrice || (orderedQty * unitPrice);
      await db.insert(purchaseOrderItems).values({
        id: `poi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        poId,
        materialId: item.materialId || null,
        materialCode: item.materialCode || 'MAT-GEN',
        materialName: item.materialName || 'General Item',
        orderedQty,
        unitPrice,
        totalPrice,
        receivedQty: 0,
        outstandingQty: orderedQty,
        unit: item.unit || 'PCS',
        specification: item.specification || null,
        boqRef: item.boqRef || null,
        remarks: item.remarks || null,
        createdAt: now,
      });
    }

    await db.insert(procurementLogs).values({
      id: `plog-${Date.now()}`,
      entityType: 'PO',
      entityId: poId,
      entityNumber: poNumber,
      actionType: 'CREATE',
      performedBy: data.issuedBy || 'System',
      details: `Created PO #${poNumber} for vendor ${data.vendorName}`,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    return this.getPhase56POById(poId);
  }

  async getPhase56POs(filters: { search?: string; status?: string; vendorId?: string; projectId?: string }) {
    await legacyProcurementTelemetry.logEvent({
      eventType: 'LEGACY_READ_REDIRECTED',
      caller: 'ProcurementRepository.getPhase56POs',
      legacyTarget: 'phase56_purchase_orders',
      activeTarget: 'procurement_purchase_orders',
      details: { filters },
    });

    // Read from active table as primary SSoT
    const activeRows = await db.select().from(procurementPurchaseOrdersTable);
    const legacyRows = await db.select().from(schemaPurchaseOrders).where(eq(schemaPurchaseOrders.isDeleted, false));

    const poMap = new Map<string, any>();
    for (const p of activeRows) {
      const norm = legacyProcurementAdapter.normalizePOFromActive(p);
      poMap.set(p.poNumber, {
        id: norm.id,
        poNumber: norm.poNumber,
        vendorId: norm.vendorId,
        vendorName: norm.vendorName,
        projectId: norm.projectId,
        projectName: norm.projectName,
        poDate: norm.poDate,
        expectedDeliveryDate: norm.expectedDeliveryDate,
        totalAmount: norm.totalAmount,
        currency: 'USD',
        status: norm.status,
        paymentTerms: norm.paymentTerms,
        deliveryTerms: 'DDP Site',
        shippingAddress: 'Main Project Warehouse',
        billingAddress: 'Abu Dhabi HQ',
        notes: norm.notes,
        revisionCount: 0,
        isDeleted: false,
        createdAt: norm.createdAt,
        updatedAt: norm.updatedAt,
      });
    }

    for (const leg of legacyRows) {
      if (!poMap.has(leg.poNumber)) {
        poMap.set(leg.poNumber, leg);
      }
    }

    let filtered = Array.from(poMap.values());
    if (filters.status) filtered = filtered.filter(p => (p.status || '').toUpperCase() === filters.status?.toUpperCase());
    if (filters.vendorId) filtered = filtered.filter(p => p.vendorId === filters.vendorId);
    if (filters.projectId) filtered = filtered.filter(p => p.projectId === filters.projectId);
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        (p.poNumber || '').toLowerCase().includes(term) ||
        (p.vendorName || '').toLowerCase().includes(term)
      );
    }
    return filtered;
  }

  async getPhase56POById(id: string) {
    // 1. Check active table first
    const [actPo] = await db.select().from(procurementPurchaseOrdersTable).where(eq(procurementPurchaseOrdersTable.id, id));
    if (actPo) {
      const norm = legacyProcurementAdapter.normalizePOFromActive(actPo);
      return {
        ...norm,
        revisionCount: 0,
        items: norm.items || [],
        revisions: [],
      };
    }

    const pos = await db.select().from(schemaPurchaseOrders).where(and(eq(schemaPurchaseOrders.id, id), eq(schemaPurchaseOrders.isDeleted, false))).limit(1);
    if (pos.length === 0) return null;
    const po = pos[0];
    const items = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.poId, id));
    const revisions = await db.select().from(purchaseOrderRevisions).where(eq(purchaseOrderRevisions.poId, id));
    return { ...po, items, revisions };
  }

  async revisePO(data: { poId: string; reasonForRevision: string; revisedBy: string; newTotalAmount: number; changesSummary?: string }) {
    const now = new Date().toISOString();
    const po = await this.getPhase56POById(data.poId);
    if (!po) throw new Error('Purchase Order not found');

    const newRevNumber = (po.revisionCount || 0) + 1;

    await db.insert(purchaseOrderRevisions).values({
      id: `por-${Date.now()}`,
      poId: data.poId,
      revisionNumber: newRevNumber,
      revisedBy: data.revisedBy,
      revisedDate: now,
      reasonForRevision: data.reasonForRevision,
      previousTotalAmount: po.totalAmount,
      newTotalAmount: data.newTotalAmount,
      changesSummary: data.changesSummary || null,
      createdAt: now,
    });

    await db.update(schemaPurchaseOrders)
      .set({
        revisedAmount: data.newTotalAmount,
        revisionCount: newRevNumber,
        updatedAt: now,
        updatedBy: data.revisedBy,
      })
      .where(eq(schemaPurchaseOrders.id, data.poId));

    return this.getPhase56POById(data.poId);
  }

  // --- DELIVERY SCHEDULES ---
  async createDeliverySchedule(data: any) {
    const now = new Date().toISOString();
    const id = `ds-${Date.now()}`;
    const scheduledQty = data.scheduledQty;
    const record = {
      id,
      poId: data.poId,
      poNumber: data.poNumber,
      poItemId: data.poItemId || null,
      materialName: data.materialName,
      scheduledDate: data.scheduledDate,
      scheduledQty,
      deliveredQty: 0,
      balanceQty: scheduledQty,
      status: 'SCHEDULED',
      destinationWarehouseId: data.destinationWarehouseId || null,
      destinationWarehouseName: data.destinationWarehouseName || null,
      carrierName: data.carrierName || null,
      trackingNumber: data.trackingNumber || null,
      remarks: data.remarks || null,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System',
      updatedBy: 'System',
    };

    await db.insert(deliverySchedules).values(record);
    return record;
  }

  async getDeliverySchedules(poId?: string) {
    const records = await db.select().from(deliverySchedules).where(eq(deliverySchedules.isDeleted, false));
    if (poId) return records.filter(r => r.poId === poId);
    return records;
  }

  async updateDeliveryScheduleStatus(id: string, status: string, deliveredQty?: number) {
    const now = new Date().toISOString();
    const existing = await db.select().from(deliverySchedules).where(eq(deliverySchedules.id, id)).limit(1);
    if (existing.length === 0) return null;
    const record = existing[0];

    const newDelivered = deliveredQty !== undefined ? deliveredQty : record.deliveredQty;
    const balanceQty = Math.max(0, record.scheduledQty - newDelivered);

    await db.update(deliverySchedules)
      .set({
        status,
        deliveredQty: newDelivered,
        balanceQty,
        updatedAt: now,
      })
      .where(eq(deliverySchedules.id, id));

    const updated = await db.select().from(deliverySchedules).where(eq(deliverySchedules.id, id)).limit(1);
    return updated[0] || null;
  }

  // --- VENDOR PERFORMANCE ---
  async createVendorPerformance(data: any) {
    const now = new Date().toISOString();
    const id = `vp-${Date.now()}`;
    const overallRating = ((data.qualityRating || 5) + (data.deliveryTimelinessRating || 5) + (data.commercialCompetitivenessRating || 5)) / 3;

    const record = {
      id,
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      poId: data.poId || null,
      poNumber: data.poNumber || null,
      evaluationPeriod: data.evaluationPeriod || 'Q3 2026',
      qualityRating: data.qualityRating || 5,
      deliveryTimelinessRating: data.deliveryTimelinessRating || 5,
      commercialCompetitivenessRating: data.commercialCompetitivenessRating || 5,
      overallRating,
      evaluatorName: data.evaluatorName,
      comments: data.comments || null,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: data.evaluatorName,
      updatedBy: data.evaluatorName,
    };

    await db.insert(vendorPerformance).values(record);
    return record;
  }

  async getVendorPerformances(vendorId?: string) {
    const records = await db.select().from(vendorPerformance).where(eq(vendorPerformance.isDeleted, false));
    if (vendorId) return records.filter(r => r.vendorId === vendorId);
    return records;
  }

  // --- BUDGET ALLOCATIONS ---
  async createBudgetAllocation(data: any) {
    const now = new Date().toISOString();
    const id = `ba-${Date.now()}`;
    const record = {
      id,
      projectId: data.projectId,
      projectName: data.projectName,
      costCenterCode: data.costCenterCode,
      allocatedAmount: data.allocatedAmount,
      committedAmount: 0,
      actualSpentAmount: 0,
      availableAmount: data.allocatedAmount,
      fiscalYear: data.fiscalYear || '2026',
      status: 'ACTIVE',
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: 'Finance Admin',
      updatedBy: 'Finance Admin',
    };

    await db.insert(budgetAllocations).values(record);
    return record;
  }

  async getBudgetAllocations(projectId?: string) {
    const records = await db.select().from(budgetAllocations).where(eq(budgetAllocations.isDeleted, false));
    if (projectId) return records.filter(r => r.projectId === projectId);
    return records;
  }

  // --- LOGS & COMMENTS ---
  async getProcurementLogs(entityId?: string) {
    const logs = await db.select().from(procurementLogs).where(eq(procurementLogs.isDeleted, false));
    if (entityId) return logs.filter(l => l.entityId === entityId);
    return logs;
  }

  // ====================================================
  // PHASE 77 / P2.0: CONTRACTOR RUNNING ACCOUNT (RA) BILLING METHODS
  // ====================================================
  async getRABills(filters: { projectId?: string; workOrderId?: string; status?: string; search?: string }): Promise<RABillRecord[]> {
    await ensureProcurementSeeded();
    let rows = (await db.select().from(procurementRaBillsTable).orderBy(desc(procurementRaBillsTable.createdAt))) as unknown as RABillRecord[];

    if (filters.projectId) {
      rows = rows.filter(b => b.projectId === filters.projectId);
    }
    if (filters.workOrderId) {
      rows = rows.filter(b => b.workOrderId === filters.workOrderId);
    }
    if (filters.status && filters.status !== 'ALL') {
      rows = rows.filter(b => b.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      rows = rows.filter(b =>
        b.billNumber.toLowerCase().includes(q) ||
        (b.workOrderNumber && b.workOrderNumber.toLowerCase().includes(q)) ||
        (b.contractorName && b.contractorName.toLowerCase().includes(q)) ||
        (b.projectName && b.projectName.toLowerCase().includes(q))
      );
    }

    return rows;
  }

  async getRABillById(id: string): Promise<RABillRecord | null> {
    await ensureProcurementSeeded();
    const rows = await db.select().from(procurementRaBillsTable).where(eq(procurementRaBillsTable.id, id)).limit(1);
    if (rows.length === 0) return null;
    return rows[0] as unknown as RABillRecord;
  }

  async createRABill(data: Partial<RABillRecord>): Promise<RABillRecord> {
    await ensureProcurementSeeded();
    const newId = `ra_bill_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    const billNumber = data.billNumber || (await numberingService.generateRaBillNumber({
      companyId: 'cmp-101',
      projectId: data.projectId || 'prj_01',
      date: data.billDate || now,
    }));

    // Compute and validate items
    const rawItems = data.items || [];
    if (rawItems.length === 0) {
      throw new Error('At least one measurement line item is required to generate an RA Bill.');
    }

    // Load active RA bills and MB records to perform authoritative over-billing checks
    const allBills = (await db
      .select()
      .from(procurementRaBillsTable)) as unknown as RABillRecord[];

    const activeBills = allBills.filter(
      (b) => b.status !== 'Rejected' && (b as any).status !== 'Cancelled'
    );

    const allMbs = (await db
      .select()
      .from(procurementMeasurementEntriesTable)) as unknown as MeasurementEntry[];

    const items = rawItems.map((item, idx) => {
      let boqQty = Number(item.boqQuantity || 0);
      let boqRate = Number(item.boqRateUSD || 0);
      let prevQty = Number(item.previousCumulativeQty || 0);
      const curQty = Number(item.currentMeasuredQty || 0);

      if (curQty < 0) {
        throw new Error(`Line item ${item.itemCode || idx + 1}: Negative measured quantity (${curQty}) is strictly prohibited.`);
      }

      // Check for matching MB entry in database
      let matchedMb: MeasurementEntry | undefined;
      if (item.measurementEntryId) {
        matchedMb = allMbs.find((m) => m.id === item.measurementEntryId);
      } else if (item.mbReference) {
        matchedMb = allMbs.find((m) => m.mbNumber?.trim() === item.mbReference?.trim());
      }

      if (matchedMb) {
        const approvedMbQty = Number(matchedMb.quantity || matchedMb.calculatedQuantity || 0);
        
        // Authoritatively compute previously billed quantity from DB
        let serverPrevQty = 0;
        for (const bill of activeBills) {
          if (!Array.isArray(bill.items)) continue;
          for (const it of bill.items) {
            const isMatch =
              it.measurementEntryId === matchedMb.id ||
              it.measurementEntryIds?.includes(matchedMb.id) ||
              (it.mbReference && it.mbReference.trim() === matchedMb.mbNumber?.trim());

            if (isMatch) {
              serverPrevQty += Number(it.currentMeasuredQty || 0);
            }
          }
        }

        serverPrevQty = Math.round(serverPrevQty * 1000) / 1000;
        prevQty = serverPrevQty;
        const remainingBillable = Math.max(0, Math.round((approvedMbQty - serverPrevQty) * 1000) / 1000);

        if (curQty > remainingBillable) {
          throw new Error(
            `Over-billing violation on ${item.itemCode || matchedMb.mbNumber}: Requested quantity (${curQty}) exceeds remaining approved billable quantity (${remainingBillable}) for MB ${matchedMb.mbNumber}. Total approved: ${approvedMbQty}, Previously billed: ${serverPrevQty}.`
          );
        }

        if (boqQty <= 0) {
          boqQty = approvedMbQty;
        }
        if (boqRate <= 0 && matchedMb.valuationUSD && approvedMbQty > 0) {
          boqRate = Math.round((matchedMb.valuationUSD / approvedMbQty) * 100) / 100;
        }
      } else {
        if (prevQty < 0) {
          throw new Error(`Line item ${item.itemCode || idx + 1}: Negative previous cumulative quantity (${prevQty}) is invalid.`);
        }
      }

      const totQty = Math.round((prevQty + curQty) * 1000) / 1000;

      // Over-billing validation against BOQ quantity
      if (boqQty > 0 && totQty > boqQty) {
        throw new Error(
          `Over-billing violation on ${item.itemCode || 'BOQ Item'}: Proposed cumulative quantity (${totQty}) exceeds authorized contract BOQ quantity (${boqQty}) without approved variation.`
        );
      }

      const curAmount = Math.round((curQty * boqRate) * 100) / 100;
      const cumAmount = Math.round((totQty * boqRate) * 100) / 100;

      return {
        id: item.id || `ra_item_${Date.now()}_${idx}`,
        boqItemId: item.boqItemId || matchedMb?.boqItemId || '',
        itemCode: item.itemCode || matchedMb?.boqItemCode || `BOQ-ITEM-${idx + 1}`,
        description: item.description || matchedMb?.boqDescription || '',
        unit: item.unit || matchedMb?.unit || 'Units',
        boqQuantity: boqQty,
        boqRateUSD: boqRate,
        previousCumulativeQty: prevQty,
        currentMeasuredQty: curQty,
        totalCumulativeQty: totQty,
        currentAmountUSD: curAmount,
        cumulativeAmountUSD: cumAmount,
        mbReference: item.mbReference || matchedMb?.mbNumber || '',
        measurementEntryId: matchedMb?.id || item.measurementEntryId || undefined,
        measurementEntryIds: item.measurementEntryIds || (matchedMb?.id ? [matchedMb.id] : undefined),
      };
    });

    const grossCurrent = Math.round(items.reduce((sum, it) => sum + it.currentAmountUSD, 0) * 100) / 100;
    const prevGross = Number(data.financials?.previousCertifiedGrossUSD || 0);
    const grossCumulative = Math.round((prevGross + grossCurrent) * 100) / 100;

    const advRate = Math.max(0, Number(data.financials?.mobilizationAdvanceRecoveryRatePercent ?? 10));
    const advRecovery = Math.round(Number(data.financials?.mobilizationAdvanceRecoveryUSD ?? (grossCurrent * (advRate / 100))) * 100) / 100;

    const retRate = Math.max(0, Number(data.financials?.retentionMoneyRatePercent ?? 5));
    const retWithheld = Math.round(Number(data.financials?.retentionMoneyWithheldUSD ?? (grossCurrent * (retRate / 100))) * 100) / 100;

    const matAdv = Math.max(0, Math.round(Number(data.financials?.materialAdvanceRecoveryUSD ?? 0) * 100) / 100);
    const tdsRate = Math.max(0, Number(data.financials?.statutoryTdsPercent ?? 2));
    const tdsUSD = Math.round(Number(data.financials?.statutoryTdsUSD ?? (grossCurrent * (tdsRate / 100))) * 100) / 100;

    const gstTdsRate = Math.max(0, Number(data.financials?.statutoryGstTdsPercent ?? 2));
    const gstTdsUSD = Math.round(Number(data.financials?.statutoryGstTdsUSD ?? (grossCurrent * (gstTdsRate / 100))) * 100) / 100;

    const cessRate = Math.max(0, Number(data.financials?.laborWelfareCessPercent ?? 1));
    const cessUSD = Math.round(Number(data.financials?.laborWelfareCessUSD ?? (grossCurrent * (cessRate / 100))) * 100) / 100;

    const penaltyUSD = Math.max(0, Math.round(Number(data.financials?.liquidatedDamagesOrPenaltyUSD ?? 0) * 100) / 100);
    const otherWithholdingsUSD = Math.max(0, Math.round(Number(data.financials?.otherWithholdingsUSD ?? 0) * 100) / 100);

    const totalDeductions = Math.round((advRecovery + retWithheld + matAdv + tdsUSD + gstTdsUSD + cessUSD + penaltyUSD + otherWithholdingsUSD) * 100) / 100;
    const netCurrent = Math.max(0, Math.round((grossCurrent - totalDeductions) * 100) / 100);
    const prevNet = Number(data.financials?.netPayableCumulativeUSD || 0);
    const netCumulative = Math.round((prevNet + netCurrent) * 100) / 100;

    const initialAudit = {
      id: `audit_${Date.now()}_1`,
      action: 'BILL_CREATED',
      fromStatus: 'None' as const,
      toStatus: (data.status || 'Submitted') as any,
      performedBy: data.contractorRepresentative || 'Contractor Representative',
      role: 'CONTRACTOR_REP',
      timestamp: now,
      remarks: data.remarks || 'Running Account bill generated and submitted for measurement verification.',
      financialSnapshot: {
        grossWorkDoneCurrentUSD: grossCurrent,
        totalDeductionsUSD: totalDeductions,
        netPayableCurrentUSD: netCurrent,
      },
    };

    const newBill: RABillRecord = {
      id: newId,
      billNumber,
      workOrderId: data.workOrderId,
      workOrderNumber: data.workOrderNumber,
      projectId: data.projectId || 'prj_01',
      projectName: data.projectName || 'General Infrastructure Project',
      contractorName: data.contractorName || 'Subcontractor Firm',
      contractorCode: data.contractorCode || 'CNT-01',
      billDate: data.billDate || today,
      billingPeriodStart: data.billingPeriodStart || today,
      billingPeriodEnd: data.billingPeriodEnd || today,
      billType: data.billType || 'Progress / Running Account (RA)',
      sequenceNumber: data.sequenceNumber || 1,
      isFinalBill: Boolean(data.isFinalBill),
      status: (data.status as any) || 'Submitted',
      items,
      financials: {
        grossWorkDoneCurrentUSD: grossCurrent,
        grossWorkDoneCumulativeUSD: grossCumulative,
        previousCertifiedGrossUSD: prevGross,
        mobilizationAdvanceRecoveryRatePercent: advRate,
        mobilizationAdvanceRecoveryUSD: advRecovery,
        retentionMoneyRatePercent: retRate,
        retentionMoneyWithheldUSD: retWithheld,
        materialAdvanceRecoveryUSD: matAdv,
        statutoryTdsPercent: tdsRate,
        statutoryTdsUSD: tdsUSD,
        statutoryGstTdsPercent: gstTdsRate,
        statutoryGstTdsUSD: gstTdsUSD,
        laborWelfareCessPercent: cessRate,
        laborWelfareCessUSD: cessUSD,
        liquidatedDamagesOrPenaltyUSD: penaltyUSD,
        otherWithholdingsUSD: otherWithholdingsUSD,
        totalDeductionsUSD: totalDeductions,
        netPayableCurrentUSD: netCurrent,
        netPayableCumulativeUSD: netCumulative,
      },
      contractorRepresentative: data.contractorRepresentative || 'Contractor Project Manager',
      qsVerifier: data.qsVerifier,
      siteEngineer: data.siteEngineer,
      projectDirector: data.projectDirector,
      financeApprover: data.financeApprover,
      paymentReferenceNumber: data.paymentReferenceNumber,
      paymentDisbursedDate: data.paymentDisbursedDate,
      remarks: data.remarks || 'Running Account bill generated and submitted for measurement verification.',
      auditTrail: [initialAudit],
      attachments: data.attachments || [],
      createdAt: now,
      updatedAt: now,
    };

    return await db.transaction(async (tx) => {
      // 1. Insert RA Bill
      await tx.insert(procurementRaBillsTable).values({
        id: newBill.id,
        billNumber: newBill.billNumber,
        workOrderId: newBill.workOrderId || null,
        workOrderNumber: newBill.workOrderNumber || null,
        projectId: newBill.projectId,
        projectName: newBill.projectName,
        contractorName: newBill.contractorName,
        contractorCode: newBill.contractorCode,
        billDate: newBill.billDate,
        billingPeriodStart: newBill.billingPeriodStart,
        billingPeriodEnd: newBill.billingPeriodEnd,
        billType: newBill.billType,
        sequenceNumber: newBill.sequenceNumber,
        isFinalBill: newBill.isFinalBill,
        status: newBill.status,
        items: newBill.items,
        financials: newBill.financials,
        contractorRepresentative: newBill.contractorRepresentative,
        qsVerifier: newBill.qsVerifier || null,
        siteEngineer: newBill.siteEngineer || null,
        projectDirector: newBill.projectDirector || null,
        financeApprover: newBill.financeApprover || null,
        paymentReferenceNumber: newBill.paymentReferenceNumber || null,
        paymentDisbursedDate: newBill.paymentDisbursedDate || null,
        remarks: newBill.remarks,
        auditTrail: newBill.auditTrail,
        attachments: newBill.attachments,
        createdAt: newBill.createdAt,
        updatedAt: newBill.updatedAt,
      } as any);

      // 2. If linked to a work order, update executedValueUSD on the work order
      if (newBill.workOrderId) {
        const woRows = await tx.select().from(procurementWorkOrdersTable).where(eq(procurementWorkOrdersTable.id, newBill.workOrderId)).limit(1);
        if (woRows.length > 0) {
          const wo = woRows[0];
          const newExec = Math.round(((wo.executedValueUSD || 0) + grossCurrent) * 100) / 100;
          await tx
            .update(procurementWorkOrdersTable)
            .set({
              executedValueUSD: newExec,
              status: newBill.isFinalBill ? 'Completed' : 'Under Execution',
            } as any)
            .where(eq(procurementWorkOrdersTable.id, newBill.workOrderId));
        }
      }

      // 3. Log Enterprise Audit Event
      await enterpriseAuditRepository.logEvent(
        {
          userName: newBill.contractorRepresentative || 'Contractor Representative',
          userRole: 'CONTRACTOR_REP',
          actionType: 'CREATE',
          entityType: 'RA_BILL',
          entityId: newBill.id,
          entityNumber: newBill.billNumber,
          fromState: 'DRAFT',
          toState: newBill.status,
          diffJson: {
            grossCurrent,
            totalDeductions,
            netCurrent,
            projectId: newBill.projectId,
            workOrderId: newBill.workOrderId,
          },
          metadata: {
            projectId: newBill.projectId,
            projectName: newBill.projectName,
            contractorName: newBill.contractorName,
            workOrderId: newBill.workOrderId,
            workOrderNumber: newBill.workOrderNumber,
            billDate: newBill.billDate,
          },
          reason: newBill.remarks || 'Running Account bill generated and submitted for measurement verification.',
        },
        tx
      );

      return newBill;
    });
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
    await ensureProcurementSeeded();
    const rows = await db.select().from(procurementRaBillsTable).where(eq(procurementRaBillsTable.id, id)).limit(1);
    if (rows.length === 0) return null;

    const existing = rows[0] as unknown as RABillRecord;
    const targetStatus = updates.status as RABillStatus;

    // 1. Payment Immutability Rule: Paid bills are frozen
    if (existing.status === 'Disbursed / Paid') {
      throw new Error('Contractual Immutability Violation: Cannot modify or change the status of a Disbursed / Paid RA Bill.');
    }

    // 2. Strict State Machine Validation
    const ALLOWED_TRANSITIONS: Record<string, string[]> = {
      'Draft': ['Submitted', 'Rejected'],
      'Submitted': ['Under Technical Scrutiny', 'Rejected', 'Draft'],
      'Under Technical Scrutiny': ['Certified by QS', 'Rejected', 'Draft'],
      'Certified by QS': ['Approved by Incharge', 'Rejected'],
      'Approved by Incharge': ['Approved by Project Director', 'Rejected'],
      'Approved by Project Director': ['Disbursed / Paid', 'Rejected'],
      'Disbursed / Paid': [], // Terminal
      'Rejected': ['Draft', 'Submitted'],
    };

    const allowedNext = ALLOWED_TRANSITIONS[existing.status] || [];
    if (!allowedNext.includes(targetStatus)) {
      throw new Error(`Invalid status transition from "${existing.status}" to "${targetStatus}". Progression must strictly follow contractual scrutiny stages.`);
    }

    // 3. Duplicate Payment / UTR Uniqueness Protection
    if (targetStatus === 'Disbursed / Paid') {
      if (!updates.paymentReferenceNumber || !updates.paymentReferenceNumber.trim()) {
        throw new Error('Bank Payment Reference / UTR Number is required to record a disbursement.');
      }
      const trimmedUtr = updates.paymentReferenceNumber.trim();
      const allBills = await db.select().from(procurementRaBillsTable);
      const duplicateUtr = allBills.find(b => b.id !== id && b.paymentReferenceNumber && b.paymentReferenceNumber.trim().toLowerCase() === trimmedUtr.toLowerCase());
      if (duplicateUtr) {
        throw new Error(`Duplicate Payment Reference: UTR "${trimmedUtr}" is already registered on bill ${duplicateUtr.billNumber}.`);
      }
    }

    const now = new Date().toISOString();

    // 4. Role and Actor Attribution for Audit Trail
    let role = 'SCRUTINY_OFFICER';
    let performedBy = 'Authorizing Officer';

    if (targetStatus === 'Certified by QS') {
      role = 'LEAD_QS';
      performedBy = updates.qsVerifier || 'Lead Quantity Surveyor';
    } else if (targetStatus === 'Approved by Incharge') {
      role = 'SITE_INCHARGE';
      performedBy = updates.siteEngineer || 'Site Incharge';
    } else if (targetStatus === 'Approved by Project Director') {
      role = 'PROJECT_DIRECTOR';
      performedBy = updates.projectDirector || 'Project Director';
    } else if (targetStatus === 'Disbursed / Paid') {
      role = 'FINANCE_ACCOUNTS';
      performedBy = updates.financeApprover || 'Finance & Accounts Officer';
    } else if (targetStatus === 'Rejected') {
      role = 'SCRUTINY_OFFICER';
      performedBy = updates.qsVerifier || updates.siteEngineer || updates.projectDirector || 'Scrutiny Officer';
    } else if (targetStatus === 'Submitted') {
      role = 'CONTRACTOR_REP';
      performedBy = existing.contractorRepresentative || 'Contractor Representative';
    }

    const auditEntry = {
      id: `audit_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      action: 'STATUS_TRANSITION',
      fromStatus: existing.status,
      toStatus: targetStatus,
      performedBy,
      role,
      timestamp: now,
      remarks: updates.remarks || `Status transitioned to ${targetStatus}`,
      paymentReferenceNumber: updates.paymentReferenceNumber,
      financialSnapshot: {
        grossWorkDoneCurrentUSD: existing.financials?.grossWorkDoneCurrentUSD || 0,
        totalDeductionsUSD: existing.financials?.totalDeductionsUSD || 0,
        netPayableCurrentUSD: existing.financials?.netPayableCurrentUSD || 0,
      },
    };

    const auditTrail = [...(existing.auditTrail || []), auditEntry];

    const updated: RABillRecord = {
      ...existing,
      status: targetStatus,
      qsVerifier: updates.qsVerifier ?? existing.qsVerifier,
      siteEngineer: updates.siteEngineer ?? existing.siteEngineer,
      projectDirector: updates.projectDirector ?? existing.projectDirector,
      financeApprover: updates.financeApprover ?? existing.financeApprover,
      paymentReferenceNumber: updates.paymentReferenceNumber ?? existing.paymentReferenceNumber,
      paymentDisbursedDate: updates.paymentDisbursedDate ?? (targetStatus === 'Disbursed / Paid' ? now.split('T')[0] : existing.paymentDisbursedDate),
      remarks: updates.remarks ? `${existing.remarks ? existing.remarks + ' | ' : ''}${updates.remarks}` : existing.remarks,
      auditTrail,
      updatedAt: now,
    };

    await db.update(procurementRaBillsTable)
      .set({
        status: updated.status,
        qsVerifier: updated.qsVerifier,
        siteEngineer: updated.siteEngineer,
        projectDirector: updated.projectDirector,
        financeApprover: updated.financeApprover,
        paymentReferenceNumber: updated.paymentReferenceNumber,
        paymentDisbursedDate: updated.paymentDisbursedDate,
        remarks: updated.remarks,
        auditTrail: updated.auditTrail,
        updatedAt: updated.updatedAt,
      } as any)
      .where(eq(procurementRaBillsTable.id, id));

    // Log Enterprise Audit Event
    await enterpriseAuditRepository.logEvent({
      userName: performedBy,
      userRole: role,
      actionType: targetStatus === 'Disbursed / Paid' ? 'DISBURSE' : targetStatus === 'Rejected' ? 'REJECT' : 'STATUS_TRANSITION',
      entityType: 'RA_BILL',
      entityId: updated.id,
      entityNumber: updated.billNumber,
      fromState: existing.status,
      toState: targetStatus,
      diffJson: {
        status: targetStatus,
        paymentReferenceNumber: updates.paymentReferenceNumber,
        remarks: updates.remarks,
      },
      metadata: {
        projectId: updated.projectId,
        projectName: updated.projectName,
        contractorName: updated.contractorName,
        workOrderId: updated.workOrderId,
        billNumber: updated.billNumber,
        grossAmount: updated.financials?.grossWorkDoneCurrentUSD,
        netPayable: updated.financials?.netPayableCurrentUSD,
      },
      reason: updates.remarks || `Status transitioned from ${existing.status} to ${targetStatus}`,
    });

    return updated;
  }

  async deleteRABill(id: string): Promise<boolean> {
    await ensureProcurementSeeded();
    const rows = await db.select().from(procurementRaBillsTable).where(eq(procurementRaBillsTable.id, id)).limit(1);
    if (rows.length > 0) {
      const existing = rows[0] as unknown as RABillRecord;
      if (existing.status === 'Disbursed / Paid') {
        throw new Error('Contractual Immutability Violation: Cannot delete a Disbursed / Paid RA Bill.');
      }
      if (existing.status === 'Approved by Project Director' || existing.status === 'Approved by Incharge') {
        throw new Error('Cannot delete an approved RA Bill without prior administrative revocation.');
      }
    }
    await db.delete(procurementRaBillsTable).where(eq(procurementRaBillsTable.id, id));
    return true;
  }
}

export const procurementRepository = new ProcurementRepository();

