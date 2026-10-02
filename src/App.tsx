import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavTab } from './components/layout/Sidebar';
import { AppShell } from './components/layout/AppShell';
import { RoleDashboard } from './components/dashboard/RoleDashboard';
import { ProjectsView } from './components/projects/ProjectsView';
import { InventoryView } from './components/inventory/InventoryView';
import { WorkOrdersView } from './components/workorders/WorkOrdersView';
import { FleetView } from './components/fleet/FleetView';
import { HRView } from './components/hr/HRView';
import { ProcurementView } from './components/procurement/ProcurementView';
import { FinanceView } from './components/finance/FinanceView';
import { DocumentView } from './components/documents/DocumentView';
import { QualityView } from './components/qaqc/QualityView';
import { HSEView } from './components/hse/HSEView';
import { ProjectControlsView } from './components/projectcontrols/ProjectControlsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { WorkflowView } from './components/workflow/WorkflowView';
import { CRMView } from './components/crm/CRMView';
import { MobileView } from './components/mobile/MobileView';
import { AdminView } from './components/admin/AdminView';
import { SchemaInspector } from './components/erp/SchemaInspector';
import { ResourceManagementView } from './components/resources/ResourceManagementView';
import { WaterInfrastructureView } from './components/water/WaterInfrastructureView';
import { EnterpriseAssetManagementModule } from './components/eam/EnterpriseAssetManagementModule';
import { EnterpriseIoTSCADAModule } from './components/iot/EnterpriseIoTSCADAModule';
import { EnterpriseAIIntelligenceModule } from './components/ai/EnterpriseAIIntelligenceModule';
import { EnterpriseAIGatewayModule } from './components/ai-gateway/EnterpriseAIGatewayModule';
import { EnterpriseOperationsCommandCenter } from './components/orchestration/EnterpriseOperationsCommandCenter';
import { EnterpriseMasterDataModule } from './components/master-data/EnterpriseMasterDataModule';
import { OfficeAdminModule } from './components/office-admin/OfficeAdminModule';
import { EnterpriseITManagementModule } from './components/it/EnterpriseITManagementModule';
import { EnterpriseCommercialModule } from './components/commercial/EnterpriseCommercialModule';
import { EnterpriseExpensePettyCashModule } from './components/expenses/EnterpriseExpensePettyCashModule';
import { EnterpriseHelpCenter } from './components/help/EnterpriseHelpCenter';
import { LoginModal } from './components/auth/LoginModal';
import { ForcePasswordChangeModal } from './components/auth/ForcePasswordChangeModal';
import { AboutModal } from './components/about/AboutModal';
import { MyProfileModal } from './components/profile/MyProfileModal';
import { PwaInstallPrompt } from './components/pwa/PwaInstallPrompt';
import { AIAssistantModal } from './components/ai/AIAssistantModal';

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoginModalOpen(false);
    }
  }, [isAuthenticated]);

  const handleNavigateToTab = (tab: NavTab) => {
    if (tab === 'about') {
      setIsAboutModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  // If unauthenticated, show ONLY the non-bypassable Login Modal screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070F1E] flex flex-col items-center justify-center p-4">
        <PwaInstallPrompt />
        <LoginModal
          isOpen={true}
          canClose={false}
          onClose={() => {}}
        />
      </div>
    );
  }

  return (
    <>
      <PwaInstallPrompt />

      <AppShell
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAIAssistant={() => setIsAIModalOpen(true)}
      >
        {activeTab === 'commandCenter' && <EnterpriseOperationsCommandCenter onNavigateTab={setActiveTab} />}
        {activeTab === 'dashboard' && (
          <RoleDashboard
            onNavigateToTab={handleNavigateToTab}
            onOpenAbout={() => setIsAboutModalOpen(true)}
          />
        )}
        {activeTab === 'masterData' && <EnterpriseMasterDataModule onNavigateTab={setActiveTab} />}
        {activeTab === 'aiIntelligence' && <EnterpriseAIIntelligenceModule />}
        {activeTab === 'aiGateway' && <EnterpriseAIGatewayModule />}
        {activeTab === 'crm' && <CRMView />}
        {activeTab === 'mobile' && <MobileView />}
        {activeTab === 'workflow' && <WorkflowView />}
        {activeTab === 'waterInfrastructure' && <WaterInfrastructureView />}
        {activeTab === 'resources' && <ResourceManagementView />}
        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'projectcontrols' && <ProjectControlsView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'workorders' && <WorkOrdersView />}
        {activeTab === 'fleet' && <FleetView />}
        {(activeTab === 'eam' || activeTab === 'machinery') && <EnterpriseAssetManagementModule />}
        {(activeTab === 'iot' || activeTab === 'scada') && <EnterpriseIoTSCADAModule />}
        {activeTab === 'hr' && <HRView />}
        {activeTab === 'procurement' && <ProcurementView />}
        {activeTab === 'finance' && <FinanceView />}
        {activeTab === 'expenses' && <EnterpriseExpensePettyCashModule />}
        {activeTab === 'commercial' && <EnterpriseCommercialModule />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'documents' && <DocumentView />}
        {(activeTab === 'qaqc' || activeTab === 'quality') && <QualityView />}
        {(activeTab === 'hse' || activeTab === 'safety') && <HSEView />}
        {activeTab === 'admin' && <AdminView onNavigateTab={setActiveTab} />}
        {activeTab === 'adminServices' && <OfficeAdminModule />}
        {activeTab === 'itManagement' && <EnterpriseITManagementModule />}
        {activeTab === 'schema' && <SchemaInspector />}
        {activeTab === 'helpCenter' && <EnterpriseHelpCenter onNavigateTab={handleNavigateToTab} />}
        {activeTab === 'about' && (
          <div className="py-2">
            <SchemaInspector />
          </div>
        )}
      </AppShell>

      {/* Global Modals */}
      <ForcePasswordChangeModal />

      <LoginModal
        isOpen={isLoginModalOpen}
        canClose={true}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <MyProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
