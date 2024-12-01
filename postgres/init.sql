-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Areas table
CREATE TABLE areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    xp INTEGER DEFAULT 0,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create enum for evaluation method
CREATE TYPE evaluation_method AS ENUM ('YES_NO', 'NUMERIC');

-- Routines table (formerly tasks)
CREATE TABLE routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Scheduling
    is_recurring BOOLEAN DEFAULT false,
    frequency VARCHAR(50),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Queue for tasks
    queue JSONB NOT NULL DEFAULT '{"iterations": [], "rotation_type": "sequential"}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Queue validation
    CONSTRAINT check_queue_structure CHECK (
        (queue IS NOT NULL) AND
        (jsonb_typeof(queue->'iterations') = 'array') AND
        (jsonb_typeof(queue->'rotation_type') = 'string')
    ),
    
    -- Queue items validation
    CONSTRAINT check_queue_items CHECK (
        jsonb_array_length(queue->'iterations') = 0 
        OR NOT EXISTS (
            SELECT 1
            FROM jsonb_array_elements(queue->'iterations') iterations,
                 jsonb_array_elements(iterations->'items') item
            WHERE NOT (
                jsonb_typeof(item->>'id') = 'string' 
                AND jsonb_typeof(item->>'name') = 'string'
                AND (
                    (
                        item->>'type' = 'TASK' 
                        AND jsonb_typeof(item->'evaluation_method') = 'string'
                        AND (
                            (item->>'evaluation_method' = 'YES_NO')
                            OR (
                                item->>'evaluation_method' = 'NUMERIC'
                                AND jsonb_typeof(item->'target_value') = 'number'
                            )
                        )
                        AND (
                            NOT (item->>'has_specific_time')::boolean
                            OR (
                                jsonb_typeof(item->'execution_time') = 'string'
                                AND jsonb_typeof(item->'duration') = 'number'
                            )
                        )
                    )
                    OR (
                        item->>'type' = 'COOLDOWN'
                        AND jsonb_typeof(item->'duration') = 'string'
                        AND jsonb_typeof(item->'description') = 'string'
                    )
                )
            )
        )
    )
);

-- Routine instances table
CREATE TABLE routine_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    iteration_position INTEGER DEFAULT 0,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Task instances table (for tasks within routine instances)
CREATE TABLE task_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_instance_id UUID NOT NULL REFERENCES routine_instances(id) ON DELETE CASCADE,
    task_id VARCHAR(100) NOT NULL, -- References the task ID in the routine's queue
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    evaluation_method evaluation_method NOT NULL,
    target_value FLOAT,
    execution_time VARCHAR(5), -- HH:MM format
    duration INTEGER, -- in minutes
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_areas_updated_at
    BEFORE UPDATE ON areas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at
    BEFORE UPDATE ON routines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routine_instances_updated_at
    BEFORE UPDATE ON routine_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_instances_updated_at
    BEFORE UPDATE ON task_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 