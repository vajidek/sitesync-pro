import { Router } from 'express';
import { abacController } from '../controllers/abac.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Require authentication
router.use(authenticateJWT);

// Simulation & Effective Evaluation
router.get('/effective', (req, res, next) => abacController.evaluateEffectivePermissions(req, res, next));
router.post('/simulate', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => abacController.simulatePermissions(req, res, next));

// Policies CRUD
router.get('/policies', (req, res, next) => abacController.getPolicies(req, res, next));
router.get('/policies/:id', (req, res, next) => abacController.getPolicyById(req, res, next));
router.post('/policies', requireRoles('ADMIN'), (req, res, next) => abacController.createPolicy(req, res, next));
router.put('/policies/:id', requireRoles('ADMIN'), (req, res, next) => abacController.updatePolicy(req, res, next));

// Attributes & Scopes
router.get('/policies/:policyId/attributes', (req, res, next) => abacController.getPolicyAttributes(req, res, next));
router.post('/attributes', requireRoles('ADMIN'), (req, res, next) => abacController.createAttribute(req, res, next));

router.get('/policies/:policyId/scopes', (req, res, next) => abacController.getPolicyScopes(req, res, next));
router.post('/scopes', requireRoles('ADMIN'), (req, res, next) => abacController.createScope(req, res, next));

// Field & Feature Permissions
router.get('/field-permissions', (req, res, next) => abacController.getFieldPermissions(req, res, next));
router.post('/field-permissions', requireRoles('ADMIN'), (req, res, next) => abacController.createFieldPermission(req, res, next));

router.get('/feature-permissions', (req, res, next) => abacController.getFeaturePermissions(req, res, next));
router.post('/feature-permissions', requireRoles('ADMIN'), (req, res, next) => abacController.createFeaturePermission(req, res, next));

export default router;
