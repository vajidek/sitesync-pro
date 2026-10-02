import React from 'react';
import { ShieldAlert, Check, X, Clock, FileCheck } from 'lucide-react';
import { DSDrawer, DSStatusChip, DSBadge, DSButton, DSEmptyState } from '../ui/design-system';
import { useShell } from './ShellContext';

export interface WorkflowInboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowInboxDrawer: React.FC<WorkflowInboxDrawerProps> = ({ isOpen, onClose }) => {
  const { workflows, handleWorkflowAction } = useShell();

  const pendingCount = workflows.filter((w) => w.status === 'PENDING').length;

  return (
    <DSDrawer isOpen={isOpen} onClose={onClose} title="Enterprise Workflow & Approvals Queue" position="right">
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/60 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-xs text-slate-900 dark:text-white">Pending Sign-offs</span>
          </div>
          <DSBadge variant="primary" size="sm">{pendingCount} Active</DSBadge>
        </div>

        {workflows.length === 0 ? (
          <DSEmptyState
            title="Workflow Queue Empty"
            description="No pending purchase orders or leave requests require your approval."
            icon={<FileCheck className="w-8 h-8" />}
          />
        ) : (
          <div className="space-y-3">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className={`p-3.5 rounded-2xl border space-y-3 transition ${
                  wf.status === 'PENDING'
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <DSBadge variant={wf.priority === 'URGENT' ? 'danger' : 'warning'} size="xs">
                        {wf.priority}
                      </DSBadge>
                      <span className="text-[10px] font-mono text-slate-400">{wf.timestamp}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                      {wf.title}
                    </h4>
                  </div>
                  <DSStatusChip status={wf.status} size="xs" />
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                  <span>Requested by: </span>
                  <strong className="text-slate-700 dark:text-slate-200">{wf.requestedBy}</strong>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{wf.department}</span>
                </div>

                {wf.status === 'PENDING' && (
                  <div className="flex items-center space-x-2 pt-1">
                    <DSButton
                      variant="success"
                      size="xs"
                      className="flex-1"
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      onClick={() => handleWorkflowAction(wf.id, 'APPROVED')}
                    >
                      Approve
                    </DSButton>
                    <DSButton
                      variant="danger"
                      size="xs"
                      className="flex-1"
                      leftIcon={<X className="w-3.5 h-3.5" />}
                      onClick={() => handleWorkflowAction(wf.id, 'REJECTED')}
                    >
                      Reject
                    </DSButton>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DSDrawer>
  );
};
