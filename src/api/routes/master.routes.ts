import { Router } from 'express';
import { masterController } from '../controllers/master.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { validate } from '../validators/auth.validator';
import {
  CreateCompanySchema,
  CreateEmployeeSchema,
  CreateProjectSchema,
  CreateDocumentSchema,
} from '../validators/master.validator';

const router = Router();

// Apply authentication to all master data endpoints
router.use(authenticateJWT);

// Companies
router.get('/companies', (req, res) => masterController.listCompanies(req as any, res));
router.post('/companies', requireRoles('ADMIN'), validate(CreateCompanySchema), (req, res) => masterController.createCompany(req as any, res));

// Organizational Structure
router.get('/branches', (req, res) => masterController.listBranches(req as any, res));
router.get('/departments', (req, res) => masterController.listDepartments(req as any, res));
router.get('/designations', (req, res) => masterController.listDesignations(req as any, res));

// 13 Master Data Categories
router.get('/shifts', (req, res) => masterController.listShifts(req as any, res));
router.post('/shifts', requireRoles('ADMIN', 'MANAGER'), (req, res) => masterController.createShift(req as any, res));

router.get('/employment-types', (req, res) => masterController.listEmploymentTypes(req as any, res));
router.post('/employment-types', requireRoles('ADMIN', 'MANAGER'), (req, res) => masterController.createEmploymentType(req as any, res));

router.get('/holidays', (req, res) => masterController.listHolidayCalendars(req as any, res));
router.post('/holidays', requireRoles('ADMIN', 'MANAGER'), (req, res) => masterController.createHolidayCalendar(req as any, res));

router.get('/skills', (req, res) => masterController.listSkills(req as any, res));
router.post('/skills', requireRoles('ADMIN', 'MANAGER'), (req, res) => masterController.createSkill(req as any, res));

router.get('/employee-categories', (req, res) => masterController.listEmployeeCategories(req as any, res));
router.post('/employee-categories', requireRoles('ADMIN', 'MANAGER'), (req, res) => masterController.createEmployeeCategory(req as any, res));

router.get('/vendor-categories', (req, res) => masterController.listVendorCategories(req as any, res));
router.post('/vendor-categories', requireRoles('ADMIN', 'MANAGER'), (req, res) => masterController.createVendorCategory(req as any, res));

router.get('/vehicle-categories', (req, res) => masterController.listVehicleCategories(req as any, res));
router.post('/vehicle-categories', requireRoles('ADMIN', 'MANAGER'), (req, res) => masterController.createVehicleCategory(req as any, res));

router.get('/equipment-categories', (req, res) => masterController.listEquipmentCategories(req as any, res));
router.post('/equipment-categories', requireRoles('ADMIN', 'MANAGER'), (req, res) => masterController.createEquipmentCategory(req as any, res));

// Employees
router.get('/employees', (req, res) => masterController.listEmployees(req as any, res));
router.get('/employees/:id', (req, res) => masterController.getEmployeeById(req as any, res));
router.post('/employees', requireRoles('ADMIN', 'MANAGER'), validate(CreateEmployeeSchema), (req, res) => masterController.createEmployee(req as any, res));

// Projects & Sites
router.get('/projects', (req, res) => masterController.listProjects(req as any, res));
router.get('/projects/:id', (req, res) => masterController.getProjectById(req as any, res));
router.post('/projects', requireRoles('ADMIN', 'MANAGER'), validate(CreateProjectSchema), (req, res) => masterController.createProject(req as any, res));
router.get('/sites', (req, res) => masterController.listSites(req as any, res));

// Third-Party Entities
router.get('/contractors', (req, res) => masterController.listContractors(req as any, res));
router.get('/vendors', (req, res) => masterController.listVendors(req as any, res));
router.get('/customers', (req, res) => masterController.listCustomers(req as any, res));

// Inventory & Warehouse
router.get('/materials', (req, res) => masterController.listMaterials(req as any, res));
router.get('/materials/categories', (req, res) => masterController.listMaterialCategories(req as any, res));
router.get('/materials/units', (req, res) => masterController.listMaterialUnits(req as any, res));
router.get('/warehouses', (req, res) => masterController.listWarehouses(req as any, res));
router.get('/stocks', (req, res) => masterController.listStocks(req as any, res));

// Equipment & Vehicles
router.get('/equipment', (req, res) => masterController.listEquipment(req as any, res));
router.get('/vehicles', (req, res) => masterController.listVehicles(req as any, res));

// Documents
router.get('/documents/:entityType/:entityId', (req, res) => masterController.listDocuments(req as any, res));
router.post('/documents', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), validate(CreateDocumentSchema), (req, res) => masterController.createDocument(req as any, res));

export default router;
