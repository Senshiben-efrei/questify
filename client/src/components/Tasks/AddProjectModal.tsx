import React, { useState } from 'react';
import Modal from '../Modal';
import { Area } from '../../types';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string, areaId: string) => Promise<void>;
  areas: Area[];
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onSubmit, areas }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [areaId, setAreaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(name, description, areaId);
      setName('');
      setDescription('');
      setAreaId('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add New Project"
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
            onChange={(e) => setAreaId(e.target.value)}
            required
          >
            <option value="">Select an area</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

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
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProjectModal; 