import React, { useState } from 'react';
import { MaterialMasterItem, WarehouseItem } from '../../types/inventory';
import { ArrowUpRight, Plus, Trash2, X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  materials: MaterialMasterItem[];
  warehouses: WarehouseItem[];
  projects: { id: string; projectName: string }[];
  onSuccess: () => void;
}

export const MaterialIssueModal: React.FC<Props> = ({
  isOpen,
  onClose,
  materials,
  warehouses,
  projects,
  onSuccess,
}) => {
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [wbsCode, setWbsCode] = useState('WBS-CIV-01.2');
  const [boqRef, setBoqRef] = useState('BOQ-ITEM-402');
  const [issuedTo, setIssuedTo] = useState('');
  const [department, setDepartment] = useState('Site Construction');
  const [issuedBy, setIssuedBy] = useState('Store Keeper');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<
    Array<{
      materialId: string;
      requestedQty: number;
      issuedQty: number;
      batchNumber: string;
      remarks: string;
    }>
  >([
    {
      materialId: materials[0]?.id || '',
      requestedQty: 10,
      issuedQty: 10,
      batchNumber: '',
      remarks: 'Issued for foundation slab casting',
    },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const mat = materials[0];
    setItems([
      ...items,
      {
        materialId: mat?.id || '',
        requestedQty: 5,
        issuedQty: 5,
        batchNumber: '',
        remarks: 'Issued for site works',
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
      setError('Please select an issuing warehouse');
      return;
    }

    if (!issuedTo.trim()) {
      setError('Please enter the site engineer / foreman recipient name');
      return;
    }

    if (items.some((i) => !i.materialId || i.issuedQty <= 0)) {
      setError('All items must have a valid material and issued quantity > 0');
      return;
    }

    // Client-side stock check
    for (const item of items) {
      const mat = materials.find((m) => m.id === item.materialId);
      if (mat && mat.currentStock < item.issuedQty) {
        setError(`Insufficient stock for ${mat.name}. Available: ${mat.currentStock}, Requested: ${item.issuedQty}`);
        return;
      }
    }

    setLoading(true);
    try {
      const selectedProj = projects.find((p) => p.id === projectId);
      const token = localStorage.getItem('sitesync_access_token') || localStorage.getItem('token');
      const res = await fetch('/api/inventory/material-issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          warehouseId,
          projectId,
          projectName: selectedProj?.projectName || '',
          wbsCode,
          boqRef,
          department,
          issuedTo,
          issuedBy,
          notes,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to issue materials');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating Material Issue Note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Material Issue Voucher (MIV)</h2>
              <p className="text-xs text-slate-400">Issue store materials to site engineers / construction teams</p>
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Issuing Store / Yard *</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Recipient Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">General Project / Overhead</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Issued To (Person Name) *</label>
              <input
                type="text"
                placeholder="Eng. Ahmed / Foreman John"
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">WBS Activity Code</label>
              <input
                type="text"
                placeholder="e.g. WBS-CIV-01"
                value={wbsCode}
                onChange={(e) => setWbsCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">BOQ Item Ref</label>
              <input
                type="text"
                placeholder="e.g. BOQ-CONC-04"
                value={boqRef}
                onChange={(e) => setBoqRef(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Department / Trade</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Materials to Issue</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs flex items-center space-x-1 text-blue-400 hover:text-blue-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const mat = materials.find((m) => m.id === item.materialId);
                return (
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
                            {m.itemCode} - {m.name} (Stock: {m.currentStock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-1">Requested Qty</label>
                      <input
                        type="number"
                        value={item.requestedQty}
                        onChange={(e) => handleItemChange(index, 'requestedQty', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-1">Issued Qty</label>
                      <input
                        type="number"
                        value={item.issuedQty}
                        onChange={(e) => handleItemChange(index, 'issuedQty', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-blue-400 font-semibold"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[10px] text-slate-400 mb-1">Remarks / Location</label>
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                        placeholder="Purpose or location"
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

                    {mat && (
                      <div className="col-span-12 text-[11px] text-slate-400 flex items-center space-x-2">
                        <span>Current Available Stock: <strong className="text-white">{mat.currentStock}</strong></span>
                        {mat.currentStock < item.issuedQty && (
                          <span className="text-red-400 font-semibold">(INSUFFICIENT STOCK)</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Authorization Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Site supervisor authorization or purpose..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
              className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-500 rounded-lg font-medium flex items-center space-x-2"
            >
              {loading ? (
                <span>Issuing...</span>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Issue Materials & Deduct Stock</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
