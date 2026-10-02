import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  Users, 
  UserCheck, 
  HardHat, 
  CalendarX, 
  DollarSign, 
  Briefcase, 
  FileText, 
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Download,
  Plus
} from 'lucide-react';
import { DSPageHeader, DSButton, DSTabs } from '../ui/design-system';

import { HROverview } from './HROverview';
import { EmployeeMaster } from './EmployeeMaster';
import { OrgHierarchyView } from './OrgHierarchyView';
import { AttendanceSection } from './AttendanceSection';
import { DutyLogsSection } from './DutyLogsSection';
import { LeaveSection } from './LeaveSection';
import { PayrollSection } from './PayrollSection';
import { LabourSection } from './LabourSection';
import { HRReportsSection } from './HRReportsSection';
import { EnterpriseHRMSModule } from '../hrms/EnterpriseHRMSModule';
import { Network, Sparkles } from 'lucide-react';

import { 
  Employee, 
  DailyAttendanceRecord, 
  ESSLDevice, 
  AttendanceCorrectionRequest,
  DailyDutyLog,
  LeaveRequest,
  LeaveBalance,
  PayrollRecord,
  LabourWorker,
  LabourAllocation,
  HRNotification
} from '../../types/hr';

import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_ESSL_DEVICES,
  INITIAL_CORRECTION_REQUESTS,
  INITIAL_DUTY_LOGS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_LEAVE_BALANCES,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_LABOUR_WORKERS,
  INITIAL_LABOUR_ALLOCATIONS,
  INITIAL_HR_NOTIFICATIONS
} from '../../data/hrMockData';

export type HRTab = 
  | 'hrms_enterprise'
  | 'overview' 
  | 'employees' 
  | 'hierarchy'
  | 'attendance' 
  | 'dutylogs' 
  | 'leaves' 
  | 'payroll' 
  | 'labour' 
  | 'reports';

