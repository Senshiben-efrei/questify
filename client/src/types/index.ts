export interface Area {
  id: string;
  name: string;
  description: string | null;
  xp: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  area_id: string;
  created_at: string;
  updated_at: string;
}

// Enums for task types and evaluation methods
export enum TaskType {
  STANDALONE = "STANDALONE",
  PLACEHOLDER = "PLACEHOLDER",
  SUB_TASK = "SUB_TASK"
}

export enum EvaluationMethod {
  YES_NO = "YES_NO",
  NUMERIC = "NUMERIC"
}

// Queue related types
export enum QueueItemType {
  SUB_TASK = "SUB_TASK",
  COOLDOWN = "COOLDOWN"
}

export interface QueueSubTask {
  id: string;
  sub_task_id: string;
  execution_time: string;  // HH:MM format
}

export interface QueueIteration {
  id: string;
  position: number;
  items: QueueSubTask[];
}

export interface TaskQueue {
  iterations: QueueIteration[];
  rotation_type: "sequential";
}

// Base task interface
export interface Task {
  id: string;
  name: string;
  description: string | null;
  task_type: TaskType;
  evaluation_method: EvaluationMethod | null;
  target_value: number | null;
  execution_time: number | null;  // in minutes
  start_date: string | null;
  end_date: string | null;
  is_recurring: boolean;
  frequency: string | null;
  project_id: string | null;
  area_id: string | null;
  queue: {
    iterations: QueueIteration[];
    rotation_type: "sequential";
  } | null;
  created_at: string;
  updated_at: string;
}

// Task creation interfaces
export interface TaskBaseCreate {
  name: string;
  description?: string;
  is_recurring?: boolean;
  frequency?: string;
}

export interface SubTaskCreate extends TaskBaseCreate {
  evaluation_method: EvaluationMethod;
  target_value?: number;
  project_id?: string;
  area_id?: string;
}

export interface PlaceholderTaskCreate extends TaskBaseCreate {
  execution_time?: number;
  start_date?: string;
  end_date?: string;
  queue?: TaskQueue;
}

export interface StandaloneTaskCreate extends TaskBaseCreate {
  evaluation_method: EvaluationMethod;
  target_value?: number;
  execution_time?: number;
  start_date?: string;
  end_date?: string;
  project_id?: string;
  area_id?: string;
}

export interface TaskInstance {
  id: string;
  task_id: string;
  status: string;
  progress: number;
  due_date: string | null;
  completion_date: string | null;
  created_at: string;
  updated_at: string;
} 