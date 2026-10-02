import { z } from 'zod';

export const createPrSchema = z.object({
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  wbsCode: z.string().optional(),
  department: z.string().optional(),
  requestedBy: z.string().min(1, 'Requested by is required'),
  requiredDate: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  totalAmount: z.number().nonnegative().optional().default(0),
  currency: z.string().default('AED'),
  notes: z.string().optional(),
  items: z.array(z.object({
    materialId: z.string().optional(),
    materialCode: z.string().min(1, 'Material code required'),
    materialName: z.string().min(1, 'Material name required'),
    quantity: z.number().positive('Quantity must be greater than zero'),
    unit: z.string().default('PCS'),
    estimatedUnitPrice: z.number().nonnegative().optional().default(0),
    specification: z.string().optional(),
    requiredDate: z.string().optional(),
    boqRef: z.string().optional(),
    remarks: z.string().optional(),
  })).min(1, 'At least one item is required'),
});

export const approvePrSchema = z.object({
  prId: z.string().min(1, 'PR ID is required'),
  approverId: z.string().min(1, 'Approver ID is required'),
  approverName: z.string().min(1, 'Approver Name is required'),
  action: z.enum(['APPROVE', 'REJECT']),
  comments: z.string().optional(),
});

export const createRfqSchema = z.object({
  prId: z.string().optional(),
  prNumber: z.string().optional(),
  title: z.string().min(1, 'RFQ Title is required'),
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  submissionDeadline: z.string().min(1, 'Submission deadline is required'),
  issuedBy: z.string().min(1, 'Issued by is required'),
  termsAndConditions: z.string().optional(),
  notes: z.string().optional(),
  vendorIds: z.array(z.string()).optional(),
  items: z.array(z.object({
    prItemId: z.string().optional(),
    materialId: z.string().optional(),
    materialCode: z.string().min(1),
    materialName: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().default('PCS'),
    specification: z.string().optional(),
  })).min(1, 'At least one item is required'),
});

export const createVendorQuotationSchema = z.object({
  rfqId: z.string().min(1, 'RFQ ID is required'),
  rfqNumber: z.string().min(1, 'RFQ Number is required'),
  vendorId: z.string().min(1, 'Vendor ID is required'),
  vendorName: z.string().min(1, 'Vendor Name is required'),
  quotationDate: z.string().min(1, 'Quotation Date is required'),
  validUntil: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryLeadTimeDays: z.number().nonnegative().optional().default(0),
  subtotal: z.number().nonnegative().optional().default(0),
  taxAmount: z.number().nonnegative().optional().default(0),
  discountAmount: z.number().nonnegative().optional().default(0),
  totalAmount: z.number().nonnegative('Total amount must be positive'),
  currency: z.string().default('AED'),
  notes: z.string().optional(),
  items: z.array(z.object({
    rfqItemId: z.string().optional(),
    materialId: z.string().optional(),
    materialCode: z.string().min(1),
    materialName: z.string().min(1),
    offeredQuantity: z.number().positive(),
    unitPrice: z.number().nonnegative(),
    totalPrice: z.number().nonnegative(),
    brandModel: z.string().optional(),
    countryOfOrigin: z.string().optional(),
    complianceRemarks: z.string().optional(),
  })).min(1, 'At least one quotation item is required'),
});

export const createTechnicalEvaluationSchema = z.object({
  rfqId: z.string().min(1),
  quotationId: z.string().min(1),
  vendorId: z.string().min(1),
  vendorName: z.string().min(1),
  evaluatorId: z.string().min(1),
  evaluatorName: z.string().min(1),
  specificationComplianceScore: z.number().min(0).max(100),
  qualityScore: z.number().min(0).max(100),
  deliveryLeadTimeScore: z.number().min(0).max(100),
  recommendation: z.enum(['QUALIFIED', 'CONDITIONALLY_QUALIFIED', 'REJECTED']).default('QUALIFIED'),
  remarks: z.string().optional(),
});

