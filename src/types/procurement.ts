// Enterprise Procurement, BOQ, Tender & Vendor Management Types

export type VendorCategory = 
  | 'Civil & Structural Materials'
  | 'Mechanical & Piping Components'
  | 'Electrical & Instrumentation'
  | 'Heavy Equipment & Rental'
  | 'Subcontracting Services'
  | 'Safety & Consumables'
  | 'Fuel & Lubricants';

export type VendorStatus = 'Approved' | 'Pending Audit' | 'Suspended' | 'Blacklisted';

export interface VendorContactPerson {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
}

export interface VendorBankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
}

export interface VendorDocument {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  fileUrl?: string;
}

export interface VendorPerformanceHistory {
  totalOrders: number;
  onTimeDeliveryRate: number; // percentage
  qualityComplianceRate: number; // percentage
  lastEvaluatedDate: string;
  remarks: string;
}

export interface Vendor {
  id: string;
  vendorCode: string;
  name: string;
  category: VendorCategory;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPersons: VendorContactPerson[];
  bankDetails: VendorBankDetails;
  paymentTerms: string;
  creditPeriodDays: number;
  rating: number; // 1 - 5
  status: VendorStatus;
  documents: VendorDocument[];
  performance: VendorPerformanceHistory;
  createdAt: string;
}

// RFQ & Enquiry Types
export interface RFQItem {
  id: string;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  estimatedUnitPriceUSD: number;
}

export interface RFQ {
  id: string;
  rfqCode: string;
  title: string;
  projectId: string;
  projectName: string;
  invitedVendorIds: string[];
  invitedVendorNames: string[];
  dueDate: string;
  items: RFQItem[];
  status: 'Draft' | 'Published' | 'Under Evaluation' | 'Awarded' | 'Cancelled';
  approvalStatus: 'Pending Verification' | 'Approved for Release' | 'Rejected';
  attachments: string[];
  createdDate: string;
  createdByName: string;
}

// Vendor Quotation Types
export interface QuotationItemRate {
  rfqItemId: string;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  unitRateUSD: number;
  gstPercent: number;
  discountPercent: number;
  totalAmountUSD: number;
}

export interface VendorQuotation {
  id: string;
  quotationNo: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  submittedDate: string;
  items: QuotationItemRate[];
  subtotalUSD: number;
  taxUSD: number;
  freightUSD: number;
  netTotalUSD: number;
  leadTimeDays: number;
  warrantyMonths: number;
  deliverySchedule: string;
  technicalCompliance: 'Compliant' | 'Deviated' | 'Non-Compliant';
  technicalRemarks: string;
  commercialCompliance: 'Fully Accepted' | 'Conditional' | 'Rejected';
  commercialRemarks: string;
  isL1Bidder?: boolean;
}

// Purchase Requisition Types
export type PRStatus = 'Draft' | 'Submitted' | 'Verified' | 'Approved' | 'Rejected' | 'Cancelled';

export interface PRItem {
  id: string;
  itemCode: string;
  description: string;
  unit: string;
  requisitionQty: number;
  availableStockQty: number;
  estimatedRateUSD: number;
  totalEstimatedUSD: number;
  storeLocation: string;
}

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  projectId: string;
  projectName: string;
  siteName: string;
  requestedByName: string;
  department: string;
  urgency: 'Normal' | 'Urgent' | 'Emergency';
  status: PRStatus;
  createdDate: string;
  requiredByDate: string;
  budgetAllocatedUSD: number;
  items: PRItem[];
  remarks: string;
  verifiedByName?: string;
  approvedByName?: string;
}

// Purchase Order Types
export type POStatus = 'Draft' | 'Submitted' | 'Approved' | 'Issued' | 'Partially Received' | 'Completed' | 'Cancelled';

