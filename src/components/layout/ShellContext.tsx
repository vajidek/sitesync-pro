import React, { createContext, useContext, useState, useEffect } from 'react';
import { NavTab } from './Sidebar';

export type CompanyOption = 'APEX_GLOBAL' | 'APEX_ME' | 'APEX_INDIA';
export type BranchOption = 'KOCHI_HQ' | 'TRIVANDRUM_REG' | 'CALICUT_SITE' | 'DUBAI_OFFSHORE';
export type AppEnvironmentMode = 'DEMO' | 'UAT' | 'PRODUCTION';
export type DeploymentEnv = 'DEMO' | 'UAT' | 'PRODUCTION';

export interface WorkflowItem {
  id: string;
  type: 'PR_APPROVAL' | 'LEAVE_REQ' | 'BOQ_REVISION' | 'EQUIPMENT_DISPATCH' | 'SAFETY_AUDIT';
  title: string;
  requestedBy: string;
  department: string;
  timestamp: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ShellNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'SYSTEM' | 'WORKFLOW' | 'SAFETY' | 'FINANCE';
  isRead: boolean;
}

interface ShellContextType {
  // Navigation & Favorites
  favorites: NavTab[];
  toggleFavorite: (tab: NavTab) => void;
  recentTabs: NavTab[];
  addRecentTab: (tab: NavTab) => void;
  
  // Organization Context
  currentCompany: CompanyOption;
  setCurrentCompany: (co: CompanyOption) => void;
  currentBranch: BranchOption;
  setCurrentBranch: (br: BranchOption) => void;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;

  // Modals & Drawers State
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  isQuickCreateOpen: boolean;
  setIsQuickCreateOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  isWorkflowInboxOpen: boolean;
  setIsWorkflowInboxOpen: (open: boolean) => void;

  // Environment Mode (DEMO vs UAT vs PRODUCTION)
  deploymentEnv: DeploymentEnv;
  environmentMode: AppEnvironmentMode;
  setEnvironmentMode: (mode: AppEnvironmentMode) => void;
  isDemo: boolean;

  // Sidebar State
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isSidebarHoverExpanded: boolean;
  setIsSidebarHoverExpanded: (expanded: boolean) => void;

  // Notifications & Workflow items
  notifications: ShellNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  workflows: WorkflowItem[];
  handleWorkflowAction: (id: string, action: 'APPROVED' | 'REJECTED') => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ShellContext = createContext<ShellContextType | undefined>(undefined);

const INITIAL_FAVORITES: NavTab[] = ['dashboard', 'waterInfrastructure', 'projects', 'fleet'];
const INITIAL_RECENTS: NavTab[] = ['dashboard', 'waterInfrastructure', 'projects'];

const INITIAL_NOTIFICATIONS: ShellNotification[] = [
  {
    id: 'notif-1',
    title: 'PostgreSQL Auto-Sync Complete',
    message: 'Phase 23 schema inspection synced 14 ERP tables to cloud storage.',
    timestamp: '10 mins ago',
    category: 'SYSTEM',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'Water Project Safety Audit Flagged',
    message: 'Trench shoring inspection report pending safety engineer sign-off.',
    timestamp: '45 mins ago',
    category: 'SAFETY',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'Purchase Request Approved #PR-8841',
    message: 'DI Pipe DN300 500m order approved by Finance Manager.',
    timestamp: '2 hours ago',
    category: 'FINANCE',
    isRead: false,
  },
  {
    id: 'notif-4',
    title: 'Fleet Maintenance Due',
    message: 'Excavator CAT-320D requires scheduled 500hr hydraulic oil service.',
    timestamp: '4 hours ago',
    category: 'WORKFLOW',
    isRead: true,
  },
];

const INITIAL_WORKFLOWS: WorkflowItem[] = [
  {
    id: 'wf-101',
    type: 'PR_APPROVAL',
    title: 'Purchase Request: High Pressure Valves (WTP Substation)',
    requestedBy: 'Engineer Suresh Kumar',
    department: 'Water Engineering',
    timestamp: '15m ago',
    priority: 'URGENT',
    status: 'PENDING',
  },
  {
    id: 'wf-102',
    type: 'BOQ_REVISION',
    title: 'BOQ Revision 3.2: Peruvannamuzhi WTP Pipeline Realignment',
    requestedBy: 'QS Anjali Menon',
    department: 'Commercial & Procurement',
    timestamp: '1h ago',
    priority: 'HIGH',
    status: 'PENDING',
  },
  {
    id: 'wf-103',
    type: 'LEAVE_REQ',
    title: 'Site Emergency Leave: Heavy Equipment Operator',
    requestedBy: 'Ramesh V. (Driver #D-402)',
    department: 'Fleet Operations',
    timestamp: '3h ago',
    priority: 'NORMAL',
    status: 'PENDING',
  },
];

export const ShellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<NavTab[]>(() => {
    try {
      const saved = localStorage.getItem('sitesync_shell_favorites');
      return saved ? JSON.parse(saved) : INITIAL_FAVORITES;
    } catch {
      return INITIAL_FAVORITES;
    }
  });

