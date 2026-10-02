import React, { useState, useEffect } from 'react';
import {
  FileText, Folder, FolderPlus, Upload, Search, Filter, Star, Eye, Download,
  CheckCircle, Clock, AlertTriangle, Shield, RefreshCw, Plus, Edit2, Trash2,
  Share2, Lock, Unlock, FileCheck, Layers, Tag, Archive, CornerUpLeft, MessageSquare,
  Paperclip, ExternalLink, QrCode, FileCode, CheckSquare, XSquare, ChevronRight,
  ChevronDown, Grid, List, Activity, Sparkles, HardDrive, Check, Award
} from 'lucide-react';

interface EDMSStats {
  totalDocuments: number;
  totalFolders: number;
  pendingApprovals: number;
  approvedDocuments: number;
  checkedOutCount: number;
  archivedCount: number;
  totalStorageMB: number;
}

interface DocumentFolder {
  id: string;
  folderName: string;
  parentId: string | null;
  folderPath: string;
  department: string;
  isSystemFolder: boolean;
  status: string;
}

interface DocumentFile {
  id: string;
  documentNumber: string;
  title: string;
  description: string | null;
  folderId: string;
  categoryId: string | null;
  fileType: string;
  fileSizeBytes: number;
  fileUrl: string;
  currentVersion: string;
  revisionNumber: number;
  projectId?: string;
  vendorId?: string;
  contractId?: string;
  isCheckedOut: boolean;
  checkedOutBy: string | null;
  isFavorite: boolean;
  isArchived: boolean;
  workflowStatus: string;
  digitalStampApplied: boolean;
  watermarkText: string | null;
  createdAt: string;
  createdBy: string;
  isDeleted?: boolean;
}

interface DocumentVersion {
  id: string;
  versionName: string;
  revisionNumber: number;
  fileUrl: string;
  fileSizeBytes: number;
  changeSummary: string;
  uploadedBy: string;
  createdAt: string;
}