export interface POItem {
  id: string;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number; // Ordered Quantity
  receivedQuantity?: number; // Cumulative Received Quantity
  acceptedQuantity?: number; // Cumulative Accepted Quantity
  rejectedQuantity?: number; // Cumulative Rejected Quantity
  returnedQuantity?: number; // Cumulative Returned Quantity
  balanceQuantity?: number; // Remaining Receivable Quantity
  unitPriceUSD: number;
  gstPercent: number;
  discountPercent: number;
  totalAmountUSD: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  prId?: string;
  rfqId?: string;
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  vendorGstin: string;
  projectId: string;
  projectName: string;
  siteAddress: string;
  poDate: string;
  deliveryDueDate: string;
  paymentTerms: string;
  freightTerms: string;
  subtotalUSD: number;
  discountUSD: number;
  gstUSD: number;
  freightUSD: number;
  netAmountUSD: number;
  status: POStatus;
  approvalStatus: 'Pending Approval' | 'Approved' | 'Rejected';
  items: POItem[];
  termsAndConditions: string;
  issuedByName: string;
  approvedByName?: string;
}

// Goods Receipt Note (GRN) Types
export interface GRNItem {
  id: string;
  poItemId: string;
  itemCode: string;
  description: string;
  unit: string;
  poQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  returnedQty: number;
  remarks: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectName: string;
  warehouseName: string;
  receivedDate: string;
  challanNo: string;
  challanDate: string;
  inspectedByName: string;
  qualityStatus: 'Passed' | 'Passed with Partial Rejection' | 'Failed Quality Audit';
  items: GRNItem[];
  stockUpdated: boolean;
  remarks: string;
}

// Work Order Types
export type WorkOrderCategory = 
  | 'Mechanical Work Order'
  | 'Civil Work Order'
  | 'Electrical Work Order'
  | 'Subcontract Work Order'
  | 'Client Work Order';

export type WOExecutionStatus = 'Draft' | 'Active' | 'Under Execution' | 'Completed' | 'Closed' | 'Cancelled';

export interface WOVariationOrder {
  id: string;
  variationCode: string;
  title: string;
  description: string;
  amountChangeUSD: number;
  status: 'Proposed' | 'Approved' | 'Rejected';
  approvedDate?: string;
}

export interface WOCompletionCertificate {
  certificateNo: string;
  completionDate: string;
  certifiedValueUSD: number;
  retainageAmountUSD: number;
  certifiedByName: string;
  status: 'Issued' | 'Under Audit' | 'Released';
}

export interface SubcontractWorkOrder {
  id: string;
  woNumber: string;
  title: string;
  category: WorkOrderCategory;
  projectId: string;
  projectName: string;
  contractorName: string;
  contractorCode: string;
  startDate: string;
  targetCompletionDate: string;
  contractValueUSD: number;
  revisedValueUSD: number;
  executedValueUSD: number;
  status: WOExecutionStatus;
  scopeOfWork: string;
  attachments: string[];
  variations: WOVariationOrder[];
  completionCertificate?: WOCompletionCertificate;
}

// BOQ Types
export interface BOQItem {
  id: string;
  itemCode: string;
  projectId: string;
  projectName: string;
  category: 'Civil & Foundation' | 'Structural Fabrication' | 'Piping & Plumbing' | 'Mechanical & HVAC' | 'Electrical & Instrumentation';
  description: string;
  unit: string;
  quantity: number; // Tendered Qty
  rateUSD: number;
  sanctionedAmountUSD: number;
  executedQuantity: number;
  balanceQuantity: number; // quantity - executedQuantity
  variationQuantity: number; // excess executed beyond original tendered
  runningQuantity: number;
  executedAmountUSD: number;
  progressPercent: number;
}

// Measurement Book (MB) Types
export type MBStatus = 'Draft' | 'Recorded' | 'Verified' | 'Approved' | 'Verified by Site Incharge' | 'Approved by Project Manager' | 'Rejected';

