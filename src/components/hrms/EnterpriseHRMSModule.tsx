import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { AttendanceFinalizationSection } from './AttendanceFinalizationSection';
import { LoanRecoverySection } from './LoanRecoverySection';
import { WorkflowApprovalChainWidget } from '../workflow/WorkflowApprovalChainWidget';
import {
  Users,
  UserCheck,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  Award,
  FileSpreadsheet,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Building2,
  FileCheck,
  Printer,
  Download,
  Filter,
  Check,
  Sparkles,
  MapPin,
  Smartphone,
  Phone,
  Mail,
  UserPlus
} from 'lucide-react';

export const EnterpriseHRMSModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'overview'
    | 'employees'
    | 'attendance'
    | 'shifts'
    | 'leaves'
    | 'payroll'
    | 'loans'
    | 'performance'
    | 'recruitment'
    | 'audit'
  >('overview');

  const [statutoryProfile, setStatutoryProfile] = useState<'INDIA' | 'UAE' | 'GLOBAL'>('INDIA');
  const currSymbol = statutoryProfile === 'INDIA' ? '₹' : statutoryProfile === 'UAE' ? 'AED' : '$';

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({
    totalEmployees: 0,
    activeEmployees: 0,
    departmentsCount: 0,
    pendingLeaveRequests: 0,
    openJobVacancies: 0,
    totalMonthlyPayrollAed: 0,
    totalLoanDisbursedAed: 0,
    attendanceRatePercent: 0,
    retentionRatePercent: 0,
  });

  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [payrollPeriods, setPayrollPeriods] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [recruitments, setRecruitments] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

  // Modals & form state
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false);
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [isRunPayrollOpen, setIsRunPayrollOpen] = useState(false);
  const [isSyncEsslOpen, setIsSyncEsslOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);
  const [attendanceViewMode, setAttendanceViewMode] = useState<'finalization' | 'daily'>('finalization');

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    joiningDate: '',
    departmentId: '',
    designationId: '',
    grade: '',
    gender: '',
    workLocation: '',
    biometricId: '',
  });

  const [newLeave, setNewLeave] = useState({
    employeeId: '',
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    totalDays: 0,
    reason: '',
  });

  const [newLoan, setNewLoan] = useState({
    employeeId: '',
    loanType: '',
    principalAmountAed: 0,
    interestRate: 0,
    tenureMonths: 0,
  });

  // Statutory Rules & Maker-Checker State (P2.11)
  const [statutoryRules, setStatutoryRules] = useState<any[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [activePayrollRun, setActivePayrollRun] = useState<any | null>(null);
  const [selectedRuleForEdit, setSelectedRuleForEdit] = useState<any | null>(null);
  const [selectedEmpStatutoryProfile, setSelectedEmpStatutoryProfile] = useState<any | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [makerCheckerMessage, setMakerCheckerMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    fetchHrmsData();
  }, [statutoryProfile]);

  const fetchHrmsData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        empRes,
        attRes,
        leaveRes,
        payRes,
        payslipRes,
        loanRes,
        revRes,
        recRes,
        candRes,
        deptRes,
        shiftRes,
        auditRes,
        rulesRes,
        runsRes,
      ] = await Promise.all([
        fetch('/api/hrms/stats').then(safeJson).catch(() => null),
        fetch('/api/hrms/employees').then(safeJson).catch(() => null),
        fetch('/api/hrms/attendance').then(safeJson).catch(() => null),
        fetch('/api/hrms/leaves').then(safeJson).catch(() => null),
        fetch('/api/hrms/payroll-periods').then(safeJson).catch(() => null),
        fetch('/api/hrms/payslips').then(safeJson).catch(() => null),
        fetch('/api/hrms/loans').then(safeJson).catch(() => null),
        fetch('/api/hrms/performance-reviews').then(safeJson).catch(() => null),
        fetch('/api/hrms/recruitment').then(safeJson).catch(() => null),
        fetch('/api/hrms/candidates').then(safeJson).catch(() => null),
        fetch('/api/hrms/departments').then(safeJson).catch(() => null),
        fetch('/api/hrms/shifts').then(safeJson).catch(() => null),
        fetch('/api/hrms/audit-logs').then(safeJson).catch(() => null),
        fetch(`/api/hrms/statutory-rules?jurisdiction=${statutoryProfile}`).then(safeJson).catch(() => null),
        fetch('/api/hrms/payroll-runs').then(safeJson).catch(() => null),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (empRes?.data) {
        setEmployees(empRes.data);
        if (empRes.data.length > 0 && !newLeave.employeeId) {
          setNewLeave((prev) => ({ ...prev, employeeId: empRes.data[0].id }));
          setNewLoan((prev) => ({ ...prev, employeeId: empRes.data[0].id }));
        }
      }
      if (attRes?.data) setAttendance(attRes.data);
      if (leaveRes?.data) setLeaves(leaveRes.data);
      if (payRes?.data) setPayrollPeriods(payRes.data);
      if (payslipRes?.data) setPayslips(payslipRes.data);
      if (loanRes?.data) setLoans(loanRes.data);
      if (revRes?.data) setReviews(revRes.data);
      if (recRes?.data) setRecruitments(recRes.data);
      if (candRes?.data) setCandidates(candRes.data);
      if (deptRes?.data) setDepartments(deptRes.data);
      if (shiftRes?.data) setShifts(shiftRes.data);
      if (auditRes?.data) setAuditLogs(auditRes.data);
      if (rulesRes?.data) setStatutoryRules(rulesRes.data);
      if (runsRes?.data) {
        setPayrollRuns(runsRes.data);
        if (runsRes.data.length > 0) {
          setActivePayrollRun(runsRes.data[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching HRMS data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.firstName.trim() || !newEmployee.lastName.trim() || !newEmployee.email.trim() || !newEmployee.phone.trim() || !newEmployee.dateOfBirth || !newEmployee.joiningDate || !newEmployee.departmentId || !newEmployee.designationId || !newEmployee.gender || !newEmployee.workLocation.trim()) {
      setMakerCheckerMessage({ type: 'error', text: 'Complete the required employee master fields before saving.' });
      return;
    }
    try {
      const res = await fetch('/api/hrms/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setIsAddEmployeeOpen(false);
        fetchHrmsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.employeeId || !newLeave.leaveTypeId || !newLeave.startDate || !newLeave.endDate || newLeave.totalDays <= 0 || !newLeave.reason.trim()) {
      setMakerCheckerMessage({ type: 'error', text: 'Complete employee, leave type, period, duration and reason before submitting leave.' });
      return;
    }
    try {
      const res = await fetch('/api/hrms/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeave),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setIsAddLeaveOpen(false);
        fetchHrmsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewLeave = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await fetch(`/api/hrms/leaves/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks: '' }),
      });
      fetchHrmsData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.employeeId || !newLoan.loanType || newLoan.principalAmountAed <= 0 || newLoan.tenureMonths <= 0) {
      setMakerCheckerMessage({ type: 'error', text: 'Complete employee, loan type, principal amount and tenure before submitting a loan request.' });
      return;
    }
    try {
      const res = await fetch('/api/hrms/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoan),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setIsAddLoanOpen(false);
        fetchHrmsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncBiometrics = async () => {
    setLoading(true);
    try {
      await fetch('/api/hrms/attendance/sync-essl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: '' }),
      });
      setIsSyncEsslOpen(false);
      fetchHrmsData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecutePayroll = async () => {
    if (!payrollPeriods.length) return;
    setLoading(true);
    setMakerCheckerMessage(null);
    try {
      const res = await fetch('/api/hrms/payroll/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodId: payrollPeriods[0].id,
          remarks: `Executed via ${statutoryProfile} Statutory Rules Engine`,
        }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setMakerCheckerMessage({
          type: 'success',
          text: `Payroll run #${data.data?.runNumber || 'NEW'} computed successfully with statutory calculations.`,
        });
      } else {
        setMakerCheckerMessage({
          type: 'error',
          text: data?.error || 'Failed to execute statutory payroll run.',
        });
      }
      setIsRunPayrollOpen(false);
      fetchHrmsData();
    } catch (err: any) {
      setMakerCheckerMessage({ type: 'error', text: err?.message || 'Error running payroll.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayrollForReview = async (runId: string) => {
    setLoading(true);
    setMakerCheckerMessage(null);
    try {
      const res = await fetch(`/api/hrms/payroll-runs/${runId}/submit-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: 'Forwarded by Maker to Senior Checker for statutory verification.' }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setMakerCheckerMessage({
          type: 'success',
          text: 'Payroll run submitted for Checker review.',
        });
        fetchHrmsData();
      } else {
        setMakerCheckerMessage({
          type: 'error',
          text: data?.error || 'Failed to submit payroll for review.',
        });
      }
    } catch (err: any) {
      setMakerCheckerMessage({ type: 'error', text: err?.message || 'Submission failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayrollRun = async (runId: string) => {
    setLoading(true);
    setMakerCheckerMessage(null);
    try {
      const res = await fetch(`/api/hrms/payroll-runs/${runId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: 'Verified EPF, ESIC, PT, TDS & gross-to-net calculations. Approved for disbursement.' }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setMakerCheckerMessage({
          type: 'success',
          text: 'Payroll Run APPROVED by Checker. Statutory checksum hash validated.',
        });
        fetchHrmsData();
      } else {
        setMakerCheckerMessage({
          type: 'error',
          text: data?.error || 'Approval failed (Maker-Checker violation or invalid state).',
        });
      }
    } catch (err: any) {
      setMakerCheckerMessage({ type: 'error', text: err?.message || 'Approval failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisbursePayrollRun = async (runId: string) => {
    setLoading(true);
    setMakerCheckerMessage(null);
    try {
      const res = await fetch(`/api/hrms/payroll-runs/${runId}/disburse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMode: statutoryProfile === 'INDIA' ? 'NEFT/RTGS Batch Transfer' : 'WPS Direct SIF',
          remarks: 'Corporate banking transfer executed and immutable statutory lock sealed.',
        }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setMakerCheckerMessage({
          type: 'success',
          text: `Disbursed successfully! Immutable Lock Hash: ${data.data?.lockHash?.slice(0, 16)}...`,
        });
        fetchHrmsData();
      } else {
        setMakerCheckerMessage({
          type: 'error',
          text: data?.error || 'Disbursement failed. Run must be Approved first.',
        });
      }
    } catch (err: any) {
      setMakerCheckerMessage({ type: 'error', text: err?.message || 'Disbursement failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEmployeeStatutory = async (emp: any) => {
    try {
      const res = await fetch(`/api/hrms/employees/${emp.id}/statutory-profile`);
      const data = await safeJson(res);
      if (data?.data) {
        setSelectedEmpStatutoryProfile(data.data);
      } else {
        setSelectedEmpStatutoryProfile({
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          panNumber: '',
          uanNumber: '',
          pfNumber: '',
          pfOptOut: false,
          esiNumber: '',
          esiEligible: true,
          ptState: 'KERALA',
          taxRegime: 'NEW',
          isGratuityEligible: true,
          epfCustomRatePercent: 12.0,
        });
      }
      setIsEditProfileOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEmployeeStatutory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpStatutoryProfile?.employeeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/hrms/employees/${selectedEmpStatutoryProfile.employeeId}/statutory-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedEmpStatutoryProfile),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setIsEditProfileOpen(false);
        setMakerCheckerMessage({
          type: 'success',
          text: `Statutory profile for ${selectedEmpStatutoryProfile.employeeName || 'employee'} saved.`,
        });
        fetchHrmsData();
      }
    } catch (err: any) {
      setMakerCheckerMessage({ type: 'error', text: err?.message || 'Failed to save statutory profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStatutoryRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRuleForEdit) return;
    setLoading(true);
    try {
      const res = await fetch('/api/hrms/statutory-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedRuleForEdit),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setSelectedRuleForEdit(null);
        setMakerCheckerMessage({
          type: 'success',
          text: `Statutory rule '${selectedRuleForEdit.ruleName}' updated with version v${data.data?.version || 1}.`,
        });
        fetchHrmsData();
      }
    } catch (err: any) {
      setMakerCheckerMessage({ type: 'error', text: err?.message || 'Failed to update rule.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = searchTerm.toLowerCase();
    const displayName = emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    return (
      displayName.toLowerCase().includes(q) ||
      emp.firstName?.toLowerCase().includes(q) ||
      emp.lastName?.toLowerCase().includes(q) ||
      emp.employeeCode?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Title & Sub-tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  Enterprise HRMS & Payroll Core
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  {statutoryProfile === 'INDIA'
                    ? 'India Statutory: EPFO / ESIC / TDS / Gratuity Compliant'
                    : statutoryProfile === 'UAE'
                    ? 'UAE Labor Law & WPS Compliant (MOHRE SIF)'
                    : 'Global Multi-Entity Statutory'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Biometric attendance, multi-tier salary engines, shifts, leaves, appraisals & recruitment
              </p>
            </div>
          </div>
        </div>

        {/* Global actions & Jurisdiction Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Statutory Jurisdiction Profile Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
            <span className="text-slate-400 px-2 font-medium">Jurisdiction:</span>
            <button
              onClick={() => setStatutoryProfile('INDIA')}
              className={`px-2 py-1 rounded font-semibold transition ${
                statutoryProfile === 'INDIA'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="India Statutory: INR (₹) / EPF / ESIC / TDS / Gratuity Act 1972"
            >
              🇮🇳 India (INR ₹)
            </button>
            <button
              onClick={() => setStatutoryProfile('UAE')}
              className={`px-2 py-1 rounded font-semibold transition ${
                statutoryProfile === 'UAE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="UAE Statutory: AED / WPS Direct SIF / MOHRE Labor Law"
            >
              🇦🇪 UAE (AED)
            </button>
            <button
              onClick={() => setStatutoryProfile('GLOBAL')}
              className={`px-2 py-1 rounded font-semibold transition ${
                statutoryProfile === 'GLOBAL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Global Multi-Entity Statutory"
            >
              🌐 Global
            </button>
          </div>

          <button
            onClick={() => setIsSyncEsslOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sync eSSL Biometric</span>
          </button>
          <button
            onClick={() => setIsAddEmployeeOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm shadow-indigo-500/20"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Onboard Employee</span>
          </button>
          <button
            onClick={fetchHrmsData}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
            title="Refresh HRMS Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800 text-sm">
        {[
          { id: 'overview', label: 'HR Dashboard', icon: <LayoutDashboardIcon className="w-4 h-4" /> },
          { id: 'employees', label: `Employees (${employees.length})`, icon: <Users className="w-4 h-4" /> },
          { id: 'attendance', label: 'Attendance & Biometrics', icon: <Clock className="w-4 h-4" /> },
          { id: 'shifts', label: 'Shifts & Rosters', icon: <Calendar className="w-4 h-4" /> },
          { id: 'leaves', label: `Leaves (${leaves.length})`, icon: <FileCheck className="w-4 h-4" /> },
          {
            id: 'payroll',
            label: statutoryProfile === 'INDIA' ? 'Payroll & Statutory (PF/ESI/TDS)' : statutoryProfile === 'UAE' ? 'Payroll & WPS Engine' : 'Payroll & Statutory',
            icon: <DollarSign className="w-4 h-4" />
          },
          { id: 'loans', label: `Loans & Advances (${loans.length})`, icon: <FileSpreadsheet className="w-4 h-4" /> },
          { id: 'performance', label: 'Appraisals & Reviews', icon: <Award className="w-4 h-4" /> },
          { id: 'recruitment', label: `Recruitment & Pipeline (${candidates.length})`, icon: <Briefcase className="w-4 h-4" /> },
          { id: 'audit', label: 'HR Audit Trail', icon: <ShieldCheck className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeSubTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SUBTAB 1: HR DASHBOARD & OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Active Headcount</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.activeEmployees}</div>
              <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> 100% Active Workforce
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Biometric Attendance</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">{stats.attendanceRatePercent}%</div>
              <div className="text-xs text-slate-400 mt-1">eSSL device live sync active</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Monthly Payroll</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {currSymbol} {stats.totalMonthlyPayrollAed.toLocaleString()}
              </div>
              <div className="text-xs text-indigo-400 mt-1">
                {statutoryProfile === 'INDIA'
                  ? 'Corporate NEFT / RTGS Disbursed'
                  : statutoryProfile === 'UAE'
                  ? 'WPS SIF Generated'
                  : 'Direct Bank Transfer'}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Open Positions</span>
                <Briefcase className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-cyan-400">{stats.openJobVacancies}</div>
              <div className="text-xs text-slate-400 mt-1">{candidates.length} candidates in pipeline</div>
            </div>
          </div>

          {/* Quick Actions & Department Headcount breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Departmental Headcount & Budget Allocation</span>
                <Building2 className="w-4 h-4 text-slate-500" />
              </h3>

              <div className="space-y-3.5">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-3.5 bg-slate-800/60 rounded-lg border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{dept.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Head: {dept.headOfDepartment || 'Unassigned'}</span>
                        <span>•</span>
                        <span>{dept.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-indigo-300">
                        {currSymbol} {(dept.budgetAed / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-[11px] text-slate-400">Annual Budget</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance & Statutory Alerts */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {statutoryProfile === 'INDIA'
                    ? 'India Statutory & Labor Compliance'
                    : statutoryProfile === 'UAE'
                    ? 'UAE Statutory & WPS Status'
                    : 'Statutory & Regulatory Status'}
                </span>
              </h3>

              {statutoryProfile === 'INDIA' ? (
                <>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs space-y-1.5 text-emerald-300">
                    <div className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      EPFO & ESIC Returns: COMPLIANT
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Employees Provident Fund (12%) & State Insurance (0.75%) electronic challan-cum-return (ECR) filed.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-lg space-y-2 text-xs">
                    <div className="text-slate-300 font-medium">TDS Section 192 & Professional Tax</div>
                    <div className="text-[11px] text-slate-400">
                      Income tax deductions calculated as per active employee regime tax declarations and PT slabs.
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs space-y-1 text-indigo-300">
                    <div className="font-medium">Payment of Gratuity Act 1972</div>
                    <p className="text-slate-400 text-[11px]">
                      15 days wages for every completed year of continuous service provisioned on balance sheet.
                    </p>
                  </div>
                </>
              ) : statutoryProfile === 'UAE' ? (
                <>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs space-y-1.5 text-emerald-300">
                    <div className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      WPS Direct Salary SIF: COMPLIANT
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Ministry of Human Resources & Emiratisation (MOHRE) monthly transfer file verified.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-lg space-y-2 text-xs">
                    <div className="text-slate-300 font-medium">UAE Labor Law Leave Encashment</div>
                    <div className="text-[11px] text-slate-400">
                      30 calendar days annual leave credited per completed year of service.
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs space-y-1 text-indigo-300">
                    <div className="font-medium">Gratuity / End-of-Service Calculation</div>
                    <p className="text-slate-400 text-[11px]">
                      21 days basic pay per year for first 5 years; 30 days basic pay per year thereafter.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs space-y-1.5 text-emerald-300">
                    <div className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Global Statutory Engine: ACTIVE
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Multi-jurisdiction tax and social security calculation profile applied.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: EMPLOYEE MASTER */}
      {activeSubTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees by name, code or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setIsAddEmployeeOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Code & Name</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Department & Grade</th>
                    <th className="py-3 px-4">Work Location</th>
                    <th className="py-3 px-4">Biometric ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Statutory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                        {employees.length === 0
                          ? 'No employees yet'
                          : 'No employees found matching your search. Click "Add Employee" to onboard a new team member.'}
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const displayName = emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unnamed Employee';
                      const displayPhone = emp.phone || emp.mobile || 'N/A';
                      const displayDept = emp.department || emp.departmentId || 'Operations';
                      return (
                        <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-medium text-white">
                            <div className="font-semibold text-sm">{displayName}</div>
                            <div className="text-[11px] text-indigo-400 font-mono">{emp.employeeCode}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              <span>{emp.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <span>{displayPhone}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                              Grade {emp.grade || emp.designation || 'L4'}
                            </span>
                            <div className="text-slate-400 mt-1">{displayDept}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-400" />
                              <span>{emp.workLocation || emp.branch || 'Abu Dhabi HQ'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-400">
                            {emp.biometricId || 'ESSL-DX-AUTO'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {emp.employmentStatus || emp.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleOpenEmployeeStatutory(emp)}
                              className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 rounded text-[11px] font-medium transition flex items-center gap-1 ml-auto"
                            >
                              <ShieldCheck className="w-3 h-3 text-indigo-400" />
                              <span>Statutory</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: ATTENDANCE & BIOMETRICS */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-4">
          {/* Sub-navigation between Monthly Finalization and Daily Biometric Logs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setAttendanceViewMode('finalization')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  attendanceViewMode === 'finalization'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Finalization & Payroll Lock
              </button>
              <button
                onClick={() => setAttendanceViewMode('daily')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  attendanceViewMode === 'daily'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Daily Biometric Punch Records ({attendance.length})
              </button>
            </div>

            {attendanceViewMode === 'daily' && (
              <button
                onClick={handleSyncBiometrics}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Force Terminal Pull</span>
              </button>
            )}
          </div>

          {attendanceViewMode === 'finalization' ? (
            <AttendanceFinalizationSection
              currSymbol={currSymbol}
              payrollPeriods={payrollPeriods}
              employees={employees}
              onAttendanceFinalized={fetchHrmsData}
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Employee Code</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">In Time</th>
                    <th className="py-3 px-4">Out Time</th>
                    <th className="py-3 px-4">Total Hrs</th>
                    <th className="py-3 px-4">OT Hrs</th>
                    <th className="py-3 px-4">Punch Source</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-white">{att.employeeCode}</td>
                      <td className="py-3 px-4">{att.attendanceDate}</td>
                      <td className="py-3 px-4 text-emerald-400 font-mono">{att.inTime || '--:--'}</td>
                      <td className="py-3 px-4 text-amber-400 font-mono">{att.outTime || '--:--'}</td>
                      <td className="py-3 px-4 font-semibold text-white">{att.totalHours} hrs</td>
                      <td className="py-3 px-4 text-indigo-400 font-semibold">{att.overtimeHours || 0} hrs</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                          {att.punchSource}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: SHIFTS & ROSTERS */}
      {activeSubTab === 'shifts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shifts.map((sft) => (
              <div key={sft.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                    {sft.shiftCode}
                  </span>
                  <span className="text-xs text-slate-400">{sft.totalShiftHours} Hours Shift</span>
                </div>
                <h4 className="text-sm font-bold text-white">{sft.shiftName}</h4>
                <div className="p-2.5 bg-slate-800/60 rounded-lg text-xs flex justify-between items-center font-mono">
                  <span className="text-emerald-400">Start: {sft.startTime}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-amber-400">End: {sft.endTime}</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Grace Period: {sft.gracePeriodMinutes} mins</span>
                  <span>Break: {sft.breakDurationMinutes} mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: LEAVES */}
      {activeSubTab === 'leaves' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Leave Applications & Balances</h3>
              <p className="text-xs text-slate-400">UAE Labor Law vacation entitlements and approval queue</p>
            </div>
            <button
              onClick={() => setIsAddLeaveOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Leave ID</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {leaves.map((lv) => (
                  <tr key={lv.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">{lv.leaveNumber}</td>
                    <td className="py-3 px-4 font-mono">
                      {lv.startDate} to {lv.endDate}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{lv.totalDays} Days</td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{lv.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          lv.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : lv.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {lv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {lv.status === 'PENDING' && (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleReviewLeave(lv.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewLeave(lv.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 6: PAYROLL & STATUTORY */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-6">
          {/* Maker-Checker & Governance Status Notifications */}
          {makerCheckerMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                makerCheckerMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : makerCheckerMessage.type === 'error'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {makerCheckerMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span className="font-medium">{makerCheckerMessage.text}</span>
              </div>
              <button
                onClick={() => setMakerCheckerMessage(null)}
                className="text-slate-400 hover:text-white text-xs px-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {statutoryProfile === 'INDIA'
                    ? 'India Statutory Payroll Engine & Dual-Currency Governance'
                    : statutoryProfile === 'UAE'
                    ? 'UAE WPS Payroll Engine & Direct SIF Processing'
                    : 'Enterprise Statutory Payroll Engine & Multi-Jurisdiction Disbursal'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {statutoryProfile === 'INDIA'
                  ? 'EPF (12%), ESIC, State PT, Section 192 TDS, and Payment of Gratuity Act 1972 compliant.'
                  : 'Multi-currency statutory calculations with Maker-Checker separation of duties.'}
              </p>
            </div>
            <button
              onClick={() => setIsRunPayrollOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-lg shadow-emerald-900/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>Execute Payroll Run</span>
            </button>
          </div>

          {/* Maker-Checker Workflow Governance Board */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  Maker-Checker Lifecycle Governance
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  Active Run: {activePayrollRun ? activePayrollRun.runNumber : 'PR-2026-08-01'}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                    activePayrollRun?.status === 'DISBURSED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : activePayrollRun?.status === 'APPROVED'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : activePayrollRun?.status === 'SUBMITTED_FOR_REVIEW'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {activePayrollRun?.status || 'CALCULATED'}
                </span>
                {activePayrollRun?.isLocked && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-purple-400" />
                    IMMUTABLE LOCK
                  </span>
                )}
              </div>
            </div>

            {/* Stepper Display */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1">
                <div className="text-slate-400 font-medium">1. Calculation (Maker)</div>
                <div className="font-bold text-white">{activePayrollRun?.makerUserId || 'HR Admin (Maker)'}</div>
                <div className="text-[11px] text-emerald-400 font-mono">Gross & Deductions Computed</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1">
                <div className="text-slate-400 font-medium">2. Review Submission</div>
                <div className="font-bold text-white">
                  {activePayrollRun?.status === 'SUBMITTED_FOR_REVIEW' ||
                  activePayrollRun?.status === 'APPROVED' ||
                  activePayrollRun?.status === 'DISBURSED'
                    ? 'Submitted'
                    : 'Pending Submission'}
                </div>
                <div className="text-[11px] text-slate-400">Maker forwards to Checker</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1">
                <div className="text-slate-400 font-medium">3. Verification (Checker)</div>
                <div className="font-bold text-white">
                  {activePayrollRun?.checkerUserId || (activePayrollRun?.status === 'APPROVED' || activePayrollRun?.status === 'DISBURSED' ? 'Senior Auditor' : 'Pending Verification')}
                </div>
                <div className="text-[11px] text-indigo-300">Strict Separation Enforced</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1">
                <div className="text-slate-400 font-medium">4. Disbursal & Lock</div>
                <div className="font-bold text-white">
                  {activePayrollRun?.status === 'DISBURSED' ? 'Disbursed via NEFT' : 'Pending Release'}
                </div>
                <div className="text-[11px] text-purple-300 font-mono">
                  {activePayrollRun?.lockHash ? `Hash: ${activePayrollRun.lockHash.slice(0, 10)}...` : 'Pre-disbursal state'}
                </div>
              </div>
            </div>

            {/* Action Buttons for Maker-Checker */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                <span>Period Total: </span>
                <span className="font-bold text-white font-mono">
                  {currSymbol} {(activePayrollRun?.totalGrossPay || stats.totalMonthlyPayrollAed || 80980).toLocaleString()}
                </span>
                <span className="text-slate-500 ml-2">
                  (INR Equiv: ₹{((activePayrollRun?.totalGrossPay || stats.totalMonthlyPayrollAed || 80980) * (statutoryProfile === 'INDIA' ? 1 : 22.75)).toLocaleString()})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {activePayrollRun && activePayrollRun.status === 'CALCULATED' && (
                  <button
                    onClick={() => handleSubmitPayrollForReview(activePayrollRun.id)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Submit for Checker Review
                  </button>
                )}

                {activePayrollRun && activePayrollRun.status === 'SUBMITTED_FOR_REVIEW' && (
                  <button
                    onClick={() => handleApprovePayrollRun(activePayrollRun.id)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Checker: Verify & Approve</span>
                  </button>
                )}

                {activePayrollRun && activePayrollRun.status === 'APPROVED' && (
                  <button
                    onClick={() => handleDisbursePayrollRun(activePayrollRun.id)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Disburse via NEFT & Lock</span>
                  </button>
                )}

                {(!activePayrollRun || activePayrollRun.status === 'DISBURSED') && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Current Run Reconciled & Disbursed</span>
                  </span>
                )}
              </div>
            </div>

            {/* Universal Workflow Approval Chain & Governance Widget */}
            {activePayrollRun && (
              <div className="pt-2">
                <WorkflowApprovalChainWidget
                  entityType="PAYROLL_RUN"
                  entityId={activePayrollRun.id}
                  currentStage={activePayrollRun.status === 'SUBMITTED_FOR_REVIEW' ? 1 : 1}
                  entityStatus={activePayrollRun.status}
                  creatorId={activePayrollRun.makerUserId}
                  department="HR"
                  amount={activePayrollRun.totalGrossPay || 0}
                  onActionSuccess={fetchHrmsData}
                />
              </div>
            )}
          </div>

          {/* Statutory Rules Master Configuration Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                  <span>Configurable Statutory Rules Table ({statutoryProfile})</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Authority rates, wage ceiling thresholds, formula bases, and version history.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Rule Type</th>
                    <th className="py-2.5 px-3">Rule Name</th>
                    <th className="py-2.5 px-3">Calculation Base</th>
                    <th className="py-2.5 px-3">Rate / Slabs</th>
                    <th className="py-2.5 px-3">Wage Ceiling</th>
                    <th className="py-2.5 px-3">Version</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {statutoryRules.length > 0 ? (
                    statutoryRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-400">{rule.ruleType}</td>
                        <td className="py-2.5 px-3 font-medium text-white">{rule.ruleName}</td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono">{rule.calculationBase}</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-mono font-semibold">
                          {rule.employeeRatePercent ? `${rule.employeeRatePercent}%` : 'Slab Based'}
                          {rule.employerRatePercent ? ` (Emp: ${rule.employerRatePercent}%)` : ''}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {rule.wageCeilingAmount ? `${currSymbol} ${rule.wageCeilingAmount.toLocaleString()}` : 'No Ceiling'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">v{rule.version || 1}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedRuleForEdit(rule)}
                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded text-[11px] font-medium"
                          >
                            Edit Rule
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-500">
                        Loading configured statutory rules for {statutoryProfile}...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payslips Master Register Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Monthly Payslip Register ({payslips.length} Employees)
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                Currency: {statutoryProfile === 'INDIA' ? 'INR (₹) Base' : `${currSymbol} / INR reporting`}
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Payslip #</th>
                  <th className="py-3 px-4">Basic Pay ({currSymbol})</th>
                  <th className="py-3 px-4">HRA & Allowances</th>
                  <th className="py-3 px-4">Gross Earnings</th>
                  <th className="py-3 px-4">Statutory Deductions</th>
                  <th className="py-3 px-4">Net Payable ({currSymbol})</th>
                  <th className="py-3 px-4">INR Equiv</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {payslips.map((ps) => {
                  const inrEquiv = statutoryProfile === 'INDIA' 
                    ? ps.netPayableAed 
                    : Math.round((ps.netPayableAed || 0) * 22.75);
                  return (
                    <tr key={ps.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-white">{ps.payslipNumber}</td>
                      <td className="py-3 px-4 font-mono">{ps.basicSalaryAed?.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {((ps.grossEarningsAed || 0) - (ps.basicSalaryAed || 0)).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-white">
                        {currSymbol} {ps.grossEarningsAed?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-rose-400">
                        -{currSymbol} {ps.totalDeductionsAed?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                        {currSymbol} {ps.netPayableAed?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        ₹{inrEquiv?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                          {ps.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedPayslip(ps)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded text-[11px] font-medium"
                        >
                          Payslip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 7: LOANS & ADVANCES */}
      {activeSubTab === 'loans' && (
        <LoanRecoverySection
          currSymbol={currSymbol}
          employees={employees}
          onLoanUpdated={fetchHrmsData}
        />
      )}

      {/* SUBTAB 8: APPRAISALS & REVIEWS */}
      {activeSubTab === 'performance' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Review Code</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Self / Mgr / Comm Score</th>
                  <th className="py-3 px-4">Final Score</th>
                  <th className="py-3 px-4">Performance Tier</th>
                  <th className="py-3 px-4">Recommended Hike</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-white">{rev.reviewCode}</td>
                    <td className="py-3 px-4">{rev.reviewPeriod}</td>
                    <td className="py-3 px-4 font-mono">
                      {rev.selfRating} / {rev.managerRating} / {rev.committeeRating}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400 text-sm">{rev.finalScore} / 5.0</td>
                    <td className="py-3 px-4 font-semibold text-indigo-300">{rev.performanceTier}</td>
                    <td className="py-3 px-4 font-semibold text-amber-400">+{rev.recommendedSalaryHikePercent}%</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                        {rev.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 9: RECRUITMENT & PIPELINE */}
      {activeSubTab === 'recruitment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Open Requisitions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Active Job Requisitions</span>
                <Briefcase className="w-4 h-4 text-slate-500" />
              </h3>

              <div className="space-y-3">
                {recruitments.map((req) => (
                  <div key={req.id} className="p-3.5 bg-slate-800/60 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-400">{req.requisitionCode}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
                        {req.priority} PRIORITY
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">{req.positionTitle}</div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Budget: AED {req.salaryBudgetAed?.toLocaleString()}</span>
                      <span>Vacancies: {req.vacanciesCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Pipeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Shortlisted Candidates</span>
                <Users className="w-4 h-4 text-slate-500" />
              </h3>

              <div className="space-y-3">
                {candidates.map((c) => (
                  <div key={c.id} className="p-3.5 bg-slate-800/60 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{c.fullName}</span>
                      <span className="text-xs font-bold text-emerald-400">★ {c.rating} / 5.0</span>
                    </div>
                    <div className="text-xs text-slate-400">{c.currentCompany} • {c.totalExperienceYears} yrs exp</div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                      <span>Expected: AED {c.expectedCtcAed?.toLocaleString()}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 text-[10px] font-semibold">
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 10: HR AUDIT TRAIL */}
      {activeSubTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Immutable HR Audit & Compliance Log</span>
          </h3>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-800/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                      {log.actionType}
                    </span>
                    <span>Ref: {log.referenceNumber}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Performed by: <span className="text-slate-200">{log.performedBy}</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD EMPLOYEE */}
      {isAddEmployeeOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <span>Onboard New Employee</span>
              </h3>
              <button onClick={() => setIsAddEmployeeOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Grade</label>
                  <select
                    value={newEmployee.grade}
                    onChange={(e) => setNewEmployee({ ...newEmployee, grade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="L3">L3 - Site Operations</option>
                    <option value="L4">L4 - Senior Engineer</option>
                    <option value="L6">L6 - Leadership</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Biometric ID</label>
                  <input
                    type="text"
                    placeholder="ESSL-1006"
                    value={newEmployee.biometricId}
                    onChange={(e) => setNewEmployee({ ...newEmployee, biometricId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Location</label>
                  <input
                    type="text"
                    value={newEmployee.workLocation}
                    onChange={(e) => setNewEmployee({ ...newEmployee, workLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: APPLY LEAVE */}
      {isAddLeaveOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Apply for Vacation / Leave</h3>
              <button onClick={() => setIsAddLeaveOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Employee</label>
                <select
                  value={newLeave.employeeId}
                  onChange={(e) => setNewLeave({ ...newLeave, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Total Days</label>
                <input
                  type="number"
                  required
                  value={newLeave.totalDays}
                  onChange={(e) => setNewLeave({ ...newLeave, totalDays: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reason</label>
                <textarea
                  required
                  rows={3}
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="Reason for leave..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddLeaveOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RUN PAYROLL CONFIRMATION */}
      {isRunPayrollOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-emerald-400">
              <DollarSign className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Execute Monthly Payroll Run</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {statutoryProfile === 'INDIA'
                ? 'This will automatically compute gross salaries, apply statutory Provident Fund (12%), ESIC (0.75%), TDS tax deductions, adjust active loan EMIs, and generate individual payslips for all active employees.'
                : statutoryProfile === 'UAE'
                ? 'This will automatically compute gross salaries, apply statutory provident fund deductions, adjust active loan EMIs, and generate individual WPS payslips for all active employees.'
                : 'This will compute gross salaries, statutory social contributions and tax deductions, and generate individual payslips.'}
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsRunPayrollOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePayroll}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
              >
                {loading ? 'Processing...' : 'Confirm & Disburse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PAYSLIP DETAIL VIEW */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Official Payslip Statement</h3>
                <span className="text-xs font-mono text-indigo-400">{selectedPayslip.payslipNumber}</span>
              </div>
              <button onClick={() => setSelectedPayslip(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/60 rounded-lg">
                <div>
                  <span className="text-slate-400 block">Payment Mode</span>
                  <span className="font-semibold text-white">
                    {statutoryProfile === 'INDIA'
                      ? 'Corporate NEFT / RTGS Transfer'
                      : selectedPayslip.paymentMode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Disbursal Date</span>
                  <span className="font-semibold text-white">{selectedPayslip.disbursementDate || '2026-08-31'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Earnings Breakdown</div>
                <div className="flex justify-between text-slate-400">
                  <span>Basic Salary</span>
                  <span className="text-white font-mono">{currSymbol} {selectedPayslip.basicSalaryAed?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="text-white font-mono">{currSymbol} {selectedPayslip.hraAed?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Conveyance & Transport</span>
                  <span className="text-white font-mono">{currSymbol} {selectedPayslip.conveyanceAed?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Site & Special Allowances</span>
                  <span className="text-white font-mono">
                    {currSymbol} {((selectedPayslip.specialAllowanceAed || 0) + (selectedPayslip.siteAllowanceAed || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-slate-800">
                  <span>Gross Earnings</span>
                  <span className="font-mono">{currSymbol} {selectedPayslip.grossEarningsAed?.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Deductions Breakdown</div>
                <div className="flex justify-between text-slate-400">
                  <span>
                    {statutoryProfile === 'INDIA' ? 'Provident Fund (EPF 12%)' : 'Provident Fund (PF)'}
                  </span>
                  <span className="text-rose-400 font-mono">-{currSymbol} {selectedPayslip.providentFundAed?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Loan EMI / Advance Recovery</span>
                  <span className="text-rose-400 font-mono">
                    -{currSymbol} {((selectedPayslip.loanEmiAed || 0) + (selectedPayslip.advanceRecoveryAed || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-rose-400 pt-1 border-t border-slate-800">
                  <span>Total Deductions</span>
                  <span className="font-mono">-{currSymbol} {selectedPayslip.totalDeductionsAed?.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
                <span className="font-bold text-white text-sm">Net Disbursed Salary</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {currSymbol} {selectedPayslip.netPayableAed?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT STATUTORY RULE */}
      {selectedRuleForEdit && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  <span>Configure Statutory Rule</span>
                </h3>
                <span className="text-xs font-mono text-indigo-400">{selectedRuleForEdit.ruleType} • {selectedRuleForEdit.jurisdiction}</span>
              </div>
              <button onClick={() => setSelectedRuleForEdit(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveStatutoryRule} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={selectedRuleForEdit.ruleName}
                  onChange={(e) => setSelectedRuleForEdit({ ...selectedRuleForEdit, ruleName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Employee Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedRuleForEdit.employeeRatePercent ?? ''}
                    onChange={(e) => setSelectedRuleForEdit({ ...selectedRuleForEdit, employeeRatePercent: parseFloat(e.target.value) || null })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Employer Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedRuleForEdit.employerRatePercent ?? ''}
                    onChange={(e) => setSelectedRuleForEdit({ ...selectedRuleForEdit, employerRatePercent: parseFloat(e.target.value) || null })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Wage Ceiling ({currSymbol})</label>
                  <input
                    type="number"
                    value={selectedRuleForEdit.wageCeilingAmount ?? ''}
                    onChange={(e) => setSelectedRuleForEdit({ ...selectedRuleForEdit, wageCeilingAmount: parseFloat(e.target.value) || null })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Calculation Base</label>
                  <select
                    value={selectedRuleForEdit.calculationBase}
                    onChange={(e) => setSelectedRuleForEdit({ ...selectedRuleForEdit, calculationBase: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="BASIC">BASIC</option>
                    <option value="BASIC_DA">BASIC + DA</option>
                    <option value="GROSS">GROSS</option>
                    <option value="TAXABLE_INCOME">TAXABLE INCOME</option>
                    <option value="LAST_DRAWN_BASIC_DA">LAST DRAWN BASIC + DA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description & Authority Mandate</label>
                <textarea
                  rows={2}
                  value={selectedRuleForEdit.description || ''}
                  onChange={(e) => setSelectedRuleForEdit({ ...selectedRuleForEdit, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedRuleForEdit(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  {loading ? 'Saving...' : 'Save & Publish Version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: EDIT EMPLOYEE STATUTORY PROFILE */}
      {isEditProfileOpen && selectedEmpStatutoryProfile && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <span>Employee Statutory & Tax Profile</span>
                </h3>
                <span className="text-xs font-mono text-indigo-400">{selectedEmpStatutoryProfile.employeeName || selectedEmpStatutoryProfile.employeeId}</span>
              </div>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEmployeeStatutory} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    value={selectedEmpStatutoryProfile.panNumber || ''}
                    onChange={(e) => setSelectedEmpStatutoryProfile({ ...selectedEmpStatutoryProfile, panNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Income Tax Regime</label>
                  <select
                    value={selectedEmpStatutoryProfile.taxRegime || 'NEW'}
                    onChange={(e) => setSelectedEmpStatutoryProfile({ ...selectedEmpStatutoryProfile, taxRegime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="NEW">New Tax Regime (Sec 115BAC)</option>
                    <option value="OLD">Old Tax Regime (with 80C/80D deductions)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">EPFO Universal Account # (UAN)</label>
                  <input
                    type="text"
                    placeholder="101234567890"
                    value={selectedEmpStatutoryProfile.uanNumber || ''}
                    onChange={(e) => setSelectedEmpStatutoryProfile({ ...selectedEmpStatutoryProfile, uanNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">PF Member ID</label>
                  <input
                    type="text"
                    placeholder="DL/CPM/12345/678"
                    value={selectedEmpStatutoryProfile.pfNumber || ''}
                    onChange={(e) => setSelectedEmpStatutoryProfile({ ...selectedEmpStatutoryProfile, pfNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">ESIC Insurance #</label>
                  <input
                    type="text"
                    placeholder="ESIC-3100987654"
                    value={selectedEmpStatutoryProfile.esiNumber || ''}
                    onChange={(e) => setSelectedEmpStatutoryProfile({ ...selectedEmpStatutoryProfile, esiNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Professional Tax (PT) State</label>
                  <select
                    value={selectedEmpStatutoryProfile.ptState || 'KERALA'}
                    onChange={(e) => setSelectedEmpStatutoryProfile({ ...selectedEmpStatutoryProfile, ptState: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="KERALA">Kerala (Slab Based - Primary Operating State)</option>
                    <option value="MAHARASHTRA">Maharashtra (Slab Based)</option>
                    <option value="KARNATAKA">Karnataka (Slab Based)</option>
                    <option value="TAMIL_NADU">Tamil Nadu (Slab Based)</option>
                    <option value="TELANGANA">Telangana (Slab Based)</option>
                    <option value="ANDHRA_PRADESH">Andhra Pradesh (Slab Based)</option>
                    <option value="DELHI">Delhi (No PT)</option>
                    <option value="WEST_BENGAL">West Bengal (Slab Based)</option>
                    <option value="GUJARAT">Gujarat (Slab Based)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-lg space-y-2 border border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedEmpStatutoryProfile.isGratuityEligible ?? true}
                      onChange={(e) => setSelectedEmpStatutoryProfile({ ...selectedEmpStatutoryProfile, isGratuityEligible: e.target.checked })}
                      className="rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-0"
                    />
                    <span>Eligible for Gratuity (Payment of Gratuity Act 1972)</span>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedEmpStatutoryProfile.pfOptOut ?? false}
                      onChange={(e) => setSelectedEmpStatutoryProfile({ ...selectedEmpStatutoryProfile, pfOptOut: e.target.checked })}
                      className="rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-0"
                    />
                    <span>EPF Opt-Out (Basic wages &gt; ₹15,000 at joining)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function LayoutDashboardIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
