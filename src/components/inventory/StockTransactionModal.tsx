import React, { useState, useEffect } from 'react';
import { X, Save, ArrowRightLeft, ShieldCheck, FileText, UserCheck, Calendar } from 'lucide-react';
import { MaterialMasterItem, WarehouseItem, StockTransactionItem } from '../../types/inventory';

interface StockTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txnData: Partial<StockTransactionItem>) => void;
  materials: MaterialMasterItem[];
  warehouses: WarehouseItem[];
  projects: { id: string; projectName: string; code?: string }[];
  sites: { id: string; siteName: string }[];
  initialType?: StockTransactionItem['transactionType'];
}

export const StockTransactionModal: React.FC<StockTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  materials,
  warehouses,
  projects,
  sites,
  initialType = 'GOODS_ISSUE',
}) => {
  const [formData, setFormData] = useState<Partial<StockTransactionItem>>({
    transactionType: initialType,
    materialId: materials[0]?.id || '',
    warehouseId: warehouses[0]?.id || '',
    targetWarehouseId: warehouses[1]?.id || '',
    quantity: 10,
    unitPrice: materials[0]?.unitPrice || 100,
    projectId: projects[0]?.id || '',
    siteId: sites[0]?.id || '',
    workCategory: 'Mechanical Piping Spool Fitup',
    issuedByName: 'Ramesh Patel (Store Keeper)',
    receivedByName: 'Tariq Al-Farsi (Site Supervisor)',
    supervisorName: 'Eng. Sarah Al-Mansoor',
    referenceDoc: 'PR-2026-001 / ISO-SPOOL-14',
    notes: 'Material issued for field fitup and seam welding.',
    transactionDate: new Date().toISOString().slice(0, 10),
  });

  const selectedMaterial = materials.find((m) => m.id === formData.materialId);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      transactionType: initialType,
      materialId: materials[0]?.id || '',
      warehouseId: warehouses[0]?.id || '',
      unitPrice: materials[0]?.unitPrice || 100,
      projectId: projects[0]?.id || '',
    }));
  }, [initialType, isOpen, materials, warehouses, projects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const getTitle = () => {
    switch (formData.transactionType) {
      case 'GOODS_RECEIPT': return 'Record Goods Receipt Note (GRN)';
      case 'GOODS_ISSUE': return 'Record Goods Issue to Project Site (GI)';
      case 'TRANSFER': return 'Inter-Warehouse Material Transfer';
      case 'RETURN': return 'Material Return to Store Yard';
      case 'ADJUSTMENT': return 'Stock Quantity Adjustment';
      case 'DAMAGE': return 'Log Damaged Material';
      case 'SCRAP': return 'Log Scrapped Material';
      default: return 'Record Stock Movement';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden my-auto">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600/30 rounded-xl text-indigo-400 border border-indigo-500/30">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{getTitle()}</h2>
              <p className="text-xs text-slate-400">Update stock balance & maintain project chain-of-custody audit logs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Transaction Type selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
            {(['GOODS_ISSUE', 'GOODS_RECEIPT', 'TRANSFER', 'RETURN'] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setFormData({ ...formData, transactionType: t })}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition ${
                  formData.transactionType === t
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Material & Warehouse Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Material SKU *</label>
              <select
                required
                value={formData.materialId || ''}
                onChange={(e) => {
                  const m = materials.find((mat) => mat.id === e.target.value);
                  setFormData({ ...formData, materialId: e.target.value, unitPrice: m?.unitPrice || 0 });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.itemCode}] {m.name} (Stock: {m.currentStock})
                  </option>
                ))}
              </select>
              {selectedMaterial && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Brand: {selectedMaterial.brand || 'N/A'} | Reorder Threshold: {selectedMaterial.reorderLevel} | Available: {selectedMaterial.currentStock - selectedMaterial.reservedStock}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantity *</label>
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {formData.transactionType === 'TRANSFER' ? 'Source Warehouse *' : 'Warehouse Store *'}
              </label>
              <select
                required
                value={formData.warehouseId || ''}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            {formData.transactionType === 'TRANSFER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Destination Warehouse *</label>
                <select
                  required
                  value={formData.targetWarehouseId || ''}
                  onChange={(e) => setFormData({ ...formData, targetWarehouseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Transaction Date</label>
              <input
                type="date"
                value={formData.transactionDate || ''}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              />
            </div>
          </div>

          {/* Project & Site Linkage */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-500" /> Project & Site Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Linked Project</label>
                <select
                  value={formData.projectId || ''}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  <option value="">(No Project Direct Stock)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Site Location</label>
                <select
                  value={formData.siteId || ''}
                  onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  <option value="">(Select Site)</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.siteName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Work Category / Spool</label>
                <input
                  type="text"
                  value={formData.workCategory || ''}
                  onChange={(e) => setFormData({ ...formData, workCategory: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  placeholder="Mechanical Piping Fitup"
                />
              </div>
            </div>
          </div>

          {/* Personnel Chain of Custody */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Issued By (Store Officer)</label>
              <input
                type="text"
                value={formData.issuedByName || ''}
                onChange={(e) => setFormData({ ...formData, issuedByName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Received By (Field Foreman)</label>
              <input
                type="text"
                value={formData.receivedByName || ''}
                onChange={(e) => setFormData({ ...formData, receivedByName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Supervisor Approver</label>
              <input
                type="text"
                value={formData.supervisorName || ''}
                onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Reference Doc / PO / Gate Pass #</label>
              <input
                type="text"
                value={formData.referenceDoc || ''}
                onChange={(e) => setFormData({ ...formData, referenceDoc: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                placeholder="PO-2026-089 / PR-2026-001"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Remarks & Inspection Notes</label>
              <textarea
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                placeholder="Enter batch condition or material test certificate (MTC) verification notes..."
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Confirm & Post Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
