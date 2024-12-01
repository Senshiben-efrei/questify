import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Queue, QueueIteration, TaskDefinition, CooldownDefinition } from '../../types/routine';
import { Area } from '../../types/area';
import { Project } from '../../types/project';
import TaskDefinitionForm from './TaskDefinitionForm';
import CooldownForm from './CooldownForm';

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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
      type: 'TASK',
      name: '',
      evaluation_method: 'YES_NO',
      has_specific_time: false
    };

    updateIterationItems(iterationId, newTask);
  };

  const addCooldown = (iterationId: string) => {
    const newCooldown: Partial<CooldownDefinition> = {
      id: crypto.randomUUID(),
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
                        <button
                          type="button"
                          className="btn btn-error btn-sm"
                          onClick={() => removeIteration(iteration.id)}
                        >
                          Remove Iteration
                        </button>
                      </div>

                      <div className="space-y-4">
                        {iteration.items.map((item) => (
                          <div key={item.id}>
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
                                onChange={(updatedCooldown: Partial<CooldownDefinition>) =>
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