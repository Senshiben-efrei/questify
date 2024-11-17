import React, { useState, useEffect } from 'react';
import { TaskInstance, Task, TaskType } from '../../types';
import { taskInstanceService } from '../../services/taskInstanceService';
import { format, addDays } from 'date-fns';
import { TrashIcon } from '@heroicons/react/24/outline';

interface TaskInstancesProps {
    tasks: Task[];
}

interface GenerationStats {
    today: {
        date: string;
        instances_created: number;
        instances_skipped: number;
    };
    tomorrow: {
        date: string;
        instances_created: number;
        instances_skipped: number;
    };
    total_created: number;
    total_skipped: number;
    message?: string;
}

interface OrganizedInstances {
    standalone: TaskInstance[];
    placeholder: {
        [key: string]: {
            parent: TaskInstance;
            children: TaskInstance[];
        }
    }
}

const TaskInstances: React.FC<TaskInstancesProps> = ({ tasks }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [instances, setInstances] = useState<TaskInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [generationStats, setGenerationStats] = useState<GenerationStats | null>(null);

    const fetchInstances = async (date: Date) => {
        try {
            setLoading(true);
            const data = await taskInstanceService.getInstancesForDate(date);
            setInstances(data);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to fetch instances');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInstances = async () => {
        try {
            setLoading(true);
            const response = await taskInstanceService.generateInstances();
            setGenerationStats(response.statistics);
            await fetchInstances(selectedDate); // Refresh instances after generation
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to generate instances');
        } finally {
            setLoading(false);
        }
    };

    const handleClearInstances = async () => {
        try {
            setLoading(true);
            await taskInstanceService.clearInstances();
            setInstances([]);
            setError('');
            
            const today = new Date();
            const tomorrow = addDays(today, 1);
            
            setGenerationStats({
                today: {
                    date: format(today, 'yyyy-MM-dd'),
                    instances_created: 0,
                    instances_skipped: 0
                },
                tomorrow: {
                    date: format(tomorrow, 'yyyy-MM-dd'),
                    instances_created: 0,
                    instances_skipped: 0
                },
                total_created: 0,
                total_skipped: 0,
                message: "All instances cleared successfully"
            });
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to clear instances');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstances(selectedDate);
    }, [selectedDate]);

    const getTaskDetails = (taskId: string) => {
        return tasks.find(task => task.id === taskId);
    };

    const getPlaceholderTask = (instance: TaskInstance) => {
        if (!instance.parent_instance_id) return null;
        const parentInstance = instances.find(i => i.id === instance.parent_instance_id);
        if (!parentInstance) return null;
        return getTaskDetails(parentInstance.task_id);
    };

    const organizedInstances = instances.reduce((acc: OrganizedInstances, instance: TaskInstance) => {
        const task = getTaskDetails(instance.task_id);
        if (!task) return acc;

        if (task.task_type === TaskType.STANDALONE) {
            acc.standalone.push(instance);
        } else if (task.task_type === TaskType.SUB_TASK && instance.parent_instance_id) {
            // Find the placeholder task for this sub-task
            const parentInstance = instances.find(i => i.id === instance.parent_instance_id);
            if (parentInstance) {
                const placeholderTask = getTaskDetails(parentInstance.task_id);
                if (placeholderTask && placeholderTask.task_type === TaskType.PLACEHOLDER) {
                    if (!acc.placeholder[placeholderTask.id]) {
                        acc.placeholder[placeholderTask.id] = {
                            parent: parentInstance,
                            children: []
                        };
                    }
                    acc.placeholder[placeholderTask.id].children.push(instance);
                }
            }
        }

        return acc;
    }, { standalone: [], placeholder: {} });

    const today = new Date();
    const tomorrow = addDays(today, 1);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setSelectedDate(today)}
                        className={`btn ${
                            format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                                ? 'btn-primary'
                                : 'btn-neutral'
                        }`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setSelectedDate(tomorrow)}
                        className={`btn ${
                            format(selectedDate, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')
                                ? 'btn-primary'
                                : 'btn-neutral'
                        }`}
                    >
                        Tomorrow
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleClearInstances}
                        className="btn btn-error"
                    >
                        Clear All Instances
                    </button>
                    <button
                        onClick={handleGenerateInstances}
                        className="btn btn-primary"
                    >
                        Generate Instances
                    </button>
                </div>
            </div>

            {/* Generation Stats */}
            {generationStats && (
                <div className="alert alert-success mb-4">
                    <h3 className="font-medium mb-2">Generation Results:</h3>
                    {generationStats.message ? (
                        <p className="font-medium">{generationStats.message}</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium">Today ({generationStats.today.date})</h4>
                                    <p>
                                        Created: {generationStats.today.instances_created} |{' '}
                                        Skipped: {generationStats.today.instances_skipped}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium">Tomorrow ({generationStats.tomorrow.date})</h4>
                                    <p>
                                        Created: {generationStats.tomorrow.instances_created} |{' '}
                                        Skipped: {generationStats.tomorrow.instances_skipped}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-base-300">
                                <p className="font-medium">
                                    Total: {generationStats.total_created} created, {generationStats.total_skipped} skipped
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}

            <h2 className="text-xl font-semibold text-base-content">
                Tasks for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>

            {loading ? (
                <div className="text-center py-4 text-base-content/70">Loading instances...</div>
            ) : error ? (
                <div className="alert alert-error">
                    {error}
                </div>
            ) : instances.length === 0 ? (
                <div className="text-center py-4 text-base-content/70">
                    No tasks scheduled for this date
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Standalone Tasks */}
                    {organizedInstances.standalone.map(instance => {
                        const task = getTaskDetails(instance.task_id);
                        return (
                            <div
                                key={instance.id}
                                className="p-4 bg-base-100 rounded-lg shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-base-content">{task?.name}</h3>
                                        <p className="text-sm text-base-content/70">
                                            {task?.description}
                                        </p>
                                        <div className="mt-2">
                                            <span className={`badge ${
                                                instance.status === 'completed' 
                                                    ? 'badge-success'
                                                    : instance.status === 'in_progress'
                                                    ? 'badge-warning'
                                                    : 'badge-neutral'
                                            }`}>
                                                {instance.status}
                                            </span>
                                            {instance.progress > 0 && (
                                                <span className="ml-2 text-sm text-base-content/70">
                                                    Progress: {instance.progress}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await taskInstanceService.deleteInstance(instance.id);
                                                setInstances(prev => prev.filter(i => i.id !== instance.id));
                                            } catch (err: any) {
                                                setError(err.response?.data?.detail || 'Failed to delete instance');
                                            }
                                        }}
                                        className="btn btn-ghost btn-sm text-error"
                                        title="Delete instance"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Placeholder Tasks with their Sub-tasks */}
                    {Object.values(organizedInstances.placeholder).map(({ parent, children }) => {
                        const placeholderTask = getTaskDetails(parent.task_id);
                        if (!placeholderTask) return null;

                        return (
                            <div key={parent.id} className="bg-base-100 rounded-lg shadow">
                                <div className="p-4 border-b border-base-300">
                                    <h3 className="font-medium text-base-content">{placeholderTask.name}</h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    {children.map(instance => {
                                        const task = getTaskDetails(instance.task_id);
                                        return (
                                            <div
                                                key={instance.id}
                                                className="flex justify-between items-start pl-4 border-l-2 border-primary"
                                            >
                                                <div>
                                                    <h4 className="font-medium text-base-content">{task?.name}</h4>
                                                    <div className="mt-1">
                                                        <span className={`badge ${
                                                            instance.status === 'completed' 
                                                                ? 'badge-success'
                                                                : instance.status === 'in_progress'
                                                                ? 'badge-warning'
                                                                : 'badge-neutral'
                                                        }`}>
                                                            {instance.status}
                                                        </span>
                                                        {instance.progress > 0 && (
                                                            <span className="ml-2 text-sm text-base-content/70">
                                                                Progress: {instance.progress}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await taskInstanceService.deleteInstance(instance.id);
                                                            setInstances(prev => prev.filter(i => i.id !== instance.id));
                                                        } catch (err: any) {
                                                            setError(err.response?.data?.detail || 'Failed to delete instance');
                                                        }
                                                    }}
                                                    className="btn btn-ghost btn-sm text-error"
                                                    title="Delete instance"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TaskInstances; 