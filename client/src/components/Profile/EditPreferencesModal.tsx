import React from 'react';
import Modal from '../Modal';

interface EditPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { timezone: string; language: string; notifications: string[] }) => void;
  currentPreferences: {
    timezone: string;
    language: string;
    notifications: string[];
  };
}

const EditPreferencesModal: React.FC<EditPreferencesModalProps> = ({ isOpen, onClose, onSubmit, currentPreferences }) => {
  const [formData, setFormData] = React.useState(currentPreferences);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Preferences">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Time Zone</span>
          </label>
          <select 
            className="select select-bordered"
            value={formData.timezone}
            onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
          >
            <option value="UTC+00:00">UTC+00:00</option>
            <option value="UTC+01:00">UTC+01:00</option>
            <option value="UTC+02:00">UTC+02:00</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Language</span>
          </label>
          <select 
            className="select select-bordered"
            value={formData.language}
            onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Notifications</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={formData.notifications.includes('email')}
                onChange={(e) => {
                  const notifications = e.target.checked
                    ? [...formData.notifications, 'email']
                    : formData.notifications.filter(n => n !== 'email');
                  setFormData(prev => ({ ...prev, notifications }));
                }}
              />
              <span>Email</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={formData.notifications.includes('push')}
                onChange={(e) => {
                  const notifications = e.target.checked
                    ? [...formData.notifications, 'push']
                    : formData.notifications.filter(n => n !== 'push');
                  setFormData(prev => ({ ...prev, notifications }));
                }}
              />
              <span>Push</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPreferencesModal; 