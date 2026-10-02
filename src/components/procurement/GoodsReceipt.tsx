import React, { useState } from 'react';
import { GoodsReceiptNote, PurchaseOrder } from '../../types/procurement';
import { 
  Boxes, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  PackageCheck, 
  Warehouse, 
  Building2, 
  RefreshCw,
  X,
  FileSpreadsheet
} from 'lucide-react';

interface GoodsReceiptProps {
  grns: GoodsReceiptNote[];
  purchaseOrders: PurchaseOrder[];
  onCreateGRN: (grn: Partial<GoodsReceiptNote>) => void;
}

export const GoodsReceiptView: React.FC<GoodsReceiptProps> = ({
  grns,
  purchaseOrders,
  onCreateGRN
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [selectedPoId, setSelectedPoId] = useState(purchaseOrders[0]?.id || '');
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [warehouseName, setWarehouseName] = useState('Central Mechanical Store Bay 1');
  const [challanNo, setChallanNo] = useState('LSS-DC-9922');
  const [inspectedByName, setInspectedByName] = useState('Vikram Singh (Site Incharge)');
  const [qualityStatus, setQualityStatus] = useState<'Passed' | 'Passed with Partial Rejection' | 'Failed Quality Audit'>('Passed');
  const [acceptedQty, setAcceptedQty] = useState(45);
  const [rejectedQty, setRejectedQty] = useState(0);
  const [overReceiptError, setOverReceiptError] = useState('');

  const currentPo = purchaseOrders.find(p => p.id === selectedPoId) || purchaseOrders[0];
  const currentItem = currentPo?.items[selectedItemIndex] || currentPo?.items[0];
  const currentOrderedQty = currentItem?.quantity || 0;
  const currentPrevAccepted = currentItem?.acceptedQuantity || 0;
  const currentRemaining = Math.max(0, currentOrderedQty - currentPrevAccepted);

  const filteredGrns = grns.filter((g) => 
    g.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.warehouseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const po = purchaseOrders.find((p) => p.id === selectedPoId);
    if (!po) return;

    const item = po.items[selectedItemIndex] || po.items[0];
    if (!item) return;

    const remaining = Math.max(0, item.quantity - (item.acceptedQuantity || 0));
    if (Number(acceptedQty) > remaining) {
      setOverReceiptError(`Cannot accept ${acceptedQty} units. Maximum remaining balance for this item is ${remaining} units.`);
      return;
    }

    setOverReceiptError('');

    onCreateGRN({
      poId: po.id,
      poNumber: po.poNumber,
      vendorId: po.vendorId,
      vendorName: po.vendorName,
      projectId: po.projectId,
      projectName: po.projectName,
      warehouseName,
      challanNo,
      challanDate: new Date().toISOString().split('T')[0],
      inspectedByName,
      qualityStatus,
      stockUpdated: true,
      remarks: 'Physical inspection completed at site store.',
      items: [
        {
          id: `grni_${Date.now()}`,
          poItemId: item.id || 'poi_1',
          itemCode: item.itemCode || 'INV-STL-001',
          description: item.description || 'Steel Plates',
          unit: item.unit || 'MT',
          poQty: item.quantity || 45,
          receivedQty: Number(acceptedQty) + Number(rejectedQty),
          acceptedQty: Number(acceptedQty),
          rejectedQty: Number(rejectedQty),
          returnedQty: Number(rejectedQty),
          remarks: 'Inspected and verified against PO item balance.'
        }
      ]
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <PackageCheck className="w-6 h-6 text-blue-600" />
            <span>Goods Receipt Note (GRN) & Store Inward Entry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Site store gate inspection, quality acceptance/rejection logging & automated store inventory stock increment
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Goods Receipt (GRN)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search GRN number, PO, supplier, warehouse..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* GRN List */}
      <div className="space-y-4">
        {filteredGrns.map((grn) => (
          <div
            key={grn.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {grn.grnNumber}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Linked PO: {grn.poNumber}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                  {grn.vendorName}
                </h3>
                <p className="text-xs text-slate-500">
                  Store Entry: <strong className="text-slate-700 dark:text-slate-300">{grn.warehouseName}</strong> ({grn.projectName})
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full font-bold flex items-center space-x-1 border border-emerald-300 dark:border-emerald-800">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Stock Updated</span>
                </span>

                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                  grn.qualityStatus === 'Passed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {grn.qualityStatus}
                </span>
              </div>
            </div>

            {/* Inward Items Quality Audit Table */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Quality Inspection & Qty Acceptance Audit:</h4>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Item Code & Spec</th>
                      <th className="p-2.5 text-center">Unit</th>
                      <th className="p-2.5 text-right">PO Order Qty</th>
                      <th className="p-2.5 text-right">Received Qty</th>
                      <th className="p-2.5 text-right text-emerald-600 dark:text-emerald-400">Accepted Qty</th>
                      <th className="p-2.5 text-right text-rose-600 dark:text-rose-400">Rejected Qty</th>
                      <th className="p-2.5">Quality Audit Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {grn.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2.5 font-bold text-blue-600 dark:text-blue-400">
                          {item.itemCode}
                          <span className="font-sans font-medium text-slate-700 dark:text-slate-300 block text-[11px]">{item.description}</span>
                        </td>
                        <td className="p-2.5 text-center">{item.unit}</td>
                        <td className="p-2.5 text-right">{item.poQty}</td>
                        <td className="p-2.5 text-right font-bold">{item.receivedQty}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30">
                          {item.acceptedQty}
                        </td>
                        <td className="p-2.5 text-right font-bold text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30">
                          {item.rejectedQty}
                        </td>
                        <td className="p-2.5 font-sans text-slate-400 text-[11px]">{item.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <p>Delivery Delivery Challan: <strong className="font-mono text-slate-700 dark:text-slate-300">{grn.challanNo}</strong></p>
              <p>Inspected by: <strong className="text-blue-400">{grn.inspectedByName}</strong></p>
            </div>
          </div>
        ))}
      </div>

      {/* Record GRN Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <PackageCheck className="w-5 h-5 text-blue-400" />
                <span>Record Goods Receipt Note (GRN) Inward Entry</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Linked Purchase Order (PO) *</label>
                <select
                  value={selectedPoId}
                  onChange={(e) => {
                    setSelectedPoId(e.target.value);
                    setSelectedItemIndex(0);
                    setOverReceiptError('');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                >
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.poNumber} - {po.vendorName} (${po.netAmountUSD.toLocaleString()}) [{po.status}]
                    </option>
                  ))}
                </select>
              </div>

              {currentPo && currentPo.items && currentPo.items.length > 0 && (
                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2">
                  <label className="block text-blue-700 dark:text-blue-300 font-semibold">Select PO Line Item to Receive *</label>
                  <select
                    value={selectedItemIndex}
                    onChange={(e) => {
                      setSelectedItemIndex(Number(e.target.value));
                      setOverReceiptError('');
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-lg font-mono text-xs"
                  >
                    {currentPo.items.map((it, idx) => {
                      const bal = it.balanceQuantity ?? Math.max(0, it.quantity - (it.acceptedQuantity || 0));
                      return (
                        <option key={it.id || idx} value={idx}>
                          {it.itemCode} - {it.description} (Ordered: {it.quantity} {it.unit}, Remaining: {bal} {it.unit})
                        </option>
                      );
                    })}
                  </select>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600 dark:text-slate-400">
                    <span>Ordered: <strong className="font-mono">{currentOrderedQty}</strong></span>
                    <span>Prev Accepted: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{currentPrevAccepted}</strong></span>
                    <span>Remaining Balance: <strong className="font-mono text-amber-600 dark:text-amber-400">{currentRemaining}</strong></span>
                  </div>
                </div>
              )}

              {overReceiptError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{overReceiptError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Warehouse / Store</label>
                  <input
                    type="text"
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Delivery Challan / DC No.</label>
                  <input
                    type="text"
                    value={challanNo}
                    onChange={(e) => setChallanNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Quality Inspector Name</label>
                  <input
                    type="text"
                    value={inspectedByName}
                    onChange={(e) => setInspectedByName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Quality Audit Status</label>
                  <select
                    value={qualityStatus}
                    onChange={(e) => setQualityStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  >
                    <option value="Passed">Passed</option>
                    <option value="Passed with Partial Rejection">Passed with Partial Rejection</option>
                    <option value="Failed Quality Audit">Failed Quality Audit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-200 dark:border-slate-800 pt-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Accepted Quantity</label>
                  <input
                    type="number"
                    value={acceptedQty}
                    onChange={(e) => setAcceptedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-bold text-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Rejected Quantity</label>
                  <input
                    type="number"
                    value={rejectedQty}
                    onChange={(e) => setRejectedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-bold text-rose-600 font-mono"
                  />
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
                  Post GRN & Update Inventory Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
