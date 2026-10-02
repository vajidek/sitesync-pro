import React, { useState } from 'react';
import { MaterialMasterItem, WarehouseItem } from '../../types/inventory';
import { PackageCheck, Plus, Trash2, X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  materials: MaterialMasterItem[];
  warehouses: WarehouseItem[];
  onSuccess: () => void;
}

export const GoodsReceiptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  materials,
  warehouses,
  onSuccess,
}) => {
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [poNumber, setPoNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [deliveryNoteNo, setDeliveryNoteNo] = useState('');
  const [qcStatus, setQcStatus] = useState('PASSED');
  const [receivedBy, setReceivedBy] = useState('Store Keeper');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<
    Array<{
      materialId: string;
      orderedQty: number;
      receivedQty: number;
      acceptedQty: number;
      rejectedQty: number;
      unitPrice: number;
      batchNumber: string;
      remarks: string;
    }>
  >([
    {
      materialId: materials[0]?.id || '',
      orderedQty: 100,
      receivedQty: 100,
      acceptedQty: 100,
      rejectedQty: 0,
      unitPrice: materials[0]?.unitPrice || 0,
      batchNumber: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      remarks: 'Inspected and verified',
    },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const mat = materials[0];
    setItems([
      ...items,
      {
        materialId: mat?.id || '',
        orderedQty: 50,
        receivedQty: 50,
        acceptedQty: 50,
        rejectedQty: 0,
        unitPrice: mat?.unitPrice || 0,
        batchNumber: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
        remarks: 'Inspected',
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
    const curr = { ...updated[index], [field]: value };

    if (field === 'materialId') {
      const mat = materials.find((m) => m.id === value);
      if (mat) {
        curr.unitPrice = mat.unitPrice;
      }
    }

    if (field === 'receivedQty' || field === 'rejectedQty') {
      const rec = Number(curr.receivedQty || 0);
      const rej = Number(curr.rejectedQty || 0);
      curr.acceptedQty = Math.max(0, rec - rej);
    }

    updated[index] = curr;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!warehouseId) {
      setError('Please select a receiving warehouse');
      return;
    }

    if (items.some((i) => !i.materialId || i.receivedQty <= 0)) {
      setError('Each line item must have a valid material and received quantity > 0');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token') || localStorage.getItem('token');
      const res = await fetch('/api/inventory/goods-receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          warehouseId,
          poNumber,
          vendorName,
          deliveryNoteNo,
          qcStatus,
          receivedBy,
          notes,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create Goods Receipt Note');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating GRN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">New Goods Receipt Note (GRN)</h2>
              <p className="text-xs text-slate-400">Receive incoming materials into warehouse inventory</p>
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
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Purchase Order Ref (PO#)</label>
              <input
                type="text"
                placeholder="e.g. PO-2026-9012"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Vendor Name</label>
              <input
                type="text"
                placeholder="Vendor / Supplier Name"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Delivery Note / Invoice #</label>
              <input
                type="text"
                placeholder="DN-88492"
                value={deliveryNoteNo}
                onChange={(e) => setDeliveryNoteNo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">QC Inspection Status</label>
              <select
                value={qcStatus}
                onChange={(e) => setQcStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="PASSED">PASSED (Accept All)</option>
                <option value="CONDITIONAL_PASS">CONDITIONAL PASS</option>
                <option value="FAILED">FAILED (Quarantine/Return)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Received By</label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Line Items Received</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs flex items-center space-x-1 text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="p-4 bg-slate-800/50 border border-slate-800 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-3">
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
                    <label className="block text-[10px] text-slate-400 mb-1">Ordered / Rec Qty</label>
                    <div className="flex space-x-1">
                      <input
                        type="number"
                        placeholder="Ord"
                        value={item.orderedQty}
                        onChange={(e) => handleItemChange(index, 'orderedQty', Number(e.target.value))}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                      />
                      <input
                        type="number"
                        placeholder="Rec"
                        value={item.receivedQty}
                        onChange={(e) => handleItemChange(index, 'receivedQty', Number(e.target.value))}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">Accepted / Rej Qty</label>
                    <div className="flex space-x-1">
                      <input
                        type="number"
                        placeholder="Acc"
                        value={item.acceptedQty}
                        onChange={(e) => handleItemChange(index, 'acceptedQty', Number(e.target.value))}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-emerald-400 font-semibold"
                      />
                      <input
                        type="number"
                        placeholder="Rej"
                        value={item.rejectedQty}
                        onChange={(e) => handleItemChange(index, 'rejectedQty', Number(e.target.value))}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-red-400"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">Unit Price (AED)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">Batch / Heat #</label>
                    <input
                      type="text"
                      value={item.batchNumber}
                      onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
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
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes & Delivery Remarks</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Store inspector notes or physical condition remarks..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
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
              className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg font-medium flex items-center space-x-2"
            >
              {loading ? (
                <span>Creating GRN...</span>
              ) : (
                <>
                  <PackageCheck className="w-4 h-4" />
                  <span>Submit GRN & Add Stock</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
