import React from 'react';
import { PurchaseOrder } from '../../types/procurement';
import { X, Printer, Download, CheckCircle, Building2, ShieldCheck } from 'lucide-react';

interface PrintablePOModalProps {
  po: PurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintablePOModal: React.FC<PrintablePOModalProps> = ({ po, isOpen, onClose }) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !po) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-3">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">Purchase Order Print Preview</h3>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-emerald-500/30">
              {po.poNumber}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-xs sm:text-sm shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable PO Document Body */}
        <div className="p-8 sm:p-12 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 space-y-8 font-sans printable-area">
          
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-800 pb-6">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg">
                  S
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  SITESYNC <span className="text-blue-600">PRO</span> ENTERPRISE
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Construction Enterprise Management Platform
                <br />Corporate Office: Bandra Kurla Complex, Mumbai - 400051
              </p>
            </div>
            <div className="mt-4 sm:mt-0 text-right">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs rounded uppercase tracking-wider border border-blue-300 dark:border-blue-800 mb-2">
                PURCHASE ORDER
              </span>
              <p className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">{po.poNumber}</p>
              <p className="text-xs text-slate-400">Date: <strong className="text-slate-700 dark:text-slate-300">{po.poDate}</strong></p>
              <p className="text-xs text-slate-400">Delivery Due: <strong className="text-slate-700 dark:text-slate-300">{po.deliveryDueDate}</strong></p>
            </div>
          </div>

          {/* Vendor & Delivery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">Vendor Details (Supplier):</h4>
              <p className="font-bold text-sm text-blue-600 dark:text-blue-400">{po.vendorName}</p>
              <p className="text-slate-400 font-mono mt-0.5">Code: {po.vendorCode}</p>
              <p className="text-slate-400 font-mono">GSTIN: {po.vendorGstin}</p>
              <p className="mt-2 text-slate-300">Payment Terms: <strong>{po.paymentTerms}</strong></p>
            </div>
            <div>
              <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">Delivery & Project Site:</h4>
              <p className="font-bold text-slate-800 dark:text-slate-200">{po.projectName}</p>
              <p className="text-slate-400 mt-1">{po.siteAddress}</p>
              <p className="mt-2 text-slate-300">Freight Terms: <strong>{po.freightTerms}</strong></p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Line Items Specification:</h4>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Item Code & Description</th>
                    <th className="p-3 text-center">Unit</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Unit Rate ($)</th>
                    <th className="p-3 text-right">GST %</th>
                    <th className="p-3 text-right">Amount ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {po.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{item.itemCode}</span>
                        <p className="text-slate-300 font-medium mt-0.5">{item.description}</p>
                      </td>
                      <td className="p-3 text-center font-medium">{item.unit}</td>
                      <td className="p-3 text-right font-bold">{item.quantity}</td>
                      <td className="p-3 text-right font-mono">${item.unitPriceUSD.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono">{item.gstPercent}%</td>
                      <td className="p-3 text-right font-bold font-mono">${item.totalAmountUSD.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Totals Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-200 dark:border-slate-800 pt-6">
            <div className="max-w-md space-y-2 text-xs text-slate-400">
              <h5 className="font-bold text-slate-300 uppercase text-[10px]">Terms & Conditions:</h5>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-pre-line text-[11px] leading-relaxed">
                {po.termsAndConditions}
              </div>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">${po.subtotalUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Discount:</span>
                <span className="font-mono text-emerald-400">-${po.discountUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST Tax:</span>
                <span className="font-mono">${po.gstUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Freight & Handling:</span>
                <span className="font-mono">${po.freightUSD.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-300 dark:border-slate-800 pt-2 flex justify-between font-bold text-base text-slate-900 dark:text-white">
                <span>Net Payable:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">${po.netAmountUSD.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="grid grid-cols-2 gap-8 border-t border-slate-200 dark:border-slate-800 pt-12 text-center text-xs">
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 max-w-xs mx-auto mb-2 flex items-end justify-center font-serif italic text-slate-300">
                {po.issuedByName}
              </div>
              <p className="font-bold text-slate-300">Prepared & Issued By</p>
              <p className="text-[10px] text-slate-400">Procurement Officer</p>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 max-w-xs mx-auto mb-2 flex items-end justify-center font-serif italic text-blue-400">
                {po.approvedByName || 'Abdul Vajid EK'}
              </div>
              <p className="font-bold text-slate-300">Authorized Signatory</p>
              <p className="text-[10px] text-slate-400">Project Director / VP ERP</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
