import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import auditRoutes from './audit.routes';
import masterRoutes from './master.routes';
import adminRoutes from './admin.routes';
import projectRoutes from './project.routes';
import inventoryRoutes from './inventory.routes';
import fleetRoutes from './fleet.routes';
import procurementRoutes from './procurement.routes';
import fileRoutes from './file.routes';
import kwaRoutes from './kwa.routes';
import orgRoutes from './org.routes';
import moduleRoutes from './module.routes';
import workflowRoutes from './workflow.routes';
import abacRoutes from './abac.routes';
import formsRoutes from './forms.routes';
import reportsRoutes from './reports.routes';
import dashboardsRoutes from './dashboards.routes';
import automationsRoutes from './automations.routes';
import integrationsRoutes from './integrations.routes';
import wbsRoutes from './wbs.routes';
import dprRoutes from './dpr.routes';
import resourceRoutes from './resource.routes';
import vendorContractRoutes from './vendor_contract.routes';
import fleetTransportRoutes from './fleet_transport.routes';
import financeRoutes from './finance.routes';
import documentRoutes from './document.routes';
import qaqcRoutes from './qaqc.routes';
import hseRoutes from './hse.routes';
import projectControlsRoutes from './project_controls.routes';
import analyticsRoutes from './analytics.routes';
import crmRoutes from './crm.routes';
import mobileRoutes from './mobile.routes';
import procurementEnterpriseRoutes from './procurement_enterprise.routes';
import numberingRoutes from './numbering.routes';
import hrmsRoutes, {
  employeeRouter,
  payrollRouter,
  attendanceRouter,
  leaveRouter,
  recruitmentRouter,
  trainingRouter,
  performanceRouter,
} from './hrms.routes';
import {
  eamRouter,
  assetRouter,
  maintenanceRouter,
  workOrderRouter,
  calibrationRouter,
  inspectionRouter,
} from './eam.routes';
import {
  iotRouter,
  scadaRouter,
  telemetryRouter,
  devicesRouter,
  gatewaysRouter,
  rtuRouter,
  plcRouter,
  sensorsRouter,
  alarmsRouter,
  predictiveMaintenanceRouter,
  equipmentHealthRouter,
  energyRouter,
  scadaDashboardRouter,
} from './iot_scada.routes';
import aiIntelligenceRoutes from './ai_intelligence.routes';
import aiGatewayRoutes from './ai_gateway.routes';
import orchestrationRoutes from './orchestration.routes';
import masterDataRoutes from './master_data.routes';
import currencyRoutes from './currency.routes';
import adminServicesRoutes from './admin_services.routes';
import itManagementRoutes from './it_management.routes';
import commercialRoutes from './commercial.routes';
import employeeExpenseRoutes from './employee_expense.routes';
import { idempotency } from '../middleware/idempotency.middleware';

const router = Router();

