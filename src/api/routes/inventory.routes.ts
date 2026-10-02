import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { authenticateJWT as authenticateToken, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all inventory routes
router.use(authenticateToken);

// --- Analytics & Reports ---
router.get('/analytics', inventoryController.getAnalytics.bind(inventoryController));
router.get('/scan/:code', inventoryController.scanLookup.bind(inventoryController));

// --- Material Master ---
router.get('/materials', inventoryController.getMaterials.bind(inventoryController));
router.get('/materials/:id', inventoryController.getMaterialById.bind(inventoryController));
router.post('/materials', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'STORE_KEEPER'), inventoryController.createMaterial.bind(inventoryController));
router.put('/materials/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'STORE_KEEPER'), inventoryController.updateMaterial.bind(inventoryController));
router.delete('/materials/:id', requireRoles('ADMIN', 'MANAGER'), inventoryController.deleteMaterial.bind(inventoryController));

// --- Warehouses ---
router.get('/warehouses', inventoryController.getWarehouses.bind(inventoryController));
router.post('/warehouses', requireRoles('ADMIN', 'MANAGER'), inventoryController.createWarehouse.bind(inventoryController));
router.get('/warehouses/:warehouseId/stocks', inventoryController.getWarehouseStocks.bind(inventoryController));

// --- Stock Transactions ---
router.get('/transactions', inventoryController.getStockTransactions.bind(inventoryController));
router.post('/transactions', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'STORE_KEEPER'), inventoryController.createStockTransaction.bind(inventoryController));

// --- Purchase Requests / Requisitions ---
router.get('/purchase-requests', inventoryController.getPurchaseRequests.bind(inventoryController));
router.post('/purchase-requests', inventoryController.createPurchaseRequest.bind(inventoryController));
router.patch('/purchase-requests/:id/status', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), inventoryController.updatePurchaseRequestStatus.bind(inventoryController));

// --- Purchase Orders (PO Foundation) ---
router.get('/purchase-orders', inventoryController.getPurchaseOrders.bind(inventoryController));
router.post('/purchase-orders', requireRoles('ADMIN', 'MANAGER'), inventoryController.createPurchaseOrder.bind(inventoryController));

// --- Subcategories & Locations ---
router.get('/subcategories', inventoryController.getSubcategories.bind(inventoryController));
router.post('/subcategories', requireRoles('ADMIN', 'MANAGER', 'STORE_KEEPER'), inventoryController.createSubcategory.bind(inventoryController));
router.get('/locations', inventoryController.getLocations.bind(inventoryController));
router.post('/locations', requireRoles('ADMIN', 'MANAGER', 'STORE_KEEPER'), inventoryController.createLocation.bind(inventoryController));

// --- Goods Receipt Notes (GRN) ---
router.get('/goods-receipts', inventoryController.getGoodsReceipts.bind(inventoryController));
router.get('/goods-receipts/:id', inventoryController.getGoodsReceiptById.bind(inventoryController));
router.post('/goods-receipts', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'STORE_KEEPER'), inventoryController.createGoodsReceipt.bind(inventoryController));

// --- Material Issue Notes (MIV) ---
router.get('/material-issues', inventoryController.getMaterialIssues.bind(inventoryController));
router.get('/material-issues/:id', inventoryController.getMaterialIssueById.bind(inventoryController));
router.post('/material-issues', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'STORE_KEEPER'), inventoryController.createMaterialIssue.bind(inventoryController));

// --- Material Transfers ---
router.get('/material-transfers', inventoryController.getMaterialTransfers.bind(inventoryController));
router.post('/material-transfers', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'STORE_KEEPER'), inventoryController.createMaterialTransfer.bind(inventoryController));

// --- Material Returns ---
router.get('/material-returns', inventoryController.getMaterialReturns.bind(inventoryController));
router.post('/material-returns', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'STORE_KEEPER'), inventoryController.createMaterialReturn.bind(inventoryController));

// --- Inventory Adjustments ---
router.get('/adjustments', inventoryController.getInventoryAdjustments.bind(inventoryController));
router.post('/adjustments', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), inventoryController.createInventoryAdjustment.bind(inventoryController));
router.patch('/adjustments/:id/decision', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), inventoryController.approveInventoryAdjustment.bind(inventoryController));

// --- Inventory Logs ---
router.get('/logs', inventoryController.getInventoryLogs.bind(inventoryController));

// --- Physical Verification Audit ---
router.get('/verifications', inventoryController.getStockVerifications.bind(inventoryController));
router.post('/verifications', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'STORE_KEEPER'), inventoryController.createStockVerification.bind(inventoryController));

export default router;
