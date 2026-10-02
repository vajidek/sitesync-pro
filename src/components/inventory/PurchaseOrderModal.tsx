import React, { useState, useEffect } from 'react';
import { X, Save, FileCheck, Truck, DollarSign } from 'lucide-react';
import { PurchaseOrderItem } from '../../types/inventory';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (poData: Partial<PurchaseOrderItem>) => void;
  vendors: { id: string; name: string; paymentTerms?: string }[];
  projects: { id: string; projectName: string }[];
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  vendors,
  projects,
}) => {
  const [formData, setFormData] = useState<Partial<PurchaseOrderItem>>({
    vendorId: vendors[0]?.id || '',
    projectId: projects[0]?.id || '',
    poDate: new Date().toISOString().slice(0, 10),
    expectedDeliveryDate: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
    totalAmount: 190000,
    paymentTerms: 'Net 60 Days',
    quotationRef: 'QT-EMSTEEL-9921',
    notes: 'Material supply agreement with mill test certificates & third-party inspection.',
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      vendorId: vendors[0]?.id || '',
      projectId: projects[0]?.id || '',
      paymentTerms: vendors[0]?.paymentTerms || 'Net 60 Days',
    }));
  }, [isOpen, vendors, projects]);

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
            <div className="p-2 bg-purple-600/30 rounded-xl text-purple-400 border border-purple-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Issue Purchase Order (PO)</h2>
              <p className="text-xs text-slate-400">Formal vendor order commitment, payment terms and delivery tracking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Approved Vendor *</label>
              <select
                required
                value={formData.vendorId || ''}
                onChange={(e) => {
                  const v = vendors.find((v) => v.id === e.target.value);
                  setFormData({ ...formData, vendorId: e.target.value, paymentTerms: v?.paymentTerms || 'Net 30 Days' });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Assignment</label>
              <select
                value={formData.projectId || ''}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quotation Reference #</label>
              <input
                type="text"
                value={formData.quotationRef || ''}
                onChange={(e) => setFormData({ ...formData, quotationRef: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                placeholder="QT-EMSTEEL-9921"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Total PO Amount ($) *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.totalAmount || ''}
                onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">PO Date</label>
              <input
                type="date"
                value={formData.poDate || ''}
                onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Expected Delivery Date *</label>
              <input
                type="date"
                required
                value={formData.expectedDeliveryDate || ''}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Terms</label>
              <input
                type="text"
                value={formData.paymentTerms || ''}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                placeholder="Net 60 Days / 20% Advance"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">PO Terms & Instructions</label>
              <textarea
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                placeholder="Special delivery instructions..."
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
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Generate Purchase Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
