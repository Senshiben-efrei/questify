import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Area, Project, Task, TaskType, EvaluationMethod, QueueSubTask, QueueIteration } from '../types';
import AddAreaModal from '../components/Areas/AddAreaModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import EditAreaModal from '../components/Areas/EditAreaModal';
import AddProjectModal from '../components/Projects/AddProjectModal';
import EditProjectModal from '../components/Projects/EditProjectModal';
import AddTaskModal from '../components/Tasks/AddTaskModal';
import EditTaskModal from '../components/Tasks/EditTaskModal';
import TaskInstances from '../components/Tasks/TaskInstances';

// Update the getTaskTags function
const getTaskTags = (task: Task, areas: Area[], projects: Project[]) => {
  const tags = [];
  
  // Task Type Tag
  tags.push({
    label: `type: ${task.task_type}`,
    color: 'bg-blue-100 text-blue-800',
    type: 'type'
  });

  // Project/Area Tags
  if (task.project_id) {
    const project = projects.find(p => p.id === task.project_id);
    if (project) {
      const area = areas.find(a => a.id === project.area_id);
      tags.push({
        label: `project: ${project.name}`,
        color: 'bg-green-100 text-green-800',
        type: 'project'
      });
      if (area) {
        tags.push({
          label: `area: ${area.name}`,
          color: 'bg-purple-100 text-purple-800',
          type: 'area'
        });
      }
    }
  } else if (task.area_id) {
    const area = areas.find(a => a.id === task.area_id);
    if (area) {
      tags.push({
        label: `area: ${area.name}`,
        color: 'bg-purple-100 text-purple-800',
        type: 'area'
      });
    }
  }

  // Evaluation Method Tag
  if (task.evaluation_method) {
    tags.push({
      label: `evaluation: ${task.evaluation_method}${task.target_value ? ` (target: ${task.target_value})` : ''}`,
      color: 'bg-yellow-100 text-yellow-800',
      type: 'evaluation'
    });
  }

  // Recurrence Tag
  if (task.is_recurring) {
    tags.push({
      label: `recurring: ${task.frequency}`,
      color: 'bg-pink-100 text-pink-800',
      type: 'recurring'
    });
  }

  return tags;
};

const Dashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
  const [areaToEdit, setAreaToEdit] = useState<Area | null>(null);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user) {
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

        // Fetch all projects (no area filter)
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
        console.error('Error fetching data:', err);
        setError(err.response?.data?.detail || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user]);

  const handleAddArea = async (name: string, description: string) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/areas/`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Add the new area to the state
      setAreas(prev => [...prev, response.data]);
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteArea = async () => {
    if (!areaToDelete) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/areas/${areaToDelete.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Remove area from state
      setAreas(prev => prev.filter(area => area.id !== areaToDelete.id));
      
      // Remove projects associated with this area
      setProjects(prev => prev.filter(project => project.area_id !== areaToDelete.id));
      
      // Close the confirmation modal
      setAreaToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete area');
    }
  };

  const handleEditArea = async (id: string, name: string, description: string) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/areas/${id}/`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Update area in state
      setAreas(prev => prev.map(area => 
        area.id === id ? response.data : area
      ));
    } catch (err: any) {
      throw err;
    }
  };

  const handleAddProject = async (name: string, description: string, areaId: string) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/projects/`,
        { 
          name, 
          description,
          area_id: areaId 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setProjects(prev => [...prev, response.data]);
    } catch (err: any) {
      throw err;
    }
  };

  const handleEditProject = async (id: string, name: string, description: string, areaId: string) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/projects/${id}/`,
        { 
          name, 
          description,
          area_id: areaId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setProjects(prev => prev.map(project => 
        project.id === id ? response.data : project
      ));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail 
        ? typeof err.response.data.detail === 'string' 
          ? err.response.data.detail 
          : Array.isArray(err.response.data.detail)
            ? err.response.data.detail[0]?.msg || 'An error occurred'
            : 'An error occurred'
        : 'Failed to update project';
      
      throw new Error(errorMessage);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/projects/${projectToDelete.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setProjects(prev => prev.filter(project => project.id !== projectToDelete.id));
      setProjectToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete project');
    }
  };

  const handleAddTask = async (data: { taskData: any, endpoint: string }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/tasks/${data.endpoint}/`,
        data.taskData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Add the new task to the state
      setTasks(prev => [...prev, response.data]);
    } catch (err: any) {
      throw err;
    }
  };

  const handleEditTask = async (id: string, data: {
    name: string;
    description: string;
    is_recurring: boolean;
    frequency: string | null;
    project_id?: string | null;
    area_id?: string | null;
  }) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/tasks/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setTasks(prev => prev.map(task => 
        task.id === id ? response.data : task
      ));
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/tasks/${taskToDelete.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setTasks(prev => prev.filter(task => task.id !== taskToDelete.id));
      setTaskToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete task');
    }
  };

  // Add placeholderTasks filter before the return statement
  const placeholderTasks = tasks.filter(task => task.task_type === TaskType.PLACEHOLDER);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Areas Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Areas</h2>
          <button 
            onClick={() => setIsAddAreaModalOpen(true)}
            className="btn btn-primary"
          >
            Add Area
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map(area => (
            <div
              key={area.id}
              className="p-4 rounded-lg border border-gray-200 bg-white hover:border-primary-500 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{area.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{area.description}</p>
                  <div className="mt-2 text-sm text-primary-600">XP: {area.xp}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setAreaToEdit(area)}
                    className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setAreaToDelete(area)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Section - Now always visible */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Projects</h2>
          <button 
            onClick={() => setIsAddProjectModalOpen(true)}
            className="btn btn-primary"
          >
            Add Project
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const area = areas.find(a => a.id === project.area_id);
            return (
              <div
                key={project.id}
                className="p-4 rounded-lg border border-gray-200 bg-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                    {area && (
                      <div className="mt-2">
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                          {area.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setProjectToEdit(project)}
                      className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setProjectToDelete(project)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tasks Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Tasks</h2>
          <button 
            onClick={() => setIsAddTaskModalOpen(true)}
            className="btn btn-primary"
          >
            Add Task
          </button>
        </div>
        <div className="bg-white rounded-lg border border-gray-200">
          {tasks.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">
              No tasks yet. Create one to get started!
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className="p-4 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{task.name}</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setTaskToEdit(task)}
                          className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(task)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                    
                    {/* Timing Information */}
                    {(task.execution_time || task.start_date || task.end_date) && (
                      <div className="mt-2 text-sm text-gray-600">
                        {task.execution_time && (
                          <span className="mr-4">Duration: {task.execution_time} minutes</span>
                        )}
                        {task.start_date && (
                          <span className="mr-4">
                            Start: {new Date(task.start_date).toLocaleString()}
                          </span>
                        )}
                        {task.end_date && (
                          <span>
                            End: {new Date(task.end_date).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Queue Information for Placeholder Tasks */}
                    {task.task_type === TaskType.PLACEHOLDER && task.queue && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span>
                          Sub-tasks: {
                            'iterations' in task.queue 
                              ? task.queue.iterations.reduce((total, iteration) => total + iteration.items.length, 0)
                              : 0
                          }
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getTaskTags(task, areas, projects).map((tag, index) => (
                        <span
                          key={`${task.id}-${tag.type}-${index}`}
                          className={`px-2 py-1 text-xs font-medium rounded ${tag.color}`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8">
        <TaskInstances tasks={tasks} />
      </div>

      <ConfirmationModal
        isOpen={!!areaToDelete}
        onClose={() => setAreaToDelete(null)}
        onConfirm={handleDeleteArea}
        title="Delete Area"
        message={`Are you sure you want to delete "${areaToDelete?.name}"? This action cannot be undone and will delete all projects and tasks associated with this area.`}
      />

      <EditAreaModal
        isOpen={!!areaToEdit}
        onClose={() => setAreaToEdit(null)}
        onSubmit={handleEditArea}
        area={areaToEdit}
      />

      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onSubmit={handleAddProject}
        areas={areas}
      />

      <EditProjectModal
        isOpen={!!projectToEdit}
        onClose={() => setProjectToEdit(null)}
        onSubmit={handleEditProject}
        project={projectToEdit}
        areas={areas}
      />

      <ConfirmationModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone and will delete all tasks associated with this project.`}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSubmit={handleAddTask}
        areas={areas}
        projects={projects}
        tasks={tasks}
      />

      <EditTaskModal
        isOpen={!!taskToEdit}
        onClose={() => setTaskToEdit(null)}
        onSubmit={handleEditTask}
        task={taskToEdit}
        areas={areas}
        projects={projects}
        tasks={tasks}
      />

      <ConfirmationModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Dashboard; 