  const [recentTabs, setRecentTabs] = useState<NavTab[]>(INITIAL_RECENTS);

  const [currentCompany, setCurrentCompany] = useState<CompanyOption>('APEX_GLOBAL');
  const [currentBranch, setCurrentBranch] = useState<BranchOption>('KOCHI_HQ');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');

  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isWorkflowInboxOpen, setIsWorkflowInboxOpen] = useState(false);

  // Server-authoritative deployment environment
  const deploymentEnv: DeploymentEnv = (() => {
    const envVal = ((import.meta as any).env?.VITE_DEPLOYMENT_ENV || (import.meta as any).env?.VITE_APP_MODE || '').toUpperCase();
    if (envVal === 'PRODUCTION' || envVal === 'PROD') return 'PRODUCTION';
    if (envVal === 'UAT') return 'UAT';
    return 'DEMO';
  })();

  // Environment Mode State:
  // - PRODUCTION deployment: environment is permanently fixed to PRODUCTION
  // - UAT deployment: environment is permanently fixed to UAT
  // - DEMO deployment: defaults to DEMO, allows toggling between DEMO and UAT (for testing zero-state safety)
  const [environmentMode, setEnvironmentModeState] = useState<AppEnvironmentMode>(() => {
    if (deploymentEnv === 'PRODUCTION') return 'PRODUCTION';
    if (deploymentEnv === 'UAT') return 'UAT';

    const saved = localStorage.getItem('sitesync_app_environment') as AppEnvironmentMode;
    if (saved === 'DEMO' || saved === 'UAT') {
      return saved;
    }
    return 'DEMO';
  });

  const isDemo = environmentMode === 'DEMO';

  const setEnvironmentMode = (mode: AppEnvironmentMode) => {
    // In Production or UAT deployment, client cannot switch environment
    if (deploymentEnv === 'PRODUCTION' || deploymentEnv === 'UAT') {
      return;
    }
    // In DEMO deployment, client can toggle between DEMO and UAT visual preview
    const targetMode = mode === 'UAT' ? 'UAT' : 'DEMO';
    setEnvironmentModeState(targetMode);
    localStorage.setItem('sitesync_app_environment', targetMode);
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sitesync_sidebar_collapsed') === 'true';
  });
  const [isSidebarHoverExpanded, setIsSidebarHoverExpanded] = useState(false);

  const [notifications, setNotifications] = useState<ShellNotification[]>(() => {
    return isDemo ? INITIAL_NOTIFICATIONS : [];
  });
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(() => {
    return isDemo ? INITIAL_WORKFLOWS : [];
  });

  // When switching environment mode, update default notifications and workflows accordingly
  useEffect(() => {
    if (isDemo) {
      setNotifications(INITIAL_NOTIFICATIONS);
      setWorkflows(INITIAL_WORKFLOWS);
    } else {
      // In UAT or PRODUCTION, initialize cleanly with genuine items or empty
      setNotifications([]);
      setWorkflows([]);
    }
  }, [environmentMode, isDemo]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || true;
  });

  useEffect(() => {
    localStorage.setItem('sitesync_shell_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('sitesync_sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleFavorite = (tab: NavTab) => {
    setFavorites((prev) =>
      prev.includes(tab) ? prev.filter((t) => t !== tab) : [...prev, tab]
    );
  };

  const addRecentTab = (tab: NavTab) => {
    setRecentTabs((prev) => {
      const filtered = prev.filter((t) => t !== tab);
      return [tab, ...filtered].slice(0, 5);
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleWorkflowAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: action } : w))
    );
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ShellContext.Provider
      value={{
        favorites,
        toggleFavorite,
        recentTabs,
        addRecentTab,
        currentCompany,
        setCurrentCompany,
        currentBranch,
        setCurrentBranch,
        selectedProjectId,
        setSelectedProjectId,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        isQuickCreateOpen,
        setIsQuickCreateOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        isWorkflowInboxOpen,
        setIsWorkflowInboxOpen,
        deploymentEnv,
        environmentMode,
        setEnvironmentMode,
        isDemo,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isSidebarHoverExpanded,
        setIsSidebarHoverExpanded,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        workflows,
        handleWorkflowAction,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
};

export const useShell = () => {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
};
