import { ProcurementEnterpriseRepository } from '../repositories/procurement_enterprise.repository';

export class ProcurementEnterpriseService {
  private repository: ProcurementEnterpriseRepository;

  constructor() {
    this.repository = new ProcurementEnterpriseRepository();
  }

  public async getDashboardStats(): Promise<any> {
    return this.repository.getProcurementDashboardStats();
  }

  // --- Vendors ---
  public async getVendors(search?: string, category?: string, status?: string): Promise<any[]> {
    return this.repository.getVendors(search, category, status);
  }

  public async getVendorById(id: string): Promise<any> {
    return this.repository.getVendorById(id);
  }

  public async registerVendor(data: any, createdBy: string = ''): Promise<any> {
    return this.repository.createVendor(data, createdBy);
  }

  public async updateVendor(id: string, updates: any): Promise<any> {
    return this.repository.updateVendor(id, updates);
  }

  // --- RFQs & Quotations ---
  public async getRfqs(): Promise<any[]> {
    return this.repository.getRfqs();
  }

  public async createRfq(data: any, createdBy: string = ''): Promise<any> {
    return this.repository.createRfq(data, createdBy);
  }

  public async getQuotations(rfqId?: string): Promise<any[]> {
    return this.repository.getQuotations(rfqId);
  }

  public async submitQuotation(data: any, createdBy: string = ''): Promise<any> {
    return this.repository.createQuotation(data, createdBy);
  }

  // --- Purchase Requisitions & Orders ---
  public async getPurchaseRequisitions(): Promise<any[]> {
    return this.repository.getPurchaseRequisitions();
  }

  public async updatePurchaseRequisitionStatus(id: string, status: 'SUBMITTED' | 'HOD_APPROVED' | 'FINANCE_APPROVED' | 'PO_ISSUED' | 'REJECTED', actorName: string, remarks?: string): Promise<any> {
    return this.repository.updatePurchaseRequisitionStatus(id, status, actorName, remarks);
  }

  public async updatePurchaseOrderStatus(id: string, status: 'ISSUED' | 'REJECTED' | 'PARTIALLY_DELIVERED' | 'DELIVERED' | 'INVOICED' | 'CLOSED' | 'CANCELLED', actorName: string, remarks?: string): Promise<any> {
    return this.repository.updatePurchaseOrderStatus(id, status, actorName, remarks);
  }

  public async updateGoodsReceiptStatus(id: string, status: 'APPROVED' | 'CANCELLED', actorName: string, remarks?: string): Promise<any> {
    return this.repository.updateGoodsReceiptStatus(id, status, actorName, remarks);
  }

  public async createPurchaseRequisition(data: any, createdBy: string = ''): Promise<any> {
    return this.repository.createPurchaseRequisition(data, createdBy);
  }

  public async getPurchaseOrders(): Promise<any[]> {
    return this.repository.getPurchaseOrders();
  }

  public async issuePurchaseOrder(data: any, createdBy: string = ''): Promise<any> {
    return this.repository.createPurchaseOrder(data, createdBy);
  }

  // --- Contracts & Variations ---
  public async getContracts(): Promise<any[]> {
    return this.repository.getContracts();
  }

  public async createContract(data: any, createdBy: string = ''): Promise<any> {
    return this.repository.createContract(data, createdBy);
  }

  public async createVariationOrder(data: any, createdBy: string = ''): Promise<any> {
    return this.repository.createVariationOrder(data, createdBy);
  }

  // --- Goods Receipts & 3-Way Matching ---
  public async getGoodsReceipts(): Promise<any[]> {
    return this.repository.getGoodsReceipts();
  }

  public async createGoodsReceipt(data: any, createdBy: string = ''): Promise<any> {
    return this.repository.createGoodsReceipt(data, createdBy);
  }

  public async getThreeWayMatches(): Promise<any[]> {
    return this.repository.getThreeWayMatches();
  }

  public async reconcileThreeWayMatch(data: any): Promise<any> {
    return this.repository.createThreeWayMatch(data);
  }

  // --- Scorecards & Guarantees ---
  public async getSupplierScorecards(): Promise<any[]> {
    return this.repository.getSupplierScorecards();
  }

  public async getBankGuarantees(): Promise<any[]> {
    return this.repository.getBankGuarantees();
  }
}
