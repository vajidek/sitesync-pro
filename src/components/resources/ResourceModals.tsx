import React, { useState } from 'react';
import { X, Calendar, Layers, CheckCircle2, AlertTriangle, Building2, User, Wrench, Shield, ArrowRight } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const CreatePlanModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    projectId: 'PRJ-101',
    departmentId: 'DEP-CIVIL',
    planType: 'PROJECT',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    isRecurring: false,
    recurrenceInterval: 'MONTHLY',
    remarks: '',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Create Resource Plan
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Plan Title / Objective *</label>
            <input
              type="text"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Phase 2 Trenching & Piping Resource Allocation Plan"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Project</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              >
                <option value="PRJ-101">PRJ-101: Water Transmission Pipeline Phase 2</option>
                <option value="PRJ-102">PRJ-102: Central Water Reservoir Construction</option>
                <option value="PRJ-103">PRJ-103: Pumping Station Refurbishment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                <option value="DEP-CIVIL">Civil Construction</option>
                <option value="DEP-MECH">Mechanical & Piping</option>
                <option value="DEP-ELEC">Electrical & Instrumentation</option>
                <option value="DEP-LOGISTICS">Logistics & Heavy Fleet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Start Date *</label>
              <input
                type="date"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">End Date *</label>
              <input
                type="date"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-0"
            />
            <label htmlFor="isRecurring" className="text-xs text-slate-300 font-medium cursor-pointer">
              Enable Recurring Planning Schedule
            </label>
            {formData.isRecurring && (
              <select
                className="ml-auto bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-white"
                value={formData.recurrenceInterval}
                onChange={(e) => setFormData({ ...formData, recurrenceInterval: e.target.value })}
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Planning Remarks / Justification</label>
            <textarea
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="Specify requirements, constraints, and dependencies..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
            >
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AllocateResourceModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    resourceId: 'EQP-CAT-320',
    resourceType: 'EQUIPMENT',
    projectId: 'PRJ-101',
    departmentId: 'DEP-CIVIL',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    allocatedQty: 1,
    workingHoursPerDay: 8,
    priority: 'HIGH',
    remarks: '',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            Allocate Resource to Project / Department
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Resource Category</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.resourceType}
                onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
              >
                <option value="EQUIPMENT">Heavy Equipment & Machinery</option>
                <option value="EMPLOYEE">Key Personnel / Engineer</option>
                <option value="CREW">Construction Crew</option>
                <option value="VEHICLE">Transport Vehicle</option>
                <option value="CONTRACTOR">Subcontractor Workforce</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Select Resource Code / ID *</label>
              <input
                type="text"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. EQP-CAT-320 or EMP-ENG-104"
                value={formData.resourceId}
                onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Project</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              >
                <option value="PRJ-101">PRJ-101: Water Transmission Pipeline Phase 2</option>
                <option value="PRJ-102">PRJ-102: Central Water Reservoir Construction</option>
                <option value="PRJ-103">PRJ-103: Pumping Station Refurbishment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Allocation Priority</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="CRITICAL">Critical Site Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Start Date *</label>
              <input
                type="date"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">End Date *</label>
              <input
                type="date"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Quantity / Count</label>
              <input
                type="number"
                min="1"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.allocatedQty}
                onChange={(e) => setFormData({ ...formData, allocatedQty: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Working Hours / Day</label>
              <input
                type="number"
                min="1"
                max="24"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.workingHoursPerDay}
                onChange={(e) => setFormData({ ...formData, workingHoursPerDay: parseFloat(e.target.value) || 8 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Allocation Notes</label>
            <textarea
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Assigned to Pipe Trenching Section 4, shift A"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Allocation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const RequestResourceModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    projectId: 'PRJ-101',
    priority: 'HIGH',
    requiredStartDate: new Date().toISOString().split('T')[0],
    requiredEndDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    requestedQty: 1,
    unit: 'NOS',
    estimatedCost: 5000,
    remarks: '',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            New Department / Site Resource Request
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Request Summary Title *</label>
            <input
              type="text"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Request for HDPE Pipe Electrofusion Machine & Operators"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Project</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              >
                <option value="PRJ-101">PRJ-101: Water Transmission Pipeline Phase 2</option>
                <option value="PRJ-102">PRJ-102: Central Water Reservoir Construction</option>
                <option value="PRJ-103">PRJ-103: Pumping Station Refurbishment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Priority Level</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical Emergency</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Required Start Date *</label>
              <input
                type="date"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.requiredStartDate}
                onChange={(e) => setFormData({ ...formData, requiredStartDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Required End Date *</label>
              <input
                type="date"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.requiredEndDate}
                onChange={(e) => setFormData({ ...formData, requiredEndDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Requested Qty</label>
              <input
                type="number"
                min="1"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.requestedQty}
                onChange={(e) => setFormData({ ...formData, requestedQty: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Unit</label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Est. Cost (AED)</label>
              <input
                type="number"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Remarks / Technical Specifications</label>
            <textarea
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="Specify equipment model, operator qualifications required..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shadow-lg shadow-amber-600/20"
            >
              Submit Request for Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
