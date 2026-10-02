import React from 'react';
import { CREATOR_INFO } from '../../data/mockData';
import { 
  Building2, 
  X, 
  Code2, 
  User, 
  Mail, 
  MapPin, 
  Layers, 
  Database, 
  Smartphone, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Banner */}
        <div className="bg-[#0B192C] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white shadow-xl ring-2 ring-white/20">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white font-sans">
                {CREATOR_INFO.appName}
              </h2>
              <p className="text-xs sm:text-sm text-blue-300 font-medium mt-0.5">
                {CREATOR_INFO.subtitle}
              </p>
              <div className="inline-flex items-center gap-1.5 mt-2 bg-blue-900/60 border border-blue-700/50 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>{CREATOR_INFO.version}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-slate-700 dark:text-slate-300 text-sm max-h-[75vh] overflow-y-auto">
          
          {/* Creator Profile Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 dark:from-slate-800/80 dark:to-slate-900 border border-blue-100 dark:border-slate-700">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md ring-4 ring-blue-100 dark:ring-blue-900/30 flex-shrink-0">
                AV
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400">
                    Lead Creator & Architect
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {CREATOR_INFO.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {CREATOR_INFO.role}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                  {CREATOR_INFO.bio}
                </p>
                
                <div className="pt-3 flex flex-wrap gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700/60 mt-2">
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>{CREATOR_INFO.contact.email}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>{CREATOR_INFO.contact.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Highlights */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Phase 1 System Architecture
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                  <Smartphone className="w-4 h-4 text-emerald-500" /> Responsive PWA
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Adaptive layout optimized for field mobile touch interaction (bottom nav) and desktop engineering supervision (sidebar).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                  <Database className="w-4 h-4 text-blue-500" /> PostgreSQL & Prisma Blueprint
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Scalable ERP data model covering Projects, Sites, Machinery Assets, Material Stores, and Work Orders.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                  <User className="w-4 h-4 text-indigo-500" /> 8-Tier Role Security
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Granular permission controls for Admin, Manager, Incharge, Supervisor, Store Keeper, Driver, Operator, and Worker.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                  <Code2 className="w-4 h-4 text-amber-500" /> Node.js & Express API
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Modular server architecture with clean REST endpoints, JWT authorization simulation, and schema services.
                </p>
              </div>
            </div>
          </div>

          {/* Core Tech Stack Pills */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">
              Technology Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {CREATOR_INFO.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-medium text-xs border border-blue-200 dark:border-slate-700 flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>{tech}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Footer Mandatory Tagline */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {CREATOR_INFO.footerText}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              SiteSync Pro © 2026. All rights reserved. Construction Enterprise ERP.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
