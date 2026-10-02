import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Truck,
  Package,
  Layers,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Plus,
  ShieldCheck,
  Building2,
  Receipt,
  PieChart as PieIcon,
  BarChart3,
  SlidersHorizontal,
  FileCheck,
  Eye,
  Info,
  FolderTree,
} from 'lucide-react';

interface ProjectCommercialCostViewProps {
  projectId: string;
  projectName: string;
}

interface CommercialData {
  project: {
    id: string;
    projectCode: string;
    projectName: string;
    clientName: string;
    consultantName: string;
    location: string;
    contractValue: number;
    budget: number;
    currency: string;
    status: string;
    progressPercentage: number;
    startDate: string;
    targetCompletionDate: string;
  };
  kpis: {
    contractValue: number;
    approvedBudget: number;
    totalCommitted: number;
    totalActualCost: number;
    remainingBudget: number;
    executedBoqValue: number;
    contractBoqValue?: number;
    plannedValue: number;
    costVariance: number;
    scheduleVariance: number;
    cpi: number | null;
    spi: number | null;
    eac: number;
    vac: number;
    pendingRaBillCost: number;
    actualMaterialCost: number;
    actualEquipmentFuelCost: number;
    actualCertifiedRaBillCost: number;
    actualImprestExpenseCost: number;
    actualLaborCost: number;
  };
  wbsBreakdown: Array<{
    id: string;
    packageCode: string;
    title: string;
    discipline: string;
    leadEmployeeName: string;
    budget: number | null;
    committed: number;
    actual: number;
    balance: number;
    variance: number;
    progressPercentage: number;
    status: string;
  }>;
  categoryBreakdown: Array<{
    category: string;
    budget: number | null;
    committed: number;
    actual: number;
    color?: string;
  }>;
  transactions: Array<{
    id: string;
    type: 'COMMITTED' | 'ACTUAL';
    category: string;
    categoryLabel: string;
    sourceDocType: 'PURCHASE_ORDER' | 'WORK_ORDER' | 'MATERIAL_ISSUE' | 'FUEL_LOG' | 'RA_BILL' | 'CASH_VOUCHER' | 'SUBCONTRACT_BILL' | 'EMPLOYEE_EXPENSE' | 'CLIENT_IPC' | 'LABOUR_ALLOCATION';
    sourceDocNumber: string;
    sourceDocId: string;
    date: string;
    description: string;
    vendorOrPayee: string;
    amount: number;
    status: string;
    authorizedBy: string;
  }>;
}

