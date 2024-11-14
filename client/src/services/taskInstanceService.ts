import axios from 'axios';
import { TaskInstance } from '../types';

const API_URL = process.env.REACT_APP_API_URL;

interface GenerationResponse {
    message: string;
    statistics: {
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
    };
}

export const taskInstanceService = {
    getInstancesForDate: async (date: Date): Promise<TaskInstance[]> => {
        const formattedDate = date.toISOString().split('T')[0];
        const response = await axios.get(
            `${API_URL}/tasks/instances/${formattedDate}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
        return response.data;
    },

    getInstancesForDateRange: async (startDate: Date, endDate: Date): Promise<TaskInstance[]> => {
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        const response = await axios.get(
            `${API_URL}/tasks/instances/range/${formattedStartDate}/${formattedEndDate}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
        return response.data;
    },

    generateInstances: async (): Promise<GenerationResponse> => {
        const response = await axios.post<GenerationResponse>(
            `${API_URL}/tasks/generate-instances`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
        return response.data;
    },

    clearInstances: async (): Promise<void> => {
        await axios.delete(
            `${API_URL}/tasks/instances/clear`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
    },

    deleteInstance: async (instanceId: string): Promise<void> => {
        await axios.delete(
            `${API_URL}/tasks/instances/${instanceId}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
    },
}; 