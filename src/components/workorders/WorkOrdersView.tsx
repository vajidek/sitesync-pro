import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { WorkOrder } from '../../types';
import { ClipboardCheck, Search, Filter, AlertCircle, CheckCircle2, Clock, Plus } from 'lucide-react';
import { DSPageHeader, DSButton, DSSearchBox, DSCard, DSStatusChip } from '../ui/design-system';

export const WorkOrdersView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  useEffect(() => {
    fetch('/api/projects/work-orders')
      .then((res) => safeJson(res))
      .then((data) => {
        if (data?.success && data.data) {
          setWorkOrders(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredOrders = workOrders.filter((wo) =>
    wo.title.toLowerCase().includes(searchTerm.toLowerCase()) || wo.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <DSPageHeader
        title="Work Orders & Fabrication Tasks"
        description="Field execution assignments and role-based operational tasks"
        breadcrumbs={[{ label: 'ERP' }, { label: 'Work Orders' }]}
        actions={
          <DSButton
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Issue Work Order
          </DSButton>
        }
      />

      <DSSearchBox
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search work orders..."
      />

      <div className="space-y-3">
        {filteredOrders.map((wo) => (
          <DSCard key={wo.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                  {wo.code}
                </span>
                <DSStatusChip
                  status={wo.priority === 'Critical' ? 'CRITICAL' : 'HIGH'}
                  label={`${wo.priority} Priority`}
                  size="sm"
                />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{wo.title}</h3>
              <p className="text-xs text-slate-500">
                Assigned to: <strong className="text-slate-800 dark:text-slate-200">{wo.assignedToName}</strong> ({wo.assignedToRole})
              </p>
            </div>

            <div className="flex items-center space-x-4 self-end sm:self-center">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900 dark:text-white">{wo.completedPercent}% Done</div>
                <div className="text-[10px] text-slate-400">Due {wo.dueDate}</div>
              </div>
              <DSStatusChip
                status={wo.status === 'Completed' ? 'APPROVED' : 'IN_PROGRESS'}
                label={wo.status}
              />
            </div>
          </DSCard>
        ))}
      </div>
    </div>
  );
};
