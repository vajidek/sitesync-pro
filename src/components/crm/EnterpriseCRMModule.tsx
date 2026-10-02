import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  TrendingUp,
  LifeBuoy,
  AlertTriangle,
  Star,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Send,
  UserCheck,
  ShieldCheck,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpRight,
  Briefcase,
  HelpCircle
} from 'lucide-react';
import {
  DSButton,
  DSCard,
  DSPageHeader,
  DSBadge,
  DSModal,
  DSProgressBar,
  DSSearchBox
} from '../ui/design-system';

interface Customer {
  id: string;
  code: string;
  companyName: string;
  tradingName?: string;
  industry: string;
  customerType: string;
  tier: string;
  status: string;
  taxRegistrationNo?: string;
  creditLimit: number;
  healthScore: number;
  csatScore: number;
  accountManager: string;
}

interface Lead {
  id: string;
  leadNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  source: string;
  estimatedValue: number;
  status: string;
  assignedTo: string;
}

interface Opportunity {
  id: string;
  oppNumber: string;
  title: string;
  estimatedValue: number;
  probabilityPercent: number;
  stage: string;
  expectedClosingDate: string;
  ownerName: string;
}

interface SupportTicket {
  id: string;
  ticketNo: string;
  customerName: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: string;
  slaHours: number;
  slaBreached?: boolean;
}

interface Complaint {
  id: string;
  complaintNo: string;
  customerName: string;
  category: string;
  severity: string;
  subject: string;
  status: string;
  assignedTo: string;
}

