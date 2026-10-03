import React, { useState, useEffect } from 'react';
import { ContractClaimsWorkspace } from './ContractClaimsWorkspace';
import { 
  Building2, Plus, Search, Star, ShieldCheck, FileText, Phone, Mail, MapPin, 
  CreditCard, Award, CheckCircle2, Clock, X, AlertTriangle, FileSpreadsheet, 
  Check, Filter, AlertCircle, RefreshCw, Layers, DollarSign, Calendar, TrendingUp,
  Ban, ShieldAlert, FileCheck, ArrowUpRight, ChevronRight, UserCheck, Lock
} from 'lucide-react';

interface VendorItem {
  id: string;
  vendorCode: string;
  name: string;
  category: string;
  classification: string; // APPROVED, PREFERRED, BLOCKED, BLACKLISTED, UNDER_REVIEW
  status: string; // ACTIVE, INACTIVE, SUSPENDED, PENDING_APPROVAL
  rating: number;
  scorecardGrade: string;
  avlStatus: string;
  tradeLicenseNo?: string;
  gstin?: string;
  pan?: string;
  msmeRegNo?: string;
  isoCertified: boolean;
  paymentTerms: string;
  riskLevel: string;
  contacts?: any[];
  bankAccounts?: any[];
}

interface ContractItem {
  id: string;
  contractNumber: string;
  title: string;
  contractType: string;
  vendorName: string;
  projectName?: string;
  contractValue: number;
  revisedValue: number;
  currency: string;
  startDate: string;
  endDate: string;
  revisedEndDate?: string;
  status: string; // DRAFT, SUBMITTED, REVIEWED, APPROVED, ACTIVE, SUSPENDED, COMPLETED, CLOSED
  retentionPercent: number;
  retentionAmount: number;
  securityDepositAmount: number;
  performanceGuaranteeAmount: number;
  items?: any[];
  milestones?: any[];
  payments?: any[];
  variations?: any[];
}

