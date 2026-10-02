import { db } from '../../db';
import {
  phase60ChartOfAccounts,
  phase60CostCenters,
  phase60JournalEntries,
  phase60JournalLines,
  phase60GeneralLedger,
  phase60APInvoices,
  phase60ARInvoices,
  phase60BankAccounts,
  phase60CashTransactions,
  phase60BudgetMasters,
  phase60TaxRecords,
} from '../../db/schema';
import { eq, and, isNull, desc, sql, sum } from 'drizzle-orm';
import crypto from 'crypto';

let tablesCreated = false;

export async function ensureFinanceTablesExist() {
  if (tablesCreated) return;
  try {
    const existing = await db.select().from(phase60ChartOfAccounts).where(isNull(phase60ChartOfAccounts.deletedAt));
    if (existing.length < 15) {
      const now = new Date().toISOString().split('T')[0];
      const existingCodes = new Set(existing.map(a => a.accountCode));

      const standardAccounts = [
        { accountCode: '1010', accountName: 'Cash & Bank Operating', accountGroup: 'ASSETS', accountType: 'CURRENT_ASSET', initialBalance: 3435000 },
        { accountCode: '1020', accountName: 'Petty Cash Reserve', accountGroup: 'ASSETS', accountType: 'CURRENT_ASSET', initialBalance: 25000 },
        { accountCode: '1030', accountName: 'Accounts Receivable Control', accountGroup: 'ASSETS', accountType: 'CURRENT_ASSET', initialBalance: 420000 },
        { accountCode: '1040', accountName: 'Contract Retention Receivable', accountGroup: 'ASSETS', accountType: 'CURRENT_ASSET', initialBalance: 150000 },
        { accountCode: '1050', accountName: 'Employee Advances & Imprest', accountGroup: 'ASSETS', accountType: 'CURRENT_ASSET', initialBalance: 45000 },
        { accountCode: '1060', accountName: 'Construction Inventory & Stores', accountGroup: 'ASSETS', accountType: 'CURRENT_ASSET', initialBalance: 680000 },
        { accountCode: '1510', accountName: 'Heavy Plant & Machinery', accountGroup: 'ASSETS', accountType: 'FIXED_ASSET', initialBalance: 1250000 },
        { accountCode: '1520', accountName: 'Motor Vehicles & Fleet', accountGroup: 'ASSETS', accountType: 'FIXED_ASSET', initialBalance: 430000 },
        { accountCode: '2010', accountName: 'Accounts Payable Control - Trade Creditors', accountGroup: 'LIABILITIES', accountType: 'CURRENT_LIABILITY', initialBalance: 285000 },
        { accountCode: '2020', accountName: 'Payroll & Wages Payable', accountGroup: 'LIABILITIES', accountType: 'CURRENT_LIABILITY', initialBalance: 180000 },
        { accountCode: '2030', accountName: 'Statutory Taxes & Social Security Payable', accountGroup: 'LIABILITIES', accountType: 'CURRENT_LIABILITY', initialBalance: 95000 },
        { accountCode: '2040', accountName: 'Subcontractor Retention Payable', accountGroup: 'LIABILITIES', accountType: 'CURRENT_LIABILITY', initialBalance: 140000 },
        { accountCode: '2050', accountName: 'Employee Expense Reimbursement Payable', accountGroup: 'LIABILITIES', accountType: 'CURRENT_LIABILITY', initialBalance: 35000 },
        { accountCode: '2060', accountName: 'Client Mobilization Advance', accountGroup: 'LIABILITIES', accountType: 'CURRENT_LIABILITY', initialBalance: 515000 },
        { accountCode: '3010', accountName: 'Paid-up Share Capital', accountGroup: 'EQUITY', accountType: 'EQUITY', initialBalance: 2500000 },
        { accountCode: '3020', accountName: 'Retained Earnings', accountGroup: 'EQUITY', accountType: 'EQUITY', initialBalance: 1100000 },
        { accountCode: '4010', accountName: 'Construction Contract Revenue (IPC)', accountGroup: 'REVENUE', accountType: 'OPERATING_REVENUE', initialBalance: 3420000 },
        { accountCode: '4020', accountName: 'Variation & Change Order Revenue', accountGroup: 'REVENUE', accountType: 'OPERATING_REVENUE', initialBalance: 280000 },
        { accountCode: '5010', accountName: 'Direct Site Materials & Consumables', accountGroup: 'EXPENSES', accountType: 'DIRECT_EXPENSE', initialBalance: 850000 },
        { accountCode: '5020', accountName: 'Subcontractor Works Incurred', accountGroup: 'EXPENSES', accountType: 'DIRECT_EXPENSE', initialBalance: 520000 },
        { accountCode: '5030', accountName: 'Direct Site Labor & Wages', accountGroup: 'EXPENSES', accountType: 'DIRECT_EXPENSE', initialBalance: 340000 },
        { accountCode: '5040', accountName: 'Plant, Fleet & Equipment Operating', accountGroup: 'EXPENSES', accountType: 'DIRECT_EXPENSE', initialBalance: 180000 },
        { accountCode: '5050', accountName: 'Site Operational & Petty Cash Expenses', accountGroup: 'EXPENSES', accountType: 'DIRECT_EXPENSE', initialBalance: 65000 },
        { accountCode: '6010', accountName: 'Corporate Salaries & Staff Benefits', accountGroup: 'EXPENSES', accountType: 'INDIRECT_EXPENSE', initialBalance: 115000 },
        { accountCode: '6020', accountName: 'Office Administration & Utilities', accountGroup: 'EXPENSES', accountType: 'INDIRECT_EXPENSE', initialBalance: 45000 },
      ];

      for (const sa of standardAccounts) {
        if (!existingCodes.has(sa.accountCode)) {
          await db.insert(phase60ChartOfAccounts).values({
            id: crypto.randomUUID(),
            accountCode: sa.accountCode,
            accountName: sa.accountName,
            accountGroup: sa.accountGroup,
            accountType: sa.accountType,
            parentAccountId: null,
            isHeaderAccount: false,
            currency: 'USD',
            currentBalance: sa.initialBalance,
            status: 'ACTIVE',
            createdAt: now,
            updatedAt: now,
            createdBy: 'System Administrator',
            updatedBy: 'System Administrator',
          });
        }
      }
    }

    // Seed default bank accounts if empty
    const bankList = await db.select().from(phase60BankAccounts).where(isNull(phase60BankAccounts.deletedAt));
    if (bankList.length === 0) {
      const now = new Date().toISOString().split('T')[0];
      await db.insert(phase60BankAccounts).values([
        {
          id: crypto.randomUUID(),
          accountNumber: 'ENBD-00921-4820',
          bankName: 'Emirates NBD Corporate Banking',
          branchName: 'Dubai Financial District Branch',
          swiftCode: 'EBILAEADXXX',
          currency: 'USD',
          currentBalance: 3435000,
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Administrator',
          updatedBy: 'System Administrator',
        },
        {
          id: crypto.randomUUID(),
          accountNumber: 'CASH-VAULT-01',
          bankName: 'Site Treasury Vault',
          branchName: 'Headquarters Vault',
          swiftCode: null,
          currency: 'USD',
          currentBalance: 25000,
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Administrator',
          updatedBy: 'System Administrator',
        },
      ]);
    }

    // Seed default AP invoices if empty
    const apList = await db.select().from(phase60APInvoices).where(isNull(phase60APInvoices.deletedAt));
    if (apList.length === 0) {
      const now = new Date().toISOString().split('T')[0];
      await db.insert(phase60APInvoices).values([
        {
          id: crypto.randomUUID(),
          invoiceNumber: 'INV-ERM-2026-089',
          vendorId: 'vnd-001',
          vendorName: 'Emirates Ready Mix Concrete LLC',
          invoiceDate: now,
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          totalAmount: 120000,
          taxAmount: 5715,
          paidAmount: 0,
          outstandingAmount: 120000,
          status: 'UNPAID',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Administrator',
          updatedBy: 'System Administrator',
        },
        {
          id: crypto.randomUUID(),
          invoiceNumber: 'INV-AFM-2026-112',
          vendorId: 'vnd-002',
          vendorName: 'Al-Futtaim Heavy Machinery & Equipment',
          invoiceDate: now,
          dueDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
          totalAmount: 165000,
          taxAmount: 7858,
          paidAmount: 0,
          outstandingAmount: 165000,
          status: 'UNPAID',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Administrator',
          updatedBy: 'System Administrator',
        },
      ]);
    }

    // Seed default AR invoices if empty
    const arList = await db.select().from(phase60ARInvoices).where(isNull(phase60ARInvoices.deletedAt));
    if (arList.length === 0) {
      const now = new Date().toISOString().split('T')[0];
      await db.insert(phase60ARInvoices).values([
        {
          id: crypto.randomUUID(),
          invoiceNumber: 'AR-INV-2026-001',
          customerId: 'cust-001',
          customerName: 'Dubai Water & Electricity Authority (DEWA)',
          projectId: 'PRJ-101',
          projectName: 'Dubai Creek Harbor Desalination WTP',
          invoiceDate: now,
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          totalAmount: 420000,
          taxAmount: 20000,
          receivedAmount: 0,
          outstandingAmount: 420000,
          status: 'UNPAID',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Administrator',
          updatedBy: 'System Administrator',
        },
      ]);
    }

    tablesCreated = true;
  } catch (e) {
    console.error('Error ensuring Finance tables exist:', e);
  }
}

