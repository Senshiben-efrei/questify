import React, { useState } from 'react';
import Modal from '../Modal';
import { Area, Project } from '../../types';

interface AddStandaloneTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { taskData: any, endpoint: string }) => Promise<void>;
  areas: Area[];
  projects: Project[];
}

const AddStandaloneTaskModal: React.FC<AddStandaloneTaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  areas,
  projects 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [areaId, setAreaId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const taskData = {
      name,
      description,
      area_id: areaId || null,
      project_id: projectId || null,
      is_recurring: isRecurring,
      frequency: isRecurring ? frequency : null
    };

    try {
      await onSubmit({ taskData, endpoint: 'standalone' });
      setName('');
      setDescription('');
      setAreaId('');
      setProjectId('');
      setIsRecurring(false);
      setFrequency('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create standalone task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add Standalone Task"
      className="bg-base-100/30 backdrop-blur-md border border-base-content/10"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="alert alert-error bg-error/10 border border-error/20">
            <span>{error}</span>
          </div>
        )}

        <div className="form-control">
          <label className="label">
            <span className="label-text text-white">Name</span>
          </label>
          <input
            type="text"
            className="input bg-base-200/50 border-base-content/10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-white">Description</span>
          </label>
          <textarea
            className="textarea bg-base-200/50 border-base-content/10"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-white">Area</span>
          </label>
          <select
            className="select bg-base-200/50 border-base-content/10"
            value={areaId}
            onChange={(e) => {
              setAreaId(e.target.value);
              setProjectId('');
            }}
          >
            <option value="">None</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-white">Project</span>
          </label>
          <select
            className="select bg-base-200/50 border-base-content/10"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={!areaId}
          >
            <option value="">None</option>
            {projects
              .filter(project => project.area_id === areaId)
              .map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text text-white">Recurring Task</span>
            <input
              type="checkbox"
              className="toggle"
              checked={isRecurring}
              onChange={(e) => {
                setIsRecurring(e.target.checked);
                if (!e.target.checked) setFrequency('');
              }}
            />
          </label>
        </div>

        {isRecurring && (
          <div className="form-control">
            <label className="label">
              <span className="label-text text-white">Frequency</span>
            </label>
            <select
              className="select bg-base-200/50 border-base-content/10"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              required={isRecurring}
            >
              <option value="">Select frequency</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            className="btn bg-base-200/50 border-base-content/10 hover:bg-base-200/70" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn bg-success/75 border-success/75 hover:bg-success/65 hover:border-success/65 text-white"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddStandaloneTaskModal; 