import { FinanceRepository } from '../repositories/finance.repository';

export class FinanceService {
  private repo = new FinanceRepository();

  async getAccounts() {
    return await this.repo.findAccounts();
  }

  async createAccount(data: any) {
    const existing = await this.repo.findAccountByCode(data.accountCode);
    if (existing) throw new Error(`Account code ${data.accountCode} already exists`);
    return await this.repo.createAccount(data);
  }

  async getCostCenters() {
    return await this.repo.findCostCenters();
  }

  async createCostCenter(data: any) {
    return await this.repo.createCostCenter(data);
  }

  async getJournalEntries() {
    return await this.repo.findJournalEntries();
  }

  async postJournalEntry(data: any) {
    const { lines } = data;
    let totalDebit = 0;
    let totalCredit = 0;

    for (const l of lines) {
      totalDebit += l.debitAmount || 0;
      totalCredit += l.creditAmount || 0;
    }

    // Double-entry validation: Debit must strictly equal Credit
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new Error(`Double-entry violation: Total Debit ($${totalDebit.toFixed(2)}) must equal Total Credit ($${totalCredit.toFixed(2)})`);
    }

    return await this.repo.createJournalEntry(data, lines);
  }

  async getGeneralLedger() {
    return await this.repo.findGeneralLedger();
  }

  async getAPInvoices() {
    return await this.repo.findAPInvoices();
  }

  async createAPInvoice(data: any) {
    return await this.repo.createAPInvoice(data);
  }

  async getARInvoices() {
    return await this.repo.findARInvoices();
  }

  async createARInvoice(data: any) {
    return await this.repo.createARInvoice(data);
  }

  async getBankAccounts() {
    return await this.repo.findBankAccounts();
  }

  async createBankAccount(data: any) {
    return await this.repo.createBankAccount(data);
  }

  async getCashTransactions() {
    return await this.repo.findCashTransactions();
  }

  async createCashTransaction(data: any) {
    return await this.repo.createCashTransaction(data);
  }

  async getBudgets() {
    return await this.repo.findBudgets();
  }

  async createBudget(data: any) {
    return await this.repo.createBudget(data);
  }

  async getTaxes() {
    return await this.repo.findTaxes();
  }

  async createTax(data: any) {
    return await this.repo.createTax(data);
  }

  async getFinanceStats() {
    return await this.repo.getFinanceStats();
  }

  async getTrialBalance() {
    return await this.repo.getTrialBalance();
  }

  async getProfitAndLoss(periodYear?: string) {
    return await this.repo.getProfitAndLoss(periodYear);
  }

  async getBalanceSheet(asOfDate?: string) {
    return await this.repo.getBalanceSheet(asOfDate);
  }

  async getCashFlowStatement() {
    return await this.repo.getCashFlowStatement();
  }
}
