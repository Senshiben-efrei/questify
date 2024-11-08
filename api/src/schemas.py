from datetime import datetime
from typing import Optional, List, Dict, Union
from uuid import UUID
from pydantic import BaseModel, EmailStr, UUID4, validator
from enum import Enum

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Area schemas
class AreaBase(BaseModel):
    name: str
    description: Optional[str] = None

class AreaCreate(AreaBase):
    pass

class Area(AreaBase):
    id: UUID
    xp: int
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    area_id: UUID

class Project(ProjectBase):
    id: UUID
    area_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# New Enums for Task Types and Evaluation Methods
class TaskType(str, Enum):
    STANDALONE = "STANDALONE"
    PLACEHOLDER = "PLACEHOLDER"
    SUB_TASK = "SUB_TASK"

class EvaluationMethod(str, Enum):
    YES_NO = "YES_NO"
    NUMERIC = "NUMERIC"

# Base Task Schema with common fields
class TaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_recurring: bool = False
    frequency: Optional[str] = None

# Sub-Task Schema
class SubTaskCreate(TaskBase):
    evaluation_method: EvaluationMethod
    target_value: Optional[float] = None
    project_id: Optional[UUID4] = None
    area_id: Optional[UUID4] = None

    @validator('target_value')
    def validate_target_value(cls, v, values):
        if values.get('evaluation_method') == EvaluationMethod.NUMERIC and v is None:
            raise ValueError('Target value is required for numeric evaluation')
        return v

# Placeholder Task Schema
class QueueItem(BaseModel):
    id: str
    type: str  # "SUB_TASK" or "COOLDOWN"
    position: int
    sub_task_id: Optional[str] = None  # For sub-task references

class QueueSubTask(BaseModel):
    id: str
    sub_task_id: str
    execution_time: str  # HH:MM format

class QueueIteration(BaseModel):
    id: str
    position: int
    items: List[QueueSubTask]

class TaskQueue(BaseModel):
    iterations: List[QueueIteration]
    rotation_type: str = "sequential"

class PlaceholderTaskCreate(TaskBase):
    execution_time: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    queue: TaskQueue

    @validator('end_date')
    def validate_dates(cls, v, values):
        if v and values.get('start_date'):
            if v < values['start_date']:
                raise ValueError('End date must be after start date')
        return v

# Standalone Task Schema
class StandaloneTaskCreate(TaskBase):
    evaluation_method: EvaluationMethod
    target_value: Optional[float] = None
    execution_time: Optional[int] = None  # in minutes
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    project_id: Optional[UUID4] = None
    area_id: Optional[UUID4] = None

    @validator('target_value')
    def validate_target_value(cls, v, values):
        if values.get('evaluation_method') == EvaluationMethod.NUMERIC and v is None:
            raise ValueError('Target value is required for numeric evaluation')
        return v

    @validator('end_date')
    def validate_dates(cls, v, values):
        if v and values.get('start_date'):
            if v < values['start_date']:
                raise ValueError('End date must be after start date')
        return v

# Response Models
class SubTask(SubTaskCreate):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PlaceholderTask(PlaceholderTaskCreate):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StandaloneTask(StandaloneTaskCreate):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Generic Task Response that can represent any task type
class Task(BaseModel):
    id: UUID4
    name: str
    description: Optional[str] = None
    task_type: TaskType
    is_recurring: bool = False
    frequency: Optional[str] = None
    evaluation_method: Optional[EvaluationMethod] = None
    target_value: Optional[float] = None
    execution_time: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    project_id: Optional[UUID4] = None
    area_id: Optional[UUID4] = None
    queue: Optional[Dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Task Instance schemas
class TaskInstanceBase(BaseModel):
    status: str = "pending"
    progress: Optional[int] = 0
    due_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None

class TaskInstanceCreate(TaskInstanceBase):
    task_id: UUID4

class TaskInstance(TaskInstanceBase):
    id: UUID4
    task_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 