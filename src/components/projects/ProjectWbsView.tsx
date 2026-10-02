import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Download,
  Upload,
  Layers,
  Building2,
  Users,
  FileText,
  Paperclip,
  Check,
  X,
  Maximize2,
  Minimize2,
  Filter,
  RefreshCw,
  GitCommit,
  ShieldCheck,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface DbWbsNode {
  id: string;
  projectId: string;
  parentId: string | null;
  code: string;
  name: string;
  description: string | null;
  level: number;
  nodeType: string;
  displayOrder: number;
  isActive: boolean;
  children?: DbWbsNode[];
  boqCount?: number;
  activityCount?: number;
}

interface DbBoqItem {
  id: string;
  projectId: string;
  wbsId: string;
  departmentId: string | null;
  departmentName: string | null;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  executedQty: number;
  balanceQty: number;
  budgetQty: number;
  revisedQty: number;
  remarks: string | null;
  status: string;
  priority: string;
  isVariation: boolean;
  isActive: boolean;
}

interface DbWbsActivity {
  id: string;
  projectId: string;
  wbsId: string;
  boqItemId: string | null;
  code: string;
  name: string;
  description: string | null;
  department: string;
  discipline: string | null;
  responsibleEngineerName: string | null;
  supervisorName: string | null;
  foremanName: string | null;
  contractorName: string | null;
  status: string;
  plannedQty: number;
  todayQty: number;
  cumulativeQty: number;
  remainingQty: number;
  progressPercentage: number;
  weightage: number;
  spi: number;
  cpi: number;
  startDate: string | null;
  endDate: string | null;
  isCritical: boolean;
  isMilestone: boolean;
  dependencies?: any[];
  documents?: any[];
}

interface ProjectWbsViewProps {
  projectId: string;
  projectName?: string;
}

