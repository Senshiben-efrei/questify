import React from 'react';
import Modal from '../Modal';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  status: 'due' | 'pending' | 'done' | 'upcoming';
}

interface DayEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

const DayEventsModal: React.FC<DayEventsModalProps> = ({
  isOpen,
  onClose,
  date,
  events,
  onEventClick
}) => {
  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'due':
        return 'bg-error';
      case 'pending':
        return 'bg-warning';
      case 'done':
        return 'bg-success';
      case 'upcoming':
        return 'bg-info';
      default:
        return 'bg-base-300';
    }
  };

  const getStatusBgClasses = (status: Event['status']) => {
    switch (status) {
      case 'due':
        return 'bg-error/5 hover:bg-error/10';
      case 'pending':
        return 'bg-warning/5 hover:bg-warning/10';
      case 'done':
        return 'bg-success/5 hover:bg-success/10';
      case 'upcoming':
        return 'bg-info/5 hover:bg-info/10';
      default:
        return 'bg-base-200/50 hover:bg-base-200/60';
    }
  };

  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.time.split(' - ')[0];
    const timeB = b.time.split(' - ')[0];
    return timeA.localeCompare(timeB);
  });

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={format(date, 'MMMM d, yyyy')}
      className="bg-base-100/30 backdrop-blur-md border border-base-content/10"
    >
      <div className="space-y-4">
        {sortedEvents.length > 0 ? (
          sortedEvents.map(event => (
            <div 
              key={event.id}
              onClick={() => onEventClick(event)}
              className={`
                card backdrop-blur-sm border border-base-content/5 
                transition-all cursor-pointer
                ${getStatusBgClasses(event.status)}
              `}
            >
              <div className="card-body p-4">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`}></span>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{event.title}</h3>
                    <p className="text-sm text-white/70">{event.time}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-white/70 bg-base-200/20 backdrop-blur-sm rounded-lg">
            No events scheduled for this day
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DayEventsModal; 