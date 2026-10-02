import React, { useState } from 'react';
import { MaintenanceRecord, MaintenanceType, MaintenanceCategory, MaintenanceStatus, AssetType } from '../../types/fleet';
import { X, Wrench, Calendar, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Partial<MaintenanceRecord>) => void;
  assets: { id: string; name: string; code: string; type: AssetType }[];
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assets,
}) => {
  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>({
    assetType: 'VEHICLE',
    assetId: assets[0]?.id || '',
    assetName: assets[0]?.name || '',
    assetCode: assets[0]?.code || '',
    maintenanceType: 'PREVENTIVE',
    category: 'OIL_CHANGE',
    serviceDate: new Date().toISOString().split('T')[0],
    completionDate: '',
    costAmount: 15000,
    vendorName: '',
    invoiceNumber: '',
    description: '',
    performedBy: '',
    status: 'IN_PROGRESS',
    nextServiceDueDate: '2026-11-01',
  });

  if (!isOpen) return null;

  const handleAssetChange = (assetId: string) => {
    const selected = assets.find(a => a.id === assetId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        assetId: selected.id,
        assetName: selected.name,
        assetCode: selected.code,
        assetType: selected.type,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.vendorName || !formData.description) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 bg-[#0B192C] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-600/30 text-amber-400 border border-amber-500/40">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Log Asset Service / Maintenance</h2>
              <p className="text-xs text-slate-400">Record preventive, breakdown, oil change & workshop repairs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Select Fleet Asset *</label>
            <select
              value={formData.assetId || ''}
              onChange={e => handleAssetChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-mono"
            >
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  [{a.type}] {a.code} - {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Maintenance Type</label>
              <select
                value={formData.maintenanceType || 'PREVENTIVE'}
                onChange={e => setFormData({ ...formData, maintenanceType: e.target.value as MaintenanceType })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="PREVENTIVE">Preventive Maintenance</option>
                <option value="BREAKDOWN">Emergency Breakdown Repair</option>
                <option value="SCHEDULED_SERVICE">Scheduled Milestone Service</option>
                <option value="INSPECTION">Inspection & Safety Audit</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Category / Component</label>
              <select
                value={formData.category || 'OIL_CHANGE'}
                onChange={e => setFormData({ ...formData, category: e.target.value as MaintenanceCategory })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="OIL_CHANGE">Oil & Lubricant Change</option>
                <option value="FILTER_CHANGE">Fuel / Air / Oil Filters</option>
                <option value="BATTERY">Battery Replacement / Electrical</option>
                <option value="TYRES">Tyre Change / Alignment</option>
                <option value="HYDRAULIC">Hydraulic Pump / Hoses</option>
                <option value="ENGINE">Engine Repair / Overhaul</option>
                <option value="TRANSMISSION">Transmission & Gearbox</option>
                <option value="BRAKE_SYSTEM">Brake Pads & Pneumatics</option>
                <option value="GENERAL_SERVICE">General Periodic Service</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Service Start Date *</label>
              <input
                type="date"
                required
                value={formData.serviceDate || ''}
                onChange={e => setFormData({ ...formData, serviceDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Status</label>
              <select
                value={formData.status || 'IN_PROGRESS'}
                onChange={e => setFormData({ ...formData, status: e.target.value as MaintenanceStatus })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress / At Workshop</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Service Cost (₹) *</label>
              <input
                type="number"
                required
                value={formData.costAmount || 0}
                onChange={e => setFormData({ ...formData, costAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Vendor / Workshop *</label>
              <input
                type="text"
                required
                placeholder="e.g. Authorized Dealer / In-house Workshop"
                value={formData.vendorName || ''}
                onChange={e => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Invoice / Ref No.</label>
              <input
                type="text"
                placeholder="e.g. INV-2026-994"
                value={formData.invoiceNumber || ''}
                onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Performed By / Technician</label>
              <input
                type="text"
                placeholder="e.g. Senior Tech Engineer"
                value={formData.performedBy || ''}
                onChange={e => setFormData({ ...formData, performedBy: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Service Notes / Parts Replaced *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe work done, oil grade used, replacement parts..."
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30 transition min-h-[44px]"
            >
              Save Maintenance Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
