import React, { useState, useEffect } from 'react';
import { safeJson, safeFetchJson } from '../../lib/safeFetch';
import { WaterDocument, WaterDocumentCategory } from '../../types/waterInfrastructureEngine';
import {
  FileText,
  Plus,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  X,
  FileCode,
  ShieldAlert
} from 'lucide-react';

export const WaterDocumentsView: React.FC = () => {
  const [documents, setDocuments] = useState<WaterDocument[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    safeFetchJson('/api/kwa/documents')
      .then((data) => {
        if (Array.isArray(data)) setDocuments(data);
      })
      .catch((err) => console.error(err));

    safeFetchJson('/api/kwa/projects')
      .then((data) => {
        if (Array.isArray(data)) setProjectsList(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    docNo: '',
    title: '',
    category: 'HYDRO_TEST_CERTIFICATE' as WaterDocumentCategory,
    projectId: '',
    projectName: '',
    drawingNumber: '',
    revisionNo: 'R0',
    approvalStatus: 'APPROVED' as 'APPROVED' | 'PENDING' | 'REJECTED' | 'UNDER_REVIEW',
    approvedByOfficial: 'Chief Engineer (Water Supply)',
    uploadedBy: 'Lead Site Engineer',
    fileSizeKB: 2450,
    tags: 'Pipeline, Hydrostatic Test, Sign-off',
    remarks: 'Compliant with Indian Standard IS 12269 & IS 2531'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedProj = projectsList.find((p) => p.id === formData.projectId || p.name === formData.projectName);
      const payload = {
        ...formData,
        docNo: formData.docNo || `DOC-WATER-${Date.now().toString().slice(-4)}`,
        projectName: selectedProj ? selectedProj.name : (formData.projectName || 'Peruvannamuzhi WTP Scheme'),
        uploadDate: new Date().toISOString().split('T')[0],
        tags: formData.tags.split(',').map((t) => t.trim())
      };

      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/kwa/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const json = await safeJson(res);
      if (json?.success && json.data) {
        setDocuments([json.data, ...documents]);
        setIsModalOpen(false);
      } else {
        setDocuments([{ id: `doc_${Date.now()}`, ...payload } as any, ...documents]);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setIsModalOpen(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesCat = filterCategory === 'ALL' || doc.category === filterCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.docNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Water Infrastructure Documents & Engineering RFIs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Central repository for Hydrostatic test certificates, WTP hydraulic drawings, alignment layouts & RFI approvals
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center justify-center space-x-1.5 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document / Certificate</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search document no, title or scheme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="HYDRO_TEST_CERTIFICATE">Hydro Test Certificates</option>
            <option value="HYDRAULIC_DESIGN">Hydraulic Designs & Drawings</option>
            <option value="RFI_APPROVAL">RFI Approvals</option>
            <option value="QUALITY_QC_REPORT">Quality & Concrete Test Reports</option>
            <option value="ALIGNMENT_DRAWING">Pipeline Alignment Drawings</option>
          </select>
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-mono font-bold rounded border border-blue-200 dark:border-blue-800">
                  {doc.docNo}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  doc.approvalStatus === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {doc.approvalStatus}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5 leading-snug">
                {doc.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {doc.projectName}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                <div>Category: <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.category}</span></div>
                <div>Rev: <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.revisionNo || 'R0'}</span></div>
                <div>Approver: <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.approvedByOfficial || 'Water Official'}</span></div>
                <div>Uploaded: <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.uploadDate}</span></div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                {Math.round((doc.fileSizeKB || 2048) / 1024 * 10) / 10} MB • PDF Document
              </span>

              <button
                onClick={() => {
                  const content = `SiteSync Pro Enterprise ERP Document\nNo: ${doc.docNo}\nTitle: ${doc.title}\nScheme: ${doc.projectName}\nApproval: ${doc.approvalStatus}`;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${doc.docNo}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Upload Engineering Document / Certificate
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 4B Hydrostatic Test Certificate"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as WaterDocumentCategory })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  <option value="HYDRO_TEST_CERTIFICATE">Hydrostatic Test Certificate</option>
                  <option value="HYDRAULIC_DESIGN">Hydraulic Design Calculation</option>
                  <option value="RFI_APPROVAL">Request for Inspection (RFI)</option>
                  <option value="QUALITY_QC_REPORT">Quality & Concrete Test Report</option>
                  <option value="ALIGNMENT_DRAWING">Pipeline Alignment Drawing</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Scheme</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => {
                    const proj = projectsList.find((p) => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      projectId: e.target.value,
                      projectName: proj ? proj.name : ''
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  required
                >
                  <option value="">Select Project Scheme</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Witness / Approver</label>
                <input
                  type="text"
                  value={formData.approvedByOfficial}
                  onChange={(e) => setFormData({ ...formData, approvedByOfficial: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow"
                >
                  Upload & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
