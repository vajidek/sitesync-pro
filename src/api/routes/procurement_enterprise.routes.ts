import { Router } from 'express';
import { ProcurementEnterpriseController } from '../controllers/procurement_enterprise.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();
const controller = new ProcurementEnterpriseController();

// JWT & RBAC Middleware
router.use(authenticateJWT);
router.use(
  requireRoles(
    'ADMIN',
    'MANAGER',
    'INCHARGE',
    'SUPERVISOR',
    'STORE_KEEPER'
  )
);

// Overview Stats & Dashboard
router.get('/stats', controller.getDashboardStats);
router.get('/dashboard', controller.getDashboardStats);

// Vendors
router.get('/vendors', controller.getVendors);
router.get('/vendors/:id', controller.getVendorById);
router.post('/vendors', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.registerVendor);
router.put('/vendors/:id', requireRoles('ADMIN', 'MANAGER'), controller.updateVendor);

// RFQ & Quotations
router.get('/rfq', controller.getRfqs);
router.get('/rfqs', controller.getRfqs);
router.post('/rfq', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createRfq);
router.post('/rfqs', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createRfq);
router.get('/quotations', controller.getQuotations);
router.post('/quotations', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.submitQuotation);

// Purchase Requisitions
router.get('/pr', controller.getPurchaseRequisitions);
router.get('/purchase-requisitions', controller.getPurchaseRequisitions);
router.post('/pr', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'STORE_KEEPER'), controller.createPurchaseRequisition);
router.post('/purchase-requisitions', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'STORE_KEEPER'), controller.createPurchaseRequisition);
router.put('/purchase-requisitions/:id/status', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.updatePurchaseRequisitionStatus);

// Purchase Orders
router.get('/po', controller.getPurchaseOrders);
router.get('/purchase-orders', controller.getPurchaseOrders);
router.post('/po', requireRoles('ADMIN', 'MANAGER'), controller.issuePurchaseOrder);
router.post('/purchase-orders', requireRoles('ADMIN', 'MANAGER'), controller.issuePurchaseOrder);

// Contracts & Variation Orders
router.get('/contracts', controller.getContracts);
router.post('/contracts', requireRoles('ADMIN', 'MANAGER'), controller.createContract);
router.post('/variations', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createVariationOrder);
router.post('/contracts/variations', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createVariationOrder);

// Goods Receipts (GRN)
router.get('/grn', controller.getGoodsReceipts);
router.get('/goods-receipts', controller.getGoodsReceipts);
router.post('/grn', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'STORE_KEEPER'), controller.createGoodsReceipt);
router.post('/goods-receipts', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'STORE_KEEPER'), controller.createGoodsReceipt);
router.put('/goods-receipts/:id/status', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'STORE_KEEPER'), controller.updateGoodsReceiptStatus);

// 3-Way Matching
router.get('/three-way-matching', controller.getThreeWayMatches);
router.get('/matching', controller.getThreeWayMatches);
router.post('/three-way-matching', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.reconcileThreeWayMatch);
router.post('/matching', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.reconcileThreeWayMatch);

// Scorecards & Guarantees
router.get('/scorecards', controller.getSupplierScorecards);
router.get('/guarantees', controller.getBankGuarantees);

export default router;