export const EnterpriseCRMModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'directory' | 'pipeline' | 'tickets' | 'complaints' | 'meetings' | 'feedback' | 'portal'>('overview');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample State
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 'cust-dewa-001',
      code: 'CUST-2026-001',
      companyName: 'Dubai Electricity & Water Authority (DEWA)',
      industry: 'UTILITIES_INFRASTRUCTURE',
      customerType: 'GOVERNMENT',
      tier: 'PLATINUM',
      status: 'ACTIVE',
      creditLimit: 50000000,
      healthScore: 98,
      csatScore: 4.9,
      accountManager: 'Eng. Rashid Al-Maktoum',
    },
    {
      id: 'cust-nakheel-002',
      code: 'CUST-2026-002',
      companyName: 'Nakheel Properties PJSC',
      industry: 'REAL_ESTATE_DEVELOPMENT',
      customerType: 'PRIVATE_DEVELOPER',
      tier: 'STRATEGIC',
      status: 'ACTIVE',
      creditLimit: 25000000,
      healthScore: 92,
      csatScore: 4.7,
      accountManager: 'Sarah Jenkins',
    },
    {
      id: 'cust-emaar-003',
      code: 'CUST-2026-003',
      companyName: 'Emaar Properties PJSC',
      industry: 'REAL_ESTATE_DEVELOPMENT',
      customerType: 'PRIVATE_DEVELOPER',
      tier: 'PLATINUM',
      status: 'ACTIVE',
      creditLimit: 40000000,
      healthScore: 95,
      csatScore: 4.85,
      accountManager: 'Tariq Mansoor',
    },
  ]);

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 'lead-101',
      leadNumber: 'LEAD-2026-101',
      companyName: 'Sharjah Urban Planning Authority',
      contactName: 'Eng. Khalid Al-Qasimi',
      email: 'khalid@suka.gov.ae',
      phone: '+971-6-512-8800',
      source: 'TENDER_PORTAL',
      estimatedValue: 18500000,
      status: 'QUALIFIED',
      assignedTo: 'Business Development Director',
    },
    {
      id: 'lead-102',
      leadNumber: 'LEAD-2026-102',
      companyName: 'Ras Al Khaimah Investment Authority',
      contactName: 'David Miller',
      email: 'dmiller@rakia.ae',
      phone: '+971-7-204-1100',
      source: 'EXPO',
      estimatedValue: 12000000,
      status: 'NEW',
      assignedTo: 'BD Manager Infrastructure',
    },
  ]);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: 'opp-501',
      oppNumber: 'OPP-2026-501',
      title: 'Dubai South Water Main Trunk Line Expansion',
      estimatedValue: 34500000,
      probabilityPercent: 85,
      stage: 'COMMERCIAL_BID',
      expectedClosingDate: '2026-09-30',
      ownerName: 'Executive Account Lead',
    },
    {
      id: 'opp-502',
      oppNumber: 'OPP-2026-502',
      title: 'Palm Jebel Ali Seawater Intake Pumping Station',
      estimatedValue: 28000000,
      probabilityPercent: 70,
      stage: 'TECHNICAL_PROPOSAL',
      expectedClosingDate: '2026-10-15',
      ownerName: 'Sarah Jenkins',
    },
  ]);

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'tck-901',
      ticketNo: 'TCK-2026-901',
      customerName: 'Dubai Electricity & Water Authority (DEWA)',
      subject: 'Request for Expedited Approval of Valve Pit Submittal (Submittal #DEWA-SUB-044)',
      category: 'DRAWING_APPROVAL',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      assignedTo: 'Engineering Technical Lead',
      slaHours: 12,
      slaBreached: false,
    },
    {
      id: 'tck-902',
      ticketNo: 'TCK-2026-902',
      customerName: 'Nakheel Properties PJSC',
      subject: 'Monthly Payment Application Clarification - IPC #08',
      category: 'BILLING_INQUIRY',
      priority: 'NORMAL',
      status: 'OPEN',
      assignedTo: 'Finance & Accounts Specialist',
      slaHours: 24,
      slaBreached: false,
    },
  ]);

  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: 'cmp-801',
      complaintNo: 'CMP-2026-801',
      customerName: 'Nakheel Properties PJSC',
      category: 'SCHEDULE',
      severity: 'MEDIUM',
      subject: 'Minor delay in trench compaction report submission for Sector 4',
      status: 'UNDER_INVESTIGATION',
      assignedTo: 'QA/QC Manager',
    },
  ]);

  // Form State
  const [newCustForm, setNewCustForm] = useState({
    code: `CUST-2026-${(customers.length + 1).toString().padStart(3, '0')}`,
    companyName: '',
    industry: 'CONSTRUCTION',
    customerType: 'GOVERNMENT',
    tier: 'STRATEGIC',
    creditLimit: 5000000,
    accountManager: 'Executive Account Lead',
  });

  const [newTicketForm, setNewTicketForm] = useState({
    ticketNo: `TCK-2026-${(tickets.length + 901).toString()}`,
    customerName: 'Dubai Electricity & Water Authority (DEWA)',
    subject: '',
    category: 'BILLING_INQUIRY',
    priority: 'NORMAL',
    assignedTo: 'Customer Support Lead',
  });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustForm.companyName) return;
    const created: Customer = {
      id: `cust-${Date.now()}`,
      code: newCustForm.code,
      companyName: newCustForm.companyName,
      industry: newCustForm.industry,
      customerType: newCustForm.customerType,
      tier: newCustForm.tier,
      status: 'ACTIVE',
      creditLimit: Number(newCustForm.creditLimit),
      healthScore: 90,
      csatScore: 4.8,
      accountManager: newCustForm.accountManager,
    };
    setCustomers([created, ...customers]);
    setIsNewCustomerModalOpen(false);
  };

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.subject) return;
    const created: SupportTicket = {
      id: `tck-${Date.now()}`,
      ticketNo: newTicketForm.ticketNo,
      customerName: newTicketForm.customerName,
      subject: newTicketForm.subject,
      category: newTicketForm.category,
      priority: newTicketForm.priority,
      status: 'OPEN',
      assignedTo: newTicketForm.assignedTo,
      slaHours: 24,
    };
    setTickets([created, ...tickets]);
    setIsNewTicketModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <DSPageHeader
        title="Enterprise CRM & Client Portal"
        description="Key account management, sales pipeline, complaint handling & client self-service portal"
        actions={
          <div className="flex items-center gap-3">
            <DSButton
              variant={activeTab === 'portal' ? 'primary' : 'outline'}
              size="sm"
              icon={<ExternalLink className="w-4 h-4" />}
              onClick={() => setActiveTab('portal')}
            >
              Client Portal
            </DSButton>
            <DSButton
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsNewCustomerModalOpen(true)}
            >
              New Key Account
            </DSButton>
          </div>
        }
      />

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-700 overflow-x-auto gap-2 text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-400" />
          Executive CRM Dashboard
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'directory'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-blue-400" />
          Customer Directory ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'pipeline'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Lead & Sales Pipeline
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'tickets'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LifeBuoy className="w-4 h-4 text-amber-400" />
          Support Tickets ({tickets.length})
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'complaints'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          Complaints ({complaints.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'feedback'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star className="w-4 h-4 text-yellow-400" />
          Feedback & CSAT
        </button>
        <button
          onClick={() => setActiveTab('portal')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'portal'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Client Portal View
        </button>
      </div>

      {/* 1. EXECUTIVE CRM DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DSCard className="p-4 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Strategic Accounts</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">{customers.length}</p>
                  <span className="text-xs text-emerald-400 font-medium">100% Active Government / Private</span>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
            </DSCard>

            <DSCard className="p-4 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pipeline Value</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">AED 93.0M</p>
                  <span className="text-xs text-slate-400 font-medium">Leads & Active Tenders</span>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </DSCard>

            <DSCard className="p-4 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Open Support Tickets</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">{tickets.length}</p>
                  <span className="text-xs text-amber-300/80 font-medium">0 SLA Breaches</span>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                  <LifeBuoy className="w-6 h-6" />
                </div>
              </div>
            </DSCard>

            <DSCard className="p-4 border-l-4 border-cyan-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Avg CSAT Score</p>
                  <p className="text-2xl font-bold text-cyan-300 mt-1">4.82 / 5.0</p>
                  <span className="text-xs text-emerald-400 font-medium">+0.15 vs last quarter</span>
                </div>
                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                  <Star className="w-6 h-6" />
                </div>
              </div>
            </DSCard>
          </div>

          {/* Customer Health Overview & Top Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Health Overview */}
            <DSCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  Key Account Health Index
                </h3>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full">Automated Scoring</span>
              </div>
              <div className="space-y-4">
                {customers.map((c) => (
                  <div key={c.id} className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-semibold text-slate-200">{c.companyName}</span>
                        <p className="text-xs text-slate-400">Manager: {c.accountManager}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-400">{c.healthScore}/100</span>
                        <p className="text-xs text-slate-400">CSAT: {c.csatScore} ⭐</p>
                      </div>
                    </div>
                    <DSProgressBar value={c.healthScore} max={100} color={c.healthScore > 90 ? 'emerald' : 'amber'} size="sm" />
                  </div>
                ))}
              </div>
            </DSCard>

            {/* Top Active Opportunities */}
            <DSCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                  High-Probability Opportunities
                </h3>
                <DSButton size="xs" variant="outline" onClick={() => setActiveTab('pipeline')}>
                  View Pipeline
                </DSButton>
              </div>
              <div className="space-y-3">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-indigo-400 font-medium">{opp.oppNumber}</span>
                        <DSBadge variant="info">{opp.stage}</DSBadge>
                      </div>
                      <p className="text-sm font-medium text-slate-200 mt-1">{opp.title}</p>
                      <p className="text-xs text-slate-400">Closing: {opp.expectedClosingDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">AED {(opp.estimatedValue / 1000000).toFixed(1)}M</p>
                      <span className="text-xs text-indigo-300 font-medium">{opp.probabilityPercent}% Probability</span>
                    </div>
                  </div>
                ))}
              </div>
            </DSCard>
          </div>
        </div>
      )}

      {/* 2. CUSTOMER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <DSSearchBox placeholder="Search customer name, code or industry..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <DSButton variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsNewCustomerModalOpen(true)}>
              Add Customer
            </DSButton>
          </div>

          <DSCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Customer Company</th>
                    <th className="px-4 py-3">Industry / Type</th>
                    <th className="px-4 py-3">Tier</th>
                    <th className="px-4 py-3">Credit Limit</th>
                    <th className="px-4 py-3">Health / CSAT</th>
                    <th className="px-4 py-3">Account Manager</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {customers
                    .filter((c) => c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-indigo-400">{c.code}</td>
                        <td className="px-4 py-3 font-semibold text-slate-100">{c.companyName}</td>
                        <td className="px-4 py-3 text-slate-400">
                          {c.industry} <br />
                          <span className="text-xs text-slate-500">{c.customerType}</span>
                        </td>
                        <td className="px-4 py-3">
                          <DSBadge variant={c.tier === 'PLATINUM' ? 'primary' : 'success'}>{c.tier}</DSBadge>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-200">AED {(c.creditLimit / 1000000).toFixed(1)}M</td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-semibold text-emerald-400">{c.healthScore}/100 Health</div>
                          <div className="text-xs text-slate-400">{c.csatScore} ⭐ CSAT</div>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{c.accountManager}</td>
                        <td className="px-4 py-3 text-right">
                          <DSButton size="xs" variant="outline" icon={<Eye className="w-3.5 h-3.5" />}>
                            Details
                          </DSButton>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </DSCard>
        </div>
      )}

      {/* 3. LEAD & SALES PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Active Tenders & Commercial Bids Pipeline
            </h3>
            <DSButton variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsNewLeadModalOpen(true)}>
              New Lead
            </DSButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leads Column */}
            <DSCard className="p-4 border-t-4 border-indigo-500">
              <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
                <span>Qualified Leads & Enquiries</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">{leads.length} Active</span>
              </h4>
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-indigo-400">{lead.leadNumber}</span>
                      <DSBadge variant="info">{lead.status}</DSBadge>
                    </div>
                    <p className="text-sm font-semibold text-slate-100">{lead.companyName}</p>
                    <p className="text-xs text-slate-400">Contact: {lead.contactName} ({lead.email})</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                      <span className="text-xs text-slate-400">Est. Value: <strong className="text-emerald-400">AED {(lead.estimatedValue / 1000000).toFixed(1)}M</strong></span>
                      <DSButton size="xs" variant="outline" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                        Convert to Opp
                      </DSButton>
                    </div>
                  </div>
                ))}
              </div>
            </DSCard>

            {/* Opportunities Column */}
            <DSCard className="p-4 border-t-4 border-emerald-500">
              <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
                <span>Active Bids & Commercial Deals</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">{opportunities.length} Active</span>
              </h4>
              <div className="space-y-3">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-emerald-400">{opp.oppNumber}</span>
                      <DSBadge variant="success">{opp.stage}</DSBadge>
                    </div>
                    <p className="text-sm font-semibold text-slate-100">{opp.title}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Owner: {opp.ownerName}</span>
                      <span>Closing: {opp.expectedClosingDate}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                      <span className="text-xs text-slate-300">Probability: <strong className="text-indigo-400">{opp.probabilityPercent}%</strong></span>
                      <span className="text-sm font-bold text-emerald-400">AED {(opp.estimatedValue / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                ))}
              </div>
            </DSCard>
          </div>
        </div>
      )}

      {/* 4. SUPPORT TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-amber-400" />
              Customer Support & Technical Inquiry Register
            </h3>
            <DSButton variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsNewTicketModalOpen(true)}>
              Raise Ticket
            </DSButton>
          </div>

          <DSCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Ticket No</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Subject / Query</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Assigned Agent</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-amber-400">{t.ticketNo}</td>
                      <td className="px-4 py-3 font-semibold text-slate-100">{t.customerName}</td>
                      <td className="px-4 py-3 text-slate-200 max-w-md truncate">{t.subject}</td>
                      <td className="px-4 py-3 text-slate-400">{t.category}</td>
                      <td className="px-4 py-3">
                        <DSBadge variant={t.priority === 'URGENT' ? 'danger' : 'warning'}>{t.priority}</DSBadge>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{t.assignedTo}</td>
                      <td className="px-4 py-3">
                        <DSBadge variant={t.status === 'OPEN' ? 'warning' : 'primary'}>{t.status}</DSBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DSCard>
        </div>
      )}

      {/* 5. COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Customer Complaints & Resolution Tracking
            </h3>
          </div>

          <DSCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Complaint No</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Issue Description</th>
                    <th className="px-4 py-3">Assigned To</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-rose-400">{c.complaintNo}</td>
                      <td className="px-4 py-3 font-semibold text-slate-100">{c.customerName}</td>
                      <td className="px-4 py-3 text-slate-400">{c.category}</td>
                      <td className="px-4 py-3">
                        <DSBadge variant="danger">{c.severity}</DSBadge>
                      </td>
                      <td className="px-4 py-3 text-slate-200">{c.subject}</td>
                      <td className="px-4 py-3 text-slate-300">{c.assignedTo}</td>
                      <td className="px-4 py-3">
                        <DSBadge variant="warning">{c.status}</DSBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DSCard>
        </div>
      )}

      {/* 6. FEEDBACK & CSAT */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DSCard className="p-5 text-center border-t-4 border-yellow-400">
              <p className="text-xs text-slate-400 uppercase font-medium">Net Promoter Score (NPS)</p>
              <p className="text-3xl font-extrabold text-yellow-400 mt-2">+74</p>
              <p className="text-xs text-emerald-400 mt-1">Excellent (World-class)</p>
            </DSCard>
            <DSCard className="p-5 text-center border-t-4 border-cyan-400">
              <p className="text-xs text-slate-400 uppercase font-medium">CSAT Average Rating</p>
              <p className="text-3xl font-extrabold text-cyan-300 mt-2">4.88 / 5.0</p>
              <p className="text-xs text-slate-400 mt-1">Based on 32 reviews</p>
            </DSCard>
            <DSCard className="p-5 text-center border-t-4 border-indigo-500">
              <p className="text-xs text-slate-400 uppercase font-medium">Customer Retention</p>
              <p className="text-3xl font-extrabold text-indigo-400 mt-2">98.5%</p>
              <p className="text-xs text-emerald-400 mt-1">Repeat contract awards</p>
            </DSCard>
          </div>

          <DSCard className="p-5">
            <h4 className="text-base font-semibold text-slate-100 mb-4">Recent Handover & Monthly Review Feedback</h4>
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-200">Dubai Electricity & Water Authority (DEWA)</span>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="font-bold text-slate-300 ml-2">5.0 / 5.0</span>
                  </div>
                </div>
                <p className="text-sm text-slate-300 italic">
                  "Exemplary project execution on the Jebel Ali Trunk Line. Outstanding QA/QC standards and safety compliance throughout construction."
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 pt-2 border-t border-slate-700/50">
                  <span>Category: Project Handover</span>
                  <span>NPS Rating: 10/10</span>
                  <span>Date: August 2026</span>
                </div>
              </div>
            </div>
          </DSCard>
        </div>
      )}

      {/* 7. CLIENT PORTAL VIEW */}
      {activeTab === 'portal' && (
        <div className="space-y-6 bg-slate-900/90 p-6 rounded-2xl border border-indigo-500/30">
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-900/60 to-slate-800/80 p-4 rounded-xl border border-indigo-500/40">
            <div>
              <span className="text-xs font-mono uppercase bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded">CLIENT SELF-SERVICE PORTAL</span>
              <h2 className="text-xl font-bold text-slate-100 mt-1">DEWA Executive Client Dashboard</h2>
              <p className="text-xs text-slate-400">Authenticated user: Eng. Sultan Al-Nuaimi (Dubai Electricity & Water Authority)</p>
            </div>
            <DSBadge variant="success">LIVE ERP SYNCED</DSBadge>
          </div>

          {/* Portal Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Progress */}
            <DSCard className="p-5 border-t-4 border-indigo-500">
              <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center justify-between">
                <span>Active Project Progress</span>
                <Clock className="w-4 h-4 text-indigo-400" />
              </h4>
              <p className="text-base font-bold text-slate-100">Jebel Ali Water Pipeline Distribution</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Physical Completion</span>
                  <span className="text-indigo-400 font-bold">78.5%</span>
                </div>
                <DSProgressBar value={78.5} max={100} color="indigo" size="md" />
              </div>
              <p className="text-xs text-emerald-400 mt-3 font-medium">Status: ON_TRACK (Zero Critical Schedule Variance)</p>
            </DSCard>

            {/* Invoices & Payments */}
            <DSCard className="p-5 border-t-4 border-emerald-500">
              <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center justify-between">
                <span>Invoices & Milestone Billing</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">IPC #07 (Paid)</span>
                  <span className="text-emerald-400 font-bold">AED 14.5M</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">IPC #08 (Under Review)</span>
                  <span className="text-amber-400 font-bold">AED 18.2M</span>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-700 text-right">
                <DSButton size="xs" variant="outline" icon={<Download className="w-3.5 h-3.5" />}>
                  Download IPC PDFs
                </DSButton>
              </div>
            </DSCard>

            {/* Inspections & Approvals */}
            <DSCard className="p-5 border-t-4 border-cyan-500">
              <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center justify-between">
                <span>Quality Inspections & Submittals</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-slate-800/80 rounded flex justify-between items-center">
                  <span className="text-slate-200">Hydrostatic Pressure Test Pass</span>
                  <DSBadge variant="success">PASSED</DSBadge>
                </div>
                <div className="p-2 bg-slate-800/80 rounded flex justify-between items-center">
                  <span className="text-slate-200">HDPE Pipe Cert DEWA-044</span>
                  <DSBadge variant="success">APPROVED</DSBadge>
                </div>
              </div>
            </DSCard>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW CUSTOMER */}
      <DSModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        title="Add New Enterprise Customer Account"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300">Customer Code</label>
            <input
              type="text"
              value={newCustForm.code}
              readOnly
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300">Company Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Abu Dhabi National Oil Company (ADNOC)"
              value={newCustForm.companyName}
              onChange={(e) => setNewCustForm({ ...newCustForm, companyName: e.target.value })}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300">Customer Type</label>
              <select
                value={newCustForm.customerType}
                onChange={(e) => setNewCustForm({ ...newCustForm, customerType: e.target.value })}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                <option value="GOVERNMENT">Government Authority</option>
                <option value="PRIVATE_DEVELOPER">Private Developer</option>
                <option value="MAIN_CONTRACTOR">Main Contractor</option>
                <option value="INFRASTRUCTURE">Infrastructure Utility</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300">Account Tier</label>
              <select
                value={newCustForm.tier}
                onChange={(e) => setNewCustForm({ ...newCustForm, tier: e.target.value })}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                <option value="PLATINUM">Platinum</option>
                <option value="STRATEGIC">Strategic Key Account</option>
                <option value="STANDARD">Standard Account</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300">Credit Limit (AED)</label>
              <input
                type="number"
                value={newCustForm.creditLimit}
                onChange={(e) => setNewCustForm({ ...newCustForm, creditLimit: Number(e.target.value) })}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300">Account Manager</label>
              <input
                type="text"
                value={newCustForm.accountManager}
                onChange={(e) => setNewCustForm({ ...newCustForm, accountManager: e.target.value })}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
            <DSButton variant="outline" size="sm" onClick={() => setIsNewCustomerModalOpen(false)}>
              Cancel
            </DSButton>
            <DSButton variant="primary" size="sm" type="submit">
              Save Account
            </DSButton>
          </div>
        </form>
      </DSModal>

      {/* MODAL: ADD SUPPORT TICKET */}
      <DSModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        title="Raise Support / Technical Inquiry Ticket"
      >
        <form onSubmit={handleAddTicket} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300">Customer Account</label>
            <select
              value={newTicketForm.customerName}
              onChange={(e) => setNewTicketForm({ ...newTicketForm, customerName: e.target.value })}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.companyName}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300">Subject / Technical Question *</label>
            <input
              type="text"
              required
              placeholder="e.g. Request for clarification on Inspection Testing Plan ITP #12"
              value={newTicketForm.subject}
              onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300">Category</label>
              <select
                value={newTicketForm.category}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                <option value="BILLING_INQUIRY">Billing & Payment Application</option>
                <option value="DRAWING_APPROVAL">Drawing & Submittal Approval</option>
                <option value="SITE_ACCESS">Site Access & Logistics</option>
                <option value="VARIATION">Variation Order Clarification</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300">Priority</label>
              <select
                value={newTicketForm.priority}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (SLA 12h)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
            <DSButton variant="outline" size="sm" onClick={() => setIsNewTicketModalOpen(false)}>
              Cancel
            </DSButton>
            <DSButton variant="primary" size="sm" type="submit">
              Submit Ticket
            </DSButton>
          </div>
        </form>
      </DSModal>
    </div>
  );
};
