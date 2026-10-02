import React, { useState } from 'react';
import { 
  Vendor, 
  PurchaseOrder, 
  GoodsReceiptNote, 
  BOQItem, 
  Tender, 
  ProjectCostControl 
} from '../../types/procurement';
import { 
  FileSpreadsheet, 
  Printer, 
  TrendingUp, 
  Award, 
  PackageCheck, 
  BarChart4, 
  Briefcase, 
  Calculator,
  Download
} from 'lucide-react';

interface ProcurementReportsProps {
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  grns: GoodsReceiptNote[];
  boqItems: BOQItem[];
  tenders: Tender[];
  costControls: ProjectCostControl[];
}

export const ProcurementReportsView: React.FC<ProcurementReportsProps> = ({
  vendors,
  purchaseOrders,
  grns,
  boqItems,
  tenders,
  costControls
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'VendorPerformance' | 'PurchaseRegister' | 'GRNRegister' | 'BOQProgress' | 'TenderStatus' | 'BudgetVsActual'>('VendorPerformance');

  const reportTabs = [
    { id: 'VendorPerformance', name: 'Vendor Scorecard & Performance', icon: Award },
    { id: 'PurchaseRegister', name: 'Purchase Order Register', icon: FileSpreadsheet },
    { id: 'GRNRegister', name: 'GRN Store Inward Register', icon: PackageCheck },
    { id: 'BOQProgress', name: 'BOQ Progress & Valuation', icon: BarChart4 },
    { id: 'TenderStatus', name: 'Tender Bidding Status', icon: Briefcase },
    { id: 'BudgetVsActual', name: 'Budget vs Actual Cost Control', icon: Calculator }
  ];

  const handleExportCSV = () => {
    alert(`Exporting ${activeReportTab} to CSV / Excel report...`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>Procurement & BOQ Executive Analytics & Reports</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Downloadable audit reports, vendor ratings, purchase logs, BOQ valuations and cost variances
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center space-x-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Current Report (CSV)</span>
        </button>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center space-x-2 ${
                activeReportTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Report Content Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
        
        {/* TAB 1: Vendor Performance */}
        {activeReportTab === 'VendorPerformance' && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Vendor Performance & Quality Scorecard</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Vendor Code & Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Approved Status</th>
                    <th className="p-3 text-right">Performance Score</th>
                    <th className="p-3 text-right">On-Time Delivery %</th>
                    <th className="p-3 text-right">Quality Compliance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {vendors.map((v) => (
                    <tr key={v.id}>
                      <td className="p-3 font-bold text-blue-600 dark:text-blue-400">
                        {v.vendorCode} - <span className="font-sans font-medium text-slate-900 dark:text-white">{v.name}</span>
                      </td>
                      <td className="p-3 font-sans text-slate-400 text-[11px]">{v.category}</td>
                      <td className="p-3 font-sans text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                          {v.approvedStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">{v.rating.score}/5.0</td>
                      <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">{v.rating.onTimeDeliveryPct}%</td>
                      <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">{v.rating.qualityCompliancePct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Purchase Register */}
        {activeReportTab === 'PurchaseRegister' && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Purchase Order (PO) Register</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">PO Number & Date</th>
                    <th className="p-3">Supplier Name</th>
                    <th className="p-3">Project</th>
                    <th className="p-3 text-right">Subtotal ($)</th>
                    <th className="p-3 text-right">GST ($)</th>
                    <th className="p-3 text-right">Net Amount ($)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {purchaseOrders.map((p) => (
                    <tr key={p.id}>
                      <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{p.poNumber}</td>
                      <td className="p-3 font-sans font-medium text-slate-900 dark:text-white">{p.vendorName}</td>
                      <td className="p-3 font-sans text-slate-400 text-[11px]">{p.projectName}</td>
                      <td className="p-3 text-right">${p.subtotalUSD.toLocaleString()}</td>
                      <td className="p-3 text-right text-slate-400">${p.gstUSD.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">${p.netAmountUSD.toLocaleString()}</td>
                      <td className="p-3 font-sans text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950 dark:text-blue-300">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: GRN Register */}
        {activeReportTab === 'GRNRegister' && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Goods Receipt Note (GRN) Inward Register</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">GRN Code</th>
                    <th className="p-3">PO Number</th>
                    <th className="p-3">Vendor</th>
                    <th className="p-3">Warehouse / Store</th>
                    <th className="p-3">Challan No</th>
                    <th className="p-3 text-center">Quality Status</th>
                    <th className="p-3 text-center">Stock Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {grns.map((g) => (
                    <tr key={g.id}>
                      <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{g.grnNumber}</td>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{g.poNumber}</td>
                      <td className="p-3 font-sans font-medium text-slate-900 dark:text-white">{g.vendorName}</td>
                      <td className="p-3 font-sans text-slate-400 text-[11px]">{g.warehouseName}</td>
                      <td className="p-3">{g.challanNo}</td>
                      <td className="p-3 font-sans text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                          {g.qualityStatus}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-center text-emerald-600 dark:text-emerald-400 font-bold">Updated ✓</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: BOQ Progress */}
        {activeReportTab === 'BOQProgress' && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">BOQ Physical Execution & Valuation Register</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Item Code</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">BOQ Qty</th>
                    <th className="p-3 text-right">Rate ($)</th>
                    <th className="p-3 text-right">Contract Amount ($)</th>
                    <th className="p-3 text-right text-emerald-600">Executed Valuation ($)</th>
                    <th className="p-3 text-right">Progress %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {boqItems.map((b) => (
                    <tr key={b.id}>
                      <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{b.itemCode}</td>
                      <td className="p-3 font-sans font-medium text-slate-900 dark:text-white">{b.description}</td>
                      <td className="p-3 text-right">{b.boqQuantity.toLocaleString()} {b.unit}</td>
                      <td className="p-3 text-right">${b.unitRateUSD.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold">${b.totalAmountUSD.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">${b.executedAmountUSD.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold">{b.progressPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Tender Status */}
        {activeReportTab === 'TenderStatus' && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Tender Bidding & Award Status Register</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Tender Code</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Issuing Authority</th>
                    <th className="p-3 text-right">Estimated Value ($)</th>
                    <th className="p-3 text-right">Quoted Bid ($)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {tenders.map((t) => (
                    <tr key={t.id}>
                      <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{t.tenderNumber}</td>
                      <td className="p-3 font-sans font-medium text-slate-900 dark:text-white">{t.title}</td>
                      <td className="p-3 font-sans text-slate-400 text-[11px]">{t.authorityName}</td>
                      <td className="p-3 text-right font-bold">${t.estimatedValueUSD.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-blue-600">${t.quotedAmountUSD?.toLocaleString() || '-'}</td>
                      <td className="p-3 font-sans text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: Budget vs Actual */}
        {activeReportTab === 'BudgetVsActual' && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Budget vs Actual Cost Control Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Project ID</th>
                    <th className="p-3 text-right">Approved Budget ($)</th>
                    <th className="p-3 text-right">Material POs ($)</th>
                    <th className="p-3 text-right">Subcontracts ($)</th>
                    <th className="p-3 text-right">Labour & Fleet ($)</th>
                    <th className="p-3 text-right text-blue-600">Total Spend ($)</th>
                    <th className="p-3 text-right text-emerald-600">Cost Variance ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {costControls.map((c) => (
                    <tr key={c.id}>
                      <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{c.projectId}</td>
                      <td className="p-3 text-right font-bold">${c.approvedBudgetUSD.toLocaleString()}</td>
                      <td className="p-3 text-right">${c.materialPurchaseCostUSD.toLocaleString()}</td>
                      <td className="p-3 text-right">${c.subcontractCostUSD.toLocaleString()}</td>
                      <td className="p-3 text-right">${(c.labourCostUSD + c.fleetEquipmentCostUSD).toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">${c.totalCommittedAndActualUSD.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">+${c.costVarianceUSD.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
