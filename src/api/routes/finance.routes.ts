import { Router } from 'express';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { FinanceController } from '../controllers/finance.controller';
import { projectCashRequestController } from '../controllers/projectCashRequest.controller';

const router = Router();
const controller = new FinanceController();

// Apply JWT authentication
router.use(authenticateJWT);

// Executive Finance Stats & Dashboard
router.get('/stats', controller.getFinanceStats.bind(controller));

// Project Imprest & Local Cash Requests
router.get('/cash-requests', projectCashRequestController.getAll.bind(projectCashRequestController));
router.post('/cash-requests', projectCashRequestController.create.bind(projectCashRequestController));
router.get('/cash-requests/:id', projectCashRequestController.getById.bind(projectCashRequestController));
router.put('/cash-requests/:id', projectCashRequestController.update.bind(projectCashRequestController));
router.post('/cash-requests/:id/review', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), projectCashRequestController.reviewByIncharge.bind(projectCashRequestController));
router.post('/cash-requests/:id/approve', requireRoles('ADMIN', 'MANAGER'), projectCashRequestController.approveByDirector.bind(projectCashRequestController));
router.post('/cash-requests/:id/disburse', requireRoles('ADMIN', 'MANAGER'), projectCashRequestController.disburseByFinance.bind(projectCashRequestController));
router.post('/cash-requests/:id/settle', projectCashRequestController.submitSettlement.bind(projectCashRequestController));
router.post('/cash-requests/settlements/:settlementId/audit', requireRoles('ADMIN', 'MANAGER'), projectCashRequestController.auditSettlement.bind(projectCashRequestController));

// Chart of Accounts
router.get('/accounts', controller.getAccounts.bind(controller));
router.post('/accounts', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createAccount.bind(controller));

// Cost Centers & Profit Centers
router.get('/cost-centers', controller.getCostCenters.bind(controller));
router.post('/cost-centers', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createCostCenter.bind(controller));

// Journal Entries & Double-Entry Posting
router.get('/journals', controller.getJournalEntries.bind(controller));
router.post('/journals', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.postJournalEntry.bind(controller));

// General Ledger
router.get('/general-ledger', controller.getGeneralLedger.bind(controller));

// Accounts Payable (AP)
router.get('/ap/invoices', controller.getAPInvoices.bind(controller));
router.post('/ap/invoices', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createAPInvoice.bind(controller));

// Accounts Receivable (AR)
router.get('/ar/invoices', controller.getARInvoices.bind(controller));
router.post('/ar/invoices', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createARInvoice.bind(controller));

// Banking & Cash Book
router.get('/bank-accounts', controller.getBankAccounts.bind(controller));
router.post('/bank-accounts', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createBankAccount.bind(controller));
router.get('/cash-transactions', controller.getCashTransactions.bind(controller));
router.post('/cash-transactions', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createCashTransaction.bind(controller));

// Budget Control
router.get('/budgets', controller.getBudgets.bind(controller));
router.post('/budgets', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createBudget.bind(controller));

// Tax & VAT
router.get('/taxes', controller.getTaxes.bind(controller));
router.post('/taxes', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createTax.bind(controller));

// Audited Financial Statements
router.get('/statements/trial-balance', controller.getTrialBalance.bind(controller));
router.get('/statements/profit-loss', controller.getProfitAndLoss.bind(controller));
router.get('/statements/balance-sheet', controller.getBalanceSheet.bind(controller));
router.get('/statements/cash-flow', controller.getCashFlowStatement.bind(controller));

export default router;