export const EnterpriseVendorContractManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vendors' | 'scorecards' | 'contracts' | 'variations' | 'claims' | 'documents' | 'analytics'>('vendors');
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorItem | null>(null);
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);

  // New Vendor Form
  const [vendorForm, setVendorForm] = useState({
    name: '',
    category: 'Structural Steel & Mechanical',
    tradeLicenseNo: '',
    gstin: '',
    pan: '',
    paymentTerms: 'NET_30',
    isoCertified: false,
    contactName: '',
    email: '',
    phone: '',
    bankName: '',
    accountNumber: ''
  });

  // New Contract Form
  const [contractForm, setContractForm] = useState({
    title: '',
    contractType: 'MECHANICAL',
    vendorId: '',
    vendorName: '',
    projectId: '',
    projectName: '',
    currency: '',
    contractValue: '',
    startDate: '',
    endDate: '',
    retentionPercent: '',
    securityDepositAmount: '',
    performanceGuaranteeAmount: ''
  });

  // New Rating Form
  const [ratingForm, setRatingForm] = useState({
    ratingPeriod: 'Q2-2026',
    qualityRating: 5,
    deliveryRating: 5,
    priceCompetitiveness: 4,
    safetyRating: 5,
    comments: 'Excellent execution quality and strict adherence to safety standards'
  });

  // New Variation Form
  const [variationForm, setVariationForm] = useState({
    contractId: '',
    title: '',
    description: '',
    variationType: 'ADDITION',
    amount: 0,
    timeExtensionDays: 0,
    justification: '',
    wbsId: '',
    boqItemId: '',
    costCodeId: '',
    changeEventReference: '',
    clientReference: ''
  });

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [vRes, cRes, pRes, currRes] = await Promise.all([
        fetch('/api/vendor-management/vendors', { headers: authHeader }).then(r => r.json()),
        fetch('/api/contracts-engine/contracts', { headers: authHeader }).then(r => r.json()),
        fetch('/api/projects', { headers: authHeader }).then(r => r.json()),
        fetch('/api/projects/masters/currencies', { headers: authHeader }).then(r => r.json())
      ]);

      if (vRes.success) setVendors(vRes.data || []);
      if (cRes.success) setContracts(cRes.data || []);
      if (pRes.success) setProjects(pRes.data || []);
      if (currRes.success) setCurrencies(currRes.data || []);
    } catch (err) {
      console.error('Error fetching Phase 57 data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/vendor-management/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: vendorForm.name,
          category: vendorForm.category,
          tradeLicenseNo: vendorForm.tradeLicenseNo,
          gstin: vendorForm.gstin,
          pan: vendorForm.pan,
          isoCertified: vendorForm.isoCertified,
          paymentTerms: vendorForm.paymentTerms,
          contacts: vendorForm.contactName ? [{
            contactName: vendorForm.contactName,
            email: vendorForm.email,
            phone: vendorForm.phone,
            isPrimary: true
          }] : [],
          bankAccounts: vendorForm.bankName ? [{
            bankName: vendorForm.bankName,
            accountNumber: vendorForm.accountNumber,
            accountHolderName: vendorForm.name,
            isPrimary: true
          }] : []
        })
      }).then(r => r.json());

      if (res.success) {
        setIsVendorModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/contracts-engine/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: contractForm.title,
          contractType: contractForm.contractType,
          vendorId: contractForm.vendorId,
          vendorName: contractForm.vendorName,
          projectId: contractForm.projectId || undefined,
          projectName: contractForm.projectName || undefined,
          contractValue: Number(contractForm.contractValue),
          currency: contractForm.currency,
          startDate: contractForm.startDate,
          endDate: contractForm.endDate,
          retentionPercent: contractForm.retentionPercent === '' ? undefined : Number(contractForm.retentionPercent),
          securityDepositAmount: contractForm.securityDepositAmount === '' ? undefined : Number(contractForm.securityDepositAmount),
          performanceGuaranteeAmount: contractForm.performanceGuaranteeAmount === '' ? undefined : Number(contractForm.performanceGuaranteeAmount)
        })
      }).then(r => r.json());

      if (res.success) {
        setIsContractModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/vendor-management/vendors/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          vendorId: selectedVendor.id,
          ratingPeriod: ratingForm.ratingPeriod,
          qualityRating: Number(ratingForm.qualityRating),
          deliveryRating: Number(ratingForm.deliveryRating),
          priceCompetitiveness: Number(ratingForm.priceCompetitiveness),
          safetyRating: Number(ratingForm.safetyRating),
          evaluatorName: 'Lead Procurement Auditor',
          comments: ratingForm.comments
        })
      }).then(r => r.json());

      if (res.success) {
        setIsRatingModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateVariation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/contracts-engine/contracts/variation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          contractId: selectedContract.id,
          projectId: selectedContract.projectId,
          projectName: selectedContract.projectName,
          title: variationForm.title,
          description: variationForm.description,
          variationType: variationForm.variationType,
          amount: Number(variationForm.amount),
          claimedAmount: Number(variationForm.amount),
          timeExtensionDays: Number(variationForm.timeExtensionDays),
          claimedTimeExtensionDays: Number(variationForm.timeExtensionDays),
          justification: variationForm.justification || undefined,
          wbsId: variationForm.wbsId || undefined,
          boqItemId: variationForm.boqItemId || undefined,
          costCodeId: variationForm.costCodeId || undefined,
          changeEventReference: variationForm.changeEventReference || undefined,
          clientReference: variationForm.clientReference || undefined
        })
      }).then(r => r.json());

      if (res.success) {
        setIsVariationModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.vendorCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || v.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) || c.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate Metrics
  const totalContractVal = contracts.reduce((acc, c) => acc + (c.revisedValue || c.contractValue || 0), 0);
  const activeContractCount = contracts.filter(c => c.status === 'ACTIVE').length;
  const preferredVendorCount = vendors.filter(v => v.classification === 'PREFERRED' || v.classification === 'APPROVED').length;
  const totalRetentions = contracts.reduce((acc, c) => acc + (c.retentionAmount || 0), 0);

  return (
    <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold tracking-wide uppercase">
              Phase 57 Enterprise Engine
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> ISO 9001 Compliant
            </span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            Enterprise Vendor & Contract Management Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            End-to-End Vendor Lifecycle, Approved Vendor List (AVL), Scorecards, Contracts & Variation Orders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsVendorModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Register Vendor
          </button>
          <button 
            onClick={() => setIsContractModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm"
          >
            <FileText className="w-4 h-4" /> Create Contract
          </button>
        </div>
      </div>

      {/* Analytics KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Vendors (AVL)</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{vendors.length}</span>
            <span className="text-xs text-emerald-600 font-medium">{preferredVendorCount} Approved</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Contracts</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{contracts.length}</span>
            <span className="text-xs text-indigo-600 font-medium">{activeContractCount} Execution Phase</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Portfolio Value</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">AED {totalContractVal.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Retention Funds Held</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">AED {totalRetentions.toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-medium">10% Standard Cap</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'vendors'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Vendor Directory & AVL ({vendors.length})
        </button>

        <button
          onClick={() => setActiveTab('scorecards')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'scorecards'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" /> Ratings & Scorecards
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'contracts'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Contract Registry ({contracts.length})
        </button>

        <button
          onClick={() => setActiveTab('variations')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'variations'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Variation Orders, EOT & Payments
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'claims'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Contract Claims
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" /> Analytics & Risk Matrix
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Vendor, Code, Contract Number or Title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={fetchData}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-all"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab 1: Vendor Directory & Approved Vendor List */}
      {activeTab === 'vendors' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Approved Vendor List (AVL)
            </h2>
            <span className="text-xs text-slate-500 font-medium">{filteredVendors.length} Verified Suppliers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs font-semibold uppercase">
                <tr>
                  <th className="px-6 py-3.5">Vendor Code & Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">AVL Classification</th>
                  <th className="px-6 py-3.5">Rating / Grade</th>
                  <th className="px-6 py-3.5">License & Tax ID</th>
                  <th className="px-6 py-3.5">ISO Cert</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No vendors found matching your criteria. Click "Register Vendor" to add one.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{v.name}</div>
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{v.vendorCode}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{v.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          v.classification === 'PREFERRED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          v.classification === 'APPROVED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                          v.classification === 'BLACKLISTED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>
                          {v.classification}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 font-bold text-amber-500">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>{v.rating || 5.0}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded ml-1">
                            Grade {v.scorecardGrade || 'A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        <div>Lic: {v.tradeLicenseNo || 'TL-99211'}</div>
                        <div className="text-slate-400">PAN: {v.pan || 'AAACE1234F'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {v.isoCertified ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-4 h-4" /> Certified
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Standard</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedVendor(v);
                            setIsRatingModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-all"
                        >
                          Rate Vendor
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Vendor Scorecards */}
      {activeTab === 'scorecards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map(v => (
            <div key={v.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{v.name}</h3>
                  <p className="text-xs text-indigo-600 font-mono mt-0.5">{v.vendorCode}</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold rounded-lg text-sm">
                  Grade {v.scorecardGrade || 'A+'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Quality & Specification Compliance:</span>
                  <span className="font-bold text-emerald-600">5.0 / 5.0</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full"></div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500">Delivery Lead Time Performance:</span>
                  <span className="font-bold text-blue-600">4.8 / 5.0</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[96%]"></div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500">HSE & Safety Standards:</span>
                  <span className="font-bold text-indigo-600">5.0 / 5.0</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-full"></div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-700 text-xs">
                <span className="text-slate-400">Payment Terms: {v.paymentTerms}</span>
                <button
                  onClick={() => {
                    setSelectedVendor(v);
                    setIsRatingModalOpen(true);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Update Evaluation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Contract Registry */}
      {activeTab === 'contracts' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Contract Lifecycle Registry
            </h2>
            <span className="text-xs text-slate-500 font-medium">{filteredContracts.length} Total Executed Contracts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs font-semibold uppercase">
                <tr>
                  <th className="px-6 py-3.5">Contract No & Title</th>
                  <th className="px-6 py-3.5">Vendor</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Contract Value</th>
                  <th className="px-6 py-3.5">Start & End Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No contracts found in registry. Click "Create Contract" to generate one.
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{c.title}</div>
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{c.contractNumber}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{c.vendorName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs font-semibold">
                          {c.contractType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {c.currency} {c.contractValue?.toLocaleString()}
                        {c.revisedValue && c.revisedValue > c.contractValue && (
                          <div className="text-xs text-emerald-600 font-semibold">
                            VO Revised: {c.currency} {c.revisedValue.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        <div>{c.startDate}</div>
                        <div className="text-slate-400">to {c.endDate}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          c.status === 'DRAFT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedContract(c);
                            setIsVariationModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium transition-all"
                        >
                          Issue Variation
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contract Claims */}
      {activeTab === 'claims' && (
        <ContractClaimsWorkspace contracts={contracts} />
      )}
      {/* Modal: Register Vendor */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Register New Vendor (AVL)</h3>
              <button onClick={() => setIsVendorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Company Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emirates Steel & Heavy Engineering LLC"
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
                  <select
                    value={vendorForm.category}
                    onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                  >
                    <option value="Structural Steel & Mechanical">Structural Steel & Mechanical</option>
                    <option value="Civil & Concrete Supply">Civil & Concrete Supply</option>
                    <option value="Electrical & Automation">Electrical & Automation</option>
                    <option value="Piping & Valves">Piping & Valves</option>
                    <option value="Heavy Equipment Rental">Heavy Equipment Rental</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Trade License No</label>
                  <input
                    type="text"
                    placeholder="TL-DXB-998822"
                    value={vendorForm.tradeLicenseNo}
                    onChange={(e) => setVendorForm({ ...vendorForm, tradeLicenseNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">GSTIN / VAT ID</label>
                  <input
                    type="text"
                    placeholder="06AAACE1234F1Z5"
                    value={vendorForm.gstin}
                    onChange={(e) => setVendorForm({ ...vendorForm, gstin: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">PAN / Tax Registration</label>
                  <input
                    type="text"
                    placeholder="AAACE1234F"
                    value={vendorForm.pan}
                    onChange={(e) => setVendorForm({ ...vendorForm, pan: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="border-t pt-3 border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Primary Contact Name</label>
                  <input
                    type="text"
                    placeholder="Rashid Al-Maktoum"
                    value={vendorForm.contactName}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="rashid@vendor.ae"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4 border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Contract */}
      {isContractModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Create New EPCC Contract</h3>
              <button onClick={() => setIsContractModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-4 text-sm">
              <div>
                              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Vendor *</label>
                  <select
                    required
                    value={contractForm.vendorId}
                    onChange={(e) => {
                      const vendor = vendors.find((v) => v.id === e.target.value);
                      setContractForm({
                        ...contractForm,
                        vendorId: e.target.value,
                        vendorName: vendor?.name || ''
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                  >
                    <option value="">Select Vendor...</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name} ({vendor.vendorCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Project *</label>
                  <select
                    required
                    value={contractForm.projectId}
                    onChange={(e) => {
                      const project = projects.find((p) => p.id === e.target.value);
                      setContractForm({
                        ...contractForm,
                        projectId: e.target.value,
                        projectName: project?.projectName || project?.name || ''
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                  >
                    <option value="">Select Project...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.projectCode} — {project.projectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

<label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contract Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Structural Steel Fabrication & Erection Contract"
                  value={contractForm.title}
                  onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contract Type</label>
                  <select
                    value={contractForm.contractType}
                    onChange={(e) => setContractForm({ ...contractForm, contractType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                  >
                    <option value="MECHANICAL">MECHANICAL</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="ELECTRICAL">ELECTRICAL</option>
                    <option value="PIPELINE">PIPELINE</option>
                    <option value="SERVICE">SERVICE</option>
                    <option value="LABOUR">LABOUR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contract Value *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={contractForm.contractValue}
                    onChange={(e) => setContractForm({ ...contractForm, contractValue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Currency *</label>
                  <select
                    required
                    value={contractForm.currency}
                    onChange={(e) => setContractForm({ ...contractForm, currency: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 font-bold"
                  >
                    <option value="">Select...</option>
                    {currencies.map((currency: any) => (
                      <option key={currency.id || currency.code} value={currency.code || currency.currencyCode}>
                        {currency.code || currency.currencyCode}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={contractForm.startDate}
                    onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={contractForm.endDate}
                    onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4 border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow"
                >
                  Generate Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Rating / Evaluation */}
      {isRatingModalOpen && selectedVendor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Vendor Evaluation: {selectedVendor.name}</h3>
              <button onClick={() => setIsRatingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRateVendor} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Quality Score (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={ratingForm.qualityRating}
                  onChange={(e) => setRatingForm({ ...ratingForm, qualityRating: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Delivery Lead Time Score (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={ratingForm.deliveryRating}
                  onChange={(e) => setRatingForm({ ...ratingForm, deliveryRating: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Auditor Comments</label>
                <textarea
                  rows={3}
                  value={ratingForm.comments}
                  onChange={(e) => setRatingForm({ ...ratingForm, comments: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-4 border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow"
                >
                  Submit Scorecard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Variation Order */}
      {isVariationModalOpen && selectedContract && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Issue Variation Order (VO)</h3>
              <button onClick={() => setIsVariationModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVariation} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">VO Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Additional Anti-Corrosion Coating Scope"
                  value={variationForm.title}
                  onChange={(e) => setVariationForm({ ...variationForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Variation Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the changed scope, reason and affected work."
                  value={variationForm.description}
                  onChange={(e) => setVariationForm({ ...variationForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Claimed Amount ({selectedContract.currency || 'currency'}) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={variationForm.amount}
                    onChange={(e) => setVariationForm({ ...variationForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Claimed Time Extension (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={variationForm.timeExtensionDays}
                    onChange={(e) => setVariationForm({ ...variationForm, timeExtensionDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>

                <input
                  value={variationForm.wbsId}
                  onChange={(e) => setVariationForm({ ...variationForm, wbsId: e.target.value })}
                  placeholder="WBS ID (optional)"
                  className="px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                />
                <input
                  value={variationForm.boqItemId}
                  onChange={(e) => setVariationForm({ ...variationForm, boqItemId: e.target.value })}
                  placeholder="BOQ Item ID (optional)"
                  className="px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                />
                <input
                  value={variationForm.costCodeId}
                  onChange={(e) => setVariationForm({ ...variationForm, costCodeId: e.target.value })}
                  placeholder="Cost Code ID (optional)"
                  className="px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                />
                <input
                  value={variationForm.changeEventReference}
                  onChange={(e) => setVariationForm({ ...variationForm, changeEventReference: e.target.value })}
                  placeholder="Change event reference"
                  className="px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                />
                <input
                  value={variationForm.clientReference}
                  onChange={(e) => setVariationForm({ ...variationForm, clientReference: e.target.value })}
                  placeholder="Client reference / instruction no."
                  className="px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                />
                <input
                  value={variationForm.justification}
                  onChange={(e) => setVariationForm({ ...variationForm, justification: e.target.value })}
                  placeholder="Justification"
                  className="px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-4 border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsVariationModalOpen(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow"
                >
                  Issue Variation Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
