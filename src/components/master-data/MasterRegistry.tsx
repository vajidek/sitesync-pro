// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - MASTER REGISTRY
// ============================================================================

import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Plus,
  ChevronRight,
  ShieldCheck,
  Award,
  History,
  GitBranch,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Edit,
  Tag,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  RefreshCw,
  Send,
} from 'lucide-react';
import {
  MasterDomainCode,
  MasterRecordItem,
  MasterRecordVersion,
  MasterDomainSummary,
  DataQualityEvaluationResult,
  DataLineageItem,
} from '../../api/master-data/master_data.types';

interface MasterRegistryProps {
  domains: MasterDomainSummary[];
  records: MasterRecordItem[];
  selectedDomainCode: MasterDomainCode | 'ALL';
  onSelectDomainCode: (domain: MasterDomainCode | 'ALL') => void;
  onRefresh: () => void;
  onCreateRecord: (data: any) => Promise<void>;
  onUpdateRecord: (id: string, data: any) => Promise<void>;
  onScanQuality: (id: string) => Promise<DataQualityEvaluationResult>;
  onFetchLineage: (id: string) => Promise<DataLineageItem | null>;
  onFetchVersions: (id: string) => Promise<MasterRecordVersion[]>;
  onSubmitChangeRequest: (data: any) => Promise<void>;
  isLoading: boolean;
}

