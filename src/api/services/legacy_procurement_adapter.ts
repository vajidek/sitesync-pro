import { db } from '../../db';
import {
  procurementPurchaseOrdersTable,
  procurementGrnsTable,
  procurementVendorsTable,
  projects,
} from '../../db/schema';
import { eq, and, or, ilike, desc } from 'drizzle-orm';
import { numberingService } from './numbering.service';
import { legacyProcurementTelemetry } from '../telemetry/legacy_procurement.telemetry';

export class LegacyProcurementAdapter {
  private static instance: LegacyProcurementAdapter;

  public static getInstance(): LegacyProcurementAdapter {
    if (!LegacyProcurementAdapter.instance) {
      LegacyProcurementAdapter.instance = new LegacyProcurementAdapter();
    }
    return LegacyProcurementAdapter.instance;
  }

  /**
   * Normalizes an active ProcurementPurchaseOrder record into the legacy DbPurchaseOrder interface
   */
  public normalizePOFromActive(activePo: any): any {
    if (!activePo) return null;
    let items = activePo.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }

    const netAmount = Number(activePo.netAmountUSD || 0);

    return {
      id: activePo.id,
      poNumber: activePo.poNumber,
      vendorId: activePo.vendorId || '',
      vendorName: activePo.vendorName || 'Material Vendor',
      requisitionId: activePo.rfqId || null,
      projectId: activePo.projectId || null,
      projectName: activePo.projectName || 'General Project',
      poDate: activePo.poDate || (activePo.createdAt ? activePo.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
      expectedDeliveryDate: activePo.deliveryDueDate || new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
      totalAmount: netAmount,
      netAmountUSD: netAmount,
      paymentTerms: activePo.paymentTerms || 'Net 30 Days',
      quotationRef: activePo.rfqId || activePo.poNumber,
      status: (activePo.status || 'ISSUED').toUpperCase(),
      paymentStatus: 'UNPAID',
      deliveryStatus: activePo.status === 'Completed' ? 'DELIVERED' : (activePo.status === 'Partially Received' ? 'PARTIALLY_DELIVERED' : 'PENDING'),
      notes: activePo.notes || '',
      items: items || [],
      createdById: activePo.createdById || 'usr-admin-001',
      createdAt: activePo.createdAt || new Date().toISOString(),
      updatedAt: activePo.updatedAt || activePo.createdAt || new Date().toISOString(),
    };
  }

  /**
   * Normalizes an active ProcurementGRN record into the legacy DbGoodsReceipt interface
   */
  public normalizeGRNFromActive(activeGrn: any): any {
    if (!activeGrn) return null;
    let items = activeGrn.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }

    const totalVal = Number(activeGrn.totalAmount || 0);

    return {
      id: activeGrn.id,
      grnNumber: activeGrn.grnNumber,
      poId: activeGrn.poId || null,
      poNumber: activeGrn.poNumber || null,
      vendorId: activeGrn.vendorId || '',
      vendorName: activeGrn.vendorName || 'Material Vendor',
      warehouseId: activeGrn.warehouseId || activeGrn.warehouse || 'wh-001',
      warehouseName: activeGrn.warehouseName || 'Abu Dhabi Central Yard Warehouse',
      receivedDate: activeGrn.receivedDate || (activeGrn.createdAt ? activeGrn.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
      receivedBy: activeGrn.receivedBy || 'Store Officer',
      deliveryNoteNumber: activeGrn.deliveryNoteNumber || activeGrn.challanNumber || `DN-${activeGrn.grnNumber}`,
      challanNumber: activeGrn.challanNumber || null,
      vehicleNumber: activeGrn.vehicleNumber || 'DXB-K-5542',
      qcStatus: activeGrn.qcStatus || 'PASSED',
      status: activeGrn.qcStatus === 'REJECTED' ? 'REJECTED' : 'RECEIVED',
      totalValue: totalVal,
      totalAmount: totalVal,
      items: items || [],
      remarks: activeGrn.remarks || '',
      createdAt: activeGrn.createdAt || new Date().toISOString(),
      updatedAt: activeGrn.updatedAt || activeGrn.createdAt || new Date().toISOString(),
    };
  }

