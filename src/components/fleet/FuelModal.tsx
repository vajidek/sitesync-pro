import React, { useState } from 'react';
import { FuelLog, AssetType } from '../../types/fleet';
import { X, Fuel, Building2, MapPin, Calculator, Calendar } from 'lucide-react';

interface FuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: Partial<FuelLog>) => void;
  assets: { id: string; name: string; code: string; type: AssetType }[];
  projects: { id: string; name: string }[];
}

export const FuelModal: React.FC<FuelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assets,
  projects,
}) => {
  const [formData, setFormData] = useState<Partial<FuelLog>>({
    assetType: 'VEHICLE',
    assetId: assets[0]?.id || '',
    assetName: assets[0]?.name || '',
    assetCode: assets[0]?.code || '',
    quantityLiters: 150,
    unitPrice: 92.50,
    fuelStation: 'Site Mobile Bowser Unit',
    odometerReadingKm: 45000,
    runningHours: 0,
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.name || '',
    filledByName: 'Site Storekeeper',
    fillDate: new Date().toISOString().split('T')[0],
    remarks: '',
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

  const handleProjectChange = (pId: string) => {
    const selected = projects.find(p => p.id === pId);
    setFormData(prev => ({
      ...prev,
      projectId: pId,
      projectName: selected ? selected.name : '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.quantityLiters) return;
    onSave(formData);
    onClose();
  };

  const calculatedTotal = (Number(formData.quantityLiters) || 0) * (Number(formData.unitPrice) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 bg-[#0B192C] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-orange-600/30 text-orange-400 border border-orange-500/40">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Record Fuel Refill & Issue</h2>
              <p className="text-xs text-slate-400">Diesel / petrol refill, odometer reading & efficiency log</p>
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
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Select Asset *</label>
            <select
              value={formData.assetId || ''}
              onChange={e => handleAssetChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 font-mono"
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
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Quantity (Liters) *</label>
              <input
                type="number"
                required
                step="0.1"
                placeholder="e.g. 200"
                value={formData.quantityLiters || ''}
                onChange={e => setFormData({ ...formData, quantityLiters: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 font-mono text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Rate per Liter (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.unitPrice || 92.50}
                onChange={e => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 font-mono"
              />
            </div>

            {formData.assetType === 'VEHICLE' ? (
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Odometer Reading (Km)</label>
                <input
                  type="number"
                  placeholder="e.g. 45280"
                  value={formData.odometerReadingKm || ''}
                  onChange={e => setFormData({ ...formData, odometerReadingKm: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Running Hour Meter</label>
                <input
                  type="number"
                  placeholder="e.g. 3450"
                  value={formData.runningHours || ''}
                  onChange={e => setFormData({ ...formData, runningHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Fuel Station / Bowser</label>
              <input
                type="text"
                placeholder="e.g. Indian Oil / Site Bowser #2"
                value={formData.fuelStation || ''}
                onChange={e => setFormData({ ...formData, fuelStation: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Charged to Project</label>
              <select
                value={formData.projectId || ''}
                onChange={e => handleProjectChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Fill Date *</label>
              <input
                type="date"
                required
                value={formData.fillDate || ''}
                onChange={e => setFormData({ ...formData, fillDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Calculated Refill Total:</span>
            <span className="text-base font-black text-orange-600 dark:text-orange-400 font-mono">
              ₹ {calculatedTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Remarks / Note</label>
            <input
              type="text"
              placeholder="e.g. Refueled for night shift concreting haulage"
              value={formData.remarks || ''}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
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
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-lg shadow-orange-600/30 transition min-h-[44px]"
            >
              Record Fuel Refill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
