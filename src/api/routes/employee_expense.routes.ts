import { Router } from 'express';
import { employeeExpenseController } from '../controllers/employee_expense.controller';

const router = Router();

// 1. Categories
router.get('/categories', (req, res) => employeeExpenseController.getCategories(req, res));
router.post('/categories', (req, res) => employeeExpenseController.addCategory(req, res));

// 2. Duplicate Detection
router.post('/check-duplicate', (req, res) => employeeExpenseController.checkDuplicate(req, res));

// 3. Claims Management & Lifecycle
router.get('/', (req, res) => employeeExpenseController.getExpenseClaims(req, res));
router.post('/', (req, res) => employeeExpenseController.createExpenseClaim(req, res));
router.get('/:id', (req, res) => employeeExpenseController.getExpenseClaimById(req, res));

// 4. Approval Actions
router.post('/:id/approve-manager', (req, res) => employeeExpenseController.approveByManager(req, res));
router.post('/:id/verify-finance', (req, res) => employeeExpenseController.verifyByFinance(req, res));
router.post('/:id/pay', (req, res) => employeeExpenseController.disbursePayment(req, res));
router.post('/:id/reject', (req, res) => employeeExpenseController.rejectClaim(req, res));
router.post('/:id/request-clarification', (req, res) => employeeExpenseController.requestClarification(req, res));

// 5. Cash Advances & Settlements
router.get('/advances/list', (req, res) => employeeExpenseController.getCashAdvances(req, res));
router.post('/advances/create', (req, res) => employeeExpenseController.createCashAdvance(req, res));
router.post('/advances/:id/disburse', (req, res) => employeeExpenseController.disburseCashAdvance(req, res));
router.post('/advances/:id/settle', (req, res) => employeeExpenseController.settleCashAdvance(req, res));

// 6. Petty Cash Registers & Vouchers
router.get('/petty-cash/registers', (req, res) => employeeExpenseController.getPettyCashRegisters(req, res));
router.get('/petty-cash/vouchers', (req, res) => employeeExpenseController.getPettyCashVouchers(req, res));
router.post('/petty-cash/vouchers', (req, res) => employeeExpenseController.createPettyCashVoucher(req, res));
router.post('/petty-cash/reconcile', (req, res) => employeeExpenseController.reconcilePettyCash(req, res));

// 7. Reports & Analytics
router.get('/reports/summary', (req, res) => employeeExpenseController.getExpenseReports(req, res));

export default router;
