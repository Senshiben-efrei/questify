import React from 'react';
import { PlusIcon, XMarkIcon, ClockIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { Task, QueueItem, QueueItemType } from '../../types';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';

interface QueueManagerProps {
  queue: QueueItem[];
  onQueueUpdate: (queue: QueueItem[]) => void;
  availableSubTasks: Task[];
  frequency?: string;
}

const QueueManager: React.FC<QueueManagerProps> = ({
  queue,
  onQueueUpdate,
  availableSubTasks,
  frequency = 'daily'
}) => {
  const addSubTask = () => {
    const newQueue = [...queue];
    newQueue.push({
      id: crypto.randomUUID(),
      type: QueueItemType.SUB_TASK,
      position: queue.length,
      sub_task_id: ''
    });
    onQueueUpdate(newQueue);
  };

  const addCooldown = () => {
    const newQueue = [...queue];
    newQueue.push({
      id: crypto.randomUUID(),
      type: QueueItemType.COOLDOWN,
      position: queue.length
    });
    onQueueUpdate(newQueue);
  };

  const updateQueueItem = (index: number, updates: Partial<QueueItem>) => {
    const newQueue = [...queue];
    newQueue[index] = { ...newQueue[index], ...updates };
    onQueueUpdate(newQueue);
  };

  const removeQueueItem = (index: number) => {
    const newQueue = queue.filter((_, i) => i !== index);
    newQueue.forEach((item, i) => item.position = i);
    onQueueUpdate(newQueue);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(queue);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    items.forEach((item, index) => {
      item.position = index;
    });

    onQueueUpdate(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={addSubTask}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Sub-Task
        </button>
        <button
          type="button"
          onClick={addCooldown}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700"
        >
          <ClockIcon className="h-5 w-5 mr-2" />
          Add Cooldown Period
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="queue" type="QUEUE_ITEM">
          {(provided: DroppableProvided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2 min-h-[50px]"
            >
              {queue.map((item, index) => (
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
                      
                      {item.type === QueueItemType.SUB_TASK ? (
                        <select
                          value={item.sub_task_id || ''}
                          onChange={(e) => updateQueueItem(index, { sub_task_id: e.target.value })}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                          <option value="">Select a sub-task</option>
                          {availableSubTasks.map(subTask => (
                            <option key={subTask.id} value={subTask.id}>
                              {subTask.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex-1 flex items-center space-x-2">
                          <ClockIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {frequency === 'daily' && 'Skip one day'}
                            {frequency === 'weekly' && 'Skip one week'}
                            {frequency === 'monthly' && 'Skip one month'}
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeQueueItem(index)}
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
      </DragDropContext>

      {queue.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No items in queue. Add sub-tasks or cooldowns to get started.
        </div>
      )}
    </div>
  );
};

export default QueueManager;