export class FinanceRepository {
  async findAccounts() {
    await ensureFinanceTablesExist();
    return await db.select().from(phase60ChartOfAccounts)
      .where(isNull(phase60ChartOfAccounts.deletedAt))
      .orderBy(phase60ChartOfAccounts.accountCode);
  }

  async findAccountByCode(code: string) {
    await ensureFinanceTablesExist();
    const res = await db.select().from(phase60ChartOfAccounts)
      .where(and(eq(phase60ChartOfAccounts.accountCode, code), isNull(phase60ChartOfAccounts.deletedAt)));
    return res[0] || null;
  }

  async createAccount(data: any) {
    await ensureFinanceTablesExist();
    const id = crypto.randomUUID();
    const now = new Date().toISOString().split('T')[0];
    const newAcc = {
      id,
      accountCode: data.accountCode,
      accountName: data.accountName,
      accountGroup: data.accountGroup,
      accountType: data.accountType,
      parentAccountId: data.parentAccountId || null,
      isHeaderAccount: data.isHeaderAccount || false,
      currency: data.currency || 'USD',
      currentBalance: data.initialBalance || 0,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };
    await db.insert(phase60ChartOfAccounts).values(newAcc);
    return newAcc;
  }

  async findCostCenters() {
    await ensureFinanceTablesExist();
    return await db.select().from(phase60CostCenters)
      .where(isNull(phase60CostCenters.deletedAt))
      .orderBy(phase60CostCenters.code);
  }

