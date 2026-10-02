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
router.post('/vendors', controller.registerVendor);
router.put('/vendors/:id', controller.updateVendor);

// RFQ & Quotations
router.get('/rfq', controller.getRfqs);
router.get('/rfqs', controller.getRfqs);
router.post('/rfq', controller.createRfq);
router.post('/rfqs', controller.createRfq);
router.get('/quotations', controller.getQuotations);
router.post('/quotations', controller.submitQuotation);

// Purchase Requisitions
router.get('/pr', controller.getPurchaseRequisitions);
router.get('/purchase-requisitions', controller.getPurchaseRequisitions);
router.post('/pr', controller.createPurchaseRequisition);
router.post('/purchase-requisitions', controller.createPurchaseRequisition);

// Purchase Orders
router.get('/po', controller.getPurchaseOrders);
router.get('/purchase-orders', controller.getPurchaseOrders);
router.post('/po', controller.issuePurchaseOrder);
router.post('/purchase-orders', controller.issuePurchaseOrder);

// Contracts & Variation Orders
router.get('/contracts', controller.getContracts);
router.post('/contracts', controller.createContract);
router.post('/variations', controller.createVariationOrder);
router.post('/contracts/variations', controller.createVariationOrder);

// Goods Receipts (GRN)
router.get('/grn', controller.getGoodsReceipts);
router.get('/goods-receipts', controller.getGoodsReceipts);
router.post('/grn', controller.createGoodsReceipt);
router.post('/goods-receipts', controller.createGoodsReceipt);

// 3-Way Matching
router.get('/three-way-matching', controller.getThreeWayMatches);
router.get('/matching', controller.getThreeWayMatches);
router.post('/three-way-matching', controller.reconcileThreeWayMatch);
router.post('/matching', controller.reconcileThreeWayMatch);

// Scorecards & Guarantees
router.get('/scorecards', controller.getSupplierScorecards);
router.get('/guarantees', controller.getBankGuarantees);

export default router;
