import React from 'react';

const Calendar: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-base-content mb-8">Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar View */}
        <div className="lg:col-span-2 card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Monthly View</h2>
            <div className="alert">Calendar component coming soon</div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Upcoming Tasks</h2>
            <div className="space-y-2">
              <div className="alert">No upcoming tasks</div>
            </div>
          </div>
        </div>

        {/* Routines */}
        <div className="lg:col-span-3 card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="card-title">Routines</h2>
              <button className="btn btn-primary">New Routine</button>
            </div>
            <div className="alert">No routines created</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 