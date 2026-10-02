export type EstimateStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'LOCKED' | 'CANCELLED';
export type EstimateResourceType = 'MATERIAL' | 'LABOUR' | 'EQUIPMENT' | 'SUBCONTRACT' | 'OTHER';

export interface EstimateSummary {
  id: string;
  companyId: string;
  tenderId?: string | null;
  projectId?: string | null;
  estimateNumber: string;
  title: string;
  estimateType: string;
  currency: string;
  status: EstimateStatus;
  currentRevisionNumber: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  revision?: EstimateRevision;
}

export interface EstimateRevision {
  id: string;
  estimateId: string;
  revisionNumber: number;
  revisionLabel?: string;
  status: EstimateStatus;
  description?: string;
  directCost: number;
  overheadAmount: number;
  contingencyAmount: number;
  profitAmount: number;
  taxAmount: number;
  totalCost: number;
  totalPrice: number;
  lineCount?: number;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lines?: EstimateLine[];
}

export interface EstimateLine {
  id: string;
  revisionId: string;
  lineNumber: number;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  directRate: number;
  directAmount: number;
  overheadPercent: number;
  profitPercent: number;
  quotedRate: number;
  quotedAmount: number;
  wbsId?: string | null;
  boqItemId?: string | null;
  costCodeId?: string | null;
  costCode?: string | null;
  createdAt: string;
  updatedAt: string;
  resources?: EstimateResource[];
}

export interface EstimateResource {
  id: string;
  lineId: string;
  resourceType: EstimateResourceType;
  resourceCode?: string | null;
  description: string;
  unit: string;
  quantity: number;
  unitRate: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateCreateInput {
  companyId: string;
  tenderId?: string | null;
  projectId?: string | null;
  estimateNumber?: string;
  title: string;
  estimateType: string;
  currency: string;
  description?: string;
  createdBy: string;
  createdByName: string;
  branchId?: string | null;
}

export interface EstimateLineCreateInput {
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  overheadPercent?: number;
  profitPercent?: number;
  wbsId?: string | null;
  boqItemId?: string | null;
  costCodeId?: string | null;
  resources?: Array<{
    resourceType: EstimateResourceType;
    resourceCode?: string;
    description: string;
    unit: string;
    quantity: number;
    unitRate: number;
  }>;
}