export const createCommercialEvaluationSchema = z.object({
  rfqId: z.string().min(1),
  quotationId: z.string().min(1),
  vendorId: z.string().min(1),
  vendorName: z.string().min(1),
  evaluatorId: z.string().min(1),
  evaluatorName: z.string().min(1),
  unitPriceScore: z.number().min(0).max(100),
  paymentTermsScore: z.number().min(0).max(100),
  totalValueScore: z.number().min(0).max(100),
  recommendation: z.enum(['QUALIFIED', 'HIGH_PRICE', 'REJECTED']).default('QUALIFIED'),
  remarks: z.string().optional(),
});

export const createComparativeStatementSchema = z.object({
  rfqId: z.string().min(1),
  rfqNumber: z.string().min(1),
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  preparedBy: z.string().min(1),
  recommendedVendorId: z.string().optional(),
  recommendedVendorName: z.string().optional(),
  recommendedQuotationId: z.string().optional(),
  justification: z.string().optional(),
});

export const createPoSchema = z.object({
  prId: z.string().optional(),
  prNumber: z.string().optional(),
  rfqId: z.string().optional(),
  quotationId: z.string().optional(),
  vendorId: z.string().min(1, 'Vendor ID is required'),
  vendorName: z.string().min(1, 'Vendor Name is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  projectName: z.string().min(1, 'Project Name is required'),
  warehouseId: z.string().optional(),
  warehouseName: z.string().optional(),
  poDate: z.string().min(1, 'PO Date is required'),
  expectedDeliveryDate: z.string().optional(),
  paymentTerms: z.string().optional(),
  incoterms: z.string().optional(),
  currency: z.string().trim().min(3, 'Currency code is required'),
  subtotal: z.number().nonnegative().optional().default(0),
  taxAmount: z.number().nonnegative().optional().default(0),
  discountAmount: z.number().nonnegative().optional().default(0),
  totalAmount: z.number().positive('Total amount must be greater than zero'),
  notes: z.string().optional(),
  items: z.array(z.object({
    materialId: z.string().optional(),
    materialCode: z.string().min(1),
    materialName: z.string().min(1),
    orderedQty: z.number().positive(),
    unitPrice: z.number().nonnegative(),
    totalPrice: z.number().nonnegative(),
    unit: z.string().default('PCS'),
    specification: z.string().optional(),
    boqRef: z.string().optional(),
    remarks: z.string().optional(),
  })).min(1, 'At least one PO item is required'),
});

export const revisePoSchema = z.object({
  poId: z.string().min(1),
  reasonForRevision: z.string().min(1, 'Reason for revision is required'),
  revisedBy: z.string().min(1, 'Revised by is required'),
  newTotalAmount: z.number().nonnegative(),
  changesSummary: z.string().optional(),
});

export const createDeliveryScheduleSchema = z.object({
  poId: z.string().min(1),
  poNumber: z.string().min(1),
  poItemId: z.string().optional(),
  materialName: z.string().min(1),
  scheduledDate: z.string().min(1),
  scheduledQty: z.number().positive(),
  destinationWarehouseId: z.string().optional(),
  destinationWarehouseName: z.string().optional(),
  carrierName: z.string().optional(),
  trackingNumber: z.string().optional(),
  remarks: z.string().optional(),
});

export const createVendorPerformanceSchema = z.object({
  vendorId: z.string().min(1),
  vendorName: z.string().min(1),
  poId: z.string().optional(),
  poNumber: z.string().optional(),
  evaluationPeriod: z.string().optional(),
  qualityRating: z.number().min(1).max(5),
  deliveryTimelinessRating: z.number().min(1).max(5),
  commercialCompetitivenessRating: z.number().min(1).max(5),
  evaluatorName: z.string().min(1),
  comments: z.string().optional(),
});

export const createBudgetAllocationSchema = z.object({
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  costCenterCode: z.string().min(1),
  allocatedAmount: z.number().positive(),
  fiscalYear: z.string().min(1),
});
