import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageContainer from '../components/PageContainer';
import RoutineList from '../components/Routines/RoutineList';
import { routineService } from '../services/routineService';
import { areaService } from '../services/areaService';
import { projectService } from '../services/projectService';
import { Routine } from '../types/routine';
import { Area } from '../types/area';
import { Project } from '../types/project';
import { useAuth } from '../contexts/AuthContext';
import AreaList from '../components/Areas/AreaList';
import ProjectList from '../components/Projects/ProjectList';

const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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
      const [routinesResponse, areasResponse, projectsResponse] = await Promise.all([
        routineService.getRoutines(),
        areaService.getAreas(),
        projectService.getProjects(),
      ]);

      setRoutines(routinesResponse.data);
      setAreas(areasResponse.data);
      setProjects(projectsResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoutine = async (data: any) => {
    try {
      const response = await routineService.createRoutine(data);
      setRoutines(prev => [...prev, response.data]);
      toast.success('Routine created successfully');
    } catch (error) {
      toast.error('Failed to create routine');
      throw error;
    }
  };

  const handleEditRoutine = async (id: string, data: any) => {
    try {
      const response = await routineService.updateRoutine(id, data);
      setRoutines(prev => prev.map(routine => 
        routine.id === id ? response.data : routine
      ));
      toast.success('Routine updated successfully');
    } catch (error) {
      toast.error('Failed to update routine');
      throw error;
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    try {
      await routineService.deleteRoutine(id);
      setRoutines(prev => prev.filter(routine => routine.id !== id));
      toast.success('Routine deleted successfully');
    } catch (error) {
      toast.error('Failed to delete routine');
      throw error;
    }
  };

  const handleAddArea = async (data: any) => {
    try {
      const response = await areaService.createArea(data);
      setAreas(prev => [...prev, response.data]);
      toast.success('Area created successfully');
    } catch (error) {
      toast.error('Failed to create area');
      throw error;
    }
  };

  const handleEditArea = async (id: string, data: any) => {
    try {
      const response = await areaService.updateArea(id, data);
      setAreas(prev => prev.map(area => 
        area.id === id ? response.data : area
      ));
      toast.success('Area updated successfully');
    } catch (error) {
      toast.error('Failed to update area');
      throw error;
    }
  };

  const handleDeleteArea = async (id: string) => {
    try {
      await areaService.deleteArea(id);
      setAreas(prev => prev.filter(area => area.id !== id));
      toast.success('Area deleted successfully');
    } catch (error) {
      toast.error('Failed to delete area');
      throw error;
    }
  };

  const handleAddProject = async (data: any) => {
    try {
      const response = await projectService.createProject(data);
      setProjects(prev => [...prev, response.data]);
      toast.success('Project created successfully');
    } catch (error) {
      toast.error('Failed to create project');
      throw error;
    }
  };

  const handleEditProject = async (id: string, data: any) => {
    try {
      const response = await projectService.updateProject(id, data);
      setProjects(prev => prev.map(project => 
        project.id === id ? response.data : project
      ));
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error('Failed to update project');
      throw error;
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await projectService.deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
      throw error;
    }
  };

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
      <div className="space-y-12">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Setup</h1>
        </div>

        {/* Areas Section */}
        <section>
          <AreaList
            areas={areas}
            onAdd={handleAddArea}
            onEdit={handleEditArea}
            onDelete={handleDeleteArea}
          />
        </section>

        {/* Projects Section */}
        <section>
          <ProjectList
            projects={projects}
            areas={areas}
            onAdd={handleAddProject}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
          />
        </section>

        {/* Routines Section */}
        <section>
          <RoutineList
            routines={routines}
            areas={areas}
            projects={projects}
            onAdd={handleAddRoutine}
            onEdit={handleEditRoutine}
            onDelete={handleDeleteRoutine}
          />
        </section>
      </div>
    </PageContainer>
  );
};

export default SetupPage; 