import { Router } from 'express';
import { HrmsController } from '../controllers/hrms.controller';
import { hrController } from '../controllers/hr.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();
const controller = new HrmsController();

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
router.use(
  requireRoles(
    'ADMIN',
    'MANAGER',
    'INCHARGE',
    'SUPERVISOR',
    'STORE_KEEPER'
  )
);

// Departments & Designations
router.get('/departments', controller.getDepartments);
router.post('/departments', requireRoles('ADMIN', 'MANAGER'), controller.createDepartment);
router.get('/designations', controller.getDesignations);
router.post('/designations', requireRoles('ADMIN', 'MANAGER'), controller.createDesignation);

// Employees (Authoritative Enterprise HR Master)
router.get('/employees', (req, res) => hrController.getEmployees(req, res));
router.get('/employees/hierarchy-tree', (req, res) => hrController.getReportingHierarchyTree(req, res));
router.get('/employees/:id', (req, res) => hrController.getEmployeeById(req, res));
router.post('/employees', requireRoles('ADMIN', 'MANAGER'), (req, res) => hrController.createEmployee(req, res));
router.post('/employees/bulk-import', requireRoles('ADMIN', 'MANAGER'), (req, res) => hrController.bulkImportEmployees(req, res));
router.put('/employees/:id', requireRoles('ADMIN', 'MANAGER'), (req, res) => hrController.updateEmployee(req, res));
router.delete('/employees/:id', requireRoles('ADMIN', 'MANAGER'), (req, res) => hrController.deleteEmployee(req, res));
router.post('/employees/:id/restore', requireRoles('ADMIN', 'MANAGER'), (req, res) => hrController.restoreEmployee(req, res));

// Attendance & Biometrics
router.get('/attendance', controller.getAttendance);
router.get('/attendance/raw-punches', requireRoles('ADMIN', 'MANAGER'), controller.getRawBiometricPunches);
router.post('/attendance', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.recordAttendance);
router.post('/attendance/punch', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res) => hrController.punchAttendance(req, res));
router.post('/attendance/sync-essl', requireRoles('ADMIN', 'MANAGER'), controller.syncEssl);
router.post('/attendance/essl-sync', requireRoles('ADMIN', 'MANAGER'), controller.syncEssl);
router.get('/attendance/finalizations', controller.getAttendanceFinalizations);
router.post('/attendance/finalize', requireRoles('ADMIN', 'MANAGER'), controller.finalizeAttendance);
router.post('/attendance/unlock', requireRoles('ADMIN', 'MANAGER'), controller.unlockAttendanceFinalization);

// Shifts
router.get('/shifts', controller.getShifts);
router.post('/shifts', requireRoles('ADMIN', 'MANAGER'), controller.createShift);

// Leaves
router.get('/leave-types', controller.getLeaveTypes);
router.get('/leaves', controller.getLeaves);
router.post('/leaves', controller.applyLeave);
router.patch('/leaves/:id/review', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.reviewLeave);
router.put('/leaves/:id/approve', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res) =>
  hrController.approveLeave(req, res)
);

// Daily Duty Logs & Labour Allocation (Compatibility)
router.get('/duty-logs', (req, res) => hrController.getDutyLogs(req, res));
router.post('/duty-logs', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res) => hrController.createDutyLog(req, res));
router.put('/duty-logs/:id/verify', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res) => hrController.verifyDutyLog(req, res));
router.get('/labour', (req, res) => hrController.getLabour(req, res));
router.post('/labour/allocate', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res) => hrController.createLabourAllocation(req, res));

// Holidays
router.get('/holidays', controller.getHolidays);

// Statutory Rules Management (P2.11)
router.get('/statutory-rules', controller.getStatutoryRules);
router.post('/statutory-rules', requireRoles('ADMIN', 'MANAGER'), controller.upsertStatutoryRule);
router.put('/statutory-rules', requireRoles('ADMIN', 'MANAGER'), controller.upsertStatutoryRule);

// Employee Statutory Profiles (P2.11)
router.get('/employees/:employeeId/statutory-profile', controller.getEmployeeStatutoryProfile);
router.put('/employees/:employeeId/statutory-profile', requireRoles('ADMIN', 'MANAGER'), controller.updateEmployeeStatutoryProfile);

// Payroll & Maker-Checker Governance (P2.11)
router.get('/payroll', controller.getPayslips);
router.get('/salary-structures', controller.getSalaryStructures);
router.post('/salary-structures', requireRoles('ADMIN', 'MANAGER'), controller.createSalaryStructure);
router.get('/payroll-periods', controller.getPayrollPeriods);
router.get('/payslips', controller.getPayslips);
router.post('/payslips/:id/hold', requireRoles('ADMIN', 'MANAGER'), controller.holdPayslip);
router.post('/payslips/:id/unhold', requireRoles('ADMIN', 'MANAGER'), controller.unholdPayslip);
router.get('/payroll-runs', controller.getPayrollRuns);
router.get('/payroll-runs/:id', controller.getPayrollRunById);
router.post('/payroll/run', requireRoles('ADMIN', 'MANAGER'), controller.executePayrollRun);
router.post('/payroll-runs/:id/submit-review', requireRoles('ADMIN', 'MANAGER'), controller.submitPayrollForReview);
router.post('/payroll-runs/:id/approve', requireRoles('ADMIN', 'MANAGER'), controller.approvePayrollRun);
router.post('/payroll-runs/:id/reject', requireRoles('ADMIN', 'MANAGER'), controller.rejectPayrollRun);
router.post('/payroll-runs/:id/disburse', requireRoles('ADMIN', 'MANAGER'), controller.disbursePayrollRun);
router.post('/payroll/runs/:id/disburse', requireRoles('ADMIN', 'MANAGER'), controller.disbursePayrollRun);
router.post('/payroll/generate', requireRoles('ADMIN', 'MANAGER'), (req, res) =>
  hrController.generatePayroll(req, res)
);

