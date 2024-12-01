import React from 'react';
import { CooldownDefinition } from '../../types/routine';

interface CooldownFormProps {
  cooldown: Partial<CooldownDefinition>;
  onChange: (cooldown: Partial<CooldownDefinition>) => void;
  onRemove: () => void;
}

const CooldownForm: React.FC<CooldownFormProps> = ({
  cooldown,
  onChange,
  onRemove
}) => {
  const handleChange = (field: keyof CooldownDefinition, value: any) => {
    onChange({ ...cooldown, [field]: value });
  };

  return (
    <div className="card bg-base-200/50 backdrop-blur-sm border border-base-content/10 p-4 space-y-4">
      {/* Basic Info */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Cooldown Name</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          value={cooldown.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter cooldown name"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          className="textarea textarea-bordered"
          value={cooldown.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter cooldown description"
        />
      </div>

      {/* Duration */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Duration</span>
        </label>
        <div className="join">
          <input
            type="text"
            className="input input-bordered join-item"
            value={cooldown.duration || ''}
            onChange={(e) => handleChange('duration', e.target.value)}
            placeholder="e.g., 1d, 2h"
          />
          <div className="tooltip" data-tip="Format: 1d (1 day), 2h (2 hours)">
            <button type="button" className="btn join-item">?</button>
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        className="btn btn-error btn-sm"
        onClick={onRemove}
      >
        Remove Cooldown
      </button>
    </div>
  );
};

export default CooldownForm; 