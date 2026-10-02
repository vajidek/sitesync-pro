import React from 'react';
import { EnterpriseQualityModule } from './EnterpriseQualityModule';

export const QualityView: React.FC = () => {
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      <EnterpriseQualityModule />
    </div>
  );
};

export default QualityView;
