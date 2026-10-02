import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  DollarSign, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  UserCheck,
  Award,
  Upload,
  Download,
  Trash2,
  RotateCcw,
  FileSpreadsheet,
  Edit,
  LayoutGrid,
  List,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  UserX,
  CreditCard,
  Printer
} from 'lucide-react';
import { Employee, EmploymentType, EmployeeStatus, HierarchyRoleLevel } from '../../types/hr';

interface EmployeeMasterProps {
  employees: Employee[];
  onAddEmployee: (employeeData: Partial<Employee>) => void;
  onUpdateEmployee: (id: string, updatedData: Partial<Employee>) => void;
  onDeleteEmployee?: (id: string) => void;
  onRestoreEmployee?: (id: string) => void;
}

const DEPARTMENTS = [
  'Executive',
  'Project Management',
  'Mechanical Engineering',
  'Field Operations',
  'Civil & Structural',
  'HSE & Safety',
  'Store & Logistics',
  'Accounts & HR',
  'QA/QC & Testing',
  'Procurement & Supply Chain'
];

const BRANCHES = [
  'Kochi HQ',
  'Calicut Regional Office',
  'Trivandrum Project Center',
  'Kannur Site Office',
  'Dubai International Branch'
];

const EMPLOYMENT_TYPES: { label: string; value: EmploymentType }[] = [
  { label: 'Full Time Permanent', value: 'FULL_TIME' },
  { label: 'Part Time', value: 'PART_TIME' },
  { label: 'Direct Contract', value: 'CONTRACT' },
  { label: 'Subcontractor Assigned', value: 'SUBCONTRACT' },
  { label: 'Daily Wage Personnel', value: 'DAILY_WAGE' }
];

