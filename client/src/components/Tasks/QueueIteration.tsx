import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Task, QueueItem } from '../../types';
import { XMarkIcon, ArrowsUpDownIcon, PlusIcon, ClockIcon } from '@heroicons/react/24/outline';

interface QueueIterationProps {
  id: string;
  position: number;
  items: QueueItem[];
  isCooldown: boolean;
  cooldownDuration?: string;
  cooldownDescription?: string;
  frequency: string;
  availableSubTasks: Task[];
  onUpdateQueueItem: (itemIndex: number, updates: Partial<QueueItem>) => void;
  onRemoveQueueItem: (itemIndex: number) => void;
  onAddSubTask: () => void;
  onUpdateCooldown: (duration: string, description: string) => void;
  onRemoveIteration: () => void;
  onToggleCooldown: () => void;
}

const QueueIteration: React.FC<QueueIterationProps> = ({
  id,
  position,
  items,
  isCooldown,
  cooldownDuration = '24:00',
  cooldownDescription = 'Rest Day',
  frequency,
  availableSubTasks,
  onUpdateQueueItem,
  onRemoveQueueItem,
  onAddSubTask,
  onUpdateCooldown,
  onRemoveIteration,
  onToggleCooldown
}) => {
  return (
    <div className="space-y-4 p-4 bg-base-200/50 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {frequency === 'daily' && `Day ${position + 1}`}
          {frequency === 'weekly' && `Week ${position + 1}`}
          {frequency === 'monthly' && `Month ${position + 1}`}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCooldown}
            className="btn btn-sm btn-ghost"
          >
            Rest Day
          </button>
          <button
            type="button"
            onClick={onRemoveIteration}
            className="btn btn-sm btn-ghost btn-error"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isCooldown ? (
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={cooldownDescription}
            onChange={(e) => onUpdateCooldown(cooldownDuration, e.target.value)}
            placeholder="Rest Day Description"
            className="input input-bordered flex-1"
          />
          <input
            type="time"
            value={cooldownDuration}
            onChange={(e) => onUpdateCooldown(e.target.value, cooldownDescription)}
            className="input input-bordered w-32"
          />
        </div>
      ) : (
        <>
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
                        className="flex flex-col gap-2 p-4 bg-base-100/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-move text-base-content/70 hover:text-base-content"
                          >
                            <ArrowsUpDownIcon className="h-5 w-5" />
                          </div>

                          <span className="text-base-content/70 font-medium">#{index + 1}</span>

                          <select
                            value={item.sub_task_id || ''}
                            onChange={(e) => onUpdateQueueItem(index, { sub_task_id: e.target.value })}
                            className="select select-bordered flex-1"
                          >
                            <option value="">Select a sub-task</option>
                            {availableSubTasks.map(subTask => (
                              <option key={subTask.id} value={subTask.id}>
                                {subTask.name}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => onUpdateQueueItem(index, { 
                              has_duration: !item.has_duration 
                            })}
                            className={`btn btn-sm btn-ghost ${item.has_duration ? 'text-primary' : 'text-base-content/70'}`}
                            title="Toggle duration"
                          >
                            <ClockIcon className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onRemoveQueueItem(index)}
                            className="btn btn-sm btn-ghost text-error"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {item.has_duration && (
                          <div className="flex items-center gap-4 pl-14">
                            <input
                              type="number"
                              value={item.duration_minutes || ''}
                              onChange={(e) => onUpdateQueueItem(index, { 
                                duration_minutes: parseInt(e.target.value) || 0 
                              })}
                              placeholder="Duration in minutes"
                              className="input input-bordered input-sm w-40"
                              min="1"
                            />
                            <span className="text-sm text-base-content/70">minutes</span>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="mt-4">
            <button
              type="button"
              onClick={onAddSubTask}
              className="btn btn-sm btn-primary"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Sub-Task
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default QueueIteration; 