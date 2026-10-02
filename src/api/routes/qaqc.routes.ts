import { Router } from 'express';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { QAQCController } from '../controllers/qaqc.controller';

const router = Router();
const controller = new QAQCController();

// Protect all QA/QC routes with JWT
router.use(authenticateJWT);

// Root Alias Handler
router.get('/', (req, res) => {
  if (req.baseUrl.endsWith('/inspection') || req.baseUrl.endsWith('/inspections')) {
    return controller.getInspections(req, res);
  }
  return controller.getStats(req, res);
});

// Dashboard Stats
router.get('/stats', controller.getStats);

// Inspections
router.get('/inspections', controller.getInspections);
router.post('/inspections', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createInspection);

// NCR (Non-Conformance Reports)
router.get('/ncr', controller.getNcrs);
router.post('/ncr', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createNcr);

// CAPA (Corrective & Preventive Actions)
router.get('/capa', controller.getCapas);
router.post('/capa', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createCapa);

// ITP (Inspection & Test Plans)
router.get('/itp', controller.getItps);
router.post('/itp', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createItp);

// Material Inspection (MIR)
router.get('/material-inspections', controller.getMaterialInspections);
router.get('/material-inspection', controller.getMaterialInspections);
router.post('/material-inspections', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createMaterialInspection);
router.post('/material-inspection', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createMaterialInspection);

// Site Tests
router.get('/site-tests', controller.getSiteTests);
router.post('/site-tests', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createSiteTest);

// Welding Inspections
router.get('/welding-inspections', controller.getWeldingInspections);
router.get('/welding', controller.getWeldingInspections);
router.post('/welding-inspections', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createWeldingInspection);

// Hydro Tests
router.get('/hydro-tests', controller.getHydroTests);
router.get('/hydro-test', controller.getHydroTests);
router.post('/hydro-tests', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createHydroTest);
router.post('/hydro-test', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createHydroTest);

// Pressure Tests
router.get('/pressure-tests', controller.getPressureTests);
router.get('/pressure-test', controller.getPressureTests);
router.post('/pressure-tests', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createPressureTest);

// Punch Lists
router.get('/punch-list', controller.getPunchLists);
router.get('/punch-lists', controller.getPunchLists);
router.post('/punch-list', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createPunchList);
router.post('/punch-lists', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createPunchList);

// Snag Lists
router.get('/snag-list', controller.getSnagLists);
router.get('/snag-lists', controller.getSnagLists);
router.post('/snag-list', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createSnagList);

export default router;