export const ProjectCommercialCostView: React.FC<ProjectCommercialCostViewProps> = ({
  projectId,
  projectName,
}) => {
  const [data, setData] = useState<CommercialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'SUMMARY' | 'WBS' | 'CATEGORIES' | 'TRANSACTIONS' | 'EVM'>('SUMMARY');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const fetchCommercialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/${projectId}/commercial-control`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to load commercial cost control data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchCommercialData();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
        <span>Aggregating project commercial ledger and cost commitments...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <span>No commercial data found for this project.</span>
      </div>
    );
  }

  const { project, kpis, wbsBreakdown, categoryBreakdown, transactions } = data;
  const currency = project.currency || '';
  const cpiAvailable = kpis.cpi != null;
  const spiAvailable = kpis.spi != null;

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
    if (categoryFilter !== 'ALL' && tx.sourceDocType !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchNumber = tx.sourceDocNumber?.toLowerCase().includes(q);
      const matchDesc = tx.description?.toLowerCase().includes(q);
      const matchPayee = tx.vendorOrPayee?.toLowerCase().includes(q);
      const matchCat = tx.categoryLabel?.toLowerCase().includes(q);
      if (!matchNumber && !matchDesc && !matchPayee && !matchCat) return false;
    }
    return true;
  });

  const exportCsv = () => {
    const headers = ['Transaction ID', 'Type', 'Category', 'Source Doc', 'Doc Number', 'Date', 'Payee / Vendor', 'Description', 'Amount (' + currency + ')', 'Status', 'Authorized By'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.type,
      tx.categoryLabel,
      tx.sourceDocType,
      tx.sourceDocNumber || '',
      tx.date || '',
      `"${(tx.vendorOrPayee || '').replace(/"/g, '""')}"`,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      tx.amount,
      tx.status,
      tx.authorizedBy || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Commercial_Audit_${project.projectCode}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              P2.5-B COMMERCIAL CORE
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Contract & Earned Value Ledger
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
            Commercial & Cost Control Engine
          </h2>
          <p className="text-xs text-slate-500">
            Real-time integration of PO Commitments, Work Orders, Store Issues, Fuel Logs, Contractor RA Bills & Imprest Vouchers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchCommercialData}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition"
            title="Refresh calculations"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Engine</span>
          </button>
          <button
            onClick={exportCsv}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Ledger</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Contract Value</span>
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-base font-black text-slate-900 dark:text-white">
            {currency} {(kpis.contractValue / 1000000).toFixed(2)}M
          </div>
          <p className="text-[10px] text-slate-500">Client Agreed Scope</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Approved Budget</span>
            <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-base font-black text-slate-900 dark:text-white">
            {currency} {(kpis.approvedBudget / 1000000).toFixed(2)}M
          </div>
          <p className="text-[10px] text-slate-500">Internal Baseline Target</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Committed</span>
            <Receipt className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-base font-black text-amber-600 dark:text-amber-400">
            {currency} {(kpis.totalCommitted / 1000000).toFixed(2)}M
          </div>
          <p className="text-[10px] text-slate-500">POs & Subcontracts Issued</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Actual Spent (AC)</span>
            <FileCheck className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-base font-black text-rose-600 dark:text-rose-400">
            {currency} {(kpis.totalActualCost / 1000000).toFixed(2)}M
          </div>
          <p className="text-[10px] text-slate-500">Physical Incurred Expenses</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Remaining Budget</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className={`text-base font-black ${kpis.remainingBudget >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {currency} {(kpis.remainingBudget / 1000000).toFixed(2)}M
          </div>
          <p className="text-[10px] text-slate-500">Uncommitted Contingency</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Cost Health (CPI)</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className={`text-base font-black ${!cpiAvailable ? 'text-slate-500' : kpis.cpi! >= 1.0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {cpiAvailable ? kpis.cpi!.toFixed(2) : '—'}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${!cpiAvailable ? 'bg-slate-100 text-slate-600' : kpis.cpi! >= 1.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {!cpiAvailable ? 'NO DATA' : kpis.cpi! >= 1.0 ? 'FAVORABLE' : 'WATCH'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">SPI: <strong>{spiAvailable ? kpis.spi!.toFixed(2) : '—'}</strong></p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => setActiveSubTab('SUMMARY')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeSubTab === 'SUMMARY'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Executive Summary</span>
        </button>

        <button
          onClick={() => setActiveSubTab('WBS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeSubTab === 'WBS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>WBS Package Breakdown</span>
        </button>

        <button
          onClick={() => setActiveSubTab('CATEGORIES')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeSubTab === 'CATEGORIES'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PieIcon className="w-3.5 h-3.5" />
          <span>Cost Categories</span>
        </button>

        <button
          onClick={() => setActiveSubTab('TRANSACTIONS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeSubTab === 'TRANSACTIONS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Source Document Ledger ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('EVM')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeSubTab === 'EVM'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Earned Value & Forecasting</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE SUMMARY */}
      {activeSubTab === 'SUMMARY' && (
        <div className="space-y-6">
          {/* Detailed Financial Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cost Incurred Breakdown */}
            <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                  <span>Actual Cost Incurred by Direct Domain</span>
                </h3>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Total: {currency} {kpis.totalActualCost.toLocaleString()}
                </span>
              </div>

              <div className="space-y-3">
                {/* Materials */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Store Material Issues</h4>
                      <p className="text-[10px] text-slate-500">Pipes, valves, cement & site consumables</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {currency} {kpis.actualMaterialCost.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {((kpis.actualMaterialCost / (kpis.totalActualCost || 1)) * 100).toFixed(1)}% of actuals
                    </p>
                  </div>
                </div>

                {/* Subcontractors */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Certified Contractor RA Bills</h4>
                      <p className="text-[10px] text-slate-500">Subcontracts, civil & electro-mechanical execution</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {currency} {kpis.actualCertifiedRaBillCost.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {((kpis.actualCertifiedRaBillCost / (kpis.totalActualCost || 1)) * 100).toFixed(1)}% of actuals
                    </p>
                  </div>
                </div>

                {/* Fleet / Plant / Fuel */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Heavy Plant, Fleet & Fuel</h4>
                      <p className="text-[10px] text-slate-500">Excavators, cranes, generators & diesel logs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {currency} {kpis.actualEquipmentFuelCost.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {((kpis.actualEquipmentFuelCost / (kpis.totalActualCost || 1)) * 100).toFixed(1)}% of actuals
                    </p>
                  </div>
                </div>

                {/* Imprest / Local Cash */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Audited Site Imprest Expenses</h4>
                      <p className="text-[10px] text-slate-500">Emergency local purchases, testing & site cash</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {currency} {kpis.actualImprestExpenseCost.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {((kpis.actualImprestExpenseCost / (kpis.totalActualCost || 1)) * 100).toFixed(1)}% of actuals
                    </p>
                  </div>
                </div>

                {/* Direct Labour */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Direct Site Staff & Labour</h4>
                      <p className="text-[10px] text-slate-500">Engineers, surveyors, technicians & supervisors</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {kpis.actualLaborCost == null ? 'Not separately mapped' : `${currency} ${kpis.actualLaborCost.toLocaleString()}`}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {kpis.actualLaborCost == null ? 'Separate labour ledger mapping required' : `${((kpis.actualLaborCost / (kpis.totalActualCost || 1)) * 100).toFixed(1)}% of actuals`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Earned Value & Forecast Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Cost & Schedule Performance</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">EVM Metrics against baseline schedule</p>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Planned Value (PV):</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {currency} {kpis.plannedValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Earned Value (EV / BOQ):</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {currency} {kpis.executedBoqValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Cost Variance (CV = EV - AC):</span>
                    <span className={`font-mono font-bold ${kpis.costVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {kpis.costVariance >= 0 ? '+' : ''}{currency} {kpis.costVariance.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Schedule Variance (SV = EV - PV):</span>
                    <span className={`font-mono font-bold ${kpis.scheduleVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {kpis.scheduleVariance >= 0 ? '+' : ''}{currency} {kpis.scheduleVariance.toLocaleString()}
                    </span>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Estimate At Completion (EAC):</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {currency} {kpis.eac.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Variance At Completion (VAC):</span>
                    <span className={`font-mono font-bold ${kpis.vac >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {kpis.vac >= 0 ? '+' : ''}{currency} {kpis.vac.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
                <strong>Project Health Verdict:</strong> {!cpiAvailable || !spiAvailable ? 'Insufficient source data for a complete EVM health statement' : kpis.cpi! >= 1.0 && kpis.spi! >= 1.0 ? 'EVM indicators available: cost and schedule indices are above 1.00' : kpis.cpi! >= 1.0 ? 'EVM indicates cost performance above 1.00; schedule index requires attention' : 'EVM indicates cost performance below 1.00; review source transactions and forecast'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WBS BREAKDOWN */}
      {activeSubTab === 'WBS' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <FolderTree className="w-4 h-4 text-blue-500" />
                <span>Work Breakdown Structure (WBS) Commercial Packages</span>
              </h3>
              <p className="text-xs text-slate-500">Budget, commitment, and actual expenditure per work package</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="py-3 px-4 font-bold text-slate-500">WBS Code</th>
                  <th className="py-3 px-4 font-bold text-slate-500">Package Title</th>
                  <th className="py-3 px-4 font-bold text-slate-500">Discipline</th>
                  <th className="py-3 px-4 font-bold text-slate-500">Lead Engineer</th>
                  <th className="py-3 px-4 font-bold text-slate-500 text-right">Allocated Budget</th>
                  <th className="py-3 px-4 font-bold text-slate-500 text-right">Committed</th>
                  <th className="py-3 px-4 font-bold text-slate-500 text-right">Actual Spent</th>
                  <th className="py-3 px-4 font-bold text-slate-500 text-right">Balance</th>
                  <th className="py-3 px-4 font-bold text-slate-500 text-center">Progress</th>
                  <th className="py-3 px-4 font-bold text-slate-500 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {wbsBreakdown.map((wp) => (
                  <tr key={wp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{wp.packageCode}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{wp.title}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {wp.discipline}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{wp.leadEmployeeName}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white text-right">
                      {currency} {wp.budget.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-400 text-right">
                      {currency} {wp.committed.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400 text-right">
                      {currency} {wp.actual.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right">
                      {currency} {wp.balance.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${Math.min(100, wp.progressPercentage)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {wp.progressPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        wp.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : wp.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {wp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeSubTab === 'CATEGORIES' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-purple-500" />
              <span>Project Cost Envelope by Commercial Category</span>
            </h3>
            <p className="text-xs text-slate-500">Observed commitments and actuals; category budgets appear only when an explicit category budget is configured.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{cat.category}</span>
                  {cat.color ? <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} /> : null}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Budget:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {cat.budget == null ? 'Not mapped' : `${currency} ${cat.budget.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Committed:</span>
                    <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                      {currency} {cat.committed.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Actual Spent:</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      {currency} {cat.actual.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Consumption</span>
                    <span>{cat.budget == null ? 'Not mapped' : `${((cat.actual / (cat.budget || 1)) * 100).toFixed(1)}%`}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: cat.budget == null ? '0%' : `${Math.min(100, (cat.actual / (cat.budget || 1)) * 100)}%`,
                        backgroundColor: cat.color || 'transparent',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SOURCE DOCUMENT TRANSACTION LEDGER */}
      {activeSubTab === 'TRANSACTIONS' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-blue-500" />
                <span>Audit-Ready Source Document Ledger</span>
              </h3>
              <p className="text-xs text-slate-500">Drill down into POs, Work Orders, Store Issues, Fuel Logs, subcontract bills, employee expenses and client IPCs.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search doc #, payee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 w-44"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="ALL">All Types</option>
                <option value="COMMITTED">Committed Only</option>
                <option value="ACTUAL">Actual Only</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="ALL">All Documents</option>
                <option value="PURCHASE_ORDER">Purchase Orders</option>
                <option value="WORK_ORDER">Work Orders</option>
                <option value="MATERIAL_ISSUE">Material Issues</option>
                <option value="FUEL_LOG">Fuel Logs</option>
                <option value="RA_BILL">Contractor RA Bills</option>
                <option value="CASH_VOUCHER">Imprest Vouchers</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="py-3 px-4 font-bold text-slate-500">Source Doc #</th>
                  <th className="py-3 px-4 font-bold text-slate-500">Type</th>
                  <th className="py-3 px-4 font-bold text-slate-500">Category</th>
                  <th className="py-3 px-4 font-bold text-slate-500">Date</th>
                  <th className="py-3 px-4 font-bold text-slate-500">Vendor / Payee / Source</th>
                  <th className="py-3 px-4 font-bold text-slate-500">Description</th>
                  <th className="py-3 px-4 font-bold text-slate-500 text-right">Amount ({currency})</th>
                  <th className="py-3 px-4 font-bold text-slate-500 text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-slate-500">Authorized By</th>
                  <th className="py-3 px-4 font-bold text-slate-500 text-center">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {tx.sourceDocNumber || tx.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'COMMITTED'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {tx.categoryLabel}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{tx.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{tx.vendorOrPayee}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-right text-slate-900 dark:text-white">
                      {tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{tx.authorizedBy}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-bold text-[10px] inline-flex items-center space-x-1 transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-xs text-slate-400">
                      No transactions matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: EVM & FORECASTING */}
      {activeSubTab === 'EVM' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>Earned Value Formula Reference</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Cost Variance (CV = EV - AC)</div>
                  <p className="text-[11px] text-slate-500">Positive means under budget; Negative means overrun.</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Schedule Variance (SV = EV - PV)</div>
                  <p className="text-[11px] text-slate-500">Positive means ahead of baseline schedule; Negative means delay.</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Cost Performance Index (CPI = EV / AC)</div>
                  <p className="text-[11px] text-slate-500">Value &gt; 1.0 signifies high resource and procurement efficiency.</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Estimate At Completion (EAC = Budget / CPI)</div>
                  <p className="text-[11px] text-slate-500">Forecasted total project expenditure at finish.</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Commercial Audit Summary</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Project Master Code:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{project.projectCode}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Employer / Client:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{project.clientName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Supervising Consultant:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{project.consultantName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Total Transactions Linked:</span>
                  <span className="font-mono font-bold text-blue-600">{transactions.length} Records</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Pending Contractor RA Claims:</span>
                  <span className="font-mono font-bold text-amber-600">{kpis.pendingRaBillCost == null ? '—' : `${currency} ${kpis.pendingRaBillCost.toLocaleString()}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Inspection Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Source Document Audit Inspection
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Document Number</span>
                <div className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                  {selectedTx.sourceDocNumber || selectedTx.id}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Ledger Type</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedTx.type}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Category</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedTx.categoryLabel}</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Payee / Vendor / Issuer</span>
                <div className="font-bold text-slate-900 dark:text-white">{selectedTx.vendorOrPayee}</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Description & Scope</span>
                <div className="text-slate-700 dark:text-slate-300">{selectedTx.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Valuation ({currency})</span>
                  <div className="text-base font-mono font-bold text-rose-600 dark:text-rose-400">
                    {selectedTx.amount.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Authorized By</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedTx.authorizedBy}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
