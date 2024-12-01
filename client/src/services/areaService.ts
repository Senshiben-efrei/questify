import api from './api';
import { Area } from '../types/area';

export const areaService = {
  getAreas: () => 
    api.get<Area[]>('/areas'),

  getArea: (id: string) => 
    api.get<Area>(`/areas/${id}`),

  createArea: (data: Partial<Area>) => 
    api.post<Area>('/areas', data),

  updateArea: (id: string, data: Partial<Area>) => 
    api.put<Area>(`/areas/${id}`, data),

  deleteArea: (id: string) => 
    api.delete(`/areas/${id}`)
}; 