import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { Area, Project, Task, TaskType, EvaluationMethod, QueueSubTask, QueueIteration } from '../../types';
import QueueManager from './QueueManager';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: any) => Promise<void>;
  task: Task | null;
  areas: Area[];
  projects: Project[];
  tasks: Task[];
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  areas,
  projects,
  tasks
}) => {
  // Common fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>(TaskType.STANDALONE);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<string>('daily');
  
  // Evaluation fields
  const [evaluationMethod, setEvaluationMethod] = useState<EvaluationMethod>(EvaluationMethod.YES_NO);
  const [targetValue, setTargetValue] = useState<string>('');
  
  // Timing fields
  const [executionTime, setExecutionTime] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Relation fields
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Add queue state
  const [iterations, setIterations] = useState<QueueIteration[]>([]);

  // Initialize form with task data
  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description || '');
      setTaskType(task.task_type);
      setIsRecurring(task.is_recurring);
      setFrequency(task.frequency || 'daily');
      setEvaluationMethod(task.evaluation_method || EvaluationMethod.YES_NO);
      setTargetValue(task.target_value?.toString() || '');
      setExecutionTime(task.execution_time?.toString() || '');
      setStartDate(task.start_date || '');
      setEndDate(task.end_date || '');
      setSelectedAreaId(task.area_id || '');
      setSelectedProjectId(task.project_id || '');
    }
  }, [task]);

  // Initialize queue when task changes
  useEffect(() => {
    if (task && task.queue) {
      if ('iterations' in task.queue) {
        // New format
        setIterations(task.queue.iterations);
      } else {
        // Convert old format to new format
        const oldQueue = task.queue as {
          sub_tasks: Array<{ id: string; position: number; completed: boolean }>;
          rotation_type: string;
        };
        
        // Create a single iteration with the old sub-tasks
        setIterations([{
          id: crypto.randomUUID(),
          position: 0,
          items: oldQueue.sub_tasks.map(subTask => ({
            id: crypto.randomUUID(),
            sub_task_id: subTask.id,
            execution_time: '00:00'  // Default time
          }))
        }]);
      }
    }
  }, [task]);

  // Effect to handle task type changes
  useEffect(() => {
    if (taskType === TaskType.SUB_TASK) {
      setIsRecurring(false);
      setFrequency('daily');
    }
  }, [taskType]);

  // Filter projects based on selected area
  const availableProjects = selectedAreaId 
    ? projects.filter(project => project.area_id === selectedAreaId)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Create task data based on task type
      let taskData;
      switch (taskType) {
        case TaskType.STANDALONE:
          taskData = {
            name,
            description,
            is_recurring: isRecurring,
            frequency: isRecurring ? frequency : null,
            evaluation_method: evaluationMethod,
            target_value: evaluationMethod === EvaluationMethod.NUMERIC ? parseFloat(targetValue) : null,
            execution_time: executionTime ? parseInt(executionTime) : null,
            start_date: startDate || null,
            end_date: endDate || null,
            project_id: selectedProjectId || null,
            area_id: selectedProjectId ? null : selectedAreaId || null,
          };
          break;

        case TaskType.PLACEHOLDER:
          taskData = {
            name,
            description,
            is_recurring: isRecurring,
            frequency: isRecurring ? frequency : null,
            execution_time: executionTime ? parseInt(executionTime) : null,
            start_date: startDate || null,
            end_date: endDate || null,
            queue: {
              iterations,
              rotation_type: "sequential"
            }
          };
          break;

        case TaskType.SUB_TASK:
          taskData = {
            name,
            description,
            is_recurring: false,
            frequency: null,
            evaluation_method: evaluationMethod,
            target_value: evaluationMethod === EvaluationMethod.NUMERIC ? parseFloat(targetValue) : null,
            project_id: selectedProjectId || null,
            area_id: selectedProjectId ? null : selectedAreaId || null,
          };
          break;
      }

      // Send only the taskData, not wrapped in an object
      await onSubmit(task.id, taskData);
      onClose();
    } catch (err: any) {
      // Extract error message from different possible error formats
      const errorMessage = err.response?.data?.detail
          ? typeof err.response.data.detail === 'string'
              ? err.response.data.detail
              : Array.isArray(err.response.data.detail)
                  ? err.response.data.detail[0]?.msg || 'Failed to update task'
                  : 'Failed to update task'
          : 'Failed to update task';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Render the same form structure as AddTaskModal, but with disabled task type selection
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {/* Task Type - Disabled in edit mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Task Type
          </label>
          <input
            type="text"
            value={taskType}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        {/* Common Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        {/* Evaluation Fields - for Standalone and Sub-Tasks */}
        {(taskType === TaskType.STANDALONE || taskType === TaskType.SUB_TASK) && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Evaluation Method
              </label>
              <select
                value={evaluationMethod}
                onChange={(e) => setEvaluationMethod(e.target.value as EvaluationMethod)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value={EvaluationMethod.YES_NO}>Yes/No</option>
                <option value={EvaluationMethod.NUMERIC}>Numeric</option>
              </select>
            </div>

            {evaluationMethod === EvaluationMethod.NUMERIC && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target Value
                </label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>
            )}
          </>
        )}

        {/* Timing Fields - for Standalone and Placeholder Tasks */}
        {(taskType === TaskType.STANDALONE || taskType === TaskType.PLACEHOLDER) && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Execution Time (minutes)
              </label>
              <input
                type="number"
                value={executionTime}
                onChange={(e) => setExecutionTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </>
        )}

        {/* Recurrence Fields - for standalone and placeholder tasks only */}
        {taskType !== TaskType.SUB_TASK && (
          <>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Recurring Task
              </label>
            </div>

            {isRecurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </>
        )}

        {/* Area and Project Selection - for Standalone and Sub-Tasks */}
        {(taskType === TaskType.STANDALONE || taskType === TaskType.SUB_TASK) && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Area (Optional)
              </label>
              <select
                value={selectedAreaId}
                onChange={(e) => {
                  setSelectedAreaId(e.target.value);
                  setSelectedProjectId('');
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">No Area</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedAreaId && availableProjects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project (Optional)
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">No Project</option>
                  {availableProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {taskType === TaskType.PLACEHOLDER && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Queue Management
              </label>
              <QueueManager
                iterations={iterations}
                onIterationsUpdate={setIterations}
                availableSubTasks={tasks.filter(t => t.task_type === TaskType.SUB_TASK)}
                frequency={frequency}
              />
            </div>
          </>
        )}

        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTaskModal;