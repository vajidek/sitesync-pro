import { Request, Response, NextFunction } from 'express';
import { inventoryRepository } from '../repositories/inventory.repository';
import { inventoryService } from '../services/inventory.service';
import { auditRepository } from '../repositories/audit.repository';

function parsePaginationParams(query: any) {
  return {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 20,
    search: query.search as string,
    sortBy: query.sortBy as string,
    sortOrder: query.sortOrder as 'asc' | 'desc',
  };
}

export class InventoryController {
  // ==========================================
  // MATERIAL MASTER & CATEGORIES
  // ==========================================
  async getMaterials(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const categoryId = req.query.categoryId as string;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const result = await inventoryService.getMaterials({
        ...params,
        categoryId,
        status,
        search,
      });

      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getMaterialById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await inventoryService.getMaterialById(id);
      if (!data) {
        return res.status(404).json({ success: false, error: 'Material item not found' });
      }

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createMaterial(req: Request, res: Response, next: NextFunction) {
    try {
      const material = await inventoryService.createMaterial(req.body);

      await auditRepository.logAction({
        userId: (req as any).user?.id,
        userEmail: (req as any).user?.email,
        userRole: (req as any).user?.role,
        action: 'CREATE_MATERIAL',
        module: 'INVENTORY',
        details: `Created material master ${material.itemCode} - ${material.name}`,
      });

      res.status(201).json({ success: true, data: material });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to create material' });
    }
  }

  async updateMaterial(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const material = await inventoryService.updateMaterial(id, req.body);
      if (!material) {
        return res.status(404).json({ success: false, error: 'Material not found' });
      }

      await auditRepository.logAction({
        userId: (req as any).user?.id,
        userEmail: (req as any).user?.email,
        userRole: (req as any).user?.role,
        action: 'UPDATE_MATERIAL',
        module: 'INVENTORY',
        details: `Updated material ${material.itemCode}`,
      });

      res.json({ success: true, data: material });
    } catch (err) {
      next(err);
    }
  }

  async deleteMaterial(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ok = await inventoryService.deleteMaterial(id);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Material not found' });
      }

      await auditRepository.logAction({
        userId: (req as any).user?.id,
        userEmail: (req as any).user?.email,
        userRole: (req as any).user?.role,
        action: 'DELETE_MATERIAL',
        module: 'INVENTORY',
        details: `Deactivated material ${id}`,
      });

      res.json({ success: true, message: 'Material deactivated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getSubcategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = req.query.categoryId as string;
      const data = await inventoryService.getSubcategories(categoryId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createSubcategory(req: Request, res: Response, next: NextFunction) {
    try {
      const subcat = await inventoryService.createSubcategory(req.body);
      res.status(201).json({ success: true, data: subcat });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // WAREHOUSES & LOCATIONS
  // ==========================================
  async getWarehouses(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const result = await inventoryService.getWarehouses(params);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async createWarehouse(req: Request, res: Response, next: NextFunction) {
    try {
      const wh = await inventoryService.createWarehouse(req.body);

      await auditRepository.logAction({
        userId: (req as any).user?.id,
        userEmail: (req as any).user?.email,
        userRole: (req as any).user?.role,
        action: 'CREATE_WAREHOUSE',
        module: 'INVENTORY',
        details: `Created warehouse ${wh.code} - ${wh.name}`,
      });

      res.status(201).json({ success: true, data: wh });
    } catch (err) {
      next(err);
    }
  }

  async getWarehouseStocks(req: Request, res: Response, next: NextFunction) {
    try {
      const { warehouseId } = req.params;
      const stocks = await inventoryService.getWarehouseStocks(warehouseId);
      res.json({ success: true, data: stocks });
    } catch (err) {
      next(err);
    }
  }

  async getLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouseId = req.query.warehouseId as string;
      const data = await inventoryService.getWarehouseLocations(warehouseId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const loc = await inventoryService.createWarehouseLocation(req.body);
      res.status(201).json({ success: true, data: loc });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // STOCK TRANSACTIONS & LEDGER
  // ==========================================
  async getStockTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const type = req.query.type as string;
      const projectId = req.query.projectId as string;
      const warehouseId = req.query.warehouseId as string;

      const result = await inventoryService.getStockTransactions({
        ...params,
        type,
        projectId,
        warehouseId,
      });

      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async createStockTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const actorId = String(user?.id || '').trim();
      const actorName = String(user?.name || user?.email || '').trim();
      if (!actorId || !actorName) {
        res.status(401).json({ success: false, error: 'Authenticated inventory actor identity is required.' });
        return;
      }
      const txnData = {
        ...req.body,
        issuedById: user?.id,
        issuedByName: user?.name || user?.email || '',
      };

      const transaction = await inventoryService.createStockTransaction(txnData);

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: `STOCK_${transaction.transactionType}`,
        module: 'INVENTORY',
        details: `${transaction.transactionType} ${transaction.transactionCode} for ${transaction.materialName} (Qty: ${transaction.quantity})`,
      });

      res.status(201).json({ success: true, data: transaction });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to record stock transaction' });
    }
  }

  // ==========================================
  // GOODS RECEIPT NOTES (GRN)
  // ==========================================
  async getGoodsReceipts(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const warehouseId = req.query.warehouseId as string;
      const result = await inventoryService.getGoodsReceipts({ ...params, warehouseId });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getGoodsReceiptById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const grn = await inventoryService.getGoodsReceiptById(id);
      if (!grn) {
        return res.status(404).json({ success: false, error: 'Goods Receipt Note not found' });
      }
      res.json({ success: true, data: grn });
    } catch (err) {
      next(err);
    }
  }

  async createGoodsReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const grn = await inventoryService.createGoodsReceipt({
        ...req.body,
        receivedBy: user?.name || user?.email || '',
      });

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'CREATE_GRN',
        module: 'INVENTORY',
        details: `Created GRN ${grn.grnNumber} for warehouse ${grn.warehouseName}`,
      });

