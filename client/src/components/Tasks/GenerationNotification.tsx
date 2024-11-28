import React from 'react';

interface GenerationStats {
  message: string;
  statistics: {
    today: {
      date: string;
      instances_created: number;
      instances_skipped: number;
    };
    week_ahead: {
      start_date: string;
      end_date: string;
      instances_created: number;
      instances_skipped: number;
    };
    total_created: number;
    total_skipped: number;
    cleared?: boolean;
  };
}

interface GenerationNotificationProps {
  stats: GenerationStats;
  onClose: () => void;
}

const GenerationNotification: React.FC<GenerationNotificationProps> = ({ stats, onClose }) => {
  if (!stats?.statistics?.today || !stats?.statistics?.week_ahead) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`alert ${stats.statistics.cleared ? 'alert-info' : 'alert-success'} shadow-lg mb-4`}>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-bold">
            {stats.statistics.cleared ? 'Instances Cleared' : 'Task Generation Complete'}
          </h3>
          {!stats.statistics.cleared && (
            <div className="text-sm">
              <p>Today ({formatDate(stats.statistics.today.date)}):
                Created {stats.statistics.today.instances_created} tasks
                {stats.statistics.today.instances_skipped > 0 && 
                  ` (${stats.statistics.today.instances_skipped} skipped)`}
              </p>
              <p>Week Ahead ({formatDate(stats.statistics.week_ahead.start_date)} - {formatDate(stats.statistics.week_ahead.end_date)}):
                Created {stats.statistics.week_ahead.instances_created} tasks
                {stats.statistics.week_ahead.instances_skipped > 0 && 
                  ` (${stats.statistics.week_ahead.instances_skipped} skipped)`}
              </p>
            </div>
          )}
          {stats.statistics.cleared && (
            <p className="text-sm">All task instances have been cleared successfully.</p>
          )}
        </div>
      </div>
      <div className="flex-none">
        <button className="btn btn-sm" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default GenerationNotification; 