import React, { useState } from 'react';
import {
  Building2,
  Users,
  Boxes,
  FileSpreadsheet,
  ClipboardCheck,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { DSModal, DSButton, DSField, DSInput, DSSelect, DSTextarea, DSAlert } from '../ui/design-system';

export interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type QuickActionType =
  | 'PROJECT'
  | 'EMPLOYEE'
  | 'MATERIAL'
  | 'PURCHASE_REQ'
  | 'WORK_ORDER'
  | 'FORM';

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose }) => {
  const [activeAction, setActiveAction] = useState<QuickActionType>('PROJECT');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: 'Engineering',
    priority: 'HIGH',
    description: '',
  });

  if (!isOpen) return null;

  const actionTabs: { id: QuickActionType; label: string; icon: React.ReactNode }[] = [
    { id: 'PROJECT', label: 'Create Project', icon: <Building2 className="w-4 h-4 text-emerald-500" /> },
    { id: 'EMPLOYEE', label: 'Create Employee', icon: <Users className="w-4 h-4 text-rose-400" /> },
    { id: 'MATERIAL', label: 'Create Material', icon: <Boxes className="w-4 h-4 text-orange-400" /> },
    { id: 'PURCHASE_REQ', label: 'Purchase Request', icon: <FileSpreadsheet className="w-4 h-4 text-indigo-400" /> },
    { id: 'WORK_ORDER', label: 'Work Order', icon: <ClipboardCheck className="w-4 h-4 text-blue-400" /> },
    { id: 'FORM', label: 'Create Form', icon: <FileText className="w-4 h-4 text-purple-400" /> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <DSModal
      isOpen={isOpen}
      onClose={onClose}
      title="ERP Quick Action Panel"
      subtitle="Instantly register new entities and requests across SiteSync Pro"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Action Type Selector Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {actionTabs.map((tab) => {
            const isActive = activeAction === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveAction(tab.id);
                  setIsSubmitted(false);
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center space-x-2 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {isSubmitted ? (
          <DSAlert type="success" title="Success!">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{activeAction} record created and queued for database synchronization.</span>
            </div>
          </DSAlert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DSField label="Title / Reference Name" required>
                <DSInput
                  required
                  placeholder={`Enter ${activeAction.toLowerCase()} title...`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </DSField>

              <DSField label="Reference / Code Number" required>
                <DSInput
                  required
                  placeholder="e.g. PR-2026-904"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </DSField>

              <DSField label="Department / Unit">
                <DSSelect
                  options={[
                    { label: 'Water Infrastructure & Engineering', value: 'Water Engineering' },
                    { label: 'Civil Projects & Infra', value: 'Civil Projects' },
                    { label: 'Fleet & Logistics', value: 'Fleet' },
                    { label: 'Procurement & BOQ', value: 'Procurement' },
                    { label: 'HR & Administration', value: 'HR' },
                  ]}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </DSField>

              <DSField label="Priority Level">
                <DSSelect
                  options={[
                    { label: 'Critical / Urgent', value: 'CRITICAL' },
                    { label: 'High Priority', value: 'HIGH' },
                    { label: 'Standard Normal', value: 'NORMAL' },
                  ]}
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                />
              </DSField>
            </div>

            <DSField label="Notes / Specifications / Details">
              <DSTextarea
                rows={3}
                placeholder="Add necessary details or approval justifications..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </DSField>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <DSButton variant="secondary" size="sm" type="button" onClick={onClose}>
                Cancel
              </DSButton>
              <DSButton variant="primary" size="sm" type="submit">
                Create {activeAction}
              </DSButton>
            </div>
          </form>
        )}
      </div>
    </DSModal>
  );
};