// Phase 5A: Universal Enterprise Idempotency Protection
router.use(idempotency());

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/currencies', currencyRoutes);
router.use('/currency', currencyRoutes);
router.use('/master', masterRoutes);
router.use('/admin', adminRoutes);
router.use('/org', orgRoutes);
router.use('/modules', moduleRoutes);
router.use('/workflows', workflowRoutes);
router.use('/workflow', workflowRoutes);
router.use('/approvals', workflowRoutes);
router.use('/tasks', workflowRoutes);
router.use('/notifications', workflowRoutes);
router.use('/activity', workflowRoutes);
router.use('/announcements', workflowRoutes);
router.use('/abac', abacRoutes);
router.use('/forms', formsRoutes);
router.use('/reports', reportsRoutes);
router.use('/dashboards', dashboardsRoutes);
router.use('/dashboard', dashboardsRoutes);
router.use('/automations', automationsRoutes);
router.use('/integrations', integrationsRoutes);
router.use('/projects', projectRoutes);
router.use('/projects', wbsRoutes);
router.use('/projects', dprRoutes);
router.use('/dpr', dprRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/fleet', fleetRoutes);
router.use('/procurement', procurementRoutes);
router.use('/vendor-management', vendorContractRoutes);
router.use('/contracts-engine', vendorContractRoutes);
router.use('/vendor-contract', vendorContractRoutes);
router.use('/files', fileRoutes);
router.use('/kwa', kwaRoutes);
router.use('/water', kwaRoutes);
router.use('/resources', resourceRoutes);
router.use('/asset-management', eamRouter);
router.use('/fleet-management', fleetTransportRoutes);
router.use('/transport', fleetTransportRoutes);
router.use('/fleet-transport', fleetTransportRoutes);

// Phase 60: Finance, Accounts & Cost Control Engine
router.use('/finance', financeRoutes);
router.use('/accounts', financeRoutes);
router.use('/general-ledger', financeRoutes);
router.use('/budget', financeRoutes);
router.use('/payables', financeRoutes);
router.use('/receivables', financeRoutes);
router.use('/banking', financeRoutes);
router.use('/tax', financeRoutes);

// Phase 61: Enterprise Document Management System (EDMS)
router.use('/edms', documentRoutes);
router.use('/documents', documentRoutes);
router.use('/document-folders', documentRoutes);
router.use('/document-versions', documentRoutes);
router.use('/document-search', documentRoutes);
router.use('/document-workflow', documentRoutes);
router.use('/document-review', documentRoutes);
router.use('/document-approval', documentRoutes);
router.use('/document-sharing', documentRoutes);
router.use('/document-audit', documentRoutes);
router.use('/document-archive', documentRoutes);

// Phase 62: Enterprise QA/QC Management System
router.use('/qaqc', qaqcRoutes);
router.use('/quality', qaqcRoutes);
router.use('/inspections', qaqcRoutes);
router.use('/ncr', qaqcRoutes);
router.use('/itp', qaqcRoutes);
router.use('/punch-list', qaqcRoutes);
router.use('/material-inspection', qaqcRoutes);
router.use('/site-tests', qaqcRoutes);

// Phase 63: Enterprise HSE Management System
router.use('/hse', hseRoutes);
router.use('/safety', hseRoutes);
router.use('/incidents', hseRoutes);
router.use('/permits', hseRoutes);
router.use('/risk', hseRoutes);

// Phase 64: Enterprise Project Planning, Scheduling & Project Controls
router.use('/project-controls', projectControlsRoutes);
router.use('/planning', projectControlsRoutes);
router.use('/scheduling', projectControlsRoutes);
router.use('/wbs', projectControlsRoutes);

// Phase 65: Enterprise Business Intelligence (BI), Executive Dashboard & KPI Analytics
router.use('/analytics', analyticsRoutes);
router.use('/executive', analyticsRoutes);
router.use('/kpi', analyticsRoutes);

// Phase 67: Enterprise CRM, Client Portal & Customer Service Management
router.use('/crm', crmRoutes);
router.use('/customers', crmRoutes);
router.use('/leads', crmRoutes);
router.use('/opportunities', crmRoutes);
router.use('/tickets', crmRoutes);
router.use('/support', crmRoutes);
router.use('/portal', crmRoutes);
router.use('/feedback', crmRoutes);

// Phase 68: Enterprise Mobile Field Operations, Offline Sync & GIS Integration
router.use('/mobile', mobileRoutes);
router.use('/mobile-sync', mobileRoutes);
router.use('/mobile-gps', mobileRoutes);
router.use('/mobile-forms', mobileRoutes);
router.use('/mobile-visits', mobileRoutes);
router.use('/mobile-checkin', mobileRoutes);
router.use('/mobile-documents', mobileRoutes);
router.use('/mobile-maps', mobileRoutes);

// Phase 69: Enterprise Procurement, Supplier Lifecycle & Contract Management System
router.use('/procurement-enterprise', procurementEnterpriseRoutes);
router.use('/procurement/enterprise', procurementEnterpriseRoutes);
router.use('/procurement-v2', procurementEnterpriseRoutes);

// Phase 70: Enterprise HRMS, Payroll, Attendance & Talent Management System
router.use('/hrms', hrmsRoutes);
router.use('/hrms-enterprise', hrmsRoutes);
router.use('/hr', hrmsRoutes);
router.use('/hr-dashboard', hrmsRoutes);
router.use('/employees', employeeRouter);
router.use('/payroll', payrollRouter);
router.use('/attendance', attendanceRouter);
router.use('/leave', leaveRouter);
router.use('/recruitment', recruitmentRouter);
router.use('/training', trainingRouter);
router.use('/performance', performanceRouter);
router.use('/attendance-mgmt', hrmsRoutes);
router.use('/employees-mgmt', hrmsRoutes);
router.use('/recruitment-mgmt', hrmsRoutes);

// Phase 71: Enterprise Asset Management (EAM), Plant Maintenance & CMMS
router.use('/eam', eamRouter);
router.use('/eam-enterprise', eamRouter);
router.use('/cmms', eamRouter);
router.use('/plant-maintenance', eamRouter);
router.use('/assets', assetRouter);
router.use('/maintenance', maintenanceRouter);
router.use('/workorders', workOrderRouter);
router.use('/calibration', calibrationRouter);
router.use('/inspection', inspectionRouter);

// Phase 72: Enterprise IoT, SCADA, RTU, Telemetry & Predictive Maintenance Engine
router.use('/iot', iotRouter);
router.use('/iot-enterprise', iotRouter);
router.use('/scada', scadaRouter);
router.use('/scada-enterprise', scadaRouter);
router.use('/telemetry', telemetryRouter);
router.use('/devices', devicesRouter);
router.use('/gateways', gatewaysRouter);
router.use('/rtu', rtuRouter);
router.use('/plc', plcRouter);
router.use('/sensors', sensorsRouter);
router.use('/alarms', alarmsRouter);
router.use('/predictive-maintenance', predictiveMaintenanceRouter);
router.use('/equipment-health', equipmentHealthRouter);
router.use('/energy', energyRouter);
router.use('/scada-dashboard', scadaDashboardRouter);

// Phase 73: Enterprise AI Intelligence, Predictive Analytics & Decision Support Engine
router.use('/ai-intelligence', aiIntelligenceRoutes);
router.use('/ai-engine', aiIntelligenceRoutes);
router.use('/intelligence', aiIntelligenceRoutes);
router.use('/ai', aiIntelligenceRoutes);

// Phase 74: Enterprise Multi-Model AI Gateway & Integration Foundation
router.use('/ai-gateway', aiGatewayRoutes);
router.use('/ai-integrations', aiGatewayRoutes);
router.use('/gateway', aiGatewayRoutes);

// Phase 75: Enterprise ERP Orchestration, Cross-Module Integration & Operations Command Center
router.use('/orchestration', orchestrationRoutes);
router.use('/command-center', orchestrationRoutes);
router.use('/operations-command', orchestrationRoutes);
router.use('/cross-module', orchestrationRoutes);

// Phase 76: Enterprise Master Data Management (MDM), Data Governance, Quality & Reconciliation
router.use('/master-data', masterDataRoutes);
router.use('/mdm', masterDataRoutes);
router.use('/data-governance', masterDataRoutes);
router.use('/data-quality', masterDataRoutes);

// Phase 5B: Centralized Enterprise Document Numbering Engine
router.use('/numbering', numberingRoutes);

// Phase 80: Corporate Administration & Office Services Engine
router.use('/admin-services', adminServicesRoutes);
router.use('/corporate-services', adminServicesRoutes);
router.use('/office-admin', adminServicesRoutes);
router.use('/visitors', adminServicesRoutes);
router.use('/meeting-rooms', adminServicesRoutes);
router.use('/meetings', adminServicesRoutes);
router.use('/notices', adminServicesRoutes);
router.use('/service-requests', adminServicesRoutes);

// Phase 81: IT & Digital Asset Management (ITAM / ITSM) Engine
router.use('/it', itManagementRoutes);
router.use('/it-management', itManagementRoutes);
router.use('/it-assets', itManagementRoutes);
router.use('/it-tickets', itManagementRoutes);
router.use('/it-licenses', itManagementRoutes);

// Phase 82: Enterprise Commercial, Tendering & Subcontract Lifecycle Engine
router.use('/commercial', commercialRoutes);
router.use('/tenders', commercialRoutes);
router.use('/subcontracts', commercialRoutes);
router.use('/rate-analyses', commercialRoutes);

// Phase 83: Enterprise Employee Expense, Cash Request, Petty Cash & Reimbursement Engine
router.use('/expenses', employeeExpenseRoutes);
router.use('/employee-expenses', employeeExpenseRoutes);
router.use('/cash-requests', employeeExpenseRoutes);

export default router;
