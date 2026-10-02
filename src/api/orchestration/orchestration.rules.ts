// ============================================================================
// PHASE 75: ENTERPRISE ERP ORCHESTRATION - RULES & CORRELATION ENGINE
// ============================================================================

import {
  DomainEventRecord,
  CorrelatedAlertItem,
  ProjectHealthScorecard,
  ProjectHealthStatus,
  RiskLevel,
  EventSeverity,
  SourceModule,
} from './orchestration.types';

export class OrchestrationRulesEngine {
  /**
   * Correlates discrete domain events across modules into contextual alerts
   */
  public static correlateEvents(events: DomainEventRecord[]): CorrelatedAlertItem[] {
    const alerts: CorrelatedAlertItem[] = [];

    // Check for Critical Path Vendor PO Delay
    const poDelays = events.filter((e) => e.eventType === 'PO_DELIVERY_DELAYED' || e.sourceModule === 'PROCUREMENT');
    if (poDelays.length > 0) {
      alerts.push({
        id: 'alert-corr-002',
        title: 'Critical Path Material Delivery Delay impacting Milestone MS-04',
        severity: 'CRITICAL',
        status: 'ACTIVE',
        sourceModules: ['PROCUREMENT', 'PROJECT_CONTROLS', 'INVENTORY'],
        impactAssessment:
          'Delayed supply of 1200mm DI Flanges directly threatens hydrostatic testing schedule on Sector 4 with zero float margin.',
        recommendedAction: 'Expedite alternative approved vendor or approve inter-site inventory transfer from Dubai yard.',
        correlatedEventIds: poDelays.map((e) => e.id),
        projectId: 'PRJ-101',
        detectedAt: new Date().toISOString(),
      });
    }

    // Check for SCADA equipment anomalies
    const scadaEvents = events.filter((e) => e.eventType.includes('SCADA') || e.sourceModule === 'SCADA' || e.sourceModule === 'IOT');
    if (scadaEvents.length > 0) {
      alerts.push({
        id: 'alert-corr-001',
        title: 'Booster Pump Station 02 Radial Vibration & Thermal Spike',
        severity: 'HIGH',
        status: 'ACTIVE',
        sourceModules: ['SCADA', 'EAM', 'IOT'],
        impactAssessment:
          'Vibration amplitude exceeded 11.2 mm/s RMS threshold on Booster Pump 2A. Risk of severe mechanical seal degradation.',
        recommendedAction: 'Issue priority preventive maintenance work order for mechanical bearing alignment inspection.',
        correlatedEventIds: scadaEvents.map((e) => e.id),
        projectId: 'PRJ-101',
        detectedAt: new Date().toISOString(),
      });
    }

    // Check for Quality NCR / Hold point events
    const qaqcEvents = events.filter((e) => e.eventType.includes('NCR') || e.sourceModule === 'QAQC');
    if (qaqcEvents.length > 0) {
      alerts.push({
        id: 'alert-corr-003',
        title: 'Quality Hold-Point Rejection on Trench Backfill Compaction',
        severity: 'HIGH',
        status: 'ACTIVE',
        sourceModules: ['QAQC', 'PROJECT_CONTROLS'],
        impactAssessment: 'Compaction test failed 95% Proctor density requirement on chainage 12+400 to 12+800.',
        recommendedAction: 'Re-excavate and re-compact sub-base in accordance with specification C-401.',
        correlatedEventIds: qaqcEvents.map((e) => e.id),
        projectId: 'PRJ-101',
        detectedAt: new Date().toISOString(),
      });
    }

    // Check for Safety PTW / Incident events
    const hseEvents = events.filter((e) => e.eventType.includes('PERMIT') || e.eventType.includes('SAFETY') || e.sourceModule === 'HSE');
    if (hseEvents.length > 0) {
      alerts.push({
        id: 'alert-corr-004',
        title: 'Confined Space Permit to Work PTW-2026-118 Expired',
        severity: 'CRITICAL',
        status: 'ACTIVE',
        sourceModules: ['HSE', 'PROJECTS'],
        impactAssessment: 'Underground chamber deep excavation activities halted due to lapsed atmospheric gas clearance certificate.',
        recommendedAction: 'Perform fresh multi-gas detector testing (O2, H2S, LEL) and re-certify PTW with HSE officer.',
        correlatedEventIds: hseEvents.map((e) => e.id),
        projectId: 'PRJ-102',
        detectedAt: new Date().toISOString(),
      });
    }

    return alerts;
  }

