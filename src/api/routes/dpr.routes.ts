import { Router } from 'express';
import { dprController } from '../controllers/dpr.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticateJWT);

// Project DPR List & KPIs
router.get('/:projectId/dprs', (req, res, next) => dprController.getProjectDprs(req, res, next));
router.get('/:projectId/dprs/kpis', (req, res, next) => dprController.getProjectDprKpis(req, res, next));
router.post('/:projectId/dprs', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => dprController.createDpr(req, res, next));

// Individual DPR Details & Mutations
router.get('/dprs/:id', (req, res, next) => dprController.getDprById(req, res, next));
router.put('/dprs/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => dprController.updateDpr(req, res, next));
router.delete('/dprs/:id', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => dprController.softDeleteDpr(req, res, next));
router.post('/dprs/:id/restore', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => dprController.restoreDpr(req, res, next));

// Entries
router.post('/dprs/:id/entries', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => dprController.addEntry(req, res, next));
router.put('/dprs/entries/:entryId', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => dprController.updateEntry(req, res, next));
router.delete('/dprs/entries/:entryId', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => dprController.deleteEntry(req, res, next));

// Weather & Site Conditions
router.put('/dprs/:id/weather', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => dprController.upsertWeather(req, res, next));

// Delays / Hindrances
router.post('/dprs/:id/delays', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => dprController.addDelay(req, res, next));
router.put('/dprs/delays/:delayId', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => dprController.updateDelay(req, res, next));
router.delete('/dprs/delays/:delayId', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => dprController.deleteDelay(req, res, next));

// Photos & Documents
router.post('/dprs/:id/photos', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => dprController.addPhoto(req, res, next));
router.delete('/dprs/photos/:photoId', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => dprController.deletePhoto(req, res, next));
router.post('/dprs/:id/documents', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => dprController.addDocument(req, res, next));
router.delete('/dprs/documents/:documentId', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => dprController.deleteDocument(req, res, next));

// Approvals & Comments
router.post('/dprs/:id/approvals', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => dprController.addApproval(req, res, next));
router.post('/dprs/:id/comments', (req, res, next) => dprController.addComment(req, res, next));

export default router;
