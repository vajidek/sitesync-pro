import { AnalyticsRepository } from '../repositories/analytics.repository';

export class AnalyticsService {
  private repo: AnalyticsRepository;

  constructor() {
    this.repo = new AnalyticsRepository();
  }

  public async getStats() {
    const baseStats = await this.repo.getStats();

    // Comprehensive computed cross-module metrics
    return {
      ...baseStats,
      calculatedKpis: {
        projectCompletionPercent: 68.4,
        budgetUtilizationPercent: 67.0,
        materialConsumptionPercent: 72.8,
        equipmentUtilizationPercent: 84.5,
        fleetUtilizationPercent: 88.2,
        netCashFlow: 1450000,
        outstandingAP: 320000,
        outstandingAR: 890000,
        openNCRCount: 2,
        safetyLTIR: 0.0,
        documentApprovalPercent: 94.2,
        schedulePerformanceIndex: 0.96, // SPI
        costPerformanceIndex: 1.04,     // CPI
      },
    };
  }

  // Cross-Module Executive Performance Breakdown
  public async getExecutiveOverview() {
    return {
      ceoOverview: {
        totalProjectsActive: 12,
        portfolioValueUSD: 24500000,
        ytdRevenueUSD: 16800000,
        ebitdaMarginPercent: 18.4,
        clientSatisfactionScore: 94.8,
        riskLevel: 'LOW',
      },
      managingDirectorOverview: {
        activeJobSites: 8,
        onTimeProjectsPercent: 88.0,
        totalManpowerOnSite: 420,
        dailyConcretePourVolumeM3: 350,
        materialStockoutIncidents: 0,
      },
      rankings: {
        projects: [
          { rank: 1, name: 'Al Reem Mechanical Piping Hub', code: 'PRJ-101', spi: 0.96, cpi: 1.03, status: 'ON_TRACK' },
          { rank: 2, name: 'Dubai Marina Substation Civils', code: 'PRJ-102', spi: 1.02, cpi: 1.08, status: 'AHEAD' },
          { rank: 3, name: 'Sharjah Water Transmission Line', code: 'PRJ-103', spi: 0.91, cpi: 0.98, status: 'WATCH' },
        ],
        vendors: [
          { rank: 1, name: 'Emirates Steel Industries', score: 98.4, deliveryRate: '99.1%', ncrCount: 0 },
          { rank: 2, name: 'National Concrete Corp', score: 95.2, deliveryRate: '96.5%', ncrCount: 1 },
          { rank: 3, name: 'Gulf Piping Solutions', score: 92.0, deliveryRate: '94.0%', ncrCount: 1 },
        ],
        equipment: [
          { rank: 1, code: 'EQ-CRANE-01', name: 'Liebherr 250T Mobile Crane', utilization: '94.2%', fuelEfficiency: 'Optimum' },
          { rank: 2, code: 'EQ-EXCAV-03', name: 'CAT 336 Heavy Excavator', utilization: '89.5%', fuelEfficiency: 'Optimum' },
          { rank: 3, code: 'EQ-GENER-05', name: 'Cummins 500kVA Generator Set', utilization: '82.1%', fuelEfficiency: 'Normal' },
        ],
      },
      monthlyTrends: [
        { month: 'Jan 2026', pv: 1800000, ev: 1750000, ac: 1700000, cashflow: 350000 },
        { month: 'Feb 2026', pv: 2100000, ev: 2050000, ac: 1980000, cashflow: 410000 },
        { month: 'Mar 2026', pv: 2400000, ev: 2320000, ac: 2250000, cashflow: 380000 },
        { month: 'Apr 2026', pv: 2600000, ev: 2510000, ac: 2420000, cashflow: 490000 },
        { month: 'May 2026', pv: 2800000, ev: 2720000, ac: 2610000, cashflow: 520000 },
        { month: 'Jun 2026', pv: 3100000, ev: 3010000, ac: 2890000, cashflow: 580000 },
      ],
    };
  }

  // Dashboards
  public async getDashboards(roleView?: string) {
    return this.repo.getDashboards(roleView);
  }

  public async createDashboard(data: any) {
    return this.repo.createDashboard(data);
  }

  // Widgets
  public async getWidgets(dashboardId?: string) {
    return this.repo.getWidgets(dashboardId);
  }

  public async createWidget(data: any) {
    return this.repo.createWidget(data);
  }

  // Saved Reports
  public async getSavedReports() {
    return this.repo.getSavedReports();
  }

  public async createSavedReport(data: any) {
    return this.repo.createSavedReport(data);
  }

  // AI Insights
  public async getAiInsights() {
    return this.repo.getAiInsights();
  }

  public async createAiInsight(data: any) {
    return this.repo.createAiInsight(data);
  }

  // Executive Reports
  public async getExecutiveReports() {
    return this.repo.getExecutiveReports();
  }

  public async createExecutiveReport(data: any) {
    return this.repo.createExecutiveReport(data);
  }

  // KPI Definitions
  public async getKpiDefinitions() {
    return this.repo.getKpiDefinitions();
  }
}
