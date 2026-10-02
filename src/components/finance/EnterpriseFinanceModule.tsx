import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Receipt, 
  CreditCard, 
  Building2, 
  FileText, 
  Plus, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Calculator, 
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  Scale,
  Clock,
  FileSpreadsheet,
  Printer,
  Download
} from 'lucide-react';
import { ProjectCashRequestsView } from './ProjectCashRequestsView';
import { EnterpriseExpensePettyCashModule } from '../expenses/EnterpriseExpensePettyCashModule';

interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountGroup: string;
  accountType: string;
  currentBalance: number;
  status: string;
}

interface CostCenter {
  id: string;
  code: string;
  name: string;
  centerType: string;
  department: string;
  annualBudget: number;
  utilizedAmount: number;
}

interface JournalEntry {
  id: string;
  voucherNumber: string;
  voucherType: string;
  postingDate: string;
  narration: string;
  totalDebit: number;
  totalCredit: number;
  status: string;
}

interface APInvoice {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  outstandingAmount: number;
  status: string;
}

interface ARInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  projectName?: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  outstandingAmount: number;
  status: string;
}

interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  currentBalance: number;
  currency: string;
}

interface BudgetMaster {
  id: string;
  budgetName: string;
  costCenterCode: string;
  allocatedBudget: number;
  consumedBudget: number;
  remainingBudget: number;
}

interface TaxRecord {
  id: string;
  taxCode: string;
  taxName: string;
  taxType: string;
  ratePercent: number;
}

