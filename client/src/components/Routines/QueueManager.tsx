import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Queue, QueueIteration, TaskDefinition, CooldownDefinition } from '../../types/routine';
import { Area } from '../../types/area';
import { Project } from '../../types/project';
import TaskDefinitionForm from './TaskDefinitionForm';
import CooldownForm from './CooldownForm';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { generateUUID } from '../../utils/uuid';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface QueueManagerProps {
  queue: Queue;
  areas: Area[];
  projects: Project[];
  onChange: (queue: Queue) => void;
}

const QueueManager: React.FC<QueueManagerProps> = ({
  queue,
  areas,
  projects,
  onChange
}) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const iterations = Array.from(queue.iterations);
    const [reorderedItem] = iterations.splice(result.source.index, 1);
    iterations.splice(result.destination.index, 0, reorderedItem);

    onChange({
      ...queue,
      iterations: iterations.map((iteration, index) => ({
        ...iteration,
        position: index
      }))
    });
  };

  const addIteration = () => {
    const newIteration: QueueIteration = {
      id: generateUUID(),
      position: queue.iterations.length,
      items: []
    };

    onChange({
      ...queue,
      iterations: [...queue.iterations, newIteration]
    });
  };

  const removeIteration = (iterationId: string) => {
    onChange({
      ...queue,
      iterations: queue.iterations
        .filter(i => i.id !== iterationId)
        .map((iteration, index) => ({
          ...iteration,
          position: index
        }))
    });
  };

  const addTask = (iterationId: string) => {
    const newTask: Partial<TaskDefinition> = {
      id: generateUUID(),
      type: 'TASK',
      name: '',
      evaluation_method: 'YES_NO',
      has_specific_time: false,
      difficulty: 'MEDIUM'
    };

    updateIterationItems(iterationId, newTask);
  };

  const addCooldown = (iterationId: string) => {
    const newCooldown: Partial<CooldownDefinition> = {
      id: generateUUID(),
      type: 'COOLDOWN',
      name: '',
      duration: '1d',
      description: ''
    };

    updateIterationItems(iterationId, newCooldown);
  };

  const updateIterationItems = (iterationId: string, newItem: any) => {
    onChange({
      ...queue,
      iterations: queue.iterations.map(iteration =>
        iteration.id === iterationId
          ? { ...iteration, items: [...iteration.items, newItem] }
          : iteration
      )
    });
  };

  const updateItem = (iterationId: string, itemId: string, updatedItem: any) => {
    onChange({
      ...queue,
      iterations: queue.iterations.map(iteration =>
        iteration.id === iterationId
          ? {
              ...iteration,
              items: iteration.items.map(item =>
                item.id === itemId ? { ...item, ...updatedItem } : item
              )
            }
          : iteration
      )
    });
  };

  const removeItem = (iterationId: string, itemId: string) => {
    onChange({
      ...queue,
      iterations: queue.iterations.map(iteration =>
        iteration.id === iterationId
          ? {
              ...iteration,
              items: iteration.items.filter(item => item.id !== itemId)
            }
          : iteration
      )
    });
  };

  const duplicateIteration = (iteration: QueueIteration) => {
    const newIteration: QueueIteration = {
      ...iteration,
      id: generateUUID(),
      position: queue.iterations.length,
      items: iteration.items.map(item => ({
        ...item,
        id: generateUUID()
      }))
    };

    onChange({
      ...queue,
      iterations: [...queue.iterations, newIteration]
    });
  };

  const duplicateItem = (iterationId: string, item: TaskDefinition | CooldownDefinition) => {
    const newItem = {
      ...item,
      id: generateUUID()
    };

    onChange({
      ...queue,
      iterations: queue.iterations.map(iteration =>
        iteration.id === iterationId
          ? { ...iteration, items: [...iteration.items, newItem] }
          : iteration
      )
    });
  };

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="iterations">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-6"
            >
              {queue.iterations.map((iteration, index) => (
                <Draggable
                  key={iteration.id}
                  draggableId={iteration.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="card bg-base-300/50 backdrop-blur-sm border border-base-content/10 p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          Iteration {index + 1}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => duplicateIteration(iteration)}
                            title="Duplicate Iteration"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-error btn-sm"
                            onClick={() => removeIteration(iteration.id)}
                          >
                            Remove Iteration
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {iteration.items.map((item) => (
                          <div key={item.id} className="relative">
                            <button
                              type="button"
                              className="absolute right-2 top-2 btn btn-ghost btn-sm z-10"
                              onClick={() => duplicateItem(iteration.id, item)}
                              title="Duplicate Item"
                            >
                              <DocumentDuplicateIcon className="h-4 w-4" />
                            </button>

                            {item.type === 'TASK' ? (
                              <TaskDefinitionForm
                                task={item as TaskDefinition}
                                areas={areas}
                                projects={projects}
                                onChange={(updatedTask) =>
                                  updateItem(iteration.id, item.id, updatedTask)
                                }
                                onRemove={() => removeItem(iteration.id, item.id)}
                              />
                            ) : (
                              <CooldownForm
                                cooldown={item as CooldownDefinition}
                                onChange={(updatedCooldown) =>
                                  updateItem(iteration.id, item.id, updatedCooldown)
                                }
                                onRemove={() => removeItem(iteration.id, item.id)}
                              />
                            )}
                          </div>
                        ))}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => addTask(iteration.id)}
                          >
                            Add Task
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => addCooldown(iteration.id)}
                          >
                            Add Cooldown
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        type="button"
        className="btn btn-primary w-full"
        onClick={addIteration}
      >
        Add Iteration
      </button>
    </div>
  );
};

export default QueueManager;