import React from 'react';
import { TaskInstance } from '../../types/routine';
import { format, isBefore } from 'date-fns';
import {
  StarIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface TaskInstanceCardProps {
  task: TaskInstance & { routine_name?: string; due_date?: Date };
  onUpdateProgress: (progress: number) => void;
}

const TaskInstanceCard: React.FC<TaskInstanceCardProps> = ({ task, onUpdateProgress }) => {
  const getDifficultyIcon = () => {
    switch (task.difficulty) {
      case 'TRIVIAL':
        return <SparklesIcon className="h-5 w-5 text-gray-400" />;
      case 'EASY':
        return <StarIcon className="h-5 w-5 text-success" />;
      case 'MEDIUM':
        return <FireIcon className="h-5 w-5 text-warning" />;
      case 'HARD':
        return <BoltIcon className="h-5 w-5 text-error" />;
      default:
        return null;
    }
  };

  const getStatusClasses = () => {
    const isOverdue = task.due_date && isBefore(task.due_date, new Date().setHours(0, 0, 0, 0));

    switch (task.status) {
      case 'completed':
        return 'bg-success/10 border-success/20';
      case 'due':
      case 'pending':
        return isOverdue 
          ? 'bg-error/10 border-error/20 border-2' 
          : 'bg-warning/10 border-warning/20';
      default:
        return 'bg-base-200/50';
    }
  };

  return (
    <div className={`card ${getStatusClasses()} border backdrop-blur-sm`}>
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getDifficultyIcon()}
              <h3 className="font-medium">{task.name}</h3>
            </div>
            {task.execution_time && (
              <p className="text-sm text-base-content/70">
                {task.execution_time}
                {task.duration && ` (${task.duration} minutes)`}
              </p>
            )}
          </div>

          {task.status !== 'completed' && (
            <div className="flex items-center gap-2">
              {task.evaluation_method === 'YES_NO' ? (
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => onUpdateProgress(100)}
                >
                  Complete
                </button>
              ) : (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={task.progress}
                  onChange={(e) => onUpdateProgress(parseInt(e.target.value))}
                  className="range range-xs range-primary"
                />
              )}
            </div>
          )}
        </div>

        {task.status === 'completed' && task.completion_date && (
          <p className="text-xs text-success mt-2">
            Completed at {format(new Date(task.completion_date), 'HH:mm')}
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskInstanceCard; 