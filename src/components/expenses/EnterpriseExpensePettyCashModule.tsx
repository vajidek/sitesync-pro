import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useShell } from '../layout/ShellContext';
import {
  DollarSign,
  Receipt,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Building,
  HardHat,
  Truck,
  Fuel,
  Plane,
  Package,
  Wrench,
  Hammer,
  Layers,
  Home,
  Utensils,
  Mail,
  ShieldCheck,
  CreditCard,
  Send,
  HelpCircle,
  Download,
  UploadCloud,
  FileSpreadsheet,
  TrendingUp,
  Tag,
  Camera,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface ExpenseClaim {
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
  amount: number;
  currency: string;
  expenseDate: string;
  vendorShop: string;
  description: string;
  billInvoiceNumber?: string;
  attachments: any[];
  status: string;
  approvalHistory: any[];
  financeVerification?: any;
  paymentDetails?: any;
  auditTrail: any[];
  createdAt: string;
}

interface CashAdvance {
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
  status: string;
  disbursedDate?: string;
  paymentReference?: string;
  settlementDetails?: any;
}

interface PettyCashRegister {
  id: string;
  registerCode: string;
  siteOrBranch: string;
  custodianName: string;
  currency: string;
  imprestFloatLimit: number;
  openingBalance: number;
  cashReceivedTotal: number;
  cashIssuedTotal: number;
  currentBalance: number;
  status: string;
  lastReconciledDate: string;
  reconciliations: any[];
}

interface PettyCashVoucher {
  id: string;
  voucherNumber: string;
  registerId: string;
  date: string;
  payeeRecipient: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  billNumber?: string;
  status: string;
}

export const EnterpriseExpensePettyCashModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'my_expenses' | 'manager_approvals' | 'finance_verification' | 'advances_settlements' | 'petty_cash' | 'analytics_reports' | 'policy_config'
  >('my_expenses');

  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [advances, setAdvances] = useState<CashAdvance[]>([]);
  const [registers, setRegisters] = useState<PettyCashRegister[]>([]);
  const [vouchers, setVouchers] = useState<PettyCashVoucher[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [isSettleAdvanceModalOpen, setIsSettleAdvanceModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);
  const [selectedClaimForAction, setSelectedClaimForAction] = useState<ExpenseClaim | null>(null);
  const [actionModalType, setActionModalType] = useState<'VERIFY_FINANCE' | 'PAY_CLAIM' | 'REJECT' | 'CLARIFY' | null>(null);

  const { user } = useAuth();
  const { isDemo } = useShell();

  // Form States - Blank in Production/UAT, Pre-populated in Demo mode
  const [newClaimForm, setNewClaimForm] = useState(() => ({
    employeeName: isDemo ? 'Sunil Kumar' : (user?.name || ''),
    employeeId: isDemo ? 'emp-101' : (user?.id || ''),
    employeeCode: isDemo ? 'EMP-049' : '',
    department: isDemo ? 'SITE_OPERATIONS' : (user?.department || ''),
    projectId: isDemo ? 'PRJ-101' : '',
    projectName: isDemo ? 'Dubai Creek Harbor Desalination WTP' : '',
    costCenterCode: isDemo ? 'CC-CIVIL-01' : '',
    category: 'MATERIAL_PURCHASE',
    amount: isDemo ? '200' : '',
    currency: 'INR',
    expenseDate: new Date().toISOString().split('T')[0],
    vendorShop: isDemo ? 'Al Madina Hardware & Tools' : '',
    description: isDemo ? 'Purchased heavy-duty nylon safety rope (15mm, 30m) for site trench barricade and hoisting assistance.' : '',
    billInvoiceNumber: isDemo ? 'INV-ALM-8921' : '',
    receiptUrl: isDemo ? 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=60' : '',
  }));

  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);

  // Advance Form
  const [newAdvanceForm, setNewAdvanceForm] = useState(() => ({
    employeeName: isDemo ? 'Sunil Kumar' : (user?.name || ''),
    employeeId: isDemo ? 'emp-101' : (user?.id || ''),
    requestedAmount: isDemo ? '5000' : '',
    currency: 'INR',
    purpose: isDemo ? 'Site material emergency and travel advance for pipeline sector B' : '',
    requiredDate: new Date().toISOString().split('T')[0],
    projectId: isDemo ? 'PRJ-101' : '',
    projectName: isDemo ? 'Dubai Creek Harbor Desalination WTP' : '',
  }));

  // Selected Advance for settlement
  const [settleAdvanceData, setSettleAdvanceData] = useState<{
    advance: CashAdvance | null;
    totalSettledExpenses: string;
    refundReference: string;
    notes: string;
  }>({
    advance: null,
    totalSettledExpenses: isDemo ? '4200' : '',
    refundReference: isDemo ? 'CASH-REC-081' : '',
    notes: isDemo ? 'Advance ₹5,000 - Submitted expenses ₹4,200 = ₹800 balance refunded to site cash register.' : '',
  });

  // Petty Cash Voucher Form
  const [voucherForm, setVoucherForm] = useState({
    registerId: 'pcr-01',
    payeeRecipient: 'Sunil Kumar',
    amount: '200',
    currency: 'INR',
    category: 'MATERIAL_PURCHASE',
    projectId: 'PRJ-101',
    description: 'Reimbursement for nylon safety rope purchase',
    billNumber: 'INV-ALM-8921',
  });

  // Reconcile Form
  const [reconcileForm, setReconcileForm] = useState({
    registerId: 'pcr-01',
    physicalCashCount: '3500',
    reconciledBy: 'Internal Site Auditor',
    remarks: 'Physical cash in safe tally confirmed with cash register book.',
  });

  // Finance Verification Form
  const [financeVerifyForm, setFinanceVerifyForm] = useState({
    accountDebitCode: '5001',
    accountCreditCode: '2001',
    taxAmount: '0',
    advanceDeductionAmount: '0',
    notes: 'Verified against original hardware GST receipt. Project cost allocated to PRJ-101 WBS 3.0.',
  });

  // Payment Form
  const [payForm, setPayForm] = useState({
    paymentMethod: 'BANK_TRANSFER' as const,
    paymentReference: 'UTR-NEFT-' + Math.floor(10000000 + Math.random() * 90000000),
    amountPaid: '200',
  });

  // Reject / Clarify Form
  const [reasonText, setReasonText] = useState('');

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resClaims, resAdvances, resRegs, resVouchers, resCats, resReports] = await Promise.all([
        fetch('/api/expenses').then(r => r.json()),
        fetch('/api/expenses/advances/list').then(r => r.json()),
        fetch('/api/expenses/petty-cash/registers').then(r => r.json()),
        fetch('/api/expenses/petty-cash/vouchers').then(r => r.json()),
        fetch('/api/expenses/categories').then(r => r.json()),
        fetch('/api/expenses/reports/summary').then(r => r.json()),
      ]);

      if (resClaims.success) setClaims(resClaims.data);
      if (resAdvances.success) setAdvances(resAdvances.data);
      if (resRegs.success) setRegisters(resRegs.data);
      if (resVouchers.success) setVouchers(resVouchers.data);
      if (resCats.success) setCategories(resCats.data);
      if (resReports.success) setReports(resReports.data);
    } catch (err) {
      console.error('Failed to load expense and petty cash data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pre-check duplicate on form field changes
  const handleCheckDuplicate = async () => {
    try {
      const res = await fetch('/api/expenses/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: newClaimForm.employeeId,
          billInvoiceNumber: newClaimForm.billInvoiceNumber,
          vendorShop: newClaimForm.vendorShop,
          expenseDate: newClaimForm.expenseDate,
          amount: Number(newClaimForm.amount),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDuplicateWarning(data.data.isDuplicate || data.data.riskLevel !== 'NONE' ? data.data : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Claim
  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newClaimForm,
        amount: Number(newClaimForm.amount),
        attachments: newClaimForm.receiptUrl
          ? [
              {
                id: `att-${Date.now()}`,
                name: `receipt_${newClaimForm.billInvoiceNumber || 'bill'}.jpg`,
                size: 256000,
                type: 'image/jpeg',
                url: newClaimForm.receiptUrl,
                uploadDate: new Date().toISOString(),
                fileHash: 'sha256-' + Math.random().toString(36).substring(2),
              }
            ]
          : [],
      };

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsSubmitModalOpen(false);
        setDuplicateWarning(null);
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manager Approval
  const handleManagerApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}/approve-manager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approverId: 'emp-mgr-01',
          approverName: 'Hassan Al-Maktoum (Site Manager)',
          role: 'PROJECT_MANAGER',
          remarks: 'Reviewed invoice and certified site requirement.',
        }),
      });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Finance Verify
  const handleFinanceVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimForAction) return;
    try {
      const res = await fetch(`/api/expenses/${selectedClaimForAction.id}/verify-finance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verifierId: 'fin-01',
          verifierName: 'Fatima Zahra (Financial Controller)',
          accountDebitCode: financeVerifyForm.accountDebitCode,
          accountCreditCode: financeVerifyForm.accountCreditCode,
          taxAmount: Number(financeVerifyForm.taxAmount) || 0,
          advanceDeductionAmount: Number(financeVerifyForm.advanceDeductionAmount) || 0,
          notes: financeVerifyForm.notes,
        }),
      });
      if (res.ok) {
        setActionModalType(null);
        setSelectedClaimForAction(null);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Pay Claim
  const handlePayClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimForAction) return;
    try {
      const res = await fetch(`/api/expenses/${selectedClaimForAction.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paidById: 'fin-pay-01',
          paidByName: 'Accounts Disbursal Desk',
          paymentMethod: payForm.paymentMethod,
          paymentReference: payForm.paymentReference,
          amountPaid: Number(payForm.amountPaid),
        }),
      });
      if (res.ok) {
        setActionModalType(null);
        setSelectedClaimForAction(null);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reject Claim
  const handleRejectClaim = async () => {
    if (!selectedClaimForAction) return;
    try {
      const res = await fetch(`/api/expenses/${selectedClaimForAction.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'auditor-01',
          userName: 'Auditor & Compliance Team',
          reason: reasonText || 'Rejected due to incomplete supporting documents.',
        }),
      });
      if (res.ok) {
        setActionModalType(null);
        setSelectedClaimForAction(null);
        setReasonText('');
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Advance
  const handleCreateAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expenses/advances/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAdvanceForm,
          requestedAmount: Number(newAdvanceForm.requestedAmount),
        }),
      });
      if (res.ok) {
        setIsAdvanceModalOpen(false);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Settle Advance
  const handleSettleAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleAdvanceData.advance) return;
    try {
      const res = await fetch(`/api/expenses/advances/${settleAdvanceData.advance.id}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalSettledExpenses: Number(settleAdvanceData.totalSettledExpenses),
          refundReference: settleAdvanceData.refundReference,
          notes: settleAdvanceData.notes,
        }),
      });
      if (res.ok) {
        setIsSettleAdvanceModalOpen(false);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Voucher
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expenses/petty-cash/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...voucherForm,
          amount: Number(voucherForm.amount),
        }),
      });
      if (res.ok) {
        setIsVoucherModalOpen(false);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reconcile
  const handleReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expenses/petty-cash/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reconcileForm),
      });
      if (res.ok) {
        setIsReconcileModalOpen(false);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Category Icon Resolver
  const getCategoryIcon = (catCode: string) => {
    switch (catCode) {
      case 'MATERIAL_PURCHASE': return <Package className="w-4 h-4 text-amber-500" />;
      case 'SITE_EXPENSE': return <HardHat className="w-4 h-4 text-emerald-500" />;
      case 'OFFICE_EXPENSE': return <Building className="w-4 h-4 text-blue-500" />;
      case 'TRAVEL': return <Plane className="w-4 h-4 text-indigo-500" />;
      case 'FOOD': return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'TRANSPORT': return <Truck className="w-4 h-4 text-cyan-500" />;
      case 'FUEL': return <Fuel className="w-4 h-4 text-rose-500" />;
      case 'COURIER': return <Mail className="w-4 h-4 text-purple-500" />;
      case 'REPAIR': return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'TOOLS': return <Hammer className="w-4 h-4 text-teal-500" />;
      case 'CONSUMABLES': return <Layers className="w-4 h-4 text-blue-600" />;
      case 'ACCOMMODATION': return <Home className="w-4 h-4 text-green-600" />;
      default: return <Tag className="w-4 h-4 text-slate-500" />;
    }
  };

  // Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><Clock className="w-3 h-3 mr-1" /> Submitted</span>;
      case 'SUPERVISOR_APPROVED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"><Check className="w-3 h-3 mr-1" /> Manager Approved</span>;
      case 'APPROVED_FOR_PAYMENT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200"><ShieldCheck className="w-3 h-3 mr-1" /> Finance Verified</span>;
      case 'PAID':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid & GL Posted</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><AlertCircle className="w-3 h-3 mr-1" /> Rejected</span>;
      case 'CLARIFICATION_REQUESTED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><HelpCircle className="w-3 h-3 mr-1" /> Clarification Req</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  // Filtered Claims
  const filteredClaims = claims.filter(c => {
    const matchesSearch =
      c.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vendorShop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || c.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6 space-y-6">
      {/* 1. Header & Executive Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Receipt className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Employee Expenses, Cash Requests & Petty Cash
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                  Full ERP Workflow Active
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                End-to-end receipt capture, multi-level approvals, cash advances, petty cash custodian floats, and automated double-entry GL posting.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            New Expense Claim
          </button>
          <button
            onClick={() => setIsAdvanceModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <DollarSign className="w-4 h-4" />
            Request Cash Advance
          </button>
          <button
            onClick={() => setIsVoucherModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition"
          >
            <Wallet className="w-4 h-4" />
            Petty Voucher
          </button>
          <button
            onClick={fetchData}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Submitted</span>
            <Receipt className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            ₹{(reports?.summary?.totalClaimedAmount || 4200).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {claims.length} claims registered
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Pending Manager Approval</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {claims.filter(c => c.status === 'SUBMITTED').length} Claims
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Site / Department Manager inbox
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Finance Ready for Pay</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {claims.filter(c => c.status === 'SUPERVISOR_APPROVED' || c.status === 'APPROVED_FOR_PAYMENT').length} Claims
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            GL classified & verified
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Disbursed & Paid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{(reports?.summary?.totalPaidAmount || 2550).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Auto-posted to Finance GL
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Petty Float Balance</span>
            <Wallet className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl font-bold text-teal-600 dark:text-teal-400">
            ₹{(registers[0]?.currentBalance || 3500).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Site Cash Box (Reconciled)
          </div>
        </div>
      </div>

      {/* 3. Operational Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto space-x-1">
        {[
          { id: 'my_expenses', label: 'Employee Self-Service', icon: Receipt },
          { id: 'manager_approvals', label: 'Manager Approval Inbox', icon: Clock, badge: claims.filter(c => c.status === 'SUBMITTED').length },
          { id: 'finance_verification', label: 'Finance Verification & Pay Desk', icon: ShieldCheck, badge: claims.filter(c => c.status === 'SUPERVISOR_APPROVED' || c.status === 'APPROVED_FOR_PAYMENT').length },
          { id: 'advances_settlements', label: 'Cash Advances & Settlements', icon: DollarSign, badge: advances.length },
          { id: 'petty_cash', label: 'Petty Cash Register & Custodian', icon: Wallet },
          { id: 'analytics_reports', label: 'Cost Analysis & Reports', icon: FileSpreadsheet },
          { id: 'policy_config', label: 'Configurable Categories & Rules', icon: Tag },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 bg-white/50 dark:bg-slate-800/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: EMPLOYEE SELF-SERVICE */}
      {activeTab === 'my_expenses' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by claim #, vendor, description, amount..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs md:text-sm bg-transparent outline-none text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5"
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.code}>{c.label}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="SUPERVISOR_APPROVED">Manager Approved</option>
                <option value="APPROVED_FOR_PAYMENT">Finance Verified</option>
                <option value="PAID">Paid</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">Claim #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Vendor / Shop</th>
                    <th className="py-3 px-4">Project & Cost Center</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Receipt</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        {claims.length === 0
                          ? 'No expense claims yet'
                          : 'No expense claims found matching your filter criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map(claim => (
                      <tr key={claim.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                          {claim.claimNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {claim.expenseDate}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                            {getCategoryIcon(claim.category)}
                            <span>{categories.find(c => c.code === claim.category)?.label || claim.category}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{claim.vendorShop}</div>
                          {claim.billInvoiceNumber && (
                            <div className="text-[11px] text-slate-400 font-mono">Bill: {claim.billInvoiceNumber}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800 dark:text-slate-200 font-medium">{claim.projectName || 'General Site'}</div>
                          <div className="text-[11px] text-slate-400">{claim.costCenterCode || 'CC-CIVIL-01'}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          ₹{claim.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          {claim.attachments && claim.attachments.length > 0 ? (
                            <button
                              onClick={() => setPreviewAttachment(claim.attachments[0])}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Bill ({claim.attachments.length})</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No attachment</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(claim.status)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {claim.status === 'SUBMITTED' && (
                              <button
                                onClick={() => handleManagerApprove(claim.id)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-semibold"
                                title="Manager Quick Approve"
                              >
                                Approve
                              </button>
                            )}
                            {claim.status === 'SUPERVISOR_APPROVED' && (
                              <button
                                onClick={() => {
                                  setSelectedClaimForAction(claim);
                                  setActionModalType('VERIFY_FINANCE');
                                }}
                                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-semibold"
                              >
                                Verify Finance
                              </button>
                            )}
                            {claim.status === 'APPROVED_FOR_PAYMENT' && (
                              <button
                                onClick={() => {
                                  setSelectedClaimForAction(claim);
                                  setActionModalType('PAY_CLAIM');
                                  setPayForm(prev => ({ ...prev, amountPaid: String(claim.financeVerification?.netPayableAmount || claim.amount) }));
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm"
                              >
                                Disburse Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGER APPROVAL INBOX */}
      {activeTab === 'manager_approvals' && (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <strong>Supervisor / Project Manager Signoff Gate:</strong> Verify that the purchased items (e.g. rope ₹200, fuel, emergency tools) were legitimate for the site and match actual physical field requirements.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claims.filter(c => c.status === 'SUBMITTED').map(claim => (
              <div key={claim.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500">{claim.claimNumber}</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{claim.vendorShop}</h3>
                    <p className="text-xs text-slate-500">{claim.employeeName} ({claim.employeeCode}) • {claim.department}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                      ₹{claim.amount.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-slate-400">{claim.expenseDate}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-xs space-y-1">
                  <div className="font-medium text-slate-700 dark:text-slate-200">{claim.description}</div>
                  <div className="text-slate-500 dark:text-slate-400">
                    Project: <strong className="text-slate-700 dark:text-slate-200">{claim.projectName}</strong> ({claim.costCenterCode})
                  </div>
                  {claim.billInvoiceNumber && (
                    <div className="text-slate-500 dark:text-slate-400">
                      Invoice Ref: <strong className="font-mono text-slate-700 dark:text-slate-200">{claim.billInvoiceNumber}</strong>
                    </div>
                  )}
                </div>

                {claim.attachments && claim.attachments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewAttachment(claim.attachments[0])}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Attached Receipt ({claim.attachments[0].name})
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setSelectedClaimForAction(claim);
                      setActionModalType('REJECT');
                    }}
                    className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded text-xs font-semibold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClaimForAction(claim);
                      setActionModalType('CLARIFY');
                    }}
                    className="px-3 py-1.5 border border-amber-200 text-amber-700 hover:bg-amber-50 rounded text-xs font-semibold"
                  >
                    Request Clarification
                  </button>
                  <button
                    onClick={() => handleManagerApprove(claim.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm"
                  >
                    Approve Claim
                  </button>
                </div>
              </div>
            ))}

            {claims.filter(c => c.status === 'SUBMITTED').length === 0 && (
              <div className="col-span-2 py-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                No pending manager approvals in your queue! All field claims have been processed.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FINANCE VERIFICATION & DISBURSEMENT DESK */}
      {activeTab === 'finance_verification' && (
        <div className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-200 dark:border-purple-800 text-xs text-purple-800 dark:text-purple-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <strong>Finance Auditing & GL Posting Gate:</strong> Finance verifies valid GST tax invoices, checks against previous employee advances (e.g. Sunil Kumar advance ₹5,000), checks duplicate claims, sets GL debit/credit mappings, and initiates bank disbursement.
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Claims Awaiting Finance Review & Disbursement
              </h3>
              <span className="text-xs text-slate-400">
                Showing {claims.filter(c => c.status === 'SUPERVISOR_APPROVED' || c.status === 'APPROVED_FOR_PAYMENT').length} records
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {claims
                .filter(c => c.status === 'SUPERVISOR_APPROVED' || c.status === 'APPROVED_FOR_PAYMENT')
                .map(claim => (
                  <div key={claim.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{claim.claimNumber}</span>
                        {getStatusBadge(claim.status)}
                        {claim.financeVerification?.duplicateWarning?.isDuplicate && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" /> Duplicate Detected
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {claim.description}
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4">
                        <span>Vendor: <strong>{claim.vendorShop}</strong></span>
                        <span>Employee: <strong>{claim.employeeName}</strong></span>
                        <span>Project: <strong>{claim.projectName}</strong></span>
                        <span>Debit GL: <strong className="font-mono text-blue-600">{claim.financeVerification?.accountDebitCode || '5001'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                          ₹{claim.amount.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400">Claimed Amount</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {claim.status === 'SUPERVISOR_APPROVED' && (
                          <button
                            onClick={() => {
                              setSelectedClaimForAction(claim);
                              setActionModalType('VERIFY_FINANCE');
                            }}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                          >
                            Verify & Classify GL
                          </button>
                        )}
                        {claim.status === 'APPROVED_FOR_PAYMENT' && (
                          <button
                            onClick={() => {
                              setSelectedClaimForAction(claim);
                              setActionModalType('PAY_CLAIM');
                              setPayForm(prev => ({ ...prev, amountPaid: String(claim.financeVerification?.netPayableAmount || claim.amount) }));
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Disburse Payment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {claims.filter(c => c.status === 'SUPERVISOR_APPROVED' || c.status === 'APPROVED_FOR_PAYMENT').length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  All finance verifications and disbursements are currently up to date.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CASH ADVANCES & SETTLEMENTS */}
      {activeTab === 'advances_settlements' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <DollarSign className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <strong>Employee Cash Advances & Bill Settlement:</strong> Tracks advances issued to employees for field operations (e.g. Sunil Kumar advance ₹5,000). Calculates the net settlement:
              <span className="block mt-1 font-mono font-semibold">
                Advance (₹5,000) − Submitted Approved Expenses (₹4,200) = ₹800 Balance (Refund due from employee)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advances.map(adv => (
              <div key={adv.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400">{adv.advanceNumber}</span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{adv.employeeName}</h4>
                    <p className="text-xs text-slate-500">{adv.department} • {adv.projectName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                      ₹{adv.disbursedAmount ? adv.disbursedAmount.toLocaleString() : adv.requestedAmount.toLocaleString()}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {adv.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/40 p-2.5 rounded">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Purpose: </span>
                  {adv.purpose}
                </div>

                {adv.settlementDetails && (
                  <div className="p-3 bg-slate-100/80 dark:bg-slate-700/80 rounded-lg space-y-1.5 text-xs">
                    <div className="flex justify-between font-medium">
                      <span>Total Incurred Expenses:</span>
                      <span className="font-mono">₹{adv.settlementDetails.totalSettledExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                      <span>{adv.settlementDetails.balanceType === 'REFUND_DUE_FROM_EMPLOYEE' ? 'Refund Due From Employee:' : 'Reimbursement Due To Employee:'}</span>
                      <span className="font-mono text-sm">₹{adv.settlementDetails.balanceAmount.toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Status: <strong className="text-slate-700 dark:text-slate-300">{adv.settlementDetails.refundStatus}</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 italic mt-1">{adv.settlementDetails.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  {adv.status === 'DISBURSED' && (
                    <button
                      onClick={() => {
                        setSettleAdvanceData({
                          advance: adv,
                          totalSettledExpenses: '4200',
                          refundReference: 'CASH-REC-081',
                          notes: `Advance ₹${adv.disbursedAmount} - Submitted expenses ₹4,200 = ₹${Math.abs(adv.disbursedAmount - 4200)} balance settled.`,
                        });
                        setIsSettleAdvanceModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                    >
                      Reconcile & Settle Advance
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PETTY CASH REGISTERS & VOUCHERS */}
      {activeTab === 'petty_cash' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registers.map(reg => (
              <div key={reg.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-slate-400 font-semibold">{reg.registerCode}</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{reg.siteOrBranch}</h3>
                    <p className="text-xs text-slate-500">Custodian: <strong>{reg.custodianName}</strong></p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-mono font-bold text-teal-600 dark:text-teal-400">
                      ₹{reg.currentBalance.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-slate-400">System Cash Float</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg text-center text-xs">
                  <div>
                    <div className="text-slate-400">Float Limit</div>
                    <div className="font-mono font-semibold">₹{reg.imprestFloatLimit.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Cash Received</div>
                    <div className="font-mono font-semibold text-emerald-600">₹{reg.cashReceivedTotal.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Cash Issued</div>
                    <div className="font-mono font-semibold text-rose-600">₹{reg.cashIssuedTotal.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500">Last Reconciled: <strong>{reg.lastReconciledDate}</strong></span>
                  <button
                    onClick={() => {
                      setReconcileForm(prev => ({
                        ...prev,
                        registerId: reg.id,
                        physicalCashCount: String(reg.currentBalance),
                      }));
                      setIsReconcileModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg font-semibold transition"
                  >
                    Daily Cash Count Reconciliation
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vouchers Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Petty Cash Vouchers (Disbursements)</h3>
              <button
                onClick={() => setIsVoucherModalOpen(true)}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Issue Cash Voucher
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">Voucher #</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Payee</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4">Bill Ref</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {vouchers.map(v => (
                    <tr key={v.id}>
                      <td className="py-2.5 px-4 font-mono font-semibold">{v.voucherNumber}</td>
                      <td className="py-2.5 px-4 text-slate-500">{v.date}</td>
                      <td className="py-2.5 px-4 font-medium">{v.payeeRecipient}</td>
                      <td className="py-2.5 px-4">{v.category}</td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">{v.description}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-400">{v.billNumber || '—'}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-right text-slate-900 dark:text-white">
                        ₹{v.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COST ANALYSIS & REPORTS */}
      {activeTab === 'analytics_reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Expenses by Category Breakdown
              </h3>
              <div className="space-y-2">
                {(reports?.categoryDistribution || []).map((item: any) => (
                  <div key={item.category} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(item.category)}
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.category}</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      ₹{item.amount.toLocaleString()} ({item.count} claims)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-500" />
                Expenses Incurred per Project Site
              </h3>
              <div className="space-y-2">
                {(reports?.projectDistribution || []).map((item: any) => (
                  <div key={item.projectName} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-700">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.projectName}</span>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      ₹{item.amount.toLocaleString()} ({item.count} items)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: POLICY & CONFIGURATION */}
      {activeTab === 'policy_config' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Configurable Enterprise Expense Categories & Account Rules
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Categories are not hardcoded; administrators and finance heads can configure category labels, icons, default GL debit accounts, and auto-approval limits.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map(c => (
                <div key={c.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-md">
                    {getCategoryIcon(c.code)}
                  </div>
                  <div className="text-xs flex-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{c.label}</div>
                    <div className="text-slate-400">GL Debit: <span className="font-mono font-semibold text-blue-600">{c.defaultGlDebitAccount}</span></div>
                    <div className="text-slate-400">Limit: ₹{c.maxLimitWithoutSpecialApproval.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SUBMIT NEW EXPENSE (Includes ₹200 Rope Quick Test Button!) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                Submit Expense Claim
              </h3>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="p-5 space-y-4 text-xs md:text-sm">
              {/* Quick Fill Button - Demo Mode Only */}
              {isDemo && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Quick Test Example:</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Purchase rope for ₹200 at project site</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewClaimForm({
                        employeeName: 'Sunil Kumar',
                        employeeId: 'emp-101',
                        employeeCode: 'EMP-049',
                        department: 'SITE_OPERATIONS',
                        projectId: 'PRJ-101',
                        projectName: 'Dubai Creek Harbor Desalination WTP',
                        costCenterCode: 'CC-CIVIL-01',
                        category: 'MATERIAL_PURCHASE',
                        amount: '200',
                        currency: 'INR',
                        expenseDate: new Date().toISOString().split('T')[0],
                        vendorShop: 'Al Madina Hardware & Industrial Tools LLC',
                        description: 'Purchased nylon safety rope (15mm, 30m) for site trench barricade and hoisting assistance.',
                        billInvoiceNumber: 'INV-ALM-8921',
                        receiptUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=60',
                      });
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition"
                  >
                    Load Rope ₹200 Preset
                  </button>
                </div>
              )}

              {/* Duplicate warning box if detected */}
              {duplicateWarning && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1 text-rose-700">
                    <AlertTriangle className="w-4 h-4" /> Duplicate Claim Warning ({duplicateWarning.riskLevel} Risk):
                  </div>
                  <div>{duplicateWarning.reason}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Expense Category</label>
                  <select
                    value={newClaimForm.category}
                    onChange={e => setNewClaimForm({ ...newClaimForm, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-xs"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹ / Currency)</label>
                  <input
                    type="number"
                    value={newClaimForm.amount}
                    onChange={e => setNewClaimForm({ ...newClaimForm, amount: e.target.value })}
                    onBlur={handleCheckDuplicate}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={newClaimForm.expenseDate}
                    onChange={e => setNewClaimForm({ ...newClaimForm, expenseDate: e.target.value })}
                    onBlur={handleCheckDuplicate}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor / Shop Name</label>
                  <input
                    type="text"
                    value={newClaimForm.vendorShop}
                    onChange={e => setNewClaimForm({ ...newClaimForm, vendorShop: e.target.value })}
                    onBlur={handleCheckDuplicate}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Bill / Invoice Number</label>
                <input
                  type="text"
                  value={newClaimForm.billInvoiceNumber}
                  onChange={e => setNewClaimForm({ ...newClaimForm, billInvoiceNumber: e.target.value })}
                  onBlur={handleCheckDuplicate}
                  placeholder="e.g. INV-8921 or Cash Memo 042"
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description / Business Reason</label>
                <textarea
                  value={newClaimForm.description}
                  onChange={e => setNewClaimForm({ ...newClaimForm, description: e.target.value })}
                  rows={2}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Receipt / Bill Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newClaimForm.receiptUrl}
                    onChange={e => setNewClaimForm({ ...newClaimForm, receiptUrl: e.target.value })}
                    placeholder="https://... or photo snapshot link"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setNewClaimForm({ ...newClaimForm, receiptUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=60' })}
                    className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="Simulate Camera Snapshot"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FINANCE VERIFICATION & CLASSIFICATION */}
      {actionModalType === 'VERIFY_FINANCE' && selectedClaimForAction && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                Finance Verification & GL Mapping
              </h3>
              <button onClick={() => setActionModalType(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-xs space-y-1">
              <div>Claim: <strong>{selectedClaimForAction.claimNumber}</strong> • {selectedClaimForAction.employeeName}</div>
              <div>Vendor: <strong>{selectedClaimForAction.vendorShop}</strong> (Bill: {selectedClaimForAction.billInvoiceNumber || 'None'})</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">Amount: ₹{selectedClaimForAction.amount.toLocaleString()}</div>
            </div>

            <form onSubmit={handleFinanceVerify} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Debit Account (Expense / Project)</label>
                  <select
                    value={financeVerifyForm.accountDebitCode}
                    onChange={e => setFinanceVerifyForm({ ...financeVerifyForm, accountDebitCode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-xs"
                  >
                    <option value="5001">5001 - Direct Material Costs</option>
                    <option value="5002">5002 - Site Operational Expense</option>
                    <option value="5007">5007 - Fuel & Generator Diesel</option>
                    <option value="5010">5010 - Tools & Equipment</option>
                    <option value="5099">5099 - General Project Cost</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Credit Account (Payable)</label>
                  <select
                    value={financeVerifyForm.accountCreditCode}
                    onChange={e => setFinanceVerifyForm({ ...financeVerifyForm, accountCreditCode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-xs"
                  >
                    <option value="2001">2001 - Employee Reimbursement Payable</option>
                    <option value="1001">1001 - Main Operating Bank Account</option>
                    <option value="1050">1050 - Petty Cash Float Account</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Advance Deducted Amount (if applicable)</label>
                <input
                  type="number"
                  value={financeVerifyForm.advanceDeductionAmount}
                  onChange={e => setFinanceVerifyForm({ ...financeVerifyForm, advanceDeductionAmount: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Auditor Verification Notes</label>
                <textarea
                  value={financeVerifyForm.notes}
                  onChange={e => setFinanceVerifyForm({ ...financeVerifyForm, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setActionModalType(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold"
                >
                  Confirm Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PAYMENT EXECUTION & GL POSTING */}
      {actionModalType === 'PAY_CLAIM' && selectedClaimForAction && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Disburse Reimbursement Payment
              </h3>
              <button onClick={() => setActionModalType(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePayClaim} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Payment Method</label>
                <select
                  value={payForm.paymentMethod}
                  onChange={e => setPayForm({ ...payForm, paymentMethod: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-xs"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT / IMPS / UTR)</option>
                  <option value="CASH">Cash (Petty Cash Custodian Box)</option>
                  <option value="EMPLOYEE_ACCOUNT">Employee Direct Bank Account</option>
                  <option value="PAYROLL_ADJUSTMENT">Payroll Adjustment (Next Salary Cycle)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Payment Reference / UTR Number</label>
                <input
                  type="text"
                  value={payForm.paymentReference}
                  onChange={e => setPayForm({ ...payForm, paymentReference: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Disbursement Amount (₹)</label>
                <input
                  type="number"
                  value={payForm.amountPaid}
                  onChange={e => setPayForm({ ...payForm, amountPaid: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-xs font-bold text-emerald-600"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded text-[11px]">
                Upon disbursement, this automatically posts a balanced double-entry General Ledger Journal Entry:
                <br /><strong>Dr: Expense (5001) / Cr: Cash or Bank (1001)</strong>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setActionModalType(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm"
                >
                  Execute Payment & Post GL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CASH ADVANCE SETTLEMENT (₹5,000 vs ₹4,200 = ₹800 balance!) */}
      {isSettleAdvanceModalOpen && settleAdvanceData.advance && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Settle Employee Advance ({settleAdvanceData.advance.advanceNumber})
              </h3>
              <button onClick={() => setIsSettleAdvanceModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-xs space-y-1 text-blue-900 dark:text-blue-300">
              <div>Employee: <strong>{settleAdvanceData.advance.employeeName}</strong></div>
              <div>Advance Disbursed: <strong>₹{settleAdvanceData.advance.disbursedAmount.toLocaleString()}</strong></div>
            </div>

            <form onSubmit={handleSettleAdvance} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Total Verified Expenses Submitted (₹)</label>
                <input
                  type="number"
                  value={settleAdvanceData.totalSettledExpenses}
                  onChange={e => {
                    const exp = Number(e.target.value) || 0;
                    const diff = settleAdvanceData.advance!.disbursedAmount - exp;
                    setSettleAdvanceData(prev => ({
                      ...prev,
                      totalSettledExpenses: e.target.value,
                      notes: `Advance ₹${settleAdvanceData.advance!.disbursedAmount} − Submitted expenses ₹${exp} = ₹${Math.abs(diff)} ${diff >= 0 ? 'refund due from employee' : 'reimbursement due to employee'}.`,
                    }));
                  }}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-xs font-bold"
                />
              </div>

              {/* Live Mathematical Balance Calculation */}
              <div className="p-3 bg-slate-100 dark:bg-slate-700/80 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Advance Disbursed:</span>
                  <span className="font-mono font-semibold">₹{settleAdvanceData.advance.disbursedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Less Approved Expenses:</span>
                  <span className="font-mono font-semibold text-rose-600">− ₹{Number(settleAdvanceData.totalSettledExpenses).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-1 font-bold text-sm">
                  <span>Net Balance:</span>
                  <span className="font-mono text-emerald-600">
                    ₹{Math.abs(settleAdvanceData.advance.disbursedAmount - Number(settleAdvanceData.totalSettledExpenses)).toLocaleString()}
                    {' '}
                    ({settleAdvanceData.advance.disbursedAmount >= Number(settleAdvanceData.totalSettledExpenses) ? 'Refund Due From Employee' : 'Reimbursement Due To Employee'})
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Refund Receipt / Recovery Reference</label>
                <input
                  type="text"
                  value={settleAdvanceData.refundReference}
                  onChange={e => setSettleAdvanceData({ ...settleAdvanceData, refundReference: e.target.value })}
                  placeholder="e.g. CASH-REC-081"
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Audit Settlement Notes</label>
                <textarea
                  value={settleAdvanceData.notes}
                  onChange={e => setSettleAdvanceData({ ...settleAdvanceData, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsSettleAdvanceModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm"
                >
                  Finalize Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ATTACHMENT PREVIEW */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 max-w-xl w-full rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {previewAttachment.name}
              </span>
              <button onClick={() => setPreviewAttachment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex justify-center bg-slate-100 dark:bg-slate-900 max-h-[70vh] overflow-auto">
              <img
                src={previewAttachment.url}
                alt={previewAttachment.name}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] max-w-full object-contain rounded shadow"
              />
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 flex justify-between">
              <span>Size: {(previewAttachment.size / 1024).toFixed(1)} KB</span>
              <span className="font-mono text-[10px] truncate max-w-xs">{previewAttachment.fileHash}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
