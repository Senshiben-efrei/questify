import React from 'react';
import { TaskDefinition } from '../../types/routine';
import { Area } from '../../types/area';
import { Project } from '../../types/project';

interface TaskDefinitionFormProps {
  task: Partial<TaskDefinition>;
  areas: Area[];
  projects: Project[];
  onChange: (task: Partial<TaskDefinition>) => void;
  onRemove: () => void;
}

const TaskDefinitionForm: React.FC<TaskDefinitionFormProps> = ({
  task,
  areas,
  projects,
  onChange,
  onRemove
}) => {
  const handleChange = (field: keyof TaskDefinition, value: any) => {
    onChange({ ...task, [field]: value });
  };

  const filteredProjects = projects.filter(
    project => project.area_id === task.area_id
  );

  return (
    <div className="card bg-base-200/50 backdrop-blur-sm border border-base-content/10 p-4 space-y-4">
      {/* Basic Info */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Task Name</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          value={task.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter task name"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          className="textarea textarea-bordered"
          value={task.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter task description"
        />
      </div>

      {/* Evaluation Method */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Evaluation Method</span>
        </label>
        <select
          className="select select-bordered"
          value={task.evaluation_method || 'YES_NO'}
          onChange={(e) => handleChange('evaluation_method', e.target.value)}
        >
          <option value="YES_NO">Yes/No</option>
          <option value="NUMERIC">Numeric</option>
        </select>
      </div>

      {/* Target Value for Numeric Evaluation */}
      {task.evaluation_method === 'NUMERIC' && (
        <div className="form-control">
          <label className="label">
            <span className="label-text">Target Value</span>
          </label>
          <input
            type="number"
            className="input input-bordered"
            value={task.target_value || ''}
            onChange={(e) => handleChange('target_value', parseFloat(e.target.value))}
            placeholder="Enter target value"
            required
          />
        </div>
      )}

      {/* Specific Time Toggle */}
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Specific Time</span>
          <input
            type="checkbox"
            className="toggle"
            checked={task.has_specific_time || false}
            onChange={(e) => handleChange('has_specific_time', e.target.checked)}
          />
        </label>
      </div>

      {/* Time Settings */}
      {task.has_specific_time && (
        <div className="grid grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Execution Time</span>
            </label>
            <input
              type="time"
              className="input input-bordered"
              value={task.execution_time || ''}
              onChange={(e) => handleChange('execution_time', e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Duration (minutes)</span>
            </label>
            <input
              type="number"
              className="input input-bordered"
              value={task.duration || ''}
              onChange={(e) => handleChange('duration', parseInt(e.target.value))}
              min="1"
              required
            />
          </div>
        </div>
      )}

      {/* Area and Project Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Area</span>
          </label>
          <select
            className="select select-bordered"
            value={task.area_id || ''}
            onChange={(e) => {
              handleChange('area_id', e.target.value);
              handleChange('project_id', ''); // Reset project when area changes
            }}
          >
            <option value="">Select an area</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Project</span>
          </label>
          <select
            className="select select-bordered"
            value={task.project_id || ''}
            onChange={(e) => handleChange('project_id', e.target.value)}
            disabled={!task.area_id}
          >
            <option value="">Select a project</option>
            {filteredProjects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        className="btn btn-error btn-sm"
        onClick={onRemove}
      >
        Remove Task
      </button>
    </div>
  );
};

export default TaskDefinitionForm; 