import api from './api';
import { Project } from '../types/project';

export const projectService = {
  getProjects: () => 
    api.get<Project[]>('/projects'),

  getProject: (id: string) => 
    api.get<Project>(`/projects/${id}`),

  createProject: (data: Partial<Project>) => 
    api.post<Project>('/projects', data),

  updateProject: (id: string, data: Partial<Project>) => 
    api.put<Project>(`/projects/${id}`, data),

  deleteProject: (id: string) => 
    api.delete(`/projects/${id}`)
}; 