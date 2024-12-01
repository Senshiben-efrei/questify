import api from './api';
import { Routine, RoutineInstance } from '../types/routine';

interface ApiResponse<T> {
  data: T;
}

export const routineService = {
  // Routine CRUD
  createRoutine: (data: Partial<Routine>) => 
    api.post<Routine>('/routines', data),

  getRoutines: () => 
    api.get<Routine[]>('/routines'),

  getRoutine: (id: string) => 
    api.get<Routine>(`/routines/${id}`),

  updateRoutine: (id: string, data: Partial<Routine>) => 
    api.put<Routine>(`/routines/${id}`, data),

  deleteRoutine: (id: string) => 
    api.delete(`/routines/${id}`),

  // Instance management
  generateInstances: () => 
    api.post('/routines/generate-instances'),

  getInstancesForDate: (date: string) => 
    api.get<RoutineInstance[]>(`/routines/instances/${date}`),

  getInstancesForDateRange: (startDate: string, endDate: string) => 
    api.get<RoutineInstance[]>(`/routines/instances/range/${startDate}/${endDate}`),

  updateTaskInstance: (instanceId: string, taskId: string, progress: number) => 
    api.put(`/routines/instances/${instanceId}/tasks/${taskId}`, { progress }),

  deleteInstances: () => 
    api.delete('/routines/instances/future'),
};