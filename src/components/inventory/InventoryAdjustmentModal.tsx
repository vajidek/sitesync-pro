import React, { useState } from 'react';
import { MaterialMasterItem, WarehouseItem } from '../../types/inventory';
import { AlertTriangle, X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  materials: MaterialMasterItem[];
  warehouses: WarehouseItem[];
  onSuccess: () => void;
}

export const InventoryAdjustmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  materials,
  warehouses,
  onSuccess,
}) => {
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [materialId, setMaterialId] = useState(materials[0]?.id || '');
  const [adjustmentType, setAdjustmentType] = useState('SURPLUS');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('Stock audit count adjustment');
  const [adjustedBy, setAdjustedBy] = useState('Inventory Auditor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!warehouseId || !materialId || quantity <= 0) {
      setError('Please fill in warehouse, material, and a positive quantity');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token') || localStorage.getItem('token');
      const res = await fetch('/api/inventory/adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          warehouseId,
          materialId,
          adjustmentType,
          quantity,
          reason,
          adjustedBy,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process inventory adjustment');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating adjustment');
    } finally {
      setLoading(false);
    }
  };

  const selectedMaterial = materials.find((m) => m.id === materialId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Stock Adjustment & Write-off</h2>
              <p className="text-xs text-slate-400">Record stock variance, damage, scrap or audit discrepancy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Warehouse *</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
              required
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Material Item *</label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
              required
            >
              <option value="">Select Material</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.itemCode} - {m.name} (Stock: {m.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Adjustment Type *</label>
              <select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
              >
                <option value="SURPLUS">SURPLUS (Increase Stock +)</option>
                <option value="DEFICIT">DEFICIT (Decrease Stock -)</option>
                <option value="DAMAGE">DAMAGE WRITE-OFF (-)</option>
                <option value="SCRAP">SCRAP (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Auditor / Officer Name</label>
            <input
              type="text"
              value={adjustedBy}
              onChange={(e) => setAdjustedBy(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Reason / Audit Justification</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detailed justification for stock adjustment..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {selectedMaterial && (
            <div className="p-3 bg-slate-800/80 rounded-lg text-xs text-slate-300 flex items-center justify-between">
              <span>Current Stock: <strong className="text-white">{selectedMaterial.currentStock}</strong></span>
              <span>Unit Price: <strong className="text-emerald-400">AED {selectedMaterial.unitPrice}</strong></span>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-red-600 text-white hover:bg-red-500 rounded-lg font-medium flex items-center space-x-2"
            >
              {loading ? (
                <span>Adjusting...</span>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Post Adjustment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
