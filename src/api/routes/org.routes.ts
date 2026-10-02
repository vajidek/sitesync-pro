import { Router } from 'express';
import { orgController } from '../controllers/org.controller';
import { authenticateJWT, requirePermissions } from '../middleware/auth.middleware';

const router = Router();

// Protect all Organization Engine routes
router.use(authenticateJWT);

// ============================================================================
// ENTERPRISE DIVISION MASTER ROUTES
// ============================================================================
router.get('/divisions', orgController.getDivisions);
router.get('/divisions/:id', orgController.getDivisionById);
router.post('/divisions', requirePermissions('users:manage'), orgController.createDivision);
router.put('/divisions/:id', requirePermissions('users:manage'), orgController.updateDivision);
router.delete('/divisions/:id', requirePermissions('users:manage'), orgController.deactivateDivision);
router.post('/divisions/:id/activate', requirePermissions('users:manage'), orgController.activateDivision);

// ============================================================================
// ENTERPRISE DEPARTMENT MASTER ROUTES & SAFE REASSIGNMENT
// ============================================================================
router.get('/departments', orgController.getDepartments);
router.get('/departments/:id', orgController.getDepartmentById);
router.post('/departments', requirePermissions('users:manage'), orgController.createDepartment);
router.put('/departments/:id', requirePermissions('users:manage'), orgController.updateDepartment);
router.post('/departments/:id/reassign-division', requirePermissions('users:manage'), orgController.reassignDepartmentDivision);
router.post('/departments/reassign', requirePermissions('users:manage'), orgController.reassignDepartmentDivision);
router.delete('/departments/:id', requirePermissions('users:manage'), orgController.deactivateDepartment);
router.post('/departments/:id/activate', requirePermissions('users:manage'), orgController.activateDepartment);

// ============================================================================
// ENTERPRISE HIERARCHY TREE
// ============================================================================
router.get('/tree', orgController.getEnterpriseHierarchyTree);

// Legacy / General Hierarchy Units
router.get('/units', orgController.getOrgUnits);
router.get('/units/tree', orgController.getOrgUnitTree);
router.get('/units/:id', orgController.getOrgUnitById);
router.post('/units', requirePermissions('users:manage'), orgController.createOrgUnit);
router.post('/units/move', requirePermissions('users:manage'), orgController.moveOrgUnit);
router.post('/units/merge', requirePermissions('users:manage'), orgController.mergeOrgUnits);
router.post('/units/bulk-import', requirePermissions('users:manage'), orgController.bulkImportOrgUnits);
router.put('/units/:id', requirePermissions('users:manage'), orgController.updateOrgUnit);
router.delete('/units/:id', requirePermissions('users:manage'), orgController.softDeleteOrgUnit);

// Reporting Tree
router.get('/reporting-tree', orgController.getReportingTree);

// Masters Picklists
router.get('/masters/:category', orgController.getMasterList);
router.post('/masters/:category', requirePermissions('users:manage'), orgController.createMasterRecord);
router.put('/masters/:category/:id', requirePermissions('users:manage'), orgController.updateMasterRecord);
router.delete('/masters/:category/:id', requirePermissions('users:manage'), orgController.deleteMasterRecord);


// Project - Department Junction
router.get('/projects/:projectId/departments', orgController.getProjectDepartments);
router.post('/projects/:projectId/departments', requirePermissions('users:manage'), orgController.assignDepartmentToProject);
router.delete('/project-departments/:id', requirePermissions('users:manage'), orgController.removeDepartmentFromProject);

// Project - Work Packages
router.get('/projects/:projectId/work-packages', orgController.getProjectWorkPackages);
router.post('/projects/:projectId/work-packages', requirePermissions('users:manage'), orgController.createWorkPackage);

// Dynamic Module Assignments
router.get('/modules/assignments', orgController.getModuleAssignments);
router.post('/modules/assignments', requirePermissions('users:manage'), orgController.assignModule);

export default router;
