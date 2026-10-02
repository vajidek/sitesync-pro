import { Router } from 'express';
import { formsController } from '../controllers/forms.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Require authentication
router.use(authenticateJWT);

// Submissions
router.get('/submissions', (req, res, next) => formsController.getSubmissions(req, res, next));
router.post('/submissions', (req, res, next) => formsController.submitForm(req, res, next));

// Form CRUD & Publish
router.get('/', (req, res, next) => formsController.getForms(req, res, next));
router.get('/:id', (req, res, next) => formsController.getFormById(req, res, next));
router.post('/', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => formsController.createForm(req, res, next));
router.post('/:id/publish', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => formsController.publishForm(req, res, next));

export default router;