export interface MeasurementEntry {
  id: string;
  mbNumber: string;
  entryDate?: string;
  measurementDate?: string;
  projectId: string;
  projectName: string;
  boqItemId: string;
  boqItemCode: string;
  boqDescription?: string;
  contractorName?: string;
  chainageLocation?: string;
  locationChainage?: string;
  lengthMeters: number;
  breadthMeters: number;
  depthMeters?: number;
  heightMeters?: number;
  calculatedQuantity?: number;
  quantity?: number;
  unit: string;
  valuationUSD?: number;
  status: MBStatus;
  recordedByName: string;
  verifiedByName?: string;
  approvedByName?: string;
  remarks: string;
}

export type MeasurementBookEntry = MeasurementEntry;

// Tender Management Types
export type TenderStatus = 'Draft' | 'Bidding Open' | 'Technical Evaluation' | 'Financial Evaluation' | 'Awarded' | 'Awarded (L1)' | 'Bid Submitted' | 'Under Evaluation' | 'Lost' | 'Cancelled';

export interface BidSubmission {
  technicalBidStatus: 'Submitted' | 'Under Review' | 'Qualified' | 'Disqualified';
  financialBidAmountUSD: number;
  submissionDate: string;
  validityDays: number;
}

export interface TenderAwardDetails {
  awardeeName: string;
  awardValueUSD: number;
  loiDate: string;
  agreementDate: string;
  commencementDate: string;
}

export interface TenderRecord {
  id: string;
  tenderNo?: string;
  tenderNumber?: string;
  title: string;
  clientAuthority?: string;
  authorityName?: string;
  category: string;
  estimatedValueUSD: number;
  emdAmountUSD: number;
  emdInstrument: string;
  publishDate?: string;
  submissionDueDate: string;
  eligibilityCriteria: string;
  tenderStatus?: TenderStatus;
  status?: TenderStatus;
  isAwarded?: boolean;
  technicalBidSubmitted?: boolean;
  financialBidSubmitted?: boolean;
  quotedAmountUSD?: number;
  bidSubmission?: BidSubmission;
  awardDetails?: TenderAwardDetails;
  tenderDocumentsUrl?: string[];
}

export type Tender = TenderRecord;

// Project Cost Control Types
export interface ProjectCostControl {
  projectId: string;
  projectName: string;
  totalBudgetUSD: number;
  purchaseCostUSD: number;
  materialCostUSD: number;
  labourCostUSD: number;
  equipmentCostUSD: number;
  vehicleCostUSD: number;
  runningCostUSD: number;
  totalSpentUSD: number;
  committedPOUSD: number;
  remainingBudgetUSD: number;
  costVarianceUSD: number; // Budget - (Total Spent + Committed)
  variancePercent: number;
  costStatus: 'Under Budget' | 'Optimal' | 'Over Budget Warning' | 'Budget Exceeded';
}

// Enterprise Material Request & Approval Engine Types
export type MaterialRequestStatus = 
  | 'Draft'
  | 'Submitted'
  | 'Pending Incharge'
  | 'Pending Manager'
  | 'Approved'
  | 'Rejected'
  | 'Clarification Requested'
  | 'Partially Received'
  | 'Completed'
  | 'Cancelled';

export type MaterialRequestPriority = 'Normal' | 'Urgent' | 'Emergency';

export interface MaterialRequestItem {
  id: string;
  slNo: number;
  materialId?: string;
  itemCode?: string;
  itemDescription: string;
  sizeSpecification: string;
  manufacturer: string;
  quantity: number;
  receivedQuantity: number;
  unit: string;
  boqRef?: string;
  isBoqLinked?: boolean;
  remarks?: string;
}

export interface ApprovalStepHistory {
  id: string;
  step: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: 'Submitted' | 'Approved' | 'Rejected' | 'Sent Back' | 'Clarification Requested' | 'Receipt Recorded' | 'Cancelled';
  remarks: string;
  timestamp: string;
}