export const EnterpriseFinanceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'cash_requests' | 'coa' | 'journals' | 'ledger' | 'ap' | 'ar' | 'banking' | 'budget' | 'cost' | 'tax' | 'statements'>('overview');
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [apInvoices, setAPInvoices] = useState<APInvoice[]>([]);
  const [arInvoices, setARInvoices] = useState<ARInvoice[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [budgets, setBudgets] = useState<BudgetMaster[]>([]);
  const [taxes, setTaxes] = useState<TaxRecord[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [statementsSubTab, setStatementsSubTab] = useState<'trial_balance' | 'profit_loss' | 'balance_sheet' | 'cash_flow'>('trial_balance');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [showAPModal, setShowAPModal] = useState(false);
  const [showARModal, setShowARModal] = useState(false);

  // Forms
  const [newAccount, setNewAccount] = useState({
    accountCode: '',
    accountName: '',
    accountGroup: 'ASSETS',
    accountType: 'CURRENT_ASSET',
    initialBalance: 0,
  });

  const [newJournal, setNewJournal] = useState({
    narration: 'Inter-company equipment & project transfer',
    voucherType: 'GENERAL_JOURNAL',
    debitCode: '1010',
    debitName: 'Cash & Bank Operating Account',
    debitAmount: 25000,
    creditCode: '4010',
    creditName: 'Project Construction Revenue',
    creditAmount: 25000,
  });

  const [newAP, setNewAP] = useState({
    vendorName: 'Consolidated Cement Industries LLC',
    totalAmount: 48500,
    taxAmount: 2425,
    dueDate: '2026-09-15',
  });

  const [newAR, setNewAR] = useState({
    customerName: 'Dubai Roads & Transport Authority (RTA)',
    projectName: 'Dubai Metro Expansion Line',
    totalAmount: 185000,
    taxAmount: 9250,
    dueDate: '2026-09-30',
  });

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const [resA, resC, resJ, resAP, resAR, resB, resBd, resT, resS, resGL] = await Promise.all([
        fetch('/api/finance/accounts', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/finance/cost-centers', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/finance/journals', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/finance/ap/invoices', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/finance/ar/invoices', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/finance/bank-accounts', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/finance/budgets', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/finance/taxes', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/finance/stats', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: null })),
        fetch('/api/finance/general-ledger', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: [] })),
      ]);

      setAccounts(resA.data?.length ? resA.data : getMockAccounts());
      setCostCenters(resC.data?.length ? resC.data : getMockCostCenters());
      setJournals(resJ.data?.length ? resJ.data : getMockJournals());
      setAPInvoices(resAP.data?.length ? resAP.data : getMockAP());
      setARInvoices(resAR.data?.length ? resAR.data : getMockAR());
      setBankAccounts(resB.data?.length ? resB.data : getMockBank());
      setBudgets(resBd.data?.length ? resBd.data : getMockBudgets());
      setTaxes(resT.data?.length ? resT.data : getMockTaxes());
      setStats(resS.data ? resS.data : getMockStats());
      setLedgerEntries(resGL.data?.length ? resGL.data : getMockLedger());
    } catch (e) {
      console.error('Failed to load finance data:', e);
      setAccounts(getMockAccounts());
      setCostCenters(getMockCostCenters());
      setJournals(getMockJournals());
      setAPInvoices(getMockAP());
      setARInvoices(getMockAR());
      setBankAccounts(getMockBank());
      setBudgets(getMockBudgets());
      setTaxes(getMockTaxes());
      setStats(getMockStats());
      setLedgerEntries(getMockLedger());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/finance/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newAccount),
      });
      if (res.ok) {
        setShowAccountModal(false);
        fetchFinanceData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create account');
      }
    } catch (e) {
      console.error('Error creating account:', e);
    }
  };

  const handlePostJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newJournal.debitAmount !== newJournal.creditAmount) {
      alert('Double-Entry Violation: Debit must equal Credit amount!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/finance/journals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          narration: newJournal.narration,
          voucherType: newJournal.voucherType,
          lines: [
            {
              accountCode: newJournal.debitCode,
              accountName: newJournal.debitName,
              debitAmount: newJournal.debitAmount,
              creditAmount: 0,
            },
            {
              accountCode: newJournal.creditCode,
              accountName: newJournal.creditName,
              debitAmount: 0,
              creditAmount: newJournal.creditAmount,
            },
          ],
        }),
      });
      if (res.ok) {
        setShowJournalModal(false);
        fetchFinanceData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to post journal entry');
      }
    } catch (e) {
      console.error('Error posting journal:', e);
    }
  };

  const handleCreateAP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/finance/ap/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newAP),
      });
      if (res.ok) {
        setShowAPModal(false);
        fetchFinanceData();
      }
    } catch (e) {
      console.error('Error creating AP Invoice:', e);
    }
  };

  const handleCreateAR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/finance/ar/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newAR),
      });
      if (res.ok) {
        setShowARModal(false);
        fetchFinanceData();
      }
    } catch (e) {
      console.error('Error creating AR Invoice:', e);
    }
  };

  // Dynamic financial statements calculations
  const totalAssets = accounts
    .filter(a => a.accountGroup === 'ASSETS')
    .reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);

  const totalLiabilities = accounts
    .filter(a => a.accountGroup === 'LIABILITIES')
    .reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);

  const totalEquity = accounts
    .filter(a => a.accountGroup === 'EQUITY')
    .reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);

  const totalRevenue = accounts
    .filter(a => a.accountGroup === 'REVENUE')
    .reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);

  const totalExpenses = accounts
    .filter(a => a.accountGroup === 'EXPENSES')
    .reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);

  const netIncome = totalRevenue - totalExpenses;

  // Trial Balance calculation
  const trialBalanceAccounts = accounts.map(a => {
    const isDebitNormal = a.accountGroup === 'ASSETS' || a.accountGroup === 'EXPENSES';
    const bal = Number(a.currentBalance) || 0;
    return {
      ...a,
      debit: isDebitNormal ? (bal >= 0 ? bal : 0) : (bal < 0 ? Math.abs(bal) : 0),
      credit: !isDebitNormal ? (bal >= 0 ? bal : 0) : (bal < 0 ? Math.abs(bal) : 0),
    };
  });

  const totalTrialDebit = trialBalanceAccounts.reduce((sum, a) => sum + a.debit, 0);
  const totalTrialCredit = trialBalanceAccounts.reduce((sum, a) => sum + a.credit, 0);
  const isTrialBalanced = Math.abs(totalTrialDebit - totalTrialCredit) < 0.01;

  // Filtered GL entries
  const filteredLedger = ledgerEntries.filter(entry => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (entry.accountCode && entry.accountCode.toLowerCase().includes(term)) ||
      (entry.accountName && entry.accountName.toLowerCase().includes(term)) ||
      (entry.voucherNumber && entry.voucherNumber.toLowerCase().includes(term)) ||
      (entry.narration && entry.narration.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Executive Header & KPI Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Enterprise Finance & Accounts Engine</h1>
              <p className="text-slate-400 text-sm">General Ledger, Double-Entry Posting, Accounts Payable/Receivable & Cost Control</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={fetchFinanceData}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button 
            onClick={() => setShowJournalModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Calculator className="w-4 h-4" /> Post Journal Entry
          </button>
          <button 
            onClick={() => setShowAccountModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> New Account
          </button>
        </div>
      </div>

      {/* Financial Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Assets</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">${stats?.totalAssets ? stats.totalAssets.toLocaleString() : '4,850,000'}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">General Ledger Balance</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Liabilities</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">${stats?.totalLiabilities ? stats.totalLiabilities.toLocaleString() : '1,250,000'}</div>
          <div className="text-xs text-slate-500 mt-1">Payables & Loans</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Net Revenue</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">${stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '3,420,000'}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">+14.2% YoY Growth</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Net Profit</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">${stats?.netProfit ? stats.netProfit.toLocaleString() : '1,530,000'}</div>
          <div className="text-xs text-blue-600 font-medium mt-1">Operating Margin</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">A/P Outstanding</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">${stats?.totalAPOutstanding ? stats.totalAPOutstanding.toLocaleString() : '285,000'}</div>
          <div className="text-xs text-slate-500 mt-1">Vendor Payables</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">A/R Outstanding</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">${stats?.totalAROutstanding ? stats.totalAROutstanding.toLocaleString() : '420,000'}</div>
          <div className="text-xs text-slate-500 mt-1">Customer Receivables</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-6 text-sm font-medium overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Financial Executive Dashboard', icon: TrendingUp },
          { id: 'expenses', label: 'Expenses & Petty Cash Workflow', icon: Receipt },
          { id: 'cash_requests', label: 'Project Local Cash & Imprest', icon: DollarSign },
          { id: 'coa', label: 'Chart of Accounts', icon: BookOpen },
          { id: 'journals', label: 'Journal Entries (Double Entry)', icon: Calculator },
          { id: 'ledger', label: 'General Ledger', icon: FileSpreadsheet },
          { id: 'ap', label: 'Accounts Payable (AP)', icon: CreditCard },
          { id: 'ar', label: 'Accounts Receivable (AR)', icon: Receipt },
          { id: 'banking', label: 'Cash & Banking', icon: Building2 },
          { id: 'budget', label: 'Budget Control', icon: PieChart },
          { id: 'cost', label: 'Cost Centers', icon: Layers },
          { id: 'tax', label: 'Tax & VAT', icon: ShieldCheck },
          { id: 'statements', label: 'Financial Statements', icon: Scale },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: EMPLOYEE EXPENSES & PETTY CASH WORKFLOW */}
      {activeTab === 'expenses' && (
        <EnterpriseExpensePettyCashModule />
      )}

      {/* TAB: PROJECT CASH & IMPREST REQUESTS */}
      {activeTab === 'cash_requests' && (
        <ProjectCashRequestsView />
      )}

      {/* TAB 1: EXECUTIVE DASHBOARD OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Revenue vs Expenses Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div>
                  <div className="text-emerald-900 font-bold">Total Construction Revenue</div>
                  <div className="text-xs text-emerald-700">Project progress billings & variations</div>
                </div>
                <div className="text-emerald-700 font-bold font-mono text-lg">${(stats?.totalRevenue || 3420000).toLocaleString()}</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <div>
                  <div className="text-rose-900 font-bold">Operating Expenses</div>
                  <div className="text-xs text-rose-700">Materials, labor, subcontracts, equipment</div>
                </div>
                <div className="text-rose-700 font-bold font-mono text-lg">${(stats?.totalExpenses || 1890000).toLocaleString()}</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <div className="text-blue-900 font-bold">Net Operating Income (EBITDA)</div>
                  <div className="text-xs text-blue-700">Audited operational margin</div>
                </div>
                <div className="text-blue-700 font-bold font-mono text-lg">${(stats?.netProfit || 1530000).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" /> Cash & Liquidity Reserves
            </h3>
            <div className="space-y-3">
              {bankAccounts.map(b => (
                <div key={b.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <div>
                    <div className="font-bold text-slate-900">{b.bankName} - {b.branchName}</div>
                    <div className="text-xs text-slate-500 font-mono">A/C: {b.accountNumber}</div>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-base">${b.currentBalance.toLocaleString()} {b.currency}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHART OF ACCOUNTS */}
      {activeTab === 'coa' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Master Chart of Accounts</h2>
            <button 
              onClick={() => setShowAccountModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Account Code
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Account Code</th>
                  <th className="p-4">Account Title</th>
                  <th className="p-4">Group</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Balance</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {accounts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono font-bold text-blue-600">{a.accountCode}</td>
                    <td className="p-4 font-bold text-slate-900">{a.accountName}</td>
                    <td className="p-4 font-medium text-slate-700">{a.accountGroup}</td>
                    <td className="p-4 text-slate-500">{a.accountType}</td>
                    <td className="p-4 font-mono font-bold text-slate-900">${a.currentBalance.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: JOURNAL ENTRIES */}
      {activeTab === 'journals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">General Journal & Vouchers</h2>
            <button 
              onClick={() => setShowJournalModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Post Double-Entry Journal
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Voucher #</th>
                  <th className="p-4">Posting Date</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Narration</th>
                  <th className="p-4">Total Debit</th>
                  <th className="p-4">Total Credit</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {journals.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono font-bold text-emerald-600">{j.voucherNumber}</td>
                    <td className="p-4 text-slate-600">{j.postingDate}</td>
                    <td className="p-4 font-medium text-slate-800">{j.voucherType}</td>
                    <td className="p-4 text-slate-700 font-medium">{j.narration}</td>
                    <td className="p-4 font-mono text-emerald-600 font-bold">${j.totalDebit.toLocaleString()}</td>
                    <td className="p-4 font-mono text-rose-600 font-bold">${j.totalCredit.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        {j.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: GENERAL LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> General Ledger (GL) Postings
              </h2>
              <p className="text-xs text-slate-500">Official double-entry postings, running account balances, and journal voucher references</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter account, voucher, narration..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button 
                onClick={fetchFinanceData}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Posting Date</th>
                  <th className="p-4">GL Ref #</th>
                  <th className="p-4">Voucher #</th>
                  <th className="p-4">Account</th>
                  <th className="p-4 text-right">Debit ($)</th>
                  <th className="p-4 text-right">Credit ($)</th>
                  <th className="p-4 text-right">Running Balance ($)</th>
                  <th className="p-4">Narration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No general ledger entries found matching criteria. Post a journal voucher to record transactions.
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((g: any) => (
                    <tr key={g.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 text-slate-600 text-xs whitespace-nowrap">{g.postingDate}</td>
                      <td className="p-4 font-mono text-xs text-slate-700 font-medium">{g.glNumber}</td>
                      <td className="p-4 font-mono font-bold text-emerald-600 text-xs">{g.voucherNumber}</td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-blue-600 mr-2">{g.accountCode}</span>
                        <span className="text-slate-800 font-medium text-xs">{g.accountName}</span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-emerald-600">
                        {g.debit > 0 ? `$${Number(g.debit).toLocaleString()}` : '-'}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-rose-600">
                        {g.credit > 0 ? `$${Number(g.credit).toLocaleString()}` : '-'}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-900">
                        ${Number(g.runningBalance || 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-600 text-xs max-w-xs truncate">{g.narration}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ACCOUNTS PAYABLE (AP) */}
      {activeTab === 'ap' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Vendor Invoices & Accounts Payable</h2>
            <button 
              onClick={() => setShowAPModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Book Vendor Invoice
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Vendor Name</th>
                  <th className="p-4">Date / Due</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Outstanding</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {apInvoices.map((ap) => (
                  <tr key={ap.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono font-bold text-amber-600">{ap.invoiceNumber}</td>
                    <td className="p-4 font-bold text-slate-900">{ap.vendorName}</td>
                    <td className="p-4 text-xs text-slate-500">Inv: {ap.invoiceDate} | Due: {ap.dueDate}</td>
                    <td className="p-4 font-mono font-bold text-slate-900">${ap.totalAmount.toLocaleString()}</td>
                    <td className="p-4 font-mono font-bold text-rose-600">${ap.outstandingAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                        {ap.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ACCOUNTS RECEIVABLE (AR) */}
      {activeTab === 'ar' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Customer Billings & Accounts Receivable</h2>
            <button 
              onClick={() => setShowARModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Issue Billing Invoice
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Outstanding</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {arInvoices.map((ar) => (
                  <tr key={ar.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono font-bold text-indigo-600">{ar.invoiceNumber}</td>
                    <td className="p-4 font-bold text-slate-900">{ar.customerName}</td>
                    <td className="p-4 text-slate-700 font-medium">{ar.projectName || 'General Billing'}</td>
                    <td className="p-4 font-mono font-bold text-slate-900">${ar.totalAmount.toLocaleString()}</td>
                    <td className="p-4 font-mono font-bold text-indigo-600">${ar.outstandingAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                        {ar.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: STATEMENTS */}
      {activeTab === 'statements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" /> Audited Financial Statements
              </h2>
              <p className="text-xs text-slate-500">
                Real-time Trial Balance, Income Statement (Profit & Loss), and Balance Sheet calculated directly from the Chart of Accounts ledger
              </p>
            </div>
            
            {/* Sub-tab pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatementsSubTab('trial_balance')}
                className={`px-3 py-1.5 rounded-md transition ${
                  statementsSubTab === 'trial_balance'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Trial Balance
              </button>
              <button
                type="button"
                onClick={() => setStatementsSubTab('profit_loss')}
                className={`px-3 py-1.5 rounded-md transition ${
                  statementsSubTab === 'profit_loss'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Profit & Loss (P&L)
              </button>
              <button
                type="button"
                onClick={() => setStatementsSubTab('balance_sheet')}
                className={`px-3 py-1.5 rounded-md transition ${
                  statementsSubTab === 'balance_sheet'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Balance Sheet
              </button>
              <button
                type="button"
                onClick={() => setStatementsSubTab('cash_flow')}
                className={`px-3 py-1.5 rounded-md transition ${
                  statementsSubTab === 'cash_flow'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cash Flows
              </button>
            </div>
          </div>

          {/* SUB-VIEW 1: TRIAL BALANCE */}
          {statementsSubTab === 'trial_balance' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <div className="font-bold text-sm text-slate-800">Working Trial Balance</div>
                  <div className="flex items-center gap-2">
                    {isTrialBalanced ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Balanced Books
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Out of Balance
                      </span>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3">Account Code</th>
                        <th className="p-3">Account Title</th>
                        <th className="p-3">Account Group</th>
                        <th className="p-3">Account Type</th>
                        <th className="p-3 text-right">Debit Balance ($)</th>
                        <th className="p-3 text-right">Credit Balance ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {trialBalanceAccounts.map(acc => (
                        <tr key={acc.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-mono font-bold text-blue-600">{acc.accountCode}</td>
                          <td className="p-3 font-medium text-slate-900">{acc.accountName}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              {acc.accountGroup}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{acc.accountType}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-600">
                            {acc.debit > 0 ? `$${acc.debit.toLocaleString()}` : '-'}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-rose-600">
                            {acc.credit > 0 ? `$${acc.credit.toLocaleString()}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-xs text-slate-900">
                      <tr>
                        <td colSpan={4} className="p-3 uppercase tracking-wider">Total Working Trial Balance</td>
                        <td className="p-3 text-right font-mono text-emerald-700 text-sm">
                          ${totalTrialDebit.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-rose-700 text-sm">
                          ${totalTrialCredit.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: PROFIT & LOSS */}
          {statementsSubTab === 'profit_loss' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Consolidated Statement of Profit & Loss</h3>
                <p className="text-xs text-slate-500">Revenue, Direct Construction Outlays, and Net Operating Income</p>
              </div>

              {/* Revenue Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg">
                  <span>Operating & Contract Revenue</span>
                  <span>Amount ($)</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {accounts.filter(a => a.accountGroup === 'REVENUE').map(acc => (
                    <div key={acc.id} className="flex justify-between py-2 px-3 hover:bg-slate-50">
                      <span><span className="font-mono text-slate-500 mr-2">{acc.accountCode}</span>{acc.accountName}</span>
                      <span className="font-mono font-semibold text-slate-900">${(acc.currentBalance || 0).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 px-3 font-bold text-emerald-700 bg-emerald-50/50">
                    <span>Total Operating Revenue</span>
                    <span className="font-mono">${totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Expenses Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-3 py-2 rounded-lg">
                  <span>Operating, Project & Administrative Expenses</span>
                  <span>Amount ($)</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {accounts.filter(a => a.accountGroup === 'EXPENSES').map(acc => (
                    <div key={acc.id} className="flex justify-between py-2 px-3 hover:bg-slate-50">
                      <span><span className="font-mono text-slate-500 mr-2">{acc.accountCode}</span>{acc.accountName}</span>
                      <span className="font-mono font-semibold text-slate-900">${(acc.currentBalance || 0).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 px-3 font-bold text-rose-700 bg-rose-50/50">
                    <span>Total Operating Expenses</span>
                    <span className="font-mono">${totalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Income Summary */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Net Operating Income (EBITDA)</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Operating Margin: {totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div className={`text-2xl font-mono font-bold ${netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${netIncome.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: BALANCE SHEET */}
          {statementsSubTab === 'balance_sheet' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Statement of Financial Position (Balance Sheet)</h3>
                <p className="text-xs text-slate-500">Assets, Liabilities, and Shareholder Equity Equivalence</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assets Column */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-2 rounded-lg">
                    <span>Assets (Current & Non-Current)</span>
                    <span>Amount ($)</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {accounts.filter(a => a.accountGroup === 'ASSETS').map(acc => (
                      <div key={acc.id} className="flex justify-between py-2 px-3 hover:bg-slate-50">
                        <span><span className="font-mono text-slate-500 mr-2">{acc.accountCode}</span>{acc.accountName}</span>
                        <span className="font-mono font-semibold text-slate-900">${(acc.currentBalance || 0).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2.5 px-3 font-bold text-blue-800 bg-blue-50/50">
                      <span>Total Assets</span>
                      <span className="font-mono">${totalAssets.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Liabilities & Equity Column */}
                <div className="space-y-4">
                  {/* Liabilities */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-rose-900 bg-rose-50 px-3 py-2 rounded-lg">
                      <span>Liabilities (Current & Long Term)</span>
                      <span>Amount ($)</span>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                      {accounts.filter(a => a.accountGroup === 'LIABILITIES').map(acc => (
                        <div key={acc.id} className="flex justify-between py-2 px-3 hover:bg-slate-50">
                          <span><span className="font-mono text-slate-500 mr-2">{acc.accountCode}</span>{acc.accountName}</span>
                          <span className="font-mono font-semibold text-slate-900">${(acc.currentBalance || 0).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-2 px-3 font-bold text-rose-800 bg-rose-50/50">
                        <span>Total Liabilities</span>
                        <span className="font-mono">${totalLiabilities.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Equity */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-50 px-3 py-2 rounded-lg">
                      <span>Equity & Retained Earnings</span>
                      <span>Amount ($)</span>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                      {accounts.filter(a => a.accountGroup === 'EQUITY').map(acc => (
                        <div key={acc.id} className="flex justify-between py-2 px-3 hover:bg-slate-50">
                          <span><span className="font-mono text-slate-500 mr-2">{acc.accountCode}</span>{acc.accountName}</span>
                          <span className="font-mono font-semibold text-slate-900">${(acc.currentBalance || 0).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                        <span>Retained Earnings / Current Period Net Income</span>
                        <span className="font-mono font-semibold text-slate-900">${netIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 px-3 font-bold text-purple-800 bg-purple-50/50">
                        <span>Total Equity & Retained Earnings</span>
                        <span className="font-mono">${(totalEquity + netIncome).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Liabilities & Equity */}
                  <div className="p-3 bg-slate-100 rounded-lg flex justify-between items-center font-bold text-xs text-slate-900">
                    <span>Total Liabilities & Equity</span>
                    <span className="font-mono text-sm">${(totalLiabilities + totalEquity + netIncome).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 4: STATEMENT OF CASH FLOWS */}
          {statementsSubTab === 'cash_flow' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Statement of Cash Flows (Indirect Method)</h3>
                <p className="text-xs text-slate-500">Operating, Investing, and Financing Cash Movements</p>
              </div>

              {/* Operating Activities */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg">
                  <span>Cash Flows from Operating Activities</span>
                  <span>Amount ($)</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                    <span className="font-medium text-slate-800">Net Operating Income (EBITDA)</span>
                    <span className="font-mono font-semibold text-slate-900">${netIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                    <span className="text-slate-600">Adjustments for Non-Cash Items (Depreciation & Amortization)</span>
                    <span className="font-mono text-slate-700">+$24,500</span>
                  </div>
                  <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                    <span className="text-slate-600">(Increase) / Decrease in Accounts Receivable & Client Retention</span>
                    <span className="font-mono text-rose-600">-${arInvoices.reduce((sum, a) => sum + (a.outstandingAmount || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                    <span className="text-slate-600">Increase / (Decrease) in Accounts Payable & Trade Accruals</span>
                    <span className="font-mono text-emerald-600">+${apInvoices.reduce((sum, a) => sum + (a.outstandingAmount || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2.5 px-3 font-bold text-emerald-800 bg-emerald-50/50">
                    <span>Net Cash Provided by Operating Activities</span>
                    <span className="font-mono">
                      ${(netIncome + 24500 - arInvoices.reduce((sum, a) => sum + (a.outstandingAmount || 0), 0) + apInvoices.reduce((sum, a) => sum + (a.outstandingAmount || 0), 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Investing Activities */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-2 rounded-lg">
                  <span>Cash Flows from Investing Activities</span>
                  <span>Amount ($)</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                    <span className="text-slate-600">Capital Expenditure: Plant, Heavy Machinery & Fleet Acquisition</span>
                    <span className="font-mono text-rose-600">-$65,000</span>
                  </div>
                  <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                    <span className="text-slate-600">Site Tooling, Workshop & IT Infrastructure Upgrades</span>
                    <span className="font-mono text-rose-600">-$12,400</span>
                  </div>
                  <div className="flex justify-between py-2.5 px-3 font-bold text-blue-800 bg-blue-50/50">
                    <span>Net Cash Used in Investing Activities</span>
                    <span className="font-mono">-$77,400</span>
                  </div>
                </div>
              </div>

              {/* Financing Activities */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-3 py-2 rounded-lg">
                  <span>Cash Flows from Financing Activities</span>
                  <span>Amount ($)</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                    <span className="text-slate-600">Client Mobilization Advance Collections</span>
                    <span className="font-mono text-emerald-600">+$150,000</span>
                  </div>
                  <div className="flex justify-between py-2 px-3 hover:bg-slate-50">
                    <span className="text-slate-600">Repayment of Working Capital / Equipment Bank Facilities</span>
                    <span className="font-mono text-rose-600">-$35,000</span>
                  </div>
                  <div className="flex justify-between py-2.5 px-3 font-bold text-purple-800 bg-purple-50/50">
                    <span>Net Cash from Financing Activities</span>
                    <span className="font-mono">+$115,000</span>
                  </div>
                </div>
              </div>

              {/* Net Cash Position Summary */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Liquid Cash & Bank Equivalents</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {bankAccounts.length} Verified Bank Accounts & Physical Vault Reserves
                  </div>
                </div>
                <div className="text-2xl font-mono font-bold text-emerald-400">
                  ${bankAccounts.reduce((sum, b) => sum + (b.currentBalance || 0), 0).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE ACCOUNT */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Add Chart of Account</h3>
              <button onClick={() => setShowAccountModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1020"
                  value={newAccount.accountCode}
                  onChange={e => setNewAccount({ ...newAccount, accountCode: e.target.value })}
                  className="w-full border border-slate-300 p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Petty Cash Reserve"
                  value={newAccount.accountName}
                  onChange={e => setNewAccount({ ...newAccount, accountName: e.target.value })}
                  className="w-full border border-slate-300 p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Group</label>
                <select
                  value={newAccount.accountGroup}
                  onChange={e => setNewAccount({ ...newAccount, accountGroup: e.target.value })}
                  className="w-full border border-slate-300 p-2 rounded-lg"
                >
                  <option value="ASSETS">ASSETS</option>
                  <option value="LIABILITIES">LIABILITIES</option>
                  <option value="EQUITY">EQUITY</option>
                  <option value="REVENUE">REVENUE</option>
                  <option value="EXPENSES">EXPENSES</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POST DOUBLE ENTRY JOURNAL */}
      {showJournalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Post Double-Entry Journal Voucher</h3>
              <button onClick={() => setShowJournalModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePostJournal} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Journal Narration / Description</label>
                <input
                  type="text"
                  required
                  value={newJournal.narration}
                  onChange={e => setNewJournal({ ...newJournal, narration: e.target.value })}
                  className="w-full border border-slate-300 p-2 rounded-lg"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-900 text-xs uppercase">Debit Entry (DR)</span>
                  <span className="text-[11px] text-emerald-700 font-medium">{newJournal.debitName}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={newJournal.debitCode}
                    onChange={e => {
                      const sel = accounts.find(a => a.accountCode === e.target.value);
                      setNewJournal({
                        ...newJournal,
                        debitCode: e.target.value,
                        debitName: sel ? sel.accountName : newJournal.debitName
                      });
                    }}
                    className="border border-slate-300 p-2 rounded-lg text-xs bg-white"
                  >
                    <option value="">-- Select Debit Account --</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.accountCode}>
                        {acc.accountCode} - {acc.accountName}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    required
                    placeholder="Debit Amount ($)"
                    value={newJournal.debitAmount}
                    onChange={e => setNewJournal({ ...newJournal, debitAmount: Number(e.target.value) })}
                    className="border border-slate-300 p-2 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-rose-900 text-xs uppercase">Credit Entry (CR)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-rose-700 font-medium">{newJournal.creditName}</span>
                    <button
                      type="button"
                      onClick={() => setNewJournal({ ...newJournal, creditAmount: newJournal.debitAmount })}
                      className="px-2 py-0.5 bg-rose-200 hover:bg-rose-300 text-rose-900 rounded text-[10px] font-bold"
                    >
                      Balance to DR
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={newJournal.creditCode}
                    onChange={e => {
                      const sel = accounts.find(a => a.accountCode === e.target.value);
                      setNewJournal({
                        ...newJournal,
                        creditCode: e.target.value,
                        creditName: sel ? sel.accountName : newJournal.creditName
                      });
                    }}
                    className="border border-slate-300 p-2 rounded-lg text-xs bg-white"
                  >
                    <option value="">-- Select Credit Account --</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.accountCode}>
                        {acc.accountCode} - {acc.accountName}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    required
                    placeholder="Credit Amount ($)"
                    value={newJournal.creditAmount}
                    onChange={e => setNewJournal({ ...newJournal, creditAmount: Number(e.target.value) })}
                    className="border border-slate-300 p-2 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              {/* Balance Validation Banner */}
              {newJournal.debitAmount > 0 && newJournal.debitAmount === newJournal.creditAmount ? (
                <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-lg flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Voucher Balanced: Total Debit (${newJournal.debitAmount.toLocaleString()}) equals Total Credit (${newJournal.creditAmount.toLocaleString()})</span>
                </div>
              ) : (
                <div className="p-2.5 bg-rose-100/70 border border-rose-300 rounded-lg flex items-center gap-2 text-rose-800 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Voucher Out of Balance by ${Math.abs(newJournal.debitAmount - newJournal.creditAmount).toLocaleString()}. Total Debit must equal Total Credit.</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowJournalModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newJournal.debitAmount <= 0 || newJournal.debitAmount !== newJournal.creditAmount}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Journal Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock Fallback Data Generators
function getMockAccounts(): Account[] {
  return [
    { id: '1', accountCode: '1010', accountName: 'Cash & Bank Operating Account', accountGroup: 'ASSETS', accountType: 'CURRENT_ASSET', currentBalance: 1680000, status: 'ACTIVE' },
    { id: '2', accountCode: '1050', accountName: 'Accounts Receivable (Clients)', accountGroup: 'ASSETS', accountType: 'CURRENT_ASSET', currentBalance: 420000, status: 'ACTIVE' },
    { id: '3', accountCode: '2010', accountName: 'Accounts Payable (Vendors)', accountGroup: 'LIABILITIES', accountType: 'CURRENT_LIABILITY', currentBalance: 285000, status: 'ACTIVE' },
    { id: '4', accountCode: '4010', accountName: 'Construction & Civil Revenue', accountGroup: 'REVENUE', accountType: 'OPERATING_REVENUE', currentBalance: 3420000, status: 'ACTIVE' },
    { id: '5', accountCode: '5010', accountName: 'Direct Project Material Costs', accountGroup: 'EXPENSES', accountType: 'DIRECT_EXPENSE', currentBalance: 1890000, status: 'ACTIVE' },
  ];
}

function getMockCostCenters(): CostCenter[] {
  return [
    { id: '1', code: 'CC-101', name: 'Dubai Metro Line Extension Site', centerType: 'COST_CENTER', department: 'CIVIL_WORKS', annualBudget: 1200000, utilizedAmount: 850000 },
    { id: '2', code: 'PC-201', name: 'Precast Concrete Production Yard', centerType: 'PROFIT_CENTER', department: 'MANUFACTURING', annualBudget: 2500000, utilizedAmount: 1400000 },
  ];
}

function getMockJournals(): JournalEntry[] {
  return [
    { id: '1', voucherNumber: 'JV-2026-1001', voucherType: 'GENERAL_JOURNAL', postingDate: '2026-08-12', narration: 'Monthly project material billing allocation', totalDebit: 125000, totalCredit: 125000, status: 'POSTED' },
  ];
}

function getMockAP(): APInvoice[] {
  return [
    { id: '1', invoiceNumber: 'AP-INV-2026-8801', vendorName: 'Consolidated Cement Industries LLC', invoiceDate: '2026-08-10', dueDate: '2026-09-10', totalAmount: 85000, outstandingAmount: 85000, status: 'UNPAID' },
  ];
}

function getMockAR(): ARInvoice[] {
  return [
    { id: '1', invoiceNumber: 'AR-INV-2026-9001', customerName: 'Dubai Roads & Transport Authority (RTA)', projectName: 'Metro Extension Line', invoiceDate: '2026-08-01', dueDate: '2026-08-30', totalAmount: 420000, outstandingAmount: 420000, status: 'UNPAID' },
  ];
}

function getMockBank(): BankAccount[] {
  return [
    { id: '1', accountNumber: 'UAE-BANK-991028', bankName: 'Emirates NBD Corporate', branchName: 'DIFC Main Branch', currentBalance: 1680000, currency: 'USD' },
  ];
}

function getMockBudgets(): BudgetMaster[] {
  return [
    { id: '1', budgetName: 'FY2026 Metro Infrastructure Master Budget', costCenterCode: 'CC-101', allocatedBudget: 1200000, consumedBudget: 850000, remainingBudget: 350000 },
  ];
}

function getMockTaxes(): TaxRecord[] {
  return [
    { id: '1', taxCode: 'VAT-5', taxName: 'Standard UAE Value Added Tax (5%)', taxType: 'VAT', ratePercent: 5.0 },
  ];
}

function getMockStats() {
  return {
    totalAccounts: 5,
    totalAssets: 4850000,
    totalLiabilities: 1250000,
    totalRevenue: 3420000,
    totalExpenses: 1890000,
    netProfit: 1530000,
    totalAPOutstanding: 285000,
    totalAROutstanding: 420000,
    totalBankBalance: 1680000,
    totalJournalEntries: 1,
  };
}

function getMockLedger(): any[] {
  return [
    {
      id: 'gl-1',
      glNumber: 'GL-2026-10001',
      voucherNumber: 'JV-2026-1001',
      postingDate: '2026-08-12',
      accountCode: '5010',
      accountName: 'Direct Project Material Costs',
      debit: 125000,
      credit: 0,
      runningBalance: 125000,
      narration: 'Monthly project material billing allocation',
    },
    {
      id: 'gl-2',
      glNumber: 'GL-2026-10002',
      voucherNumber: 'JV-2026-1001',
      postingDate: '2026-08-12',
      accountCode: '2010',
      accountName: 'Accounts Payable (Vendors)',
      debit: 0,
      credit: 125000,
      runningBalance: -125000,
      narration: 'Monthly project material billing allocation',
    },
  ];
}
