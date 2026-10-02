import React, { useState } from 'react';
import { VendorQuotation, RFQ, Vendor, PurchaseOrder } from '../../types/procurement';
import { 
  FileSpreadsheet, 
  Award, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  ArrowRight,
  Sparkles,
  FileCheck,
  Check,
  X
} from 'lucide-react';

interface QuotationManagementProps {
  quotations: VendorQuotation[];
  rfqs: RFQ[];
  vendors: Vendor[];
  onSubmitQuotation: (q: Partial<VendorQuotation>) => void;
  onGeneratePOFromQuotation: (q: VendorQuotation) => void;
}

export const QuotationManagement: React.FC<QuotationManagementProps> = ({
  quotations,
  rfqs,
  vendors,
  onSubmitQuotation,
  onGeneratePOFromQuotation
}) => {
  const [selectedRfqId, setSelectedRfqId] = useState<string>(rfqs[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Active RFQ quotations for comparison matrix
  const activeQuotationList = quotations.filter((q) => q.rfqId === selectedRfqId);
  const activeRfq = rfqs.find((r) => r.id === selectedRfqId);

  // Lowest net total calculation
  const lowestTotal = activeQuotationList.length > 0
    ? Math.min(...activeQuotationList.map((q) => q.netTotalUSD))
    : 0;

  // Form state
  const [formVendorId, setFormVendorId] = useState(vendors[0]?.id || '');
  const [subtotal, setSubtotal] = useState(60000);
  const [tax, setTax] = useState(10800);
  const [freight, setFreight] = useState(1500);
  const [leadTime, setLeadTime] = useState(10);
  const [warranty, setWarranty] = useState(12);
  const [techCompliance, setTechCompliance] = useState<'Compliant' | 'Deviated' | 'Non-Compliant'>('Compliant');
  const [commCompliance, setCommCompliance] = useState<'Fully Accepted' | 'Conditional' | 'Rejected'>('Fully Accepted');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find((v) => v.id === formVendorId);
    if (!vendor || !selectedRfqId) return;

    const net = Number(subtotal) + Number(tax) + Number(freight);

    onSubmitQuotation({
      rfqId: selectedRfqId,
      vendorId: vendor.id,
      vendorName: vendor.name,
      subtotalUSD: Number(subtotal),
      taxUSD: Number(tax),
      freightUSD: Number(freight),
      netTotalUSD: net,
      leadTimeDays: Number(leadTime),
      warrantyMonths: Number(warranty),
      deliverySchedule: `${leadTime} days from PO clearance`,
      technicalCompliance: techCompliance,
      technicalRemarks: 'Technical specifications verified',
      commercialCompliance: commCompliance,
      commercialRemarks: 'Standard credit period accepted',
      items: activeRfq?.items.map((it) => ({
        rfqItemId: it.id,
        itemCode: it.itemCode,
        description: it.description,
        unit: it.unit,
        quantity: it.quantity,
        unitRateUSD: it.estimatedUnitPriceUSD,
        gstPercent: 18,
        discountPercent: 0,
        totalAmountUSD: it.quantity * it.estimatedUnitPriceUSD
      })) || []
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>Vendor Quotation Evaluation & Comparison Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Side-by-side technical & commercial price comparison, L1/L2 bidder matrix, and direct PO award workflow
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Vendor Quotation</span>
        </button>
      </div>

      {/* RFQ Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-2">
          Select RFQ context:
        </span>
        {rfqs.map((rfq) => (
          <button
            key={rfq.id}
            onClick={() => setSelectedRfqId(rfq.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center space-x-2 ${
              selectedRfqId === rfq.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="font-mono">{rfq.rfqCode}</span>
            <span>- {rfq.title.slice(0, 30)}...</span>
          </button>
        ))}
      </div>

      {/* Comparison Matrix Table */}
      {activeRfq && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {activeRfq.rfqCode}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{activeRfq.title}</h3>
              <p className="text-xs text-slate-500">Project: {activeRfq.projectName}</p>
            </div>
            <div className="text-xs text-right">
              <span className="text-slate-400">Total Bids Received:</span>
              <strong className="block text-base font-bold text-slate-800 dark:text-slate-200">{activeQuotationList.length} Quotations</strong>
            </div>
          </div>

          {activeQuotationList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No quotations recorded yet for this RFQ. Click "Record Vendor Quotation" to enter submitted rates.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] border-y border-slate-200 dark:border-slate-800">
                    <th className="p-3 w-48">Evaluation Metrics</th>
                    {activeQuotationList.map((q) => (
                      <th
                        key={q.id}
                        className={`p-3 min-w-[220px] border-l border-slate-200 dark:border-slate-800 ${
                          q.netTotalUSD === lowestTotal ? 'bg-emerald-50/50 dark:bg-emerald-950/30' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-blue-600 dark:text-blue-400 text-[10px]">{q.quotationNo}</span>
                          {q.netTotalUSD === lowestTotal && (
                            <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1 uppercase tracking-wider">
                              <Sparkles className="w-3 h-3" />
                              <span>L1 Bidder</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">{q.vendorName}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  
                  {/* Financials Row */}
                  <tr>
                    <td className="p-3 font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-950/50">Subtotal ($)</td>
                    {activeQuotationList.map((q) => (
                      <td key={q.id} className="p-3 font-mono font-medium border-l border-slate-200 dark:border-slate-800">
                        ${q.subtotalUSD.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-950/50">GST & Freight ($)</td>
                    {activeQuotationList.map((q) => (
                      <td key={q.id} className="p-3 font-mono text-slate-400 border-l border-slate-200 dark:border-slate-800">
                        +${(q.taxUSD + q.freightUSD).toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-sm">
                    <td className="p-3 text-slate-900 dark:text-white">Net Total Amount ($)</td>
                    {activeQuotationList.map((q) => (
                      <td
                        key={q.id}
                        className={`p-3 font-mono border-l border-slate-200 dark:border-slate-800 ${
                          q.netTotalUSD === lowestTotal ? 'text-emerald-600 dark:text-emerald-400 text-base' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        ${q.netTotalUSD.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  {/* Operational Metrics */}
                  <tr>
                    <td className="p-3 font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-950/50">Lead Time (Days)</td>
                    {activeQuotationList.map((q) => (
                      <td key={q.id} className="p-3 font-bold border-l border-slate-200 dark:border-slate-800">
                        {q.leadTimeDays} Days
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-950/50">Warranty Period</td>
                    {activeQuotationList.map((q) => (
                      <td key={q.id} className="p-3 font-medium border-l border-slate-200 dark:border-slate-800">
                        {q.warrantyMonths} Months
                      </td>
                    ))}
                  </tr>

                  {/* Compliance Row */}
                  <tr>
                    <td className="p-3 font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-950/50">Technical Compliance</td>
                    {activeQuotationList.map((q) => (
                      <td key={q.id} className="p-3 border-l border-slate-200 dark:border-slate-800">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          q.technicalCompliance === 'Compliant' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {q.technicalCompliance}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-950/50">Commercial Terms</td>
                    {activeQuotationList.map((q) => (
                      <td key={q.id} className="p-3 border-l border-slate-200 dark:border-slate-800">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          q.commercialCompliance === 'Fully Accepted' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {q.commercialCompliance}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Award PO Action */}
                  <tr className="bg-slate-50/80 dark:bg-slate-950/80">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">Award Decision</td>
                    {activeQuotationList.map((q) => (
                      <td key={q.id} className="p-3 border-l border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => onGeneratePOFromQuotation(q)}
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow transition ${
                            q.netTotalUSD === lowestTotal
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                              : 'bg-blue-600 hover:bg-blue-500 text-white'
                          }`}
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Award PO to Supplier</span>
                        </button>
                      </td>
                    ))}
                  </tr>

                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Record Quotation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <span>Enter Received Vendor Quotation</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Bidding Vendor *</label>
                <select
                  value={formVendorId}
                  onChange={(e) => setFormVendorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.vendorCode})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Subtotal ($)</label>
                  <input
                    type="number"
                    value={subtotal}
                    onChange={(e) => setSubtotal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tax / GST ($)</label>
                  <input
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Freight ($)</label>
                  <input
                    type="number"
                    value={freight}
                    onChange={(e) => setFreight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={leadTime}
                    onChange={(e) => setLeadTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    value={warranty}
                    onChange={(e) => setWarranty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Technical Compliance</label>
                  <select
                    value={techCompliance}
                    onChange={(e) => setTechCompliance(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  >
                    <option value="Compliant">Compliant</option>
                    <option value="Deviated">Deviated</option>
                    <option value="Non-Compliant">Non-Compliant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Commercial Compliance</label>
                  <select
                    value={commCompliance}
                    onChange={(e) => setCommCompliance(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  >
                    <option value="Fully Accepted">Fully Accepted</option>
                    <option value="Conditional">Conditional</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md"
                >
                  Submit & Record Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
