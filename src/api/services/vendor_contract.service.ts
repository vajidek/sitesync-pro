import { VendorContractRepository } from '../repositories/vendor_contract.repository';

export class VendorContractService {
  private repository: VendorContractRepository;

  constructor() {
    this.repository = new VendorContractRepository();
  }

  // ==========================================
  // VENDOR SERVICES
  // ==========================================

  async getAllVendors(filters: { search?: string; category?: string; status?: string; avlStatus?: string; classification?: string }) {
    return await this.repository.getAllVendors(filters);
  }

  async getVendorById(id: string) {
    const vendor = await this.repository.getVendorById(id);
    if (!vendor) throw new Error('Vendor not found');
    return vendor;
  }

  async registerVendor(data: any, createdBy: string = 'Admin') {
    const vendorCode = `VND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const vendorData = {
      id: `vnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      vendorCode,
      name: data.name,
      category: data.category || 'General Supplier',
      classification: data.classification || 'APPROVED',
      status: data.status || 'ACTIVE',
      rating: 5.0,
      scorecardGrade: 'A',
      avlStatus: 'APPROVED',
      tradeLicenseNo: data.tradeLicenseNo,
      tradeLicenseExpiry: data.tradeLicenseExpiry,
      gstin: data.gstin,
      pan: data.pan,
      msmeRegNo: data.msmeRegNo,
      isoCertified: data.isoCertified || false,
      paymentTerms: data.paymentTerms || 'NET_30',
      creditPeriodDays: data.creditPeriodDays || 30,
      riskLevel: data.riskLevel || 'LOW',
      insuranceExpiry: data.insuranceExpiry,
      notes: data.notes,
      isActive: true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
      updatedBy: createdBy
    };

