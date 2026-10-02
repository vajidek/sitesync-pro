import { QAQCRepository } from '../repositories/qaqc.repository';

export class QAQCService {
  private repository: QAQCRepository;

  constructor() {
    this.repository = new QAQCRepository();
  }

  public async getDashboardStats() {
    return await this.repository.getStats();
  }

  public async getInspections() {
    return await this.repository.getInspections();
  }

  public async createInspection(data: any) {
    return await this.repository.createInspection(data);
  }

  public async getNcrs() {
    return await this.repository.getNcrs();
  }

  public async createNcr(data: any) {
    return await this.repository.createNcr(data);
  }

  public async getCapas() {
    return await this.repository.getCapas();
  }

  public async createCapa(data: any) {
    return await this.repository.createCapa(data);
  }

  public async getItps() {
    return await this.repository.getItps();
  }

  public async createItp(data: any) {
    return await this.repository.createItp(data);
  }

  public async getMaterialInspections() {
    return await this.repository.getMaterialInspections();
  }

  public async createMaterialInspection(data: any) {
    return await this.repository.createMaterialInspection(data);
  }

  public async getSiteTests() {
    return await this.repository.getSiteTests();
  }

  public async createSiteTest(data: any) {
    return await this.repository.createSiteTest(data);
  }

  public async getWeldingInspections() {
    return await this.repository.getWeldingInspections();
  }

  public async createWeldingInspection(data: any) {
    return await this.repository.createWeldingInspection(data);
  }

  public async getHydroTests() {
    return await this.repository.getHydroTests();
  }

  public async createHydroTest(data: any) {
    return await this.repository.createHydroTest(data);
  }

  public async getPressureTests() {
    return await this.repository.getPressureTests();
  }

  public async createPressureTest(data: any) {
    return await this.repository.createPressureTest(data);
  }

  public async getPunchLists() {
    return await this.repository.getPunchLists();
  }

  public async createPunchList(data: any) {
    return await this.repository.createPunchList(data);
  }

  public async getSnagLists() {
    return await this.repository.getSnagLists();
  }

  public async createSnagList(data: any) {
    return await this.repository.createSnagList(data);
  }
}