export interface MaterialReceiptRecord {
  id: string;
  receivedDate: string;
  deliveryProjectId: string;
  deliveryProjectName: string;
  storeId: string;
  storeName: string;
  receiverName: string;
  vehicleNumber: string;
  deliveryNoteNumber: string;
  items: Array<{
    itemId: string;
    itemDescription: string;
    receivedQty: number;
    unit: string;
  }>;
  remarks?: string;
  createdAt: string;
}

export interface MaterialRequestAttachment {
  id: string;
  name: string;
  fileType: 'PDF' | 'IMAGE' | 'DRAWING' | 'SPECIFICATION' | 'QUOTATION' | 'OTHER';
  fileUrl: string;
  sizeBytes?: number;
  uploadedByUserId: string;
  uploadedByUserName: string;
  uploadedAt: string;
}

export interface ProcurementWorkflowStep {
  stepOrder: number;
  role: string; // e.g. 'SUPERVISOR', 'QA', 'INCHARGE', 'MANAGER', 'STORE'
  label: string; // e.g. 'QA Engineer Review'
  isRequired: boolean;
}

export interface ProcurementWorkflowConfig {
  id: string;
  projectId: string;
  projectName: string;
  workflowName: string;
  steps: ProcurementWorkflowStep[];
  isActive: boolean;
  updatedAt: string;
}

export interface InAppNotification {
  id: string;
  recipientUserId: string;
  recipientRole?: string;
  title: string;
  message: string;
  type: 'NEW_REQUEST' | 'APPROVAL_PENDING' | 'APPROVED' | 'REJECTED' | 'CLARIFICATION' | 'MATERIAL_RECEIVED';
  referenceId: string; // e.g. material request id
  referenceNo: string; // e.g. MR-20260809-001
  isRead: boolean;
  createdAt: string;
}

export interface ProcurementAuditLog {
  id: string;
  entityType: 'MATERIAL_REQUEST' | 'WORKFLOW_CONFIG' | 'STORE_RECEIPT' | 'NOTIFICATION';
  entityId: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  remarks?: string;
  metadataJson?: any;
  timestamp: string;
}

export interface MaterialStockTransaction {
  id: string;
  materialRequestId?: string;
  requestNo?: string;
  projectId: string;
  projectName: string;
  storeId: string;
  storeName: string;
  materialId?: string;
  itemDescription: string;
  transactionType: 'IN_RECEIPT' | 'OUT_ISSUE' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  unit: string;
  deliveryNoteNo?: string;
  performedBy: string;
  timestamp: string;
}

export interface MaterialLedgerEntry {
  id: string;
  materialRequestId: string;
  requestNo: string;
  projectId: string;
  itemDescription: string;
  stage: 'REQUESTED' | 'APPROVED' | 'RECEIVED' | 'STORE_STOCKED';
  requestedQty: number;
  approvedQty: number;
  receivedQty: number;
  balanceQty: number;
  unit: string;
  updatedAt: string;
}

export interface MaterialRequest {
  id: string;
  requestNo: string;
  requestDate: string;
  requestedByUserId: string;
  requestedByUserName: string;
  reportsToUserId?: string;
  reportsToUserName?: string;
  employeeId: string;
  designation: string;
  department: string;
  company: string;
  branch: string;
  projectId: string;
  projectName: string;
  siteName: string;
  unloadingPoint: string;
  contactNumber: string;
  requiredDate: string;
  priority: MaterialRequestPriority;
  remarks: string;
  status: MaterialRequestStatus;
  currentApproverRole: string;
  currentApproverId?: string;
  currentApproverName?: string;
  currentStepIndex?: number;
  workflowSteps?: ProcurementWorkflowStep[];
  items: MaterialRequestItem[];
  approvalHistory: ApprovalStepHistory[];
  receipts?: MaterialReceiptRecord[];
  attachments?: MaterialRequestAttachment[];
  createdAt: string;
  updatedAt: string;
}

