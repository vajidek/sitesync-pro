import { db } from '../../db';
import { 
  phase57Vendors, vendorCategories, vendorContacts, vendorAddresses, vendorBankAccounts,
  vendorCertifications, vendorDocuments, vendorRatings, vendorBlacklist, vendorAudits,
  phase57Contracts, contractItems, contractMilestones, contractPayments, contractVariations,
  contractExtensions, contractRetentions, contractPenalties, contractDocuments, contractApprovals, contractLogs
} from '../../db/schema';
import { eq, and, desc, like, sql, or } from 'drizzle-orm';

export class VendorContractRepository {
  // ==========================================
  // VENDOR REPOSITORY METHODS
  // ==========================================

  async getAllVendors(filters: { search?: string; category?: string; status?: string; avlStatus?: string; classification?: string }) {
    let query = db.select().from(phase57Vendors).where(eq(phase57Vendors.isDeleted, false));

    const vendorsList = await query.orderBy(desc(phase57Vendors.createdAt));

    return vendorsList.filter(v => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!v.name.toLowerCase().includes(s) && !v.vendorCode.toLowerCase().includes(s)) return false;
      }
      if (filters.category && v.category !== filters.category) return false;
      if (filters.status && v.status !== filters.status) return false;
      if (filters.avlStatus && v.avlStatus !== filters.avlStatus) return false;
      if (filters.classification && v.classification !== filters.classification) return false;
      return true;
    });
  }

  async getVendorById(id: string) {
    const [vendor] = await db.select().from(phase57Vendors).where(and(eq(phase57Vendors.id, id), eq(phase57Vendors.isDeleted, false)));
    if (!vendor) return null;

    const contacts = await db.select().from(vendorContacts).where(eq(vendorContacts.vendorId, id));
    const addresses = await db.select().from(vendorAddresses).where(eq(vendorAddresses.vendorId, id));
    const bankAccounts = await db.select().from(vendorBankAccounts).where(eq(vendorBankAccounts.vendorId, id));
    const certifications = await db.select().from(vendorCertifications).where(eq(vendorCertifications.vendorId, id));
    const documents = await db.select().from(vendorDocuments).where(eq(vendorDocuments.vendorId, id));
    const ratings = await db.select().from(vendorRatings).where(eq(vendorRatings.vendorId, id)).orderBy(desc(vendorRatings.createdAt));

    return {
      ...vendor,
      contacts,
      addresses,
      bankAccounts,
      certifications,
      documents,
      ratings
    };
  }

  async createVendor(vendorData: any, contacts: any[] = [], addresses: any[] = [], bankAccounts: any[] = []) {
    const [newVendor] = await db.insert(phase57Vendors).values(vendorData).returning();

    if (contacts.length > 0) {
      const cVals = contacts.map(c => ({ ...c, id: `vcon_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, vendorId: newVendor.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
      await db.insert(vendorContacts).values(cVals);
    }

    if (addresses.length > 0) {
      const aVals = addresses.map(a => ({ ...a, id: `vaddr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, vendorId: newVendor.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
      await db.insert(vendorAddresses).values(aVals);
    }

    if (bankAccounts.length > 0) {
      const bVals = bankAccounts.map(b => ({ ...b, id: `vbank_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, vendorId: newVendor.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
      await db.insert(vendorBankAccounts).values(bVals);
    }

    return this.getVendorById(newVendor.id);
  }

  async updateVendorStatus(id: string, updateData: { status?: string; classification?: string; avlStatus?: string; scorecardGrade?: string; rating?: number; updatedBy?: string }) {
    const [updated] = await db.update(phase57Vendors)
      .set({ ...updateData, updatedAt: new Date().toISOString() })
      .where(eq(phase57Vendors.id, id))
      .returning();
    return updated;
  }

  async addVendorRating(ratingData: any) {
    const [newRating] = await db.insert(vendorRatings).values(ratingData).returning();
    
    // Update average rating and scorecard grade on vendor
    const allRatings = await db.select().from(vendorRatings).where(eq(vendorRatings.vendorId, ratingData.vendorId));
    const avgScore = allRatings.reduce((acc, r) => acc + r.overallScore, 0) / (allRatings.length || 1);
    
    let grade = 'A';
    if (avgScore >= 4.5) grade = 'A+';
    else if (avgScore >= 4.0) grade = 'A';
    else if (avgScore >= 3.0) grade = 'B';
    else if (avgScore >= 2.0) grade = 'C';
    else grade = 'D';

    await db.update(phase57Vendors)
      .set({ rating: Math.round(avgScore * 10) / 10, scorecardGrade: grade, updatedAt: new Date().toISOString() })
      .where(eq(phase57Vendors.id, ratingData.vendorId));

    return newRating;
  }

  async blacklistVendor(blacklistData: any) {
    const [bl] = await db.insert(vendorBlacklist).values(blacklistData).returning();
    await db.update(phase57Vendors)
      .set({ 
        classification: 'BLACKLISTED', 
        status: 'SUSPENDED', 
        avlStatus: 'NOT_APPROVED',
        updatedAt: new Date().toISOString() 
      })
      .where(eq(phase57Vendors.id, blacklistData.vendorId));
    return bl;
  }

  async getVendorCategories() {
    return await db.select().from(vendorCategories).where(eq(vendorCategories.isDeleted, false));
  }

  async createVendorCategory(categoryData: any) {
    const [cat] = await db.insert(vendorCategories).values(categoryData).returning();
    return cat;
  }

  // ==========================================
  // CONTRACT REPOSITORY METHODS
  // ==========================================

  async getAllContracts(filters: { search?: string; contractType?: string; status?: string; vendorId?: string; projectId?: string }) {
    const contractsList = await db.select().from(phase57Contracts).where(eq(phase57Contracts.isDeleted, false)).orderBy(desc(phase57Contracts.createdAt));

    return contractsList.filter(c => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!c.title.toLowerCase().includes(s) && !c.contractNumber.toLowerCase().includes(s) && !c.vendorName.toLowerCase().includes(s)) return false;
      }
      if (filters.contractType && c.contractType !== filters.contractType) return false;
      if (filters.status && c.status !== filters.status) return false;
      if (filters.vendorId && c.vendorId !== filters.vendorId) return false;
      if (filters.projectId && c.projectId !== filters.projectId) return false;
      return true;
    });
  }

  async getContractById(id: string) {
    const [contract] = await db.select().from(phase57Contracts).where(and(eq(phase57Contracts.id, id), eq(phase57Contracts.isDeleted, false)));
    if (!contract) return null;

    const items = await db.select().from(contractItems).where(eq(contractItems.contractId, id));
    const milestones = await db.select().from(contractMilestones).where(eq(contractMilestones.contractId, id)).orderBy(contractMilestones.milestoneNumber);
    const payments = await db.select().from(contractPayments).where(eq(contractPayments.contractId, id)).orderBy(desc(contractPayments.createdAt));
    const variations = await db.select().from(contractVariations).where(eq(contractVariations.contractId, id)).orderBy(desc(contractVariations.createdAt));
    const extensions = await db.select().from(contractExtensions).where(eq(contractExtensions.contractId, id)).orderBy(desc(contractExtensions.createdAt));
    const retentions = await db.select().from(contractRetentions).where(eq(contractRetentions.contractId, id));
    const penalties = await db.select().from(contractPenalties).where(eq(contractPenalties.contractId, id));
    const documents = await db.select().from(contractDocuments).where(eq(contractDocuments.contractId, id));
    const approvals = await db.select().from(contractApprovals).where(eq(contractApprovals.contractId, id)).orderBy(contractApprovals.step);
    const logs = await db.select().from(contractLogs).where(eq(contractLogs.contractId, id)).orderBy(desc(contractLogs.createdAt));

    return {
      ...contract,
      items,
      milestones,
      payments,
      variations,
      extensions,
      retentions,
      penalties,
      documents,
      approvals,
      logs
    };
  }

  async createContract(contractData: any, items: any[] = []) {
    return await db.transaction(async (tx) => {
      const [newContract] = await tx.insert(phase57Contracts).values(contractData).returning();
      if (!newContract) throw new Error('Contract could not be created.');

      if (items.length > 0) {
        const itemVals = items.map((item, index) => ({
          ...item,
          id: item.id || `citem_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
          contractId: newContract.id,
          createdAt: new Date().toISOString(),
        }));
        await tx.insert(contractItems).values(itemVals);
      }

      await tx.insert(contractLogs).values({
        id: `clog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        contractId: newContract.id,
        contractNumber: newContract.contractNumber,
        actionType: 'CREATE',
        performedBy: newContract.createdBy || 'Authenticated workflow actor',
        details: `Created contract ${newContract.contractNumber} valued at ${newContract.currency} ${Number(newContract.contractValue).toLocaleString()}`,
        createdAt: new Date().toISOString(),
      });

      return {
        ...newContract,
        items,
      };
    });
  }
  async updateContractStatus(id: string, status: string, updatedBy: string, notes?: string) {
    const [c] = await db.select().from(phase57Contracts).where(eq(phase57Contracts.id, id));
    if (!c) return null;

    const [updated] = await db.update(phase57Contracts)
      .set({ status, updatedAt: new Date().toISOString(), updatedBy })
      .where(eq(phase57Contracts.id, id))
      .returning();

    await db.insert(contractLogs).values({
      id: `clog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contractId: id,
      contractNumber: c.contractNumber,
      actionType: 'STATUS_CHANGE',
      performedBy: updatedBy,
      details: `Updated contract status from ${c.status} to ${status}. ${notes || ''}`,
      createdAt: new Date().toISOString()
    });

    return updated;
  }

  async addContractMilestone(milestoneData: any) {
    const [m] = await db.insert(contractMilestones).values(milestoneData).returning();
    return m;
  }

  async addContractVariation(variationData: any) {
    const [contract] = await db.select().from(phase57Contracts).where(eq(phase57Contracts.id, variationData.contractId)).limit(1);
    if (!contract) throw new Error('Contract not found.');

    const [varItem] = await db.insert(contractVariations).values({
      ...variationData,
      status: variationData.status || 'PROPOSED',
      approvedBy: null,
      approvedDate: null,
      createdBy: variationData.createdBy || null,
    }).returning();

    if (!varItem) throw new Error('Contract variation could not be created.');

    await db.insert(contractLogs).values({
      id: `clog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      actionType: 'VARIATION',
      performedBy: variationData.createdBy || 'Authenticated workflow actor',
      details: `Submitted variation ${varItem.variationNumber} for ${contract.contractNumber}`,
      createdAt: new Date().toISOString(),
    });

    return varItem;
  }

  async updateContractVariationStatus(id: string, status: 'APPROVED' | 'REJECTED', approvedBy: string, comments?: string) {
    if (!approvedBy?.trim()) throw new Error('Authenticated approver identity is required.');
    const [variation] = await db.select().from(contractVariations).where(eq(contractVariations.id, id)).limit(1);
    if (!variation) return null;
    if (variation.status !== 'PROPOSED') throw new Error(`Variation cannot be ${status.toLowerCase()} from status ${variation.status}.`);

    return await db.transaction(async (tx) => {
      const [contract] = await tx.select().from(phase57Contracts).where(eq(phase57Contracts.id, variation.contractId)).limit(1);
      if (!contract) throw new Error('Contract not found.');

      const [updated] = await tx.update(contractVariations).set({
        status,
        approvedBy: approvedBy.trim(),
        approvedDate: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
      }).where(eq(contractVariations.id, id)).returning();

      if (status === 'APPROVED') {
        await tx.update(phase57Contracts).set({
          revisedValue: Number(contract.revisedValue || contract.contractValue) + Number(variation.amount),
          updatedAt: new Date().toISOString(),
          updatedBy: approvedBy.trim(),
        }).where(eq(phase57Contracts.id, contract.id));
      }

      await tx.insert(contractLogs).values({
        id: `clog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        actionType: 'VARIATION',
        performedBy: approvedBy.trim(),
        details: `${status} variation ${variation.variationNumber}.${comments ? ` ${comments}` : ''}`,
        createdAt: new Date().toISOString(),
      });

      return updated;
    });
  }
  async addContractPayment(paymentData: any) {
    const [contract] = await db.select().from(phase57Contracts).where(eq(phase57Contracts.id, paymentData.contractId)).limit(1);
    if (!contract) throw new Error('Contract not found.');

    const [p] = await db.insert(contractPayments).values({
      ...paymentData,
      status: paymentData.status || 'DRAFT',
      paymentDate: null,
      referenceNo: null,
    }).returning();

    if (!p) throw new Error('Interim payment certificate could not be created.');

    await db.insert(contractLogs).values({
      id: `clog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      actionType: 'PAYMENT',
      performedBy: paymentData.certifiedBy,
      details: `Created payment certificate ${p.certificateNumber} for ${contract.currency} ${Number(p.netPayableAmount).toLocaleString()}`,
      createdAt: new Date().toISOString(),
    });

    return p;
  }
  async addContractExtension(extensionData: any) {
    const [contract] = await db.select().from(phase57Contracts).where(eq(phase57Contracts.id, extensionData.contractId)).limit(1);
    if (!contract) throw new Error('Contract not found.');

    const [ext] = await db.insert(contractExtensions).values({
      ...extensionData,
      status: extensionData.status || 'REQUESTED',
      approvedBy: null,
      approvedDate: null,
    }).returning();

    if (!ext) throw new Error('Contract extension request could not be created.');

    await db.insert(contractLogs).values({
      id: `clog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      actionType: 'EXTEND',
      performedBy: extensionData.requestedBy || 'Authenticated workflow actor',
      details: `Submitted extension request for ${contract.contractNumber}: ${ext.extensionDays} day(s)`,
      createdAt: new Date().toISOString(),
    });

    return ext;
  }

  async updateContractExtensionStatus(id: string, status: 'APPROVED' | 'REJECTED', approvedBy: string, comments?: string) {
    if (!approvedBy?.trim()) throw new Error('Authenticated approver identity is required.');
    const [extension] = await db.select().from(contractExtensions).where(eq(contractExtensions.id, id)).limit(1);
    if (!extension) return null;
    if (extension.status !== 'REQUESTED') throw new Error(`Extension cannot be ${status.toLowerCase()} from status ${extension.status}.`);

    return await db.transaction(async (tx) => {
      const [contract] = await tx.select().from(phase57Contracts).where(eq(phase57Contracts.id, extension.contractId)).limit(1);
      if (!contract) throw new Error('Contract not found.');

      const [updated] = await tx.update(contractExtensions).set({
        status,
        approvedBy: approvedBy.trim(),
        approvedDate: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
      }).where(eq(contractExtensions.id, id)).returning();

      if (status === 'APPROVED') {
        await tx.update(phase57Contracts).set({
          revisedEndDate: extension.newEndDate,
          updatedAt: new Date().toISOString(),
          updatedBy: approvedBy.trim(),
        }).where(eq(phase57Contracts.id, contract.id));
      }

      await tx.insert(contractLogs).values({
        id: `clog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        actionType: 'EXTEND',
        performedBy: approvedBy.trim(),
        details: `${status} extension request ${extension.extensionNumber}.${comments ? ` ${comments}` : ''}`,
        createdAt: new Date().toISOString(),
      });

      return updated;
    });
  }
  async addContractDocument(docData: any) {
    const [doc] = await db.insert(contractDocuments).values(docData).returning();
    return doc;
  }

  // ==========================================
  // DASHBOARD & ANALYTICS STATS
  // ==========================================

  async getVendorContractStats() {
    const vendorsList = await db.select().from(phase57Vendors).where(eq(phase57Vendors.isDeleted, false));
    const contractsList = await db.select().from(phase57Contracts).where(eq(phase57Contracts.isDeleted, false));
    const paymentsList = await db.select().from(contractPayments);

    const totalVendors = vendorsList.length;
    const approvedVendors = vendorsList.filter(v => v.avlStatus === 'APPROVED').length;
    const preferredVendors = vendorsList.filter(v => v.classification === 'PREFERRED').length;
    const blacklistedVendors = vendorsList.filter(v => v.classification === 'BLACKLISTED').length;

    const totalContracts = contractsList.length;
    const activeContracts = contractsList.filter(c => c.status === 'ACTIVE').length;
    const completedContracts = contractsList.filter(c => c.status === 'COMPLETED').length;
    const draftContracts = contractsList.filter(c => c.status === 'DRAFT').length;

    const totalContractValue = contractsList.reduce((acc, c) => acc + (c.revisedValue || c.contractValue || 0), 0);
    const totalRetentionAmount = contractsList.reduce((acc, c) => acc + (c.retentionAmount || 0), 0);
    const totalCertifiedPayments = paymentsList.reduce((acc, p) => acc + p.netPayableAmount, 0);

    return {
      totalVendors,
      approvedVendors,
      preferredVendors,
      blacklistedVendors,
      totalContracts,
      activeContracts,
      completedContracts,
      draftContracts,
      totalContractValue,
      totalRetentionAmount,
      totalCertifiedPayments
    };
  }
}
