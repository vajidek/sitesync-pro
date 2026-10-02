import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface DSPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  className?: string;
}

export const DSPageHeader: React.FC<DSPageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  badge,
  actions,
  tabs,
  className = '',
}) => {
  return (
    <div className={`space-y-4 mb-6 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              {item.onClick || item.href ? (
                <button
                  onClick={item.onClick}
                  className="hover:text-slate-800 dark:hover:text-slate-200 transition font-medium"
                >
                  {item.label}
                </button>
              ) : (
                <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            {badge && <div className="inline-flex shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center space-x-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {tabs && (
        <div className="border-b border-slate-200 dark:border-slate-800 pt-2">
          {tabs}
        </div>
      )}
    </div>
  );
};

export interface DSContainerProps {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
}

export const DSContainer: React.FC<DSContainerProps> = ({
  children,
  className = '',
  fluid = false,
}) => {
  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 ${
        fluid ? 'max-w-full' : 'max-w-7xl'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export interface DSSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const DSSectionHeader: React.FC<DSSectionHeaderProps> = ({
  title,
  subtitle,
  action,
  badge,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 mb-4 ${className}`}>
      <div className="space-y-0.5">
        <div className="flex items-center space-x-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {badge && <div>{badge}</div>}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center space-x-2 shrink-0">{action}</div>}
    </div>
  );
};
