import { Router } from 'express';
import { iotScadaController } from '../controllers/iot_scada.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { UserRole } from '../../types';

const IOT_SCADA_ROLES: UserRole[] = [
  'ADMIN',
  'MANAGER',
  'INCHARGE',
  'SUPERVISOR',
  'STORE_KEEPER',
  'OPERATOR',
];

// Helper to configure authenticated router
const createProtectedRouter = () => {
  const router = Router();
  router.use(authenticateJWT);
  router.use(requireRoles(...IOT_SCADA_ROLES));
  return router;
};

// 1. /api/iot
export const iotRouter = createProtectedRouter();
iotRouter.get('/stats', (req: any, res) => iotScadaController.getIotStats(req, res));
iotRouter.get('/overview', (req: any, res) => iotScadaController.getIotStats(req, res));
iotRouter.get('/devices', (req: any, res) => iotScadaController.getDevices(req, res));
iotRouter.post('/devices', (req: any, res) => iotScadaController.createDevice(req, res));
iotRouter.get('/gateways', (req: any, res) => iotScadaController.getGateways(req, res));
iotRouter.get('/sensors', (req: any, res) => iotScadaController.getSensors(req, res));

// 2. /api/scada
export const scadaRouter = createProtectedRouter();
scadaRouter.get('/stats', (req: any, res) => iotScadaController.getScadaStats(req, res));
scadaRouter.get('/tags', (req: any, res) => iotScadaController.getScadaTags(req, res));
scadaRouter.get('/dashboards', (req: any, res) => iotScadaController.getScadaDashboards(req, res));
scadaRouter.post('/command', (req: any, res) => iotScadaController.sendDeviceCommand(req, res));
scadaRouter.get('/commands', (req: any, res) => iotScadaController.getCommandsHistory(req, res));

// 3. /api/telemetry
export const telemetryRouter = createProtectedRouter();
telemetryRouter.get('/latest', (req: any, res) => iotScadaController.getLatestTelemetry(req, res));
telemetryRouter.get('/historical', (req: any, res) => iotScadaController.getHistoricalTelemetry(req, res));
telemetryRouter.get('/', (req: any, res) => iotScadaController.getLatestTelemetry(req, res));
telemetryRouter.post('/', (req: any, res) => iotScadaController.ingestTelemetry(req, res));

// 4. /api/devices
export const devicesRouter = createProtectedRouter();
devicesRouter.get('/', (req: any, res) => iotScadaController.getDevices(req, res));
devicesRouter.get('/:id', (req: any, res) => iotScadaController.getDeviceById(req, res));
devicesRouter.post('/', (req: any, res) => iotScadaController.createDevice(req, res));
devicesRouter.put('/:id', (req: any, res) => iotScadaController.updateDevice(req, res));

// 5. /api/gateways
export const gatewaysRouter = createProtectedRouter();
gatewaysRouter.get('/', (req: any, res) => iotScadaController.getGateways(req, res));
gatewaysRouter.post('/', (req: any, res) => iotScadaController.createGateway(req, res));

// 6. /api/rtu
export const rtuRouter = createProtectedRouter();
rtuRouter.get('/', (req: any, res) => iotScadaController.getRtuUnits(req, res));
rtuRouter.post('/', (req: any, res) => iotScadaController.createRtuUnit(req, res));

// 7. /api/plc
export const plcRouter = createProtectedRouter();
plcRouter.get('/', (req: any, res) => iotScadaController.getPlcUnits(req, res));
plcRouter.post('/', (req: any, res) => iotScadaController.createPlcUnit(req, res));

// 8. /api/sensors
export const sensorsRouter = createProtectedRouter();
sensorsRouter.get('/', (req: any, res) => iotScadaController.getSensors(req, res));
sensorsRouter.post('/', (req: any, res) => iotScadaController.createSensor(req, res));

// 9. /api/alarms
export const alarmsRouter = createProtectedRouter();
alarmsRouter.get('/', (req: any, res) => iotScadaController.getAlarms(req, res));
alarmsRouter.post('/:id/acknowledge', (req: any, res) => iotScadaController.acknowledgeAlarm(req, res));
alarmsRouter.post('/:id/resolve', (req: any, res) => iotScadaController.resolveAlarm(req, res));

// 10. /api/predictive-maintenance
export const predictiveMaintenanceRouter = createProtectedRouter();
predictiveMaintenanceRouter.get('/', (req: any, res) => iotScadaController.getPredictiveMaintenance(req, res));
predictiveMaintenanceRouter.get('/predictions', (req: any, res) => iotScadaController.getPredictiveMaintenance(req, res));

// 11. /api/equipment-health
export const equipmentHealthRouter = createProtectedRouter();
equipmentHealthRouter.get('/', (req: any, res) => iotScadaController.getEquipmentHealth(req, res));

// 12. /api/energy
export const energyRouter = createProtectedRouter();
energyRouter.get('/', (req: any, res) => iotScadaController.getEnergyMetrics(req, res));
energyRouter.get('/metrics', (req: any, res) => iotScadaController.getEnergyMetrics(req, res));
energyRouter.post('/', (req: any, res) => iotScadaController.ingestEnergy(req, res));

// 13. /api/scada-dashboard
export const scadaDashboardRouter = createProtectedRouter();
scadaDashboardRouter.get('/', (req: any, res) => iotScadaController.getScadaDashboards(req, res));
scadaDashboardRouter.get('/stats', (req: any, res) => iotScadaController.getScadaStats(req, res));
