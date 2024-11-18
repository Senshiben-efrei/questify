import React from 'react';
import PageContainer from '../../components/PageContainer';

const Progress: React.FC = () => {
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold text-base-content mb-8">Progress Tracking</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Area Progress */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Area Progress</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Health</span>
                <progress className="progress progress-success w-56" value="40" max="100"></progress>
              </div>
              <div className="flex justify-between items-center">
                <span>Finance</span>
                <progress className="progress progress-info w-56" value="70" max="100"></progress>
              </div>
              <div className="flex justify-between items-center">
                <span>Learning</span>
                <progress className="progress progress-warning w-56" value="25" max="100"></progress>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Recent Achievements</h2>
            <div className="space-y-2">
              <div className="alert">No achievements yet</div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Statistics</h2>
            <div className="stats stats-vertical shadow">
              <div className="stat">
                <div className="stat-title">Tasks Completed</div>
                <div className="stat-value">31</div>
                <div className="stat-desc">Jan 1st - Feb 1st</div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Current Streak</div>
                <div className="stat-value">4 days</div>
                <div className="stat-desc">↗︎ Longest: 7 days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Analytics</h2>
            <div className="alert">Analytics visualization coming soon</div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Progress; 