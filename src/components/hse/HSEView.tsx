import React from 'react';
import { EnterpriseHSEModule } from './EnterpriseHSEModule';

export const HSEView: React.FC = () => {
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      <EnterpriseHSEModule />
    </div>
  );
};

export default HSEView;
