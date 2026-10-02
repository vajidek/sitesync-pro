import { z } from 'zod';

export const createVendorSchema = z.object({
  name: z.string().min(2, 'Vendor name must be at least 2 characters'),
  category: z.string().default('General Supplier'),
  classification: z.enum(['APPROVED', 'PREFERRED', 'BLOCKED', 'BLACKLISTED', 'UNDER_REVIEW']).default('APPROVED'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL']).default('ACTIVE'),
  tradeLicenseNo: z.string().optional(),
  tradeLicenseExpiry: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  msmeRegNo: z.string().optional(),
  isoCertified: z.boolean().default(false),
  paymentTerms: z.string().default('NET_30'),
  creditPeriodDays: z.number().default(30),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('LOW'),
  insuranceExpiry: z.string().optional(),
  notes: z.string().optional(),
  contacts: z.array(z.object({
    contactName: z.string(),
    designation: z.string().optional(),
    email: z.string().email(),
    phone: z.string(),
    isPrimary: z.boolean().default(false),
  })).optional(),
  addresses: z.array(z.object({
    addressType: z.enum(['OFFICE', 'WAREHOUSE', 'BILLING', 'SHIPPING']).default('OFFICE'),
    streetAddress: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string().default('UAE'),
    pincode: z.string().optional(),
  })).optional(),
  bankAccounts: z.array(z.object({
    bankName: z.string(),
    branchName: z.string().optional(),
    accountNumber: z.string(),
    accountHolderName: z.string(),
    ifscCode: z.string().optional(),
    swiftCode: z.string().optional(),
    iban: z.string().optional(),
    isPrimary: z.boolean().default(true),
  })).optional(),
});

export const updateVendorStatusSchema = z.object({
  vendorId: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL']).optional(),
  classification: z.enum(['APPROVED', 'PREFERRED', 'BLOCKED', 'BLACKLISTED', 'UNDER_REVIEW']).optional(),
  avlStatus: z.enum(['APPROVED', 'PROVISIONAL', 'NOT_APPROVED']).optional(),
  comments: z.string().optional(),
});

export const rateVendorSchema = z.object({
  vendorId: z.string(),
  ratingPeriod: z.string(),
  qualityRating: z.number().min(1).max(5),
  deliveryRating: z.number().min(1).max(5),
  priceCompetitiveness: z.number().min(1).max(5),
  safetyRating: z.number().min(1).max(5),
  evaluatorName: z.string(),
  comments: z.string().optional(),
});

export const blacklistVendorSchema = z.object({
  vendorId: z.string(),
  reason: z.string().min(5, 'Reason is required for blacklisting'),
  durationMonths: z.number().default(12),
  blacklistedBy: z.string(),
});

export const createContractSchema = z.object({
  title: z.string().min(3, 'Contract title is required'),
  contractType: z.enum([
    'SUPPLY', 'SERVICE', 'LABOUR', 'AMC', 'CONSULTANCY', 
    'MECHANICAL', 'ELECTRICAL', 'CIVIL', 'PIPELINE', 'INSTRUMENTATION', 'AUTOMATION'
  ]).default('SUPPLY'),
  vendorId: z.string(),
  vendorName: z.string(),
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  packageId: z.string().optional(),
  wbsCode: z.string().optional(),
  department: z.string().default('Contracts'),
  contractValue: z.number().min(0),
  currency: z.string().trim().min(3, 'Currency is required'),
  startDate: z.string(),
  endDate: z.string(),
  retentionPercent: z.number().min(0).max(100).optional(),
  securityDepositAmount: z.number().default(0),
  performanceGuaranteeAmount: z.number().default(0),
  ldPercentPerWeek: z.number().min(0).optional(),
  maxLdCapPercent: z.number().min(0).optional(),
  companyId: z.string().optional(),
  branchId: z.string().optional(),
  projectCode: z.string().optional(),
  companyCode: z.string().optional(),
  branchCode: z.string().optional(),
  termsAndConditions: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    materialOrServiceCode: z.string(),
    description: z.string(),
    quantity: z.number(),
    unit: z.string().default('PCS'),
    rate: z.number(),
    totalAmount: z.number(),
    boqRef: z.string().optional(),
    wbsRef: z.string().optional(),
  })).optional(),
});

