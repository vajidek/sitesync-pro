import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { X, Building2, Calendar, MapPin, DollarSign, ShieldAlert, FileText, Globe, Layers, AlertTriangle } from 'lucide-react';

interface ProjectCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: any;
  onSuccess: () => void;
}

export const ProjectCreateEditModal: React.FC<ProjectCreateEditModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'BASIC' | 'COMMERCIAL' | 'ORGANIZATION' | 'SCHEDULE'>('BASIC');
  
  // Master options
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [fundingAgencies, setFundingAgencies] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [contractTypes, setContractTypes] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState<any>({
    projectCode: '',
    projectName: '',
    shortName: '',
    projectCategoryId: '',
    projectCategory: '',
    projectTypeId: '',
    projectType: '',
    parentProjectId: '',
    status: 'PLANNING',
    priority: 'MEDIUM',
    
    // Commercial
    clientId: '',
    clientName: '',
    customerName: '',
    consultantId: '',
    consultantName: '',
    fundingAgencyId: '',
    fundingAgencyName: '',
    contractNumber: '',
    workOrderNumber: '',
    tenderNumber: '',
    agreementNumber: '',
    currency: 'AED',
    currencyId: '',
    budget: 5000000,
    contractTypeId: '',
    contractType: '',
    defectLiabilityPeriodMonths: 12,

    // Org & Location
    location: '',
    latitude: 24.498,
    longitude: 54.407,
    googleMapUrl: '',
    
    // Dates
    startDate: new Date().toISOString().slice(0, 10),
    targetCompletionDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
    awardDate: '',
    contractSignDate: '',
    commencementDate: '',
    defectLiabilityEndDate: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeWarning, setCodeWarning] = useState<string | null>(null);
  const [woWarning, setWoWarning] = useState<string | null>(null);

  // Load masters on modal open
  useEffect(() => {
    if (!isOpen) return;

    const fetchMasters = async () => {
      const token = localStorage.getItem('sitesync_access_token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [catRes, typeRes, clientRes, consRes, fundRes, currRes, contRes, prjRes] = await Promise.all([
          fetch('/api/projects/masters/categories', { headers }),
          fetch('/api/projects/masters/types', { headers }),
          fetch('/api/projects/masters/clients', { headers }),
          fetch('/api/projects/masters/consultants', { headers }),
          fetch('/api/projects/masters/funding-agencies', { headers }),
          fetch('/api/projects/masters/currencies', { headers }),
          fetch('/api/projects/masters/contract-types', { headers }),
          fetch('/api/projects', { headers }),
        ]);

        const [catJson, typeJson, clientJson, consJson, fundJson, currJson, contJson, prjJson] = await Promise.all([
          safeJson(catRes), safeJson(typeRes), safeJson(clientRes), safeJson(consRes),
          safeJson(fundRes), safeJson(currRes), safeJson(contRes), safeJson(prjRes)
        ]);

        if (catJson?.success) setCategories(catJson.data || []);
        if (typeJson?.success) setTypes(typeJson.data || []);
        if (clientJson?.success) setClients(clientJson.data || []);
        if (consJson?.success) setConsultants(consJson.data || []);
        if (fundJson?.success) setFundingAgencies(fundJson.data || []);
        if (currJson?.success) setCurrencies(currJson.data || []);
        if (contJson?.success) setContractTypes(contJson.data || []);
        if (prjJson?.success) setProjectsList(prjJson.data || []);
      } catch (err) {
        console.error('Error fetching master data for modal:', err);
      }
    };

    fetchMasters();
  }, [isOpen]);

  // Load edit object or setup new form
  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        projectCode: projectToEdit.projectCode || '',
        projectName: projectToEdit.projectName || '',
        shortName: projectToEdit.shortName || '',
        projectCategoryId: projectToEdit.projectCategoryId || '',
        projectCategory: projectToEdit.projectCategory || '',
        projectTypeId: projectToEdit.projectTypeId || '',
        projectType: projectToEdit.projectType || '',
        parentProjectId: projectToEdit.parentProjectId || '',
        status: projectToEdit.status || 'PLANNING',
        priority: projectToEdit.priority || 'MEDIUM',
        
        clientId: projectToEdit.clientId || '',
        clientName: projectToEdit.clientName || '',
        customerName: projectToEdit.customerName || projectToEdit.clientName || '',
        consultantId: projectToEdit.consultantId || '',
        consultantName: projectToEdit.consultantName || '',
        fundingAgencyId: projectToEdit.fundingAgencyId || '',
        fundingAgencyName: projectToEdit.fundingAgencyName || '',
        contractNumber: projectToEdit.contractNumber || '',
        workOrderNumber: projectToEdit.workOrderNumber || '',
        tenderNumber: projectToEdit.tenderNumber || '',
        agreementNumber: projectToEdit.agreementNumber || '',
        currency: projectToEdit.currency || 'AED',
        currencyId: projectToEdit.currencyId || '',
        budget: projectToEdit.budget || 5000000,
        contractTypeId: projectToEdit.contractTypeId || '',
        contractType: projectToEdit.contractType || '',
        defectLiabilityPeriodMonths: projectToEdit.defectLiabilityPeriodMonths || 12,

        location: projectToEdit.location || '',
        latitude: projectToEdit.latitude || 24.498,
        longitude: projectToEdit.longitude || 54.407,
        googleMapUrl: projectToEdit.googleMapUrl || '',
        
        startDate: projectToEdit.startDate || new Date().toISOString().slice(0, 10),
        targetCompletionDate: projectToEdit.targetCompletionDate || new Date().toISOString().slice(0, 10),
        awardDate: projectToEdit.awardDate || '',
        contractSignDate: projectToEdit.contractSignDate || '',
        commencementDate: projectToEdit.commencementDate || '',
        defectLiabilityEndDate: projectToEdit.defectLiabilityEndDate || '',
        description: projectToEdit.description || '',
      });
    } else {
      setFormData({
        projectCode: `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
        projectName: '',
        shortName: '',
        projectCategoryId: '',
        projectCategory: '',
        projectTypeId: '',
        projectType: '',
        parentProjectId: '',
        status: 'PLANNING',
        priority: 'MEDIUM',
        
        clientId: '',
        clientName: '',
        customerName: 'Abu Dhabi Infrastructure Corp',
        consultantId: '',
        consultantName: '',
        fundingAgencyId: '',
        fundingAgencyName: '',
        contractNumber: '',
        workOrderNumber: '',
        tenderNumber: '',
        agreementNumber: '',
        currency: 'AED',
        currencyId: '',
        budget: 5000000,
        contractTypeId: '',
        contractType: '',
        defectLiabilityPeriodMonths: 12,

        location: 'Sector 4 Industrial Yard, Abu Dhabi',
        latitude: 24.498,
        longitude: 54.407,
        googleMapUrl: '',
        
        startDate: new Date().toISOString().slice(0, 10),
        targetCompletionDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
        awardDate: '',
        contractSignDate: '',
        commencementDate: '',
        defectLiabilityEndDate: '',
        description: '',
      });
    }
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  // Uniqueness validation on Code Blur
  const handleCheckCode = async () => {
    if (!formData.projectCode) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const exclude = projectToEdit ? `&excludeId=${projectToEdit.id}` : '';
      const res = await fetch(`/api/projects/check-code?code=${encodeURIComponent(formData.projectCode)}${exclude}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.exists) {
        setCodeWarning('Project Code already exists in database');
      } else {
        setCodeWarning(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('sitesync_access_token');
      const url = projectToEdit ? `/api/projects/${projectToEdit.id}` : '/api/projects';
      const method = projectToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const json = (await safeJson(res)) || {};
      if (json.success) {
        onSuccess();
        onClose();
      } else {
        setError(json.message || 'Failed to save project');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {projectToEdit ? `Edit Project Scope: ${projectToEdit.projectCode}` : 'Create Enterprise Project'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center space-x-2 border border-rose-200">
            <ShieldAlert className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('BASIC')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'BASIC'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            1. Classification & Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMMERCIAL')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'COMMERCIAL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            2. Commercial & Client
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ORGANIZATION')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'ORGANIZATION'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            3. Location & Site GPS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SCHEDULE')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'SCHEDULE'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            4. Timeline & Dates
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* TAB 1: BASIC & CLASSIFICATION */}
          {activeTab === 'BASIC' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Code *</label>
                <input
                  type="text"
                  required
                  value={formData.projectCode}
                  onBlur={handleCheckCode}
                  onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
                {codeWarning && (
                  <p className="text-[10px] text-amber-600 font-bold mt-1 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{codeWarning}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Name / Scope *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al Reem Mechanical Piping & Structural Hub"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Name</label>
                <input
                  type="text"
                  placeholder="e.g. AL-REEM-PIPE"
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Parent Project (Sub-Project Link)</label>
                <select
                  value={formData.parentProjectId}
                  onChange={(e) => setFormData({ ...formData, parentProjectId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">None (Independent Parent Project)</option>
                  {projectsList
                    .filter((p) => p.id !== projectToEdit?.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.projectCode} - {p.projectName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Category</label>
                <select
                  value={formData.projectCategoryId}
                  onChange={(e) => {
                    const selected = categories.find((c) => c.id === e.target.value);
                    setFormData({
                      ...formData,
                      projectCategoryId: e.target.value,
                      projectCategory: selected ? selected.name : '',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Type</label>
                <select
                  value={formData.projectTypeId}
                  onChange={(e) => {
                    const selected = types.find((t) => t.id === e.target.value);
                    setFormData({
                      ...formData,
                      projectTypeId: e.target.value,
                      projectType: selected ? selected.name : '',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Select Type...</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Execution Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                >
                  <option value="PLANNING">PLANNING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="ON_HOLD">ON_HOLD</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: COMMERCIAL & CLIENT */}
          {activeTab === 'COMMERCIAL' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Client Entity</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => {
                    const selected = clients.find((c) => c.id === e.target.value);
                    setFormData({
                      ...formData,
                      clientId: e.target.value,
                      clientName: selected ? selected.name : '',
                      customerName: selected ? selected.name : formData.customerName,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Select Client Master...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Consultant Entity</label>
                <select
                  value={formData.consultantId}
                  onChange={(e) => {
                    const selected = consultants.find((c) => c.id === e.target.value);
                    setFormData({
                      ...formData,
                      consultantId: e.target.value,
                      consultantName: selected ? selected.name : '',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Select Consultant Master...</option>
                  {consultants.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Funding Agency</label>
                <select
                  value={formData.fundingAgencyId}
                  onChange={(e) => {
                    const selected = fundingAgencies.find((f) => f.id === e.target.value);
                    setFormData({
                      ...formData,
                      fundingAgencyId: e.target.value,
                      fundingAgencyName: selected ? selected.name : '',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Select Funding Agency...</option>
                  {fundingAgencies.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contract Type</label>
                <select
                  value={formData.contractTypeId}
                  onChange={(e) => {
                    const selected = contractTypes.find((ct) => ct.id === e.target.value);
                    setFormData({
                      ...formData,
                      contractTypeId: e.target.value,
                      contractType: selected ? selected.name : '',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Select Contract Type...</option>
                  {contractTypes.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name} ({ct.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Order Number</label>
                <input
                  type="text"
                  placeholder="e.g. WO-2026-8812"
                  value={formData.workOrderNumber}
                  onChange={(e) => setFormData({ ...formData, workOrderNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Agreement / Contract Number</label>
                <input
                  type="text"
                  placeholder="e.g. AGR-AD-2026-99"
                  value={formData.agreementNumber}
                  onChange={(e) => setFormData({ ...formData, agreementNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tender Number</label>
                <input
                  type="text"
                  placeholder="e.g. TND-2026-401"
                  value={formData.tenderNumber}
                  onChange={(e) => setFormData({ ...formData, tenderNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Currency & Budget</label>
                <div className="flex space-x-2">
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-24 px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="AED">AED</option>
                    <option value="USD">USD</option>
                    <option value="SAR">SAR</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                  </select>
                  <input
                    type="number"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Defect Liability Period (Months)</label>
                <input
                  type="number"
                  value={formData.defectLiabilityPeriodMonths}
                  onChange={(e) => setFormData({ ...formData, defectLiabilityPeriodMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>
            </div>
          )}

          {/* TAB 3: LOCATION & SITE GPS */}
          {activeTab === 'ORGANIZATION' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Site Location & Address *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Google Maps Coordinates / URL</label>
                <input
                  type="text"
                  placeholder="https://maps.google.com/..."
                  value={formData.googleMapUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE & DATES */}
          {activeTab === 'SCHEDULE' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Scheduled Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Completion Date *</label>
                <input
                  type="date"
                  required
                  value={formData.targetCompletionDate}
                  onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Award Date</label>
                <input
                  type="date"
                  value={formData.awardDate}
                  onChange={(e) => setFormData({ ...formData, awardDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contract Signing Date</label>
                <input
                  type="date"
                  value={formData.contractSignDate}
                  onChange={(e) => setFormData({ ...formData, contractSignDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Commencement Date</label>
                <input
                  type="date"
                  value={formData.commencementDate}
                  onChange={(e) => setFormData({ ...formData, commencementDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Defect Liability End Date</label>
                <input
                  type="date"
                  value={formData.defectLiabilityEndDate}
                  onChange={(e) => setFormData({ ...formData, defectLiabilityEndDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Technical Scope & Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe structural specifications, civil engineering layouts, mechanical schedules..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Footer controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">
              SiteSync Pro Project Master Engine v51.0
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-2"
              >
                <span>{loading ? 'Saving Scope...' : projectToEdit ? 'Save Changes' : 'Create Project'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
