import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Task, 
  QueueItem, 
  QueueItemType 
} from '../../types/index';
import { XMarkIcon, ArrowsUpDownIcon, PlusIcon } from '@heroicons/react/24/outline';

interface QueueIterationProps {
  id: string;
  position: number;
  items: QueueItem[];
  frequency: string;
  availableSubTasks: Task[];
  onUpdateQueueItem: (itemIndex: number, updates: Partial<QueueItem>) => void;
  onRemoveQueueItem: (itemIndex: number) => void;
  onAddSubTask: () => void;
  onAddCooldown: () => void;
  onRemoveIteration: () => void;
}

const QueueIteration: React.FC<QueueIterationProps> = ({
  id,
  position,
  items,
  frequency,
  availableSubTasks,
  onUpdateQueueItem,
  onRemoveQueueItem,
  onAddSubTask,
  onAddCooldown,
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
        {(provided) => (
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
                {(provided) => (
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

                    {item.type === QueueItemType.SUB_TASK ? (
                      <>
                        <select
                          value={(item as any).sub_task_id}
                          onChange={(e) => onUpdateQueueItem(index, { sub_task_id: e.target.value })}
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
                          value={(item as any).execution_time}
                          onChange={(e) => onUpdateQueueItem(index, { execution_time: e.target.value })}
                          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={(item as any).description || ''}
                          onChange={(e) => onUpdateQueueItem(index, { description: e.target.value })}
                          placeholder="Rest Day Description"
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                        <input
                          type="time"
                          value={(item as any).duration}
                          onChange={(e) => onUpdateQueueItem(index, { duration: e.target.value })}
                          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => onRemoveQueueItem(index)}
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

      <div className="mt-4 flex space-x-2">
        <button
          type="button"
          onClick={onAddSubTask}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Sub-Task
        </button>
        <button
          type="button"
          onClick={onAddCooldown}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Rest Day
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No items in this {frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'week' : 'month'}. Add some to get started.
        </div>
      )}
    </div>
  );
};

export default QueueIteration; 