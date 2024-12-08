import { Area } from './area';
import { Project } from './project';

export type EvaluationMethod = 'YES_NO' | 'NUMERIC';
export type QueueItemType = 'TASK' | 'COOLDOWN';
export type TaskDifficulty = 'TRIVIAL' | 'EASY' | 'MEDIUM' | 'HARD';

export interface TaskDefinition {
  id: string;
  type: 'TASK';
  name: string;
  description?: string;
  evaluation_method: EvaluationMethod;
  target_value?: number;
  has_specific_time: boolean;
  execution_time?: string;  // HH:MM format
  duration?: number;  // minutes
  area_id?: string;
  project_id?: string;
  difficulty: TaskDifficulty;
}

export interface CooldownDefinition {
  id: string;
  type: 'COOLDOWN';
  name: string;
  description: string;
  duration: string;  // e.g., "1d", "2h"
}

export interface QueueIteration {
  id: string;
  position: number;
  items: Array<TaskDefinition | CooldownDefinition>;
}

export interface Queue {
  iterations: QueueIteration[];
  rotation_type: 'sequential';
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  is_recurring: boolean;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  queue: Queue;
  created_at: string;
  updated_at: string;
}

export interface RoutineInstance {
  id: string;
  routine_id: string;
  routine_name: string;
  iteration_position: number;
  due_date: string;
  created_at: string;
  updated_at: string;
  tasks: TaskInstance[];
  task_instances: TaskInstance[];
}

export interface TaskInstance {
  id: string;
  routine_instance_id: string;
  task_id: string;
  name: string;
  status: string;
  progress: number;
  evaluation_method: EvaluationMethod;
  target_value?: number;
  execution_time?: string;
  duration?: number;
  completion_date?: string;
  created_at: string;
  updated_at: string;
  difficulty: TaskDifficulty;
}