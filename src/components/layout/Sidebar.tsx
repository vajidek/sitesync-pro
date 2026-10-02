import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { safeJson } from '../../lib/safeFetch';
import {
  LayoutDashboard,
  Building2,
  Truck,
  Boxes,
  ClipboardCheck,
  Database,
  Info,
  Users,
  ChevronRight,
  ShieldCheck,
  HardHat,
  FileSpreadsheet,
  FileText,
  Droplets,
  Zap,
  BarChart3,
  X,
  Star,
  Search,
  ChevronDown,
  Wrench,
  Layers,
  Sparkles,
  DollarSign,
  GitPullRequest,
  Smartphone,
  Cpu,
  Activity,
  Brain,
  FolderKanban,
  ShoppingCart,
  Warehouse,
  CheckCircle2,
  Radio,
  Sliders,
  Settings,
  Award,
  Building,
  Laptop,
  Receipt,
  HelpCircle
} from 'lucide-react';
import { useShell } from './ShellContext';
import { DSSearchBox } from '../ui/design-system';

export type NavTab =
  | 'commandCenter'
  | 'dashboard'
  | 'masterData'
  | 'aiIntelligence'
  | 'aiGateway'
  | 'crm'
  | 'workflow'
  | 'mobile'
  | 'waterInfrastructure'
  | 'resources'
  | 'projects'
  | 'projectcontrols'
  | 'analytics'
  | 'fleet'
  | 'eam'
  | 'iot'
  | 'scada'
  | 'hr'
  | 'procurement'
  | 'finance'
  | 'expenses'
  | 'machinery'
  | 'inventory'
  | 'workorders'
  | 'documents'
  | 'qaqc'
  | 'quality'
  | 'hse'
  | 'safety'
  | 'admin'
  | 'adminServices'
  | 'itManagement'
  | 'commercial'
  | 'helpCenter'
  | 'schema'
  | 'about';

export interface SubModuleItem {
  id: NavTab;
  label: string;
  shortLabel?: string;
  icon: React.ReactNode;
  badgeCount?: number;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  description?: string;
  allowedRoles?: UserRole[];
}

export interface EnterpriseDomainGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  defaultTab: NavTab;
  allowedRoles?: UserRole[];
  subModules: SubModuleItem[];
}

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const MODULE_CODE_TO_TAB: Record<string, NavTab> = {
  DASHBOARD: 'dashboard',
  MASTER_DATA: 'masterData',
  MDM: 'masterData',
  PROJECTS: 'projects',
  FLEET: 'fleet',
  HR: 'hr',
  PROCUREMENT: 'procurement',
  INVENTORY: 'inventory',
  ORGANIZATION: 'admin',
};

