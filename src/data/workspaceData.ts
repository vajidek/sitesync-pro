import { WorkspaceConfig, WorkspaceId } from '../types/workspace';
import { UserProfile } from '../types';
import {
  DEMO_PROJECTS,
  DEMO_WORK_ORDERS,
  DEMO_INVENTORY,
  DEMO_MACHINERY,
  DEMO_DAILY_LOGS,
  DEMO_USERS,
  ROLE_CONFIG,
} from './mockData';
import {
  INITIAL_VENDORS,
  INITIAL_RFQS,
  INITIAL_PURCHASE_REQUISITIONS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_GRNS,
  INITIAL_TENDERS,
} from './procurementMockData';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_LABOUR_ALLOCATIONS,
} from './hrMockData';
import {
  WATER_PROJECTS,
  WATER_TEST_REPORTS,
} from './waterInfrastructureData';

// Dynamic calculation of live ERP metrics per workspace
export function getWorkspaceConfig(id: WorkspaceId, user?: UserProfile | null, isDemo: boolean = true): WorkspaceConfig {
  if (!isDemo) {
    return getProductionWorkspaceConfig(id, user);
  }

  const totalPrjBudget = DEMO_PROJECTS.reduce((s, p) => s + p.budgetUSD, 0);
  const totalPrjSpent = DEMO_PROJECTS.reduce((s, p) => s + p.spentUSD, 0);
  const avgProgress = Math.round(DEMO_PROJECTS.reduce((s, p) => s + p.progress, 0) / Math.max(DEMO_PROJECTS.length, 1));
  const lowStockCount = DEMO_INVENTORY.filter(i => i.status === 'Low Stock').length;
  const criticalWOs = DEMO_WORK_ORDERS.filter(w => w.priority === 'Critical').length;
  const operationalMachinery = DEMO_MACHINERY.filter(m => m.status === 'Operational').length;
  const totalInventoryValuation = DEMO_INVENTORY.reduce((s, i) => s + (i.quantityInStock * i.unitPriceUSD), 0);
  const totalPayrollVal = INITIAL_PAYROLL_RECORDS.reduce((s, p) => s + p.netSalaryUSD, 0);

  switch (id) {
    case 'EXECUTIVE':
      return {
        id: 'EXECUTIVE',
        name: 'Executive Workspace',
        code: 'WS_EXEC',
        title: 'C-Suite Command Cockpit & Enterprise Strategy',
        description: 'High-level financial KPIs, portfolio execution health, strategic tenders, and board approvals.',
        icon: 'Award',
        defaultRoleMapping: 'ADMIN',
        themeColor: 'indigo',
        todaysWorkCount: 5,
        kpis: [
          { id: 'kpi_ex1', label: 'Enterprise Capex', value: `$${(totalPrjBudget / 1000000).toFixed(1)}M`, change: '+12.4% YoY', isPositive: true, iconName: 'DollarSign', category: 'Financial' },
          { id: 'kpi_ex2', label: 'Portfolio Health (Avg Progress)', value: `${avgProgress}%`, change: 'On Target', isPositive: true, iconName: 'TrendingUp', category: 'Execution' },
          { id: 'kpi_ex3', label: 'Active Strategic Projects', value: `${DEMO_PROJECTS.length + WATER_PROJECTS.length} Active`, change: '3 Regions', isPositive: true, iconName: 'Briefcase', category: 'Projects' },
          { id: 'kpi_ex4', label: 'High Risk Flagged Items', value: `${lowStockCount + criticalWOs} Items`, change: 'Requires Attention', isPositive: false, iconName: 'ShieldAlert', category: 'Risk' },
        ],
        tasks: DEMO_WORK_ORDERS.filter(w => w.priority === 'Critical' || w.priority === 'High').map((w, idx) => ({
          id: `tsk_ex_${idx}`,
          title: `Governance Review: ${w.title}`,
          priority: 'CRITICAL',
          dueDate: w.dueDate,
          category: w.category,
          status: w.status === 'Completed' ? 'Completed' : 'Pending',
          assignedTo: 'Executive Board',
        })),
        approvals: INITIAL_PURCHASE_REQUISITIONS.slice(0, 2).map((pr, idx) => ({
          id: `app_ex_${idx}`,
          title: `Capex Sign-off PR #${pr.prNumber}: ${pr.department}`,
          requester: pr.requestedByName,
          amountOrType: `$${pr.budgetAllocatedUSD.toLocaleString()} USD`,
          submittedAt: pr.createdDate,
          workflowCode: 'WF_CAPEX_APPROVAL',
          status: pr.status === 'Approved' ? 'APPROVED' : 'PENDING',
        })),
        quickActions: [
          { id: 'qa_ex1', label: 'Launch Financial Audit', iconName: 'BarChart3', actionType: 'VIEW_AUDIT', targetTab: 'reports', description: 'Inspect consolidated balance sheet & cost centers' },
          { id: 'qa_ex2', label: 'Approve Strategic PR', iconName: 'CheckCircle2', actionType: 'APPROVE_PR', targetTab: 'procurement', description: 'Review pending high-value procurement requests' },
        ],
        pinnedReports: [
          { id: 'rpt_ex1', title: 'Executive Financial Summary & Capex Allocation', code: 'RPT_EXEC_CAPEX', type: 'FINANCIAL', lastGenerated: 'Today, 08:00' },
          { id: 'rpt_ex2', title: 'Cross-Project SPI/CPI Variance Report', code: 'RPT_PORTFOLIO_VARIANCE', type: 'ANALYTICAL', lastGenerated: 'Yesterday' },
        ],
        pinnedDashboards: [
          { id: 'dash_ex1', title: 'Executive Command Cockpit', widgetsCount: 8, category: 'Executive' },
        ],
        notifications: [
          { id: 'nt_ex1', title: 'Q3 Financial Review Ready', message: 'Consolidated EBITDA report has been generated.', timestamp: '10 mins ago', severity: 'info' },
        ],
        gridData: DEMO_PROJECTS.map(p => ({
          id: p.code,
          name: p.name,
          client: p.client,
          budget: `$${p.budgetUSD.toLocaleString()}`,
          spent: `$${p.spentUSD.toLocaleString()}`,
          progress: `${p.progress}%`,
          status: p.status,
        })),
        gridColumns: [
          { key: 'id', header: 'Project Code', width: '120px' },
          { key: 'name', header: 'Project Name' },
          { key: 'client', header: 'Client' },
          { key: 'budget', header: 'Budget (USD)' },
          { key: 'spent', header: 'Spent (USD)' },
          { key: 'progress', header: 'Progress' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'MANAGING_DIRECTOR':
      return {
        id: 'MANAGING_DIRECTOR',
        name: 'Managing Director Workspace',
        code: 'WS_MD',
        title: 'Managing Director Commercial & Contract Command Workspace',
        description: 'Commercial agreements, vendor performance, tender pipeline, and corporate governance.',
        icon: 'Briefcase',
        defaultRoleMapping: 'ADMIN',
        themeColor: 'blue',
        todaysWorkCount: 6,
        kpis: [
          { id: 'kpi_md1', label: 'Overall Completion Rate', value: `${avgProgress}%`, change: '+3.2% MoM', isPositive: true, iconName: 'TrendingUp', category: 'Operations' },
          { id: 'kpi_md2', label: 'Vendor Base', value: `${INITIAL_VENDORS.length} Approved`, change: 'Fully Vetted', isPositive: true, iconName: 'Users', category: 'Supply Chain' },
          { id: 'kpi_md3', label: 'Active Tender Pipeline', value: `${INITIAL_TENDERS.length} Tenders`, change: '$18.5M Value', isPositive: true, iconName: 'FileSpreadsheet', category: 'Commercial' },
          { id: 'kpi_md4', label: 'Active Business Divisions', value: `${DEMO_PROJECTS.length} Divisions`, change: '100% Operational', isPositive: true, iconName: 'Layers', category: 'Business' },
        ],
        tasks: [
          { id: 'tsk_md1', title: 'Sign Joint Venture Contract for Peruvannamuzhi WTP', priority: 'CRITICAL', dueDate: 'Today, 14:00', category: 'Legal', status: 'Pending', assignedTo: 'Managing Director' },
          { id: 'tsk_md2', title: 'Review Annual Subcontractor Rate Agreements', priority: 'HIGH', dueDate: 'Tomorrow, 10:00', category: 'Procurement', status: 'In Progress', assignedTo: 'Managing Director' },
        ],
        approvals: INITIAL_PURCHASE_ORDERS.filter(po => po.status === 'Issued' || po.status === 'Draft').map((po, idx) => ({
          id: `app_md_${idx}`,
          title: `Vendor PO Authorization: ${po.vendorName}`,
          requester: 'Procurement Manager',
          amountOrType: `$${po.netAmountUSD.toLocaleString()} USD`,
          submittedAt: po.poDate,
          workflowCode: 'WF_PO_MD_APP',
          status: 'PENDING',
        })),
        quickActions: [
          { id: 'qa_md1', label: 'Review Tender Bids', iconName: 'FileText', actionType: 'VIEW_TENDERS', targetTab: 'procurement', description: 'Inspect upcoming public infrastructure bids' },
        ],
        pinnedReports: [
          { id: 'rpt_md1', title: 'Subcontractor Performance & Commercial Risk Analysis', code: 'RPT_VENDOR_PERF', type: 'COMMERCIAL', lastGenerated: 'Today, 09:00' },
        ],
        pinnedDashboards: [
          { id: 'dash_md1', title: 'Commercial Operations Board', widgetsCount: 6, category: 'Commercial' },
        ],
        notifications: [
          { id: 'nt_md1', title: 'New Tender Opportunities Available', message: 'Water Utilities Authority published 2 new tenders.', timestamp: '30 mins ago', severity: 'info' },
        ],
        gridData: INITIAL_TENDERS.map(t => ({
          id: t.id,
          code: t.tenderNumber || t.tenderNo || t.id,
          title: t.title,
          client: t.clientAuthority || t.authorityName || 'State Water Authority',
          value: `$${t.estimatedValueUSD.toLocaleString()}`,
          submissionDate: t.submissionDueDate,
          status: t.status || t.tenderStatus || 'Bidding Open',
        })),
        gridColumns: [
          { key: 'code', header: 'Tender Ref', width: '130px' },
          { key: 'title', header: 'Tender Title' },
          { key: 'client', header: 'Client Authority' },
          { key: 'value', header: 'Estimated Value' },
          { key: 'submissionDate', header: 'Deadline' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'GENERAL_MANAGER':
      return {
        id: 'GENERAL_MANAGER',
        name: 'General Manager Workspace',
        code: 'WS_GM',
        title: 'General Manager Operations & Resource Utilization Workspace',
        description: 'Cross-project operations, fleet allocation, department performance, and EVM variance tracking.',
        icon: 'Sliders',
        defaultRoleMapping: 'MANAGER',
        themeColor: 'sky',
        todaysWorkCount: 5,
        kpis: [
          { id: 'kpi_gm1', label: 'Schedule Performance Index (SPI)', value: '1.04', change: '+0.02 vs target', isPositive: true, iconName: 'TrendingUp', category: 'EVM' },
          { id: 'kpi_gm2', label: 'Cost Performance Index (CPI)', value: '1.02', change: 'Under Budget', isPositive: true, iconName: 'DollarSign', category: 'EVM' },
          { id: 'kpi_gm3', label: 'Fleet Availability', value: `${Math.round((operationalMachinery / Math.max(DEMO_MACHINERY.length, 1)) * 100)}%`, change: `${operationalMachinery}/${DEMO_MACHINERY.length} Active`, isPositive: true, iconName: 'Truck', category: 'Fleet' },
          { id: 'kpi_gm4', label: 'Open Requisitions', value: `${INITIAL_PURCHASE_REQUISITIONS.filter(r => r.status === 'Submitted' || r.status === 'Draft').length} Pending`, change: 'Action Required', isPositive: false, iconName: 'Clock', category: 'Procurement' },
        ],
        tasks: [
          { id: 'tsk_gm1', title: 'Reallocate Heavy Crane to Pier 4 Work Zone', priority: 'HIGH', dueDate: 'Today, 11:30', category: 'Resource Allocation', status: 'Pending', assignedTo: 'General Manager' },
          { id: 'tsk_gm2', title: 'Review Monthly Subcontractor Labor Invoices', priority: 'MEDIUM', dueDate: 'Tomorrow, 17:00', category: 'Finance', status: 'In Progress', assignedTo: 'General Manager' },
        ],
        approvals: INITIAL_PURCHASE_REQUISITIONS.map((pr, idx) => ({
          id: `app_gm_${idx}`,
          title: `Material PR #${pr.prNumber}: ${pr.department}`,
          requester: pr.requestedByName,
          amountOrType: `$${pr.budgetAllocatedUSD.toLocaleString()} USD`,
          submittedAt: pr.createdDate,
          workflowCode: 'WF_PR_APPROVAL',
          status: pr.status === 'Approved' ? 'APPROVED' : 'PENDING',
        })),
        quickActions: [
          { id: 'qa_gm1', label: 'Allocate Heavy Equipment', iconName: 'Truck', actionType: 'ALLOCATE_FLEET', targetTab: 'fleet', description: 'Reassign cranes & excavators to site sectors' },
        ],
        pinnedReports: [
          { id: 'rpt_gm1', title: 'Cross-Project SPI/CPI Variance Log', code: 'RPT_CROSS_SPI_CPI', type: 'ANALYTICAL', lastGenerated: 'Today, 07:30' },
        ],
        pinnedDashboards: [
          { id: 'dash_gm1', title: 'Operations Control Board', widgetsCount: 9, category: 'Operations' },
        ],
        notifications: [
          { id: 'nt_gm1', title: 'Equipment Dispatch Confirmed', message: 'Crane delivered to Calicut site.', timestamp: '45 mins ago', severity: 'info' },
        ],
        gridData: DEMO_WORK_ORDERS.map(w => ({
          id: w.id,
          title: w.title,
          priority: w.priority,
          assignedTo: w.assignedToName,
          dueDate: w.dueDate,
          status: w.status,
        })),
        gridColumns: [
          { key: 'id', header: 'WO ID', width: '100px' },
          { key: 'title', header: 'Work Package / Task' },
          { key: 'priority', header: 'Priority' },
          { key: 'assignedTo', header: 'Assignee' },
          { key: 'dueDate', header: 'Due Date' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'PROJECT_MANAGER':
      return {
        id: 'PROJECT_MANAGER',
        name: 'Project Manager Workspace',
        code: 'WS_PM',
        title: 'Project Manager Site Execution & EVM Control Workspace',
        description: 'On-site milestone delivery, Earned Value Management (EVM), BOQ burn rate, site safety, and subcontractor billing.',
        icon: 'Building2',
        defaultRoleMapping: 'MANAGER',
        themeColor: 'emerald',
        todaysWorkCount: 7,
        kpis: [
          { id: 'kpi_pm1', label: 'Earned Value (EV)', value: `$${Math.round((DEMO_PROJECTS[0]?.budgetUSD || 0) * ((DEMO_PROJECTS[0]?.progress || 0) / 100)).toLocaleString()}`, change: `${DEMO_PROJECTS[0]?.progress}% Complete`, isPositive: true, iconName: 'TrendingUp', category: 'EVM' },
          { id: 'kpi_pm2', label: 'Actual Cost (AC)', value: `$${(DEMO_PROJECTS[0]?.spentUSD || 0).toLocaleString()}`, change: 'Within Budget', isPositive: true, iconName: 'DollarSign', category: 'EVM' },
          { id: 'kpi_pm3', label: 'Active Work Packages', value: `${DEMO_WORK_ORDERS.length} Packages`, change: `${criticalWOs} Critical`, isPositive: true, iconName: 'Layers', category: 'Execution' },
          { id: 'kpi_pm4', label: 'Pending PR Approvals', value: `${INITIAL_PURCHASE_REQUISITIONS.filter(r => r.status === 'Submitted' || r.status === 'Draft').length} Pending`, change: 'Action Required', isPositive: false, iconName: 'FileText', category: 'Procurement' },
        ],
        tasks: DEMO_WORK_ORDERS.map((w, idx) => ({
          id: `tsk_pm_${idx}`,
          title: w.title,
          priority: w.priority === 'Critical' ? 'CRITICAL' : w.priority === 'High' ? 'HIGH' : 'MEDIUM',
          dueDate: w.dueDate,
          category: w.category,
          status: w.status === 'Completed' ? 'Completed' : 'Pending',
          assignedTo: w.assignedToName,
        })),
        approvals: INITIAL_PURCHASE_REQUISITIONS.map((pr, idx) => ({
          id: `app_pm_${idx}`,
          title: `Material PR #${pr.prNumber}: ${pr.department}`,
          requester: pr.requestedByName,
          amountOrType: `$${pr.budgetAllocatedUSD.toLocaleString()} USD`,
          submittedAt: pr.createdDate,
          workflowCode: 'WF_PR_PM_APP',
          status: pr.status === 'Approved' ? 'APPROVED' : 'PENDING',
        })),
        quickActions: [
          { id: 'qa_pm1', label: 'Approve Site Requisition', iconName: 'CheckCircle2', actionType: 'APPROVE_PR', targetTab: 'procurement', description: 'Review and sign off material requests' },
          { id: 'qa_pm2', label: 'Create Work Package', iconName: 'Plus', actionType: 'CREATE_WP', targetTab: 'projects', description: 'Define new milestone or task package' },
        ],
        pinnedReports: [
          { id: 'rpt_pm1', title: 'Project BOQ Line Item Burn Rate & Savings Log', code: 'RPT_BOQ_BURN_RATE', type: 'BOQ', lastGenerated: 'Today, 07:00' },
        ],
        pinnedDashboards: [
          { id: 'dash_pm1', title: 'Project Execution & EVM Dashboard', widgetsCount: 8, category: 'Project' },
        ],
        notifications: [
          { id: 'nt_pm1', title: 'Pour Card Approved', message: 'Structural Consultant approved Pour Card PC-402.', timestamp: '15 mins ago', severity: 'success' },
        ],
        gridData: DEMO_WORK_ORDERS.map(w => ({
          id: w.id,
          name: w.title,
          budget: `$${(1200000).toLocaleString()}`,
          actual: `$${(1140000).toLocaleString()}`,
          progress: w.status === 'Completed' ? 100 : w.status === 'In Progress' ? 65 : 15,
          status: w.status,
          lead: w.assignedToName,
        })),
        gridColumns: [
          { key: 'id', header: 'Package ID', width: '110px' },
          { key: 'name', header: 'Work Package Name' },
          { key: 'budget', header: 'Est. Budget' },
          { key: 'actual', header: 'Actual Cost' },
          { key: 'progress', header: 'Progress %' },
          { key: 'status', header: 'Status' },
          { key: 'lead', header: 'Lead Engineer' },
        ],
      };

    case 'PROJECT_ENGINEER':
      return {
        id: 'PROJECT_ENGINEER',
        name: 'Project Engineer Workspace',
        code: 'WS_PE',
        title: 'Project Engineer Technical Design & RFI Management Workspace',
        description: 'Structural drawing submittals, Request for Information (RFI) resolution, technical compliance, and BOQ estimation.',
        icon: 'Compass',
        defaultRoleMapping: 'INCHARGE',
        themeColor: 'teal',
        todaysWorkCount: 6,
        kpis: [
          { id: 'kpi_pe1', label: 'Open Technical RFIs', value: `${DEMO_WORK_ORDERS.filter(w => w.status === 'Under Inspection').length + 2} RFIs`, change: '2 High Priority', isPositive: false, iconName: 'HelpCircle', category: 'Design' },
          { id: 'kpi_pe2', label: 'Drawing Submittals Revs', value: `${WATER_TEST_REPORTS.length + 8} Drawings`, change: '8 Approved', isPositive: true, iconName: 'FileText', category: 'Submittals' },
          { id: 'kpi_pe3', label: 'Hydro Test Reports Verified', value: `${WATER_TEST_REPORTS.length} Reports`, change: '100% Pass Rate', isPositive: true, iconName: 'CheckCircle2', category: 'Testing' },
          { id: 'kpi_pe4', label: 'Site Machinery Active', value: `${operationalMachinery} Machines`, change: 'Operational', isPositive: true, iconName: 'HardHat', category: 'Equipment' },
        ],
        tasks: WATER_TEST_REPORTS.map((t, idx) => ({
          id: `tsk_pe_${idx}`,
          title: `Technical Review: ${t.testType} (${t.testNo})`,
          priority: 'HIGH',
          dueDate: t.testDate,
          category: 'Quality Assurance',
          status: t.testResult === 'PASS' ? 'Completed' : 'Pending',
          assignedTo: t.witnessOfficer || t.kwaWitnessOfficer,
        })),
        approvals: WATER_TEST_REPORTS.map((t, idx) => ({
          id: `app_pe_${idx}`,
          title: `Sign-off Quality Certificate: ${t.testNo}`,
          requester: t.witnessOfficer || t.kwaWitnessOfficer,
          amountOrType: t.testType,
          submittedAt: t.testDate,
          workflowCode: 'WF_QA_CERT_APP',
          status: t.testResult === 'PASS' ? 'APPROVED' : 'PENDING',
        })),
        quickActions: [
          { id: 'qa_pe1', label: 'Submit RFI Query', iconName: 'HelpCircle', actionType: 'SUBMIT_RFI', targetTab: 'waterInfrastructure', description: 'Log technical clarification request for structural engineer' },
        ],
        pinnedReports: [
          { id: 'rpt_pe1', title: 'Hydrostatic Pipeline Pressure Test Certificate Log', code: 'RPT_HYDRO_TEST', type: 'QA_QC', lastGenerated: 'Today, 09:30' },
        ],
        pinnedDashboards: [
          { id: 'dash_pe1', title: 'Technical Engineering & RFI Tracker', widgetsCount: 6, category: 'Engineering' },
        ],
        notifications: [
          { id: 'nt_pe1', title: 'Structural Drawing Approved', message: 'Client approved REV-3 Foundation Drawing.', timestamp: '1 hour ago', severity: 'success' },
        ],
        gridData: WATER_TEST_REPORTS.map(r => ({
          id: r.testNo,
          testType: r.testType,
          location: r.chainageSection,
          inspector: r.witnessOfficer || r.kwaWitnessOfficer,
          date: r.testDate,
          result: r.testResult,
        })),
        gridColumns: [
          { key: 'id', header: 'Report #', width: '130px' },
          { key: 'testType', header: 'Test Category' },
          { key: 'location', header: 'Chainage / Location' },
          { key: 'inspector', header: 'Inspector' },
          { key: 'date', header: 'Test Date' },
          { key: 'result', header: 'Result' },
        ],
      };

    case 'SITE_ENGINEER':
      return {
        id: 'SITE_ENGINEER',
        name: 'Site Engineer Workspace',
        code: 'WS_SE',
        title: 'Site Engineer Daily Production & Work Inspection Workspace',
        description: 'Daily Progress Reports (DPR), Pour Cards, material delivery verification, site labor allocation, and safety briefings.',
        icon: 'HardHat',
        defaultRoleMapping: 'INCHARGE',
        themeColor: 'amber',
        todaysWorkCount: 8,
        kpis: [
          { id: 'kpi_se1', label: 'Daily Progress Logs (DPR)', value: `${DEMO_DAILY_LOGS.length} Logs`, change: 'Shift 1 Complete', isPositive: true, iconName: 'FileText', category: 'Production' },
          { id: 'kpi_se2', label: 'Active Site Labor Crew', value: `${DEMO_DAILY_LOGS[0]?.workersCount || 42} Workers`, change: 'Full Attendance', isPositive: true, iconName: 'Users', category: 'Manpower' },
          { id: 'kpi_se3', label: 'Material Requisitions (PR)', value: `${INITIAL_PURCHASE_REQUISITIONS.length} PRs`, change: 'On Site', isPositive: true, iconName: 'Boxes', category: 'Materials' },
          { id: 'kpi_se4', label: 'Site Safety Record', value: `${DEMO_DAILY_LOGS.reduce((s, l) => s + l.safetyIncidents, 0)} Incidents`, change: 'Zero Harm', isPositive: true, iconName: 'ShieldCheck', category: 'Safety' },
        ],
        tasks: DEMO_DAILY_LOGS.map((log, idx) => ({
          id: `tsk_se_${idx}`,
          title: `Verify DPR Log for ${log.projectName}`,
          priority: 'HIGH',
          dueDate: log.date,
          category: 'Site Production',
          status: 'Completed',
          assignedTo: log.supervisorName,
        })),
        approvals: DEMO_DAILY_LOGS.map((log, idx) => ({
          id: `app_se_${idx}`,
          title: `Site DPR Verification: ${log.projectName}`,
          requester: log.supervisorName,
          amountOrType: `${log.workersCount} Workers`,
          submittedAt: log.date,
          workflowCode: 'WF_SITE_DPR_APP',
          status: 'APPROVED',
        })),
        quickActions: [
          { id: 'qa_se1', label: 'Create Daily DPR Log', iconName: 'FileText', actionType: 'CREATE_DPR', targetTab: 'waterInfrastructure', description: 'Log today site progress, labor crew, and weather' },
        ],
        pinnedReports: [
          { id: 'rpt_se1', title: 'Daily Site Progress Log & Pour Card History', code: 'RPT_SITE_DPR_HIST', type: 'DPR', lastGenerated: 'Today, 18:00' },
        ],
        pinnedDashboards: [
          { id: 'dash_se1', title: 'Site Operations & DPR Tracker', widgetsCount: 5, category: 'Site' },
        ],
        notifications: [
          { id: 'nt_se1', title: 'Concrete Mixer Truck Arrived', message: 'Batch #M40 delivered to Pier 4 site.', timestamp: '15 mins ago', severity: 'info' },
        ],
        gridData: INITIAL_LABOUR_ALLOCATIONS.map(l => ({
          id: l.id,
          project: l.projectName,
          trade: 'Skilled & Unskilled Crew',
          count: l.skilledWorkersCount + l.unskilledWorkersCount,
          shift: 'Day Shift',
          supervisor: l.supervisorIncharge,
          date: l.date,
        })),
        gridColumns: [
          { key: 'id', header: 'Alloc ID', width: '90px' },
          { key: 'project', header: 'Project Site' },
          { key: 'trade', header: 'Trade / Craft' },
          { key: 'count', header: 'Headcount' },
          { key: 'shift', header: 'Shift' },
          { key: 'supervisor', header: 'Supervisor' },
          { key: 'date', header: 'Date' },
        ],
      };

    case 'STORE_OPERATIONS':
      return {
        id: 'STORE_OPERATIONS',
        name: 'Store Operations Workspace',
        code: 'WS_STORE',
        title: 'Store & Warehouse Inventory Control Workspace',
        description: 'Stock valuation, Goods Receipt Notes (GRN), store dispatches, reorder alerts, and gate pass management.',
        icon: 'Boxes',
        defaultRoleMapping: 'STORE_KEEPER',
        themeColor: 'orange',
        todaysWorkCount: 9,
        kpis: [
          { id: 'kpi_st1', label: 'Total Inventory SKUs', value: `${DEMO_INVENTORY.length} Items`, change: 'Cataloged', isPositive: true, iconName: 'Boxes', category: 'Catalog' },
          { id: 'kpi_st2', label: 'Low Stock Reorder Alerts', value: `${lowStockCount} Items`, change: 'Restock Urgently', isPositive: false, iconName: 'AlertTriangle', category: 'Alerts' },
          { id: 'kpi_st3', label: 'Total Stock Valuation', value: `$${totalInventoryValuation.toLocaleString()}`, change: 'Audit Verified', isPositive: true, iconName: 'DollarSign', category: 'Valuation' },
          { id: 'kpi_st4', label: 'Goods Receipt Notes (GRN)', value: `${INITIAL_GRNS.length} GRNs`, change: 'Received', isPositive: true, iconName: 'FileCheck', category: 'GRN' },
        ],
        tasks: DEMO_INVENTORY.filter(i => i.status === 'Low Stock').map((item, idx) => ({
          id: `tsk_st_${idx}`,
          title: `Raise Purchase Requisition for ${item.name}`,
          priority: 'CRITICAL',
          dueDate: 'Today, 12:00',
          category: 'Inventory Restock',
          status: 'Pending',
          assignedTo: 'Store Keeper',
        })),
        approvals: INITIAL_GRNS.map((grn, idx) => ({
          id: `app_st_${idx}`,
          title: `GRN Stock Audit Verification #${grn.grnNumber}`,
          requester: grn.inspectedByName,
          amountOrType: grn.vendorName,
          submittedAt: grn.receivedDate,
          workflowCode: 'WF_GRN_VERIFY',
          status: grn.qualityStatus === 'Passed' ? 'APPROVED' : 'PENDING',
        })),
        quickActions: [
          { id: 'qa_st1', label: 'Receive Goods (GRN)', iconName: 'FileCheck', actionType: 'CREATE_GRN', targetTab: 'procurement', description: 'Record incoming vendor shipment and inspect quality' },
        ],
        pinnedReports: [
          { id: 'rpt_st1', title: 'Inventory Stock Valuation & Slow-Moving SKUs', code: 'RPT_STOCK_VALUATION', type: 'INVENTORY', lastGenerated: 'Today, 06:00' },
        ],
        pinnedDashboards: [
          { id: 'dash_st1', title: 'Store Inventory & Reorder Board', widgetsCount: 6, category: 'Store' },
        ],
        notifications: [
          { id: 'nt_st1', title: 'Reorder Alert Triggered', message: 'Hydraulic Seal Kit stock dropped below min threshold.', timestamp: '5 mins ago', severity: 'warning' },
        ],
        gridData: DEMO_INVENTORY.map(item => ({
          id: item.itemCode,
          name: item.name,
          category: item.category,
          stock: `${item.quantityInStock} ${item.unit}`,
          minThreshold: item.minThreshold,
          unitPrice: `$${item.unitPriceUSD.toFixed(2)}`,
          location: item.storeLocation,
          status: item.status,
        })),
        gridColumns: [
          { key: 'id', header: 'SKU Code', width: '130px' },
          { key: 'name', header: 'Material Name' },
          { key: 'category', header: 'Category' },
          { key: 'stock', header: 'Stock Qty' },
          { key: 'minThreshold', header: 'Min Limit' },
          { key: 'unitPrice', header: 'Unit Price' },
          { key: 'location', header: 'Store Location' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'PROCUREMENT':
      return {
        id: 'PROCUREMENT',
        name: 'Procurement Workspace',
        code: 'WS_PROC',
        title: 'Procurement, Sourcing & Purchase Order Workspace',
        description: 'Purchase requisitions (PR), Request for Quotations (RFQ), vendor bidding analysis, and Purchase Order (PO) releases.',
        icon: 'FileSpreadsheet',
        defaultRoleMapping: 'MANAGER',
        themeColor: 'violet',
        todaysWorkCount: 7,
        kpis: [
          { id: 'kpi_pr1', label: 'Active Purchase Orders', value: `${INITIAL_PURCHASE_ORDERS.length} POs`, change: 'Issued', isPositive: true, iconName: 'FileCheck', category: 'POs' },
          { id: 'kpi_pr2', label: 'Approved Vendors', value: `${INITIAL_VENDORS.filter(v => v.status === 'Approved').length} Active`, change: 'Evaluated', isPositive: true, iconName: 'Users', category: 'Sourcing' },
          { id: 'kpi_pr3', label: 'Pending Requisitions', value: `${INITIAL_PURCHASE_REQUISITIONS.filter(r => r.status === 'Submitted' || r.status === 'Draft').length} Pending`, change: 'Action Needed', isPositive: false, iconName: 'Clock', category: 'Requisitions' },
          { id: 'kpi_pr4', label: 'Active RFQs & Quotes', value: `${INITIAL_RFQS.length} RFQs`, change: 'Bidding Open', isPositive: true, iconName: 'FileSpreadsheet', category: 'RFQs' },
        ],
        tasks: INITIAL_PURCHASE_REQUISITIONS.map((r, idx) => ({
          id: `tsk_pr_${idx}`,
          title: `Process Requisition #${r.prNumber}: ${r.department}`,
          priority: 'HIGH',
          dueDate: r.requiredByDate,
          category: 'Procurement',
          status: r.status === 'Approved' ? 'Completed' : 'Pending',
          assignedTo: 'Procurement Officer',
        })),
        approvals: INITIAL_PURCHASE_ORDERS.map((po, idx) => ({
          id: `app_pr_${idx}`,
          title: `Purchase Order Authorization #${po.poNumber}`,
          requester: po.issuedByName,
          amountOrType: `$${po.netAmountUSD.toLocaleString()} USD`,
          submittedAt: po.poDate,
          workflowCode: 'WF_PO_RELEASE',
          status: po.status === 'Issued' ? 'APPROVED' : 'PENDING',
        })),
        quickActions: [
          { id: 'qa_pr1', label: 'Create Purchase Order', iconName: 'Plus', actionType: 'CREATE_PO', targetTab: 'procurement', description: 'Generate binding PO from evaluated quotation' },
        ],
        pinnedReports: [
          { id: 'rpt_pr1', title: 'Procurement Cost Savings & Vendor SLA Matrix', code: 'RPT_PROC_SAVINGS', type: 'PROCUREMENT', lastGenerated: 'Today, 09:15' },
        ],
        pinnedDashboards: [
          { id: 'dash_pr1', title: 'Procurement & Supply Chain Command', widgetsCount: 7, category: 'Procurement' },
        ],
        notifications: [
          { id: 'nt_pr1', title: 'Vendor Quotation Submitted', message: 'UltraTech Cement submitted bid for RFQ-901.', timestamp: '20 mins ago', severity: 'info' },
        ],
        gridData: INITIAL_PURCHASE_ORDERS.map(po => ({
          id: po.poNumber,
          vendor: po.vendorName,
          project: po.projectName,
          amount: `$${po.netAmountUSD.toLocaleString()}`,
          issueDate: po.poDate,
          deliveryDate: po.deliveryDueDate,
          status: po.status,
        })),
        gridColumns: [
          { key: 'id', header: 'PO Number', width: '130px' },
          { key: 'vendor', header: 'Vendor Name' },
          { key: 'project', header: 'Project Site' },
          { key: 'amount', header: 'Total Value' },
          { key: 'issueDate', header: 'Issue Date' },
          { key: 'deliveryDate', header: 'Expected Delivery' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'HR':
      return {
        id: 'HR',
        name: 'HR Workspace',
        code: 'WS_HR',
        title: 'Human Resources & Workforce Management Workspace',
        description: 'Employee directory, daily attendance verification, leave request sign-offs, and monthly payroll processing.',
        icon: 'Users',
        defaultRoleMapping: 'MANAGER',
        themeColor: 'rose',
        todaysWorkCount: 6,
        kpis: [
          { id: 'kpi_hr1', label: 'Total Active Workforce', value: `${INITIAL_EMPLOYEES.length} Employees`, change: 'Direct Hire', isPositive: true, iconName: 'Users', category: 'Staffing' },
          { id: 'kpi_hr2', label: 'Today Attendance Rate', value: '100%', change: `${INITIAL_ATTENDANCE_RECORDS.length}/${INITIAL_ATTENDANCE_RECORDS.length} Present`, isPositive: true, iconName: 'UserCheck', category: 'Attendance' },
          { id: 'kpi_hr3', label: 'Pending Leave Requests', value: `${INITIAL_LEAVE_REQUESTS.filter(l => l.status === 'PENDING').length} Requests`, change: 'Action Required', isPositive: false, iconName: 'Clock', category: 'Leave' },
          { id: 'kpi_hr4', label: 'Monthly Payroll Valuation', value: `$${totalPayrollVal.toLocaleString()}`, change: 'Processed', isPositive: true, iconName: 'DollarSign', category: 'Payroll' },
        ],
        tasks: INITIAL_LEAVE_REQUESTS.map((l, idx) => ({
          id: `tsk_hr_${idx}`,
          title: `Approve Leave Request for ${l.employeeName} (${l.leaveCategory})`,
          priority: 'MEDIUM',
          dueDate: l.startDate,
          category: 'Leave Management',
          status: l.status === 'APPROVED' ? 'Completed' : 'Pending',
          assignedTo: 'HR Manager',
        })),
        approvals: INITIAL_LEAVE_REQUESTS.map((l, idx) => ({
          id: `app_hr_${idx}`,
          title: `Leave Approval: ${l.employeeName} (${l.leaveCategory})`,
          requester: l.employeeName,
          amountOrType: `${l.totalDays} Days`,
          submittedAt: l.startDate,
          workflowCode: 'WF_LEAVE_APP',
          status: l.status === 'APPROVED' ? 'APPROVED' : 'PENDING',
        })),
        quickActions: [
          { id: 'qa_hr1', label: 'Run Payroll Calculation', iconName: 'Calculator', actionType: 'RUN_PAYROLL', targetTab: 'hr', description: 'Compute salaries, overtime, and tax withholdings' },
        ],
        pinnedReports: [
          { id: 'rpt_hr1', title: 'Monthly Workforce Payroll & Attendance Register', code: 'RPT_HR_PAYROLL', type: 'HR', lastGenerated: 'Today, 08:30' },
        ],
        pinnedDashboards: [
          { id: 'dash_hr1', title: 'Workforce & Attendance Analytics', widgetsCount: 5, category: 'HR' },
        ],
        notifications: [
          { id: 'nt_hr1', title: 'Payroll Run Approved', message: 'July payroll has been verified and queued for payout.', timestamp: '1 hour ago', severity: 'success' },
        ],
        gridData: INITIAL_EMPLOYEES.map(emp => ({
          id: emp.employeeCode,
          name: emp.fullName,
          designation: emp.designation,
          department: emp.department,
          branch: emp.branch,
          salary: `$${(emp.salaryStructure?.basicUSD || 3200).toLocaleString()}`,
          status: emp.status,
        })),
        gridColumns: [
          { key: 'id', header: 'Emp Code', width: '100px' },
          { key: 'name', header: 'Full Name' },
          { key: 'designation', header: 'Designation' },
          { key: 'department', header: 'Department' },
          { key: 'branch', header: 'Branch' },
          { key: 'salary', header: 'Base Salary' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'FLEET':
      return {
        id: 'FLEET',
        name: 'Fleet Workspace',
        code: 'WS_FLEET',
        title: 'Fleet & Heavy Machinery Asset Operations Workspace',
        description: 'Heavy machinery tracking, operator assignments, fuel level logging, and preventive service schedules.',
        icon: 'Truck',
        defaultRoleMapping: 'OPERATOR',
        themeColor: 'cyan',
        todaysWorkCount: 5,
        kpis: [
          { id: 'kpi_fl1', label: 'Total Heavy Machinery', value: `${DEMO_MACHINERY.length} Assets`, change: 'Tracked', isPositive: true, iconName: 'Truck', category: 'Assets' },
          { id: 'kpi_fl2', label: 'Operational Assets', value: `${operationalMachinery} Operational`, change: `${Math.round((operationalMachinery / DEMO_MACHINERY.length) * 100)}% Available`, isPositive: true, iconName: 'CheckCircle2', category: 'Status' },
          { id: 'kpi_fl3', label: 'Under Maintenance', value: `${DEMO_MACHINERY.filter(m => m.status === 'Under Maintenance').length} Assets`, change: 'In Shop', isPositive: false, iconName: 'AlertTriangle', category: 'Service' },
          { id: 'kpi_fl4', label: 'Average Fuel Level', value: `${Math.round(DEMO_MACHINERY.reduce((s, m) => s + m.fuelLevelPercent, 0) / DEMO_MACHINERY.length)}%`, change: 'Sufficient', isPositive: true, iconName: 'Activity', category: 'Fuel' },
        ],
        tasks: DEMO_MACHINERY.filter(m => m.status === 'Under Maintenance').map((m, idx) => ({
          id: `tsk_fl_${idx}`,
          title: `Service Schedule: ${m.name} (${m.assetTag})`,
          priority: 'HIGH',
          dueDate: m.nextServiceDue,
          category: 'Fleet Maintenance',
          status: 'In Progress',
          assignedTo: m.operatorName,
        })),
        approvals: DEMO_MACHINERY.map((m, idx) => ({
          id: `app_fl_${idx}`,
          title: `Fleet Dispatch Clearance: ${m.assetTag}`,
          requester: m.operatorName,
          amountOrType: m.type,
          submittedAt: 'Today, 07:00',
          workflowCode: 'WF_FLEET_DISPATCH',
          status: m.status === 'Operational' ? 'APPROVED' : 'PENDING',
        })),
        quickActions: [
          { id: 'qa_fl1', label: 'Log Fleet Fueling', iconName: 'Activity', actionType: 'LOG_FUEL', targetTab: 'fleet', description: 'Record diesel tank refill & meter hours' },
        ],
        pinnedReports: [
          { id: 'rpt_fl1', title: 'Heavy Machinery Operating Hours & Fuel Efficiency Log', code: 'RPT_FLEET_HOURS', type: 'FLEET', lastGenerated: 'Today, 07:00' },
        ],
        pinnedDashboards: [
          { id: 'dash_fl1', title: 'Fleet & Heavy Plant Operations Board', widgetsCount: 6, category: 'Fleet' },
        ],
        notifications: [
          { id: 'nt_fl1', title: 'Maintenance Service Due', message: 'Generator G-350 due for oil change.', timestamp: '2 hours ago', severity: 'warning' },
        ],
        gridData: DEMO_MACHINERY.map(m => ({
          id: m.assetTag,
          name: m.name,
          type: m.type,
          operator: m.operatorName,
          site: m.assignedSite,
          fuel: `${m.fuelLevelPercent}%`,
          hours: `${m.workingHours} hrs`,
          status: m.status,
        })),
        gridColumns: [
          { key: 'id', header: 'Asset Tag', width: '130px' },
          { key: 'name', header: 'Equipment Name' },
          { key: 'type', header: 'Type' },
          { key: 'operator', header: 'Operator' },
          { key: 'site', header: 'Assigned Site' },
          { key: 'fuel', header: 'Fuel' },
          { key: 'hours', header: 'Working Hours' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'QA_QC':
      return {
        id: 'QA_QC',
        name: 'QA/QC Workspace',
        code: 'WS_QAQC',
        title: 'Quality Assurance & Material Testing Workspace',
        description: 'Quality inspection forms, Non-Conformance Reports (NCR), hydrostatic pipe test certificates, and lab reports.',
        icon: 'ShieldCheck',
        defaultRoleMapping: 'INCHARGE',
        themeColor: 'emerald',
        todaysWorkCount: 6,
        kpis: [
          { id: 'kpi_qa1', label: 'Quality Test Reports', value: `${WATER_TEST_REPORTS.length} Reports`, change: 'Verified', isPositive: true, iconName: 'ShieldCheck', category: 'Testing' },
          { id: 'kpi_qa2', label: 'Test Pass Rate', value: `${Math.round((WATER_TEST_REPORTS.filter(r => r.testResult === 'PASS').length / Math.max(WATER_TEST_REPORTS.length, 1)) * 100)}%`, change: '100% Quality', isPositive: true, iconName: 'CheckCircle2', category: 'Compliance' },
          { id: 'kpi_qa3', label: 'Orders Under Inspection', value: `${DEMO_WORK_ORDERS.filter(w => w.status === 'Under Inspection').length} Orders`, change: 'Pending Sign-off', isPositive: true, iconName: 'Clock', category: 'Inspection' },
          { id: 'kpi_qa4', label: 'Open NCR Flags', value: '0 Open', change: 'Zero Defect', isPositive: true, iconName: 'Award', category: 'NCR' },
        ],
        tasks: WATER_TEST_REPORTS.map((r, idx) => ({
          id: `tsk_qa_${idx}`,
          title: `Inspect ${r.testType} at ${r.chainageSection}`,
          priority: 'HIGH',
          dueDate: r.testDate,
          category: 'Quality Control',
          status: r.testResult === 'PASS' ? 'Completed' : 'Pending',
          assignedTo: r.witnessOfficer || r.kwaWitnessOfficer,
        })),
        approvals: WATER_TEST_REPORTS.map((r, idx) => ({
          id: `app_qa_${idx}`,
          title: `Issue Certificate #${r.testNo}`,
          requester: r.witnessOfficer || r.kwaWitnessOfficer,
          amountOrType: r.testType,
          submittedAt: r.testDate,
          workflowCode: 'WF_QA_CERT',
          status: r.testResult === 'PASS' ? 'APPROVED' : 'PENDING',
        })),
        quickActions: [
          { id: 'qa_qa1', label: 'Log QA Inspection', iconName: 'ShieldCheck', actionType: 'LOG_QA', targetTab: 'waterInfrastructure', description: 'Record concrete slump or hydrostatic pressure result' },
        ],
        pinnedReports: [
          { id: 'rpt_qa1', title: 'Hydrostatic Pipeline & Concrete Test Register', code: 'RPT_QA_REGISTER', type: 'QA_QC', lastGenerated: 'Today, 09:00' },
        ],
        pinnedDashboards: [
          { id: 'dash_qa1', title: 'Quality Assurance & Compliance Hub', widgetsCount: 6, category: 'QA' },
        ],
        notifications: [
          { id: 'nt_qa1', title: 'Hydro-Test Passed', message: 'Pipeline Sector B passed 10 bar pressure test.', timestamp: '30 mins ago', severity: 'success' },
        ],
        gridData: WATER_TEST_REPORTS.map(r => ({
          id: r.testNo,
          test: r.testType,
          location: r.chainageSection,
          inspector: r.witnessOfficer || r.kwaWitnessOfficer,
          date: r.testDate,
          result: r.testResult,
        })),
        gridColumns: [
          { key: 'id', header: 'Report #', width: '130px' },
          { key: 'test', header: 'Quality Test Type' },
          { key: 'location', header: 'Chainage Location' },
          { key: 'inspector', header: 'QA Inspector' },
          { key: 'date', header: 'Inspection Date' },
          { key: 'result', header: 'Result' },
        ],
      };

    case 'SAFETY':
      return {
        id: 'SAFETY',
        name: 'Safety Workspace',
        code: 'WS_HSE',
        title: 'Health, Safety & Environment (HSE) Command Workspace',
        description: 'Toolbox Talks, hazard identification, PPE compliance checks, Permit to Work (PTW), and incident logs.',
        icon: 'ShieldAlert',
        defaultRoleMapping: 'SUPERVISOR',
        themeColor: 'red',
        todaysWorkCount: 4,
        kpis: [
          { id: 'kpi_sf1', label: 'Cumulative Safe Hours', value: '14,280 Hours', change: 'Zero LTI', isPositive: true, iconName: 'ShieldCheck', category: 'Safety' },
          { id: 'kpi_sf2', label: 'Safety Incidents', value: `${DEMO_DAILY_LOGS.reduce((s, l) => s + l.safetyIncidents, 0)} Incidents`, change: 'Zero Harm Target', isPositive: true, iconName: 'Award', category: 'Incidents' },
          { id: 'kpi_sf3', label: 'PPE Compliance Score', value: '98.5%', change: 'Compliant', isPositive: true, iconName: 'CheckCircle2', category: 'Compliance' },
          { id: 'kpi_sf4', label: 'Toolbox Talks Briefings', value: `${DEMO_DAILY_LOGS.length + 12} Briefings`, change: 'Daily Active', isPositive: true, iconName: 'Users', category: 'Briefings' },
        ],
        tasks: DEMO_DAILY_LOGS.map((l, idx) => ({
          id: `tsk_sf_${idx}`,
          title: `Conduct Safety Briefing for ${l.projectName}`,
          priority: 'CRITICAL',
          dueDate: l.date,
          category: 'HSE',
          status: 'Completed',
          assignedTo: l.supervisorName,
        })),
        approvals: [
          { id: 'app_sf1', title: 'Permit to Work (PTW) Hot Work Clearance', requester: 'Site Supervisor', amountOrType: 'Hot Work', submittedAt: 'Today, 08:00', workflowCode: 'WF_PTW_APP', status: 'APPROVED' },
        ],
        quickActions: [
          { id: 'qa_sf1', label: 'Log Safety Inspection', iconName: 'ShieldAlert', actionType: 'LOG_SAFETY', targetTab: 'admin', description: 'Log safety hazard or toolbox talk completion' },
        ],
        pinnedReports: [
          { id: 'rpt_sf1', title: 'Enterprise HSE Incident & PPE Audit Report', code: 'RPT_HSE_AUDIT', type: 'HSE', lastGenerated: 'Today, 07:00' },
        ],
        pinnedDashboards: [
          { id: 'dash_sf1', title: 'HSE Safety & Risk Control Board', widgetsCount: 5, category: 'Safety' },
        ],
        notifications: [
          { id: 'nt_sf1', title: 'Daily Safety Talk Complete', message: 'Shift 1 crew completed heavy lifting safety brief.', timestamp: '1 hour ago', severity: 'info' },
        ],
        gridData: DEMO_DAILY_LOGS.map(l => ({
          id: l.id,
          date: l.date,
          project: l.projectName,
          supervisor: l.supervisorName,
          crew: `${l.workersCount} Workers`,
          incidents: `${l.safetyIncidents} Incidents`,
          weather: l.weather,
        })),
        gridColumns: [
          { key: 'id', header: 'Log Ref', width: '100px' },
          { key: 'date', header: 'Date' },
          { key: 'project', header: 'Project Site' },
          { key: 'supervisor', header: 'HSE Officer' },
          { key: 'crew', header: 'Crew Size' },
          { key: 'incidents', header: 'Incidents' },
          { key: 'weather', header: 'Weather' },
        ],
      };

    case 'ADMINISTRATION':
    default:
      return {
        id: 'ADMINISTRATION',
        name: 'Administration & System Workspace',
        code: 'WS_ADMIN',
        title: 'System Administration, ABAC/RBAC & Audit Workspace',
        description: 'System security configuration, Attribute-Based Access Control (ABAC), RBAC permission matrix, ERP module registry, and audit trail.',
        icon: 'ShieldCheck',
        defaultRoleMapping: 'ADMIN',
        themeColor: 'purple',
        todaysWorkCount: 4,
        kpis: [
          { id: 'kpi_ad1', label: 'Provisioned ERP Users', value: `${Object.keys(DEMO_USERS).length} Users`, change: '8 Roles Configured', isPositive: true, iconName: 'Users', category: 'Security' },
          { id: 'kpi_ad2', label: 'Security Roles Active', value: `${Object.keys(ROLE_CONFIG).length} Roles`, change: 'RBAC Enforced', isPositive: true, iconName: 'ShieldCheck', category: 'Security' },
          { id: 'kpi_ad3', label: 'ABAC Access Policies', value: '18 Active', change: 'Row/Field Level', isPositive: true, iconName: 'Lock', category: 'ABAC' },
          { id: 'kpi_ad4', label: 'System Automation Health', value: '100% Operational', change: 'Zero Faults', isPositive: true, iconName: 'Activity', category: 'System' },
        ],
        tasks: [
          { id: 'tsk_ad1', title: 'Audit Security Permission Matrix for Site Roles', priority: 'HIGH', dueDate: 'Today, 15:00', category: 'Security', status: 'In Progress', assignedTo: 'System Admin' },
        ],
        approvals: [
          { id: 'app_ad1', title: 'User Role Escalation Request: Er. Rahul to Project Manager', requester: 'HR Manager', amountOrType: 'Role: MANAGER', submittedAt: '1 hour ago', workflowCode: 'WF_ROLE_ESCALATION', status: 'PENDING' },
        ],
        quickActions: [
          { id: 'qa_ad1', label: 'Manage ABAC Policies', iconName: 'ShieldCheck', actionType: 'MANAGE_ABAC', targetTab: 'admin', description: 'Configure fine-grained security rules & attributes' },
        ],
        pinnedReports: [
          { id: 'rpt_ad1', title: 'Enterprise Security Audit & Access Control Log', code: 'RPT_SEC_AUDIT', type: 'ADMIN_AUDIT', lastGenerated: 'Today, 05:00' },
        ],
        pinnedDashboards: [
          { id: 'dash_ad1', title: 'System Security & ABAC Administration Board', widgetsCount: 8, category: 'Admin' },
        ],
        notifications: [
          { id: 'nt_ad1', title: 'Security Policy Active', message: 'ABAC policy updated across all active sessions.', timestamp: '15 mins ago', severity: 'info' },
        ],
        gridData: Object.values(DEMO_USERS).map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          department: u.department,
          project: u.assignedProjectName || 'All Sites',
          status: 'Active',
        })),
        gridColumns: [
          { key: 'id', header: 'User ID', width: '100px' },
          { key: 'name', header: 'Full Name' },
          { key: 'email', header: 'Email Address' },
          { key: 'role', header: 'Role' },
          { key: 'department', header: 'Department' },
          { key: 'project', header: 'Assigned Project' },
          { key: 'status', header: 'Status' },
        ],
      };
  }
}

/**
 * UAT and Production Truthful Workspace Configuration:
 * In non-demo environments, workspaces must strictly present honest baseline values ($0.00, 0%, 0 Items)
 * without mock/demo transactional entities, pending live database overlay.
 */
function getProductionWorkspaceConfig(id: WorkspaceId, user?: UserProfile | null): WorkspaceConfig {
  switch (id) {
    case 'EXECUTIVE':
      return {
        id: 'EXECUTIVE',
        name: 'Executive Workspace',
        code: 'WS_EXEC',
        title: 'C-Suite Command Cockpit & Enterprise Strategy',
        description: 'High-level financial KPIs, portfolio execution health, strategic tenders, and board approvals.',
        icon: 'Award',
        defaultRoleMapping: 'ADMIN',
        themeColor: 'indigo',
        todaysWorkCount: 0,
        kpis: [
          { id: 'kpi_ex1', label: 'Enterprise Capex', value: '$0.00', change: 'Live Ledger Baseline', isPositive: true, iconName: 'DollarSign', category: 'Financial' },
          { id: 'kpi_ex2', label: 'Portfolio Health (Avg Progress)', value: '0%', change: 'Awaiting Active Sites', isPositive: true, iconName: 'TrendingUp', category: 'Execution' },
          { id: 'kpi_ex3', label: 'Active Strategic Projects', value: '0 Active', change: 'Corporate Scope', isPositive: true, iconName: 'Briefcase', category: 'Projects' },
          { id: 'kpi_ex4', label: 'High Risk Flagged Items', value: '0 Items', change: 'Compliant', isPositive: true, iconName: 'ShieldAlert', category: 'Risk' },
        ],
        tasks: [],
        approvals: [],
        quickActions: [
          { id: 'qa_ex1', label: 'Launch Financial Audit', iconName: 'BarChart3', actionType: 'VIEW_AUDIT', targetTab: 'reports', description: 'Inspect consolidated balance sheet & cost centers' },
          { id: 'qa_ex2', label: 'Approve Strategic PR', iconName: 'CheckCircle2', actionType: 'APPROVE_PR', targetTab: 'procurement', description: 'Review pending high-value procurement requests' },
        ],
        pinnedReports: [
          { id: 'rpt_ex1', title: 'Executive Financial Summary & Capex Allocation', code: 'RPT_EXEC_CAPEX', type: 'FINANCIAL', lastGenerated: 'Live' },
          { id: 'rpt_ex2', title: 'Cross-Project SPI/CPI Variance Report', code: 'RPT_PORTFOLIO_VARIANCE', type: 'ANALYTICAL', lastGenerated: 'Live' },
        ],
        pinnedDashboards: [
          { id: 'dash_ex1', title: 'Executive Command Cockpit', widgetsCount: 8, category: 'Executive' },
        ],
        notifications: [],
        gridData: [],
        gridColumns: [
          { key: 'id', header: 'Project Code', width: '120px' },
          { key: 'name', header: 'Project Name' },
          { key: 'client', header: 'Client' },
          { key: 'budget', header: 'Budget (USD)' },
          { key: 'spent', header: 'Spent (USD)' },
          { key: 'progress', header: 'Progress' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'MANAGING_DIRECTOR':
      return {
        id: 'MANAGING_DIRECTOR',
        name: 'Managing Director Workspace',
        code: 'WS_MD',
        title: 'Managing Director Commercial & Contract Command Workspace',
        description: 'Commercial agreements, vendor performance, tender pipeline, and corporate governance.',
        icon: 'Briefcase',
        defaultRoleMapping: 'ADMIN',
        themeColor: 'blue',
        todaysWorkCount: 0,
        kpis: [
          { id: 'kpi_md1', label: 'Overall Completion Rate', value: '0%', change: 'Live Progress', isPositive: true, iconName: 'TrendingUp', category: 'Operations' },
          { id: 'kpi_md2', label: 'Vendor Base', value: '0 Approved', change: 'Registered Vendors', isPositive: true, iconName: 'Users', category: 'Supply Chain' },
          { id: 'kpi_md3', label: 'Active Tender Pipeline', value: '0 Tenders', change: '$0.00 Value', isPositive: true, iconName: 'FileSpreadsheet', category: 'Commercial' },
          { id: 'kpi_md4', label: 'Active Business Divisions', value: 'Corporate HQ', change: '100% Operational', isPositive: true, iconName: 'Layers', category: 'Business' },
        ],
        tasks: [],
        approvals: [],
        quickActions: [
          { id: 'qa_md1', label: 'Review Tender Bids', iconName: 'FileText', actionType: 'VIEW_TENDERS', targetTab: 'procurement', description: 'Inspect upcoming public infrastructure bids' },
        ],
        pinnedReports: [
          { id: 'rpt_md1', title: 'Subcontractor Performance & Commercial Risk Analysis', code: 'RPT_VENDOR_PERF', type: 'COMMERCIAL', lastGenerated: 'Live' },
        ],
        pinnedDashboards: [
          { id: 'dash_md1', title: 'Commercial Operations Board', widgetsCount: 6, category: 'Commercial' },
        ],
        notifications: [],
        gridData: [],
        gridColumns: [
          { key: 'code', header: 'Tender Ref', width: '130px' },
          { key: 'title', header: 'Tender Title' },
          { key: 'client', header: 'Client Authority' },
          { key: 'value', header: 'Estimated Value' },
          { key: 'submissionDate', header: 'Deadline' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'GENERAL_MANAGER':
      return {
        id: 'GENERAL_MANAGER',
        name: 'General Manager Workspace',
        code: 'WS_GM',
        title: 'General Manager Operations & Resource Utilization Workspace',
        description: 'Cross-project operations, fleet allocation, department performance, and EVM variance tracking.',
        icon: 'Sliders',
        defaultRoleMapping: 'MANAGER',
        themeColor: 'sky',
        todaysWorkCount: 0,
        kpis: [
          { id: 'kpi_gm1', label: 'Schedule Performance Index (SPI)', value: '1.00', change: 'Baseline Target', isPositive: true, iconName: 'TrendingUp', category: 'EVM' },
          { id: 'kpi_gm2', label: 'Cost Performance Index (CPI)', value: '1.00', change: 'Baseline Budget', isPositive: true, iconName: 'DollarSign', category: 'EVM' },
          { id: 'kpi_gm3', label: 'Fleet Availability', value: '0%', change: '0 Active Machines', isPositive: true, iconName: 'Truck', category: 'Fleet' },
          { id: 'kpi_gm4', label: 'Open Requisitions', value: '0 Pending', change: 'No Pending PRs', isPositive: true, iconName: 'Clock', category: 'Procurement' },
        ],
        tasks: [],
        approvals: [],
        quickActions: [
          { id: 'qa_gm1', label: 'Allocate Heavy Equipment', iconName: 'Truck', actionType: 'ALLOCATE_FLEET', targetTab: 'fleet', description: 'Reassign cranes & excavators to site sectors' },
        ],
        pinnedReports: [
          { id: 'rpt_gm1', title: 'Cross-Project SPI/CPI Variance Log', code: 'RPT_CROSS_SPI_CPI', type: 'ANALYTICAL', lastGenerated: 'Live' },
        ],
        pinnedDashboards: [
          { id: 'dash_gm1', title: 'Operations Control Board', widgetsCount: 9, category: 'Operations' },
        ],
        notifications: [],
        gridData: [],
        gridColumns: [
          { key: 'id', header: 'WO Code', width: '110px' },
          { key: 'title', header: 'Order Title' },
          { key: 'priority', header: 'Priority' },
          { key: 'assignedTo', header: 'Incharge' },
          { key: 'dueDate', header: 'Due Date' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'PROJECT_MANAGER':
      return {
        id: 'PROJECT_MANAGER',
        name: 'Project Manager Workspace',
        code: 'WS_PM',
        title: 'Project Manager Operational Execution & WBS Control Workspace',
        description: 'Site WBS execution, task milestones, procurement requests, subcontractor measurements, and daily logs.',
        icon: 'Building2',
        defaultRoleMapping: 'MANAGER',
        themeColor: 'emerald',
        todaysWorkCount: 0,
        kpis: [
          { id: 'kpi_pm1', label: 'Portfolio Budget', value: '$0.00', change: 'Active Projects Baseline', isPositive: true, iconName: 'DollarSign', category: 'Financial' },
          { id: 'kpi_pm2', label: 'Committed Capex', value: '$0.00', change: 'Committed Cost', isPositive: true, iconName: 'DollarSign', category: 'Financial' },
          { id: 'kpi_pm3', label: 'Milestone Completion', value: '0%', change: 'Progress Baseline', isPositive: true, iconName: 'TrendingUp', category: 'Schedule' },
          { id: 'kpi_pm4', label: 'Active Sites', value: '0 Sites', change: 'Operating Sectors', isPositive: true, iconName: 'HardHat', category: 'Site' },
        ],
        tasks: [],
        approvals: [],
        quickActions: [
          { id: 'qa_pm1', label: 'View Project Controls', iconName: 'Compass', actionType: 'PROJECT_CONTROLS', targetTab: 'projectcontrols', description: 'Inspect EVM, Gantt schedules, and milestones' },
        ],
        pinnedReports: [
          { id: 'rpt_pm1', title: 'Comprehensive Project Health & Milestone Tracking', code: 'RPT_PRJ_HEALTH', type: 'OPERATIONAL', lastGenerated: 'Live' },
        ],
        pinnedDashboards: [
          { id: 'dash_pm1', title: 'Site Operations Cockpit', widgetsCount: 8, category: 'Operations' },
        ],
        notifications: [],
        gridData: [],
        gridColumns: [
          { key: 'id', header: 'Task ID', width: '100px' },
          { key: 'title', header: 'Milestone / Work Package' },
          { key: 'site', header: 'Site Location' },
          { key: 'progress', header: 'Progress' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'PROJECT_ENGINEER':
      return {
        id: 'PROJECT_ENGINEER',
        name: 'Project Engineer Workspace',
        code: 'WS_PE',
        title: 'Project Engineer Technical Submittals & Field QA Workspace',
        description: 'Piping schematics, material test certificates, site RFIs, pour cards, and technical queries.',
        icon: 'Compass',
        defaultRoleMapping: 'INCHARGE',
        themeColor: 'teal',
        todaysWorkCount: 0,
        kpis: [
          { id: 'kpi_pe1', label: 'Technical RFIs', value: '0 Open', change: 'All Queries Cleared', isPositive: true, iconName: 'HelpCircle', category: 'Engineering' },
          { id: 'kpi_pe2', label: 'Drawing Submittals', value: '0 Verified', change: 'Structural & Piping', isPositive: true, iconName: 'FileText', category: 'Drawings' },
          { id: 'kpi_pe3', label: 'Field Inspections', value: '0 Pending', change: 'QA Queue Clear', isPositive: true, iconName: 'CheckCircle2', category: 'QA/QC' },
          { id: 'kpi_pe4', label: 'Non-Conformance (NCR)', value: '0 Open', change: 'Zero Faults', isPositive: true, iconName: 'AlertTriangle', category: 'Quality' },
        ],
        tasks: [],
        approvals: [],
        quickActions: [],
        pinnedReports: [],
        pinnedDashboards: [],
        notifications: [],
        gridData: [],
        gridColumns: [
          { key: 'id', header: 'Ref' },
          { key: 'title', header: 'Description' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'SITE_ENGINEER':
      return {
        id: 'SITE_ENGINEER',
        name: 'Site Engineer Workspace',
        code: 'WS_SE',
        title: 'Site Engineer DPR & Field Operations Workspace',
        description: 'Shift workforce attendance, material issue slips, field progress logs, and safety checks.',
        icon: 'HardHat',
        defaultRoleMapping: 'SUPERVISOR',
        themeColor: 'amber',
        todaysWorkCount: 0,
        kpis: [
          { id: 'kpi_se1', label: 'Daily DPR Logs', value: '0 Submitted', change: 'Today Shift Log', isPositive: true, iconName: 'FileText', category: 'Site Logs' },
          { id: 'kpi_se2', label: 'Site Labour Crew', value: '0 Workers', change: 'Rostered Crew', isPositive: true, iconName: 'Users', category: 'Workforce' },
          { id: 'kpi_se3', label: 'Pending PRs', value: '0 Requests', change: 'Material Queue', isPositive: true, iconName: 'Clock', category: 'Requisitions' },
          { id: 'kpi_se4', label: 'Active Work Orders', value: '0 Active', change: 'Field Tasks', isPositive: true, iconName: 'Boxes', category: 'Tasks' },
        ],
        tasks: [],
        approvals: [],
        quickActions: [],
        pinnedReports: [],
        pinnedDashboards: [],
        notifications: [],
        gridData: [],
        gridColumns: [
          { key: 'id', header: 'Task Ref' },
          { key: 'title', header: 'Task Title' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'STORE_OPERATIONS':
      return {
        id: 'STORE_OPERATIONS',
        name: 'Store & Warehouse Workspace',
        code: 'WS_STORE',
        title: 'Warehouse Store Keeper & Materials Control Workspace',
        description: 'Central store inventory, physical stock audits, goods receipts (GRN), and gate dispatch passes.',
        icon: 'Boxes',
        defaultRoleMapping: 'STORE_KEEPER',
        themeColor: 'cyan',
        todaysWorkCount: 0,
        kpis: [
          { id: 'kpi_st1', label: 'Catalog Items', value: '0 SKUs', change: 'Warehouse Inventory', isPositive: true, iconName: 'Boxes', category: 'Inventory' },
          { id: 'kpi_st2', label: 'Low Stock SKUs', value: '0 SKUs', change: 'Action Required', isPositive: true, iconName: 'AlertTriangle', category: 'Inventory' },
          { id: 'kpi_st3', label: 'Stock Valuation', value: '$0.00', change: 'Audited Valuation', isPositive: true, iconName: 'DollarSign', category: 'Valuation' },
          { id: 'kpi_st4', label: 'Pending Goods Receipts', value: '0 GRNs', change: 'Vendor Shipments', isPositive: true, iconName: 'Truck', category: 'Receipts' },
        ],
        tasks: [],
        approvals: [],
        quickActions: [],
        pinnedReports: [],
        pinnedDashboards: [],
        notifications: [],
        gridData: [],
        gridColumns: [
          { key: 'id', header: 'Item Code' },
          { key: 'name', header: 'Material Name' },
          { key: 'qty', header: 'Quantity' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'PROCUREMENT':
      return {
        id: 'PROCUREMENT',
        name: 'Procurement & Supply Chain Workspace',
        code: 'WS_PROC',
        title: 'Procurement Officer & Commercial Supply Chain Workspace',
        description: 'Vendor RFQs, purchase orders (PO), 3-way invoice matching, and payment authorizations.',
        icon: 'FileSpreadsheet',
        defaultRoleMapping: 'MANAGER',
        themeColor: 'indigo',
        todaysWorkCount: 0,
        kpis: [
          { id: 'kpi_pr1', label: 'Active Purchase Orders', value: '0 POs', change: 'Released to Vendors', isPositive: true, iconName: 'FileSpreadsheet', category: 'Orders' },
          { id: 'kpi_pr2', label: 'Approved Vendors', value: '0 Vendors', change: 'Vetted Partners', isPositive: true, iconName: 'Users', category: 'Vendors' },
          { id: 'kpi_pr3', label: 'Pending Material PRs', value: '0 Requests', change: 'Requisition Queue', isPositive: true, iconName: 'Clock', category: 'Requests' },
          { id: 'kpi_pr4', label: 'Issued Capex Total', value: '$0.00', change: 'Total Commitment', isPositive: true, iconName: 'DollarSign', category: 'Spend' },
        ],
        tasks: [],
        approvals: [],
        quickActions: [],
        pinnedReports: [],
        pinnedDashboards: [],
        notifications: [],
        gridData: [],
        gridColumns: [
          { key: 'id', header: 'PO Number' },
          { key: 'vendor', header: 'Vendor' },
          { key: 'amount', header: 'Amount' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'HR':
      return {
        id: 'HR',
        name: 'HR & Personnel Workspace',
        code: 'WS_HR',
        title: 'Human Resources & Payroll Compliance Workspace',
        description: 'Workforce records, biometric punch telemetry, monthly payroll runs, and employee leave requests.',
        icon: 'Users',
        defaultRoleMapping: 'ADMIN',
        themeColor: 'purple',
        todaysWorkCount: 0,
        kpis: [
          { id: 'kpi_hr1', label: 'Active Workforce', value: '0 Employees', change: 'Corporate Roster', isPositive: true, iconName: 'Users', category: 'Personnel' },
          { id: 'kpi_hr2', label: 'Today Attendance', value: '0 Present', change: 'Live Biometrics', isPositive: true, iconName: 'CheckCircle2', category: 'Attendance' },
          { id: 'kpi_hr3', label: 'Pending Leave Requests', value: '0 Pending', change: 'Review Queue', isPositive: true, iconName: 'Clock', category: 'Leave' },
          { id: 'kpi_hr4', label: 'Monthly Payroll Disbursed', value: '$0.00', change: 'Current Period', isPositive: true, iconName: 'DollarSign', category: 'Payroll' },
        ],
        tasks: [],
        approvals: [],
        quickActions: [],
        pinnedReports: [],
        pinnedDashboards: [],
        notifications: [],
        gridData: [],
        gridColumns: [
          { key: 'id', header: 'Employee Code' },
          { key: 'name', header: 'Full Name' },
          { key: 'department', header: 'Department' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'FLEET':
      return {
        id: 'FLEET',
        name: 'Fleet & Heavy Machinery Workspace',
        code: 'WS_FLEET',
        title: 'Fleet & Heavy Machinery Logistics Workspace',
        description: 'Plant maintenance, fuel consumption logs, machine dispatch, and driver scheduling.',
        icon: 'Truck',
        defaultRoleMapping: 'OPERATOR',
        themeColor: 'orange',
        todaysWorkCount: 0,
        kpis: [
          { id: 'kpi_fl1', label: 'Heavy Machinery Assets', value: '0 Units', change: 'Tracked Assets', isPositive: true, iconName: 'Truck', category: 'Fleet' },
          { id: 'kpi_fl2', label: 'Operational Rate', value: '0%', change: 'Active in Field', isPositive: true, iconName: 'TrendingUp', category: 'Status' },
          { id: 'kpi_fl3', label: 'Maintenance Due', value: '0 Units', change: 'Scheduled Service', isPositive: true, iconName: 'Wrench', category: 'Maintenance' },
          { id: 'kpi_fl4', label: 'Active Operators', value: '0 Assigned', change: 'Field Rostered', isPositive: true, iconName: 'Users', category: 'Operators' },
        ],
        tasks: [],
        approvals: [],
        quickActions: [],
        pinnedReports: [],
        pinnedDashboards: [],
        notifications: [],
        gridData: [],
        gridColumns: [
          { key: 'id', header: 'Asset Code' },
          { key: 'name', header: 'Machine Name' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'QA_QC':
      return {
        id: 'QA_QC',
        name: 'Quality Assurance & QC Workspace',
        code: 'WS_QAQC',
        title: 'Quality Assurance & Laboratory Testing Workspace',
        description: 'Material certificates, hydrostatic pressure logs, weld NDT inspections, and quality NCRs.',
        icon: 'ShieldCheck',
        defaultRoleMapping: 'INCHARGE',
        themeColor: 'emerald',
        todaysWorkCount: 0,
        kpis: [
          { id: 'kpi_qa1', label: 'Quality Test Reports', value: '0 Reports', change: 'Lab Verified', isPositive: true, iconName: 'CheckCircle2', category: 'Tests' },
          { id: 'kpi_qa2', label: 'Test Pass Rate', value: '100%', change: 'Target 100%', isPositive: true, iconName: 'TrendingUp', category: 'Quality' },
          { id: 'kpi_qa3', label: 'Pending Inspections', value: '0 Orders', change: 'Clear Queue', isPositive: true, iconName: 'Clock', category: 'Inspections' },
          { id: 'kpi_qa4', label: 'Open NCRs', value: '0 Open', change: 'Fully Compliant', isPositive: true, iconName: 'ShieldAlert', category: 'NCR' },
        ],
        tasks: [],
        approvals: [],
        quickActions: [],
        pinnedReports: [],
        pinnedDashboards: [],
        notifications: [],
        gridData: [],
        gridColumns: [
          { key: 'id', header: 'Report ID' },
          { key: 'title', header: 'Test Title' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'SAFETY':
      return {
        id: 'SAFETY',
        name: 'HSE Safety & Risk Workspace',
        code: 'WS_SAFETY',
        title: 'HSE Safety, Risk Assessment & Environmental Workspace',
        description: 'Toolbox talk logs, PPE compliance, incident tracking, hazard reporting, and work permits.',
        icon: 'ShieldAlert',
        defaultRoleMapping: 'SUPERVISOR',
        themeColor: 'rose',
        todaysWorkCount: 0,
        kpis: [
          { id: 'kpi_sf1', label: 'Cumulative Safe Hours', value: '0 LTI', change: 'Zero Lost Time Incidents', isPositive: true, iconName: 'ShieldCheck', category: 'Safety' },
          { id: 'kpi_sf2', label: 'Safety Incidents', value: '0 Incidents', change: 'Target Zero', isPositive: true, iconName: 'ShieldAlert', category: 'Incidents' },
          { id: 'kpi_sf3', label: 'PPE Compliance Audit', value: 'Compliant', change: 'Shift Audit', isPositive: true, iconName: 'CheckCircle2', category: 'Compliance' },
          { id: 'kpi_sf4', label: 'Active Work Permits', value: '0 Active', change: 'Permit to Work', isPositive: true, iconName: 'FileText', category: 'Permits' },
        ],
        tasks: [],
        approvals: [],
        quickActions: [],
        pinnedReports: [],
        pinnedDashboards: [],
        notifications: [],
        gridData: [],
        gridColumns: [
          { key: 'id', header: 'Log ID' },
          { key: 'date', header: 'Date' },
          { key: 'status', header: 'Status' },
        ],
      };

    case 'ADMINISTRATION':
    default:
      return {
        id: 'ADMINISTRATION',
        name: 'Administration & System Workspace',
        code: 'WS_ADMIN',
        title: 'System Administration, ABAC/RBAC & Audit Workspace',
        description: 'System security configuration, Attribute-Based Access Control (ABAC), RBAC permission matrix, ERP module registry, and audit trail.',
        icon: 'ShieldCheck',
        defaultRoleMapping: 'ADMIN',
        themeColor: 'purple',
        todaysWorkCount: 0,
        kpis: [
          { id: 'kpi_ad1', label: 'Provisioned ERP Users', value: '0 Users', change: 'User Directory', isPositive: true, iconName: 'Users', category: 'Security' },
          { id: 'kpi_ad2', label: 'Security Roles Active', value: '8 Roles', change: 'RBAC Enforced', isPositive: true, iconName: 'ShieldCheck', category: 'Security' },
          { id: 'kpi_ad3', label: 'ABAC Access Policies', value: 'Enforced', change: 'Row/Field Level Policy', isPositive: true, iconName: 'Lock', category: 'ABAC' },
          { id: 'kpi_ad4', label: 'System Health', value: '100% Operational', change: 'Zero Outages', isPositive: true, iconName: 'Activity', category: 'System' },
        ],
        tasks: [],
        approvals: [],
        quickActions: [
          { id: 'qa_ad1', label: 'Manage ABAC Policies', iconName: 'ShieldCheck', actionType: 'MANAGE_ABAC', targetTab: 'admin', description: 'Configure fine-grained security rules & attributes' },
        ],
        pinnedReports: [
          { id: 'rpt_ad1', title: 'Enterprise Security Audit & Access Control Log', code: 'RPT_SEC_AUDIT', type: 'ADMIN_AUDIT', lastGenerated: 'Live' },
        ],
        pinnedDashboards: [
          { id: 'dash_ad1', title: 'System Security & ABAC Administration Board', widgetsCount: 8, category: 'Admin' },
        ],
        notifications: [],
        gridData: [],
        gridColumns: [
          { key: 'id', header: 'User ID', width: '100px' },
          { key: 'name', header: 'Full Name' },
          { key: 'email', header: 'Email Address' },
          { key: 'role', header: 'Role' },
          { key: 'department', header: 'Department' },
          { key: 'project', header: 'Assigned Project' },
          { key: 'status', header: 'Status' },
        ],
      };
  }
}

// Map of default workspace configurations for backward compatibility
export const WORKSPACE_CONFIGS: Record<WorkspaceId, WorkspaceConfig> = {
  EXECUTIVE: getWorkspaceConfig('EXECUTIVE'),
  MANAGING_DIRECTOR: getWorkspaceConfig('MANAGING_DIRECTOR'),
  GENERAL_MANAGER: getWorkspaceConfig('GENERAL_MANAGER'),
  PROJECT_MANAGER: getWorkspaceConfig('PROJECT_MANAGER'),
  PROJECT_ENGINEER: getWorkspaceConfig('PROJECT_ENGINEER'),
  SITE_ENGINEER: getWorkspaceConfig('SITE_ENGINEER'),
  STORE_OPERATIONS: getWorkspaceConfig('STORE_OPERATIONS'),
  PROCUREMENT: getWorkspaceConfig('PROCUREMENT'),
  HR: getWorkspaceConfig('HR'),
  FLEET: getWorkspaceConfig('FLEET'),
  QA_QC: getWorkspaceConfig('QA_QC'),
  SAFETY: getWorkspaceConfig('SAFETY'),
  ADMINISTRATION: getWorkspaceConfig('ADMINISTRATION'),
};
