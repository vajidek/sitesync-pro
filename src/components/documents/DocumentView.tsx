import React from 'react';
import { EnterpriseDocumentManagement } from './EnterpriseDocumentManagement';

export const DocumentView: React.FC = () => {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <EnterpriseDocumentManagement />
    </div>
  );
};
