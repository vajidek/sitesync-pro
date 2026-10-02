import { Router } from 'express';
import { eamController } from '../controllers/eam.controller';
import { AssetEAMController } from '../controllers/asset_eam.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { UserRole } from '../../types';

const legacyAssetController = new AssetEAMController();

const EAM_ROLES: UserRole[] = [
  'ADMIN',
  'MANAGER',
  'INCHARGE',
  'SUPERVISOR',
  'STORE_KEEPER',
  'OPERATOR',
];

// 1. Primary EAM Router
export const eamRouter = Router();
eamRouter.use(authenticateJWT);
eamRouter.use(requireRoles(...EAM_ROLES));

// Executive Dashboard & Stats
eamRouter.get('/stats', (req: any, res) => eamController.getDashboardStats(req, res));
eamRouter.get('/dashboard', (req: any, res) => eamController.getDashboardStats(req, res));

// Categories & Locations
eamRouter.get('/categories', (req: any, res) => eamController.getCategories(req, res));
eamRouter.post('/categories', (req: any, res) => eamController.createCategory(req, res));
eamRouter.get('/locations', (req: any, res) => eamController.getLocations(req, res));
eamRouter.post('/locations', (req: any, res) => eamController.createLocation(req, res));
eamRouter.get('/criticality', (req: any, res) => eamController.getCriticalityMatrix(req, res));

// Assets (Authoritative Enterprise EAM)
eamRouter.get('/assets', (req: any, res) => eamController.getAssets(req, res));
eamRouter.get('/assets/:id', (req: any, res) => eamController.getAssetById(req, res));
eamRouter.post('/assets', (req: any, res) => eamController.createAsset(req, res));
eamRouter.put('/assets/:id', (req: any, res) => eamController.updateAsset(req, res));
eamRouter.post('/assets/transfer', (req: any, res) => legacyAssetController.transferAsset(req, res));
eamRouter.post('/assets/assign', (req: any, res) => legacyAssetController.assignAsset(req, res));
eamRouter.post('/assets/meter-reading', (req: any, res) => legacyAssetController.recordMeterReading(req, res));

// PM Plans & Schedules
eamRouter.get('/plans', (req: any, res) => eamController.getPreventivePlans(req, res));
eamRouter.post('/plans', (req: any, res) => eamController.createPreventivePlan(req, res));
eamRouter.get('/schedules', (req: any, res) => eamController.getMaintenanceSchedules(req, res));
eamRouter.post('/schedules', (req: any, res) => eamController.createMaintenanceSchedule(req, res));

// Work Orders
eamRouter.get('/workorders', (req: any, res) => eamController.getWorkOrders(req, res));
eamRouter.get('/workorders/:id', (req: any, res) => eamController.getWorkOrderById(req, res));
eamRouter.post('/workorders', (req: any, res) => eamController.createWorkOrder(req, res));
eamRouter.put('/workorders/:id', (req: any, res) => eamController.updateWorkOrder(req, res));

// Maintenance subpaths (Compatibility)
eamRouter.get('/maintenance/plans', (req: any, res) => eamController.getPreventivePlans(req, res));
eamRouter.post('/maintenance/plans', (req: any, res) => eamController.createPreventivePlan(req, res));
eamRouter.get('/maintenance/work-orders', (req: any, res) => eamController.getWorkOrders(req, res));
eamRouter.post('/maintenance/work-orders', (req: any, res) => eamController.createWorkOrder(req, res));
eamRouter.patch('/maintenance/work-orders/:id', (req: any, res) => eamController.updateWorkOrder(req, res));
eamRouter.put('/maintenance/work-orders/:id', (req: any, res) => eamController.updateWorkOrder(req, res));

// Fuel Management & Calibrations (Compatibility)
eamRouter.get('/fuel/logs', (req: any, res) => legacyAssetController.getFuelLogs(req, res));
eamRouter.post('/fuel/logs', (req: any, res) => legacyAssetController.logFuel(req, res));
eamRouter.get('/calibrations', (req: any, res) => eamController.getCalibrationRecords(req, res));
eamRouter.post('/calibrations', (req: any, res) => eamController.createCalibrationRecord(req, res));

