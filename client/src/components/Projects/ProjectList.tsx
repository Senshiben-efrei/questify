import React, { useState } from 'react';
import { Project } from '../../types/project';
import { Area } from '../../types/area';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import AddProjectModal from './AddProjectModal';
import EditProjectModal from './EditProjectModal';
import ConfirmationModal from '../ConfirmationModal';

interface ProjectListProps {
  projects: Project[];
  areas: Area[];
  onAdd: (data: Partial<Project>) => Promise<void>;
  onEdit: (id: string, data: Partial<Project>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects = [],
  areas = [],
  onAdd,
  onEdit,
  onDelete
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Projects</h2>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Project
        </button>
      </div>

      {/* Project Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => {
          const area = areas.find(a => a.id === project.area_id);
          return (
            <div
              key={project.id}
              className="card bg-base-200/50 backdrop-blur-sm border border-base-content/10"
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="card-title">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-base-content/70">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setSelectedProject(project);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm text-error"
                      onClick={() => {
                        setSelectedProject(project);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {area && (
                  <div className="mt-4">
                    <div className="badge badge-primary">
                      {area.name}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        )}
      </div>

      {/* Modals */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onAdd}
        areas={areas}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={onEdit}
        project={selectedProject}
        areas={areas}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProject(null);
        }}
        onConfirm={async () => {
          if (selectedProject) {
            await onDelete(selectedProject.id);
            setIsDeleteModalOpen(false);
            setSelectedProject(null);
          }
        }}
        title="Delete Project"
        message={`Are you sure you want to delete "${selectedProject?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default ProjectList; 