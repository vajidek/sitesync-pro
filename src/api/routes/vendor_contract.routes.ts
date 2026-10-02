import { Router } from 'express';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { VendorContractController } from '../controllers/vendor_contract.controller';

const router = Router();
const controller = new VendorContractController();

// Apply JWT authentication across all vendor & contract routes
router.use(authenticateJWT);

// ==========================================
// VENDOR ENGINE ROUTES
// ==========================================
router.get('/vendors', controller.getVendors);
router.get('/vendors/categories', controller.getCategories);
router.get('/vendors/:id', controller.getVendorById);
router.post('/vendors', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createVendor);
router.patch('/vendors/:id/status', requireRoles('ADMIN', 'MANAGER'), controller.updateVendorStatus);
router.put('/vendors/:id/status', requireRoles('ADMIN', 'MANAGER'), controller.updateVendorStatus);
router.post('/vendors/rate', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.rateVendor);
router.post('/vendors/blacklist', requireRoles('ADMIN'), controller.blacklistVendor);

// ==========================================
// CONTRACT ENGINE ROUTES
// ==========================================
router.get('/contracts', controller.getContracts);
router.get('/contracts/stats', controller.getDashboardStats);
router.get('/contracts/:id', controller.getContractById);
router.post('/contracts', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.createContract);
router.patch('/contracts/:id/status', requireRoles('ADMIN', 'MANAGER'), controller.updateContractStatus);
router.put('/contracts/:id/status', requireRoles('ADMIN', 'MANAGER'), controller.updateContractStatus);

// Contract Lifecycle Sub-resources
router.post('/contracts/milestone', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.addMilestone);
router.post('/contracts/variation', requireRoles('ADMIN', 'MANAGER'), controller.addVariation);
router.post('/contracts/payment', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.addPayment);
router.post('/contracts/extension', requireRoles('ADMIN', 'MANAGER'), controller.addExtension);

export default router;
