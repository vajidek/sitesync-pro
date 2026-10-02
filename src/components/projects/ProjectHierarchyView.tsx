import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { Layers, Plus, Trash2, Edit3, FolderTree, ChevronRight, Building, CheckCircle, ShieldAlert } from 'lucide-react';

interface ProjectHierarchyViewProps {
  projectId: string;
}

export const ProjectHierarchyView: React.FC<ProjectHierarchyViewProps> = ({ projectId }) => {
  const [structures, setStructures] = useState<any[]>([]);
  const [subProjects, setSubProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    parentId: '',
    code: '',
    name: '',
    type: 'ZONE',
    description: '',
    displayOrder: 0,
  });

  const fetchHierarchyData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sitesync_access_token');
      const [strRes, subRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/structures`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/projects/${projectId}/sub-projects`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const strJson = await safeJson(strRes);
      const subJson = await safeJson(subRes);

      if (strJson?.success) setStructures(strJson.data || []);
      if (subJson?.success) setSubProjects(subJson.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load project hierarchy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchHierarchyData();
  }, [projectId]);

  const handleOpenModal = (structToEdit?: any) => {
    if (structToEdit) {
      setEditingStructure(structToEdit);
      setFormData({
        parentId: structToEdit.parentId || '',
        code: structToEdit.code || '',
        name: structToEdit.name || '',
        type: structToEdit.type || 'ZONE',
        description: structToEdit.description || '',
        displayOrder: structToEdit.displayOrder || 0,
      });
    } else {
      setEditingStructure(null);
      setFormData({
        parentId: '',
        code: `STR-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        type: 'ZONE',
        description: '',
        displayOrder: structures.length + 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const url = editingStructure
        ? `/api/projects/structures/${editingStructure.id}`
        : `/api/projects/${projectId}/structures`;
      const method = editingStructure ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const json = await safeJson(res);
      if (json?.success) {
        setIsModalOpen(false);
        fetchHierarchyData();
      } else {
        setError(json?.message || 'Error saving structure');
      }
    } catch (err: any) {
      setError(err.message || 'Server error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this structure node?')) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/structures/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        fetchHierarchyData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete structure');
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'PACKAGE': return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'ZONE': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'AREA': return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';
      case 'SECTION': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'LOCATION': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'ACTIVITY': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading structure breakdown hierarchy...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-950/50 rounded-2xl text-purple-600">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Project Structure Breakdown & Sub-Projects
            </h2>
            <p className="text-xs text-slate-500">
              Multi-tier hierarchy engine (Package → Zone → Area → Section → Location → Activity)
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Structure Node</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center space-x-2 border border-rose-200">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Sub-Projects Section (if any exist) */}
      {subProjects.length > 0 && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <Building className="w-4 h-4 text-blue-500" />
            <span>Child Sub-Projects ({subProjects.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subProjects.map((sub) => (
              <div key={sub.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-500">{sub.projectCode}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {sub.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sub.projectName}</h4>
                <p className="text-[11px] text-slate-500 truncate">{sub.location}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structure Nodes Hierarchy List */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
          <Layers className="w-4 h-4 text-purple-500" />
          <span>Structure Nodes Breakdown ({structures.length})</span>
        </h3>

        {structures.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            No custom structure nodes defined yet. Click "Add Structure Node" to establish your project layout tree.
          </div>
        ) : (
          <div className="space-y-2">
            {structures.map((s) => {
              const parentNode = structures.find((p) => p.id === s.parentId);
              return (
                <div
                  key={s.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-300 transition"
                >
                  <div className="flex items-start space-x-3">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase mt-0.5 ${getTypeBadgeClass(s.type)}`}>
                      {s.type}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-slate-500">{s.code}</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</h4>
                      </div>
                      {parentNode && (
                        <p className="text-[10px] text-slate-400 flex items-center space-x-1">
                          <span>Parent:</span>
                          <span className="font-semibold">{parentNode.name} ({parentNode.code})</span>
                        </p>
                      )}
                      {s.description && (
                        <p className="text-[11px] text-slate-500 leading-snug">{s.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenModal(s)}
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 transition"
                      title="Edit Node"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 hover:bg-rose-200 transition"
                      title="Delete Node"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Structure Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingStructure ? 'Edit Structure Node' : 'Add New Structure Node'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Parent Node (Optional)</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">None (Top Level Structure Node)</option>
                  {structures
                    .filter((s) => s.id !== editingStructure?.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name} ({s.type})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Structure Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="PACKAGE">PACKAGE</option>
                  <option value="ZONE">ZONE</option>
                  <option value="AREA">AREA</option>
                  <option value="SECTION">SECTION</option>
                  <option value="LOCATION">LOCATION</option>
                  <option value="ACTIVITY">ACTIVITY</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Structure Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Structure Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pump Room Delta / Structural Foundation Block A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details, elevation markers, grid references..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl"
                >
                  Save Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
