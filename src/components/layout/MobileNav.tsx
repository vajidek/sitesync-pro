import React from 'react';
import { NavTab } from './Sidebar';
import { useDeviceProfile } from '../../hooks/useDeviceProfile';
import { 
  LayoutDashboard, 
  Building2, 
  ClipboardCheck, 
  Boxes, 
  ShieldCheck,
  Truck,
  Users,
  Database,
  Droplets
} from 'lucide-react';

interface MobileNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const device = useDeviceProfile();

  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'waterInfrastructure', label: 'Utilities', icon: <Droplets className="w-5 h-5 text-cyan-400" /> },
    { id: 'projects', label: 'Projects', icon: <Building2 className="w-5 h-5" /> },
    { id: 'fleet', label: 'Fleet', icon: <Truck className="w-5 h-5" /> },
    { id: 'admin', label: 'Admin', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  const isLandscapePhone = device.isLandscapePhone;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B192C] border-t border-slate-800 shadow-2xl px-1 w-full max-w-full overflow-x-hidden"
      style={{
        paddingTop: isLandscapePhone ? '2px' : '4px',
        paddingBottom: isLandscapePhone
          ? 'calc(2px + env(safe-area-inset-bottom, 0px))'
          : 'calc(4px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="flex items-center justify-between w-full max-w-full mx-auto min-w-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center rounded-lg transition duration-150 text-center ${
                isLandscapePhone ? 'min-h-[34px] py-0.5' : 'min-h-[44px] px-0.5 py-1'
              } ${
                isActive
                  ? 'text-blue-400 font-bold bg-blue-950/80 border border-blue-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`flex items-center justify-center ${isActive ? 'scale-105 text-blue-400 transition-transform' : ''}`}>
                {tab.icon}
              </div>
              {!isLandscapePhone && (
                <span className="text-[9px] tracking-tight mt-0.5 font-medium truncate w-full text-center">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
