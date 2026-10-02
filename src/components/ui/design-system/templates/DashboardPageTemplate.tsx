import React from 'react';
import { DSPageHeader, BreadcrumbItem } from '../DSPageHeader';
import { DSContainer } from '../DSPageHeader';

export interface DashboardPageTemplateProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  kpis?: React.ReactNode;
  mainContent: React.ReactNode;
  sideContent?: React.ReactNode;
}

export const DashboardPageTemplate: React.FC<DashboardPageTemplateProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  kpis,
  mainContent,
  sideContent,
}) => {
  return (
    <DSContainer>
      <DSPageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />

      {kpis && <div className="space-y-4">{kpis}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={sideContent ? 'lg:col-span-2 space-y-6' : 'lg:col-span-3 space-y-6'}>
          {mainContent}
        </div>
        {sideContent && <div className="space-y-6">{sideContent}</div>}
      </div>
    </DSContainer>
  );
};

export interface ListPageTemplateProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  statsRow?: React.ReactNode;
  table: React.ReactNode;
}

export const ListPageTemplate: React.FC<ListPageTemplateProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  statsRow,
  table,
}) => {
  return (
    <DSContainer>
      <DSPageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />

      {statsRow && <div className="space-y-4">{statsRow}</div>}

      <div className="space-y-4">{table}</div>
    </DSContainer>
  );
};
