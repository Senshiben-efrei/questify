import React from 'react';
import { format } from 'date-fns';
import { RoutineInstance, TaskInstance } from '../../types/routine';

interface InstanceListProps {
  instances: RoutineInstance[];
  onUpdateTask: (instanceId: string, taskId: string, progress: number) => Promise<void>;
}

interface RadialProgressStyle extends React.CSSProperties {
  '--value': number;
}

const TaskCard: React.FC<{
  task: TaskInstance;
  onComplete: () => Promise<void>;
}> = ({ task, onComplete }) => (
  <div 
    className={`flex items-center justify-between p-4 rounded-lg ${
      task.status === 'completed' 
        ? 'bg-success/10 border border-success/20' 
        : 'bg-base-300/50'
    }`}
  >
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <h4 className="font-medium">{task.name}</h4>
        <span className="badge badge-sm">
          {task.evaluation_method}
        </span>
      </div>
      {task.execution_time && (
        <p className="text-sm text-base-content/70">
          <span className="font-medium">Scheduled:</span> {task.execution_time}
          {task.duration && ` (${task.duration} minutes)`}
        </p>
      )}
      {task.evaluation_method === 'NUMERIC' && task.target_value && (
        <p className="text-sm text-base-content/70">
          <span className="font-medium">Target:</span> {task.target_value}
        </p>
      )}
      {task.completion_date && (
        <p className="text-sm text-success">
          <span className="font-medium">Completed:</span> {format(new Date(task.completion_date), 'PPp')}
        </p>
      )}
    </div>

    <div className="flex items-center gap-4">
      <div 
        className={`radial-progress ${
          task.status === 'completed' ? 'text-success' : ''
        }`}
        style={{ '--value': task.progress } as RadialProgressStyle}
      >
        {task.progress}%
      </div>
      
      {task.status !== 'completed' && (
        <button
          className="btn btn-primary btn-sm"
          onClick={onComplete}
        >
          {task.evaluation_method === 'YES_NO' ? 'Complete' : 'Set Progress'}
        </button>
      )}
    </div>
  </div>
);

const InstanceList: React.FC<InstanceListProps> = ({ instances = [], onUpdateTask }) => {
  console.log('Instances in InstanceList:', instances);

  if (!instances?.length) {
    return (
      <div className="text-center py-8 text-base-content/70">
        No tasks scheduled for today
      </div>
    );
  }

  // Check if tasks are available in each instance
  instances.forEach((instance, index) => {
    console.log(`Instance ${index} tasks:`, instance.tasks);
    console.log(`Instance ${index} task_instances:`, instance.task_instances);
  });

  const getTotalTasks = () => {
    return instances.reduce((acc, instance) => 
      acc + (instance.task_instances?.length || 0), 0
    );
  };

  const getCompletedTasks = () => {
    return instances.reduce((acc, instance) => 
      acc + (instance.task_instances?.filter(t => t.status === 'completed')?.length || 0), 0
    );
  };

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <div className="stats shadow bg-base-200/50 backdrop-blur-sm">
        <div className="stat">
          <div className="stat-title">Total Routines</div>
          <div className="stat-value">{instances.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Total Tasks</div>
          <div className="stat-value">{getTotalTasks()}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Completed Tasks</div>
          <div className="stat-value">{getCompletedTasks()}</div>
        </div>
      </div>

      {/* Routines List */}
      <div className="space-y-6">
        {instances.map(instance => {
          console.log('Rendering instance:', instance);
          console.log('Instance tasks:', instance.tasks);
          
          return (
            <div 
              key={instance.id}
              className="card bg-base-200/50 backdrop-blur-sm border border-base-content/10"
            >
              {/* Routine Header */}
              <div className="card-body">
                <div className="flex justify-between items-center border-b border-base-content/10 pb-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary">
                      {instance.routine_name}
                    </h3>
                    <p className="text-sm text-base-content/70">
                      Iteration {instance.iteration_position + 1} • Due {format(new Date(instance.due_date), 'PPP')}
                    </p>
                  </div>
                  <div className="badge badge-lg">
                    {instance.task_instances?.filter(t => t.status === 'completed')?.length || 0}/
                    {instance.task_instances?.length || 0} Tasks
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-4">
                  {instance.task_instances?.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={() => onUpdateTask(instance.id, task.task_id, 100)}
                    />
                  ))}
                </div>

                {/* Instance Info */}
                <div className="flex justify-between text-xs text-base-content/50 mt-4 pt-4 border-t border-base-content/10">
                  <span>Created: {format(new Date(instance.created_at), 'PPp')}</span>
                  <span>Updated: {format(new Date(instance.updated_at), 'PPp')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstanceList; 