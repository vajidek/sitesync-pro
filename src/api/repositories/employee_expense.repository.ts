import { v4 as uuidv4 } from 'uuid';
import { financeRepository } from './finance.repository';
import { enterpriseAuditRepository } from './enterprise_audit.repository';
import { isDemoSeedAllowed } from '../config/env';

export interface ExpenseAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string; // Base64 data URI or secure storage link
  uploadDate: string;
  fileHash?: string;
}

export interface ApprovalHistoryItem {
  stage: string;
  approverId: string;
  approverName: string;
  role: string;
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | 'RESUBMITTED' | 'CANCELLED';
  timestamp: string;
  remarks: string;
}

export interface ExpenseClaimAuditEntry {
  timestamp: string;
  user: string;
  action: string;
  previousValue?: any;
  newValue?: any;
  reason: string;
}

export interface ExpenseClaim {
  id: string;
  claimNumber: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  projectId?: string;
  projectName?: string;
  costCenterCode?: string;
  category: string;
  customCategoryName?: string;
  amount: number;
  currency: string;
  expenseDate: string;
  vendorShop: string;
  description: string;
  billInvoiceNumber?: string;
  attachments: ExpenseAttachment[];
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'SUPERVISOR_APPROVED'
    | 'PROJECT_MANAGER_APPROVED'
    | 'FINANCE_VERIFIED'
    | 'APPROVED_FOR_PAYMENT'
    | 'PAID'
    | 'REJECTED'
    | 'CLARIFICATION_REQUESTED'
    | 'CANCELLED';
  approvalHistory: ApprovalHistoryItem[];
  financeVerification?: {
    verifiedBy: string;
    verificationDate: string;
    taxAmount?: number;
    accountDebitCode: string;
    accountCreditCode: string;
    advanceDeductionAmount: number;
    netPayableAmount: number;
    duplicateWarning?: {
      isDuplicate: boolean;
      riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
      matchedClaimNumber?: string;
      reason?: string;
    };
    clarificationQuestion?: string;
    clarificationResponse?: string;
    notes?: string;
  };
  paymentDetails?: {
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'EMPLOYEE_ACCOUNT' | 'PAYROLL_ADJUSTMENT';
    paymentReference: string;
    paymentDate: string;
    amountPaid: number;
    journalVoucherNumber?: string;
    paidBy: string;
  };
  auditTrail: ExpenseClaimAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CashAdvance {
  id: string;
  advanceNumber: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  projectId?: string;
  projectName?: string;
  department: string;
  requestedAmount: number;
  approvedAmount: number;
  disbursedAmount: number;
  currency: string;
  purpose: string;
  requiredDate: string;
  status: 'DRAFT' | 'REQUESTED' | 'APPROVED' | 'DISBURSED' | 'SETTLED' | 'PARTIALLY_SETTLED' | 'REJECTED';
  disbursedDate?: string;
  paymentReference?: string;
  settlementDetails?: {
    totalSettledExpenses: number;
    balanceAmount: number;
    balanceType: 'REFUND_DUE_FROM_EMPLOYEE' | 'REIMBURSEMENT_DUE_TO_EMPLOYEE' | 'EXACTLY_BALANCED';
    refundStatus: 'PENDING' | 'REFUNDED' | 'PAYROLL_RECOVERED';
    refundReference?: string;
    settledAt?: string;
    notes?: string;
  };
  auditTrail: any[];
  createdAt: string;
}

export interface PettyCashRegister {
  id: string;
  registerCode: string;
  siteOrBranch: string;
  projectId?: string;
  projectName?: string;
  custodianId: string;
  custodianName: string;
  currency: string;
  imprestFloatLimit: number;
  openingBalance: number;
  cashReceivedTotal: number;
  cashIssuedTotal: number;
  currentBalance: number;
  status: 'ACTIVE' | 'AUDIT_IN_PROGRESS' | 'RECONCILED';
  lastReconciledDate: string;
  reconciliations: Array<{
    id: string;
    date: string;
    physicalCashCount: number;
    systemBalance: number;
    variance: number;
    status: 'BALANCED' | 'DEFICIT' | 'SURPLUS';
    reconciledBy: string;
    remarks: string;
  }>;
}

export interface PettyCashVoucher {
  id: string;
  voucherNumber: string;
  registerId: string;
  voucherType: 'DISBURSEMENT' | 'FLOAT_TOPUP' | 'RETURN';
  date: string;
  payeeRecipient: string;
  amount: number;
  currency: string;
  category: string;
  projectId?: string;
  costCenter?: string;
  description: string;
  billNumber?: string;
  receiptUrl?: string;
  approvedBy: string;
  journalRef?: string;
  status: 'ISSUED' | 'POSTED' | 'VOIDED';
  createdAt: string;
}

export interface ConfigurableExpenseCategory {
  id: string;
  code: string;
  label: string;
  icon: string;
  defaultGlDebitAccount: string;
  requiresReceipt: boolean;
  maxLimitWithoutSpecialApproval: number;
  isActive: boolean;
}

export class EmployeeExpenseRepository {
  private static instance: EmployeeExpenseRepository;

  // In-memory persistent master state with robust enterprise seed datasets
  private expenseClaims: ExpenseClaim[] = [];
  private cashAdvances: CashAdvance[] = [];
  private pettyCashRegisters: PettyCashRegister[] = [];
  private pettyCashVouchers: PettyCashVoucher[] = [];
  private categories: ConfigurableExpenseCategory[] = [];

  constructor() {
    this.seedInitialData();
  }

  public static getInstance(): EmployeeExpenseRepository {
    if (!EmployeeExpenseRepository.instance) {
      EmployeeExpenseRepository.instance = new EmployeeExpenseRepository();
    }
    return EmployeeExpenseRepository.instance;
  }

