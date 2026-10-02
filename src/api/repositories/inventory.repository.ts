import { db } from '../../db';
import {
  materials,
  materialCategories,
  materialUnits,
  warehouses,
  stocks,
  stockTransactions,
  purchaseRequests,
  legacyPurchaseOrders as purchaseOrders,
  stockVerifications,
  projects,
  sites,
  employees,
  users,
  vendors,
  materialSubcategories,
  warehouseLocations,
  goodsReceipts,
  goodsReceiptItems,
  materialIssues,
  materialIssueItems,
  materialTransfers,
  materialTransferItems,
  materialReturns,
  materialReturnItems,
  inventoryAdjustments,
  inventoryLogs,
  procurementCostControlsTable,
  procurementPurchaseOrdersTable,
  procurementGrnsTable,
  procurementLogs,
  costCodes,
  projectWbs,
  boqItems,
} from '../../db/schema';
import { eq, and, ilike, or, gte, sql } from 'drizzle-orm';
import { PaginationParams } from '../utils/pagination';
import { numberingService } from '../services/numbering.service';
import { legacyProcurementAdapter } from '../services/legacy_procurement_adapter';
import { legacyProcurementTelemetry } from '../telemetry/legacy_procurement.telemetry';
import { enterpriseAuditRepository } from './enterprise_audit.repository';
import { financeRepository } from './finance.repository';
import { isDemoSeedAllowed } from '../config/env';