// Enterprise Hierarchical Domain Groups
export const ENTERPRISE_NAV_DOMAINS: EnterpriseDomainGroup[] = [
  // 1. Overview & Command
  {
    id: 'overview-domain',
    label: 'Overview & Command',
    icon: <Activity className="w-4.5 h-4.5 text-indigo-400" />,
    defaultTab: 'dashboard',
    subModules: [
      {
        id: 'dashboard',
        label: 'Executive Dashboard',
        shortLabel: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4 text-indigo-400" />,
        description: 'Role-based operational overview & KPIs',
      },
      {
        id: 'commandCenter',
        label: 'Operations Command Center',
        shortLabel: 'Command Center',
        icon: <Activity className="w-4 h-4 text-rose-400" />,
        description: 'Real-time telemetry, incidents & active alarms',
      },
    ],
  },

  // 2. Organization & Human Capital
  {
    id: 'org-hr-domain',
    label: 'Organization & HR',
    icon: <Users className="w-4.5 h-4.5 text-rose-400" />,
    defaultTab: 'hr',
    subModules: [
      {
        id: 'hr',
        label: 'Enterprise HRMS & Payroll',
        shortLabel: 'HR & Payroll',
        icon: <Users className="w-4 h-4 text-rose-400" />,
        description: 'Employee Master, attendance, leaves, payroll & documents',
      },
      {
        id: 'resources',
        label: 'Enterprise Resource Management',
        shortLabel: 'Resources',
        icon: <Layers className="w-4 h-4 text-indigo-400" />,
        description: 'Labor allocation, skill matrix & equipment dispatch',
      },
    ],
  },

  // 3. Projects & Engineering
  {
    id: 'projects-domain',
    label: 'Projects & Engineering',
    icon: <Building2 className="w-4.5 h-4.5 text-emerald-400" />,
    defaultTab: 'projects',
    subModules: [
      {
        id: 'projects',
        label: 'Projects & Sites',
        shortLabel: 'Project Master',
        icon: <Building2 className="w-4 h-4 text-emerald-400" />,
        description: 'Site setup, project details, WBS & milestones',
      },
      {
        id: 'projectcontrols',
        label: 'Project Controls & Planning',
        shortLabel: 'Controls & EVM',
        icon: <BarChart3 className="w-4 h-4 text-blue-400" />,
        description: 'S-Curves, Earned Value, CPM schedule & progress curves',
      },
      {
        id: 'waterInfrastructure',
        label: 'Water & Utility Engineering',
        shortLabel: 'Water Utility',
        icon: <Droplets className="w-4 h-4 text-cyan-400" />,
        description: 'Pipeline trenching, pressure tests, WTP network & valves',
      },
      {
        id: 'workorders',
        label: 'Work Orders & Site Execution',
        shortLabel: 'Work Orders',
        icon: <ClipboardCheck className="w-4 h-4 text-amber-400" />,
        description: 'Daily duty logs, task execution & site work orders',
      },
      {
        id: 'mobile',
        label: 'Mobile Field Ops & GIS',
        shortLabel: 'Field Ops GIS',
        icon: <Smartphone className="w-4 h-4 text-teal-400" />,
        description: 'Offline site inspections, GPS geotagging & mobile sync',
      },
    ],
  },

  // 4. Procurement & Supply Chain
  {
    id: 'procurement-domain',
    label: 'Procurement & Contracts',
    icon: <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-400" />,
    defaultTab: 'procurement',
    subModules: [
      {
        id: 'procurement',
        label: 'Procurement & Vendor Orders',
        shortLabel: 'Procurement',
        icon: <FileSpreadsheet className="w-4 h-4 text-indigo-400" />,
        description: 'Material Requisitions (PR), RFQs, POs & Vendor evaluations',
      },
    ],
  },

  // 5. Stores & Inventory Management
  {
    id: 'stores-domain',
    label: 'Stores & Materials',
    icon: <Boxes className="w-4.5 h-4.5 text-amber-400" />,
    defaultTab: 'inventory',
    subModules: [
      {
        id: 'inventory',
        label: 'Materials & Warehouse Store',
        shortLabel: 'Store & Inventory',
        icon: <Boxes className="w-4 h-4 text-amber-400" />,
        description: 'Material master, GRN, Goods Issue, Bin location & Stock ledger',
      },
    ],
  },

  // 6. Plant, Fleet & EAM
  {
    id: 'fleet-eam-domain',
    label: 'Plant, Fleet & EAM',
    icon: <Truck className="w-4.5 h-4.5 text-amber-400" />,
    defaultTab: 'fleet',
    subModules: [
      {
        id: 'fleet',
        label: 'Fleet & Heavy Logistics',
        shortLabel: 'Fleet Management',
        icon: <Truck className="w-4 h-4 text-amber-400" />,
        description: 'Vehicle tracking, fuel logs, driver dispatch & trips',
      },
      {
        id: 'eam',
        label: 'EAM & Plant Maintenance',
        shortLabel: 'Plant & Machinery',
        icon: <Wrench className="w-4 h-4 text-blue-400" />,
        description: 'Heavy equipment master, preventive maintenance & work orders',
      },
    ],
  },

  // 7. Commercial & Finance
  {
    id: 'finance-domain',
    label: 'Commercial & Finance',
    icon: <DollarSign className="w-4.5 h-4.5 text-emerald-400" />,
    defaultTab: 'finance',
    subModules: [
      {
        id: 'finance',
        label: 'Finance & Cost Control',
        shortLabel: 'Finance & Accounts',
        icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
        description: 'Budgets, BOQ tracking, Subcontract WO, RA Bills & Multi-Currency',
      },
      {
        id: 'commercial',
        label: 'Commercial & Tendering Lifecycle',
        shortLabel: 'Commercial & Tenders',
        icon: <Award className="w-4 h-4 text-emerald-400" />,
        description: 'Tenders & Bidding, BOQ rate analysis & subcontract agreement management',
      },
      {
        id: 'expenses',
        label: 'Employee Expenses & Petty Cash',
        shortLabel: 'Expenses & Petty Cash',
        icon: <Receipt className="w-4 h-4 text-emerald-400" />,
        description: 'Expense claims, receipts, approval workflow, cash advances & petty cash float reconciliation',
      },
    ],
  },

  // 8. Quality & HSE Safety
  {
    id: 'quality-hse-domain',
    label: 'Quality & HSE Safety',
    icon: <ShieldCheck className="w-4.5 h-4.5 text-blue-400" />,
    defaultTab: 'qaqc',
    subModules: [
      {
        id: 'qaqc',
        label: 'QA/QC Quality Management',
        shortLabel: 'QA/QC System',
        icon: <ShieldCheck className="w-4 h-4 text-blue-400" />,
        description: 'Inspection Test Plans (ITP), NCRs, checklists & lab certificates',
      },
      {
        id: 'hse',
        label: 'HSE Safety & Environment',
        shortLabel: 'HSE Safety',
        icon: <HardHat className="w-4.5 h-4.5 text-emerald-400" />,
        description: 'Toolbox talks, incident logs, hazard reports & PTW permits',
      },
    ],
  },

  // 9. IoT, SCADA & Automation
  {
    id: 'iot-domain',
    label: 'IoT, SCADA & Telemetry',
    icon: <Cpu className="w-4.5 h-4.5 text-cyan-400" />,
    defaultTab: 'iot',
    subModules: [
      {
        id: 'iot',
        label: 'Industrial IoT & SCADA',
        shortLabel: 'SCADA & Sensors',
        icon: <Cpu className="w-4 h-4 text-cyan-400" />,
        description: 'RTU devices, pump telemetry, flow sensors & remote control',
      },
    ],
  },

  // 10. Enterprise Intelligence & EDMS
  {
    id: 'intelligence-domain',
    label: 'Intelligence & EDMS',
    icon: <Brain className="w-4.5 h-4.5 text-indigo-400" />,
    defaultTab: 'analytics',
    subModules: [
      {
        id: 'aiIntelligence',
        label: 'AI Intelligence & Decisions',
        shortLabel: 'AI Decision Engine',
        icon: <Brain className="w-4 h-4 text-indigo-400" />,
        description: 'Automated decision engine, predictive models & anomaly detection',
      },
      {
        id: 'aiGateway',
        label: 'Multi-Model AI Gateway',
        shortLabel: 'AI Gateway',
        icon: <Cpu className="w-4 h-4 text-cyan-400" />,
        description: 'Gemini, model routing, token usage & prompt orchestration',
      },
      {
        id: 'analytics',
        label: 'Executive BI & Analytics',
        shortLabel: 'BI & Analytics',
        icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
        description: 'Interactive management charts, multi-project reports & BI trends',
      },
      {
        id: 'documents',
        label: 'Document System (EDMS)',
        shortLabel: 'EDMS Documents',
        icon: <FileText className="w-4 h-4 text-blue-400" />,
        description: 'Engineering drawings, submittals, transmittals & versioning',
      },
    ],
  },

  // 11. CRM & Stakeholders
  {
    id: 'crm-domain',
    label: 'CRM & Stakeholders',
    icon: <Users className="w-4.5 h-4.5 text-cyan-400" />,
    defaultTab: 'crm',
    subModules: [
      {
        id: 'crm',
        label: 'Enterprise CRM & Client Portal',
        shortLabel: 'CRM & Clients',
        icon: <Users className="w-4 h-4 text-cyan-400" />,
        description: 'Clients, consultants, funding agencies, tenders & client portal',
      },
    ],
  },

  // 12. Administration & Governance
  {
    id: 'admin-domain',
    label: 'Administration & Governance',
    icon: <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />,
    defaultTab: 'admin',
    allowedRoles: ['ADMIN', 'MANAGER'],
    subModules: [
      {
        id: 'admin',
        label: 'System Governance & RBAC',
        shortLabel: 'Admin & Users',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        description: 'User management, roles matrix, ABAC policies & audit logs',
      },
      {
        id: 'adminServices',
        label: 'Office Administration & General Services',
        shortLabel: 'Office Admin',
        icon: <Building className="w-4 h-4 text-emerald-400" />,
        description: 'Visitor management, meeting rooms, company circulars & service requests',
      },
      {
        id: 'itManagement',
        label: 'IT & Digital Asset Management (ITAM / ITSM)',
        shortLabel: 'IT & Helpdesk',
        icon: <Laptop className="w-4 h-4 text-indigo-400" />,
        description: 'IT hardware assets, software licenses, helpdesk tickets & access governance',
      },
      {
        id: 'masterData',
        label: 'Master Data Governance (MDM)',
        shortLabel: 'Master Data MDM',
        icon: <Database className="w-4 h-4 text-emerald-400" />,
        description: '32 Master Domains, data registry, golden records & lineage',
      },
      {
        id: 'workflow',
        label: 'Workflow Engine & Approvals',
        shortLabel: 'Workflows',
        icon: <GitPullRequest className="w-4 h-4 text-amber-400" />,
        description: 'Multi-step approval workflows, notifications & triggers',
      },
      {
        id: 'helpCenter',
        label: 'Enterprise Help Center & Admin Manual',
        shortLabel: 'Help & Manual',
        icon: <HelpCircle className="w-4 h-4 text-cyan-400" />,
        description: 'Plain-English role guides, visual workflow steppers, ERP jargon glossary & administrator manual',
      },
      {
        id: 'schema',
        label: 'Database Schema Inspector',
        shortLabel: 'Schema Inspector',
        icon: <Database className="w-4 h-4 text-purple-400" />,
        description: 'Live PostgreSQL schema inspection & data entity viewer',
      },
      {
        id: 'about',
        label: 'System & Architecture',
        shortLabel: 'System Info',
        icon: <Info className="w-4 h-4 text-cyan-400" />,
        description: 'System credits, architecture specs & environment',
      },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user, activeRole } = useAuth();
  const {
    favorites,
    toggleFavorite,
    recentTabs,
    addRecentTab,
    isSidebarCollapsed,
    isSidebarHoverExpanded,
    setIsSidebarHoverExpanded,
  } = useShell();

  const [searchFilter, setSearchFilter] = useState('');
  const [dbModules, setDbModules] = useState<any[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});
  const [hoveredDomainId, setHoveredDomainId] = useState<string | null>(null);

  // Auto-expand the domain containing the active tab
  useEffect(() => {
    const parentDomain = ENTERPRISE_NAV_DOMAINS.find((dom) =>
      dom.subModules.some((sub) => sub.id === activeTab)
    );
    if (parentDomain) {
      setExpandedDomains((prev) => ({
        ...prev,
        [parentDomain.id]: true,
      }));
    }
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpenMobile && e.key === 'Escape' && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpenMobile, onCloseMobile]);

  useEffect(() => {
    const fetchSidebarTree = async () => {
      try {
        const token = localStorage.getItem('sitesync_access_token');
        if (!token) return;
        const res = await fetch('/api/modules/sidebar-tree', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await safeJson(res);
        if (json?.success && Array.isArray(json.data)) {
          setDbModules(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic sidebar tree:', err);
      }
    };

    fetchSidebarTree();
  }, []);

  // Filter modules based on Role permissions and DB module enablement
  const authorizedDomains = useMemo(() => {
    return ENTERPRISE_NAV_DOMAINS.map((domain) => {
      // Check domain-level role access
      if (domain.allowedRoles && (!activeRole || !domain.allowedRoles.includes(activeRole))) {
        return null;
      }

      // Filter submodules
      const filteredSub = domain.subModules.filter((sub) => {
        if (sub.allowedRoles && (!activeRole || !sub.allowedRoles.includes(activeRole))) {
          return false;
        }
        if (dbModules.length > 0) {
          const mod = dbModules.find((m) => MODULE_CODE_TO_TAB[m.moduleCode] === sub.id);
          if (mod && !mod.isEnabled) return false;
        }
        return true;
      });

      if (filteredSub.length === 0) return null;

      return {
        ...domain,
        subModules: filteredSub,
      };
    }).filter(Boolean) as EnterpriseDomainGroup[];
  }, [activeRole, dbModules]);

  // Apply search query filter across parent domain labels and submodules
  const searchedDomains = useMemo(() => {
    if (!searchFilter.trim()) return authorizedDomains;
    const q = searchFilter.toLowerCase();

    return authorizedDomains
      .map((domain) => {
        const domainMatches = domain.label.toLowerCase().includes(q);
        const matchingSubModules = domain.subModules.filter(
          (sub) =>
            sub.label.toLowerCase().includes(q) ||
            (sub.shortLabel && sub.shortLabel.toLowerCase().includes(q)) ||
            (sub.description && sub.description.toLowerCase().includes(q))
        );

        if (domainMatches) {
          return domain;
        }
        if (matchingSubModules.length > 0) {
          return {
            ...domain,
            subModules: matchingSubModules,
          };
        }
        return null;
      })
      .filter(Boolean) as EnterpriseDomainGroup[];
  }, [authorizedDomains, searchFilter]);

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    addRecentTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const toggleDomain = (domainId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedDomains((prev) => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  };

  const isCompact = isSidebarCollapsed && !isSidebarHoverExpanded;

  // Flattened active list for favorites
  const allSubModules = useMemo(() => {
    return authorizedDomains.flatMap((d) => d.subModules);
  }, [authorizedDomains]);

  const navContent = (
    <div
      className="flex flex-col h-full justify-between bg-[#0B192C] text-slate-200 border-r border-slate-800 select-none overflow-hidden"
      onMouseEnter={() => {
        if (isSidebarCollapsed) setIsSidebarHoverExpanded(true);
      }}
      onMouseLeave={() => {
        if (isSidebarCollapsed) {
          setIsSidebarHoverExpanded(false);
          setHoveredDomainId(null);
        }
      }}
    >
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0 h-12">
        {!isCompact ? (
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-400">
              <FolderKanban className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs uppercase tracking-wider text-slate-200">
              Enterprise Navigation
            </span>
          </div>
        ) : (
          <div className="p-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 mx-auto">
            <FolderKanban className="w-4 h-4" />
          </div>
        )}

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
            aria-label="Close Navigation Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sidebar Live Search Box */}
      {!isCompact && (
        <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-900/30 shrink-0">
          <DSSearchBox
            placeholder="Search modules & pages..."
            value={searchFilter}
            onChange={(val) => setSearchFilter(val)}
          />
        </div>
      )}

      {/* Main Hierarchical Module List */}
      <nav className="flex-1 px-2.5 py-3 space-y-2 overflow-y-auto scrollbar-thin min-h-0">
        
        {/* Pinned Favorites Quick Access */}
        {favorites.length > 0 && !searchFilter && !isCompact && (
          <div className="mb-3 pb-2 border-b border-slate-800/60">
            <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>Pinned Favorites ({favorites.length})</span>
            </div>
            <div className="space-y-0.5">
              {allSubModules
                .filter((sub) => favorites.includes(sub.id))
                .map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <div
                      key={`fav-${item.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectTab(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectTab(item.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1 rounded-md text-xs transition duration-150 cursor-pointer select-none ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300 font-bold border-l-2 border-amber-400'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="shrink-0">{item.icon}</span>
                        <span className="truncate text-xs">{item.shortLabel || item.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className="p-0.5 text-amber-400 hover:text-amber-300 shrink-0"
                        title="Unpin Favorite"
                      >
                        <Star className="w-3 h-3 fill-amber-400" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Hierarchical Enterprise Domains */}
        <div className="space-y-1">
          {searchedDomains.map((domain) => {
            const isDomainActive = domain.subModules.some((sub) => sub.id === activeTab);
            const isExpanded = searchFilter.trim().length > 0 ? true : Boolean(expandedDomains[domain.id]);
            const isSingleSub = domain.subModules.length === 1;

            return (
              <div
                key={domain.id}
                className="rounded-xl overflow-hidden transition-colors duration-150 relative"
                onMouseEnter={() => isCompact && setHoveredDomainId(domain.id)}
                onMouseLeave={() => isCompact && setHoveredDomainId(null)}
              >
                {/* Domain Parent Header */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (isSingleSub) {
                      handleSelectTab(domain.subModules[0].id);
                    } else {
                      toggleDomain(domain.id);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (isSingleSub) {
                        handleSelectTab(domain.subModules[0].id);
                      } else {
                        toggleDomain(domain.id);
                      }
                    }
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 min-h-[38px] cursor-pointer select-none ${
                    isDomainActive && isCompact
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : isDomainActive
                      ? 'bg-slate-800/90 text-white border-l-2 border-indigo-400'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  } ${isCompact ? 'justify-center px-1' : ''}`}
                  title={isCompact ? domain.label : undefined}
                >
                  <div className={`flex items-center space-x-2.5 ${isCompact ? 'justify-center' : ''}`}>
                    <span className={`shrink-0 ${isDomainActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {domain.icon}
                    </span>
                    {!isCompact && (
                      <span className="truncate text-xs tracking-wide">
                        {domain.label}
                      </span>
                    )}
                  </div>

                  {!isCompact && (
                    <div className="flex items-center space-x-1 shrink-0">
                      {isSingleSub ? (
                        isDomainActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-indigo-400' : ''
                          }`}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Popover Flyout for Compact Mode */}
                {isCompact && hoveredDomainId === domain.id && (
                  <div className="absolute left-full top-0 ml-2 w-56 bg-slate-900 border border-slate-700 shadow-2xl rounded-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1 border-b border-slate-800 mb-1 text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                      {domain.icon}
                      <span className="truncate">{domain.label}</span>
                    </div>
                    <div className="space-y-0.5">
                      {domain.subModules.map((sub) => {
                        const isActive = activeTab === sub.id;
                        return (
                          <div
                            key={`flyout-${sub.id}`}
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTab(sub.id);
                              setHoveredDomainId(null);
                            }}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                              isActive
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="shrink-0">{sub.icon}</span>
                              <span className="truncate">{sub.label}</span>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Collapsible Sub-modules Container (Full Mode) */}
                {!isCompact && isExpanded && !isSingleSub && (
                  <div className="ml-3 pl-2.5 my-1 border-l border-slate-700/60 space-y-0.5 animate-in fade-in duration-150">
                    {domain.subModules.map((sub) => {
                      const isActive = activeTab === sub.id;
                      const isFav = favorites.includes(sub.id);

                      return (
                        <div key={sub.id} className="group relative flex items-center">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectTab(sub.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSelectTab(sub.id);
                              }
                            }}
                            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition duration-150 min-h-[32px] cursor-pointer select-none ${
                              isActive
                                ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30 border-l-2 border-white'
                                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'
                            }`}
                            title={sub.description || sub.label}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                {sub.icon}
                              </span>
                              <span className="truncate text-xs">{sub.label}</span>
                            </div>

                            <div className="flex items-center space-x-1 shrink-0">

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(sub.id);
                                }}
                                className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition ${
                                  isFav ? 'text-amber-400 opacity-100' : 'text-slate-500 hover:text-amber-300'
                                }`}
                                title={isFav ? 'Remove from Favorites' : 'Pin to Favorites'}
                              >
                                <Star className={`w-3 h-3 ${isFav ? 'fill-amber-400' : ''}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/90 text-[11px] text-slate-400 shrink-0">
        {!isCompact ? (
          <div>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-200 text-xs">SiteSync Pro ERP</span>
              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded-md font-mono">
                P2.8 Enterprise
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400 font-sans">
              SiteSync Pro Enterprise • <strong className="text-indigo-400 font-bold">Abdul Vajid EK</strong>
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="System Status: Operational" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-full transition-all duration-300 z-30 ${
          isCompact ? 'w-16' : 'w-64'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          isOpenMobile ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={onCloseMobile}
        />

        {/* Sliding Panel */}
        <div
          className={`fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] h-full bg-[#0B192C] shadow-2xl transition-transform duration-300 ease-in-out transform ${
            isOpenMobile ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {navContent}
        </div>
      </div>
    </>
  );
};
