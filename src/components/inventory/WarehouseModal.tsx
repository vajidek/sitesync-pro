import React, { useState, useEffect } from 'react';
import { X, Save, Warehouse, MapPin, User, HardDrive } from 'lucide-react';
import { WarehouseItem } from '../../types/inventory';

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (whData: Partial<WarehouseItem>) => void;
  warehouse?: WarehouseItem | null;
  projects: { id: string; projectName: string }[];
}

export const WarehouseModal: React.FC<WarehouseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  warehouse,
  projects,
}) => {
  const [formData, setFormData] = useState<Partial<WarehouseItem>>({
    code: '',
    name: '',
    type: 'PROJECT',
    location: '',
    managerName: '',
    capacity: 10000,
  });

  useEffect(() => {
    if (warehouse) {
      setFormData(warehouse);
    } else {
      setFormData({
        code: `WH-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        type: 'PROJECT',
        location: 'Site Compound Yard Sector 1',
        managerName: 'Ramesh Patel',
        capacity: 10000,
      });
    }
  }, [warehouse, isOpen]);

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
            <div className="p-2 bg-teal-600/30 rounded-xl text-teal-400 border border-teal-500/30">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {warehouse ? `Edit Store Yard (${warehouse.code})` : 'Register New Store / Warehouse Yard'}
              </h2>
              <p className="text-xs text-slate-400">Configure central, regional, or temporary site store yards</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Warehouse Code *</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold"
                placeholder="e.g. WH-CENTRAL-AUH"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Store Role / Type *</label>
              <select
                value={formData.type || 'PROJECT'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              >
                <option value="CENTRAL">Central Store Yard</option>
                <option value="REGIONAL">Regional Depot Store</option>
                <option value="PROJECT">Project Site Buffer Store</option>
                <option value="SITE_TEMP">Temporary Mobile Site Store</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Warehouse Yard Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
                placeholder="e.g. Abu Dhabi Central Yard Warehouse"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Physical Location Address</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                placeholder="e.g. Mussafah Zone 12, Abu Dhabi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Store Manager / Keeper</label>
              <input
                type="text"
                value={formData.managerName || ''}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
                placeholder="Ramesh Patel"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Storage Capacity (SQM / MT)</label>
              <input
                type="number"
                value={formData.capacity ?? 10000}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
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
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-500/20 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{warehouse ? 'Update Warehouse' : 'Save Warehouse Yard'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
