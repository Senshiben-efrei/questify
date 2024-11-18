import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import PageContainer from '../../components/PageContainer';
import { Area, Project, Task, TaskType, EvaluationMethod } from '../../types';
import AddAreaModal from '../../components/Areas/AddAreaModal';
import EditAreaModal from '../../components/Areas/EditAreaModal';
import AddProjectModal from '../../components/Projects/AddProjectModal';
import EditProjectModal from '../../components/Projects/EditProjectModal';
import AddTaskModal from '../../components/Tasks/AddTaskModal';
import EditTaskModal from '../../components/Tasks/EditTaskModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const TaskSystem: React.FC = () => {
  const { token } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Modal states
  const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);
  const [areaToEdit, setAreaToEdit] = useState<Area | null>(null);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

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

  // CRUD operations for Areas
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
      setAreas(prev => [...prev, response.data]);
    } catch (err: any) {
      throw err;
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
      setAreas(prev => prev.map(area => area.id === id ? response.data : area));
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
      setAreas(prev => prev.filter(area => area.id !== areaToDelete.id));
      setProjects(prev => prev.filter(project => project.area_id !== areaToDelete.id));
      setAreaToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete area');
    }
  };

  // CRUD operations for Projects
  const handleAddProject = async (name: string, description: string, areaId: string) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/projects/`,
        { name, description, area_id: areaId },
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
        { name, description, area_id: areaId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setProjects(prev => prev.map(project => project.id === id ? response.data : project));
    } catch (err: any) {
      throw err;
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

  // CRUD operations for Tasks
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
      setTasks(prev => [...prev, response.data]);
    } catch (err: any) {
      throw err;
    }
  };

  const handleEditTask = async (id: string, data: any) => {
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
      setTasks(prev => prev.map(task => task.id === id ? response.data : task));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-base-content/70">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold text-base-content mb-8">Task System</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Management Panel */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Management</h2>
            <div className="space-y-2">
              <button 
                onClick={() => setIsAddAreaModalOpen(true)} 
                className="btn btn-primary w-full"
              >
                Add Area
              </button>
              <button 
                onClick={() => setIsAddProjectModalOpen(true)} 
                className="btn btn-primary w-full"
              >
                Add Project
              </button>
              <button 
                onClick={() => setIsAddTaskModalOpen(true)} 
                className="btn btn-primary w-full"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Areas List */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Areas</h2>
            <div className="space-y-2">
              {areas.map(area => (
                <div key={area.id} className="flex justify-between items-center p-2 bg-base-200 rounded-lg">
                  <div>
                    <h3 className="font-medium">{area.name}</h3>
                    <p className="text-sm text-base-content/70">{area.description}</p>
                    <div className="text-sm text-primary">XP: {area.xp}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setAreaToEdit(area)}
                      className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setAreaToDelete(area)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Projects</h2>
            <div className="space-y-2">
              {projects.map(project => {
                const area = areas.find(a => a.id === project.area_id);
                return (
                  <div key={project.id} className="flex justify-between items-center p-2 bg-base-200 rounded-lg">
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-base-content/70">{project.description}</p>
                      {area && (
                        <div className="mt-1">
                          <span className="badge badge-secondary">{area.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setProjectToEdit(project)}
                        className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setProjectToDelete(project)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="mt-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Tasks</h2>
            <div className="space-y-2">
              {tasks.map(task => {
                const project = projects.find(p => p.id === task.project_id);
                const area = areas.find(a => a.id === (project?.area_id || task.area_id));
                return (
                  <div key={task.id} className="flex justify-between items-center p-2 bg-base-200 rounded-lg">
                    <div>
                      <h3 className="font-medium">{task.name}</h3>
                      <p className="text-sm text-base-content/70">{task.description}</p>
                      <div className="mt-1 space-x-1">
                        <span className="badge badge-info">{task.task_type}</span>
                        {project && <span className="badge badge-success">{project.name}</span>}
                        {area && <span className="badge badge-secondary">{area.name}</span>}
                        {task.is_recurring && (
                          <span className="badge badge-warning">{task.frequency}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setTaskToEdit(task)}
                        className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setTaskToDelete(task)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
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

      <EditAreaModal
        isOpen={!!areaToEdit}
        onClose={() => setAreaToEdit(null)}
        onSubmit={handleEditArea}
        area={areaToEdit}
      />

      <ConfirmationModal
        isOpen={!!areaToDelete}
        onClose={() => setAreaToDelete(null)}
        onConfirm={handleDeleteArea}
        title="Delete Area"
        message={`Are you sure you want to delete "${areaToDelete?.name}"? This will also delete all associated projects and tasks.`}
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
        message={`Are you sure you want to delete "${projectToDelete?.name}"? This will also delete all associated tasks.`}
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
        message={`Are you sure you want to delete "${taskToDelete?.name}"?`}
      />
    </PageContainer>
  );
};

export default TaskSystem; 