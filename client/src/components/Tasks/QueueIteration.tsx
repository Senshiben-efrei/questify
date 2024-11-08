import React from 'react';
import { Droppable, Draggable, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { Task, QueueSubTask } from '../../types';
import { XMarkIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

interface QueueIterationProps {
  id: string;
  position: number;
  items: QueueSubTask[];
  frequency: string;
  availableSubTasks: Task[];
  onUpdateSubTask: (subTaskIndex: number, updates: Partial<QueueSubTask>) => void;
  onRemoveSubTask: (subTaskIndex: number) => void;
  onAddSubTask: () => void;
  onRemoveIteration: () => void;
}

const QueueIteration: React.FC<QueueIterationProps> = ({
  id,
  position,
  items,
  frequency,
  availableSubTasks,
  onUpdateSubTask,
  onRemoveSubTask,
  onAddSubTask,
  onRemoveIteration
}) => {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {frequency === 'daily' && `Day ${position + 1}`}
          {frequency === 'weekly' && `Week ${position + 1}`}
          {frequency === 'monthly' && `Month ${position + 1}`}
        </h3>
        <button
          onClick={onRemoveIteration}
          className="text-gray-400 hover:text-red-500"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <Droppable droppableId={`${id}-items`}>
        {(provided: DroppableProvided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {items.map((item, index) => (
              <Draggable
                key={item.id}
                draggableId={item.id}
                index={index}
              >
                {(provided: DraggableProvided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div
                      {...provided.dragHandleProps}
                      className="cursor-move text-gray-400 hover:text-gray-600"
                    >
                      <ArrowsUpDownIcon className="h-5 w-5" />
                    </div>

                    <span className="text-gray-500 font-medium">#{index + 1}</span>

                    <select
                      value={item.sub_task_id}
                      onChange={(e) => onUpdateSubTask(index, { sub_task_id: e.target.value })}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="">Select a sub-task</option>
                      {availableSubTasks.map(subTask => (
                        <option key={subTask.id} value={subTask.id}>
                          {subTask.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="time"
                      value={item.execution_time}
                      onChange={(e) => onUpdateSubTask(index, { execution_time: e.target.value })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => onRemoveSubTask(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <button
        type="button"
        onClick={onAddSubTask}
        className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >
        Add Sub-Task
      </button>

      {items.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No sub-tasks in this {frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'week' : 'month'}. Add some to get started.
        </div>
      )}
    </div>
  );
};

export default QueueIteration; 