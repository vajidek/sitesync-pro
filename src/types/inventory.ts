export interface MaterialMasterItem {
  id: string;
  itemCode: string;
  name: string;
  categoryId: string;
  subCategory?: string;
  specification?: string;
  brand?: string;
  model?: string;
  manufacturer?: string;
  unitId: string;
  hsnCode?: string;
  gstPercentage?: number;
  barcode?: string;
  qrCode?: string;
  imageUrl?: string;
  description?: string;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  openingStock: number;
  currentStock: number;
  reservedStock: number;
  unitPrice: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseItem {
  id: string;
  code: string;
  name: string;
  type: 'CENTRAL' | 'REGIONAL' | 'PROJECT' | 'SITE_TEMP';
  location: string;
  siteId?: string;
  managerId?: string;
  managerName?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransactionItem {
  id: string;
  transactionCode: string;
  transactionType: 'GOODS_RECEIPT' | 'GOODS_ISSUE' | 'TRANSFER' | 'RETURN' | 'ADJUSTMENT' | 'OPENING_STOCK' | 'PHYSICAL_VERIFICATION' | 'DAMAGE' | 'SCRAP';
  materialId: string;
  materialName: string;
  materialCode: string;
  warehouseId: string;
  warehouseName: string;
  targetWarehouseId?: string;
  targetWarehouseName?: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  projectId?: string;
  projectName?: string;
  siteId?: string;
  siteName?: string;
  workCategory?: string;
  issuedById?: string;
  issuedByName?: string;
  receivedById?: string;
  receivedByName?: string;
  supervisorId?: string;
  supervisorName?: string;
  referenceDoc?: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  approvedById?: string;
  approvedByName?: string;
  transactionDate: string;
  createdAt: string;
}

export interface PurchaseRequestItem {
  id: string;
  requisitionCode: string;
  projectId: string;
  projectName: string;
  siteId?: string;
  siteName?: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  requiredDate: string;
  requestedById: string;
  requestedByName: string;
  verifiedById?: string;
  verifiedByName?: string;
  approvedById?: string;
  approvedByName?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  requisitionId?: string;
  projectId?: string;
  projectName?: string;
  poDate: string;
  expectedDeliveryDate: string;
  totalAmount: number;
  paymentTerms?: string;
  quotationRef?: string;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_DELIVERED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  deliveryStatus: 'PENDING' | 'IN_TRANSIT' | 'RECEIVED';
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockVerificationItem {
  id: string;
  verificationCode: string;
  warehouseId: string;
  warehouseName: string;
  materialId: string;
  materialName: string;
  systemStock: number;
  physicalStock: number;
  discrepancy: number;
  reason?: string;
  verifiedById: string;
  verifiedByName: string;
  status: 'PENDING' | 'ADJUSTED' | 'REJECTED';
  createdAt: string;
}

export interface GoodsReceiptItemLine {
  id: string;
  grnId: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  unitPrice: number;
  batchNumber?: string;
  expiryDate?: string;
  locationId?: string;
  remarks?: string;
  createdAt: string;
}

export interface GoodsReceiptRecord {
  id: string;
  grnNumber: string;
  poNumber?: string;
  vendorId?: string;
  vendorName?: string;
  warehouseId: string;
  warehouseName: string;
  deliveryNoteNo?: string;
  receivedDate: string;
  receivedBy: string;
  inspectedBy?: string;
  qcStatus: string;
  totalValue: number;
  status: string;
  notes?: string;
  createdAt: string;
  items?: GoodsReceiptItemLine[];
}

export interface MaterialIssueItemLine {
  id: string;
  issueId: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  requestedQty: number;
  issuedQty: number;
  unitPrice: number;
  batchNumber?: string;
  locationId?: string;
  remarks?: string;
  createdAt: string;
}

export interface MaterialIssueRecord {
  id: string;
  issueNumber: string;
  projectId?: string;
  projectName?: string;
  wbsCode?: string;
  boqRef?: string;
  department?: string;
  warehouseId: string;
  warehouseName: string;
  issuedTo: string;
  issuedBy: string;
  issueDate: string;
  status: string;
  notes?: string;
  createdAt: string;
  items?: MaterialIssueItemLine[];
}

export interface MaterialTransferItemLine {
  id: string;
  transferId: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  transferQty: number;
  batchNumber?: string;
  remarks?: string;
  createdAt: string;
}

export interface MaterialTransferRecord {
  id: string;
  transferNumber: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  targetWarehouseId: string;
  targetWarehouseName: string;
  requestedBy?: string;
  approvedBy?: string;
  dispatchedBy?: string;
  receivedBy?: string;
  transferDate: string;
  status: string;
  notes?: string;
  createdAt: string;
  items?: MaterialTransferItemLine[];
}

export interface MaterialReturnRecord {
  id: string;
  returnNumber: string;
  returnType: string;
  projectId?: string;
  projectName?: string;
  warehouseId: string;
  warehouseName: string;
  returnedBy: string;
  receivedBy: string;
  returnDate: string;
  status: string;
  reason?: string;
  createdAt: string;
}

export interface InventoryAdjustmentRecord {
  id: string;
  adjustmentNumber: string;
  warehouseId: string;
  warehouseName: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  adjustmentType: string;
  quantity: number;
  unitPrice: number;
  reason: string;
  adjustedBy: string;
  approvedBy?: string;
  status: string;
  createdAt: string;
}

export interface WarehouseLocationItem {
  id: string;
  code: string;
  name: string;
  warehouseId: string;
  zone?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
}

export interface InventoryLogItem {
  id: string;
  materialId?: string;
  warehouseId?: string;
  actionType: string;
  performedBy: string;
  details: string;
  createdAt: string;
}

