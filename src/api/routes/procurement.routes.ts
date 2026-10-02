import { Router } from 'express';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { procurementController } from '../controllers/procurement.controller';

const router = Router();

// Protect all procurement endpoints with JWT auth
router.use(authenticateJWT);

// ==========================================
// 1. VENDOR MANAGEMENT ENDPOINTS
// ==========================================
router.get('/vendors', procurementController.getVendors);
router.post('/vendors', procurementController.createVendor);
router.put('/vendors/:id', procurementController.updateVendor);
router.delete('/vendors/:id', procurementController.deleteVendor);

// ==========================================
// 2. ENQUIRY & RFQ ENDPOINTS
// ==========================================
router.get(['/rfq', '/rfqs'], procurementController.getRfqs);
router.post(['/rfq', '/rfqs'], procurementController.createRfq);

// ==========================================
// 3. QUOTATION & COMPARATIVE STATEMENT ENDPOINTS
// ==========================================
router.get('/quotations', procurementController.getQuotations);
router.post('/quotations', procurementController.createQuotation);
router.get(['/comparative-statement/:rfqId', '/comparative-statement'], procurementController.getComparativeStatement);

// ==========================================
// 4. PURCHASE REQUISITION ENDPOINTS
// ==========================================
router.get('/requisitions', procurementController.getRequisitions);
router.post('/requisitions', procurementController.createRequisition);
router.put('/requisitions/:id/status', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), procurementController.updateRequisitionStatus);
router.patch('/requisitions/:id/status', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), procurementController.updateRequisitionStatus);

// ==========================================
// 5. PURCHASE ORDER ENDPOINTS
// ==========================================
router.get('/purchase-orders', procurementController.getPurchaseOrders);
router.post('/purchase-orders', requireRoles('ADMIN', 'MANAGER'), procurementController.createPurchaseOrder);

// ==========================================
// 6. GOODS RECEIPT NOTE (GRN) ENDPOINTS
// ==========================================
router.get(['/grn', '/grns'], procurementController.getGrns);
router.post(['/grn', '/grns'], procurementController.createGrn);

// ==========================================
// 7. WORK ORDER & VARIATION ORDER ENDPOINTS
// ==========================================
router.get('/work-orders', procurementController.getWorkOrders);
router.post('/work-orders', procurementController.createWorkOrder);
router.post('/work-orders/:id/variations', procurementController.addVariationOrder);

// ==========================================
// 8. BOQ MANAGEMENT ENDPOINTS
// ==========================================
router.get('/boq', procurementController.getBoqItems);
router.post('/boq', procurementController.createBoqItem);

// ==========================================
// 9. MEASUREMENT BOOK (MB) ENDPOINTS
// ==========================================
router.get('/measurements/billable', procurementController.getBillableMeasurements);
router.get('/measurement-book/billable', procurementController.getBillableMeasurements);
router.get('/work-orders/:workOrderId/billable-measurements', procurementController.getBillableMeasurements);
router.get('/projects/:projectId/billable-measurements', procurementController.getBillableMeasurements);
router.get(['/measurement-book', '/measurements'], procurementController.getMeasurementEntries);
router.post(['/measurement-book', '/measurements'], procurementController.createMeasurementEntry);
router.put('/measurement-book/:id/status', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), procurementController.updateMeasurementStatus);
router.patch('/measurement-book/:id/status', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), procurementController.updateMeasurementStatus);
router.put('/measurements/:id/status', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), procurementController.updateMeasurementStatus);
router.patch('/measurements/:id/status', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), procurementController.updateMeasurementStatus);

// ==========================================
// 10. TENDER MANAGEMENT ENDPOINTS
// ==========================================
router.get('/tenders', procurementController.getTenders);
router.post('/tenders', procurementController.createTender);

// ==========================================
// 11. PROJECT COST CONTROL & ANALYTICS
// ==========================================
router.get('/cost-control', procurementController.getCostControls);
router.get('/reports/dashboard', procurementController.getDashboardReports);

// ==========================================
// 12. MATERIAL REQUEST & APPROVAL ENGINE ENDPOINTS
// ==========================================
router.get(['/material-requests', '/material-request'], procurementController.getMaterialRequests);
router.get(['/material-requests/:id', '/material-request/:id'], procurementController.getMaterialRequestById);
router.post(['/material-requests', '/material-request'], procurementController.createMaterialRequest);
router.post(['/material-requests/:id/action', '/material-request/:id/action'], procurementController.processMaterialRequestAction);
router.post(['/material-requests/:id/receive', '/material-request/:id/receive'], procurementController.recordMaterialReceipt);
router.post(['/material-requests/:id/attachments', '/material-request/:id/attachments'], procurementController.addMaterialRequestAttachment);

