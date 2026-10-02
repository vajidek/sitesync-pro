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
    // Calculate Risk Score & Category
    const severity = Number(data.severity) || 3;
    const likelihood = Number(data.likelihood) || 3;
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

  // Job Safety Analysis (JSA)
  public async getJsaList() {
    return this.repo.getJsaList();
  }

  public async createJsa(data: any) {
    return this.repo.createJsa(data);
  }

  // Toolbox Talks
  public async getToolboxTalks() {
    return this.repo.getToolboxTalks();
  }

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
