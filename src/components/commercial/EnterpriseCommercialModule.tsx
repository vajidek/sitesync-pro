import React, { useState, useEffect } from 'react';
import { safeFetchJson } from '../../lib/safeFetch';
import {
  FileSpreadsheet,
  Briefcase,
  Layers,
  Calculator,
  Award,
  TrendingUp,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Building2,
  HardHat,
  Percent,
  Check,
  Calendar,
  FileCheck,
  FileText,
  Star
} from 'lucide-react';
import { DSPageHeader, DSButton, DSTabs, DSCard, DSSearchBox } from '../ui/design-system';

export const EnterpriseCommercialModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'tenders' | 'rateAnalysis' | 'subcontracts' | 'subcontractBills' | 'variations' | 'clientIPCs'
  >('overview');

  const [loading, setLoading] = useState(false);
  const [tenders, setTenders] = useState<any[]>([]);
  const [rateAnalyses, setRateAnalyses] = useState<any[]>([]);
  const [subcontracts, setSubcontracts] = useState<any[]>([]);
  const [subcontractBills, setSubcontractBills] = useState<any[]>([]);
  const [variations, setVariations] = useState<any[]>([]);
  const [clientIPCs, setClientIPCs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isNewTenderModalOpen, setIsNewTenderModalOpen] = useState(false);
  const [isNewRateAnalysisModalOpen, setIsNewRateAnalysisModalOpen] = useState(false);
  const [isNewSubcontractModalOpen, setIsNewSubcontractModalOpen] = useState(false);
  const [isNewBillModalOpen, setIsNewBillModalOpen] = useState(false);
  const [isNewVOModalOpen, setIsNewVOModalOpen] = useState(false);
  const [isNewIPCModalOpen, setIsNewIPCModalOpen] = useState(false);
  const [selectedTenderForAward, setSelectedTenderForAward] = useState<any | null>(null);
  const [loaNumber, setLoaNumber] = useState('');
  const [awardedValue, setAwardedValue] = useState(0);

  // Forms
  const [newTender, setNewTender] = useState({
    tenderRefNumber: '',
    tenderTitle: '',
    clientAuthority: '',
    clientType: 'GOVERNMENT',
    sector: 'WATER_SANITATION',
    tenderType: 'EPC_TURNKEY',
    estimatedProjectValue: 120000000,
    currency: 'INR',
    emdAmount: 2400000,
    tenderFee: 25000,
    emdMode: 'BANK_GUARANTEE',
    submissionDeadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    bidValidityDays: 120,
    technicalScoreThreshold: 75.0,
    expectedGrossMarginPercent: 15.0,
    bidManagerName: 'Abdul Vajid EK',
  });

  const [newAnalysis, setNewAnalysis] = useState({
    analysisCode: '',
    itemCode: 'BOQ-CIV-088',
    itemDescription: 'Reinforced Cement Concrete M30 in retaining walls including shuttering & curing',
    unit: 'cum',
    materialCostPerUnit: 4800,
    laborCostPerUnit: 750,
    machineryCostPerUnit: 420,
    subcontractCostPerUnit: 0,
    overheadPercent: 10.0,
    profitPercent: 12.0,
  });

  const [newSubcontract, setNewSubcontract] = useState({
    subcontractorName: '',
    projectId: 'p-101',
    projectName: 'Peruvannamuzhi Water Treatment Plant',
    packageTitle: 'Deep Rock Excavation and Pipeline Trenching',
    tradeCategory: 'PIPELINE_TRENCHING',
    contractType: 'ITEM_RATE_BOQ',
    contractValue: 15000000,
    retentionPercent: 5.0,
    mobilizationAdvancePercent: 10.0,
    mobilizationAdvancePaid: 1500000,
    startDate: new Date().toISOString().split('T')[0],
    completionDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
  });

  const [newBill, setNewBill] = useState({
    subcontractId: 'sub-001',
    subcontractNumber: 'SUB-2026-001',
    subcontractorName: 'Apex GeoTech & Earthmovers LLP',
    billNumber: 'RA-04',
    billPeriodStart: '2026-09-01',
    billPeriodEnd: '2026-09-15',
    grossClaimedAmount: 1800000,
    certifiedAmount: 1750000,
    retentionPercent: 5.0,
    mobilizationRecovery: 175000,
    otherDeductions: 0,
    remarks: 'Joint site measurement verified for Chainage 1+450 to 2+100',
  });

  const [newVO, setNewVO] = useState({
    projectId: 'p-101',
    projectName: 'Peruvannamuzhi Water Treatment Plant',
    voNumber: '',
    title: '',
    scopeDescription: '',
    variationType: 'ADDITION',
    claimedAmount: 1500000,
    timeExtensionDays: 15,
    impactOnCriticalPath: false,
    clientReference: '',
  });

  const [newIPC, setNewIPC] = useState({
    projectId: 'p-101',
    projectName: 'Peruvannamuzhi Water Treatment Plant',
    ipcNumber: 'IPC-07',
    billingPeriod: 'September 2026',
    grossWorkDoneClaimed: 25000000,
    grossWorkDoneCertified: 24500000,
    materialsOnSiteValue: 3500000,
    retentionDeduction: 1225000,
    mobilizationRecovery: 2450000,
    statutoryTDS: 490000,
  });

  const fetchCommercialData = async () => {
    setLoading(true);
    try {
      const [tRes, rRes, sRes, bRes, vRes, iRes] = await Promise.all([
        safeFetchJson('/api/commercial/tenders'),
        safeFetchJson('/api/commercial/rate-analyses'),
        safeFetchJson('/api/commercial/subcontracts'),
        safeFetchJson('/api/commercial/subcontract-bills'),
        safeFetchJson('/api/commercial/variations'),
        safeFetchJson('/api/commercial/client-ipcs'),
      ]);

      if (tRes?.success && Array.isArray(tRes.data)) setTenders(tRes.data);
      if (rRes?.success && Array.isArray(rRes.data)) setRateAnalyses(rRes.data);
      if (sRes?.success && Array.isArray(sRes.data)) setSubcontracts(sRes.data);
      if (bRes?.success && Array.isArray(bRes.data)) setSubcontractBills(bRes.data);
      if (vRes?.success && Array.isArray(vRes.data)) setVariations(vRes.data);
      if (iRes?.success && Array.isArray(iRes.data)) setClientIPCs(iRes.data);
    } catch (err) {
      console.error('Error fetching commercial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommercialData();
  }, []);

  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await safeFetchJson('/api/commercial/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTender),
      });
      if (res?.success) {
        setIsNewTenderModalOpen(false);
        fetchCommercialData();
      }
    } catch (err) {
      console.error('Error creating tender:', err);
    }
  };

  const handleAwardTender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenderForAward) return;
    try {
      await safeFetchJson(`/api/commercial/tenders/${selectedTenderForAward.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'AWARDED',
          quotedBidAmount: awardedValue || selectedTenderForAward.quotedBidAmount,
          awardDetails: {
            letterOfAcceptanceNumber: loaNumber,
            awardedValue: awardedValue || selectedTenderForAward.quotedBidAmount,
            awardDate: new Date().toISOString().split('T')[0],
          },
        }),
      });
      setSelectedTenderForAward(null);
      fetchCommercialData();
    } catch (err) {
      console.error('Error updating tender award:', err);
    }
  };

  const handleCreateRateAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await safeFetchJson('/api/commercial/rate-analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAnalysis,
          materialCostPerUnit: Number(newAnalysis.materialCostPerUnit),
          laborCostPerUnit: Number(newAnalysis.laborCostPerUnit),
          machineryCostPerUnit: Number(newAnalysis.machineryCostPerUnit),
          subcontractCostPerUnit: Number(newAnalysis.subcontractCostPerUnit),
          overheadPercent: Number(newAnalysis.overheadPercent),
          profitPercent: Number(newAnalysis.profitPercent),
        }),
      });
      if (res?.success) {
        setIsNewRateAnalysisModalOpen(false);
        fetchCommercialData();
      }
    } catch (err) {
      console.error('Error creating rate analysis:', err);
    }
  };

  const handleCreateSubcontract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await safeFetchJson('/api/commercial/subcontracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSubcontract,
          contractValue: Number(newSubcontract.contractValue),
          retentionPercent: Number(newSubcontract.retentionPercent),
          mobilizationAdvancePaid: Number(newSubcontract.mobilizationAdvancePaid),
        }),
      });
      if (res?.success) {
        setIsNewSubcontractModalOpen(false);
        fetchCommercialData();
      }
    } catch (err) {
      console.error('Error creating subcontract:', err);
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await safeFetchJson('/api/commercial/subcontract-bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBill,
          grossClaimedAmount: Number(newBill.grossClaimedAmount),
          certifiedAmount: Number(newBill.certifiedAmount),
          retentionPercent: Number(newBill.retentionPercent),
          mobilizationRecovery: Number(newBill.mobilizationRecovery),
          otherDeductions: Number(newBill.otherDeductions),
        }),
      });
      if (res?.success) {
        setIsNewBillModalOpen(false);
        fetchCommercialData();
      }
    } catch (err) {
      console.error('Error creating subcontract bill:', err);
    }
  };

  const handleCertifyBill = async (billId: string, currentCertified: number) => {
    try {
      const res = await safeFetchJson(`/api/commercial/subcontract-bills/${billId}/certify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certifiedAmount: currentCertified,
          status: 'APPROVED_FOR_PAYMENT',
        }),
      });
      if (res?.success) {
        fetchCommercialData();
      }
    } catch (err) {
      console.error('Error certifying bill:', err);
    }
  };

  const handleCreateVO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await safeFetchJson('/api/commercial/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newVO,
          claimedAmount: Number(newVO.claimedAmount),
          timeExtensionDays: Number(newVO.timeExtensionDays),
        }),
      });
      if (res?.success) {
        setIsNewVOModalOpen(false);
        fetchCommercialData();
      }
    } catch (err) {
      console.error('Error creating variation:', err);
    }
  };

  const handleUpdateVOStatus = async (voId: string, status: string, approvedAmount?: number) => {
    try {
      const res = await safeFetchJson(`/api/commercial/variations/${voId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approvedAmount }),
      });
      if (res?.success) {
        fetchCommercialData();
      }
    } catch (err) {
      console.error('Error updating variation status:', err);
    }
  };

  const handleCreateIPC = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await safeFetchJson('/api/commercial/client-ipcs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newIPC,
          grossWorkDoneClaimed: Number(newIPC.grossWorkDoneClaimed),
          grossWorkDoneCertified: Number(newIPC.grossWorkDoneCertified),
          materialsOnSiteValue: Number(newIPC.materialsOnSiteValue),
          retentionDeduction: Number(newIPC.retentionDeduction),
          mobilizationRecovery: Number(newIPC.mobilizationRecovery),
          statutoryTDS: Number(newIPC.statutoryTDS),
        }),
      });
      if (res?.success) {
        setIsNewIPCModalOpen(false);
        fetchCommercialData();
      }
    } catch (err) {
      console.error('Error creating IPC:', err);
    }
  };

  const handleCertifyIPC = async (ipcId: string, certifiedAmount: number) => {
    try {
      const res = await safeFetchJson(`/api/commercial/client-ipcs/${ipcId}/certify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certifiedAmount, status: 'CERTIFIED' }),
      });
      if (res?.success) {
        fetchCommercialData();
      }
    } catch (err) {
      console.error('Error certifying IPC:', err);
    }
  };

  // KPIs
  const totalTenderPipeline = tenders.reduce((sum, t) => sum + (Number(t.estimatedProjectValue) || 0), 0);
  const awardedContractsValue = tenders
    .filter((t) => t.status === 'AWARDED')
    .reduce((sum, t) => sum + (Number(t.quotedBidAmount || t.estimatedProjectValue) || 0), 0);
  const totalSubcontractsValue = subcontracts.reduce((sum, s) => sum + (Number(s.contractValue) || 0), 0);
  const totalRetentionHeld = subcontracts.reduce((sum, s) => sum + (Number(s.totalRetentionWithheld) || 0), 0);
  const totalSubcontractCertified = subcontractBills
    .filter((b) => b.status === 'CERTIFIED' || b.status === 'APPROVED_FOR_PAYMENT' || b.status === 'PAID')
    .reduce((sum, b) => sum + (Number(b.certifiedAmount) || 0), 0);
  const totalApprovedVariations = variations
    .filter((v) => v.status === 'ENGINEER_APPROVED' || v.status === 'FORMALLY_INCORPORATED')
    .reduce((sum, v) => sum + (Number(v.approvedAmount) || 0), 0);
  const totalClientIPCCertified = clientIPCs
    .filter((i) => i.status === 'CERTIFIED' || i.status === 'PAYMENT_RECEIVED')
    .reduce((sum, i) => sum + (Number(i.grossWorkDoneCertified) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <DSPageHeader
        title="Commercial, Tendering & Subcontract Lifecycle"
        description="Public and private tender bidding pipeline, direct BOQ rate analysis & margin simulation, and specialist subcontract agreement management"
        breadcrumbs={[{ label: 'ERP' }, { label: 'Commercial' }, { label: 'Tenders & Bidding' }]}
        actions={
          <div className="flex items-center gap-2">
            <DSButton variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5 text-blue-600" />} onClick={fetchCommercialData}>
              Refresh
            </DSButton>
            {activeSubTab === 'tenders' && (
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewTenderModalOpen(true)}>
                Register New Tender
              </DSButton>
            )}
            {activeSubTab === 'rateAnalysis' && (
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewRateAnalysisModalOpen(true)}>
                Build Rate Analysis
              </DSButton>
            )}
            {activeSubTab === 'subcontracts' && (
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewSubcontractModalOpen(true)}>
                Execute Subcontract
              </DSButton>
            )}
            {activeSubTab === 'subcontractBills' && (
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewBillModalOpen(true)}>
                Record RA Bill
              </DSButton>
            )}
            {activeSubTab === 'variations' && (
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewVOModalOpen(true)}>
                New Variation Order
              </DSButton>
            )}
            {activeSubTab === 'clientIPCs' && (
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewIPCModalOpen(true)}>
                Create Client IPC
              </DSButton>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <DSTabs
        activeTab={activeSubTab}
        onChange={(id) => setActiveSubTab(id as any)}
        tabs={[
          { id: 'overview', label: 'Commercial Pipeline & Backlog', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'tenders', label: `Tenders & Bidding (${tenders.length})`, icon: <Award className="w-4 h-4 text-indigo-500" /> },
          { id: 'rateAnalysis', label: `Rate Analysis & Costing (${rateAnalyses.length})`, icon: <Calculator className="w-4 h-4 text-emerald-500" /> },
          { id: 'subcontracts', label: `Subcontract Agreements (${subcontracts.length})`, icon: <Briefcase className="w-4 h-4 text-cyan-500" /> },
          { id: 'subcontractBills', label: `Subcontract RA Bills (${subcontractBills.length})`, icon: <FileCheck className="w-4 h-4 text-amber-500" /> },
          { id: 'variations', label: `Variations & Claims (${variations.length})`, icon: <Layers className="w-4 h-4 text-purple-500" /> },
          { id: 'clientIPCs', label: `Client IPC Billing (${clientIPCs.length})`, icon: <FileText className="w-4 h-4 text-blue-500" /> },
        ]}
      />

      {/* 1. OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DSCard className="p-4 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Tender Bid Pipeline</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{(totalTenderPipeline / 10000000).toFixed(1)} Cr</h3>
                  <p className="text-xs text-gray-500 mt-1">{tenders.length} active public/private tenders</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </DSCard>

            <DSCard className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Awarded Order Backlog</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{(awardedContractsValue / 10000000).toFixed(1)} Cr</h3>
                  <p className="text-xs text-gray-500 mt-1">Active execution contracts</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </DSCard>

            <DSCard className="p-4 bg-gradient-to-br from-cyan-50 to-white border-cyan-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-cyan-600 uppercase tracking-wider">Subcontract Commitments</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{(totalSubcontractsValue / 10000000).toFixed(1)} Cr</h3>
                  <p className="text-xs text-gray-500 mt-1">{subcontracts.length} active trade packages</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
            </DSCard>

            <DSCard className="p-4 bg-gradient-to-br from-amber-50 to-white border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Retention Money Withheld</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{(totalRetentionHeld / 100000).toFixed(1)} Lakh</h3>
                  <p className="text-xs text-gray-500 mt-1">Defect liability security held</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </DSCard>
          </div>

          {/* Quick Monitoring Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Tenders In Bidding */}
            <DSCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Key Tenders Currently in Estimation & Bidding
                </h4>
                <DSButton variant="ghost" size="sm" onClick={() => setActiveSubTab('tenders')}>
                  All Tenders &rarr;
                </DSButton>
              </div>
              <div className="space-y-3">
                {tenders.slice(0, 3).map((tnd) => (
                  <div key={tnd.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{tnd.tenderRefNumber}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold">{tnd.sector.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium mt-1 truncate max-w-md">{tnd.tenderTitle}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{tnd.clientAuthority} &bull; Deadline: {tnd.submissionDeadline}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-900">₹{(tnd.estimatedProjectValue / 10000000).toFixed(1)} Cr</div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        tnd.status === 'AWARDED' ? 'bg-emerald-100 text-emerald-800' :
                        tnd.status === 'BID_SUBMITTED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {tnd.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DSCard>

            {/* Active Specialist Subcontracts */}
            <DSCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-cyan-600" />
                  High-Value Subcontract Execution Packages
                </h4>
                <DSButton variant="ghost" size="sm" onClick={() => setActiveSubTab('subcontracts')}>
                  All Subcontracts &rarr;
                </DSButton>
              </div>
              <div className="space-y-3">
                {subcontracts.slice(0, 3).map((sub) => (
                  <div key={sub.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{sub.subcontractorName}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-cyan-100 text-cyan-700 font-mono font-medium">{sub.agreementNumber}</span>
                      </div>
                      <p className="text-xs text-gray-700 mt-0.5">{sub.packageTitle}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Project: {sub.projectName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-900">₹{(sub.contractValue / 10000000).toFixed(2)} Cr</div>
                      <div className="flex items-center justify-end gap-1 text-amber-500 text-xs mt-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="font-semibold text-gray-700">{sub.performanceRating} / 5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DSCard>
          </div>
        </div>
      )}

      {/* 2. TENDERS & ESTIMATION TAB */}
      {activeSubTab === 'tenders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="w-full sm:w-80">
              <DSSearchBox
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tender ref, title, client authority..."
              />
            </div>
            <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewTenderModalOpen(true)}>
              Register New Tender
            </DSButton>
          </div>

          <div className="space-y-4">
            {tenders
              .filter((t) =>
                t.tenderRefNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.tenderTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.clientAuthority.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((tender) => (
                <DSCard key={tender.id} className="p-5 border border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {tender.tenderRefNumber}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                          {tender.sector.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                          {tender.tenderType.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          tender.status === 'AWARDED' ? 'bg-emerald-100 text-emerald-800' :
                          tender.status === 'BID_SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                          tender.status === 'UNDER_MANAGEMENT_REVIEW' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tender.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-base mt-2">{tender.tenderTitle}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Client: <strong className="text-gray-700">{tender.clientAuthority}</strong> &bull; Bid Manager: {tender.bidManagerName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">Est. Project Value</span>
                      <strong className="text-base font-bold text-gray-900">
                        {tender.currency} {(tender.estimatedProjectValue / 10000000).toFixed(2)} Cr
                      </strong>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Target Margin: <strong className="text-emerald-600">{tender.expectedGrossMarginPercent}%</strong>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-xs">
                    <div>
                      <span className="text-gray-400 block">EMD / Bid Security</span>
                      <strong className="text-gray-900">{tender.currency} {Number(tender.emdAmount).toLocaleString()}</strong>
                      <span className="text-gray-500 block text-[11px]">{tender.emdMode.replace(/_/g, ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Submission Deadline</span>
                      <strong className="text-rose-600">{tender.submissionDeadline}</strong>
                      <span className="text-gray-500 block text-[11px]">Validity: {tender.bidValidityDays} Days</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Technical Score Threshold</span>
                      <strong className="text-gray-900">{tender.technicalScoreThreshold} / 100 Min</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Quoted Bid Amount</span>
                      <strong className="text-gray-900">
                        {tender.quotedBidAmount ? `${tender.currency} ${(tender.quotedBidAmount / 10000000).toFixed(2)} Cr` : 'Pending Estimation'}
                      </strong>
                    </div>
                  </div>

                  {tender.awardDetails && (
                    <div className="mt-3 p-3 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                      <div>
                        <strong>Awarded via Letter of Acceptance (LoA):</strong> {tender.awardDetails.letterOfAcceptanceNumber}
                        <span className="block text-emerald-700">Contract Value: ₹{(tender.awardDetails.awardedValue / 10000000).toFixed(2)} Cr</span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-emerald-200 text-emerald-900 font-bold text-xs">
                        CONTRACT ACTIVE
                      </span>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {tender.documents?.length || 0} Tender Documents & Addenda Attached
                    </span>
                    <div className="flex items-center gap-2">
                      {tender.status !== 'AWARDED' && (
                        <DSButton
                          variant="primary"
                          size="xs"
                          onClick={() => {
                            setSelectedTenderForAward(tender);
                            setAwardedValue(tender.quotedBidAmount || tender.estimatedProjectValue);
                            setLoaNumber(`LOA-${tender.tenderRefNumber}`);
                          }}
                        >
                          Mark as Awarded (LoA)
                        </DSButton>
                      )}
                    </div>
                  </div>
                </DSCard>
              ))}
          </div>
        </div>
      )}

      {/* 3. RATE ANALYSIS & COST ESTIMATION */}
      {activeSubTab === 'rateAnalysis' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-base">Direct BOQ Rate Analysis & Costing Engine</h4>
              <p className="text-xs text-gray-500">Breakdown of Material, Labor, Plant/Equipment, Overhead % and Profit Margin</p>
            </div>
            <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewRateAnalysisModalOpen(true)}>
              Build Rate Analysis
            </DSButton>
          </div>

          <div className="space-y-4">
            {rateAnalyses.map((ra) => (
              <DSCard key={ra.id} className="p-5 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        {ra.analysisCode}
                      </span>
                      <span className="font-mono text-xs text-gray-500">Item: {ra.itemCode}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium uppercase">
                        Per {ra.unit}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mt-1.5">{ra.itemDescription}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Quoted Selling Rate</span>
                    <strong className="text-lg font-bold text-emerald-700">
                      ₹{ra.quotedRatePerUnit.toLocaleString()} / {ra.unit}
                    </strong>
                    <div className="text-xs text-gray-500">Net Direct Cost: ₹{ra.netRatePerUnit.toLocaleString()}</div>
                  </div>
                </div>

                {/* Breakdown cost cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                  <div className="p-2 bg-gray-50 rounded border border-gray-100">
                    <span className="text-gray-500 block">Material Cost</span>
                    <strong className="text-gray-900">₹{ra.materialCostPerUnit.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border border-gray-100">
                    <span className="text-gray-500 block">Labor & Rigging</span>
                    <strong className="text-gray-900">₹{ra.laborCostPerUnit.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border border-gray-100">
                    <span className="text-gray-500 block">Machinery & Plant</span>
                    <strong className="text-gray-900">₹{ra.machineryCostPerUnit.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
                    <span className="text-emerald-700 block">Overhead & Profit</span>
                    <strong className="text-emerald-900">{ra.overheadPercent}% OH + {ra.profitPercent}% Margin</strong>
                  </div>
                </div>

                {/* Components breakdown table */}
                {Array.isArray(ra.componentsBreakdown) && ra.componentsBreakdown.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Detailed Component Gang Rates</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-gray-600">
                        <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
                          <tr>
                            <th className="p-2">Component Description</th>
                            <th className="p-2">Qty</th>
                            <th className="p-2">Unit</th>
                            <th className="p-2">Rate (₹)</th>
                            <th className="p-2 text-right">Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {ra.componentsBreakdown.map((c: any, i: number) => (
                            <tr key={i}>
                              <td className="p-2 text-gray-900">{c.description}</td>
                              <td className="p-2">{c.qty}</td>
                              <td className="p-2">{c.unit}</td>
                              <td className="p-2">₹{c.rate.toLocaleString()}</td>
                              <td className="p-2 text-right font-medium text-gray-900">₹{c.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </DSCard>
            ))}
          </div>
        </div>
      )}

      {/* 4. SUBCONTRACTS TAB */}
      {activeSubTab === 'subcontracts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-base">Specialist Subcontract Agreements & Retentions</h4>
              <p className="text-xs text-gray-500">Contract packages, advance mobilization recovery, cumulative certified bills and retention tracking</p>
            </div>
            <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewSubcontractModalOpen(true)}>
              Execute Subcontract Agreement
            </DSButton>
          </div>

          <DSCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Agreement & Package</th>
                    <th className="px-4 py-3">Subcontractor</th>
                    <th className="px-4 py-3">Trade & Project</th>
                    <th className="px-4 py-3">Contract Value</th>
                    <th className="px-4 py-3">Certified & Paid</th>
                    <th className="px-4 py-3">Retention Held</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subcontracts.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-medium text-gray-900">{sub.agreementNumber}</span>
                        <div className="text-xs font-medium text-gray-800 mt-0.5">{sub.packageTitle}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{sub.subcontractorName}</div>
                        <div className="text-xs text-gray-400 font-mono">Code: {sub.subcontractorCode}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                          {sub.tradeCategory.replace(/_/g, ' ')}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">{sub.projectName}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        ₹{(sub.contractValue / 10000000).toFixed(2)} Cr
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div>Certified: <strong className="text-gray-900">₹{(sub.totalCertifiedAmount / 10000000).toFixed(2)} Cr</strong></div>
                        <div className="text-gray-500">Paid: ₹{(sub.totalPaidAmount / 10000000).toFixed(2)} Cr</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="font-bold text-amber-700">₹{(sub.totalRetentionWithheld / 100000).toFixed(1)} L</span>
                        <div className="text-gray-400 text-[11px]">({sub.retentionPercent}%)</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{sub.performanceRating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          sub.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                          sub.status === 'SUBSTANTIALLY_COMPLETE' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {sub.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DSCard>
        </div>
      )}

      {/* 5. SUBCONTRACT RA BILLS TAB */}
      {activeSubTab === 'subcontractBills' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DSCard className="p-4 bg-white border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Claims Submitted</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                ₹{(subcontractBills.reduce((acc, b) => acc + (b.grossClaimedAmount || 0), 0) / 100000).toFixed(1)} L
              </h3>
              <p className="text-xs text-gray-400 mt-1">{subcontractBills.length} progressive RA bills</p>
            </DSCard>
            <DSCard className="p-4 bg-white border-gray-200">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Certified Payable</p>
              <h3 className="text-xl font-bold text-emerald-700 mt-1">
                ₹{(subcontractBills.reduce((acc, b) => acc + (b.netCertifiedPayable || 0), 0) / 100000).toFixed(1)} L
              </h3>
              <p className="text-xs text-emerald-600 mt-1">Net post all recoveries</p>
            </DSCard>
            <DSCard className="p-4 bg-white border-gray-200">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Retention Withheld</p>
              <h3 className="text-xl font-bold text-amber-700 mt-1">
                ₹{(subcontractBills.reduce((acc, b) => acc + (b.retentionAmount || 0), 0) / 100000).toFixed(1)} L
              </h3>
              <p className="text-xs text-amber-600 mt-1">Standard 5.0% contract retention</p>
            </DSCard>
            <DSCard className="p-4 bg-white border-gray-200">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Mobilization Recovered</p>
              <h3 className="text-xl font-bold text-indigo-700 mt-1">
                ₹{(subcontractBills.reduce((acc, b) => acc + (b.mobilizationRecovery || 0), 0) / 100000).toFixed(1)} L
              </h3>
              <p className="text-xs text-indigo-600 mt-1">10% progressive deduction</p>
            </DSCard>
          </div>

          <DSCard className="overflow-hidden border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Subcontractor Running Account (RA) Certification Register</h4>
                <p className="text-xs text-gray-500 mt-0.5">Measurement reconciliation, retention withholding & mobilization advance recovery</p>
              </div>
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewBillModalOpen(true)}>
                Record New RA Bill
              </DSButton>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
                    <th className="px-4 py-3">Bill Ref & Subcontract</th>
                    <th className="px-4 py-3">Subcontractor Partner</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Gross Claimed</th>
                    <th className="px-4 py-3">Certified Amount</th>
                    <th className="px-4 py-3">Deductions (Ret / Adv)</th>
                    <th className="px-4 py-3">Net Certified Payable</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subcontractBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-xs text-gray-900">{bill.billNumber}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{bill.subcontractNumber}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-xs text-gray-900">{bill.subcontractorName}</div>
                        {bill.remarks && <div className="text-[11px] text-gray-500 line-clamp-1">{bill.remarks}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {bill.billPeriodStart} to {bill.billPeriodEnd}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-700">
                        ₹{Number(bill.grossClaimedAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-900">
                        ₹{Number(bill.certifiedAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        <span className="text-amber-700">Ret: ₹{Number(bill.retentionAmount).toLocaleString('en-IN')}</span>
                        <div className="text-indigo-700 text-[11px]">Adv: ₹{Number(bill.mobilizationRecovery).toLocaleString('en-IN')}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-emerald-700">
                        ₹{Number(bill.netCertifiedPayable).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          bill.status === 'APPROVED_FOR_PAYMENT' || bill.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bill.status === 'CERTIFIED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {bill.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {bill.status !== 'APPROVED_FOR_PAYMENT' && bill.status !== 'PAID' ? (
                          <DSButton
                            variant="outline"
                            size="sm"
                            leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                            onClick={() => handleCertifyBill(bill.id, bill.certifiedAmount || bill.grossClaimedAmount)}
                          >
                            Certify
                          </DSButton>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Passed to AP
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DSCard>
        </div>
      )}

      {/* 6. VARIATION ORDERS & CLAIMS TAB */}
      {activeSubTab === 'variations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DSCard className="p-4 bg-white border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Variations Logged</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{variations.length} Orders</h3>
              <p className="text-xs text-gray-400 mt-1">Scope changes & extra items</p>
            </DSCard>
            <DSCard className="p-4 bg-white border-gray-200">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Total Claimed Value</p>
              <h3 className="text-xl font-bold text-purple-700 mt-1">
                ₹{(variations.reduce((acc, v) => acc + (v.claimedAmount || 0), 0) / 100000).toFixed(1)} L
              </h3>
              <p className="text-xs text-purple-600 mt-1">Submitted contractor claims</p>
            </DSCard>
            <DSCard className="p-4 bg-white border-gray-200">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Approved VO Value</p>
              <h3 className="text-xl font-bold text-emerald-700 mt-1">
                ₹{(totalApprovedVariations / 100000).toFixed(1)} L
              </h3>
              <p className="text-xs text-emerald-600 mt-1">Incorporated in revised contract</p>
            </DSCard>
            <DSCard className="p-4 bg-white border-gray-200">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Extension of Time (EOT)</p>
              <h3 className="text-xl font-bold text-blue-700 mt-1">
                {variations.reduce((acc, v) => acc + (v.timeExtensionDays || 0), 0)} Days
              </h3>
              <p className="text-xs text-blue-600 mt-1">Critical path program adjustments</p>
            </DSCard>
          </div>

          <DSCard className="overflow-hidden border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Contract Variation & Extra Items Register</h4>
                <p className="text-xs text-gray-500 mt-0.5">Formal client approval tracking, rate revisions, time extensions & critical path impacts</p>
              </div>
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewVOModalOpen(true)}>
                Record Variation Order
              </DSButton>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
                    <th className="px-4 py-3">VO Number & Project</th>
                    <th className="px-4 py-3">Title & Scope Details</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Claimed Value</th>
                    <th className="px-4 py-3">Approved Value</th>
                    <th className="px-4 py-3">EOT (Days)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {variations.map((vo) => (
                    <tr key={vo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-xs text-gray-900">{vo.voNumber}</div>
                        <div className="text-[11px] text-gray-500">{vo.projectName}</div>
                        {vo.clientReference && <div className="text-[10px] text-gray-400 font-mono">Ref: {vo.clientReference}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-xs text-gray-900">{vo.title}</div>
                        <div className="text-[11px] text-gray-500 line-clamp-2">{vo.scopeDescription}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono font-medium">
                          {vo.variationType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-700">
                        ₹{Number(vo.claimedAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-emerald-700">
                        {vo.approvedAmount ? `₹${Number(vo.approvedAmount).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="font-semibold text-gray-800">+{vo.timeExtensionDays} d</span>
                        {vo.impactOnCriticalPath && (
                          <span className="ml-1 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">CP</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          vo.status === 'FORMALLY_INCORPORATED' || vo.status === 'ENGINEER_APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : vo.status === 'CLIENT_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vo.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {vo.status === 'CLIENT_REVIEW' || vo.status === 'SUBMITTED' ? (
                          <DSButton
                            variant="outline"
                            size="sm"
                            leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                            onClick={() => handleUpdateVOStatus(vo.id, 'ENGINEER_APPROVED', vo.claimedAmount)}
                          >
                            Approve VO
                          </DSButton>
                        ) : vo.status === 'ENGINEER_APPROVED' ? (
                          <DSButton
                            variant="outline"
                            size="sm"
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                            onClick={() => handleUpdateVOStatus(vo.id, 'FORMALLY_INCORPORATED')}
                          >
                            Incorporate
                          </DSButton>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium">In Contract</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DSCard>
        </div>
      )}

      {/* 7. CLIENT INTERIM PAYMENT CERTIFICATES (IPC) TAB */}
      {activeSubTab === 'clientIPCs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DSCard className="p-4 bg-white border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Work Done Certified</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                ₹{(totalClientIPCCertified / 10000000).toFixed(2)} Cr
              </h3>
              <p className="text-xs text-gray-400 mt-1">Engineer certified value</p>
            </DSCard>
            <DSCard className="p-4 bg-white border-gray-200">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Net Receivable Invoiced</p>
              <h3 className="text-xl font-bold text-emerald-700 mt-1">
                ₹{(clientIPCs.reduce((acc, i) => acc + (i.netReceivableAmount || 0), 0) / 10000000).toFixed(2)} Cr
              </h3>
              <p className="text-xs text-emerald-600 mt-1">Post client deductions</p>
            </DSCard>
            <DSCard className="p-4 bg-white border-gray-200">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Client Retention Retained</p>
              <h3 className="text-xl font-bold text-amber-700 mt-1">
                ₹{(clientIPCs.reduce((acc, i) => acc + (i.retentionDeduction || 0), 0) / 100000).toFixed(1)} L
              </h3>
              <p className="text-xs text-amber-600 mt-1">Release upon DLP expiration</p>
            </DSCard>
            <DSCard className="p-4 bg-white border-gray-200">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Materials On Site (MOS)</p>
              <h3 className="text-xl font-bold text-blue-700 mt-1">
                ₹{(clientIPCs.reduce((acc, i) => acc + (i.materialsOnSiteValue || 0), 0) / 100000).toFixed(1)} L
              </h3>
              <p className="text-xs text-blue-600 mt-1">Secured advance on site stock</p>
            </DSCard>
          </div>

          <DSCard className="overflow-hidden border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Client Interim Payment Certificate (IPC) Register</h4>
                <p className="text-xs text-gray-500 mt-0.5">Government & client billing cycle, consultant certification, statutory TDS & net receivables</p>
              </div>
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewIPCModalOpen(true)}>
                Generate New IPC
              </DSButton>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
                    <th className="px-4 py-3">IPC Number & Project</th>
                    <th className="px-4 py-3">Billing Cycle</th>
                    <th className="px-4 py-3">Gross Claimed</th>
                    <th className="px-4 py-3">Gross Certified</th>
                    <th className="px-4 py-3">Materials On Site</th>
                    <th className="px-4 py-3">Deductions (Ret / Adv / TDS)</th>
                    <th className="px-4 py-3">Net Receivable</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clientIPCs.map((ipc) => (
                    <tr key={ipc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-xs text-gray-900">{ipc.ipcNumber}</div>
                        <div className="text-[11px] text-gray-500">{ipc.projectName}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        <div className="font-medium">{ipc.billingPeriod}</div>
                        <div className="text-[10px] text-gray-400">Due: {ipc.dueDate || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-700">
                        ₹{(ipc.grossWorkDoneClaimed / 100000).toFixed(1)} L
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-900">
                        ₹{(ipc.grossWorkDoneCertified / 100000).toFixed(1)} L
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-blue-700">
                        ₹{(ipc.materialsOnSiteValue / 100000).toFixed(1)} L
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-600">
                        <div>Ret: ₹{(ipc.retentionDeduction / 100000).toFixed(1)} L</div>
                        <div>Adv: ₹{(ipc.mobilizationRecovery / 100000).toFixed(1)} L</div>
                        <div>TDS: ₹{(ipc.statutoryTDS / 100000).toFixed(1)} L</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-emerald-700">
                        ₹{(ipc.netReceivableAmount / 100000).toFixed(1)} L
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          ipc.status === 'PAYMENT_RECEIVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ipc.status === 'CERTIFIED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ipc.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {ipc.status !== 'CERTIFIED' && ipc.status !== 'PAYMENT_RECEIVED' ? (
                          <DSButton
                            variant="outline"
                            size="sm"
                            leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                            onClick={() => handleCertifyIPC(ipc.id, ipc.grossWorkDoneCertified || ipc.grossWorkDoneClaimed)}
                          >
                            Certify IPC
                          </DSButton>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Booked to AR
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DSCard>
        </div>
      )}

      {/* --- MODAL 1: REGISTER TENDER --- */}
      {isNewTenderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Register Commercial Tender</h3>
              <button onClick={() => setIsNewTenderModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateTender} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tender Title *</label>
                <input
                  type="text"
                  required
                  value={newTender.tenderTitle}
                  onChange={(e) => setNewTender({ ...newTender, tenderTitle: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 6-Lane Elevated Expressway Corridor Construction"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Client Authority *</label>
                  <input
                    type="text"
                    required
                    value={newTender.clientAuthority}
                    onChange={(e) => setNewTender({ ...newTender, clientAuthority: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. NHAI / Ministry of Transport"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Infrastructure Sector</label>
                  <select
                    value={newTender.sector}
                    onChange={(e) => setNewTender({ ...newTender, sector: e.target.value as any })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="WATER_SANITATION">Water & Sanitation</option>
                    <option value="HIGHWAY_ROAD">Highways & Expressways</option>
                    <option value="METRO_RAIL">Metro Rail & Urban Transit</option>
                    <option value="COMMERCIAL_BUILDING">Commercial High-Rise</option>
                    <option value="POWER_ENERGY">Power & Transmission</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Estimated Value (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newTender.estimatedProjectValue}
                    onChange={(e) => setNewTender({ ...newTender, estimatedProjectValue: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">EMD Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newTender.emdAmount}
                    onChange={(e) => setNewTender({ ...newTender, emdAmount: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Submission Deadline *</label>
                  <input
                    type="date"
                    required
                    value={newTender.submissionDeadline}
                    onChange={(e) => setNewTender({ ...newTender, submissionDeadline: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Gross Margin (%)</label>
                  <input
                    type="number"
                    value={newTender.expectedGrossMarginPercent}
                    onChange={(e) => setNewTender({ ...newTender, expectedGrossMarginPercent: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setIsNewTenderModalOpen(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Save Tender
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: MARK AWARDED (LOA) --- */}
      {selectedTenderForAward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Record Tender Award (LoA)</h3>
                <p className="text-xs text-gray-500">{selectedTenderForAward.tenderRefNumber}</p>
              </div>
              <button onClick={() => setSelectedTenderForAward(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleAwardTender} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Letter of Acceptance (LoA) Reference Number *</label>
                <input
                  type="text"
                  required
                  value={loaNumber}
                  onChange={(e) => setLoaNumber(e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Final Awarded Contract Value (INR) *</label>
                <input
                  type="number"
                  required
                  value={awardedValue}
                  onChange={(e) => setAwardedValue(Number(e.target.value))}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setSelectedTenderForAward(null)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Confirm Award & Add to Order Backlog
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: BUILD RATE ANALYSIS --- */}
      {isNewRateAnalysisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Build BOQ Rate Analysis</h3>
              <button onClick={() => setIsNewRateAnalysisModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateRateAnalysis} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Item Description *</label>
                <input
                  type="text"
                  required
                  value={newAnalysis.itemDescription}
                  onChange={(e) => setNewAnalysis({ ...newAnalysis, itemDescription: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Item Code</label>
                  <input
                    type="text"
                    value={newAnalysis.itemCode}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, itemCode: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    value={newAnalysis.unit}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, unit: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded"
                    placeholder="cum, rmt, MT, sqm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Material (₹)</label>
                  <input
                    type="number"
                    value={newAnalysis.materialCostPerUnit}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, materialCostPerUnit: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Labor (₹)</label>
                  <input
                    type="number"
                    value={newAnalysis.laborCostPerUnit}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, laborCostPerUnit: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Machinery (₹)</label>
                  <input
                    type="number"
                    value={newAnalysis.machineryCostPerUnit}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, machineryCostPerUnit: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Overhead (%)</label>
                  <input
                    type="number"
                    value={newAnalysis.overheadPercent}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, overheadPercent: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Profit Margin (%)</label>
                  <input
                    type="number"
                    value={newAnalysis.profitPercent}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, profitPercent: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setIsNewRateAnalysisModalOpen(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Compute Quoted Rate
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: EXECUTE SUBCONTRACT --- */}
      {isNewSubcontractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Execute Subcontract Agreement</h3>
              <button onClick={() => setIsNewSubcontractModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateSubcontract} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subcontractor Business Name *</label>
                <input
                  type="text"
                  required
                  value={newSubcontract.subcontractorName}
                  onChange={(e) => setNewSubcontract({ ...newSubcontract, subcontractorName: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Apex Civil Infra & Earthworks LLP"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Package Scope Title *</label>
                <input
                  type="text"
                  required
                  value={newSubcontract.packageTitle}
                  onChange={(e) => setNewSubcontract({ ...newSubcontract, packageTitle: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Trench Excavation, Shoring & Pipe Bedding"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contract Value (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newSubcontract.contractValue}
                    onChange={(e) => setNewSubcontract({ ...newSubcontract, contractValue: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Retention Withholding (%)</label>
                  <input
                    type="number"
                    value={newSubcontract.retentionPercent}
                    onChange={(e) => setNewSubcontract({ ...newSubcontract, retentionPercent: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setIsNewSubcontractModalOpen(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Execute Agreement
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: RECORD SUBCONTRACT RA BILL --- */}
      {isNewBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Record Subcontractor RA Bill</h3>
              <button onClick={() => setIsNewBillModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateBill} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subcontract Agreement *</label>
                <select
                  value={newBill.subcontractId}
                  onChange={(e) => {
                    const found = subcontracts.find((s) => s.id === e.target.value);
                    if (found) {
                      setNewBill({
                        ...newBill,
                        subcontractId: found.id,
                        subcontractNumber: found.agreementNumber,
                        subcontractorName: found.subcontractorName,
                        retentionPercent: found.retentionPercent || 5.0,
                      });
                    }
                  }}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  {subcontracts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.agreementNumber} — {s.subcontractorName} ({s.packageTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bill Reference (e.g. RA-04) *</label>
                  <input
                    type="text"
                    required
                    value={newBill.billNumber}
                    onChange={(e) => setNewBill({ ...newBill, billNumber: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gross Claimed Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newBill.grossClaimedAmount}
                    onChange={(e) => {
                      const gross = Number(e.target.value);
                      setNewBill({
                        ...newBill,
                        grossClaimedAmount: gross,
                        certifiedAmount: gross,
                        mobilizationRecovery: Math.round(gross * 0.10),
                      });
                    }}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Certified Work Value (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newBill.certifiedAmount}
                    onChange={(e) => setNewBill({ ...newBill, certifiedAmount: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Retention Withholding (%)</label>
                  <input
                    type="number"
                    value={newBill.retentionPercent}
                    onChange={(e) => setNewBill({ ...newBill, retentionPercent: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mobilization Recovery (INR)</label>
                  <input
                    type="number"
                    value={newBill.mobilizationRecovery}
                    onChange={(e) => setNewBill({ ...newBill, mobilizationRecovery: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Other Deductions (INR)</label>
                  <input
                    type="number"
                    value={newBill.otherDeductions}
                    onChange={(e) => setNewBill({ ...newBill, otherDeductions: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Joint Measurement Notes</label>
                <input
                  type="text"
                  value={newBill.remarks}
                  onChange={(e) => setNewBill({ ...newBill, remarks: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Verified with site engineer measurement sheet #12"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setIsNewBillModalOpen(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Record & Submit RA Bill
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 5: RECORD VARIATION ORDER --- */}
      {isNewVOModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Record Scope Variation Order</h3>
              <button onClick={() => setIsNewVOModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateVO} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Variation Title *</label>
                <input
                  type="text"
                  required
                  value={newVO.title}
                  onChange={(e) => setNewVO({ ...newVO, title: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Additional Dewatering and Sheet Piling for Submerged Trench"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Scope Description & Technical Justification *</label>
                <textarea
                  required
                  rows={3}
                  value={newVO.scopeDescription}
                  onChange={(e) => setNewVO({ ...newVO, scopeDescription: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Detailed engineering reasoning why this variation is required..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Variation Type</label>
                  <select
                    value={newVO.variationType}
                    onChange={(e) => setNewVO({ ...newVO, variationType: e.target.value as any })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ADDITION">Addition to BOQ Scope</option>
                    <option value="OMISSION">Omission / Reduction</option>
                    <option value="RATE_REVISION">BOQ Rate Revision</option>
                    <option value="NEW_ITEM">New Non-BOQ Item</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Claimed Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newVO.claimedAmount}
                    onChange={(e) => setNewVO({ ...newVO, claimedAmount: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Time Extension (Days)</label>
                  <input
                    type="number"
                    value={newVO.timeExtensionDays}
                    onChange={(e) => setNewVO({ ...newVO, timeExtensionDays: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Client Authority Reference</label>
                  <input
                    type="text"
                    value={newVO.clientReference}
                    onChange={(e) => setNewVO({ ...newVO, clientReference: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. KWA/TECH/VO-04"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setIsNewVOModalOpen(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Log Variation Claim
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 6: CREATE CLIENT IPC --- */}
      {isNewIPCModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Generate Client Interim Payment Certificate (IPC)</h3>
              <button onClick={() => setIsNewIPCModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateIPC} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">IPC Reference (e.g. IPC-07) *</label>
                  <input
                    type="text"
                    required
                    value={newIPC.ipcNumber}
                    onChange={(e) => setNewIPC({ ...newIPC, ipcNumber: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Billing Period / Month *</label>
                  <input
                    type="text"
                    required
                    value={newIPC.billingPeriod}
                    onChange={(e) => setNewIPC({ ...newIPC, billingPeriod: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. September 2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gross Claimed Value (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newIPC.grossWorkDoneClaimed}
                    onChange={(e) => {
                      const gross = Number(e.target.value);
                      setNewIPC({
                        ...newIPC,
                        grossWorkDoneClaimed: gross,
                        grossWorkDoneCertified: gross,
                        retentionDeduction: Math.round(gross * 0.05),
                        mobilizationRecovery: Math.round(gross * 0.10),
                        statutoryTDS: Math.round(gross * 0.02),
                      });
                    }}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gross Certified Value (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newIPC.grossWorkDoneCertified}
                    onChange={(e) => setNewIPC({ ...newIPC, grossWorkDoneCertified: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Materials on Site (MOS) Value (INR)</label>
                  <input
                    type="number"
                    value={newIPC.materialsOnSiteValue}
                    onChange={(e) => setNewIPC({ ...newIPC, materialsOnSiteValue: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Retention Deduction (5%)</label>
                  <input
                    type="number"
                    value={newIPC.retentionDeduction}
                    onChange={(e) => setNewIPC({ ...newIPC, retentionDeduction: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Advance Recovery (10%)</label>
                  <input
                    type="number"
                    value={newIPC.mobilizationRecovery}
                    onChange={(e) => setNewIPC({ ...newIPC, mobilizationRecovery: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Statutory TDS (2%)</label>
                  <input
                    type="number"
                    value={newIPC.statutoryTDS}
                    onChange={(e) => setNewIPC({ ...newIPC, statutoryTDS: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setIsNewIPCModalOpen(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Generate & Submit IPC
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
