import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Text, CheckConstraint, Float, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Area(Base):
    __tablename__ = "areas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    xp = Column(Integer, default=0)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    tasks = relationship("Task", back_populates="area")

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    area_id = Column(UUID(as_uuid=True), ForeignKey('areas.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    tasks = relationship("Task", back_populates="project")

# Update the Enum classes to use uppercase values
class TaskType(str, enum.Enum):
    STANDALONE = "STANDALONE"
    PLACEHOLDER = "PLACEHOLDER"
    SUB_TASK = "SUB_TASK"

class EvaluationMethod(str, enum.Enum):
    YES_NO = "YES_NO"
    NUMERIC = "NUMERIC"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Task type and evaluation
    task_type = Column(Enum(TaskType), nullable=False)
    evaluation_method = Column(Enum(EvaluationMethod), nullable=True)
    target_value = Column(Float, nullable=True)
    
    # Timing and scheduling
    execution_time = Column(Integer, nullable=True)  # in minutes
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Recurrence
    is_recurring = Column(Boolean, default=False)
    frequency = Column(String(50), nullable=True)
    
    # Relations
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=True)
    area_id = Column(UUID(as_uuid=True), ForeignKey('areas.id', ondelete='CASCADE'), nullable=True)
    
    # Queue for placeholder tasks
    queue = Column(JSONB, nullable=True, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="tasks")
    area = relationship("Area", back_populates="tasks")
    instances = relationship("TaskInstance", back_populates="task", cascade="all, delete-orphan")

    # Add constraints
    __table_args__ = (
        # Ensure either project_id or area_id is set, but not both
        CheckConstraint('NOT (project_id IS NOT NULL AND area_id IS NOT NULL)', 
                       name='check_project_or_area'),
        
        # Ensure placeholder tasks have a queue
        CheckConstraint(
            "(task_type != 'PLACEHOLDER') OR (task_type = 'PLACEHOLDER' AND queue IS NOT NULL AND "
            "jsonb_typeof(queue->'iterations') = 'array' AND "
            "jsonb_array_length(queue->'iterations') > 0 AND "
            "ALL ("
                "SELECT jsonb_typeof(item->'type') = 'string' AND "
                "("
                    "(item->>'type' = 'SUB_TASK' AND "
                    "jsonb_typeof(item->'sub_task_id') = 'string' AND "
                    "jsonb_typeof(item->'execution_time') = 'string') OR "
                    "(item->>'type' = 'COOLDOWN' AND "
                    "jsonb_typeof(item->'duration') = 'string' AND "
                    "jsonb_typeof(item->'description') = 'string')"
                ")"
                "FROM jsonb_array_elements((queue->'iterations'->>'items')::jsonb) item"
            ")"
            ")",
            name='check_placeholder_queue'
        ),
        
        # Ensure sub-tasks don't have timing fields
        CheckConstraint(
            "(task_type != 'SUB_TASK') OR (task_type = 'SUB_TASK' AND execution_time IS NULL AND start_date IS NULL AND end_date IS NULL)",
            name='check_sub_task_timing'
        ),
        
        # Ensure numeric evaluation has target value
        CheckConstraint(
            "(evaluation_method != 'NUMERIC') OR (evaluation_method = 'NUMERIC' AND target_value IS NOT NULL)",
            name='check_numeric_target'
        ),
    )

class TaskInstance(Base):
    __tablename__ = "task_instances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False)
    status = Column(String(20), default='pending')
    progress = Column(Integer, default=0)
    due_date = Column(DateTime(timezone=True))
    completion_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    task = relationship("Task", back_populates="instances")