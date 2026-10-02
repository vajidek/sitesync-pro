import React, { useState } from 'react';
import { PurchaseOrder, Vendor, POStatus } from '../../types/procurement';
import { Project } from '../../types';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Truck, 
  DollarSign, 
  X,
  Eye,
  FileText
} from 'lucide-react';

interface PurchaseOrderProps {
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
  projects: Project[];
  onCreatePO: (po: Partial<PurchaseOrder>) => void;
  onOpenPrintModal: (po: PurchaseOrder) => void;
}

export const PurchaseOrderView: React.FC<PurchaseOrderProps> = ({
  purchaseOrders,
  vendors,
  projects,
  onCreatePO,
  onOpenPrintModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [vendorId, setVendorId] = useState(vendors[0]?.id || '');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [siteAddress, setSiteAddress] = useState('Pier P14 Site Store, Thane');
  const [deliveryDueDate, setDeliveryDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days from GRN clearance');
  const [freightTerms, setFreightTerms] = useState('FOR Destination Site Store');
  const [itemCode, setItemCode] = useState('INV-STL-001');
  const [itemDesc, setItemDesc] = useState('IS 2062 Grade E250 Steel Plates 25mm');
  const [unit, setUnit] = useState('MT');
  const [quantity, setQuantity] = useState(45);
  const [unitPrice, setUnitPrice] = useState(910);
  const [gstPercent, setGstPercent] = useState(18);

  const filteredPos = purchaseOrders.filter((po) => {
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || po.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === vendorId);
    const proj = projects.find(p => p.id === projectId);
    if (!vendor || !proj) return;

    const subtotal = Number(quantity) * Number(unitPrice);
    const gstUSD = subtotal * (Number(gstPercent) / 100);
    const netAmount = subtotal + gstUSD;

    onCreatePO({
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorCode: vendor.vendorCode,
      vendorGstin: vendor.gstin,
      projectId: proj.id,
      projectName: proj.name,
      siteAddress,
      deliveryDueDate: deliveryDueDate || '2026-08-25',
      paymentTerms,
      freightTerms,
      subtotalUSD: subtotal,
      discountUSD: 0,
      gstUSD: gstUSD,
      freightUSD: 0,
      netAmountUSD: netAmount,
      status: 'Issued',
      approvalStatus: 'Approved',
      issuedByName: 'Abdul Vajid EK',
      approvedByName: 'Abdul Vajid EK',
      termsAndConditions: '1. Test certificates required.\n2. Inspection required prior to unloading.',
      items: [
        {
          id: `poi_${Date.now()}`,
          itemCode,
          description: itemDesc,
          unit,
          quantity: Number(quantity),
          unitPriceUSD: Number(unitPrice),
          gstPercent: Number(gstPercent),
          discountPercent: 0,
          totalAmountUSD: subtotal
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
            <FileCheck className="w-6 h-6 text-blue-600" />
            <span>Purchase Order (PO) Management System</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Binding legal procurement contracts, GST tax calculation, payment schedule & PDF print generation
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Purchase Order</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search PO number, supplier name, project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All PO Statuses</option>
            <option value="Issued">Issued (Awaiting Delivery)</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Completed">Completed & Full GRN</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* PO Cards List */}
      <div className="space-y-4">
        {filteredPos.map((po) => (
          <div
            key={po.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {po.poNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Date: {po.poDate}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                  {po.vendorName} <span className="text-xs text-slate-400 font-normal">({po.vendorCode})</span>
                </h3>
                <p className="text-xs text-slate-500">Project: <strong className="text-slate-700 dark:text-slate-300">{po.projectName}</strong></p>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                  po.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                    : po.status === 'Partially Received'
                    ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {po.status}
                </span>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Net Amount</span>
                  <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ${po.netAmountUSD.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => onOpenPrintModal(po)}
                  className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition border border-slate-200 dark:border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-500" />
                  <span>Print PO</span>
                </button>
              </div>
            </div>

            {/* PO Line Items Summary Table */}
            <div>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Item Code</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5 text-center">Unit</th>
                      <th className="p-2.5 text-right">Ordered Qty</th>
                      <th className="p-2.5 text-right text-blue-600 dark:text-blue-400">Received</th>
                      <th className="p-2.5 text-right text-emerald-600 dark:text-emerald-400">Accepted</th>
                      <th className="p-2.5 text-right text-amber-600 dark:text-amber-400">Balance</th>
                      <th className="p-2.5 text-right">Unit Rate ($)</th>
                      <th className="p-2.5 text-right">GST %</th>
                      <th className="p-2.5 text-right">Total ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {po.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2.5 font-bold text-blue-600 dark:text-blue-400">{item.itemCode}</td>
                        <td className="p-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">{item.description}</td>
                        <td className="p-2.5 text-center">{item.unit}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">{item.quantity}</td>
                        <td className="p-2.5 text-right font-bold text-blue-600 dark:text-blue-400">{item.receivedQuantity ?? 0}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">{item.acceptedQuantity ?? 0}</td>
                        <td className="p-2.5 text-right font-bold text-amber-600 dark:text-amber-400">
                          {item.balanceQuantity ?? Math.max(0, item.quantity - (item.acceptedQuantity || 0))}
                        </td>
                        <td className="p-2.5 text-right">${item.unitPriceUSD.toLocaleString()}</td>
                        <td className="p-2.5 text-right">{item.gstPercent}%</td>
                        <td className="p-2.5 text-right font-bold">${item.totalAmountUSD.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms & Delivery Schedule */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <p>Payment: <strong className="text-slate-700 dark:text-slate-300 font-normal">{po.paymentTerms}</strong> | Delivery Due: <strong className="text-slate-700 dark:text-slate-300 font-normal">{po.deliveryDueDate}</strong></p>
              <span className="font-mono text-[11px] text-slate-400">Issued by: {po.issuedByName}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Generate PO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <span>Generate Official Purchase Order</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Select Supplier / Vendor *</label>
                  <select
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name} ({v.vendorCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Project *</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Delivery Site Address</label>
                <input
                  type="text"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Delivery Due Date</label>
                  <input
                    type="date"
                    value={deliveryDueDate}
                    onChange={(e) => setDeliveryDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Line Item */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-3">
                <h4 className="font-bold text-slate-300">Purchase Line Item</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Item Code"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Item Description"
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-center"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-bold text-right"
                  />
                  <input
                    type="number"
                    placeholder="Unit Price ($)"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-bold text-right"
                  />
                  <input
                    type="number"
                    placeholder="GST %"
                    value={gstPercent}
                    onChange={(e) => setGstPercent(Number(e.target.value))}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-right"
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
                  Generate & Sign Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
