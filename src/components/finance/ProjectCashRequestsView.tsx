import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Building2,
  UserCheck,
  ShieldCheck,
  Send,
  ArrowRight,
  Download,
  Receipt,
  Check,
  X,
  CreditCard,
  Layers,
  ChevronRight,
  Eye,
  Trash2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import {
  DSPageHeader,
  DSCard,
  DSButton,
  DSTabs,
  DSModal,
  DSField,
  DSStatusChip,
  DSSearchBox
} from '../ui/design-system';

interface CashRequest {
  id: string;
  requestCode: string;
  projectId: string;
  projectName: string;
  employeeId: string;
  employeeName: string;
  employeeCode?: string;
  divisionName?: string;
  departmentName?: string;
  amount: number;
  approvedAmount?: number;
  disbursedAmount?: number;
  purpose: string;
  category: string;
  requiredDate?: string;
  status: string;
  siteInchargeName?: string;
  inchargeRemarks?: string;
  projectDirectorName?: string;
  directorRemarks?: string;
  financeApproverName?: string;
  financeRemarks?: string;
  paymentMethod?: string;
  paymentReference?: string;
  disbursedAt?: string;
  settlementStatus: string;
  settledAmount?: number;
  remainingBalance?: number;
  approvalHistory?: any[];
  supportingDocuments?: any[];
  createdAt: string;
  settlements?: any[];
}

