import React, { useState, useEffect } from 'react';
import { safeFetchJson } from '../../lib/safeFetch';
import {
  Building2,
  FileSpreadsheet,
  FileCheck2,
  FileText,
  PackageCheck,
  ShieldCheck,
  Award,
  TrendingUp,
  DollarSign,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpRight,
  Boxes,
  Briefcase,
  Check,
  Eye,
  SlidersHorizontal,
  FilePlus,
  ClipboardList,
  Scale
} from 'lucide-react';

export const EnterpriseProcurementModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'vendors' | 'prs' | 'rfqs' | 'pos' | 'contracts' | 'grn' | 'matching' | 'scorecards'
  >('overview');

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [prBoqItems, setPrBoqItems] = useState<any[]>([]);
  const [newPr, setNewPr] = useState({
    title: '',
    projectId: '',
    projectName: '',
    department: '',
    requiredDate: '',
    priority: 'MEDIUM',
    budgetCode: '',
    budgetAvailableAed: 0,
    notes: '',
    selectedBoqItemId: '',
    quantity: '',
  });
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [purchaseRequisitions, setPurchaseRequisitions] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<any[]>([]);
  const [threeWayMatches, setThreeWayMatches] = useState<any[]>([]);
  const [scorecards, setScorecards] = useState<any[]>([]);

  // Search & Filters
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorCategoryFilter, setVendorCategoryFilter] = useState('ALL');

  // Modals
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isPrModalOpen, setIsPrModalOpen] = useState(false);
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  // Forms
  const [newVendor, setNewVendor] = useState({
    companyName: '',
    registrationNumber: '',
    taxIdentificationNumber: '',
    categoryCode: 'PIPES_FITTINGS',
    vendorType: 'MANUFACTURER',
    contactPerson: '',
    email: '',
    phone: '',
    addressStreet: '',
    city: 'Dubai',
    creditTermsDays: 60,
    currency: 'AED',
  });

  const [newRfq, setNewRfq] = useState({
    title: '',
    requisitionId: '',
    projectId: '',
    projectName: '',
    category: '',
    issueDate: new Date().toISOString().split('T')[0],
    submissionDeadline: '',
    targetDeliveryDate: '',
    deliveryLocation: '',
    estimatedBudgetAed: 0,
    buyerName: '',
    termsAndConditions: '',
    items: [] as any[],
  });

  const [newPo, setNewPo] = useState({
    vendorId: '',
    vendorName: '',
    deliveryDate: '2026-10-15',
    deliveryLocation: 'Sector 4 Zone B Laydown Yard',
    subtotal: 2500000,
    notes: 'Standard project delivery specifications apply.',
  });

  const [newContract, setNewContract] = useState({
    title: '',
    vendorId: '',
    vendorName: '',
    contractType: 'SUBCONTRACT',
    effectiveStartDate: '2026-09-01',
    effectiveEndDate: '2027-03-31',
    originalContractValue: 8500000,
    contractManager: 'Senior Contracts Director',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        statsRes,
        vendorsRes,
        rfqsRes,
        posRes,
        contractsRes,
        grnRes,
        matchesRes,
        scorecardsRes,
        prRes
      ] = await Promise.all([
        safeFetchJson<any>('/api/procurement-enterprise/stats'),
        safeFetchJson<any>('/api/procurement-enterprise/vendors'),
        safeFetchJson<any>('/api/procurement-enterprise/rfqs'),
        safeFetchJson<any>('/api/procurement-enterprise/purchase-orders'),
        safeFetchJson<any>('/api/procurement-enterprise/contracts'),
        safeFetchJson<any>('/api/procurement-enterprise/goods-receipts'),
        safeFetchJson<any>('/api/procurement-enterprise/three-way-matching'),
        safeFetchJson<any>('/api/procurement-enterprise/scorecards'),
        safeFetchJson<any>('/api/procurement-enterprise/purchase-requisitions'),
        safeFetchJson<any>('/api/projects?limit=100&page=1'),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (vendorsRes?.data) setVendors(vendorsRes.data);
      if (rfqsRes?.data) setRfqs(rfqsRes.data);
      if (posRes?.data) setPurchaseOrders(posRes.data);
      if (contractsRes?.data) setContracts(contractsRes.data);
      if (grnRes?.data) setGoodsReceipts(grnRes.data);
      if (matchesRes?.data) setThreeWayMatches(matchesRes.data);
      if (scorecardsRes?.data) setScorecards(scorecardsRes.data);
      if (prRes?.data) setPurchaseRequisitions(prRes.data);
      if (pRes?.data) setProjects(pRes.data);
    } catch (e) {
      console.error('Error loading enterprise procurement data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await safeFetchJson('/api/procurement-enterprise/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVendor),
      });
      setIsVendorModalOpen(false);
      setNewVendor({
        companyName: '',
        registrationNumber: '',
        taxIdentificationNumber: '',
        categoryCode: 'PIPES_FITTINGS',
        vendorType: 'MANUFACTURER',
        contactPerson: '',
        email: '',
        phone: '',
        addressStreet: '',
        city: 'Dubai',
        creditTermsDays: 60,
        currency: 'AED',
      });
      loadData();
    } catch (err) {
      console.error('Failed to create vendor:', err);
    }
  };

  const handleSelectPrProject = async (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    setNewPr((current) => ({
      ...current,
      projectId,
      projectName: project?.projectName || project?.name || '',
      selectedBoqItemId: '',
      quantity: '',
      budgetCode: '',
    }));
    setPrBoqItems([]);

    if (!projectId) return;

    try {
      const [boqRes, wbsRes] = await Promise.all([
        safeFetchJson<any>(`/api/wbs/${projectId}/boq`),
        safeFetchJson<any>(`/api/wbs/${projectId}/wbs`),
      ]);
      const wbsMap = new Map<string, string>();
      const flatten = (nodes: any[]) => {
        for (const node of nodes || []) {
          wbsMap.set(node.id, node.code || node.id);
          if (Array.isArray(node.children)) flatten(node.children);
        }
      };
      flatten(wbsRes?.data || []);

      setPrBoqItems((boqRes?.data || []).map((item: any) => ({
        ...item,
        wbsCode: wbsMap.get(item.wbsId) || item.wbsId,
        balanceQty: item.balanceQty ?? item.revisedQty ?? item.quantity ?? 0,
      })));
    } catch (error) {
      console.error('Failed to load project BOQ/WBS context:', error);
    }
  };

  const handleSelectPrBoqItem = (boqItemId: string) => {
    const item = prBoqItems.find((entry) => entry.id === boqItemId);
    if (!item) {
      setNewPr((current) => ({ ...current, selectedBoqItemId: '', quantity: '', budgetCode: '' }));
      return;
    }
    setNewPr((current) => ({
      ...current,
      selectedBoqItemId: boqItemId,
      quantity: String(item.balanceQty || ''),
      budgetCode: item.wbsCode || item.wbsId || '',
    }));
  };

  const resetPrForm = () => {
    setNewPr({
      title: '',
      projectId: '',
      projectName: '',
      department: '',
      requiredDate: '',
      priority: 'MEDIUM',
      budgetCode: '',
      budgetAvailableAed: 0,
      notes: '',
      selectedBoqItemId: '',
      quantity: '',
    });
    setPrBoqItems([]);
  };

  const handleCreatePr = async (e: React.FormEvent) => {
    e.preventDefault();
    const item = prBoqItems.find((entry) => entry.id === newPr.selectedBoqItemId);
    const quantity = Number(newPr.quantity);

    if (!item) {
      window.alert('Select a BOQ item before creating the purchase requisition.');
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      window.alert('Enter a valid positive procurement quantity.');
      return;
    }

    try {
      const result = await safeFetchJson<any>('/api/procurement-enterprise/purchase-requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPr.title,
          projectId: newPr.projectId,
          projectName: newPr.projectName,
          department: newPr.department,
          requiredDate: newPr.requiredDate,
          priority: newPr.priority,
          budgetCode: newPr.budgetCode,
          budgetAvailableAed: Number(newPr.budgetAvailableAed || 0),
          notes: newPr.notes,
          items: [{
            boqItemId: item.id,
            wbsId: item.wbsId,
            itemCode: item.itemCode,
            description: item.description,
            quantity,
            uom: item.unit,
            estimatedUnitPrice: Number(item.rate || 0),
            requiredDate: newPr.requiredDate,
          }],
        }),
      });
      if (!result?.success) throw new Error(result?.message || 'Purchase requisition could not be created.');
      setIsPrModalOpen(false);
      resetPrForm();
      await loadData();
    } catch (error: any) {
      window.alert(error?.message || 'Purchase requisition could not be created.');
    }
  };

  const handlePrWorkflowAction = async (
    id: string,
    status: 'SUBMITTED' | 'HOD_APPROVED' | 'FINANCE_APPROVED' | 'PO_ISSUED' | 'REJECTED'
  ) => {
    try {
      const result = await safeFetchJson<any>(`/api/procurement-enterprise/purchase-requisitions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!result?.success) throw new Error(result?.message || 'Workflow action failed.');
      await loadData();
    } catch (error: any) {
      window.alert(error?.message || 'Workflow action failed.');
    }
  };

  const approvedPurchaseRequisitions = purchaseRequisitions.filter((pr) =>
    ['HOD_APPROVED', 'FINANCE_APPROVED', 'PO_ISSUED'].includes(pr.status)
  );

  const handleSelectRfqRequisition = (requisitionId: string) => {
    const pr = approvedPurchaseRequisitions.find((item) => item.id === requisitionId);
    if (!pr) {
      setNewRfq({
        title: '',
        requisitionId: '',
        projectId: '',
        projectName: '',
        category: '',
        issueDate: new Date().toISOString().split('T')[0],
        submissionDeadline: '',
        targetDeliveryDate: '',
        deliveryLocation: '',
        estimatedBudgetAed: 0,
        buyerName: '',
        termsAndConditions: '',
        items: [],
      });
      return;
    }

    const items = (pr.items || []).map((item: any) => ({
      prItemId: item.id,
      boqItemId: item.boqItemId,
      wbsId: item.wbsId,
      itemCode: item.materialCode,
      description: item.description,
      specification: item.specification || '',
      quantity: Number(item.quantity || 0),
      uom: item.uom,
      targetUnitPrice: Number(item.estimatedUnitPrice || 0),
      requiredDeliveryDate: item.requiredDate || pr.requiredDate,
    }));

    setNewRfq((current) => ({
      ...current,
      requisitionId: pr.id,
      projectId: pr.projectId,
      projectName: pr.projectName,
      title: current.title || pr.title,
      estimatedBudgetAed: items.reduce((sum: number, item: any) => sum + item.quantity * item.targetUnitPrice, 0),
      category: current.category || 'GENERAL_PROCUREMENT',
      items,
    }));
  };

  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await safeFetchJson('/api/procurement-enterprise/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRfq,
          buyerName: undefined,
        }),
      });
      setIsRfqModalOpen(false);
      setNewRfq({
        title: '',
        requisitionId: '',
        projectId: '',
        projectName: '',
        category: '',
        issueDate: new Date().toISOString().split('T')[0],
        submissionDeadline: '',
        targetDeliveryDate: '',
        deliveryLocation: '',
        estimatedBudgetAed: 0,
        buyerName: '',
        termsAndConditions: '',
        items: [],
      });
      await loadData();
    } catch (err) {
      console.error('Failed to create RFQ:', err);
    }
  };

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await safeFetchJson('/api/procurement-enterprise/po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPo),
      });
      setIsPoModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to create PO:', err);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await safeFetchJson('/api/procurement-enterprise/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContract),
      });
      setIsContractModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to create Contract:', err);
    }
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch =
      !vendorSearch ||
      v.companyName.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.vendorCode.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(vendorSearch.toLowerCase());
    const matchesCategory =
      vendorCategoryFilter === 'ALL' || v.categoryCode === vendorCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Phase 69 Clean Architecture
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-medium">
                Live ERP Engine
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Enterprise Procurement & Contract Management
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              End-to-end strategic sourcing, vendor lifecycle scorecards, RFQ matrix evaluations, subcontracts, 3-way automated invoice matching, and bank guarantee vaults.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={loadData}
              className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Sync Engine
            </button>
            <button
              onClick={() => setIsVendorModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              Register Vendor
            </button>
            <button
              onClick={() => setIsRfqModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <FilePlus className="w-4 h-4" />
              Create RFQ
            </button>
            <button
              onClick={() => setIsPrModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              <ClipboardList className="w-4 h-4" />
              Raise PR
            </button>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">Approved PO Value (AED)</span>
            <div className="text-xl font-bold text-white mt-1">
              AED {stats?.approvedPurchaseOrderValueAed != null
                ? (Number(stats.approvedPurchaseOrderValueAed) / 1000000).toFixed(1)
                : '—'}M
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-0.5 mt-1">
              <FileCheck2 className="w-3 h-3" /> Canonical procurement value
            </span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">Active Vendors</span>
            <div className="text-xl font-bold text-white mt-1">
              {stats?.activeVendorsCount ?? vendors.length ?? 0} Prequalified
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Tier 1 Certified
            </span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">Active RFQs</span>
            <div className="text-xl font-bold text-white mt-1">
              {stats?.activeRfqsCount ?? rfqs.filter((rfq) => ['PUBLISHED','EVALUATION','EVALUATION_STAGE'].includes(rfq.status)).length} In Bidding
            </div>
            <span className="text-[11px] text-indigo-400 flex items-center gap-1 mt-1">
              <Scale className="w-3 h-3" /> L1 Comparison
            </span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">Open Purchase Orders</span>
            <div className="text-xl font-bold text-white mt-1">
              {stats?.openPosCount ?? purchaseOrders.filter((po) => ['PENDING_APPROVAL','ISSUED','PARTIALLY_DELIVERED','DELIVERED','INVOICED'].includes(po.status)).length} Open
            </div>
            <span className="text-[11px] text-blue-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> On Track
            </span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">Active Contracts</span>
            <div className="text-xl font-bold text-white mt-1">
              AED {stats?.totalContractValueAed != null ? (Number(stats.totalContractValueAed) / 1000000).toFixed(1) : '—'}M
            </div>
            <span className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
              <Briefcase className="w-3 h-3" /> Subcontract EPC
            </span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">3-Way Match Rate</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {stats?.autoMatchedInvoicesPercent != null ? `${stats.autoMatchedInvoicesPercent}%` : '—'}
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> {stats?.autoMatchedInvoicesPercent != null ? 'Measured match rate' : 'No match data'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none pb-2">
        {[
          { id: 'overview', label: 'Procurement Dashboard', icon: <Layers className="w-4 h-4" /> },
          { id: 'vendors', label: 'Vendor Directory & Prequalification', icon: <Building2 className="w-4 h-4" />, count: vendors.length },
          { id: 'rfqs', label: 'RFQs & Bid Comparisons', icon: <FileCheck2 className="w-4 h-4" />, count: rfqs.length },
          { id: 'prs', label: 'Purchase Requisitions', icon: <ClipboardList className="w-4 h-4" />, count: purchaseRequisitions.length },
          { id: 'pos', label: 'Purchase Orders & PRs', icon: <FileSpreadsheet className="w-4 h-4" />, count: purchaseOrders.length },
          { id: 'contracts', label: 'Contracts & Variation Orders', icon: <Briefcase className="w-4 h-4" />, count: contracts.length },
          { id: 'grn', label: 'Goods Receipts (GRN)', icon: <PackageCheck className="w-4 h-4" />, count: goodsReceipts.length },
          { id: 'matching', label: '3-Way Reconciliation', icon: <Scale className="w-4 h-4" /> },
          { id: 'scorecards', label: 'Scorecards & Guarantees', icon: <Award className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-xs ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Purchase Requisition workspace */}
      {activeTab === 'prs' && (
        <div className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Purchase Requisitions</h2>
              <p className="text-sm text-slate-500 mt-1">Create requirements from project BOQ/WBS context and move them through the controlled approval workflow.</p>
            </div>
            <button onClick={() => setIsPrModalOpen(true)} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" /> Raise Purchase Requisition
            </button>
          </div>

          {purchaseRequisitions.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-sm text-slate-500">No purchase requisitions found.</div>
          ) : purchaseRequisitions.map((pr: any) => (
            <div key={pr.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{pr.prNumber}</span>
                    <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">{pr.status}</span>
                  </div>
                  <h3 className="mt-2 font-bold text-slate-900 dark:text-white">{pr.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{pr.projectName} · {pr.department}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pr.status === 'DRAFT' && <button onClick={() => handlePrWorkflowAction(pr.id,'SUBMITTED')} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">Submit</button>}
                  {pr.status === 'SUBMITTED' && <button onClick={() => handlePrWorkflowAction(pr.id,'HOD_APPROVED')} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold">HOD Approve</button>}
                  {pr.status === 'HOD_APPROVED' && <button onClick={() => handlePrWorkflowAction(pr.id,'FINANCE_APPROVED')} className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold">Finance Approve</button>}
                  {pr.status === 'FINANCE_APPROVED' && <button onClick={() => handlePrWorkflowAction(pr.id,'PO_ISSUED')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold">Release to Procurement</button>}
                  {['SUBMITTED','HOD_APPROVED','FINANCE_APPROVED'].includes(pr.status) && <button onClick={() => handlePrWorkflowAction(pr.id,'REJECTED')} className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold">Reject</button>}
                </div>
              </div>
              <div className="mt-4 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase text-slate-500">
                    <tr><th className="px-3 py-2 text-left">WBS</th><th className="px-3 py-2 text-left">BOQ</th><th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-left">UOM</th><th className="px-3 py-2 text-right">Estimated</th></tr>
                  </thead>
                  <tbody>
                    {(pr.items || []).map((item: any) => (
                      <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2 font-mono text-slate-500">{item.wbsCode || item.wbsId}</td>
                        <td className="px-3 py-2 font-mono font-semibold text-blue-600 dark:text-blue-400">{item.boqItemCode}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{item.description}</td>
                        <td className="px-3 py-2 text-right">{Number(item.quantity || 0).toLocaleString()}</td>
                        <td className="px-3 py-2">{item.uom}</td>
                        <td className="px-3 py-2 text-right font-semibold">{Number(item.estimatedTotalPrice || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live RFQs in Bidding */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-indigo-500" />
                  Active Sourcing Packages & RFQs
                </h3>
                <button
                  onClick={() => setActiveTab('rfqs')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  View All Packages <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {rfqs.map(rfq => (
                  <div
                    key={rfq.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold rounded">
                          {rfq.rfqNumber}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-medium rounded">
                          {rfq.status}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Deadline: {rfq.submissionDeadline}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {rfq.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Project: {rfq.projectName}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-xs text-slate-400">Estimated Budget</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          AED {Number(rfq.estimatedBudgetAed || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold">
                        {rfq.quotationsReceivedCount || 3} Bids Received
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Purchase Orders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                  Recent High-Value Purchase Orders (PO)
                </h3>
                <button
                  onClick={() => setActiveTab('pos')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  View All Orders <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchaseOrders.map(po => (
                  <div key={po.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {po.poNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {po.vendorName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Target Delivery: {po.deliveryDate} • Payment: {po.paymentTerms}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        AED {Number(po.totalAmount || 0).toLocaleString()}
                      </div>
                      <span className="inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium rounded mt-0.5">
                        {po.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Top Suppliers & Audit Activity */}
          <div className="space-y-6">
            {/* Top Vendors by Strategic Spend */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-indigo-500" />
                Strategic Supplier Spend
              </h3>
              <div className="space-y-3.5">
                {vendors.slice(0, 4).map(v => (
                  <div key={v.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {v.companyName}
                      </h4>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        AED {(v.totalSpendAmount / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      <span>Rating: ⭐ {v.ratingScore} / 5.0</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {v.creditTermsDays} Days Credit
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-Way Reconciliation Summary */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-md">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Scale className="w-4 h-4" />
                Automated 3-Way Match
              </div>
              <h4 className="text-lg font-bold">100% Invoice Compliance</h4>
              <p className="text-xs text-slate-300 mt-1">
                Zero PO vs. GRN vs. Invoice variances detected. All delivered quantities verified by site QA/QC inspectors.
              </p>
              <div className="mt-4 pt-4 border-t border-indigo-800/60 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Total Cleared</div>
                  <div className="text-base font-bold text-white">AED 23,892,750</div>
                </div>
                <button
                  onClick={() => setActiveTab('matching')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white transition"
                >
                  Audit Engine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Vendor Directory */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search vendors by name, code, contact person..."
                  value={vendorSearch}
                  onChange={e => setVendorSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={vendorCategoryFilter}
                onChange={e => setVendorCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Categories</option>
                <option value="PIPES_FITTINGS">Pipes & Fittings</option>
                <option value="STEEL_PIPES">Steel & Structural</option>
                <option value="VALVES_ACTUATORS">Valves & Actuators</option>
                <option value="PUMPING_EQUIPMENT">Pumping Equipment</option>
              </select>
            </div>

            <button
              onClick={() => setIsVendorModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" />
              Register New Vendor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVendors.map(vendor => (
              <div
                key={vendor.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold rounded">
                        {vendor.vendorCode}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded">
                        {vendor.status}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {vendor.vendorType}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                      {vendor.companyName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Rating Score</div>
                    <div className="text-base font-extrabold text-amber-500">
                      ⭐ {vendor.ratingScore} / 5.0
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3.5 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400">Contact:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {vendor.contactPerson}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {vendor.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Credit Terms:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {vendor.creditTermsDays} Days ({vendor.currency})
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Spend:</span>
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                      AED {Number(vendor.totalSpendAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="truncate max-w-[260px]">
                    📍 {vendor.addressStreet}, {vendor.city}
                  </span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    Prequalified & Vetted
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: RFQs & Bidding */}
      {activeTab === 'rfqs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Request for Quotations (RFQ) & Comparative Statements
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-vendor technical & commercial bidding matrix with automated L1 recommendation.
              </p>
            </div>

            <button
              onClick={() => setIsRfqModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow"
            >
              <FilePlus className="w-4 h-4" />
              New RFQ Sourcing Package
            </button>
          </div>

          <div className="space-y-4">
            {rfqs.map(rfq => (
              <div
                key={rfq.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold rounded">
                        {rfq.rfqNumber}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
                        {rfq.status}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Target Delivery: {rfq.targetDeliveryDate}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {rfq.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Project: {rfq.projectName} • Buyer: {rfq.buyerName}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Estimated Budget</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      AED {Number(rfq.estimatedBudgetAed || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Quotation Comparison Matrix */}
                {rfq.quotations && rfq.quotations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      Quotation Evaluation Matrix (L1 Ranking)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                          <tr>
                            <th className="p-2.5 rounded-l-lg">Rank</th>
                            <th className="p-2.5">Quotation #</th>
                            <th className="p-2.5">Bidder Name</th>
                            <th className="p-2.5">Subtotal (AED)</th>
                            <th className="p-2.5">VAT (5%)</th>
                            <th className="p-2.5">Total Quote (AED)</th>
                            <th className="p-2.5">Lead Time</th>
                            <th className="p-2.5">Tech Status</th>
                            <th className="p-2.5 rounded-r-lg">Award Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {rfq.quotations.map((q: any) => (
                            <tr
                              key={q.id}
                              className={
                                q.commercialRanking === 1
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 font-semibold'
                                  : ''
                              }
                            >
                              <td className="p-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] ${
                                    q.commercialRanking === 1
                                      ? 'bg-emerald-600 text-white font-bold'
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  L{q.commercialRanking}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono text-indigo-600 dark:text-indigo-400">
                                {q.quotationNumber}
                              </td>
                              <td className="p-2.5">{q.vendorName}</td>
                              <td className="p-2.5">AED {Number(q.subtotalAmount).toLocaleString()}</td>
                              <td className="p-2.5">AED {Number(q.taxVatAmount).toLocaleString()}</td>
                              <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                                AED {Number(q.totalQuoteAmount).toLocaleString()}
                              </td>
                              <td className="p-2.5">{q.leadTimeDays} Days</td>
                              <td className="p-2.5">
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  {q.technicalComplianceStatus}
                                </span>
                              </td>
                              <td className="p-2.5">
                                {q.isAwarded ? (
                                  <span className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold">
                                    AWARDED
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">Under Review</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Purchase Orders */}
      {activeTab === 'pos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Enterprise Purchase Orders (PO) & Delivery Schedules
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-line item purchase orders with retention terms, advance guarantees, and status tracking.
              </p>
            </div>

            <button
              onClick={() => setIsPoModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" />
              Issue Purchase Order
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="p-3.5">PO Number</th>
                    <th className="p-3.5">Vendor Name</th>
                    <th className="p-3.5">Project</th>
                    <th className="p-3.5">PO Date</th>
                    <th className="p-3.5">Delivery Target</th>
                    <th className="p-3.5">Subtotal</th>
                    <th className="p-3.5">Total (inc. VAT)</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {purchaseOrders.map(po => (
                    <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {po.poNumber}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {po.vendorName}
                      </td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">{po.projectName}</td>
                      <td className="p-3.5">{po.poDate}</td>
                      <td className="p-3.5">{po.deliveryDate}</td>
                      <td className="p-3.5">AED {Number(po.subtotal).toLocaleString()}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        AED {Number(po.totalAmount).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium rounded text-[11px]">
                          {po.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px] font-semibold">
                          View Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Contracts & Variations */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Subcontract Agreements & Variation Orders (VO)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                FIDIC / DIAC compliant subcontracts with scope variations, liquidated damages caps, and retentions.
              </p>
            </div>

            <button
              onClick={() => setIsContractModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" />
              Register Subcontract
            </button>
          </div>

          <div className="space-y-4">
            {contracts.map(contract => (
              <div
                key={contract.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold rounded">
                        {contract.contractNumber}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded">
                        {contract.status}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {contract.effectiveStartDate} to {contract.effectiveEndDate}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {contract.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Vendor: <span className="font-semibold text-slate-800 dark:text-slate-200">{contract.vendorName}</span> • Manager: {contract.contractManager}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Revised Contract Value</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      AED {Number(contract.revisedContractValue || 0).toLocaleString()}
                    </div>
                    <span className="text-xs text-slate-400">
                      Original: AED {Number(contract.originalContractValue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Variations */}
                {contract.variations && contract.variations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Approved Variation Orders (VO)
                    </h4>
                    <div className="space-y-2">
                      {contract.variations.map((vo: any) => (
                        <div
                          key={vo.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mr-2">
                              {vo.variationNumber}
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {vo.title}
                            </span>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                              Reason: {vo.reasonCategory} • Time Ext: +{vo.timeExtensionDays} Days
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-emerald-600 dark:text-emerald-400">
                              +AED {Number(vo.variationAmount).toLocaleString()}
                            </div>
                            <span className="text-[11px] text-slate-400">Approved by {vo.approvedBy}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Goods Receipts (GRN) */}
      {activeTab === 'grn' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Goods Receipt Notes (GRN) & Material Inspection (MIR)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Site delivery receipts with QA/QC material inspection sign-offs and delivery note tracking.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-3.5">GRN Number</th>
                  <th className="p-3.5">PO Number</th>
                  <th className="p-3.5">Vendor Name</th>
                  <th className="p-3.5">Delivery Note #</th>
                  <th className="p-3.5">Receipt Date</th>
                  <th className="p-3.5">Site Location</th>
                  <th className="p-3.5">Inspected By</th>
                  <th className="p-3.5">MIR Ref</th>
                  <th className="p-3.5">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {goodsReceipts.map(grn => (
                  <tr key={grn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {grn.grnNumber}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">{grn.poNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {grn.vendorName}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{grn.deliveryNoteNumber}</td>
                    <td className="p-3.5">{grn.receiptDate}</td>
                    <td className="p-3.5">{grn.siteLocation}</td>
                    <td className="p-3.5">{grn.inspectedBy}</td>
                    <td className="p-3.5 font-mono text-indigo-500">{grn.mirNumber}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold rounded text-[11px]">
                        {grn.inspectionResult}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: 3-Way Matching */}
      {activeTab === 'matching' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Automated 3-Way Invoice Reconciliation Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cross-verifies Purchase Order (PO) terms, Goods Receipt Notes (GRN) received quantities, and Vendor Invoices before authorizing payment disbursement.
            </p>
          </div>

          <div className="space-y-3">
            {threeWayMatches.map(match => (
              <div
                key={match.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold rounded">
                      {match.matchingCode}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {match.vendorName}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {match.matchingStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <div className="text-slate-400 font-semibold mb-1">1. Purchase Order (PO)</div>
                    <div className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{match.poNumber}</div>
                    <div className="mt-1">Qty Ordered: <span className="font-bold">{match.poQuantity} Mtrs</span></div>
                    <div>Unit Price: <span className="font-bold">AED {match.poUnitPrice}</span></div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <div className="text-slate-400 font-semibold mb-1">2. Goods Receipt (GRN)</div>
                    <div className="font-mono text-blue-600 dark:text-blue-400 font-bold">{match.grnNumber}</div>
                    <div className="mt-1">Qty Received: <span className="font-bold">{match.grnQuantity} Mtrs</span></div>
                    <div className="text-emerald-500 font-semibold">QA/QC MIR Inspected: PASS</div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <div className="text-slate-400 font-semibold mb-1">3. Vendor Invoice (INV)</div>
                    <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{match.invoiceNumber}</div>
                    <div className="mt-1">Qty Billed: <span className="font-bold">{match.invoiceQuantity} Mtrs</span></div>
                    <div>Billed Unit Price: <span className="font-bold">AED {match.invoiceUnitPrice}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Scorecards & Guarantees */}
      {activeTab === 'scorecards' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scorecards */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" />
                Quarterly Supplier Scorecards
              </h3>
            </div>

            {scorecards.map(sc => (
              <div
                key={sc.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {sc.quarterPeriod}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {sc.vendorName}
                    </h4>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm rounded-lg">
                    Grade {sc.gradeRank} ({sc.overallIndex}%)
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-4 text-center text-xs">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <span className="text-slate-400 text-[10px]">Quality</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">{sc.qualityKpiScore}%</div>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <span className="text-slate-400 text-[10px]">Delivery</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">{sc.deliveryKpiScore}%</div>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <span className="text-slate-400 text-[10px]">Commercial</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">{sc.commercialKpiScore}%</div>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <span className="text-slate-400 text-[10px]">Service</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">{sc.serviceKpiScore}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Guarantees Vault */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Bank Guarantees & Bonds Vault
              </h3>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  BG-FAB-2026-9812
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded">
                  ACTIVE
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                First Abu Dhabi Bank (FAB) • Performance Bond
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Contract: CON-2026-0012 (Underground Micro-Tunneling)
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div>
                  <span className="text-slate-400">Guarantee Value:</span>
                  <p className="font-bold text-slate-900 dark:text-white">AED 1,985,000</p>
                </div>
                <div>
                  <span className="text-slate-400">Valid Until:</span>
                  <p className="font-bold text-slate-900 dark:text-white">2027-06-30</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                Custody: Head Office Finance Fireproof Vault Box 04
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Register Vendor */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Register New Supplier / Vendor</h3>
            <form onSubmit={handleCreateVendor} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Company Legal Name</label>
                <input
                  required
                  type="text"
                  value={newVendor.companyName}
                  onChange={e => setNewVendor({ ...newVendor, companyName: e.target.value })}
                  placeholder="e.g. Al-Futtaim Engineering & Technologies"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Trade License / Reg #</label>
                  <input
                    required
                    type="text"
                    value={newVendor.registrationNumber}
                    onChange={e => setNewVendor({ ...newVendor, registrationNumber: e.target.value })}
                    placeholder="CN-984021"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Tax TRN #</label>
                  <input
                    required
                    type="text"
                    value={newVendor.taxIdentificationNumber}
                    onChange={e => setNewVendor({ ...newVendor, taxIdentificationNumber: e.target.value })}
                    placeholder="TRN-100294829100003"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newVendor.categoryCode}
                    onChange={e => setNewVendor({ ...newVendor, categoryCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="PIPES_FITTINGS">Pipes & Fittings</option>
                    <option value="STEEL_PIPES">Steel & Structural</option>
                    <option value="VALVES_ACTUATORS">Valves & Actuators</option>
                    <option value="PUMPING_EQUIPMENT">Pumping Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Type</label>
                  <select
                    value={newVendor.vendorType}
                    onChange={e => setNewVendor({ ...newVendor, vendorType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="MANUFACTURER">Manufacturer</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                    <option value="SUBCONTRACTOR">Subcontractor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Contact Person</label>
                  <input
                    required
                    type="text"
                    value={newVendor.contactPerson}
                    onChange={e => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
                    placeholder="Eng. Mansoor"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={newVendor.email}
                    onChange={e => setNewVendor({ ...newVendor, email: e.target.value })}
                    placeholder="sales@vendor.ae"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Phone</label>
                  <input
                    required
                    type="text"
                    value={newVendor.phone}
                    onChange={e => setNewVendor({ ...newVendor, phone: e.target.value })}
                    placeholder="+971 4 000 0000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Street Address</label>
                  <input
                    required
                    type="text"
                    value={newVendor.addressStreet}
                    onChange={e => setNewVendor({ ...newVendor, addressStreet: e.target.value })}
                    placeholder="JAFZA Plot 402"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow hover:bg-indigo-500"
                >
                  Submit & Prequalify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Raise Purchase Requisition */}
      {isPrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Raise Purchase Requisition</h3>
              <p className="text-xs text-slate-500 mt-1">Project and BOQ/WBS context comes from the authoritative project controls.</p>
            </div>
            <form onSubmit={handleCreatePr} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Project *</label>
                  <select required value={newPr.projectId} onChange={(e) => handleSelectPrProject(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <option value="">Select project...</option>
                    {projects.map((project) => <option key={project.id} value={project.id}>{project.projectCode || project.code} — {project.projectName || project.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Department *</label>
                  <input required value={newPr.department} onChange={(e) => setNewPr({ ...newPr, department: e.target.value })} placeholder="Department / discipline" className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Requirement Title *</label>
                <input required value={newPr.title} onChange={(e) => setNewPr({ ...newPr, title: e.target.value })} placeholder="Material / procurement requirement" className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">BOQ Item *</label>
                  <select required disabled={!newPr.projectId} value={newPr.selectedBoqItemId} onChange={(e) => handleSelectPrBoqItem(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <option value="">Select BOQ item...</option>
                    {prBoqItems.map((item) => <option key={item.id} value={item.id}>{item.itemCode} — {item.description}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Quantity *</label>
                  <input required type="number" min="0.001" step="any" value={newPr.quantity} onChange={(e) => setNewPr({ ...newPr, quantity: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                </div>
              </div>
              {newPr.selectedBoqItemId && (() => {
                const item = prBoqItems.find((entry) => entry.id === newPr.selectedBoqItemId);
                return <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div><span className="block text-[10px] uppercase text-slate-400">WBS</span><span className="font-mono font-semibold">{item?.wbsCode || item?.wbsId || '—'}</span></div>
                  <div><span className="block text-[10px] uppercase text-slate-400">BOQ Balance</span><span className="font-semibold">{Number(item?.balanceQty || 0).toLocaleString()} {item?.unit || ''}</span></div>
                  <div><span className="block text-[10px] uppercase text-slate-400">BOQ Rate</span><span className="font-semibold">{Number(item?.rate || 0).toLocaleString()}</span></div>
                </div>;
              })()}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Required Date *</label>
                  <input required type="date" value={newPr.requiredDate} onChange={(e) => setNewPr({ ...newPr, requiredDate: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Priority</label>
                  <select value={newPr.priority} onChange={(e) => setNewPr({ ...newPr, priority: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT_SHUTDOWN">Urgent Shutdown</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Budget / WBS Code *</label>
                  <input required value={newPr.budgetCode} onChange={(e) => setNewPr({ ...newPr, budgetCode: e.target.value })} placeholder="Configured cost/budget code" className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Budget Available</label>
                <input type="number" min="0" value={newPr.budgetAvailableAed} onChange={(e) => setNewPr({ ...newPr, budgetAvailableAed: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Notes</label>
                <textarea rows={3} value={newPr.notes} onChange={(e) => setNewPr({ ...newPr, notes: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => { setIsPrModalOpen(false); resetPrForm(); }} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Cancel</button>
                <button type="submit" disabled={!newPr.projectId || !newPr.selectedBoqItemId} className="px-4 py-2 rounded-xl bg-emerald-600 disabled:opacity-50 text-white font-semibold">Save PR Draft</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create RFQ from approved PR */}
      {isRfqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create RFQ from Approved Purchase Requisition</h3>
              <p className="text-xs text-slate-500 mt-1">
                Procurement lineage is inherited from the selected PR. BOQ/WBS references cannot be edited here.
              </p>
            </div>

            {approvedPurchaseRequisitions.length === 0 ? (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
                No approved purchase requisition is available for RFQ creation. Complete the configured PR approval workflow first.
              </div>
            ) : (
              <form onSubmit={handleCreateRfq} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Approved Purchase Requisition *</label>
                  <select
                    required
                    value={newRfq.requisitionId}
                    onChange={(e) => handleSelectRfqRequisition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="">Select approved PR...</option>
                    {approvedPurchaseRequisitions.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.prNumber} — {pr.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">RFQ Package Title *</label>
                    <input
                      required
                      type="text"
                      value={newRfq.title}
                      onChange={(e) => setNewRfq({ ...newRfq, title: e.target.value })}
                      placeholder="Sourcing package title"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Category *</label>
                    <input
                      required
                      type="text"
                      value={newRfq.category}
                      onChange={(e) => setNewRfq({ ...newRfq, category: e.target.value })}
                      placeholder="Category"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Project</label>
                    <input
                      type="text"
                      readOnly
                      value={newRfq.projectName}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Issue Date *</label>
                    <input
                      required
                      type="date"
                      value={newRfq.issueDate}
                      onChange={(e) => setNewRfq({ ...newRfq, issueDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Estimated Value</label>
                    <input
                      type="number"
                      readOnly
                      value={newRfq.estimatedBudgetAed}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Submission Deadline *</label>
                    <input
                      required
                      type="date"
                      value={newRfq.submissionDeadline}
                      onChange={(e) => setNewRfq({ ...newRfq, submissionDeadline: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target Delivery *</label>
                    <input
                      required
                      type="date"
                      value={newRfq.targetDeliveryDate}
                      onChange={(e) => setNewRfq({ ...newRfq, targetDeliveryDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Delivery Location *</label>
                    <input
                      required
                      type="text"
                      value={newRfq.deliveryLocation}
                      onChange={(e) => setNewRfq({ ...newRfq, deliveryLocation: e.target.value })}
                      placeholder="Project/site delivery location"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold">BOQ / WBS Procurement Lines</label>
                    <span className="text-[11px] text-slate-500">{newRfq.items.length} line(s)</span>
                  </div>
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-2 text-left">WBS</th>
                          <th className="px-3 py-2 text-left">BOQ Item</th>
                          <th className="px-3 py-2 text-left">Description</th>
                          <th className="px-3 py-2 text-right">Qty</th>
                          <th className="px-3 py-2 text-left">UOM</th>
                          <th className="px-3 py-2 text-right">Target Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {newRfq.items.map((item: any) => (
                          <tr key={item.prItemId}>
                            <td className="px-3 py-2 font-mono text-slate-500">{item.wbsCode || item.wbsId}</td>
                            <td className="px-3 py-2 font-mono font-semibold text-blue-600 dark:text-blue-400">{item.itemCode}</td>
                            <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{item.description}</td>
                            <td className="px-3 py-2 text-right font-semibold">{item.quantity.toLocaleString()}</td>
                            <td className="px-3 py-2">{item.uom}</td>
                            <td className="px-3 py-2 text-right">{Number(item.targetUnitPrice || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsRfqModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newRfq.requisitionId || newRfq.items.length === 0}
                    className="px-4 py-2 bg-blue-600 disabled:opacity-50 text-white rounded-xl font-semibold shadow hover:bg-blue-500"
                  >
                    Save RFQ Draft
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
