import { VendorContractRepository } from '../repositories/vendor_contract.repository';
import { numberingService } from './numbering.service';
import crypto from 'crypto';
import { projectRepository } from '../repositories/project.repository';

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

  async createContract(data: any, createdBy: string) {
    if (!createdBy?.trim()) throw new Error('Authenticated creator identity is required to create a contract.');
    const contractVal = Number(data.contractValue);
    const currency = String(data.currency || '').trim().toUpperCase();
    if (!data.title || !data.vendorId || !data.startDate || !data.endDate || !currency) {
      throw new Error('Contract title, vendor, currency and contract dates are required.');
    }
    if (!Number.isFinite(contractVal) || contractVal < 0) throw new Error('Contract value must be a valid non-negative number.');

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      throw new Error('Contract end date must be later than the start date.');
    }

    const vendor = await this.repository.getVendorById(String(data.vendorId).trim());
    if (!vendor || vendor.status !== 'ACTIVE' || ['BLOCKED', 'BLACKLISTED'].includes(String(vendor.classification || '').toUpperCase())) {
      throw new Error('Selected vendor is not active/eligible for contract creation.');
    }

    let projectId = String(data.projectId || '').trim();
    let projectName = String(data.projectName || '').trim();
    let companyId = String(data.companyId || '').trim();

    if (projectId) {
      const project = await projectRepository.findProjectById(projectId);
      if (!project || !project.isActive) throw new Error('Selected project is not active or does not exist.');
      projectName = project.projectName;
      if (!companyId) companyId = String(project.companyId || '').trim();
      if (!companyId) throw new Error('Company context is not configured on the selected project.');
    }

    const numbering = await numberingService.getNextNumber({
      entityType: 'CONTRACT',
      companyId: companyId || null,
      branchId: data.branchId || null,
      projectId: projectId || null,
      date: data.startDate,
      allocatedBy: createdBy,
      manualNumber: data.contractNumber || undefined,
      companyCode: data.companyCode,
      branchCode: data.branchCode,
      projectCode: data.projectCode,
    });

    const retentionPct = data.retentionPercent == null ? 0 : Number(data.retentionPercent);
    const securityDepositAmount = data.securityDepositAmount == null ? 0 : Number(data.securityDepositAmount);
    const performanceGuaranteeAmount = data.performanceGuaranteeAmount == null ? 0 : Number(data.performanceGuaranteeAmount);
    const ldPercentPerWeek = data.ldPercentPerWeek == null ? 0 : Number(data.ldPercentPerWeek);
    const maxLdCapPercent = data.maxLdCapPercent == null ? 0 : Number(data.maxLdCapPercent);

    if (!Number.isFinite(retentionPct) || retentionPct < 0 || retentionPct > 100) throw new Error('Retention percentage must be between 0 and 100.');
    if ([securityDepositAmount, performanceGuaranteeAmount, ldPercentPerWeek, maxLdCapPercent].some((n) => !Number.isFinite(n) || n < 0)) {
      throw new Error('Security deposit, performance guarantee and LD parameters must be valid non-negative numbers.');
    }

    const now = new Date().toISOString();
    const contractData = {
      id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contractNumber: numbering.documentNumber,
      title: data.title.trim(),
      contractType: data.contractType,
      vendorId: data.vendorId,
      vendorName: vendor.name,
      projectId: projectId || null,
      projectName: projectName || null,
      packageId: data.packageId || null,
      wbsCode: data.wbsCode || null,
      department: data.department || null,
      contractValue: contractVal,
      revisedValue: contractVal,
      currency,
      startDate: data.startDate,
      endDate: data.endDate,
      revisedEndDate: data.endDate,
      status: 'DRAFT',
      retentionPercent: retentionPct,
      retentionAmount: (contractVal * retentionPct) / 100,
      securityDepositAmount,
      performanceGuaranteeAmount,
      ldPercentPerWeek,
      maxLdCapPercent,
      totalLdPenalties: 0,
      termsAndConditions: data.termsAndConditions || null,
      notes: data.notes || null,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: createdBy.trim(),
      updatedBy: createdBy.trim(),
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

  async updateContractVariationStatus(id: string, status: 'APPROVED' | 'REJECTED', approvedBy: string, comments?: string) {
    return this.repository.updateContractVariationStatus(id, status, approvedBy, comments);
  }

  async updateContractExtensionStatus(id: string, status: 'APPROVED' | 'REJECTED', approvedBy: string, comments?: string) {
    return this.repository.updateContractExtensionStatus(id, status, approvedBy, comments);
  }

  async addContractVariation(data: any, createdBy: string) {
    if (!createdBy?.trim()) throw new Error('Authenticated creator identity is required to create a contract variation.');
    const amount = Number(data.amount);
    if (!data.contractId || !data.title?.trim() || !data.description?.trim() || !data.variationType || !Number.isFinite(amount) || amount < 0) {
      throw new Error('Contract, title, description, variation type and a valid non-negative amount are required for a variation.');
    }
    const claimedDays = Number(data.claimedTimeExtensionDays ?? data.timeExtensionDays ?? 0);
    if (!Number.isInteger(claimedDays) || claimedDays < 0) throw new Error('Variation time-extension days must be a valid non-negative integer.');

    const contract = await this.repository.getContractById(data.contractId);
    if (!contract) throw new Error('Contract not found.');

    const projectId = data.projectId || contract.projectId || undefined;
    if (data.wbsId && projectId && !String(data.wbsId).trim()) throw new Error('WBS reference is invalid.');

    const numbering = await numberingService.getNextNumber({
      entityType: 'CONTRACT_VARIATION',
      companyId: data.companyId || null,
      projectId: projectId || null,
      date: data.variationDate || data.noticeDate || new Date().toISOString(),
      allocatedBy: createdBy,
      manualNumber: data.variationNumber || undefined,
    });

    return await this.repository.addContractVariation({
      id: `cvar_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contractId: data.contractId,
      projectId,
      wbsId: data.wbsId || null,
      boqItemId: data.boqItemId || null,
      costCodeId: data.costCodeId || null,
      variationNumber: numbering.documentNumber,
      title: data.title.trim(),
      description: data.description.trim(),
      variationType: data.variationType,
      amount,
      claimedAmount: Number(data.claimedAmount ?? amount),
      claimedTimeExtensionDays: claimedDays,
      timeExtensionDays: claimedDays,
      noticeDate: data.noticeDate || null,
      eventDate: data.eventDate || null,
      changeEventReference: data.changeEventReference || null,
      clientReference: data.clientReference || null,
      justification: data.justification || null,
      evidenceDocuments: Array.isArray(data.evidenceDocuments) ? data.evidenceDocuments : [],
      createdBy: createdBy.trim(),
    });
  }

  async addContractPayment(data: any, certifiedBy: string) {
    if (!certifiedBy?.trim()) throw new Error('Authenticated certifier identity is required to create an interim payment certificate.');
    const gross = Number(data.grossAmount);
    if (!data.contractId || !data.billingPeriod || !Number.isFinite(gross) || gross < 0) throw new Error('Contract, billing period and a valid gross amount are required.');

    const retention = Number(data.retentionDeducted || 0);
    const advance = Number(data.advanceAdjusted || 0);
    const penalty = Number(data.penaltyDeducted || 0);
    if ([retention, advance, penalty].some((n) => !Number.isFinite(n) || n < 0)) throw new Error('Payment deductions must be valid non-negative numbers.');
    if (retention + advance + penalty > gross) throw new Error('Payment deductions cannot exceed the gross amount.');

    const numbering = await numberingService.getNextNumber({
      entityType: 'PAYMENT',
      companyId: data.companyId || null,
      projectId: data.projectId || null,
      date: data.paymentDate || new Date().toISOString(),
      allocatedBy: certifiedBy,
      manualNumber: data.certificateNumber || undefined,
    });

    const now = new Date().toISOString();
    const net = gross - retention - advance - penalty;
    const paymentData = {
      id: `cpay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contractId: data.contractId,
      certificateNumber: numbering.documentNumber,
      billingPeriod: data.billingPeriod,
      grossAmount: gross,
      retentionDeducted: retention,
      advanceAdjusted: advance,
      penaltyDeducted: penalty,
      netPayableAmount: net,
      status: 'DRAFT',
      paymentDate: null,
      referenceNo: null,
      certifiedBy: certifiedBy.trim(),
      createdAt: now,
      updatedAt: now,
    };

    return await this.repository.addContractPayment(paymentData);
  }
  async addContractExtension(data: any, requestedBy: string) {
    if (!requestedBy?.trim()) throw new Error('Authenticated requester identity is required for a contract extension request.');
    const extensionDays = Number(data.extensionDays);
    if (!data.contractId || !Number.isInteger(extensionDays) || extensionDays < 1 || !data.newEndDate || !String(data.reason || '').trim()) {
      throw new Error('Contract, positive extension days, new end date and reason are required.');
    }

    const contract = await this.repository.getContractById(data.contractId);
    if (!contract) throw new Error('Contract not found.');

    const baseEndDate = data.originalEndDate || contract.revisedEndDate || contract.endDate;
    if (new Date(data.newEndDate) <= new Date(baseEndDate)) {
      throw new Error('New end date must be later than the current contract end date.');
    }

    const existingExtensions = contract.extensions || [];
    const extensionNumber = existingExtensions.length + 1;

    const numbering = await numberingService.getNextNumber({
      entityType: 'CONTRACT_EXTENSION',
      companyId: data.companyId || null,
      projectId: contract.projectId || data.projectId || null,
      date: data.newEndDate,
      allocatedBy: requestedBy,
      manualNumber: data.extensionNumber ? `EOT-${data.extensionNumber}` : undefined,
    });

    return await this.repository.addContractExtension({
      id: `cext_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contractId: data.contractId,
      projectId: data.projectId || contract.projectId || null,
      wbsId: data.wbsId || null,
      causeType: data.causeType || null,
      changeEventReference: data.changeEventReference || null,
      extensionNumber,
      extensionDocumentNumber: numbering.documentNumber,
      extensionDays,
      originalEndDate: baseEndDate,
      newEndDate: data.newEndDate,
      reason: String(data.reason).trim(),
      noticeDate: data.noticeDate || null,
      eventDate: data.eventDate || null,
      status: 'REQUESTED',
      requestedBy: requestedBy.trim(),
      approvedBy: null,
      approvedDate: null,
      evidenceDocuments: Array.isArray(data.evidenceDocuments) ? data.evidenceDocuments : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async getContractClaims(filters: { contractId?: string; projectId?: string; status?: string } = {}) {
    return this.repository.getContractClaims(filters);
  }

  async createContractClaim(data: any, createdBy: string) {
    if (!createdBy?.trim()) throw new Error('Authenticated claim creator identity is required.');
    if (!data.contractId || !data.claimType || !data.title?.trim() || !data.description?.trim()) {
      throw new Error('Contract, claim type, title and description are required.');
    }
    const claimedAmount = Number(data.claimedAmount || 0);
    const claimedDays = Number(data.claimedDays || 0);
    if (!Number.isFinite(claimedAmount) || claimedAmount < 0) throw new Error('Claim amount must be a valid non-negative number.');
    if (!Number.isInteger(claimedDays) || claimedDays < 0) throw new Error('Claimed days must be a valid non-negative integer.');

    const contract = await this.repository.getContractById(data.contractId);
    if (!contract) throw new Error('Contract not found.');

    const numbering = await numberingService.getNextNumber({
      entityType: 'CONTRACT_CLAIM',
      companyId: data.companyId || null,
      projectId: data.projectId || contract.projectId || null,
      date: data.noticeDate || data.eventDate || new Date().toISOString(),
      allocatedBy: createdBy,
      manualNumber: data.claimNumber || undefined,
    });

    return this.repository.createContractClaim({
      id: crypto.randomUUID(),
      claimNumber: numbering.documentNumber,
      contractId: data.contractId,
      projectId: data.projectId || contract.projectId || null,
      wbsId: data.wbsId || null,
      boqItemId: data.boqItemId || null,
      costCodeId: data.costCodeId || null,
      claimType: data.claimType,
      title: data.title.trim(),
      description: data.description.trim(),
      eventDate: data.eventDate || null,
      noticeDate: data.noticeDate || null,
      claimedAmount,
      claimedDays,
      clientReference: data.clientReference || null,
      changeEventReference: data.changeEventReference || null,
      evidenceDocuments: Array.isArray(data.evidenceDocuments) ? data.evidenceDocuments : [],
      createdBy: createdBy.trim(),
    });
  }

  async updateContractClaimStatus(id: string, status: any, actorName: string, options: any = {}) {
    return this.repository.updateContractClaimStatus(id, status, actorName, options);
  }

  async getContractChangeEvidence(entityType: 'VARIATION' | 'EXTENSION' | 'CLAIM', entityId: string) {
    return this.repository.getContractChangeEvidence(entityType, entityId);
  }

  async linkContractChangeEvidence(data: any, createdBy: string) {
    return this.repository.linkContractChangeEvidence({ ...data, createdBy });
  }
  async getDashboardStats() {
    return await this.repository.getVendorContractStats();
  }
}
