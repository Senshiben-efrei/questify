import React, { useState } from 'react';
import Modal from '../Modal';
import { Area, Project, Task } from '../../types';

interface AddSubTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { taskData: any, endpoint: string }) => Promise<void>;
  areas: Area[];
  projects: Project[];
  placeholderTasks: Task[];
}

const AddSubTaskModal: React.FC<AddSubTaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  areas,
  projects,
  placeholderTasks
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [areaId, setAreaId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [evaluationMethod, setEvaluationMethod] = useState('YES_NO');
  const [targetValue, setTargetValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSpecificTime, setHasSpecificTime] = useState(false);
  const [executionTime, setExecutionTime] = useState('');
  const [executionTimeOfDay, setExecutionTimeOfDay] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    const taskData = {
      name,
      description,
      area_id: areaId || null,
      project_id: projectId || null,
      evaluation_method: evaluationMethod,
      target_value: evaluationMethod === 'NUMERIC' ? parseFloat(targetValue) : null,
      is_recurring: false,
      frequency: null,
      execution_time_of_day: hasSpecificTime ? executionTime : null
    };

    setLoading(true);
    setError('');

    try {
      await onSubmit({ taskData, endpoint: 'sub-task' });
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create sub-task');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setAreaId('');
    setProjectId('');
    setEvaluationMethod('YES_NO');
    setTargetValue('');
    setHasSpecificTime(false);
    setExecutionTime('');
    setExecutionTimeOfDay('');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add Sub-Task"
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

        {/* Area and Project Selection */}
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

        {/* Evaluation Method */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-white">Evaluation Method</span>
          </label>
          <select
            className="select bg-base-200/50 border-base-content/10"
            value={evaluationMethod}
            onChange={(e) => setEvaluationMethod(e.target.value)}
          >
            <option value="YES_NO">Yes/No</option>
            <option value="NUMERIC">Numeric</option>
          </select>
        </div>

        {evaluationMethod === 'NUMERIC' && (
          <div className="form-control">
            <label className="label">
              <span className="label-text text-white">Target Value</span>
              <span className="label-text-alt text-error">Required</span>
            </label>
            <input
              type="number"
              className="input bg-base-200/50 border-base-content/10"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="Enter target value"
              required
            />
          </div>
        )}

        {/* Time of Day */}
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text text-white">Specific Time of Day</span>
            <input
              type="checkbox"
              className="toggle"
              checked={hasSpecificTime}
              onChange={(e) => {
                setHasSpecificTime(e.target.checked);
                if (!e.target.checked) {
                  setExecutionTime('');
                  setExecutionTimeOfDay('');
                }
              }}
            />
          </label>
        </div>

        {hasSpecificTime && (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Time of Day</span>
                <span className="label-text-alt text-base-content/70">HH:MM</span>
              </label>
              <input
                type="time"
                className="input bg-base-200/50 border-base-content/10"
                value={executionTime}
                onChange={(e) => setExecutionTime(e.target.value)}
                required={hasSpecificTime}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/70">
                  The time when this task should be executed
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Execution Duration (minutes)</span>
              </label>
              <input
                type="number"
                className="input bg-base-200/50 border-base-content/10"
                value={executionTimeOfDay}
                onChange={(e) => setExecutionTimeOfDay(e.target.value)}
                placeholder="Enter execution duration"
                min="1"
              />
              <label className="label">
                <span className="label-text-alt text-base-content/70">
                  How long this task typically takes to complete
                </span>
              </label>
            </div>
          </>
        )}

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
            {loading ? 'Creating...' : 'Create Sub-Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSubTaskModal; 