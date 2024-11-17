import React from 'react';

const TaskSystem: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-base-content mb-8">Task System</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Task Categories */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Task Categories</h2>
            <div className="space-y-2">
              <button className="btn btn-outline w-full">Daily Tasks</button>
              <button className="btn btn-outline w-full">Weekly Tasks</button>
              <button className="btn btn-outline w-full">Monthly Tasks</button>
              <button className="btn btn-outline w-full">One-time Tasks</button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">Tasks</h2>
                <button className="btn btn-primary">New Task</button>
              </div>
              <div className="space-y-2">
                <div className="alert">No tasks found</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskSystem; 