// Notifications
router.get('/notifications', (req, res) => hrController.getNotifications(req, res));

// Loans & Advances
router.get('/loans', controller.getLoans);
router.post('/loans', controller.createLoan);
router.post('/loans/:id/approve', requireRoles('ADMIN', 'MANAGER'), controller.approveLoan);
router.get('/loans/recoveries', controller.getLoanRecoveries);
router.post('/loans/simulate', controller.simulateLoanRecovery);

// Appraisals & Performance
router.get('/performance-reviews', controller.getPerformanceReviews);
router.post('/performance-reviews', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createPerformanceReview);

// Recruitment
router.get('/recruitment', controller.getRecruitments);
router.post('/recruitment', requireRoles('ADMIN', 'MANAGER'), controller.createRecruitment);
router.get('/candidates', controller.getCandidates);
router.post('/candidates', requireRoles('ADMIN', 'MANAGER'), controller.createCandidate);

// Training
router.get('/training', controller.getTrainingPrograms);
router.post('/training', requireRoles('ADMIN', 'MANAGER'), controller.createTrainingProgram);
router.get('/training-programs', controller.getTrainingPrograms);
router.post('/training-programs', requireRoles('ADMIN', 'MANAGER'), controller.createTrainingProgram);

// Audit Logs
router.get('/audit-logs', controller.getAuditLogs);

// Direct Routers for top-level mounting
export const employeeRouter = Router();
employeeRouter.use(authenticateJWT);
employeeRouter.get('/', (req, res) => hrController.getEmployees(req, res));
employeeRouter.get('/hierarchy-tree', (req, res) => hrController.getReportingHierarchyTree(req, res));
employeeRouter.get('/:id', (req, res) => hrController.getEmployeeById(req, res));
employeeRouter.post('/', requireRoles('ADMIN', 'MANAGER'), (req, res) => hrController.createEmployee(req, res));
employeeRouter.post('/bulk-import', requireRoles('ADMIN', 'MANAGER'), (req, res) => hrController.bulkImportEmployees(req, res));
employeeRouter.put('/:id', requireRoles('ADMIN', 'MANAGER'), (req, res) => hrController.updateEmployee(req, res));
employeeRouter.delete('/:id', requireRoles('ADMIN', 'MANAGER'), (req, res) => hrController.deleteEmployee(req, res));
employeeRouter.post('/:id/restore', requireRoles('ADMIN', 'MANAGER'), (req, res) => hrController.restoreEmployee(req, res));

export const payrollRouter = Router();
payrollRouter.use(authenticateJWT);
payrollRouter.get('/', controller.getPayslips);
payrollRouter.get('/payslips', controller.getPayslips);
payrollRouter.get('/periods', controller.getPayrollPeriods);
payrollRouter.get('/structures', controller.getSalaryStructures);
payrollRouter.post('/', requireRoles('ADMIN', 'MANAGER'), controller.executePayrollRun);
payrollRouter.post('/run', requireRoles('ADMIN', 'MANAGER'), controller.executePayrollRun);

export const attendanceRouter = Router();
attendanceRouter.use(authenticateJWT);
attendanceRouter.get('/', controller.getAttendance);
attendanceRouter.post('/', controller.recordAttendance);
attendanceRouter.post('/sync-essl', requireRoles('ADMIN', 'MANAGER'), controller.syncEssl);

export const leaveRouter = Router();
leaveRouter.use(authenticateJWT);
leaveRouter.get('/', controller.getLeaves);
leaveRouter.get('/types', controller.getLeaveTypes);
leaveRouter.post('/', controller.applyLeave);
leaveRouter.patch('/:id/review', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.reviewLeave);

export const recruitmentRouter = Router();
recruitmentRouter.use(authenticateJWT);
recruitmentRouter.get('/', controller.getRecruitments);
recruitmentRouter.post('/', requireRoles('ADMIN', 'MANAGER'), controller.createRecruitment);
recruitmentRouter.get('/candidates', controller.getCandidates);
recruitmentRouter.post('/candidates', requireRoles('ADMIN', 'MANAGER'), controller.createCandidate);

export const trainingRouter = Router();
trainingRouter.use(authenticateJWT);
trainingRouter.get('/', controller.getTrainingPrograms);
trainingRouter.post('/', requireRoles('ADMIN', 'MANAGER'), controller.createTrainingProgram);

export const performanceRouter = Router();
performanceRouter.use(authenticateJWT);
performanceRouter.get('/', controller.getPerformanceReviews);
performanceRouter.post('/', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createPerformanceReview);

export default router;
