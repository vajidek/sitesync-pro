import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { FileText, Plus, Download, Eye, Tag, Clock, FileCheck } from 'lucide-react';

interface ProjectDocumentsViewProps {
  projectId: string;
}

export const ProjectDocumentsView: React.FC<ProjectDocumentsViewProps> = ({ projectId }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    'DRAWING',
    'BOQ',
    'WORK_ORDER',
    'LETTER',
    'APPROVAL',
    'INSPECTION',
    'SITE_PHOTO',
    'METHOD_STATEMENT',
    'TECHNICAL',
  ];

  const [formData, setFormData] = useState({
    documentCategory: 'DRAWING',
    title: '',
    fileUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
    fileType: 'application/pdf',
    fileSize: 4500000,
    version: 'v1.0',
    notes: 'Uploaded for engineering verification',
  });

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/${projectId}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setDocuments(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchDocuments();
  }, [projectId]);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/projects/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, projectId }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowModal(false);
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDocs = documents.filter(
    (d) => selectedCategory === 'ALL' || d.documentCategory === selectedCategory
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" /> Engineering Drawings & Document Library
          </h3>
          <p className="text-xs text-slate-500">
            Versioned CAD drawings, BOQ spreadsheets, work orders, HSE method statements & approvals
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading documents library...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-2xl text-xs text-slate-400">
          No documents found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {doc.documentCategory}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {doc.version}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">{doc.title}</h4>
                {doc.notes && <p className="text-[11px] text-slate-500 italic line-clamp-2">{doc.notes}</p>}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-400">
                  {(doc.fileSize / (1024 * 1024)).toFixed(1)} MB
                </span>

                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 rounded-lg font-bold text-[11px] flex items-center space-x-1 hover:bg-blue-100"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Store Project Document</h4>
            <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Approved Piping Isometric Layout Revision 3"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={formData.documentCategory}
                  onChange={(e) => setFormData({ ...formData, documentCategory: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="DRAWING">DRAWING</option>
                  <option value="BOQ">BOQ</option>
                  <option value="WORK_ORDER">WORK_ORDER</option>
                  <option value="LETTER">LETTER</option>
                  <option value="APPROVAL">APPROVAL</option>
                  <option value="INSPECTION">INSPECTION</option>
                  <option value="SITE_PHOTO">SITE_PHOTO</option>
                  <option value="METHOD_STATEMENT">METHOD_STATEMENT</option>
                  <option value="TECHNICAL">TECHNICAL</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Version</label>
                  <input
                    type="text"
                    required
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">File URL / Attachment</label>
                  <input
                    type="text"
                    required
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Engineering Notes / Approvals</label>
                <textarea
                  rows={2}
                  placeholder="Review notes, ADNOC approval ref, consultant remarks..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl shadow"
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