      res.status(201).json({ success: true, data: grn });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to create Goods Receipt Note' });
    }
  }

  // ==========================================
  // MATERIAL ISSUES (MIV)
  // ==========================================
  async getMaterialIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const projectId = req.query.projectId as string;
      const warehouseId = req.query.warehouseId as string;

      const result = await inventoryService.getMaterialIssues({ ...params, projectId, warehouseId });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getMaterialIssueById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const issue = await inventoryService.getMaterialIssueById(id);
      if (!issue) {
        return res.status(404).json({ success: false, error: 'Material Issue Note not found' });
      }
      res.json({ success: true, data: issue });
    } catch (err) {
      next(err);
    }
  }

  async createMaterialIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const issue = await inventoryService.createMaterialIssue({
        ...req.body,
        issuedBy: user?.name || user?.email || '',
      });

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'CREATE_MATERIAL_ISSUE',
        module: 'INVENTORY',
        details: `Created Material Issue ${issue.issueNumber} for recipient ${issue.issuedTo}`,
      });

      res.status(201).json({ success: true, data: issue });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to create Material Issue' });
    }
  }

  // ==========================================
  // MATERIAL TRANSFERS
  // ==========================================
  async getMaterialTransfers(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const result = await inventoryService.getMaterialTransfers(params);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async createMaterialTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const transfer = await inventoryService.createMaterialTransfer({
        ...req.body,
        dispatchedBy: user?.name || user?.email || '',
      });

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'CREATE_MATERIAL_TRANSFER',
        module: 'INVENTORY',
        details: `Created Transfer ${transfer.transferNumber} from ${transfer.sourceWarehouseName} to ${transfer.targetWarehouseName}`,
      });

      res.status(201).json({ success: true, data: transfer });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to create Material Transfer' });
    }
  }

  // ==========================================
  // MATERIAL RETURNS
  // ==========================================
  async getMaterialReturns(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const result = await inventoryService.getMaterialReturns(params);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async createMaterialReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const ret = await inventoryService.createMaterialReturn({
        ...req.body,
        receivedBy: user?.name || user?.email || '',
      });

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'CREATE_MATERIAL_RETURN',
        module: 'INVENTORY',
        details: `Processed Return ${ret.returnNumber} from ${ret.returnedBy}`,
      });

      res.status(201).json({ success: true, data: ret });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to process Material Return' });
    }
  }

  // ==========================================
  // INVENTORY ADJUSTMENTS
  // ==========================================
  async getInventoryAdjustments(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const result = await inventoryService.getInventoryAdjustments(params);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async createInventoryAdjustment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const adj = await inventoryService.createInventoryAdjustment({
        ...req.body,
        adjustedBy: user?.name || user?.email || '',
      });

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'INVENTORY_ADJUSTMENT',
        module: 'INVENTORY',
        details: `Recorded Inventory Adjustment ${adj.adjustmentNumber} (${adj.adjustmentType}: ${adj.quantity})`,
      });

      res.status(201).json({ success: true, data: adj });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to record inventory adjustment' });
    }
  }

  async approveInventoryAdjustment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const actor = String(user?.name || user?.email || '').trim();
      if (!actor) return res.status(401).json({ success: false, error: 'Authenticated approver identity is required.' });
      const decision = String(req.body?.decision || '').trim().toUpperCase();
      if (decision !== 'APPROVED' && decision !== 'REJECTED') return res.status(400).json({ success: false, error: 'Decision must be APPROVED or REJECTED.' });
      const adjustment = await inventoryService.approveInventoryAdjustment(req.params.id, actor, decision as 'APPROVED' | 'REJECTED', req.body?.remarks);
      if (!adjustment) return res.status(404).json({ success: false, error: 'Inventory adjustment not found.' });
      await auditRepository.logAction({ userId: user?.id, userEmail: user?.email, userRole: user?.role, action: 'INVENTORY_ADJUSTMENT_' + decision, module: 'INVENTORY', details: 'Inventory Adjustment ' + adjustment.adjustmentNumber + ' ' + decision });
      return res.json({ success: true, data: adjustment });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to process inventory adjustment approval' });
    }
  }

  // ==========================================
  // INVENTORY LOGS
  // ==========================================
  async getInventoryLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const result = await inventoryService.getInventoryLogs(params);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // PURCHASE REQUESTS / REQUISITIONS
  // ==========================================
  async getPurchaseRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const projectId = req.query.projectId as string;
      const status = req.query.status as string;

      const result = await inventoryService.getPurchaseRequests({
        ...params,
        projectId,
        status,
      });

      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async createPurchaseRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const reqData = {
        ...req.body,
        requestedById: user?.id,
        requestedByName: user?.name || user?.email || ''
      };

      const pr = await inventoryService.createPurchaseRequest(reqData);

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'CREATE_PURCHASE_REQUEST',
        module: 'PROCUREMENT',
        details: `Created material requisition ${pr.requisitionCode} for project ${pr.projectName}`,
      });

      res.status(201).json({ success: true, data: pr });
    } catch (err) {
      next(err);
    }
  }

  async updatePurchaseRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = (req as any).user;

      const pr = await inventoryService.updatePurchaseRequestStatus(id, status, user?.name);
      if (!pr) {
        return res.status(404).json({ success: false, error: 'Purchase request not found' });
      }

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'UPDATE_PURCHASE_REQUEST_STATUS',
        module: 'PROCUREMENT',
        details: `Updated purchase request ${pr.requisitionCode} status to ${status}`,
      });

      res.json({ success: true, data: pr });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // PURCHASE ORDERS (PO FOUNDATION)
  // ==========================================
  async getPurchaseOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const vendorId = req.query.vendorId as string;
      const projectId = req.query.projectId as string;

      const result = await inventoryService.getPurchaseOrders({
        ...params,
        vendorId,
        projectId,
      });

      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async createPurchaseOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const po = await inventoryService.createPurchaseOrder({
        ...req.body,
        createdById: user?.id,
      });

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'CREATE_PURCHASE_ORDER',
        module: 'PROCUREMENT',
        details: `Created PO ${po.poNumber} for vendor ${po.vendorName}`,
      });

      res.status(201).json({ success: true, data: po });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // PHYSICAL STOCK VERIFICATION AUDIT
  // ==========================================
  async getStockVerifications(req: Request, res: Response, next: NextFunction) {
    try {
      const audits = await inventoryService.getStockVerifications();
      res.json({ success: true, data: audits });
    } catch (err) {
      next(err);
    }
  }

  async createStockVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const audit = await inventoryService.createStockVerification({
        ...req.body,
        verifiedById: user?.id,
        verifiedByName: user?.name || 'Stock Auditor',
      });

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'PHYSICAL_STOCK_VERIFICATION',
        module: 'INVENTORY',
        details: `Recorded physical stock audit ${audit.verificationCode} with discrepancy ${audit.discrepancy}`,
      });

      res.status(201).json({ success: true, data: audit });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // BARCODE & QR CODE LOOKUP
  // ==========================================
  async scanLookup(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const materialData = await inventoryService.getMaterialById(code);
      if (!materialData) {
        return res.status(404).json({ success: false, error: 'No material found matching barcode/QR code' });
      }

      res.json({ success: true, data: materialData });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // INVENTORY REPORTS & ANALYTICS
  // ==========================================
  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await inventoryService.getAnalytics();
      res.json({ success: true, data: analytics });
    } catch (err) {
      next(err);
    }
  }
}

export const inventoryController = new InventoryController();

