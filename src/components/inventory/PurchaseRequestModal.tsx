import React, { useState, useEffect } from 'react';
import { X, Save, ShoppingCart, AlertCircle } from 'lucide-react';
import { MaterialMasterItem, PurchaseRequestItem } from '../../types/inventory';

interface PurchaseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prData: Partial<PurchaseRequestItem>) => void;
  materials: MaterialMasterItem[];
  projects: { id: string; projectName: string }[];
  sites: { id: string; siteName: string }[];
}

export const PurchaseRequestModal: React.FC<PurchaseRequestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  materials,
  projects,
  sites,
}) => {
  const [formData, setFormData] = useState<Partial<PurchaseRequestItem>>({
    projectId: projects[0]?.id || '',
    siteId: sites[0]?.id || '',
    materialId: materials[0]?.id || '',
    quantity: 100,
    unit: 'MTR',
    priority: 'HIGH',
    requiredDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    remarks: 'Urgent site requirement for structural & piping installation phase.',
  });

  useEffect(() => {
    const mat = materials[0];
    setFormData((prev) => ({
      ...prev,
      projectId: projects[0]?.id || '',
      siteId: sites[0]?.id || '',
      materialId: mat?.id || '',
      quantity: 100,
      unit: mat?.unitId === 'unt-001' ? 'MTR' : 'PCS',
    }));
  }, [isOpen, materials, projects, sites]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden my-auto">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-600/30 rounded-xl text-amber-400 border border-amber-500/30">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">New Material Requisition (PR)</h2>
              <p className="text-xs text-slate-400">Submit store requisition for verification and project manager approval</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project *</label>
              <select
                required
                value={formData.projectId || ''}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Site Location</label>
              <select
                value={formData.siteId || ''}
                onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.siteName}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Material Item *</label>
              <select
                required
                value={formData.materialId || ''}
                onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.itemCode}] {m.name} (Current Yard Stock: {m.currentStock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Quantity *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Level *</label>
              <select
                value={formData.priority || 'HIGH'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="EMERGENCY">EMERGENCY / CRITICAL</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Completion / Required By Date *</label>
              <input
                type="date"
                required
                value={formData.requiredDate || ''}
                onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Requisition Justification & Remarks</label>
              <textarea
                rows={2}
                value={formData.remarks || ''}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                placeholder="Specify why materials are needed for site tasks..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Submit Purchase Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
