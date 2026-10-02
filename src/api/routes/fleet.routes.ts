import { Router } from 'express';
import { fleetController } from '../controllers/fleet.controller';
import { authenticateJWT as authenticateToken, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all fleet routes
router.use(authenticateToken);

// --- Analytics & Alerts ---
router.get('/analytics', fleetController.getFleetAnalytics.bind(fleetController));
router.get('/notifications', fleetController.getNotifications.bind(fleetController));

// --- Vehicle Management ---
router.get('/vehicles', fleetController.getVehicles.bind(fleetController));
router.get('/vehicles/:id', fleetController.getVehicleById.bind(fleetController));
router.post('/vehicles', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), fleetController.createVehicle.bind(fleetController));
router.put('/vehicles/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), fleetController.updateVehicle.bind(fleetController));
router.delete('/vehicles/:id', requireRoles('ADMIN', 'MANAGER'), fleetController.deleteVehicle.bind(fleetController));

// --- Driver Management ---
router.get('/drivers', fleetController.getDrivers.bind(fleetController));
router.post('/drivers', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), fleetController.createDriver.bind(fleetController));
router.put('/drivers/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), fleetController.updateDriver.bind(fleetController));

// --- Equipment Management ---
router.get('/equipment', fleetController.getEquipment.bind(fleetController));
router.post('/equipment', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), fleetController.createEquipment.bind(fleetController));
router.put('/equipment/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), fleetController.updateEquipment.bind(fleetController));

// --- Maintenance & Repairs ---
router.get('/maintenance', fleetController.getMaintenanceRecords.bind(fleetController));
router.post('/maintenance', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), fleetController.createMaintenanceRecord.bind(fleetController));

// --- Fuel Management ---
router.get('/fuel-logs', fleetController.getFuelLogs.bind(fleetController));
router.post('/fuel-logs', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'DRIVER', 'OPERATOR'), fleetController.createFuelLog.bind(fleetController));

// --- Vehicle Movement & Trip Logs ---
router.get('/trip-logs', fleetController.getTripLogs.bind(fleetController));
router.post('/trip-logs', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'DRIVER', 'OPERATOR'), fleetController.createTripLog.bind(fleetController));

export default router;
