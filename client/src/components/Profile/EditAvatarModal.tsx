import React, { useState, useRef } from 'react';
import Modal from '../Modal';

interface EditAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { initials: string; imageUrl?: string }) => void;
  currentInitials: string;
  currentImageUrl?: string;
}

const DEFAULT_AVATAR = "https://img.freepik.com/premium-vector/black-silhouette-default-profile-avatar_664995-354.jpg?semt=ais_hybrid";

const EditAvatarModal: React.FC<EditAvatarModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentInitials,
  currentImageUrl 
}) => {
  const [initials, setInitials] = useState(currentInitials);
  const [imageUrl, setImageUrl] = useState(currentImageUrl || DEFAULT_AVATAR);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || DEFAULT_AVATAR);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ initials, imageUrl });
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL for the selected image
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // In a real app, you would upload the file to your server here
      // and set the returned URL as imageUrl
      setImageUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(DEFAULT_AVATAR);
    setImageUrl(DEFAULT_AVATAR);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Avatar">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Preview */}
        <div className="flex flex-col items-center gap-4">
          <div className="avatar">
            <div className="w-32 h-32 rounded-full">
              <img 
                src={previewUrl} 
                alt="Avatar preview"
                className="object-cover"
                onError={() => setPreviewUrl(DEFAULT_AVATAR)}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="flex flex-col items-center gap-2 w-full">
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered w-full"
              onChange={handleImageChange}
              ref={fileInputRef}
            />
            <button 
              type="button" 
              className="btn btn-ghost btn-sm"
              onClick={handleRemoveImage}
            >
              Reset to Default
            </button>
          </div>
        </div>

        {/* Initials Input */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Initials (shown when image fails to load)</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            value={initials}
            onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 2))}
            maxLength={2}
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditAvatarModal; 