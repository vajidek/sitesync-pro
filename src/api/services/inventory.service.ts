import { inventoryRepository } from '../repositories/inventory.repository';
import { PaginationParams } from '../utils/pagination';

export class InventoryService {
  // Material Master
  async getMaterials(params: PaginationParams & { categoryId?: string; status?: string; search?: string }) {
    return inventoryRepository.getMaterials(params);
  }

  async getMaterialById(id: string) {
    const material = await inventoryRepository.getMaterialById(id);
    if (!material) return null;
    const stockSummary = await inventoryRepository.getMaterialStockSummary(id);
    return { material, stockSummary };
  }

  async createMaterial(data: any) {
    if (!data.name || !data.itemCode) {
      throw new Error('Item code and Material Name are required');
    }
    return inventoryRepository.createMaterial(data);
  }

  async updateMaterial(id: string, data: any) {
    return inventoryRepository.updateMaterial(id, data);
  }

  async deleteMaterial(id: string) {
    return inventoryRepository.deleteMaterial(id);
  }

  // Categories & Subcategories
  async getCategories() {
    return inventoryRepository.getMaterialCategories();
  }

  async getSubcategories(categoryId?: string) {
    return inventoryRepository.getMaterialSubcategories(categoryId);
  }

  async createSubcategory(data: any) {
    return inventoryRepository.createMaterialSubcategory(data);
  }

  async getUnits() {
    return inventoryRepository.getMaterialUnits();
  }

  // Warehouses & Locations
  async getWarehouses(params?: PaginationParams) {
    return inventoryRepository.getWarehouses(params);
  }

  async createWarehouse(data: any) {
    if (!data.name || !data.code) {
      throw new Error('Warehouse code and name are required');
    }
    return inventoryRepository.createWarehouse(data);
  }

  async getWarehouseStocks(warehouseId: string) {
    return inventoryRepository.getStocksByWarehouse(warehouseId);
  }

  async getWarehouseLocations(warehouseId?: string) {
    return inventoryRepository.getWarehouseLocations(warehouseId);
  }

  async createWarehouseLocation(data: any) {
    return inventoryRepository.createWarehouseLocation(data);
  }

  // Stock Transactions & Ledger
  async getStockTransactions(params?: PaginationParams & { type?: string; projectId?: string; warehouseId?: string }) {
    return inventoryRepository.getStockTransactions(params);
  }

  async createStockTransaction(data: any) {
    if (!data.materialId || !data.warehouseId || !data.quantity) {
      throw new Error('Material ID, Warehouse ID, and Quantity are required for stock transaction');
    }
    return inventoryRepository.createStockTransaction(data);
  }

  // Goods Receipt Notes (GRN)
  async getGoodsReceipts(params?: PaginationParams & { warehouseId?: string }) {
    return inventoryRepository.getGoodsReceipts(params);
  }

  async getGoodsReceiptById(id: string) {
    return inventoryRepository.getGoodsReceiptById(id);
  }

  async createGoodsReceipt(data: any) {
    if (!data.warehouseId || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Warehouse ID and at least one item are required for Goods Receipt');
    }
    return inventoryRepository.createGoodsReceipt(data);
  }

  // Material Issues (MIV)
  async getMaterialIssues(params?: PaginationParams & { projectId?: string; warehouseId?: string }) {
    return inventoryRepository.getMaterialIssues(params);
  }

  async getMaterialIssueById(id: string) {
    return inventoryRepository.getMaterialIssueById(id);
  }

  async createMaterialIssue(data: any) {
    if (!data.warehouseId || !data.issuedTo || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Warehouse ID, Issued To recipient, and at least one line item are required');
    }

    // Business validation: Check stock availability before issue
    for (const item of data.items) {
      const mat = await inventoryRepository.getMaterialById(item.materialId);
      if (mat && mat.currentStock < item.issuedQty) {
        throw new Error(`Insufficient stock for material ${mat.name} (${mat.itemCode}). Requested: ${item.issuedQty}, Available: ${mat.currentStock}`);
      }
    }

    return inventoryRepository.createMaterialIssue(data);
  }

  // Material Transfers
  async getMaterialTransfers(params?: PaginationParams) {
    return inventoryRepository.getMaterialTransfers(params);
  }

  async createMaterialTransfer(data: any) {
    if (!data.sourceWarehouseId || !data.targetWarehouseId || !data.items || data.items.length === 0) {
      throw new Error('Source warehouse, target warehouse, and line items are required for transfer');
    }
    if (data.sourceWarehouseId === data.targetWarehouseId) {
      throw new Error('Source and target warehouses cannot be identical');
    }
    return inventoryRepository.createMaterialTransfer(data);
  }

  // Material Returns
  async getMaterialReturns(params?: PaginationParams) {
    return inventoryRepository.getMaterialReturns(params);
  }

  async createMaterialReturn(data: any) {
    if (!data.warehouseId || !data.returnedBy || !data.items || data.items.length === 0) {
      throw new Error('Warehouse ID, Returned By officer, and return items are required');
    }
    return inventoryRepository.createMaterialReturn(data);
  }

  // Inventory Adjustments
  async getInventoryAdjustments(params?: PaginationParams) {
    return inventoryRepository.getInventoryAdjustments(params);
  }

  async createInventoryAdjustment(data: any) {
    if (!data.warehouseId || !data.materialId || !data.adjustmentType || data.quantity === undefined || !data.adjustedBy) {
      throw new Error('Warehouse, Material, Adjustment Type, Quantity and maker identity are required');
    }
    return inventoryRepository.createInventoryAdjustment(data);
  }

  async approveInventoryAdjustment(id: string, approvedBy: string, decision: 'APPROVED' | 'REJECTED', remarks?: string) {
    return inventoryRepository.approveInventoryAdjustment(id, approvedBy, decision, remarks);
  }

  // Physical Verification Audits
  async getStockVerifications() {
    return inventoryRepository.getStockVerifications();
  }

  async createStockVerification(data: any) {
    return inventoryRepository.createStockVerification(data);
  }

  // Inventory Logs & Audit
  async getInventoryLogs(params?: PaginationParams) {
    return inventoryRepository.getInventoryLogs(params);
  }

  // Purchase Requisitions & Orders
  async getPurchaseRequests(params?: PaginationParams & { projectId?: string; status?: string }) {
    return inventoryRepository.getPurchaseRequests(params);
  }

  async createPurchaseRequest(data: any) {
    return inventoryRepository.createPurchaseRequest(data);
  }

  async updatePurchaseRequestStatus(id: string, status: string, name?: string) {
    return inventoryRepository.updatePurchaseRequestStatus(id, status, name);
  }

  async getPurchaseOrders(params?: PaginationParams & { vendorId?: string; projectId?: string }) {
    return inventoryRepository.getPurchaseOrders(params);
  }

  async createPurchaseOrder(data: any) {
    return inventoryRepository.createPurchaseOrder(data);
  }

  // Analytics & Reports
  async getAnalytics() {
    return inventoryRepository.getInventoryAnalytics();
  }
}

export const inventoryService = new InventoryService();
