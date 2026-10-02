import React from 'react';
import { EnterpriseFinanceModule } from './EnterpriseFinanceModule';

export const FinanceView: React.FC = () => {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <EnterpriseFinanceModule />
    </div>
  );
};
