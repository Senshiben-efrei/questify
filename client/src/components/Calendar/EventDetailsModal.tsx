import React from 'react';
import Modal from '../Modal';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  event: {
    id: string;
    title: string;
    description?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    time?: string;
    status: 'due' | 'pending' | 'done' | 'upcoming';
  } | null;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  event
}) => {
  if (!event) return null;

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'due':
        return 'bg-error/5 border-error/20 text-error';
      case 'pending':
        return 'bg-warning/5 border-warning/20 text-warning';
      case 'done':
        return 'bg-success/5 border-success/20 text-success';
      case 'upcoming':
        return 'bg-info/5 border-info/20 text-info';
      default:
        return 'bg-base-200/50 border-base-300 text-white';
    }
  };

  const getStatusBgClasses = (status: string) => {
    switch (status) {
      case 'due':
        return 'bg-error/5 backdrop-blur-lg border-error/10';
      case 'pending':
        return 'bg-warning/5 backdrop-blur-lg border-warning/10';
      case 'done':
        return 'bg-success/5 backdrop-blur-lg border-success/10';
      case 'upcoming':
        return 'bg-info/5 backdrop-blur-lg border-info/10';
      default:
        return 'bg-base-200/50 backdrop-blur-lg border-base-300/10';
    }
  };

  const getBorderClass = (status: string) => {
    switch (status) {
      case 'due':
        return 'border-error/10';
      case 'pending':
        return 'border-warning/10';
      case 'done':
        return 'border-success/10';
      case 'upcoming':
        return 'border-info/10';
      default:
        return 'border-base-300/10';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Event Details"
      className={`${getStatusBgClasses(event.status)} border p-8`}
    >
      <div className="space-y-8">
        {/* Header with title and status */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
            <span className={`text-sm font-medium ${getStatusClasses(event.status)} capitalize px-3 py-1 rounded-full border`}>
              {event.status}
            </span>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button 
                onClick={onEdit}
                className="btn btn-ghost btn-sm text-white hover:bg-white/10"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={onDelete}
                className="btn btn-ghost btn-sm text-error hover:bg-error/10"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Time details */}
        <div className={`space-y-3 bg-base-100/5 rounded-lg p-6 border ${getBorderClass(event.status)}`}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white/70">Date:</span>
            <span className="text-sm text-white">{event.date}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white/70">Time:</span>
            <span className="text-sm text-white">
              {event.time || `${event.startTime} - ${event.endTime}`}
            </span>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className={`space-y-3 bg-base-100/5 rounded-lg p-6 border ${getBorderClass(event.status)}`}>
            <span className="text-sm font-medium text-white/70">Description:</span>
            <p className="text-sm text-white whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EventDetailsModal; 