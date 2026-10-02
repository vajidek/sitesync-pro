import React, { useState } from 'react';
import { 
  DollarSign, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Plus, 
  Building, 
  Download, 
  X, 
  CreditCard,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { PayrollRecord, Employee } from '../../types/hr';

interface PayrollSectionProps {
  payrollRecords: PayrollRecord[];
  employees: Employee[];
  onGeneratePayroll: (monthYear: string) => void;
}

export const PayrollSection: React.FC<PayrollSectionProps> = ({
  payrollRecords,
  employees,
  onGeneratePayroll,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  const totalGrossPayout = payrollRecords.reduce((sum, p) => sum + p.grossSalaryUSD, 0);
  const totalNetPayout = payrollRecords.reduce((sum, p) => sum + p.netSalaryUSD, 0);
  const totalDeductions = payrollRecords.reduce((sum, p) => sum + p.totalDeductionsUSD, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Metrics */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <span>Enterprise Payroll & Salary Processing Engine</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated basic, HRA, DA, overtime calculation, PF/ESI deductions & printable payslips.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
          />
          <button
            onClick={() => onGeneratePayroll(selectedMonth)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate {selectedMonth} Payroll</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase">Gross Salary Disbursement</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            ${totalGrossPayout.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Before statutory deductions</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase">Total PF / ESI / Tax Withheld</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            ${totalDeductions.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Statutory compliance remittance</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase">Net Salary Disbursed</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            ${totalNetPayout.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-semibold">
            Direct Bank Transfer Ready
          </span>
        </div>
      </div>

      {/* Monthly Payroll Register Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Payroll Master Register ({payrollRecords.length} Slips)
          </h3>
          <span className="text-xs font-mono text-slate-400">Currency: USD ($)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Month</th>
                <th className="p-3.5">Days Worked</th>
                <th className="p-3.5">Gross Pay</th>
                <th className="p-3.5">Deductions</th>
                <th className="p-3.5">Net Payable</th>
                <th className="p-3.5">Payment Ref</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payrollRecords.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    <div>{p.employeeName}</div>
                    <span className="text-[10px] font-mono text-slate-400">{p.employeeCode} • {p.designation}</span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 font-semibold">{p.payrollMonth}</td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300">
                    {p.daysWorked} Days <span className="text-[10px] text-emerald-600 font-bold">(+{p.overtimeHours}h OT)</span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                    ${p.grossSalaryUSD.toLocaleString()}
                  </td>
                  <td className="p-3.5 font-mono text-rose-600 dark:text-rose-400">
                    -${p.totalDeductionsUSD.toLocaleString()}
                  </td>
                  <td className="p-3.5 font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    ${p.netSalaryUSD.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-[11px] text-slate-500">
                    <div>{p.bankName}</div>
                    <span className="font-mono text-[10px]">{p.utrReference || 'Pending UTR'}</span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedPayslip(p)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-semibold transition inline-flex items-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>Payslip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE PAYSLIP MODAL */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden my-8 p-8 space-y-6">
            
            {/* Payslip Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-blue-900">SITESYNC PRO ENTERPRISE</h2>
                <p className="text-xs text-slate-600 font-medium">Construction Enterprise Operations Ltd.</p>
                <p className="text-[10px] text-slate-400">HQ: Marine Drive Corridor, Kochi, Kerala</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-900 px-3 py-1 rounded">
                  SALARY PAYSLIP
                </span>
                <p className="text-xs font-mono font-bold text-slate-700 mt-1">Period: {selectedPayslip.payrollMonth}</p>
              </div>
            </div>

            {/* Employee Meta Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Employee Name</span>
                <p className="font-bold text-slate-900">{selectedPayslip.employeeName}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Employee Code</span>
                <p className="font-mono font-bold text-slate-900">{selectedPayslip.employeeCode}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Designation</span>
                <p className="font-bold text-slate-900">{selectedPayslip.designation}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Department</span>
                <p className="font-bold text-slate-900">{selectedPayslip.department}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Days Worked / OT</span>
                <p className="font-bold text-slate-900">{selectedPayslip.daysWorked} Days ({selectedPayslip.overtimeHours}h Overtime)</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Bank Transfer Account</span>
                <p className="font-mono font-bold text-slate-900">{selectedPayslip.bankAccount} ({selectedPayslip.bankName})</p>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              
              {/* Earnings */}
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] border-b pb-1">Earnings ($)</h4>
                <div className="flex justify-between py-1 border-b">
                  <span>Basic Salary</span>
                  <span className="font-mono font-bold">${selectedPayslip.basicEarnedUSD}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>HRA Allowance</span>
                  <span className="font-mono font-bold">${selectedPayslip.hraEarnedUSD}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Dearness Allowance (DA)</span>
                  <span className="font-mono font-bold">${selectedPayslip.daEarnedUSD}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Overtime Pay</span>
                  <span className="font-mono font-bold">${selectedPayslip.overtimePayUSD}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Bonus / Incentives</span>
                  <span className="font-mono font-bold">${selectedPayslip.bonusUSD}</span>
                </div>
                <div className="flex justify-between py-2 pt-3 font-extrabold text-slate-900 border-t-2">
                  <span>Gross Earnings</span>
                  <span className="font-mono text-emerald-700">${selectedPayslip.grossSalaryUSD}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-2">
                <h4 className="font-bold text-rose-800 uppercase tracking-wider text-[11px] border-b pb-1">Deductions ($)</h4>
                <div className="flex justify-between py-1 border-b">
                  <span>Provident Fund (PF)</span>
                  <span className="font-mono font-bold">${selectedPayslip.pfDeductionUSD}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>ESI Medical Tax</span>
                  <span className="font-mono font-bold">${selectedPayslip.esiDeductionUSD}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Income Tax TDS</span>
                  <span className="font-mono font-bold">${selectedPayslip.taxTdsUSD}</span>
                </div>
                <div className="flex justify-between py-2 pt-3 font-extrabold text-slate-900 border-t-2">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-700">${selectedPayslip.totalDeductionsUSD}</span>
                </div>
              </div>

            </div>

            {/* Net Salary Highlight Box */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-800">Net Salary Payable</span>
                <p className="text-[11px] text-emerald-600">Disbursed via automated bank transfer</p>
              </div>
              <div className="text-2xl font-black font-mono text-emerald-700">
                ${selectedPayslip.netSalaryUSD.toLocaleString()} USD
              </div>
            </div>

            {/* Signatures & Watermark */}
            <div className="pt-6 border-t flex items-end justify-between text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-800">SiteSync Pro ERP HR Engine</p>
                <p className="text-[10px] text-slate-400">Designed & Developed by Abdul Vajid EK</p>
              </div>
              <div className="text-right">
                <div className="h-8 border-b border-dashed border-slate-400 w-36 mb-1"></div>
                <span className="text-[10px] font-bold text-slate-700 uppercase">Authorized HR Signatory</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Payslip</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
