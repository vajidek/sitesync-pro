import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  Network, 
  Users, 
  ChevronRight, 
  ChevronDown, 
  UserCheck, 
  ShieldCheck, 
  Briefcase, 
  Building2, 
  Edit3, 
  Check, 
  X, 
  AlertCircle,
  RefreshCw,
  Search,
  ArrowDown
} from 'lucide-react';
import { DSSectionHeader, DSCard, DSButton, DSAlert, DSModal } from '../ui/design-system';

interface TreeNode {
  id: string;
  code: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  photoUrl?: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  directReportsCount: number;
  subordinates: TreeNode[];
}

export const OrgHierarchyView: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reassignment Modal state
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [newManagerId, setNewManagerId] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchHierarchy = async () => {
    setLoading(true);
    try {
      const [resTree, resList] = await Promise.all([
        fetch('/api/hr/hierarchy'),
        fetch('/api/hr/employees'),
      ]);
      const jsonTree = await safeJson(resTree);
      const jsonList = await safeJson(resList);

      if (jsonTree?.success && jsonTree.data) {
        setTreeData(jsonTree.data);
        // Expand top level root nodes by default
        const initialExpanded: Record<string, boolean> = {};
        jsonTree.data.forEach((node: TreeNode) => {
          initialExpanded[node.id] = true;
        });
        setExpandedNodes(initialExpanded);
      }

      if (jsonList?.success && jsonList.data) {
        setAllEmployees(jsonList.data);
      }
    } catch (err) {
      console.error('Error fetching reporting hierarchy:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setUpdating(true);
    setActionMessage(null);

    const targetManager = allEmployees.find((e) => e.id === newManagerId);
    
    try {
      const res = await fetch(`/api/hr/employees/${selectedEmp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportingManagerId: newManagerId || null,
          reportingManager: targetManager ? targetManager.fullName : 'Top Level Executive',
        }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({
          type: 'success',
          text: `Reporting manager for ${selectedEmp.fullName} updated to ${targetManager ? targetManager.fullName : 'Top Level Executive'}.`,
        });
        setSelectedEmp(null);
        fetchHierarchy();
      } else {
        setActionMessage({
          type: 'error',
          text: json?.error || 'Failed to update reporting manager (circular dependency check failed).',
        });
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Server error updating hierarchy relationship.',
      });
    } finally {
      setUpdating(false);
    }
  };

  const renderTreeNode = (node: TreeNode, depth = 0) => {
    const isExpanded = Boolean(expandedNodes[node.id]);
    const hasChildren = node.subordinates && node.subordinates.length > 0;

    const matchesSearch = searchQuery
      ? node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.code.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return (
      <div key={node.id} className="space-y-2">
        <div
          className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            matchesSearch
              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200/50 opacity-60'
          }`}
          style={{ marginLeft: `${Math.min(depth * 24, 120)}px` }}
        >
          <div className="flex items-center space-x-3">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-7 h-7 flex items-center justify-center text-slate-300 dark:text-slate-700">
                •
              </div>
            )}

            <img
              src={node.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={node.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
            />

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono">
                  {node.code}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {node.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {node.designation} • <span className="font-medium text-slate-600 dark:text-slate-300">{node.department}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <div className="text-right text-[11px]">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {node.directReportsCount} Direct Report{node.directReportsCount !== 1 ? 's' : ''}
              </span>
            </div>

            <button
              onClick={() => {
                setSelectedEmp(node);
                setNewManagerId(node.reportingManagerId || '');
              }}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Change Manager</span>
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-2 border-l-2 border-slate-200 dark:border-slate-800 pl-2">
            {node.subordinates.map((sub) => renderTreeNode(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <DSSectionHeader
        title="Enterprise Organization Hierarchy & Reporting Tree"
        subtitle="Visual reporting structure with direct report metrics, manager assignments, and circular hierarchy prevention."
        action={
          <DSButton
            variant="outline"
            size="sm"
            isLoading={loading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchHierarchy}
          >
            Refresh Tree
          </DSButton>
        }
      />

      {actionMessage && (
        <DSAlert
          variant={actionMessage.type === 'success' ? 'success' : 'danger'}
          title={actionMessage.type === 'success' ? 'Success' : 'Error'}
          description={actionMessage.text}
          onClose={() => setActionMessage(null)}
        />
      )}

      {/* Filter / Search bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Filter tree by employee name, code, designation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
        />
      </div>

      {/* Hierarchy Tree Container */}
      <div className="space-y-3">
        {treeData.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No employee hierarchy data available or backend syncing.
          </div>
        ) : (
          treeData.map((rootNode) => renderTreeNode(rootNode, 0))
        )}
      </div>

      {/* Change Reporting Manager Modal */}
      {selectedEmp && (
        <DSModal
          isOpen={Boolean(selectedEmp)}
          onClose={() => setSelectedEmp(null)}
          title={`Reassign Manager for ${selectedEmp.name}`}
          size="md"
        >
          <form onSubmit={handleUpdateManager} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Employee Record</span>
              <p className="font-bold text-slate-900 dark:text-white">{selectedEmp.name} ({selectedEmp.code})</p>
              <p className="text-slate-500">{selectedEmp.designation} • {selectedEmp.department}</p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Select New Reporting Manager *
              </label>
              <select
                value={newManagerId}
                onChange={(e) => setNewManagerId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">Top Level Executive (No Direct Manager)</option>
                {allEmployees
                  .filter((emp) => emp.id !== selectedEmp.id)
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode}) — {emp.designation}
                    </option>
                  ))}
              </select>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Circular reporting dependencies will be automatically validated and blocked.
              </p>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedEmp(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-md"
              >
                {updating ? 'Validating & Saving...' : 'Save Relationship'}
              </button>
            </div>
          </form>
        </DSModal>
      )}

    </div>
  );
};
