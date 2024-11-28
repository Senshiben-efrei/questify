import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import PageContainer from '../../components/PageContainer';
import { Area, Project, Task, TaskType } from '../../types';
import { PlusIcon, ClipboardDocumentListIcon, CheckCircleIcon, FlagIcon } from '@heroicons/react/24/outline';
import AddAreaModal from '../../components/Tasks/AddAreaModal';
import AddProjectModal from '../../components/Tasks/AddProjectModal';
import AddPlaceholderTaskModal from '../../components/Tasks/AddPlaceholderTaskModal';
import AddSubTaskModal from '../../components/Tasks/AddSubTaskModal';
import AddStandaloneTaskModal from '../../components/Tasks/AddStandaloneTaskModal';
import AreasRadarChart from '../../components/Tasks/AreasRadarChart';
import api from '../../services/api';
import GenerationNotification from '../../components/Tasks/GenerationNotification';
import ConfirmationModal from '../../components/ConfirmationModal';

const getAvailableSubTasks = (tasks: Task[]) => {
  return tasks.filter(task => task.task_type === TaskType.SUB_TASK);
};

const TaskSystem: React.FC = () => {
  const { token } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showSubTasks, setShowSubTasks] = useState(true);
  const [generationStats, setGenerationStats] = useState<any>(null);

  // Add modal states
  const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isAddPlaceholderTaskModalOpen, setIsAddPlaceholderTaskModalOpen] = useState(false);
  const [isAddSubTaskModalOpen, setIsAddSubTaskModalOpen] = useState(false);
  const [isAddStandaloneTaskModalOpen, setIsAddStandaloneTaskModalOpen] = useState(false);
  const [isClearInstancesModalOpen, setIsClearInstancesModalOpen] = useState(false);

  // Add these state variables
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditAreaModalOpen, setIsEditAreaModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isDeleteAreaModalOpen, setIsDeleteAreaModalOpen] = useState(false);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);

  // Add these to the existing state declarations
  const [instances, setInstances] = useState<any[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        
        // Fetch areas
        const areasResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/areas/`,
          { headers }
        );
        setAreas(areasResponse.data);

        // Fetch projects
        const projectsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/projects/`,
          { headers }
        );
        setProjects(projectsResponse.data);

        // Fetch tasks
        const tasksResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/tasks/`,
          { headers }
        );
        setTasks(tasksResponse.data);

        setError('');
      } catch (err: any) {
        setError(err.response?.data?.detail || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Add this function after the other handlers
  const fetchInstances = async (date: Date) => {
    try {
      setInstancesLoading(true);
      const formattedDate = date.toISOString().split('T')[0];
      const response = await api.get(`/tasks/instances/${formattedDate}`);
      setInstances(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch instances');
    } finally {
      setInstancesLoading(false);
    }
  };

  // Add this to the useEffect hook where you fetch other data
  useEffect(() => {
    fetchInstances(selectedDate);
  }, [selectedDate]);

  // Add handlers
  const handleAddArea = async (name: string, description: string) => {
    try {
      setLoading(true);
      const response = await api.post('/areas/', {
        name,
        description
      });
      
      setAreas(prev => [...prev, response.data]);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create area');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (name: string, description: string, areaId: string) => {
    try {
      setLoading(true);
      const response = await api.post('/projects/', {
        name,
        description,
        area_id: areaId
      });
      
      setProjects(prev => [...prev, response.data]);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (data: { taskData: any, endpoint: string }) => {
    try {
      setLoading(true);
      const response = await api.post(`/tasks/${data.endpoint}/`, data.taskData);
      
      setTasks(prev => [...prev, response.data]);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleEditArea = async (id: string, name: string, description: string) => {
    try {
      setLoading(true);
      const response = await api.put(`/areas/${id}`, {
        name,
        description
      });
      
      setAreas(prev => prev.map(area => 
        area.id === id ? response.data : area
      ));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update area');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = async (id: string, name: string, description: string, areaId: string) => {
    try {
      setLoading(true);
      const response = await api.put(`/projects/${id}`, {
        name,
        description,
        area_id: areaId
      });
      
      setProjects(prev => prev.map(project => 
        project.id === id ? response.data : project
      ));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArea = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/areas/${id}`);
      
      setAreas(prev => prev.filter(area => area.id !== id));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete area');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/projects/${id}`);
      
      setProjects(prev => prev.filter(project => project.id !== id));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/tasks/${id}`);
      
      setTasks(prev => prev.filter(task => task.id !== id));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInstances = async () => {
    try {
      setLoading(true);
      const response = await api.post('/tasks/generate-instances');
      if (response.data) {
        setGenerationStats(response.data);
      }
    } catch (error) {
      console.error('Failed to generate instances:', error);
      setError('Failed to generate task instances');
    } finally {
      setLoading(false);
    }
  };

  const handleClearInstances = async () => {
    try {
      setLoading(true);
      await api.delete('/tasks/instances/clear');
      setError('');
      // Show success message in the UI
      setGenerationStats({
        message: "Instances cleared successfully",
        statistics: {
          today: {
            date: new Date().toISOString(),
            instances_created: 0,
            instances_skipped: 0
          },
          week_ahead: {
            start_date: new Date().toISOString(),
            end_date: new Date().toISOString(),
            instances_created: 0,
            instances_skipped: 0
          },
          total_created: 0,
          total_skipped: 0,
          cleared: true // Add this flag to indicate clearing operation
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to clear instances');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="mb-6">
        {error && (
          <div className="alert alert-error mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {generationStats && (
          <GenerationNotification 
            stats={generationStats} 
            onClose={() => setGenerationStats(null)} 
          />
        )}

        <div className="flex gap-2">
          <button 
            className="btn btn-primary"
            onClick={handleGenerateInstances}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Tasks'}
          </button>

          <button 
            className="btn btn-error"
            onClick={() => setIsClearInstancesModalOpen(true)}
            disabled={loading}
          >
            Clear All Instances
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-10rem)]">
        {/* Left Column - Areas and Projects */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Areas Section */}
          <div 
            className="card overflow-hidden" 
            style={{ flex: '0 0 auto', minHeight: '300px' }}
          >
            <div className="card-body p-4 flex flex-col bg-base-100/30 border border-base-content/10 rounded-xl h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title text-xl">Areas</h2>
                <button 
                  className="btn btn-square btn-sm bg-success/75 border-success/75 hover:bg-success/65 hover:border-success/65"
                  onClick={() => setIsAddAreaModalOpen(true)}
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Radar Chart */}
              <div className="flex-1">
                <AreasRadarChart areas={areas} />
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div 
            className="card overflow-hidden" 
            style={{ flex: projects.length > 0 ? projects.length * 2 : '1', minHeight: '200px' }}
          >
            <div className="card-body p-4 flex flex-col bg-base-100/30 border border-base-content/10 rounded-xl h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title text-xl">Projects</h2>
                <button 
                  className="btn btn-square btn-sm bg-success/75 border-success/75 hover:bg-success/65 hover:border-success/65"
                  onClick={() => setIsAddProjectModalOpen(true)}
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-y-auto min-h-0 flex-1 scrollbar-thin scrollbar-thumb-base-content/10 scrollbar-track-transparent">
                <div className="space-y-2 pr-2">
                  {projects.map(project => {
                    const area = areas.find(a => a.id === project.area_id);
                    return (
                      <div key={project.id} className="bg-base-200/50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{project.name}</h3>
                            <p className="text-sm text-base-content/70">{project.description}</p>
                            {area && (
                              <div className="mt-1">
                                <span className="badge badge-primary badge-sm">{area.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {projects.length === 0 && (
                    <div className="text-center text-base-content/70 py-4">
                      No projects created yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tasks */}
        <div className="col-span-12 lg:col-span-8">
          <div className="card overflow-hidden h-full">
            <div className="card-body p-4 flex flex-col bg-base-100/30 border border-base-content/10 rounded-xl h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title text-xl">Tasks</h2>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-square btn-sm bg-success/75 border-success/75 hover:bg-success/65 hover:border-success/65 tooltip flex items-center justify-center" 
                    data-tip="Add Placeholder Task"
                    onClick={() => setIsAddPlaceholderTaskModalOpen(true)}
                  >
                    <ClipboardDocumentListIcon className="h-4 w-4 stroke-2" />
                  </button>
                  <button 
                    className="btn btn-square btn-sm bg-success/75 border-success/75 hover:bg-success/65 hover:border-success/65 tooltip flex items-center justify-center" 
                    data-tip="Add Sub Task"
                    onClick={() => setIsAddSubTaskModalOpen(true)}
                  >
                    <CheckCircleIcon className="h-4 w-4 stroke-2" />
                  </button>
                  <button 
                    className="btn btn-square btn-sm bg-success/75 border-success/75 hover:bg-success/65 hover:border-success/65 tooltip flex items-center justify-center" 
                    data-tip="Add Standalone Task"
                    onClick={() => setIsAddStandaloneTaskModalOpen(true)}
                  >
                    <FlagIcon className="h-4 w-4 stroke-2" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto min-h-0 flex-1 scrollbar-thin scrollbar-thumb-base-content/10 scrollbar-track-transparent">
                <div className="space-y-4 pr-2">
                  {/* Placeholder Tasks */}
                  <div className="flex items-center justify-between">
                    <div className="divider divider-start text-base-content/70 flex-1">Task Rotations</div>
                    <div className="flex items-center gap-2 pl-4">
                      <span className="text-xs text-base-content/70">+subs</span>
                      <input 
                        type="checkbox" 
                        className="toggle toggle-xs toggle-success" 
                        checked={!showSubTasks}
                        onChange={(e) => setShowSubTasks(!e.target.checked)}
                      />
                    </div>
                  </div>
                  {tasks
                    .filter(task => task.task_type === TaskType.PLACEHOLDER)
                    .map(task => {
                      const project = projects.find(p => p.id === task.project_id);
                      const area = areas.find(a => a.id === (project?.area_id || task.area_id));
                      return (
                        <div key={task.id} className="bg-base-200/50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{task.name}</h3>
                              <p className="text-sm text-base-content/70">{task.description}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {project && <span className="badge badge-success badge-sm">{project.name}</span>}
                                {area && <span className="badge badge-secondary badge-sm">{area.name}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {/* Standalone Tasks */}
                  <div className="divider divider-start text-base-content/70">Standalone Tasks</div>
                  {tasks
                    .filter(task => task.task_type === TaskType.STANDALONE)
                    .map(task => {
                      const project = projects.find(p => p.id === task.project_id);
                      const area = areas.find(a => a.id === (project?.area_id || task.area_id));
                      return (
                        <div key={task.id} className="bg-base-200/50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{task.name}</h3>
                              <p className="text-sm text-base-content/70">{task.description}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {project && <span className="badge badge-success badge-sm">{project.name}</span>}
                                {area && <span className="badge badge-secondary badge-sm">{area.name}</span>}
                                {task.is_recurring && (
                                  <span className="badge badge-warning badge-sm">{task.frequency}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {/* Sub Tasks - Show when showSubTasks is true */}
                  {showSubTasks && (
                    <>
                      <div className="divider divider-start text-base-content/70">Sub Tasks</div>
                      {tasks
                        .filter(task => task.task_type === TaskType.SUB_TASK)
                        .map(task => {
                          const project = projects.find(p => p.id === task.project_id);
                          const area = areas.find(a => a.id === (project?.area_id || task.area_id));
                          return (
                            <div key={task.id} className="bg-base-200/50 p-3 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{task.name}</h3>
                                  <p className="text-sm text-base-content/70">{task.description}</p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {project && <span className="badge badge-success badge-sm">{project.name}</span>}
                                    {area && <span className="badge badge-secondary badge-sm">{area.name}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </>
                  )}

                  {tasks.length === 0 && (
                    <div className="text-center text-base-content/70 py-4">
                      No tasks created yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddAreaModal
        isOpen={isAddAreaModalOpen}
        onClose={() => setIsAddAreaModalOpen(false)}
        onSubmit={handleAddArea}
      />

      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onSubmit={handleAddProject}
        areas={areas}
      />

      <AddPlaceholderTaskModal
        isOpen={isAddPlaceholderTaskModalOpen}
        onClose={() => setIsAddPlaceholderTaskModalOpen(false)}
        onSubmit={handleAddTask}
        areas={areas}
        projects={projects}
        availableSubTasks={getAvailableSubTasks(tasks)}
      />

      <AddSubTaskModal
        isOpen={isAddSubTaskModalOpen}
        onClose={() => setIsAddSubTaskModalOpen(false)}
        onSubmit={handleAddTask}
        areas={areas}
        projects={projects}
        placeholderTasks={tasks.filter(task => task.task_type === 'PLACEHOLDER')}
      />

      <AddStandaloneTaskModal
        isOpen={isAddStandaloneTaskModalOpen}
        onClose={() => setIsAddStandaloneTaskModalOpen(false)}
        onSubmit={handleAddTask}
        areas={areas}
        projects={projects}
      />

      <ConfirmationModal
        isOpen={isDeleteAreaModalOpen}
        onClose={() => {
          setIsDeleteAreaModalOpen(false);
          setSelectedArea(null);
        }}
        onConfirm={() => {
          if (selectedArea) {
            handleDeleteArea(selectedArea.id);
            setIsDeleteAreaModalOpen(false);
            setSelectedArea(null);
          }
        }}
        title="Delete Area"
        message={`Are you sure you want to delete "${selectedArea?.name}"? This will also delete all associated projects and tasks.`}
      />

      <ConfirmationModal
        isOpen={isDeleteProjectModalOpen}
        onClose={() => {
          setIsDeleteProjectModalOpen(false);
          setSelectedProject(null);
        }}
        onConfirm={() => {
          if (selectedProject) {
            handleDeleteProject(selectedProject.id);
            setIsDeleteProjectModalOpen(false);
            setSelectedProject(null);
          }
        }}
        title="Delete Project"
        message={`Are you sure you want to delete "${selectedProject?.name}"? This will also delete all associated tasks.`}
      />

      <ConfirmationModal
        isOpen={isDeleteTaskModalOpen}
        onClose={() => {
          setIsDeleteTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onConfirm={() => {
          if (selectedTask) {
            handleDeleteTask(selectedTask.id);
            setIsDeleteTaskModalOpen(false);
            setSelectedTask(null);
          }
        }}
        title="Delete Task"
        message={`Are you sure you want to delete "${selectedTask?.name}"?`}
      />

      <ConfirmationModal
        isOpen={isClearInstancesModalOpen}
        onClose={() => {
          setIsClearInstancesModalOpen(false);
        }}
        onConfirm={() => {
          handleClearInstances();
          setIsClearInstancesModalOpen(false);
        }}
        title="Clear All Instances"
        message="Are you sure you want to clear all task instances? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
      />

      <div className="mt-8">
        <div className="card overflow-hidden">
          <div className="card-body p-4 bg-base-100/30 border border-base-content/10 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-xl">Generated Instances</h2>
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
                <button
                  className="btn btn-sm"
                  onClick={() => fetchInstances(selectedDate)}
                  disabled={instancesLoading}
                >
                  Refresh
                </button>
              </div>
            </div>

            {instancesLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : instances.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Type</th>
                      <th>Project/Area</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Due Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instances.map((instance) => {
                      const task = tasks.find(t => t.id === instance.task_id);
                      const project = task?.project_id ? 
                        projects.find(p => p.id === task.project_id) : null;
                      const area = task?.area_id ? 
                        areas.find(a => a.id === task.area_id) : 
                        project ? areas.find(a => a.id === project.area_id) : null;

                      return (
                        <tr key={instance.id}>
                          <td>{task?.name || 'Unknown Task'}</td>
                          <td>
                            <span className="badge badge-sm">
                              {task?.task_type || 'Unknown'}
                            </span>
                          </td>
                          <td>
                            {project && (
                              <span className="badge badge-success badge-sm mr-1">
                                {project.name}
                              </span>
                            )}
                            {area && (
                              <span className="badge badge-secondary badge-sm">
                                {area.name}
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={`badge badge-sm ${
                              instance.status === 'completed' ? 'badge-success' :
                              instance.status === 'in_progress' ? 'badge-warning' :
                              'badge-ghost'
                            }`}>
                              {instance.status}
                            </span>
                          </td>
                          <td>
                            <progress 
                              className="progress progress-success w-20" 
                              value={instance.progress} 
                              max="100"
                            ></progress>
                          </td>
                          <td>
                            {new Date(instance.due_date).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => {
                                  // Handle instance completion
                                }}
                              >
                                Complete
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => {
                                  // Handle instance deletion
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/70">
                No instances found for this date
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default TaskSystem; 