export const ProjectCashRequestsView: React.FC = () => {
  const [requests, setRequests] = useState<CashRequest[]>([]);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<CashRequest | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInchargeModal, setShowInchargeModal] = useState(false);
  const [showDirectorModal, setShowDirectorModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<any | null>(null);

  // Form States
  const [createForm, setCreateForm] = useState({
    projectId: 'PRJ-2024-001',
    projectName: 'Smart Water Treatment Plant Package 1',
    divisionName: 'Engineering & EPC Division',
    departmentName: 'Mechanical & Piping Engineering',
    amount: 15000,
    category: 'SITE_OPERATIONS',
    purpose: 'Urgent procurement of high-pressure DI flange gaskets and emergency diesel for backup pump testing on Site 02.',
    requiredDate: new Date().toISOString().split('T')[0],
  });

  const [inchargeForm, setInchargeForm] = useState({ remarks: 'Site emergency verified. Recommended for immediate approval.', approved: true });
  const [directorForm, setDirectorForm] = useState({ approvedAmount: 15000, remarks: 'Authorized within contingency budget limit.', approved: true });
  const [disburseForm, setDisburseForm] = useState({ paymentMethod: 'BANK_TRANSFER', paymentReference: `FT-${Date.now().toString().slice(-6)}`, disbursedAmount: 15000, remarks: 'Transferred to Site Resident Engineer petty account.' });
  const [settleForm, setSettleForm] = useState({
    totalExpenseAmount: 14200,
    unspentCashReturned: 800,
    vouchers: [
      { id: '1', itemDescription: 'Emergency DI Flange Gaskets (12 units)', billNumber: 'INV-GAS-901', amount: 9200, vendorName: 'Al-Madina Industrial Supplies' },
      { id: '2', itemDescription: 'Diesel fuel for testing gen-set (500L)', billNumber: 'PET-6623', amount: 5000, vendorName: 'National Petroleum' }
    ]
  });
  const [auditForm, setAuditForm] = useState({ remarks: 'All tax receipts verified and matches physical site log entries.', approved: true });

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
        setAvailableProjects(json.data);
      }
    } catch (e) {
      console.warn('Could not load live projects, using defaults:', e);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sitesync_access_token');
      const query = new URLSearchParams();
      if (statusFilter !== 'ALL') query.append('status', statusFilter);
      if (categoryFilter !== 'ALL') query.append('category', categoryFilter);
      if (search) query.append('search', search);

      const res = await fetch(`/api/finance/cash-requests?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await safeJson(res);
      if (json?.success) {
        setRequests(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load cash requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, categoryFilter, search]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/finance/cash-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(createForm),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowCreateModal(false);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInchargeReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/finance/cash-requests/${selectedRequest.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(inchargeForm),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowInchargeModal(false);
        fetchRequests();
        if (selectedRequest) {
          const updated = await fetchSingleRequest(selectedRequest.id);
          setSelectedRequest(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDirectorApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/finance/cash-requests/${selectedRequest.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(directorForm),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowDirectorModal(false);
        fetchRequests();
        if (selectedRequest) {
          const updated = await fetchSingleRequest(selectedRequest.id);
          setSelectedRequest(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinanceDisburse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/finance/cash-requests/${selectedRequest.id}/disburse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(disburseForm),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowDisburseModal(false);
        fetchRequests();
        if (selectedRequest) {
          const updated = await fetchSingleRequest(selectedRequest.id);
          setSelectedRequest(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettlementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/finance/cash-requests/${selectedRequest.id}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          totalExpenseAmount: settleForm.totalExpenseAmount,
          unspentCashReturned: settleForm.unspentCashReturned,
          voucherItems: settleForm.vouchers,
          invoicesAndReceipts: ['receipt-1.pdf', 'receipt-2.pdf']
        }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowSettleModal(false);
        fetchRequests();
        if (selectedRequest) {
          const updated = await fetchSingleRequest(selectedRequest.id);
          setSelectedRequest(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSettlement) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/finance/cash-requests/settlements/${selectedSettlement.id}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(auditForm),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowAuditModal(false);
        fetchRequests();
        if (selectedRequest) {
          const updated = await fetchSingleRequest(selectedRequest.id);
          setSelectedRequest(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSingleRequest = async (id: string) => {
    const token = localStorage.getItem('sitesync_access_token');
    const res = await fetch(`/api/finance/cash-requests/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await safeJson(res);
    return json?.data || null;
  };

  // KPIs
  const totalRequested = requests.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalDisbursed = requests.reduce((sum, r) => sum + (r.disbursedAmount || 0), 0);
  const totalSettled = requests.reduce((sum, r) => sum + (r.settledAmount || 0), 0);
  const pendingSettlement = Math.max(0, totalDisbursed - totalSettled);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">DRAFT</span>;
      case 'SUBMITTED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">SUBMITTED (INCHARGE PENDING)</span>;
      case 'INCHARGE_REVIEWED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">INCHARGE RECOMMENDED</span>;
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">DIRECTOR APPROVED (PAYOUT PENDING)</span>;
      case 'DISBURSED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">DISBURSED (ACTIVE IMPREST)</span>;
      case 'SETTLED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300">AUDITED & SETTLED</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300">REJECTED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <DSPageHeader
        title="Project Local Cash & Imprest Advance Management"
        description="Project-linked imprest fund workflow, multi-tier operational approvals, disbursement logs, and invoice settlement audit trail"
        breadcrumbs={[{ label: 'ERP' }, { label: 'Finance' }, { label: 'Local Cash Requests' }]}
        actions={
          <div className="flex items-center space-x-2">
            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={fetchRequests}
            >
              Refresh
            </DSButton>
            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowCreateModal(true)}
            >
              New Cash Request
            </DSButton>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DSCard className="p-4 flex items-center space-x-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Requested</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
              ${totalRequested.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{requests.length} total request records</div>
          </div>
        </DSCard>

        <DSCard className="p-4 flex items-center space-x-4 border-l-4 border-l-indigo-500">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Disbursed Funds</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
              ${totalDisbursed.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Funded into site wallets</div>
          </div>
        </DSCard>

        <DSCard className="p-4 flex items-center space-x-4 border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Active Unsettled Imprest</div>
            <div className="text-xl font-bold text-amber-600">
              ${pendingSettlement.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Pending bills & audit</div>
          </div>
        </DSCard>

        <DSCard className="p-4 flex items-center space-x-4 border-l-4 border-l-emerald-500">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Audited & Settled</div>
            <div className="text-xl font-bold text-emerald-600">
              ${totalSettled.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Closed with valid vouchers</div>
          </div>
        </DSCard>
      </div>

      {/* Main Grid: Request List & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Filterable Table */}
        <div className="lg:col-span-7 space-y-4">
          <DSCard className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-full sm:w-72">
                <DSSearchBox
                  placeholder="Search code, project, engineer, purpose..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="INCHARGE_REVIEWED">Incharge Recommended</option>
                  <option value="APPROVED">Director Approved</option>
                  <option value="DISBURSED">Disbursed</option>
                  <option value="SETTLED">Settled</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="SITE_OPERATIONS">Site Operations</option>
                  <option value="EMERGENCY_PURCHASE">Emergency Purchase</option>
                  <option value="PETTY_CASH">Petty Cash</option>
                  <option value="LABOR_PAYMENT">Labor Payment</option>
                  <option value="TRAVEL">Travel / Logistics</option>
                </select>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Request Code</th>
                    <th className="py-3 px-3">Project & Division</th>
                    <th className="py-3 px-3">Requester</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Loading cash requests...
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No cash requests found. Click "New Cash Request" to create one.
                      </td>
                    </tr>
                  ) : (
                    requests.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRequest(r)}
                        className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                          selectedRequest?.id === r.id ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-2 border-l-blue-600' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {r.requestCode}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                            {r.projectName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {r.divisionName || 'Engineering Division'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-700 dark:text-slate-300">{r.employeeName}</div>
                          <div className="text-[10px] text-slate-400">{r.departmentName || 'Site Ops'}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                          ${r.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          {getStatusBadge(r.status)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(r);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-blue-600 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </DSCard>
        </div>

        {/* Right 5 Columns: Workflow Details & Action Hub */}
        <div className="lg:col-span-5 space-y-4">
          {selectedRequest ? (
            <DSCard className="p-5 space-y-5 border-t-4 border-t-blue-600">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                      {selectedRequest.requestCode}
                    </span>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {selectedRequest.projectName}
                  </h3>
                  <div className="text-xs text-slate-500">
                    Requested by <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedRequest.employeeName}</span> on {selectedRequest.createdAt?.split('T')[0]}
                  </div>
                </div>
              </div>

              {/* Financial Box */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Requested</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    ${selectedRequest.amount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Disbursed</div>
                  <div className="text-sm font-bold text-emerald-600">
                    ${(selectedRequest.disbursedAmount || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Remaining</div>
                  <div className="text-sm font-bold text-amber-600">
                    ${(selectedRequest.remainingBalance || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Purpose & Category */}
              <div className="space-y-1.5 text-xs">
                <div className="text-slate-400 font-semibold uppercase text-[10px]">Purpose & Justification</div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedRequest.purpose}
                </div>
              </div>

              {/* 5-Stage Visual Workflow Stepper */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Imprest Lifecycle & Audit Stepper</span>
                  <span className="text-[10px] font-mono text-slate-400">ERP-WF-PCR</span>
                </div>

                <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {/* Step 1: Submission */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">1. Draft & Submission</div>
                    <div className="text-[11px] text-slate-500">
                      Submitted by {selectedRequest.employeeName} (${selectedRequest.amount})
                    </div>
                  </div>

                  {/* Step 2: Incharge Review */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      ['INCHARGE_REVIEWED', 'APPROVED', 'DISBURSED', 'SETTLED'].includes(selectedRequest.status)
                        ? 'bg-emerald-500 text-white'
                        : selectedRequest.status === 'SUBMITTED'
                        ? 'bg-blue-500 text-white animate-pulse'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {['INCHARGE_REVIEWED', 'APPROVED', 'DISBURSED', 'SETTLED'].includes(selectedRequest.status) ? <Check className="w-2.5 h-2.5" /> : '2'}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">2. Site Incharge Operational Review</div>
                    <div className="text-[11px] text-slate-500">
                      {selectedRequest.siteInchargeName ? `Verified by ${selectedRequest.siteInchargeName}: "${selectedRequest.inchargeRemarks || 'Recommended'}"` : 'Pending verification by Project Incharge'}
                    </div>
                  </div>

                  {/* Step 3: Project Director Approval */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      ['APPROVED', 'DISBURSED', 'SETTLED'].includes(selectedRequest.status)
                        ? 'bg-emerald-500 text-white'
                        : selectedRequest.status === 'INCHARGE_REVIEWED'
                        ? 'bg-blue-500 text-white animate-pulse'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {['APPROVED', 'DISBURSED', 'SETTLED'].includes(selectedRequest.status) ? <Check className="w-2.5 h-2.5" /> : '3'}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">3. Project Director Financial Approval</div>
                    <div className="text-[11px] text-slate-500">
                      {selectedRequest.projectDirectorName ? `Approved by ${selectedRequest.projectDirectorName}: $${selectedRequest.approvedAmount || selectedRequest.amount}` : 'Pending Project Director sign-off'}
                    </div>
                  </div>

                  {/* Step 4: Finance Disbursement */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      ['DISBURSED', 'SETTLED'].includes(selectedRequest.status)
                        ? 'bg-emerald-500 text-white'
                        : selectedRequest.status === 'APPROVED'
                        ? 'bg-blue-500 text-white animate-pulse'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {['DISBURSED', 'SETTLED'].includes(selectedRequest.status) ? <Check className="w-2.5 h-2.5" /> : '4'}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">4. Finance Disbursement & Bank Transfer</div>
                    <div className="text-[11px] text-slate-500">
                      {selectedRequest.disbursedAt ? `Paid via ${selectedRequest.paymentMethod} (Ref: ${selectedRequest.paymentReference}) on ${selectedRequest.disbursedAt.split('T')[0]}` : 'Awaiting finance bank disbursement'}
                    </div>
                  </div>

                  {/* Step 5: Settlement & Audit */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      selectedRequest.status === 'SETTLED'
                        ? 'bg-emerald-500 text-white'
                        : selectedRequest.settlementStatus === 'SUBMITTED'
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {selectedRequest.status === 'SETTLED' ? <Check className="w-2.5 h-2.5" /> : '5'}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">5. Expense Settlement & Internal Audit</div>
                    <div className="text-[11px] text-slate-500">
                      {selectedRequest.status === 'SETTLED' ? `Settled & audited ($${selectedRequest.settledAmount} verified)` : selectedRequest.settlementStatus === 'SUBMITTED' ? 'Vouchers submitted; awaiting auditor review' : 'Pending expense receipt submission'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Hub based on status */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                {selectedRequest.status === 'SUBMITTED' && (
                  <DSButton
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                    leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                    onClick={() => setShowInchargeModal(true)}
                  >
                    Incharge Review
                  </DSButton>
                )}

                {selectedRequest.status === 'INCHARGE_REVIEWED' && (
                  <DSButton
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setDirectorForm({ approvedAmount: selectedRequest.amount, remarks: 'Approved for execution', approved: true });
                      setShowDirectorModal(true);
                    }}
                  >
                    Director Approval
                  </DSButton>
                )}

                {selectedRequest.status === 'APPROVED' && (
                  <DSButton
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setDisburseForm({
                        paymentMethod: 'BANK_TRANSFER',
                        paymentReference: `FT-${Date.now().toString().slice(-6)}`,
                        disbursedAmount: selectedRequest.approvedAmount || selectedRequest.amount,
                        remarks: 'Disbursed to Site Resident Engineer wallet'
                      });
                      setShowDisburseModal(true);
                    }}
                  >
                    Disburse Cash Funds
                  </DSButton>
                )}

                {selectedRequest.status === 'DISBURSED' && (
                  <DSButton
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    leftIcon={<Receipt className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setSettleForm({
                        totalExpenseAmount: selectedRequest.disbursedAmount || selectedRequest.amount,
                        unspentCashReturned: 0,
                        vouchers: [
                          { id: '1', itemDescription: selectedRequest.purpose, billNumber: `BILL-${Date.now().toString().slice(-4)}`, amount: selectedRequest.disbursedAmount || selectedRequest.amount, vendorName: 'Local Authorized Supplier' }
                        ]
                      });
                      setShowSettleModal(true);
                    }}
                  >
                    Submit Expense Settlement
                  </DSButton>
                )}

                {selectedRequest.settlementStatus === 'SUBMITTED' && selectedRequest.status !== 'SETTLED' && (
                  <DSButton
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                    onClick={async () => {
                      const token = localStorage.getItem('sitesync_access_token');
                      const res = await fetch(`/api/finance/cash-requests/${selectedRequest.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      const json = await safeJson(res);
                      if (json?.data?.settlements?.length > 0) {
                        setSelectedSettlement(json.data.settlements[0]);
                      } else {
                        setSelectedSettlement({ id: 'stl-fallback', totalExpenseAmount: selectedRequest.disbursedAmount || selectedRequest.amount });
                      }
                      setShowAuditModal(true);
                    }}
                  >
                    Audit & Settle Vouchers
                  </DSButton>
                )}
              </div>
            </DSCard>
          ) : (
            <DSCard className="p-8 text-center text-slate-400 space-y-3">
              <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Select a Cash Request</div>
              <div className="text-xs text-slate-400 max-w-xs mx-auto">
                Click any record from the left table to inspect the approval workflow, view disbursements, or process settlements.
              </div>
            </DSCard>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      <DSModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Raise Project Local Cash / Imprest Request"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DSField label="Project Association" required>
              <select
                value={createForm.projectId}
                onChange={(e) => {
                  const pName = e.target.options[e.target.selectedIndex].text;
                  setCreateForm({ ...createForm, projectId: e.target.value, projectName: pName });
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                {availableProjects.length > 0 ? (
                  availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.code ? `(${p.code})` : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="PRJ-2024-001">Smart Water Treatment Plant Package 1</option>
                    <option value="PRJ-2024-002">Al-Reem Island Sub-Station & SCADA</option>
                    <option value="PRJ-2024-003">Western Pipeline Trunk Main Package</option>
                  </>
                )}
              </select>
            </DSField>

            <DSField label="Expense Category" required>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="SITE_OPERATIONS">Site Operations & Petty Cash</option>
                <option value="EMERGENCY_PURCHASE">Emergency Material Purchase</option>
                <option value="LABOR_PAYMENT">Direct Daily Labor Payment</option>
                <option value="TRAVEL">Site Logistics & Transportation</option>
                <option value="TESTING_FEES">Laboratory & Testing Authority Fees</option>
              </select>
            </DSField>

            <DSField label="Amount Required ($)" required>
              <input
                type="number"
                min="100"
                step="100"
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </DSField>

            <DSField label="Required by Date" required>
              <input
                type="date"
                value={createForm.requiredDate}
                onChange={(e) => setCreateForm({ ...createForm, requiredDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </DSField>
          </div>

          <DSField label="Detailed Purpose & Justification" required>
            <textarea
              rows={3}
              value={createForm.purpose}
              onChange={(e) => setCreateForm({ ...createForm, purpose: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              placeholder="Explain why this cash advance is urgently required on site..."
            />
          </DSField>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <DSButton variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </DSButton>
            <DSButton variant="primary" size="sm" type="submit" leftIcon={<Send className="w-3.5 h-3.5" />}>
              Submit Request
            </DSButton>
          </div>
        </form>
      </DSModal>

      {/* INCHARGE REVIEW MODAL */}
      <DSModal
        isOpen={showInchargeModal}
        onClose={() => setShowInchargeModal(false)}
        title="Site Incharge Operational Review"
        size="md"
      >
        <form onSubmit={handleInchargeReview} className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
            Confirm that these funds are required for on-site operations and cannot be procured through regular centralized purchase orders.
          </div>

          <DSField label="Incharge Review Remarks" required>
            <textarea
              rows={3}
              value={inchargeForm.remarks}
              onChange={(e) => setInchargeForm({ ...inchargeForm, remarks: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </DSField>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <DSButton
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => {
                setInchargeForm({ ...inchargeForm, approved: false });
              }}
              type="submit"
            >
              Reject Request
            </DSButton>
            <DSButton variant="primary" size="sm" type="submit" leftIcon={<Check className="w-3.5 h-3.5" />}>
              Recommend to Director
            </DSButton>
          </div>
        </form>
      </DSModal>

      {/* DIRECTOR APPROVAL MODAL */}
      <DSModal
        isOpen={showDirectorModal}
        onClose={() => setShowDirectorModal(false)}
        title="Project Director Financial Authorization"
        size="md"
      >
        <form onSubmit={handleDirectorApprove} className="space-y-4">
          <DSField label="Approved Amount ($)" required>
            <input
              type="number"
              value={directorForm.approvedAmount}
              onChange={(e) => setDirectorForm({ ...directorForm, approvedAmount: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-600"
            />
          </DSField>

          <DSField label="Director Authorization Remarks" required>
            <textarea
              rows={3}
              value={directorForm.remarks}
              onChange={(e) => setDirectorForm({ ...directorForm, remarks: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </DSField>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <DSButton variant="outline" size="sm" onClick={() => setShowDirectorModal(false)}>
              Cancel
            </DSButton>
            <DSButton variant="primary" size="sm" type="submit" leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}>
              Authorize & Forward to Finance
            </DSButton>
          </div>
        </form>
      </DSModal>

      {/* FINANCE DISBURSEMENT MODAL */}
      <DSModal
        isOpen={showDisburseModal}
        onClose={() => setShowDisburseModal(false)}
        title="Finance Imprest Fund Disbursement"
        size="md"
      >
        <form onSubmit={handleFinanceDisburse} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DSField label="Payment Method" required>
              <select
                value={disburseForm.paymentMethod}
                onChange={(e) => setDisburseForm({ ...disburseForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                <option value="CASH">Physical Cash from Vault</option>
                <option value="CHEQUE">Company Account Cheque</option>
              </select>
            </DSField>

            <DSField label="Bank / Wire Reference" required>
              <input
                type="text"
                value={disburseForm.paymentReference}
                onChange={(e) => setDisburseForm({ ...disburseForm, paymentReference: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </DSField>
          </div>

          <DSField label="Disbursed Amount ($)" required>
            <input
              type="number"
              value={disburseForm.disbursedAmount}
              onChange={(e) => setDisburseForm({ ...disburseForm, disbursedAmount: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-600"
            />
          </DSField>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <DSButton variant="outline" size="sm" onClick={() => setShowDisburseModal(false)}>
              Cancel
            </DSButton>
            <DSButton variant="primary" size="sm" type="submit" leftIcon={<CreditCard className="w-3.5 h-3.5" />}>
              Confirm Disbursement
            </DSButton>
          </div>
        </form>
      </DSModal>

      {/* SETTLEMENT SUBMISSION MODAL */}
      <DSModal
        isOpen={showSettleModal}
        onClose={() => setShowSettleModal(false)}
        title="Submit Imprest Expense Settlement Vouchers"
        size="lg"
      >
        <form onSubmit={handleSettlementSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DSField label="Total Actual Expense Amount ($)" required>
              <input
                type="number"
                value={settleForm.totalExpenseAmount}
                onChange={(e) => setSettleForm({ ...settleForm, totalExpenseAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800"
              />
            </DSField>

            <DSField label="Unspent Cash Returned to Vault ($)">
              <input
                type="number"
                value={settleForm.unspentCashReturned}
                onChange={(e) => setSettleForm({ ...settleForm, unspentCashReturned: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-600"
              />
            </DSField>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Itemized Expense Vouchers</div>
            <div className="space-y-2">
              {settleForm.vouchers.map((v, idx) => (
                <div key={v.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-5 font-medium">{v.itemDescription}</div>
                  <div className="col-span-3 text-slate-500">{v.vendorName}</div>
                  <div className="col-span-2 font-mono">{v.billNumber}</div>
                  <div className="col-span-2 text-right font-bold text-emerald-600">${v.amount}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <DSButton variant="outline" size="sm" onClick={() => setShowSettleModal(false)}>
              Cancel
            </DSButton>
            <DSButton variant="primary" size="sm" type="submit" leftIcon={<Receipt className="w-3.5 h-3.5" />}>
              Submit Vouchers for Audit
            </DSButton>
          </div>
        </form>
      </DSModal>

      {/* AUDIT & SETTLE MODAL */}
      <DSModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title="Internal Audit: Verify & Close Settlement"
        size="md"
      >
        <form onSubmit={handleAuditSubmit} className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200">
            Verify that invoice attachments, supplier GST/VAT details, and cash return receipts match the physical vouchers before closing.
          </div>

          <DSField label="Auditor Verification Remarks" required>
            <textarea
              rows={3}
              value={auditForm.remarks}
              onChange={(e) => setAuditForm({ ...auditForm, remarks: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </DSField>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <DSButton variant="outline" size="sm" onClick={() => setShowAuditModal(false)}>
              Cancel
            </DSButton>
            <DSButton variant="primary" size="sm" type="submit" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
              Approve & Close Imprest Advance
            </DSButton>
          </div>
        </form>
      </DSModal>
    </div>
  );
};
