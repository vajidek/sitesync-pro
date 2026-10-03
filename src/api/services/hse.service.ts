import { HSERepository } from '../repositories/hse.repository';

export class HSEService {
  private repo = new HSERepository();

  public async getDashboardStats() {
    return this.repo.getHSEStats();
  }

  // Incidents
  public async getIncidents() {
    return this.repo.getIncidents();
  }

  public async createIncident(data: any) {
    return this.repo.createIncident(data);
  }

  // Near Miss
  public async getNearMisses() {
    return this.repo.getNearMisses();
  }

  public async createNearMiss(data: any) {
    return this.repo.createNearMiss(data);
  }

  // Hazard Reports
  public async getHazardReports() {
    return this.repo.getHazardReports();
  }

  public async createHazardReport(data: any) {
    return this.repo.createHazardReport(data);
  }

  // Risk Assessment & Risk Matrix
  public async getRiskAssessments() {
    return this.repo.getRiskAssessments();
  }

  public async createRiskAssessment(data: any) {
    // Calculate Risk Score & Category from explicit assessed values only.
    const severity = Number(data.severity);
    const likelihood = Number(data.likelihood);
    if (!Number.isFinite(severity) || severity < 1 || severity > 5 || !Number.isFinite(likelihood) || likelihood < 1 || likelihood > 5) {
      throw new Error('Risk severity and likelihood (1–5) must be explicitly supplied.');
    }
    const riskScore = severity * likelihood;

    let riskCategory = 'MODERATE';
    if (riskScore <= 4) riskCategory = 'LOW';
    else if (riskScore <= 9) riskCategory = 'MODERATE';
    else if (riskScore <= 15) riskCategory = 'HIGH';
    else riskCategory = 'CRITICAL';

    return this.repo.createRiskAssessment({
      ...data,
      severity,
      likelihood,
      riskScore,
      riskCategory,
    });
  }

  public async reviewRiskAssessment(
    id: string,
    decision: 'ACTIVE' | 'REJECTED',
    actor: { userId: string; userName: string }
  ) {
    return this.repo.reviewRiskAssessment(id, decision, actor);
  }

  // Job Safety Analysis (JSA)
  public async getJsaList() {
    return this.repo.getJsaList();
  }

  public async createJsa(data: any) {
    return this.repo.createJsa(data);
  }

  public async reviewJsa(
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    actor: { userId: string; userName: string }
  ) {
    return this.repo.reviewJsa(id, decision, actor);
  }

  // Toolbox Talks
  public async getToolboxTalks() {
    return this.repo.getToolboxTalks();
  }

  // Operational HSE modules
  public async createToolboxTalk(data: any) { return this.repo.createToolboxTalk(data); }
  public async createSafetyInspection(data: any) { return this.repo.createSafetyInspection(data); }
  public async createTrainingRecord(data: any) { return this.repo.createTrainingRecord(data); }
  public async createEmergencyDrill(data: any) { return this.repo.createEmergencyDrill(data); }
  public async createFireEquipment(data: any) { return this.repo.createFireEquipment(data); }
  public async createEnvironmentLog(data: any) { return this.repo.createEnvironmentLog(data); }
  public async createWasteLog(data: any) { return this.repo.createWasteLog({ ...data, status: 'STORED_ON_SITE' }); }
  // Permits To Work (PTW)
  public async getWorkPermits() {
    return this.repo.getWorkPermits();
  }

  public async createWorkPermit(data: any) {
    return this.repo.createWorkPermit(data);
  }

  public async reviewWorkPermit(
    id: string,
    decision: 'APPROVED' | 'SUSPENDED' | 'CLOSED',
    actor: { userId: string; userName: string }
  ) {
    return this.repo.reviewWorkPermit(id, decision, actor);
  }

  // Safety Inspections
  public async getSafetyInspections() {
    return this.repo.getSafetyInspections();
  }

  // PPE Issuance
  public async getPpeIssuances() {
    return this.repo.getPpeIssuances();
  }

  public async createPpeIssuance(data: any) {
    return this.repo.createPpeIssuance(data);
  }

  // Training Records
  public async getTrainingRecords() {
    return this.repo.getTrainingRecords();
  }

  // Emergency Drills
  public async getEmergencyDrills() {
    return this.repo.getEmergencyDrills();
  }

  // Fire Equipment
  public async getFireEquipment() {
    return this.repo.getFireEquipment();
  }

  // Environmental Monitoring
  public async getEnvironmentLogs() {
    return this.repo.getEnvironmentLogs();
  }

  // Waste Management
  public async getWasteLogs() {
    return this.repo.getWasteLogs();
  }
}
