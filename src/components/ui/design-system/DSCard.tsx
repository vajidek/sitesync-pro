import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface DSCardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const DSCard: React.FC<DSCardProps> = ({
  children,
  className = '',
  header,
  footer,
  noPadding = false,
}) => {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-all ${className}`}>
      {header && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

export interface DSStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: string;
    label?: string;
  };
  progress?: number; // 0 to 100
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
  className?: string;
}

export const DSStatCard: React.FC<DSStatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  progress,
  accentColor = 'indigo',
  className = '',
}) => {
  const accentStyles = {
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400',
    slate: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
  };

  const progressBg = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-600',
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {title}
          </span>
          {icon && (
            <div className={`p-2.5 rounded-xl ${accentStyles[accentColor]}`}>
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
            {value}
          </span>

          {trend && (
            <div
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                trend.direction === 'up'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : trend.direction === 'down'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend.direction === 'neutral' && <Minus className="w-3 h-3" />}
              <span>{trend.percentage}</span>
            </div>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-4 space-y-1">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${progressBg[accentColor]}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
