import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats Cards */}
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total XP</div>
            <div className="stat-value">1,200</div>
            <div className="stat-desc">21% more than last month</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Current HP</div>
            <div className="stat-value text-success">89/100</div>
            <div className="stat-desc text-success">↗︎ Healthy</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Active Streaks</div>
            <div className="stat-value">3</div>
            <div className="stat-desc">↗︎ 2 near completion</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Coins</div>
            <div className="stat-value text-warning">450</div>
            <div className="stat-desc">↗︎ 50 earned today</div>
          </div>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-base-content mb-4">Today's Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Active Tasks</h3>
              <div className="space-y-2">
                {/* Task list would go here */}
                <div className="alert alert-info">No active tasks</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Recent Achievements</h3>
              <div className="space-y-2">
                {/* Achievements list would go here */}
                <div className="alert alert-info">No recent achievements</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 