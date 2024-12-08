import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import PageContainer from '../components/PageContainer';
import { useAuth } from '../contexts/AuthContext';
import { Area } from '../types/area';
import { RoutineInstance } from '../types/routine';
import { areaService } from '../services/areaService';
import { routineService } from '../services/routineService';
import TaskInstanceCard from '../components/Tasks/TaskInstanceCard';
import { format } from 'date-fns';
import { addDays, subDays, isBefore, isToday } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [instances, setInstances] = useState<RoutineInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const today = new Date();
      const threeDaysAgo = subDays(today, 3);
      
      const [areasResponse, instancesResponse] = await Promise.all([
        areaService.getAreas(),
        routineService.getInstancesForDateRange(
          threeDaysAgo.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        )
      ]);

      setAreas(areasResponse.data);
      setInstances(instancesResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskProgress = async (instanceId: string, taskId: string, progress: number) => {
    try {
      await routineService.updateTaskInstance(instanceId, taskId, progress);
      await loadData(); // Reload to get updated instances
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const chartOptions: ChartOptions<'radar'> = {
    scales: {
      r: {
        min: -1,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function(tickValue: number | string) {
            return typeof tickValue === 'number' ? tickValue.toFixed(1) : '';
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        pointLabels: {
          font: {
            size: 14
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: { raw: unknown }) {
            if (context.raw !== undefined && typeof context.raw === 'number') {
              return `Level: ${context.raw.toFixed(1)}`;
            }
            return '';
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  const chartData = {
    labels: areas.map(area => area.name),
    datasets: [
      {
        label: 'Area Level',
        data: areas.map(area => {
          const level = Math.min(5, Math.floor(area.xp / 100));
          return level;
        }),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
      }
    ]
  };

  // Helper to group tasks by status and date
  const getGroupedTasks = () => {
    const allTasks = instances.flatMap(instance => 
      instance.task_instances.map(task => ({
        ...task,
        routine_name: instance.routine_name,
        instance_id: instance.id,
        due_date: new Date(instance.due_date)
      }))
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group overdue tasks by date
    const overdueTasks = allTasks
      .filter(task => 
        task.status !== 'completed' && 
        isBefore(task.due_date, today)
      )
      .reduce((groups: { [key: string]: typeof allTasks }, task) => {
        const dateKey = format(task.due_date, 'yyyy-MM-dd');
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(task);
        return groups;
      }, {});

    return {
      overdueTasks,
      todaysTasks: allTasks
        .filter(task => isToday(task.due_date))
        .reduce((groups: { pending: typeof allTasks, completed: typeof allTasks }, task) => {
          if (task.status === 'completed') {
            groups.completed.push(task);
          } else {
            groups.pending.push(task);
          }
          return groups;
        }, { pending: [], completed: [] })
    };
  };

  const { overdueTasks, todaysTasks } = getGroupedTasks();

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-96">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Areas Radar Chart */}
        <div className="card bg-base-200/50 backdrop-blur-sm border border-base-content/10">
          <div className="card-body">
            <h2 className="card-title">Areas Overview</h2>
            <div className="h-[400px] w-full">
              <Radar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Tasks Sections */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Due Tasks */}
          <div className="space-y-4">
            {Object.keys(overdueTasks).length === 0 ? (
              <div className="alert">
                <span>No overdue tasks</span>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(overdueTasks)
                  .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                  .map(([date, tasks]) => (
                    <div key={date} className="space-y-4">
                      <h2 className="text-xl font-bold text-error">
                        {format(new Date(date), 'EEEE, MMM d')}
                      </h2>
                      <div className="space-y-4">
                        {tasks.map(task => (
                          <div key={task.id} className="space-y-2">
                            <div className="text-sm text-base-content/70">
                              {task.routine_name}
                            </div>
                            <TaskInstanceCard
                              task={task}
                              onUpdateProgress={(progress) => 
                                handleUpdateTaskProgress(task.instance_id, task.task_id, progress)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Today's Tasks */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-warning">Pending Tasks</h2>
            
            {/* Pending Tasks */}
            <div className="space-y-4">
              {todaysTasks.pending.length === 0 ? (
                <div className="alert">
                  <span>No pending tasks for today</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysTasks.pending.map(task => (
                    <div key={task.id} className="space-y-2">
                      <div className="text-sm text-base-content/70">
                        {task.routine_name}
                      </div>
                      <TaskInstanceCard
                        task={task}
                        onUpdateProgress={(progress) => 
                          handleUpdateTaskProgress(task.instance_id, task.task_id, progress)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Tasks */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-success">Completed Tasks</h2>
              {todaysTasks.completed.length === 0 ? (
                <div className="alert">
                  <span>No completed tasks yet</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysTasks.completed.map(task => (
                    <div key={task.id} className="space-y-2">
                      <div className="text-sm text-base-content/70">
                        {task.routine_name}
                      </div>
                      <TaskInstanceCard
                        task={task}
                        onUpdateProgress={(progress) => 
                          handleUpdateTaskProgress(task.instance_id, task.task_id, progress)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard; 