import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  FileText, Plus, RefreshCw, CheckCircle2, Play, Eye, GitBranch, 
  Trash2, MoveUp, MoveDown, Layers, MapPin, Camera, PenTool, Hash, 
  Calendar, CheckSquare, ChevronDown, Send, Shield, Sparkles, Building2
} from 'lucide-react';
import {
  DSSectionHeader,
  DSCard,
  DSButton,
  DSAlert,
  DSModal,
  DSField
} from '../ui/design-system';

export const FormDesignerEngineView: React.FC = () => {
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'designer' | 'preview' | 'submissions'>('designer');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Builder state
  const [formMeta, setFormMeta] = useState({
    code: '',
    title: '',
    description: '',
    moduleCode: 'PROJECTS',
    scopeType: 'GLOBAL',
    workflowCode: 'PO_APPROVAL',
    category: 'INSPECTION',
  });
  const [fields, setFields] = useState<any[]>([]);
  const [showNewFormModal, setShowNewFormModal] = useState(false);

  // Field Configurator Modal / State
  const [selectedField, setSelectedField] = useState<any | null>(null);

  // Interactive Form Runner state
  const [runnerData, setRunnerData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/forms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setForms(json.data);
        if (json.data.length > 0 && !selectedForm) {
          loadFormDetails(json.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch forms:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFormDetails = async (formId: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/forms/${formId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && json.data) {
        setSelectedForm(json.data);
        const f = json.data;
        setFormMeta({
          code: f.code,
          title: f.title,
          description: f.description || '',
          moduleCode: f.moduleCode,
          scopeType: f.scopeType,
          workflowCode: f.workflowCode || 'PO_APPROVAL',
          category: f.category,
        });
        const activeFields = f.activeVersionDetails?.fieldsJson || [];
        setFields(activeFields);
        fetchSubmissions(formId);
      }
    } catch (err) {
      console.error('Failed to load form details:', err);
    }
  };

  const fetchSubmissions = async (formId: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/forms/submissions?formId=${formId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) setSubmissions(json.data || []);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  // Add new field type to designer
  const addFieldToDesigner = (type: string) => {
    const key = `field_${Date.now()}`;
    const newFld = {
      fieldKey: key,
      label: `New ${type} Field`,
      fieldType: type,
      isRequired: false,
      isReadOnly: false,
      isHidden: false,
      displayOrder: fields.length + 1,
      width: '100%',
      options: type === 'DROPDOWN' ? [{ label: 'Option 1', value: 'OPT_1' }, { label: 'Option 2', value: 'OPT_2' }] : null,
    };
    setFields([...fields, newFld]);
    setSelectedField(newFld);
  };

  const removeField = (key: string) => {
    setFields(fields.filter((f) => f.fieldKey !== key));
    if (selectedField?.fieldKey === key) setSelectedField(null);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newArr = [...fields];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newArr.length) return;
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setFields(newArr);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const payload = {
        ...formMeta,
        fields,
      };
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowNewFormModal(false);
        setActionMessage({ type: 'success', text: 'Dynamic Form template saved & versioned' });
        fetchForms();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to save form definition' });
    }
  };

  const handlePublishForm = async () => {
    if (!selectedForm) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/forms/${selectedForm.id}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: 'Dynamic Form published for live site usage' });
        loadFormDetails(selectedForm.id);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Publish failed' });
    }
  };

  const handleSubmitRunner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const payload = {
        formId: selectedForm.id,
        moduleCode: selectedForm.moduleCode,
        dataJson: runnerData,
        workflowCode: selectedForm.workflowCode,
      };
      const res = await fetch('/api/forms/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: 'Form submission recorded & routed through Workflow Engine' });
        setRunnerData({});
        fetchSubmissions(selectedForm.id);
        setActiveTab('submissions');
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Form submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      
      <DSSectionHeader
        title="Enterprise Dynamic Form Engine"
        subtitle="Zero-code drag-and-drop form designer with versioning, workflow routing, and ABAC field security."
        action={
          <div className="flex items-center space-x-2">
            <DSButton
              variant="outline"
              size="sm"
              isLoading={loading}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => fetchForms()}
            >
              Refresh
            </DSButton>

            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setFormMeta({
                  code: `FORM_${Date.now()}`,
                  title: 'New Site Inspection Checklist',
                  description: 'Custom site inspection form definition',
                  moduleCode: 'PROJECTS',
                  scopeType: 'GLOBAL',
                  workflowCode: 'PO_APPROVAL',
                  category: 'INSPECTION',
                });
                setFields([
                  { fieldKey: 'inspectorName', label: 'Inspector Name', fieldType: 'TEXT', isRequired: true, width: '50%' },
                  { fieldKey: 'siteGps', label: 'GPS Location', fieldType: 'GPS_LOCATION', isRequired: false, width: '50%' },
                ]);
                setShowNewFormModal(true);
              }}
            >
              Design New Form
            </DSButton>
          </div>
        }
      />

      {/* Notification Banner */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Forms Selection & Designer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Form Templates Master List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center justify-between">
            <span>Configured Forms ({forms.length})</span>
            <span className="text-purple-600 font-mono text-[10px]">Active</span>
          </h3>

          <div className="space-y-2">
            {forms.map((frm) => {
              const isSelected = selectedForm?.id === frm.id;
              return (
                <div
                  key={frm.id}
                  onClick={() => loadFormDetails(frm.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{frm.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      frm.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {frm.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{frm.description}</p>

                  <div className="flex items-center space-x-2 mt-2 text-[10px]">
                    <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">{frm.moduleCode}</span>
                    <span className="text-slate-400">v{frm.activeVersion}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Designer / Preview / Submissions Workspace */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Subtab Navigation Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('designer')}
                className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center space-x-2 transition ${
                  activeTab === 'designer' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Field Designer ({fields.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center space-x-2 transition ${
                  activeTab === 'preview' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Form Runner / Preview</span>
              </button>

              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center space-x-2 transition ${
                  activeTab === 'submissions' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submissions ({submissions.length})</span>
              </button>
            </div>

            {selectedForm && selectedForm.status !== 'PUBLISHED' && (
              <button
                onClick={handlePublishForm}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Publish Form v{selectedForm.activeVersion}</span>
              </button>
            )}
          </div>

          {/* TAB 1: FIELD DESIGNER */}
          {activeTab === 'designer' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Field Palette */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Field Palette</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {[
                    { label: 'Text Input', type: 'TEXT', icon: <FileText className="w-3.5 h-3.5" /> },
                    { label: 'Long Text', type: 'TEXTAREA', icon: <FileText className="w-3.5 h-3.5" /> },
                    { label: 'Dropdown', type: 'DROPDOWN', icon: <ChevronDown className="w-3.5 h-3.5" /> },
                    { label: 'Date & Time', type: 'DATETIME', icon: <Calendar className="w-3.5 h-3.5" /> },
                    { label: 'GPS Tag', type: 'GPS_LOCATION', icon: <MapPin className="w-3.5 h-3.5" /> },
                    { label: 'Site Photo', type: 'IMAGE_UPLOAD', icon: <Camera className="w-3.5 h-3.5" /> },
                    { label: 'Signature', type: 'SIGNATURE', icon: <PenTool className="w-3.5 h-3.5" /> },
                    { label: 'Number / Rate', type: 'NUMBER', icon: <Hash className="w-3.5 h-3.5" /> },
                  ].map((p) => (
                    <button
                      key={p.type}
                      onClick={() => addFieldToDesigner(p.type)}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-300 flex items-center space-x-2 transition font-medium"
                    >
                      <span className="text-purple-600">{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Designer Canvas */}
              <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800 pb-2">
                  Form Layout Canvas ({fields.length} fields)
                </h4>

                <div className="space-y-2">
                  {fields.map((f, idx) => (
                    <div
                      key={f.fieldKey}
                      onClick={() => setSelectedField(f)}
                      className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                        selectedField?.fieldKey === f.fieldKey
                          ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300'
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-purple-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-purple-600 text-[10px] font-bold">#{idx + 1}</span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{f.label}</span>
                          <span className="ml-2 font-mono text-[10px] text-slate-400">({f.fieldType})</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button onClick={(e) => { e.stopPropagation(); moveField(idx, 'up'); }} className="p-1 hover:text-purple-600">
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); moveField(idx, 'down'); }} className="p-1 hover:text-purple-600">
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); removeField(f.fieldKey); }} className="p-1 text-rose-500 hover:text-rose-700">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INTERACTIVE FORM RUNNER / PREVIEW */}
          {activeTab === 'preview' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedForm?.title || 'Form Preview'}</h3>
                <p className="text-slate-500 text-xs mt-1">{selectedForm?.description}</p>
              </div>

              <form onSubmit={handleSubmitRunner} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((f) => (
                    <div key={f.fieldKey} className={f.width === '100%' ? 'md:col-span-2' : ''}>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {f.label} {f.isRequired && <span className="text-rose-500">*</span>}
                      </label>

                      {f.fieldType === 'TEXT' && (
                        <input
                          type="text"
                          required={f.isRequired}
                          onChange={(e) => setRunnerData({ ...runnerData, [f.fieldKey]: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      )}

                      {f.fieldType === 'TEXTAREA' && (
                        <textarea
                          rows={2}
                          required={f.isRequired}
                          onChange={(e) => setRunnerData({ ...runnerData, [f.fieldKey]: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      )}

                      {f.fieldType === 'DROPDOWN' && (
                        <select
                          required={f.isRequired}
                          onChange={(e) => setRunnerData({ ...runnerData, [f.fieldKey]: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        >
                          <option value="">-- Select Option --</option>
                          {(f.options || []).map((opt: any) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}

                      {f.fieldType === 'GPS_LOCATION' && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between font-mono text-xs">
                          <span className="text-slate-500">GPS: 9.9312° N, 76.2673° E (Coimbatore Site)</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded">Locked</span>
                        </div>
                      )}

                      {f.fieldType === 'SIGNATURE' && (
                        <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center text-slate-400 font-mono text-xs">
                          [ Digital Sign-off Canvas Locked ]
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center space-x-2 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting...' : 'Submit Form'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SUBMISSIONS LOG */}
          {activeTab === 'submissions' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800 pb-2">
                Recorded Form Submissions ({submissions.length})
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.map((sub) => (
                  <div key={sub.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold font-mono text-purple-600">{sub.submissionNumber}</span>
                        <span className="text-slate-900 dark:text-white font-semibold">by {sub.submittedByUserName} ({sub.submittedByUserRole})</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">Submitted on: {new Date(sub.createdAt).toLocaleString()}</span>
                    </div>

                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold font-mono rounded-lg">
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Modal: Create Form Definition */}
      {showNewFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Create Enterprise Form Template</span>
              </h3>
              <button onClick={() => setShowNewFormModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Form Code</label>
                <input
                  type="text"
                  required
                  value={formMeta.code}
                  onChange={(e) => setFormMeta({ ...formMeta, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Form Title</label>
                <input
                  type="text"
                  required
                  value={formMeta.title}
                  onChange={(e) => setFormMeta({ ...formMeta, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ERP Module</label>
                  <select
                    value={formMeta.moduleCode}
                    onChange={(e) => setFormMeta({ ...formMeta, moduleCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="PROJECTS">PROJECTS</option>
                    <option value="QAQC">QA/QC</option>
                    <option value="SAFETY">SAFETY</option>
                    <option value="PROCUREMENT">PROCUREMENT</option>
                    <option value="HR">HR</option>
                    <option value="FLEET">FLEET</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Workflow Link</label>
                  <select
                    value={formMeta.workflowCode}
                    onChange={(e) => setFormMeta({ ...formMeta, workflowCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="PO_APPROVAL">PO Approval</option>
                    <option value="LEAVE_REQUEST_APPROVAL">Leave Approval</option>
                    <option value="MATERIAL_REQUISITION_APPROVAL">Material Req Approval</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewFormModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Form Definition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
