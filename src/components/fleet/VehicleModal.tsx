import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleStatus, FuelType } from '../../types/fleet';
import { X, Truck, ShieldAlert, Calendar, UserCheck, Building2, MapPin } from 'lucide-react';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: Partial<Vehicle>) => void;
  initialData?: Vehicle | null;
  drivers: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  drivers,
  projects,
}) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    vehicleNumber: '',
    vehicleType: 'TRUCK',
    manufacturer: '',
    model: '',
    year: new Date().getFullYear(),
    chassisNumber: '',
    engineNumber: '',
    fuelType: 'DIESEL',
    tankCapacityLiters: 250,
    currentOdometerKm: 0,
    status: 'AVAILABLE',
    assignedProjectId: '',
    assignedProjectName: '',
    assignedDriverId: '',
    assignedDriverName: '',
    insurancePolicyNumber: '',
    insuranceExpiry: '',
    rcExpiry: '',
    fitnessExpiry: '',
    pollutionExpiry: '',
    permitExpiry: '',
    roadTaxExpiry: '',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        vehicleNumber: '',
        vehicleType: 'TRUCK',
        manufacturer: '',
        model: '',
        year: new Date().getFullYear(),
        chassisNumber: '',
        engineNumber: '',
        fuelType: 'DIESEL',
        tankCapacityLiters: 250,
        currentOdometerKm: 0,
        status: 'AVAILABLE',
        assignedProjectId: projects[0]?.id || '',
        assignedProjectName: projects[0]?.name || '',
        assignedDriverId: '',
        assignedDriverName: '',
        insurancePolicyNumber: '',
        insuranceExpiry: '2027-01-01',
        rcExpiry: '2037-01-01',
        fitnessExpiry: '2027-01-01',
        pollutionExpiry: '2026-12-31',
        permitExpiry: '2027-01-01',
        roadTaxExpiry: '2027-01-01',
        notes: '',
      });
    }
  }, [initialData, isOpen, projects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleNumber || !formData.manufacturer || !formData.model) return;
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

  const handleDriverChange = (drvId: string) => {
    const selected = drivers.find(d => d.id === drvId);
    setFormData(prev => ({
      ...prev,
      assignedDriverId: drvId,
      assignedDriverName: selected ? selected.name : '',
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B192C] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Edit Vehicle Master' : 'Register New Fleet Vehicle'}
              </h2>
              <p className="text-xs text-slate-400">Specify specs, compliance certificates, & assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Basic Specifications */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4" /> Vehicle Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Vehicle Registration No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-01-EQ-9842"
                  value={formData.vehicleNumber || ''}
                  onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Vehicle Type</label>
                <select
                  value={formData.vehicleType || 'TRUCK'}
                  onChange={e => setFormData({ ...formData, vehicleType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TRUCK font-sans">Heavy Truck</option>
                  <option value="TIPPER">Tipper / Dumper</option>
                  <option value="CRANE">Mobile Crane</option>
                  <option value="EXCAVATOR">Excavator Mounted</option>
                  <option value="PICKUP">Site Pick-up</option>
                  <option value="BUS">Staff Bus</option>
                  <option value="TRAILER">Flatbed Trailer</option>
                  <option value="CONCRETE_MIXER">Concrete Transit Mixer</option>
                  <option value="CAR">Inspection SUV / Car</option>
                  <option value="TRACTOR">Tractor Utility</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Status</label>
                <select
                  value={formData.status || 'AVAILABLE'}
                  onChange={e => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AVAILABLE">Available (In Yard)</option>
                  <option value="IN_USE">In Use / Dispatched</option>
                  <option value="MAINTENANCE">Under Scheduled Maintenance</option>
                  <option value="BREAKDOWN">Breakdown / Repair</option>
                  <option value="DECOMMISSIONED">Decommissioned</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Manufacturer *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Volvo, Tata, Ashok Leyland"
                  value={formData.manufacturer || ''}
                  onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FMX 440 / Prima 3530"
                  value={formData.model || ''}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Manufacturing Year</label>
                <input
                  type="number"
                  value={formData.year || new Date().getFullYear()}
                  onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Chassis Number</label>
                <input
                  type="text"
                  placeholder="VIN / Chassis No."
                  value={formData.chassisNumber || ''}
                  onChange={e => setFormData({ ...formData, chassisNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Engine Number</label>
                <input
                  type="text"
                  placeholder="Engine Serial No."
                  value={formData.engineNumber || ''}
                  onChange={e => setFormData({ ...formData, engineNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Fuel Type</label>
                <select
                  value={formData.fuelType || 'DIESEL'}
                  onChange={e => setFormData({ ...formData, fuelType: e.target.value as FuelType })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DIESEL">Diesel</option>
                  <option value="PETROL">Petrol</option>
                  <option value="CNG">CNG</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Tank Capacity (Liters)</label>
                <input
                  type="number"
                  value={formData.tankCapacityLiters || 250}
                  onChange={e => setFormData({ ...formData, tankCapacityLiters: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Odometer Reading (Km)</label>
                <input
                  type="number"
                  value={formData.currentOdometerKm || 0}
                  onChange={e => setFormData({ ...formData, currentOdometerKm: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Project & Driver Deployment */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Deployment & Driver Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Assigned Project</label>
                <select
                  value={formData.assignedProjectId || ''}
                  onChange={e => handleProjectChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Unassigned / Central Fleet Pool --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Assigned Driver</label>
                <select
                  value={formData.assignedDriverId || ''}
                  onChange={e => handleDriverChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Unassigned Driver --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Compliance & Document Expiries */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Statutory Compliance & Expiries
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Insurance Expiry *</label>
                <input
                  type="date"
                  required
                  value={formData.insuranceExpiry || ''}
                  onChange={e => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">RC (Registration) Expiry</label>
                <input
                  type="date"
                  value={formData.rcExpiry || ''}
                  onChange={e => setFormData({ ...formData, rcExpiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Fitness Certificate Expiry</label>
                <input
                  type="date"
                  value={formData.fitnessExpiry || ''}
                  onChange={e => setFormData({ ...formData, fitnessExpiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Pollution (PUC) Expiry</label>
                <input
                  type="date"
                  value={formData.pollutionExpiry || ''}
                  onChange={e => setFormData({ ...formData, pollutionExpiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">National/State Permit Expiry</label>
                <input
                  type="date"
                  value={formData.permitExpiry || ''}
                  onChange={e => setFormData({ ...formData, permitExpiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Road Tax Renewal Date</label>
                <input
                  type="date"
                  value={formData.roadTaxExpiry || ''}
                  onChange={e => setFormData({ ...formData, roadTaxExpiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Operational Remarks / Notes</label>
            <textarea
              rows={2}
              placeholder="Special equipment attachments, condition, or maintenance history..."
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 transition min-h-[44px]"
            >
              {initialData ? 'Save Changes' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
