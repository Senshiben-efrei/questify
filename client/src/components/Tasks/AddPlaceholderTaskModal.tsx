import React, { useState } from 'react';
import Modal from '../Modal';
import { Area, Project, Task } from '../../types';
import QueueManager from './QueueManager';

interface AddPlaceholderTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { taskData: any, endpoint: string }) => Promise<void>;
  areas: Area[];
  projects: Project[];
  availableSubTasks: Task[];
}

const AddPlaceholderTaskModal: React.FC<AddPlaceholderTaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  areas,
  projects,
  availableSubTasks
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [iterations, setIterations] = useState<any[]>([{
    id: crypto.randomUUID(),
    position: 0,
    items: []
  }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    const taskData = {
      name,
      description,
      is_recurring: isRecurring,
      frequency: isRecurring ? frequency : null,
      start_date: startDate || null,
      end_date: endDate || null,
      queue: {
        iterations,
        rotation_type: "sequential"
      }
    };

    setLoading(true);
    setError('');

    try {
      await onSubmit({ taskData, endpoint: 'placeholder' });
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create placeholder task');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsRecurring(false);
    setFrequency('');
    setStartDate('');
    setEndDate('');
    setIterations([{
      id: crypto.randomUUID(),
      position: 0,
      items: []
    }]);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add Placeholder Task"
      className="bg-base-100/30 backdrop-blur-md border border-base-content/10"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="alert alert-error bg-error/10 border border-error/20">
            <span>{error}</span>
          </div>
        )}

        {/* Basic Information */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-white">Name</span>
            <span className="label-text-alt text-error">Required</span>
          </label>
          <input
            type="text"
            className="input bg-base-200/50 border-base-content/10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter task name"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-white">Description</span>
            <span className="label-text-alt text-base-content/70">Optional</span>
          </label>
          <textarea
            className="textarea bg-base-200/50 border-base-content/10"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            rows={3}
          />
        </div>

        {/* Recurrence */}
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
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Frequency</span>
                <span className="label-text-alt text-error">Required</span>
              </label>
              <select
                className="select bg-base-200/50 border-base-content/10"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                required
              >
                <option value="">Select frequency</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Start Date</span>
                </label>
                <input
                  type="date"
                  className="input bg-base-200/50 border-base-content/10"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">End Date</span>
                </label>
                <input
                  type="date"
                  className="input bg-base-200/50 border-base-content/10"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>
          </>
        )}

        {/* Queue Management */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-white">Queue Management</span>
          </label>
          <QueueManager
            iterations={iterations}
            onIterationsUpdate={setIterations}
            availableSubTasks={availableSubTasks}
            frequency={frequency}
          />
        </div>

        {/* Action Buttons */}
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

export default AddPlaceholderTaskModal; 