export const EmployeeMaster: React.FC<EmployeeMasterProps> = ({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onRestoreEmployee,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'org' | 'project' | 'salary' | 'docs'>('profile');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [deactivateModalEmp, setDeactivateModalEmp] = useState<Employee | null>(null);
  const [restoreModalEmp, setRestoreModalEmp] = useState<Employee | null>(null);

  // Form State for Add / Edit
  const [formTab, setFormTab] = useState<'personal' | 'org' | 'project' | 'salary' | 'docs'>('personal');
  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    email: '',
    mobile: '',
    dateOfBirth: '1992-05-15',
    joiningDate: new Date().toISOString().split('T')[0],
    address: 'SiteSync Infrastructure Hub, Kochi',
    emergencyName: 'Emergency Contact',
    emergencyRelationship: 'Family',
    emergencyPhone: '+91 98765 43210',
    
    company: 'SiteSync Infrastructure Group',
    branch: 'Kochi HQ',
    department: 'Mechanical Engineering',
    designation: 'Senior Project Engineer',
    role: 'ENGINEER',
    hierarchyLevel: 3,
    approvalLevel: 2,
    reportingManagerId: '',
    reportingManager: '',
    employmentType: 'FULL_TIME' as EmploymentType,
    status: 'ACTIVE' as EmployeeStatus,
    
    projectId: '',
    projectName: '',
    siteAssignment: 'Pier 3 & Water Treatment Sub-Plant',

    basicUSD: 2500,
    hraUSD: 1000,
    daUSD: 300,
    specialAllowanceUSD: 400,
    foodAllowanceUSD: 150,
    travelAllowanceUSD: 200,
    overtimeHourlyRateUSD: 20,
    pfDeductionUSD: 300,
    esiDeductionUSD: 75,
    professionalTaxUSD: 50,

    docTitle: 'National ID & Trade License',
    docType: 'ID_PROOF' as const,
    docNumber: 'SSP-ID-2026-001',
    docExpiry: '2028-12-31',
  });

  // Calculate Metrics
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === 'ACTIVE').length;
    const onLeave = employees.filter((e) => e.status === 'ON_LEAVE').length;
    const terminated = employees.filter((e) => e.status === 'TERMINATED' || e.status === 'SUSPENDED').length;
    const deptsCount = new Set(employees.map((e) => e.department).filter(Boolean)).size;
    return { total, active, onLeave, terminated, deptsCount };
  }, [employees]);

  // Filtered List
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        emp.fullName?.toLowerCase().includes(q) ||
        emp.employeeCode?.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.mobile?.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
      const matchesStatus = selectedStatus === 'ALL' || emp.status === selectedStatus;
      const matchesType = selectedType === 'ALL' || emp.employmentType === selectedType;
      const matchesBranch = selectedBranch === 'ALL' || emp.branch === selectedBranch;

      return matchesSearch && matchesDept && matchesStatus && matchesType && matchesBranch;
    });
  }, [employees, searchQuery, selectedDept, selectedStatus, selectedType, selectedBranch]);

  // Open Create Form
  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormTab('personal');
    setFormData({
      employeeCode: `EMP-SSP-${String(employees.length + 1).padStart(3, '0')}`,
      fullName: '',
      gender: 'MALE',
      email: '',
      mobile: '',
      dateOfBirth: '1992-05-15',
      joiningDate: new Date().toISOString().split('T')[0],
      address: 'Kochi HQ Campus, Kerala, India',
      emergencyName: 'Emergency Contact',
      emergencyRelationship: 'Spouse',
      emergencyPhone: '+91 90000 00000',
      company: 'SiteSync Infrastructure Group',
      branch: 'Kochi HQ',
      department: 'Mechanical Engineering',
      designation: 'Site Specialist',
      role: 'ENGINEER',
      hierarchyLevel: 3,
      approvalLevel: 2,
      reportingManagerId: '',
      reportingManager: employees[0]?.fullName || '',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      projectId: '',
      projectName: '',
      siteAssignment: 'Kochi Central Hub',
      basicUSD: 2500,
      hraUSD: 1000,
      daUSD: 300,
      specialAllowanceUSD: 400,
      foodAllowanceUSD: 150,
      travelAllowanceUSD: 200,
      overtimeHourlyRateUSD: 20,
      pfDeductionUSD: 300,
      esiDeductionUSD: 75,
      professionalTaxUSD: 50,
      docTitle: 'National Identity Proof',
      docType: 'ID_PROOF',
      docNumber: `ID-${Date.now().toString().slice(-6)}`,
      docExpiry: '2029-12-31',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormTab('personal');
    const s = emp.salaryStructure || {
      basicUSD: 2500,
      hraUSD: 1000,
      daUSD: 300,
      specialAllowanceUSD: 400,
      foodAllowanceUSD: 150,
      travelAllowanceUSD: 200,
      overtimeHourlyRateUSD: 20,
      pfDeductionUSD: 300,
      esiDeductionUSD: 75,
      professionalTaxUSD: 50,
    };
    const firstDoc = emp.documents?.[0];

    setFormData({
      employeeCode: emp.employeeCode || '',
      fullName: emp.fullName || '',
      gender: emp.gender || 'MALE',
      email: emp.email || '',
      mobile: emp.mobile || '',
      dateOfBirth: emp.dateOfBirth || '1992-01-01',
      joiningDate: emp.joiningDate || new Date().toISOString().split('T')[0],
      address: emp.address || '',
      emergencyName: emp.emergencyContact?.name || '',
      emergencyRelationship: emp.emergencyContact?.relationship || '',
      emergencyPhone: emp.emergencyContact?.phone || '',
      company: emp.company || 'SiteSync Infrastructure Group',
      branch: emp.branch || 'Kochi HQ',
      department: emp.department || 'Mechanical Engineering',
      designation: emp.designation || 'Staff',
      role: emp.role || 'WORKER',
      hierarchyLevel: emp.hierarchyLevel || 2,
      approvalLevel: emp.approvalLevel || 1,
      reportingManagerId: emp.reportingManagerId || '',
      reportingManager: emp.reportingManager || '',
      employmentType: emp.employmentType || 'FULL_TIME',
      status: emp.status || 'ACTIVE',
      projectId: emp.projectId || '',
      projectName: emp.projectName || '',
      siteAssignment: emp.siteAssignment || '',
      basicUSD: s.basicUSD || 2000,
      hraUSD: s.hraUSD || 800,
      daUSD: s.daUSD || 300,
      specialAllowanceUSD: s.specialAllowanceUSD || 300,
      foodAllowanceUSD: s.foodAllowanceUSD || 100,
      travelAllowanceUSD: s.travelAllowanceUSD || 100,
      overtimeHourlyRateUSD: s.overtimeHourlyRateUSD || 20,
      pfDeductionUSD: s.pfDeductionUSD || 240,
      esiDeductionUSD: s.esiDeductionUSD || 60,
      professionalTaxUSD: s.professionalTaxUSD || 40,
      docTitle: firstDoc?.title || 'National ID & Trade License',
      docType: (firstDoc?.documentType as any) || 'ID_PROOF',
      docNumber: firstDoc?.documentNumber || 'SSP-DOC-01',
      docExpiry: firstDoc?.expiryDate || '2028-12-31',
    });
    setIsAddModalOpen(true);
  };

  // Submit Handler
  const handleSaveEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert('Please enter employee full name');
      return;
    }

    const payload: Partial<Employee> = {
      employeeCode: formData.employeeCode,
      fullName: formData.fullName,
      gender: formData.gender,
      email: formData.email,
      mobile: formData.mobile,
      dateOfBirth: formData.dateOfBirth,
      joiningDate: formData.joiningDate,
      address: formData.address,
      emergencyContact: {
        name: formData.emergencyName,
        relationship: formData.emergencyRelationship,
        phone: formData.emergencyPhone,
      },
      company: formData.company,
      branch: formData.branch,
      department: formData.department,
      designation: formData.designation,
      role: formData.role,
      hierarchyLevel: Number(formData.hierarchyLevel) || 2,
      approvalLevel: Number(formData.approvalLevel) || 1,
      reportingManager: formData.reportingManager,
      reportingManagerId: formData.reportingManagerId,
      employmentType: formData.employmentType,
      status: formData.status,
      projectId: formData.projectId || undefined,
      projectName: formData.projectName || undefined,
      siteAssignment: formData.siteAssignment || undefined,
      salaryStructure: {
        basicUSD: Number(formData.basicUSD) || 0,
        hraUSD: Number(formData.hraUSD) || 0,
        daUSD: Number(formData.daUSD) || 0,
        specialAllowanceUSD: Number(formData.specialAllowanceUSD) || 0,
        foodAllowanceUSD: Number(formData.foodAllowanceUSD) || 0,
        travelAllowanceUSD: Number(formData.travelAllowanceUSD) || 0,
        overtimeHourlyRateUSD: Number(formData.overtimeHourlyRateUSD) || 0,
        pfDeductionUSD: Number(formData.pfDeductionUSD) || 0,
        esiDeductionUSD: Number(formData.esiDeductionUSD) || 0,
        professionalTaxUSD: Number(formData.professionalTaxUSD) || 0,
      },
      documents: [
        {
          id: `doc_${Date.now()}`,
          title: formData.docTitle || 'Identification Proof',
          documentType: formData.docType || 'ID_PROOF',
          documentNumber: formData.docNumber || 'DOC-001',
          expiryDate: formData.docExpiry,
          status: 'VALID',
        },
      ],
    };

    if (editingEmployee) {
      onUpdateEmployee(editingEmployee.id, payload);
      if (viewingEmployee?.id === editingEmployee.id) {
        setViewingEmployee((prev) => (prev ? { ...prev, ...payload } as Employee : null));
      }
    } else {
      onAddEmployee(payload);
    }

    setIsAddModalOpen(false);
  };

  // Bulk Import
  const handleBulkImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCsvText.trim()) return;
    setImportStatus(null);
    try {
      const lines = bulkCsvText.split('\n').filter((l) => l.trim().length > 0);
      let count = 0;
      lines.forEach((line, index) => {
        if (index === 0 && line.toLowerCase().includes('name')) return;
        const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2) {
          const fullName = parts[0];
          const email = parts[1] || `emp_${Date.now()}_${index}@sitesyncpro.com`;
          const mobile = parts[2] || '+91 90000 00000';
          const designation = parts[3] || 'Site Specialist';
          const department = parts[4] || 'Mechanical Engineering';
          const branch = parts[5] || 'Kochi HQ';
          const employmentType = (parts[6] as EmploymentType) || 'FULL_TIME';

          onAddEmployee({
            fullName,
            email,
            mobile,
            designation,
            department,
            branch,
            employmentType,
          });
          count++;
        }
      });
      setImportStatus({
        type: 'success',
        text: `Successfully imported ${count} employee records into the authoritative master repository!`,
      });
      setBulkCsvText('');
    } catch {
      setImportStatus({
        type: 'error',
        text: 'Failed to parse CSV format. Please verify column delimiters.',
      });
    }
  };

  const handleExportCSV = () => {
    const header = 'EmployeeCode,FullName,Email,Mobile,Designation,Department,Branch,EmploymentType,Status,JoiningDate,GrossSalaryUSD\n';
    const rows = filteredEmployees
      .map((e) => {
        const s = e.salaryStructure;
        const gross = s ? s.basicUSD + s.hraUSD + s.daUSD + s.specialAllowanceUSD + s.foodAllowanceUSD + s.travelAllowanceUSD : 0;
        return `"${e.employeeCode}","${e.fullName}","${e.email}","${e.mobile}","${e.designation}","${e.department}","${e.branch}","${e.employmentType}","${e.status}","${e.joiningDate}","${gross}"`;
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `employee_master_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Workforce</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-100">{stats.total}</div>
            <div className="text-[11px] text-slate-400">All registered employees</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Personnel</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
            <div className="text-[11px] text-slate-400">{((stats.active / (stats.total || 1)) * 100).toFixed(0)}% deployment rate</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">On Leave / Away</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-400">{stats.onLeave}</div>
            <div className="text-[11px] text-slate-400">Approved time off</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Inactive / Deactivated</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-rose-400">{stats.terminated}</div>
            <div className="text-[11px] text-slate-400">Preserved in audit records</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Departments</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-purple-400">{stats.deptsCount}</div>
            <div className="text-[11px] text-slate-400">Operational divisions</div>
          </div>
        </div>
      </div>

      {/* Action Bar & Multi-Facet Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, name, designation, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Dense Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bulk CSV</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3.5 py-2 text-xs font-medium shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Employee</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Lifecycle Statuses</option>
            <option value="ACTIVE">Active Personnel</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="TERMINATED">Terminated / Inactive</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Employment Types</option>
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Work Locations / Branches</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => {
            const isTerminated = emp.status === 'TERMINATED' || emp.status === 'SUSPENDED';
            const s = emp.salaryStructure;
            const grossUSD = s ? s.basicUSD + s.hraUSD + s.daUSD + s.specialAllowanceUSD + s.foodAllowanceUSD + s.travelAllowanceUSD : 0;

            return (
              <div
                key={emp.id}
                className={`bg-slate-900 border ${
                  isTerminated ? 'border-rose-950/60 bg-rose-950/10' : 'border-slate-800'
                } rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm`}
              >
                <div>
                  {/* Top Bar: Code + Status Badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <span className="font-mono text-xs font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded">
                      {emp.employeeCode}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                        emp.status === 'ACTIVE'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : emp.status === 'ON_LEAVE'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                          : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-start gap-3 mt-3">
                    <img
                      src={emp.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                      alt={emp.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-100 truncate">{emp.fullName}</h4>
                      <p className="text-xs font-medium text-slate-300 truncate mt-0.5">{emp.designation}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <Building2 className="w-3 h-3 shrink-0 text-slate-400" />
                        <span className="truncate">{emp.department}</span>
                      </div>
                    </div>
                  </div>

                  {/* Details Block */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-400 bg-slate-950/50 rounded-lg p-2.5 border border-slate-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Branch:</span>
                      <span className="text-slate-300 font-medium">{emp.branch || 'Kochi HQ'}</span>
                    </div>

                    {emp.projectName ? (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Project:</span>
                        <span className="text-amber-300 font-medium truncate max-w-[170px]" title={emp.projectName}>
                          {emp.projectName}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Project:</span>
                        <span className="text-slate-400 italic">Unassigned (HQ Pool)</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Reporting To:</span>
                      <span className="text-slate-300 font-medium truncate max-w-[170px]">{emp.reportingManager || 'Executive Management'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/40">
                      <span className="text-slate-400">Gross Monthly:</span>
                      <span className="text-emerald-400 font-semibold">${grossUSD.toLocaleString()} USD</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 gap-2">
                  <button
                    onClick={() => {
                      setViewingEmployee(emp);
                      setActiveProfileTab('profile');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg py-1.5 text-xs font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(emp)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    title="Edit Employee Master Record"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {isTerminated ? (
                    <button
                      onClick={() => setRestoreModalEmp(emp)}
                      className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/60 rounded-lg transition-colors"
                      title="Restore / Reactivate Employee"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeactivateModalEmp(emp)}
                      className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 rounded-lg transition-colors"
                      title="Deactivate / Terminate Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-3 py-3">Code</th>
                  <th className="px-3 py-3">Department & Designation</th>
                  <th className="px-3 py-3">Branch & Site</th>
                  <th className="px-3 py-3">Reporting Manager</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredEmployees.map((emp) => {
                  const isTerminated = emp.status === 'TERMINATED' || emp.status === 'SUSPENDED';
                  return (
                    <tr key={emp.id} className={`hover:bg-slate-800/50 transition-colors ${isTerminated ? 'bg-rose-950/10' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                            alt={emp.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <div className="font-semibold text-slate-100">{emp.fullName}</div>
                            <div className="text-[11px] text-slate-400">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono font-medium text-blue-400">{emp.employeeCode}</td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-200">{emp.designation}</div>
                        <div className="text-[11px] text-slate-400">{emp.department}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div>{emp.branch}</div>
                        {emp.projectName && <div className="text-[11px] text-amber-400 truncate max-w-[140px]">{emp.projectName}</div>}
                      </td>
                      <td className="px-3 py-3 text-slate-300">{emp.reportingManager || '—'}</td>
                      <td className="px-3 py-3 text-[11px]">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                          {emp.employmentType || 'FULL_TIME'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                            emp.status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : emp.status === 'ON_LEAVE'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-rose-950 text-rose-300 border-rose-800'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setViewingEmployee(emp);
                              setActiveProfileTab('profile');
                            }}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded transition-colors"
                            title="View Full Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(emp)}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                            title="Edit Record"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {isTerminated ? (
                            <button
                              onClick={() => setRestoreModalEmp(emp)}
                              className="p-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 rounded transition-colors"
                              title="Restore Employee"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setDeactivateModalEmp(emp)}
                              className="p-1 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded transition-colors"
                              title="Deactivate Employee"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No matching employee records found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or relaxing the department and status filters above.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDept('ALL');
              setSelectedStatus('ALL');
              setSelectedType('ALL');
              setSelectedBranch('ALL');
            }}
            className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FULL VIEW PROFILE MODAL */}
      {/* ------------------------------------------------------------- */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={viewingEmployee.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                  alt={viewingEmployee.fullName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/40 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-100">{viewingEmployee.fullName}</h3>
                    <span className="font-mono text-xs text-blue-400 bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded">
                      {viewingEmployee.employeeCode}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        viewingEmployee.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : viewingEmployee.status === 'ON_LEAVE'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}
                    >
                      {viewingEmployee.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {viewingEmployee.designation} • {viewingEmployee.department} • {viewingEmployee.branch}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingEmployee(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 text-xs font-medium">
              <button
                onClick={() => setActiveProfileTab('profile')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeProfileTab === 'profile'
                    ? 'border-blue-500 text-blue-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Identity & Contact
              </button>
              <button
                onClick={() => setActiveProfileTab('org')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeProfileTab === 'org'
                    ? 'border-blue-500 text-blue-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Permanent Organization
              </button>
              <button
                onClick={() => setActiveProfileTab('project')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeProfileTab === 'project'
                    ? 'border-blue-500 text-blue-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Project Deployment
              </button>
              <button
                onClick={() => setActiveProfileTab('salary')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeProfileTab === 'salary'
                    ? 'border-blue-500 text-blue-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Salary & Deductions
              </button>
              <button
                onClick={() => setActiveProfileTab('docs')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeProfileTab === 'docs'
                    ? 'border-blue-500 text-blue-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Compliance & Documents
              </button>
            </div>

            {/* Profile Tab Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs text-slate-300">
              {activeProfileTab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Full Legal Name</span>
                      <span className="font-semibold text-slate-200">{viewingEmployee.fullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Gender</span>
                      <span className="font-medium text-slate-200">{viewingEmployee.gender || 'MALE'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Date of Birth</span>
                      <span className="font-medium text-slate-200">{viewingEmployee.dateOfBirth || '1992-05-15'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Date of Joining</span>
                      <span className="font-medium text-slate-200">{viewingEmployee.joiningDate || '2022-01-10'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Mobile Phone</span>
                      <span className="font-mono text-slate-200">{viewingEmployee.mobile || '+91 90000 00000'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Official Email</span>
                      <span className="font-mono text-slate-200">{viewingEmployee.email}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[11px] mb-1">Residential Address</span>
                    <p className="text-slate-200 font-medium">{viewingEmployee.address || 'SiteSync Regional Hub, Kochi, Kerala, India'}</p>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[11px] mb-2 font-semibold text-rose-400">
                      Emergency Contact Person
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Contact Name</span>
                        <span className="font-medium text-slate-200">{viewingEmployee.emergencyContact?.name || 'Primary Kin'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Relationship</span>
                        <span className="font-medium text-slate-200">{viewingEmployee.emergencyContact?.relationship || 'Spouse'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Emergency Phone</span>
                        <span className="font-mono text-slate-200">{viewingEmployee.emergencyContact?.phone || '+91 98765 43210'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeProfileTab === 'org' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Company / Entity</span>
                      <span className="font-medium text-slate-200">{viewingEmployee.company || 'SiteSync Infrastructure Group'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Operating Branch</span>
                      <span className="font-medium text-slate-200">{viewingEmployee.branch}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Department</span>
                      <span className="font-medium text-slate-200">{viewingEmployee.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Designation</span>
                      <span className="font-medium text-slate-200">{viewingEmployee.designation}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Hierarchy Grade Level</span>
                      <span className="font-medium text-slate-200">Level {viewingEmployee.hierarchyLevel || 2}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Approval Authority Level</span>
                      <span className="font-medium text-slate-200">Auth Level {viewingEmployee.approvalLevel || 1}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Direct Reporting Manager</span>
                      <span className="text-sm font-semibold text-blue-400">
                        {viewingEmployee.reportingManager || 'Executive Management Board'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[11px]">Direct Subordinates</span>
                      <span className="text-sm font-semibold text-slate-200">{viewingEmployee.directReportsCount || 0} Staff</span>
                    </div>
                  </div>
                </div>
              )}

              {activeProfileTab === 'project' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                      <Briefcase className="w-4 h-4" />
                      <span>Current Active Project Deployment</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      SiteSync Pro enforces strict separation between permanent organizational employment identity and dynamic project/worksite allocation.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[11px]">Assigned Project</span>
                        <span className="font-semibold text-slate-200 text-sm">
                          {viewingEmployee.projectName || 'General HQ Overhead Pool'}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[11px]">Site / Work Location</span>
                        <span className="font-semibold text-slate-200 text-sm">
                          {viewingEmployee.siteAssignment || 'Central Yard & HQ'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeProfileTab === 'salary' && (
                <div className="space-y-4">
                  {(() => {
                    const s = viewingEmployee.salaryStructure || {
                      basicUSD: 2500,
                      hraUSD: 1000,
                      daUSD: 300,
                      specialAllowanceUSD: 400,
                      foodAllowanceUSD: 150,
                      travelAllowanceUSD: 200,
                      overtimeHourlyRateUSD: 20,
                      pfDeductionUSD: 300,
                      esiDeductionUSD: 75,
                      professionalTaxUSD: 50,
                    };
                    const gross = s.basicUSD + s.hraUSD + s.daUSD + s.specialAllowanceUSD + s.foodAllowanceUSD + s.travelAllowanceUSD;
                    const deductions = s.pfDeductionUSD + s.esiDeductionUSD + s.professionalTaxUSD;
                    const netUSD = gross - deductions;

                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-slate-500 text-[11px] block">Gross Monthly (USD)</span>
                            <span className="text-lg font-bold text-slate-100">${gross.toLocaleString()}</span>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-slate-500 text-[11px] block">Statutory Deductions</span>
                            <span className="text-lg font-bold text-rose-400">${deductions.toLocaleString()}</span>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-slate-500 text-[11px] block">Net Take Home (USD)</span>
                            <span className="text-lg font-bold text-emerald-400">${netUSD.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                          <h5 className="font-semibold text-slate-200 mb-2">Earnings Breakdown</h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <div className="flex justify-between py-1 border-b border-slate-800/40">
                              <span className="text-slate-400">Basic Pay:</span>
                              <span className="font-medium text-slate-200">${s.basicUSD}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/40">
                              <span className="text-slate-400">HRA Allowance:</span>
                              <span className="font-medium text-slate-200">${s.hraUSD}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/40">
                              <span className="text-slate-400">DA (Dearness):</span>
                              <span className="font-medium text-slate-200">${s.daUSD}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/40">
                              <span className="text-slate-400">Special Allowance:</span>
                              <span className="font-medium text-slate-200">${s.specialAllowanceUSD}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/40">
                              <span className="text-slate-400">Food / Mess:</span>
                              <span className="font-medium text-slate-200">${s.foodAllowanceUSD}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/40">
                              <span className="text-slate-400">Travel / Fuel:</span>
                              <span className="font-medium text-slate-200">${s.travelAllowanceUSD}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                          <h5 className="font-semibold text-slate-200 mb-2 text-rose-400">Deductions & Rates</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div className="flex justify-between py-1 border-b border-slate-800/40">
                              <span className="text-slate-400">PF Fund:</span>
                              <span className="font-medium text-slate-200">${s.pfDeductionUSD}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/40">
                              <span className="text-slate-400">ESI Health:</span>
                              <span className="font-medium text-slate-200">${s.esiDeductionUSD}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/40">
                              <span className="text-slate-400">Prof. Tax:</span>
                              <span className="font-medium text-slate-200">${s.professionalTaxUSD}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/40">
                              <span className="text-slate-400">OT Hourly Rate:</span>
                              <span className="font-medium text-emerald-400">${s.overtimeHourlyRateUSD}/hr</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeProfileTab === 'docs' && (
                <div className="space-y-3">
                  {viewingEmployee.documents && viewingEmployee.documents.length > 0 ? (
                    viewingEmployee.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-blue-400" />
                          <div>
                            <div className="font-semibold text-slate-200">{doc.title}</div>
                            <div className="text-[11px] text-slate-400">
                              Type: {doc.documentType} • No: {doc.documentNumber} • Expiry: {doc.expiryDate || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                          {doc.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No compliance documents uploaded yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenEditModal(viewingEmployee);
                    setViewingEmployee(null);
                  }}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                {viewingEmployee.status === 'TERMINATED' ? (
                  <button
                    onClick={() => {
                      setRestoreModalEmp(viewingEmployee);
                      setViewingEmployee(null);
                    }}
                    className="flex items-center gap-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Employee</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setDeactivateModalEmp(viewingEmployee);
                      setViewingEmployee(null);
                    }}
                    className="flex items-center gap-1.5 bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-900 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Deactivate</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CREATE & EDIT EMPLOYEE MASTER MODAL */}
      {/* ------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  {editingEmployee ? `Edit Employee Profile — [${editingEmployee.employeeCode}]` : 'Register New Enterprise Employee'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete identity, permanent organization hierarchy, salary package, and compliance credentials
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Step Tabs */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setFormTab('personal')}
                className={`py-2.5 px-3 border-b-2 transition-colors ${
                  formTab === 'personal' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent text-slate-400'
                }`}
              >
                1. Personal
              </button>
              <button
                type="button"
                onClick={() => setFormTab('org')}
                className={`py-2.5 px-3 border-b-2 transition-colors ${
                  formTab === 'org' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent text-slate-400'
                }`}
              >
                2. Organization
              </button>
              <button
                type="button"
                onClick={() => setFormTab('project')}
                className={`py-2.5 px-3 border-b-2 transition-colors ${
                  formTab === 'project' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent text-slate-400'
                }`}
              >
                3. Deployment
              </button>
              <button
                type="button"
                onClick={() => setFormTab('salary')}
                className={`py-2.5 px-3 border-b-2 transition-colors ${
                  formTab === 'salary' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent text-slate-400'
                }`}
              >
                4. Compensation
              </button>
              <button
                type="button"
                onClick={() => setFormTab('docs')}
                className={`py-2.5 px-3 border-b-2 transition-colors ${
                  formTab === 'docs' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent text-slate-400'
                }`}
              >
                5. Documents
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEmployeeSubmit}>
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
                {formTab === 'personal' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Employee Code *</label>
                        <input
                          type="text"
                          value={formData.employeeCode}
                          onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Full Legal Name *</label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Arun Kumar"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Gender</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Joining Date</label>
                        <input
                          type="date"
                          value={formData.joiningDate}
                          onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Email Address *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="arun@sitesyncpro.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Mobile Phone *</label>
                        <input
                          type="tel"
                          value={formData.mobile}
                          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Residential Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="House / Street, City, State, Country"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <span className="text-slate-400 font-medium block">Emergency Contact</span>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Contact Name"
                          value={formData.emergencyName}
                          onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                        <input
                          type="text"
                          placeholder="Relationship (e.g. Spouse)"
                          value={formData.emergencyRelationship}
                          onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                        <input
                          type="tel"
                          placeholder="Emergency Phone"
                          value={formData.emergencyPhone}
                          onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formTab === 'org' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Company / Entity</label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Branch / Location *</label>
                        <select
                          value={formData.branch}
                          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                        >
                          {BRANCHES.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Department *</label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Designation *</label>
                        <input
                          type="text"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          placeholder="e.g. Lead Mechanical Engineer"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Employment Type</label>
                        <select
                          value={formData.employmentType}
                          onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                        >
                          {EMPLOYMENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Reporting Manager</label>
                        <select
                          value={formData.reportingManager}
                          onChange={(e) => {
                            const mgr = employees.find((x) => x.fullName === e.target.value);
                            setFormData({
                              ...formData,
                              reportingManager: e.target.value,
                              reportingManagerId: mgr ? mgr.id : '',
                            });
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                        >
                          <option value="">Executive Management (Top Level)</option>
                          {employees
                            .filter((emp) => !editingEmployee || emp.id !== editingEmployee.id)
                            .map((emp) => (
                              <option key={emp.id} value={emp.fullName}>
                                {emp.fullName} ({emp.designation} - {emp.employeeCode})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Hierarchy Level (1-9)</label>
                        <input
                          type="number"
                          min={1}
                          max={9}
                          value={formData.hierarchyLevel}
                          onChange={(e) => setFormData({ ...formData, hierarchyLevel: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Approval Authority Level (1-5)</label>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={formData.approvalLevel}
                          onChange={(e) => setFormData({ ...formData, approvalLevel: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formTab === 'project' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                      <span className="text-amber-400 font-semibold block text-sm">Site & Project Assignment</span>
                      <p className="text-slate-400 text-xs">
                        Assign this personnel to a specific active engineering project or leave empty for general headquarters allocation.
                      </p>

                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-slate-400 mb-1">Project Name / Reference</label>
                          <input
                            type="text"
                            value={formData.projectName}
                            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                            placeholder="e.g. Peruvannamuzhi Water Treatment Plant (Phase 2)"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Site / Work Location Details</label>
                          <input
                            type="text"
                            value={formData.siteAssignment}
                            onChange={(e) => setFormData({ ...formData, siteAssignment: e.target.value })}
                            placeholder="e.g. Yard 3 / Main Pumping Intake"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {formTab === 'salary' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Basic Monthly (USD) *</label>
                        <input
                          type="number"
                          value={formData.basicUSD}
                          onChange={(e) => setFormData({ ...formData, basicUSD: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">HRA Allowance</label>
                        <input
                          type="number"
                          value={formData.hraUSD}
                          onChange={(e) => setFormData({ ...formData, hraUSD: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">DA Allowance</label>
                        <input
                          type="number"
                          value={formData.daUSD}
                          onChange={(e) => setFormData({ ...formData, daUSD: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Special Allowance</label>
                        <input
                          type="number"
                          value={formData.specialAllowanceUSD}
                          onChange={(e) => setFormData({ ...formData, specialAllowanceUSD: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Food / Mess</label>
                        <input
                          type="number"
                          value={formData.foodAllowanceUSD}
                          onChange={(e) => setFormData({ ...formData, foodAllowanceUSD: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Travel / Site Fuel</label>
                        <input
                          type="number"
                          value={formData.travelAllowanceUSD}
                          onChange={(e) => setFormData({ ...formData, travelAllowanceUSD: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      <div>
                        <label className="block text-slate-400 mb-1">PF Deduction</label>
                        <input
                          type="number"
                          value={formData.pfDeductionUSD}
                          onChange={(e) => setFormData({ ...formData, pfDeductionUSD: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">ESI Deduction</label>
                        <input
                          type="number"
                          value={formData.esiDeductionUSD}
                          onChange={(e) => setFormData({ ...formData, esiDeductionUSD: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Prof. Tax</label>
                        <input
                          type="number"
                          value={formData.professionalTaxUSD}
                          onChange={(e) => setFormData({ ...formData, professionalTaxUSD: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">OT Rate ($/hr)</label>
                        <input
                          type="number"
                          value={formData.overtimeHourlyRateUSD}
                          onChange={(e) => setFormData({ ...formData, overtimeHourlyRateUSD: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formTab === 'docs' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                      <span className="text-slate-300 font-medium block">Primary Compliance Document</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">Document Title</label>
                          <input
                            type="text"
                            value={formData.docTitle}
                            onChange={(e) => setFormData({ ...formData, docTitle: e.target.value })}
                            placeholder="National ID / Safety Badge"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Document Type</label>
                          <select
                            value={formData.docType}
                            onChange={(e) => setFormData({ ...formData, docType: e.target.value as any })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                          >
                            <option value="ID_PROOF">National ID Proof</option>
                            <option value="PASSPORT">International Passport</option>
                            <option value="SAFETY_PASS">Site Safety Passport</option>
                            <option value="CONTRACT">Employment Contract</option>
                            <option value="CERTIFICATION">Professional Trade License</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">Document / Certificate Number</label>
                          <input
                            type="text"
                            value={formData.docNumber}
                            onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                            placeholder="DOC-2026-009"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Expiration Date</label>
                          <input
                            type="date"
                            value={formData.docExpiry}
                            onChange={(e) => setFormData({ ...formData, docExpiry: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {formTab !== 'personal' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: Array<typeof formTab> = ['personal', 'org', 'project', 'salary', 'docs'];
                        const idx = tabs.indexOf(formTab);
                        if (idx > 0) setFormTab(tabs[idx - 1]);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                    >
                      Back
                    </button>
                  )}
                  {formTab !== 'docs' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: Array<typeof formTab> = ['personal', 'org', 'project', 'salary', 'docs'];
                        const idx = tabs.indexOf(formTab);
                        if (idx < tabs.length - 1) setFormTab(tabs[idx + 1]);
                      }}
                      className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-medium"
                    >
                      Next Step
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium shadow-md transition-colors"
                  >
                    {editingEmployee ? 'Save Changes' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BULK IMPORT CSV MODAL */}
      {/* ------------------------------------------------------------- */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">Bulk Employee CSV Import</h3>
              </div>
              <button
                onClick={() => {
                  setIsBulkImportOpen(false);
                  setImportStatus(null);
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkImportSubmit}>
              <div className="p-6 space-y-4 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-400 space-y-1 font-mono text-[11px]">
                  <div className="text-slate-300 font-sans font-semibold">Expected Format:</div>
                  <div>FullName, Email, Mobile, Designation, Department, Branch, EmploymentType</div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Paste CSV Data:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkCsvText(
                        `FullName,Email,Mobile,Designation,Department,Branch,EmploymentType\nRajesh Varma,rajesh.varma@sitesyncpro.com,+91 98450 11223,Senior QA Engineer,QA/QC & Testing,Kochi HQ,FULL_TIME\nMeera Pillai,meera.pillai@sitesyncpro.com,+91 98450 44556,HSE Officer,HSE & Safety,Calicut Regional Office,FULL_TIME\nVikram Joshi,vikram.joshi@sitesyncpro.com,+91 98450 77889,Piping Foreman,Field Operations,Kochi HQ,CONTRACT`
                      );
                    }}
                    className="text-blue-400 hover:underline text-[11px]"
                  >
                    Insert Sample Data Template
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={bulkCsvText}
                  onChange={(e) => setBulkCsvText(e.target.value)}
                  placeholder="Paste CSV rows here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                  required
                />

                {importStatus && (
                  <div
                    className={`p-3 rounded-lg flex items-center gap-2 ${
                      importStatus.type === 'success'
                        ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/80 border border-rose-800 text-rose-300'
                    }`}
                  >
                    {importStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{importStatus.text}</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-950 border-t border-slate-800 p-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkImportOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
                >
                  Import Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DEACTIVATE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {deactivateModalEmp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">Deactivate Employee Profile</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to deactivate <span className="font-semibold text-slate-100">[{deactivateModalEmp.employeeCode}] {deactivateModalEmp.fullName}</span>?
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              <span className="text-slate-300 font-semibold block mb-1">Non-Destructive Archival:</span>
              In accordance with enterprise ERP compliance, historical attendance records, payroll slips, duty logs, and audit trails remain permanently preserved. You can restore this employee at any time.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeactivateModalEmp(null)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteEmployee) {
                    onDeleteEmployee(deactivateModalEmp.id);
                  } else {
                    onUpdateEmployee(deactivateModalEmp.id, { status: 'TERMINATED' });
                  }
                  setDeactivateModalEmp(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium"
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RESTORE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {restoreModalEmp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <RotateCcw className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">Restore Employee Profile</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Reactivate <span className="font-semibold text-slate-100">[{restoreModalEmp.employeeCode}] {restoreModalEmp.fullName}</span> back into the active enterprise workforce roster?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRestoreModalEmp(null)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onRestoreEmployee) {
                    onRestoreEmployee(restoreModalEmp.id);
                  } else {
                    onUpdateEmployee(restoreModalEmp.id, { status: 'ACTIVE' });
                  }
                  setRestoreModalEmp(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
              >
                Reactivate Personnel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
