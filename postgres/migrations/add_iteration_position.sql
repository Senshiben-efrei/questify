ALTER TABLE task_instances 
ADD COLUMN iteration_position INTEGER DEFAULT 0,
ADD COLUMN parent_instance_id UUID REFERENCES task_instances(id) ON DELETE CASCADE; 