import React, { useState } from 'react';
import { TripLog } from '../../types/fleet';
import { X, Navigation, Truck, UserCheck, MapPin, Building2, FileCheck } from 'lucide-react';

interface TripLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trip: Partial<TripLog>) => void;
  vehicles: { id: string; number: string; driverName?: string; driverId?: string }[];
  drivers: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}

export const TripLogModal: React.FC<TripLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  vehicles,
  drivers,
  projects,
}) => {
  const [formData, setFormData] = useState<Partial<TripLog>>({
    vehicleId: vehicles[0]?.id || '',
    vehicleNumber: vehicles[0]?.number || '',
    driverId: drivers[0]?.id || '',
    driverName: drivers[0]?.name || '',
    origin: '',
    destination: '',
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.name || '',
    purpose: 'MATERIAL_TRANSPORT',
    startTime: new Date().toISOString().slice(0, 16),
    startOdometerKm: 45000,
    gatePassRef: '',
    notes: '',
    status: 'ONGOING',
  });

  if (!isOpen) return null;

  const handleVehicleChange = (vId: string) => {
    const selected = vehicles.find(v => v.id === vId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        vehicleId: selected.id,
        vehicleNumber: selected.number,
        driverId: selected.driverId || prev.driverId,
        driverName: selected.driverName || prev.driverName,
      }));
    }
  };

  const handleDriverChange = (dId: string) => {
    const selected = drivers.find(d => d.id === dId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        driverId: selected.id,
        driverName: selected.name,
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
    if (!formData.vehicleId || !formData.origin || !formData.destination) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 bg-[#0B192C] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-teal-600/30 text-teal-400 border border-teal-500/40">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Dispatch Vehicle / Log Trip</h2>
              <p className="text-xs text-slate-400">Record vehicle movement, gate pass, origin & destination</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Select Vehicle *</label>
              <select
                value={formData.vehicleId || ''}
                onChange={e => handleVehicleChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 font-mono"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Assigned Driver *</label>
              <select
                value={formData.driverId || ''}
                onChange={e => handleDriverChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Origin Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Kudlu Quarry Pit #3"
                value={formData.origin || ''}
                onChange={e => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Destination Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Peruvannamuzhi WTP Site 1"
                value={formData.destination || ''}
                onChange={e => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Assigned Project</label>
              <select
                value={formData.projectId || ''}
                onChange={e => handleProjectChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Trip Purpose</label>
              <select
                value={formData.purpose || 'MATERIAL_TRANSPORT'}
                onChange={e => setFormData({ ...formData, purpose: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="MATERIAL_TRANSPORT">Material Haulage</option>
                <option value="EQUIPMENT_MOVE">Equipment / Girder Move</option>
                <option value="SITE_TRANSIT">Site Transit & Inspection</option>
                <option value="EXECUTIVE_TRAVEL">Executive Transport</option>
                <option value="MAINTENANCE_RUN">Workshop Maintenance Run</option>
                <option value="OTHER">Other Purpose</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Departure Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.startTime || ''}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Start Odometer Reading (Km)</label>
              <input
                type="number"
                value={formData.startOdometerKm || 0}
                onChange={e => setFormData({ ...formData, startOdometerKm: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Gate Pass Ref. Number</label>
              <input
                type="text"
                placeholder="e.g. GP-2026-98102"
                value={formData.gatePassRef || ''}
                onChange={e => setFormData({ ...formData, gatePassRef: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Trip Dispatch Status</label>
              <select
                value={formData.status || 'ONGOING'}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="ONGOING">Ongoing (Dispatched)</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Cargo Details / Notes</label>
            <input
              type="text"
              placeholder="e.g. 28 Tons Grade A Aggregate for Pier #42"
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
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
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-lg shadow-teal-600/30 transition min-h-[44px]"
            >
              Dispatch Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