export const approveContractSchema = z.object({
  contractId: z.string(),
  action: z.enum(['APPROVE', 'REJECT', 'REVISE']),
  approverId: z.string(),
  approverName: z.string(),
  comments: z.string().optional(),
});

const changeEvidenceSchema = z.object({
  documentId: z.string().min(1),
  evidenceType: z.enum(['NOTICE', 'DRAWING', 'INSTRUCTION', 'SITE_RECORD', 'PHOTO', 'MEASUREMENT', 'CORRESPONDENCE', 'OTHER']),
  notes: z.string().optional(),
});

export const createContractVariationSchema = z.object({
  contractId: z.string().min(1),
  projectId: z.string().optional(),
  wbsId: z.string().optional(),
  boqItemId: z.string().optional(),
  costCodeId: z.string().optional(),
  companyId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  variationType: z.enum(['ADDITION', 'OMISSION', 'SCOPE_CHANGE', 'PRICE_REVISION']).default('ADDITION'),
  amount: z.number().finite().nonnegative(),
  claimedAmount: z.number().finite().nonnegative().optional(),
  timeExtensionDays: z.number().int().nonnegative().default(0),
  claimedTimeExtensionDays: z.number().int().nonnegative().optional(),
  noticeDate: z.string().optional(),
  eventDate: z.string().optional(),
  changeEventReference: z.string().optional(),
  clientReference: z.string().optional(),
  justification: z.string().optional(),
  evidenceDocuments: z.array(changeEvidenceSchema).default([]),
});

export const createContractPaymentSchema = z.object({
  contractId: z.string(),
  billingPeriod: z.string(),
  grossAmount: z.number(),
  retentionDeducted: z.number().default(0),
  advanceAdjusted: z.number().default(0),
  penaltyDeducted: z.number().default(0),
  certifiedBy: z.string().optional(),
});

export const createContractExtensionSchema = z.object({
  contractId: z.string().min(1),
  projectId: z.string().optional(),
  wbsId: z.string().optional(),
  companyId: z.string().optional(),
  extensionDays: z.number().int().min(1),
  newEndDate: z.string().min(1),
  originalEndDate: z.string().optional(),
  causeType: z.string().optional(),
  changeEventReference: z.string().optional(),
  noticeDate: z.string().optional(),
  eventDate: z.string().optional(),
  reason: z.string().min(1),
  evidenceDocuments: z.array(changeEvidenceSchema).default([]),
});


export const createContractClaimSchema = z.object({
  contractId: z.string().min(1),
  projectId: z.string().optional(),
  wbsId: z.string().optional(),
  boqItemId: z.string().optional(),
  costCodeId: z.string().optional(),
  companyId: z.string().optional(),
  claimType: z.enum(['DELAY', 'DISRUPTION', 'COST', 'TIME', 'TIME_AND_COST', 'OTHER']),
  title: z.string().min(1),
  description: z.string().min(1),
  eventDate: z.string().optional(),
  noticeDate: z.string().optional(),
  claimedAmount: z.number().finite().nonnegative().default(0),
  claimedDays: z.number().int().nonnegative().default(0),
  clientReference: z.string().optional(),
  changeEventReference: z.string().optional(),
  evidenceDocuments: z.array(changeEvidenceSchema).default([]),
});

export const updateContractClaimStatusSchema = z.object({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SETTLED', 'CLOSED']),
  approvedAmount: z.number().finite().nonnegative().optional(),
  approvedDays: z.number().int().nonnegative().optional(),
  rejectionReason: z.string().optional(),
});

export const linkContractChangeEvidenceSchema = z.object({
  contractId: z.string().min(1),
  entityType: z.enum(['VARIATION', 'EXTENSION', 'CLAIM']),
  entityId: z.string().min(1),
  documentId: z.string().min(1),
  evidenceType: z.enum(['NOTICE', 'DRAWING', 'INSTRUCTION', 'SITE_RECORD', 'PHOTO', 'MEASUREMENT', 'CORRESPONDENCE', 'OTHER']),
  notes: z.string().optional(),
});