// ====================================================
// PHASE 56: ENTERPRISE PROCUREMENT TYPES
// ====================================================

export interface Phase56PRItem {
  id: string;
  prId: string;
  materialId?: string;
  boqItemId: string;
  wbsId: string;
  boqItemCode: string;
  wbsCode: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  estimatedTotalPrice: number;
  specification?: string;
  requiredDate?: string;
  boqRef?: string;
  remarks?: string;
  createdAt: string;
}

export interface Phase56PR {
  id: string;
  prNumber: string;
  projectId?: string;
  projectName?: string;
  wbsCode?: string;
  department?: string;
  requestedBy: string;
  requiredDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  totalAmount: number;
  currency: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CLOSED';
  approvalStep?: string;
  currentApprover?: string;
  notes?: string;
  items?: Phase56PRItem[];
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Phase56RFQItem {
  id: string;
  rfqId: string;
  prItemId?: string;
  boqItemId: string;
  wbsId: string;
  boqItemCode: string;
  wbsCode: string;
  materialId?: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
  specification?: string;
  createdAt: string;
}

export interface Phase56RFQ {
  id: string;
  rfqNumber: string;
  prId?: string;
  prNumber?: string;
  title: string;
  projectId?: string;
  projectName?: string;
  issuedDate: string;
  submissionDeadline: string;
  issuedBy: string;
  status: 'DRAFT' | 'ISSUED' | 'QUOTATIONS_RECEIVED' | 'EVALUATING' | 'CLOSED' | 'CANCELLED';
  termsAndConditions?: string;
  notes?: string;
  items?: Phase56RFQItem[];
  vendorIds?: string[];
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicalEvaluationRecord {
  id: string;
  evaluationNumber: string;
  rfqId: string;
  quotationId: string;
  vendorId: string;
  vendorName: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluationDate: string;
  specificationComplianceScore: number;
  qualityScore: number;
  deliveryLeadTimeScore: number;
  overallTechnicalScore: number;
  recommendation: 'QUALIFIED' | 'CONDITIONALLY_QUALIFIED' | 'REJECTED';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommercialEvaluationRecord {
  id: string;
  evaluationNumber: string;
  rfqId: string;
  quotationId: string;
  vendorId: string;
  vendorName: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluationDate: string;
  unitPriceScore: number;
  paymentTermsScore: number;
  totalValueScore: number;
  overallCommercialScore: number;
  recommendation: 'QUALIFIED' | 'HIGH_PRICE' | 'REJECTED';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComparativeStatementRecord {
  id: string;
  statementNumber: string;
  rfqId: string;
  rfqNumber: string;
  projectId?: string;
  projectName?: string;
  preparedBy: string;
  preparedDate: string;
  recommendedVendorId?: string;
  recommendedVendorName?: string;
  recommendedQuotationId?: string;
  justification?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryScheduleRecord {
  id: string;
  poId: string;
  poNumber: string;
  poItemId?: string;
  materialName: string;
  scheduledDate: string;
  scheduledQty: number;
  deliveredQty: number;
  balanceQty: number;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'PARTIALLY_DELIVERED' | 'DELIVERED' | 'DELAYED';
  destinationWarehouseId?: string;
  destinationWarehouseName?: string;
  carrierName?: string;
  trackingNumber?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorPerformanceRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  poId?: string;
  poNumber?: string;
  evaluationPeriod?: string;
  qualityRating: number;
  deliveryTimelinessRating: number;
  commercialCompetitivenessRating: number;
  overallRating: number;
  evaluatorName: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAllocationRecord {
  id: string;
  projectId: string;
  projectName: string;
  costCenterCode: string;
  allocatedAmount: number;
  committedAmount: number;
  actualSpentAmount: number;
  availableAmount: number;
  fiscalYear: string;
  status: 'ACTIVE' | 'EXHAUSTED' | 'FROZEN';
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  entityNumber: string;
  actionType: string;
  performedBy: string;
  details: string;
  createdAt: string;
}

// ====================================================
// PHASE 77 / P2.0: CONTRACTOR RUNNING ACCOUNT (RA) BILLING & PAYMENT CERTIFICATION ENGINE
// ====================================================

export type RABillStatus = 
  | 'Draft'
  | 'Submitted'
  | 'Under Technical Scrutiny'
  | 'Certified by QS'
  | 'Approved by Incharge'
  | 'Approved by Project Director'
  | 'Disbursed / Paid'
  | 'Rejected';

export type RABillType = 
  | 'Progress / Running Account (RA)'
  | 'Advance / Mobilization Bill'
  | 'Final Bill'
  | 'Retention Release Bill';

export interface RABillItem {
  id: string;
  boqItemId: string;
  itemCode: string;
  description: string;
  unit: string;
  boqQuantity: number;
  boqRateUSD: number;
  previousCumulativeQty: number;
  currentMeasuredQty: number;
  totalCumulativeQty: number;
  currentAmountUSD: number;
  cumulativeAmountUSD: number;
  mbReference?: string;
  measurementEntryId?: string;
  measurementEntryIds?: string[];
}

export interface BillableMeasurementEntry {
  id: string;
  mbNumber: string;
  entryDate?: string;
  measurementDate?: string;
  projectId: string;
  projectName?: string;
  boqItemId: string;
  boqItemCode?: string;
  boqDescription?: string;
  contractorName?: string;
  locationChainage?: string;
  approvedQuantity: number;
  unit?: string;
  rateUSD: number;
  previouslyBilledQty: number;
  remainingBillableQty: number;
  status: string;
}

export interface RABillDeductions {
  grossWorkDoneCurrentUSD: number;
  grossWorkDoneCumulativeUSD: number;
  previousCertifiedGrossUSD: number;
  mobilizationAdvanceRecoveryRatePercent: number;
  mobilizationAdvanceRecoveryUSD: number;
  retentionMoneyRatePercent: number;
  retentionMoneyWithheldUSD: number;
  materialAdvanceRecoveryUSD: number;
  statutoryTdsPercent: number;
  statutoryTdsUSD: number;
  statutoryGstTdsPercent: number;
  statutoryGstTdsUSD: number;
  laborWelfareCessPercent: number;
  laborWelfareCessUSD: number;
  liquidatedDamagesOrPenaltyUSD: number;
  otherWithholdingsUSD: number;
  totalDeductionsUSD: number;
  netPayableCurrentUSD: number;
  netPayableCumulativeUSD: number;
}

export interface RABillAuditEntry {
  id: string;
  action: string;
  fromStatus: RABillStatus | 'None';
  toStatus: RABillStatus;
  performedBy: string;
  role: string;
  timestamp: string;
  remarks?: string;
  paymentReferenceNumber?: string;
  financialSnapshot?: {
    grossWorkDoneCurrentUSD: number;
    totalDeductionsUSD: number;
    netPayableCurrentUSD: number;
  };
}

export interface RABillRecord {
  id: string;
  billNumber: string; // e.g. RA-BILL-2026-001
  workOrderId?: string;
  workOrderNumber?: string;
  projectId: string;
  projectName: string;
  contractorName: string;
  contractorCode: string;
  billDate: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  billType: RABillType;
  sequenceNumber: number; // e.g. 1 for RA-01, 2 for RA-02
  isFinalBill: boolean;
  status: RABillStatus;
  items: RABillItem[];
  financials: RABillDeductions;
  contractorRepresentative?: string;
  qsVerifier?: string;
  siteEngineer?: string;
  projectDirector?: string;
  financeApprover?: string;
  paymentReferenceNumber?: string;
  paymentDisbursedDate?: string;
  remarks?: string;
  auditTrail?: RABillAuditEntry[];
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
}


