import React, { useState } from 'react';
import { MaterialMasterItem, WarehouseItem } from '../../types/inventory';
import { RefreshCw, Plus, Trash2, X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  materials: MaterialMasterItem[];
  warehouses: WarehouseItem[];
  onSuccess: () => void;
}

export const MaterialReturnModal: React.FC<Props> = ({
  isOpen,
  onClose,
  materials,
  warehouses,
  onSuccess,
}) => {
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [returnType, setReturnType] = useState('SITE_TO_STORE');
  const [returnedBy, setReturnedBy] = useState('');
  const [reason, setReason] = useState('Site completion surplus');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<
    Array<{
      materialId: string;
      returnedQty: number;
      condition: string;
      remarks: string;
    }>
  >([
    {
      materialId: materials[0]?.id || '',
      returnedQty: 5,
      condition: 'GOOD',
      remarks: 'Unopened original packing',
    },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const mat = materials[0];
    setItems([
      ...items,
      {
        materialId: mat?.id || '',
        returnedQty: 2,
        condition: 'GOOD',
        remarks: 'Surplus item',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!warehouseId) {
      setError('Please select receiving store');
      return;
    }

    if (!returnedBy.trim()) {
      setError('Please enter returned by officer name');
      return;
    }

    if (items.some((i) => !i.materialId || i.returnedQty <= 0)) {
      setError('All return lines must have a valid material and quantity > 0');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token') || localStorage.getItem('token');
      const res = await fetch('/api/inventory/material-returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          warehouseId,
          returnType,
          returnedBy,
          reason,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process Material Return');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Material Return & Credit Note</h2>
              <p className="text-xs text-slate-400">Return unused, damaged, or excess material from site back to store</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Receiving Warehouse *</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Return Category</label>
              <select
                value={returnType}
                onChange={(e) => setReturnType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="SITE_TO_STORE">Site to Store Surplus</option>
                <option value="VENDOR_RETURN">Return to Vendor (RTV)</option>
                <option value="DAMAGED">Damaged Goods Return</option>
                <option value="SCRAP">Scrap / Off-cut Return</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Returned By (Officer) *</label>
              <input
                type="text"
                placeholder="Eng. Salim / Subcontractor Name"
                value={returnedBy}
                onChange={(e) => setReturnedBy(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Returned Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs flex items-center space-x-1 text-amber-400 hover:text-amber-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="p-4 bg-slate-800/50 border border-slate-800 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-4">
                    <label className="block text-[10px] text-slate-400 mb-1">Material Item</label>
                    <select
                      value={item.materialId}
                      onChange={(e) => handleItemChange(index, 'materialId', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                    >
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.itemCode} - {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">Returned Qty</label>
                    <input
                      type="number"
                      value={item.returnedQty}
                      onChange={(e) => handleItemChange(index, 'returnedQty', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-amber-400 font-semibold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">Condition</label>
                    <select
                      value={item.condition}
                      onChange={(e) => handleItemChange(index, 'condition', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                    >
                      <option value="GOOD">Good / Reusable</option>
                      <option value="DAMAGED">Damaged (Needs Repair)</option>
                      <option value="SCRAP">Scrap / Waste</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[10px] text-slate-400 mb-1">Condition Notes</label>
                    <input
                      type="text"
                      value={item.remarks}
                      onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                      placeholder="Remarks"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="md:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded"
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Return Reason / Justification</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why materials are being returned..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

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
              className="px-5 py-2 bg-amber-600 text-white hover:bg-amber-500 rounded-lg font-medium flex items-center space-x-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Receive Return & Credit Stock</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
