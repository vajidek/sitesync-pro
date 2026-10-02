import React from 'react';
import { EnterpriseMobileOperations } from './EnterpriseMobileOperations';

export const MobileView: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6" id="mobile-field-operations-root">
      <EnterpriseMobileOperations />
    </div>
  );
};

export default MobileView;