  /**
   * Consolidated Read for Purchase Orders: Query Active SSoT
   */
  public async getConsolidatedPurchaseOrders(params: {
    vendorId?: string;
    projectId?: string;
    search?: string;
    page?: number;
    limit?: number;
    caller?: string;
  }): Promise<{ data: any[]; pagination: any }> {
    const caller = params.caller || 'LegacyProcurementAdapter.getConsolidatedPurchaseOrders';
    await legacyProcurementTelemetry.logEvent({
      eventType: 'LEGACY_READ_REDIRECTED',
      caller,
      legacyTarget: 'purchase_orders / phase56_purchase_orders',
      activeTarget: 'procurement_purchase_orders',
      details: { params },
    });

    const conditions = [];
    if (params.vendorId) {
      conditions.push(eq(procurementPurchaseOrdersTable.vendorId, params.vendorId));
    }
    if (params.projectId) {
      conditions.push(eq(procurementPurchaseOrdersTable.projectId, params.projectId));
    }
    if (params.search && params.search.trim() !== '') {
      const term = `%${params.search.trim()}%`;
      conditions.push(
        or(
          ilike(procurementPurchaseOrdersTable.poNumber, term),
          ilike(procurementPurchaseOrdersTable.vendorName, term),
          ilike(procurementPurchaseOrdersTable.projectName, term)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const allRows = await db
      .select()
      .from(procurementPurchaseOrdersTable)
      .where(whereClause)
      .orderBy(desc(procurementPurchaseOrdersTable.createdAt));

    const normalized = allRows.map((r) => this.normalizePOFromActive(r));

    const page = params.page || 1;
    const limit = params.limit || 50;
    const total = normalized.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = normalized.slice(start, start + limit);

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

  /**
   * Consolidated Read for Goods Receipts: Query Active SSoT
   */
  public async getConsolidatedGoodsReceipts(params: {
    warehouseId?: string;
    poId?: string;
    search?: string;
    page?: number;
    limit?: number;
    caller?: string;
  }): Promise<{ data: any[]; pagination: any }> {
    const caller = params.caller || 'LegacyProcurementAdapter.getConsolidatedGoodsReceipts';
    await legacyProcurementTelemetry.logEvent({
      eventType: 'LEGACY_READ_REDIRECTED',
      caller,
      legacyTarget: 'goods_receipts / phase69_goods_receipts',
      activeTarget: 'procurement_grns',
      details: { params },
    });

    const conditions = [];
    if (params.warehouseId) {
      conditions.push(ilike(procurementGrnsTable.warehouseName, `%${params.warehouseId}%`));
    }
    if (params.poId) {
      conditions.push(eq(procurementGrnsTable.poId, params.poId));
    }
    if (params.search && params.search.trim() !== '') {
      const term = `%${params.search.trim()}%`;
      conditions.push(
        or(
          ilike(procurementGrnsTable.grnNumber, term),
          ilike(procurementGrnsTable.vendorName, term),
          ilike(procurementGrnsTable.warehouseName, term),
          ilike(procurementGrnsTable.poNumber, term)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const allRows = await db
      .select()
      .from(procurementGrnsTable)
      .where(whereClause)
      .orderBy(desc(procurementGrnsTable.createdAt));

    const normalized = allRows.map((r) => this.normalizeGRNFromActive(r));

    const page = params.page || 1;
    const limit = params.limit || 50;
    const total = normalized.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = normalized.slice(start, start + limit);

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

  /**
   * Safe Legacy Write Bridge: Routes legacy PO writes into active SSoT table
   */
  public async bridgeCreatePurchaseOrder(data: any, caller: string = 'LegacyWriteBridge'): Promise<any> {
    const now = new Date().toISOString();
    let vendorName = data.vendorName;
    if (data.vendorId && !vendorName) {
      const [vnd] = await db
        .select()
        .from(procurementVendorsTable)
        .where(eq(procurementVendorsTable.id, data.vendorId));
      if (vnd) vendorName = vnd.name;
    }

    let projectName = data.projectName;
    if (data.projectId && !projectName) {
      const [prj] = await db.select().from(projects).where(eq(projects.id, data.projectId));
      if (prj) projectName = prj.projectName;
    }

    const poNumber =
      data.poNumber ||
      (await numberingService.generatePurchaseOrderNumber({
        companyId: 'cmp-101',
        projectId: data.projectId || null,
        date: data.poDate || now,
      }));

    const totalAmt = Number(data.totalAmount || data.netAmountUSD || 0);

    const activePoRecord = {
      id: data.id || `po_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      poNumber,
      rfqId: data.rfqId || data.requisitionId || null,
      vendorId: data.vendorId || 'vnd_default',
      vendorName: vendorName || 'Material Vendor',
      projectId: data.projectId || null,
      projectName: projectName || 'General Project',
      poDate: data.poDate || now.slice(0, 10),
      deliveryDueDate: data.expectedDeliveryDate || data.deliveryDueDate || new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
      paymentTerms: data.paymentTerms || 'Net 30 Days',
      grossAmountUSD: totalAmt,
      taxAmountUSD: 0,
      discountUSD: 0,
      netAmountUSD: totalAmt,
      status: data.status || 'Issued',
      notes: data.notes || '',
      items: Array.isArray(data.items) ? JSON.stringify(data.items) : (data.items || JSON.stringify([])),
      createdById: data.createdById || 'usr-admin-001',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(procurementPurchaseOrdersTable).values(activePoRecord);

    await legacyProcurementTelemetry.logEvent({
      eventType: 'LEGACY_WRITE_BRIDGED',
      caller,
      legacyTarget: 'purchase_orders',
      activeTarget: 'procurement_purchase_orders',
      entityId: activePoRecord.id,
      details: { poNumber, totalAmount: totalAmt, vendorName },
    });

    return this.normalizePOFromActive(activePoRecord);
  }

  /**
   * Safe Legacy Write Bridge: Routes legacy GRN writes into active SSoT table
   */
  public async bridgeCreateGoodsReceipt(data: any, caller: string = 'LegacyWriteBridge'): Promise<any> {
    const now = new Date().toISOString();
    const grnNumber =
      data.grnNumber ||
      (await numberingService.generateGoodsReceiptNumber({
        companyId: 'cmp-101',
        projectId: data.projectId || null,
        date: data.receivedDate || now,
      }));

    const totalVal = Number(data.totalValue || data.totalAmount || 0);

    const activeGrnRecord = {
      id: data.id || `grn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      grnNumber,
      poId: data.poId || null,
      poNumber: data.poNumber || null,
      vendorId: data.vendorId || 'vnd_default',
      vendorName: data.vendorName || 'Material Vendor',
      projectId: data.projectId || null,
      projectName: data.projectName || null,
      warehouseName: data.warehouseName || 'Main Central Warehouse',
      receivedDate: data.receivedDate || now.slice(0, 10),
      challanNo: data.challanNo || data.challanNumber || data.deliveryNoteNumber || null,
      challanDate: data.challanDate || now.slice(0, 10),
      inspectedByName: data.inspectedByName || data.receivedBy || 'Store Officer',
      qualityStatus: data.qcStatus || data.qualityStatus || 'Passed',
      items: Array.isArray(data.items) ? JSON.stringify(data.items) : (data.items || JSON.stringify([])),
      stockUpdated: true,
      remarks: data.remarks || '',
      createdAt: now,
    };

    await db.insert(procurementGrnsTable).values(activeGrnRecord);

    await legacyProcurementTelemetry.logEvent({
      eventType: 'LEGACY_WRITE_BRIDGED',
      caller,
      legacyTarget: 'goods_receipts',
      activeTarget: 'procurement_grns',
      entityId: activeGrnRecord.id,
      details: { grnNumber, totalValue: totalVal, warehouseName: activeGrnRecord.warehouseName },
    });

    return this.normalizeGRNFromActive(activeGrnRecord);
  }
}

export const legacyProcurementAdapter = LegacyProcurementAdapter.getInstance();
