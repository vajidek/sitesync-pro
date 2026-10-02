import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  Sun,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  Camera,
  Paperclip,
  User,
  Building2,
  MapPin,
  Send,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Eye,
  Trash2,
  Edit3,
  Download,
  CheckSquare,
  HardHat,
  Thermometer,
  Wind,
  Droplets,
  Layers,
  ChevronDown
} from 'lucide-react';

interface ProjectDprViewProps {
  projectId: string;
  projectName?: string;
}

export const ProjectDprView: React.FC<ProjectDprViewProps> = ({ projectId, projectName }) => {
  const [dprs, setDprs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  const [selectedDpr, setSelectedDpr] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState<boolean>(false);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState<boolean>(false);

  // Form states
  const [newDpr, setNewDpr] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'DAY',
    departmentName: 'Civil Construction',
    location: 'Zone 1 - Main Site',
    preparedByName: 'Site Engineer',
    checkedByName: 'Project Manager',
    remarks: ''
  });

  const [newEntry, setNewEntry] = useState({
    wbsId: '',
    boqItemId: '',
    activityId: '',
    department: 'Civil',
    responsibleEngineerName: 'Er. Rajesh Kumar',
    supervisorName: 'Supervisor Singh',
    plannedQty: 100,
    todayQty: 15,
    unit: 'm',
    workingHours: 8,
    remarks: 'Poured M30 Concrete grade'
  });

  const [newDelay, setNewDelay] = useState({
    category: 'MATERIAL',
    reason: 'Delay in cement truck delivery due to heavy traffic',
    responsibleParty: 'Vendor Transport',
    impact: 'HIGH',
    estimatedDelayHours: 3,
    correctiveAction: 'Rescheduled evening shift batching plant'
  });

  const [newPhoto, setNewPhoto] = useState({
    category: 'DURING',
    fileUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    caption: 'Rebar placement for Column C4',
    gpsLat: 9.9312,
    gpsLng: 76.2673
  });

  const [newDoc, setNewDoc] = useState({
    title: 'Daily Site Pour Card Inspection Report',
    documentType: 'INSPECTION_REPORT',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '1.2 MB'
  });

  const [newComment, setNewComment] = useState('');

  const [wbsActivitiesList, setWbsActivitiesList] = useState<any[]>([]);

  useEffect(() => {
    fetchDprs();
    fetchActivities();
  }, [projectId]);

  const fetchDprs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/dprs`);
      if (res.ok) {
        const json = await res.json();
        setDprs(json.data || []);
      } else {
        // Fallback seed data if DB table empty
        seedFallbackDprs();
      }
    } catch (err) {
      seedFallbackDprs();
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/activities`);
      if (res.ok) {
        const json = await res.json();
        setWbsActivitiesList(json.data || []);
      }
    } catch (err) {
      console.log('No activities loaded, will use fallback options');
    }
  };

  const seedFallbackDprs = () => {
    const today = new Date().toISOString().split('T')[0];
    const fallback = [
      {
        id: 'dpr-001',
        dprNumber: `DPR-${today.replace(/-/g, '')}-001`,
        projectId,
        date: today,
        shift: 'DAY',
        departmentName: 'Civil Engineering',
        location: 'Zone A - Foundation & Structure',
        preparedByName: 'Er. Arun Nair',
        checkedByName: 'Er. Suresh V',
        approvedByName: 'PM K. Sharma',
        status: 'SUBMITTED',
        remarks: 'Structural concreting completed for Grid A1-A4.',
        siteConditions: {
          workingFrontAvailable: true,
          accessAvailable: true,
          drawingAvailable: true,
          materialAvailable: true,
          equipmentAvailable: true,
          powerAvailable: true,
          safetyIssues: false
        },
        entries: [
          {
            id: 'e-1',
            dprId: 'dpr-001',
            department: 'Civil',
            responsibleEngineerName: 'Er. Arun Nair',
            supervisorName: 'Murugan P',
            plannedQty: 250,
            todayQty: 35,
            cumulativeQty: 180,
            remainingQty: 70,
            progressPercentage: 72,
            unit: 'm3',
            workingHours: 8,
            remarks: 'M30 Grade Concreting done'
          },
          {
            id: 'e-2',
            dprId: 'dpr-001',
            department: 'Mechanical',
            responsibleEngineerName: 'Er. Rahul S',
            supervisorName: 'Joseph K',
            plannedQty: 120,
            todayQty: 15,
            cumulativeQty: 90,
            remainingQty: 30,
            progressPercentage: 75,
            unit: 'MT',
            workingHours: 7.5,
            remarks: 'Structural steel alignment'
          }
        ],
        photos: [
          {
            id: 'p-1',
            category: 'DURING',
            fileUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
            caption: 'Concrete pour at Grid A1',
            gpsLat: 9.9312,
            gpsLng: 76.2673
          }
        ],
        documents: [
          {
            id: 'd-1',
            title: 'Concrete Test Cube Slip - Batch 4',
            documentType: 'INSPECTION_REPORT',
            fileUrl: '#',
            fileSize: '450 KB',
            uploadedBy: 'Er. Arun Nair'
          }
        ],
        weather: {
          condition: 'SUNNY',
          temperature: 31,
          humidity: 68,
          rainfall: 0,
          windSpeed: 12,
          remarks: 'Good working weather throughout shift'
        },
        delays: [
          {
            id: 'dl-1',
            category: 'MATERIAL',
            reason: '30 mins transit delay for Transit Mixer #4',
            responsibleParty: 'Supplier',
            impact: 'LOW',
            estimatedDelayHours: 0.5,
            status: 'RESOLVED'
          }
        ],
        approvals: [
          {
            id: 'app-1',
            approverName: 'Er. Arun Nair',
            action: 'SUBMIT',
            remarks: 'Submitted for Site Manager review',
            createdAt: new Date().toISOString()
          }
        ],
        comments: [
          {
            id: 'c-1',
            authorName: 'Er. Suresh V',
            role: 'SUPERVISOR',
            comment: 'Slump test passed at 110mm. Curing started.',
            createdAt: new Date().toISOString()
          }
        ]
      }
    ];
    setDprs(fallback);
  };

  const handleCreateDpr = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/dprs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDpr)
      });
      if (res.ok) {
        fetchDprs();
        setIsCreateModalOpen(false);
      } else {
        // Fallback local creation
        const today = newDpr.date;
        const created = {
          id: `dpr-${Date.now()}`,
          dprNumber: `DPR-${today.replace(/-/g, '')}-${(dprs.length + 1).toString().padStart(3, '0')}`,
          projectId,
          ...newDpr,
          status: 'DRAFT',
          siteConditions: {
            workingFrontAvailable: true,
            accessAvailable: true,
            drawingAvailable: true,
            materialAvailable: true,
            equipmentAvailable: true,
            powerAvailable: true,
            safetyIssues: false
          },
          entries: [],
          photos: [],
          documents: [],
          weather: { condition: 'SUNNY', temperature: 30, humidity: 65 },
          delays: [],
          approvals: [],
          comments: []
        };
        setDprs([created, ...dprs]);
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEntry = async () => {
    if (!selectedDpr) return;
    try {
      const res = await fetch(`/api/dprs/${selectedDpr.id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEntry, projectId })
      });
      if (res.ok) {
        refreshSelectedDpr(selectedDpr.id);
        setIsEntryModalOpen(false);
      } else {
        // Local update
        const entryObj = {
          id: `e-${Date.now()}`,
          ...newEntry,
          cumulativeQty: newEntry.todayQty,
          remainingQty: Math.max(0, newEntry.plannedQty - newEntry.todayQty),
          progressPercentage: Math.round((newEntry.todayQty / newEntry.plannedQty) * 100)
        };
        const updatedDprs = dprs.map(d => d.id === selectedDpr.id ? { ...d, entries: [...(d.entries || []), entryObj] } : d);
        setDprs(updatedDprs);
        setSelectedDpr({ ...selectedDpr, entries: [...(selectedDpr.entries || []), entryObj] });
        setIsEntryModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDelay = async () => {
    if (!selectedDpr) return;
    try {
      const res = await fetch(`/api/dprs/${selectedDpr.id}/delays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDelay)
      });
      if (res.ok) {
        refreshSelectedDpr(selectedDpr.id);
        setIsDelayModalOpen(false);
      } else {
        const delayObj = { id: `dl-${Date.now()}`, ...newDelay, status: 'OPEN' };
        const updatedDprs = dprs.map(d => d.id === selectedDpr.id ? { ...d, delays: [...(d.delays || []), delayObj] } : d);
        setDprs(updatedDprs);
        setSelectedDpr({ ...selectedDpr, delays: [...(selectedDpr.delays || []), delayObj] });
        setIsDelayModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPhoto = async () => {
    if (!selectedDpr) return;
    try {
      const res = await fetch(`/api/dprs/${selectedDpr.id}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhoto)
      });
      if (res.ok) {
        refreshSelectedDpr(selectedDpr.id);
        setIsPhotoModalOpen(false);
      } else {
        const photoObj = { id: `p-${Date.now()}`, ...newPhoto };
        const updatedDprs = dprs.map(d => d.id === selectedDpr.id ? { ...d, photos: [...(d.photos || []), photoObj] } : d);
        setDprs(updatedDprs);
        setSelectedDpr({ ...selectedDpr, photos: [...(selectedDpr.photos || []), photoObj] });
        setIsPhotoModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDocument = async () => {
    if (!selectedDpr) return;
    try {
      const res = await fetch(`/api/dprs/${selectedDpr.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
      if (res.ok) {
        refreshSelectedDpr(selectedDpr.id);
        setIsDocModalOpen(false);
      } else {
        const docObj = { id: `d-${Date.now()}`, ...newDoc, uploadedBy: 'Site Engineer' };
        const updatedDprs = dprs.map(d => d.id === selectedDpr.id ? { ...d, documents: [...(d.documents || []), docObj] } : d);
        setDprs(updatedDprs);
        setSelectedDpr({ ...selectedDpr, documents: [...(selectedDpr.documents || []), docObj] });
        setIsDocModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWorkflowAction = async (action: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'RETURN') => {
    if (!selectedDpr) return;
    try {
      const res = await fetch(`/api/dprs/${selectedDpr.id}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          approverName: 'Manager / Engineer',
          remarks: `Workflow action ${action} executed.`
        })
      });
      let newStatus = 'SUBMITTED';
      if (action === 'APPROVE') newStatus = 'APPROVED';
      if (action === 'REJECT') newStatus = 'REJECTED';
      if (action === 'RETURN') newStatus = 'RETURNED';

      const updated = { ...selectedDpr, status: newStatus };
      setSelectedDpr(updated);
      setDprs(dprs.map(d => d.id === selectedDpr.id ? updated : d));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    if (!selectedDpr || !newComment.trim()) return;
    try {
      await fetch(`/api/dprs/${selectedDpr.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: 'Site Engineer',
          role: 'ENGINEER',
          comment: newComment
        })
      });
      const commentObj = {
        id: `c-${Date.now()}`,
        authorName: 'Site Engineer',
        role: 'ENGINEER',
        comment: newComment,
        createdAt: new Date().toISOString()
      };
      setSelectedDpr({ ...selectedDpr, comments: [commentObj, ...(selectedDpr.comments || [])] });
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const refreshSelectedDpr = async (id: string) => {
    try {
      const res = await fetch(`/api/dprs/${id}`);
      if (res.ok) {
        const json = await res.json();
        setSelectedDpr(json.data);
        setDprs(dprs.map(d => d.id === id ? json.data : d));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // KPI calculations
  const totalDprs = dprs.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDprsCount = dprs.filter(d => d.date === todayStr).length;
  const pendingApprovalsCount = dprs.filter(d => d.status === 'SUBMITTED' || d.status === 'REVIEWED').length;
  const openDelaysCount = dprs.reduce((acc, d) => acc + (d.delays ? d.delays.filter((x: any) => x.status === 'OPEN').length : 0), 0);

  // Filter logic
  const filteredDprs = dprs.filter(d => {
    const matchesSearch = searchQuery === '' || 
      d.dprNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.preparedByName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.remarks?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesShift = shiftFilter === 'ALL' || d.shift === shiftFilter;
    const matchesDate = dateFilter === '' || d.date === dateFilter;

    return matchesSearch && matchesStatus && matchesShift && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards Header Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's DPRs</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{todayDprsCount}</h3>
              <p className="text-xs text-slate-500 mt-1">Total Logs: {totalDprs}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingApprovalsCount}</h3>
              <p className="text-xs text-slate-500 mt-1">Awaiting PM Review</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Site Hindrances / Delays</p>
              <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{openDelaysCount}</h3>
              <p className="text-xs text-slate-500 mt-1">Active Issues Logged</p>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Site Weather Status</p>
              <div className="flex items-center gap-2 mt-1">
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Sunny / 31°C</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Humidity 68% • Fair Condition</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Thermometer className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Action & Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search DPR Number, Location, Prepared By or Remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
            />

            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
            >
              <option value="ALL">All Shifts</option>
              <option value="DAY">Day Shift</option>
              <option value="NIGHT">Night Shift</option>
              <option value="SHIFT_1">Shift 1</option>
              <option value="SHIFT_2">Shift 2</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="RETURNED">Returned</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New DPR</span>
            </button>
          </div>
        </div>
      </div>

      {/* DPR Cards / List Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Daily Progress Reports ({filteredDprs.length})</h2>
          </div>
          <button 
            onClick={fetchDprs} 
            className="p-1.5 text-slate-500 hover:text-blue-600 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-sm">Loading Daily Progress Reports...</p>
          </div>
        ) : filteredDprs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No DPRs Found</h3>
            <p className="text-xs text-slate-500 mt-1">Create a new Daily Progress Report to log site execution progress.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold"
            >
              + Create First DPR
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredDprs.map((dpr) => (
              <div 
                key={dpr.id} 
                className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => {
                  setSelectedDpr(dpr);
                  setIsDetailOpen(true);
                }}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{dpr.dprNumber}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      dpr.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      dpr.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                      dpr.status === 'RETURNED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {dpr.status}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                      {dpr.shift} SHIFT
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {dpr.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> {dpr.location || 'Site Location'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> {dpr.departmentName || 'Civil Department'}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Prepared By: {dpr.preparedByName || 'Engineer'}
                    </span>
                  </div>

                  {dpr.remarks && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 italic">
                      "{dpr.remarks}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6 text-xs text-slate-500">
                  <div className="text-center">
                    <span className="block font-bold text-slate-800 dark:text-slate-200">{dpr.entries?.length || 0}</span>
                    <span className="text-[10px] uppercase text-slate-400">Entries</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-rose-600">{dpr.delays?.length || 0}</span>
                    <span className="text-[10px] uppercase text-slate-400">Delays</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-blue-600">{dpr.photos?.length || 0}</span>
                    <span className="text-[10px] uppercase text-slate-400">Photos</span>
                  </div>

                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-xs ml-2">
                    <span>View Detail</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DPR DETAIL DRAWER / MODAL */}
      {isDetailOpen && selectedDpr && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedDpr.dprNumber}</h2>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    selectedDpr.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedDpr.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Date: {selectedDpr.date} • Shift: {selectedDpr.shift} • Location: {selectedDpr.location}</p>
              </div>

              <div className="flex items-center gap-2">
                {selectedDpr.status === 'DRAFT' && (
                  <button
                    onClick={() => handleWorkflowAction('SUBMIT')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit DPR</span>
                  </button>
                )}

                {selectedDpr.status === 'SUBMITTED' && (
                  <>
                    <button
                      onClick={() => handleWorkflowAction('APPROVE')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleWorkflowAction('RETURN')}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <span>Return</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Detail Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Header Info Card */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Department</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDpr.departmentName || 'Civil'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Prepared By</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDpr.preparedByName || 'Engineer'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Checked By</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDpr.checkedByName || 'Manager'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Approved By</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDpr.approvedByName || 'Pending'}</span>
                </div>
              </div>

              {/* Site Conditions Checklist */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <span>Site Conditions Checklist</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {Object.entries(selectedDpr.siteConditions || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <CheckSquare className={`w-4 h-4 ${value ? 'text-emerald-500' : 'text-slate-300'}`} />
                      <span className="capitalize text-slate-700 dark:text-slate-300">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Progress Entries */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Daily Progress Entries ({selectedDpr.entries?.length || 0})</span>
                  </h3>
                  <button
                    onClick={() => setIsEntryModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Entry</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100 dark:bg-slate-900 font-bold uppercase text-[10px] text-slate-500">
                      <tr>
                        <th className="p-3">Department / Engineer</th>
                        <th className="p-3">Supervisor</th>
                        <th className="p-3 text-right">Planned</th>
                        <th className="p-3 text-right">Today</th>
                        <th className="p-3 text-right">Cumulative</th>
                        <th className="p-3 text-right">Remaining</th>
                        <th className="p-3 text-center">Progress</th>
                        <th className="p-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {selectedDpr.entries?.map((e: any) => (
                        <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                            {e.department} <br/>
                            <span className="text-[10px] font-normal text-slate-500">{e.responsibleEngineerName}</span>
                          </td>
                          <td className="p-3">{e.supervisorName || '-'}</td>
                          <td className="p-3 text-right font-mono">{e.plannedQty} {e.unit}</td>
                          <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">+{e.todayQty} {e.unit}</td>
                          <td className="p-3 text-right font-mono">{e.cumulativeQty} {e.unit}</td>
                          <td className="p-3 text-right font-mono text-slate-500">{e.remainingQty} {e.unit}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                              {e.progressPercentage}%
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 italic max-w-xs truncate">{e.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delays & Hindrances Log */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Delays & Hindrances ({selectedDpr.delays?.length || 0})</span>
                  </h3>
                  <button
                    onClick={() => setIsDelayModalOpen(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Delay</span>
                  </button>
                </div>

                {selectedDpr.delays?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-center">No delays recorded for this shift.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDpr.delays?.map((d: any) => (
                      <div key={d.id} className="p-3 bg-rose-50/50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-rose-700 dark:text-rose-300">[{d.category}] {d.reason}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-200 text-rose-800 font-bold">{d.impact} IMPACT</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mt-1">Responsible: {d.responsibleParty || 'Site'} • Delay: {d.estimatedDelayHours} hrs • Action: {d.correctiveAction || 'None'}</p>
                        </div>
                        <span className="px-2 py-1 font-bold text-[10px] rounded bg-white dark:bg-slate-800 border text-slate-700">{d.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Photos & Videos Attachment Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-purple-600" />
                    <span>Site Photos & Media ({selectedDpr.photos?.length || 0})</span>
                  </h3>
                  <button
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedDpr.photos?.map((p: any) => (
                    <div key={p.id} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={p.fileUrl} alt={p.caption} className="w-full h-32 object-cover" />
                      <div className="p-2 bg-slate-900/80 text-white text-[11px] space-y-0.5">
                        <span className="font-bold block truncate">{p.caption || 'Site Photo'}</span>
                        <span className="text-[10px] text-slate-300 block">GPS: {p.gpsLat || '9.93'}, {p.gpsLng || '76.26'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threaded Comments & Approvals */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Discussion & Remarks</span>
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add an engineer comment or observation..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                  <button
                    onClick={handleAddComment}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold"
                  >
                    Post
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedDpr.comments?.map((c: any) => (
                    <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{c.authorName} ({c.role})</span>
                        <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{c.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE DPR MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create Daily Progress Report</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  value={newDpr.date}
                  onChange={(e) => setNewDpr({ ...newDpr, date: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Shift</label>
                <select
                  value={newDpr.shift}
                  onChange={(e) => setNewDpr({ ...newDpr, shift: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="DAY">Day Shift</option>
                  <option value="NIGHT">Night Shift</option>
                  <option value="SHIFT_1">Shift 1</option>
                  <option value="SHIFT_2">Shift 2</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Department</label>
                <input
                  type="text"
                  value={newDpr.departmentName}
                  onChange={(e) => setNewDpr({ ...newDpr, departmentName: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Location / Zone</label>
                <input
                  type="text"
                  value={newDpr.location}
                  onChange={(e) => setNewDpr({ ...newDpr, location: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Prepared By</label>
                <input
                  type="text"
                  value={newDpr.preparedByName}
                  onChange={(e) => setNewDpr({ ...newDpr, preparedByName: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Shift Remarks</label>
                <textarea
                  value={newDpr.remarks}
                  onChange={(e) => setNewDpr({ ...newDpr, remarks: e.target.value })}
                  placeholder="General summary of shift operations..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDpr}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Create DPR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ENTRY MODAL */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add Work Progress Entry</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Department</label>
                <input
                  type="text"
                  value={newEntry.department}
                  onChange={(e) => setNewEntry({ ...newEntry, department: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Planned Quantity</label>
                  <input
                    type="number"
                    value={newEntry.plannedQty}
                    onChange={(e) => setNewEntry({ ...newEntry, plannedQty: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Today's Executed Qty</label>
                  <input
                    type="number"
                    value={newEntry.todayQty}
                    onChange={(e) => setNewEntry({ ...newEntry, todayQty: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newEntry.unit}
                    onChange={(e) => setNewEntry({ ...newEntry, unit: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Working Hours</label>
                  <input
                    type="number"
                    value={newEntry.workingHours}
                    onChange={(e) => setNewEntry({ ...newEntry, workingHours: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Responsible Engineer</label>
                <input
                  type="text"
                  value={newEntry.responsibleEngineerName}
                  onChange={(e) => setNewEntry({ ...newEntry, responsibleEngineerName: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Remarks</label>
                <input
                  type="text"
                  value={newEntry.remarks}
                  onChange={(e) => setNewEntry({ ...newEntry, remarks: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsEntryModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button onClick={handleAddEntry} className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg">Save Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DELAY MODAL */}
      {isDelayModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Log Site Delay / Hindrance</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Category</label>
                <select
                  value={newDelay.category}
                  onChange={(e) => setNewDelay({ ...newDelay, category: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                >
                  <option value="MATERIAL">Material Shortage / Delay</option>
                  <option value="EQUIPMENT">Equipment Breakdown</option>
                  <option value="WEATHER">Heavy Rain / Weather</option>
                  <option value="MANPOWER">Labor Shortage</option>
                  <option value="DRAWING">Drawing / Specs Delay</option>
                  <option value="PERMIT">Permit / Clearance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Reason / Description</label>
                <textarea
                  value={newDelay.reason}
                  onChange={(e) => setNewDelay({ ...newDelay, reason: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Responsible Party</label>
                  <input
                    type="text"
                    value={newDelay.responsibleParty}
                    onChange={(e) => setNewDelay({ ...newDelay, responsibleParty: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Estimated Delay (Hours)</label>
                  <input
                    type="number"
                    value={newDelay.estimatedDelayHours}
                    onChange={(e) => setNewDelay({ ...newDelay, estimatedDelayHours: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Corrective Action Taken</label>
                <input
                  type="text"
                  value={newDelay.correctiveAction}
                  onChange={(e) => setNewDelay({ ...newDelay, correctiveAction: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsDelayModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button onClick={handleAddDelay} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg">Log Delay</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PHOTO MODAL */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Attach Site Photo</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Photo Category</label>
                <select
                  value={newPhoto.category}
                  onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                >
                  <option value="BEFORE">Before Work</option>
                  <option value="DURING">Work in Progress (During)</option>
                  <option value="AFTER">After Work Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Photo URL</label>
                <input
                  type="text"
                  value={newPhoto.fileUrl}
                  onChange={(e) => setNewPhoto({ ...newPhoto, fileUrl: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Caption / Notes</label>
                <input
                  type="text"
                  value={newPhoto.caption}
                  onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsPhotoModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button onClick={handleAddPhoto} className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white rounded-lg">Upload Photo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