  /**
   * Computes multi-dimensional project health scorecard based on EVM and cross-module metrics
   */
  public static calculateProjectHealth(params: {
    projectId: string;
    projectName?: string;
    cpi?: number;
    spi?: number;
    delayedCriticalPosCount?: number;
    openCriticalNcrsCount?: number;
    hseIncidentsCount?: number;
    equipmentDowntimeHours?: number;
  }): ProjectHealthScorecard {
    const cpi = params.cpi ?? 1.0;
    const spi = params.spi ?? 1.0;
    const delayedPos = params.delayedCriticalPosCount ?? 0;
    const openNcrs = params.openCriticalNcrsCount ?? 0;
    const hseIncidents = params.hseIncidentsCount ?? 0;
    const eqDowntime = params.equipmentDowntimeHours ?? 0;

    // Calculate dimension scores (0-100)
    const costScore = Math.min(100, Math.max(20, Math.round(cpi * 100)));
    const scheduleScore = Math.min(100, Math.max(20, Math.round(spi * 100)));
    const qualityScore = Math.max(20, 100 - openNcrs * 15);
    const safetyScore = Math.max(20, 100 - hseIncidents * 25);
    const procurementScore = Math.max(20, 100 - delayedPos * 20);

    // Weighted overall score
    const overallScore = Math.round(
      scheduleScore * 0.25 + costScore * 0.25 + qualityScore * 0.2 + safetyScore * 0.15 + procurementScore * 0.15
    );

    let overallStatus: ProjectHealthStatus = 'GREEN';
    let riskLevel: RiskLevel = 'LOW';

    if (overallScore < 60 || hseIncidents > 1 || openNcrs > 2) {
      overallStatus = 'CRITICAL';
      riskLevel = 'CRITICAL';
    } else if (overallScore < 75 || spi < 0.9 || cpi < 0.9) {
      overallStatus = 'RED';
      riskLevel = 'HIGH';
    } else if (overallScore < 88 || spi < 0.95 || cpi < 0.95) {
      overallStatus = 'AMBER';
      riskLevel = 'MEDIUM';
    }

    const keyRisks: string[] = [];
    if (spi < 0.92) keyRisks.push(`Schedule slippage: SPI ${(spi).toFixed(2)} below threshold`);
    if (cpi < 0.92) keyRisks.push(`Cost variance overrun: CPI ${(cpi).toFixed(2)} under budget efficiency`);
    if (delayedPos > 0) keyRisks.push(`${delayedPos} critical procurement item(s) delayed on supply chain`);
    if (openNcrs > 0) keyRisks.push(`${openNcrs} open QA/QC non-conformance hold point(s)`);
    if (hseIncidents > 0) keyRisks.push(`${hseIncidents} safety permit compliance flag(s) active`);
    if (keyRisks.length === 0) keyRisks.push('All engineering, procurement and construction dimensions nominal');

    return {
      projectId: params.projectId,
      projectName: params.projectName || `Project ${params.projectId}`,
      overallScore,
      overallStatus,
      riskLevel,
      dimensionScores: {
        schedule: scheduleScore,
        cost: costScore,
        quality: qualityScore,
        safety: safetyScore,
        procurement: procurementScore,
      },
      keyRisks,
      recentAlertsCount: delayedPos + openNcrs + hseIncidents,
      lastEvaluatedAt: new Date().toISOString(),
    };
  }
}
