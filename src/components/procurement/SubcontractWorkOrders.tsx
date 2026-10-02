import React, { useState } from 'react';
import { SubcontractWorkOrder, WorkOrderCategory, WOExecutionStatus } from '../../types/procurement';
import { Project } from '../../types';
import { 
  Wrench, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Paperclip, 
  TrendingUp, 
  Award, 
  AlertCircle,
  X
} from 'lucide-react';

interface SubcontractWorkOrdersProps {
  workOrders: SubcontractWorkOrder[];
  projects: Project[];
  onCreateWO: (wo: Partial<SubcontractWorkOrder>) => void;
  onAddVariationOrder: (woId: string, variation: any) => void;
}

export const SubcontractWorkOrdersView: React.FC<SubcontractWorkOrdersProps> = ({
  workOrders,
  projects,
  onCreateWO,
  onAddVariationOrder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWoForVariation, setSelectedWoForVariation] = useState<SubcontractWorkOrder | null>(null);

  // Form state for creating Work Order
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkOrderCategory>('Mechanical Work Order');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [contractorName, setContractorName] = useState('Vanguard Civil Subcontractors');
  const [contractValue, setContractValue] = useState(185000);
  const [startDate, setStartDate] = useState('2026-06-01');
  const [targetCompletionDate, setTargetCompletionDate] = useState('2026-09-30');
  const [scopeOfWork, setScopeOfWork] = useState('Complete fabrication, alignment, and erection of structural steel girders.');

  // Form state for variation
  const [voTitle, setVoTitle] = useState('');
  const [voDesc, setVoDesc] = useState('');
  const [voAmount, setVoAmount] = useState(10000);

  const categories: WorkOrderCategory[] = [
    'Mechanical Work Order',
    'Civil Work Order',
    'Electrical Work Order',
    'Subcontract Work Order',
    'Client Work Order'
  ];

  const filteredWos = workOrders.filter((w) => {
    const matchesSearch = 
      w.woNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || w.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSubmitWO = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === projectId);
    if (!title || !proj) return;

    onCreateWO({
      title,
      category,
      projectId: proj.id,
      projectName: proj.name,
      contractorName,
      contractorCode: 'VND-2026-005',
      startDate,
      targetCompletionDate,
      contractValueUSD: Number(contractValue),
      revisedValueUSD: Number(contractValue),
      executedValueUSD: 0,
      status: 'Under Execution',
      scopeOfWork
    });

    setIsModalOpen(false);
  };

  const handleAddVo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWoForVariation || !voTitle) return;

    onAddVariationOrder(selectedWoForVariation.id, {
      title: voTitle,
      description: voDesc,
      amountChangeUSD: Number(voAmount)
    });

    setSelectedWoForVariation(null);
    setVoTitle('');
    setVoDesc('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            <span>Subcontract & Work Order (WO) Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mechanical, Civil, Electrical & Client Subcontract work orders, scope variations & completion certificates
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Work Order</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search WO number, title, contractor, project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Work Order Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {filteredWos.map((wo) => (
          <div
            key={wo.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {wo.woNumber}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {wo.category}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                  {wo.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Subcontractor: <strong className="text-slate-700 dark:text-slate-300">{wo.contractorName}</strong> | Project: <strong className="text-slate-700 dark:text-slate-300">{wo.projectName}</strong>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Contract Value</span>
                  <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
                    ${wo.revisedValueUSD.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedWoForVariation(wo)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition border border-slate-200 dark:border-slate-700"
                >
                  + Add Variation Order
                </button>
              </div>
            </div>

            {/* Scope of Work */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Scope of Work:</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{wo.scopeOfWork}</p>
            </div>

            {/* Variations List */}
            {wo.variations.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Approved Scope Variations ({wo.variations.length}):</span>
                <div className="space-y-1">
                  {wo.variations.map((v) => (
                    <div key={v.id} className="flex justify-between items-center bg-amber-50/50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800 text-[11px]">
                      <span><strong className="font-mono text-amber-600 dark:text-amber-400">{v.variationCode}:</strong> {v.title}</span>
                      <strong className="font-mono text-emerald-600 dark:text-emerald-400">+${v.amountChangeUSD.toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completion Certificate Badge */}
            {wo.completionCertificate && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Completion Certificate Issued: {wo.completionCertificate.certificateNo}</span>
                </div>
                <span className="font-mono font-bold text-emerald-600">Certified: ${wo.completionCertificate.certifiedValueUSD.toLocaleString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Issue Work Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <span>Issue Subcontract Work Order</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWO} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Work Order Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Steel Structure Fabrication & Weld NDT"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WorkOrderCategory)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Subcontractor Name</label>
                  <input
                    type="text"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Contract Value ($)</label>
                  <input
                    type="number"
                    value={contractValue}
                    onChange={(e) => setContractValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Scope of Work</label>
                <textarea
                  rows={3}
                  value={scopeOfWork}
                  onChange={(e) => setScopeOfWork(e.target.value)}
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
                  Issue Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Variation Modal */}
      {selectedWoForVariation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Add Variation Order to {selectedWoForVariation.woNumber}
            </h3>
            <form onSubmit={handleAddVo} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Variation Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Additional Ultrasonic Testing"
                  value={voTitle}
                  onChange={(e) => setVoTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Variation Amount Impact ($)</label>
                <input
                  type="number"
                  required
                  value={voAmount}
                  onChange={(e) => setVoAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono font-bold"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedWoForVariation(null)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg shadow-md"
                >
                  Approve Variation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
