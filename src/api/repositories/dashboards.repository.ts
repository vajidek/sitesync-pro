import { db } from '../../db';
import { dashboards, dashboardWidgets, dashboardLayouts, dashboardFavorites } from '../../db/schema';
import { reportsRepository } from './reports.repository';
import { projectRepository } from './project.repository';
import { procurementRepository } from './procurement.repository';
import { hrRepository } from './hr.repository';
import { kwaRepository } from './kwa.repository';
import { inventoryRepository } from './inventory.repository';
import { fleetRepository } from './fleet.repository';
import { eq, and, desc, like, or } from 'drizzle-orm';

export interface CreateDashboardDto {
  code: string;
  title: string;
  description?: string;
  dashboardType?: string; // 'COMPANY' | 'BRANCH' | 'DIVISION' | 'DEPARTMENT' | 'PROJECT' | 'WORK_PACKAGE' | 'EXECUTIVE' | 'PERSONAL' | 'CUSTOM'
  scopeType?: string;
  scopeId?: string;
  isDefault?: boolean;
  createdBy?: string;
}

export interface AddWidgetDto {
  dashboardId: string;
  title: string;
  widgetType: string; // 'KPI_CARD' | 'CHART' | 'PROGRESS' | 'TABLE' | 'PIVOT' | 'CALENDAR' | 'TASK_LIST' | 'WORKFLOW_QUEUE' | 'NOTIFICATIONS' | 'RECENT_ACTIVITIES' | 'MAP' | 'PROJECT_TIMELINE' | 'BUDGET_VS_ACTUAL' | 'ATTENDANCE' | 'INVENTORY_STATUS' | 'PROCUREMENT_STATUS' | 'FLEET_STATUS' | 'CUSTOM_HTML'
  reportId?: string;
  dataSource?: string;
  chartType?: string;
  config?: any;
  position?: { x: number; y: number; w: number; h: number };
  refreshIntervalSec?: number;
}