  async createCostCenter(data: any) {
    await ensureFinanceTablesExist();
    const id = crypto.randomUUID();
    const now = new Date().toISOString().split('T')[0];
    const newCC = {
      id,
      code: data.code,
      name: data.name,
      centerType: data.centerType || 'COST_CENTER',
      department: data.department || 'CIVIL_WORKS',
      managerName: data.managerName || 'Financial Controller',
      annualBudget: data.annualBudget || 0,
      utilizedAmount: 0,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };
    await db.insert(phase60CostCenters).values(newCC);
    return newCC;
  }

  async findJournalEntries() {
    await ensureFinanceTablesExist();
    return await db.select().from(phase60JournalEntries)
      .where(isNull(phase60JournalEntries.deletedAt))
      .orderBy(desc(phase60JournalEntries.createdAt));
  }

  async createJournalEntry(entryData: any, lines: any[]) {
    await ensureFinanceTablesExist();

    // Idempotency: Prevent duplicate posting if already recorded with same reference and voucher type
    if (entryData.referenceNumber && entryData.voucherType) {
      const existing = await db.select().from(phase60JournalEntries)
        .where(and(
          eq(phase60JournalEntries.referenceNumber, entryData.referenceNumber),
          eq(phase60JournalEntries.voucherType, entryData.voucherType),
          isNull(phase60JournalEntries.deletedAt)
        ));
      if (existing.length > 0) {
        return existing[0];
      }
    }

    const journalId = crypto.randomUUID();
    const now = new Date().toISOString().split('T')[0];
    const voucherNumber = entryData.voucherNumber || `JV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    let totalDebit = 0;
    let totalCredit = 0;

    lines.forEach(l => {
      totalDebit += Number(l.debitAmount || 0);
      totalCredit += Number(l.creditAmount || 0);
    });

    if (Math.abs(totalDebit - totalCredit) >= 0.01) {
      throw new Error(`Double-Entry Imbalance: Total Debit ($${totalDebit}) must equal Total Credit ($${totalCredit})`);
    }

    const newJournal = {
      id: journalId,
      voucherNumber,
      voucherType: entryData.voucherType || 'GENERAL_JOURNAL',
      postingDate: entryData.postingDate || now,
      referenceNumber: entryData.referenceNumber || null,
      narration: entryData.narration,
      totalDebit,
      totalCredit,
      status: 'POSTED',
      postedBy: 'Chief Financial Officer',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };

    await db.insert(phase60JournalEntries).values(newJournal);

    const lineObjects: any[] = [];
    const glObjects: any[] = [];

    for (const l of lines) {
      const lineId = crypto.randomUUID();
      const glId = crypto.randomUUID();
      const glNumber = `GL-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      const lineObj = {
        id: lineId,
        journalId,
        voucherNumber,
        accountId: l.accountId || journalId,
        accountCode: l.accountCode,
        accountName: l.accountName,
        costCenterId: l.costCenterId || null,
        debitAmount: l.debitAmount || 0,
        creditAmount: l.creditAmount || 0,
        lineDescription: l.lineDescription || entryData.narration,
        createdAt: now,
        updatedAt: now,
        createdBy: 'System Administrator',
        updatedBy: 'System Administrator',
      };
      lineObjects.push(lineObj);

      const glObj = {
        id: glId,
        glNumber,
        journalId,
        voucherNumber,
        postingDate: entryData.postingDate || now,
        accountId: l.accountId || journalId,
        accountCode: l.accountCode,
        accountName: l.accountName,
        debit: l.debitAmount || 0,
        credit: l.creditAmount || 0,
        runningBalance: (l.debitAmount || 0) - (l.creditAmount || 0),
        narration: entryData.narration,
        costCenterCode: l.costCenterId || null,
        createdAt: now,
        updatedAt: now,
        createdBy: 'System Administrator',
        updatedBy: 'System Administrator',
      };
      glObjects.push(glObj);

      // Update account balance based on account normal balance
      const account = await this.findAccountByCode(l.accountCode);
      if (account) {
        const isDebitNormal = account.accountGroup === 'ASSETS' || account.accountGroup === 'EXPENSES';
        const netImpact = isDebitNormal
          ? (l.debitAmount || 0) - (l.creditAmount || 0)
          : (l.creditAmount || 0) - (l.debitAmount || 0);

        await db.update(phase60ChartOfAccounts)
          .set({
            currentBalance: account.currentBalance + netImpact,
            updatedAt: now,
          })
          .where(eq(phase60ChartOfAccounts.id, account.id));
      }
    }

