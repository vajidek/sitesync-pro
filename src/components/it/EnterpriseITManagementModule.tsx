import React, { useState, useEffect } from 'react';
import { safeFetchJson } from '../../lib/safeFetch';
import {
  Cpu,
  Laptop,
  Server,
  Network,
  ShieldCheck,
  Key,
  LifeBuoy,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  ChevronRight,
  TrendingUp,
  HardDrive,
  Monitor,
  Smartphone,
  Calendar,
  DollarSign,
  Send,
  MessageSquare,
  Lock,
  Unlock,
  Check,
  Tag
} from 'lucide-react';
import { DSPageHeader, DSButton, DSTabs, DSCard, DSSearchBox } from '../ui/design-system';

export const EnterpriseITManagementModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'assets' | 'licenses' | 'tickets' | 'access'
  >('overview');

  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isNewAccessModalOpen, setIsNewAccessModalOpen] = useState(false);
  const [selectedTicketForResolve, setSelectedTicketForResolve] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Form states
  const [newAsset, setNewAsset] = useState({
    assetName: '',
    category: 'LAPTOP',
    brand: 'Lenovo',
    model: 'ThinkPad T14s',
    serialNumber: '',
    assignedToEmployeeName: 'Abdul Vajid EK',
    department: 'Engineering',
    location: 'Corporate HQ',
    purchaseCost: 1400,
    warrantyExpiryDate: '2029-01-01',
    status: 'ALLOCATED',
    cpu: 'Intel Core i7-1365U',
    ram: '16GB',
    storage: '512GB SSD',
  });

  const [newTicket, setNewTicket] = useState({
    title: '',
    category: 'HARDWARE_FAILURE',
    priority: 'MEDIUM',
    requesterName: 'Abdul Vajid EK',
    requesterEmail: 'vajidek1@gmail.com',
    department: 'Executive Operations',
    description: '',
  });

  const [newAccess, setNewAccess] = useState({
    requestType: 'ROLE_ELEVATION',
    targetSystem: 'ERP_FINANCE',
    requestedRole: 'COMMERCIAL_MANAGER',
    requesterName: 'Rajesh Nair',
    beneficiaryEmployeeName: 'Rajesh Nair',
    businessJustification: 'Authorization required for certifying subcontractor payments and rate analysis',
    durationDays: 365,
  });

  const fetchITData = async () => {
    setLoading(true);
    try {
      const [aRes, lRes, tRes, acRes] = await Promise.all([
        safeFetchJson('/api/it/assets'),
        safeFetchJson('/api/it/licenses'),
        safeFetchJson('/api/it/tickets'),
        safeFetchJson('/api/it/access-requests'),
      ]);

      if (aRes?.success && Array.isArray(aRes.data)) setAssets(aRes.data);
      if (lRes?.success && Array.isArray(lRes.data)) setLicenses(lRes.data);
      if (tRes?.success && Array.isArray(tRes.data)) setTickets(tRes.data);
      if (acRes?.success && Array.isArray(acRes.data)) setAccessRequests(acRes.data);
    } catch (err) {
      console.error('Error fetching IT management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchITData();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await safeFetchJson('/api/it/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAsset,
          specifications: {
            cpu: newAsset.cpu,
            ram: newAsset.ram,
            storage: newAsset.storage,
          },
        }),
      });
      if (res?.success) {
        setIsNewAssetModalOpen(false);
        setNewAsset({
          assetName: '',
          category: 'LAPTOP',
          brand: 'Lenovo',
          model: 'ThinkPad T14s',
          serialNumber: '',
          assignedToEmployeeName: 'Abdul Vajid EK',
          department: 'Engineering',
          location: 'Corporate HQ',
          purchaseCost: 1400,
          warrantyExpiryDate: '2029-01-01',
          status: 'ALLOCATED',
          cpu: 'Intel Core i7-1365U',
          ram: '16GB',
          storage: '512GB SSD',
        });
        fetchITData();
      }
    } catch (err) {
      console.error('Error creating IT asset:', err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await safeFetchJson('/api/it/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });
      if (res?.success) {
        setIsNewTicketModalOpen(false);
        setNewTicket({
          title: '',
          category: 'HARDWARE_FAILURE',
          priority: 'MEDIUM',
          requesterName: 'Abdul Vajid EK',
          requesterEmail: 'vajidek1@gmail.com',
          department: 'Executive Operations',
          description: '',
        });
        fetchITData();
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
    }
  };

  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForResolve) return;
    try {
      await safeFetchJson(`/api/it/tickets/${selectedTicketForResolve.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'RESOLVED',
          resolutionNotes,
          technicianName: 'Kiran Patel (Network Specialist)',
        }),
      });
      setSelectedTicketForResolve(null);
      setResolutionNotes('');
      fetchITData();
    } catch (err) {
      console.error('Error resolving ticket:', err);
    }
  };

  const handleCreateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await safeFetchJson('/api/it/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccess),
      });
      if (res?.success) {
        setIsNewAccessModalOpen(false);
        fetchITData();
      }
    } catch (err) {
      console.error('Error creating access request:', err);
    }
  };

  const handleUpdateAccessStatus = async (id: string, status: string) => {
    try {
      await safeFetchJson(`/api/it/access-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          actorName: 'Abdul Vajid EK (Security Officer)',
        }),
      });
      fetchITData();
    } catch (err) {
      console.error('Error updating access status:', err);
    }
  };

  // KPIs
  const openTicketsCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const criticalTicketsCount = tickets.filter((t) => t.priority === 'CRITICAL' && t.status !== 'RESOLVED').length;
  const totalHardwareCost = assets.reduce((sum, a) => sum + (Number(a.purchaseCost) || 0), 0);
  const pendingAccessCount = accessRequests.filter((a) => a.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <DSPageHeader
        title="IT & Digital Asset Management (ITAM / ITSM)"
        description="Enterprise hardware lifecycle, software license governance, IT service desk ticketing with SLAs, and digital access provisioning"
        breadcrumbs={[{ label: 'ERP' }, { label: 'Governance' }, { label: 'IT Services' }]}
        actions={
          <div className="flex items-center gap-2">
            <DSButton variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5 text-blue-600" />} onClick={fetchITData}>
              Refresh
            </DSButton>
            {activeSubTab === 'assets' && (
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewAssetModalOpen(true)}>
                Register Hardware Asset
              </DSButton>
            )}
            {activeSubTab === 'tickets' && (
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewTicketModalOpen(true)}>
                Create IT Support Ticket
              </DSButton>
            )}
            {activeSubTab === 'access' && (
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewAccessModalOpen(true)}>
                Request System Access
              </DSButton>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <DSTabs
        activeTab={activeSubTab}
        onChange={(id) => setActiveSubTab(id as any)}
        tabs={[
          { id: 'overview', label: 'IT Command & KPIs', icon: <Cpu className="w-4 h-4" /> },
          { id: 'assets', label: `Hardware Asset Inventory (${assets.length})`, icon: <Laptop className="w-4 h-4 text-indigo-500" /> },
          { id: 'licenses', label: `Software & SaaS Licenses (${licenses.length})`, icon: <Key className="w-4 h-4 text-emerald-500" /> },
          { id: 'tickets', label: `IT Helpdesk Tickets (${openTicketsCount} Active)`, icon: <LifeBuoy className="w-4 h-4 text-rose-500" /> },
          { id: 'access', label: `Access & Identity Governance (${pendingAccessCount} Pending)`, icon: <ShieldCheck className="w-4 h-4 text-amber-500" /> },
        ]}
      />

      {/* 1. OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DSCard className="p-4 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Total IT Hardware</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{assets.length} Devices</h3>
                  <p className="text-xs text-gray-500 mt-1">${totalHardwareCost.toLocaleString()} CapEx Value</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Laptop className="w-5 h-5" />
                </div>
              </div>
            </DSCard>

            <DSCard className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Enterprise Licenses</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{licenses.length} Suites</h3>
                  <p className="text-xs text-gray-500 mt-1">100% Compliant across CAD & ERP</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Key className="w-5 h-5" />
                </div>
              </div>
            </DSCard>

            <DSCard className="p-4 bg-gradient-to-br from-rose-50 to-white border-rose-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">Active IT Tickets</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{openTicketsCount}</h3>
                  <p className="text-xs text-gray-500 mt-1">{criticalTicketsCount} critical SLA tickets</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                  <LifeBuoy className="w-5 h-5" />
                </div>
              </div>
            </DSCard>

            <DSCard className="p-4 bg-gradient-to-br from-amber-50 to-white border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Access Approvals</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{pendingAccessCount}</h3>
                  <p className="text-xs text-gray-500 mt-1">Pending identity elevation</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </DSCard>
          </div>

          {/* Quick Monitoring Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Urgent Support Tickets */}
            <DSCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-rose-600" />
                  Urgent & Open Service Desk Incidents
                </h4>
                <DSButton variant="ghost" size="sm" onClick={() => setActiveSubTab('tickets')}>
                  All Tickets &rarr;
                </DSButton>
              </div>
              <div className="space-y-3">
                {tickets.slice(0, 3).map((tkt) => (
                  <div key={tkt.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{tkt.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          tkt.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                          tkt.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-800'
                        }`}>
                          {tkt.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {tkt.ticketNumber} &bull; {tkt.requesterName} &bull; SLA: {tkt.slaHours}h
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      tkt.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tkt.status}
                    </span>
                  </div>
                ))}
              </div>
            </DSCard>

            {/* Enterprise Software Seat Utilization */}
            <DSCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-600" />
                  Software Licenses & Seat Utilization
                </h4>
                <DSButton variant="ghost" size="sm" onClick={() => setActiveSubTab('licenses')}>
                  View Licenses &rarr;
                </DSButton>
              </div>
              <div className="space-y-4">
                {licenses.map((lic) => {
                  const pct = Math.round((lic.allocatedSeats / lic.totalSeats) * 100);
                  return (
                    <div key={lic.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-900">{lic.softwareName}</span>
                        <span className="font-medium text-gray-600">{lic.allocatedSeats} / {lic.totalSeats} seats ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </DSCard>
          </div>
        </div>
      )}

      {/* 2. HARDWARE ASSET INVENTORY */}
      {activeSubTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="w-full sm:w-80">
              <DSSearchBox
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tag, model, serial, employee..."
              />
            </div>
            <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewAssetModalOpen(true)}>
              Register Hardware Asset
            </DSButton>
          </div>

          <DSCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Asset Tag</th>
                    <th className="px-4 py-3">Device / Model</th>
                    <th className="px-4 py-3">Specifications</th>
                    <th className="px-4 py-3">Assigned Custodian</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Warranty</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assets
                    .filter((a) =>
                      a.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      a.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (a.assignedToEmployeeName && a.assignedToEmployeeName.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono font-medium text-gray-900">{asset.assetTag}</span>
                          <div className="text-[11px] text-gray-400 font-mono">SN: {asset.serialNumber}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{asset.assetName}</div>
                          <div className="text-xs text-gray-500">{asset.brand} &bull; {asset.category}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {asset.specifications ? (
                            <div>
                              <div>{asset.specifications.cpu || 'Multi-Core Processor'}</div>
                              <div className="text-gray-400">{asset.specifications.ram || '16GB'} &bull; {asset.specifications.storage || 'SSD'}</div>
                            </div>
                          ) : (
                            <span>Standard Build</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {asset.assignedToEmployeeName ? (
                            <div>
                              <div className="font-medium text-gray-900">{asset.assignedToEmployeeName}</div>
                              <div className="text-xs text-gray-500">{asset.department}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-600 font-medium">Unallocated in Store</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">{asset.location}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{asset.warrantyExpiryDate}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            asset.status === 'ALLOCATED' ? 'bg-emerald-100 text-emerald-800' :
                            asset.status === 'IN_STORE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {asset.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </DSCard>
        </div>
      )}

      {/* 3. SOFTWARE & SAAS LICENSES */}
      {activeSubTab === 'licenses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {licenses.map((lic) => {
              const pct = Math.round((lic.allocatedSeats / lic.totalSeats) * 100);
              return (
                <DSCard key={lic.id} className="p-5 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {lic.licenseCode}
                      </span>
                      <h4 className="font-bold text-gray-900 text-base mt-1.5">{lic.softwareName}</h4>
                      <p className="text-xs text-gray-500">{lic.publisher} &bull; {lic.category.replace(/_/g, ' ')}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-800">
                      {lic.complianceStatus}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 block">Total Seats</span>
                      <strong className="text-gray-900 text-sm">{lic.totalSeats}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Allocated Seats</span>
                      <strong className="text-indigo-600 text-sm">{lic.allocatedSeats}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Annual Investment</span>
                      <strong className="text-gray-900 text-sm">${lic.annualCost.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Seat Consumption</span>
                      <span>{pct}% utilized</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pct > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Renewal Date: <strong className="text-gray-700">{lic.renewalDate || 'Annual Continuous'}</strong></span>
                    <DSButton variant="outline" size="xs">
                      Manage Seats
                    </DSButton>
                  </div>
                </DSCard>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. IT HELPDESK TICKETS */}
      {activeSubTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-base">IT Service Desk & Incident Management</h4>
              <p className="text-xs text-gray-500">Service Level Agreement (SLA) response timers, priority escalation & technical resolutions</p>
            </div>
            <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewTicketModalOpen(true)}>
              Open New Ticket
            </DSButton>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket) => (
              <DSCard key={ticket.id} className="p-5 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-900">{ticket.ticketNumber}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      ticket.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                      ticket.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                      {ticket.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-500">Target SLA: <strong className="text-gray-800">{ticket.slaHours}h</strong></span>
                    <span className={`px-2.5 py-1 rounded-full font-medium ${
                      ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="font-bold text-gray-900 text-base">{ticket.title}</h4>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">{ticket.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
                  <div>
                    Requester: <strong className="text-gray-800">{ticket.requesterName}</strong> ({ticket.department}) &bull; Assigned: <strong className="text-gray-800">{ticket.assignedTechnicianName || 'Unassigned'}</strong>
                  </div>
                  <div>
                    {ticket.status !== 'RESOLVED' ? (
                      <DSButton
                        variant="primary"
                        size="xs"
                        onClick={() => {
                          setSelectedTicketForResolve(ticket);
                          setResolutionNotes('');
                        }}
                      >
                        Resolve & Close Ticket
                      </DSButton>
                    ) : (
                      <span className="text-emerald-600 font-medium">Resolved on {new Date(ticket.resolvedAt || ticket.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {ticket.resolutionNotes && (
                  <div className="mt-3 p-2.5 bg-emerald-50 rounded border border-emerald-100 text-xs text-emerald-800">
                    <strong>Resolution Summary:</strong> {ticket.resolutionNotes}
                  </div>
                )}
              </DSCard>
            ))}
          </div>
        </div>
      )}

      {/* 5. ACCESS & IDENTITY GOVERNANCE */}
      {activeSubTab === 'access' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-base">Digital Access & Role Elevation Requests</h4>
              <p className="text-xs text-gray-500">Zero-Trust privileged access workflow for ERP, SCADA and EDMS modules</p>
            </div>
            <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewAccessModalOpen(true)}>
              Request Privileged Access
            </DSButton>
          </div>

          <DSCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Request #</th>
                    <th className="px-4 py-3">Target System & Role</th>
                    <th className="px-4 py-3">Beneficiary</th>
                    <th className="px-4 py-3">Justification</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {accessRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-gray-900">{req.requestNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{req.targetSystem}</div>
                        <div className="text-xs text-indigo-600 font-semibold">{req.requestedRole}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{req.beneficiaryEmployeeName}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{req.businessJustification}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'PROVISIONED' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {req.status === 'PENDING_APPROVAL' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <DSButton variant="primary" size="xs" onClick={() => handleUpdateAccessStatus(req.id, 'APPROVED')}>
                              Authorize
                            </DSButton>
                            <DSButton variant="outline" size="xs" onClick={() => handleUpdateAccessStatus(req.id, 'REJECTED')}>
                              Deny
                            </DSButton>
                          </div>
                        ) : req.status === 'APPROVED' ? (
                          <DSButton variant="outline" size="xs" onClick={() => handleUpdateAccessStatus(req.id, 'PROVISIONED')}>
                            Provision in IAM
                          </DSButton>
                        ) : (
                          <span className="text-xs text-gray-400">Provisioned Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DSCard>
        </div>
      )}

      {/* --- MODAL 1: REGISTER ASSET --- */}
      {isNewAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Register IT Hardware Asset</h3>
              <button onClick={() => setIsNewAssetModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateAsset} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Asset Category *</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="LAPTOP">Laptop</option>
                    <option value="WORKSTATION">High-End Workstation</option>
                    <option value="SERVER">Rack Server</option>
                    <option value="NETWORK_SWITCH">Network Switch / Router</option>
                    <option value="PRINTER">Plotter / Office Printer</option>
                    <option value="MONITOR">Dual Monitor Display</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Brand & Manufacturer *</label>
                  <input
                    type="text"
                    required
                    value={newAsset.brand}
                    onChange={(e) => setNewAsset({ ...newAsset, brand: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Lenovo, Dell, Cisco"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Asset Name & Model *</label>
                <input
                  type="text"
                  required
                  value={newAsset.assetName}
                  onChange={(e) => setNewAsset({ ...newAsset, assetName: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. ThinkPad P16s Gen 2 AMD Workstation"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Serial Number *</label>
                  <input
                    type="text"
                    required
                    value={newAsset.serialNumber}
                    onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="PF-88912KL"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Cost (USD)</label>
                  <input
                    type="number"
                    value={newAsset.purchaseCost}
                    onChange={(e) => setNewAsset({ ...newAsset, purchaseCost: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Custodian</label>
                  <input
                    type="text"
                    value={newAsset.assignedToEmployeeName}
                    onChange={(e) => setNewAsset({ ...newAsset, assignedToEmployeeName: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newAsset.department}
                    onChange={(e) => setNewAsset({ ...newAsset, department: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setIsNewAssetModalOpen(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Save Asset Record
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: OPEN TICKET --- */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Open IT Support Incident</h3>
              <button onClick={() => setIsNewTicketModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Issue Summary *</label>
                <input
                  type="text"
                  required
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Site Office VPN tunnel intermittent disconnection"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="HARDWARE_FAILURE">Hardware Failure</option>
                    <option value="SOFTWARE_INSTALL">Software Provisioning</option>
                    <option value="NETWORK_CONNECTIVITY">Network & VPN</option>
                    <option value="EMAIL_COLLAB">Email & Collaboration</option>
                    <option value="ACCESS_PRIVILEGE">Access & Permissions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Urgency / Priority *</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="LOW">Low (SLA 48h)</option>
                    <option value="MEDIUM">Medium (SLA 24h)</option>
                    <option value="HIGH">High (SLA 8h)</option>
                    <option value="CRITICAL">Critical (SLA 4h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Technical Description *</label>
                <textarea
                  rows={4}
                  required
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Provide error codes, IP addresses, or reproducible steps..."
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setIsNewTicketModalOpen(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Submit Ticket
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: RESOLVE TICKET --- */}
      {selectedTicketForResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Resolve Ticket</h3>
                <p className="text-xs text-gray-500">{selectedTicketForResolve.ticketNumber} - {selectedTicketForResolve.title}</p>
              </div>
              <button onClick={() => setSelectedTicketForResolve(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleResolveTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Resolution Summary & Root Cause *</label>
                <textarea
                  rows={4}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Explain steps taken, patches deployed, or hardware replaced..."
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setSelectedTicketForResolve(null)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Mark as Resolved
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: REQUEST PRIVILEGED ACCESS --- */}
      {isNewAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Request System Privileges</h3>
              <button onClick={() => setIsNewAccessModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateAccess} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Platform *</label>
                  <select
                    value={newAccess.targetSystem}
                    onChange={(e) => setNewAccess({ ...newAccess, targetSystem: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ERP_FINANCE">ERP Financial General Ledger</option>
                    <option value="SCADA_IOT">SCADA Telemetry Controller</option>
                    <option value="EDMS_DOCUMENTS">EDMS Engineering Vault</option>
                    <option value="VPN_SECURE">Site Engineering VPN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Requested Role / Scope *</label>
                  <input
                    type="text"
                    required
                    value={newAccess.requestedRole}
                    onChange={(e) => setNewAccess({ ...newAccess, requestedRole: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. COMMERCIAL_MANAGER"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Beneficiary Employee Name *</label>
                <input
                  type="text"
                  required
                  value={newAccess.beneficiaryEmployeeName}
                  onChange={(e) => setNewAccess({ ...newAccess, beneficiaryEmployeeName: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Business Justification *</label>
                <textarea
                  rows={3}
                  required
                  value={newAccess.businessJustification}
                  onChange={(e) => setNewAccess({ ...newAccess, businessJustification: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Explain why this access elevation is necessary for project execution..."
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setIsNewAccessModalOpen(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Submit for Authorization
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
