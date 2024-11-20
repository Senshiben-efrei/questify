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

const TaskSystem: React.FC = () => {
  const { token } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showSubTasks, setShowSubTasks] = useState(true);

  // Add modal states
  const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isAddPlaceholderTaskModalOpen, setIsAddPlaceholderTaskModalOpen] = useState(false);
  const [isAddSubTaskModalOpen, setIsAddSubTaskModalOpen] = useState(false);
  const [isAddStandaloneTaskModalOpen, setIsAddStandaloneTaskModalOpen] = useState(false);

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

  // Add handlers
  const handleAddArea = async (name: string, description: string) => {
    // ... existing handler ...
  };

  const handleAddProject = async (name: string, description: string, areaId: string) => {
    // ... existing handler ...
  };

  const handleAddTask = async (data: { taskData: any, endpoint: string }) => {
    // ... existing handler ...
  };

  return (
    <PageContainer>
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
    </PageContainer>
  );
};

export default TaskSystem; 