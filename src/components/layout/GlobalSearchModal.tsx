import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Building2,
  Users,
  Boxes,
  FileText,
  Truck,
  ClipboardList,
  BarChart3,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  Command,
  X
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { useShell } from './ShellContext';
import { DSBadge, DSStatusChip } from '../ui/design-system';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export interface SearchRecord {
  id: string;
  category: 'Projects' | 'Employees' | 'Materials' | 'Documents' | 'Vehicles' | 'Forms' | 'Reports' | 'Dashboards';
  title: string;
  subtitle: string;
  tab: NavTab;
  badge: string;
  status?: string;
}

const SEARCH_DATABASE: SearchRecord[] = [
  // Projects
  {
    id: 'p-101',
    category: 'Projects',
    title: 'Peruvannamuzhi WTP Pipe Network',
    subtitle: 'High density urban pipeline trenching & valve station installation',
    tab: 'waterInfrastructure',
    badge: 'Water Project',
    status: 'HEALTHY',
  },
  {
    id: 'p-102',
    category: 'Projects',
    title: 'Trivandrum Smart City Infrastructure',
    subtitle: 'Underground ducting & utility corridor civil construction',
    tab: 'projects',
    badge: 'Civic Infra',
    status: 'HEALTHY',
  },
  {
    id: 'p-103',
    category: 'Projects',
    title: 'Calicut Bypass Four-Lane Highway Bridge',
    subtitle: 'Heavy civil pre-stressed concrete girder launch',
    tab: 'projects',
    badge: 'Highway',
    status: 'DELAYED',
  },

  // Employees
  {
    id: 'e-201',
    category: 'Employees',
    title: 'Rahul Sharma (Senior Resident Engineer)',
    subtitle: 'Water Supply Division • Kerala State HQ',
    tab: 'hr',
    badge: 'Staff',
    status: 'HEALTHY',
  },
  {
    id: 'e-202',
    category: 'Employees',
    title: 'Priya Nair (Lead Quantity Surveyor)',
    subtitle: 'BOQ Estimation & Procurement • Commercial Department',
    tab: 'procurement',
    badge: 'Staff',
    status: 'HEALTHY',
  },
  {
    id: 'e-203',
    category: 'Employees',
    title: 'Vikram Singh (Senior Heavy Fleet Manager)',
    subtitle: 'Equipment Logistics & Dispatch Operations',
    tab: 'fleet',
    badge: 'Manager',
    status: 'HEALTHY',
  },

  // Materials
  {
    id: 'm-301',
    category: 'Materials',
    title: 'Ductile Iron Pipe DN300 Class K9',
    subtitle: 'Specification ISO 2531 • Stock: 1,450 meters (Central Store)',
    tab: 'inventory',
    badge: 'Pipe Fittings',
    status: 'HEALTHY',
  },
  {
    id: 'm-302',
    category: 'Materials',
    title: 'Ordinary Portland Cement 53 Grade',
    subtitle: 'IS 12269 Compliant • Stock: 850 Bags (Site Yard 2)',
    tab: 'inventory',
    badge: 'Civil Bulk',
    status: 'DEGRADED',
  },
  {
    id: 'm-303',
    category: 'Materials',
    title: 'High Pressure Sluice Valve 400mm',
    subtitle: 'PN16 Flanged PN Rating • Stock: 12 Units',
    tab: 'inventory',
    badge: 'Valves',
    status: 'HEALTHY',
  },

  // Documents
  {
    id: 'd-401',
    category: 'Documents',
    title: 'Midland Hydrostatic Pressure Test Certificate.pdf',
    subtitle: 'Verified by Chief Engineer • Section 4B Pipeline',
    tab: 'waterInfrastructure',
    badge: 'Compliance',
    status: 'APPROVED',
  },
  {
    id: 'd-402',
    category: 'Documents',
    title: 'Site Emergency Safety Clearance Plan 2026.pdf',
    subtitle: 'HSE Committee Approved Protocol Document',
    tab: 'admin',
    badge: 'HSE Policy',
    status: 'APPROVED',
  },

  // Vehicles
  {
    id: 'v-501',
    category: 'Vehicles',
    title: 'Excavator CAT-320D Heavy Crawler',
    subtitle: 'Reg #KL-07-CD-8921 • Assigned: Kochi Trench Site',
    tab: 'fleet',
    badge: 'Machinery',
    status: 'HEALTHY',
  },
  {
    id: 'v-502',
    category: 'Vehicles',
    title: 'Tata Prima 2828.K 16-Cubic Dumper',
    subtitle: 'Reg #KL-07-BZ-1102 • Active Earthwork Duty',
    tab: 'fleet',
    badge: 'Truck',
    status: 'HEALTHY',
  },

  // Forms
  {
    id: 'f-601',
    category: 'Forms',
    title: 'Daily Site Log & Labor Attendance Form',
    subtitle: 'Digital Punching & Inspection Verification Slip',
    tab: 'hr',
    badge: 'Site Form',
    status: 'SUBMITTED',
  },
  {
    id: 'f-602',
    category: 'Forms',
    title: 'Material Requisition Slip (MRS-2026)',
    subtitle: 'Inter-site Transfer Request & Store Approval',
    tab: 'procurement',
    badge: 'Requisition',
    status: 'PENDING',
  },

  // Reports
  {
    id: 'r-701',
    category: 'Reports',
    title: 'Monthly BOQ Financial Variance Audit Q3',
    subtitle: 'Budget vs Actual Expenditure Breakdown',
    tab: 'procurement',
    badge: 'Analytics',
    status: 'COMPLETED',
  },
  {
    id: 'r-702',
    category: 'Reports',
    title: 'Fleet Fuel Consumption & Idle Hours Report',
    subtitle: 'GPS Telemetry & Diesel Mileage Benchmark',
    tab: 'fleet',
    badge: 'Telemetry',
    status: 'COMPLETED',
  },

  // Dashboards
  {
    id: 'db-801',
    category: 'Dashboards',
    title: 'Role-Based Executive Control Panel',
    subtitle: '360-degree KPI Summary for Operations Managers',
    tab: 'dashboard',
    badge: 'Control Panel',
    status: 'HEALTHY',
  },
  {
    id: 'db-802',
    category: 'Dashboards',
    title: 'Water Utility Command Center',
    subtitle: 'Real-time DMA Pressure, Flow & Quality Telemetry',
    tab: 'waterInfrastructure',
    badge: 'Water Utilities',
    status: 'HEALTHY',
  },
  {
    id: 'db-803',
    category: 'Dashboards',
    title: 'PostgreSQL Database Schema Inspector',
    subtitle: 'Phase 23 Table Blueprint & Migration Visualizer',
    tab: 'schema',
    badge: 'ERP Core',
    status: 'HEALTHY',
  },
  // Master Data & Administration
  {
    id: 'm-901',
    category: 'Dashboards',
    title: 'Master Data Governance (MDM)',
    subtitle: '32 Enterprise Masters: Companies, Branches, Trades, Cost Centers, Currencies',
    tab: 'masterData',
    badge: 'MDM Core',
    status: 'HEALTHY',
  },
  {
    id: 'm-902',
    category: 'Dashboards',
    title: 'Enterprise Organization & Structure Config',
    subtitle: 'Companies, Regions, Divisions, Departments & Sub-Units',
    tab: 'admin',
    badge: 'Admin',
    status: 'HEALTHY',
  },
  {
    id: 'm-903',
    category: 'Dashboards',
    title: 'Multi-Currency & Exchange Rate Engine',
    subtitle: 'Corporate Base Currency, Project Currencies & Real-time FX',
    tab: 'finance',
    badge: 'Finance',
    status: 'HEALTHY',
  },
  {
    id: 'm-904',
    category: 'Dashboards',
    title: 'Roles & RBAC Permission Matrix',
    subtitle: 'Security Policies, Granular Permissions & ABAC',
    tab: 'admin',
    badge: 'Security',
    status: 'HEALTHY',
  },
  {
    id: 'm-905',
    category: 'Dashboards',
    title: 'EAM Plant & Machinery Maintenance',
    subtitle: 'Work Orders, Preventative Maintenance & Equipment Master',
    tab: 'eam',
    badge: 'Assets',
    status: 'HEALTHY',
  },
  {
    id: 'm-906',
    category: 'Dashboards',
    title: 'Industrial IoT, SCADA & Telemetry',
    subtitle: 'Sensors, RTU Devices & Pump Station Telemetry',
    tab: 'iot',
    badge: 'IoT',
    status: 'HEALTHY',
  },
  {
    id: 'm-907',
    category: 'Dashboards',
    title: 'Project Controls, EVM & Planning',
    subtitle: 'Earned Value, CPM Schedules & S-Curves',
    tab: 'projectcontrols',
    badge: 'Planning',
    status: 'HEALTHY',
  },
  {
    id: 'm-908',
    category: 'Dashboards',
    title: 'Enterprise CRM & Client Portal',
    subtitle: 'Clients, Consultants, Stakeholders & Tenders',
    tab: 'crm',
    badge: 'CRM',
    status: 'HEALTHY',
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Projects: <Building2 className="w-4 h-4 text-emerald-500" />,
  Employees: <Users className="w-4 h-4 text-rose-400" />,
  Materials: <Boxes className="w-4 h-4 text-orange-400" />,
  Documents: <FileText className="w-4 h-4 text-blue-400" />,
  Vehicles: <Truck className="w-4 h-4 text-amber-500" />,
  Forms: <ClipboardList className="w-4 h-4 text-indigo-400" />,
  Reports: <BarChart3 className="w-4 h-4 text-purple-400" />,
  Dashboards: <LayoutDashboard className="w-4 h-4 text-cyan-400" />,
};

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const categories = ['ALL', 'Projects', 'Employees', 'Materials', 'Documents', 'Vehicles', 'Forms', 'Reports', 'Dashboards'];

  const filteredResults = useMemo(() => {
    let items = SEARCH_DATABASE;

    if (selectedCategory !== 'ALL') {
      items = items.filter((i) => i.category === selectedCategory);
    }

    if (!query.trim()) return items.slice(0, 10);

    const q = query.toLowerCase();
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.subtitle.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.badge.toLowerCase().includes(q)
    );
  }, [query, selectedCategory]);

  const handleSelect = (rec: SearchRecord) => {
    onNavigateTab(rec.tab);
    onClose();
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
      } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredResults[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-8 sm:pt-20 px-3 sm:px-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Global ERP Search (Projects, Employees, Materials...)"
            className="w-full bg-transparent border-none text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
            <Command className="w-3 h-3" />
            <span>K</span>
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-1.5 overflow-x-auto scrollbar-none bg-slate-50/20 dark:bg-slate-900/20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="p-2 overflow-y-auto space-y-1 flex-1">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-500" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No ERP records matching "{query}"</p>
              <p className="text-[11px] mt-1 text-slate-400">Try searching for "Water", "Pipe", "Cat", "Boq", or "Rahul"</p>
            </div>
          ) : (
            filteredResults.map((rec, idx) => {
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={rec.id}
                  onClick={() => handleSelect(rec)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start space-x-3 min-w-0 pr-2">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                      {CATEGORY_ICONS[rec.category] || <FileText className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {rec.title}
                        </h4>
                        <DSBadge variant="primary" size="xs">{rec.badge}</DSBadge>
                        {rec.status && <DSStatusChip status={rec.status} size="xs" showDot={false} />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {rec.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      Jump to {rec.tab}
                    </span>
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded text-[10px] font-mono">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded text-[10px] font-mono">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded text-[10px] font-mono">Esc</kbd>
              <span>Close</span>
            </span>
          </div>

          <div className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SiteSync ERP Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};