export const ProjectWbsView: React.FC<ProjectWbsViewProps> = ({ projectId, projectName }) => {
  const [wbsTree, setWbsTree] = useState<DbWbsNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<DbWbsNode | null>(null);
  const [boqItems, setBoqItems] = useState<DbBoqItem[]>([]);
  const [activities, setActivities] = useState<DbWbsActivity[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'BOQ' | 'ACTIVITIES' | 'RESPONSIBILITY' | 'DOCUMENTS'>('BOQ');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Modals state
  const [showAddWbsModal, setShowAddWbsModal] = useState(false);
  const [showAddBoqModal, setShowAddBoqModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState<DbWbsActivity | null>(null);
  const [showDocModal, setShowDocModal] = useState<DbWbsActivity | null>(null);

  // Form states
  const [wbsForm, setWbsForm] = useState({ parentId: '', code: '', name: '', description: '', nodeType: 'ZONE' });
  const [boqForm, setBoqForm] = useState({ itemCode: '', description: '', departmentName: 'Civil Works', unit: 'm3', quantity: 100, rate: 150, priority: 'MEDIUM', isVariation: false });
  const [actForm, setActForm] = useState({ code: '', name: '', department: 'Civil', contractorName: '', responsibleEngineerName: '', plannedQty: 100, startDate: '', endDate: '', isCritical: false });
  const [dailyProgressQty, setDailyProgressQty] = useState<number>(0);
  const [docForm, setDocForm] = useState({ title: '', documentType: 'DRAWING', fileUrl: '' });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchWbsData();
  }, [projectId]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
  };

  const fetchWbsData = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [treeRes, boqRes, actRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/wbs`, { headers }),
        fetch(`/api/projects/${projectId}/boq`, { headers }),
        fetch(`/api/projects/${projectId}/activities`, { headers }),
      ]);

      const treeData = await treeRes.json();
      const boqData = await boqRes.json();
      const actData = await actRes.json();

      if (treeData.success) {
        setWbsTree(treeData.data || []);
        // Expand all top nodes by default
        const initialExpand: Record<string, boolean> = {};
        treeData.data?.forEach((n: DbWbsNode) => {
          initialExpand[n.id] = true;
        });
        setExpandedNodes(initialExpand);

        if (!selectedNode && treeData.data?.length > 0) {
          setSelectedNode(treeData.data[0]);
        }
      }

      if (boqData.success) setBoqItems(boqData.data || []);
      if (actData.success) setActivities(actData.data || []);
    } catch (err: any) {
      showToast('Failed to load WBS & BOQ data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleNodeExpand = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleCreateWbsNode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/projects/${projectId}/wbs`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...wbsForm,
          parentId: wbsForm.parentId || selectedNode?.id || null,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      showToast('WBS Node created successfully');
      setShowAddWbsModal(false);
      setWbsForm({ parentId: '', code: '', name: '', description: '', nodeType: 'ZONE' });
      fetchWbsData();
    } catch (err: any) {
      showToast(err.message || 'Error creating WBS node', 'error');
    }
  };

  const handleDuplicateWbsSubtree = async (nodeId: string) => {
    if (!confirm('Are you sure you want to duplicate this WBS node and all its children/BOQs?')) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/projects/${projectId}/wbs/nodes/${nodeId}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      showToast('WBS Subtree duplicated successfully');
      fetchWbsData();
    } catch (err: any) {
      showToast(err.message || 'Error duplicating subtree', 'error');
    }
  };

  const handleDeleteWbsNode = async (nodeId: string) => {
    const recursive = confirm('Delete this node and ALL its children recursively? Click OK for recursive delete, or Cancel to stop.');
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/projects/${projectId}/wbs/nodes/${nodeId}?recursive=${recursive}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      showToast('WBS Node deleted successfully');
      if (selectedNode?.id === nodeId) setSelectedNode(null);
      fetchWbsData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting WBS node', 'error');
    }
  };

  const handleCreateBoqItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) {
      showToast('Please select a WBS Node first', 'error');
      return;
    }
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/projects/${projectId}/boq`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...boqForm, wbsId: selectedNode.id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      showToast('BOQ Item added successfully');
      setShowAddBoqModal(false);
      setBoqForm({ itemCode: '', description: '', departmentName: 'Civil Works', unit: 'm3', quantity: 100, rate: 150, priority: 'MEDIUM', isVariation: false });
      fetchWbsData();
    } catch (err: any) {
      showToast(err.message || 'Error creating BOQ item', 'error');
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) {
      showToast('Please select a WBS Node first', 'error');
      return;
    }
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/projects/${projectId}/activities`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...actForm, wbsId: selectedNode.id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      showToast('Activity added successfully');
      setShowAddActivityModal(false);
      setActForm({ code: '', name: '', department: 'Civil', contractorName: '', responsibleEngineerName: '', plannedQty: 100, startDate: '', endDate: '', isCritical: false });
      fetchWbsData();
    } catch (err: any) {
      showToast(err.message || 'Error creating activity', 'error');
    }
  };

  const handleLogProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showProgressModal) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/projects/${projectId}/activities/${showProgressModal.id}/progress`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ todayQty: dailyProgressQty }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      showToast('Daily progress recorded successfully');
      setShowProgressModal(null);
      setDailyProgressQty(0);
      fetchWbsData();
    } catch (err: any) {
      showToast(err.message || 'Error logging progress', 'error');
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDocModal) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/projects/${projectId}/activities/${showDocModal.id}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      showToast('Document uploaded successfully');
      setShowDocModal(null);
      setDocForm({ title: '', documentType: 'DRAWING', fileUrl: '' });
      fetchWbsData();
    } catch (err: any) {
      showToast(err.message || 'Error attaching document', 'error');
    }
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ wbsTree, boqItems, activities }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Project_${projectId}_WBS_BOQ_Export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported WBS & BOQ structure to JSON');
  };

  // Calculations
  const filteredBoq = selectedNode
    ? boqItems.filter(b => b.wbsId === selectedNode.id)
    : boqItems;

  const filteredActivities = selectedNode
    ? activities.filter(a => a.wbsId === selectedNode.id)
    : activities;

  const totalBoqValue = boqItems.reduce((acc, b) => acc + (b.amount || 0), 0);
  const executedBoqValue = boqItems.reduce((acc, b) => acc + ((b.executedQty || 0) * (b.rate || 0)), 0);
  const overallProgressPercent = totalBoqValue > 0 ? Math.round((executedBoqValue / totalBoqValue) * 100) : 0;

  // Render Tree recursively
  const renderTreeNode = (node: DbWbsNode) => {
    const isExpanded = expandedNodes[node.id] ?? false;
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => setSelectedNode(node)}
          className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
            isSelected
              ? 'bg-blue-600 text-white shadow-md'
              : 'hover:bg-slate-100 text-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/60'
          }`}
          style={{ paddingLeft: `${Math.max(12, node.level * 16)}px` }}
        >
          <div className="flex items-center space-x-2 min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpand(node.id);
                }}
                className={`p-1 rounded hover:bg-black/10 text-xs`}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-4" />
            )}

            <FolderTree className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-blue-500'}`} />

            <div className="truncate">
              <span className={`font-mono text-xs font-semibold mr-2 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                {node.code}
              </span>
              <span className="text-sm font-medium">{node.name}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 opacity-95 group-hover:opacity-100">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isSelected
                  ? 'bg-blue-700 text-blue-100'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {node.nodeType}
            </span>

            {(node.boqCount || 0) > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isSelected ? 'bg-blue-800 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                {node.boqCount} BOQ
              </span>
            )}

            <div className="hidden group-hover:flex items-center space-x-1 ml-1">
              <button
                title="Add Child Node"
                onClick={(e) => {
                  e.stopPropagation();
                  setWbsForm({ ...wbsForm, parentId: node.id });
                  setShowAddWbsModal(true);
                }}
                className="p-1 hover:bg-white/20 rounded"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                title="Duplicate Subtree"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateWbsSubtree(node.id);
                }}
                className="p-1 hover:bg-white/20 rounded"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                title="Delete Node"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteWbsNode(node.id);
                }}
                className="p-1 hover:bg-red-500/20 rounded text-red-300"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {node.children!.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-sm font-medium ${
            notification.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {notification.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* HEADER & EXECUTIVE SUMMARY STATS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                PHASE 52 ENGINE
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                WBS, BOQ & Activity Management
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-tiered construction work breakdown structure, real-time BOQ tracking & daily site progress.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={fetchWbsData}
              className="p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={exportToJson}
              className="flex items-center space-x-2 px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Structure</span>
            </button>

            <button
              onClick={() => {
                setWbsForm({ parentId: selectedNode?.id || '', code: '', name: '', description: '', nodeType: 'ZONE' });
                setShowAddWbsModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>New WBS Node</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-[#grid] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Total BOQ Budget</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              AED {totalBoqValue.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">Across all BOQ items</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Executed Value</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              AED {executedBoqValue.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              {overallProgressPercent}% Financial Progress
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>BOQ Line Items</span>
              <FileSpreadsheet className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {boqItems.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {boqItems.filter(b => b.isVariation).length} Variation orders
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Active Site Activities</span>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {activities.length}
            </div>
            <div className="text-xs text-amber-600 font-medium mt-1">
              {activities.filter(a => a.isCritical).length} Critical path tasks
            </div>
          </div>
        </div>
      </div>

      {/* SPLIT SCREEN WORKSPACE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: WBS HIERARCHY TREE */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col h-[750px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <FolderTree className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">WBS Structure</h3>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  const all: Record<string, boolean> = {};
                  const expandAll = (nodes: DbWbsNode[]) => {
                    nodes.forEach(n => {
                      all[n.id] = true;
                      if (n.children) expandAll(n.children);
                    });
                  };
                  expandAll(wbsTree);
                  setExpandedNodes(all);
                }}
                className="text-[11px] font-medium text-blue-600 hover:underline px-2 py-1"
              >
                Expand
              </button>
              <button
                onClick={() => setExpandedNodes({})}
                className="text-[11px] font-medium text-slate-500 hover:underline px-2 py-1"
              >
                Collapse
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search WBS code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tree Scroll Container */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading WBS Hierarchy...</div>
            ) : wbsTree.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-xl">
                No WBS hierarchy defined yet. Click "New WBS Node" to start building.
              </div>
            ) : (
              wbsTree.map(node => renderTreeNode(node))
            )}
          </div>
        </div>

        {/* RIGHT PANEL: DETAILS, BOQ & ACTIVITIES MANAGEMENT */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col h-[750px]">
          {/* Selected Node Summary Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                  {selectedNode ? selectedNode.code : 'ALL WBS SCOPE'}
                </span>
                <span className="text-slate-400">•</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedNode ? selectedNode.name : 'Project Wide Breakdown'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedNode?.description || 'Select any node from the tree on the left to filter specific BOQs and site activities.'}
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {activeTab === 'BOQ' && (
                <button
                  onClick={() => setShowAddBoqModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add BOQ Item</span>
                </button>
              )}

              {activeTab === 'ACTIVITIES' && (
                <button
                  onClick={() => setShowAddActivityModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Activity</span>
                </button>
              )}
            </div>
          </div>

          {/* DETAIL TABS */}
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 mb-4 pb-2">
            <button
              onClick={() => setActiveTab('BOQ')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'BOQ'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>BOQ Items ({filteredBoq.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ACTIVITIES')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'ACTIVITIES'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Activities & Daily Progress ({filteredActivities.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('RESPONSIBILITY')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'RESPONSIBILITY'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Responsibility Matrix</span>
            </button>
          </div>

          {/* TAB 1: BOQ ITEMS ENGINE */}
          {activeTab === 'BOQ' && (
            <div className="flex-1 overflow-auto">
              {filteredBoq.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 border border-dashed rounded-2xl mt-4">
                  No Bill of Quantities items assigned to this WBS node. Click "Add BOQ Item" to record contract rates & quantities.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold sticky top-0 uppercase tracking-wider">
                    <tr>
                      <th className="p-3 rounded-l-lg">Item Code</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Dept</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3 text-right">Total Amount</th>
                      <th className="p-3 text-right">Executed</th>
                      <th className="p-3 text-center rounded-r-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredBoq.map(boq => (
                      <tr key={boq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {boq.itemCode}
                          {boq.isVariation && (
                            <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-amber-100 text-amber-800 rounded font-sans">VAR</span>
                          )}
                        </td>
                        <td className="p-3 max-w-xs truncate font-medium">{boq.description}</td>
                        <td className="p-3 text-slate-500">{boq.departmentName || 'Civil'}</td>
                        <td className="p-3 text-right font-mono font-semibold">{boq.quantity.toLocaleString()} {boq.unit}</td>
                        <td className="p-3 text-right font-mono">AED {boq.rate.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          AED {boq.amount.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {boq.executedQty.toLocaleString()} {boq.unit}
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {boq.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVITIES ENGINE */}
          {activeTab === 'ACTIVITIES' && (
            <div className="flex-1 overflow-auto">
              {filteredActivities.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 border border-dashed rounded-2xl mt-4">
                  No site execution activities registered under this WBS. Click "Add Activity" to plan tasks.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredActivities.map(act => (
                    <div
                      key={act.id}
                      className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-400 transition space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">
                            {act.code}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{act.name}</h4>
                          {act.isCritical && (
                            <span className="px-2 py-0.5 text-[9px] font-bold bg-red-100 text-red-700 rounded-full">
                              CRITICAL PATH
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2.5 py-1 font-bold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {act.status}
                          </span>

                          <button
                            onClick={() => setShowProgressModal(act)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                          >
                            Log Progress
                          </button>

                          <button
                            onClick={() => setShowDocModal(act)}
                            className="p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Attach Document / Drawing"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          <span>Progress: {act.progressPercentage}%</span>
                          <span>Cumulative: {act.cumulativeQty} / {act.plannedQty}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, act.progressPercentage)}%` }}
                          />
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-800/80 pt-2">
                        <div>
                          <span className="font-semibold block text-slate-700 dark:text-slate-300">Department:</span>
                          {act.department}
                        </div>
                        <div>
                          <span className="font-semibold block text-slate-700 dark:text-slate-300">Responsible Engineer:</span>
                          {act.responsibleEngineerName || 'Eng. Sarah Al Hashmi'}
                        </div>
                        <div>
                          <span className="font-semibold block text-slate-700 dark:text-slate-300">Contractor:</span>
                          {act.contractorName || 'Prime Contractor'}
                        </div>
                        <div>
                          <span className="font-semibold block text-slate-700 dark:text-slate-300">Performance (SPI / CPI):</span>
                          <span className="font-mono text-emerald-600 font-bold">{act.spi || 1.0}</span> / <span className="font-mono text-blue-600 font-bold">{act.cpi || 1.0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RESPONSIBILITY MATRIX */}
          {activeTab === 'RESPONSIBILITY' && (
            <div className="flex-1 overflow-auto">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Responsibility & Governance Matrix</h4>
                <p className="text-xs text-slate-500">
                  Assign site engineers, supervisors, subcontractors, and quality inspectors to every activity node.
                </p>
              </div>

              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  <tr>
                    <th className="p-3">Activity</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Engineer (RE)</th>
                    <th className="p-3">Supervisor</th>
                    <th className="p-3">Contractor / Sub</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredActivities.map(act => (
                    <tr key={act.id}>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{act.name}</td>
                      <td className="p-3">{act.department}</td>
                      <td className="p-3 text-blue-600 font-medium">{act.responsibleEngineerName || 'Eng. Sarah Al Hashmi'}</td>
                      <td className="p-3">{act.supervisorName || 'Mohammed Tariq'}</td>
                      <td className="p-3 font-medium">{act.contractorName || 'Emirates Infra Tech'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD WBS NODE */}
      {showAddWbsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Add New WBS Node</h3>
              <button onClick={() => setShowAddWbsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWbsNode} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">WBS Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WBS-01.3"
                  value={wbsForm.code}
                  onChange={e => setWbsForm({ ...wbsForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">WBS Node Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zone 3 - Valve Chamber & Manifolds"
                  value={wbsForm.name}
                  onChange={e => setWbsForm({ ...wbsForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hierarchy Type</label>
                <select
                  value={wbsForm.nodeType}
                  onChange={e => setWbsForm({ ...wbsForm, nodeType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                >
                  <option value="PACKAGE">PACKAGE</option>
                  <option value="ZONE">ZONE</option>
                  <option value="AREA">AREA</option>
                  <option value="STRUCTURE">STRUCTURE</option>
                  <option value="SECTION">SECTION</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Scope details..."
                  value={wbsForm.description}
                  onChange={e => setWbsForm({ ...wbsForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWbsModal(false)}
                  className="px-4 py-2 text-xs border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white font-semibold rounded-xl"
                >
                  Create Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BOQ ITEM */}
      {showAddBoqModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Add BOQ Item to {selectedNode?.code}
              </h3>
              <button onClick={() => setShowAddBoqModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBoqItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Item Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="BOQ-CIV-003"
                    value={boqForm.itemCode}
                    onChange={e => setBoqForm({ ...boqForm, itemCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={boqForm.departmentName}
                    onChange={e => setBoqForm({ ...boqForm, departmentName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Item Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contract specification description..."
                  value={boqForm.description}
                  onChange={e => setBoqForm({ ...boqForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="m3 / m / ton"
                    value={boqForm.unit}
                    onChange={e => setBoqForm({ ...boqForm, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    value={boqForm.quantity}
                    onChange={e => setBoqForm({ ...boqForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Rate (AED) *</label>
                  <input
                    type="number"
                    required
                    value={boqForm.rate}
                    onChange={e => setBoqForm({ ...boqForm, rate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBoqModal(false)}
                  className="px-4 py-2 text-xs border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-emerald-600 text-white font-semibold rounded-xl"
                >
                  Save BOQ Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG PROGRESS */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Log Daily Progress: {showProgressModal.code}
              </h3>
              <button onClick={() => setShowProgressModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogProgress} className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">{showProgressModal.name}</div>
                <div className="text-slate-500">Cumulative Completed: {showProgressModal.cumulativeQty} / {showProgressModal.plannedQty}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Today's Executed Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={dailyProgressQty}
                  onChange={e => setDailyProgressQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(null)}
                  className="px-4 py-2 text-xs border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-emerald-600 text-white font-semibold rounded-xl"
                >
                  Record Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
