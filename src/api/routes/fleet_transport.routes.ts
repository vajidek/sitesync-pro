import { Router } from 'express';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { FleetTransportController } from '../controllers/fleet_transport.controller';

const router = Router();
const controller = new FleetTransportController();

// Apply JWT authentication
router.use(authenticateJWT);

// Fleet Dashboard Stats
router.get('/stats', controller.getFleetStats.bind(controller));

// Vehicle Master
router.get('/vehicles', controller.getVehicles.bind(controller));
router.get('/vehicles/:id', controller.getVehicleById.bind(controller));
router.post('/vehicles', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.registerVehicle.bind(controller));
router.patch('/vehicles/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.updateVehicle.bind(controller));

// Drivers
router.get('/drivers', controller.getDrivers.bind(controller));
router.post('/drivers', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.registerDriver.bind(controller));

// Trips
router.get('/trips', controller.getTrips.bind(controller));
router.post('/trips', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.dispatchTrip.bind(controller));
router.post('/trips/:id/complete', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.completeTrip.bind(controller));

// Fuel Logs
router.get('/fuel/logs', controller.getFuelLogs.bind(controller));
router.post('/fuel/logs', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.logFuel.bind(controller));

// Accidents
router.post('/accidents', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.reportAccident.bind(controller));

// Compliance Documents
router.get('/documents', controller.getDocuments.bind(controller));
router.post('/documents', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.registerDocument.bind(controller));

export default router;
