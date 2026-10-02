import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Clock, FilePlus2, RefreshCw, X } from 'lucide-react';

type ContractClaimsWorkspaceProps = {
  contracts: Array<{ id: string; contractNumber: string; title: string; projectId?: string; projectName?: string; currency?: string }>;
};

type Claim = {
  id: string;
  claimNumber: string;
  contractId: string;
  projectId?: string | null;
  title: string;
  description: string;
  claimType: string;
  claimedAmount: number;
  approvedAmount: number;
  claimedDays: number;
  approvedDays: number;
  status: string;
  clientReference?: string | null;
  changeEventReference?: string | null;
  noticeDate?: string | null;
  eventDate?: string | null;
  createdBy: string;
  approvedBy?: string | null;
};

const tokenKey = 'sitesync_access_token';

export const ContractClaimsWorkspace: React.FC<ContractClaimsWorkspaceProps> = ({ contracts }) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    contractId: '',
    claimType: 'TIME_AND_COST',
    title: '',
    description: '',
    claimedAmount: '',
    claimedDays: '0',
    eventDate: '',
    noticeDate: '',
    clientReference: '',
    changeEventReference: '',
  });

  const currency = useMemo(() => {
    const contract = contracts.find((c) => c.id === (form.contractId || selectedContractId));
    return contract?.currency || '';
  }, [contracts, form.contractId, selectedContractId]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(tokenKey);
      const params = selectedContractId ? `?contractId=${encodeURIComponent(selectedContractId)}` : '';
      const res = await fetch(`/api/contracts-engine/contracts/claims${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.message || 'Failed to load claims.');
      setClaims(payload.data || []);
    } catch {
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClaims(); }, [selectedContractId]);

  const createClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem(tokenKey);
    const res = await fetch('/api/contracts-engine/contracts/claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        contractId: form.contractId,
        claimType: form.claimType,
        title: form.title.trim(),
        description: form.description.trim(),
        claimedAmount: Number(form.claimedAmount || 0),
        claimedDays: Number(form.claimedDays || 0),
        eventDate: form.eventDate || undefined,
        noticeDate: form.noticeDate || undefined,
        clientReference: form.clientReference || undefined,
        changeEventReference: form.changeEventReference || undefined,
      }),
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload?.message || 'Claim creation failed.');
    }
    setIsCreateOpen(false);
    setForm({
      contractId: '',
      claimType: 'TIME_AND_COST',
      title: '',
      description: '',
      claimedAmount: '',
      claimedDays: '0',
      eventDate: '',
      noticeDate: '',
      clientReference: '',
      changeEventReference: '',
    });
    await fetchClaims();
  };

  const updateStatus = async (claimId: string, status: string) => {
    const token = localStorage.getItem(tokenKey);
    const res = await fetch(`/api/contracts-engine/contracts/claims/${claimId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status }),
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) throw new Error(payload?.message || 'Claim status update failed.');
    await fetchClaims();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Contract Claims Register
          </h2>
          <p className="text-xs text-slate-500 mt-1">Commercial claims linked to contract and project context. Approvals remain server-controlled.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <option value="">All contracts</option>
            {contracts.map((contract) => <option key={contract.id} value={contract.id}>{contract.contractNumber} — {contract.title}</option>)}
          </select>
          <button onClick={fetchClaims} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700" title="Refresh claims">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold"
          >
            <FilePlus2 className="w-4 h-4" /> New Claim
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Claim</th>
              <th className="px-5 py-3">Contract / Project</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Claimed</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Workflow</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Loading claims…</td></tr>
            ) : claims.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No claims recorded for the selected scope.</td></tr>
            ) : claims.map((claim) => {
              const contract = contracts.find((c) => c.id === claim.contractId);
              return (
                <tr key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{claim.claimNumber}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{claim.title}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs font-medium">{contract?.contractNumber || claim.contractId}</div>
                    <div className="text-xs text-slate-500">{claim.projectId ? (contract?.projectName || claim.projectId) : 'Project not mapped'}</div>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold">{claim.claimType.replaceAll('_', ' ')}</td>
                  <td className="px-5 py-4">
                    <div className="font-semibold">{currency || contract?.currency || ''} {Number(claim.claimedAmount || 0).toLocaleString()}</div>
                    <div className="text-xs text-slate-500">{claim.claimedDays} day(s)</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-semibold">
                      <Clock className="w-3 h-3" /> {claim.status.replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {claim.status === 'DRAFT' && (
                      <button onClick={() => updateStatus(claim.id, 'SUBMITTED')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">
                        Submit
                      </button>
                    )}
                    {claim.status === 'SUBMITTED' && (
                      <button onClick={() => updateStatus(claim.id, 'UNDER_REVIEW')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold">
                        Review
                      </button>
                    )}
                    {claim.status === 'UNDER_REVIEW' && (
                      <span className="text-xs text-slate-400">Approval requires reviewer/approver separation</span>
                    )}
                    {claim.status === 'APPROVED' && (
                      <button onClick={() => updateStatus(claim.id, 'SETTLED')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold">
                        <Check className="w-3 h-3" /> Settle
                      </button>
                    )}
                    {claim.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-500"><X className="w-3 h-3" /> Rejected</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={(e) => { createClaim(e).catch((err) => window.alert(err.message)); }} className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Contract Claim</h3>
                <p className="text-xs text-slate-500 mt-1">Enter the actual commercial event. No default amount or date is inserted.</p>
              </div>
              <button type="button" onClick={() => setIsCreateOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select required value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} className="px-3 py-2 rounded-lg border dark:bg-slate-900">
                <option value="">Select contract *</option>
                {contracts.map((contract) => <option key={contract.id} value={contract.id}>{contract.contractNumber} — {contract.title}</option>)}
              </select>
              <select value={form.claimType} onChange={(e) => setForm({ ...form, claimType: e.target.value })} className="px-3 py-2 rounded-lg border dark:bg-slate-900">
                <option value="TIME_AND_COST">Time & Cost</option>
                <option value="DELAY">Delay</option>
                <option value="DISRUPTION">Disruption</option>
                <option value="COST">Cost</option>
                <option value="TIME">Time</option>
                <option value="OTHER">Other</option>
              </select>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Claim title *" className="md:col-span-2 px-3 py-2 rounded-lg border dark:bg-slate-900" />
              <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the event, impact and contractual basis *" rows={4} className="md:col-span-2 px-3 py-2 rounded-lg border dark:bg-slate-900" />
              <input type="number" min="0" step="0.01" value={form.claimedAmount} onChange={(e) => setForm({ ...form, claimedAmount: e.target.value })} placeholder={`Claimed amount (${currency || 'currency'})`} className="px-3 py-2 rounded-lg border dark:bg-slate-900" />
              <input type="number" min="0" value={form.claimedDays} onChange={(e) => setForm({ ...form, claimedDays: e.target.value })} placeholder="Claimed days" className="px-3 py-2 rounded-lg border dark:bg-slate-900" />
              <input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="px-3 py-2 rounded-lg border dark:bg-slate-900" />
              <input type="date" value={form.noticeDate} onChange={(e) => setForm({ ...form, noticeDate: e.target.value })} className="px-3 py-2 rounded-lg border dark:bg-slate-900" />
              <input value={form.changeEventReference} onChange={(e) => setForm({ ...form, changeEventReference: e.target.value })} placeholder="Change event reference" className="px-3 py-2 rounded-lg border dark:bg-slate-900" />
              <input value={form.clientReference} onChange={(e) => setForm({ ...form, clientReference: e.target.value })} placeholder="Client reference / notice no." className="px-3 py-2 rounded-lg border dark:bg-slate-900" />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold">Create Claim</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
