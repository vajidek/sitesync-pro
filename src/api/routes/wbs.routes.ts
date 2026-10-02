import { Router } from 'express';
import { wbsController } from '../controllers/wbs.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

// All WBS/BOQ/Activity routes are protected by JWT authentication
router.use(authenticateJWT);

// --- WBS NODES ROUTES ---
router.get('/:projectId/wbs', (req, res, next) => wbsController.getWbsTree(req, res, next));
router.post('/:projectId/wbs', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => wbsController.createWbsNode(req, res, next));
router.get('/:projectId/wbs/nodes/:id', (req, res, next) => wbsController.getWbsNodeById(req, res, next));
router.put('/:projectId/wbs/nodes/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => wbsController.updateWbsNode(req, res, next));
router.post('/:projectId/wbs/nodes/:id/move', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => wbsController.moveWbsNode(req, res, next));
router.post('/:projectId/wbs/nodes/:id/duplicate', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => wbsController.duplicateSubtree(req, res, next));
router.delete('/:projectId/wbs/nodes/:id', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => wbsController.deleteWbsNode(req, res, next));
router.post('/:projectId/wbs/nodes/:id/restore', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => wbsController.restoreWbsNode(req, res, next));

// --- BOQ ITEMS ROUTES ---
router.get('/:projectId/boq', (req, res, next) => wbsController.getBoqItems(req, res, next));
router.post('/:projectId/boq', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => wbsController.createBoqItem(req, res, next));
router.post('/:projectId/boq/bulk-update', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => wbsController.bulkUpdateBoqItems(req, res, next));
router.get('/:projectId/boq/:id', (req, res, next) => wbsController.getBoqItemById(req, res, next));
router.put('/:projectId/boq/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => wbsController.updateBoqItem(req, res, next));
router.delete('/:projectId/boq/:id', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => wbsController.deleteBoqItem(req, res, next));
router.post('/:projectId/boq/:id/restore', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => wbsController.restoreBoqItem(req, res, next));

// --- ACTIVITIES ROUTES ---
router.get('/:projectId/activities', (req, res, next) => wbsController.getActivities(req, res, next));
router.post('/:projectId/activities', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => wbsController.createActivity(req, res, next));
router.get('/:projectId/activities/:id', (req, res, next) => wbsController.getActivityById(req, res, next));
router.put('/:projectId/activities/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => wbsController.updateActivity(req, res, next));
router.post('/:projectId/activities/:id/progress', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => wbsController.logDailyProgress(req, res, next));
router.delete('/:projectId/activities/:id', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => wbsController.deleteActivity(req, res, next));
router.post('/:projectId/activities/:id/restore', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => wbsController.restoreActivity(req, res, next));

// Dependencies & Documents
router.post('/:projectId/activities/:activityId/dependencies', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => wbsController.addDependency(req, res, next));
router.delete('/:projectId/activities/dependencies/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => wbsController.deleteDependency(req, res, next));

router.post('/:projectId/activities/:activityId/documents', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res, next) => wbsController.addDocument(req, res, next));
router.delete('/:projectId/activities/documents/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => wbsController.deleteDocument(req, res, next));

export default router;
