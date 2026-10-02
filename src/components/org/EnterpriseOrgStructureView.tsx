import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import {
  Building,
  Briefcase,
  MapPin,
  Building2,
  Layers,
  HardHat,
  Wrench,
  Zap,
  FolderTree,
  Users,
  Plus,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Move,
  GitMerge,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileSpreadsheet,
  Activity,
  Trash2,
  Edit,
  Edit3,
  Tag,
  DollarSign,
  UserCheck,
  Cpu,
  Pipette,
  Sliders,
  Filter,
  Droplets
} from 'lucide-react';
import {
  DSPageHeader,
  DSCard,
  DSButton,
  DSTabs,
  DSAlert,
  DSModal,
  DSField,
  DSBadge
} from '../ui/design-system';

interface OrgNode {
  id: string;
  unitCode: string;
  name: string;
  unitType: 'COMPANY' | 'BUSINESS_UNIT' | 'REGION' | 'BRANCH' | 'DIVISION' | 'DEPARTMENT' | 'SUB_DEPARTMENT' | 'TEAM';
  parentId?: string;
  companyId?: string;
  branchId?: string;
  divisionId?: string;
  headEmployeeId?: string;
  headEmployeeName?: string;
  color?: string;
  icon?: string;
  displayOrder: number;
  hierarchyLevel?: number;
  description?: string;
  isActive: boolean;
  employeeCount?: number;
  projectCount?: number;
  children?: OrgNode[];
}

export type OrgViewTab = 'hierarchy' | 'divisions' | 'departments' | 'projects' | 'masters' | 'reporting' | 'bulk';

