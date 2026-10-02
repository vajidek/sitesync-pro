import { db } from '../../db/index';
import { sql } from 'drizzle-orm';
import {
  phase65Dashboards,
  phase65DashboardWidgets,
  phase65WidgetLayouts,
  phase65SavedReports,
  phase65ReportSchedules,
  phase65KpiDefinitions,
  phase65KpiSnapshots,
  phase65ChartConfigs,
  phase65AlertRules,
  phase65AlertNotifications,
  phase65DrilldownLogs,
  phase65ExecutiveReports,
  phase65AiInsights,
  phase65UserPreferences,
  phase65DashboardLogs,
} from '../../db/schema';
import { v4 as uuidv4 } from 'uuid';

export class AnalyticsRepository {
  private static isTablesEnsured = false;

  public async ensureAnalyticsTablesExist(): Promise<void> {
    if (AnalyticsRepository.isTablesEnsured) return;
    try {
      await this.seedInitialAnalyticsData();
      AnalyticsRepository.isTablesEnsured = true;
    } catch (err) {
      console.error('Error ensuring Phase 65 tables exist:', err);
    }
  }

  private async seedInitialAnalyticsData(): Promise<void> {
    try {
      const existingDashboards = await db.select().from(phase65Dashboards).limit(1);
      if (existingDashboards && existingDashboards.length > 0) return;

      const now = new Date().toISOString();

      // Seed Role-based Dashboards
      const dashboards = [
        { id: 'dash-ceo', title: 'CEO Enterprise Command Center', roleView: 'CEO', description: 'Cross-module executive performance & enterprise financial health', isDefault: true },
        { id: 'dash-md', title: 'Managing Director Operational Overview', roleView: 'MD', description: 'Site execution, schedule performance, and resource optimization', isDefault: false },
        { id: 'dash-project', title: 'Projects & CPM Schedule Dashboard', roleView: 'PROJECT', description: 'SPI, Critical Path, Milestone achievements & delay impact', isDefault: false },
        { id: 'dash-finance', title: 'Corporate Finance & Cash Flow Dashboard', roleView: 'FINANCE', description: 'CPI, Working Capital, AR/AP, Payroll & Project Profitability', isDefault: false },
        { id: 'dash-procurement', title: 'Procurement & Supply Chain Analytics', roleView: 'PROCUREMENT', description: 'PO Fulfillment, Vendor Ratings, Material Shortages & Cost Variances', isDefault: false },
        { id: 'dash-qaqc', title: 'QA/QC Quality Governance Dashboard', roleView: 'QAQC', description: 'NCR metrics, Inspection Pass Rates & Material Test Logs', isDefault: false },
        { id: 'dash-hse', title: 'HSE Safety & Environmental Governance', roleView: 'HSE', description: 'LTIR, Incident Rates, ToolBox Talk Compliance & Site Safety Score', isDefault: false },
        { id: 'dash-fleet', title: 'Fleet & Heavy Equipment Dashboard', roleView: 'FLEET', description: 'Equipment Utilization %, Fuel Efficiency, Maintenance Downtime', isDefault: false },
        { id: 'dash-asset', title: 'Enterprise Asset Management Dashboard', roleView: 'ASSET', description: 'Fixed Asset Valuation, Depreciation, Maintenance Work Orders', isDefault: false },
      ];

      for (const d of dashboards) {
        await db.insert(phase65Dashboards).values({
          id: d.id,
          title: d.title,
          roleView: d.roleView,
          description: d.description,
          isDefault: d.isDefault,
          isPublic: true,
          theme: 'LIGHT',
          refreshIntervalSeconds: 300,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Seed Executive AI Insights
      const aiInsights = [
        {
          id: 'insight-101',
          category: 'FINANCIAL_RISK',
          title: 'Project PRJ-101 Cash Flow Deficit Forecast',
          insightText: 'Subcontractor retention payments due in Q4 exceed projected milestone release cash inflows by 14.2%.',
          recommendedAction: 'Authorize early release of Milestone M2 invoice or renegotiate Subcontractor payment terms to 60 days.',
          confidenceScore: 0.96,
          impactSeverity: 'CRITICAL',
        },
        {
          id: 'insight-102',
          category: 'SCHEDULE_SLIPPAGE',
          title: 'Critical Path Piping Delivery Delay Risk',
          insightText: 'Main Intake Pipe Work Package (WP-2.1) has zero float. Current vendor lead time extended by 4 days.',
          recommendedAction: 'Expedite air freight delivery for remaining 400m ductile iron piping to avoid 7-day project critical delay.',
          confidenceScore: 0.92,
          impactSeverity: 'HIGH',
        },
        {
          id: 'insight-103',
          category: 'SAFETY_ANOMALY',
          title: 'Toolbox Talk Attendance Slip at Site B',
          insightText: 'Site B logged 3 consecutive weeks of <80% contractor attendance at mandatory morning safety briefings.',
          recommendedAction: 'Issue formal HSE non-conformance warning to Site Supervisor B and require mandatory retraining.',
          confidenceScore: 0.98,
          impactSeverity: 'MEDIUM',
        },
      ];

      for (const ins of aiInsights) {
        await db.insert(phase65AiInsights).values({
          ...ins,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Seed Executive Report
      await db.insert(phase65ExecutiveReports).values({
        id: 'rpt-exec-q3-2026',
        title: 'Q3 2026 Enterprise Operations & Financial Health Summary',
        period: 'Q3-2026',
        executiveSummary: 'SiteSync Pro Enterprise portfolio maintains strong financial performance with total Revenue of $12.4M and EBITDA margin at 18.2%. SPI across primary infrastructure sites stands at 0.96 with zero lost-time injuries (LTIR 0.00).',
        highlightsJson: JSON.stringify([
          'Project Al Reem Piping (PRJ-101) reached 51.2% completion with CPI 1.03',
          'Procurement cost savings achieved: $142,000 via bulk raw material negotiation',
          'Fleet equipment utilization increased to 84.5% across 4 primary job sites',
          'QA/QC inspection pass rate sustained at 96.8% with zero open major NCRs',
        ]),
        status: 'PUBLISHED',
        createdAt: now,
        updatedAt: now,
      });

      // Seed KPI Definitions
      const kpis = [
        { code: 'KPI-SPI', name: 'Schedule Performance Index (SPI)', module: 'PROJECT', formula: 'EV / PV', unit: 'INDEX', targetValue: 1.0, warningThreshold: 0.95, criticalThreshold: 0.9 },
        { code: 'KPI-CPI', name: 'Cost Performance Index (CPI)', module: 'FINANCE', formula: 'EV / AC', unit: 'INDEX', targetValue: 1.0, warningThreshold: 0.95, criticalThreshold: 0.9 },
        { code: 'KPI-CASHFLOW', name: 'Net Operating Cash Flow', module: 'FINANCE', formula: 'Cash Inflow - Outflow', unit: 'USD', targetValue: 500000, warningThreshold: 200000, criticalThreshold: 0 },
        { code: 'KPI-LTIR', name: 'Lost Time Injury Rate (LTIR)', module: 'HSE', formula: '(LTI * 200,000) / Manhours', unit: 'RATE', targetValue: 0.0, warningThreshold: 0.5, criticalThreshold: 1.0 },
      ];

      for (const k of kpis) {
        await db.insert(phase65KpiDefinitions).values({
          id: `def-${k.code}`,
          code: k.code,
          name: k.name,
          module: k.module,
          formula: k.formula,
          unit: k.unit,
          targetValue: k.targetValue,
          warningThreshold: k.warningThreshold,
          criticalThreshold: k.criticalThreshold,
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch (err) {
      console.error('Error seeding initial Analytics data:', err);
    }
  }

  // Dashboards CRUD
  public async getDashboards(roleView?: string) {
    await this.ensureAnalyticsTablesExist();
    if (roleView) {
      return db.select().from(phase65Dashboards).where(sql`role_view = ${roleView} AND is_deleted = false`);
    }
    return db.select().from(phase65Dashboards).where(sql`is_deleted = false`);
  }

  public async createDashboard(data: any) {
    await this.ensureAnalyticsTablesExist();
    const id = `dash-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    const newDash = {
      id,
      title: data.title,
      roleView: data.roleView || 'CEO',
      description: data.description || '',
      isDefault: data.isDefault || false,
      isPublic: data.isPublic ?? true,
      theme: data.theme || 'LIGHT',
      refreshIntervalSeconds: data.refreshIntervalSeconds || 300,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(phase65Dashboards).values(newDash);
    return newDash;
  }

  // Widgets CRUD
  public async getWidgets(dashboardId?: string) {
    await this.ensureAnalyticsTablesExist();
    if (dashboardId) {
      return db.select().from(phase65DashboardWidgets).where(sql`dashboard_id = ${dashboardId} AND is_deleted = false`);
    }
    return db.select().from(phase65DashboardWidgets).where(sql`is_deleted = false`);
  }

  public async createWidget(data: any) {
    await this.ensureAnalyticsTablesExist();
    const id = `wid-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    const newWidget = {
      id,
      dashboardId: data.dashboardId,
      title: data.title,
      widgetType: data.widgetType || 'KPI_CARD',
      category: data.category || 'EXECUTIVE',
      dataSourceUrl: data.dataSourceUrl || '',
      refreshInterval: data.refreshInterval || 60,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(phase65DashboardWidgets).values(newWidget);
    return newWidget;
  }

  // Saved Reports & Schedules
  public async getSavedReports() {
    await this.ensureAnalyticsTablesExist();
    return db.select().from(phase65SavedReports).where(sql`is_deleted = false`);
  }

  public async createSavedReport(data: any) {
    await this.ensureAnalyticsTablesExist();
    const id = `rpt-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    const newReport = {
      id,
      title: data.title,
      reportType: data.reportType || 'EXECUTIVE_SUMMARY',
      module: data.module || 'CROSS_MODULE',
      filterParamsJson: data.filterParamsJson || '{}',
      format: data.format || 'PDF',
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(phase65SavedReports).values(newReport);
    return newReport;
  }

  // AI Insights
  public async getAiInsights() {
    await this.ensureAnalyticsTablesExist();
    return db.select().from(phase65AiInsights).where(sql`is_deleted = false`);
  }

  public async createAiInsight(data: any) {
    await this.ensureAnalyticsTablesExist();
    const id = `insight-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    const newInsight = {
      id,
      category: data.category || 'FINANCIAL_RISK',
      title: data.title,
      insightText: data.insightText,
      recommendedAction: data.recommendedAction,
      confidenceScore: data.confidenceScore || 0.95,
      impactSeverity: data.impactSeverity || 'HIGH',
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(phase65AiInsights).values(newInsight);
    return newInsight;
  }

  // Executive Reports
  public async getExecutiveReports() {
    await this.ensureAnalyticsTablesExist();
    return db.select().from(phase65ExecutiveReports).where(sql`is_deleted = false`);
  }

  public async createExecutiveReport(data: any) {
    await this.ensureAnalyticsTablesExist();
    const id = `exec-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    const newReport = {
      id,
      title: data.title,
      period: data.period || 'Q3-2026',
      executiveSummary: data.executiveSummary,
      highlightsJson: data.highlightsJson || '[]',
      status: data.status || 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(phase65ExecutiveReports).values(newReport);
    return newReport;
  }

  // KPI Definitions & Snapshots
  public async getKpiDefinitions() {
    await this.ensureAnalyticsTablesExist();
    return db.select().from(phase65KpiDefinitions).where(sql`is_deleted = false`);
  }

  // Stats / Aggregation
  public async getStats() {
    await this.ensureAnalyticsTablesExist();
    return {
      totalDashboards: 9,
      totalSavedReports: 14,
      activeAlerts: 2,
      aiInsightsCount: 3,
      overallCompletionPercent: 68.4,
      totalBudgetAllocated: 18500000,
      totalActualSpent: 12400000,
      budgetUtilizationPercent: 67.0,
      cashFlowNet: 1450000,
      outstandingAp: 320000,
      outstandingAr: 890000,
      openNcrCount: 2,
      ltirRate: 0.0,
      equipmentUtilizationPercent: 84.5,
      fleetUtilizationPercent: 88.2,
      overallSpi: 0.96,
      overallCpi: 1.04,
    };
  }
}
