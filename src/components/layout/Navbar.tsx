import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ROLE_CONFIG, CREATOR_INFO } from '../../data/mockData';
import {
  Building2,
  UserCheck,
  ChevronDown,
  LogOut,
  Info,
  Bell,
  ShieldAlert,
  Menu,
  X,
  Sparkles,
  Search,
  Plus,
  Moon,
  Sun,
  MapPin,
  FolderGit2,
  Inbox,
  CheckCircle2,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useShell, CompanyOption, BranchOption } from './ShellContext';
import { useDeviceProfile } from '../../hooks/useDeviceProfile';
import { DSBadge, DSAvatar, DSStatusChip, DSButton } from '../ui/design-system';

interface NavbarProps {
  onOpenAbout: () => void;
  onOpenLogin: () => void;
  onOpenProfile?: () => void;
  onOpenAIAssistant?: () => void;
  onOpenHelp?: () => void;
  toggleSidebarMobile?: () => void;
  isSidebarOpenMobile?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAbout,
  onOpenLogin,
  onOpenProfile,
  onOpenAIAssistant,
  onOpenHelp,
  toggleSidebarMobile,
  isSidebarOpenMobile,
}) => {
  const { user, activeRole, isAuthenticated, switchRole, logout } = useAuth();
  const {
    currentCompany,
    setCurrentCompany,
    currentBranch,
    setCurrentBranch,
    selectedProjectId,
    setSelectedProjectId,
    setIsGlobalSearchOpen,
    setIsQuickCreateOpen,
    setIsNotificationDrawerOpen,
    setIsWorkflowInboxOpen,
    notifications,
    workflows,
    isDarkMode,
    toggleDarkMode,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    deploymentEnv,
    environmentMode,
    setEnvironmentMode,
    isDemo,
  } = useShell();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);

  const device = useDeviceProfile();

  const rolesList: UserRole[] = [
    'ADMIN',
    'MANAGER',
    'INCHARGE',
    'SUPERVISOR',
    'STORE_KEEPER',
    'DRIVER',
    'OPERATOR',
    'WORKER',
  ];

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;
  const pendingWorkflowCount = workflows.filter((w) => w.status === 'PENDING').length;

  if (device.isLandscapePhone) {
    return (
      <header className="sticky top-0 z-40 bg-[#0B192C] text-white border-b border-slate-800 shadow-xl w-full max-w-full">
        <div className="w-full px-2">
          <div className="flex items-center justify-between h-11 w-full gap-1">
            {/* Left: Hamburger & Brand */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={toggleSidebarMobile}
                className="p-1 rounded-lg text-slate-300 hover:bg-slate-800 transition min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                aria-label="Toggle Navigation"
              >
                {isSidebarOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div onClick={onOpenAbout} className="flex items-center space-x-1 cursor-pointer shrink-0">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-800 flex items-center justify-center text-white shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-extrabold text-xs tracking-tight text-white font-sans shrink-0">
                  SiteSync <span className="text-indigo-400">Pro</span>
                </span>
              </div>
            </div>

            {/* Actions: Icon-only buttons for Search, Quick Action, Inbox, Notifications, AI, Avatar */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                onClick={() => setIsGlobalSearchOpen(true)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-indigo-400 hover:text-indigo-300 min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                title="Search ERP"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsQuickCreateOpen(true)}
                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                title="Quick Action"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsWorkflowInboxOpen(true)}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 relative min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                title="Approvals"
              >
                <Inbox className="w-4 h-4 text-indigo-400" />
                {pendingWorkflowCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                    {pendingWorkflowCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsNotificationDrawerOpen(true)}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 relative min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                title="Alerts"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-amber-500 text-slate-950 text-[8px] font-extrabold flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenAIAssistant}
                className="p-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                title="AI Copilot"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>

              {isAuthenticated ? (
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-0.5 rounded-lg hover:bg-slate-800 shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center relative"
                >
                  <DSAvatar name={user?.name || 'User'} src={user?.avatarUrl} size="sm" />
                </button>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shrink-0 flex items-center space-x-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Menu Popup in landscape (Authenticated Only) */}
        {showProfileMenu && isAuthenticated && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
            <div className="absolute right-2 top-11 w-56 max-h-[80vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 text-xs space-y-2">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
                <DSAvatar name={user?.name || 'User'} src={user?.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className="w-full text-left px-2 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center justify-between transition"
              >
                <div className="flex items-center space-x-2">
                  {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
              </button>
              <button
                onClick={() => {
                  onOpenAbout();
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center space-x-2 transition"
              >
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>System Info</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-rose-300 hover:bg-rose-950/60 flex items-center space-x-2 transition font-semibold"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </>
        )}
      </header>
    );
  }

  const companyLabels: Record<CompanyOption, string> = {
    APEX_GLOBAL: 'SiteSync Global Corporate HQ',
    APEX_ME: 'Middle East Infrastructure Division',
    APEX_INDIA: 'South Asia Construction Division',
  };

  const branchLabels: Record<BranchOption, string> = {
    KOCHI_HQ: 'Central Engineering & Project Office',
    TRIVANDRUM_REG: 'Regional Operations Hub',
    CALICUT_SITE: 'Metropolitan Logistics Yard',
    DUBAI_OFFSHORE: 'International Infrastructure Office',
  };

  const projectOptions = [
    { id: 'ALL', label: 'All Enterprise Projects' },
    { id: 'p-101', label: 'Metro Rail Viaduct Segment 4B' },
    { id: 'p-102', label: 'Water Treatment & Transmission Main' },
    { id: 'p-103', label: 'Commercial Complex & Energy Substation' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B192C] text-white border-b border-slate-800 shadow-xl w-full max-w-full">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 w-full">
        <div className="flex items-center justify-between h-16 w-full gap-2">
          
          {/* Left Section: Mobile Toggle, Brand Logo, Sidebar Collapse Button, Context Switchers */}
          <div className="flex items-center space-x-2 min-w-0">
            {/* Mobile Hamburger Drawer Toggle */}
            <button
              onClick={toggleSidebarMobile}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
              aria-label="Toggle Mobile Navigation"
            >
              {isSidebarOpenMobile ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop Sidebar Collapse / Expand Toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition min-h-[44px] min-w-[44px] items-center justify-center"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo & Name */}
            <div
              className="flex items-center space-x-1.5 sm:space-x-2 cursor-pointer shrink-0"
              onClick={onOpenAbout}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="hidden xs:flex flex-col min-w-0">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white font-sans truncate">
                  SiteSync <span className="text-indigo-400">Pro</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center Section: Global Search Bar Button */}
          <div className="flex-1 min-w-0 max-w-[160px] xs:max-w-[220px] sm:max-w-xs md:max-w-md mx-1 sm:mx-2">
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 text-slate-400 text-xs font-medium transition shadow-inner group min-h-[38px]"
            >
              <div className="flex items-center space-x-1.5 min-w-0 truncate">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 group-hover:text-indigo-300 shrink-0" />
                <span className="truncate text-[11px] sm:text-xs">Search ERP...</span>
              </div>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
                ⌘K
              </span>
            </button>
          </div>

          {/* Right Section: Quick Action, Workflows, Notifications, Role Switcher, AI, Dark Mode, Profile */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            
            {/* Quick Action (+ Button) */}
            <button
              onClick={() => setIsQuickCreateOpen(true)}
              className="flex items-center justify-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-md min-h-[38px] min-w-[38px] shrink-0"
              title="Quick Create (Project, Material, Work Order...)"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Quick Action</span>
            </button>

            {/* Workflow Approvals Drawer Button */}
            <button
              onClick={() => setIsWorkflowInboxOpen(true)}
              className="hidden sm:flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition min-h-[38px] min-w-[38px] items-center justify-center relative shrink-0"
              title="Workflow Approvals Queue"
            >
              <Inbox className="w-4.5 h-4.5 text-indigo-400" />
              {pendingWorkflowCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#0B192C]">
                  {pendingWorkflowCount}
                </span>
              )}
            </button>

            {/* Event Notifications Button */}
            <button
              onClick={() => setIsNotificationDrawerOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition min-h-[38px] min-w-[38px] flex items-center justify-center relative shrink-0"
              title="System Alerts & Logs"
            >
              <Bell className="w-4.5 h-4.5 text-amber-400" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-extrabold flex items-center justify-center ring-2 ring-[#0B192C]">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Enterprise Environment Mode Badge & Selector */}
            {deploymentEnv === 'PRODUCTION' ? (
              /* PRODUCTION DEPLOYMENT: Fixed server configuration, controls hidden, subtle operational indicator */
              <div
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 min-h-[36px]"
                title="Production Environment (Server Authoritative)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-semibold tracking-wider">PROD</span>
              </div>
            ) : deploymentEnv === 'UAT' ? (
              /* UAT DEPLOYMENT: Server-authoritative UAT, cannot switch to production through UI */
              <div
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-blue-950/80 text-blue-300 border border-blue-600/80 text-[11px] font-black min-h-[36px]"
                title="UAT Environment (Server Authoritative)"
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="tracking-wide">UAT</span>
              </div>
            ) : (
              /* DEMO / SANDBOX DEPLOYMENT: Demo sandbox preview controls permitted */
              <div className="relative">
                <button
                  onClick={() => setShowEnvDropdown(!showEnvDropdown)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-black transition min-h-[36px] ${
                    environmentMode === 'UAT'
                      ? 'bg-blue-950/80 text-blue-300 border-blue-600/80 hover:bg-blue-900/80 shadow-sm shadow-blue-900/30'
                      : 'bg-amber-950/80 text-amber-300 border-amber-600/80 hover:bg-amber-900/80 shadow-sm shadow-amber-900/30'
                  }`}
                  title="Demo Sandbox Preview Mode — Click to toggle UI preview"
                >
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      environmentMode === 'UAT' ? 'bg-blue-400' : 'bg-amber-400'
                    }`}
                  />
                  <span className="tracking-wide">
                    {environmentMode === 'UAT' ? 'UAT' : 'DEMO SANDBOX'}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {showEnvDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowEnvDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 py-2 text-xs divide-y divide-slate-800">
                      <div className="px-3 py-2 bg-slate-950/60">
                        <p className="font-bold text-slate-300 uppercase text-[10px] tracking-wider">
                          Sandbox View Preview
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Visual preview toggle for testing. Authoritative environment is fixed by server configuration.
                        </p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setEnvironmentMode('DEMO');
                            setShowEnvDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 flex items-start space-x-2.5 hover:bg-slate-800 transition ${
                            environmentMode === 'DEMO' ? 'bg-amber-950/60 text-amber-300 font-bold' : 'text-slate-300'
                          }`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                          <div>
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              DEMO / SANDBOX MODE
                              {environmentMode === 'DEMO' && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-bold">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-normal">
                              Simulated project workflows, sample task records, prefilled test forms, and exploratory role previews.
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setEnvironmentMode('UAT');
                            setShowEnvDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 flex items-start space-x-2.5 hover:bg-slate-800 transition ${
                            environmentMode === 'UAT' ? 'bg-blue-950/60 text-blue-300 font-bold' : 'text-slate-300'
                          }`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                          <div>
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              UAT MODE (Zero-State Verification)
                              {environmentMode === 'UAT' && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-bold">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-normal">
                              Real transactional data only. Zero demo mock records, truthful zero-state verification, and blank forms.
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Role Switcher or Role Badge */}
            {isAuthenticated && (
              <div className="relative hidden md:block">
                {isDemo || (user?.authorizedWorkspaces && user.authorizedWorkspaces.length > 1) ? (
                  <>
                    <button
                      onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                      className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition text-xs font-semibold text-slate-200 min-h-[40px]"
                      title={isDemo ? 'Switch Role View (Demo Preview)' : 'Switch Authorized Workspace'}
                    >
                      <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate max-w-[85px]">
                        {(activeRole && ROLE_CONFIG[activeRole]?.label) || activeRole || 'Role'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>

                    {showRoleDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowRoleDropdown(false)} />
                        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 py-2 text-xs divide-y divide-slate-800">
                          <div className="px-3 py-2 bg-slate-950/60">
                            <p className="font-bold text-slate-300 uppercase text-[10px] tracking-wider">
                              {isDemo ? 'Demo Role Preview (Sandbox)' : 'Authorized Workspaces'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {isDemo ? 'Explore role-specific permissions and views' : 'Assigned roles for your authenticated account'}
                            </p>
                          </div>
                          <div className="max-h-64 overflow-y-auto py-1">
                            {(isDemo ? rolesList : (user?.authorizedWorkspaces?.map(w => w.role as UserRole) || [activeRole || 'ADMIN'])).map((r) => (
                              <button
                                key={r}
                                onClick={() => {
                                  switchRole(r);
                                  setShowRoleDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition ${
                                  r === activeRole ? 'bg-indigo-950/80 text-indigo-300 font-bold' : 'text-slate-300'
                                }`}
                              >
                                <div className="flex flex-col">
                                  <span className="text-xs">{ROLE_CONFIG[r]?.label || r}</span>
                                  <span className="text-[10px] text-slate-400 truncate max-w-[190px]">
                                    {ROLE_CONFIG[r]?.description || 'Operational Workspace'}
                                  </span>
                                </div>
                                {r === activeRole && <span className="w-2 h-2 rounded-full bg-indigo-400"></span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs font-semibold text-slate-300 min-h-[40px]"
                    title="Assigned Account Role (Enforced by RBAC)"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate max-w-[85px]">
                      {(activeRole && ROLE_CONFIG[activeRole]?.label) || activeRole || 'Role'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Help Center & Manual Button */}
            {onOpenHelp && (
              <button
                onClick={onOpenHelp}
                className="hidden sm:flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition min-h-[40px] min-w-[40px] items-center justify-center shrink-0"
                title="Help Center & User Manual"
              >
                <HelpCircle className="w-5 h-5 text-cyan-400" />
              </button>
            )}

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAIAssistant}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-md min-h-[40px] flex items-center space-x-1 shrink-0"
              title="AI Copilot (Gemini 3.6 Flash)"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
              <span className="hidden lg:inline">AI Copilot</span>
            </button>

            {/* Profile Avatar & Menu OR Guest Sign In */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-800 transition shrink-0 min-h-[40px]"
                >
                  <DSAvatar
                    name={user?.name || 'User'}
                    src={user?.avatarUrl}
                    size="sm"
                    isOnline={true}
                  />
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 mt-2 w-64 max-h-[calc(100vh-5rem)] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-3 text-xs space-y-3">
                      <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                        <DSAvatar name={user?.name || 'User'} src={user?.avatarUrl} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-white truncate">{user?.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                          {activeRole && (
                            <span className="mt-1 inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                              {ROLE_CONFIG[activeRole]?.label || activeRole}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={toggleDarkMode}
                          className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 flex items-center justify-between transition"
                        >
                          <div className="flex items-center space-x-2">
                            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                            <span>Settings & Appearance</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{isDarkMode ? 'Dark' : 'Light'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onOpenProfile) onOpenProfile();
                            else onOpenAbout();
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 flex items-center space-x-2 transition"
                        >
                          <Info className="w-4 h-4 text-indigo-400" />
                          <span>My Profile & Account Security</span>
                        </button>

                        <button
                          onClick={() => {
                            logout();
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-950/60 flex items-center space-x-2 transition font-semibold"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 min-h-[40px] shrink-0"
              >
                <UserCheck className="w-4 h-4 text-white shrink-0" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
