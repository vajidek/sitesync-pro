import React, { useState, useEffect } from 'react';
import { Driver, DriverStatus } from '../../types/fleet';
import { X, UserCheck, Shield, Phone, Mail, Award, AlertCircle } from 'lucide-react';

interface DriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (driverData: Partial<Driver>) => void;
  initialData?: Driver | null;
  vehicles: { id: string; number: string }[];
}

export const DriverModal: React.FC<DriverModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  vehicles,
}) => {
  const [formData, setFormData] = useState<Partial<Driver>>({
    driverName: '',
    licenseNumber: '',
    licenseCategory: 'HEAVY_COMMERCIAL',
    licenseExpiry: '2028-01-01',
    medicalExpiry: '2027-01-01',
    assignedVehicleId: '',
    assignedVehicleNumber: '',
    experienceYears: 5,
    contactNumber: '',
    email: '',
    emergencyContactName: '',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        driverName: '',
        licenseNumber: '',
        licenseCategory: 'HEAVY_COMMERCIAL',
        licenseExpiry: '2028-01-01',
        medicalExpiry: '2027-01-01',
        assignedVehicleId: '',
        assignedVehicleNumber: '',
        experienceYears: 5,
        contactNumber: '',
        email: '',
        emergencyContactName: '',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '',
        status: 'ACTIVE',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.driverName || !formData.licenseNumber || !formData.contactNumber) return;
    onSave(formData);
    onClose();
  };

  const handleVehicleChange = (vId: string) => {
    const selected = vehicles.find(v => v.id === vId);
    setFormData(prev => ({
      ...prev,
      assignedVehicleId: vId,
      assignedVehicleNumber: selected ? selected.number : '',
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 bg-[#0B192C] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/40">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Edit Driver Profile' : 'Register New Fleet Driver'}
              </h2>
              <p className="text-xs text-slate-400">Driver licensing, experience, & emergency contact details</p>
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Personal & License Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Driver Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.driverName || ''}
                  onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">License Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-0420110098421"
                  value={formData.licenseNumber || ''}
                  onChange={e => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">License Category</label>
                <select
                  value={formData.licenseCategory || 'HEAVY_COMMERCIAL'}
                  onChange={e => setFormData({ ...formData, licenseCategory: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="HEAVY_COMMERCIAL">Heavy Commercial Vehicle (HCV)</option>
                  <option value="LIGHT_COMMERCIAL">Light Commercial Vehicle (LCV)</option>
                  <option value="HEAVY_EQUIPMENT">Heavy Earthmoving Equipment</option>
                  <option value="CRANE_OPERATOR">Specialized Crane Operator</option>
                  <option value="ALL_VEHICLES">All Commercial & Earthmoving</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Driving Experience (Years)</label>
                <input
                  type="number"
                  value={formData.experienceYears || 5}
                  onChange={e => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">License Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={formData.licenseExpiry || ''}
                  onChange={e => setFormData({ ...formData, licenseExpiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Medical Certificate Expiry</label>
                <input
                  type="date"
                  value={formData.medicalExpiry || ''}
                  onChange={e => setFormData({ ...formData, medicalExpiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Contact & Vehicle Allocation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Mobile Contact No. *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98450 12345"
                  value={formData.contactNumber || ''}
                  onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="driver@company.com"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Assigned Vehicle</label>
                <select
                  value={formData.assignedVehicleId || ''}
                  onChange={e => handleVehicleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-mono"
                >
                  <option value="">-- No Permanent Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Duty Status</label>
                <select
                  value={formData.status || 'ACTIVE'}
                  onChange={e => setFormData({ ...formData, status: e.target.value as DriverStatus })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ACTIVE">Active (On Duty)</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Emergency Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse / Brother"
                  value={formData.emergencyContactName || ''}
                  onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="Spouse / Father / Relative"
                  value={formData.emergencyContactRelation || ''}
                  onChange={e => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Emergency Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98450 99999"
                  value={formData.emergencyContactPhone || ''}
                  onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition min-h-[44px]"
            >
              {initialData ? 'Update Profile' : 'Register Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