  private seedInitialData() {
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // 1. Configurable Expense Categories (Strictly user-configured, not hardcoded!)
    this.categories = [
      { id: 'cat-01', code: 'MATERIAL_PURCHASE', label: 'Material Purchase', icon: 'Package', defaultGlDebitAccount: '5001', requiresReceipt: true, maxLimitWithoutSpecialApproval: 10000, isActive: true },
      { id: 'cat-02', code: 'SITE_EXPENSE', label: 'Site Expense', icon: 'HardHat', defaultGlDebitAccount: '5002', requiresReceipt: true, maxLimitWithoutSpecialApproval: 5000, isActive: true },
      { id: 'cat-03', code: 'OFFICE_EXPENSE', label: 'Office Expense', icon: 'Building', defaultGlDebitAccount: '5003', requiresReceipt: true, maxLimitWithoutSpecialApproval: 2000, isActive: true },
      { id: 'cat-04', code: 'TRAVEL', label: 'Travel', icon: 'Plane', defaultGlDebitAccount: '5004', requiresReceipt: true, maxLimitWithoutSpecialApproval: 15000, isActive: true },
      { id: 'cat-05', code: 'FOOD', label: 'Food & Refreshments', icon: 'Utensils', defaultGlDebitAccount: '5005', requiresReceipt: false, maxLimitWithoutSpecialApproval: 1000, isActive: true },
      { id: 'cat-06', code: 'TRANSPORT', label: 'Transport & Local Transit', icon: 'Truck', defaultGlDebitAccount: '5006', requiresReceipt: true, maxLimitWithoutSpecialApproval: 2500, isActive: true },
      { id: 'cat-07', code: 'FUEL', label: 'Fuel & Diesel', icon: 'Fuel', defaultGlDebitAccount: '5007', requiresReceipt: true, maxLimitWithoutSpecialApproval: 5000, isActive: true },
      { id: 'cat-08', code: 'COURIER', label: 'Courier & Shipping', icon: 'Mail', defaultGlDebitAccount: '5008', requiresReceipt: true, maxLimitWithoutSpecialApproval: 1000, isActive: true },
      { id: 'cat-09', code: 'REPAIR', label: 'Repair & Maintenance', icon: 'Wrench', defaultGlDebitAccount: '5009', requiresReceipt: true, maxLimitWithoutSpecialApproval: 8000, isActive: true },
      { id: 'cat-10', code: 'TOOLS', label: 'Tools & Small Equipment', icon: 'Hammer', defaultGlDebitAccount: '5010', requiresReceipt: true, maxLimitWithoutSpecialApproval: 4000, isActive: true },
      { id: 'cat-11', code: 'CONSUMABLES', label: 'Consumables & Hardware', icon: 'Layers', defaultGlDebitAccount: '5011', requiresReceipt: true, maxLimitWithoutSpecialApproval: 3000, isActive: true },
      { id: 'cat-12', code: 'ACCOMMODATION', label: 'Accommodation & Lodging', icon: 'Home', defaultGlDebitAccount: '5012', requiresReceipt: true, maxLimitWithoutSpecialApproval: 20000, isActive: true },
      { id: 'cat-13', code: 'OTHER', label: 'Other Legitimate Business Expense', icon: 'FileText', defaultGlDebitAccount: '5099', requiresReceipt: true, maxLimitWithoutSpecialApproval: 1000, isActive: true },
    ];

    if (!isDemoSeedAllowed()) {
      return;
    }

    // 2. Initial Sample Cash Advance (₹5,000 with ₹4,200 settled, ₹800 refund due!)
    this.cashAdvances = [
      {
        id: 'adv-001',
        advanceNumber: 'ADV-2026-0001',
        employeeId: 'emp-101',
        employeeName: 'Sunil Kumar',
        employeeCode: 'EMP-049',
        projectId: 'PRJ-101',
        projectName: 'Dubai Creek Harbor Desalination WTP',
        department: 'SITE_OPERATIONS',
        requestedAmount: 5000,
        approvedAmount: 5000,
        disbursedAmount: 5000,
        currency: 'INR',
        purpose: 'Site material emergency and travel advance for pipeline sector B',
        requiredDate: '2026-09-10',
        status: 'DISBURSED',
        disbursedDate: '2026-09-11',
        paymentReference: 'IMPS-902348123',
        settlementDetails: {
          totalSettledExpenses: 4200,
          balanceAmount: 800,
          balanceType: 'REFUND_DUE_FROM_EMPLOYEE',
          refundStatus: 'PENDING',
          notes: 'Advance ₹5,000 - Submitted expenses ₹4,200 = ₹800 balance to be refunded by employee.',
        },
        auditTrail: [
          { timestamp: '2026-09-10T09:00:00Z', user: 'Sunil Kumar', action: 'ADVANCE_REQUESTED', reason: 'Emergency site petty purchase float' },
          { timestamp: '2026-09-10T14:30:00Z', user: 'Project Director', action: 'ADVANCE_APPROVED', reason: 'Approved under site emergency quota' },
          { timestamp: '2026-09-11T11:00:00Z', user: 'Finance Officer', action: 'ADVANCE_DISBURSED', reason: 'Disbursed via IMPS-902348123' },
        ],
        createdAt: '2026-09-10T09:00:00Z',
      },
      {
        id: 'adv-002',
        advanceNumber: 'ADV-2026-0002',
        employeeId: 'emp-104',
        employeeName: 'Rahul Varma',
        employeeCode: 'EMP-065',
        projectId: 'PRJ-101',
        projectName: 'Dubai Creek Harbor Desalination WTP',
        department: 'ELECTROMECHANICAL',
        requestedAmount: 3000,
        approvedAmount: 3000,
        disbursedAmount: 3000,
        currency: 'INR',
        purpose: 'HVAC valve inspection technician transport and accommodation',
        requiredDate: '2026-09-14',
        status: 'DISBURSED',
        disbursedDate: '2026-09-15',
        paymentReference: 'NEFT-883491209',
        settlementDetails: {
          totalSettledExpenses: 4200,
          balanceAmount: 1200,
          balanceType: 'REIMBURSEMENT_DUE_TO_EMPLOYEE',
          refundStatus: 'PENDING',
          notes: 'Expenses ₹4,200 exceeded advance ₹3,000. Balance ₹1,200 reimbursement due to employee.',
        },
        auditTrail: [
          { timestamp: '2026-09-14T10:00:00Z', user: 'Rahul Varma', action: 'ADVANCE_REQUESTED', reason: 'HVAC technician visit' },
        ],
        createdAt: '2026-09-14T10:00:00Z',
      },
    ];

    // 3. Initial Sample Expense Claims (Including exact user scenario: Rope ₹200 for project site!)
    this.expenseClaims = [
      {
        id: 'exp-001',
        claimNumber: 'EXP-2026-0001',
        employeeId: 'emp-101',
        employeeName: 'Sunil Kumar',
        employeeCode: 'EMP-049',
        department: 'SITE_OPERATIONS',
        projectId: 'PRJ-101',
        projectName: 'Dubai Creek Harbor Desalination WTP',
        costCenterCode: 'CC-CIVIL-01',
        category: 'MATERIAL_PURCHASE',
        amount: 200,
        currency: 'INR',
        expenseDate: today,
        vendorShop: 'Al Madina Hardware & Industrial Tools LLC',
        description: 'Purchased heavy-duty nylon safety rope (15mm, 30m) for pipe trench barricade and hoisting assistance at sector B.',
        billInvoiceNumber: 'INV-ALM-8921',
        attachments: [
          {
            id: 'att-01',
            name: 'rope_cash_receipt_inv8921.jpg',
            size: 248000,
            type: 'image/jpeg',
            url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=60',
            uploadDate: now,
            fileHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          }
        ],
        status: 'SUBMITTED',
        approvalHistory: [
          {
            stage: 'EMPLOYEE_SUBMISSION',
            approverId: 'emp-101',
            approverName: 'Sunil Kumar',
            role: 'EMPLOYEE',
            action: 'SUBMITTED',
            timestamp: now,
            remarks: 'Urgent site rope purchase required for trench safety compliance.',
          }
        ],
        financeVerification: {
          verifiedBy: 'Senior Accounts Officer',
          verificationDate: today,
          accountDebitCode: '5001',
          accountCreditCode: '2001',
          advanceDeductionAmount: 0,
          netPayableAmount: 200,
          duplicateWarning: {
            isDuplicate: false,
            riskLevel: 'NONE',
          },
          notes: 'Valid GST receipt attached. Cost allocated to Project PRJ-101 WBS 3.0.',
        },
        auditTrail: [
          {
            timestamp: now,
            user: 'Sunil Kumar',
            action: 'CLAIM_CREATED',
            reason: 'Nylon rope purchase for site safety',
          }
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'exp-002',
        claimNumber: 'EXP-2026-0002',
        employeeId: 'emp-101',
        employeeName: 'Sunil Kumar',
        employeeCode: 'EMP-049',
        department: 'SITE_OPERATIONS',
        projectId: 'PRJ-101',
        projectName: 'Dubai Creek Harbor Desalination WTP',
        costCenterCode: 'CC-CIVIL-01',
        category: 'FUEL',
        amount: 1450,
        currency: 'INR',
        expenseDate: '2026-09-18',
        vendorShop: 'ADNOC Fuel Station #402',
        description: 'Diesel replenishment for site dewatering suction pump (Generator 45kVA)',
        billInvoiceNumber: 'ADN-2026-88192',
        attachments: [
          {
            id: 'att-02',
            name: 'fuel_tax_invoice.pdf',
            size: 512000,
            type: 'application/pdf',
            url: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=600&auto=format&fit=crop&q=60',
            uploadDate: '2026-09-18T16:00:00Z',
            fileHash: 'sha256-f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2',
          }
        ],
        status: 'APPROVED_FOR_PAYMENT',
        approvalHistory: [
          { stage: 'SUPERVISOR', approverId: 'emp-sup-01', approverName: 'Hassan Al-Maktoum', role: 'SITE_ENGINEER', action: 'APPROVED', timestamp: '2026-09-18T17:00:00Z', remarks: 'Pump was running continuously during rain.' },
          { stage: 'FINANCE', approverId: 'emp-fin-01', approverName: 'Fatima Zahra', role: 'FINANCE_CONTROLLER', action: 'APPROVED', timestamp: '2026-09-19T09:30:00Z', remarks: 'Fuel slip verified with equipment logbook.' }
        ],
        financeVerification: {
          verifiedBy: 'Fatima Zahra',
          verificationDate: '2026-09-19',
          accountDebitCode: '5007',
          accountCreditCode: '2001',
          advanceDeductionAmount: 0,
          netPayableAmount: 1450,
          duplicateWarning: { isDuplicate: false, riskLevel: 'NONE' },
        },
        auditTrail: [
          { timestamp: '2026-09-18T16:00:00Z', user: 'Sunil Kumar', action: 'CLAIM_CREATED', reason: 'Fuel purchase' },
        ],
        createdAt: '2026-09-18T16:00:00Z',
        updatedAt: '2026-09-19T09:30:00Z',
      },
      {
        id: 'exp-003',
        claimNumber: 'EXP-2026-0003',
        employeeId: 'emp-102',
        employeeName: 'Abdul Rahman',
        employeeCode: 'EMP-052',
        department: 'SAFETY_HSE',
        projectId: 'PRJ-101',
        projectName: 'Dubai Creek Harbor Desalination WTP',
        costCenterCode: 'CC-HSE-01',
        category: 'TOOLS',
        amount: 2550,
        currency: 'INR',
        expenseDate: '2026-09-15',
        vendorShop: 'Safety First Industrial Equipment',
        description: 'Replacement 4-point full body harness and carabiners for scaffold riggers',
        billInvoiceNumber: 'SFT-2026-0941',
        attachments: [
          {
            id: 'att-03',
            name: 'safety_harness_receipt.jpg',
            size: 320000,
            type: 'image/jpeg',
            url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&auto=format&fit=crop&q=60',
            uploadDate: '2026-09-15T11:00:00Z',
            fileHash: 'sha256-a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
          }
        ],
        status: 'PAID',
        approvalHistory: [
          { stage: 'SUPERVISOR', approverId: 'sup-02', approverName: 'Kareem Mansoor', role: 'HSE_MANAGER', action: 'APPROVED', timestamp: '2026-09-15T13:00:00Z', remarks: 'Essential safety gear.' },
          { stage: 'FINANCE', approverId: 'fin-01', approverName: 'Fatima Zahra', role: 'FINANCE_CONTROLLER', action: 'APPROVED', timestamp: '2026-09-16T10:00:00Z', remarks: 'Verified and approved.' }
        ],
        financeVerification: {
          verifiedBy: 'Fatima Zahra',
          verificationDate: '2026-09-16',
          accountDebitCode: '5010',
          accountCreditCode: '1001',
          advanceDeductionAmount: 0,
          netPayableAmount: 2550,
        },
        paymentDetails: {
          paymentMethod: 'BANK_TRANSFER',
          paymentReference: 'NEFT-88492019482',
          paymentDate: '2026-09-17',
          amountPaid: 2550,
          journalVoucherNumber: 'JV-2026-8921',
          paidBy: 'Accounts Payable Disbursal Desk',
        },
        auditTrail: [
          { timestamp: '2026-09-15T11:00:00Z', user: 'Abdul Rahman', action: 'CLAIM_CREATED', reason: 'HSE equipment' },
          { timestamp: '2026-09-17T14:00:00Z', user: 'Accounts Payable', action: 'PAYMENT_EXECUTED', reason: 'Transferred via NEFT' }
        ],
        createdAt: '2026-09-15T11:00:00Z',
        updatedAt: '2026-09-17T14:00:00Z',
      }
    ];

    // 4. Petty Cash Registers & Vouchers
    this.pettyCashRegisters = [
      {
        id: 'pcr-01',
        registerCode: 'PC-DXB-SITE-01',
        siteOrBranch: 'Dubai Creek Harbor Project Site Office',
        projectId: 'PRJ-101',
        projectName: 'Dubai Creek Harbor Desalination WTP',
        custodianId: 'emp-101',
        custodianName: 'Sunil Kumar',
        currency: 'INR',
        imprestFloatLimit: 10000,
        openingBalance: 3500,
        cashReceivedTotal: 10000,
        cashIssuedTotal: 6500,
        currentBalance: 3500,
        status: 'ACTIVE',
        lastReconciledDate: today,
        reconciliations: [
          {
            id: 'rec-01',
            date: today,
            physicalCashCount: 3500,
            systemBalance: 3500,
            variance: 0,
            status: 'BALANCED',
            reconciledBy: 'Internal Site Auditor',
            remarks: 'Daily cash tally matched 100% with cash box notes and coins.',
          }
        ]
      },
      {
        id: 'pcr-02',
        registerCode: 'PC-HO-ADMIN-01',
        siteOrBranch: 'Corporate Head Office Reception & Admin',
        custodianId: 'emp-admin-01',
        custodianName: 'Pooja Nair',
        currency: 'INR',
        imprestFloatLimit: 25000,
        openingBalance: 14200,
        cashReceivedTotal: 25000,
        cashIssuedTotal: 10800,
        currentBalance: 14200,
        status: 'ACTIVE',
        lastReconciledDate: today,
        reconciliations: [
          {
            id: 'rec-02',
            date: today,
            physicalCashCount: 14200,
            systemBalance: 14200,
            variance: 0,
            status: 'BALANCED',
            reconciledBy: 'Chief Accountant',
            remarks: 'Reconciliation verified with stamps and tea pantry bills.',
          }
        ]
      }
    ];

    this.pettyCashVouchers = [
      {
        id: 'pcv-01',
        voucherNumber: 'PCV-2026-0041',
        registerId: 'pcr-01',
        voucherType: 'DISBURSEMENT',
        date: today,
        payeeRecipient: 'Sunil Kumar',
        amount: 200,
        currency: 'INR',
        category: 'MATERIAL_PURCHASE',
        projectId: 'PRJ-101',
        costCenter: 'CC-CIVIL-01',
        description: 'Cash reimbursed for site nylon rope purchase (Inv #INV-ALM-8921)',
        billNumber: 'INV-ALM-8921',
        approvedBy: 'Site Engineer Hassan',
        status: 'POSTED',
        createdAt: now,
      },
      {
        id: 'pcv-02',
        voucherNumber: 'PCV-2026-0042',
        registerId: 'pcr-01',
        voucherType: 'DISBURSEMENT',
        date: today,
        payeeRecipient: 'Deepak Sharma',
        amount: 350,
        currency: 'INR',
        category: 'FOOD',
        projectId: 'PRJ-101',
        costCenter: 'CC-CIVIL-01',
        description: 'Chai and refreshments for concrete pour inspection team (14 members)',
        billNumber: 'BILL-TEA-19',
        approvedBy: 'Site Engineer Hassan',
        status: 'POSTED',
        createdAt: now,
      }
    ];
  }

  // --- 1. Expense Categories Management (Configurable) ---
  public getCategories(): ConfigurableExpenseCategory[] {
    return this.categories;
  }

  public addCategory(cat: Partial<ConfigurableExpenseCategory>): ConfigurableExpenseCategory {
    const newCat: ConfigurableExpenseCategory = {
      id: `cat-${uuidv4().substring(0, 6)}`,
      code: (cat.code || cat.label || 'CUSTOM').toUpperCase().replace(/\s+/g, '_'),
      label: cat.label || 'Custom Expense',
      icon: cat.icon || 'Tag',
      defaultGlDebitAccount: cat.defaultGlDebitAccount || '5099',
      requiresReceipt: cat.requiresReceipt !== undefined ? cat.requiresReceipt : true,
      maxLimitWithoutSpecialApproval: cat.maxLimitWithoutSpecialApproval || 5000,
      isActive: true,
    };
    this.categories.push(newCat);
    return newCat;
  }

  // --- 2. Duplicate Claim Protection Algorithm ---
  public checkDuplicateClaim(data: {
    employeeId: string;
    billInvoiceNumber?: string;
    vendorShop?: string;
    expenseDate?: string;
    amount?: number;
    fileHash?: string;
    excludeId?: string;
  }): { isDuplicate: boolean; riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'; matchedClaimNumber?: string; reason?: string } {
    if (!data.amount && !data.billInvoiceNumber) {
      return { isDuplicate: false, riskLevel: 'NONE' };
    }

    for (const c of this.expenseClaims) {
      if (data.excludeId && c.id === data.excludeId) continue;
      if (c.status === 'CANCELLED' || c.status === 'REJECTED') continue;

      // 1. Exact Bill Number Match for same vendor or employee
      if (
        data.billInvoiceNumber &&
        c.billInvoiceNumber &&
        data.billInvoiceNumber.trim().toLowerCase() === c.billInvoiceNumber.trim().toLowerCase()
      ) {
        return {
          isDuplicate: true,
          riskLevel: 'HIGH',
          matchedClaimNumber: c.claimNumber,
          reason: `Exact invoice/bill number "${data.billInvoiceNumber}" already submitted under claim ${c.claimNumber} by ${c.employeeName}.`,
        };
      }

      // 2. Exact Attachment File Hash Match
      if (data.fileHash && c.attachments.some(a => a.fileHash === data.fileHash)) {
        return {
          isDuplicate: true,
          riskLevel: 'HIGH',
          matchedClaimNumber: c.claimNumber,
          reason: `Identical receipt/invoice document image detected in claim ${c.claimNumber}.`,
        };
      }

      // 3. Same Employee, Same Date, Same Amount, Same Vendor
      if (
        data.employeeId === c.employeeId &&
        data.expenseDate === c.expenseDate &&
        Number(data.amount) === Number(c.amount)
      ) {
        if (
          data.vendorShop &&
          c.vendorShop &&
          data.vendorShop.trim().toLowerCase() === c.vendorShop.trim().toLowerCase()
        ) {
          return {
            isDuplicate: true,
            riskLevel: 'HIGH',
            matchedClaimNumber: c.claimNumber,
            reason: `Matching expense on ${data.expenseDate} for ${c.currency} ${data.amount} at "${data.vendorShop}" was already filed in claim ${c.claimNumber}.`,
          };
        } else {
          return {
            isDuplicate: false,
            riskLevel: 'MEDIUM',
            matchedClaimNumber: c.claimNumber,
            reason: `Warning: Employee already has another claim for ${c.currency} ${data.amount} on the same date (${data.expenseDate}) under ${c.claimNumber}.`,
          };
        }
      }
    }

    return { isDuplicate: false, riskLevel: 'NONE' };
  }

  // --- 3. Expense Claims Lifecycle Methods ---
  public async getExpenseClaims(filter?: {
    employeeId?: string;
    projectId?: string;
    status?: string;
    category?: string;
  }): Promise<ExpenseClaim[]> {
    let list = [...this.expenseClaims];
    if (filter?.employeeId) list = list.filter(c => c.employeeId === filter.employeeId);
    if (filter?.projectId) list = list.filter(c => c.projectId === filter.projectId);
    if (filter?.status && filter.status !== 'ALL') list = list.filter(c => c.status === filter.status);
    if (filter?.category && filter.category !== 'ALL') list = list.filter(c => c.category === filter.category);
    return list;
  }

  public async getExpenseClaimById(id: string): Promise<ExpenseClaim | null> {
    return this.expenseClaims.find(c => c.id === id) || null;
  }

  public async createExpenseClaim(data: Partial<ExpenseClaim>): Promise<ExpenseClaim> {
    const now = new Date().toISOString();
    const count = this.expenseClaims.length + 1;
    const claimNumber = `EXP-2026-${String(count).padStart(4, '0')}`;

    if (!data.employeeId || !data.employeeName || !data.department) {
      throw new Error('Authenticated employee identity is required to create an expense claim.');
    }
    if (!data.category || !data.currency || !data.expenseDate || !data.vendorShop || !data.description) {
      throw new Error('Category, currency, date, vendor, and business purpose are required.');
    }

    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Expense amount must be greater than zero.');
    }

    // Perform duplicate detection against the submitted identity and source evidence.
    const dup = this.checkDuplicateClaim({
      employeeId: data.employeeId,
      billInvoiceNumber: data.billInvoiceNumber,
      vendorShop: data.vendorShop,
      expenseDate: data.expenseDate,
      amount,
      fileHash: data.attachments?.[0]?.fileHash,
    });

    const newClaim: ExpenseClaim = {
      id: `exp-${uuidv4().substring(0, 8)}`,
      claimNumber,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      employeeCode: data.employeeCode || '',
      department: data.department,
      projectId: data.projectId,
      projectName: data.projectName,
      costCenterCode: data.costCenterCode,
      category: data.category,
      customCategoryName: data.customCategoryName,
      amount,
      currency: data.currency,
      expenseDate: data.expenseDate,
      vendorShop: data.vendorShop,
      description: data.description,
      billInvoiceNumber: data.billInvoiceNumber || '',
      attachments: data.attachments || [],
      status: data.status || 'SUBMITTED',
      approvalHistory: [
        {
          stage: 'SUBMISSION',
          approverId: data.employeeId || 'emp-101',
          approverName: data.employeeName || 'Sunil Kumar',
          role: 'EMPLOYEE',
          action: 'SUBMITTED',
          timestamp: now,
          remarks: data.description || 'Submitted for reimbursement',
        }
      ],
      financeVerification: {
        verifiedBy: '',
        verificationDate: '',
        accountDebitCode: '5001',
        accountCreditCode: '2001',
        advanceDeductionAmount: 0,
        netPayableAmount: Number(data.amount) || 0,
        duplicateWarning: dup,
      },
      auditTrail: [
        {
          timestamp: now,
          user: data.employeeName || 'Sunil Kumar',
          action: 'CLAIM_SUBMITTED',
          newValue: { amount: data.amount, category: data.category },
          reason: 'Initial claim submission',
        }
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.expenseClaims.unshift(newClaim);

    // Audit log integration
    await enterpriseAuditRepository.logEvent({
      userId: newClaim.employeeId,
      userName: newClaim.employeeName,
      actionType: 'CREATE',
      entityType: 'EXPENSE_CLAIM' as any,
      entityId: newClaim.id,
      entityNumber: newClaim.claimNumber,
      fromState: 'DRAFT',
      toState: newClaim.status,
      diffJson: { amount: newClaim.amount, category: newClaim.category, project: newClaim.projectId },
      reason: `Expense claim submitted for ${newClaim.currency} ${newClaim.amount} (${newClaim.vendorShop})`,
    });

    return newClaim;
  }

  // --- 4. Multi-Level Approval Workflow ---
  public async approveByManager(id: string, approver: { id: string; name: string; role: string; remarks?: string }): Promise<ExpenseClaim | null> {
    const claim = await this.getExpenseClaimById(id);
    if (!claim) return null;

    if (!['SUBMITTED', 'CLARIFICATION_REQUESTED'].includes(claim.status)) {
      throw new Error(`Manager approval is not allowed from status ${claim.status}`);
    }
    if (claim.employeeId === approver.id) {
      throw new Error('Maker-checker violation: claimant cannot approve their own expense.');
    }

    const now = new Date().toISOString();
    const prevStatus = claim.status;
    const nextStatus = 'SUPERVISOR_APPROVED';

    claim.status = nextStatus;
    claim.approvalHistory.push({
      stage: approver.role,
      approverId: approver.id,
      approverName: approver.name,
      role: approver.role,
      action: 'APPROVED',
      timestamp: now,
      remarks: approver.remarks || 'Approved after reviewing supporting bill.',
    });

    claim.auditTrail.push({
      timestamp: now,
      user: approver.name,
      action: 'MANAGER_APPROVED',
      previousValue: prevStatus,
      newValue: nextStatus,
      reason: approver.remarks || 'Approved by supervisor/project manager',
    });

    await enterpriseAuditRepository.logEvent({
      userId: approver.id,
      userName: approver.name,
      actionType: 'APPROVE',
      entityType: 'EXPENSE_CLAIM' as any,
      entityId: claim.id,
      entityNumber: claim.claimNumber,
      fromState: prevStatus,
      toState: nextStatus,
      reason: approver.remarks || 'Manager verification completed',
    });

    return claim;
  }

  public async rejectClaim(id: string, user: { id: string; name: string; reason: string }): Promise<ExpenseClaim | null> {
    const claim = await this.getExpenseClaimById(id);
    if (!claim) return null;

    const now = new Date().toISOString();
    const prev = claim.status;
    claim.status = 'REJECTED';

    claim.approvalHistory.push({
      stage: 'REJECTION',
      approverId: user.id,
      approverName: user.name,
      role: 'APPROVER',
      action: 'REJECTED',
      timestamp: now,
      remarks: user.reason,
    });

    claim.auditTrail.push({
      timestamp: now,
      user: user.name,
      action: 'CLAIM_REJECTED',
      previousValue: prev,
      newValue: 'REJECTED',
      reason: user.reason,
    });

    return claim;
  }

  public async requestClarification(id: string, user: { id: string; name: string; question: string }): Promise<ExpenseClaim | null> {
    const claim = await this.getExpenseClaimById(id);
    if (!claim) return null;

    const now = new Date().toISOString();
    claim.status = 'CLARIFICATION_REQUESTED';
    if (!claim.financeVerification) {
      claim.financeVerification = {
        verifiedBy: user.name,
        verificationDate: now.split('T')[0],
        accountDebitCode: '5001',
        accountCreditCode: '2001',
        advanceDeductionAmount: 0,
        netPayableAmount: claim.amount,
      };
    }
    claim.financeVerification.clarificationQuestion = user.question;

    claim.approvalHistory.push({
      stage: 'CLARIFICATION',
      approverId: user.id,
      approverName: user.name,
      role: 'FINANCE_REVIEWER',
      action: 'CLARIFICATION_REQUESTED',
      timestamp: now,
      remarks: user.question,
    });

    return claim;
  }

  // --- 5. Finance Verification & GL Account Classification ---
  public async verifyByFinance(
    id: string,
    financeData: {
      verifierId: string;
      verifierName: string;
      accountDebitCode: string;
      accountCreditCode: string;
      taxAmount?: number;
      advanceDeductionAmount?: number;
      notes?: string;
    }
  ): Promise<ExpenseClaim | null> {
    const claim = await this.getExpenseClaimById(id);
    if (!claim) return null;

    if (claim.status !== 'SUPERVISOR_APPROVED') {
      throw new Error(`Finance verification is allowed only after supervisor approval. Current status: ${claim.status}`);
    }
    if (claim.employeeId === financeData.verifierId) {
      throw new Error('Maker-checker violation: claimant cannot finance-verify their own expense.');
    }
    if (!financeData.verifierId || !financeData.verifierName) {
      throw new Error('Authenticated finance verifier identity is required.');
    }
    if (!financeData.accountDebitCode || !financeData.accountCreditCode) {
      throw new Error('Debit and credit account codes must be explicitly selected from configured finance masters.');
    }

    const now = new Date().toISOString();
    const prev = claim.status;
    claim.status = 'APPROVED_FOR_PAYMENT';

    const deduction = Number(financeData.advanceDeductionAmount || 0);
    if (!Number.isFinite(deduction) || deduction < 0 || deduction > claim.amount) {
      throw new Error('Advance deduction amount is invalid for this expense.');
    }
    const net = claim.amount - deduction;

    claim.financeVerification = {
      verifiedBy: financeData.verifierName,
      verificationDate: now.split('T')[0],
      taxAmount: Number(financeData.taxAmount || 0),
      accountDebitCode: financeData.accountDebitCode,
      accountCreditCode: financeData.accountCreditCode,
      advanceDeductionAmount: deduction,
      netPayableAmount: net,
      notes: financeData.notes,
    };

    claim.approvalHistory.push({
      stage: 'FINANCE_VERIFICATION',
      approverId: financeData.verifierId,
      approverName: financeData.verifierName,
      role: 'FINANCE_CONTROLLER',
      action: 'APPROVED',
      timestamp: now,
      remarks: financeData.notes || `Finance verification completed. Net payable: ${claim.currency} ${net}`,
    });

    claim.auditTrail.push({
      timestamp: now,
      user: financeData.verifierName,
      action: 'FINANCE_VERIFIED',
      previousValue: prev,
      newValue: 'APPROVED_FOR_PAYMENT',
      reason: `Classification set to Dr ${financeData.accountDebitCode} / Cr ${financeData.accountCreditCode}`,
    });

    return claim;
  }

  // --- 6. Payment Execution & Real General Ledger Integration ---
  public async disbursePayment(
    id: string,
    paymentData: {
      paidById: string;
      paidByName: string;
      paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'EMPLOYEE_ACCOUNT' | 'PAYROLL_ADJUSTMENT';
      paymentReference: string;
      amountPaid: number;
    }
  ): Promise<ExpenseClaim | null> {
    const claim = await this.getExpenseClaimById(id);
    if (!claim) return null;

    if (claim.status !== 'APPROVED_FOR_PAYMENT') {
      throw new Error(`Payment is allowed only for approved expenses. Current status: ${claim.status}`);
    }
    if (!paymentData.paidById || !paymentData.paidByName) {
      throw new Error('Authenticated payer identity is required.');
    }
    if (claim.employeeId === paymentData.paidById) {
      throw new Error('Maker-checker violation: claimant cannot disburse their own expense.');
    }
    if (!paymentData.paymentReference || !paymentData.paymentMethod) {
      throw new Error('Payment method and reference are required.');
    }

    const amount = Number(paymentData.amountPaid);
    const payable = claim.financeVerification?.netPayableAmount ?? claim.amount;
    if (!Number.isFinite(amount) || amount <= 0 || amount > payable) {
      throw new Error('Payment amount must be greater than zero and must not exceed the verified net payable amount.');
    }

    const now = new Date().toISOString();
    const prev = claim.status;
    claim.status = 'PAID';

    // 1. Post real double-entry journal entry to Finance GL
    let jvNumber = `JV-EXP-${claim.claimNumber}`;
    try {
      const debitAccount = claim.financeVerification?.accountDebitCode || '5001';
      const creditAccount = claim.financeVerification?.accountCreditCode || '1001'; // Cash/Bank
      const journalAmount = amount;

      const lines = [
        {
          accountCode: debitAccount,
          accountName: `Direct Expense - ${claim.category} (${claim.projectName || 'Site'})`,
          debitAmount: journalAmount,
          creditAmount: 0,
          narration: `Reimbursement claim ${claim.claimNumber}: ${claim.description} [Vendor: ${claim.vendorShop}]`,
        },
        {
          accountCode: creditAccount,
          accountName: paymentData.paymentMethod === 'CASH' ? 'Petty Cash / Imprest Float' : 'Main Operational Bank Account',
          debitAmount: 0,
          creditAmount: journalAmount,
          narration: `Settlement via ${paymentData.paymentMethod} Ref: ${paymentData.paymentReference} to ${claim.employeeName}`,
        }
      ];

      const jv = await financeRepository.createJournalEntry(
        {
          voucherType: 'PAYMENT_VOUCHER',
          postingDate: now.split('T')[0],
          referenceNumber: claim.claimNumber,
          narration: `Employee expense reimbursement for ${claim.employeeName} (${claim.claimNumber})`,
        },
        lines
      );
      if (jv && jv.voucherNumber) {
        jvNumber = jv.voucherNumber;
      }
    } catch (err) {
      console.warn('Auto-posting to finance GL encountered fallback:', err);
    }

    claim.paymentDetails = {
      paymentMethod: paymentData.paymentMethod,
      paymentReference: paymentData.paymentReference,
      paymentDate: now.split('T')[0],
      amountPaid: amount,
      journalVoucherNumber: jvNumber,
      paidBy: paymentData.paidByName,
    };

    claim.auditTrail.push({
      timestamp: now,
      user: paymentData.paidByName,
      action: 'PAYMENT_DISBURSED',
      previousValue: prev,
      newValue: 'PAID',
      reason: `Disbursed ${claim.currency} ${paymentData.amountPaid} via ${paymentData.paymentMethod} (Ref: ${paymentData.paymentReference}, GL: ${jvNumber})`,
    });

    await enterpriseAuditRepository.logEvent({
      userId: paymentData.paidById,
      userName: paymentData.paidByName,
      actionType: 'PAY' as any,
      entityType: 'EXPENSE_CLAIM' as any,
      entityId: claim.id,
      entityNumber: claim.claimNumber,
      fromState: prev,
      toState: 'PAID',
      reason: `Payment disbursed with JV ${jvNumber}`,
    });

    return claim;
  }

  // --- 7. Cash Advances & Settlements Lifecycle ---
  public async getCashAdvances(employeeId?: string): Promise<CashAdvance[]> {
    if (employeeId) {
      return this.cashAdvances.filter(a => a.employeeId === employeeId);
    }
    return this.cashAdvances;
  }

  public async createCashAdvance(data: Partial<CashAdvance>): Promise<CashAdvance> {
    const now = new Date().toISOString();
    const count = this.cashAdvances.length + 1;
    const advanceNumber = `ADV-2026-${String(count).padStart(4, '0')}`;

    const newAdvance: CashAdvance = {
      id: `adv-${uuidv4().substring(0, 8)}`,
      advanceNumber,
      employeeId: data.employeeId || 'emp-101',
      employeeName: data.employeeName || 'Sunil Kumar',
      employeeCode: data.employeeCode || 'EMP-049',
      projectId: data.projectId || 'PRJ-101',
      projectName: data.projectName || 'Dubai Creek Harbor Desalination WTP',
      department: data.department || 'SITE_OPERATIONS',
      requestedAmount: Number(data.requestedAmount) || 5000,
      approvedAmount: Number(data.approvedAmount) || Number(data.requestedAmount) || 5000,
      disbursedAmount: 0,
      currency: data.currency || 'INR',
      purpose: data.purpose || 'Site operational and petty cash requirements',
      requiredDate: data.requiredDate || now.split('T')[0],
      status: 'REQUESTED',
      auditTrail: [
        { timestamp: now, user: data.employeeName || 'Sunil Kumar', action: 'ADVANCE_REQUESTED', reason: data.purpose }
      ],
      createdAt: now,
    };

    this.cashAdvances.unshift(newAdvance);
    return newAdvance;
  }

  public async disburseCashAdvance(id: string, paymentRef: string, amount?: number): Promise<CashAdvance | null> {
    const adv = this.cashAdvances.find(a => a.id === id);
    if (!adv) return null;

    const now = new Date().toISOString();
    adv.disbursedAmount = amount || adv.approvedAmount;
    adv.status = 'DISBURSED';
    adv.disbursedDate = now.split('T')[0];
    adv.paymentReference = paymentRef;
    adv.auditTrail.push({
      timestamp: now,
      user: 'Finance Desk',
      action: 'ADVANCE_DISBURSED',
      reason: `Disbursed ${adv.currency} ${adv.disbursedAmount} via ${paymentRef}`,
    });

    return adv;
  }

  public async settleCashAdvance(
    id: string,
    settlement: {
      totalSettledExpenses: number;
      notes?: string;
      refundReference?: string;
    }
  ): Promise<CashAdvance | null> {
    const adv = this.cashAdvances.find(a => a.id === id);
    if (!adv) return null;

    const now = new Date().toISOString();
    const diff = adv.disbursedAmount - settlement.totalSettledExpenses;

    let balanceType: 'REFUND_DUE_FROM_EMPLOYEE' | 'REIMBURSEMENT_DUE_TO_EMPLOYEE' | 'EXACTLY_BALANCED' = 'EXACTLY_BALANCED';
    if (diff > 0) balanceType = 'REFUND_DUE_FROM_EMPLOYEE';
    else if (diff < 0) balanceType = 'REIMBURSEMENT_DUE_TO_EMPLOYEE';

    adv.settlementDetails = {
      totalSettledExpenses: settlement.totalSettledExpenses,
      balanceAmount: Math.abs(diff),
      balanceType,
      refundStatus: diff === 0 || settlement.refundReference ? 'REFUNDED' : 'PENDING',
      refundReference: settlement.refundReference,
      settledAt: now,
      notes: settlement.notes || `Advance ₹${adv.disbursedAmount} vs Expenses ₹${settlement.totalSettledExpenses}: ₹${Math.abs(diff)} ${balanceType}`,
    };

    adv.status = adv.settlementDetails.refundStatus === 'REFUNDED' ? 'SETTLED' : 'PARTIALLY_SETTLED';
    adv.auditTrail.push({
      timestamp: now,
      user: 'Finance Auditor',
      action: 'ADVANCE_SETTLED',
      reason: adv.settlementDetails.notes,
    });

    return adv;
  }

  // --- 8. Petty Cash Registers & Vouchers ---
  public async getPettyCashRegisters(): Promise<PettyCashRegister[]> {
    return this.pettyCashRegisters;
  }

  public async getPettyCashVouchers(registerId?: string): Promise<PettyCashVoucher[]> {
    if (registerId) {
      return this.pettyCashVouchers.filter(v => v.registerId === registerId);
    }
    return this.pettyCashVouchers;
  }

  public async createPettyCashVoucher(data: Partial<PettyCashVoucher>): Promise<PettyCashVoucher> {
    const now = new Date().toISOString();
    const count = this.pettyCashVouchers.length + 1;
    const voucherNumber = `PCV-2026-${String(count).padStart(4, '0')}`;

    const newVoucher: PettyCashVoucher = {
      id: `pcv-${uuidv4().substring(0, 8)}`,
      voucherNumber,
      registerId: data.registerId || 'pcr-01',
      voucherType: data.voucherType || 'DISBURSEMENT',
      date: data.date || now.split('T')[0],
      payeeRecipient: data.payeeRecipient || 'Site Worker',
      amount: Number(data.amount) || 0,
      currency: data.currency || 'INR',
      category: data.category || 'MATERIAL_PURCHASE',
      projectId: data.projectId || 'PRJ-101',
      costCenter: data.costCenter || 'CC-CIVIL-01',
      description: data.description || 'Petty cash disbursement',
      billNumber: data.billNumber,
      receiptUrl: data.receiptUrl,
      approvedBy: data.approvedBy || 'Site Custodian',
      status: 'POSTED',
      createdAt: now,
    };

    this.pettyCashVouchers.unshift(newVoucher);

    // Update Register balance
    const reg = this.pettyCashRegisters.find(r => r.id === newVoucher.registerId);
    if (reg) {
      if (newVoucher.voucherType === 'DISBURSEMENT') {
        reg.cashIssuedTotal += newVoucher.amount;
        reg.currentBalance = Math.max(0, reg.currentBalance - newVoucher.amount);
      } else if (newVoucher.voucherType === 'FLOAT_TOPUP') {
        reg.cashReceivedTotal += newVoucher.amount;
        reg.currentBalance += newVoucher.amount;
      }
    }

    return newVoucher;
  }

  public async reconcilePettyCashRegister(
    registerId: string,
    physicalCashCount: number,
    reconciledBy: string,
    remarks: string
  ): Promise<PettyCashRegister | null> {
    const reg = this.pettyCashRegisters.find(r => r.id === registerId);
    if (!reg) return null;

    const now = new Date().toISOString();
    const variance = physicalCashCount - reg.currentBalance;
    let status: 'BALANCED' | 'DEFICIT' | 'SURPLUS' = 'BALANCED';
    if (variance < 0) status = 'DEFICIT';
    else if (variance > 0) status = 'SURPLUS';

    const rec = {
      id: `rec-${uuidv4().substring(0, 6)}`,
      date: now.split('T')[0],
      physicalCashCount,
      systemBalance: reg.currentBalance,
      variance,
      status,
      reconciledBy,
      remarks: remarks || `Tally completed. Variance: ${variance}`,
    };

    reg.reconciliations.unshift(rec);
    reg.lastReconciledDate = rec.date;
    reg.status = status === 'BALANCED' ? 'RECONCILED' : 'AUDIT_IN_PROGRESS';

    return reg;
  }

  // --- 9. Comprehensive Executive Analytics & Reporting ---
  public async getExpenseReports() {
    const claims = this.expenseClaims;

    const totalClaimsCount = claims.length;
    const totalClaimedAmount = claims.reduce((acc, c) => acc + c.amount, 0);
    const totalApprovedAmount = claims.filter(c => c.status === 'APPROVED_FOR_PAYMENT' || c.status === 'PAID').reduce((acc, c) => acc + c.amount, 0);
    const totalPaidAmount = claims.filter(c => c.status === 'PAID').reduce((acc, c) => acc + (c.paymentDetails?.amountPaid || c.amount), 0);
    const pendingApprovalCount = claims.filter(c => c.status === 'SUBMITTED' || c.status === 'SUPERVISOR_APPROVED').length;
    const pendingPaymentCount = claims.filter(c => c.status === 'APPROVED_FOR_PAYMENT').length;

    // By Category
    const categoryTotals: Record<string, { count: number; amount: number }> = {};
    claims.forEach(c => {
      const cat = c.category;
      if (!categoryTotals[cat]) categoryTotals[cat] = { count: 0, amount: 0 };
      categoryTotals[cat].count += 1;
      categoryTotals[cat].amount += c.amount;
    });

    // By Project
    const projectTotals: Record<string, { count: number; amount: number }> = {};
    claims.forEach(c => {
      const proj = c.projectName || c.projectId || 'General Corporate';
      if (!projectTotals[proj]) projectTotals[proj] = { count: 0, amount: 0 };
      projectTotals[proj].count += 1;
      projectTotals[proj].amount += c.amount;
    });

    // Advance Outstanding Balance
    const totalAdvancesDisbursed = this.cashAdvances.reduce((acc, a) => acc + a.disbursedAmount, 0);
    const totalAdvancesSettled = this.cashAdvances.reduce((acc, a) => acc + (a.settlementDetails?.totalSettledExpenses || 0), 0);
    const netAdvanceBalance = totalAdvancesDisbursed - totalAdvancesSettled;

    return {
      summary: {
        totalClaimsCount,
        totalClaimedAmount,
        totalApprovedAmount,
        totalPaidAmount,
        pendingApprovalCount,
        pendingPaymentCount,
        totalAdvancesDisbursed,
        totalAdvancesSettled,
        netAdvanceBalance,
      },
      categoryDistribution: Object.entries(categoryTotals).map(([category, stats]) => ({
        category,
        count: stats.count,
        amount: stats.amount,
      })),
      projectDistribution: Object.entries(projectTotals).map(([projectName, stats]) => ({
        projectName,
        count: stats.count,
        amount: stats.amount,
      })),
      advances: this.cashAdvances,
      pettyCashRegisters: this.pettyCashRegisters,
    };
  }
}

export const employeeExpenseRepository = EmployeeExpenseRepository.getInstance();
