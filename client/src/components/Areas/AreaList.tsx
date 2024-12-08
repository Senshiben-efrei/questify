import React, { useState } from 'react';
import { Area } from '../../types/area';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import AddAreaModal from './AddAreaModal';
import EditAreaModal from './EditAreaModal';
import ConfirmationModal from '../ConfirmationModal';

interface AreaListProps {
  areas: Area[];
  onAdd: (data: Partial<Area>) => Promise<void>;
  onEdit: (id: string, data: Partial<Area>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const AreaList: React.FC<AreaListProps> = ({
  areas = [],
  onAdd,
  onEdit,
  onDelete
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Areas</h2>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Area
        </button>
      </div>

      {/* Area Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {areas.map(area => (
          <div
            key={area.id}
            className="card bg-base-200/50 backdrop-blur-sm border border-base-content/10"
          >
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="card-title">{area.name}</h3>
                  {area.description && (
                    <p className="text-sm text-base-content/70">
                      {area.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setSelectedArea(area);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => {
                      setSelectedArea(area);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <div className="badge badge-neutral">
                  {area.xp} XP
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <AddAreaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onAdd}
      />

      <EditAreaModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedArea(null);
        }}
        onSubmit={onEdit}
        area={selectedArea}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedArea(null);
        }}
        onConfirm={async () => {
          if (selectedArea) {
            await onDelete(selectedArea.id);
            setIsDeleteModalOpen(false);
            setSelectedArea(null);
          }
        }}
        title="Delete Area"
        message={`Are you sure you want to delete "${selectedArea?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default AreaList; 