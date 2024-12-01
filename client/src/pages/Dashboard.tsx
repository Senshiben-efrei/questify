import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import { ClockIcon } from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link 
            to="/setup" 
            className="card bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20"
          >
            <div className="card-body flex flex-row items-center">
              <ClockIcon className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <h2 className="card-title">Setup</h2>
                <p className="text-base-content/70">Set it and forget it</p>
              </div>
            </div>
          </Link>

          {/* Placeholder for future features */}
          <div className="card bg-base-200/50 backdrop-blur-sm border border-base-content/10">
            <div className="card-body">
              <h2 className="card-title">Statistics</h2>
              <p className="text-base-content/70">Coming soon...</p>
            </div>
          </div>

          <div className="card bg-base-200/50 backdrop-blur-sm border border-base-content/10">
            <div className="card-body">
              <h2 className="card-title">Achievements</h2>
              <p className="text-base-content/70">Coming soon...</p>
            </div>
          </div>
        </div>

        {/* Today's Overview */}
        <div className="card bg-base-200/50 backdrop-blur-sm border border-base-content/10">
          <div className="card-body">
            <h2 className="card-title">Today's Overview</h2>
            <p className="text-base-content/70">
              Task tracking functionality will be available soon.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard; 