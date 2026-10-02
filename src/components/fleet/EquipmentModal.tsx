import React, { useState, useEffect } from 'react';
import { Equipment, EquipmentStatus } from '../../types/fleet';
import { X, Wrench, Building2, User, Clock, MapPin, ShieldCheck } from 'lucide-react';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipmentData: Partial<Equipment>) => void;
  initialData?: Equipment | null;
  projects: { id: string; name: string }[];
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  projects,
}) => {
  const [formData, setFormData] = useState<Partial<Equipment>>({
    equipmentCode: '',
    equipmentName: '',
    category: 'EXCAVATOR',
    manufacturer: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyExpiry: '',
    currentLocation: '',
    assignedProjectId: '',
    assignedProjectName: '',
    assignedOperatorId: '',
    assignedOperatorName: '',
    runningHours: 0,
    fuelCapacityLiters: 300,
    status: 'OPERATIONAL',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        equipmentCode: `EQP-${Math.floor(100 + Math.random() * 900)}`,
        equipmentName: '',
        category: 'EXCAVATOR',
        manufacturer: '',
        model: '',
        serialNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        warrantyExpiry: '2027-01-01',
        currentLocation: 'Central Equipment Yard',
        assignedProjectId: projects[0]?.id || '',
        assignedProjectName: projects[0]?.name || '',
        assignedOperatorId: '',
        assignedOperatorName: '',
        runningHours: 0,
        fuelCapacityLiters: 300,
        status: 'OPERATIONAL',
        notes: '',
      });
    }
  }, [initialData, isOpen, projects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.equipmentName || !formData.manufacturer || !formData.model) return;
    onSave(formData);
    onClose();
  };

  const handleProjectChange = (projId: string) => {
    const selected = projects.find(p => p.id === projId);
    setFormData(prev => ({
      ...prev,
      assignedProjectId: projId,
      assignedProjectName: selected ? selected.name : '',
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 bg-[#0B192C] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Edit Machinery Asset' : 'Register Heavy Equipment Asset'}
              </h2>
              <p className="text-xs text-slate-400">Earthmoving machinery, cranes, generators & plant assets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Equipment Identity & Specs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Equipment Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EQP-EXC-001"
                  value={formData.equipmentCode || ''}
                  onChange={e => setFormData({ ...formData, equipmentCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAT 320D3 Track Hydraulic Excavator"
                  value={formData.equipmentName || ''}
                  onChange={e => setFormData({ ...formData, equipmentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Category</label>
                <select
                  value={formData.category || 'EXCAVATOR'}
                  onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="EXCAVATOR">Hydraulic Excavator</option>
                  <option value="BULLDOZER">Bulldozer / Crawler</option>
                  <option value="TOWER_CRANE">Tower Crane</option>
                  <option value="MOBILE_CRANE">Heavy Mobile Crane</option>
                  <option value="GENERATOR">Silent Diesel Generator</option>
                  <option value="COMPRESSOR">Air Compressor</option>
                  <option value="PUMP">Dewatering / Concrete Pump</option>
                  <option value="CONCRETE_BATCHING">Concrete Batching Plant</option>
                  <option value="LOADER">Wheel Loader</option>
                  <option value="COMPACTOR">Vibratory Soil Compactor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Manufacturer *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Caterpillar, Komatsu, Liebherr"
                  value={formData.manufacturer || ''}
                  onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAT 320D3 / D85ESS"
                  value={formData.model || ''}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Serial Number</label>
                <input
                  type="text"
                  placeholder="Equipment Serial No."
                  value={formData.serialNumber || ''}
                  onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Current Running Hours</label>
                <input
                  type="number"
                  value={formData.runningHours || 0}
                  onChange={e => setFormData({ ...formData, runningHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Fuel Capacity (Liters)</label>
                <input
                  type="number"
                  value={formData.fuelCapacityLiters || 300}
                  onChange={e => setFormData({ ...formData, fuelCapacityLiters: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Operational Status</label>
                <select
                  value={formData.status || 'OPERATIONAL'}
                  onChange={e => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="OPERATIONAL">Operational (Working)</option>
                  <option value="IDLE">Idle / Standby</option>
                  <option value="UNDER_MAINTENANCE">Under Scheduled Maintenance</option>
                  <option value="BREAKDOWN">Breakdown / Out of Order</option>
                  <option value="DECOMMISSIONED">Decommissioned</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Location & Operator Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Current Yard / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Pier #42 Trench Site"
                  value={formData.currentLocation || ''}
                  onChange={e => setFormData({ ...formData, currentLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Assigned Project</label>
                <select
                  value={formData.assignedProjectId || ''}
                  onChange={e => handleProjectChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Unassigned Equipment --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Assigned Operator Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.assignedOperatorName || ''}
                  onChange={e => setFormData({ ...formData, assignedOperatorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Warranty & Procurement
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchaseDate || ''}
                  onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Warranty Expiry Date</label>
                <input
                  type="date"
                  value={formData.warrantyExpiry || ''}
                  onChange={e => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Asset Operational Remarks</label>
            <textarea
              rows={2}
              placeholder="Maintenance history notes, specialized attachments..."
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition min-h-[44px]"
            >
              {initialData ? 'Save Equipment' : 'Register Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
