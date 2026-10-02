// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - ROUTES
// ============================================================================

import { Router, Response, NextFunction } from 'express';
import { masterDataController } from '../controllers/master_data.controller';
import { AuthenticatedRequest } from '../types/auth';
import { verifyAccessToken } from '../utils/jwt';
import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/role.repository';
import { adminRepository } from '../repositories/admin.repository';

const router = Router();

// All Master Data operations require a real authenticated user.
// No fallback identities are permitted: master data changes and reads are security-sensitive.
import { authenticateJWT } from '../middleware/auth.middleware';



// 1. Dashboard & Domains
router.get('/dashboard-stats', (req, res) => masterDataController.getDashboardStats(req, res));
router.get('/domains', (req, res) => masterDataController.getDomains(req, res));

// 2. Records Registry
router.get('/records', (req, res) => masterDataController.getRecords(req, res));
router.get('/records/:id', (req, res) => masterDataController.getRecordById(req, res));
router.get('/records/:id/versions', (req, res) => masterDataController.getRecordVersions(req, res));
router.get('/records/:id/lineage', (req, res) => masterDataController.getLineage(req, res));
router.post('/records', (req, res) => masterDataController.createRecord(req, res));
router.put('/records/:id', (req, res) => masterDataController.updateRecord(req, res));

// 3. Data Quality Engine
router.post('/records/:id/quality-scan', (req, res) => masterDataController.scanRecordQuality(req, res));
router.post('/domains/:domainCode/quality-scan', (req, res) => masterDataController.scanDomainQuality(req, res));
router.get('/quality-issues', (req, res) => masterDataController.getQualityIssues(req, res));
router.put('/quality-issues/:id/resolve', (req, res) => masterDataController.resolveQualityIssue(req, res));

// 4. Duplicate Detection & Merge
router.get('/duplicates', (req, res) => masterDataController.getDuplicateCandidates(req, res));
router.post('/duplicates/resolve', (req, res) => masterDataController.resolveDuplicate(req, res));

// 5. Cross-Module Reconciliation
router.get('/reconciliation-jobs', (req, res) => masterDataController.getReconciliationJobs(req, res));
router.post('/reconciliation-jobs', (req, res) => masterDataController.triggerReconciliation(req, res));

// 6. Data Governance & Change Requests
router.get('/change-requests', (req, res) => masterDataController.getChangeRequests(req, res));
router.post('/change-requests', (req, res) => masterDataController.createChangeRequest(req, res));
router.post('/change-requests/review', (req, res) => masterDataController.reviewChangeRequest(req, res));
router.get('/stewards', (req, res) => masterDataController.getStewards(req, res));
router.get('/retention-policies', (req, res) => masterDataController.getRetentionPolicies(req, res));
router.get('/legal-holds', (req, res) => masterDataController.getLegalHolds(req, res));
router.post('/legal-holds', (req, res) => masterDataController.placeLegalHold(req, res));
router.post('/legal-holds/release', (req, res) => masterDataController.releaseLegalHold(req, res));

// 7. Audit & AI Explanation
router.get('/audit-logs', (req, res) => masterDataController.getAuditLogs(req, res));
router.post('/ai-explain', (req, res) => masterDataController.getAIAssistedExplanation(req, res));

export default router;
