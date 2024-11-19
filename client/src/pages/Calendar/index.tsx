import React, { useState, useEffect, useRef } from 'react';
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
import PageContainer from '../../components/PageContainer';
import EventDetailsModal from '../../components/Calendar/EventDetailsModal';
import DayEventsModal from '../../components/Calendar/DayEventsModal';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  status: 'due' | 'pending' | 'done' | 'upcoming';
}

interface WeekEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'due' | 'pending' | 'done' | 'upcoming';
  date: string;
}

type ViewType = 'week' | 'month';

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  if (hour === 0) {
    return { display: '12:00 am', value: 0 };
  } else if (hour < 12) {
    return { display: `${hour}:00 am`, value: hour };
  } else if (hour === 12) {
    return { display: '12:00 pm', value: 12 };
  } else {
    return { display: `${hour - 12}:00 pm`, value: hour };
  }
});

const WEEK_EVENTS: WeekEvent[] = [
  {
    id: '1',
    title: 'Morning Workout',
    startTime: '07:00',
    endTime: '08:00',
    status: 'done',
    date: 'Nov 18, 2024'
  },
  {
    id: '2',
    title: 'Team Meeting',
    startTime: '10:00',
    endTime: '11:00',
    status: 'done',
    date: 'Nov 18, 2024'
  },
  {
    id: '3',
    title: 'Project Deadline',
    startTime: '09:00',
    endTime: '10:00',
    status: 'done',
    date: 'Nov 19, 2024'
  },
  {
    id: '4',
    title: 'Code Review',
    startTime: '14:00',
    endTime: '15:00',
    status: 'due',
    date: 'Nov 19, 2024'
  },
  {
    id: '5',
    title: 'Daily Standup',
    startTime: '09:00',
    endTime: '09:30',
    status: 'pending',
    date: 'Nov 20, 2024'
  },
  {
    id: '6',
    title: 'Client Meeting',
    startTime: '11:00',
    endTime: '12:00',
    status: 'pending',
    date: 'Nov 20, 2024'
  },
  {
    id: '7',
    title: 'Team Lunch',
    startTime: '12:30',
    endTime: '13:30',
    status: 'pending',
    date: 'Nov 20, 2024'
  },
  {
    id: '8',
    title: 'Sprint Planning',
    startTime: '10:00',
    endTime: '11:30',
    status: 'upcoming',
    date: 'Nov 21, 2024'
  },
  {
    id: '9',
    title: 'Training Session',
    startTime: '14:00',
    endTime: '15:30',
    status: 'upcoming',
    date: 'Nov 21, 2024'
  },
  {
    id: '10',
    title: 'Product Demo',
    startTime: '11:00',
    endTime: '12:00',
    status: 'upcoming',
    date: 'Nov 22, 2024'
  },
  {
    id: '11',
    title: 'Team Building',
    startTime: '15:00',
    endTime: '17:00',
    status: 'upcoming',
    date: 'Nov 22, 2024'
  },
  {
    id: '12',
    title: 'Weekend Planning',
    startTime: '10:00',
    endTime: '11:00',
    status: 'upcoming',
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

// Update the color helper function to use status
const getStatusColor = (status: WeekEvent['status'] | Event['status']) => {
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

// Update the color classes helper in renderEvent
const getStatusClasses = (status: WeekEvent['status']) => {
  switch (status) {
    case 'due':
      return 'border-error bg-error/10 text-error';
    case 'pending':
      return 'border-warning bg-warning/10 text-warning';
    case 'done':
      return 'border-success bg-success/10 text-success';
    case 'upcoming':
      return 'border-info bg-info/10 text-info';
    default:
      return 'border-base-300 bg-base-300/10 text-base-300';
  }
};

interface TimeIndicatorProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const TimeIndicator: React.FC<TimeIndicatorProps> = ({ containerRef }) => {
  const [top, setTop] = useState<number>(0);

  useEffect(() => {
    const updateTimeIndicator = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      const minutesSinceMidnight = totalMinutes;
      
      // Update height calculation for mobile
      const isMobile = window.innerWidth < 640; // sm breakpoint
      const hourHeight = isMobile ? 80 : (window.innerWidth >= 1024 ? 112 : 128); // 80px for mobile (h-20)
      const pixelsPerMinute = hourHeight / 60;
      const newTop = minutesSinceMidnight * pixelsPerMinute;
      
      setTop(newTop);

      // Scroll to position the time line at the top quarter
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const scrollOffset = newTop - (containerHeight * 0.25);
        containerRef.current.scrollTo({
          top: scrollOffset,
          behavior: 'smooth'
        });
      }
    };

    // Initial update and scroll
    updateTimeIndicator();
    
    // Set up interval for updates
    const interval = setInterval(updateTimeIndicator, 60000);

    return () => clearInterval(interval);
  }, [containerRef]);

  return (
    <div 
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${top}px` }}
    >
      <div className="relative w-full">
        <div className="absolute left-0 right-0 border-t-2 border-error"></div>
        <div className="absolute left-0 w-2 h-2 -mt-1 rounded-full bg-error"></div>
      </div>
    </div>
  );
};

// Add helper function to get event counts by status
const getEventCountsByStatus = (events: Event[], date: string) => {
  const dayEvents = events.filter(event => event.date === date);
  return {
    due: dayEvents.filter(event => event.status === 'due').length,
    pending: dayEvents.filter(event => event.status === 'pending').length,
    upcoming: dayEvents.filter(event => event.status === 'upcoming').length,
    done: dayEvents.filter(event => event.status === 'done').length,
  };
};

// Add helper function to get priority status color for mobile
const getPriorityStatusColor = (events: Event[], date: string) => {
  const dayEvents = events.filter(event => event.date === date);
  if (dayEvents.some(event => event.status === 'due')) return 'bg-error';
  if (dayEvents.some(event => event.status === 'pending')) return 'bg-warning';
  if (dayEvents.some(event => event.status === 'upcoming')) return 'bg-info';
  if (dayEvents.every(event => event.status === 'done')) return 'bg-success';
  return '';
};

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<ViewType>('week');
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Morning Workout',
      date: 'Nov 18, 2024',
      time: '07:00 - 08:00',
      description: 'Daily exercise routine - Completed',
      status: 'done'
    },
    {
      id: '2',
      title: 'Team Meeting',
      date: 'Nov 18, 2024',
      time: '10:00 - 11:00',
      description: 'Weekly team sync - Completed',
      status: 'done'
    },
    {
      id: '3',
      title: 'Project Deadline',
      date: 'Nov 19, 2024',
      time: '09:00 - 10:00',
      description: 'Submit final project deliverables',
      status: 'done'
    },
    {
      id: '4',
      title: 'Code Review',
      date: 'Nov 19, 2024',
      time: '14:00 - 15:00',
      description: 'Review pull requests for the new feature',
      status: 'due'
    },
    {
      id: '5',
      title: 'Daily Standup',
      date: 'Nov 20, 2024',
      time: '09:00 - 09:30',
      description: 'Daily team status update',
      status: 'pending'
    },
    {
      id: '6',
      title: 'Client Meeting',
      date: 'Nov 20, 2024',
      time: '11:00 - 12:00',
      description: 'Project progress review with client',
      status: 'pending'
    },
    {
      id: '7',
      title: 'Team Lunch',
      date: 'Nov 20, 2024',
      time: '12:30 - 13:30',
      description: 'Monthly team lunch',
      status: 'pending'
    },
    {
      id: '8',
      title: 'Sprint Planning',
      date: 'Nov 21, 2024',
      time: '10:00 - 11:30',
      description: 'Plan next sprint tasks and goals',
      status: 'upcoming'
    },
    {
      id: '9',
      title: 'Training Session',
      date: 'Nov 21, 2024',
      time: '14:00 - 15:30',
      description: 'New framework training',
      status: 'upcoming'
    },
    {
      id: '10',
      title: 'Product Demo',
      date: 'Nov 22, 2024',
      time: '11:00 - 12:00',
      description: 'Demo new features to stakeholders',
      status: 'upcoming'
    },
    {
      id: '11',
      title: 'Team Building',
      date: 'Nov 22, 2024',
      time: '15:00 - 17:00',
      description: 'Team building activities',
      status: 'upcoming'
    },
    {
      id: '12',
      title: 'Weekend Planning',
      date: 'Nov 23, 2024',
      time: '10:00 - 11:00',
      description: 'Plan weekend activities',
      status: 'upcoming'
    }
  ]);

  const timeGridRef = React.useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<(Event | WeekEvent) | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const handlePrevious = () => {
    if (currentView === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  };

  const handleNext = () => {
    if (currentView === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    return eachDayOfInterval({ start, end });
  };

  const days = getDaysInMonth(currentDate);

  const handleEventClick = (event: Event | WeekEvent) => {
    setSelectedEvent(event);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };

  const renderEvent = (event: WeekEvent, day: Date) => {
    const statusClasses = getStatusClasses(event.status);

    return (
      <div 
        key={event.id}
        className={`rounded p-1.5 border-l-2 overflow-hidden ${statusClasses} mt-1 mx-1 cursor-pointer hover:opacity-80`}
        onClick={(e) => {
          e.stopPropagation();
          handleEventClick(event);
        }}
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
    const today = new Date();

    return (
      <div className="relative">
        {/* Week Header - Fixed */}
        <div className="grid grid-cols-8 border-t border-base-300 sticky top-0 left-0 w-full bg-base-100 z-10">
          <div className="p-3.5 flex items-center justify-center text-sm font-medium"></div>
          {weekDays.map((day) => (
            <div 
              key={day.toString()}
              className={`p-3.5 flex items-center justify-center text-sm font-medium
                ${isSameDay(day, today) ? 'text-base-content font-bold bg-base-content/10' : 'text-base-content'}`}
            >
              {format(day, 'MMM d')}
            </div>
          ))}
        </div>

        {/* Time Grid - Desktop */}
        <div className="hidden sm:grid grid-cols-8 w-full relative">
          {/* Add time indicator if current week is being viewed */}
          {weekDays.some(day => isSameDay(day, today)) && (
            <TimeIndicator containerRef={timeGridRef} />
          )}

          {HOURS.map(({ display, value }) => {
            const hour24 = value;

            return (
              <React.Fragment key={display}>
                {/* Time Column */}
                <div className="h-32 lg:h-28 border-t border-r border-base-300 sticky left-0 bg-base-100">
                  <div className="h-full flex items-start pt-2 pl-2">
                    <span className="text-xs font-semibold text-base-content/60">
                      {display}
                    </span>
                  </div>
                </div>

                {/* Time Slots */}
                {weekDays.map((day) => (
                  <div 
                    key={`${day}-${display}`}
                    className={`h-32 lg:h-28 border-t border-r border-base-300 
                      transition-all hover:bg-base-200 relative
                      ${isSameDay(day, today) ? 'bg-base-content/5' : ''}`}
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
        <div className="flex sm:hidden border-t border-base-300 relative">
          {/* Add time indicator for mobile if viewing today */}
          {isSameDay(new Date(), today) && (
            <TimeIndicator containerRef={timeGridRef} />
          )}
          <div className="flex flex-col">
            {HOURS.map(({ display, value }) => (
              <div 
                key={display}
                className="w-20 h-20 border-b border-r border-base-300 sticky left-0 bg-base-100"
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
              const hour24 = value;

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
            <div className="grid grid-cols-7 auto-rows-fr">
              {days.map((day, index) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const hasEvent = events.some(event => event.date === format(day, 'MMM d, yyyy'));

                return (
                  <div
                    key={day.toString()}
                    className={`
                      relative flex flex-col min-h-[80px] sm:min-h-[120px] p-2 sm:p-3.5
                      border-r border-b border-base-300
                      ${!isCurrentMonth ? 'bg-base-200' : 'bg-base-100'}
                      ${isSelected ? 'bg-base-content/10' : ''}
                      ${isToday ? 'ring-2 ring-base-content ring-inset' : ''}
                      hover:bg-base-200 cursor-pointer transition-colors
                      ${index % 7 === 6 ? 'border-r-0' : ''}
                      ${Math.floor(index / 7) === Math.floor(days.length / 7) - 1 ? 'border-b-0' : ''}
                      ${index === days.length - 1 ? 'rounded-br-xl' : ''}
                      ${index === days.length - 7 ? 'rounded-bl-xl' : ''}
                    `}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className="flex flex-col h-full">
                      {/* Date number */}
                      <div className="flex-none mb-1 sm:mb-2">
                        <span className={`
                          text-xs font-semibold
                          ${isCurrentMonth ? 'text-base-content' : 'text-base-content/50'}
                          ${isToday ? 'text-base-content' : ''}
                        `}>
                          {format(day, 'd')}
                        </span>
                      </div>

                      {/* Event Indicators */}
                      {hasEvent && (
                        <>
                          {/* Desktop View */}
                          <div className="hidden sm:flex flex-col gap-1 mt-auto">
                            {Object.entries(getEventCountsByStatus(events, format(day, 'MMM d, yyyy')))
                              .filter(([_, count]) => count > 0)
                              .map(([status, count]) => (
                                <div
                                  key={status}
                                  className={`text-[10px] px-1.5 py-0.5 rounded-sm flex items-center justify-between
                                    ${status === 'due' ? 'bg-error/10 text-error' : ''}
                                    ${status === 'pending' ? 'bg-warning/10 text-warning' : ''}
                                    ${status === 'upcoming' ? 'bg-info/10 text-info' : ''}
                                    ${status === 'done' ? 'bg-success/10 text-success' : ''}
                                  `}
                                >
                                  <span className="capitalize">{status}</span>
                                  <span>{count}</span>
                                </div>
                              ))}
                          </div>

                          {/* Mobile View */}
                          <div className="sm:hidden flex justify-center mt-auto">
                            <div className="flex gap-1">
                              <span
                                className={`w-4 h-1 rounded-sm ${getPriorityStatusColor(events, format(day, 'MMM d, yyyy'))}`}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
    }
  };

  const renderEventCard = (event: Event) => (
    <div 
      key={event.id} 
      className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200"
      onClick={() => handleEventClick(event)}
    >
      <div className="card-body p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-base-content">{event.time}</p>
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-circle btn-xs">
              <EllipsisHorizontalIcon className="h-4 w-4" />
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a>Edit</a></li>
              <li><a>Delete</a></li>
            </ul>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${getStatusColor(event.status)}`}></span>
          <h3 className="text-base font-semibold text-base-content">{event.title}</h3>
        </div>
        <p className="text-sm text-base-content/70 mt-1">{event.description}</p>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <div className="grid grid-cols-12 gap-2 sm:gap-8">
        {/* Events Section */}
        <div className="col-span-12 xl:col-span-3">
          {/* Today's Events */}
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-base-content mb-1.5">Today's Events</h2>
            <p className="text-sm sm:text-base text-base-content/70 mb-4">Current schedule</p>
            <div className="flex gap-2 sm:gap-3 flex-col">
              {events
                .filter(event => event.date === format(new Date(), 'MMM d, yyyy'))
                .sort((a, b) => {
                  const timeA = a.time.split(' - ')[0];
                  const timeB = b.time.split(' - ')[0];
                  return timeA.localeCompare(timeB);
                })
                .map(renderEventCard)}
              {events.filter(event => event.date === format(new Date(), 'MMM d, yyyy')).length === 0 && (
                <div className="alert">
                  <span>No events scheduled for today</span>
                </div>
              )}
            </div>
          </div>

          {/* Tomorrow's Events */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-base-content mb-1.5">Tomorrow's Events</h2>
            <p className="text-sm sm:text-base text-base-content/70 mb-4">Upcoming schedule</p>
            <div className="flex gap-2 sm:gap-3 flex-col">
              {events
                .filter(event => event.date === format(addDays(new Date(), 1), 'MMM d, yyyy'))
                .sort((a, b) => {
                  const timeA = a.time.split(' - ')[0];
                  const timeB = b.time.split(' - ')[0];
                  return timeA.localeCompare(timeB);
                })
                .map(renderEventCard)}
              {events.filter(event => event.date === format(addDays(new Date(), 1), 'MMM d, yyyy')).length === 0 && (
                <div className="alert">
                  <span>No events scheduled for tomorrow</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Section - increased width */}
        <div className="col-span-12 xl:col-span-9">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-2 sm:p-6">
              <div className="flex flex-col md:flex-row gap-2 sm:gap-4 items-center justify-between mb-3 sm:mb-5">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-base-content">
                    {format(currentDate, 'MMMM yyyy')}
                  </h2>
                  <div className="flex items-center">
                    <button 
                      onClick={handlePrevious}
                      className="btn btn-ghost btn-circle btn-sm"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleNext}
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

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        onEdit={() => {
          // Add edit handler
          console.log('Edit event:', selectedEvent);
        }}
        onDelete={() => {
          // Add delete handler
          console.log('Delete event:', selectedEvent);
        }}
      />

      <DayEventsModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        date={selectedDay || new Date()}
        events={events.filter(event => 
          selectedDay && 
          event.date === format(selectedDay, 'MMM d, yyyy')
        )}
        onEventClick={(event) => {
          setSelectedEvent(event);
          setSelectedDay(null);
        }}
      />
    </PageContainer>
  );
};

export default Calendar; 