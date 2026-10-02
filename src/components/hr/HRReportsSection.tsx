import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Users, 
  PieChart as PieIcon,
  CheckCircle2
} from 'lucide-react';
import { Employee, DailyAttendanceRecord, PayrollRecord, LabourAllocation } from '../../types/hr';

interface HRReportsSectionProps {
  employees: Employee[];
  attendanceRecords: DailyAttendanceRecord[];
  payrollRecords: PayrollRecord[];
  labourAllocations: LabourAllocation[];
}

export const HRReportsSection: React.FC<HRReportsSectionProps> = ({
  employees,
  attendanceRecords,
  payrollRecords,
  labourAllocations,
}) => {
  // Department Distribution data for Chart
  const deptCounts: Record<string, number> = {};
  employees.forEach((e) => {
    deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
  });
  const deptChartData = Object.keys(deptCounts).map((dept) => ({
    name: dept,
    count: deptCounts[dept],
  }));

  // Project Labour Cost Chart Data
  const projectCostData = [
    { name: 'Peruvannamuzhi WTP Site', cost: 1680, budget: 4500 },
    { name: 'Water Transmission Main', cost: 2450, budget: 7200 },
    { name: 'Booster Substation Plant', cost: 850, budget: 2800 },
  ];

  // Overtime Trend Chart Data
  const overtimeTrendData = [
    { day: 'Mon', otHours: 12 },
    { day: 'Tue', otHours: 18 },
    { day: 'Wed', otHours: 24 },
    { day: 'Thu', otHours: 15 },
    { day: 'Fri', otHours: 30 },
    { day: 'Sat', otHours: 42 },
  ];

  const COLORS = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#EC4899'];

  const handleExportCSV = (reportName: string) => {
    alert(`Exporting ${reportName} to CSV format... File generated successfully.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Enterprise HR Analytics & Executive Audit Reports</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Workforce distribution, project labour expenses, overtime trends & attendance compliance matrices.
          </p>
        </div>

        <button
          onClick={() => handleExportCSV('HR Executive Master Report')}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Executive CSV</span>
        </button>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Project Labour Cost */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>Project Labour Allocation Expense vs Budget ($)</span>
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectCostData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="cost" fill="#059669" radius={[6, 6, 0, 0]} name="Actual Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Overtime Hours Trend */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Weekly Site Overtime Hours Trend</span>
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overtimeTrendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="otHours" stroke="#2563EB" strokeWidth={3} name="OT Hours" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Exportable Audit Reports Table Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ready-to-Export Audit Reports</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Monthly Attendance & Timecard Audit</h4>
              <p className="text-xs text-slate-500 mt-1">Detailed ESSL punch timestamps, late arrivals, and early exits for payroll.</p>
            </div>
            <button
              onClick={() => handleExportCSV('Monthly Attendance Matrix')}
              className="mt-4 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Report</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Project Labour Expense Audit</h4>
              <p className="text-xs text-slate-500 mt-1">Breakdown of skilled vs unskilled contractor daily wages linked to Water & Civil projects.</p>
            </div>
            <button
              onClick={() => handleExportCSV('Project Labour Cost Report')}
              className="mt-4 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Report</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Statutory PF / ESI Tax Sheet</h4>
              <p className="text-xs text-slate-500 mt-1">Government tax withholding registers for July/August 2026 payroll cycle.</p>
            </div>
            <button
              onClick={() => handleExportCSV('Statutory Tax Withholding')}
              className="mt-4 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Report</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
