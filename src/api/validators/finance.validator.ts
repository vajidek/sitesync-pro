import { z } from 'zod';

export const createAccountSchema = z.object({
  accountCode: z.string().min(3),
  accountName: z.string().min(2),
  accountGroup: z.enum(['ASSETS', 'LIABILITIES', 'EQUITY', 'REVENUE', 'EXPENSES']),
  accountType: z.string().min(2),
  parentAccountId: z.string().optional(),
  isHeaderAccount: z.boolean().optional().default(false),
  currency: z.string().trim().min(3, 'Currency code is required'),
  initialBalance: z.number().optional().default(0),
});

export const createCostCenterSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  centerType: z.enum(['COST_CENTER', 'PROFIT_CENTER']).optional().default('COST_CENTER'),
  department: z.string().optional().default('CIVIL_WORKS'),
  managerName: z.string().optional().default('Financial Controller'),
  annualBudget: z.number().min(0).optional().default(0),
});

export const journalLineSchema = z.object({
  accountId: z.string().optional(),
  accountCode: z.string().min(2),
  accountName: z.string().min(2),
  costCenterId: z.string().optional(),
  debitAmount: z.number().min(0).default(0),
  creditAmount: z.number().min(0).default(0),
  lineDescription: z.string().optional(),
});

export const createJournalEntrySchema = z.object({
  voucherType: z.enum(['GENERAL_JOURNAL', 'PAYMENT_VOUCHER', 'RECEIPT_VOUCHER', 'CONTRA_VOUCHER', 'ADJUSTMENT']).optional().default('GENERAL_JOURNAL'),
  postingDate: z.string().optional(),
  referenceNumber: z.string().optional(),
  narration: z.string().min(3),
  lines: z.array(journalLineSchema).min(2, 'A journal entry requires at least 2 lines (double entry)'),
});

export const createAPInvoiceSchema = z.object({
  vendorId: z.string().optional(),
  vendorName: z.string().min(2),
  invoiceDate: z.string().optional(),
  dueDate: z.string().optional(),
  totalAmount: z.number().positive(),
  taxAmount: z.number().min(0).optional().default(0),
});

export const createARInvoiceSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(2),
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  invoiceDate: z.string().optional(),
  dueDate: z.string().optional(),
  totalAmount: z.number().positive(),
  taxAmount: z.number().min(0).optional().default(0),
});

export const createBankAccountSchema = z.object({
  accountNumber: z.string().min(5),
  bankName: z.string().min(2),
  branchName: z.string().min(2),
  swiftCode: z.string().optional(),
  currency: z.string().trim().min(3, 'Currency code is required'),
  initialBalance: z.number().optional().default(0),
});

export const createCashTransactionSchema = z.object({
  bankAccountId: z.string().optional(),
  transactionType: z.enum(['DEPOSIT', 'WITHDRAWAL', 'PETTY_CASH', 'BANK_TRANSFER']),
  amount: z.number().positive(),
  transactionDate: z.string().optional(),
  payeeOrPayer: z.string().min(2),
  description: z.string().min(2),
});

export const createBudgetMasterSchema = z.object({
  budgetName: z.string().min(2),
  fiscalYear: z.string().optional().default('2026'),
  costCenterCode: z.string().min(2),
  allocatedBudget: z.number().positive(),
});

export const createTaxRecordSchema = z.object({
  taxCode: z.string().min(2),
  taxName: z.string().min(2),
  taxType: z.enum(['VAT', 'GST', 'TDS', 'TCS']).optional().default('VAT'),
  ratePercent: z.number().min(0).max(100),
  isRecoverable: z.boolean().optional().default(true),
});
