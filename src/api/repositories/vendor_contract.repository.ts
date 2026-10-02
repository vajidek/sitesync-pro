import { db } from '../../db';
import { 
  phase57Vendors, vendorCategories, vendorContacts, vendorAddresses, vendorBankAccounts,
  vendorCertifications, vendorDocuments, vendorRatings, vendorBlacklist, vendorAudits,
  phase57Contracts, contractItems, contractMilestones, contractPayments, contractVariations, contractClaims, contractChangeEvidence,
  contractExtensions, contractRetentions, contractPenalties, contractDocuments, contractApprovals, contractLogs, phase61DocumentFiles
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
    if (!updatedBy?.trim()) throw new Error('Authenticated contract actor identity is required.');

    const [c] = await db.select().from(phase57Contracts).where(eq(phase57Contracts.id, id));
    if (!c) return null;

    const transitions: Record<string, string[]> = {
      DRAFT: ['SUBMITTED', 'CANCELLED'],
      SUBMITTED: ['REVIEWED', 'CANCELLED'],
      REVIEWED: ['APPROVED', 'DRAFT', 'CANCELLED'],
      APPROVED: ['ACTIVE', 'CANCELLED'],
      ACTIVE: ['SUSPENDED', 'COMPLETED', 'CLOSED'],
      SUSPENDED: ['ACTIVE', 'CANCELLED'],
      COMPLETED: ['CLOSED'],
      CLOSED: [],
      CANCELLED: [],
      EXPIRED: ['CLOSED'],
    };

    if (!transitions[c.status]?.includes(status)) {
      throw new Error(`Invalid contract status transition: ${c.status} → ${status}`);
    }

    return await db.transaction(async (tx) => {
      const [updated] = await tx.update(phase57Contracts)
        .set({ status, updatedAt: new Date().toISOString(), updatedBy: updatedBy.trim() })
        .where(eq(phase57Contracts.id, id))
        .returning();

      await tx.insert(contractLogs).values({
        id: `clog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        contractId: id,
        contractNumber: c.contractNumber,
        actionType: 'STATUS_CHANGE',
        performedBy: updatedBy.trim(),
        details: `Updated contract status from ${c.status} to ${status}. ${notes || ''}`,
        createdAt: new Date().toISOString()
      });

      return updated;
    });
  }

  async addContractMilestone(milestoneData: any) {
    const [m] = await db.insert(contractMilestones).values(milestoneData).returning();
    return m;
  }

  async addContractVariation(variationData: any) {
    const actor = String(variationData.createdBy || '').trim();
    if (!actor) throw new Error('Authenticated variation creator identity is required.');

    const evidence = Array.isArray(variationData.evidenceDocuments) ? variationData.evidenceDocuments : [];

    return await db.transaction(async (tx) => {
      const [contract] = await tx.select().from(phase57Contracts)
        .where(and(eq(phase57Contracts.id, variationData.contractId), eq(phase57Contracts.isDeleted, false)))
        .limit(1);
      if (!contract) throw new Error('Contract not found.');

      const amount = Number(variationData.amount);
      const claimedAmount = Number(variationData.claimedAmount ?? amount);
      const claimedDays = Number(variationData.claimedTimeExtensionDays ?? variationData.timeExtensionDays ?? 0);

      if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(claimedAmount) || claimedAmount < 0) {
        throw new Error('Variation amount must be a valid non-negative value.');
      }
      if (!Number.isInteger(claimedDays) || claimedDays < 0) {
        throw new Error('Variation time-extension days must be a valid non-negative integer.');
      }

      const projectId = variationData.projectId || contract.projectId || null;
      const now = new Date().toISOString();

      const [varItem] = await tx.insert(contractVariations).values({
        id: variationData.id,
        contractId: contract.id,
        projectId,
        wbsId: variationData.wbsId || null,
        boqItemId: variationData.boqItemId || null,
        costCodeId: variationData.costCodeId || null,
        variationNumber: variationData.variationNumber,
        amount,
        claimedAmount,
        approvedAmount: 0,
        timeExtensionDays: claimedDays,
        claimedTimeExtensionDays: claimedDays,
        approvedTimeExtensionDays: 0,
        noticeDate: variationData.noticeDate || null,
        eventDate: variationData.eventDate || null,
        changeEventReference: variationData.changeEventReference || null,
        clientReference: variationData.clientReference || null,
        status: 'PROPOSED',
        createdBy: actor,
        approvedBy: null,
        approvedDate: null,
        justification: variationData.justification || null,
        createdAt: now,
        updatedAt: now,
      }).returning();

      if (!varItem) throw new Error('Contract variation could not be created.');

      for (const item of evidence) {
        const documentId = String(item?.documentId || '').trim();
        const evidenceType = String(item?.evidenceType || '').trim();
        if (!documentId || !evidenceType) throw new Error('Variation evidence requires documentId and evidenceType.');

        const [doc] = await tx.select({ id: phase61DocumentFiles.id })
          .from(phase61DocumentFiles)
          .where(and(eq(phase61DocumentFiles.id, documentId), eq(phase61DocumentFiles.isDeleted, false)))
          .limit(1);
        if (!doc) throw new Error(`Evidence document ${documentId} was not found.`);

        await tx.insert(contractChangeEvidence).values({
          id: crypto.randomUUID(),
          contractId: contract.id,
          entityType: 'VARIATION',
          entityId: varItem.id,
          documentId,
          evidenceType,
          notes: item.notes ? String(item.notes) : null,
          createdBy: actor,
          createdAt: now,
          isDeleted: false,
        }).onConflictDoNothing();
      }

      await tx.insert(contractLogs).values({
        id: crypto.randomUUID(),
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        actionType: 'VARIATION',
        performedBy: actor,
        details: `Submitted variation ${varItem.variationNumber} for ${contract.contractNumber}`,
        createdAt: now,
      });

      return varItem;
    });
  }

  async updateContractVariationStatus(id: string, status: 'APPROVED' | 'REJECTED', approvedBy: string, comments?: string) {
    const actor = String(approvedBy || '').trim();
    if (!actor) throw new Error('Authenticated approver identity is required.');

    return await db.transaction(async (tx) => {
      const [variation] = await tx.select().from(contractVariations).where(eq(contractVariations.id, id)).limit(1);
      if (!variation) return null;
      if (variation.status !== 'PROPOSED') throw new Error(`Variation cannot be ${status.toLowerCase()} from status ${variation.status}.`);
      if (variation.createdBy && variation.createdBy.trim().toLowerCase() === actor.toLowerCase()) {
        throw new Error('Maker-checker violation: variation creator cannot approve or reject the same variation.');
      }

      const [contract] = await tx.select().from(phase57Contracts).where(eq(phase57Contracts.id, variation.contractId)).limit(1);
      if (!contract) throw new Error('Contract not found.');

      const approvedAmount = status === 'APPROVED' ? Number(variation.claimedAmount || variation.amount || 0) : 0;
      const approvedDays = status === 'APPROVED' ? Number(variation.claimedTimeExtensionDays || variation.timeExtensionDays || 0) : 0;

      const [updated] = await tx.update(contractVariations).set({
        status,
        approvedAmount,
        approvedTimeExtensionDays: approvedDays,
        approvedBy: actor,
        approvedDate: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
      }).where(eq(contractVariations.id, id)).returning();

      if (!updated) return null;

      if (status === 'APPROVED') {
        const direction = updated.variationType === 'OMISSION' ? -1 : 1;
        const revisedValue = Number(contract.revisedValue || contract.contractValue) + (approvedAmount * direction);
        if (revisedValue < 0) throw new Error('Approved variation would make revised contract value negative.');

        await tx.update(phase57Contracts).set({
          revisedValue,
          revisedEndDate: approvedDays > 0
            ? new Date(new Date(contract.revisedEndDate || contract.endDate).getTime() + approvedDays * 86400000).toISOString().split('T')[0]
            : contract.revisedEndDate,
          updatedAt: new Date().toISOString(),
          updatedBy: actor,
        }).where(eq(phase57Contracts.id, contract.id));
      }

      await tx.insert(contractLogs).values({
        id: crypto.randomUUID(),
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        actionType: 'VARIATION',
        performedBy: actor,
        details: `${status} variation ${variation.variationNumber}.${comments ? ` ${comments}` : ''}`,
        createdAt: new Date().toISOString(),
      });

      return updated;
    });
  }

  async getContractClaims(filters: { contractId?: string; projectId?: string; status?: string } = {}) {
    const rows = await db.select().from(contractClaims).orderBy(desc(contractClaims.createdAt));
    return rows.filter((claim) => {
      if (filters.contractId && claim.contractId !== filters.contractId) return false;
      if (filters.projectId && claim.projectId !== filters.projectId) return false;
      if (filters.status && claim.status !== filters.status) return false;
      return true;
    });
  }

  async createContractClaim(claimData: any) {
    const actor = String(claimData.createdBy || '').trim();
    if (!actor) throw new Error('Authenticated claim creator identity is required.');

    return await db.transaction(async (tx) => {
      const [contract] = await tx.select().from(phase57Contracts)
        .where(and(eq(phase57Contracts.id, claimData.contractId), eq(phase57Contracts.isDeleted, false)))
        .limit(1);
      if (!contract) throw new Error('Contract not found.');

      const claimedAmount = Number(claimData.claimedAmount || 0);
      const claimedDays = Number(claimData.claimedDays || 0);
      if (!Number.isFinite(claimedAmount) || claimedAmount < 0) throw new Error('Claim amount must be a valid non-negative number.');
      if (!Number.isInteger(claimedDays) || claimedDays < 0) throw new Error('Claimed days must be a valid non-negative integer.');

      const now = new Date().toISOString();
      const [claim] = await tx.insert(contractClaims).values({
        id: crypto.randomUUID(),
        contractId: contract.id,
        projectId: claimData.projectId || contract.projectId || null,
        wbsId: claimData.wbsId || null,
        boqItemId: claimData.boqItemId || null,
        costCodeId: claimData.costCodeId || null,
        claimNumber: claimData.claimNumber,
        claimType: claimData.claimType,
        title: String(claimData.title || '').trim(),
        description: String(claimData.description || '').trim(),
        eventDate: claimData.eventDate || null,
        noticeDate: claimData.noticeDate || null,
        claimedAmount,
        approvedAmount: 0,
        claimedDays,
        approvedDays: 0,
        clientReference: claimData.clientReference || null,
        changeEventReference: claimData.changeEventReference || null,
        status: 'DRAFT',
        createdBy: actor,
        reviewedBy: null,
        approvedBy: null,
        approvedDate: null,
        rejectionReason: null,
        createdAt: now,
        updatedAt: now,
      }).returning();

      if (!claim) throw new Error('Contract claim could not be created.');

      const evidence = Array.isArray(claimData.evidenceDocuments) ? claimData.evidenceDocuments : [];
      for (const item of evidence) {
        const documentId = String(item?.documentId || '').trim();
        const evidenceType = String(item?.evidenceType || '').trim();
        if (!documentId || !evidenceType) throw new Error('Claim evidence requires documentId and evidenceType.');

        const [doc] = await tx.select({ id: phase61DocumentFiles.id })
          .from(phase61DocumentFiles)
          .where(and(eq(phase61DocumentFiles.id, documentId), eq(phase61DocumentFiles.isDeleted, false)))
          .limit(1);
        if (!doc) throw new Error(`Evidence document ${documentId} was not found.`);

        await tx.insert(contractChangeEvidence).values({
          id: crypto.randomUUID(),
          contractId: contract.id,
          entityType: 'CLAIM',
          entityId: claim.id,
          documentId,
          evidenceType,
          notes: item.notes ? String(item.notes) : null,
          createdBy: actor,
          createdAt: now,
          isDeleted: false,
        }).onConflictDoNothing();
      }

      return claim;
    });
  }

  async updateContractClaimStatus(id: string, status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SETTLED' | 'CLOSED', actorName: string, options: { approvedAmount?: number; approvedDays?: number; rejectionReason?: string } = {}) {
    const actor = String(actorName || '').trim();
    if (!actor) throw new Error('Authenticated claim workflow actor identity is required.');

    return await db.transaction(async (tx) => {
      const [claim] = await tx.select().from(contractClaims).where(eq(contractClaims.id, id)).limit(1);
      if (!claim) return null;

      const transitions: Record<string, string[]> = {
        DRAFT: ['SUBMITTED'],
        SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
        UNDER_REVIEW: ['APPROVED', 'REJECTED'],
        APPROVED: ['SETTLED', 'CLOSED'],
        REJECTED: ['DRAFT', 'CLOSED'],
        SETTLED: ['CLOSED'],
        CLOSED: [],
      };
      if (!transitions[claim.status]?.includes(status)) {
        throw new Error(`Invalid claim status transition: ${claim.status} → ${status}`);
      }

      const rejectionReason = String(options.rejectionReason || '').trim();
      if (status === 'REJECTED' && !rejectionReason) {
        throw new Error('Claim rejection reason is required.');
      }

      if (status === 'UNDER_REVIEW' && claim.createdBy.trim().toLowerCase() === actor.toLowerCase()) {
        throw new Error('Maker-checker violation: claim creator cannot move the claim into review.');
      }

      const approvedAmount = options.approvedAmount === undefined ? (claim.approvedAmount || 0) : Number(options.approvedAmount);
      const approvedDays = options.approvedDays === undefined ? (claim.approvedDays || 0) : Number(options.approvedDays);
      if (!Number.isFinite(approvedAmount) || approvedAmount < 0 || approvedAmount > claim.claimedAmount) {
        throw new Error('Approved claim amount is invalid.');
      }
      if (!Number.isInteger(approvedDays) || approvedDays < 0 || approvedDays > claim.claimedDays) {
        throw new Error('Approved claim days are invalid.');
      }

      if (status === 'APPROVED' && claim.createdBy.trim().toLowerCase() === actor.toLowerCase()) {
        throw new Error('Maker-checker violation: claim creator cannot approve the same claim.');
      }

      const now = new Date().toISOString();
      const [updated] = await tx.update(contractClaims).set({
        status,
        approvedAmount: status === 'APPROVED' ? approvedAmount : claim.approvedAmount,
        approvedDays: status === 'APPROVED' ? approvedDays : claim.approvedDays,
        reviewedBy: ['UNDER_REVIEW', 'APPROVED'].includes(status) ? actor : claim.reviewedBy,
        approvedBy: status === 'APPROVED' ? actor : claim.approvedBy,
        approvedDate: status === 'APPROVED' ? now.split('T')[0] : claim.approvedDate,
        rejectionReason: status === 'REJECTED' ? rejectionReason : claim.rejectionReason,
        updatedAt: now,
      }).where(eq(contractClaims.id, id)).returning();

      if (!updated) return null;

      const [contract] = await tx.select().from(phase57Contracts).where(eq(phase57Contracts.id, claim.contractId)).limit(1);
      if (contract) {
        await tx.insert(contractLogs).values({
          id: crypto.randomUUID(),
          contractId: contract.id,
          contractNumber: contract.contractNumber,
          actionType: 'CLAIM',
          performedBy: actor,
          details: `${status} claim ${claim.claimNumber}${rejectionReason ? `. ${rejectionReason}` : ''}`,
          createdAt: now,
        });
      }

      return updated;
    });
  }

  async getContractChangeEvidence(entityType: 'VARIATION' | 'EXTENSION' | 'CLAIM', entityId: string) {
    return db.select().from(contractChangeEvidence)
      .where(and(eq(contractChangeEvidence.entityType, entityType), eq(contractChangeEvidence.entityId, entityId), eq(contractChangeEvidence.isDeleted, false)))
      .orderBy(desc(contractChangeEvidence.createdAt));
  }

  async linkContractChangeEvidence(data: { contractId: string; entityType: 'VARIATION' | 'EXTENSION' | 'CLAIM'; entityId: string; documentId: string; evidenceType: string; notes?: string; createdBy: string }) {
    const actor = String(data.createdBy || '').trim();
    if (!actor) throw new Error('Authenticated evidence actor identity is required.');

    return await db.transaction(async (tx) => {
      const [doc] = await tx.select().from(phase61DocumentFiles)
        .where(and(eq(phase61DocumentFiles.id, data.documentId), eq(phase61DocumentFiles.isDeleted, false))).limit(1);
      if (!doc) throw new Error('Evidence document not found.');

      const [contract] = await tx.select().from(phase57Contracts)
        .where(and(eq(phase57Contracts.id, data.contractId), eq(phase57Contracts.isDeleted, false))).limit(1);
      if (!contract) throw new Error('Contract not found.');

      if (doc.contractId && doc.contractId !== data.contractId) {
        throw new Error('Evidence document belongs to a different contract.');
      }
      if (doc.projectId && contract.projectId && doc.projectId !== contract.projectId) {
        throw new Error('Evidence document belongs to a different project.'); 
      }

      const [entity] = data.entityType === 'VARIATION'
        ? await tx.select({ id: contractVariations.id, contractId: contractVariations.contractId }).from(contractVariations).where(eq(contractVariations.id, data.entityId)).limit(1)
        : data.entityType === 'EXTENSION'
          ? await tx.select({ id: contractExtensions.id, contractId: contractExtensions.contractId }).from(contractExtensions).where(eq(contractExtensions.id, data.entityId)).limit(1)
          : await tx.select({ id: contractClaims.id, contractId: contractClaims.contractId }).from(contractClaims).where(eq(contractClaims.id, data.entityId)).limit(1);
      if (!entity || entity.contractId !== data.contractId) throw new Error('Change record does not belong to the selected contract.');

      const [link] = await tx.insert(contractChangeEvidence).values({
        id: crypto.randomUUID(),
        contractId: data.contractId,
        entityType: data.entityType,
        entityId: data.entityId,
        documentId: data.documentId,
        evidenceType: String(data.evidenceType || '').trim(),
        notes: data.notes ? String(data.notes) : null,
        createdBy: actor,
        createdAt: new Date().toISOString(),
        isDeleted: false,
      }).onConflictDoNothing().returning();

      return link || null;
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
    const actor = String(extensionData.requestedBy || '').trim();
    if (!actor) throw new Error('Authenticated extension requester identity is required.');

    return await db.transaction(async (tx) => {
      const [contract] = await tx.select().from(phase57Contracts)
        .where(and(eq(phase57Contracts.id, extensionData.contractId), eq(phase57Contracts.isDeleted, false)))
        .limit(1);
      if (!contract) throw new Error('Contract not found.');

      const extensionDays = Number(extensionData.extensionDays);
      if (!Number.isInteger(extensionDays) || extensionDays < 1) throw new Error('Extension days must be a positive integer.');

      const baseEndDate = String(extensionData.originalEndDate || contract.revisedEndDate || contract.endDate);
      const newEndDate = String(extensionData.newEndDate || '').trim();
      if (!newEndDate) throw new Error('New end date is required.');
      if (new Date(newEndDate) <= new Date(baseEndDate)) throw new Error('New end date must be later than the current contract end date.');

      const now = new Date().toISOString();
      const [ext] = await tx.insert(contractExtensions).values({
        projectId: extensionData.projectId || contract.projectId || null,
        wbsId: extensionData.wbsId || null,
        causeType: extensionData.causeType || null,
        changeEventReference: extensionData.changeEventReference || null,
        extensionDays,
        originalEndDate: baseEndDate,
        newEndDate,
        noticeDate: extensionData.noticeDate || null,
        eventDate: extensionData.eventDate || null,
        status: 'REQUESTED',
        requestedBy: actor,
        approvedBy: null,
        approvedDate: null,
        createdAt: now,
        updatedAt: now,
      }).returning();

      if (!ext) throw new Error('Contract extension request could not be created.');

      const evidence = Array.isArray(extensionData.evidenceDocuments) ? extensionData.evidenceDocuments : [];
      for (const item of evidence) {
        const documentId = String(item?.documentId || '').trim();
        const evidenceType = String(item?.evidenceType || '').trim();
        if (!documentId || !evidenceType) throw new Error('Extension evidence requires documentId and evidenceType.');

        const [doc] = await tx.select({ id: phase61DocumentFiles.id })
          .from(phase61DocumentFiles)
          .where(and(eq(phase61DocumentFiles.id, documentId), eq(phase61DocumentFiles.isDeleted, false)))
          .limit(1);
        if (!doc) throw new Error(`Evidence document ${documentId} was not found.`);

        await tx.insert(contractChangeEvidence).values({
          id: crypto.randomUUID(),
          contractId: contract.id,
          entityType: 'EXTENSION',
          entityId: ext.id,
          documentId,
          evidenceType,
          notes: item.notes ? String(item.notes) : null,
          createdBy: actor,
          createdAt: now,
          isDeleted: false,
        }).onConflictDoNothing();
      }

      await tx.insert(contractLogs).values({
        id: crypto.randomUUID(),
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        actionType: 'EXTEND',
        performedBy: actor,
        details: `Submitted extension request for ${contract.contractNumber}: ${ext.extensionDays} day(s)`,
        createdAt: now,
      });

      return ext;
    });
  }

  async updateContractExtensionStatus(id: string, status: 'APPROVED' | 'REJECTED', approvedBy: string, comments?: string) {
    const actor = String(approvedBy || '').trim();
    if (!actor) throw new Error('Authenticated approver identity is required.');

    return await db.transaction(async (tx) => {
      const [extension] = await tx.select().from(contractExtensions).where(eq(contractExtensions.id, id)).limit(1);
      if (!extension) return null;
      if (extension.status !== 'REQUESTED') throw new Error(`Extension cannot be ${status.toLowerCase()} from status ${extension.status}.`);
      if (extension.requestedBy && extension.requestedBy.trim().toLowerCase() === actor.toLowerCase()) {
        throw new Error('Maker-checker violation: extension requester cannot approve or reject the same extension.');
      }

      const [contract] = await tx.select().from(phase57Contracts).where(eq(phase57Contracts.id, extension.contractId)).limit(1);
      if (!contract) throw new Error('Contract not found.');

      if (status === 'APPROVED' && new Date(extension.newEndDate) <= new Date(contract.revisedEndDate || contract.endDate)) {
        throw new Error('Approved extension end date must be later than the current revised contract end date.');
      }

      const [updated] = await tx.update(contractExtensions).set({
        status,
        approvedBy: actor,
        approvedDate: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
      }).where(eq(contractExtensions.id, id)).returning();

      if (!updated) return null;

      if (status === 'APPROVED') {
        await tx.update(phase57Contracts).set({
          revisedEndDate: extension.newEndDate,
          updatedAt: new Date().toISOString(),
          updatedBy: actor,
        }).where(eq(phase57Contracts.id, contract.id));
      }

      await tx.insert(contractLogs).values({
        id: crypto.randomUUID(),
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        actionType: 'EXTEND',
        performedBy: actor,
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
