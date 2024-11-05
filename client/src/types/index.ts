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

export interface Task {
  id: string;
  name: string;
  description: string | null;
  project_id: string | null;
  area_id: string | null;
  is_recurring: boolean;
  frequency: string | null;
  created_at: string;
  updated_at: string;
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