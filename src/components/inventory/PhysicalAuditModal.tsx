import React, { useState } from 'react';
import { X, Save, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { MaterialMasterItem, WarehouseItem, StockVerificationItem } from '../../types/inventory';

interface PhysicalAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (auditData: Partial<StockVerificationItem>) => void;
  materials: MaterialMasterItem[];
  warehouses: WarehouseItem[];
}

export const PhysicalAuditModal: React.FC<PhysicalAuditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  materials,
  warehouses,
}) => {
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [materialId, setMaterialId] = useState(materials[0]?.id || '');
  const [physicalStock, setPhysicalStock] = useState<number>(0);
  const [reason, setReason] = useState('Quarterly Physical Inventory Stock Take Audit');

  const selectedMat = materials.find((m) => m.id === materialId);
  const systemStock = selectedMat?.currentStock ?? 0;
  const discrepancy = physicalStock - systemStock;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      warehouseId,
      materialId,
      systemStock,
      physicalStock,
      discrepancy,
      reason,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden my-auto">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-600/30 rounded-xl text-emerald-400 border border-emerald-500/30">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Physical Stock Verification Audit</h2>
              <p className="text-xs text-slate-400">Reconcile physical stock count against ERP system ledger balance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Warehouse Yard *</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Material SKU *</label>
            <select
              value={materialId}
              onChange={(e) => {
                setMaterialId(e.target.value);
                const mat = materials.find((m) => m.id === e.target.value);
                setPhysicalStock(mat?.currentStock ?? 0);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.itemCode}] {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">ERP System Stock</span>
              <div className="text-lg font-black text-slate-900 dark:text-white">{systemStock}</div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Audited Physical Stock *</label>
              <input
                type="number"
                required
                min="0"
                value={physicalStock}
                onChange={(e) => setPhysicalStock(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base font-black"
              />
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Variance / Discrepancy:</span>
              <span className={`text-sm font-black px-2.5 py-0.5 rounded-md ${
                discrepancy === 0
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : discrepancy > 0
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {discrepancy > 0 ? `+${discrepancy}` : discrepancy}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Audit Variance Reason & Justification</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              placeholder="State reason for stock difference (damage, unrecorded issue, scrap)..."
            />
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Record Audit & Auto-Adjust</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
