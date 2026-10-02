import React, { useState } from 'react';
import { Tender, TenderStatus } from '../../types/procurement';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Building2, 
  Calendar, 
  Award, 
  DollarSign, 
  ShieldCheck, 
  FileCheck2,
  X
} from 'lucide-react';

interface TenderManagementProps {
  tenders: Tender[];
  onCreateTender: (t: Partial<Tender>) => void;
  onUpdateTenderStatus: (id: string, status: TenderStatus, isAwarded?: boolean) => void;
}

export const TenderManagementView: React.FC<TenderManagementProps> = ({
  tenders,
  onCreateTender,
  onUpdateTenderStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [authorityName, setAuthorityName] = useState('National Highways Authority of India (NHAI)');
  const [category, setCategory] = useState<'Infrastructure' | 'EPC Contract' | 'Mechanical Erection' | 'Bridge Construction'>('Infrastructure');
  const [estimatedValue, setEstimatedValue] = useState(12000000);
  const [emdAmount, setEmdAmount] = useState(240000);
  const [emdInstrument, setEmdInstrument] = useState('Bank Guarantee (HDFC Bank)');
  const [submissionDueDate, setSubmissionDueDate] = useState('2026-09-15');
  const [eligibilityCriteria, setEligibilityCriteria] = useState('Minimum 5 years heavy bridge construction experience and $20M annual turnover.');

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch = 
      t.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.authorityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onCreateTender({
      title,
      authorityName,
      category,
      estimatedValueUSD: Number(estimatedValue),
      emdAmountUSD: Number(emdAmount),
      emdInstrument,
      submissionDueDate,
      eligibilityCriteria,
      technicalBidSubmitted: true,
      financialBidSubmitted: true,
      quotedAmountUSD: Number(estimatedValue) * 0.95,
      status: 'Bid Submitted'
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <span>Tender & Bidding Register</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Government & Private client tenders, EMD bank guarantee tracking, technical/financial bid submissions & contract awards
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Tender Opportunity</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search tender number, title, issuing authority..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tender Cards */}
      <div className="space-y-4">
        {filteredTenders.map((tender) => (
          <div
            key={tender.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {tender.tenderNumber}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {tender.category}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                  {tender.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Issuing Authority: <strong className="text-slate-700 dark:text-slate-300">{tender.authorityName}</strong>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated Tender Value</span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ${tender.estimatedValueUSD.toLocaleString()}
                  </span>
                </div>

                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${
                  tender.status === 'Awarded (L1)' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' :
                  tender.status === 'Under Evaluation' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300' :
                  'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {tender.status}
                </span>
              </div>
            </div>

            {/* EMD & Bid Submission Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Earnest Money Deposit (EMD):</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">${tender.emdAmountUSD.toLocaleString()}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Instrument: {tender.emdInstrument}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Our Submitted Bid Value:</span>
                <p className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {tender.quotedAmountUSD ? `$${tender.quotedAmountUSD.toLocaleString()}` : 'Pending Quote'}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">Due Date: {tender.submissionDueDate}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Technical Bid:</span>
                  <span className={`font-bold ${tender.technicalBidSubmitted ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {tender.technicalBidSubmitted ? 'Submitted ✓' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Financial Bid:</span>
                  <span className={`font-bold ${tender.financialBidSubmitted ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {tender.financialBidSubmitted ? 'Submitted ✓' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {tender.status !== 'Awarded (L1)' && (
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onUpdateTenderStatus(tender.id, 'Under Evaluation')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition"
                >
                  Mark Under Evaluation
                </button>
                <button
                  onClick={() => onUpdateTenderStatus(tender.id, 'Awarded (L1)', true)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-md flex items-center space-x-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Mark Tender Awarded (L1 Winner)</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Register Tender Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <span>Register Tender Opportunity</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tender Title / Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design and Construction of Flyover Bridge Work"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Client / Issuing Authority</label>
                  <input
                    type="text"
                    value={authorityName}
                    onChange={(e) => setAuthorityName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tender Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="EPC Contract">EPC Contract</option>
                    <option value="Mechanical Erection">Mechanical Erection</option>
                    <option value="Bridge Construction">Bridge Construction</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Estimated Tender Value ($)</label>
                  <input
                    type="number"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">EMD Deposit Amount ($)</label>
                  <input
                    type="number"
                    value={emdAmount}
                    onChange={(e) => setEmdAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">EMD Instrument</label>
                  <input
                    type="text"
                    value={emdInstrument}
                    onChange={(e) => setEmdInstrument(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Submission Due Date</label>
                  <input
                    type="date"
                    value={submissionDueDate}
                    onChange={(e) => setSubmissionDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
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
                  Register Tender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
