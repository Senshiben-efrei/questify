import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { 
  Task, 
  QueueItem, 
  QueueIteration, 
  QueueItemType 
} from '../../types/index';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import QueueIterationComponent from './QueueIteration';

interface QueueManagerProps {
  iterations: QueueIteration[];
  onIterationsUpdate: (iterations: QueueIteration[]) => void;
  availableSubTasks: Task[];
  frequency?: string;
}

const QueueManager: React.FC<QueueManagerProps> = ({
  iterations,
  onIterationsUpdate,
  availableSubTasks,
  frequency = 'daily'
}) => {
  const addIteration = () => {
    const newIterations = [...iterations];
    newIterations.push({
      id: crypto.randomUUID(),
      position: iterations.length,
      items: []
    });
    onIterationsUpdate(newIterations);
  };

  const removeIteration = (index: number) => {
    const newIterations = iterations.filter((_, i) => i !== index);
    newIterations.forEach((iteration, i) => iteration.position = i);
    onIterationsUpdate(newIterations);
  };

  const addSubTask = (iterationIndex: number) => {
    const newIterations = [...iterations];
    newIterations[iterationIndex].items.push({
      id: crypto.randomUUID(),
      type: QueueItemType.SUB_TASK,
      sub_task_id: '',
      execution_time: '00:00'
    });
    onIterationsUpdate(newIterations);
  };

  const addCooldown = (iterationIndex: number) => {
    const newIterations = [...iterations];
    newIterations[iterationIndex].items.push({
      id: crypto.randomUUID(),
      type: QueueItemType.COOLDOWN,
      duration: '24:00',
      description: 'Rest Day'
    });
    onIterationsUpdate(newIterations);
  };

  const updateQueueItem = (iterationIndex: number, itemIndex: number, updates: Partial<QueueItem>) => {
    const newIterations = [...iterations];
    newIterations[iterationIndex].items[itemIndex] = {
      ...newIterations[iterationIndex].items[itemIndex],
      ...updates
    };
    onIterationsUpdate(newIterations);
  };

  const removeQueueItem = (iterationIndex: number, itemIndex: number) => {
    const newIterations = [...iterations];
    newIterations[iterationIndex].items = newIterations[iterationIndex].items.filter((_, i) => i !== itemIndex);
    onIterationsUpdate(newIterations);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const [sourceIterationId, sourceSubTaskIndex] = result.source.droppableId.split('-');
    const [destIterationId, destSubTaskIndex] = result.destination.droppableId.split('-');

    const newIterations = [...iterations];
    const sourceIteration = newIterations.find(i => i.id === sourceIterationId);
    const destIteration = newIterations.find(i => i.id === destIterationId);

    if (!sourceIteration || !destIteration) return;

    const [movedItem] = sourceIteration.items.splice(result.source.index, 1);
    destIteration.items.splice(result.destination.index, 0, movedItem);

    onIterationsUpdate(newIterations);
  };

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        {iterations.map((iteration, index) => (
          <QueueIterationComponent
            key={iteration.id}
            id={iteration.id}
            position={index}
            items={iteration.items}
            frequency={frequency}
            availableSubTasks={availableSubTasks}
            onUpdateQueueItem={(itemIndex, updates) => updateQueueItem(index, itemIndex, updates)}
            onRemoveQueueItem={(itemIndex) => removeQueueItem(index, itemIndex)}
            onAddSubTask={() => addSubTask(index)}
            onAddCooldown={() => addCooldown(index)}
            onRemoveIteration={() => removeIteration(index)}
          />
        ))}
      </DragDropContext>

      <button
        type="button"
        onClick={addIteration}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Add {frequency === 'daily' ? 'Day' : frequency === 'weekly' ? 'Week' : 'Month'}
      </button>
    </div>
  );
};

export default QueueManager;