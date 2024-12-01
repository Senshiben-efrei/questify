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
import { TrashIcon } from '@heroicons/react/24/outline';

const RoutinesPage: React.FC = () => {
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

  const handleGenerateInstances = async () => {
    try {
      const result = await routineService.generateInstances();
      await loadData(); // Reload data after generating instances
      toast.success(
        `Generated instances:\n` +
        `Today: ${result.data.statistics.today.instances_created} created, ${result.data.statistics.today.instances_skipped} skipped\n` +
        `Week: ${result.data.statistics.week.instances_created} created, ${result.data.statistics.week.instances_skipped} skipped`
      );
    } catch (error) {
      toast.error('Failed to generate instances');
      throw error;
    }
  };

  const handleUpdateTask = async (instanceId: string, taskId: string, progress: number) => {
    try {
      await routineService.updateTaskInstance(instanceId, taskId, progress);
      await loadData(); // Reload data to get updated instances
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteInstances = async () => {
    try {
      const result = await routineService.deleteInstances();
      await loadData(); // Reload data after deletion
      toast.success(
        `Deleted ${result.data.deleted.future_instances} future instances and ${result.data.deleted.pending_tasks} pending tasks`
      );
    } catch (error) {
      console.error('Failed to delete instances:', error);
      toast.error('Failed to delete instances');
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
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Routines</h1>
          <div className="flex gap-2">
            <button
              className="btn btn-error btn-outline gap-2"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all future instances and pending tasks for today?')) {
                  handleDeleteInstances();
                }
              }}
            >
              <TrashIcon className="h-5 w-5" />
              Clear Instances
            </button>
          </div>
        </div>

        <RoutineList
          routines={routines}
          areas={areas}
          projects={projects}
          onAdd={handleAddRoutine}
          onEdit={handleEditRoutine}
          onDelete={handleDeleteRoutine}
          onGenerateInstances={handleGenerateInstances}
        />
      </div>
    </PageContainer>
  );
};

export default RoutinesPage; 