export const MasterRegistry: React.FC<MasterRegistryProps> = ({
  domains,
  records,
  selectedDomainCode,
  onSelectDomainCode,
  onRefresh,
  onCreateRecord,
  onUpdateRecord,
  onScanQuality,
  onFetchLineage,
  onFetchVersions,
  onSubmitChangeRequest,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedQuality, setSelectedQuality] = useState<string>('ALL');
  const [activeRecord, setActiveRecord] = useState<MasterRecordItem | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<
    'overview' | 'attributes' | 'identifiers' | 'versions' | 'quality' | 'lineage' | 'change-request'
  >('overview');

  const [versions, setVersions] = useState<MasterRecordVersion[]>([]);
  const [lineage, setLineage] = useState<DataLineageItem | null>(null);
  const [qualityResult, setQualityResult] = useState<DataQualityEvaluationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  // New Record Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDomain, setNewDomain] = useState<MasterDomainCode>('VENDORS');
  const [newPrimaryName, setNewPrimaryName] = useState('');
  const [newSecondaryName, setNewSecondaryName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newSourceModule, setNewSourceModule] = useState('PROCUREMENT');
  const [newPayloadJson, setNewPayloadJson] = useState('{\n  "country": "UAE",\n  "city": "Dubai"\n}');
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Change Request Modal State
  const [crType, setCrType] = useState<any>('UPDATE_ATTRIBUTES');
  const [crReason, setCrReason] = useState('');
  const [crPayload, setCrPayload] = useState('{}');
  const [isSubmittingCr, setIsSubmittingCr] = useState(false);

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (selectedDomainCode !== 'ALL' && r.domainCode !== selectedDomainCode) return false;
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    if (selectedQuality !== 'ALL' && r.qualityClassification !== selectedQuality) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.primaryName.toLowerCase().includes(q);
      const matchCode = r.code.toLowerCase().includes(q);
      const matchCanonical = r.canonicalId.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchCanonical) return false;
    }
    return true;
  });

  const handleOpenRecordDrawer = async (record: MasterRecordItem) => {
    setActiveRecord(record);
    setActiveDrawerTab('overview');
    setIsDrawerLoading(true);
    try {
      const [vList, lData] = await Promise.all([
        onFetchVersions(record.id),
        onFetchLineage(record.id),
      ]);
      setVersions(vList || []);
      setLineage(lData);
      setCrPayload(JSON.stringify(record.dataPayload, null, 2));
    } catch (err) {
      console.error('Error fetching record details:', err);
    } finally {
      setIsDrawerLoading(false);
    }
  };

  const handleTriggerQualityScan = async () => {
    if (!activeRecord) return;
    setIsScanning(true);
    try {
      const res = await onScanQuality(activeRecord.id);
      setQualityResult(res);
      setActiveRecord({
        ...activeRecord,
        qualityScore: res.overallScore,
        qualityClassification: res.classification,
      });
    } catch (err) {
      console.error('Quality scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrimaryName.trim() || !newCode.trim()) return;
    setIsSubmittingCreate(true);
    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(newPayloadJson);
      } catch (err) {
        alert('Invalid JSON in record data payload.');
        setIsSubmittingCreate(false);
        return;
      }

      await onCreateRecord({
        domainCode: newDomain,
        entityType: newDomain.toLowerCase(),
        sourceModule: newSourceModule,
        sourceEntityId: `SRC-${newCode}`,
        primaryName: newPrimaryName,
        secondaryName: newSecondaryName || undefined,
        code: newCode,
        dataPayload: parsedPayload,
      });

      setIsCreateModalOpen(false);
      setNewPrimaryName('');
      setNewSecondaryName('');
      setNewCode('');
    } catch (err) {
      console.error('Failed to create record:', err);
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleSubmitCrForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecord || !crReason.trim()) return;
    setIsSubmittingCr(true);
    try {
      const parsed = JSON.parse(crPayload);
      await onSubmitChangeRequest({
        masterRecordId: activeRecord.id,
        domainCode: activeRecord.domainCode,
        requestType: crType,
        reason: crReason,
        proposedValue: parsed,
      });
      alert('Change request submitted to governance workflow successfully.');
      setActiveDrawerTab('overview');
      setCrReason('');
    } catch (err: any) {
      alert(`Failed to submit change request: ${err.message}`);
    } finally {
      setIsSubmittingCr(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Enterprise Master Data Registry
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              {filteredRecords.length} records
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title="Refresh Registry"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Master Record</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search canonical ID, name, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedDomainCode}
              onChange={(e) => onSelectDomainCode(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">All Domains (17 Monitored)</option>
              {domains.map((d) => (
                <option key={d.domainCode} value={d.domainCode}>
                  {d.displayName} ({d.domainCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
              <option value="MERGED">MERGED (Historical)</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>

          <div>
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">All Quality Classes</option>
              <option value="EXCELLENT">EXCELLENT (95%+)</option>
              <option value="GOOD">GOOD (85-94%)</option>
              <option value="FAIR">FAIR (70-84%)</option>
              <option value="POOR">POOR (&lt;70%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Record Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Canonical ID</th>
                <th className="py-3 px-4">Primary Name / Code</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Source Module</th>
                <th className="py-3 px-4">Ver</th>
                <th className="py-3 px-4">Quality Index</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No master records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const isHighQuality = r.qualityScore >= 95;
                  const isGoodQuality = r.qualityScore >= 85 && r.qualityScore < 95;

                  return (
                    <tr
                      key={r.id}
                      onClick={() => handleOpenRecordDrawer(r)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1.5">
                        <span>{r.canonicalId}</span>
                        {r.isGoldenRecord && (
                          <Award className="w-3.5 h-3.5 text-amber-500" title="Authoritative Golden Record" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {r.primaryName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {r.code} {r.secondaryName ? `• ${r.secondaryName}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                        {r.domainCode}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {r.sourceModule}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        v{r.version}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            isHighQuality
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : isGoodQuality
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {r.qualityScore}% {r.qualityClassification}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            r.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : r.status === 'MERGED'
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRecordDrawer(r);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Record Detail Drawer */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {activeRecord.canonicalId}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Domain: {activeRecord.domainCode}
                  </span>
                  {activeRecord.isGoldenRecord && (
                    <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                      <Award className="w-3 h-3 mr-1" /> Golden Record
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                  {activeRecord.primaryName}
                </h3>
                <p className="text-xs text-slate-500">
                  Code: {activeRecord.code} • Version {activeRecord.version} • Source: {activeRecord.sourceModule} ({activeRecord.sourceEntityId})
                </p>
              </div>

              <button
                onClick={() => setActiveRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 bg-slate-50/30 dark:bg-slate-900 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'attributes', label: 'Attributes' },
                { id: 'identifiers', label: 'Identifiers' },
                { id: 'versions', label: `Versions (${versions.length})` },
                { id: 'quality', label: 'Quality Scan' },
                { id: 'lineage', label: 'Lineage' },
                { id: 'change-request', label: 'Propose Change' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDrawerTab(tab.id as any)}
                  className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                    activeDrawerTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {activeDrawerTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">Quality Score</span>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {activeRecord.qualityScore}% ({activeRecord.qualityClassification})
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">Effective Date</span>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                        {activeRecord.effectiveDate || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Core Master Data Attributes
                    </h4>
                    <div className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-xs overflow-x-auto max-h-60">
                      <pre>{JSON.stringify(activeRecord.dataPayload, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}

              {activeDrawerTab === 'attributes' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Structured Master Fields</h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {Object.entries(activeRecord.dataPayload).map(([key, val]) => (
                      <div key={key} className="py-2 flex justify-between">
                        <span className="font-mono text-slate-500">{key}:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDrawerTab === 'identifiers' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Statutory & Operational Identifiers</h4>
                  {activeRecord.identifiers.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No alternative identifiers mapped.</p>
                  ) : (
                    <div className="space-y-2">
                      {activeRecord.identifiers.map((ident, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                              {ident.identifierType}
                            </span>
                            <div className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                              {ident.identifierValue}
                            </div>
                          </div>
                          {ident.isPrimary && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              PRIMARY
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeDrawerTab === 'versions' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Audit Version Timeline</h4>
                  <div className="space-y-3">
                    {versions.map((v) => (
                      <div
                        key={v.id}
                        className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                            Version {v.versionNumber} ({v.changeType})
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(v.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {v.changeReason}
                        </p>
                        <div className="text-[11px] text-slate-400">
                          Approved by: {v.approvedByUserName} • Changed fields: {v.changedFields.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDrawerTab === 'quality' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Deterministic Quality Audit
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Evaluates 7 quality dimensions and business rules
                      </p>
                    </div>
                    <button
                      onClick={handleTriggerQualityScan}
                      disabled={isScanning}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                      <span>Run Quality Scan</span>
                    </button>
                  </div>

                  {qualityResult && (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                          Overall Quality Score: {qualityResult.overallScore}% ({qualityResult.classification})
                        </span>
                        <span className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">
                          {qualityResult.rulesPassedCount}/{qualityResult.rulesEvaluatedCount} Rules Passed
                        </span>
                      </div>

                      <div className="space-y-2">
                        {qualityResult.findings.map((f, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border text-xs ${
                              f.severity === 'CRITICAL'
                                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                                : f.severity === 'HIGH'
                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="font-bold flex items-center justify-between">
                              <span>[{f.ruleCode}] {f.ruleName}</span>
                              <span className="uppercase text-[10px] font-mono">{f.severity}</span>
                            </div>
                            <p className="mt-1">{f.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeDrawerTab === 'lineage' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Data Lineage & Consumption Graph
                  </h4>
                  {lineage ? (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Source Subsystem:</span>
                        <div className="font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {lineage.sourceSubsystem} ({lineage.sourceEntity})
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Consuming ERP Modules:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {lineage.consumingModules.map((m) => (
                            <span key={m} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md font-mono text-[11px]">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Downstream Transactions:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {lineage.transactionalEntities.map((t) => (
                            <span key={t} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md font-mono text-[11px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Loading lineage graph...</p>
                  )}
                </div>
              )}

              {activeDrawerTab === 'change-request' && (
                <form onSubmit={handleSubmitCrForm} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Request Type
                    </label>
                    <select
                      value={crType}
                      onChange={(e) => setCrType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                      <option value="UPDATE_ATTRIBUTES">Update Attributes</option>
                      <option value="BANK_ACCOUNT_CHANGE">Critical Bank Account Change</option>
                      <option value="MERGE_REQUEST">Merge Request</option>
                      <option value="STATUS_CHANGE">Status / Retirement Change</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Business Justification (Required)
                    </label>
                    <textarea
                      rows={3}
                      value={crReason}
                      onChange={(e) => setCrReason(e.target.value)}
                      placeholder="Explain why this master record modification is required..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Proposed JSON Payload
                    </label>
                    <textarea
                      rows={6}
                      value={crPayload}
                      onChange={(e) => setCrPayload(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 text-emerald-400 font-mono text-xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingCr}
                    className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center space-x-2 transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Change Request to Governance</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Master Record Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Register Canonical Master Record</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Master Domain
                  </label>
                  <select
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    {domains.map((d) => (
                      <option key={d.domainCode} value={d.domainCode}>
                        {d.displayName} ({d.domainCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Source Subsystem
                  </label>
                  <input
                    type="text"
                    value={newSourceModule}
                    onChange={(e) => setNewSourceModule(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Name / Legal Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Al Habtoor Steel Fabrication LLC"
                  value={newPrimaryName}
                  onChange={(e) => setNewPrimaryName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business Code / SKU / Ref
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VND-AHS-01"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Secondary / Arabic Name
                  </label>
                  <input
                    type="text"
                    placeholder="Optional local script"
                    value={newSecondaryName}
                    onChange={(e) => setNewSecondaryName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  JSON Attributes Payload
                </label>
                <textarea
                  rows={4}
                  value={newPayloadJson}
                  onChange={(e) => setNewPayloadJson(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 text-emerald-400 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Master Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
