import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
        
        <div className={`relative w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle transition-all text-white ${className}`}>
          {title && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/10"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 