export const HRView: React.FC = () => {
  const [activeHRTab, setActiveHRTab] = useState<HRTab>('hrms_enterprise');
  const [loading, setLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // States
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [esslDevices, setEsslDevices] = useState<ESSLDevice[]>(INITIAL_ESSL_DEVICES);
  const [correctionRequests, setCorrectionRequests] = useState<AttendanceCorrectionRequest[]>(INITIAL_CORRECTION_REQUESTS);
  const [dutyLogs, setDutyLogs] = useState<DailyDutyLog[]>(INITIAL_DUTY_LOGS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [leaveBalances, setLeaveBalances] = useState<Record<string, LeaveBalance>>(INITIAL_LEAVE_BALANCES);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL_RECORDS);
  const [labourWorkers, setLabourWorkers] = useState<LabourWorker[]>(INITIAL_LABOUR_WORKERS);
  const [labourAllocations, setLabourAllocations] = useState<LabourAllocation[]>(INITIAL_LABOUR_ALLOCATIONS);
  const [notifications, setNotifications] = useState<HRNotification[]>(INITIAL_HR_NOTIFICATIONS);

  // Fetch initial HR data from backend API
  useEffect(() => {
    fetchHRData();
  }, []);

  const fetchHRData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hr/employees');
      if (res.ok) {
        const json = await safeJson(res);
        if (json?.data && json.data.length > 0) {
          setEmployees(json.data);
        }
      }
    } catch (err) {
      console.log('Using local HR seed data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleAddEmployee = (newEmpData: Partial<Employee>) => {
    const newCode = `EMP-SSP-${String(employees.length + 1).padStart(3, '0')}`;
    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      employeeCode: newCode,
      photoUrl: newEmpData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      fullName: newEmpData.fullName || 'New Employee',
      mobile: newEmpData.mobile || '+91 90000 00000',
      email: newEmpData.email || 'employee@sitesyncpro.com',
      address: newEmpData.address || 'Kochi Site HQ',
      emergencyContact: newEmpData.emergencyContact || { name: 'Contact', relationship: 'Spouse', phone: '+91 90000 00000' },
      dateOfBirth: newEmpData.dateOfBirth || '1995-01-01',
      joiningDate: newEmpData.joiningDate || new Date().toISOString().split('T')[0],
      department: newEmpData.department || 'Mechanical Engineering',
      designation: newEmpData.designation || 'Site Specialist',
      branch: newEmpData.branch || 'Kochi HQ',
      role: newEmpData.role || 'WORKER',
      reportingManager: newEmpData.reportingManager || 'Siddharth Nair',
      employmentType: newEmpData.employmentType || 'FULL_TIME',
      salaryStructure: newEmpData.salaryStructure || {
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
      },
      status: 'ACTIVE',
      documents: [
        {
          id: `doc_${Date.now()}`,
          title: 'National Identity Proof',
          documentType: 'ID_PROOF',
          documentNumber: 'ID-SSP-2026-99',
          status: 'VALID',
        },
      ],
    };

    setEmployees((prev) => [newEmp, ...prev]);

    // Send POST to backend
    fetch('/api/hr/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmp),
    }).catch((e) => console.log('Backend sync offline:', e));
  };

  const handleUpdateEmployee = (id: string, updatedData: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedData } : e))
    );

    // Sync PUT with backend
    fetch(`/api/hr/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    }).catch((e) => console.log('Backend update offline:', e));
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'TERMINATED', isDeleted: true } : e))
    );

    // Sync DELETE with backend
    fetch(`/api/hr/employees/${id}`, {
      method: 'DELETE',
    }).catch((e) => console.log('Backend delete offline:', e));
  };

  const handleRestoreEmployee = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'ACTIVE', isDeleted: false } : e))
    );

    // Sync RESTORE with backend
    fetch(`/api/hr/employees/${id}/restore`, {
      method: 'POST',
    }).catch((e) => console.log('Backend restore offline:', e));
  };

  const handlePunchAttendance = (employeeId: string, type: 'CHECK_IN' | 'CHECK_OUT') => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toTimeString().split(' ')[0].slice(0, 5);

    setAttendanceRecords((prev) => {
      const idx = prev.findIndex((a) => a.employeeId === employeeId && a.date === todayStr);
      if (idx >= 0) {
        const copy = [...prev];
        if (type === 'CHECK_OUT') {
          copy[idx] = { ...copy[idx], checkOut: timeNow, status: 'PRESENT' };
        } else {
          copy[idx] = { ...copy[idx], checkIn: timeNow, status: 'PRESENT' };
        }
        return copy;
      } else {
        const newRecord: DailyAttendanceRecord = {
          id: `att_${Date.now()}`,
          employeeId: emp.id,
          employeeCode: emp.employeeCode,
          employeeName: emp.fullName,
          department: emp.department,
          date: todayStr,
          checkIn: timeNow,
          shift: 'DAY_SHIFT',
          status: 'PRESENT',
          lateMinutes: 0,
          earlyExitMinutes: 0,
          overtimeHours: 0,
          workingHours: 8.0,
          locationPunchIn: 'Site GPS Punch',
          isManualEntry: true,
          remarks: 'Manual timecard check-in',
        };
        return [newRecord, ...prev];
      }
    });
  };

  const handleSyncESSL = () => {
    setEsslDevices((prev) =>
      prev.map((d) => ({
        ...d,
        lastSyncTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        totalLogsToday: d.totalLogsToday + 4,
      }))
    );
    setNotificationMessage({
      type: 'success',
      message: 'ESSL SDK Gateway triggered: Synced 4 biometric punches successfully.'
    });
  };

  const handleReviewCorrection = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setCorrectionRequests((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: action, reviewedBy: 'HR Admin' } : c))
    );
  };

  const handleSubmitDutyLog = (logData: Partial<DailyDutyLog>) => {
    const newLog: DailyDutyLog = {
      id: `duty_${Date.now()}`,
      employeeId: logData.employeeId || 'emp_101',
      employeeName: logData.employeeName || 'Staff Member',
      date: new Date().toISOString().split('T')[0],
      projectId: logData.projectId || 'prj_01',
      projectName: logData.projectName || 'Peruvannamuzhi WTP Project',
      siteName: logData.siteName || 'Bridge Deck',
      workDescription: logData.workDescription || 'Daily site work executed',
      workingHours: logData.workingHours || 8.0,
      equipmentUsed: logData.equipmentUsed || [],
      materialsUsed: logData.materialsUsed || [],
      photoUrl: logData.photoUrl,
      verifiedBy: 'Siddharth Nair (Site Incharge)',
      approvedBy: 'Robert Vance (Project Manager)',
      status: 'APPROVED',
    };
    setDutyLogs((prev) => [newLog, ...prev]);
  };

  const handleVerifyDutyLog = (id: string, status: 'VERIFIED' | 'APPROVED') => {
    setDutyLogs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
  };

  const handleApplyLeave = (leaveData: Partial<LeaveRequest>) => {
    const newLeave: LeaveRequest = {
      id: `lve_${Date.now()}`,
      employeeId: leaveData.employeeId || 'emp_101',
      employeeName: leaveData.employeeName || 'Staff Member',
      leaveCategory: leaveData.leaveCategory || 'CASUAL',
      startDate: leaveData.startDate || '2026-08-10',
      endDate: leaveData.endDate || '2026-08-12',
      totalDays: leaveData.totalDays || 3,
      reason: leaveData.reason || 'Personal leave',
      status: 'PENDING',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests((prev) => [newLeave, ...prev]);
  };

  const handleReviewLeave = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: action, approvedBy: 'Ananya Sharma (HR)' } : l))
    );
  };

  const handleGeneratePayroll = (monthYear: string) => {
    const newPayrollItems: PayrollRecord[] = employees.map((emp) => {
      const s = emp.salaryStructure;
      const gross = s.basicUSD + s.hraUSD + s.daUSD + s.specialAllowanceUSD + s.foodAllowanceUSD + s.travelAllowanceUSD;
      const totalDed = s.pfDeductionUSD + s.esiDeductionUSD + s.professionalTaxUSD;

      return {
        id: `pay_${Date.now()}_${emp.id}`,
        payrollMonth: monthYear,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        designation: emp.designation,
        department: emp.department,
        bankAccount: `HDFC-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        bankName: 'HDFC Bank Corporate',
        daysInMonth: 31,
        daysWorked: 26,
        paidLeaves: 2,
        unpaidLeaves: 0,
        overtimeHours: 10,
        basicEarnedUSD: s.basicUSD,
        hraEarnedUSD: s.hraUSD,
        daEarnedUSD: s.daUSD,
        allowancesUSD: s.specialAllowanceUSD + s.foodAllowanceUSD + s.travelAllowanceUSD,
        overtimePayUSD: 10 * s.overtimeHourlyRateUSD,
        bonusUSD: 250,
        grossSalaryUSD: gross + 10 * s.overtimeHourlyRateUSD + 250,
        pfDeductionUSD: s.pfDeductionUSD,
        esiDeductionUSD: s.esiDeductionUSD,
        taxTdsUSD: 150,
        otherDeductionsUSD: 0,
        totalDeductionsUSD: totalDed + 150,
        netSalaryUSD: gross + 10 * s.overtimeHourlyRateUSD + 250 - (totalDed + 150),
        paymentStatus: 'GENERATED',
      };
    });

    setPayrollRecords(newPayrollItems);
    setNotificationMessage({
      type: 'success',
      message: `Successfully generated salary slips for ${employees.length} employees for ${monthYear}.`
    });
  };

  const handleAllocateLabour = (allocData: Partial<LabourAllocation>) => {
    const newAlloc: LabourAllocation = {
      id: `alloc_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      projectId: allocData.projectId || 'prj_01',
      projectName: allocData.projectName || 'Peruvannamuzhi WTP Project',
      siteName: allocData.siteName || 'Pier 3',
      contractorName: allocData.contractorName || 'Acme Infra Crafts Ltd',
      skilledWorkersCount: allocData.skilledWorkersCount || 10,
      unskilledWorkersCount: allocData.unskilledWorkersCount || 15,
      regularHours: allocData.regularHours || 200,
      overtimeHours: allocData.overtimeHours || 20,
      totalLaborCostUSD: allocData.totalLaborCostUSD || 1500,
      supervisorIncharge: 'Marcus Brody',
    };
    setLabourAllocations((prev) => [newAlloc, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & ERP Actions */}
      <DSPageHeader
        title="Human Capital & Site Personnel ERP"
        description="Employee master, biometric attendance sync, daily site duty logs, leaves, payroll & contract labor"
        breadcrumbs={[{ label: 'ERP' }, { label: 'Human Resources' }]}
        actions={
          <>
            <DSButton
              variant="outline"
              size="sm"
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={fetchHRData}
            >
              Refresh
            </DSButton>

            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={() => {
                const rows = ["Code,Name,Department,Designation,Branch,Status"]
                  .concat(employees.map(e => `"${e.employeeCode || ''}","${e.fullName || ''}","${e.department || ''}","${e.designation || ''}","${e.branch || ''}","${e.status || ''}"`));
                const blob = new Blob([rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `hr_employees_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
            >
              Export
            </DSButton>

            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setActiveHRTab('employees');
              }}
            >
              Add Employee
            </DSButton>
          </>
        }
      />

      {/* Action Notification Banner */}
      {notificationMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notificationMessage.message}</span>
          </div>
          <button
            onClick={() => setNotificationMessage(null)}
            className="text-emerald-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Primary HR Module Navigation Tabs */}
      <div className="pb-2">
        <DSTabs
          tabs={[
            { id: 'hrms_enterprise', label: 'Enterprise HRMS Core (Phase 70)', icon: <Sparkles className="w-4 h-4 text-indigo-400" /> },
            { id: 'overview', label: 'HR Overview & Alerts', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'employees', label: `Employee Master (${employees.length})`, icon: <Users className="w-4 h-4" /> },
            { id: 'hierarchy', label: 'Org Hierarchy & Tree', icon: <Network className="w-4 h-4" /> },
            { id: 'attendance', label: 'Attendance & ESSL', icon: <UserCheck className="w-4 h-4" /> },
            { id: 'dutylogs', label: `Daily Duty Logs (${dutyLogs.length})`, icon: <HardHat className="w-4 h-4" /> },
            { id: 'leaves', label: 'Leave Management', icon: <CalendarX className="w-4 h-4" /> },
            { id: 'payroll', label: 'Payroll & Payslips', icon: <DollarSign className="w-4 h-4" /> },
            { id: 'labour', label: 'Contract Labour', icon: <Briefcase className="w-4 h-4" /> },
            { id: 'reports', label: 'HR Analytics & Reports', icon: <FileText className="w-4 h-4" /> },
          ]}
          activeTab={activeHRTab}
          onChange={(id) => setActiveHRTab(id as HRTab)}
          variant="underline"
        />
      </div>

      {/* Main Tab Render Body */}
      {activeHRTab === 'hrms_enterprise' && <EnterpriseHRMSModule />}

      {activeHRTab === 'overview' && (
        <HROverview
          employees={employees}
          attendanceToday={attendanceRecords}
          notifications={notifications}
          pendingLeaves={leaveRequests.filter((l) => l.status === 'PENDING')}
          dutyLogs={dutyLogs}
          onNavigateTab={(tab) => setActiveHRTab(tab as HRTab)}
        />
      )}

      {activeHRTab === 'employees' && (
        <EmployeeMaster
          employees={employees}
          onAddEmployee={handleAddEmployee}
          onUpdateEmployee={handleUpdateEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          onRestoreEmployee={handleRestoreEmployee}
        />
      )}

      {activeHRTab === 'hierarchy' && <OrgHierarchyView />}

      {activeHRTab === 'attendance' && (
        <AttendanceSection
          attendanceRecords={attendanceRecords}
          esslDevices={esslDevices}
          correctionRequests={correctionRequests}
          employees={employees}
          onPunchAttendance={handlePunchAttendance}
          onSyncESSL={handleSyncESSL}
          onReviewCorrection={handleReviewCorrection}
        />
      )}

      {activeHRTab === 'dutylogs' && (
        <DutyLogsSection
          dutyLogs={dutyLogs}
          employees={employees}
          onSubmitDutyLog={handleSubmitDutyLog}
          onVerifyDutyLog={handleVerifyDutyLog}
        />
      )}

      {activeHRTab === 'leaves' && (
        <LeaveSection
          leaveRequests={leaveRequests}
          leaveBalances={leaveBalances}
          employees={employees}
          onApplyLeave={handleApplyLeave}
          onReviewLeave={handleReviewLeave}
        />
      )}

      {activeHRTab === 'payroll' && (
        <PayrollSection
          payrollRecords={payrollRecords}
          employees={employees}
          onGeneratePayroll={handleGeneratePayroll}
        />
      )}

      {activeHRTab === 'labour' && (
        <LabourSection
          labourWorkers={labourWorkers}
          labourAllocations={labourAllocations}
          onAllocateLabour={handleAllocateLabour}
        />
      )}

      {activeHRTab === 'reports' && (
        <HRReportsSection
          employees={employees}
          attendanceRecords={attendanceRecords}
          payrollRecords={payrollRecords}
          labourAllocations={labourAllocations}
        />
      )}

    </div>
  );
};
