import React from 'react';
import PageContainer from '../components/PageContainer';

const Settings: React.FC = () => {
  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        
        {/* Placeholder for future settings */}
        <div className="card bg-base-200/50 backdrop-blur-sm border border-base-content/10">
          <div className="card-body">
            <p className="text-base-content/70">
              Settings functionality will be implemented in a future update.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Settings; 