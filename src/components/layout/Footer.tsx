import React from 'react';
import { CREATOR_INFO } from '../../data/mockData';
import { Building2, Heart, Code2, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenAbout: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => {
  return (
    <footer className="w-full shrink-0 mt-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-600 dark:text-slate-400 text-xs shadow-xs">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Branding & Subtitle */}
        <div className="flex items-center space-x-3 text-center md:text-left">
          <div className="w-7 h-7 rounded-lg bg-[#0B192C] text-white flex items-center justify-center font-bold">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-xs">
              SiteSync Pro
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {CREATOR_INFO.subtitle}
            </div>
          </div>
        </div>

        {/* Center: Creator Credit */}
        <div className="text-center font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center space-x-2 text-[11px]">
          <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Designed & Developed by <strong className="text-blue-700 dark:text-blue-400 font-bold">{CREATOR_INFO.name}</strong></span>
          <button
            onClick={onOpenAbout}
            className="ml-1.5 text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 py-0.5 rounded-full transition cursor-pointer"
          >
            Creator Profile
          </button>
        </div>

        {/* Right: Architecture Badge */}
        <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Phase 1 ERP Core</span>
          </div>
          <span>•</span>
          <span>PostgreSQL + Prisma</span>
        </div>

      </div>
    </footer>
  );
};
