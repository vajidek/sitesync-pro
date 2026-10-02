import React, { useState } from 'react';
import { PurchaseRequisition, PRStatus } from '../../types/procurement';
import { Project, InventoryItem } from '../../types';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Boxes, 
  Building2, 
  X,
  FileCheck,
  ShieldCheck,
  XCircle,
  TrendingUp
} from 'lucide-react';

interface PurchaseRequisitionProps {
  requisitions: PurchaseRequisition[];
  projects: Project[];
  inventoryItems: InventoryItem[];
  onCreatePR: (pr: Partial<PurchaseRequisition>) => void;
  onUpdatePRStatus: (id: string, status: PRStatus, verifiedBy?: string, approvedBy?: string) => void;
}

export const PurchaseRequisitionView: React.FC<PurchaseRequisitionProps> = ({
  requisitions,
  projects,
  inventoryItems,
  onCreatePR,
  onUpdatePRStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [siteName, setSiteName] = useState('Thane North Pier Site');
  const [urgency, setUrgency] = useState<'Normal' | 'Urgent' | 'Emergency'>('Urgent');
  const [requiredByDate, setRequiredByDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(inventoryItems[0]?.id || '');
  const [reqQty, setReqQty] = useState(10);

  const filteredPrs = requisitions.filter((pr) => {
    const matchesSearch = 
      pr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.requestedByName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || pr.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === projectId);
    const item = inventoryItems.find(i => i.id === selectedItemId);
    if (!proj || !item) return;

    onCreatePR({
      projectId: proj.id,
      projectName: proj.name,
      siteName,
      requestedByName: 'Abdul Vajid EK',
      department: 'Site Engineering & Stores',
      urgency,
      requiredByDate: requiredByDate || '2026-08-20',
      budgetAllocatedUSD: proj.budgetUSD,
      remarks,
      items: [
        {
          id: `pri_${Date.now()}`,
          itemCode: item.itemCode,
          description: item.name,
          unit: item.unit,
          requisitionQty: Number(reqQty),
          availableStockQty: item.quantityInStock,
          estimatedRateUSD: item.unitPriceUSD,
          totalEstimatedUSD: Number(reqQty) * item.unitPriceUSD,
          storeLocation: item.storeLocation
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
            <ClipboardList className="w-6 h-6 text-blue-600" />
            <span>Purchase Requisitions (PR) Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Store inventory cross-check, site material indent requests & 5-step enterprise approval workflow
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Purchase Requisition</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search PR number, project, requester..."
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
            <option value="ALL">All PR Workflow Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted (Pending Verification)</option>
            <option value="Verified">Verified (Pending PM Approval)</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Requisitions List */}
      <div className="space-y-4">
        {filteredPrs.map((pr) => (
          <div
            key={pr.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {pr.prNumber}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded border ${
                    pr.urgency === 'Emergency' ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300' :
                    pr.urgency === 'Urgent' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {pr.urgency} Urgency
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                  {pr.projectName} - {pr.siteName}
                </h3>
                <p className="text-xs text-slate-500">
                  Requested by: <strong className="text-slate-700 dark:text-slate-300">{pr.requestedByName}</strong> ({pr.department}) on {pr.createdDate}
                </p>
              </div>

              {/* Workflow Status Badge & Actions */}
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${
                  pr.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' :
                  pr.status === 'Verified' ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300' :
                  pr.status === 'Submitted' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300' :
                  'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {pr.status}
                </span>

                {/* Workflow actions */}
                {pr.status === 'Submitted' && (
                  <button
                    onClick={() => onUpdatePRStatus(pr.id, 'Verified', 'Robert Vance (PM)')}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition"
                  >
                    Verify Requisition
                  </button>
                )}
                {pr.status === 'Verified' && (
                  <button
                    onClick={() => onUpdatePRStatus(pr.id, 'Approved', pr.verifiedByName, 'Abdul Vajid EK (Director)')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition"
                  >
                    Approve PR
                  </button>
                )}
              </div>
            </div>

            {/* Store & Item Specs Table */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Requisitioned Store Line Items:</h4>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Item Code</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5 text-center">Unit</th>
                      <th className="p-2.5 text-right">Requested Qty</th>
                      <th className="p-2.5 text-right text-blue-600 dark:text-blue-400">Current Stock in Store</th>
                      <th className="p-2.5 text-right">Estimated Rate</th>
                      <th className="p-2.5 text-right">Total ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {pr.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2.5 font-bold text-blue-600 dark:text-blue-400">{item.itemCode}</td>
                        <td className="p-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">{item.description}</td>
                        <td className="p-2.5 text-center">{item.unit}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">{item.requisitionQty}</td>
                        <td className="p-2.5 text-right font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30">
                          {item.availableStockQty} {item.unit}
                        </td>
                        <td className="p-2.5 text-right">${item.estimatedRateUSD.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-bold">${item.totalEstimatedUSD.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verification Sign-offs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <p>Remarks: <strong className="text-slate-700 dark:text-slate-300 font-normal">{pr.remarks}</strong></p>
              <div className="flex items-center space-x-4 mt-1 sm:mt-0 font-mono text-[11px]">
                {pr.verifiedByName && <span>Verified: <strong className="text-blue-400">{pr.verifiedByName}</strong></span>}
                {pr.approvedByName && <span>Approved: <strong className="text-emerald-400">{pr.approvedByName}</strong></span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Raise PR Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-blue-400" />
                <span>Raise Purchase Requisition (PR)</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Project *</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Delivery Site Location</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Urgency Level</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              {/* Select Item from Store */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-3">
                <h4 className="font-bold text-slate-300">Select Store Material Item</h4>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Store Inventory Item *</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  >
                    {inventoryItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.itemCode} - {item.name} (Stock: {item.quantityInStock} {item.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Required Quantity *</label>
                  <input
                    type="number"
                    required
                    value={reqQty}
                    onChange={(e) => setReqQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Justification & Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Explain why this material is required..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                />
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
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
