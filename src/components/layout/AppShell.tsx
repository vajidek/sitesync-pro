import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar, NavTab } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { AppBreadcrumb } from './AppBreadcrumb';
import { GlobalSearchModal } from './GlobalSearchModal';
import { QuickActionModal } from './QuickActionModal';
import { NotificationDrawer } from './NotificationDrawer';
import { WorkflowInboxDrawer } from './WorkflowInboxDrawer';
import { ShellProvider, useShell } from './ShellContext';

export interface AppShellProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenAbout: () => void;
  onOpenLogin: () => void;
  onOpenProfile?: () => void;
  onOpenAIAssistant: () => void;
  children: React.ReactNode;
}

const AppShellInner: React.FC<AppShellProps> = ({
  activeTab,
  setActiveTab,
  onOpenAbout,
  onOpenLogin,
  onOpenProfile,
  onOpenAIAssistant,
  children,
}) => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    isQuickCreateOpen,
    setIsQuickCreateOpen,
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    isWorkflowInboxOpen,
    setIsWorkflowInboxOpen,
  } = useShell();

  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Keyboard Navigation & Shortcuts (Cmd+K / Ctrl+K for search, Esc to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsGlobalSearchOpen(false);
        setIsQuickCreateOpen(false);
        setIsNotificationDrawerOpen(false);
        setIsWorkflowInboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-full max-w-full overflow-hidden flex flex-col bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-600 selection:text-white relative transition-colors duration-200">
      
      {/* Topbar Navigation (Fixed Header) */}
      <Navbar
        onOpenAbout={onOpenAbout}
        onOpenLogin={onOpenLogin}
        onOpenProfile={onOpenProfile}
        onOpenAIAssistant={onOpenAIAssistant}
        onOpenHelp={() => setActiveTab('helpCenter')}
        toggleSidebarMobile={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
        isSidebarOpenMobile={isSidebarOpenMobile}
      />

      {/* Main App Layout Body (Flex Container Below Fixed Topbar) */}
      <div className="flex-1 flex w-full overflow-hidden relative min-h-0">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />

        {/* Main Content Workspace with Independent Scroll */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-slate-50 dark:bg-[#020617] scrollbar-thin">
          <div className="min-h-full flex flex-col max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4">
            {/* Automatic Breadcrumb Header */}
            <div className="mb-3 shrink-0">
              <AppBreadcrumb activeTab={activeTab} onNavigateTab={setActiveTab} />
            </div>

            {/* Render Active View Content */}
            <div className="flex-1 animate-in fade-in duration-150 pb-20 lg:pb-6">
              {children}
            </div>

            {/* Global Workspace Footer - Rendered after all workspace/dashboard content */}
            <Footer onOpenAbout={onOpenAbout} />
          </div>
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Enterprise Shell Modals & Drawers */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onNavigateTab={setActiveTab}
      />

      <QuickActionModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />

      <WorkflowInboxDrawer
        isOpen={isWorkflowInboxOpen}
        onClose={() => setIsWorkflowInboxOpen(false)}
      />
    </div>
  );
};

export const AppShell: React.FC<AppShellProps> = (props) => {
  return (
    <ShellProvider>
      <AppShellInner {...props} />
    </ShellProvider>
  );
};