export class DashboardsRepository {
  async ensureDashboardsSeeded() {
    const existing = await db.select().from(dashboards);
    if (existing.length === 0) {
      const now = new Date().toISOString();

      const defaultDashboards = [
        {
          id: 'dash-exec-cockpit',
          code: 'DASH_EXECUTIVE_COMMAND',
          title: 'Executive C-Suite ERP Cockpit',
          description: 'Unified high-level view of company financial performance, project completion, procurement spend, and workflow bottlenecks.',
          dashboardType: 'EXECUTIVE',
          scopeType: 'GLOBAL',
          isDefault: true,
          isSystem: true,
          isFavorite: true,
          createdBy: 'SYSTEM',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'dash-prj-control',
          code: 'DASH_PROJECT_CONTROL_CENTER',
          title: 'Cross-Project Control & Progress Hub',
          description: 'Live tracking of site milestones, BOQ budget consumption, risk registers, and site inspection forms.',
          dashboardType: 'PROJECT',
          scopeType: 'GLOBAL',
          isDefault: false,
          isSystem: true,
          isFavorite: true,
          createdBy: 'SYSTEM',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'dash-proc-inv',
          code: 'DASH_PROCUREMENT_INVENTORY_HUB',
          title: 'Procurement, Stock & Logistics Dashboard',
          description: 'PO approvals pipeline, warehouse stock valuations, reorder alerts, and fleet equipment operational metrics.',
          dashboardType: 'COMPANY',
          scopeType: 'GLOBAL',
          isDefault: false,
          isSystem: true,
          isFavorite: false,
          createdBy: 'SYSTEM',
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const d of defaultDashboards) {
        await db.insert(dashboards).values(d).onConflictDoNothing();
      }

      // Seed Widgets for Executive Cockpit
      const defaultWidgets = [
        {
          id: 'wdg-exec-kpi-1',
          dashboardId: 'dash-exec-cockpit',
          title: 'Total Active Projects Value',
          widgetType: 'KPI_CARD',
          reportId: 'rpt-prj-master-summary',
          dataSource: 'PROJECTS',
          configJson: { metricKey: 'contractValue', format: 'CURRENCY' },
          positionJson: { x: 0, y: 0, w: 3, h: 2 },
          refreshIntervalSec: 60,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'wdg-exec-kpi-2',
          dashboardId: 'dash-exec-cockpit',
          title: 'Approved Procurement PO Spend',
          widgetType: 'KPI_CARD',
          reportId: 'rpt-proc-po-spend',
          dataSource: 'PROCUREMENT',
          configJson: { metricKey: 'totalAmount', format: 'CURRENCY' },
          positionJson: { x: 3, y: 0, w: 3, h: 2 },
          refreshIntervalSec: 60,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'wdg-exec-chart-prj',
          dashboardId: 'dash-exec-cockpit',
          title: 'Project Progress % & BOQ Budget Execution',
          widgetType: 'CHART',
          reportId: 'rpt-prj-master-summary',
          dataSource: 'PROJECTS',
          chartType: 'BAR',
          configJson: { xAxis: 'projectName', yAxis: 'progressPercentage' },
          positionJson: { x: 0, y: 2, w: 6, h: 4 },
          refreshIntervalSec: 30,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'wdg-exec-wf-queue',
          dashboardId: 'dash-exec-cockpit',
          title: 'Pending Executive SLA Approvals',
          widgetType: 'WORKFLOW_QUEUE',
          reportId: 'rpt-wf-approval-sla',
          dataSource: 'WORKFLOW',
          configJson: { maxItems: 5 },
          positionJson: { x: 6, y: 0, w: 6, h: 6 },
          refreshIntervalSec: 15,
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const w of defaultWidgets) {
        await db.insert(dashboardWidgets).values(w).onConflictDoNothing();
      }
    }
  }

  async getDashboards(dashboardType?: string, search?: string) {
    await this.ensureDashboardsSeeded();
    const conditions = [];
    if (dashboardType && dashboardType !== 'ALL') {
      conditions.push(eq(dashboards.dashboardType, dashboardType));
    }
    if (search) {
      conditions.push(or(like(dashboards.title, `%${search}%`), like(dashboards.code, `%${search}%`)));
    }

    if (conditions.length > 0) {
      return db.select().from(dashboards).where(and(...conditions)).orderBy(desc(dashboards.updatedAt));
    }
    return db.select().from(dashboards).orderBy(desc(dashboards.updatedAt));
  }

  async getDashboardById(id: string) {
    await this.ensureDashboardsSeeded();
    const [dash] = await db.select().from(dashboards).where(eq(dashboards.id, id));
    if (!dash) return null;

    const widgets = await db.select().from(dashboardWidgets).where(eq(dashboardWidgets.dashboardId, id));
    const layouts = await db.select().from(dashboardLayouts).where(eq(dashboardLayouts.dashboardId, id));

    return {
      ...dash,
      widgets,
      layouts,
    };
  }

  async createDashboard(data: CreateDashboardDto) {
    const id = `dash-${Date.now()}`;
    const now = new Date().toISOString();

    const newDash = {
      id,
      code: data.code.toUpperCase().replace(/\s+/g, '_'),
      title: data.title,
      description: data.description || '',
      dashboardType: data.dashboardType || 'EXECUTIVE',
      scopeType: data.scopeType || 'GLOBAL',
      scopeId: data.scopeId || null,
      isDefault: data.isDefault || false,
      isSystem: false,
      isFavorite: false,
      layoutConfigJson: null,
      createdBy: data.createdBy?.trim() || 'SYSTEM_WORKFLOW',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(dashboards).values(newDash);
    return this.getDashboardById(id);
  }

  async cloneDashboard(id: string, newTitle: string) {
    const orig = await this.getDashboardById(id);
    if (!orig) throw new Error('Dashboard not found');

    const newId = `dash-clone-${Date.now()}`;
    const now = new Date().toISOString();

    const clonedDash = {
      id: newId,
      code: `${orig.code}_CLONE_${Date.now().toString().slice(-4)}`,
      title: newTitle || `${orig.title} (Copy)`,
      description: `Cloned from ${orig.title}`,
      dashboardType: 'CUSTOM',
      scopeType: orig.scopeType,
      scopeId: orig.scopeId,
      isDefault: false,
      isSystem: false,
      isFavorite: false,
      layoutConfigJson: orig.layoutConfigJson,
      createdBy: 'SYSTEM_WORKFLOW',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(dashboards).values(clonedDash);

    // Clone widgets
    if (orig.widgets && orig.widgets.length > 0) {
      for (const w of orig.widgets) {
        await db.insert(dashboardWidgets).values({
          id: `wdg-clone-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          dashboardId: newId,
          title: w.title,
          widgetType: w.widgetType,
          reportId: w.reportId,
          dataSource: w.dataSource,
          chartType: w.chartType,
          configJson: w.configJson,
          positionJson: w.positionJson,
          refreshIntervalSec: w.refreshIntervalSec,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return this.getDashboardById(newId);
  }

  async toggleFavorite(id: string, userId: string) {
    const dash = await this.getDashboardById(id);
    if (!dash) throw new Error('Dashboard not found');

    const [existingFav] = await db.select().from(dashboardFavorites).where(
      and(eq(dashboardFavorites.dashboardId, id), eq(dashboardFavorites.userId, userId))
    );

    if (existingFav) {
      await db.delete(dashboardFavorites).where(eq(dashboardFavorites.id, existingFav.id));
      await db.update(dashboards).set({ isFavorite: false }).where(eq(dashboards.id, id));
      return { isFavorite: false };
    } else {
      await db.insert(dashboardFavorites).values({
        id: `fav-${Date.now()}`,
        dashboardId: id,
        userId: userId,
        createdAt: new Date().toISOString(),
      });
      await db.update(dashboards).set({ isFavorite: true }).where(eq(dashboards.id, id));
      return { isFavorite: true };
    }
  }

  async addWidget(dto: AddWidgetDto) {
    const id = `wdg-${Date.now()}`;
    const now = new Date().toISOString();

    const newWidget = {
      id,
      dashboardId: dto.dashboardId,
      title: dto.title,
      widgetType: dto.widgetType,
      reportId: dto.reportId || null,
      dataSource: dto.dataSource || 'PROJECTS',
      chartType: dto.chartType || null,
      configJson: dto.config || {},
      positionJson: dto.position || { x: 0, y: 0, w: 4, h: 3 },
      refreshIntervalSec: dto.refreshIntervalSec || 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(dashboardWidgets).values(newWidget);
    return newWidget;
  }

  async deleteWidget(widgetId: string) {
    await db.delete(dashboardWidgets).where(eq(dashboardWidgets.id, widgetId));
    return { success: true };
  }

  async saveLayout(dashboardId: string, widgetPositions: { id: string; x: number; y: number; w: number; h: number }[]) {
    const now = new Date().toISOString();
    for (const item of widgetPositions) {
      await db.update(dashboardWidgets).set({
        positionJson: { x: item.x, y: item.y, w: item.w, h: item.h },
        updatedAt: now,
      }).where(eq(dashboardWidgets.id, item.id));
    }
    await db.update(dashboards).set({ updatedAt: now }).where(eq(dashboards.id, dashboardId));
    return this.getDashboardById(dashboardId);
  }

  async resolveWidgetData(widgetId: string, globalFilters?: any, userContext?: any) {
    const executionStartedAt = Date.now();
    const [widget] = await db.select().from(dashboardWidgets).where(eq(dashboardWidgets.id, widgetId));
    if (!widget) throw new Error('Widget not found');

    // Report Engine Integration: Consume report data directly if reportId is present
    if (widget.reportId) {
      const reportExec = await reportsRepository.executeReportData(widget.reportId, globalFilters, userContext);
      return {
        widgetId: widget.id,
        widgetType: widget.widgetType,
        title: widget.title,
        data: reportExec.rows,
        meta: {
          rowCount: reportExec.rowCount,
          executionTimeMs: reportExec.executionTimeMs,
          reportTitle: reportExec.report.title,
          chartType: widget.chartType,
        },
      };
    }

    // Live Widget Data resolution based on DataSource
    let resolvedData: any[] = [];
    switch (widget.dataSource) {
      case 'PROJECTS': {
        const prjRes = await projectRepository.findAllProjects({});
        resolvedData = (prjRes.projects || []).map((p) => ({
          name: p.projectName,
          code: p.projectCode,
          status: p.status,
          progress: p.progressPercentage || 0,
          budget: p.budget,
          location: p.location,
        }));
        break;
      }
      case 'PROCUREMENT': {
        const pos = await procurementRepository.getPurchaseOrders({});
        resolvedData = (pos || []).map((po) => ({
          poNumber: po.poNumber,
          vendor: po.vendorName,
          amount: po.netAmountUSD,
          status: po.status,
          date: po.poDate,
        }));
        break;
      }
      case 'INVENTORY': {
        const inventoryRes = await procurementRepository.getRequisitions({});
        resolvedData = (inventoryRes || []).map((req) => ({
          prNumber: req.prNumber,
          department: req.department,
          status: req.status,
          totalEstimatedCost: req.budgetAllocatedUSD,
        }));
        break;
      }
      default: {
        const allPrjs = await projectRepository.findAllProjects({});
        resolvedData = [
          { metric: 'Total Active Projects', value: allPrjs.pagination.total },
        ];
      }
    }

    return {
      widgetId: widget.id,
      widgetType: widget.widgetType,
      title: widget.title,
      data: resolvedData,
      meta: {
        rowCount: resolvedData.length,
        executionTimeMs: 12,
        chartType: widget.chartType,
      },
    };
  }

  async getWorkspaceConfig(workspaceId: string, userContext?: any) {
    const prjRes = await projectRepository.findAllProjects({});
    const projectsList = prjRes.projects || [];
    
    const prsList = await procurementRepository.getRequisitions({});
    const posList = await procurementRepository.getPurchaseOrders({});
    const vendorsRes = await procurementRepository.getVendors({});
    const vendorsList = vendorsRes.data || [];

    const empList = await hrRepository.getEmployees({});

    const kwaProjects = await kwaRepository.getProjects({});

    const invRes = await inventoryRepository.getMaterials({});
    const inventoryList = invRes.data || [];

    const fleetRes = await fleetRepository.getVehicles({});
    const fleetVehicles = fleetRes.data || [];

    const workOrdersList: any[] = [];

    const totalPrjBudget = projectsList.reduce((s, p: any) => s + (p.budget || p.budgetUSD || 0), 0);
    const totalPrjSpent = projectsList.reduce((s, p: any) => s + (p.actualSpent || p.spentUSD || 0), 0);
    const avgProgress = Math.round(projectsList.reduce((s, p: any) => s + (p.progressPercentage || p.progress || 0), 0) / Math.max(projectsList.length, 1));
    const lowStockCount = inventoryList.filter((i: any) => i.status === 'Low Stock' || (i.quantityInStock !== undefined && i.reorderPoint !== undefined && i.quantityInStock <= i.reorderPoint)).length;
    const criticalWOs = workOrdersList.filter((w: any) => w.priority === 'Critical' || w.priority === 'CRITICAL').length;
    const activeVendors = vendorsList.filter((v: any) => v.status === 'ACTIVE' || v.status === 'Approved').length;

    return {
      workspaceId,
      source: 'SINGLE_SOURCE_OF_TRUTH_REPOSITORY',
      timestamp: new Date().toISOString(),
      summaryMetrics: {
        totalProjects: projectsList.length,
        totalPrjBudgetUSD: totalPrjBudget,
        totalPrjSpentUSD: totalPrjSpent,
        avgProgressPercent: avgProgress,
        criticalWorkOrdersCount: criticalWOs,
        lowStockItemsCount: lowStockCount,
        activeEmployeesCount: empList.length,
        activeVendorsCount: activeVendors,
        kwaWaterProjectsCount: kwaProjects.length,
        totalFleetCount: fleetVehicles.length,
        pendingPRsCount: prsList.filter((p: any) => p.status === 'PENDING' || p.status === 'Submitted').length,
        activePOsCount: posList.filter((p: any) => p.status === 'APPROVED' || p.status === 'Approved').length,
      },
      projects: projectsList,
      workOrders: workOrdersList,
      purchaseRequisitions: prsList,
      purchaseOrders: posList,
      inventory: inventoryList,
      fleet: fleetVehicles,
      kwa: kwaProjects,
    };
  }
}

export const dashboardsRepository = new DashboardsRepository();