    if (lineObjects.length > 0) {
      await db.insert(phase60JournalLines).values(lineObjects);
    }
    if (glObjects.length > 0) {
      await db.insert(phase60GeneralLedger).values(glObjects);
    }

    return { ...newJournal, lines: lineObjects };
  }

  async findGeneralLedger() {
    await ensureFinanceTablesExist();
    return await db.select().from(phase60GeneralLedger)
      .where(isNull(phase60GeneralLedger.deletedAt))
      .orderBy(desc(phase60GeneralLedger.createdAt));
  }

  async findAPInvoices() {
    await ensureFinanceTablesExist();
    return await db.select().from(phase60APInvoices)
      .where(isNull(phase60APInvoices.deletedAt))
      .orderBy(desc(phase60APInvoices.createdAt));
  }

  async createAPInvoice(data: any) {
    await ensureFinanceTablesExist();
    const invoiceNumber = data.invoiceNumber || `AP-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    if (data.invoiceNumber) {
      const existing = await db.select().from(phase60APInvoices)
        .where(and(eq(phase60APInvoices.invoiceNumber, data.invoiceNumber), isNull(phase60APInvoices.deletedAt)));
      if (existing.length > 0) {
        return existing[0];
      }
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString().split('T')[0];

    const newAP = {
      id,
      invoiceNumber,
      vendorId: data.vendorId || null,
      vendorName: data.vendorName,
      invoiceDate: data.invoiceDate || now,
      dueDate: data.dueDate || now,
      totalAmount: data.totalAmount,
      taxAmount: data.taxAmount || 0,
      paidAmount: 0,
      outstandingAmount: data.totalAmount,
      status: 'UNPAID',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };

    await db.insert(phase60APInvoices).values(newAP);
    return newAP;
  }

  async findARInvoices() {
    await ensureFinanceTablesExist();
    return await db.select().from(phase60ARInvoices)
      .where(isNull(phase60ARInvoices.deletedAt))
      .orderBy(desc(phase60ARInvoices.createdAt));
  }

  async createARInvoice(data: any) {
    await ensureFinanceTablesExist();
    const invoiceNumber = data.invoiceNumber || `AR-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    if (data.invoiceNumber) {
      const existing = await db.select().from(phase60ARInvoices)
        .where(and(eq(phase60ARInvoices.invoiceNumber, data.invoiceNumber), isNull(phase60ARInvoices.deletedAt)));
      if (existing.length > 0) {
        return existing[0];
      }
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString().split('T')[0];

    const newAR = {
      id,
      invoiceNumber,
      customerId: data.customerId || null,
      customerName: data.customerName,
      projectId: data.projectId || null,
      projectName: data.projectName || null,
      invoiceDate: data.invoiceDate || now,
      dueDate: data.dueDate || now,
      totalAmount: data.totalAmount,
      taxAmount: data.taxAmount || 0,
      receivedAmount: 0,
      outstandingAmount: data.totalAmount,
      status: 'UNPAID',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };

    await db.insert(phase60ARInvoices).values(newAR);
    return newAR;
  }

  async findBankAccounts() {
    await ensureFinanceTablesExist();
    return await db.select().from(phase60BankAccounts)
      .where(isNull(phase60BankAccounts.deletedAt))
      .orderBy(phase60BankAccounts.bankName);
  }

  async createBankAccount(data: any) {
    await ensureFinanceTablesExist();
    const id = crypto.randomUUID();
    const now = new Date().toISOString().split('T')[0];
    const newBank = {
      id,
      accountNumber: data.accountNumber,
      bankName: data.bankName,
      branchName: data.branchName,
      swiftCode: data.swiftCode || null,
      currency: data.currency || 'USD',
      currentBalance: data.initialBalance || 0,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };

    await db.insert(phase60BankAccounts).values(newBank);
    return newBank;
  }

  async findCashTransactions() {
    await ensureFinanceTablesExist();
    return await db.select().from(phase60CashTransactions)
      .where(isNull(phase60CashTransactions.deletedAt))
      .orderBy(desc(phase60CashTransactions.createdAt));
  }

  async createCashTransaction(data: any) {
    await ensureFinanceTablesExist();
    const id = crypto.randomUUID();
    const now = new Date().toISOString().split('T')[0];
    const transactionNumber = `CB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCB = {
      id,
      transactionNumber,
      bankAccountId: data.bankAccountId || null,
      transactionType: data.transactionType,
      amount: data.amount,
      transactionDate: data.transactionDate || now,
      payeeOrPayer: data.payeeOrPayer,
      description: data.description,
      status: 'CLEARED',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };

    await db.insert(phase60CashTransactions).values(newCB);
    return newCB;
  }

  async findBudgets() {
    await ensureFinanceTablesExist();
    return await db.select().from(phase60BudgetMasters)
      .where(isNull(phase60BudgetMasters.deletedAt))
      .orderBy(desc(phase60BudgetMasters.createdAt));
  }

  async createBudget(data: any) {
    await ensureFinanceTablesExist();
    const id = crypto.randomUUID();
    const now = new Date().toISOString().split('T')[0];

    const newB = {
      id,
      budgetName: data.budgetName,
      fiscalYear: data.fiscalYear || '2026',
      costCenterCode: data.costCenterCode,
      allocatedBudget: data.allocatedBudget,
      consumedBudget: 0,
      committedBudget: 0,
      remainingBudget: data.allocatedBudget,
      status: 'APPROVED',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };

    await db.insert(phase60BudgetMasters).values(newB);
    return newB;
  }

  async findTaxes() {
    await ensureFinanceTablesExist();
    return await db.select().from(phase60TaxRecords)
      .where(isNull(phase60TaxRecords.deletedAt))
      .orderBy(phase60TaxRecords.taxCode);
  }

  async createTax(data: any) {
    await ensureFinanceTablesExist();
    const id = crypto.randomUUID();
    const now = new Date().toISOString().split('T')[0];

    const newT = {
      id,
      taxCode: data.taxCode,
      taxName: data.taxName,
      taxType: data.taxType || 'VAT',
      ratePercent: data.ratePercent,
      isRecoverable: data.isRecoverable ?? true,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };

    await db.insert(phase60TaxRecords).values(newT);
    return newT;
  }

  async getFinanceStats() {
    await ensureFinanceTablesExist();
    const accounts = await this.findAccounts();
    const apInvoices = await this.findAPInvoices();
    const arInvoices = await this.findARInvoices();
    const journals = await this.findJournalEntries();
    const bankAccounts = await this.findBankAccounts();

    const totalAssets = accounts
      .filter(a => a.accountGroup === 'ASSETS')
      .reduce((acc, curr) => acc + (curr.currentBalance || 0), 0);

    const totalLiabilities = accounts
      .filter(a => a.accountGroup === 'LIABILITIES')
      .reduce((acc, curr) => acc + (curr.currentBalance || 0), 0);

    const totalEquity = accounts
      .filter(a => a.accountGroup === 'EQUITY')
      .reduce((acc, curr) => acc + (curr.currentBalance || 0), 0);

    const totalRevenue = accounts
      .filter(a => a.accountGroup === 'REVENUE')
      .reduce((acc, curr) => acc + (curr.currentBalance || 0), 0);

    const totalExpenses = accounts
      .filter(a => a.accountGroup === 'EXPENSES')
      .reduce((acc, curr) => acc + (curr.currentBalance || 0), 0);

    const totalAPOutstanding = apInvoices.reduce((acc, curr) => acc + (curr.outstandingAmount || 0), 0);
    const totalAROutstanding = arInvoices.reduce((acc, curr) => acc + (curr.outstandingAmount || 0), 0);
    const totalBankBalance = bankAccounts.reduce((acc, curr) => acc + (curr.currentBalance || 0), 0);

    return {
      totalAccounts: accounts.length,
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalAPOutstanding,
      totalAROutstanding,
      totalBankBalance,
      totalJournalEntries: journals.length,
    };
  }

  // Audited Financial Statements Engine
  async getTrialBalance() {
    await ensureFinanceTablesExist();
    const accounts = await this.findAccounts();

    let totalDebit = 0;
    let totalCredit = 0;

    const formattedAccounts = accounts.map(acc => {
      const isDebitNormal = acc.accountGroup === 'ASSETS' || acc.accountGroup === 'EXPENSES';
      let debit = 0;
      let credit = 0;

      if (isDebitNormal) {
        if (acc.currentBalance >= 0) {
          debit = acc.currentBalance;
        } else {
          credit = Math.abs(acc.currentBalance);
        }
      } else {
        if (acc.currentBalance >= 0) {
          credit = acc.currentBalance;
        } else {
          debit = Math.abs(acc.currentBalance);
        }
      }

      totalDebit += debit;
      totalCredit += credit;

      return {
        id: acc.id,
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        accountGroup: acc.accountGroup,
        accountType: acc.accountType,
        balance: acc.currentBalance,
        debit,
        credit,
      };
    });

    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = difference < 0.01;

    return {
      asOfDate: new Date().toISOString().split('T')[0],
      totalDebit,
      totalCredit,
      difference,
      isBalanced,
      accounts: formattedAccounts,
    };
  }

  async getProfitAndLoss(periodYear = '2026') {
    await ensureFinanceTablesExist();
    const accounts = await this.findAccounts();

    const revenueAccounts = accounts.filter(a => a.accountGroup === 'REVENUE');
    const directExpenseAccounts = accounts.filter(a => a.accountGroup === 'EXPENSES' && a.accountType === 'DIRECT_EXPENSE');
    const indirectExpenseAccounts = accounts.filter(a => a.accountGroup === 'EXPENSES' && a.accountType !== 'DIRECT_EXPENSE');

    const totalRevenue = revenueAccounts.reduce((sum, a) => sum + Math.max(0, a.currentBalance), 0);
    const totalDirectExpenses = directExpenseAccounts.reduce((sum, a) => sum + Math.max(0, a.currentBalance), 0);
    const grossProfit = totalRevenue - totalDirectExpenses;
    const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const totalIndirectExpenses = indirectExpenseAccounts.reduce((sum, a) => sum + Math.max(0, a.currentBalance), 0);
    const operatingProfit = grossProfit - totalIndirectExpenses;
    const netMarginPercent = totalRevenue > 0 ? (operatingProfit / totalRevenue) * 100 : 0;

    return {
      fiscalYear: periodYear,
      asOfDate: new Date().toISOString().split('T')[0],
      currency: 'USD',
      totalRevenue,
      totalExpenses: totalDirectExpenses + totalIndirectExpenses,
      revenue: {
        accounts: revenueAccounts.map(a => ({ code: a.accountCode, name: a.accountName, amount: a.currentBalance })),
        total: totalRevenue,
      },
      directExpenses: {
        accounts: directExpenseAccounts.map(a => ({ code: a.accountCode, name: a.accountName, amount: a.currentBalance })),
        total: totalDirectExpenses,
      },
      grossProfit,
      grossMarginPercent,
      indirectExpenses: {
        accounts: indirectExpenseAccounts.map(a => ({ code: a.accountCode, name: a.accountName, amount: a.currentBalance })),
        total: totalIndirectExpenses,
      },
      operatingProfit,
      netMarginPercent,
      netIncome: operatingProfit,
    };
  }

  async getBalanceSheet(asOfDate?: string) {
    await ensureFinanceTablesExist();
    const accounts = await this.findAccounts();

    const currentAssets = accounts.filter(a => a.accountGroup === 'ASSETS' && a.accountType === 'CURRENT_ASSET');
    const fixedAssets = accounts.filter(a => a.accountGroup === 'ASSETS' && a.accountType === 'FIXED_ASSET');
    const totalCurrentAssets = currentAssets.reduce((sum, a) => sum + Math.max(0, a.currentBalance), 0);
    const totalFixedAssets = fixedAssets.reduce((sum, a) => sum + Math.max(0, a.currentBalance), 0);
    const totalAssets = totalCurrentAssets + totalFixedAssets;

    const currentLiabilities = accounts.filter(a => a.accountGroup === 'LIABILITIES' && a.accountType === 'CURRENT_LIABILITY');
    const longTermLiabilities = accounts.filter(a => a.accountGroup === 'LIABILITIES' && a.accountType !== 'CURRENT_LIABILITY');
    const totalCurrentLiabilities = currentLiabilities.reduce((sum, a) => sum + Math.max(0, a.currentBalance), 0);
    const totalLongTermLiabilities = longTermLiabilities.reduce((sum, a) => sum + Math.max(0, a.currentBalance), 0);
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

    const equityAccounts = accounts.filter(a => a.accountGroup === 'EQUITY');
    const baseEquity = equityAccounts.reduce((sum, a) => sum + Math.max(0, a.currentBalance), 0);

    // Current year net earnings
    const pl = await this.getProfitAndLoss();
    const currentYearNetIncome = pl.netIncome;
    const totalEquity = baseEquity + currentYearNetIncome;

    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    const variance = Math.abs(totalAssets - totalLiabilitiesAndEquity);
    const isBalanced = variance < 0.01;

    return {
      asOfDate: asOfDate || new Date().toISOString().split('T')[0],
      currency: 'USD',
      totalAssets,
      totalLiabilities,
      totalEquity,
      assets: {
        currentAssets: { accounts: currentAssets.map(a => ({ code: a.accountCode, name: a.accountName, amount: a.currentBalance })), total: totalCurrentAssets },
        fixedAssets: { accounts: fixedAssets.map(a => ({ code: a.accountCode, name: a.accountName, amount: a.currentBalance })), total: totalFixedAssets },
        totalAssets,
      },
      liabilities: {
        currentLiabilities: { accounts: currentLiabilities.map(a => ({ code: a.accountCode, name: a.accountName, amount: a.currentBalance })), total: totalCurrentLiabilities },
        longTermLiabilities: { accounts: longTermLiabilities.map(a => ({ code: a.accountCode, name: a.accountName, amount: a.currentBalance })), total: totalLongTermLiabilities },
        totalLiabilities,
      },
      equity: {
        accounts: equityAccounts.map(a => ({ code: a.accountCode, name: a.accountName, amount: a.currentBalance })),
        baseEquity,
        currentYearNetIncome,
        totalEquity,
      },
      totalLiabilitiesAndEquity,
      variance,
      isBalanced,
    };
  }

  async getCashFlowStatement() {
    await ensureFinanceTablesExist();
    const bankAccounts = await this.findBankAccounts();
    const cashTxns = await this.findCashTransactions();
    const pl = await this.getProfitAndLoss();

    const netOperatingProfit = pl.operatingProfit;
    const cashInflows = cashTxns.filter(t => t.transactionType === 'RECEIPT').reduce((sum, t) => sum + (t.amount || 0), 0);
    const cashOutflows = cashTxns.filter(t => t.transactionType === 'PAYMENT').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalBankCash = bankAccounts.reduce((sum, b) => sum + (b.currentBalance || 0), 0);
    const totalOperatingCashFlow = netOperatingProfit + cashInflows - cashOutflows;
    const endingCashBalance = totalBankCash;

    return {
      period: 'FY-2026 YTD',
      asOfDate: new Date().toISOString().split('T')[0],
      endingCashBalance,
      closingCashAndBank: totalBankCash,
      operatingActivities: {
        totalOperatingCashFlow,
        netOperatingIncome: netOperatingProfit,
        directCashReceipts: cashInflows,
        operatingDisbursements: cashOutflows,
      },
      operatingCashFlow: {
        netOperatingIncome: netOperatingProfit,
        directCashReceipts: cashInflows,
        operatingDisbursements: cashOutflows,
        netCashFromOperations: totalOperatingCashFlow,
      },
      investingActivities: {
        totalInvestingCashFlow: -180000,
        capitalExpenditureMachinery: -180000,
      },
      investingCashFlow: {
        capitalExpenditureMachinery: -180000,
        netCashFromInvesting: -180000,
      },
      financingActivities: {
        totalFinancingCashFlow: 0,
        capitalContributed: 0,
      },
      financingCashFlow: {
        capitalContributed: 0,
        netCashFromFinancing: 0,
      },
      netChangeInCash: cashInflows - cashOutflows,
    };
  }
}

export const financeRepository = new FinanceRepository();
