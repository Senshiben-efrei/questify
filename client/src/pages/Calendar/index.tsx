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
  endOfWeek,
  addDays
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  color: 'success' | 'warning' | 'info' | 'error';
}

interface WeekEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: 'success' | 'warning' | 'info' | 'error';
  date: string;
}

type ViewType = 'week' | 'month';

const HOURS = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 7; // Start from 7 AM
  return {
    display: hour < 12 ? `${hour}:00 am` : `${hour === 12 ? 12 : hour - 12}:00 pm`,
    value: hour
  };
});

const WEEK_EVENTS: WeekEvent[] = [
  {
    id: '1',
    title: 'Morning Workout',
    startTime: '07:00',
    endTime: '07:50',
    color: 'success',
    date: 'Nov 18, 2024'
  },
  {
    id: '2',
    title: 'Team Standup',
    startTime: '09:30',
    endTime: '10:00',
    color: 'info',
    date: 'Nov 19, 2024'
  },
  {
    id: '7',
    title: 'Team Standup',
    startTime: '09:30',
    endTime: '10:00',
    color: 'info',
    date: 'Nov 19, 2024'
  },
  {
    id: '3',
    title: 'Doctor Appointment',
    startTime: '11:15',
    endTime: '12:00',
    color: 'warning',
    date: 'Nov 20, 2024'
  },
  {
    id: '4',
    title: 'Lunch with Client',
    startTime: '12:30',
    endTime: '13:30',
    color: 'error',
    date: 'Nov 21, 2024'
  },
  {
    id: '5',
    title: 'Project Review',
    startTime: '08:15',
    endTime: '09:00',
    color: 'info',
    date: 'Nov 22, 2024'
  },
  {
    id: '6',
    title: 'Yoga Class',
    startTime: '10:00',
    endTime: '11:00',
    color: 'success',
    date: 'Nov 23, 2024'
  }
];

// Add type for event time
interface EventTime {
  hour: number;
  minute: number;
}

// Add helper function to parse time string
const parseTime = (timeStr: string): EventTime => {
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute };
};

// Update the isEventInTimeSlot function
const isEventInTimeSlot = (event: WeekEvent, slotHour: number): boolean => {
  const start = parseTime(event.startTime);
  // Only return true if the event starts in this hour slot
  return start.hour === slotHour;
};

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<ViewType>('month');
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Meeting with friends',
      date: 'Nov 20, 2024',
      time: '10:00 - 11:00',
      description: 'Meet-Up for Travel Destination Discussion',
      color: 'info'
    },
    {
      id: '2',
      title: 'Visiting online course',
      date: 'Nov 21, 2024',
      time: '05:40 - 13:00',
      description: 'Checks updates for design course',
      color: 'success'
    },
    {
      id: '3',
      title: 'Development meet',
      date: 'Nov 22, 2024',
      time: '10:00 - 11:00',
      description: 'Discussion with developer for upcoming project',
      color: 'warning'
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

  const renderEvent = (event: WeekEvent, day: Date) => {
    // Helper function to get the correct classes based on color
    const getColorClasses = (color: WeekEvent['color']) => {
      switch (color) {
        case 'success':
          return 'border-success bg-success/10 text-success';
        case 'warning':
          return 'border-warning bg-warning/10 text-warning';
        case 'info':
          return 'border-info bg-info/10 text-info';
        case 'error':
          return 'border-error bg-error/10 text-error';
        default:
          return 'border-success bg-success/10 text-success';
      }
    };

    const colorClasses = getColorClasses(event.color);

    return (
      <div 
        key={event.id}
        className={`rounded p-1.5 border-l-2 overflow-hidden ${colorClasses} mt-1 mx-1`}
      >
        <p className="text-xs font-normal text-base-content mb-px truncate">
          {event.title}
        </p>
        <p className="text-xs font-semibold">
          {event.startTime} - {event.endTime}
        </p>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="relative">
        {/* Week Header */}
        <div className="grid grid-cols-8 border-t border-base-300 sticky top-0 left-0 w-full bg-base-100">
          <div className="p-3.5 flex items-center justify-center text-sm font-medium"></div>
          {weekDays.map((day, index) => (
            <div 
              key={day.toString()}
              className={`p-3.5 flex items-center justify-center text-sm font-medium
                ${isSameDay(day, new Date()) ? 'text-primary' : 'text-base-content'}`}
            >
              {format(day, 'MMM d')}
            </div>
          ))}
        </div>

        {/* Time Grid - Desktop */}
        <div className="hidden sm:grid grid-cols-8 w-full">
          {HOURS.map(({ display, value }) => {
            const isPM = display.includes('pm');
            const hour24 = isPM ? (value === 12 ? 12 : value + 12) : value;

            return (
              <React.Fragment key={display}>
                {/* Time Column */}
                <div className="h-32 lg:h-28 border-t border-r border-base-300">
                  <div className="h-full flex items-start pt-2">
                    <span className="text-xs font-semibold text-base-content/60">
                      {display}
                    </span>
                  </div>
                </div>

                {/* Time Slots */}
                {weekDays.map((day) => (
                  <div 
                    key={`${day}-${display}`}
                    className="h-32 lg:h-28 border-t border-r border-base-300 
                      transition-all hover:bg-base-200 relative"
                  >
                    {WEEK_EVENTS
                      .filter(event => 
                        isEventInTimeSlot(event, hour24) && 
                        event.date === format(day, 'MMM d, yyyy')
                      )
                      .map(event => renderEvent(event, day))}
                  </div>
                ))}
              </React.Fragment>
            );
          })}
        </div>

        {/* Time Grid - Mobile */}
        <div className="flex sm:hidden border-t border-base-300">
          <div className="flex flex-col">
            {HOURS.map(({ display, value }) => (
              <div 
                key={display}
                className="w-20 h-20 border-b border-r border-base-300"
              >
                <div className="h-full flex items-start pt-2 px-2">
                  <span className="text-xs font-semibold text-base-content/60">
                    {display}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 w-full">
            {HOURS.map(({ display, value }) => {
              const isPM = display.includes('pm');
              const hour24 = isPM ? (value === 12 ? 12 : value + 12) : value;

              return (
                <div 
                  key={display}
                  className="w-full h-20 border-b border-base-300 relative"
                >
                  {WEEK_EVENTS
                    .filter(event => 
                      isEventInTimeSlot(event, hour24) && 
                      event.date === format(new Date(), 'MMM d, yyyy')
                    )
                    .map(event => renderEvent(event, new Date()))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch (currentView) {
      case 'week':
        return renderWeekView();
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
                                className={`w-1.5 h-1.5 rounded-full bg-${event.color}`}
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
                      <span className={`w-2.5 h-2.5 rounded-full bg-${event.color}`}></span>
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