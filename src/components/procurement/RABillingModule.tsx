import React, { useState, useEffect } from 'react';
import { 
  RABillRecord, 
  RABillItem, 
  RABillStatus, 
  SubcontractWorkOrder, 
  BOQItem 
} from '../../types/procurement';
import { Project } from '../../types';
import { safeFetchJson, safeJson } from '../../lib/safeFetch';
import { 
  FileText, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Printer, 
  Download, 
  X, 
  ChevronRight, 
  Layers, 
  Sparkles, 
  RefreshCw, 
  Calendar, 
  UserCheck, 
  Briefcase, 
  CheckCircle,
  FileCheck,
  Percent,
  Receipt
} from 'lucide-react';
import { DSButton, DSCard, DSBadge } from '../ui/design-system';

interface RABillingModuleProps {
  projects?: Project[];
  workOrders?: SubcontractWorkOrder[];
  boqItems?: BOQItem[];
}

export const RABillingModule: React.FC<RABillingModuleProps> = ({
  projects = [],
  workOrders = [],
  boqItems = [],
}) => {
  const [bills, setBills] = useState<RABillRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedBillForScrutiny, setSelectedBillForScrutiny] = useState<RABillRecord | null>(null);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<RABillRecord | null>(null);
  const [scrutinyTab, setScrutinyTab] = useState<'SCRUTINY' | 'AUDIT_TRAIL'>('SCRUTINY');
  const [createError, setCreateError] = useState<string | null>(null);
  const [scrutinyError, setScrutinyError] = useState<string | null>(null);

  // Form State for New Bill
  const [formProjectId, setFormProjectId] = useState<string>(projects[0]?.id || '');
  const [formWorkOrderId, setFormWorkOrderId] = useState<string>('');
  const [formContractorName, setFormContractorName] = useState<string>('');
  const [formContractorCode, setFormContractorCode] = useState<string>('');
  const [formBillDate, setFormBillDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formPeriodStart, setFormPeriodStart] = useState<string>(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
  const [formPeriodEnd, setFormPeriodEnd] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formIsFinalBill, setFormIsFinalBill] = useState<boolean>(false);
  const [formRemarks, setFormRemarks] = useState<string>('');
  const [formItems, setFormItems] = useState<Array<{
    boqItemId: string;
    itemCode: string;
    description: string;
    unit: string;
    boqQuantity: number;
    boqRateUSD: number;
    previousCumulativeQty: number;
    currentMeasuredQty: number;
    mbReference: string;
  }>>([]);
  // Financial parameters
  const [advRate, setAdvRate] = useState<number>(0);
  const [retRate, setRetRate] = useState<number>(0);
  const [tdsRate, setTdsRate] = useState<number>(0);
  const [gstTdsRate, setGstTdsRate] = useState<number>(0);
  const [cessRate, setCessRate] = useState<number>(1);
  const [penalties, setPenalties] = useState<number>(0);

  // Workflow Scrutiny Form state
  const [scrutinyRole, setScrutinyRole] = useState<'QS' | 'INCHARGE' | 'DIRECTOR' | 'FINANCE'>('QS');
  const [scrutinyVerifierName, setScrutinyVerifierName] = useState<string>('Alex Mercer, Lead QS');
  const [scrutinyRemarks, setScrutinyRemarks] = useState<string>('');
  const [paymentRefNumber, setPaymentRefNumber] = useState<string>('FT/2026/HDFC-991204');

  // Phase 6A: Billable Measurement Book Integration
  const [billableMbs, setBillableMbs] = useState<any[]>([]);
  const [isMbPickerOpen, setIsMbPickerOpen] = useState<boolean>(false);
  const [fetchingMbs, setFetchingMbs] = useState<boolean>(false);

  const fetchBillableMbs = async (projId?: string) => {
    setFetchingMbs(true);
    try {
      const url = projId && projId !== 'ALL'
        ? `/api/procurement/measurements/billable?projectId=${projId}`
        : '/api/procurement/measurements/billable';
      const res = await safeFetchJson<{ success: boolean; data: any[] }>(url);
      if (res?.success && Array.isArray(res.data)) {
        setBillableMbs(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch billable measurements:', err);
    } finally {
      setFetchingMbs(false);
    }
  };

  const handleOpenMbPicker = () => {
    fetchBillableMbs(formProjectId);
    setIsMbPickerOpen(true);
  };

  const handleSelectMb = (mb: any) => {
    const newItem = {
      boqItemId: mb.boqItemId || `boq_${Date.now()}`,
      itemCode: mb.boqItemCode || 'BOQ-ITEM',
      description: `${mb.boqDescription || 'Measurement item'} (${mb.locationChainage || 'Site'})`,
      unit: mb.unit || 'CUM',
      boqQuantity: mb.approvedQuantity,
      boqRateUSD: mb.rateUSD || 100,
      previousCumulativeQty: mb.previouslyBilledQty || 0,
      currentMeasuredQty: mb.remainingBillableQty,
      mbReference: mb.mbNumber,
      measurementEntryId: mb.id,
    };

    setFormItems((prev) => [...prev, newItem]);
    setIsMbPickerOpen(false);
  };

  const fetchRABills = async () => {
    setLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean; data: RABillRecord[] }>('/api/procurement/ra-bills');
      if (res?.success && res.data) {
        setBills(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch RA bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRABills();
  }, []);

  // When work order is selected in creation modal, autofill details
  const handleWorkOrderSelect = (woId: string) => {
    setFormWorkOrderId(woId);
    const wo = workOrders.find(w => w.id === woId);
    if (wo) {
      setFormContractorName(wo.contractorName || '');
      setFormContractorCode(wo.contractorCode || 'CNT-01');
      setFormProjectId(wo.projectId || formProjectId);
      if (wo.scopeOfWork) {
        setFormRemarks(`Running Account bill for: ${wo.scopeOfWork}`);
      }
    }
  };

  // Calculations for current form
  const computedGrossCurrent = formItems.reduce((acc, item) => {
    return acc + ((item.currentMeasuredQty || 0) * (item.boqRateUSD || 0));
  }, 0);
  const computedAdvRecovery = computedGrossCurrent * (advRate / 100);
  const computedRetention = computedGrossCurrent * (retRate / 100);
  const computedTds = computedGrossCurrent * (tdsRate / 100);
  const computedGstTds = computedGrossCurrent * (gstTdsRate / 100);
  const computedCess = computedGrossCurrent * (cessRate / 100);
  const computedTotalDeductions = computedAdvRecovery + computedRetention + computedTds + computedGstTds + computedCess + Number(penalties);
  const computedNetPayable = Math.max(0, computedGrossCurrent - computedTotalDeductions);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === formProjectId);
    const wo = workOrders.find(w => w.id === formWorkOrderId);
    if (!proj || !wo || formItems.length === 0) {
      setCreateError('Project, work order and at least one approved measurement line are required.');
      return;
    }

    const payload: Partial<RABillRecord> = {
      projectId: formProjectId,
      projectName: proj.name,
      workOrderId: formWorkOrderId || undefined,
      workOrderNumber: wo?.workOrderNumber || undefined,
      contractorName: formContractorName,
      contractorCode: formContractorCode,
      billDate: formBillDate,
      billingPeriodStart: formPeriodStart,
      billingPeriodEnd: formPeriodEnd,
      isFinalBill: formIsFinalBill,
      remarks: formRemarks,
      items: formItems.map((it, idx) => ({
        id: `item_${Date.now()}_${idx}`,
        boqItemId: it.boqItemId,
        itemCode: it.itemCode,
        description: it.description,
        unit: it.unit,
        boqQuantity: it.boqQuantity,
        boqRateUSD: it.boqRateUSD,
        previousCumulativeQty: it.previousCumulativeQty,
        currentMeasuredQty: it.currentMeasuredQty,
        totalCumulativeQty: it.previousCumulativeQty + it.currentMeasuredQty,
        currentAmountUSD: it.currentMeasuredQty * it.boqRateUSD,
        cumulativeAmountUSD: (it.previousCumulativeQty + it.currentMeasuredQty) * it.boqRateUSD,
        mbReference: it.mbReference,
      })),
      financials: {
        grossWorkDoneCurrentUSD: computedGrossCurrent,
        grossWorkDoneCumulativeUSD: computedGrossCurrent,
        previousCertifiedGrossUSD: 0,
        mobilizationAdvanceRecoveryRatePercent: advRate,
        mobilizationAdvanceRecoveryUSD: computedAdvRecovery,
        retentionMoneyRatePercent: retRate,
        retentionMoneyWithheldUSD: computedRetention,
        materialAdvanceRecoveryUSD: 0,
        statutoryTdsPercent: tdsRate,
        statutoryTdsUSD: computedTds,
        statutoryGstTdsPercent: gstTdsRate,
        statutoryGstTdsUSD: computedGstTds,
        laborWelfareCessPercent: cessRate,
        laborWelfareCessUSD: computedCess,
        liquidatedDamagesOrPenaltyUSD: Number(penalties),
        otherWithholdingsUSD: 0,
        totalDeductionsUSD: computedTotalDeductions,
        netPayableCurrentUSD: computedNetPayable,
        netPayableCumulativeUSD: computedNetPayable,
      }
    };

    setCreateError(null);
    try {
      const data = await safeFetchJson<{ success: boolean; message?: string; data?: RABillRecord }>('/api/procurement/ra-bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resOk = Boolean(data?.success);
      if (resOk && data?.success) {
        setIsCreateModalOpen(false);
        setCreateError(null);
        fetchRABills();
      } else {
        setCreateError(data?.message || 'Failed to create Contractor RA Bill');
      }
    } catch (err: any) {
      console.error('Failed to create RA bill:', err);
      setCreateError(err.message || 'Network error occurred while submitting bill');
    }
  };

  const handleUpdateStatus = async (billId: string, nextStatus: RABillStatus) => {
    setScrutinyError(null);
    let updatePayload: any = {
      status: nextStatus,
      remarks: scrutinyRemarks || undefined,
    };

    if (scrutinyRole === 'QS') {
      updatePayload.qsVerifier = scrutinyVerifierName;
    } else if (scrutinyRole === 'INCHARGE') {
      updatePayload.siteEngineer = scrutinyVerifierName;
    } else if (scrutinyRole === 'DIRECTOR') {
      updatePayload.projectDirector = scrutinyVerifierName;
    } else if (scrutinyRole === 'FINANCE') {
      updatePayload.financeApprover = scrutinyVerifierName;
      updatePayload.paymentReferenceNumber = paymentRefNumber;
      updatePayload.paymentDisbursedDate = new Date().toISOString().split('T')[0];
    }

    try {
      const data = await safeFetchJson<{ success: boolean; message?: string }>(`/api/procurement/ra-bills/${billId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      if (data?.success) {
        setSelectedBillForScrutiny(null);
        setScrutinyError(null);
        fetchRABills();
      } else {
        setScrutinyError(data?.message || 'Failed to update RA bill status');
      }
    } catch (err: any) {
      console.error('Failed to update RA bill status:', err);
      setScrutinyError(err.message || 'Network error occurred while updating status');
    }
  };

  // Filtered bills
  const filteredBills = bills.filter(bill => {
    const matchProject = selectedProjectId === 'ALL' || bill.projectId === selectedProjectId;
    const matchStatus = selectedStatus === 'ALL' || bill.status === selectedStatus;
    const matchSearch = searchTerm === '' || 
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.workOrderNumber && bill.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.projectName && bill.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchProject && matchStatus && matchSearch;
  });

  // KPI Calculations
  const totalGrossValue = bills.reduce((acc, b) => acc + (b.financials?.grossWorkDoneCurrentUSD || 0), 0);
  const totalNetPayable = bills.reduce((acc, b) => acc + (b.financials?.netPayableCurrentUSD || 0), 0);
  const totalRetentionEscrow = bills.reduce((acc, b) => acc + (b.financials?.retentionMoneyWithheldUSD || 0), 0);
  const totalAdvRecovered = bills.reduce((acc, b) => acc + (b.financials?.mobilizationAdvanceRecoveryUSD || 0), 0);
  const certifiedCount = bills.filter(b => 
    b.status === 'Certified by QS' || 
    b.status === 'Approved by Incharge' || 
    b.status === 'Approved by Project Director' || 
    b.status === 'Disbursed / Paid'
  ).length;

  const getStatusBadge = (status: RABillStatus) => {
    switch (status) {
      case 'Draft':
        return <DSBadge variant="neutral">Draft</DSBadge>;
      case 'Submitted':
        return <DSBadge variant="primary">Submitted</DSBadge>;
      case 'Under Technical Scrutiny':
        return <DSBadge variant="warning">Under Scrutiny</DSBadge>;
      case 'Certified by QS':
        return <DSBadge variant="success">Certified by QS</DSBadge>;
      case 'Approved by Incharge':
        return <DSBadge variant="success">Approved (Incharge)</DSBadge>;
      case 'Approved by Project Director':
        return <DSBadge variant="success">Director Approved</DSBadge>;
      case 'Disbursed / Paid':
        return <DSBadge variant="success">Disbursed / Paid</DSBadge>;
      case 'Rejected':
        return <DSBadge variant="error">Rejected</DSBadge>;
      default:
        return <DSBadge variant="neutral">{status}</DSBadge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Contractor Billing Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Module P2.0 / Interim Payment Certificate</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Contractor Running Account (RA) Billing & Certification</h2>
          <p className="text-sm text-slate-300 max-w-3xl">
            Automated measurement book verification, cumulative progress tracking, advance recovery amortizations, retention money escrow withholdings, and statutory tax deductions for subcontract work orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DSButton
            variant="outline"
            size="sm"
            onClick={fetchRABills}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            Refresh
          </DSButton>
          <DSButton
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            Generate RA Bill
          </DSButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DSCard className="p-4 flex flex-col justify-between border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Gross Work Value</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">${totalGrossValue.toLocaleString()}</div>
            <span className="text-xs text-slate-500">Total cumulative measured</span>
          </div>
        </DSCard>

        <DSCard className="p-4 flex flex-col justify-between border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Net Certified Payable</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600">${totalNetPayable.toLocaleString()}</div>
            <span className="text-xs text-emerald-600 font-medium">{certifiedCount} Bills certified/disbursed</span>
          </div>
        </DSCard>

        <DSCard className="p-4 flex flex-col justify-between border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Retention Escrow</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">${totalRetentionEscrow.toLocaleString()}</div>
            <span className="text-xs text-amber-600 font-medium">5% Withheld for DLP guarantee</span>
          </div>
        </DSCard>

        <DSCard className="p-4 flex flex-col justify-between border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Advance Recoveries</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">${totalAdvRecovered.toLocaleString()}</div>
            <span className="text-xs text-slate-500">Mobilization advance amortized</span>
          </div>
        </DSCard>

        <DSCard className="p-4 flex flex-col justify-between border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bill Registry</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">{bills.length}</div>
            <span className="text-xs text-slate-500">Running Account certificates</span>
          </div>
        </DSCard>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative min-w-[240px] flex-1 md:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search RA bill #, contractor, WO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Technical Scrutiny">Under Technical Scrutiny</option>
            <option value="Certified by QS">Certified by QS</option>
            <option value="Approved by Incharge">Approved by Incharge</option>
            <option value="Approved by Project Director">Approved by Project Director</option>
            <option value="Disbursed / Paid">Disbursed / Paid</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredBills.length} of {bills.length} Running Account Bills
        </div>
      </div>

      {/* RA Bills Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">RA Bill # / Date</th>
                <th className="py-3.5 px-4">Contractor & Work Order</th>
                <th className="py-3.5 px-4">Project & Billing Period</th>
                <th className="py-3.5 px-4 text-right">Gross Work Done</th>
                <th className="py-3.5 px-4 text-right">Deductions</th>
                <th className="py-3.5 px-4 text-right">Net Payable</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
                    <p className="text-sm font-medium">No Running Account Bills match the current filters.</p>
                    <p className="text-xs text-slate-400 mt-1">Click "Generate RA Bill" to initiate contractor billing from measurement book entries.</p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        {bill.billNumber}
                        {bill.isFinalBill && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                            FINAL
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">Dated: {bill.billDate}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{bill.contractorName}</div>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        {bill.workOrderNumber || 'WO-DIRECT'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 line-clamp-1 max-w-[200px]" title={bill.projectName}>{bill.projectName}</div>
                      <div className="text-xs text-slate-400">
                        {bill.billingPeriodStart} → {bill.billingPeriodEnd}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-semibold text-slate-900">
                        ${(bill.financials?.grossWorkDoneCurrentUSD || 0).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Cum: ${(bill.financials?.grossWorkDoneCumulativeUSD || 0).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="text-rose-600 font-medium">
                        -${(bill.financials?.totalDeductionsUSD || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Ret: ${(bill.financials?.retentionMoneyWithheldUSD || 0).toLocaleString()} | Adv: ${(bill.financials?.mobilizationAdvanceRecoveryUSD || 0).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="text-base font-bold text-emerald-600">
                        ${(bill.financials?.netPayableCurrentUSD || 0).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(bill.status)}
                      {bill.paymentReferenceNumber && (
                        <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                          Ref: {bill.paymentReferenceNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedBillForPrint(bill)}
                          title="Print Interim Payment Certificate (IPC)"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedBillForScrutiny(bill)}
                          title="Technical Scrutiny & Approval Workflow"
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 border border-slate-200"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Scrutiny
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE RA BILL MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="text-lg font-bold">Generate Contractor Running Account (RA) Bill</h3>
                <p className="text-xs text-slate-400">Interim Payment Certificate creation against measured site quantities</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {createError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Validation Error:</span> {createError}
                  </div>
                </div>
              )}

              {/* Project & Work Order Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Project *
                  </label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Subcontract Work Order (Optional)
                  </label>
                  <select
                    value={formWorkOrderId}
                    onChange={(e) => handleWorkOrderSelect(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">Select Work Order...</option>
                    {workOrders.map(w => (
                      <option key={w.id} value={w.id}>{w.workOrderNumber} — {w.contractorName} (${w.totalContractValueUSD?.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contractor Name *
                  </label>
                  <input
                    type="text"
                    value={formContractorName}
                    onChange={(e) => setFormContractorName(e.target.value)}
                    placeholder="e.g. Apex Civil Infracon Pvt Ltd"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contractor Vendor Code
                  </label>
                  <input
                    type="text"
                    value={formContractorCode}
                    onChange={(e) => setFormContractorCode(e.target.value)}
                    placeholder="e.g. CNT-01"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Billing Period
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={formPeriodStart}
                      onChange={(e) => setFormPeriodStart(e.target.value)}
                      className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <input
                      type="date"
                      value={formPeriodEnd}
                      onChange={(e) => setFormPeriodEnd(e.target.value)}
                      className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Bill Type & Scope
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsFinalBill}
                        onChange={(e) => setFormIsFinalBill(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="font-medium text-slate-800">Is Final Bill (Work Completion Settlement)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Itemized BOQ Measurement Entries */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-sm font-bold text-slate-900">Measured Work Items (BOQ Schedule)</h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenMbPicker}
                      className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Import from Approved MB
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormItems([...formItems, {
                        boqItemId: `boq_${Date.now()}`,
                        itemCode: `BOQ-0${formItems.length + 1}`,
                        description: 'Site execution measured item',
                        unit: 'cum',
                        boqQuantity: 100,
                        boqRateUSD: 50,
                        previousCumulativeQty: 0,
                        currentMeasuredQty: 10,
                        mbReference: 'MB-SITE-REF',
                      }])}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add BOQ Item
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Item Code & Desc</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3 text-right">BOQ Rate ($)</th>
                        <th className="py-2.5 px-3 text-right">Prev Qty</th>
                        <th className="py-2.5 px-3 text-right">Current Measured</th>
                        <th className="py-2.5 px-3">MB Reference</th>
                        <th className="py-2.5 px-3 text-right">Amount ($)</th>
                        <th className="py-2.5 px-3 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const copy = [...formItems];
                                copy[idx].description = e.target.value;
                                setFormItems(copy);
                              }}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                              placeholder="Description..."
                            />
                          </td>
                          <td className="py-2 px-3 w-16">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => {
                                const copy = [...formItems];
                                copy[idx].unit = e.target.value;
                                setFormItems(copy);
                              }}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="py-2 px-3 w-24">
                            <input
                              type="number"
                              value={item.boqRateUSD}
                              onChange={(e) => {
                                const copy = [...formItems];
                                copy[idx].boqRateUSD = Number(e.target.value);
                                setFormItems(copy);
                              }}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-right"
                            />
                          </td>
                          <td className="py-2 px-3 w-24">
                            <input
                              type="number"
                              value={item.previousCumulativeQty}
                              onChange={(e) => {
                                const copy = [...formItems];
                                copy[idx].previousCumulativeQty = Number(e.target.value);
                                setFormItems(copy);
                              }}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-right"
                            />
                          </td>
                          <td className="py-2 px-3 w-28">
                            <input
                              type="number"
                              value={item.currentMeasuredQty}
                              onChange={(e) => {
                                const copy = [...formItems];
                                copy[idx].currentMeasuredQty = Number(e.target.value);
                                setFormItems(copy);
                              }}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-right font-bold text-emerald-700 bg-emerald-50/50"
                            />
                          </td>
                          <td className="py-2 px-3 w-32">
                            <input
                              type="text"
                              value={item.mbReference}
                              onChange={(e) => {
                                const copy = [...formItems];
                                copy[idx].mbReference = e.target.value;
                                setFormItems(copy);
                              }}
                              placeholder="e.g. MB-04/P12"
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-slate-800">
                            ${((item.currentMeasuredQty || 0) * (item.boqRateUSD || 0)).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {formItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setFormItems(formItems.filter((_, i) => i !== idx))}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deductions & Statutory Parameters */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Deductions & Statutory Withholding Configuration
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Adv Recovery %</label>
                    <input
                      type="number"
                      value={advRate}
                      onChange={(e) => setAdvRate(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Retention %</label>
                    <input
                      type="number"
                      value={retRate}
                      onChange={(e) => setRetRate(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">TDS (IT) %</label>
                    <input
                      type="number"
                      value={tdsRate}
                      onChange={(e) => setTdsRate(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">GST TDS %</label>
                    <input
                      type="number"
                      value={gstTdsRate}
                      onChange={(e) => setGstTdsRate(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Labor Cess %</label>
                    <input
                      type="number"
                      value={cessRate}
                      onChange={(e) => setCessRate(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Penalties / LD ($)</label>
                    <input
                      type="number"
                      value={penalties}
                      onChange={(e) => setPenalties(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>

                {/* Calculation Summary Footer */}
                <div className="pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-500">Gross Work Done:</span>
                    <div className="text-lg font-bold text-slate-900">${computedGrossCurrent.toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-500">Total Deductions:</span>
                    <div className="text-lg font-bold text-rose-600">-${computedTotalDeductions.toLocaleString()}</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <span className="text-xs text-emerald-700 font-medium">Net Certified Payable:</span>
                    <div className="text-xl font-extrabold text-emerald-700">${computedNetPayable.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Engineer Remarks / Scrutiny Notes
                </label>
                <textarea
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  rows={2}
                  placeholder="Measurement verified as per approved GFC drawings..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <DSButton
                  variant="outline"
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </DSButton>
                <DSButton
                  variant="primary"
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  Create & Submit RA Bill
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEASUREMENT BOOK PICKER MODAL (Phase 6A) */}
      {isMbPickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Select Approved Measurement Book</h3>
                  <p className="text-xs text-slate-500">Only verified & approved MB entries with positive billable balance are displayed.</p>
                </div>
              </div>
              <button
                onClick={() => setIsMbPickerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {fetchingMbs ? (
                <div className="py-8 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Loading billable measurements...</span>
                </div>
              ) : billableMbs.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm font-semibold text-slate-700">No unbilled approved measurements found</p>
                  <p className="text-xs text-slate-500 mt-1">All approved measurements have been fully billed or none exist for this project.</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                  {billableMbs.map((mb) => (
                    <div
                      key={mb.id}
                      className="p-4 hover:bg-indigo-50/50 transition flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                            {mb.mbNumber}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">
                            {mb.boqItemCode}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">{mb.locationChainage}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-800">{mb.boqDescription}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                          <span>Approved: <strong className="text-slate-700">{mb.approvedQuantity} {mb.unit}</strong></span>
                          <span>Prev Billed: <strong className="text-slate-700">{mb.previouslyBilledQty} {mb.unit}</strong></span>
                          <span>Remaining: <strong className="text-emerald-600 font-bold">{mb.remainingBillableQty} {mb.unit}</strong></span>
                          <span>Rate: <strong>${mb.rateUSD}</strong></span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectMb(mb)}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shrink-0"
                      >
                        Add to RA Bill
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <DSButton variant="outline" onClick={() => setIsMbPickerOpen(false)}>
                Close
              </DSButton>
            </div>
          </div>
        </div>
      )}

      {/* SCRUTINY & APPROVAL MODAL */}
      {selectedBillForScrutiny && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">Multi-Stage Technical Scrutiny & Certification</h3>
                  {selectedBillForScrutiny.status === 'Disbursed / Paid' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                      Locked / Disbursed
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">Bill: {selectedBillForScrutiny.billNumber} ({selectedBillForScrutiny.contractorName})</p>
              </div>
              <button 
                onClick={() => setSelectedBillForScrutiny(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Headers */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6">
              <button
                type="button"
                onClick={() => setScrutinyTab('SCRUTINY')}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${scrutinyTab === 'SCRUTINY' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Verification & Approval
              </button>
              <button
                type="button"
                onClick={() => setScrutinyTab('AUDIT_TRAIL')}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${scrutinyTab === 'AUDIT_TRAIL' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <span>Append-Only Audit Trail</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
                  {selectedBillForScrutiny.auditTrail?.length || 0}
                </span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {scrutinyError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Workflow Transition Error:</span> {scrutinyError}
                  </div>
                </div>
              )}

              {selectedBillForScrutiny.status === 'Disbursed / Paid' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Financial State Locked:</span> This Running Account Bill has been fully disbursed and paid. In accordance with audit standards, all quantities, deductions, and financial records are contractually immutable.
                  </div>
                </div>
              )}

              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                <div>
                  <span className="text-xs text-slate-500">Gross Work</span>
                  <div className="font-bold text-slate-900">${(selectedBillForScrutiny.financials?.grossWorkDoneCurrentUSD || 0).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Deductions</span>
                  <div className="font-bold text-rose-600">-${(selectedBillForScrutiny.financials?.totalDeductionsUSD || 0).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Net Payable</span>
                  <div className="font-bold text-emerald-600">${(selectedBillForScrutiny.financials?.netPayableCurrentUSD || 0).toLocaleString()}</div>
                </div>
              </div>

              {scrutinyTab === 'SCRUTINY' ? (
                <>
                  {/* Workflow stage selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Certification Authority Stage
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => { setScrutinyRole('QS'); setScrutinyVerifierName('Alex Mercer, Lead Quantity Surveyor'); }}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-colors ${scrutinyRole === 'QS' ? 'bg-emerald-600 text-white border-emerald-600 shadow' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                      >
                        1. QS Verification
                      </button>
                      <button
                        type="button"
                        onClick={() => { setScrutinyRole('INCHARGE'); setScrutinyVerifierName('Siddharth Nair, Site Incharge'); }}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-colors ${scrutinyRole === 'INCHARGE' ? 'bg-emerald-600 text-white border-emerald-600 shadow' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                      >
                        2. Site Incharge
                      </button>
                      <button
                        type="button"
                        onClick={() => { setScrutinyRole('DIRECTOR'); setScrutinyVerifierName('Robert Vance, Project Director'); }}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-colors ${scrutinyRole === 'DIRECTOR' ? 'bg-emerald-600 text-white border-emerald-600 shadow' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                      >
                        3. Director Approval
                      </button>
                      <button
                        type="button"
                        onClick={() => { setScrutinyRole('FINANCE'); setScrutinyVerifierName('Finance & Accounts Team'); }}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-colors ${scrutinyRole === 'FINANCE' ? 'bg-emerald-600 text-white border-emerald-600 shadow' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                      >
                        4. Finance Payout
                      </button>
                    </div>
                  </div>

                  {/* Verifier Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Authorizing Officer Name & Title
                    </label>
                    <input
                      type="text"
                      value={scrutinyVerifierName}
                      onChange={(e) => setScrutinyVerifierName(e.target.value)}
                      disabled={selectedBillForScrutiny.status === 'Disbursed / Paid'}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>

                  {/* Finance-specific Bank Ref */}
                  {scrutinyRole === 'FINANCE' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Bank Payment Reference / UTR Number *
                      </label>
                      <input
                        type="text"
                        value={paymentRefNumber}
                        onChange={(e) => setPaymentRefNumber(e.target.value)}
                        placeholder="e.g. UTR-2026-HDFC-991823"
                        disabled={selectedBillForScrutiny.status === 'Disbursed / Paid'}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </div>
                  )}

                  {/* Remarks */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Verification Comments & Notes
                    </label>
                    <textarea
                      value={scrutinyRemarks}
                      onChange={(e) => setScrutinyRemarks(e.target.value)}
                      rows={3}
                      placeholder="Measurement verified against site MB books and checked with zero discrepancies."
                      disabled={selectedBillForScrutiny.status === 'Disbursed / Paid'}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      disabled={selectedBillForScrutiny.status === 'Disbursed / Paid'}
                      onClick={() => handleUpdateStatus(selectedBillForScrutiny.id, 'Rejected')}
                      className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Reject with Discrepancy
                    </button>

                    <div className="flex items-center gap-2">
                      <DSButton
                        variant="outline"
                        type="button"
                        onClick={() => setSelectedBillForScrutiny(null)}
                      >
                        Close
                      </DSButton>

                      {scrutinyRole === 'QS' && (
                        <DSButton
                          variant="primary"
                          disabled={selectedBillForScrutiny.status === 'Disbursed / Paid'}
                          onClick={() => handleUpdateStatus(selectedBillForScrutiny.id, 'Certified by QS')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                          Certify Measurements (QS)
                        </DSButton>
                      )}

                      {scrutinyRole === 'INCHARGE' && (
                        <DSButton
                          variant="primary"
                          disabled={selectedBillForScrutiny.status === 'Disbursed / Paid'}
                          onClick={() => handleUpdateStatus(selectedBillForScrutiny.id, 'Approved by Incharge')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                          Approve Site Execution
                        </DSButton>
                      )}

                      {scrutinyRole === 'DIRECTOR' && (
                        <DSButton
                          variant="primary"
                          disabled={selectedBillForScrutiny.status === 'Disbursed / Paid'}
                          onClick={() => handleUpdateStatus(selectedBillForScrutiny.id, 'Approved by Project Director')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                          Grant Director Approval
                        </DSButton>
                      )}

                      {scrutinyRole === 'FINANCE' && (
                        <DSButton
                          variant="primary"
                          disabled={selectedBillForScrutiny.status === 'Disbursed / Paid'}
                          onClick={() => handleUpdateStatus(selectedBillForScrutiny.id, 'Disbursed / Paid')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                          Disburse Payment & Record UTR
                        </DSButton>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* AUDIT TRAIL TAB */
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {(!selectedBillForScrutiny.auditTrail || selectedBillForScrutiny.auditTrail.length === 0) ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No audit trail entries recorded yet.
                    </div>
                  ) : (
                    selectedBillForScrutiny.auditTrail.map((entry, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{entry.action}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 text-slate-700">
                              {entry.actorRole}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div className="text-slate-600">
                          <span className="font-medium text-slate-800">Actor:</span> {entry.actorName}
                        </div>

                        {entry.previousStatus && entry.newStatus && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="font-medium text-slate-800">Status Change:</span>
                            <span className="px-1.5 py-0.5 bg-slate-200 rounded text-[11px]">{entry.previousStatus}</span>
                            <span>→</span>
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px]">{entry.newStatus}</span>
                          </div>
                        )}

                        {entry.remarks && (
                          <div className="bg-white p-2 rounded border border-slate-200 text-slate-700 italic">
                            "{entry.remarks}"
                          </div>
                        )}

                        {entry.paymentReference && (
                          <div className="text-emerald-700 font-mono font-semibold">
                            UTR / Payment Ref: {entry.paymentReference}
                          </div>
                        )}

                        {entry.grossWorkDoneUSD !== undefined && entry.netPayableUSD !== undefined && (
                          <div className="flex gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                            <span>Gross: ${(entry.grossWorkDoneUSD).toLocaleString()}</span>
                            <span>Net Payable: ${(entry.netPayableUSD).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE IPC MODAL */}
      {selectedBillForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white no-print">
              <div>
                <h3 className="text-lg font-bold">Interim Payment Certificate (IPC)</h3>
                <p className="text-xs text-slate-400">Formal Running Account Certificate for Subcontractor</p>
              </div>
              <div className="flex items-center gap-3">
                <DSButton
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-4 h-4" />}
                  className="border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  Print / Export PDF
                </DSButton>
                <button 
                  onClick={() => setSelectedBillForPrint(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-white space-y-6 text-slate-800 print:p-0">
              {/* IPC Header */}
              <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-950">SiteSync Pro Enterprise ERP</h2>
                  <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Infrastructure Project Management Division</p>
                  <div className="mt-2 text-sm font-bold text-slate-800">
                    INTERIM PAYMENT CERTIFICATE (IPC) — RUNNING ACCOUNT BILL
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-700">{selectedBillForPrint.billNumber}</div>
                  <div className="text-xs text-slate-500">Date: {selectedBillForPrint.billDate}</div>
                  <div className="text-xs font-mono text-slate-600 mt-1">Status: {selectedBillForPrint.status}</div>
                </div>
              </div>

              {/* Summary Block */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-600">Project:</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedBillForPrint.projectName}</p>
                  <span className="font-semibold text-slate-600 mt-2 block">Contractor:</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedBillForPrint.contractorName} ({selectedBillForPrint.contractorCode})</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-600">Work Order Ref:</span>
                  <p className="font-mono font-bold text-slate-900">{selectedBillForPrint.workOrderNumber || 'N/A'}</p>
                  <span className="font-semibold text-slate-600 mt-2 block">Billing Period:</span>
                  <p className="text-slate-800">{selectedBillForPrint.billingPeriodStart} to {selectedBillForPrint.billingPeriodEnd}</p>
                </div>
              </div>

              {/* Measured Items Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Schedule of Measured Work Done</h4>
                <table className="w-full text-xs text-left border border-slate-300">
                  <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Item & Description</th>
                      <th className="p-2 border-r border-slate-300">Unit</th>
                      <th className="p-2 border-r border-slate-300 text-right">Rate ($)</th>
                      <th className="p-2 border-r border-slate-300 text-right">Prev Qty</th>
                      <th className="p-2 border-r border-slate-300 text-right">Curr Measured</th>
                      <th className="p-2 border-r border-slate-300 text-right">Total Cum Qty</th>
                      <th className="p-2 text-right">Curr Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedBillForPrint.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border-r border-slate-300 font-medium">
                          <span className="font-bold text-slate-900">[{item.itemCode}]</span> {item.description}
                          {item.mbReference && <span className="block text-[10px] text-slate-500 font-mono">Ref: {item.mbReference}</span>}
                        </td>
                        <td className="p-2 border-r border-slate-300">{item.unit}</td>
                        <td className="p-2 border-r border-slate-300 text-right">${item.boqRateUSD}</td>
                        <td className="p-2 border-r border-slate-300 text-right">{item.previousCumulativeQty}</td>
                        <td className="p-2 border-r border-slate-300 text-right font-bold text-emerald-800">{item.currentMeasuredQty}</td>
                        <td className="p-2 border-r border-slate-300 text-right">{item.totalCumulativeQty}</td>
                        <td className="p-2 text-right font-bold">${(item.currentAmountUSD || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Statement */}
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-slate-200 p-4 rounded-lg text-xs space-y-2">
                  <h5 className="font-bold text-slate-800 border-b pb-1">Statutory & Contractual Deductions</h5>
                  <div className="flex justify-between">
                    <span>Mobilization Advance Recovery ({selectedBillForPrint.financials?.mobilizationAdvanceRecoveryRatePercent}%):</span>
                    <span className="font-mono text-rose-600">-${(selectedBillForPrint.financials?.mobilizationAdvanceRecoveryUSD || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retention Money Withheld ({selectedBillForPrint.financials?.retentionMoneyRatePercent}%):</span>
                    <span className="font-mono text-rose-600">-${(selectedBillForPrint.financials?.retentionMoneyWithheldUSD || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income Tax TDS ({selectedBillForPrint.financials?.statutoryTdsPercent}%):</span>
                    <span className="font-mono text-rose-600">-${(selectedBillForPrint.financials?.statutoryTdsUSD || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST TDS ({selectedBillForPrint.financials?.statutoryGstTdsPercent}%):</span>
                    <span className="font-mono text-rose-600">-${(selectedBillForPrint.financials?.statutoryGstTdsUSD || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labor Welfare Cess ({selectedBillForPrint.financials?.laborWelfareCessPercent}%):</span>
                    <span className="font-mono text-rose-600">-${(selectedBillForPrint.financials?.laborWelfareCessUSD || 0).toLocaleString()}</span>
                  </div>
                  {Number(selectedBillForPrint.financials?.liquidatedDamagesOrPenaltyUSD) > 0 && (
                    <div className="flex justify-between font-bold text-rose-700">
                      <span>Liquidated Damages / Penalties:</span>
                      <span className="font-mono">-${(selectedBillForPrint.financials?.liquidatedDamagesOrPenaltyUSD || 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-1 text-rose-700">
                    <span>Total Deductions:</span>
                    <span className="font-mono">-${(selectedBillForPrint.financials?.totalDeductionsUSD || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="border border-slate-200 p-4 rounded-lg text-xs space-y-2 bg-slate-50">
                  <h5 className="font-bold text-slate-800 border-b pb-1">Payment Certification Summary</h5>
                  <div className="flex justify-between">
                    <span>Current Gross Work Done:</span>
                    <span className="font-mono font-bold">${(selectedBillForPrint.financials?.grossWorkDoneCurrentUSD || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cumulative Certified Gross:</span>
                    <span className="font-mono font-bold">${(selectedBillForPrint.financials?.grossWorkDoneCumulativeUSD || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Less Total Deductions:</span>
                    <span className="font-mono text-rose-600">-${(selectedBillForPrint.financials?.totalDeductionsUSD || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-emerald-800 border-t pt-2 bg-emerald-50/80 p-2 rounded">
                    <span>NET AMOUNT PAYABLE:</span>
                    <span className="font-mono text-base">${(selectedBillForPrint.financials?.netPayableCurrentUSD || 0).toLocaleString()}</span>
                  </div>
                  {selectedBillForPrint.paymentReferenceNumber && (
                    <div className="text-[11px] text-slate-500 pt-1">
                      Disbursement Ref: <span className="font-mono text-slate-800 font-bold">{selectedBillForPrint.paymentReferenceNumber}</span> ({selectedBillForPrint.paymentDisbursedDate})
                    </div>
                  )}
                </div>
              </div>

              {/* Signatures & Certification Matrix */}
              <div className="grid grid-cols-4 gap-4 text-center pt-8 border-t border-slate-300 text-xs">
                <div className="space-y-4">
                  <div className="h-10 border-b border-slate-400 flex items-end justify-center font-serif text-slate-600 italic">
                    {selectedBillForPrint.contractorRepresentative || 'Authorized Signatory'}
                  </div>
                  <span className="font-bold text-slate-700 block">Contractor Representative</span>
                </div>

                <div className="space-y-4">
                  <div className="h-10 border-b border-slate-400 flex items-end justify-center font-serif text-emerald-800 font-bold italic">
                    {selectedBillForPrint.qsVerifier || 'Verified by QS'}
                  </div>
                  <span className="font-bold text-slate-700 block">Lead Quantity Surveyor</span>
                </div>

                <div className="space-y-4">
                  <div className="h-10 border-b border-slate-400 flex items-end justify-center font-serif text-slate-800 italic">
                    {selectedBillForPrint.siteEngineer || 'Approved by Incharge'}
                  </div>
                  <span className="font-bold text-slate-700 block">Site Incharge / Engineer</span>
                </div>

                <div className="space-y-4">
                  <div className="h-10 border-b border-slate-400 flex items-end justify-center font-serif text-slate-800 italic">
                    {selectedBillForPrint.financeApprover || 'Finance Disbursed'}
                  </div>
                  <span className="font-bold text-slate-700 block">Finance & Accounts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
