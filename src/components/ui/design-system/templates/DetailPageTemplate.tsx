import React from 'react';
import { DSPageHeader, BreadcrumbItem, DSContainer } from '../DSPageHeader';
import { DSAutosaveIndicator } from '../DSFormControls';

export interface DetailPageTemplateProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  statusBadge?: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  mainContent: React.ReactNode;
  sidebarContent?: React.ReactNode;
}

export const DetailPageTemplate: React.FC<DetailPageTemplateProps> = ({
  title,
  description,
  breadcrumbs,
  statusBadge,
  actions,
  tabs,
  mainContent,
  sidebarContent,
}) => {
  return (
    <DSContainer>
      <DSPageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        badge={statusBadge}
        actions={actions}
        tabs={tabs}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={sidebarContent ? 'lg:col-span-2 space-y-6' : 'lg:col-span-3 space-y-6'}>
          {mainContent}
        </div>
        {sidebarContent && <div className="space-y-6">{sidebarContent}</div>}
      </div>
    </DSContainer>
  );
};

export interface FormPageTemplateProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  stepper?: React.ReactNode;
  autosaveStatus?: 'saved' | 'saving' | 'draft' | 'error';
  lastSavedAt?: string;
  children: React.ReactNode;
  footerActions: React.ReactNode;
}

export const FormPageTemplate: React.FC<FormPageTemplateProps> = ({
  title,
  description,
  breadcrumbs,
  stepper,
  autosaveStatus,
  lastSavedAt,
  children,
  footerActions,
}) => {
  return (
    <DSContainer max-w-4xl>
      <DSPageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          autosaveStatus && (
            <DSAutosaveIndicator status={autosaveStatus} lastSavedAt={lastSavedAt} />
          )
        }
      />

      {stepper && <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">{stepper}</div>}

      <div className="space-y-6">{children}</div>

      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between mt-6">
        <div>
          {autosaveStatus && (
            <DSAutosaveIndicator status={autosaveStatus} lastSavedAt={lastSavedAt} />
          )}
        </div>
        <div className="flex items-center space-x-2">{footerActions}</div>
      </div>
    </DSContainer>
  );
};
