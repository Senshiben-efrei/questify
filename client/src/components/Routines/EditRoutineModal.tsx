import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { Area } from '../../types/area';
import { Project } from '../../types/project';
import { Queue, Routine } from '../../types/routine';
import QueueManager from './QueueManager';

interface EditRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: any) => Promise<void>;
  routine: Routine | null;
  areas: Area[];
  projects: Project[];
}

const EditRoutineModal: React.FC<EditRoutineModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  routine,
  areas,
  projects
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [queue, setQueue] = useState<Queue>({
    iterations: [],
    rotation_type: 'sequential'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load routine data when modal opens
  useEffect(() => {
    if (routine) {
      setName(routine.name);
      setDescription(routine.description || '');
      setIsRecurring(routine.is_recurring);
      setFrequency(routine.frequency || '');
      setStartDate(routine.start_date || '');
      setEndDate(routine.end_date || '');
      setQueue(routine.queue);
    }
  }, [routine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routine) return;
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (isRecurring && !frequency) {
      setError('Frequency is required for recurring routines');
      return;
    }

    const routineData = {
      name,
      description,
      is_recurring: isRecurring,
      frequency: isRecurring ? frequency : null,
      start_date: startDate || null,
      end_date: endDate || null,
      queue
    };

    setLoading(true);
    setError('');

    try {
      await onSubmit(routine.id, routineData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update routine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Edit Routine"
      className="bg-base-100/30 backdrop-blur-md border border-base-content/10"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error display */}
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
            placeholder="Enter routine name"
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
            placeholder="Enter routine description"
            rows={3}
          />
        </div>

        {/* Recurrence Settings */}
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text text-white">Recurring Routine</span>
            <input
              type="checkbox"
              className="toggle"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
          </label>
        </div>

        {isRecurring && (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Frequency</span>
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
            queue={queue}
            areas={areas}
            projects={projects}
            onChange={setQueue}
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
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditRoutineModal; 