const genId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 8)}`;

export interface DbMaterialSubcategory {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbWarehouseLocation {
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
  updatedAt: string;
}

export interface DbGoodsReceipt {
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  items?: DbGoodsReceiptItem[];
}

export interface DbGoodsReceiptItem {
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

export interface DbMaterialIssue {
  id: string;
  issueNumber: string;
  projectId?: string;
  projectName?: string;
  wbsId?: string;
  wbsCode?: string;
  boqItemId?: string;
  boqRef?: string;
  costCodeId?: string;
  costCode?: string;
  department?: string;
  warehouseId: string;
  warehouseName: string;
  issuedTo: string;
  issuedBy: string;
  issueDate: string;
  status: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  items?: DbMaterialIssueItem[];
}

export interface DbMaterialIssueItem {
  wbsId?: string;
  boqItemId?: string;
  costCodeId?: string;
  costCode?: string;
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

export interface DbMaterialTransfer {
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  items?: DbMaterialTransferItem[];
}

export interface DbMaterialTransferItem {
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

export interface DbMaterialReturn {
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  items?: DbMaterialReturnItem[];
}

export interface DbMaterialReturnItem {
  id: string;
  returnId: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  returnedQty: number;
  unitPrice: number;
  batchNumber?: string;
  condition: string;
  remarks?: string;
  createdAt: string;
}

export interface DbInventoryAdjustment {
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface DbInventoryLog {
  id: string;
  materialId?: string;
  warehouseId?: string;
  actionType: string;
  performedBy: string;
  details: string;
  ipAddress?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface DbMaterialCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbMaterialUnit {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbMaterial {
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
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbWarehouse {
  id: string;
  code: string;
  name: string;
  type: string;
  location: string;
  siteId?: string;
  managerId?: string;
  managerName?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbStock {
  id: string;
  warehouseId: string;
  materialId: string;
  quantity: number;
  reservedQuantity: number;
  batchNumber?: string;
  rackLocation?: string;
  updatedAt: string;
}

export interface DbStockTransaction {
  id: string;
  transactionCode: string;
  transactionType: string;
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
  status: string;
  approvedById?: string;
  approvedByName?: string;
  transactionDate: string;
  createdAt: string;
}

export interface DbPurchaseRequest {
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
  priority: string;
  requiredDate: string;
  requestedById: string;
  requestedByName: string;
  verifiedById?: string;
  verifiedByName?: string;
  approvedById?: string;
  approvedByName?: string;
  status: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbPurchaseOrder {
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
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbStockVerification {
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
  status: string;
  createdAt: string;
}

let isInventorySeeded = false;

async function ensureInventorySeeded() {
  if (isInventorySeeded) return;
  if (!isDemoSeedAllowed()) {
    isInventorySeeded = true;
    return;
  }
  try {
    const existingCategories = await db.select().from(materialCategories).limit(1);
    if (existingCategories.length === 0) {
      const now = new Date().toISOString();
      const defaultCategories = [
        { id: 'cat-001', code: 'CAT-PIPE', name: 'High Pressure Steel Piping', description: 'Schedule 40/80 Seamless carbon & stainless steel pipes', isActive: true, createdAt: now, updatedAt: now },
        { id: 'cat-002', code: 'CAT-STR', name: 'Structural Steel Beams', description: 'H-Beams, I-Beams, Universal Columns, C-Channels', isActive: true, createdAt: now, updatedAt: now },
        { id: 'cat-003', code: 'CAT-FLG', name: 'Flanges & Valves', description: 'ANSI 150/300 Raised face flanges, Gate & Ball valves', isActive: true, createdAt: now, updatedAt: now },
      ];
      for (const cat of defaultCategories) {
        await db.insert(materialCategories).values(cat).onConflictDoNothing();
      }
    }

    const existingUnits = await db.select().from(materialUnits).limit(1);
    if (existingUnits.length === 0) {
      const now = new Date().toISOString();
      const defaultUnits = [
        { id: 'unt-001', code: 'MTR', name: 'Meter', description: 'Linear meters', isActive: true, createdAt: now, updatedAt: now },
        { id: 'unt-002', code: 'PCS', name: 'Pieces', description: 'Individual units/count', isActive: true, createdAt: now, updatedAt: now },
        { id: 'unt-003', code: 'TON', name: 'Metric Tonne', description: 'Weight in metric tons', isActive: true, createdAt: now, updatedAt: now },
      ];
      for (const u of defaultUnits) {
        await db.insert(materialUnits).values(u).onConflictDoNothing();
      }
    }

    const existingMaterials = await db.select().from(materials).limit(1);
    if (existingMaterials.length === 0) {
      const now = new Date().toISOString();
      const defaultMaterials = [
        {
          id: 'mat-001',
          itemCode: 'PIP-CS-001',
          name: '12-inch Schedule 80 Carbon Steel Seamless Pipe',
          categoryId: 'cat-001',
          subCategory: 'Seamless Carbon Steel',
          specification: 'API 5L Grade B Seamless, Length 6m, Beveled Ends',
          brand: 'Tenaris / Vallourec',
          model: 'Sch 80 12"',
          manufacturer: 'Emirates Seamless Pipe Mills',
          unitId: 'unt-001',
          hsnCode: '73041910',
          gstPercentage: 18,
          barcode: '890100192801',
          qrCode: 'QR-PIP-CS-001',
          imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
          description: 'High pressure main line header piping spool suitable for oil/gas/hydrocarbon services.',
          minStock: 100,
          maxStock: 2000,
          reorderLevel: 250,
          openingStock: 900,
          currentStock: 850,
          reservedStock: 200,
          unitPrice: 380,
          status: 'ACTIVE',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'mat-002',
          itemCode: 'BEAM-UB-250',
          name: 'Universal Beam UB 254x146x37',
          categoryId: 'cat-002',
          subCategory: 'Structural Columns & Beams',
          specification: 'Grade S355JR Structural Steel EN 10025-2',
          brand: 'Emirates Steel',
          model: 'UB 254x146x37',
          manufacturer: 'Emirates Steel Arkan PJSC',
          unitId: 'unt-001',
          hsnCode: '72163300',
          gstPercentage: 18,
          barcode: '890100192802',
          qrCode: 'QR-BEAM-UB-250',
          imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
          description: 'Hot rolled steel section for heavy industrial pipe racks and plant platforms.',
          minStock: 50,
          maxStock: 500,
          reorderLevel: 100,
          openingStock: 300,
          currentStock: 240,
          reservedStock: 40,
          unitPrice: 420,
          status: 'ACTIVE',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'mat-003',
          itemCode: 'FLG-RF-300',
          name: '12-inch ANSI Class 300 Weld Neck Flange',
          categoryId: 'cat-003',
          subCategory: 'Forged Pipe Flanges',
          specification: 'ASTM A105 Forged Carbon Steel Raised Face B16.5',
          brand: 'Metalfar / GALPERTI',
          model: '12" ANSI 300# WN',
          manufacturer: 'Galperti Forging UAE',
          unitId: 'unt-002',
          hsnCode: '73079100',
          gstPercentage: 18,
          barcode: '890100192803',
          qrCode: 'QR-FLG-RF-300',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
          description: 'Heavy duty raised face flange for process line hydrotests and vessel nozzles.',
          minStock: 30,
          maxStock: 300,
          reorderLevel: 50,
          openingStock: 160,
          currentStock: 145,
          reservedStock: 25,
          unitPrice: 650,
          status: 'ACTIVE',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ];
      for (const mat of defaultMaterials) {
        await db.insert(materials).values(mat).onConflictDoNothing();
      }
    }

    const existingWarehouses = await db.select().from(warehouses).limit(1);
    if (existingWarehouses.length === 0) {
      const now = new Date().toISOString();
      const defaultWarehouses = [
        {
          id: 'wh-001',
          code: 'WH-CENTRAL-AUH',
          name: 'Abu Dhabi Central Yard Warehouse',
          type: 'CENTRAL',
          location: 'Plot 402, Mussafah Zone 12, Abu Dhabi',
          siteId: 'sit-001',
          managerId: 'usr-str-005',
          managerName: 'Ramesh Patel',
          capacity: 15000,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'wh-002',
          code: 'WH-REEM-SITE',
          name: 'Reem Island Site Buffer Store',
          type: 'PROJECT',
          location: 'Al Reem Island Site Compound, Sector 4',
          siteId: 'sit-001',
          managerId: 'usr-str-005',
          managerName: 'Ramesh Patel',
          capacity: 5000,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'wh-003',
          code: 'WH-JEBEL-TEMP',
          name: 'Jebel Ali Temporary Site Store',
          type: 'SITE_TEMP',
          location: 'Jebel Ali Industrial Sector 2, Dubai',
          siteId: 'sit-003',
          managerId: 'usr-inc-003',
          managerName: 'Tariq Al-Farsi',
          capacity: 3500,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ];
      for (const wh of defaultWarehouses) {
        await db.insert(warehouses).values(wh).onConflictDoNothing();
      }
    }

    const existingStocks = await db.select().from(stocks).limit(1);
    if (existingStocks.length === 0) {
      const now = new Date().toISOString();
      const defaultStocks = [
        { id: 'stk-001', warehouseId: 'wh-001', materialId: 'mat-001', quantity: 600, reservedQuantity: 150, batchNumber: 'BATCH-2026-A1', rackLocation: 'Rack A-12', updatedAt: now },
        { id: 'stk-002', warehouseId: 'wh-002', materialId: 'mat-001', quantity: 250, reservedQuantity: 50, batchNumber: 'BATCH-2026-A1', rackLocation: 'Yard Bin 4', updatedAt: now },
        { id: 'stk-003', warehouseId: 'wh-001', materialId: 'mat-002', quantity: 240, reservedQuantity: 40, batchNumber: 'BATCH-2026-B3', rackLocation: 'Yard Area Steel-1', updatedAt: now },
        { id: 'stk-004', warehouseId: 'wh-001', materialId: 'mat-003', quantity: 145, reservedQuantity: 25, batchNumber: 'BATCH-2026-C9', rackLocation: 'Rack Flange-3', updatedAt: now },
      ];
      for (const stk of defaultStocks) {
        await db.insert(stocks).values(stk).onConflictDoNothing();
      }
    }

    const existingTxns = await db.select().from(stockTransactions).limit(1);
    if (existingTxns.length === 0) {
      const now = new Date().toISOString();
      const defaultTxns = [
        {
          id: 'stx-001',
          transactionCode: 'GRN-2026-001',
          transactionType: 'GOODS_RECEIPT',
          materialId: 'mat-001',
          materialName: '12-inch Schedule 80 Carbon Steel Seamless Pipe',
          materialCode: 'PIP-CS-001',
          warehouseId: 'wh-001',
          warehouseName: 'Abu Dhabi Central Yard Warehouse',
          quantity: 500,
          unitPrice: 380,
          totalValue: 190000,
          projectId: 'PRJ-101',
          projectName: 'Al Reem Mechanical Piping & Structural Hub',
          siteId: 'sit-001',
          siteName: 'Reem Offshore Yard Alpha',
          receivedById: 'usr-str-005',
          receivedByName: 'Ramesh Patel',
          referenceDoc: 'PO-2026-089 / Delivery Note 9921',
          notes: 'Received batch with mill test certificate. Passed visual & dimensional inspection.',
          status: 'COMPLETED',
          approvedById: 'usr-mgr-002',
          approvedByName: 'Sarah Al-Mansoor',
          transactionDate: '2026-07-20',
          createdAt: now,
        },
        {
          id: 'stx-002',
          transactionCode: 'GI-2026-042',
          transactionType: 'GOODS_ISSUE',
          materialId: 'mat-001',
          materialName: '12-inch Schedule 80 Carbon Steel Seamless Pipe',
          materialCode: 'PIP-CS-001',
          warehouseId: 'wh-001',
          warehouseName: 'Abu Dhabi Central Yard Warehouse',
          quantity: 120,
          unitPrice: 380,
          totalValue: 45600,
          projectId: 'PRJ-101',
          projectName: 'Al Reem Mechanical Piping & Structural Hub',
          siteId: 'sit-001',
          siteName: 'Reem Offshore Yard Alpha',
          workCategory: 'Mechanical Piping Spool Fitup',
          issuedById: 'usr-str-005',
          issuedByName: 'Ramesh Patel',
          receivedById: 'emp-003',
          receivedByName: 'Tariq Al-Farsi',
          supervisorId: 'emp-003',
          supervisorName: 'Tariq Al-Farsi',
          referenceDoc: 'PR-2026-001',
          notes: 'Issued to field crew for isometric spool #14 fitup welding.',
          status: 'COMPLETED',
          approvedById: 'usr-mgr-002',
          approvedByName: 'Sarah Al-Mansoor',
          transactionDate: '2026-07-28',
          createdAt: now,
        },
        {
          id: 'stx-003',
          transactionCode: 'TRF-2026-012',
          transactionType: 'TRANSFER',
          materialId: 'mat-001',
          materialName: '12-inch Schedule 80 Carbon Steel Seamless Pipe',
          materialCode: 'PIP-CS-001',
          warehouseId: 'wh-001',
          warehouseName: 'Abu Dhabi Central Yard Warehouse',
          targetWarehouseId: 'wh-002',
          targetWarehouseName: 'Reem Island Site Buffer Store',
          quantity: 100,
          unitPrice: 380,
          totalValue: 38000,
          projectId: 'PRJ-101',
          projectName: 'Al Reem Mechanical Piping & Structural Hub',
          siteId: 'sit-001',
          siteName: 'Reem Offshore Yard Alpha',
          issuedById: 'usr-str-005',
          issuedByName: 'Ramesh Patel',
          receivedById: 'usr-str-005',
          receivedByName: 'Ramesh Patel',
          referenceDoc: 'ST-REQ-102',
          notes: 'Inter-warehouse site buffer transfer.',
          status: 'COMPLETED',
          approvedById: 'usr-mgr-002',
          approvedByName: 'Sarah Al-Mansoor',
          transactionDate: '2026-07-29',
          createdAt: now,
        },
      ];
      for (const stx of defaultTxns) {
        await db.insert(stockTransactions).values(stx).onConflictDoNothing();
      }
    }

    const existingPRs = await db.select().from(purchaseRequests).limit(1);
    if (existingPRs.length === 0 && isDemoSeedAllowed()) {
      const now = new Date().toISOString();
      const defaultPRs = [
        {
          id: 'pr-001',
          requisitionCode: 'PR-2026-001',
          projectId: 'PRJ-101',
          projectName: 'Al Reem Mechanical Piping & Structural Hub',
          siteId: 'sit-001',
          siteName: 'Reem Offshore Yard Alpha',
          materialId: 'mat-001',
          materialName: '12-inch Schedule 80 Carbon Steel Seamless Pipe',
          quantity: 150,
          unit: 'MTR',
          priority: 'HIGH',
          requiredDate: '2026-08-15',
          requestedById: 'usr-inc-003',
          requestedByName: 'Tariq Al-Farsi',
          verifiedById: 'usr-str-005',
          verifiedByName: 'Ramesh Patel',
          approvedById: 'usr-mgr-002',
          approvedByName: 'Sarah Al-Mansoor',
          status: 'APPROVED',
          remarks: 'Required for Phase 2 header spool expansion.',
          createdAt: '2026-07-22T09:00:00.000Z',
          updatedAt: now,
        },
        {
          id: 'pr-002',
          requisitionCode: 'PR-2026-002',
          projectId: 'PRJ-102',
          projectName: 'Jebel Ali Substation Structural Expansion',
          siteId: 'sit-003',
          siteName: 'Jebel Ali Main Foundation Substation',
          materialId: 'mat-002',
          materialName: 'Universal Beam UB 254x146x37',
          quantity: 80,
          unit: 'MTR',
          priority: 'MEDIUM',
          requiredDate: '2026-08-25',
          requestedById: 'usr-inc-003',
          requestedByName: 'Tariq Al-Farsi',
          status: 'SUBMITTED',
          remarks: 'Foundation pile anchor framing beams.',
          createdAt: '2026-07-30T14:15:00.000Z',
          updatedAt: now,
        },
      ];
      for (const pr of defaultPRs) {
        await db.insert(purchaseRequests).values(pr).onConflictDoNothing();
      }
    }

    const existingPOs = await db.select().from(purchaseOrders).limit(1);
    if (existingPOs.length === 0 && isDemoSeedAllowed()) {
      const now = new Date().toISOString();
      const defaultPOs = [
        {
          id: 'po-001',
          poNumber: 'PO-2026-089',
          vendorId: 'vnd-001',
          vendorName: 'Emirates Steel Industries PJSC',
          requisitionId: 'pr-001',
          projectId: 'PRJ-101',
          projectName: 'Al Reem Mechanical Piping & Structural Hub',
          poDate: '2026-07-24',
          expectedDeliveryDate: '2026-08-10',
          totalAmount: 190000,
          paymentTerms: 'Net 60 Days',
          quotationRef: 'QT-EMSTEEL-9921',
          status: 'ISSUED',
          paymentStatus: 'UNPAID',
          deliveryStatus: 'IN_TRANSIT',
          notes: 'Consignment under transport by flatbed trailer.',
          createdById: 'usr-admin-001',
          createdAt: '2026-07-24T10:00:00.000Z',
          updatedAt: now,
        },
      ];
      for (const po of defaultPOs) {
        await db.insert(purchaseOrders).values(po).onConflictDoNothing();
      }
    }

    const existingStvs = await db.select().from(stockVerifications).limit(1);
    if (existingStvs.length === 0 && isDemoSeedAllowed()) {
      const now = new Date().toISOString();
      const defaultStvs = [
        {
          id: 'stv-001',
          verificationCode: 'STV-2026-005',
          warehouseId: 'wh-001',
          warehouseName: 'Abu Dhabi Central Yard Warehouse',
          materialId: 'mat-001',
          materialName: '12-inch Schedule 80 Carbon Steel Seamless Pipe',
          systemStock: 600,
          physicalStock: 600,
          discrepancy: 0,
          reason: 'Quarterly physical stock audit complete. Zero variance.',
          verifiedById: 'usr-str-005',
          verifiedByName: 'Ramesh Patel',
          status: 'ADJUSTED',
          createdAt: '2026-07-25T16:00:00.000Z',
        },
      ];
      for (const stv of defaultStvs) {
        await db.insert(stockVerifications).values(stv).onConflictDoNothing();
      }
    }

    isInventorySeeded = true;
  } catch (err) {
    console.error('Inventory seed error:', err);
  }
}

export class InventoryRepository {
  // ==========================================
  // MATERIAL MASTER CRUD
  // ==========================================
  async getMaterials(params: Partial<PaginationParams & { categoryId?: string; status?: string; search?: string }> = {}) {
    await ensureInventorySeeded();
    let conditions = [eq(materials.isActive, true)];

    if (params?.categoryId) {
      conditions.push(eq(materials.categoryId, params.categoryId));
    }
    if (params?.status) {
      conditions.push(eq(materials.status, params.status));
    }
    if (params?.search && params.search.trim() !== '') {
      const term = `%${params.search.trim()}%`;
      conditions.push(
        or(
          ilike(materials.itemCode, term),
          ilike(materials.name, term),
          ilike(materials.specification, term),
          ilike(materials.brand, term),
          ilike(materials.manufacturer, term),
          ilike(materials.barcode, term),
          ilike(materials.qrCode, term),
          ilike(materials.hsnCode, term),
          ilike(materials.subCategory, term)
        )!
      );
    }

    const whereClause = and(...conditions);
    const allRows = await db.select().from(materials).where(whereClause);
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const total = allRows.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = allRows.slice(start, start + limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getMaterialById(id: string): Promise<DbMaterial | null> {
    await ensureInventorySeeded();
    const rows = await db
      .select()
      .from(materials)
      .where(
        and(
          eq(materials.isActive, true),
          or(
            eq(materials.id, id),
            eq(materials.itemCode, id),
            eq(materials.barcode, id),
            eq(materials.qrCode, id)
          )
        )
      );
    return (rows[0] as DbMaterial) || null;
  }

  async createMaterial(data: Partial<DbMaterial>): Promise<DbMaterial> {
    await ensureInventorySeeded();
    const now = new Date().toISOString();
    const itemCode = data.itemCode || `MAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMaterial: DbMaterial = {
      id: genId('mat'),
      itemCode,
      name: data.name || 'New Material Item',
      categoryId: data.categoryId || 'cat-001',
      subCategory: data.subCategory || 'General',
      specification: data.specification || '',
      brand: data.brand || 'Generic',
      model: data.model || '',
      manufacturer: data.manufacturer || 'Standard Supplier',
      unitId: data.unitId || 'unt-002',
      hsnCode: data.hsnCode || '73040000',
      gstPercentage: data.gstPercentage ?? 18,
      barcode: data.barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`,
      qrCode: data.qrCode || `QR-${itemCode}`,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
      description: data.description || '',
      minStock: data.minStock ?? 10,
      maxStock: data.maxStock ?? 1000,
      reorderLevel: data.reorderLevel ?? 25,
      openingStock: data.openingStock ?? 0,
      currentStock: data.currentStock ?? (data.openingStock || 0),
      reservedStock: data.reservedStock ?? 0,
      unitPrice: data.unitPrice ?? 100,
      status: data.status || 'ACTIVE',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(materials).values(newMaterial);

    if (newMaterial.currentStock > 0) {
      const centralWhs = await db.select().from(warehouses).where(and(eq(warehouses.isActive, true), eq(warehouses.type, 'CENTRAL')));
      const targetWh = centralWhs[0] || (await db.select().from(warehouses).where(eq(warehouses.isActive, true)))[0];
      if (targetWh) {
        await db.insert(stocks).values({
          id: genId('stk'),
          warehouseId: targetWh.id,
          materialId: newMaterial.id,
          quantity: newMaterial.currentStock,
          reservedQuantity: 0,
          batchNumber: `BATCH-INIT-${newMaterial.itemCode}`,
          rackLocation: 'General Bin',
          updatedAt: now,
        });
      }
    }

    return newMaterial;
  }

  async updateMaterial(id: string, data: Partial<DbMaterial>): Promise<DbMaterial | null> {
    await ensureInventorySeeded();
    const existing = await this.getMaterialById(id);
    if (!existing) return null;

    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await db.update(materials).set(updateData).where(eq(materials.id, existing.id));
    return await this.getMaterialById(existing.id);
  }

  async deleteMaterial(id: string): Promise<boolean> {
    await ensureInventorySeeded();
    const mat = await this.getMaterialById(id);
    if (!mat) return false;

    await db
      .update(materials)
      .set({ isActive: false, status: 'DISCONTINUED', updatedAt: new Date().toISOString() })
      .where(eq(materials.id, mat.id));

    return true;
  }

  // ==========================================
  // CATEGORIES & UNITS
  // ==========================================
  async getMaterialCategories(): Promise<DbMaterialCategory[]> {
    await ensureInventorySeeded();
    return db.select().from(materialCategories).where(eq(materialCategories.isActive, true));
  }

  async getMaterialUnits(): Promise<DbMaterialUnit[]> {
    await ensureInventorySeeded();
    return db.select().from(materialUnits).where(eq(materialUnits.isActive, true));
  }

  // ==========================================
  // WAREHOUSE MANAGEMENT
  // ==========================================
  async getWarehouses(params: Partial<PaginationParams> = {}) {
    await ensureInventorySeeded();
    let conditions = [eq(warehouses.isActive, true)];

    if (params?.search && params.search.trim() !== '') {
      const term = `%${params.search.trim()}%`;
      conditions.push(
        or(
          ilike(warehouses.code, term),
          ilike(warehouses.name, term),
          ilike(warehouses.location, term),
          ilike(warehouses.type, term),
          ilike(warehouses.managerName, term)
        )!
      );
    }

    const allRows = await db.select().from(warehouses).where(and(...conditions));
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const total = allRows.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = allRows.slice(start, start + limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getWarehouseById(id: string): Promise<DbWarehouse | null> {
    await ensureInventorySeeded();
    const rows = await db.select().from(warehouses).where(eq(warehouses.id, id));
    return (rows[0] as DbWarehouse) || null;
  }

  async createWarehouse(data: Partial<DbWarehouse>): Promise<DbWarehouse> {
    await ensureInventorySeeded();
    const now = new Date().toISOString();
    const name = String(data.name || '').trim();
    const code = String(data.code || '').trim();
    const type = String(data.type || '').trim();
    const location = String(data.location || '').trim();
    if (!name || !code || !type || !location) throw new Error('Warehouse code, name, type and location are required.');

    let managerName = data.managerName?.trim() || undefined;
    if (data.managerId) {
      const userRows = await db.select().from(users).where(eq(users.id, data.managerId)).limit(1);
      if (userRows[0]) managerName = userRows[0].name;
      if (!managerName) {
        const empRows = await db.select().from(employees).where(eq(employees.id, data.managerId)).limit(1);
        if (empRows[0]) managerName = empRows[0].name;
      }
      if (!managerName) throw new Error('Selected warehouse manager was not found.');
    }

    const duplicate = await db.select({ id: warehouses.id }).from(warehouses).where(eq(warehouses.code, code)).limit(1);
    if (duplicate.length) throw new Error('Warehouse code already exists: ' + code);

    const newWh: DbWarehouse = {
      id: genId('wh'), code, name, type, location, siteId: data.siteId, managerId: data.managerId, managerName, capacity: data.capacity,
      isActive: true, createdAt: now, updatedAt: now,
    };
    await db.insert(warehouses).values(newWh);
    return newWh;
  }
  async updateWarehouse(id: string, data: Partial<DbWarehouse>): Promise<DbWarehouse | null> {
    await ensureInventorySeeded();
    const existing = await this.getWarehouseById(id);
    if (!existing) return null;

    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await db.update(warehouses).set(updateData).where(eq(warehouses.id, id));
    return await this.getWarehouseById(id);
  }

  // ==========================================
  // REAL-TIME STOCK BALANCE & LOOKUPS
  // ==========================================
  async getStocksByWarehouse(warehouseId: string) {
    await ensureInventorySeeded();
    const whStocks = await db.select().from(stocks).where(eq(stocks.warehouseId, warehouseId));
    const allMaterials = await db.select().from(materials);
    const allUnits = await db.select().from(materialUnits);

    return whStocks.map((s) => {
      const mat = allMaterials.find((m) => m.id === s.materialId);
      const unit = allUnits.find((u) => u.id === mat?.unitId);
      return {
        ...s,
        material: mat || null,
        unitCode: unit?.code || 'PCS',
        availableQuantity: s.quantity - s.reservedQuantity,
        stockValue: s.quantity * (mat?.unitPrice || 0),
      };
    });
  }

  async getMaterialStockSummary(materialId: string) {
    await ensureInventorySeeded();
    const mat = await this.getMaterialById(materialId);
    if (!mat) return null;

    const whStocks = await db.select().from(stocks).where(eq(stocks.materialId, mat.id));
    const allWarehouses = await db.select().from(warehouses);

    const warehouseBreakdown = whStocks.map((s) => {
      const wh = allWarehouses.find((w) => w.id === s.warehouseId);
      return {
        warehouseId: s.warehouseId,
        warehouseName: wh?.name || 'Unknown Warehouse',
        warehouseCode: wh?.code || '',
        warehouseType: wh?.type || 'CENTRAL',
        quantity: s.quantity,
        reservedQuantity: s.reservedQuantity,
        availableQuantity: s.quantity - s.reservedQuantity,
        rackLocation: s.rackLocation || 'Yard',
      };
    });

    return {
      material: mat,
      warehouseBreakdown,
      totalCurrentStock: mat.currentStock,
      totalReservedStock: mat.reservedStock,
      totalAvailableStock: mat.currentStock - mat.reservedStock,
    };
  }

  // ==========================================
  // STOCK TRANSACTIONS ENGINE
  // ==========================================
  async getStockTransactions(params: PaginationParams & { type?: string; projectId?: string; warehouseId?: string }) {
    await ensureInventorySeeded();
    let conditions = [];

    if (params.type) {
      conditions.push(eq(stockTransactions.transactionType, params.type));
    }
    if (params.projectId) {
      conditions.push(eq(stockTransactions.projectId, params.projectId));
    }
    if (params.warehouseId) {
      conditions.push(
        or(
          eq(stockTransactions.warehouseId, params.warehouseId),
          eq(stockTransactions.targetWarehouseId, params.warehouseId)
        )!
      );
    }

    if (params.search && params.search.trim() !== '') {
      const term = `%${params.search.trim()}%`;
      conditions.push(
        or(
          ilike(stockTransactions.transactionCode, term),
          ilike(stockTransactions.materialName, term),
          ilike(stockTransactions.materialCode, term),
          ilike(stockTransactions.warehouseName, term),
          ilike(stockTransactions.projectName, term),
          ilike(stockTransactions.referenceDoc, term),
          ilike(stockTransactions.issuedByName, term),
          ilike(stockTransactions.receivedByName, term)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const allTxns = await db.select().from(stockTransactions).where(whereClause);

    allTxns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = allTxns.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = allTxns.slice(start, start + limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async createStockTransaction(data: Partial<DbStockTransaction>, txOrDb: any = db): Promise<DbStockTransaction> {
    await ensureInventorySeeded();
    const client = txOrDb || db;
    const now = new Date().toISOString();
    const materialId = String(data.materialId || '').trim();
    const warehouseId = String(data.warehouseId || '').trim();
    const transactionType = String(data.transactionType || '').trim().toUpperCase();
    const qty = Number(data.quantity);

    const allowedTypes = ['GOODS_RECEIPT', 'GOODS_ISSUE', 'TRANSFER', 'RETURN', 'OPENING_STOCK', 'DAMAGE', 'SCRAP'];
    if (!materialId || !warehouseId || !allowedTypes.includes(transactionType)) {
      throw new Error('Material, warehouse and a valid stock transaction type are required.');
    }
    if (!Number.isFinite(qty) || qty <= 0) throw new Error('Stock transaction quantity must be greater than zero.');

    if (['GOODS_ISSUE', 'DAMAGE', 'SCRAP'].includes(transactionType) && !String(data.issuedByName || '').trim()) {
      throw new Error('Issuer identity is required for stock-out transactions.');
    }
    if (['GOODS_RECEIPT', 'RETURN'].includes(transactionType) && !String(data.receivedByName || '').trim()) {
      throw new Error('Receiver identity is required for stock-in transactions.');
    }
    if (transactionType === 'TRANSFER') {
      if (!String(data.issuedByName || '').trim() || !String(data.receivedByName || '').trim()) throw new Error('Dispatch and receiving identities are required for stock transfers.');
      if (!data.targetWarehouseId || data.targetWarehouseId === warehouseId) throw new Error('Transfer requires a distinct target warehouse.');
    }

    const [mat] = await client.select().from(materials).where(eq(materials.id, materialId)).limit(1);
    const [wh] = await client.select().from(warehouses).where(eq(warehouses.id, warehouseId)).limit(1);
    if (!mat || !mat.isActive) throw new Error('Material not found or inactive.');
    if (!wh || !wh.isActive) throw new Error('Warehouse not found or inactive.');

    let targetWh: any = null;
    if (transactionType === 'TRANSFER') {
      const [target] = await client.select().from(warehouses).where(eq(warehouses.id, data.targetWarehouseId!)).limit(1);
      if (!target || !target.isActive) throw new Error('Target warehouse not found or inactive.');
      targetWh = target;
    }

    const projectId = data.projectId ? String(data.projectId).trim() : undefined;
    let projectName = data.projectName?.trim() || undefined;
    if (projectId) {
      const [project] = await client.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.isActive, true))).limit(1);
      if (!project) throw new Error('Linked project not found or inactive.');
      projectName = projectName || project.projectName;
    }

    const siteId = data.siteId ? String(data.siteId).trim() : undefined;
    let siteName = data.siteName?.trim() || undefined;
    if (siteId) {
      const [site] = await client.select().from(sites).where(and(eq(sites.id, siteId), eq(sites.isActive, true))).limit(1);
      if (!site || (projectId && site.projectId !== projectId)) throw new Error('Linked site not found, inactive, or outside the selected project.');
      siteName = siteName || site.siteName;
    }

    const unitPrice = data.unitPrice == null ? Number(mat.unitPrice) : Number(data.unitPrice);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error('Unit price must be a valid non-negative amount.');
    const totalValue = qty * unitPrice;
    const year = now.slice(0, 4);
    const codePrefix: Record<string, string> = { GOODS_RECEIPT: 'GRN', GOODS_ISSUE: 'GI', TRANSFER: 'TRF', RETURN: 'RET', ADJUSTMENT: 'ADJ', OPENING_STOCK: 'OPN', PHYSICAL_VERIFICATION: 'STV', DAMAGE: 'DMG', SCRAP: 'SCP' };
    const txnCode = `${codePrefix[transactionType] || 'STX'}-${year}-${Date.now().toString().slice(-8)}`;
    const referenceDoc = String(data.referenceDoc || txnCode).trim();

    const transaction: DbStockTransaction = {
      id: genId('stx'),
      transactionCode: txnCode,
      transactionType,
      materialId: mat.id,
      materialName: mat.name,
      materialCode: mat.itemCode,
      warehouseId: wh.id,
      warehouseName: wh.name,
      targetWarehouseId: targetWh?.id,
      targetWarehouseName: targetWh?.name,
      quantity: qty,
      unitPrice,
      totalValue,
      projectId,
      projectName,
      siteId,
      siteName,
      workCategory: data.workCategory?.trim(),
      issuedById: data.issuedById,
      issuedByName: data.issuedByName?.trim(),
      receivedById: data.receivedById,
      receivedByName: data.receivedByName?.trim(),
      supervisorId: data.supervisorId,
      supervisorName: data.supervisorName?.trim(),
      referenceDoc,
      notes: data.notes || '',
      status: 'COMPLETED',
      approvedById: data.approvedById,
      approvedByName: data.approvedByName?.trim(),
      transactionDate: data.transactionDate || now.slice(0, 10),
      createdAt: now,
    };

    await client.insert(stockTransactions).values(transaction);

    const [stockEntry] = await client.select().from(stocks).where(and(eq(stocks.warehouseId, wh.id), eq(stocks.materialId, mat.id))).limit(1);

    if (['GOODS_ISSUE', 'DAMAGE', 'SCRAP', 'TRANSFER'].includes(transactionType)) {
      if (!stockEntry) throw new Error('No stock balance exists for the selected material and warehouse.');
      const [decremented] = await client.update(stocks).set({
        quantity: sql`${stocks.quantity} - ${qty}`,
        updatedAt: now,
      }).where(and(eq(stocks.id, stockEntry.id), gte(stocks.quantity, qty))).returning();
      if (!decremented) throw new Error(`Insufficient available stock for ${mat.itemCode}. Requested ${qty}, available ${stockEntry.quantity}.`);

      if (transactionType !== 'TRANSFER') {
        const [materialUpdated] = await client.update(materials).set({
          currentStock: sql`${materials.currentStock} - ${qty}`,
          updatedAt: now,
        }).where(and(eq(materials.id, mat.id), gte(materials.currentStock, qty))).returning();
        if (!materialUpdated) throw new Error(`Material aggregate stock is insufficient for ${mat.itemCode}.`);
      }
    } else if (transactionType === 'TRANSFER') {
      const [targetEntry] = await client.select().from(stocks).where(and(eq(stocks.warehouseId, targetWh.id), eq(stocks.materialId, mat.id))).limit(1);
      if (targetEntry) {
        await client.update(stocks).set({ quantity: sql`${stocks.quantity} + ${qty}`, updatedAt: now }).where(eq(stocks.id, targetEntry.id));
      } else {
        await client.insert(stocks).values({ id: genId('stk'), warehouseId: targetWh.id, materialId: mat.id, quantity: qty, reservedQuantity: 0, batchNumber: null, rackLocation: null, updatedAt: now });
      }
    } else {
      if (stockEntry) {
        await client.update(stocks).set({ quantity: sql`${stocks.quantity} + ${qty}`, updatedAt: now }).where(eq(stocks.id, stockEntry.id));
      } else if (['GOODS_RECEIPT', 'RETURN', 'OPENING_STOCK'].includes(transactionType)) {
        await client.insert(stocks).values({ id: genId('stk'), warehouseId: wh.id, materialId: mat.id, quantity: qty, reservedQuantity: 0, batchNumber: null, rackLocation: null, updatedAt: now });
      }
      const [materialUpdated] = await client.update(materials).set({ currentStock: sql`${materials.currentStock} + ${qty}`, updatedAt: now }).where(eq(materials.id, mat.id)).returning();
      if (!materialUpdated) throw new Error('Material stock balance could not be updated.');
    }

    return transaction;
  }
  // ==========================================
  // PURCHASE REQUISITIONS & REQUESTS
  // ==========================================
  async getPurchaseRequests(params: PaginationParams & { projectId?: string; status?: string }) {
    await ensureInventorySeeded();
    let conditions = [];
    if (params.projectId) {
      conditions.push(eq(purchaseRequests.projectId, params.projectId));
    }
    if (params.status) {
      conditions.push(eq(purchaseRequests.status, params.status));
    }
    if (params.search && params.search.trim() !== '') {
      const term = `%${params.search.trim()}%`;
      conditions.push(
        or(
          ilike(purchaseRequests.requisitionCode, term),
          ilike(purchaseRequests.projectName, term),
          ilike(purchaseRequests.siteName, term),
          ilike(purchaseRequests.materialName, term),
          ilike(purchaseRequests.requestedByName, term)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const allPRs = await db.select().from(purchaseRequests).where(whereClause);
    allPRs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = allPRs.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = allPRs.slice(start, start + limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async createPurchaseRequest(data: Partial<DbPurchaseRequest>): Promise<DbPurchaseRequest> {
    await ensureInventorySeeded();
    const now = new Date().toISOString();
    const projectId = String(data.projectId || '').trim();
    const requestedById = String(data.requestedById || '').trim();
    const requestedByName = String(data.requestedByName || '').trim();
    const materialId = String(data.materialId || '').trim();
    const quantity = Number(data.quantity);
    if (!projectId || !requestedById || !requestedByName || !materialId) throw new Error('Project, requester identity and material are required for a purchase request.');
    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Purchase request quantity must be greater than zero.');

    const [project] = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.isActive, true))).limit(1);
    if (!project) throw new Error('Project not found or inactive.');
    const companyId = String(project.companyId || '').trim();
    if (!companyId && !data.requisitionCode) throw new Error('Project company context is required for requisition numbering.');

    let siteName = data.siteName;
    if (data.siteId) {
      const [site] = await db.select().from(sites).where(and(eq(sites.id, data.siteId), eq(sites.isActive, true))).limit(1);
      if (!site || site.projectId !== projectId) throw new Error('Site not found, inactive, or outside the selected project.');
      siteName = site.siteName;
    }

    const [mat] = await db.select().from(materials).where(and(eq(materials.id, materialId), eq(materials.isActive, true))).limit(1);
    if (!mat) throw new Error('Material not found or inactive.');
    const reqCode = data.requisitionCode || await numberingService.generatePurchaseRequisitionNumber({ companyId, projectId, date: data.requiredDate || now });
    const duplicate = await db.select({ id: purchaseRequests.id }).from(purchaseRequests).where(eq(purchaseRequests.requisitionCode, reqCode)).limit(1);
    if (duplicate.length) throw new Error('Purchase request number already exists: ' + reqCode);

    const newReq: DbPurchaseRequest = {
      id: genId('pr'), requisitionCode: reqCode, projectId, projectName: project.projectName, siteId: data.siteId, siteName, materialId, materialName: mat.name,
      quantity, unit: data.unit || 'PCS', priority: data.priority || 'MEDIUM', requiredDate: data.requiredDate || now.slice(0,10), requestedById, requestedByName, status: 'SUBMITTED', remarks: data.remarks || '', createdAt: now, updatedAt: now,
    };
    await db.insert(purchaseRequests).values(newReq);
    return newReq;
  }
  async updatePurchaseRequestStatus(id: string, status: DbPurchaseRequest['status'], approverName?: string): Promise<DbPurchaseRequest | null> {
    await ensureInventorySeeded();
    const actor = String(approverName || '').trim();
    if (!actor) throw new Error('Authenticated purchase-request actor identity is required.');
    const [pr] = await db.select().from(purchaseRequests).where(eq(purchaseRequests.id, id)).limit(1);
    if (!pr) return null;
    const transitions: Record<string, string[]> = { SUBMITTED: ['VERIFIED', 'REJECTED', 'CANCELLED'], VERIFIED: ['APPROVED', 'REJECTED'], APPROVED: ['CLOSED', 'CANCELLED'], REJECTED: ['SUBMITTED'], CANCELLED: [], CLOSED: [] };
    if (!transitions[pr.status]?.includes(status)) throw new Error(`Invalid purchase request status transition: ${pr.status} → ${status}`);
    if (['VERIFIED','APPROVED'].includes(status) && String(pr.requestedByName || '').trim().toLowerCase() === actor.toLowerCase()) throw new Error('Maker-checker violation: requester cannot approve the same purchase request.');
    const updateData: any = { status, updatedAt: new Date().toISOString() };
    if (status === 'VERIFIED') updateData.verifiedByName = actor;
    if (status === 'APPROVED') updateData.approvedByName = actor;
    const [updated] = await db.update(purchaseRequests).set(updateData).where(eq(purchaseRequests.id, id)).returning();
    return (updated as DbPurchaseRequest) || null;
  }
  // ==========================================
  // PURCHASE ORDERS (CONSOLIDATED READ & SAFE WRITE BRIDGE)
  // ==========================================
  async getPurchaseOrders(params: PaginationParams & { vendorId?: string; projectId?: string }) {
    await ensureInventorySeeded();
    return await legacyProcurementAdapter.getConsolidatedPurchaseOrders({
      ...params,
      caller: 'InventoryRepository.getPurchaseOrders',
    });
  }

  async createPurchaseOrder(data: Partial<DbPurchaseOrder>): Promise<DbPurchaseOrder> {
    await ensureInventorySeeded();
    return await legacyProcurementAdapter.bridgeCreatePurchaseOrder(
      data,
      'InventoryRepository.createPurchaseOrder'
    );
  }

  // ==========================================
  // PHYSICAL STOCK VERIFICATION AUDITS
  // ==========================================
  async getStockVerifications() {
    await ensureInventorySeeded();
    return (await db.select().from(stockVerifications)) as DbStockVerification[];
  }

  async createStockVerification(data: Partial<DbStockVerification>): Promise<DbStockVerification> {
    await ensureInventorySeeded();
    const now = new Date().toISOString();
    const wh = await this.getWarehouseById(data.warehouseId || '');
    const mat = await this.getMaterialById(data.materialId || '');

    const code = `STV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const sysStock = Number(data.systemStock ?? mat?.currentStock ?? 0);
    const phyStock = Number(data.physicalStock ?? 0);
    const disc = phyStock - sysStock;

    const audit: DbStockVerification = {
      id: genId('stv'),
      verificationCode: code,
      warehouseId: data.warehouseId!,
      warehouseName: wh?.name || 'Warehouse Yard',
      materialId: data.materialId!,
      materialName: mat?.name || 'Material Item',
      systemStock: sysStock,
      physicalStock: phyStock,
      discrepancy: disc,
      reason: data.reason || 'Physical Stock Verification Audit',
      verifiedById: data.verifiedById || 'usr-str-005',
      verifiedByName: data.verifiedByName || 'Auditor',
      status: 'ADJUSTED',
      createdAt: now,
    };

    await db.insert(stockVerifications).values(audit);

    if (disc !== 0 && mat) {
      await this.createStockTransaction({
        materialId: mat.id,
        warehouseId: data.warehouseId!,
        transactionType: 'ADJUSTMENT',
        quantity: phyStock,
        unitPrice: mat.unitPrice,
        notes: `Physical verification audit variance adjustment (${disc > 0 ? '+' : ''}${disc})`,
      });
    }

    return audit;
  }

  // ==========================================
  // INVENTORY REPORTS & ANALYTICS
  // ==========================================
  async getInventoryAnalytics() {
    await ensureInventorySeeded();
    const activeMaterials = (await db.select().from(materials).where(eq(materials.isActive, true))) as DbMaterial[];
    const activeWarehouses = (await db.select().from(warehouses).where(eq(warehouses.isActive, true))) as DbWarehouse[];

    const totalMaterials = activeMaterials.length;
    const totalWarehouses = activeWarehouses.length;

    let totalValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    activeMaterials.forEach((m) => {
      totalValuation += m.currentStock * m.unitPrice;
      if (m.currentStock === 0) outOfStockCount++;
      else if (m.currentStock <= m.reorderLevel) lowStockCount++;
    });

    const allTxns = (await db.select().from(stockTransactions)) as DbStockTransaction[];
    allTxns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recentTransactions = allTxns.slice(0, 5);

    const allPRs = await db.select().from(purchaseRequests);
    const pendingRequisitions = allPRs.filter((r) => r.status === 'SUBMITTED' || r.status === 'VERIFIED').length;

    const fastMoving: DbMaterial[] = [];
    const slowMoving: DbMaterial[] = [];
    const deadStock: DbMaterial[] = [];

    activeMaterials.forEach((m) => {
      const issueTxns = allTxns.filter((t) => t.materialId === m.id && t.transactionType === 'GOODS_ISSUE');
      const totalIssued = issueTxns.reduce((acc, curr) => acc + curr.quantity, 0);

      if (totalIssued > 100) fastMoving.push(m);
      else if (totalIssued > 0) slowMoving.push(m);
      else deadStock.push(m);
    });

    return {
      totalMaterials,
      totalWarehouses,
      totalValuation,
      lowStockCount,
      outOfStockCount,
      pendingRequisitions,
      recentTransactions,
      movementBreakdown: {
        fastMovingCount: fastMoving.length,
        slowMovingCount: slowMoving.length,
        deadStockCount: deadStock.length,
      },
    };
  }

  // ==========================================
  // PHASE 55: MATERIAL SUBCATEGORIES
  // ==========================================
  async getMaterialSubcategories(categoryId?: string) {
    await ensureInventorySeeded();
    if (categoryId) {
      return (await db.select().from(materialSubcategories).where(eq(materialSubcategories.categoryId, categoryId))) as DbMaterialSubcategory[];
    }
    return (await db.select().from(materialSubcategories)) as DbMaterialSubcategory[];
  }

  async createMaterialSubcategory(data: Partial<DbMaterialSubcategory>): Promise<DbMaterialSubcategory> {
    await ensureInventorySeeded();
    const now = new Date().toISOString();
    const subcat: DbMaterialSubcategory = {
      id: genId('subcat'),
      code: data.code || `SUBCAT-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name || 'General Subcategory',
      categoryId: data.categoryId || 'cat-001',
      description: data.description || '',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(materialSubcategories).values(subcat);
    return subcat;
  }

  // ==========================================
  // PHASE 55: WAREHOUSE LOCATIONS (ZONE/RACK/SHELF/BIN)
  // ==========================================
  async getWarehouseLocations(warehouseId?: string) {
    await ensureInventorySeeded();
    if (warehouseId) {
      return (await db.select().from(warehouseLocations).where(eq(warehouseLocations.warehouseId, warehouseId))) as DbWarehouseLocation[];
    }
    return (await db.select().from(warehouseLocations)) as DbWarehouseLocation[];
  }

  async createWarehouseLocation(data: Partial<DbWarehouseLocation>): Promise<DbWarehouseLocation> {
    await ensureInventorySeeded();
    const now = new Date().toISOString();
    const loc: DbWarehouseLocation = {
      id: genId('loc'),
      code: data.code || `LOC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name || 'Rack A1 - Bin 01',
      warehouseId: data.warehouseId || 'wh-001',
      zone: data.zone || 'Zone A',
      rack: data.rack || 'Rack 01',
      shelf: data.shelf || 'Shelf 1',
      bin: data.bin || 'Bin 01',
      capacity: Number(data.capacity || 1000),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(warehouseLocations).values(loc);
    return loc;
  }

  // ==========================================
  // PHASE 55: GOODS RECEIPTS (GRN CONSOLIDATION)
  // ==========================================
  async getGoodsReceipts(params?: PaginationParams & { warehouseId?: string }) {
    await ensureInventorySeeded();
    await legacyProcurementTelemetry.logEvent({
      eventType: 'LEGACY_READ_REDIRECTED',
      caller: 'InventoryRepository.getGoodsReceipts',
      legacyTarget: 'goods_receipts',
      activeTarget: 'procurement_grns',
      details: { params },
    });

    // 1. Fetch active GRNs from Single Source of Truth
    const activeGrns = await db.select().from(procurementGrnsTable);
    const normalizedActive = activeGrns.map((g) => legacyProcurementAdapter.normalizeGRNFromActive(g));

    // 2. Fetch legacy GRNs for backward compatibility / historical preservation
    let legacyGrnRows = (await db.select().from(goodsReceipts)) as DbGoodsReceipt[];
    const allItems = (await db.select().from(goodsReceiptItems)) as DbGoodsReceiptItem[];
    const legacyMap = new Map<string, any>();
    for (const g of legacyGrnRows) {
      legacyMap.set(g.grnNumber, {
        ...g,
        items: allItems.filter((item) => item.grnId === g.id),
      });
    }

    // Merge without duplicating grnNumber
    const mergedMap = new Map<string, any>();
    for (const g of normalizedActive) {
      mergedMap.set(g.grnNumber, g);
    }
    for (const [grnNum, legG] of legacyMap.entries()) {
      if (!mergedMap.has(grnNum)) {
        mergedMap.set(grnNum, legG);
      }
    }

    let allMerged = Array.from(mergedMap.values());
    if (params?.warehouseId) {
      allMerged = allMerged.filter((g) => g.warehouseId === params.warehouseId);
    }
    allMerged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const total = allMerged.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = allMerged.slice(start, start + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async getGoodsReceiptById(id: string): Promise<DbGoodsReceipt | null> {
    await ensureInventorySeeded();
    // Check active table first
    const [actGrn] = await db.select().from(procurementGrnsTable).where(eq(procurementGrnsTable.id, id));
    if (actGrn) {
      return legacyProcurementAdapter.normalizeGRNFromActive(actGrn);
    }

    const grn = (await db.select().from(goodsReceipts).where(eq(goodsReceipts.id, id)))[0] as DbGoodsReceipt;
    if (!grn) return null;

    const items = (await db.select().from(goodsReceiptItems).where(eq(goodsReceiptItems.grnId, id))) as DbGoodsReceiptItem[];
    return { ...grn, items };
  }

  async createGoodsReceipt(data: {
    grnNumber?: string;
    poNumber?: string;
    vendorId?: string;
    vendorName?: string;
    companyId?: string;
    warehouseId: string;
    warehouseName?: string;
    deliveryNoteNo?: string;
    receivedDate?: string;
    receivedBy?: string;
    inspectedBy?: string;
    qcStatus?: string;
    notes?: string;
    items: Array<{
      materialId: string;
      materialCode?: string;
      materialName?: string;
      orderedQty: number;
      receivedQty: number;
      acceptedQty?: number;
      rejectedQty?: number;
      unitPrice?: number;
      batchNumber?: string;
      expiryDate?: string;
      locationId?: string;
      remarks?: string;
    }>;
  }): Promise<DbGoodsReceipt> {
    await ensureInventorySeeded();
    const now = new Date().toISOString();
    const grnId = genId('grn');

    const receivedBy = String(data.receivedBy || '').trim();
    const inspectedBy = String(data.inspectedBy || '').trim();
    if (!receivedBy || !inspectedBy) throw new Error('Receiver and inspector identities are required for GRN creation.');
    const wh = await this.getWarehouseById(data.warehouseId);
    if (!wh || !wh.isActive) throw new Error('Warehouse not found or inactive.');
    const whName = wh.name;

    return await db.transaction(async (tx) => {
      let companyId = String(data.companyId || '').trim();
      if (!companyId && data.poNumber) {
        const poRows = await tx.select().from(procurementPurchaseOrdersTable).where(eq(procurementPurchaseOrdersTable.poNumber, data.poNumber)).limit(1);
        const poProjectId = poRows[0]?.projectId;
        if (poProjectId) {
          const [project] = await tx.select().from(projects).where(eq(projects.id, poProjectId)).limit(1);
          companyId = String(project?.companyId || '').trim();
        }
      }
      if (!data.grnNumber && !companyId) throw new Error('Company context is required when generating a GRN number.');
      const grnNum = data.grnNumber || (await numberingService.generateGoodsReceiptNumber({
        companyId,
        projectId: null,
        date: data.receivedDate || now,
      }, tx));

      // 1. If PO is specified, validate item-level receipt balances & prevent over-receipt
      let poRecord: any = null;
      if (data.poNumber) {
        const poRows = await tx
          .select()
          .from(procurementPurchaseOrdersTable)
          .where(eq(procurementPurchaseOrdersTable.poNumber, data.poNumber))
          .limit(1);
        if (poRows[0]) poRecord = poRows[0];
      }

      if (poRecord && Array.isArray(poRecord.items)) {
        for (const item of data.items) {
          const poItem = poRecord.items.find(
            (pi: any) =>
              (item.materialCode && pi.itemCode === item.materialCode) ||
              (item.materialName && (pi.description === item.materialName || pi.materialName === item.materialName))
          );
          if (poItem) {
            const acceptedQty = Number(item.acceptedQty ?? item.receivedQty ?? 0);
            const orderedQty = Number(poItem.quantity || item.orderedQty || 0);
            const prevAccepted = Number(poItem.acceptedQuantity || poItem.receivedQuantity || 0);
            const remaining = Math.max(0, orderedQty - prevAccepted);

            if (acceptedQty > remaining) {
              throw new Error(
                `Over-receipt protection violation: Attempted to accept ${acceptedQty} units for item '${item.materialCode || item.materialName}', but remaining PO balance is only ${remaining} units.`
              );
            }
          }
        }
      }

      let totalVal = 0;
      const itemsToInsert: DbGoodsReceiptItem[] = [];

      for (const item of data.items) {
        const mat = await this.getMaterialById(item.materialId);
        const unitPrice = Number(item.unitPrice ?? mat?.unitPrice ?? 0);
        const acceptedQty = Number(item.acceptedQty ?? item.receivedQty ?? 0);
        totalVal += acceptedQty * unitPrice;

        itemsToInsert.push({
          id: genId('grni'),
          grnId,
          materialId: item.materialId,
          materialCode: item.materialCode || mat?.itemCode || 'MAT-ITEM',
          materialName: item.materialName || mat?.name || 'Material',
          orderedQty: Number(item.orderedQty || 0),
          receivedQty: Number(item.receivedQty || 0),
          acceptedQty,
          rejectedQty: Number(item.rejectedQty || 0),
          unitPrice,
          batchNumber: item.batchNumber || `BATCH-${Date.now().toString().slice(-6)}`,
          expiryDate: item.expiryDate || '',
          locationId: item.locationId || '',
          remarks: item.remarks || '',
          createdAt: now,
        });

        // Update material stock & create stock transaction atomically (Goods Receipt)
        if (mat && acceptedQty > 0) {
          await this.createStockTransaction(
            {
              materialId: mat.id,
              materialCode: mat.itemCode,
              materialName: mat.name,
              warehouseId: data.warehouseId,
              warehouseName: whName,
              transactionType: 'GOODS_RECEIPT',
              quantity: acceptedQty,
              unitPrice,
              totalValue: acceptedQty * unitPrice,
              referenceDoc: grnNum,
              notes: `GRN Received: ${grnNum}`,
              receivedByName: receivedBy,
            },
            tx
          );
        }
      }

      const grnRecord: DbGoodsReceipt = {
        id: grnId,
        grnNumber: grnNum,
        poNumber: data.poNumber || '',
        vendorId: data.vendorId || '',
        vendorName: data.vendorName || '',
        warehouseId: data.warehouseId,
        warehouseName: whName,
        deliveryNoteNo: data.deliveryNoteNo || '',
        receivedDate: data.receivedDate || now.slice(0, 10),
        receivedBy,
        inspectedBy,
        qcStatus: data.qcStatus || 'PENDING_INSPECTION',
        totalValue: totalVal,
        status: 'COMPLETED',
        notes: data.notes || '',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      await tx.insert(goodsReceipts).values(grnRecord);
      for (const item of itemsToInsert) {
        await tx.insert(goodsReceiptItems).values(item);
      }

      // Update linked PO item quantities and progressive status atomically
      if (poRecord && Array.isArray(poRecord.items)) {
        let allCompleted = true;
        let anyReceived = false;

        const updatedPoItems = poRecord.items.map((pi: any) => {
          const matchingReceived = itemsToInsert.find(
            (gi) =>
              (gi.materialCode && gi.materialCode === pi.itemCode) ||
              (gi.materialName && (gi.materialName === pi.description || gi.materialName === pi.materialName))
          );

          const ordered = Number(pi.quantity || 0);
          const addAccepted = matchingReceived ? matchingReceived.acceptedQty : 0;
          const addReceived = matchingReceived ? matchingReceived.receivedQty : 0;
          const addRejected = matchingReceived ? matchingReceived.rejectedQty : 0;

          const newAccepted = (Number(pi.acceptedQuantity || 0)) + addAccepted;
          const newReceived = (Number(pi.receivedQuantity || 0)) + addReceived;
          const newRejected = (Number(pi.rejectedQuantity || 0)) + addRejected;
          const newBalance = Math.max(0, ordered - newAccepted);

          if (newBalance > 0) allCompleted = false;
          if (newAccepted > 0 || newReceived > 0) anyReceived = true;

          return {
            ...pi,
            receivedQuantity: newReceived,
            acceptedQuantity: newAccepted,
            rejectedQuantity: newRejected,
            balanceQuantity: newBalance,
          };
        });

        const newPoStatus = allCompleted && updatedPoItems.length > 0 ? 'Completed' : (anyReceived ? 'Partially Received' : poRecord.status);

        await tx
          .update(procurementPurchaseOrdersTable)
          .set({
            items: updatedPoItems,
            status: newPoStatus,
          } as any)
          .where(eq(procurementPurchaseOrdersTable.id, poRecord.id));
      }

      await this.logInventoryAction({
        actionType: 'GRN',
        performedBy: receivedBy,
        details: `Created GRN ${grnNum} with ${itemsToInsert.length} items totaling ${totalVal} in transaction currency`,
        warehouseId: data.warehouseId,
      });

      return { ...grnRecord, items: itemsToInsert };
    });
  }

  // ==========================================
  // PHASE 55: MATERIAL ISSUES
  // ==========================================
  async getMaterialIssues(params?: PaginationParams & { projectId?: string; warehouseId?: string }) {
    await ensureInventorySeeded();
    let issues = (await db.select().from(materialIssues)) as DbMaterialIssue[];
    if (params?.projectId) {
      issues = issues.filter((i) => i.projectId === params.projectId);
    }
    if (params?.warehouseId) {
      issues = issues.filter((i) => i.warehouseId === params.warehouseId);
    }
    issues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const allItems = (await db.select().from(materialIssueItems)) as DbMaterialIssueItem[];
    const result = issues.map((i) => ({
      ...i,
      items: allItems.filter((item) => item.issueId === i.id),
    }));

    return { data: result, total: result.length, page: params?.page || 1, limit: params?.limit || 20 };
  }

  async getMaterialIssueById(id: string): Promise<DbMaterialIssue | null> {
    await ensureInventorySeeded();
    const issue = (await db.select().from(materialIssues).where(eq(materialIssues.id, id)))[0] as DbMaterialIssue;
    if (!issue) return null;

    const items = (await db.select().from(materialIssueItems).where(eq(materialIssueItems.issueId, id))) as DbMaterialIssueItem[];
    return { ...issue, items };
  }

  async createMaterialIssue(data: {
    issueNumber?: string;
    projectId?: string;
    projectName?: string;
    wbsId?: string;
    wbsCode?: string;
    boqItemId?: string;
    boqRef?: string;
    costCodeId?: string;
    costCode?: string;
    department?: string;
    warehouseId: string;
    warehouseName?: string;
    issuedTo?: string;
    recipientName?: string;
    issuedBy?: string;
    issueDate?: string;
    notes?: string;
    items: Array<{
      materialId: string;
      materialCode?: string;
      materialName?: string;
      requestedQty: number;
      issuedQty: number;
      unitPrice?: number;
      batchNumber?: string;
      locationId?: string;
      remarks?: string;
    }>;
  }): Promise<DbMaterialIssue> {
    await ensureInventorySeeded();
    const now = new Date().toISOString();
    const issueId = genId('miv');

    const projectId = String(data.projectId || '').trim();
    const issuedBy = String(data.issuedBy || '').trim();
    const issuedTo = String(data.issuedTo || data.recipientName || '').trim();
    if (!projectId || !issuedBy || !issuedTo || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Project, issuer, recipient and at least one material issue item are required.');
    }

    const wh = await this.getWarehouseById(data.warehouseId);
    if (!wh || !wh.isActive) throw new Error('Warehouse not found or inactive.');
    const whName = wh.name;

    const [project] = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.isActive, true))).limit(1);
    if (!project) throw new Error('Project not found or inactive.');

    const wbsId = String(data.wbsId || '').trim();
    const boqItemId = String(data.boqItemId || '').trim();
    const costCodeId = String(data.costCodeId || '').trim();
    const costCode = String(data.costCode || '').trim();

    if (wbsId) {
      const [wbs] = await db.select().from(projectWbs).where(and(eq(projectWbs.id, wbsId), eq(projectWbs.projectId, projectId))).limit(1);
      if (!wbs) throw new Error('WBS reference does not belong to the selected project.');
    }

    if (boqItemId) {
      const [boq] = await db.select().from(boqItems).where(and(eq(boqItems.id, boqItemId), eq(boqItems.projectId, projectId))).limit(1);
      if (!boq) throw new Error('BOQ item reference does not belong to the selected project.');
      if (wbsId && boq.wbsId !== wbsId) throw new Error('Selected BOQ item does not belong to the selected WBS.');
    }

    if (costCodeId) {
      const [codeRow] = await db.select().from(costCodes).where(and(eq(costCodes.id, costCodeId), eq(costCodes.isActive, true))).limit(1);
      if (!codeRow) throw new Error('Cost code reference was not found or is inactive.');
      if (codeRow.projectId && codeRow.projectId !== projectId) throw new Error('Cost code does not belong to the selected project.');
      if (wbsId && codeRow.wbsId && codeRow.wbsId !== wbsId) throw new Error('Cost code does not belong to the selected WBS.');
    }

    const companyId = String(project.companyId || '').trim();
    if (!companyId) throw new Error('Project company context is required for inventory numbering.');

    const createdResult = await db.transaction(async (tx) => {
      const issueNum = data.issueNumber || (await numberingService.generateMaterialIssueNumber({
        companyId,
        projectId,
        date: data.issueDate || now,
      }, tx));

      let totalIssueCost = 0;
      const itemsToInsert: DbMaterialIssueItem[] = [];

      for (const item of data.items) {
        const mat = await this.getMaterialById(item.materialId);
        const unitPrice = Number(item.unitPrice ?? mat?.unitPrice ?? 0);
        const issuedQty = Number(item.issuedQty || 0);
        const itemTotal = issuedQty * unitPrice;
        totalIssueCost += itemTotal;

        itemsToInsert.push({
          id: genId('mivi'),
          issueId,
          materialId: item.materialId,
          materialCode: item.materialCode || mat?.itemCode || 'MAT-ITEM',
          materialName: item.materialName || mat?.name || 'Material',
          wbsId: (item as any).wbsId || wbsId || null,
          boqItemId: (item as any).boqItemId || boqItemId || null,
          costCodeId: (item as any).costCodeId || costCodeId || null,
          costCode: (item as any).costCode || costCode || null,
          requestedQty: Number(item.requestedQty || 0),
          issuedQty,
          unitPrice,
          batchNumber: item.batchNumber || '',
          locationId: item.locationId || '',
          remarks: item.remarks || '',
          createdAt: now,
        });

        // Deduct stock & create stock transaction atomically (Goods Issue)
        if (mat && issuedQty > 0) {
          await this.createStockTransaction(
            {
              materialId: mat.id,
              materialCode: mat.itemCode,
              materialName: mat.name,
              warehouseId: data.warehouseId,
              warehouseName: whName,
              transactionType: 'GOODS_ISSUE',
              quantity: issuedQty,
              unitPrice,
              totalValue: itemTotal,
              projectId,
              projectName: project.projectName,
              referenceDoc: issueNum,
              notes: `Material Issue Note: ${issueNum} to ${data.issuedTo}`,
              issuedByName: issuedBy,
              approvedByName: data.approvedBy?.trim() || undefined,
              receivedByName: data.recipientName?.trim() || issuedTo,
            },
            tx
          );
        }
      }

      const issueRecord: DbMaterialIssue = {
        id: issueId,
        issueNumber: issueNum,
        projectId,
        projectName: project.projectName,
        wbsId: wbsId || '',
        wbsCode: data.wbsCode || '',
        boqItemId: boqItemId || '',
        boqRef: data.boqRef || '',
        costCodeId: costCodeId || '',
        costCode: costCode || '',
        department: data.department || 'Site Construction',
        warehouseId: data.warehouseId,
        warehouseName: whName,
        issuedTo,
        issuedBy,
        issueDate: data.issueDate || now.slice(0, 10),
        status: 'ISSUED',
        notes: data.notes || '',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      await tx.insert(materialIssues).values(issueRecord);
      for (const item of itemsToInsert) {
        await tx.insert(materialIssueItems).values(item);
      }

      // INTEGRATION: Material Issue -> Project Cost Consumption
      // Atomically update procurementCostControlsTable (Actual Spent) for the project
      if (data.projectId && totalIssueCost > 0) {
        const costRows = await tx
          .select()
          .from(procurementCostControlsTable)
          .where(
            or(
              eq(procurementCostControlsTable.projectId, data.projectId),
              eq(procurementCostControlsTable.projectName, data.projectName || '')
            )
          )
          .limit(1);

        if (costRows.length > 0) {
          const cost = costRows[0];
          const newMaterialCost = (cost.materialCostUSD || 0) + totalIssueCost;
          const newTotalSpent =
            newMaterialCost +
            (cost.labourCostUSD || 0) +
            (cost.equipmentCostUSD || 0) +
            (cost.vehicleCostUSD || 0) +
            (cost.runningCostUSD || 0);
          const newRemaining = (cost.totalBudgetUSD || 0) - (newTotalSpent + (cost.committedPOUSD || 0));
          const newVariancePercent = (cost.totalBudgetUSD || 0) > 0 ? (newRemaining / cost.totalBudgetUSD) * 100 : 0;
          const newCostStatus =
            newRemaining < 0
              ? 'Budget Exceeded'
              : (newRemaining / (cost.totalBudgetUSD || 1) < 0.1 ? 'Over Budget Warning' : 'Optimal');

          await tx
            .update(procurementCostControlsTable)
            .set({
              materialCostUSD: newMaterialCost,
              totalSpentUSD: newTotalSpent,
              remainingBudgetUSD: newRemaining,
              costVarianceUSD: newRemaining,
              variancePercent: newVariancePercent,
              costStatus: newCostStatus,
              updatedAt: now,
            } as any)
            .where(eq(procurementCostControlsTable.id, cost.id));

          // Post audit log entry for commercial integrity
          await tx.insert(procurementLogs).values({
            id: `plog_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            entityType: 'COST_CONTROL',
            entityId: cost.id,
            entityNumber: cost.projectId || data.projectId,
            actionType: 'MATERIAL_ISSUE_COST_POSTING',
            performedBy: issuedBy,
            details: `Posted actual material issue cost of USD ${totalIssueCost.toFixed(2)} (${issueNum}) to Project Cost Control. Total Material Cost: USD ${newMaterialCost.toFixed(2)}.`,
            createdAt: now,
            updatedAt: now,
          } as any);
        }
      }

      await this.logInventoryAction({
        actionType: 'ISSUE',
        performedBy: issuedBy,
        details: `Issued material voucher ${issueNum} for ${data.issuedTo} (Project: ${data.projectName || 'N/A'}) totaling USD ${totalIssueCost.toFixed(2)}`,
        warehouseId: data.warehouseId,
      });

      await enterpriseAuditRepository.logEvent(
        {
          userName: issuedBy,
          actionType: 'CREATE',
          entityType: 'MATERIAL_ISSUE',
          entityId: issueId,
          entityNumber: issueNum,
          fromState: 'DRAFT',
          toState: 'ISSUED',
          metadata: {
            projectId: data.projectId,
            projectName: data.projectName,
            warehouseId: data.warehouseId,
            warehouseName: whName,
            issuedTo: data.issuedTo,
            totalCost: totalIssueCost,
            itemsCount: itemsToInsert.length,
          },
          reason: `Material issue voucher ${issueNum} created with ${itemsToInsert.length} items`,
        },
        tx
      );


      // Cross-module accounting is part of the same DB transaction as stock,
      // material-issue and project-cost updates. Any GL failure rolls back the issue.
      if (totalIssueCost > 0) {
        await financeRepository.createJournalEntry(
          {
            voucherType: 'MATERIAL_ISSUE_JOURNAL',
            postingDate: (data.issueDate || now).slice(0, 10),
            referenceNumber: issueNum,
            narration: `Material issue voucher ${issueNum} for ${data.issuedTo}`,
            postedBy: issuedBy,
            createdBy: issuedBy,
            updatedBy: issuedBy,
          },
          [
            {
              accountCode: '5010',
              accountName: 'Direct Site Materials & Consumables',
              debitAmount: totalIssueCost,
              creditAmount: 0,
              costCenterId: data.projectId,
              lineDescription: `Material consumption on site (${itemsToInsert.length} items)`,
            },
            {
              accountCode: '1030',
              accountName: 'Raw Materials & Inventory Control',
              debitAmount: 0,
              creditAmount: totalIssueCost,
              costCenterId: data.warehouseId,
              lineDescription: `Stock release from warehouse ${whName}`,
            },
          ],
          tx
        );
      }

      return { ...issueRecord, items: itemsToInsert };
    });

    return createdResult;
  }

  // ==========================================
  // PHASE 55: MATERIAL TRANSFERS
  // ==========================================
  async getMaterialTransfers(params?: PaginationParams) {
    await ensureInventorySeeded();
    const transfers = (await db.select().from(materialTransfers)) as DbMaterialTransfer[];
    transfers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const allItems = (await db.select().from(materialTransferItems)) as DbMaterialTransferItem[];
    const result = transfers.map((t) => ({
      ...t,
      items: allItems.filter((item) => item.transferId === t.id),
    }));

    return { data: result, total: result.length, page: params?.page || 1, limit: params?.limit || 20 };
  }

  async createMaterialTransfer(data: {
    transferNumber?: string;
    companyId?: string;
    sourceWarehouseId: string;
    targetWarehouseId: string;
    requestedBy?: string;
    approvedBy?: string;
    dispatchedBy?: string;
    receivedBy?: string;
    transferDate?: string;
    notes?: string;
    items: Array<{ materialId: string; materialCode?: string; materialName?: string; transferQty: number; batchNumber?: string; remarks?: string }>;
  }): Promise<DbMaterialTransfer> {
    await ensureInventorySeeded();
    const now = new Date().toISOString();
    const transferId = genId('mtr');
    const requestedBy = String(data.requestedBy || '').trim();
    const approvedBy = String(data.approvedBy || '').trim();
    const dispatchedBy = String(data.dispatchedBy || '').trim();
    const receivedBy = String(data.receivedBy || '').trim();
    if (!requestedBy || !approvedBy || !dispatchedBy || !receivedBy) throw new Error('Requester, approver, dispatcher and receiver identities are required for stock transfer.');
    if (dispatchedBy.toLowerCase() === approvedBy.toLowerCase()) throw new Error('Maker-checker violation: dispatcher cannot approve the same stock transfer.');
    if (!data.sourceWarehouseId || !data.targetWarehouseId || data.sourceWarehouseId === data.targetWarehouseId || !Array.isArray(data.items) || data.items.length === 0) throw new Error('Distinct source/target warehouses and transfer items are required.');

    const srcWh = await this.getWarehouseById(data.sourceWarehouseId);
    const tgtWh = await this.getWarehouseById(data.targetWarehouseId);
    if (!srcWh || !srcWh.isActive || !tgtWh || !tgtWh.isActive) throw new Error('Source and target warehouses must both exist and be active.');

    let companyId = String(data.companyId || '').trim();
    if (!companyId) throw new Error('Company context is required for transfer numbering.');
    const transferNum = data.transferNumber || await numberingService.generateMaterialTransferNumber({ companyId, date: data.transferDate || now });

    return await db.transaction(async (tx) => {
      const itemsToInsert: DbMaterialTransferItem[] = [];
      for (const item of data.items) {
        const materialId = String(item.materialId || '').trim();
        const transferQty = Number(item.transferQty);
        if (!materialId || !Number.isFinite(transferQty) || transferQty <= 0) throw new Error('Every transfer line requires a material and positive quantity.');
        const [mat] = await tx.select().from(materials).where(and(eq(materials.id, materialId), eq(materials.isActive, true))).limit(1);
        if (!mat) throw new Error('Transfer material not found or inactive.');

        itemsToInsert.push({
          id: genId('mtri'), transferId, materialId: mat.id, materialCode: mat.itemCode, materialName: mat.name, transferQty, batchNumber: item.batchNumber || '', remarks: item.remarks || '', createdAt: now,
        });

        await this.createStockTransaction({
          materialId: mat.id, materialCode: mat.itemCode, materialName: mat.name, warehouseId: data.sourceWarehouseId, warehouseName: srcWh.name,
          targetWarehouseId: data.targetWarehouseId, targetWarehouseName: tgtWh.name, transactionType: 'TRANSFER', quantity: transferQty, unitPrice: mat.unitPrice,
          totalValue: transferQty * mat.unitPrice, referenceDoc: transferNum, notes: `Inter-warehouse transfer ${transferNum} from ${srcWh.name} to ${tgtWh.name}`,
          issuedByName: dispatchedBy, receivedByName: receivedBy, approvedByName: approvedBy,
        }, tx);
      }

      const transferRecord: DbMaterialTransfer = {
        id: transferId, transferNumber: transferNum, sourceWarehouseId: data.sourceWarehouseId, sourceWarehouseName: srcWh.name, targetWarehouseId: data.targetWarehouseId, targetWarehouseName: tgtWh.name,
        requestedBy, approvedBy, dispatchedBy, receivedBy, transferDate: data.transferDate || now.slice(0,10), status: 'COMPLETED', notes: data.notes || '', isActive: true, createdAt: now, updatedAt: now,
      };
      await tx.insert(materialTransfers).values(transferRecord);
      for (const item of itemsToInsert) await tx.insert(materialTransferItems).values(item);
      await this.logInventoryAction({ actionType: 'TRANSFER', performedBy: dispatchedBy, details: `Transferred ${itemsToInsert.length} material items from ${srcWh.name} to ${tgtWh.name} (${transferNum})`, warehouseId: data.sourceWarehouseId });
      return { ...transferRecord, items: itemsToInsert };
    });
  }
  // ==========================================
  // PHASE 55: MATERIAL RETURNS
  // ==========================================
  async getMaterialReturns(params?: PaginationParams) {
    await ensureInventorySeeded();
    const returns = (await db.select().from(materialReturns)) as DbMaterialReturn[];
    returns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const allItems = (await db.select().from(materialReturnItems)) as DbMaterialReturnItem[];
    const result = returns.map((r) => ({
      ...r,
      items: allItems.filter((item) => item.returnId === r.id),
    }));

    return { data: result, total: result.length, page: params?.page || 1, limit: params?.limit || 20 };
  }

  async createMaterialReturn(data: {
    returnNumber?: string;
    returnType?: string;
    projectId?: string;
    projectName?: string;
    warehouseId: string;
    returnedBy: string;
    receivedBy?: string;
    returnDate?: string;
    reason?: string;
    items: Array<{
      materialId: string;
      materialCode?: string;
      materialName?: string;
      returnedQty: number;
      unitPrice?: number;
      batchNumber?: string;
      condition?: string;
      remarks?: string;
    }>;
  }): Promise<DbMaterialReturn> {
    await ensureInventorySeeded();
    const now = new Date().toISOString();
    const returnId = genId('mrt');

    const returnedBy = String(data.returnedBy || '').trim();
    const receivedBy = String(data.receivedBy || '').trim();
    if (!returnedBy || !receivedBy || !Array.isArray(data.items) || data.items.length === 0) throw new Error('Returner, receiver and at least one return item are required.');
    if (data.returnType !== 'INVENTORY_ONLY' && !String(data.projectId || '').trim()) throw new Error('Project is required for a site-to-store material return.');
    const wh = await this.getWarehouseById(data.warehouseId);
    if (!wh || !wh.isActive) throw new Error('Warehouse not found or inactive.');
    const whName = wh.name;
    let companyId = String((data as any).companyId || '').trim();
    if (data.projectId) {
      const [project] = await db.select().from(projects).where(and(eq(projects.id, data.projectId), eq(projects.isActive, true))).limit(1);
      if (!project) throw new Error('Project not found or inactive.');
      companyId = companyId || String(project.companyId || '').trim();
    }
    if (!companyId && !data.returnNumber) throw new Error('Company context is required when generating the material return number.');

    return await db.transaction(async (tx) => {
      const returnNum = data.returnNumber || (await numberingService.generateMaterialReturnNumber({
        companyId,
        projectId: data.projectId || null,
        date: data.returnDate || now,
      }, tx));

      let totalReturnCost = 0;
      const itemsToInsert: DbMaterialReturnItem[] = [];

      for (const item of data.items) {
        const mat = await this.getMaterialById(item.materialId);
        const unitPrice = Number(item.unitPrice ?? mat?.unitPrice ?? 0);
        const returnedQty = Number(item.returnedQty || 0);
        const itemTotal = returnedQty * unitPrice;
        totalReturnCost += itemTotal;

        itemsToInsert.push({
          id: genId('mrti'),
          returnId,
          materialId: item.materialId,
          materialCode: item.materialCode || mat?.itemCode || 'MAT-ITEM',
          materialName: item.materialName || mat?.name || 'Material',
          returnedQty,
          unitPrice,
          batchNumber: item.batchNumber || '',
          condition: item.condition || 'GOOD',
          remarks: item.remarks || '',
          createdAt: now,
        });

        // Increase stock for returned item in store atomically
        if (mat && returnedQty > 0) {
          await this.createStockTransaction(
            {
              materialId: mat.id,
              materialCode: mat.itemCode,
              materialName: mat.name,
              warehouseId: data.warehouseId,
              warehouseName: whName,
              transactionType: 'RETURN',
              quantity: returnedQty,
              unitPrice,
              totalValue: itemTotal,
              projectId: data.projectId,
              projectName: data.projectName,
              referenceDoc: returnNum,
              notes: `Material Return ${returnNum}: ${data.reason || 'Excess material return'}`,
              receivedByName: receivedBy,
              issuedByName: returnedBy,
            },
            tx
          );
        }
      }

      const returnRecord: DbMaterialReturn = {
        id: returnId,
        returnNumber: returnNum,
        returnType: data.returnType || 'SITE_TO_STORE',
        projectId: data.projectId || '',
        projectName: data.projectName || '',
        warehouseId: data.warehouseId,
        warehouseName: whName,
        returnedBy,
        receivedBy,
        returnDate: data.returnDate || now.slice(0, 10),
        status: 'RECEIVED',
        reason: data.reason || 'Project completion surplus',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      await tx.insert(materialReturns).values(returnRecord);
      for (const item of itemsToInsert) {
        await tx.insert(materialReturnItems).values(item);
      }

      // INTEGRATION: Material Return -> Project Cost Consumption Reversal
      if (data.projectId && totalReturnCost > 0) {
        const costRows = await tx
          .select()
          .from(procurementCostControlsTable)
          .where(
            or(
              eq(procurementCostControlsTable.projectId, data.projectId),
              eq(procurementCostControlsTable.projectName, data.projectName || '')
            )
          )
          .limit(1);

        if (costRows.length > 0) {
          const cost = costRows[0];
          const newMaterialCost = Math.max(0, (cost.materialCostUSD || 0) - totalReturnCost);
          const newTotalSpent =
            newMaterialCost +
            (cost.labourCostUSD || 0) +
            (cost.equipmentCostUSD || 0) +
            (cost.vehicleCostUSD || 0) +
            (cost.runningCostUSD || 0);
          const newRemaining = (cost.totalBudgetUSD || 0) - (newTotalSpent + (cost.committedPOUSD || 0));
          const newVariancePercent = (cost.totalBudgetUSD || 0) > 0 ? (newRemaining / cost.totalBudgetUSD) * 100 : 0;
          const newCostStatus =
            newRemaining < 0
              ? 'Budget Exceeded'
              : (newRemaining / (cost.totalBudgetUSD || 1) < 0.1 ? 'Over Budget Warning' : 'Optimal');

          await tx
            .update(procurementCostControlsTable)
            .set({
              materialCostUSD: newMaterialCost,
              totalSpentUSD: newTotalSpent,
              remainingBudgetUSD: newRemaining,
              costVarianceUSD: newRemaining,
              variancePercent: newVariancePercent,
              costStatus: newCostStatus,
              updatedAt: now,
            } as any)
            .where(eq(procurementCostControlsTable.id, cost.id));

          // Post audit log entry for commercial integrity
          await tx.insert(procurementLogs).values({
            id: `plog_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            entityType: 'COST_CONTROL',
            entityId: cost.id,
            entityNumber: cost.projectId || data.projectId,
            actionType: 'MATERIAL_RETURN_COST_REVERSAL',
            performedBy: receivedBy,
            details: `Reversed material cost of USD ${totalReturnCost.toFixed(2)} (${returnNum}) in Project Cost Control. New Material Cost: USD ${newMaterialCost.toFixed(2)}.`,
            createdAt: now,
            updatedAt: now,
          } as any);
        }
      }

      await this.logInventoryAction({
        actionType: 'RETURN',
        performedBy: receivedBy,
        details: `Processed material return ${returnNum} into ${whName} (${itemsToInsert.length} items totaling USD ${totalReturnCost.toFixed(2)})`,
        warehouseId: data.warehouseId,
      });

      await enterpriseAuditRepository.logEvent(
        {
          userName: receivedBy,
          actionType: 'CREATE',
          entityType: 'MATERIAL_RETURN',
          entityId: returnId,
          entityNumber: returnNum,
          fromState: 'DRAFT',
          toState: 'RECEIVED',
          metadata: {
            projectId: data.projectId,
            projectName: data.projectName,
            warehouseId: data.warehouseId,
            warehouseName: whName,
            returnedBy: data.returnedBy,
            totalCost: totalReturnCost,
            itemsCount: itemsToInsert.length,
          },
          reason: `Material return voucher ${returnNum} recorded with ${itemsToInsert.length} items`,
        },
        tx
      );

      return { ...returnRecord, items: itemsToInsert };
    });
  }

  // ==========================================
  // PHASE 55: INVENTORY ADJUSTMENTS
  // ==========================================
  async getInventoryAdjustments(params?: PaginationParams) {
    await ensureInventorySeeded();
    const list = (await db.select().from(inventoryAdjustments)) as DbInventoryAdjustment[];
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { data: list, total: list.length, page: params?.page || 1, limit: params?.limit || 20 };
  }

  async createInventoryAdjustment(data: Partial<DbInventoryAdjustment>): Promise<DbInventoryAdjustment> {
    await ensureInventorySeeded();
    const now = new Date().toISOString();
    const materialId = String(data.materialId || '').trim();
    const warehouseId = String(data.warehouseId || '').trim();
    const adjustedBy = String(data.adjustedBy || '').trim();
    const adjustmentType = String(data.adjustmentType || '').trim().toUpperCase();
    const reason = String(data.reason || '').trim();
    const qty = Number(data.quantity);
    if (!materialId || !warehouseId || !adjustedBy || !reason) throw new Error('Material, warehouse, adjustment reason and maker identity are required.');
    if (!['SURPLUS', 'SHORTAGE', 'DAMAGE', 'EXPIRY', 'SCRAP'].includes(adjustmentType)) throw new Error('Unsupported inventory adjustment type.');
    if (!Number.isFinite(qty) || qty <= 0) throw new Error('Adjustment quantity must be greater than zero.');

    const [mat] = await db.select().from(materials).where(and(eq(materials.id, materialId), eq(materials.isActive, true))).limit(1);
    const [wh] = await db.select().from(warehouses).where(and(eq(warehouses.id, warehouseId), eq(warehouses.isActive, true))).limit(1);
    if (!mat || !wh) throw new Error('Material or warehouse not found or inactive.');
    const unitPrice = Number(data.unitPrice ?? mat.unitPrice);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error('Adjustment unit price must be valid.');

    const adjNum = String(data.adjustmentNumber || `ADJ-${now.slice(0,4)}-${Date.now().toString().slice(-8)}`).trim();
    const adjustment: DbInventoryAdjustment = {
      id: genId('adj'), adjustmentNumber: adjNum, warehouseId, warehouseName: wh.name, materialId, materialName: mat.name, materialCode: mat.itemCode,
      adjustmentType, quantity: qty, unitPrice, reason, adjustedBy, approvedBy: undefined, status: 'PENDING', isActive: true, createdAt: now, updatedAt: now,
    };
    await db.insert(inventoryAdjustments).values(adjustment);
    await this.logInventoryAction({ actionType: 'ADJUSTMENT_REQUESTED', performedBy: adjustedBy, details: `Requested inventory adjustment ${adjNum} for ${mat.name} (${adjustmentType}: ${qty})`, materialId, warehouseId });
    return adjustment;
  }

  async approveInventoryAdjustment(id: string, approvedBy: string, decision: 'APPROVED' | 'REJECTED', remarks?: string): Promise<DbInventoryAdjustment | null> {
    await ensureInventorySeeded();
    const approver = String(approvedBy || '').trim();
    if (!approver) throw new Error('Authenticated inventory adjustment approver identity is required.');
    const [current] = await db.select().from(inventoryAdjustments).where(eq(inventoryAdjustments.id, id)).limit(1);
    if (!current) return null;
    if (current.status !== 'PENDING') throw new Error(`Inventory adjustment cannot be ${decision.toLowerCase()} from status ${current.status}.`);
    if (decision === 'APPROVED' && String(current.adjustedBy || '').trim().toLowerCase() === approver.toLowerCase()) throw new Error('Maker-checker violation: adjustment maker cannot approve the same adjustment.');

    return await db.transaction(async (tx) => {
      if (decision === 'APPROVED') {
        const movementType = current.adjustmentType === 'SURPLUS' ? 'GOODS_RECEIPT' : 'GOODS_ISSUE';
        await this.createStockTransaction({
          materialId: current.materialId, materialCode: current.materialCode, materialName: current.materialName, warehouseId: current.warehouseId, warehouseName: current.warehouseName,
          transactionType: movementType, quantity: current.quantity, unitPrice: current.unitPrice, totalValue: current.quantity * current.unitPrice,
          referenceDoc: current.adjustmentNumber, notes: `Approved inventory adjustment ${current.adjustmentNumber}: ${current.reason}`,
          issuedByName: movementType === 'GOODS_ISSUE' ? current.adjustedBy : undefined, receivedByName: movementType === 'GOODS_RECEIPT' ? current.adjustedBy : undefined,
          approvedByName: approver,
        }, tx);
      }
      const [updated] = await tx.update(inventoryAdjustments).set({ status: decision, approvedBy: decision === 'APPROVED' ? approver : null, updatedBy: approver, updatedAt: new Date().toISOString() } as any).where(eq(inventoryAdjustments.id, id)).returning();
      if (!updated) return null;
      await this.logInventoryAction({ actionType: decision === 'APPROVED' ? 'ADJUSTMENT_APPROVED' : 'ADJUSTMENT_REJECTED', performedBy: approver, details: `${decision} inventory adjustment ${updated.adjustmentNumber}${remarks ? `: ${remarks}` : ''}`, materialId: updated.materialId, warehouseId: updated.warehouseId });
      return updated as DbInventoryAdjustment;
    });
  }
  // ==========================================
  // PHASE 55: INVENTORY LOGS
  // ==========================================
  async getInventoryLogs(params?: PaginationParams) {
    await ensureInventorySeeded();
    const logs = (await db.select().from(inventoryLogs)) as DbInventoryLog[];
    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { data: logs, total: logs.length, page: params?.page || 1, limit: params?.limit || 20 };
  }

  async logInventoryAction(data: {
    materialId?: string;
    warehouseId?: string;
    actionType: string;
    performedBy: string;
    details: string;
  }): Promise<DbInventoryLog> {
    await ensureInventorySeeded();
    const now = new Date().toISOString();
    const log: DbInventoryLog = {
      id: genId('invlog'),
      materialId: data.materialId || '',
      warehouseId: data.warehouseId || '',
      actionType: data.actionType,
      performedBy: data.performedBy,
      details: data.details,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(inventoryLogs).values(log);
    return log;
  }
}

export const inventoryRepository = new InventoryRepository();