    return await this.repository.createVendor(vendorData, data.contacts || [], data.addresses || [], data.bankAccounts || []);
  }

  async updateVendorStatus(id: string, statusData: any, updatedBy: string = 'Admin') {
    const vendor = await this.repository.getVendorById(id);
    if (!vendor) throw new Error('Vendor not found');

    return await this.repository.updateVendorStatus(id, {
      ...statusData,
      updatedBy
    });
  }

  async rateVendor(data: any, evaluatorName: string) {
    const vendor = await this.repository.getVendorById(data.vendorId);
    if (!vendor) throw new Error('Vendor not found');

    const overallScore = Math.round(((data.qualityRating + data.deliveryRating + data.priceCompetitiveness + data.safetyRating) / 4) * 10) / 10;
    
    let grade = 'A';
    if (overallScore >= 4.5) grade = 'A+';
    else if (overallScore >= 4.0) grade = 'A';
    else if (overallScore >= 3.0) grade = 'B';
    else if (overallScore >= 2.0) grade = 'C';
    else grade = 'D';

    const ratingData = {
      id: `vrate_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      vendorId: data.vendorId,
      ratingPeriod: data.ratingPeriod,
      qualityRating: data.qualityRating,
      deliveryRating: data.deliveryRating,
      priceCompetitiveness: data.priceCompetitiveness,
      safetyRating: data.safetyRating,
      overallScore,
      scorecardGrade: grade,
      evaluatorName,
      comments: data.comments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.repository.addVendorRating(ratingData);
  }

  async blacklistVendor(data: any, blacklistedBy: string) {
    const vendor = await this.repository.getVendorById(data.vendorId);
    if (!vendor) throw new Error('Vendor not found');

    const blData = {
      id: `vbl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      vendorId: data.vendorId,
      vendorName: vendor.name,
      blacklistedBy,
      blacklistedDate: new Date().toISOString().split('T')[0],
      reason: data.reason,
      durationMonths: data.durationMonths || 12,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.repository.blacklistVendor(blData);
  }

  async getVendorCategories() {
    return await this.repository.getVendorCategories();
  }

  // ==========================================
  // CONTRACT SERVICES
  // ==========================================

  async getAllContracts(filters: { search?: string; contractType?: string; status?: string; vendorId?: string; projectId?: string }) {
    return await this.repository.getAllContracts(filters);
  }

  async getContractById(id: string) {
    const contract = await this.repository.getContractById(id);
    if (!contract) throw new Error('Contract not found');
    return contract;
  }

  async createContract(data: any, createdBy: string = 'Admin') {
    const contractNumber = `CNT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const contractVal = data.contractValue || 0;
    const retentionPct = data.retentionPercent !== undefined ? data.retentionPercent : 10.0;
    const retentionAmt = (contractVal * retentionPct) / 100;

    const contractData = {
      id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contractNumber,
      title: data.title,
      contractType: data.contractType || 'SUPPLY',
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      projectId: data.projectId || null,
      projectName: data.projectName || null,
      packageId: data.packageId || null,
      wbsCode: data.wbsCode || null,
      department: data.department || 'Contracts',
      contractValue: contractVal,
      revisedValue: contractVal,
      currency: data.currency || 'AED',
      startDate: data.startDate,
      endDate: data.endDate,
      revisedEndDate: data.endDate,
      status: 'DRAFT',
      retentionPercent: retentionPct,
      retentionAmount: retentionAmt,
      securityDepositAmount: data.securityDepositAmount || 0,
      performanceGuaranteeAmount: data.performanceGuaranteeAmount || 0,
      ldPercentPerWeek: data.ldPercentPerWeek || 0.5,
      maxLdCapPercent: data.maxLdCapPercent || 10.0,
      totalLdPenalties: 0,
      termsAndConditions: data.termsAndConditions || 'Standard EPC/Turnkey Contract Terms Apply',
      notes: data.notes || '',
      isActive: true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
      updatedBy: createdBy
    };

    return await this.repository.createContract(contractData, data.items || []);
  }

  async updateContractStatus(id: string, status: string, updatedBy: string, notes?: string) {
    const contract = await this.repository.getContractById(id);
    if (!contract) throw new Error('Contract not found');

    return await this.repository.updateContractStatus(id, status, updatedBy, notes);
  }

  async addContractMilestone(data: any) {
    const milestoneData = {
      id: `cmiles_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contractId: data.contractId,
      milestoneNumber: data.milestoneNumber || 1,
      title: data.title,
      description: data.description || '',
      targetDate: data.targetDate,
      milestoneWeightagePercent: data.milestoneWeightagePercent || 0,
      amount: data.amount || 0,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.repository.addContractMilestone(milestoneData);
  }

  async addContractVariation(data: any, approvedBy: string = 'Admin') {
    const variationNumber = `VO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const variationData = {
      id: `cvar_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contractId: data.contractId,
      variationNumber,
      title: data.title,
      description: data.description,
      variationType: data.variationType || 'ADDITION',
      amount: data.amount,
      timeExtensionDays: data.timeExtensionDays || 0,
      status: 'APPROVED',
      approvedBy,
      approvedDate: new Date().toISOString().split('T')[0],
      justification: data.justification || 'Required for project scope enhancement',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.repository.addContractVariation(variationData);
  }

  async addContractPayment(data: any, certifiedBy: string = 'Finance Manager') {
    const certificateNumber = `IPC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const gross = data.grossAmount || 0;
    const retDeducted = data.retentionDeducted || (gross * 0.1);
    const advAdjusted = data.advanceAdjusted || 0;
    const penDeducted = data.penaltyDeducted || 0;
    const net = gross - retDeducted - advAdjusted - penDeducted;

    const paymentData = {
      id: `cpay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contractId: data.contractId,
      certificateNumber,
      billingPeriod: data.billingPeriod,
      grossAmount: gross,
      retentionDeducted: retDeducted,
      advanceAdjusted: advAdjusted,
      penaltyDeducted: penDeducted,
      netPayableAmount: net,
      status: 'CERTIFIED',
      paymentDate: new Date().toISOString().split('T')[0],
      certifiedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.repository.addContractPayment(paymentData);
  }

  async addContractExtension(data: any, approvedBy: string = 'Project Director') {
    const extensionData = {
      id: `cext_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contractId: data.contractId,
      extensionNumber: data.extensionNumber || 1,
      extensionDays: data.extensionDays,
      originalEndDate: data.originalEndDate || new Date().toISOString().split('T')[0],
      newEndDate: data.newEndDate,
      reason: data.reason,
      status: 'APPROVED',
      approvedBy,
      approvedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.repository.addContractExtension(extensionData);
  }

  async getDashboardStats() {
    return await this.repository.getVendorContractStats();
  }
}