export interface DivisionItem {
  id: string;
  code: string;
  name: string;
  branchId?: string;
  regionId?: string;
  headEmployeeId?: string;
  headEmployeeName?: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
  departmentCount?: number;
  activeDepartmentCount?: number;
  employeeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  branchId?: string;
  parentId?: string;
  divisionId?: string;
  divisionName?: string;
  divisionCode?: string;
  type?: string;
  headEmployeeId?: string;
  headEmployeeName?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
  description?: string;
  isActive: boolean;
  employeeCount?: number;
  projectCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const EnterpriseOrgStructureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OrgViewTab>('hierarchy');
  const [orgTree, setOrgTree] = useState<OrgNode[]>([]);
  const [flatUnits, setFlatUnits] = useState<OrgNode[]>([]);
  const [divisionsList, setDivisionsList] = useState<DivisionItem[]>([]);
  const [departmentsList, setDepartmentsList] = useState<DepartmentItem[]>([]);
  const [enterpriseTreeData, setEnterpriseTreeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState<string>('ALL');
  const [divisionFilter, setDivisionFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected Node Details
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  
  // Division Modals
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [editingDivision, setEditingDivision] = useState<DivisionItem | null>(null);
  const [divisionFormData, setDivisionFormData] = useState({
    code: '',
    name: '',
    description: '',
    headEmployeeName: '',
    displayOrder: 0,
  });

  // Department Modals
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentItem | null>(null);
  const [departmentFormData, setDepartmentFormData] = useState({
    code: '',
    name: '',
    divisionId: '',
    description: '',
    headEmployeeName: '',
    color: '#0284c7',
    icon: 'FolderTree',
    displayOrder: 0,
  });

  // Safe Reassign Division Modal
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignDept, setReassignDept] = useState<DepartmentItem | null>(null);
  const [reassignTargetDivisionId, setReassignTargetDivisionId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  // Add Form State (Legacy)
  const [formData, setFormData] = useState({
    unitCode: '',
    name: '',
    unitType: 'DEPARTMENT',
    parentId: '',
    color: '#0284c7',
    icon: 'FolderTree',
    headEmployeeName: '',
    description: '',
  });

  // Move Form State
  const [targetParentId, setTargetParentId] = useState<string>('');

  // Merge Form State
  const [mergeSourceId, setMergeSourceId] = useState<string>('');
  const [mergeTargetId, setMergeTargetId] = useState<string>('');

  // Master Picklists State
  const [masterCategory, setMasterCategory] = useState<string>('disciplines');
  const [masterRecords, setMasterRecords] = useState<any[]>([]);
  const [masterSearchQuery, setMasterSearchQuery] = useState('');
  const [showAddMasterModal, setShowAddMasterModal] = useState(false);
  const [editingMasterItem, setEditingMasterItem] = useState<any | null>(null);
  const [masterForm, setMasterForm] = useState({ code: '', name: '', description: '', extra: '', isActive: true });
  const [configuredDisciplines, setConfiguredDisciplines] = useState<any[]>([]);

  // Reporting Tree State
  const [reportingTree, setReportingTree] = useState<any[]>([]);

  // Bulk Import Payload Text
  const [bulkImportText, setBulkImportText] = useState('');

  const fetchConfiguredDisciplines = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/org/masters/disciplines', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setConfiguredDisciplines(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load disciplines:', err);
    }
  };

  const fetchDivisions = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/org/divisions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setDivisionsList(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load divisions:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/org/departments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setDepartmentsList(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const fetchEnterpriseTree = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/org/tree', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setEnterpriseTreeData(json.data);
      }
    } catch (err) {
      console.error('Failed to load enterprise tree:', err);
    }
  };

  const fetchOrgTree = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const resTree = await fetch('/api/org/units/tree', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonTree = await safeJson(resTree);
      if (jsonTree?.success) {
        setOrgTree(jsonTree.data || []);
        // Automatically expand root nodes
        const initialExpanded: Record<string, boolean> = {};
        const flatten = (nodes: OrgNode[]) => {
          nodes.forEach((n) => {
            initialExpanded[n.id] = true;
            if (n.children && n.children.length > 0) flatten(n.children);
          });
        };
        flatten(jsonTree.data || []);
        setExpandedNodes(initialExpanded);
      }

      const resList = await fetch('/api/org/units', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonList = await safeJson(resList);
      if (jsonList?.success) {
        setFlatUnits(jsonList.items || []);
      }
    } catch (err) {
      console.error('Failed to load org tree:', err);
    } finally {
      setLoading(false);
    }
  };

  const reloadAllData = () => {
    fetchOrgTree();
    fetchDivisions();
    fetchDepartments();
    fetchEnterpriseTree();
    fetchConfiguredDisciplines();
  };

  const fetchMasterData = async (cat: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/org/masters/${cat}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setMasterRecords(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch master category:', err);
    }
  };

  const fetchReportingTree = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/org/reporting-tree', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setReportingTree(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch reporting tree:', err);
    }
  };

  useEffect(() => {
    reloadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'masters') fetchMasterData(masterCategory);
    if (activeTab === 'reporting') fetchReportingTree();
    if (activeTab === 'divisions') fetchDivisions();
    if (activeTab === 'departments') {
      fetchDivisions();
      fetchDepartments();
    }
    if (activeTab === 'hierarchy') {
      fetchEnterpriseTree();
      fetchOrgTree();
    }
  }, [activeTab, masterCategory]);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Division Handlers
  const handleSaveDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const isEdit = !!editingDivision;
      const url = isEdit ? `/api/org/divisions/${editingDivision.id}` : '/api/org/divisions';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(divisionFormData),
      });

      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({
          type: 'success',
          text: isEdit ? `Division '${divisionFormData.name}' updated successfully` : `Division '${divisionFormData.name}' created successfully`,
        });
        setShowDivisionModal(false);
        setEditingDivision(null);
        setDivisionFormData({ code: '', name: '', description: '', headEmployeeName: '', displayOrder: 0 });
        reloadAllData();
      } else {
        setActionMessage({ type: 'error', text: json?.message || 'Failed to save division' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Network error' });
    }
  };

  const handleToggleDivisionStatus = async (div: DivisionItem) => {
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      if (div.isActive) {
        // Deactivate
        const res = await fetch(`/api/org/divisions/${div.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await safeJson(res);
        if (json?.success) {
          setActionMessage({ type: 'success', text: `Division '${div.name}' deactivated successfully` });
          reloadAllData();
        } else {
          setActionMessage({ type: 'error', text: json?.message || 'Failed to deactivate division' });
        }
      } else {
        // Activate
        const res = await fetch(`/api/org/divisions/${div.id}/activate`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await safeJson(res);
        if (json?.success) {
          setActionMessage({ type: 'success', text: `Division '${div.name}' activated successfully` });
          reloadAllData();
        } else {
          setActionMessage({ type: 'error', text: json?.message || 'Failed to activate division' });
        }
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Error updating status' });
    }
  };

  // Department Handlers
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const isEdit = !!editingDepartment;
      const url = isEdit ? `/api/org/departments/${editingDepartment.id}` : '/api/org/departments';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(departmentFormData),
      });

      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({
          type: 'success',
          text: isEdit ? `Department '${departmentFormData.name}' updated successfully` : `Department '${departmentFormData.name}' created successfully`,
        });
        setShowDepartmentModal(false);
        setEditingDepartment(null);
        setDepartmentFormData({
          code: '',
          name: '',
          divisionId: '',
          description: '',
          headEmployeeName: '',
          color: '#0284c7',
          icon: 'FolderTree',
          displayOrder: 0,
        });
        reloadAllData();
      } else {
        setActionMessage({ type: 'error', text: json?.message || 'Failed to save department' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Network error' });
    }
  };

  const handleToggleDepartmentStatus = async (dept: DepartmentItem) => {
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      if (dept.isActive) {
        // Deactivate
        const res = await fetch(`/api/org/departments/${dept.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await safeJson(res);
        if (json?.success) {
          setActionMessage({ type: 'success', text: `Department '${dept.name}' soft-deactivated successfully (historical records preserved)` });
          reloadAllData();
        } else {
          setActionMessage({ type: 'error', text: json?.message || 'Failed to deactivate department' });
        }
      } else {
        // Activate
        const res = await fetch(`/api/org/departments/${dept.id}/activate`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await safeJson(res);
        if (json?.success) {
          setActionMessage({ type: 'success', text: `Department '${dept.name}' activated successfully` });
          reloadAllData();
        } else {
          setActionMessage({ type: 'error', text: json?.message || 'Failed to activate department' });
        }
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Error updating status' });
    }
  };

  const handleExecuteReassignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignDept || !reassignTargetDivisionId) return;
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/org/departments/${reassignDept.id}/reassign-division`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newDivisionId: reassignTargetDivisionId,
          reason: reassignReason || 'Administrative reorganization',
        }),
      });

      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({
          type: 'success',
          text: json.message || `Department '${reassignDept.name}' successfully reassigned!`,
        });
        setShowReassignModal(false);
        setReassignDept(null);
        setReassignTargetDivisionId('');
        setReassignReason('');
        reloadAllData();
      } else {
        setActionMessage({ type: 'error', text: json?.message || 'Failed to reassign department' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Network error during reassignment' });
    }
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/org/units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: `Unit '${formData.name}' created successfully` });
        setShowAddModal(false);
        setFormData({ unitCode: '', name: '', unitType: 'DEPARTMENT', parentId: '', color: '#0284c7', icon: 'FolderTree', headEmployeeName: '', description: '' });
        fetchOrgTree();
      } else {
        setActionMessage({ type: 'error', text: json?.message || 'Failed to create unit' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Network error' });
    }
  };

  const handleMoveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/org/units/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: selectedNode.id, newParentId: targetParentId || null }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: `Moved '${selectedNode.name}' successfully` });
        setShowMoveModal(false);
        fetchOrgTree();
      } else {
        setActionMessage({ type: 'error', text: json?.message || 'Failed to move department' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Error executing move' });
    }
  };

  const handleMergeUnits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSourceId || !mergeTargetId) return;
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/org/units/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sourceId: mergeSourceId, targetId: mergeTargetId }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: 'Departments merged successfully' });
        setShowMergeModal(false);
        fetchOrgTree();
      } else {
        setActionMessage({ type: 'error', text: json?.message || 'Failed to merge departments' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Merge error' });
    }
  };

  const handleSaveMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const isEdit = !!editingMasterItem;
      const url = isEdit ? `/api/org/masters/${masterCategory}/${editingMasterItem.id}` : `/api/org/masters/${masterCategory}`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(masterForm),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({
          type: 'success',
          text: `Master record for ${masterCategory} ${isEdit ? 'updated' : 'created'} successfully`,
        });
        setShowAddMasterModal(false);
        setEditingMasterItem(null);
        setMasterForm({ code: '', name: '', description: '', extra: '', isActive: true });
        fetchMasterData(masterCategory);
        fetchConfiguredDisciplines();
      } else {
        setActionMessage({ type: 'error', text: json?.message || 'Failed to save master record' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Network error' });
    }
  };

  const handleToggleMasterStatus = async (item: any) => {
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const newStatus = !item.isActive;
      const res = await fetch(`/api/org/masters/${masterCategory}/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({
          type: 'success',
          text: `Master item '${item.name}' marked as ${newStatus ? 'Active' : 'Inactive'}`,
        });
        fetchMasterData(masterCategory);
        fetchConfiguredDisciplines();
      } else {
        setActionMessage({ type: 'error', text: json?.message || 'Failed to update status' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Network error' });
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      const parsed = JSON.parse(bulkImportText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/org/units/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: `${json.importedCount} organization units imported successfully!` });
        setBulkImportText('');
        fetchOrgTree();
      } else {
        setActionMessage({ type: 'error', text: json?.message || 'Bulk import failed' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'Invalid JSON format. Please paste a valid JSON array of units.' });
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'COMPANY': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'BUSINESS_UNIT': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'REGION': return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'BRANCH': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'DIVISION': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'DEPARTMENT': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'SUB_DEPARTMENT': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COMPANY': return <Building className="w-4 h-4 text-blue-600" />;
      case 'BUSINESS_UNIT': return <Briefcase className="w-4 h-4 text-teal-600" />;
      case 'REGION': return <MapPin className="w-4 h-4 text-sky-600" />;
      case 'BRANCH': return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'DIVISION': return <Layers className="w-4 h-4 text-cyan-600" />;
      case 'DEPARTMENT': return <HardHat className="w-4 h-4 text-emerald-600" />;
      case 'SUB_DEPARTMENT': return <FolderTree className="w-4 h-4 text-amber-600" />;
      default: return <Users className="w-4 h-4 text-slate-600" />;
    }
  };

  // Render Tree Recursive Component
  const renderTreeNodes = (nodes: OrgNode[], depth = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedNodes[node.id] ?? true;

      // Filter check
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || node.unitCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = unitTypeFilter === 'ALL' || node.unitType === unitTypeFilter;

      if (!matchesSearch || !matchesType) {
        if (hasChildren) {
          const childMatches = node.children!.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.unitCode.toLowerCase().includes(searchQuery.toLowerCase()));
          if (!childMatches) return null;
        } else {
          return null;
        }
      }

      return (
        <div key={node.id} className="select-none">
          <div
            className={`flex items-center justify-between p-3 my-1 rounded-xl border transition-all cursor-pointer ${
              selectedNode?.id === node.id
                ? 'bg-blue-50/90 border-blue-400 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
            style={{ marginLeft: `${depth * 24}px` }}
            onClick={() => setSelectedNode(node)}
          >
            <div className="flex items-center space-x-3">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(node.id);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <span className="w-6" />
              )}

              <div className="p-2 rounded-lg bg-slate-100/80">{getTypeIcon(node.unitType)}</div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900 text-sm">{node.name}</span>
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    {node.unitCode}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getTypeBadgeColor(node.unitType)}`}>
                    {node.unitType.replace('_', ' ')}
                  </span>
                </div>
                {node.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{node.description}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <span className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-md text-slate-700 font-medium">
                  <Users className="w-3 h-3 text-slate-500" />
                  <span>{node.employeeCount || 0} Staff</span>
                </span>
                <span className="inline-flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-md text-blue-700 font-medium border border-blue-100">
                  <Briefcase className="w-3 h-3 text-blue-500" />
                  <span>{node.projectCount || 0} Projects</span>
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  title="Add Sub-Department"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData({
                      unitCode: `${node.unitCode}-SUB`,
                      name: '',
                      unitType: node.unitType === 'DEPARTMENT' ? 'SUB_DEPARTMENT' : 'DEPARTMENT',
                      parentId: node.id,
                      color: '#0284c7',
                      icon: 'FolderTree',
                      headEmployeeName: '',
                      description: '',
                    });
                    setShowAddModal(true);
                  }}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="Move Department"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                    setTargetParentId(node.parentId || '');
                    setShowMoveModal(true);
                  }}
                  className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <Move className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {hasChildren && isExpanded && renderTreeNodes(node.children!, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <DSPageHeader
        title="Enterprise Organization Structure & Master Foundation"
        description="Scalable, multi-tier organizational hierarchy supporting unlimited sub-departments across all construction project categories"
        breadcrumbs={[{ label: 'ERP' }, { label: 'Admin' }, { label: 'Organization Master' }]}
        actions={
          <div className="flex items-center space-x-2">
            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-blue-600" />}
              onClick={fetchOrgTree}
            >
              Refresh Tree
            </DSButton>

            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<GitMerge className="w-3.5 h-3.5 text-amber-600" />}
              onClick={() => setShowMergeModal(true)}
            >
              Merge Departments
            </DSButton>

            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setFormData({
                  unitCode: 'DEP-NEW',
                  name: '',
                  unitType: 'DEPARTMENT',
                  parentId: '',
                  color: '#0284c7',
                  icon: 'FolderTree',
                  headEmployeeName: '',
                  description: '',
                });
                setShowAddModal(true);
              }}
            >
              Add Org Unit
            </DSButton>
          </div>
        }
      />

      {/* Action Notification Alert */}
      {actionMessage && (
        <DSAlert
          type={actionMessage.type}
          title={actionMessage.type === 'success' ? 'Operation Completed' : 'Operation Failed'}
          description={actionMessage.text}
          onClose={() => setActionMessage(null)}
        />
      )}

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <DSCard className="p-3 bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Company</div>
          <div className="text-xl font-bold text-slate-900 mt-1">1</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Global Group Entity</div>
        </DSCard>

        <DSCard className="p-3 bg-gradient-to-br from-teal-50 to-white border-teal-100">
          <div className="text-xs text-teal-600 font-semibold uppercase tracking-wider">Business Units</div>
          <div className="text-xl font-bold text-slate-900 mt-1">2</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Civil & MEP Verticals</div>
        </DSCard>

        <DSCard className="p-3 bg-gradient-to-br from-sky-50 to-white border-sky-100">
          <div className="text-xs text-sky-600 font-semibold uppercase tracking-wider">Regions & Branches</div>
          <div className="text-xl font-bold text-slate-900 mt-1">2</div>
          <div className="text-[11px] text-slate-500 mt-0.5">GCC & Abu Dhabi HQ</div>
        </DSCard>

        <DSCard className="p-3 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
          <div className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Divisions</div>
          <div className="text-xl font-bold text-slate-900 mt-1">1</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Engineering & EPC</div>
        </DSCard>

        <DSCard className="p-3 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Departments</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {flatUnits.filter((u) => u.unitType === 'DEPARTMENT').length || 3}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Civil, Mech, Elec/SCADA</div>
        </DSCard>

        <DSCard className="p-3 bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <div className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Sub-Departments</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {flatUnits.filter((u) => u.unitType === 'SUB_DEPARTMENT').length || 3}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Unlimited Nesting</div>
        </DSCard>
      </div>

      {/* Main Tabbed Navigation */}
      <DSTabs
        tabs={[
          { id: 'hierarchy', label: 'Organization Tree', icon: <FolderTree className="w-4 h-4" /> },
          { id: 'divisions', label: 'Divisions Master', icon: <Layers className="w-4 h-4" /> },
          { id: 'departments', label: 'Departments Master', icon: <Building2 className="w-4 h-4" /> },
          { id: 'projects', label: 'Project Department Matrix', icon: <Briefcase className="w-4 h-4" /> },
          { id: 'masters', label: 'Master Foundation Picklists', icon: <Tag className="w-4 h-4" /> },
          { id: 'reporting', label: 'Reporting Structure Tree', icon: <UserCheck className="w-4 h-4" /> },
          { id: 'bulk', label: 'Bulk Import & Export', icon: <FileSpreadsheet className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* Tab 1: Organization Hierarchy Tree */}
      {activeTab === 'hierarchy' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <DSCard className="p-4 space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by department name or unit code..."
                    className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={divisionFilter}
                    onChange={(e) => setDivisionFilter(e.target.value)}
                    className="text-xs py-1.5 px-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="ALL">All Divisions</option>
                    {divisionsList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tree View Canvas */}
              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                  <span>Loading organization hierarchy tree...</span>
                </div>
              ) : orgTree.length === 0 ? (
                <div className="py-12 text-center text-slate-400">No organization units found.</div>
              ) : (
                <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">{renderTreeNodes(orgTree)}</div>
              )}
            </DSCard>
          </div>

          {/* Right Panel: Selected Department Details */}
          <div className="space-y-4">
            {selectedNode ? (
              <DSCard className="p-5 space-y-4 border-blue-200 shadow-sm bg-gradient-to-b from-blue-50/30 to-white">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getTypeBadgeColor(selectedNode.unitType)}`}>
                      {selectedNode.unitType.replace('_', ' ')}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedNode.name}</h3>
                    <p className="text-xs font-mono text-slate-500">{selectedNode.unitCode}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">{getTypeIcon(selectedNode.unitType)}</div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Description</label>
                    <p className="text-slate-700 mt-0.5">{selectedNode.description || 'No description provided.'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div>
                      <label className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Hierarchy Level</label>
                      <p className="text-slate-900 font-semibold">Level {selectedNode.hierarchyLevel || 1}</p>
                    </div>
                    <div>
                      <label className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Status</label>
                      <p className="text-emerald-600 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                      <span className="text-slate-500 block text-[10px] font-medium">Employee Count</span>
                      <span className="text-base font-bold text-slate-900">{selectedNode.employeeCount || 0} Staff</span>
                    </div>
                    <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-200/60">
                      <span className="text-blue-600 block text-[10px] font-medium">Assigned Projects</span>
                      <span className="text-base font-bold text-blue-900">{selectedNode.projectCount || 0} Contracts</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <DSButton
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                    leftIcon={<Move className="w-3.5 h-3.5 text-amber-600" />}
                    onClick={() => {
                      setTargetParentId(selectedNode.parentId || '');
                      setShowMoveModal(true);
                    }}
                  >
                    Move to Different Parent
                  </DSButton>

                  <DSButton
                    variant="outline"
                    size="sm"
                    className="w-full justify-center text-blue-700"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setFormData({
                        unitCode: `${selectedNode.unitCode}-SUB`,
                        name: '',
                        unitType: selectedNode.unitType === 'DEPARTMENT' ? 'SUB_DEPARTMENT' : 'DEPARTMENT',
                        parentId: selectedNode.id,
                        color: '#0284c7',
                        icon: 'FolderTree',
                        headEmployeeName: '',
                        description: '',
                      });
                      setShowAddModal(true);
                    }}
                  >
                    Add Sub-Department Here
                  </DSButton>
                </div>
              </DSCard>
            ) : (
              <DSCard className="p-6 text-center text-slate-400 space-y-2">
                <FolderTree className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">Select any node in the tree to inspect details, move hierarchy, or add sub-departments.</p>
              </DSCard>
            )}
          </div>
        </div>
      )}

      {/* Tab: Divisions Master */}
      {activeTab === 'divisions' && (
        <DSCard className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Divisions Master Management</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Top-tier organizational units representing operational verticals (e.g. Civil, Mechanical, Electrical, Finance, HR)
              </p>
            </div>

            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditingDivision(null);
                setDivisionFormData({ code: '', name: '', description: '', headEmployeeName: '', displayOrder: (divisionsList.length + 1) * 10 });
                setShowDivisionModal(true);
              }}
            >
              Add Division
            </DSButton>
          </div>

          {/* Division Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Division Name</th>
                  <th className="p-3">Head of Division</th>
                  <th className="p-3 text-center">Departments</th>
                  <th className="p-3 text-center">Staff</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {divisionsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No divisions defined yet. Click "Add Division" to create your first division.
                    </td>
                  </tr>
                ) : (
                  divisionsList.map((div) => (
                    <tr key={div.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-blue-700">{div.code}</td>
                      <td className="p-3 font-semibold text-slate-900">
                        <div>{div.name}</div>
                        {div.description && <div className="text-[11px] text-slate-400 font-normal mt-0.5">{div.description}</div>}
                      </td>
                      <td className="p-3 text-slate-700">
                        {div.headEmployeeName ? (
                          <span className="flex items-center space-x-1">
                            <UserCheck className="w-3 h-3 text-blue-500" />
                            <span>{div.headEmployeeName}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {div.departmentCount || 0} depts
                        </span>
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-900">
                        {div.employeeCount || 0}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            div.isActive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {div.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            title="Edit Division"
                            onClick={() => {
                              setEditingDivision(div);
                              setDivisionFormData({
                                code: div.code,
                                name: div.name,
                                description: div.description || '',
                                headEmployeeName: div.headEmployeeName || '',
                                displayOrder: div.displayOrder || 0,
                              });
                              setShowDivisionModal(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            title={div.isActive ? 'Deactivate Division' : 'Activate Division'}
                            onClick={() => handleToggleDivisionStatus(div)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              div.isActive
                                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {div.isActive ? <Trash2 className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DSCard>
      )}

      {/* Tab: Departments Master & Safe Reassignment */}
      {activeTab === 'departments' && (
        <DSCard className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Departments Master & Hierarchy Allocation</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Functional units mapped directly under their parent division. Support for safe division reassignment without data loss.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All Parent Divisions</option>
                {divisionsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>

              <DSButton
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setEditingDepartment(null);
                  setDepartmentFormData({
                    code: '',
                    name: '',
                    divisionId: divisionsList[0]?.id || '',
                    description: '',
                    headEmployeeName: '',
                    color: '#0284c7',
                    icon: 'FolderTree',
                    displayOrder: (departmentsList.length + 1) * 10,
                  });
                  setShowDepartmentModal(true);
                }}
              >
                Add Department
              </DSButton>
            </div>
          </div>

          {/* Department Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Department Name</th>
                  <th className="p-3">Parent Division</th>
                  <th className="p-3">Head of Department</th>
                  <th className="p-3 text-center">Staff Count</th>
                  <th className="p-3 text-center">Active Projects</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departmentsList
                  .filter((dept) => divisionFilter === 'ALL' || dept.divisionId === divisionFilter)
                  .map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-teal-700">{dept.code}</td>
                      <td className="p-3 font-semibold text-slate-900">
                        <div>{dept.name}</div>
                        {dept.description && <div className="text-[11px] text-slate-400 font-normal mt-0.5">{dept.description}</div>}
                      </td>
                      <td className="p-3">
                        {dept.divisionName ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {dept.divisionName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No Division Assigned</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-700">
                        {dept.headEmployeeName ? (
                          <span className="flex items-center space-x-1">
                            <UserCheck className="w-3 h-3 text-teal-500" />
                            <span>{dept.headEmployeeName}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-900">
                        {dept.employeeCount || 0}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {dept.projectCount || 0} contracts
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            dept.isActive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {dept.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            title="Safe Reassign Parent Division"
                            onClick={() => {
                              setReassignDept(dept);
                              setReassignTargetDivisionId(dept.divisionId || '');
                              setReassignReason('');
                              setShowReassignModal(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Move className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            title="Edit Department"
                            onClick={() => {
                              setEditingDepartment(dept);
                              setDepartmentFormData({
                                code: dept.code,
                                name: dept.name,
                                divisionId: dept.divisionId || '',
                                description: dept.description || '',
                                headEmployeeName: dept.headEmployeeName || '',
                                color: dept.color || '#0284c7',
                                icon: dept.icon || 'FolderTree',
                                displayOrder: dept.displayOrder || 0,
                              });
                              setShowDepartmentModal(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            title={dept.isActive ? 'Deactivate Department' : 'Activate Department'}
                            onClick={() => handleToggleDepartmentStatus(dept)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              dept.isActive
                                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {dept.isActive ? <Trash2 className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </DSCard>
      )}

      {/* Tab: Project Department Matrix */}
      {activeTab === 'projects' && (
        <DSCard className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Project Independence & Dynamic Enterprise Disciplines</h3>
              <p className="text-xs text-slate-500 mt-1">
                SiteSync Pro supports all construction project verticals (Infrastructure, Marine, Energy, Buildings, Heavy Industrial, MEP, Utilities, Transport). Every project allocates from dynamically configured enterprise disciplines without hardcoded constraints.
              </p>
            </div>
            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<Layers className="w-3.5 h-3.5 text-blue-600" />}
              onClick={() => {
                setMasterCategory('disciplines');
                setActiveTab('masters');
              }}
            >
              Configure Disciplines ({configuredDisciplines.length})
            </DSButton>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Configured Enterprise Engineering Disciplines
              </span>
              <span className="text-xs text-slate-500">
                {configuredDisciplines.filter((d) => d.isActive).length} Active Disciplines
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {configuredDisciplines.length > 0 ? (
                configuredDisciplines.map((d) => (
                  <span
                    key={d.id}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      d.isActive
                        ? 'bg-white text-slate-800 border-slate-300 shadow-xs'
                        : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                    }`}
                  >
                    {d.name} <span className="text-[10px] text-slate-400 font-mono">({d.code})</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">Loading configured disciplines...</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
              <div className="flex items-center space-x-2 text-blue-800 font-bold text-sm">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span>Water Treatment Plant (WTP) Project</span>
              </div>
              <p className="text-xs text-slate-600">Peruvannamuzhi 100 MLD WTP & Intake Well</p>
              <div className="flex flex-wrap gap-1 pt-2">
                {configuredDisciplines
                  .filter((d) => ['DISC-CIVIL', 'DISC-MECH', 'DISC-ELEC', 'DISC-INST', 'DISC-QAQC', 'DISC-HSE', 'DISC-INFRA'].includes(d.code) || d.isActive)
                  .slice(0, 6)
                  .map((d) => (
                    <span key={d.id} className="text-[10px] bg-white text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-medium">
                      {d.name}
                    </span>
                  ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Roads & Expressway Project</span>
              </div>
              <p className="text-xs text-slate-600">4-Lane Highway & Concrete Culvert Contract</p>
              <div className="flex flex-wrap gap-1 pt-2">
                {configuredDisciplines
                  .filter((d) => ['DISC-CIVIL', 'DISC-QAQC', 'DISC-HSE', 'DISC-INFRA'].includes(d.code) || d.isActive)
                  .slice(0, 5)
                  .map((d) => (
                    <span key={d.id} className="text-[10px] bg-white text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                      {d.name}
                    </span>
                  ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>Commercial Building EPC Project</span>
              </div>
              <p className="text-xs text-slate-600">G+12 Administrative Complex with Basement MEP</p>
              <div className="flex flex-wrap gap-1 pt-2">
                {configuredDisciplines
                  .filter((d) => ['DISC-ARCH', 'DISC-CIVIL', 'DISC-HVAC', 'DISC-ELEC', 'DISC-QAQC'].includes(d.code) || d.isActive)
                  .slice(0, 5)
                  .map((d) => (
                    <span key={d.id} className="text-[10px] bg-white text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-medium">
                      {d.name}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </DSCard>
      )}

      {/* Tab: Master Foundation Picklists */}
      {activeTab === 'masters' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200">
            {[
              { id: 'disciplines', label: 'Disciplines (Configurable)' },
              { id: 'grades', label: 'Employee Grades' },
              { id: 'employment-types', label: 'Employment Types' },
              { id: 'trades', label: 'Trades' },
              { id: 'skills', label: 'Skills' },
              { id: 'project-categories', label: 'Project Categories' },
              { id: 'project-types', label: 'Project Types' },
              { id: 'contract-types', label: 'Contract Types' },
              { id: 'cost-centers', label: 'Cost Centers' },
              { id: 'profit-centers', label: 'Profit Centers' },
              { id: 'reporting-levels', label: 'Reporting Levels' },
              { id: 'business-units', label: 'Business Units' },
              { id: 'regions', label: 'Regions' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setMasterCategory(cat.id);
                  setMasterSearchQuery('');
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  masterCategory === cat.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <DSCard className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {masterCategory.replace(/-/g, ' ')} ({masterRecords.length} records)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enterprise configurable master catalog. Update or create custom items to match organizational requirements.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search master items..."
                  value={masterSearchQuery}
                  onChange={(e) => setMasterSearchQuery(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-48"
                />
                <DSButton
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setEditingMasterItem(null);
                    setMasterForm({ code: '', name: '', description: '', extra: '', isActive: true });
                    setShowAddMasterModal(true);
                  }}
                >
                  Add Master Item
                </DSButton>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {masterRecords
                    .filter((item) => {
                      if (!masterSearchQuery) return true;
                      const q = masterSearchQuery.toLowerCase();
                      return (
                        item.name?.toLowerCase().includes(q) ||
                        item.code?.toLowerCase().includes(q) ||
                        item.description?.toLowerCase().includes(q)
                      );
                    })
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-medium text-slate-900">{item.code}</td>
                        <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{item.description || '-'}</td>
                        <td className="p-3">
                          {item.isActive !== false ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              type="button"
                              title="Edit Master Item"
                              onClick={() => {
                                setEditingMasterItem(item);
                                setMasterForm({
                                  code: item.code || '',
                                  name: item.name || '',
                                  description: item.description || '',
                                  extra: item.extra || '',
                                  isActive: item.isActive !== false,
                                });
                                setShowAddMasterModal(true);
                              }}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title={item.isActive !== false ? 'Deactivate' : 'Activate'}
                              onClick={() => handleToggleMasterStatus(item)}
                              className={`p-1 rounded ${
                                item.isActive !== false
                                  ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {item.isActive !== false ? (
                                <Trash2 className="w-3.5 h-3.5" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {masterRecords.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                        No master records found for this category. Click &quot;Add Master Item&quot; to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DSCard>
        </div>
      )}

      {/* Tab: Reporting Hierarchy Tree */}
      {activeTab === 'reporting' && (
        <DSCard className="p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Database-Driven Employee Reporting Structure</h3>
            <p className="text-xs text-slate-500 mt-1">
              Hierarchical chain of command: Staff Engineer / Foreman → Department Head → Division Head → General Manager → Managing Director → Admin
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {reportingTree.map((emp) => (
              <div key={emp.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900 text-sm">{emp.name}</span>
                  <span className="text-xs text-slate-500">({emp.designationName} - {emp.departmentName})</span>
                </div>

                {emp.directReports && emp.directReports.length > 0 && (
                  <div className="pl-6 border-l-2 border-blue-300 space-y-2 mt-2">
                    {emp.directReports.map((sub: any) => (
                      <div key={sub.id} className="flex items-center space-x-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80">
                        <span className="font-semibold text-slate-900">{sub.name}</span>
                        <span className="text-slate-400">•</span>
                        <span>{sub.designationName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DSCard>
      )}

      {/* Tab: Bulk Import & Export */}
      {activeTab === 'bulk' && (
        <DSCard className="p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Bulk Organization Hierarchy Import / Export</h3>
            <p className="text-xs text-slate-500 mt-1">
              Import entire organizational trees, divisions, departments, and sub-departments via JSON or CSV arrays.
            </p>
          </div>

          <form onSubmit={handleBulkImport} className="space-y-3">
            <textarea
              rows={8}
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
              placeholder={`[\n  {\n    "unitCode": "DEP-SAFETY",\n    "name": "EHS & Site Safety Department",\n    "unitType": "DEPARTMENT",\n    "description": "Environmental, Health & Safety oversight"\n  }\n]`}
              className="w-full p-3 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />

            <div className="flex justify-end space-x-2">
              <DSButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flatUnits, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", "sitesync_org_structure.json");
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                leftIcon={<Download className="w-3.5 h-3.5 text-emerald-600" />}
              >
                Export JSON Tree
              </DSButton>

              <DSButton type="submit" variant="primary" size="sm" leftIcon={<Upload className="w-3.5 h-3.5" />}>
                Execute Bulk Import
              </DSButton>
            </div>
          </form>
        </DSCard>
      )}

      {/* Modal: Create / Edit Division */}
      <DSModal
        isOpen={showDivisionModal}
        onClose={() => setShowDivisionModal(false)}
        title={editingDivision ? `Edit Division: ${editingDivision.name}` : 'Create New Division'}
      >
        <form onSubmit={handleSaveDivision} className="space-y-4">
          <DSField label="Division Code (e.g. DIV-CIVIL, DIV-MECH, DIV-FIN)" required>
            <input
              type="text"
              required
              value={divisionFormData.code}
              onChange={(e) => setDivisionFormData({ ...divisionFormData, code: e.target.value.toUpperCase() })}
              placeholder="DIV-CIVIL"
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            />
          </DSField>

          <DSField label="Division Name" required>
            <input
              type="text"
              required
              value={divisionFormData.name}
              onChange={(e) => setDivisionFormData({ ...divisionFormData, name: e.target.value })}
              placeholder="Civil Engineering & Infrastructure"
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            />
          </DSField>

          <DSField label="Head of Division (Designation / Name)">
            <input
              type="text"
              value={divisionFormData.headEmployeeName}
              onChange={(e) => setDivisionFormData({ ...divisionFormData, headEmployeeName: e.target.value })}
              placeholder="e.g. Chief Operating Officer / Head of Civil"
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            />
          </DSField>

          <DSField label="Description & Scope">
            <textarea
              rows={3}
              value={divisionFormData.description}
              onChange={(e) => setDivisionFormData({ ...divisionFormData, description: e.target.value })}
              placeholder="Scope of work, operational mandates, and oversight domains"
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            />
          </DSField>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <DSButton variant="outline" size="sm" onClick={() => setShowDivisionModal(false)}>
              Cancel
            </DSButton>
            <DSButton type="submit" variant="primary" size="sm">
              {editingDivision ? 'Update Division' : 'Create Division'}
            </DSButton>
          </div>
        </form>
      </DSModal>

      {/* Modal: Create / Edit Department */}
      <DSModal
        isOpen={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        title={editingDepartment ? `Edit Department: ${editingDepartment.name}` : 'Create New Department'}
      >
        <form onSubmit={handleSaveDepartment} className="space-y-4">
          <DSField label="Parent Division" required>
            <select
              required
              value={departmentFormData.divisionId}
              onChange={(e) => setDepartmentFormData({ ...departmentFormData, divisionId: e.target.value })}
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            >
              <option value="">-- Select Parent Division --</option>
              {divisionsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </DSField>

          <div className="grid grid-cols-2 gap-3">
            <DSField label="Department Code" required>
              <input
                type="text"
                required
                value={departmentFormData.code}
                onChange={(e) => setDepartmentFormData({ ...departmentFormData, code: e.target.value.toUpperCase() })}
                placeholder="DEP-STRUCT"
                className="w-full p-2 text-sm rounded-lg border border-slate-200"
              />
            </DSField>

            <DSField label="Department Name" required>
              <input
                type="text"
                required
                value={departmentFormData.name}
                onChange={(e) => setDepartmentFormData({ ...departmentFormData, name: e.target.value })}
                placeholder="Structural Engineering"
                className="w-full p-2 text-sm rounded-lg border border-slate-200"
              />
            </DSField>
          </div>

          <DSField label="Head of Department">
            <input
              type="text"
              value={departmentFormData.headEmployeeName}
              onChange={(e) => setDepartmentFormData({ ...departmentFormData, headEmployeeName: e.target.value })}
              placeholder="e.g. Lead Structural Engineer / Sr. Manager"
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            />
          </DSField>

          <DSField label="Description">
            <textarea
              rows={2}
              value={departmentFormData.description}
              onChange={(e) => setDepartmentFormData({ ...departmentFormData, description: e.target.value })}
              placeholder="Functional responsibilities and deliverables"
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            />
          </DSField>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <DSButton variant="outline" size="sm" onClick={() => setShowDepartmentModal(false)}>
              Cancel
            </DSButton>
            <DSButton type="submit" variant="primary" size="sm">
              {editingDepartment ? 'Update Department' : 'Create Department'}
            </DSButton>
          </div>
        </form>
      </DSModal>

      {/* Modal: Safe Reassign Parent Division */}
      <DSModal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        title={`Safe Reassign Division: ${reassignDept?.name}`}
      >
        <form onSubmit={handleExecuteReassignment} className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-semibold flex items-center space-x-1">
              <Move className="w-3.5 h-3.5 text-amber-600" />
              <span>Safe Organizational Reassignment</span>
            </div>
            <p>
              Reassigning this department to a new parent division will safely update all hierarchy links and audit trails without modifying existing employee profiles, project allocations, or historical transactions.
            </p>
          </div>

          <DSField label="Current Department">
            <div className="p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold">
              {reassignDept?.name} ({reassignDept?.code}) — Current Division: {reassignDept?.divisionName || 'None'}
            </div>
          </DSField>

          <DSField label="Select New Parent Division" required>
            <select
              required
              value={reassignTargetDivisionId}
              onChange={(e) => setReassignTargetDivisionId(e.target.value)}
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            >
              <option value="">-- Choose New Parent Division --</option>
              {divisionsList
                .filter((d) => d.id !== reassignDept?.divisionId)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
            </select>
          </DSField>

          <DSField label="Reorganization Reason / Justification" required>
            <textarea
              rows={2}
              required
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              placeholder="e.g. Q3 Organizational Restructuring / Consolidation under Engineering vertical"
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            />
          </DSField>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <DSButton variant="outline" size="sm" onClick={() => setShowReassignModal(false)}>
              Cancel
            </DSButton>
            <DSButton type="submit" variant="primary" size="sm" leftIcon={<Move className="w-3.5 h-3.5" />}>
              Confirm Reassignment
            </DSButton>
          </div>
        </form>
      </DSModal>

      {/* Add Unit Modal (Legacy Tree Node) */}
      <DSModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Organization Unit / Sub-Department"
      >
        <form onSubmit={handleCreateUnit} className="space-y-4">
          <DSField label="Unit Code (e.g. DEP-CIVIL, SUB-PIPE)" required>
            <input
              type="text"
              required
              value={formData.unitCode}
              onChange={(e) => setFormData({ ...formData, unitCode: e.target.value })}
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            />
          </DSField>

          <DSField label="Department / Unit Name" required>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            />
          </DSField>

          <DSField label="Unit Hierarchy Type" required>
            <select
              value={formData.unitType}
              onChange={(e) => setFormData({ ...formData, unitType: e.target.value as any })}
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            >
              <option value="BUSINESS_UNIT">Business Unit</option>
              <option value="REGION">Region</option>
              <option value="BRANCH">Branch</option>
              <option value="DIVISION">Division</option>
              <option value="DEPARTMENT">Department</option>
              <option value="SUB_DEPARTMENT">Sub-Department</option>
              <option value="TEAM">Site Team / Crew</option>
            </select>
          </DSField>

          <DSField label="Parent Department / Unit">
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            >
              <option value="">No Parent (Top Root Entity)</option>
              {flatUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.unitCode})
                </option>
              ))}
            </select>
          </DSField>

          <DSField label="Description">
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            />
          </DSField>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <DSButton variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </DSButton>
            <DSButton type="submit" variant="primary" size="sm">
              Save Unit
            </DSButton>
          </div>
        </form>
      </DSModal>

      {/* Move Unit Modal */}
      <DSModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        title={`Move '${selectedNode?.name}' in Hierarchy`}
      >
        <form onSubmit={handleMoveUnit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Select a new parent department or unit. The hierarchy level and depth will update dynamically without data loss.
          </p>

          <DSField label="Select New Parent Unit">
            <select
              value={targetParentId}
              onChange={(e) => setTargetParentId(e.target.value)}
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            >
              <option value="">Top Level (Root Level Unit)</option>
              {flatUnits
                .filter((u) => u.id !== selectedNode?.id)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.unitCode} - {u.unitType})
                  </option>
                ))}
            </select>
          </DSField>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <DSButton variant="outline" size="sm" onClick={() => setShowMoveModal(false)}>
              Cancel
            </DSButton>
            <DSButton type="submit" variant="primary" size="sm" leftIcon={<Move className="w-3.5 h-3.5" />}>
              Confirm Move
            </DSButton>
          </div>
        </form>
      </DSModal>

      {/* Merge Units Modal */}
      <DSModal
        isOpen={showMergeModal}
        onClose={() => setShowMergeModal(false)}
        title="Merge Departments"
      >
        <form onSubmit={handleMergeUnits} className="space-y-4">
          <p className="text-xs text-slate-600">
            Merging reassigns all employees, sub-departments, and project allocations from the Source Department into the Target Department before deactivating the Source Department.
          </p>

          <DSField label="Source Department (To be merged & deactivated)" required>
            <select
              required
              value={mergeSourceId}
              onChange={(e) => setMergeSourceId(e.target.value)}
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            >
              <option value="">Select Source Department</option>
              {flatUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.unitCode})
                </option>
              ))}
            </select>
          </DSField>

          <DSField label="Target Department (Receiving department)" required>
            <select
              required
              value={mergeTargetId}
              onChange={(e) => setMergeTargetId(e.target.value)}
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            >
              <option value="">Select Target Department</option>
              {flatUnits
                .filter((u) => u.id !== mergeSourceId)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.unitCode})
                  </option>
                ))}
            </select>
          </DSField>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <DSButton variant="outline" size="sm" onClick={() => setShowMergeModal(false)}>
              Cancel
            </DSButton>
            <DSButton type="submit" variant="danger" size="sm" leftIcon={<GitMerge className="w-3.5 h-3.5" />}>
              Merge Departments
            </DSButton>
          </div>
        </form>
      </DSModal>

      {/* Add / Edit Master Modal */}
      <DSModal
        isOpen={showAddMasterModal}
        onClose={() => {
          setShowAddMasterModal(false);
          setEditingMasterItem(null);
        }}
        title={`${editingMasterItem ? 'Edit' : 'Add'} Master Item (${masterCategory.replace(/-/g, ' ')})`}
      >
        <form onSubmit={handleSaveMaster} className="space-y-4">
          <DSField label="Item Code" required>
            <input
              type="text"
              required
              value={masterForm.code}
              onChange={(e) => setMasterForm({ ...masterForm, code: e.target.value })}
              placeholder="e.g., DISC-GEOTECH or GRD-L5"
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            />
          </DSField>

          <DSField label="Item Name" required>
            <input
              type="text"
              required
              value={masterForm.name}
              onChange={(e) => setMasterForm({ ...masterForm, name: e.target.value })}
              placeholder="e.g., Geotechnical Engineering"
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            />
          </DSField>

          <DSField label="Description">
            <textarea
              rows={2}
              value={masterForm.description}
              onChange={(e) => setMasterForm({ ...masterForm, description: e.target.value })}
              placeholder="Optional description of this master item..."
              className="w-full p-2 text-sm rounded-lg border border-slate-200"
            />
          </DSField>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="masterActiveCheckbox"
              checked={masterForm.isActive !== false}
              onChange={(e) => setMasterForm({ ...masterForm, isActive: e.target.checked })}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="masterActiveCheckbox" className="text-xs font-medium text-slate-700">
              Active in system
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <DSButton
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddMasterModal(false);
                setEditingMasterItem(null);
              }}
            >
              Cancel
            </DSButton>
            <DSButton type="submit" variant="primary" size="sm">
              {editingMasterItem ? 'Update Master Record' : 'Save Master Record'}
            </DSButton>
          </div>
        </form>
      </DSModal>
    </div>
  );
};

