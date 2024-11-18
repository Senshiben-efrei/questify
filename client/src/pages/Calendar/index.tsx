import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  color: 'purple' | 'sky' | 'emerald';
}

type ViewType = 'week' | 'month';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<ViewType>('month');
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Meeting with friends',
      date: 'Jan 10, 2024',
      time: '10:00 - 11:00',
      description: 'Meet-Up for Travel Destination Discussion',
      color: 'purple'
    },
    {
      id: '2',
      title: 'Visiting online course',
      date: 'Jan 10, 2024',
      time: '05:40 - 13:00',
      description: 'Checks updates for design course',
      color: 'sky'
    },
    {
      id: '3',
      title: 'Development meet',
      date: 'Jan 14, 2024',
      time: '10:00 - 11:00',
      description: 'Discussion with developer for upcoming project',
      color: 'emerald'
    }
  ]);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    return eachDayOfInterval({ start, end });
  };

  const days = getDaysInMonth(currentDate);

  const renderView = () => {
    switch (currentView) {
      case 'week':
        return (
          <div className="min-h-[500px] flex items-center justify-center text-base-content/70">
            Week view coming soon...
          </div>
        );
      case 'month':
      default:
        return (
          <div className="border border-base-300 rounded-xl">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 rounded-t-xl border-b border-base-300">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div 
                  key={day}
                  className={`
                    py-3.5 bg-base-200 flex items-center justify-center text-sm font-medium
                    ${index < 6 ? 'border-r border-base-300' : ''}
                    ${index === 0 ? 'rounded-tl-xl' : ''}
                    ${index === 6 ? 'rounded-tr-xl' : ''}
                  `}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = isSameDay(day, selectedDate);
                const hasEvent = events.some(event => event.date === format(day, 'MMM d, yyyy'));

                return (
                  <div
                    key={day.toString()}
                    className={`
                      relative flex flex-col xl:aspect-square max-xl:min-h-[60px] p-3.5
                      border-r border-b border-base-300
                      ${!isCurrentMonth ? 'bg-base-200' : 'bg-base-100'}
                      ${isSelected ? 'bg-primary/10' : ''}
                      hover:bg-base-200 cursor-pointer transition-colors
                      ${index % 7 === 6 ? 'border-r-0' : ''}
                      ${Math.floor(index / 7) === Math.floor(days.length / 7) - 1 ? 'border-b-0' : ''}
                      ${index === days.length - 1 ? 'rounded-br-xl' : ''}
                      ${index === days.length - 7 ? 'rounded-bl-xl' : ''}
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span className={`
                      text-xs font-semibold
                      ${isCurrentMonth ? 'text-base-content' : 'text-base-content/50'}
                      ${isSelected ? 'bg-primary text-primary-content w-6 h-6 rounded-full flex items-center justify-center' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>

                    {/* Event Indicators */}
                    {hasEvent && (
                      <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                        <div className="flex gap-1">
                          {events
                            .filter(event => event.date === format(day, 'MMM d, yyyy'))
                            .map((event, i) => (
                              <span
                                key={event.id}
                                className={`w-1.5 h-1.5 rounded-full bg-${event.color}-500`}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-12 gap-8 max-w-4xl mx-auto xl:max-w-full">
        {/* Upcoming Events Section */}
        <div className="col-span-12 xl:col-span-5">
          <h2 className="text-3xl font-bold text-base-content mb-1.5">Upcoming Events</h2>
          <p className="text-lg text-base-content/70 mb-8">Don't miss schedule</p>
          <div className="flex gap-5 flex-col">
            {events.map(event => (
              <div key={event.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full bg-${event.color}-500`}></span>
                      <p className="text-base font-medium text-base-content">{event.date} - {event.time}</p>
                    </div>
                    <div className="dropdown dropdown-end">
                      <button tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                      </button>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li><a>Edit</a></li>
                        <li><a>Delete</a></li>
                      </ul>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-base-content mb-1">{event.title}</h3>
                  <p className="text-base text-base-content/70">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Section */}
        <div className="col-span-12 xl:col-span-7 card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-base-content">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center">
                  <button 
                    onClick={handlePrevMonth}
                    className="btn btn-ghost btn-circle btn-sm"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="btn btn-ghost btn-circle btn-sm"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="join">
                <button 
                  className={`join-item btn btn-sm ${currentView === 'week' ? 'btn-active' : ''}`}
                  onClick={() => setCurrentView('week')}
                >
                  Week
                </button>
                <button 
                  className={`join-item btn btn-sm ${currentView === 'month' ? 'btn-active' : ''}`}
                  onClick={() => setCurrentView('month')}
                >
                  Month
                </button>
              </div>
            </div>

            {renderView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 