// Workflows, Notifications, Audit Logs & Store Ledger
router.get('/workflows', procurementController.getWorkflowConfigs);
router.get('/workflows/:projectId', procurementController.getWorkflowConfigByProjectId);
router.post('/workflows', procurementController.saveWorkflowConfig);

router.get('/notifications', procurementController.getNotifications);
router.patch('/notifications/:id/read', procurementController.markNotificationRead);

router.get('/audit-logs', procurementController.getAuditLogs);
router.get('/stock-transactions', procurementController.getStockTransactions);
router.get('/material-ledger', procurementController.getMaterialLedger);

// ==========================================
// 13. PHASE 56 ENTERPRISE PROCUREMENT ENDPOINTS
// ==========================================

// PR Endpoints
router.get('/pr', procurementController.getPhase56PRs);
router.post('/pr', procurementController.createPhase56PR);
router.get('/pr/:id', procurementController.getPhase56PRById);
router.post('/pr/approve', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), procurementController.approvePhase56PR);
router.delete('/pr/:id', requireRoles('ADMIN', 'MANAGER'), procurementController.deletePhase56PR);

// RFQ Endpoints
router.get('/rfq', procurementController.getPhase56RFQs);
router.post('/rfq', procurementController.createPhase56RFQ);
router.get('/rfq/:id', procurementController.getPhase56RFQById);
router.delete('/rfq/:id', requireRoles('ADMIN', 'MANAGER'), procurementController.deletePhase56RFQ);

// Vendor Quotations
router.get('/quotations', procurementController.getPhase56VendorQuotations);
router.post('/quotations', procurementController.createPhase56VendorQuotation);

// Evaluations
router.get('/evaluations/technical', procurementController.getTechnicalEvaluations);
router.post('/evaluations/technical', procurementController.createTechnicalEvaluation);
router.get('/evaluations/commercial', procurementController.getCommercialEvaluations);
router.post('/evaluations/commercial', procurementController.createCommercialEvaluation);

// Comparative Statements
router.get('/comparative', procurementController.getComparativeStatements);
router.post('/comparative', procurementController.createComparativeStatement);
router.put('/comparative/:id/approve', requireRoles('ADMIN', 'MANAGER'), procurementController.approveComparativeStatement);
router.post('/comparative/:id/generate-po', requireRoles('ADMIN', 'MANAGER'), procurementController.generatePoFromComparativeStatement);
router.post('/comparative/:id/convert-to-po', requireRoles('ADMIN', 'MANAGER'), procurementController.generatePoFromComparativeStatement);

// Purchase Orders
router.get('/po', procurementController.getPhase56POs);
router.post('/po', requireRoles('ADMIN', 'MANAGER'), procurementController.createPhase56PO);
router.get('/po/:id', procurementController.getPhase56POById);
router.put('/po/revise', requireRoles('ADMIN', 'MANAGER'), procurementController.revisePO);

// Delivery Schedules
router.get('/delivery', procurementController.getDeliverySchedules);
router.post('/delivery', procurementController.createDeliverySchedule);
router.put('/delivery/:id/status', procurementController.updateDeliveryScheduleStatus);

// Vendor Performance
router.get('/performance', procurementController.getVendorPerformances);
router.post('/performance', procurementController.createVendorPerformance);

// Budget Allocations
router.get('/budgets', procurementController.getBudgetAllocations);
router.post('/budgets', requireRoles('ADMIN', 'MANAGER'), procurementController.createBudgetAllocation);

// Procurement Logs
router.get('/logs', procurementController.getProcurementLogs);

// ==========================================
// 14. PHASE 77 / P2.0: CONTRACTOR RUNNING ACCOUNT (RA) BILLING & CERTIFICATION
// ==========================================
router.get('/ra-bills', procurementController.getRABills);
router.get('/ra-bills/:id', procurementController.getRABillById);
router.post('/ra-bills', procurementController.createRABill);
router.patch('/ra-bills/:id/status', procurementController.updateRABillStatus);
router.put('/ra-bills/:id/status', procurementController.updateRABillStatus);
router.delete('/ra-bills/:id', requireRoles('ADMIN', 'MANAGER'), procurementController.deleteRABill);

export default router;

