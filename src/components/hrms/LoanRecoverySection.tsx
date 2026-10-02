import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { WorkflowApprovalChainWidget } from '../workflow/WorkflowApprovalChainWidget';
import {
  CreditCard,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Calculator,
  History,
  ShieldCheck,
  Percent,
  Calendar,
  Layers,
  ArrowRight,
  GitMerge,
  X
} from 'lucide-react';

interface LoanRecoverySectionProps {
  currSymbol: string;
  employees: any[];
  onLoanUpdated?: () => void;
}

export const LoanRecoverySection: React.FC<LoanRecoverySectionProps> = ({
  currSymbol,
  employees,
  onLoanUpdated,
}) => {
  const [loans, setLoans] = useState<any[]>([]);
  const [recoveries, setRecoveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [selectedLoanForWorkflow, setSelectedLoanForWorkflow] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'accounts' | 'simulator' | 'ledger'>('accounts');

  // New Loan Form
  const [newLoan, setNewLoan] = useState({
    employeeId: '',
    loanType: 'PERSONAL',
    principalAmountAed: 25000,
    interestRate: 0,
    tenureMonths: 12,
    repaymentMethod: 'PER_DUTY_DAY',
    repaymentRatePerDay: 1000,
    monthlyEmiAed: 2500,
  });

  // Simulator State
  const [simEmployeeId, setSimEmployeeId] = useState<string>('');
  const [simDutyDays, setSimDutyDays] = useState<number>(26);
  const [simGrossSalary, setSimGrossSalary] = useState<number>(75000);
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchLoansAndRecoveries();
  }, []);

  useEffect(() => {
    if (employees.length > 0 && !newLoan.employeeId) {
      setNewLoan((prev) => ({ ...prev, employeeId: employees[0].id }));
      setSimEmployeeId(employees[0].id);
    }
  }, [employees]);

  useEffect(() => {
    if (simEmployeeId) {
      runSimulation();
    }
  }, [simEmployeeId, simDutyDays, simGrossSalary]);

  const fetchLoansAndRecoveries = async () => {
    setLoading(true);
    try {
      const [loanRes, recRes] = await Promise.all([
        fetch('/api/hrms/loans').then(safeJson).catch(() => null),
        fetch('/api/hrms/loans/recoveries').then(safeJson).catch(() => null),
      ]);
      if (loanRes?.data) setLoans(loanRes.data);
      if (recRes?.data) setRecoveries(recRes.data);
    } catch (err) {
      console.error('Failed to fetch loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/hrms/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoan),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setIsAddLoanOpen(false);
        fetchLoansAndRecoveries();
        if (onLoanUpdated) onLoanUpdated();
      }
    } catch (err) {
      console.error('Error creating loan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLoan = async (loanId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hrms/loans/${loanId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: 'Approved by HR & Finance Director' }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        fetchLoansAndRecoveries();
        if (onLoanUpdated) onLoanUpdated();
      }
    } catch (err) {
      console.error('Error approving loan:', err);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    if (!simEmployeeId) return;
    setSimLoading(true);
    try {
      const res = await fetch('/api/hrms/loans/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: simEmployeeId,
          payableDutyDays: simDutyDays,
          grossSalary: simGrossSalary,
        }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setSimResult(data.data);
      }
    } catch (err) {
      console.error('Error simulating loan recovery:', err);
    } finally {
      setSimLoading(false);
    }
  };

  const totalDisbursed = loans.reduce((acc, l) => acc + Number(l.principalAmountAed || 0), 0);
  const totalOutstanding = loans.reduce((acc, l) => acc + Number(l.balanceOutstandingAed || 0), 0);
  const totalRecovered = loans.reduce((acc, l) => acc + Number(l.totalRecoveredAed || (l.principalAmountAed - l.balanceOutstandingAed) || 0), 0);
  const activeLoansCount = loans.filter((l) => l.status === 'ACTIVE').length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Employee Loans, Advances & Statutory Recovery Engine</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict Cap Enforced: <code className="text-amber-300 font-mono text-[11px] bg-slate-800 px-1 py-0.5 rounded">Recovery = MIN(Calculated Installment, Outstanding Balance)</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-lg flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                activeTab === 'accounts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Loan Accounts ({loans.length})
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1 rounded-md font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'simulator' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Recovery Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1 rounded-md font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'ledger' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Payroll Recoveries Ledger</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddLoanOpen(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Loan</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium block">Total Principal Disbursed</span>
          <div className="text-lg font-bold text-white font-mono mt-0.5">
            {currSymbol} {totalDisbursed.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium block">Total Recovered to Date</span>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
            {currSymbol} {totalRecovered.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium block">Outstanding Active Balance</span>
          <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
            {currSymbol} {totalOutstanding.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium block">Active Loan Accounts</span>
          <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">
            {activeLoansCount} of {loans.length} Accounts
          </div>
        </div>
      </div>

      {/* VIEW 1: LOAN ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Loan ID / Code</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Principal ({currSymbol})</th>
                <th className="py-3 px-4">Repayment Method & Rate</th>
                <th className="py-3 px-4 text-emerald-400">Total Recovered</th>
                <th className="py-3 px-4 text-rose-400">Outstanding Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loans.map((ln) => (
                <tr key={ln.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">{ln.loanCode}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{ln.employeeName || ln.employeeId}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{ln.employeeCode}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-medium">
                      {ln.loanType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-white">
                    {currSymbol} {Number(ln.principalAmountAed || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    {ln.repaymentMethod === 'PER_DUTY_DAY' ? (
                      <div>
                        <span className="text-amber-300 font-semibold">Per Duty Day</span>
                        <div className="font-mono text-[10px] text-slate-400">
                          {currSymbol} {ln.repaymentRatePerDay || 1000} / day worked
                        </div>
                      </div>
                    ) : ln.repaymentMethod === 'PERCENTAGE_OF_GROSS' ? (
                      <div>
                        <span className="text-indigo-300 font-semibold">% of Gross</span>
                        <div className="font-mono text-[10px] text-slate-400">{ln.repaymentPercentage || 10}% of gross</div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-sky-300 font-semibold">Monthly EMI</span>
                        <div className="font-mono text-[10px] text-slate-400">
                          {currSymbol} {Number(ln.monthlyEmiAed || 0).toLocaleString()} / mo
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                    {currSymbol} {Number(ln.totalRecoveredAed || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-rose-400 font-bold text-sm">
                    {currSymbol} {Number(ln.balanceOutstandingAed || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        ln.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : ln.status === 'CLOSED'
                          ? 'bg-slate-700/50 text-slate-400 border border-slate-600'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {ln.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => setSelectedLoanForWorkflow(ln)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 rounded text-[11px] font-medium transition flex items-center space-x-1"
                        title="View Governance Workflow & Approval Chain"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Workflow</span>
                      </button>

                      {ln.status === 'PENDING_APPROVAL' ? (
                        <button
                          onClick={() => handleApproveLoan(ln.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSimEmployeeId(ln.employeeId);
                            setActiveTab('simulator');
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded text-[11px] font-medium transition"
                        >
                          Simulate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE RECOVERY SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Controls & Parameters */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calculator className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">Loan Recovery Sandbox & Policy Validator</h4>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Select Employee / Loan Account</label>
                <select
                  value={simEmployeeId}
                  onChange={(e) => setSimEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode || emp.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-400 font-semibold">Simulated Payable Duty Days</label>
                  <span className="font-mono text-indigo-300 font-bold">{simDutyDays} Days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="31"
                  step="1"
                  value={simDutyDays}
                  onChange={(e) => setSimDutyDays(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>0 (Full LOP)</span>
                  <span>15 Days</span>
                  <span>26 Days (Std)</span>
                  <span>31 Days</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Projected Monthly Gross Salary ({currSymbol})</label>
                <input
                  type="number"
                  value={simGrossSalary}
                  onChange={(e) => setSimGrossSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-slate-300 text-[11px] space-y-1">
                <div className="font-bold text-indigo-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Business Governance Invariant</span>
                </div>
                <p>
                  Deduction formula guarantees that monthly payroll never deducts more than the actual outstanding balance, regardless of the duty days worked.
                </p>
              </div>
            </div>
          </div>

          {/* Real-Time Simulation Result */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Simulation Outcome</span>
                {simLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Safe Recovery Active
              </span>
            </div>

            {simResult && simResult.simulatedDeduction > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-800/60 rounded-xl">
                    <span className="text-[11px] text-slate-400 block">Calculated Installment</span>
                    <span className="text-base font-bold text-amber-300 font-mono">
                      {currSymbol} {simResult.calculatedInstallment?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      ({simDutyDays} days × {currSymbol}{simResult.repaymentRatePerDay || 1000}/day)
                    </span>
                  </div>

                  <div className="p-3 bg-slate-800/60 rounded-xl">
                    <span className="text-[11px] text-slate-400 block">Current Outstanding</span>
                    <span className="text-base font-bold text-rose-300 font-mono">
                      {currSymbol} {simResult.outstandingBalance?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">Prior to deduction</span>
                  </div>

                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-emerald-300 block font-semibold">Actual Deduction Capped</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {currSymbol} {simResult.simulatedDeduction?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-400/80 block font-mono">
                      = MIN({simResult.calculatedInstallment}, {simResult.outstandingBalance})
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Remaining Balance After Deduction:</span>
                    <span className="font-mono font-bold text-white">
                      {currSymbol} {simResult.projectedRemainingBalance?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Account Status After Run:</span>
                    <span className="font-bold text-indigo-400">{simResult.projectedStatus}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px]">
                  <span className="text-indigo-400 font-bold block mb-1">Execution Rule Explanation:</span>
                  {simResult.explanation}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <span>This employee has no active loan balance to recover. Outstanding balance is {currSymbol} 0.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: LOAN RECOVERIES LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-400" />
              <span>Immutable Payroll Loan Deduction Ledger</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {recoveries.length} Automated Deductions Recorded
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Period / Run Ref</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Installment Calculated</th>
                <th className="py-3 px-4">Cap Applied</th>
                <th className="py-3 px-4 text-emerald-400 font-bold">Amount Deducted</th>
                <th className="py-3 px-4 text-rose-400">Remaining Balance</th>
                <th className="py-3 px-4">Deduction Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recoveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No payroll loan deductions recorded yet. Deductions will appear automatically when payroll runs are executed.
                  </td>
                </tr>
              ) : (
                recoveries.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                      {rec.payrollRunId || rec.periodId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{rec.employeeName || rec.employeeId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {currSymbol} {Number(rec.calculatedInstallment || rec.amountDeductedAed).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-amber-300">
                        {rec.ruleApplied || 'MIN(INST, BAL)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold text-sm">
                      {currSymbol} {Number(rec.amountDeductedAed || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-rose-400 font-semibold">
                      {currSymbol} {Number(rec.closingBalanceAed || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : '2026-08-26'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ISSUE LOAN MODAL */}
      {isAddLoanOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <span>Issue Employee Loan / Advance</span>
              </h3>
              <button onClick={() => setIsAddLoanOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Beneficiary Employee *</label>
                <select
                  required
                  value={newLoan.employeeId}
                  onChange={(e) => setNewLoan({ ...newLoan, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode || emp.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Loan Category</label>
                  <select
                    value={newLoan.loanType}
                    onChange={(e) => setNewLoan({ ...newLoan, loanType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="PERSONAL">PERSONAL LOAN</option>
                    <option value="SALARY_ADVANCE">SALARY ADVANCE</option>
                    <option value="EMERGENCY">EMERGENCY AID</option>
                    <option value="EQUIPMENT">EQUIPMENT ADVANCE</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Principal Amount ({currSymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={newLoan.principalAmountAed}
                    onChange={(e) => setNewLoan({ ...newLoan, principalAmountAed: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Repayment Method</label>
                <select
                  value={newLoan.repaymentMethod}
                  onChange={(e) => setNewLoan({ ...newLoan, repaymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                >
                  <option value="PER_DUTY_DAY">PER DUTY DAY (e.g. ₹1,000 / day worked)</option>
                  <option value="MONTHLY_FLAT">MONTHLY FIXED EMI</option>
                  <option value="PERCENTAGE_OF_GROSS">PERCENTAGE OF GROSS SALARY</option>
                </select>
              </div>

              {newLoan.repaymentMethod === 'PER_DUTY_DAY' ? (
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Recovery Rate Per Duty Day ({currSymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={newLoan.repaymentRatePerDay}
                    onChange={(e) => setNewLoan({ ...newLoan, repaymentRatePerDay: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Monthly EMI ({currSymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={newLoan.monthlyEmiAed}
                    onChange={(e) => setNewLoan({ ...newLoan, monthlyEmiAed: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddLoanOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  {loading ? 'Processing...' : 'Disburse & Record Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Universal Workflow Approval Chain */}
      {selectedLoanForWorkflow && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Loan Governance & Approval Chain — {selectedLoanForWorkflow.loanCode}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Employee: {selectedLoanForWorkflow.employeeName || selectedLoanForWorkflow.employeeId} | Amount: {currSymbol} {Number(selectedLoanForWorkflow.principalAmountAed || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLoanForWorkflow(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <WorkflowApprovalChainWidget
              entityType="LOAN_APPLICATION"
              entityId={selectedLoanForWorkflow.id}
              currentStage={selectedLoanForWorkflow.status === 'PENDING_APPROVAL' ? 1 : 1}
              entityStatus={selectedLoanForWorkflow.status}
              creatorId={selectedLoanForWorkflow.createdBy || selectedLoanForWorkflow.employeeId}
              department="HR"
              amount={Number(selectedLoanForWorkflow.principalAmountAed || 0)}
              onActionSuccess={() => {
                fetchLoansAndRecoveries();
                if (onLoanUpdated) onLoanUpdated();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
