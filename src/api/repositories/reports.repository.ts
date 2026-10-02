import { db } from '../../db';
import {
  reports,
  reportSchedules,
  reportExecutionLogs,
  projects,
  companies,
  employees,
  procurementPurchaseOrdersTable,
  formSubmissions,
  auditLogs,
  workflows,
} from '../../db/schema';
import { eq, and, desc, like, or } from 'drizzle-orm';
import { legacyProcurementTelemetry } from '../telemetry/legacy_procurement.telemetry';

export interface CreateReportDto {
  code: string;
  title: string;
  description?: string;
  dataSource: string; // 'PROJECTS' | 'ORGANIZATION' | 'EMPLOYEES' | 'PROCUREMENT' | 'INVENTORY' | 'FLEET' | 'WORKFLOW' | 'FORMS' | 'AUDIT'
  reportType: string; // 'TABULAR' | 'GROUPED' | 'SUMMARY' | 'PIVOT' | 'CHARTS' | 'GANTT' | 'FINANCIAL'
  columns: any[];
  filters?: any;
  chartConfig?: any;
}

export interface ScheduleReportDto {
  reportId: string;
  cronExpression: string;
  recipientEmails: string[];
  exportFormat: string;
}

export class ReportsRepository {
  async ensureReportsSeeded() {
    const existing = await db.select().from(reports);
    if (existing.length === 0) {
      const now = new Date().toISOString();

      const defaultReports = [
        {
          id: 'rpt-prj-master-summary',
          code: 'RPT_PROJECT_EXECUTIVE_SUMMARY',
          title: 'Executive Project Progress & BOQ Budget Report',
          description: 'Comprehensive cross-company project progress, financial budgets, BOQ utilization, and completion dates.',
          dataSource: 'PROJECTS',
          reportType: 'SUMMARY',
          columnsJson: [
            { key: 'projectCode', label: 'Project Code' },
            { key: 'projectName', label: 'Project Name' },
            { key: 'status', label: 'Status' },
            { key: 'progressPercentage', label: 'Progress %' },
            { key: 'contractValue', label: 'Contract Value (USD)' },
            { key: 'spentAmount', label: 'Spent Budget' },
          ],
          filtersJson: { companyId: 'ALL', status: 'ACTIVE' },
          chartConfigJson: { type: 'BAR', xAxis: 'projectName', yAxis: 'progressPercentage' },
          isFavorite: true,
          isScheduled: true,
          scheduleFrequency: 'DAILY',
          createdBy: 'SYSTEM',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'rpt-proc-po-spend',
          code: 'RPT_PROCUREMENT_PO_AUDIT',
          title: 'Procurement PO Spend & Supplier Performance',
          description: 'Tracks purchase order costs, vendor deliverables, approval statuses, and GRN delivery timelines.',
          dataSource: 'PROCUREMENT',
          reportType: 'TABULAR',
          columnsJson: [
            { key: 'poNumber', label: 'PO #' },
            { key: 'vendorName', label: 'Vendor' },
            { key: 'totalAmount', label: 'Total Value' },
            { key: 'status', label: 'Approval Status' },
            { key: 'createdAt', label: 'Issue Date' },
          ],
          filtersJson: { status: 'APPROVED' },
          isFavorite: true,
          isScheduled: false,
          createdBy: 'SYSTEM',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'rpt-inv-stock-valuation',
          code: 'RPT_INVENTORY_STOCK_VALUATION',
          title: 'Warehouse Material Stock & Reorder Point Matrix',
          description: 'Live inventory stock valuation, stock-out alerts, batch tracking, and min-reorder levels.',
          dataSource: 'INVENTORY',
          reportType: 'PIVOT',
          columnsJson: [
            { key: 'itemCode', label: 'Item Code' },
            { key: 'itemName', label: 'Item Name' },
            { key: 'category', label: 'Category' },
            { key: 'quantityOnHand', label: 'Available Stock' },
            { key: 'unitPrice', label: 'Unit Rate' },
            { key: 'totalValue', label: 'Stock Valuation' },
          ],
          filtersJson: {},
          isFavorite: false,
          isScheduled: true,
          scheduleFrequency: 'WEEKLY',
          createdBy: 'SYSTEM',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'rpt-hr-employee-payroll',
          code: 'RPT_HR_HEADCOUNT_PAYROLL',
          title: 'HR Employee Headcount & Monthly Payroll Allocation',
          description: 'Site staff headcount distribution across branches, departments, and project cost centers.',
          dataSource: 'EMPLOYEES',
          reportType: 'GROUPED',
          columnsJson: [
            { key: 'employeeCode', label: 'Emp ID' },
            { key: 'name', label: 'Employee Name' },
            { key: 'designationId', label: 'Designation ID' },
            { key: 'departmentId', label: 'Department ID' },
            { key: 'phone', label: 'Phone' },
          ],
          filtersJson: {},
          isFavorite: true,
          isScheduled: false,
          createdBy: 'SYSTEM',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'rpt-wf-approval-sla',
          code: 'RPT_WORKFLOW_APPROVAL_BOTTLENECKS',
          title: 'Workflow SLA & Approval Bottleneck Analysis',
          description: 'Audit report analyzing approval wait times across workflow nodes, pending tasks, and approvers.',
          dataSource: 'WORKFLOW',
          reportType: 'CHARTS',
          columnsJson: [
            { key: 'code', label: 'Workflow Code' },
            { key: 'name', label: 'Workflow Name' },
            { key: 'moduleCode', label: 'Module' },
            { key: 'entityName', label: 'Entity' },
            { key: 'isActive', label: 'Active Status' },
          ],
          filtersJson: {},
          chartConfigJson: { type: 'PIE', xAxis: 'code', yAxis: 'count' },
          isFavorite: false,
          isScheduled: false,
          createdBy: 'SYSTEM',
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const r of defaultReports) {
        await db.insert(reports).values(r).onConflictDoNothing();
      }
    }
  }

  async getReports(dataSource?: string, search?: string) {
    await this.ensureReportsSeeded();
    const conditions = [];
    if (dataSource && dataSource !== 'ALL') {
      conditions.push(eq(reports.dataSource, dataSource));
    }
    if (search) {
      conditions.push(or(like(reports.title, `%${search}%`), like(reports.code, `%${search}%`)));
    }

    if (conditions.length > 0) {
      return db.select().from(reports).where(and(...conditions)).orderBy(desc(reports.updatedAt));
    }
    return db.select().from(reports).orderBy(desc(reports.updatedAt));
  }

  async getReportById(id: string) {
    await this.ensureReportsSeeded();
    const [rpt] = await db.select().from(reports).where(eq(reports.id, id));
    if (!rpt) return null;

    const schedules = await db.select().from(reportSchedules).where(eq(reportSchedules.reportId, id));
    const logs = await db.select().from(reportExecutionLogs).where(eq(reportExecutionLogs.reportId, id)).orderBy(desc(reportExecutionLogs.timestamp)).limit(10);

    return {
      ...rpt,
      schedules,
      executionLogs: logs,
    };
  }

  async createReport(data: CreateReportDto) {
    const id = `rpt-${Date.now()}`;
    const now = new Date().toISOString();

    const newReport = {
      id,
      code: data.code.toUpperCase().replace(/\s+/g, '_'),
      title: data.title,
      description: data.description || '',
      dataSource: data.dataSource || 'PROJECTS',
      reportType: data.reportType || 'TABULAR',
      columnsJson: data.columns || [],
      filtersJson: data.filters || {},
      chartConfigJson: data.chartConfig || null,
      isFavorite: false,
      isScheduled: false,
      createdBy: 'ADMIN',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(reports).values(newReport);
    return this.getReportById(id);
  }

  async executeReportData(reportId: string, runtimeFilters?: any, userContext?: any) {
    const startTime = Date.now();
    const rpt = await this.getReportById(reportId);
    if (!rpt) throw new Error('Report not found');

    let rawData: any[] = [];

    // Dynamically query data based on DataSource
    switch (rpt.dataSource) {
      case 'PROJECTS': {
        const prjList = await db.select().from(projects);
        rawData = prjList.map((p) => ({
          projectCode: p.projectCode,
          projectName: p.projectName,
          status: p.status,
          progressPercentage: p.progressPercentage || 0,
          contractValue: p.budget || 5000000,
          spentAmount: (p.budget || 5000000) * ((p.progressPercentage || 0) / 100),
          companyId: p.companyId,
          createdAt: p.createdAt,
        }));
        break;
      }
      case 'ORGANIZATION': {
        const compList = await db.select().from(companies);
        rawData = compList.map((c) => ({
          code: c.code,
          name: c.name,
          taxId: c.taxId,
          currency: c.currency,
          status: c.isActive ? 'ACTIVE' : 'INACTIVE',
        }));
        break;
      }
      case 'EMPLOYEES': {
        const empList = await db.select().from(employees);
        rawData = empList.map((e) => ({
          employeeCode: e.employeeCode,
          name: e.name,
          designationId: e.designationId || 'DESG-ENG',
          departmentId: e.departmentId || 'DEPT-CIVIL',
          phone: e.phone,
        }));
        break;
      }
      case 'PROCUREMENT': {
        await legacyProcurementTelemetry.logEvent({
          eventType: 'LEGACY_READ_REDIRECTED',
          caller: 'ReportsRepository.executeReportData(PROCUREMENT)',
          legacyTarget: 'purchase_orders',
          activeTarget: 'procurement_purchase_orders',
          details: { reportId },
        });
        const poList = await db
          .select()
          .from(procurementPurchaseOrdersTable)
          .orderBy(desc(procurementPurchaseOrdersTable.createdAt));
        rawData = poList.map((po) => ({
          poNumber: po.poNumber,
          vendorName: po.vendorName,
          totalAmount: `$${Number(po.netAmountUSD || 0).toLocaleString()}`,
          status: po.status,
          createdAt: po.createdAt,
        }));
        break;
      }
      case 'INVENTORY': {
        rawData = [
          { itemCode: 'CEM-PPC-50KG', itemName: 'UltraTech PPC Cement 50kg', category: 'CEMENT', quantityOnHand: 4500, unitPrice: '$6.50', totalValue: '$29,250' },
          { itemCode: 'STL-FE550-16MM', itemName: 'TATA Tiscon TMT Steel 16mm', category: 'STEEL', quantityOnHand: 120, unitPrice: '$720.00', totalValue: '$86,400' },
          { itemCode: 'SND-RIVER-M3', itemName: 'Graded River Sand M-Sand', category: 'AGGREGATES', quantityOnHand: 850, unitPrice: '$28.00', totalValue: '$23,800' },
        ];
        break;
      }
      case 'FLEET': {
        rawData = [
          { vehicleCode: 'FLT-CAT-320D', makeModel: 'Caterpillar 320D Excavator', licensePlate: 'KA-05-EQ-9102', assignedDriverName: 'Suresh Kumar', status: 'OPERATIONAL', odometerReading: '12,450 hrs' },
          { vehicleCode: 'FLT-VOLVO-FMX', makeModel: 'Volvo FMX 440 Tipper Truck', licensePlate: 'TN-38-CT-4011', assignedDriverName: 'Ramesh Patel', status: 'OPERATIONAL', odometerReading: '84,100 km' },
        ];
        break;
      }
      case 'WORKFLOW': {
        const wfList = await db.select().from(workflows);
        rawData = wfList.map((wf) => ({
          code: wf.code,
          name: wf.name,
          moduleCode: wf.moduleCode,
          category: wf.category,
          isActive: wf.isEnabled ? 'ACTIVE' : 'INACTIVE',
        }));
        break;
      }
      case 'FORMS': {
        const subList = await db.select().from(formSubmissions);
        rawData = subList.map((sub) => ({
          submissionNumber: sub.submissionNumber,
          formId: sub.formId,
          submittedByUserName: sub.submittedByUserName,
          submittedByUserRole: sub.submittedByUserRole,
          status: sub.status,
          createdAt: sub.createdAt,
        }));
        break;
      }
      case 'AUDIT': {
        const logs = await db.select().from(auditLogs).limit(50);
        rawData = logs.map((l) => ({
          action: l.action,
          module: l.module,
          performedByName: l.userEmail || l.userId,
          performedByRole: l.userRole,
          timestamp: l.createdAt,
        }));
        break;
      }
      default: {
        rawData = [
          { code: 'RPT-001', name: 'Sample Item 1', metric: 100, status: 'ACTIVE' },
          { code: 'RPT-002', name: 'Sample Item 2', metric: 250, status: 'COMPLETED' },
        ];
      }
    }

    const duration = Date.now() - startTime;
    const now = new Date().toISOString();

    // Log execution
    await db.insert(reportExecutionLogs).values({
      id: `rel-${Date.now()}`,
      reportId: rpt.id,
      executedByUserId: userContext?.id || 'usr-admin',
      executedByUserName: userContext?.name || 'Platform Administrator',
      executionTimeMs: duration,
      rowCount: rawData.length,
      exportedFormat: runtimeFilters?.exportFormat || null,
      timestamp: now,
    });

    return {
      report: rpt,
      rows: rawData,
      rowCount: rawData.length,
      executionTimeMs: duration,
    };
  }

  async scheduleReport(data: ScheduleReportDto) {
    const id = `rsch-${Date.now()}`;
    const now = new Date().toISOString();

    const newSch = {
      id,
      reportId: data.reportId,
      cronExpression: data.cronExpression || '0 8 * * *',
      recipientEmailsJson: data.recipientEmails,
      exportFormat: data.exportFormat || 'PDF',
      lastRunAt: null,
      nextRunAt: new Date(Date.now() + 86400000).toISOString(),
      status: 'ACTIVE',
      createdAt: now,
    };

    await db.insert(reportSchedules).values(newSch);
    await db.update(reports).set({ isScheduled: true, scheduleFrequency: 'DAILY', updatedAt: now }).where(eq(reports.id, data.reportId));

    return newSch;
  }
}

export const reportsRepository = new ReportsRepository();
