import React, { useState } from 'react';
import { Routine } from '../../types/routine';
import { Area } from '../../types/area';
import { Project } from '../../types/project';
import AddRoutineModal from './AddRoutineModal';
import EditRoutineModal from './EditRoutineModal';
import ConfirmationModal from '../ConfirmationModal';
import { PencilIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline';

interface RoutineListProps {
  routines: Routine[];
  areas: Area[];
  projects: Project[];
  onAdd: (data: any) => Promise<void>;
  onEdit: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const RoutineList: React.FC<RoutineListProps> = ({
  routines = [],
  areas = [],
  projects = [],
  onAdd,
  onEdit,
  onDelete
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = (routine: Routine) => {
    setSelectedRoutine(routine);
    setIsEditModalOpen(true);
  };

  const handleDelete = (routine: Routine) => {
    setSelectedRoutine(routine);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Routines</h2>
        <div className="flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Routine
          </button>
        </div>
      </div>

      {/* Routine List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routines.map(routine => (
          <div
            key={routine.id}
            className="card bg-base-200/50 backdrop-blur-sm border border-base-content/10"
          >
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="card-title">{routine.name}</h3>
                  {routine.description && (
                    <p className="text-sm text-base-content/70">
                      {routine.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleEdit(routine)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => handleDelete(routine)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Routine Details */}
              <div className="mt-4 space-y-3">
                {/* Schedule Information */}
                <div className="flex items-center gap-2">
                  <div className={`badge ${routine.is_recurring ? 'badge-primary' : 'badge-ghost'}`}>
                    {routine.is_recurring ? `${routine.frequency}` : 'One-time'}
                  </div>
                  {routine.is_recurring && routine.start_date && (
                    <div className="badge badge-ghost">
                      Starts {new Date(routine.start_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Queue Summary */}
                <div className="bg-base-300/30 rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium">Queue Structure:</div>
                  <div className="space-y-1">
                    {routine.queue.iterations.map((iteration, index) => (
                      <div key={iteration.id} className="text-sm flex justify-between items-center">
                        <span>Iteration {index + 1}:</span>
                        <div className="flex gap-2">
                          <span className="text-primary">
                            {iteration.items.filter(item => item.type === 'TASK').length} Tasks
                          </span>
                          <span className="text-secondary">
                            {iteration.items.filter(item => item.type === 'COOLDOWN').length} Cooldowns
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Details */}
                <div className="text-sm space-y-1">
                  <div className="font-medium">Tasks Overview:</div>
                  {routine.queue.iterations.flatMap(iteration => 
                    iteration.items.filter(item => item.type === 'TASK')
                  ).map((task: any) => (
                    <div key={task.id} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span>{task.name}</span>
                      {task.has_specific_time && (
                        <span className="text-base-content/70">
                          at {task.execution_time}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Date Range */}
                {routine.is_recurring && routine.start_date && routine.end_date && (
                  <div className="text-xs text-base-content/70">
                    Active from {new Date(routine.start_date).toLocaleDateString()} 
                    to {new Date(routine.end_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <AddRoutineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onAdd}
        areas={areas}
        projects={projects}
      />

      <EditRoutineModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRoutine(null);
        }}
        onSubmit={onEdit}
        routine={selectedRoutine}
        areas={areas}
        projects={projects}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRoutine(null);
        }}
        onConfirm={async () => {
          if (selectedRoutine) {
            await onDelete(selectedRoutine.id);
            setIsDeleteModalOpen(false);
            setSelectedRoutine(null);
          }
        }}
        title="Delete Routine"
        message={`Are you sure you want to delete "${selectedRoutine?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default RoutineList; 