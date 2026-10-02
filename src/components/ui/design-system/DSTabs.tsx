import React, { useState } from 'react';
import { ChevronDown, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface DSTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pills' | 'cards';
  className?: string;
}

export const DSTabs: React.FC<DSTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-2 overflow-x-auto scrollbar-none py-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === 'underline') {
          return (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`px-3 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed ${
              isActive
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
}

export interface DSAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export const DSAccordion: React.FC<DSAccordionProps> = ({
  items,
  allowMultiple = false,
  className = '',
}) => {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.defaultOpen) initial[item.id] = true;
    });
    return initial;
  });

  const toggle = (id: string) => {
    setOpenMap((prev) => {
      if (allowMultiple) {
        return { ...prev, [id]: !prev[id] };
      }
      return { [id]: !prev[id] };
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const isOpen = !!openMap[item.id];
        return (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs"
          >
            <button
              onClick={() => toggle(item.id)}
              className="w-full px-5 py-3.5 text-left flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center space-x-3">
                {item.icon && <span className="text-indigo-600 dark:text-indigo-400">{item.icon}</span>}
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</h4>
                  {item.subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{item.subtitle}</p>}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 text-xs text-slate-600 dark:text-slate-300">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  actor?: string;
  description?: string;
  status?: 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';
}

export interface DSTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const DSTimeline: React.FC<DSTimelineProps> = ({ events, className = '' }) => {
  const iconMap = {
    SUCCESS: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
    WARNING: <AlertCircle className="w-3.5 h-3.5 text-amber-500" />,
    DANGER: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />,
    INFO: <Clock className="w-3.5 h-3.5 text-indigo-500" />,
  };

  return (
    <div className={`space-y-4 pl-3 relative border-l-2 border-slate-200 dark:border-slate-800 ml-2 ${className}`}>
      {events.map((evt) => (
        <div key={evt.id} className="relative pl-5 group">
          <div className="absolute -left-[23px] top-0.5 p-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-xs">
            {iconMap[evt.status || 'INFO']}
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white">{evt.title}</span>
              <span className="text-[10px] font-mono text-slate-400">{evt.timestamp}</span>
            </div>

            {evt.actor && (
              <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-medium">
                <User className="w-3 h-3 text-slate-400" />
                <span>{evt.actor}</span>
              </div>
            )}

            {evt.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 mt-1">
                {evt.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
