import { Router } from 'express';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { DocumentController } from '../controllers/document.controller';

const router = Router();
const controller = new DocumentController();

// Protect all routes with JWT
router.use(authenticateJWT);

// Root Handler for Base Route Aliases (/edms, /documents, /document-search, /document-approval, /document-workflow)
router.get('/', (req, res) => {
  if (req.baseUrl.endsWith('/document-search')) {
    return controller.searchDocuments(req, res);
  }
  return controller.getDocuments(req, res);
});

// EDMS Stats
router.get('/stats', controller.getStats.bind(controller));

// Folders
router.get('/folders', controller.getFolders.bind(controller));
router.get('/folders/:id', controller.getFolderById.bind(controller));
router.post('/folders', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'STORE_KEEPER'), controller.createFolder.bind(controller));
router.put('/folders/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.updateFolder.bind(controller));
router.delete('/folders/:id', requireRoles('ADMIN', 'MANAGER'), controller.deleteFolder.bind(controller));

// Documents
router.get('/documents', controller.getDocuments.bind(controller));
router.get('/documents/:id', controller.getDocumentById.bind(controller));
router.post('/documents', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'STORE_KEEPER'), controller.createDocument.bind(controller));
router.put('/documents/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.updateDocument.bind(controller));
router.delete('/documents/:id', requireRoles('ADMIN', 'MANAGER'), controller.deleteDocument.bind(controller));
router.post('/documents/:id/favorite', controller.toggleFavorite.bind(controller));
router.post('/documents/:id/archive', requireRoles('ADMIN', 'MANAGER'), controller.archiveDocument.bind(controller));
router.post('/documents/:id/restore', requireRoles('ADMIN', 'MANAGER'), controller.restoreDocument.bind(controller));

// Versions & Checkouts
router.get('/documents/:id/versions', controller.getVersions.bind(controller));
router.post('/versions', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createVersion.bind(controller));
router.post('/checkout', controller.checkoutDocument.bind(controller));
router.post('/checkin', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.checkinDocument.bind(controller));

// Reviews & Approvals
router.get('/documents/:id/reviews', controller.getReviews.bind(controller));
router.post('/reviews', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.reviewDocument.bind(controller));
router.get('/documents/:id/approvals', controller.getApprovals.bind(controller));
router.post('/approvals', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.approveDocument.bind(controller));

// Search, Audit, Shares
router.get('/search', controller.searchDocuments.bind(controller));
router.get('/audit', controller.getAuditLogs.bind(controller));
router.get('/documents/:id/shares', controller.getShares.bind(controller));
router.post('/shares', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.shareDocument.bind(controller));

export default router;
