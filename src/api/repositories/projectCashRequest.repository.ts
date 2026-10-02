import { db } from '../../db';
import { projectCashRequestsTable, projectCashSettlementsTable, auditLogs, projects } from '../../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { currencyRepository } from './currency.repository';
import { numberingService } from '../services/numbering.service';
import { enterpriseAuditRepository } from './enterprise_audit.repository';

export interface ProjectCashRequestFilter {
  projectId?: string;
  employeeId?: string;
  status?: string;
  category?: string;
  search?: string;
}

export class ProjectCashRequestRepository {
  async getAll(filter?: ProjectCashRequestFilter) {
    let query = db.select().from(projectCashRequestsTable).orderBy(desc(projectCashRequestsTable.createdAt));
    const results = await query;

    return results.filter(row => {
      if (filter?.projectId && row.projectId !== filter.projectId) return false;
      if (filter?.employeeId && row.employeeId !== filter.employeeId) return false;
      if (filter?.status && filter.status !== 'ALL' && row.status !== filter.status) return false;
      if (filter?.category && filter.category !== 'ALL' && row.category !== filter.category) return false;
      if (filter?.search) {
        const s = filter.search.toLowerCase();
        return (
          row.requestCode.toLowerCase().includes(s) ||
          row.projectName.toLowerCase().includes(s) ||
          row.employeeName.toLowerCase().includes(s) ||
          row.purpose.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }

  async getById(id: string) {
    const rows = await db.select().from(projectCashRequestsTable).where(eq(projectCashRequestsTable.id, id));
    return rows[0] || null;
  }

  async create(data: any) {
    const projectId = String(data.projectId || '').trim();
    const employeeId = String(data.employeeId || '').trim();
    const employeeName = String(data.employeeName || '').trim();
    if (!projectId || !employeeId || !employeeName) {
      throw new Error('Project and authenticated employee context are required.');
    }

    const [project] = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.isActive, true))).limit(1);
    if (!project) throw new Error('Project not found or inactive.');
    const companyId = String(data.companyId || project.companyId || '').trim();
    if (!companyId) throw new Error('Company context is required for cash-request numbering.');
    const id = `pcr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    const requestCode = data.requestCode || (await numberingService.generateCashRequestNumber({
      companyId,
      projectId: data.projectId || null,
      date: data.requiredDate || now,
    }));

    // Multi-Currency Resolution
    let currency = data.currency;
    if (!currency && data.projectId) {
      const proj = (await db.select().from(projects).where(eq(projects.id, data.projectId)))[0];
      if (proj && proj.currency) currency = proj.currency;
    }
    if (!currency) {
      const baseCur = await currencyRepository.getBaseCurrency();
      currency = baseCur.code || 'AED';
    }

    const baseCurrencyObj = await currencyRepository.getBaseCurrency();
    const baseCurrencyCode = baseCurrencyObj.code || 'AED';
    
    // Resolve conversion rate
    const rateInfo = await currencyRepository.getLatestRate(currency, baseCurrencyCode);
    const exchangeRate = rateInfo.rate || 1.0;
    const reqAmount = Number(data.amount) || 0;
    if (!Number.isFinite(reqAmount) || reqAmount <= 0) throw new Error('Cash request amount must be greater than zero.');
    if (!Number.isFinite(Number(data.approvedAmount ?? reqAmount)) || Number(data.approvedAmount ?? reqAmount) <= 0 || Number(data.approvedAmount ?? reqAmount) > reqAmount) {
      throw new Error('Approved amount must be positive and cannot exceed the requested amount.');
    }
    const baseAmount = Number((reqAmount * exchangeRate).toFixed(2));

    const record = {
      id,
      requestCode,
      projectId,
      projectName: data.projectName,
      employeeId,
      employeeName,
      employeeCode: data.employeeCode || '',
      divisionId: data.divisionId || null,
      divisionName: data.divisionName || '',
      departmentId: data.departmentId || null,
      departmentName: data.departmentName || '',
      currency,
      originalAmount: reqAmount,
      exchangeRate,
      baseAmount,
      baseCurrency: baseCurrencyCode,
      amount: reqAmount,
      approvedAmount: Number(data.approvedAmount ?? reqAmount),
      disbursedAmount: 0,
      purpose: data.purpose,
      category: data.category || 'SITE_OPERATIONS',
      requiredDate: data.requiredDate || now.split('T')[0],
      status: 'SUBMITTED',
      siteInchargeId: data.siteInchargeId || null,
      siteInchargeName: data.siteInchargeName || null,
      inchargeRemarks: data.inchargeRemarks || null,
      projectDirectorId: data.projectDirectorId || null,
      projectDirectorName: data.projectDirectorName || null,
      directorRemarks: data.directorRemarks || null,
      financeApproverId: data.financeApproverId || null,
      financeApproverName: data.financeApproverName || null,
      financeRemarks: data.financeRemarks || null,
      paymentMethod: data.paymentMethod || null,
      paymentReference: data.paymentReference || null,
      disbursedAt: null,
      settlementStatus: 'PENDING',
      settledAmount: 0,
      remainingBalance: reqAmount,
      supportingDocuments: data.supportingDocuments || [],
      approvalHistory: [
        {
          action: 'CREATED',
          by: data.employeeName,
          role: 'REQUESTER',
          timestamp: now,
          remarks: data.purpose,
        }
      ],
      auditTrail: [
        {
          event: 'REQUEST_SUBMITTED',
          timestamp: now,
          user: data.employeeName,
          amount: reqAmount,
          currency,
          exchangeRate,
        }
      ],
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(projectCashRequestsTable).values(record as any);

    await enterpriseAuditRepository.logEvent({
      userId: data.employeeId,
      userName: data.employeeName,
      actionType: 'CREATE',
      entityType: 'PROJECT_CASH',
      entityId: id,
      entityNumber: requestCode,
      fromState: 'DRAFT',
      toState: record.status,
      diffJson: {
        amount: reqAmount,
        currency,
        projectId: data.projectId,
      },
      metadata: {
        projectId: data.projectId,
        projectName: data.projectName,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        purpose: data.purpose,
        category: data.category,
      },
      reason: data.purpose || `Site cash request submitted for ${data.projectName}`,
    });

    return record;
  }

  async update(id: string, updates: Partial<typeof projectCashRequestsTable.$inferInsert>) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Cash request not found');

    const now = new Date().toISOString();
    const status = String(existing.status || '').toUpperCase();
    if (!['DRAFT', 'SUBMITTED', 'REJECTED'].includes(status)) {
      throw new Error('Cash request is locked at workflow status ' + status + '.');
    }

    const allowedFields = ['projectId', 'projectName', 'purpose', 'category', 'requiredDate', 'originalAmount', 'currency', 'amount', 'supportingDocuments'];
    const sanitized = Object.fromEntries(Object.entries(updates).filter(([key]) => allowedFields.includes(key)));

    const updated = {
      ...sanitized,
      employeeId: existing.employeeId,
      employeeName: existing.employeeName,
      updatedAt: now,
    };

    await db.update(projectCashRequestsTable).set(updated as any).where(eq(projectCashRequestsTable.id, id));
    return this.getById(id);
  }

  async reviewByIncharge(id: string, inchargeData: { inchargeId: string; inchargeName: string; remarks?: string; approved: boolean }) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Cash request not found');
    if (existing.status !== 'SUBMITTED') throw new Error('In-charge review is allowed only for submitted cash requests.');
    if (!inchargeData.inchargeId || !inchargeData.inchargeName?.trim()) throw new Error('Authenticated in-charge identity is required.');
    if (existing.employeeId === inchargeData.inchargeId) throw new Error('Maker-checker violation: requester cannot review their own cash request.');

    const now = new Date().toISOString();
    const history = (existing.approvalHistory as any[]) || [];
    history.push({
      action: inchargeData.approved ? 'INCHARGE_RECOMMENDED' : 'INCHARGE_REJECTED',
      by: inchargeData.inchargeName,
      role: 'SITE_INCHARGE',
      timestamp: now,
      remarks: inchargeData.remarks || '',
    });

    const newStatus = inchargeData.approved ? 'INCHARGE_REVIEWED' : 'REJECTED';

    await db.update(projectCashRequestsTable).set({
      status: newStatus,
      siteInchargeId: inchargeData.inchargeId,
      siteInchargeName: inchargeData.inchargeName,
      inchargeRemarks: inchargeData.remarks || '',
      approvalHistory: history,
      updatedAt: now,
    } as any).where(eq(projectCashRequestsTable.id, id));

    await enterpriseAuditRepository.logEvent({
      userId: inchargeData.inchargeId,
      userName: inchargeData.inchargeName,
      userRole: 'SITE_INCHARGE',
      actionType: inchargeData.approved ? 'RECOMMEND' : 'REJECT',
      entityType: 'PROJECT_CASH',
      entityId: id,
      entityNumber: existing.requestCode,
      fromState: existing.status,
      toState: newStatus,
      diffJson: { status: newStatus, inchargeRemarks: inchargeData.remarks },
      metadata: { projectId: existing.projectId, projectName: existing.projectName },
      reason: inchargeData.remarks || `Incharge review: ${newStatus}`,
    });

    return this.getById(id);
  }

  async approveByDirector(id: string, directorData: { directorId: string; directorName: string; approvedAmount?: number; remarks?: string; approved: boolean }) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Cash request not found');
    if (existing.status !== 'INCHARGE_REVIEWED') throw new Error('Director approval is allowed only after in-charge review.');
    if (!directorData.directorId || !directorData.directorName?.trim()) throw new Error('Authenticated director identity is required.');
    if (existing.employeeId === directorData.directorId || existing.siteInchargeId === directorData.directorId) {
      throw new Error('Maker-checker violation: requester/reviewer cannot approve the same cash request.');
    }

    const now = new Date().toISOString();
    const history = (existing.approvalHistory as any[]) || [];
    history.push({
      action: directorData.approved ? 'DIRECTOR_APPROVED' : 'DIRECTOR_REJECTED',
      by: directorData.directorName,
      role: 'PROJECT_DIRECTOR',
      timestamp: now,
      remarks: directorData.remarks || '',
      approvedAmount: directorData.approvedAmount || existing.amount,
    });

    const approvedAmount = directorData.approved ? Number(directorData.approvedAmount ?? existing.amount) : 0;
    if (directorData.approved && (!Number.isFinite(approvedAmount) || approvedAmount <= 0 || approvedAmount > existing.amount)) {
      throw new Error('Approved cash amount must be positive and cannot exceed the requested amount.');
    }

    const newStatus = directorData.approved ? 'APPROVED' : 'REJECTED';

    await db.update(projectCashRequestsTable).set({
      status: newStatus,
      approvedAmount,
      projectDirectorId: directorData.directorId,
      projectDirectorName: directorData.directorName,
      directorRemarks: directorData.remarks || '',
      approvalHistory: history,
      updatedAt: now,
    } as any).where(eq(projectCashRequestsTable.id, id));

    await enterpriseAuditRepository.logEvent({
      userId: directorData.directorId,
      userName: directorData.directorName,
      userRole: 'PROJECT_DIRECTOR',
      actionType: directorData.approved ? 'APPROVE' : 'REJECT',
      entityType: 'PROJECT_CASH',
      entityId: id,
      entityNumber: existing.requestCode,
      fromState: existing.status,
      toState: newStatus,
      diffJson: { status: newStatus, approvedAmount: directorData.approvedAmount },
      metadata: { projectId: existing.projectId, projectName: existing.projectName },
      reason: directorData.remarks || `Director authorization: ${newStatus}`,
    });

    return this.getById(id);
  }

  async disburseByFinance(id: string, financeData: { financeId: string; financeName: string; paymentMethod: string; paymentReference: string; disbursedAmount: number; remarks?: string }) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Cash request not found');
    if (existing.status !== 'APPROVED') throw new Error('Finance disbursement is allowed only for approved cash requests.');
    if (!financeData.financeId || !financeData.financeName?.trim()) throw new Error('Authenticated finance identity is required.');
    if (existing.employeeId === financeData.financeId) throw new Error('Maker-checker violation: requester cannot disburse their own cash request.');
    if (!String(financeData.paymentMethod || '').trim() || !String(financeData.paymentReference || '').trim()) {
      throw new Error('Payment method and payment reference are required.');
    }
    const disbursedAmount = Number(financeData.disbursedAmount);
    const approvedAmount = Number(existing.approvedAmount || existing.amount);
    if (!Number.isFinite(disbursedAmount) || disbursedAmount <= 0 || disbursedAmount > approvedAmount) {
      throw new Error('Disbursed amount must be positive and cannot exceed the approved amount.');
    }

    const now = new Date().toISOString();
    const history = (existing.approvalHistory as any[]) || [];
    history.push({
      action: 'DISBURSED',
      by: financeData.financeName,
      role: 'FINANCE_OFFICER',
      timestamp: now,
      remarks: financeData.remarks || '',
      reference: financeData.paymentReference,
    });

    await db.update(projectCashRequestsTable).set({
      status: 'DISBURSED',
      disbursedAmount,
      remainingBalance: financeData.disbursedAmount,
      paymentMethod: financeData.paymentMethod,
      paymentReference: financeData.paymentReference,
      financeApproverId: financeData.financeId,
      financeApproverName: financeData.financeName,
      financeRemarks: financeData.remarks || '',
      disbursedAt: now,
      settlementStatus: 'PENDING',
      approvalHistory: history,
      updatedAt: now,
    } as any).where(eq(projectCashRequestsTable.id, id));

    await enterpriseAuditRepository.logEvent({
      userId: financeData.financeId,
      userName: financeData.financeName,
      userRole: 'FINANCE_OFFICER',
      actionType: 'DISBURSE',
      entityType: 'PROJECT_CASH',
      entityId: id,
      entityNumber: existing.requestCode,
      fromState: existing.status,
      toState: 'DISBURSED',
      diffJson: {
        disbursedAmount: financeData.disbursedAmount,
        paymentMethod: financeData.paymentMethod,
        paymentReference: financeData.paymentReference,
      },
      metadata: { projectId: existing.projectId, projectName: existing.projectName },
      reason: financeData.remarks || `Cash disbursed with ref ${financeData.paymentReference}`,
    });

    return this.getById(id);
  }

  async submitSettlement(requestId: string, settlementData: {
    settlementCode?: string;
    employeeId: string;
    employeeName: string;
    totalExpenseAmount: number;
    unspentCashReturned: number;
    voucherItems: any[];
    invoicesAndReceipts: any[];
  }) {
    const request = await this.getById(requestId);
    if (!request) throw new Error('Cash request not found');
    if (request.status !== 'DISBURSED') throw new Error('Settlement can be submitted only after cash disbursement.');
    if (!settlementData.employeeId || !settlementData.employeeName?.trim()) throw new Error('Authenticated settlement actor identity is required.');
    if (request.employeeId !== settlementData.employeeId) throw new Error('Only the original requester can submit this settlement.');

    const totalExpense = Number(settlementData.totalExpenseAmount);
    const unspent = Number(settlementData.unspentCashReturned);
    const available = Number(request.disbursedAmount || request.approvedAmount || request.amount);
    if (!Number.isFinite(totalExpense) || totalExpense < 0 || !Number.isFinite(unspent) || unspent < 0 || totalExpense + unspent > available) {
      throw new Error('Settlement expense plus returned cash cannot exceed the disbursed amount.');
    }

    const now = new Date().toISOString();
    const settlementId = `stl-${Date.now()}`;
    const settlementCode = settlementData.settlementCode || (await numberingService.generateCashSettlementNumber({
      companyId: (request as any).companyId || undefined,
      projectId: request.projectId || null,
      date: now,
    }));

    const currency = request.currency || 'AED';
    const baseCurrencyCode = request.baseCurrency || 'AED';
    const exchangeRate = request.exchangeRate || 1.0;
    const totalExpense = Number(settlementData.totalExpenseAmount) || 0;
    const baseExpenseAmount = Number((totalExpense * exchangeRate).toFixed(2));

    const settlementRecord = {
      id: settlementId,
      settlementCode,
      cashRequestId: requestId,
      projectId: request.projectId,
      employeeId: settlementData.employeeId,
      employeeName: settlementData.employeeName,
      currency,
      originalExpenseAmount: totalExpense,
      exchangeRate,
      baseExpenseAmount,
      baseCurrency: baseCurrencyCode,
      totalExpenseAmount: totalExpense,
      unspentCashReturned: settlementData.unspentCashReturned,
      status: 'SUBMITTED',
      voucherItems: settlementData.voucherItems || [],
      invoicesAndReceipts: settlementData.invoicesAndReceipts || [],
      auditorId: null,
      auditorName: null,
      auditRemarks: null,
      submittedAt: now,
      settledAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(projectCashSettlementsTable).values(settlementRecord as any);

    // Update Cash Request Status
    await db.update(projectCashRequestsTable).set({
      settlementStatus: 'SUBMITTED',
      settledAmount: settlementData.totalExpenseAmount,
      remainingBalance: Math.max(0, (request.disbursedAmount || request.amount) - settlementData.totalExpenseAmount - settlementData.unspentCashReturned),
      updatedAt: now,
    } as any).where(eq(projectCashRequestsTable.id, requestId));

    await enterpriseAuditRepository.logEvent({
      userId: settlementData.employeeId,
      userName: settlementData.employeeName,
      actionType: 'CREATE',
      entityType: 'CASH_SETTLEMENT',
      entityId: settlementId,
      entityNumber: settlementCode,
      fromState: 'DRAFT',
      toState: 'SUBMITTED',
      diffJson: {
        totalExpenseAmount: totalExpense,
        unspentCashReturned: settlementData.unspentCashReturned,
        cashRequestId: requestId,
      },
      metadata: {
        projectId: request.projectId,
        cashRequestId: requestId,
        settlementCode,
      },
      reason: `Settlement submitted for cash request ${request.requestCode}`,
    });

    return settlementRecord;
  }

  async auditSettlement(settlementId: string, auditData: { auditorId: string; auditorName: string; remarks: string; approved: boolean }) {
    const rows = await db.select().from(projectCashSettlementsTable).where(eq(projectCashSettlementsTable.id, settlementId));
    const settlement = rows[0];
    if (!settlement) throw new Error('Settlement record not found');
    if (!auditData.auditorId || !auditData.auditorName?.trim()) throw new Error('Authenticated auditor identity is required.');
    if (settlement.employeeId === auditData.auditorId) throw new Error('Maker-checker violation: settlement submitter cannot audit the same settlement.');

    const now = new Date().toISOString();
    const status = auditData.approved ? 'AUDITED' : 'REJECTED';

    await db.update(projectCashSettlementsTable).set({
      status,
      auditorId: auditData.auditorId,
      auditorName: auditData.auditorName,
      auditRemarks: auditData.remarks,
      settledAt: auditData.approved ? now : null,
      updatedAt: now,
    } as any).where(eq(projectCashSettlementsTable.id, settlementId));

    if (auditData.approved) {
      await db.update(projectCashRequestsTable).set({
        status: 'SETTLED',
        settlementStatus: 'SETTLED',
        updatedAt: now,
      } as any).where(eq(projectCashRequestsTable.id, settlement.cashRequestId));
    }

    await enterpriseAuditRepository.logEvent({
      userId: auditData.auditorId,
      userName: auditData.auditorName,
      userRole: 'FINANCE_AUDITOR',
      actionType: auditData.approved ? 'AUDIT' : 'REJECT',
      entityType: 'CASH_SETTLEMENT',
      entityId: settlementId,
      entityNumber: settlement.settlementCode,
      fromState: settlement.status,
      toState: status,
      diffJson: { status, remarks: auditData.remarks },
      metadata: {
        cashRequestId: settlement.cashRequestId,
        settlementCode: settlement.settlementCode,
      },
      reason: auditData.remarks || `Settlement audit outcome: ${status}`,
    });

    return { success: true, status };
  }

  async getSettlementsForRequest(requestId: string) {
    return db.select().from(projectCashSettlementsTable).where(eq(projectCashSettlementsTable.cashRequestId, requestId));
  }
}

export const projectCashRequestRepository = new ProjectCashRequestRepository();