// Breakdowns
eamRouter.get('/breakdowns', (req: any, res) => eamController.getBreakdownReports(req, res));
eamRouter.post('/breakdowns', (req: any, res) => eamController.createBreakdownReport(req, res));

// Condition Monitoring & Telemetry
eamRouter.get('/telemetry', (req: any, res) => eamController.getConditionMonitoring(req, res));
eamRouter.post('/telemetry', (req: any, res) => eamController.createConditionMonitoring(req, res));

// Calibration & Inspection
eamRouter.get('/calibration', (req: any, res) => eamController.getCalibrationRecords(req, res));
eamRouter.post('/calibration', (req: any, res) => eamController.createCalibrationRecord(req, res));
eamRouter.get('/inspection', (req: any, res) => eamController.getInspectionRecords(req, res));
eamRouter.post('/inspection', (req: any, res) => eamController.createInspectionRecord(req, res));

// Maintenance Costs & Audit Logs
eamRouter.get('/costs', (req: any, res) => eamController.getMaintenanceCosts(req, res));
eamRouter.get('/audit-logs', (req: any, res) => eamController.getAuditLogs(req, res));


// 2. Direct-mount Asset Router (/api/assets)
export const assetRouter = Router();
assetRouter.use(authenticateJWT);
assetRouter.use(requireRoles(...EAM_ROLES));
assetRouter.get('/', (req: any, res) => eamController.getAssets(req, res));
assetRouter.get('/:id', (req: any, res) => eamController.getAssetById(req, res));
assetRouter.post('/', (req: any, res) => eamController.createAsset(req, res));
assetRouter.put('/:id', (req: any, res) => eamController.updateAsset(req, res));


// 3. Direct-mount Maintenance Router (/api/maintenance)
export const maintenanceRouter = Router();
maintenanceRouter.use(authenticateJWT);
maintenanceRouter.use(requireRoles(...EAM_ROLES));
maintenanceRouter.get('/', (req: any, res) => eamController.getWorkOrders(req, res));
maintenanceRouter.get('/plans', (req: any, res) => eamController.getPreventivePlans(req, res));
maintenanceRouter.post('/plans', (req: any, res) => eamController.createPreventivePlan(req, res));
maintenanceRouter.get('/schedules', (req: any, res) => eamController.getMaintenanceSchedules(req, res));
maintenanceRouter.post('/schedules', (req: any, res) => eamController.createMaintenanceSchedule(req, res));
maintenanceRouter.get('/breakdowns', (req: any, res) => eamController.getBreakdownReports(req, res));
maintenanceRouter.post('/breakdowns', (req: any, res) => eamController.createBreakdownReport(req, res));


// 4. Direct-mount Work Orders Router (/api/workorders)
export const workOrderRouter = Router();
workOrderRouter.use(authenticateJWT);
workOrderRouter.use(requireRoles(...EAM_ROLES));
workOrderRouter.get('/', (req: any, res) => eamController.getWorkOrders(req, res));
workOrderRouter.get('/:id', (req: any, res) => eamController.getWorkOrderById(req, res));
workOrderRouter.post('/', (req: any, res) => eamController.createWorkOrder(req, res));
workOrderRouter.put('/:id', (req: any, res) => eamController.updateWorkOrder(req, res));


// 5. Direct-mount Calibration Router (/api/calibration)
export const calibrationRouter = Router();
calibrationRouter.use(authenticateJWT);
calibrationRouter.use(requireRoles(...EAM_ROLES));
calibrationRouter.get('/', (req: any, res) => eamController.getCalibrationRecords(req, res));
calibrationRouter.post('/', (req: any, res) => eamController.createCalibrationRecord(req, res));


// 6. Direct-mount Inspection Router (/api/inspection)
export const inspectionRouter = Router();
inspectionRouter.use(authenticateJWT);
inspectionRouter.use(requireRoles(...EAM_ROLES));
inspectionRouter.get('/', (req: any, res) => eamController.getInspectionRecords(req, res));
inspectionRouter.post('/', (req: any, res) => eamController.createInspectionRecord(req, res));
