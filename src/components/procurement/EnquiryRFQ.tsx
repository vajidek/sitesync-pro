import React, { useState } from 'react';
import { RFQ, Vendor } from '../../types/procurement';
import { Project } from '../../types';
import { 
  FileCheck2, 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  Paperclip, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Send, 
  X,
  FileText
} from 'lucide-react';

interface EnquiryRFQProps {
  rfqs: RFQ[];
  vendors: Vendor[];
  projects: Project[];
  onCreateRFQ: (rfq: Partial<RFQ>) => void;
}

export const EnquiryRFQ: React.FC<EnquiryRFQProps> = ({
  rfqs,
  vendors,
  projects,
  onCreateRFQ
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for creating RFQ
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [items, setItems] = useState([
    { itemCode: 'INV-STL-001', description: 'IS 2062 Grade E250 Steel Plates 25mm', unit: 'MT', quantity: 10, estimatedUnitPriceUSD: 950 }
  ]);

  const filteredRfqs = rfqs.filter(r => 
    r.rfqCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleVendor = (vendorId: string) => {
    if (selectedVendorIds.includes(vendorId)) {
      setSelectedVendorIds(selectedVendorIds.filter(id => id !== vendorId));
    } else {
      setSelectedVendorIds([...selectedVendorIds, vendorId]);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { itemCode: '', description: '', unit: 'Pcs', quantity: 1, estimatedUnitPriceUSD: 100 }]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId || !dueDate || selectedVendorIds.length === 0) return;

    const proj = projects.find(p => p.id === projectId);
    const selectedVendorNames = vendors
      .filter(v => selectedVendorIds.includes(v.id))
      .map(v => v.name);

    onCreateRFQ({
      title,
      projectId,
      projectName: proj?.name || 'General Project',
      dueDate,
      invitedVendorIds: selectedVendorIds,
      invitedVendorNames: selectedVendorNames,
      items: items.map((it, idx) => ({ ...it, id: `rfqi_${idx}` })),
      createdByName: 'Abdul Vajid EK',
      attachments: ['Technical_Specifications.pdf']
    });

    setIsModalOpen(false);
    setTitle('');
    setSelectedVendorIds([]);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileCheck2 className="w-6 h-6 text-blue-600" />
            <span>Enquiry & RFQ (Request For Quotations) Module</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast technical specifications & item requirements to multiple approved vendors simultaneously
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create & Issue New RFQ</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search RFQ code, title or project name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* RFQ List */}
      <div className="space-y-4">
        {filteredRfqs.map((rfq) => (
          <div
            key={rfq.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {rfq.rfqCode}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Issued: {rfq.createdDate}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                  {rfq.title}
                </h3>
                <p className="text-xs text-slate-500">Project: <strong className="text-slate-700 dark:text-slate-300">{rfq.projectName}</strong></p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-500 flex items-center space-x-1 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Due: {rfq.dueDate}</span>
                </span>

                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${
                  rfq.status === 'Under Evaluation' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300' :
                  rfq.status === 'Awarded' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' :
                  'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {rfq.status}
                </span>
              </div>
            </div>

            {/* Invited Vendors & Items Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Invited Vendors ({rfq.invitedVendorNames.length}):</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {rfq.invitedVendorNames.map((vName, idx) => (
                    <span key={idx} className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-medium">
                      {vName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Items Requested ({rfq.items.length}):</span>
                <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  {rfq.items.map((it) => (
                    <li key={it.id} className="flex justify-between font-mono">
                      <span>{it.itemCode} - {it.description}</span>
                      <strong className="text-slate-800 dark:text-slate-200">{it.quantity} {it.unit}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create RFQ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-blue-400" />
                <span>Create & Broadcast Request for Quotation (RFQ)</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">RFQ Title / Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. High-Tensile Structural Steel Plates Procurement"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Linked Project *</label>
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

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Quotation Submission Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Vendor Selection */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Vendors to Invite *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-800">
                  {vendors.map((v) => (
                    <label
                      key={v.id}
                      className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer border transition ${
                        selectedVendorIds.includes(v.id)
                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-400 text-blue-700 dark:text-blue-300 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedVendorIds.includes(v.id)}
                        onChange={() => toggleVendor(v.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate">{v.name} ({v.category})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-300">Requested Items & Specifications</h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-300 dark:border-slate-800">
                    <input
                      type="text"
                      placeholder="Item Code"
                      value={it.itemCode}
                      onChange={(e) => handleItemChange(idx, 'itemCode', e.target.value)}
                      className="col-span-3 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Description & Spec"
                      value={it.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="col-span-4 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={it.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="col-span-2 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded text-center"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      className="col-span-3 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded font-bold text-right"
                    />
                  </div>
                ))}
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Broadcast RFQ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