export const EnterpriseDocumentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EXPLORER' | 'FAVORITES' | 'APPROVAL_QUEUE' | 'CHECKED_OUT' | 'ARCHIVE' | 'RECYCLE_BIN' | 'AUDIT_LOGS'>('EXPLORER');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [stats, setStats] = useState<EDMSStats>({
    totalDocuments: 14,
    totalFolders: 4,
    pendingApprovals: 3,
    approvedDocuments: 8,
    checkedOutCount: 2,
    archivedCount: 1,
    totalStorageMB: 128.4
  });

  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Modals & Panels
  const [selectedDoc, setSelectedDoc] = useState<DocumentFile | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Modal Forms
  const [newFolderName, setNewFolderName] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocType, setNewDocType] = useState('PDF');
  const [newDocFolderId, setNewDocFolderId] = useState('');
  const [newDocWatermark, setNewDocWatermark] = useState('');

  // Version Upload Form
  const [versionName, setVersionName] = useState('');
  const [versionSummary, setVersionSummary] = useState('');

  // Approval Form
  const [approvalDecision, setApprovalDecision] = useState<'APPROVED' | 'REJECTED' | 'RETURNED'>('APPROVED');
  const [approvalRemarks, setApprovalRemarks] = useState('');

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [docVersions, setDocVersions] = useState<DocumentVersion[]>([]);

  useEffect(() => {
    fetchStats();
    fetchFolders();
    fetchDocuments();
  }, [activeTab, selectedFolderId]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/documents/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) {
      console.warn('Failed to fetch EDMS stats:', e);
    }
  };

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/documents/folders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFolders(data.data);
        if (!selectedFolderId && data.data.length > 0) {
          setSelectedFolderId(data.data[0].id);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch folders:', e);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      let url = '/api/documents/documents?';
      if (activeTab === 'FAVORITES') url += 'isFavorite=true&';
      else if (activeTab === 'ARCHIVE') url += 'isArchived=true&';
      else if (activeTab === 'RECYCLE_BIN') url += 'isDeleted=true&';
      else if (activeTab === 'CHECKED_OUT') url += 'isCheckedOut=true&';
      else if (activeTab === 'APPROVAL_QUEUE') url += 'workflowStatus=SUBMITTED&';
      else if (selectedFolderId) url += `folderId=${selectedFolderId}&`;

      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setDocuments(data.data);
    } catch (e) {
      console.warn('Failed to fetch documents:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/documents/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          folderName: newFolderName,
          parentId: selectedFolderId || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewFolderName('');
        setShowFolderModal(false);
        fetchFolders();
      }
    } catch (e) {
      console.error('Error creating folder:', e);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/documents/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newDocTitle,
          description: newDocDesc,
          folderId: newDocFolderId || selectedFolderId || folders[0]?.id || '',
          fileType: newDocType,
          watermarkText: newDocWatermark || undefined,
          fileSizeBytes: Math.floor(Math.random() * 5000000) + 500000,
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewDocTitle('');
        setNewDocDesc('');
        setShowUploadModal(false);
        fetchDocuments();
        fetchStats();
      }
    } catch (e) {
      console.error('Error uploading document:', e);
    }
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/documents/documents/${id}/favorite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDocuments();
    } catch (e) {
      console.error('Toggle favorite error:', e);
    }
  };

  const handleCheckoutToggle = async (doc: DocumentFile) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (doc.isCheckedOut) {
        // Show version upload modal to check in
        setSelectedDoc(doc);
        setShowVersionModal(true);
      } else {
        await fetch('/api/documents/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            documentId: doc.id,
            checkoutNotes: 'Direct checkout for editing'
          })
        });
        fetchDocuments();
        fetchStats();
      }
    } catch (e) {
      console.error('Checkout error:', e);
    }
  };

  const handleUploadVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    try {
      const token = localStorage.getItem('accessToken');
      const nextRev = selectedDoc.revisionNumber + 1;
      const res = await fetch('/api/documents/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          versionName: versionName || `v1.${nextRev}`,
          fileUrl: `https://assets.sitesyncpro.com/docs/rev_${nextRev}.pdf`,
          changeSummary: versionSummary || 'New revision uploaded',
          isMajorVersion: false,
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowVersionModal(false);
        setVersionName('');
        setVersionSummary('');
        fetchDocuments();
        fetchStats();
      }
    } catch (e) {
      console.error('Version upload error:', e);
    }
  };

  const handleApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/documents/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          approverName: 'Project Manager',
          approvalRole: 'PROJECT_MANAGER',
          decision: approvalDecision,
          remarks: approvalRemarks,
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowApprovalModal(false);
        setApprovalRemarks('');
        fetchDocuments();
        fetchStats();
      }
    } catch (e) {
      console.error('Approval submit error:', e);
    }
  };

  const handleSoftDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to move this document to the Recycle Bin?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/documents/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDocuments();
      fetchStats();
    } catch (e) {
      console.error('Delete document error:', e);
    }
  };

  const handleRestore = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/documents/documents/${id}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDocuments();
      fetchStats();
    } catch (e) {
      console.error('Restore error:', e);
    }
  };

  const openAuditModal = async (doc: DocumentFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDoc(doc);
    setShowAuditModal(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/documents/audit?documentId=${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAuditLogs(data.data);
    } catch (e) {
      console.warn('Audit fetch error:', e);
    }
  };

  const openVersionsModal = async (doc: DocumentFile) => {
    setSelectedDoc(doc);
    setShowVersionModal(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/documents/documents/${doc.id}/versions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setDocVersions(data.data);
    } catch (e) {
      console.warn('Versions fetch error:', e);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Under Review</span>;
      case 'REJECTED':
      case 'RETURNED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"><XSquare className="w-3 h-3" /> {status}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">Draft</span>;
    }
  };

  // File Type Icon Helper
  const getFileTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'DWG':
      case 'CAD':
      case 'BIM':
        return <FileCode className="w-8 h-8 text-indigo-600" />;
      case 'PDF':
        return <FileText className="w-8 h-8 text-rose-600" />;
      case 'DOCX':
      case 'WORD':
        return <FileText className="w-8 h-8 text-blue-600" />;
      case 'XLSX':
      case 'EXCEL':
      case 'BOQ':
        return <Layers className="w-8 h-8 text-emerald-600" />;
      case 'PNG':
      case 'JPG':
      case 'PHOTO':
        return <Sparkles className="w-8 h-8 text-purple-600" />;
      default:
        return <FileText className="w-8 h-8 text-slate-600" />;
    }
  };

  const filteredDocs = documents.filter(d => {
    if (filterType !== 'ALL' && d.fileType !== filterType) return false;
    if (filterStatus !== 'ALL' && d.workflowStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Phase 61 EDMS Engine
            </span>
            <span className="text-xs text-slate-400">Unlimited Hierarchy & Revision Control</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-indigo-400" /> Enterprise Document Management
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Centralized document repository with version control, CAD drawings, digital approvals, OCR full-text search, and automated audit logging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFolderModal(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition border border-slate-700 shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-indigo-400" /> New Folder
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30"
          >
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Documents</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">{stats.totalDocuments}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{stats.totalFolders} Active Folders</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-amber-600 mt-2">{stats.pendingApprovals}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Requires Manager Review</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Approved Files</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-2">{stats.approvedDocuments}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Digitally Stamped</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Checked Out</span>
            <Lock className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-bold text-rose-600 mt-2">{stats.checkedOutCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Locked for Editing</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Archived Files</span>
            <Archive className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">{stats.archivedCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Retained Documents</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Storage Used</span>
            <HardDrive className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">{stats.totalStorageMB} MB</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Encrypted Cloud Repository</p>
        </div>
      </div>

      {/* Main EDMS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Navigation & Folder Tree */}
        <div className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">EDMS Views</h3>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('EXPLORER')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'EXPLORER' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2"><Folder className="w-4 h-4" /> All Folders</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{folders.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('FAVORITES')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'FAVORITES' ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Favorites</span>
              </button>

              <button
                onClick={() => setActiveTab('APPROVAL_QUEUE')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'APPROVAL_QUEUE' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-indigo-600" /> Approval Queue</span>
                {stats.pendingApprovals > 0 && (
                  <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">{stats.pendingApprovals}</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('CHECKED_OUT')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'CHECKED_OUT' ? 'bg-rose-50 text-rose-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-rose-500" /> Checked Out</span>
              </button>

              <button
                onClick={() => setActiveTab('ARCHIVE')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'ARCHIVE' ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2"><Archive className="w-4 h-4 text-purple-600" /> Document Archive</span>
              </button>

              <button
                onClick={() => setActiveTab('RECYCLE_BIN')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'RECYCLE_BIN' ? 'bg-slate-100 text-slate-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2"><Trash2 className="w-4 h-4 text-slate-500" /> Recycle Bin</span>
              </button>
            </nav>
          </div>

          <hr className="border-slate-100" />

          {/* Folder Tree */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Folder Directory</h3>
              <button onClick={() => setShowFolderModal(true)} className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            <div className="space-y-1">
              {folders.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition truncate ${
                    selectedFolderId === f.id ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Folder className="w-4 h-4 shrink-0" />
                  <span className="truncate">{f.folderName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Content: Document Search & Workspace */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="OCR Full-text Search by Document Number, Title, Content, Metadata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDocuments()}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All File Types</option>
                <option value="DWG">AutoCAD Drawings (DWG)</option>
                <option value="PDF">PDF Documents</option>
                <option value="DOCX">Word (DOCX)</option>
                <option value="XLSX">Excel & BOQ (XLSX)</option>
                <option value="PNG">Site Photos & Inspection</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode('GRID')}
                  className={`p-1.5 rounded-md transition ${viewMode === 'GRID' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('LIST')}
                  className={`p-1.5 rounded-md transition ${viewMode === 'LIST' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Document Content Workspace */}
          {loading ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">Retrieving Document Repository...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-semibold text-slate-800">No Documents Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No documents match your current filter or selected folder. Upload a new document to populate the repository.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow hover:bg-indigo-500 transition"
              >
                <Upload className="w-4 h-4" /> Upload Document Now
              </button>
            </div>
          ) : viewMode === 'GRID' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`bg-white rounded-xl border p-4 transition cursor-pointer hover:shadow-md relative flex flex-col justify-between ${
                    selectedDoc?.id === doc.id ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div>
                    {/* Top Row: File Icon & Action Badges */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        {getFileTypeIcon(doc.fileType)}
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 block">{doc.documentNumber}</span>
                          <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{doc.fileType}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleToggleFavorite(doc.id, e)}
                        className="text-slate-300 hover:text-amber-500 transition"
                      >
                        <Star className={`w-4 h-4 ${doc.isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{doc.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{doc.description || 'No description provided.'}</p>
                  </div>

                  <div>
                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {getStatusBadge(doc.workflowStatus)}
                      <span className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                        {doc.currentVersion}
                      </span>
                      {doc.isCheckedOut && (
                        <span className="text-[10px] font-medium bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Checked Out
                        </span>
                      )}
                    </div>

                    <hr className="border-slate-100 my-2" />

                    {/* Footer Row */}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{doc.createdBy}</span>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openVersionsModal(doc)}
                          className="hover:text-indigo-600 transition"
                          title="Version History"
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => openAuditModal(doc, e)}
                          className="hover:text-indigo-600 transition"
                          title="Audit Logs"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                        {activeTab === 'RECYCLE_BIN' ? (
                          <button
                            onClick={(e) => handleRestore(doc.id, e)}
                            className="text-emerald-600 hover:text-emerald-700 transition"
                            title="Restore Document"
                          >
                            <CornerUpLeft className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleSoftDelete(doc.id, e)}
                            className="hover:text-rose-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table / List View */
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-200">
                    <th className="p-3">Doc #</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Author</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`hover:bg-indigo-50/50 transition cursor-pointer ${selectedDoc?.id === doc.id ? 'bg-indigo-50/80' : ''}`}
                    >
                      <td className="p-3 font-mono font-semibold text-indigo-600">{doc.documentNumber}</td>
                      <td className="p-3 font-medium text-slate-900">{doc.title}</td>
                      <td className="p-3 font-semibold text-slate-600">{doc.fileType}</td>
                      <td className="p-3 font-medium text-slate-700">{doc.currentVersion}</td>
                      <td className="p-3">{getStatusBadge(doc.workflowStatus)}</td>
                      <td className="p-3 text-slate-500">{doc.createdBy}</td>
                      <td className="p-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleCheckoutToggle(doc)}
                          className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 font-medium"
                        >
                          {doc.isCheckedOut ? 'Check-in' : 'Check-out'}
                        </button>
                        {doc.workflowStatus === 'SUBMITTED' && (
                          <button
                            onClick={() => {
                              setSelectedDoc(doc);
                              setShowApprovalModal(true);
                            }}
                            className="px-2 py-1 text-xs rounded bg-indigo-600 text-white font-medium hover:bg-indigo-500"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Create Folder */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-indigo-600" /> Create Folder Directory
            </h3>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Folder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Structural Analysis Reports"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 shadow"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Upload Document */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" /> Upload Document to EDMS
            </h3>

            <form onSubmit={handleUploadDocument} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Bridge Pier Structural Drawing Rev-2"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Provide scope, specification references, or revisions..."
                  value={newDocDesc}
                  onChange={(e) => setNewDocDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Document Type</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DWG">AutoCAD Drawing (.DWG)</option>
                    <option value="PDF">PDF Report / Spec</option>
                    <option value="DOCX">Word Document (.DOCX)</option>
                    <option value="XLSX">BOQ & Excel (.XLSX)</option>
                    <option value="PNG">Site Photo / Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Folder</label>
                  <select
                    value={newDocFolderId || selectedFolderId || ''}
                    onChange={(e) => setNewDocFolderId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>{f.folderName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Security Watermark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., CONFIDENTIAL - SITESYNC PRO INTERNAL"
                  value={newDocWatermark}
                  onChange={(e) => setNewDocWatermark(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 shadow"
                >
                  Save & Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Approval Decision */}
      {showApprovalModal && selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" /> Digital Approval Decision
            </h3>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-bold text-slate-900">{selectedDoc.title}</p>
              <p className="text-[11px] font-mono text-indigo-600 mt-0.5">{selectedDoc.documentNumber} ({selectedDoc.currentVersion})</p>
            </div>

            <form onSubmit={handleApprovalSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Decision</label>
                <select
                  value={approvalDecision}
                  onChange={(e: any) => setApprovalDecision(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="APPROVED">APPROVE & APPLY DIGITAL STAMP</option>
                  <option value="RETURNED">RETURN FOR REVISION</option>
                  <option value="REJECTED">REJECT DOCUMENT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Manager Remarks / Stamp Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter approval comments or conditions..."
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 shadow"
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Versions & Revision History */}
      {showVersionModal && selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> Revision History & Version Control
            </h3>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-bold text-slate-900">{selectedDoc.title}</p>
              <p className="text-[11px] text-slate-500">{selectedDoc.documentNumber} - Current: {selectedDoc.currentVersion}</p>
            </div>

            <form onSubmit={handleUploadVersion} className="space-y-3 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
              <h4 className="text-xs font-bold text-indigo-900">Upload New Revision (Check-in)</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Version Name e.g. v1.2"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Summary of Changes"
                  value={versionSummary}
                  onChange={(e) => setVersionSummary(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 shadow"
              >
                Upload Revision & Complete Check-in
              </button>
            </form>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {docVersions.map(v => (
                <div key={v.id} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-indigo-600">{v.versionName}</span>
                    <span className="text-slate-500 ml-2">{v.changeSummary}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(v.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Audit Trail */}
      {showAuditModal && selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" /> Complete Document Audit Trail
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-indigo-600 uppercase">{log.actionExecuted}</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-700">Executed by: <span className="font-semibold">{log.actorName}</span></p>
                  {log.detailsJson && <p className="text-[10px] font-mono text-slate-500 truncate">{log.detailsJson}</p>}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
