import React from 'react';

const Social: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-base-content mb-8">Social & Community</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Friends List */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Friends</h2>
            <div className="space-y-2">
              <div className="alert">No friends added yet</div>
              <button className="btn btn-primary w-full">Find Friends</button>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Leaderboard</h2>
            <div className="space-y-2">
              <div className="alert">No data available</div>
            </div>
          </div>
        </div>

        {/* Challenges */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Active Challenges</h2>
            <div className="space-y-2">
              <div className="alert">No active challenges</div>
              <button className="btn btn-primary w-full">Browse Challenges</button>
            </div>
          </div>
        </div>

        {/* Task Hub */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Task Hub</h2>
            <div className="space-y-2">
              <div className="alert">No shared tasks</div>
              <button className="btn btn-primary w-full">Browse Task Hub</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Social; 